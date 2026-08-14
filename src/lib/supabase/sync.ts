import { supabase } from './client';
import { storage, STORAGE_KEYS, safeSetItem } from '../storage';

/**
 * Ponte entre o localStorage (que o app inteiro já usa de forma síncrona) e o
 * Supabase.
 *
 * Por que não trocar o localStorage pelo Supabase direto: todas as telas leem
 * dados de forma síncrona no meio da renderização (`storage.getMembers()`).
 * Trocar isso por chamadas de rede assíncronas exigiria reescrever todos os
 * componentes. Em vez disso, o localStorage vira um cache local do banco:
 *
 *  - ao entrar, puxamos tudo do Supabase para o localStorage (`pullAll`);
 *  - toda escrita continua indo para o localStorage na hora (a tela responde
 *    instantaneamente) e entra numa fila que é empurrada para o banco;
 *  - o Realtime avisa quando outra pessoa salvou algo, e aí puxamos de novo e
 *    disparamos o mesmo evento `storage` que a sincronização entre abas já
 *    escuta — as telas se atualizam sozinhas.
 *
 * LIMITAÇÃO CONHECIDA, documentada de propósito: a resolução de conflito é
 * "último a escrever vence" no documento inteiro. Se duas pessoas editarem o
 * MESMO membro ao mesmo tempo, a edição de uma sobrescreve a da outra (não se
 * perde o registro, perde-se a alteração). Pessoas editando registros
 * diferentes não conflitam. Resolver isso de verdade exigiria salvar campo a
 * campo, o que não se justifica no tamanho de equipe desta ferramenta.
 */

type TableName = 'members' | 'roles' | 'competencies' | 'evaluations';

const TABLES: TableName[] = ['members', 'roles', 'competencies', 'evaluations'];

const TABLE_TO_KEY: Record<TableName, string> = {
  members: STORAGE_KEYS.MEMBERS,
  roles: STORAGE_KEYS.ROLES,
  competencies: STORAGE_KEYS.COMPETENCIES,
  evaluations: STORAGE_KEYS.EVALUATIONS,
};

// Fila de escritas que ainda não chegaram ao banco. Fica no localStorage para
// sobreviver a recarregar a página / fechar o navegador: sem isso, uma queda de
// conexão descartaria em silêncio tudo o que foi digitado desde então.
const PENDING_KEY = 'obra-viva-pending-sync';

type PendingOp =
  | { kind: 'upsert'; table: TableName; id: string; row: unknown }
  | { kind: 'delete'; table: TableName; id: string };

function readPending(): PendingOp[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePending(ops: PendingOp[]): void {
  safeSetItem(PENDING_KEY, JSON.stringify(ops));
}

function enqueue(op: PendingOp): void {
  // Uma operação nova sobre o mesmo registro torna a anterior irrelevante —
  // sem isso a fila cresceria sem limite ao editar o mesmo item várias vezes.
  const ops = readPending().filter(p => !(p.table === op.table && p.id === op.id));
  ops.push(op);
  writePending(ops);
  notifyPendingChanged();
}

function dequeue(op: PendingOp): void {
  const ops = readPending().filter(p => !(p.table === op.table && p.id === op.id));
  writePending(ops);
  notifyPendingChanged();
}

export function pendingCount(): number {
  return readPending().length;
}

// Permite à interface mostrar "há alterações não sincronizadas".
const PENDING_EVENT = 'obra-viva-pending-changed';
function notifyPendingChanged(): void {
  window.dispatchEvent(new Event(PENDING_EVENT));
}
export function onPendingChanged(listener: () => void): () => void {
  window.addEventListener(PENDING_EVENT, listener);
  return () => window.removeEventListener(PENDING_EVENT, listener);
}

// O evento `storage` nativo só dispara em OUTRAS abas. Quando é a sincronização
// com o banco que muda os dados, disparamos manualmente para que as telas desta
// aba também se atualizem — é o mesmo caminho já usado pelo useStorageSync.
function notifyLocalChange(key: string) {
  window.dispatchEvent(new StorageEvent('storage', { key }));
}

/**
 * Aplica sobre o retrato vindo do banco as escritas que ainda não subiram.
 *
 * Sem isto, um `pull` disparado logo depois de uma edição (por exemplo pelo
 * Realtime, ecoando a escrita de outra pessoa) sobrescreveria o que acabou de
 * ser digitado, ou ressuscitaria um registro que acabou de ser excluído aqui.
 */
function applyPending(table: TableName, remoteRows: { id: string }[]): { id: string }[] {
  const ops = readPending().filter(op => op.table === table);
  if (ops.length === 0) return remoteRows;

  const byId = new Map(remoteRows.map(row => [row.id, row]));
  for (const op of ops) {
    if (op.kind === 'delete') byId.delete(op.id);
    else byId.set(op.id, op.row as { id: string });
  }
  return [...byId.values()];
}

async function pullTable(table: TableName): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.from(table).select('id, data');
  if (error) {
    // Falha de leitura NÃO pode limpar o cache local: preferimos dados velhos
    // na tela a uma tela vazia que parece "os dados sumiram".
    console.error(`Falha ao carregar "${table}" do Supabase:`, error.message);
    return false;
  }
  const remoteRows = (data ?? []).map(row => (row as { data: { id: string } }).data);
  const merged = applyPending(table, remoteRows);
  if (safeSetItem(TABLE_TO_KEY[table], JSON.stringify(merged))) {
    notifyLocalChange(TABLE_TO_KEY[table]);
  }
  return true;
}

/** Retorna false se QUALQUER tabela falhou — quem chama decide se libera a tela. */
export async function pullAll(): Promise<boolean> {
  const results = await Promise.all(TABLES.map(pullTable));
  return results.every(Boolean);
}

// Garante uma descarga por vez. Sem isto, duas escritas seguidas disparam dois
// `flushPending` concorrentes que leem a mesma fila e mandam a mesma operação
// duas vezes — e, pior, um DELETE e o reenvio do mesmo registro podem cruzar,
// fazendo o excluído voltar.
let flushing: Promise<void> | null = null;

export function flushPending(): Promise<void> {
  if (!supabase) return Promise.resolve();
  if (flushing) return flushing;
  flushing = doFlush().finally(() => { flushing = null; });
  return flushing;
}

async function doFlush(): Promise<void> {
  if (!supabase) return;
  for (const op of readPending()) {
    try {
      if (op.kind === 'delete') {
        const { error } = await supabase.from(op.table).delete().eq('id', op.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from(op.table).upsert({
          id: op.id,
          data: op.row,
          updated_at: new Date().toISOString(),
        });
        if (error) throw new Error(error.message);
      }
      dequeue(op);
    } catch (err) {
      // Mantém na fila e para por aqui: se a rede caiu, as próximas também
      // falhariam, e insistir só gastaria tentativas.
      console.error(`Sincronização pendente de "${op.table}/${op.id}":`, err);
      return;
    }
  }
}

function queueUpsert(table: TableName, row: { id: string }): void {
  enqueue({ kind: 'upsert', table, id: row.id, row });
  void flushPending();
}

function queueDelete(table: TableName, id: string): void {
  enqueue({ kind: 'delete', table, id });
  void flushPending();
}

/**
 * Primeira carga: sobe o conteúdo deste navegador (biblioteca padrão, cargos e
 * membros já cadastrados) quando o banco ainda nunca foi populado.
 *
 * O controle é uma linha em `app_meta`, gravada com `on conflict do nothing`:
 * é atômico, então dois primeiros logins simultâneos não semeiam duas vezes, e
 * não volta a valer se alguém depois apagar todas as competências (contar
 * linhas, como fazíamos antes, ressuscitaria dados excluídos de propósito).
 */
async function seedIfNeverSeeded(): Promise<boolean> {
  if (!supabase) return false;

  const { data, error } = await supabase
    .from('app_meta')
    .insert({ key: 'seeded' })
    .select()
    .maybeSingle();

  if (error) {
    // 23505 = a linha já existe, ou seja, alguém já semeou. Qualquer outro erro
    // é falha de verdade: não semeia, para não duplicar dados.
    if (error.code !== '23505') {
      console.error('Falha ao verificar a carga inicial:', error.message);
    }
    return false;
  }
  if (!data) return false;

  storage.initializeCompetencies();
  const payload: [TableName, { id: string }[]][] = [
    ['members', storage.getMembers()],
    ['roles', storage.getRoles()],
    ['competencies', storage.getCompetencies() as unknown as { id: string }[]],
    ['evaluations', storage.getEvaluations()],
  ];
  for (const [table, rows] of payload) {
    for (const row of rows) enqueue({ kind: 'upsert', table, id: row.id, row });
  }
  await flushPending();
  return true;
}

// Envolve os métodos de escrita do storage para que cada gravação local também
// entre na fila de sincronização. Guardamos os originais para poder desfazer no
// logout — sem isso, o próximo usuário a entrar nesta máquina continuaria com
// os interceptadores do anterior.
let originals: Partial<typeof storage> | null = null;

function installWriteInterceptors(): void {
  if (originals || !supabase) return;

  originals = {
    saveMember: storage.saveMember,
    deleteMember: storage.deleteMember,
    saveRole: storage.saveRole,
    deleteRole: storage.deleteRole,
    saveCompetency: storage.saveCompetency,
    saveCompetencies: storage.saveCompetencies,
    deleteCompetency: storage.deleteCompetency,
    saveEvaluation: storage.saveEvaluation,
    deleteEvaluation: storage.deleteEvaluation,
  };

  const o = originals;

  storage.saveMember = (member) => {
    const ok = o.saveMember!.call(storage, member);
    if (ok) queueUpsert('members', member);
    return ok;
  };
  storage.deleteMember = (id) => {
    const ok = o.deleteMember!.call(storage, id);
    if (ok) queueDelete('members', id);
    return ok;
  };
  storage.saveRole = (role) => {
    const ok = o.saveRole!.call(storage, role);
    if (ok) queueUpsert('roles', role);
    return ok;
  };
  storage.deleteRole = (id) => {
    const ok = o.deleteRole!.call(storage, id);
    if (ok) queueDelete('roles', id);
    return ok;
  };
  storage.saveCompetency = (competency) => {
    const ok = o.saveCompetency!.call(storage, competency);
    if (ok) queueUpsert('competencies', competency as unknown as { id: string });
    return ok;
  };
  storage.saveCompetencies = (competencies) => {
    // Compara antes e depois: `saveCompetencies` mescla, então uma competência
    // que sumiu da lista local precisa virar DELETE no banco — um upsert em
    // massa nunca apagaria nada e o registro voltaria no próximo pull.
    const before = new Set(storage.getCompetencies().map(c => c.id));
    const ok = o.saveCompetencies!.call(storage, competencies);
    if (!ok) return ok;
    const after = storage.getCompetencies();
    const afterIds = new Set(after.map(c => c.id));
    for (const id of before) if (!afterIds.has(id)) queueDelete('competencies', id);
    for (const row of after) queueUpsert('competencies', row as unknown as { id: string });
    return ok;
  };
  storage.deleteCompetency = (id) => {
    const ok = o.deleteCompetency!.call(storage, id);
    if (ok) queueDelete('competencies', id);
    return ok;
  };
  storage.saveEvaluation = (evaluation) => {
    const ok = o.saveEvaluation!.call(storage, evaluation);
    if (ok) queueUpsert('evaluations', evaluation);
    return ok;
  };
  storage.deleteEvaluation = (id) => {
    const ok = o.deleteEvaluation!.call(storage, id);
    if (ok) queueDelete('evaluations', id);
    return ok;
  };
}

function uninstallWriteInterceptors(): void {
  if (!originals) return;
  Object.assign(storage, originals);
  originals = null;
}

let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

function subscribeToRemoteChanges(): void {
  if (!supabase || channel) return;
  const ch = supabase.channel('arquitetura-de-carreira');
  TABLES.forEach(table => {
    ch.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      () => { void pullTable(table); }
    );
  });
  ch.subscribe();
  channel = ch;
}

// Reenvia o que ficou pendente assim que a conexão volta.
let onlineHandler: (() => void) | null = null;

/**
 * Chamado uma vez por sessão, após o login.
 *
 * Devolve `false` quando não foi possível carregar os dados do banco — quem
 * chama NÃO deve liberar a tela nesse caso: seguir em frente mostraria o cache
 * do usuário anterior para quem acabou de entrar.
 */
export async function startSync(): Promise<boolean> {
  if (!supabase) return true;

  installWriteInterceptors();
  await flushPending();

  const seeded = await seedIfNeverSeeded();
  const ok = seeded ? true : await pullAll();
  if (!ok) return false;

  subscribeToRemoteChanges();

  if (!onlineHandler) {
    onlineHandler = () => { void flushPending(); };
    window.addEventListener('online', onlineHandler);
  }
  return true;
}

/**
 * Desmonta tudo no logout e limpa os dados desta máquina.
 *
 * Sem isto, quem entrasse em seguida no mesmo navegador veria — e poderia
 * editar — os dados carregados pela pessoa anterior.
 */
export async function stopSync(): Promise<void> {
  if (channel && supabase) {
    await supabase.removeChannel(channel);
    channel = null;
  }
  if (onlineHandler) {
    window.removeEventListener('online', onlineHandler);
    onlineHandler = null;
  }
  uninstallWriteInterceptors();

  for (const key of Object.values(TABLE_TO_KEY)) {
    localStorage.removeItem(key);
    notifyLocalChange(key);
  }
}
