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

beforeEach(() => {
  localStorage.clear();
  calls.length = 0;
  h.state.writeError = null;
  h.state.selectResult = { data: [], error: null };
  h.state.seedInsertResult = { data: null, error: { message: 'duplicate', code: '23505' } };
  void stopSync();
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
