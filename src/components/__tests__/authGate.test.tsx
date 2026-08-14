import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Sem variáveis de ambiente do Supabase, o cliente não é criado. Este é o
// estado do deploy atual: se o portão de login não deixar passar aqui, a
// ferramenta fica inacessível para quem ainda não migrou para o banco.
vi.mock('../../lib/supabase/client', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

import { AuthGate } from '../AuthGate';

describe('AuthGate', () => {
  it('sem Supabase configurado, renderiza o app direto (sem exigir login)', () => {
    render(<AuthGate><p>conteúdo do app</p></AuthGate>);
    expect(screen.getByText('conteúdo do app')).toBeTruthy();
    expect(screen.queryByText('Entrar')).toBeNull();
  });
});
