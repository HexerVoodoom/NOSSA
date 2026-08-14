import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Testes da ponte localStorage <-> Supabase.
 *
 * O cliente Supabase é substituído por um dublê que registra as chamadas, para
 * que estes testes travem o COMPORTAMENTO da sincronização (o que vai para a
 * fila, o que é gravado localmente, o que acontece quando a rede falha) sem
 * precisar de um banco de verdade.
 */

const KEYS = {
  MEMBERS: 'obra-viva-members',
  COMPETENCIES: 'obra-viva-competencies',
  PENDING: 'obra-viva-pending-sync',
};

type TableCall = { table: string; op: 'select' | 'upsert' | 'delete' | 'insert'; payload?: unknown };

// `vi.mock` é içado para o topo do arquivo, antes de qualquer `const`. O que a
// fábrica do mock precisa enxergar tem que nascer dentro de `vi.hoisted`.
const h = vi.hoisted(() => {
  const calls: { table: string; op: string; payload?: unknown }[] = [];
  const state = {
    selectResult: { data: [] as unknown[] | null, error: null as { message: string; code?: string } | null },
    writeError: null as { message: string; code?: string } | null,
    seedInsertResult: {
      data: null as unknown,
      error: { message: 'duplicate', code: '23505' } as { message: string; code?: string } | null,
    },
    // Resposta de `rpc('tem_acesso')`.
    hasAccess: { data: true as unknown, error: null as { message: string } | null },
  };

  const fakeSupabase = {
    from(table: string) {
      return {
        select: () => {
          calls.push({ table, op: 'select' });
          return {
            then: (resolve: (v: unknown) => unknown) => resolve(state.selectResult),
            maybeSingle: () => Promise.resolve(state.seedInsertResult),
            order: () => Promise.resolve(state.selectResult),
          };
        },
        insert: (payload: unknown) => {
          calls.push({ table, op: 'insert', payload });
          return { select: () => ({ maybeSingle: () => Promise.resolve(state.seedInsertResult) }) };
        },
        upsert: (payload: unknown) => {
          calls.push({ table, op: 'upsert', payload });
          return Promise.resolve({ error: state.writeError });
        },
        delete: () => ({
          eq: (_col: string, id: string) => {
            calls.push({ table, op: 'delete', payload: id });
            return Promise.resolve({ error: state.writeError });
          },
        }),
      };
    },
    rpc: (name: string) => {
      calls.push({ table: `rpc:${name}`, op: 'select' });
      return Promise.resolve(state.hasAccess);
    },
    channel: () => ({ on() { return this; }, subscribe() { return this; } }),
    removeChannel: () => Promise.resolve('ok'),
  };

  return { calls, state, fakeSupabase };
});

const calls = h.calls as TableCall[];

vi.mock('../client', () => ({
  supabase: h.fakeSupabase,
  isSupabaseConfigured: true,
  AUTO_ALLOWED_DOMAIN: 'nossapessoaseempresas.com.br',
}));

import { pullAll, flushPending, startSync, stopSync, pendingCount } from '../sync';
import { storage } from '../../storage';

beforeEach(async () => {
  // `stopSync` é assíncrono (fecha o canal). Sem esperar, a limpeza de um teste
  // vazava para dentro do seguinte.
  await stopSync();
  localStorage.clear();
  calls.length = 0;
  h.state.writeError = null;
  h.state.selectResult = { data: [], error: null };
  h.state.seedInsertResult = { data: null, error: { message: 'duplicate', code: '23505' } };
  h.state.hasAccess = { data: true, error: null };
});

describe('verificação de acesso', () => {
  it('[regressão] usuário sem permissão não passa, mesmo o banco não dando erro', async () => {
    // Quando a RLS barra um SELECT, o PostgREST responde 200 com lista vazia.
    // Sem perguntar `tem_acesso()` explicitamente, isso era indistinguível de
    // "banco vazio" e o app abria normalmente para quem não tem acesso.
    h.state.hasAccess = { data: false, error: null };

    expect(await startSync()).toBe(false);
  });

  it('[regressão] barrado não instala os interceptadores de escrita', async () => {
    h.state.hasAccess = { data: false, error: null };
    await startSync();
    calls.length = 0;

    storage.saveMember({ id: 'm1', firstName: 'Ana', position: 'Analista', createdAt: new Date() });
    await flushPending();

    expect(calls.filter(c => c.op === 'upsert')).toHaveLength(0);
  });

  it('falha ao verificar acesso também barra (não abre em caso de dúvida)', async () => {
    h.state.hasAccess = { data: null, error: { message: 'rede fora' } };
    expect(await startSync()).toBe(false);
  });
});

describe('pull do banco', () => {
  it('[regressão] falha de leitura NÃO apaga o cache local', async () => {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify([{ id: 'm1', firstName: 'Ana' }]));
    h.state.selectResult = { data: null, error: { message: 'rede fora' } };

    const ok = await pullAll();

    expect(ok).toBe(false);
    // O pior desfecho possível seria a tela ficar vazia e parecer que os dados
    // sumiram — preferimos dados velhos a nenhum dado.
    expect(JSON.parse(localStorage.getItem(KEYS.MEMBERS)!)).toHaveLength(1);
  });

  it('[regressão] pull não ressuscita registro excluído que ainda está na fila', async () => {
    // Exclusão feita aqui e ainda não confirmada no banco...
    localStorage.setItem(
      KEYS.PENDING,
      JSON.stringify([{ kind: 'delete', table: 'members', id: 'm1' }])
    );
    // ...enquanto o banco ainda devolve o registro no retrato que veio antes.
    h.state.selectResult = {
      data: [{ id: 'm1', data: { id: 'm1', firstName: 'Ana' } }],
      error: null,
    };

    await pullAll();

    const stored = JSON.parse(localStorage.getItem(KEYS.MEMBERS)!);
    expect(stored.find((m: { id: string }) => m.id === 'm1')).toBeUndefined();
  });

  it('[regressão] pull não sobrescreve edição local ainda não sincronizada', async () => {
    localStorage.setItem(
      KEYS.PENDING,
      JSON.stringify([
        { kind: 'upsert', table: 'members', id: 'm1', row: { id: 'm1', firstName: 'Ana Editada' } },
      ])
    );
    h.state.selectResult = {
      data: [{ id: 'm1', data: { id: 'm1', firstName: 'Ana Antiga' } }],
      error: null,
    };

    await pullAll();

    const stored = JSON.parse(localStorage.getItem(KEYS.MEMBERS)!);
    expect(stored.find((m: { id: string }) => m.id === 'm1').firstName).toBe('Ana Editada');
  });
});

describe('fila de escritas pendentes', () => {
  it('[regressão] escrita que falha fica na fila em vez de sumir', async () => {
    h.state.writeError = { message: 'sem conexão' };
    localStorage.setItem(
      KEYS.PENDING,
      JSON.stringify([{ kind: 'upsert', table: 'members', id: 'm1', row: { id: 'm1' } }])
    );

    await flushPending();

    expect(pendingCount()).toBe(1);
  });

  it('escrita bem-sucedida sai da fila', async () => {
    localStorage.setItem(
      KEYS.PENDING,
      JSON.stringify([{ kind: 'upsert', table: 'members', id: 'm1', row: { id: 'm1' } }])
    );

    await flushPending();

    expect(pendingCount()).toBe(0);
    expect(calls.some(c => c.table === 'members' && c.op === 'upsert')).toBe(true);
  });
});

describe('interceptadores de escrita', () => {
  it('[regressão] instalar duas vezes não duplica o envio ao banco', async () => {
    await startSync();
    await startSync();
    calls.length = 0;

    storage.saveMember({ id: 'm1', firstName: 'Ana', position: 'Analista', createdAt: new Date() });
    await flushPending();

    const upserts = calls.filter(c => c.table === 'members' && c.op === 'upsert');
    expect(upserts).toHaveLength(1);
  });

  it('[regressão] logout desinstala os interceptadores e limpa os dados locais', async () => {
    await startSync();
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify([{ id: 'm1', firstName: 'Ana' }]));

    await stopSync();

    // Dados da pessoa anterior não podem ficar na máquina para a próxima ver.
    expect(localStorage.getItem(KEYS.MEMBERS)).toBeNull();

    calls.length = 0;
    storage.saveMember({ id: 'm2', firstName: 'Bia', position: 'Analista', createdAt: new Date() });
    await flushPending();
    expect(calls.filter(c => c.op === 'upsert')).toHaveLength(0);
  });
});

describe('operações em massa e limpeza', () => {
  it('[regressão] restaurar backup sobe os dados em vez de valer só neste navegador', async () => {
    await startSync();
    storage.saveMember({ id: 'm1', firstName: 'Ana', position: 'Analista', createdAt: new Date() });
    storage.createBackup();
    await flushPending();
    calls.length = 0;

    storage.restoreBackup();
    await flushPending();

    // Antes, restaurar gravava direto no localStorage: a próxima sincronização
    // desfazia tudo em silêncio, depois de dizer "Backup restaurado".
    expect(calls.some(c => c.table === 'members' && c.op === 'upsert')).toBe(true);
  });

  it('[regressão] logout limpa o backup e a fila, não só as tabelas', async () => {
    await startSync();
    storage.saveMember({ id: 'm1', firstName: 'Ana', position: 'Analista', createdAt: new Date() });
    storage.createBackup();

    await stopSync();

    // O backup guarda uma cópia inteira da base: deixá-lo permitia à próxima
    // pessoa da máquina clicar em "Restaurar" e ver os dados de quem saiu.
    expect(localStorage.getItem('obra-viva-backup')).toBeNull();
    expect(localStorage.getItem(KEYS.PENDING)).toBeNull();
  });

  it('[regressão] registro corrompido no banco não derruba a carga inteira', async () => {
    h.state.selectResult = {
      data: [
        { id: 'ok', data: { id: 'ok', firstName: 'Ana' } },
        { id: 'ruim', data: null },
        { id: 'sem-id', data: { firstName: 'Sem id' } },
      ],
      error: null,
    };

    const ok = await pullAll();

    expect(ok).toBe(true);
    const stored = JSON.parse(localStorage.getItem(KEYS.MEMBERS)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('ok');
  });

  it('[regressão] editar uma competência não enfileira a biblioteca inteira', async () => {
    await startSync();
    // Repovoa depois do startSync: o pull inicial (banco vazio no dublê) zera
    // o cache local.
    storage.initializeCompetencies();
    const todas = storage.getCompetencies();
    expect(todas.length).toBeGreaterThan(5);
    calls.length = 0;

    storage.saveCompetencies([todas[0]]);
    await flushPending();

    const upserts = calls.filter(c => c.table === 'competencies' && c.op === 'upsert');
    expect(upserts).toHaveLength(1);
  });
});

describe('carga inicial', () => {
  it('[regressão] não semeia quando o banco já foi semeado', async () => {
    h.state.seedInsertResult = { data: null, error: { message: 'duplicate', code: '23505' } };

    await startSync();

    // Nenhum upsert de carga inicial: só a leitura das tabelas.
    expect(calls.filter(c => c.op === 'upsert')).toHaveLength(0);
  });

  it('semeia uma única vez quando a marca é gravada com sucesso', async () => {
    h.state.seedInsertResult = { data: { key: 'seeded' }, error: null };
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify([{ id: 'm1', firstName: 'Ana' }]));

    await startSync();

    expect(calls.some(c => c.table === 'members' && c.op === 'upsert')).toBe(true);
  });
});
