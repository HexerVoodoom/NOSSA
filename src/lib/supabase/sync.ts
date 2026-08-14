import { supabase } from './client';
import { storage, STORAGE_KEYS, safeSetItem, CUSTOM_ELEMENTS_KEY } from '../storage';

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

// Se a fila não couber no localStorage, a escrita local já aconteceu e a
// alteração ficaria sem nenhum registro de que precisa subir — exatamente o
// sumiço silencioso que a fila existe para evitar. Avisamos alto.
let queueOverflowed = false;
export function hasQueueOverflowed(): boolean { return queueOverflowed; }

function writePending(ops: PendingOp[]): void {
  if (!safeSetItem(PENDING_KEY, JSON.stringify(ops))) {
    queueOverflowed = true;
    console.error(
      'Não foi possível registrar a alteração na fila de sincronização. ' +
      'Ela pode não chegar ao banco — libere espaço no navegador.'
    );
  }
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
  // Uma linha corrompida no banco (sem `data`, ou objeto sem `id`) não pode
  // derrubar a carga inteira: sem esta filtragem, um registro ruim lançava
  // exceção aqui e todo mundo caía na tela de "sem acesso".
  const remoteRows: { id: string }[] = [];
  for (const raw of data ?? []) {
    const row = (raw as { data?: unknown }).data;
    if (row && typeof row === 'object' && typeof (row as { id?: unknown }).id === 'string') {
      remoteRows.push(row as { id: string });
    } else {
      console.error(`Registro ignorado em "${table}" por estar corrompido:`, raw);
    }
  }
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
    restoreBackup: storage.restoreBackup,
    importConfiguration: storage.importConfiguration,
    importEvaluations: storage.importEvaluations,
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
    const ok = o.saveCompetencies!.call(storage, competencies);
    if (!ok) return ok;
    // `saveCompetencies` só mescla — nunca remove (exclusão passa por
    // `deleteCompetency`, interceptado logo abaixo). Então os registros que
    // mudaram são exatamente os recebidos. Relemos do storage porque o save
    // normaliza as perguntas antes de gravar, e é a versão normalizada que
    // precisa subir. Enfileirar a tabela inteira aqui encheria a fila com
    // centenas de árvores de perguntas a cada edição de uma frase.
    const stored = new Map(storage.getCompetencies().map(c => [c.id, c]));
    for (const changed of competencies) {
      const row = stored.get(changed.id);
      if (row) queueUpsert('competencies', row as unknown as { id: string });
    }
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

  storage.restoreBackup = () => {
    const ok = o.restoreBackup!.call(storage);
    if (!ok) return ok;
    // Restaurar grava direto no localStorage, sem passar pelos métodos acima.
    // Sem enfileirar aqui, a restauração valia só neste navegador e a próxima
    // sincronização a desfazia em silêncio — mostrando "Backup restaurado".
    queueEverythingLocal();
    return ok;
  };

  storage.importConfiguration = (json) => {
    const ok = o.importConfiguration!.call(storage, json);
    if (ok) queueEverythingLocal();
    return ok;
  };

  storage.importEvaluations = (json) => {
    const ok = o.importEvaluations!.call(storage, json);
    if (ok) queueEverythingLocal();
    return ok;
  };
}

/**
 * Enfileira tudo o que está no navegador. Usado pelas operações em massa
 * (restaurar backup, importar arquivo), que gravam direto no localStorage e
 * portanto não passam pelos interceptadores individuais.
 *
 * Observação: isto sobe e sobrescreve, mas não apaga do banco o que sumiu na
 * restauração — a alternativa seria um "apague tudo o que não está aqui", que
 * transforma um clique errado em perda de dados para a equipe inteira.
 */
function queueEverythingLocal(): void {
  const payload: [TableName, { id: string }[]][] = [
    ['members', storage.getMembers()],
    ['roles', storage.getRoles()],
    ['competencies', storage.getCompetencies() as unknown as { id: string }[]],
    ['evaluations', storage.getEvaluations()],
  ];
  for (const [table, rows] of payload) {
    for (const row of rows) enqueue({ kind: 'upsert', table, id: row.id, row });
  }
  void flushPending();
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
let retryTimer: number | null = null;

/**
 * Chamado uma vez por sessão, após o login.
 *
 * Devolve `false` quando não foi possível carregar os dados do banco — quem
 * chama NÃO deve liberar a tela nesse caso: seguir em frente mostraria o cache
 * do usuário anterior para quem acabou de entrar.
 */
export type SyncResult =
  /** Tudo certo: dados carregados, pode liberar a tela. */
  | 'ok'
  /** O banco recusou este usuário. Limpe os dados locais. */
  | 'denied'
  /** Não deu para falar com o banco. NÃO limpe nada — pode ser só a rede. */
  | 'unavailable';

export async function startSync(): Promise<SyncResult> {
  if (!supabase) return 'ok';

  // Pergunta ao banco, explicitamente, se este usuário tem acesso.
  //
  // Não dá para inferir isso do resultado das leituras: quando a RLS barra um
  // SELECT, o PostgREST responde 200 com lista vazia — não é erro. Sem esta
  // chamada, alguém de fora entraria com o app "funcionando" e vazio, em vez
  // da tela de sem acesso.
  const { data: allowed, error: accessError } = await supabase.rpc('tem_acesso');
  if (accessError) {
    // Erro ao perguntar é diferente de resposta "não": pode ser a rede. Barra a
    // entrada do mesmo jeito, mas sem apagar nada do que está no navegador.
    console.error('Falha ao verificar acesso:', accessError.message);
    return 'unavailable';
  }
  if (allowed !== true) return 'denied';

  installWriteInterceptors();
  await flushPending();

  const seeded = await seedIfNeverSeeded();
  const ok = seeded ? true : await pullAll();
  // Aqui o acesso já foi confirmado, então a falha é de conexão — jamais tratar
  // como recusa: quem chama apagaria a fila de alterações ainda não enviadas.
  if (!ok) return 'unavailable';

  subscribeToRemoteChanges();

  if (!onlineHandler) {
    onlineHandler = () => { void flushPending(); };
    window.addEventListener('online', onlineHandler);
  }

  // Uma falha que não seja queda de rede (erro 500, portal de wi-fi, política
  // recusada) deixaria a fila parada até a próxima escrita do usuário. Uma
  // tentativa periódica garante que ela sozinha volta a escoar.
  if (retryTimer === null) {
    retryTimer = window.setInterval(() => {
      if (pendingCount() > 0) void flushPending();
    }, 30_000);
  }
  return 'ok';
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
  if (retryTimer !== null) {
    window.clearInterval(retryTimer);
    retryTimer = null;
  }
  uninstallWriteInterceptors();

  // A fila carrega registros inteiros de RH. Deixá-la aqui faria duas coisas
  // ruins: expõe dados da pessoa anterior e, no login seguinte, `applyPending`
  // reinjetaria essas linhas no cache de quem entrou — e `flushPending` as
  // gravaria no banco sob a identidade errada.
  localStorage.removeItem(PENDING_KEY);

  // O backup guarda uma cópia completa de membros, avaliações e competências.
  // Sem apagá-lo, bastava a próxima pessoa clicar em "Restaurar backup" para
  // ver toda a base de quem usou o computador antes.
  localStorage.removeItem(STORAGE_KEYS.BACKUP);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_EVALUATION);
  localStorage.removeItem(STORAGE_KEYS.SECTION_IMAGES);

  // Elementos enviados pelo próprio usuário. Não são dados de RH, mas são
  // conteúdo de quem estava logado e não têm por que sobrar para o próximo.
  localStorage.removeItem(CUSTOM_ELEMENTS_KEY);

  // Sem zerar, um estouro de cota na sessão de alguém deixaria o aviso de
  // "sincronização pode estar quebrada" ligado para quem entrasse depois.
  queueOverflowed = false;

  for (const key of Object.values(TABLE_TO_KEY)) {
    localStorage.removeItem(key);
    notifyLocalChange(key);
  }
}
