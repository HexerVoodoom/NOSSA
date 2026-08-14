import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => {
  const calls: { op: string; payload?: unknown }[] = [];
  const state = {
    rows: [] as { email: string; created_at: string }[],
    insertError: null as { code?: string; message: string } | null,
    // Linhas devolvidas pelo delete. Vazio = a RLS barrou (o PostgREST não
    // acusa erro nesse caso).
    deleteReturns: [{ email: 'externo@gmail.com' }] as { email: string }[],
  };

  const fake = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: state.rows, error: null }),
      }),
      insert: (payload: unknown) => {
        calls.push({ op: 'insert', payload });
        return Promise.resolve({ error: state.insertError });
      },
      delete: () => ({
        eq: () => ({
          select: () => {
            calls.push({ op: 'delete' });
            return Promise.resolve({ data: state.deleteReturns, error: null });
          },
        }),
      }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'user-123' } } }),
    },
  };

  const toasts: { kind: string; msg: string }[] = [];
  return { calls, state, fake, toasts };
});

vi.mock('../../lib/supabase/client', () => ({
  supabase: h.fake,
  isSupabaseConfigured: true,
  AUTO_ALLOWED_DOMAIN: 'nossapessoaseempresas.com.br',
}));

vi.mock('sonner', () => ({
  toast: {
    success: (msg: string) => h.toasts.push({ kind: 'success', msg }),
    error: (msg: string) => h.toasts.push({ kind: 'error', msg }),
    info: (msg: string) => h.toasts.push({ kind: 'info', msg }),
  },
}));

import { AccessManagement } from '../AccessManagement';

beforeEach(() => {
  h.calls.length = 0;
  h.toasts.length = 0;
  h.state.rows = [];
  h.state.insertError = null;
  h.state.deleteReturns = [{ email: 'externo@gmail.com' }];
});

const convidar = async (email: string) => {
  render(<AccessManagement onBack={() => {}} />);
  await waitFor(() => screen.getByLabelText('E-mail para convidar'));
  fireEvent.change(screen.getByLabelText('E-mail para convidar'), { target: { value: email } });
  fireEvent.click(screen.getByText('Convidar'));
};

describe('AccessManagement — convites', () => {
  it('normaliza o e-mail para minúsculo antes de gravar', async () => {
    await convidar('Ana.Silva@Gmail.com');
    await waitFor(() => expect(h.calls.some(c => c.op === 'insert')).toBe(true));
    expect((h.calls.find(c => c.op === 'insert')!.payload as { email: string }).email)
      .toBe('ana.silva@gmail.com');
  });

  it('[regressão] envia invited_by explicitamente', async () => {
    // A política de INSERT exige invited_by = auth.uid(); depender do DEFAULT
    // da coluna deixaria o convite quebrando por ordem de avaliação no banco.
    await convidar('externo@gmail.com');
    await waitFor(() => expect(h.calls.some(c => c.op === 'insert')).toBe(true));
    expect((h.calls.find(c => c.op === 'insert')!.payload as { invited_by: string }).invited_by)
      .toBe('user-123');
  });

  it('não tenta convidar quem já entra pelo domínio da empresa', async () => {
    await convidar('alguem@nossapessoaseempresas.com.br');
    await waitFor(() => expect(h.toasts.some(t => t.kind === 'info')).toBe(true));
    expect(h.calls.some(c => c.op === 'insert')).toBe(false);
  });

  it('[regressão] erro de permissão vira mensagem em português, não texto do Postgres', async () => {
    h.state.insertError = { code: '42501', message: 'new row violates row-level security policy' };
    await convidar('externo@gmail.com');
    await waitFor(() => expect(h.toasts.some(t => t.kind === 'error')).toBe(true));
    const msg = h.toasts.find(t => t.kind === 'error')!.msg;
    expect(msg).toContain('permissão');
    expect(msg).not.toContain('row-level security');
  });
});

describe('AccessManagement — remoção', () => {
  const removerPrimeiro = async () => {
    h.state.rows = [{ email: 'externo@gmail.com', created_at: '2026-01-01' }];
    render(<AccessManagement onBack={() => {}} />);
    await waitFor(() => screen.getByText('externo@gmail.com'));
    fireEvent.click(screen.getByLabelText('Remover acesso de externo@gmail.com'));
    // O diálogo de exclusão pede confirmação em dois passos.
    fireEvent.click(await screen.findByText('Excluir'));
    fireEvent.click(await screen.findByText('Confirmar Exclusão'));
  };

  it('[regressão] remoção barrada pela RLS não anuncia sucesso', async () => {
    // O PostgREST devolve 0 linhas e nenhum erro quando a política barra o
    // delete: antes disso a tela dizia "não tem mais acesso" para alguém que
    // continuava com acesso.
    h.state.deleteReturns = [];
    await removerPrimeiro();

    await waitFor(() => expect(h.toasts.length).toBeGreaterThan(0));
    expect(h.toasts.every(t => t.kind !== 'success')).toBe(true);
    expect(h.toasts.find(t => t.kind === 'error')!.msg).toContain('permissão');
  });

  it('remoção efetiva confirma sucesso', async () => {
    await removerPrimeiro();
    await waitFor(() => expect(h.toasts.some(t => t.kind === 'success')).toBe(true));
  });
});
