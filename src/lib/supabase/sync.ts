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
 *    instantaneamente) e é empurrada para o Supabase em seguida (`push*`);
 *  - o Realtime avisa quando outra pessoa salvou algo, e aí puxamos de novo e
 *    disparamos o mesmo evento `storage` que a sincronização entre abas já
 *    escuta — as telas se atualizam sozinhas.
 */

type TableName = 'members' | 'roles' | 'competencies' | 'evaluations';

const TABLE_TO_KEY: Record<TableName, string> = {
  members: STORAGE_KEYS.MEMBERS,
  roles: STORAGE_KEYS.ROLES,
  competencies: STORAGE_KEYS.COMPETENCIES,
  evaluations: STORAGE_KEYS.EVALUATIONS,
};

// O evento `storage` nativo só dispara em OUTRAS abas. Quando é a sincronização
// com o banco que muda os dados, disparamos manualmente para que as telas desta
// aba também se atualizem — é o mesmo caminho já usado pelo useStorageSync.
function notifyLocalChange(key: string) {
  window.dispatchEvent(new StorageEvent('storage', { key }));
}

async function pullTable(table: TableName): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase.from(table).select('id, data');
  if (error) {
    console.error(`Falha ao carregar "${table}" do Supabase:`, error.message);
    return;
  }
  const rows = (data ?? []).map(row => (row as { data: unknown }).data);
  if (safeSetItem(TABLE_TO_KEY[table], JSON.stringify(rows))) {
    notifyLocalChange(TABLE_TO_KEY[table]);
  }
}

export async function pullAll(): Promise<void> {
  await Promise.all(
    (Object.keys(TABLE_TO_KEY) as TableName[]).map(pullTable)
  );
}

async function pushRow(table: TableName, row: { id: string }): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from(table)
    .upsert({ id: row.id, data: row, updated_at: new Date().toISOString() });
  if (error) console.error(`Falha ao salvar em "${table}" no Supabase:`, error.message);
}

async function deleteRow(table: TableName, id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error(`Falha ao excluir de "${table}" no Supabase:`, error.message);
}

async function pushWholeTable(table: TableName, rows: { id: string }[]): Promise<void> {
  if (!supabase || rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(
    rows.map(row => ({ id: row.id, data: row, updated_at: new Date().toISOString() }))
  );
  if (error) console.error(`Falha ao salvar "${table}" no Supabase:`, error.message);
}

/**
 * Primeira carga: se o banco está vazio e este navegador já tem dados (a
 * biblioteca padrão, ou o que o cliente já cadastrou localmente antes de
 * migrar), sobe tudo. Sem isso o primeiro login apagaria o conteúdo local ao
 * puxar um banco vazio por cima.
 */
async function seedIfRemoteEmpty(): Promise<boolean> {
  if (!supabase) return false;
  const { count, error } = await supabase
    .from('competencies')
    .select('id', { count: 'exact', head: true });
  if (error) {
    console.error('Falha ao verificar se o banco está vazio:', error.message);
    return false;
  }
  if ((count ?? 0) > 0) return false;

  storage.initializeCompetencies();
  await Promise.all([
    pushWholeTable('members', storage.getMembers()),
    pushWholeTable('roles', storage.getRoles()),
    pushWholeTable('competencies', storage.getCompetencies()),
    pushWholeTable('evaluations', storage.getEvaluations()),
  ]);
  return true;
}

// Envolve os métodos de escrita do storage para que cada gravação local também
// vá para o banco. Feito uma única vez, após o login.
let installed = false;

function installWriteInterceptors(): void {
  if (installed || !supabase) return;
  installed = true;

  const saveMember = storage.saveMember.bind(storage);
  storage.saveMember = (member) => {
    const ok = saveMember(member);
    if (ok) void pushRow('members', member);
    return ok;
  };

  const deleteMember = storage.deleteMember.bind(storage);
  storage.deleteMember = (id) => {
    const ok = deleteMember(id);
    if (ok) void deleteRow('members', id);
    return ok;
  };

  const saveRole = storage.saveRole.bind(storage);
  storage.saveRole = (role) => {
    const ok = saveRole(role);
    if (ok) void pushRow('roles', role);
    return ok;
  };

  const deleteRole = storage.deleteRole.bind(storage);
  storage.deleteRole = (id) => {
    const ok = deleteRole(id);
    if (ok) void deleteRow('roles', id);
    return ok;
  };

  const saveCompetency = storage.saveCompetency.bind(storage);
  storage.saveCompetency = (competency) => {
    const ok = saveCompetency(competency);
    if (ok) void pushRow('competencies', competency as unknown as { id: string });
    return ok;
  };

  const saveCompetencies = storage.saveCompetencies.bind(storage);
  storage.saveCompetencies = (competencies) => {
    const ok = saveCompetencies(competencies);
    if (ok) void pushWholeTable('competencies', competencies as unknown as { id: string }[]);
    return ok;
  };

  const deleteCompetency = storage.deleteCompetency.bind(storage);
  storage.deleteCompetency = (id) => {
    const ok = deleteCompetency(id);
    if (ok) void deleteRow('competencies', id);
    return ok;
  };

  const saveEvaluation = storage.saveEvaluation.bind(storage);
  storage.saveEvaluation = (evaluation) => {
    const ok = saveEvaluation(evaluation);
    if (ok) void pushRow('evaluations', evaluation);
    return ok;
  };

  const deleteEvaluation = storage.deleteEvaluation.bind(storage);
  storage.deleteEvaluation = (id) => {
    const ok = deleteEvaluation(id);
    if (ok) void deleteRow('evaluations', id);
    return ok;
  };
}

function subscribeToRemoteChanges(): void {
  if (!supabase) return;
  const channel = supabase.channel('arquitetura-de-carreira');
  (Object.keys(TABLE_TO_KEY) as TableName[]).forEach(table => {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      () => { void pullTable(table); }
    );
  });
  channel.subscribe();
}

/**
 * Chamado uma vez, logo após o login. Retorna quando os dados já estão no
 * localStorage e o app pode renderizar normalmente.
 */
export async function startSync(): Promise<void> {
  if (!supabase) return;
  const seeded = await seedIfRemoteEmpty();
  if (!seeded) await pullAll();
  installWriteInterceptors();
  subscribeToRemoteChanges();
}
