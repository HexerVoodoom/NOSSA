import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkDetail } from '../WorkDetail';
import { SavedWork } from '../../types';

// REGRESSÃO — a tela "Obra Montada" (AssemblyViewReadOnly) existia, estava
// ligada no App.tsx via `onViewAssembly`... e era INALCANÇÁVEL pela interface:
// o WorkDetail declarava a prop mas nem a desestruturava, e o botão nunca era
// renderizado. Todo o motor de desenho era código morto para o usuário.
const work: SavedWork = {
  id: 'w1',
  roleId: 'r1',
  roleName: 'Cargo',
  leaderId: 'l1',
  collaboratorId: 'c1',
  leaderName: 'Líder',
  collaboratorName: 'Colaborador',
  responses: [],
  createdAt: new Date().toISOString() as unknown as Date,
  completed: true,
  questionIds: [],
  evaluationType: 'tradicional',
} as unknown as SavedWork;

describe('WorkDetail — acesso à Obra Montada', () => {
  beforeEach(() => localStorage.clear());

  it('renderiza o botão e chama onViewAssembly com a obra', () => {
    const onViewAssembly = vi.fn();
    render(<WorkDetail work={work} onBack={() => {}} onViewAssembly={onViewAssembly} />);

    const btn = screen.getByRole('button', { name: /Ver Obra Montada/i });
    fireEvent.click(btn);
    expect(onViewAssembly).toHaveBeenCalledWith(work);
  });

  it('omite o botão quando não há handler', () => {
    render(<WorkDetail work={work} onBack={() => {}} />);
    expect(screen.queryByRole('button', { name: /Ver Obra Montada/i })).toBeNull();
  });
});
