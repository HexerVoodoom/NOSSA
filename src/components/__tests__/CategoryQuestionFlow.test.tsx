import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { CategoryQuestionFlow } from '../CategoryQuestionFlow';
import { storage } from '../../lib/storage';
import type { Competency, Evaluation, Role } from '../../types';

const KEYS = {
  ROLES: 'obra-viva-roles',
  MEMBERS: 'obra-viva-members',
  COMPETENCIES: 'obra-viva-competencies',
  COMPETENCIES_INITIALIZED: 'obra-viva-competencies-initialized',
  COMPETENCIES_VERSION: 'obra-viva-competencies-version',
  CURRENT_EVALUATION: 'obra-viva-current-evaluation',
  INITIALIZED: 'obra-viva-initialized',
  LIBRARY_INITIALIZED: 'obra-viva-library-initialized',
  EVALUATIONS: 'obra-viva-evaluations',
};

// Bloqueia as rotinas de seed/migração do storage para que o teste veja
// exatamente os dados que semeou (e não os 6 blocos padrão).
function freezeSeeds() {
  localStorage.setItem(KEYS.INITIALIZED, 'true');
  localStorage.setItem(KEYS.LIBRARY_INITIALIZED, 'true');
  localStorage.setItem(KEYS.COMPETENCIES_INITIALIZED, 'true');
  localStorage.setItem(KEYS.COMPETENCIES_VERSION, '1.4');
}

const ROLE: Role = {
  id: 'role-1',
  name: 'Analista',
  type: 'collaborator',
  questionIds: ['q1', 'q2'],
  activities: [{ id: 'a1', text: 'Fechar o caixa diário', order: 1 }],
  createdAt: '2024-01-01T00:00:00.000Z',
};

// Duas perguntas de bloco1 (statement) + uma de bloco2, para exercitar
// a navegação entre seções.
const COMPETENCIES: Competency[] = [
  {
    id: 'comp-1',
    name: 'Execução',
    categoryId: 'bloco1',
    order: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    questions: [
      { id: 'q1', categoryId: 'bloco1', text: 'Entrega no prazo?', order: 1, type: 'statement' },
    ],
  },
  {
    id: 'comp-2',
    name: 'Técnica',
    categoryId: 'bloco2',
    order: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    questions: [
      { id: 'q2', categoryId: 'bloco2', text: 'Resolve problemas?', order: 1, type: 'statement' },
    ],
  },
];

const baseEvaluation = (over: Partial<Evaluation> = {}): Evaluation => ({
  id: 'ev-1',
  roleId: 'role-1',
  roleName: 'Analista',
  leaderId: 'm-leader',
  collaboratorId: 'm-collab',
  leaderName: 'Líder',
  collaboratorName: 'Maria',
  responses: [],
  questionIds: ['q1', 'q2'],
  createdAt: '2024-05-01T12:00:00.000Z',
  completed: false,
  evaluationType: 'tradicional',
  ...over,
});

beforeEach(() => {
  freezeSeeds();
  localStorage.setItem(KEYS.ROLES, JSON.stringify([ROLE]));
  localStorage.setItem(KEYS.COMPETENCIES, JSON.stringify(COMPETENCIES));
  localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([]));
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify([]));
});

describe('CategoryQuestionFlow — fluxo de avaliação', () => {
  it('persiste as respostas via saveCurrentEvaluation ao avançar de seção', () => {
    const onComplete = vi.fn();
    render(
      <CategoryQuestionFlow evaluation={baseEvaluation()} onComplete={onComplete} onBack={vi.fn()} />
    );

    expect(screen.getByText('Entrega no prazo?')).toBeInTheDocument();

    const group = screen.getByRole('radiogroup', {
      name: /Entrega no prazo\?/,
    });
    fireEvent.click(within(group).getByRole('radio', { name: /^4 —/ }));
    fireEvent.click(screen.getByRole('button', { name: /Próxima Seção/ }));

    const saved = storage.getCurrentEvaluation();
    expect(saved).not.toBeNull();
    expect(saved!.responses).toEqual([
      expect.objectContaining({ questionId: 'q1', rating: 4, keywords: ['', '', ''] }),
    ]);

    // Regressão: `selectedImageIndex` ficava travado em 0, e como
    // `selectedElementId` deriva dele, a nota 4 era gravada com a forma da nota
    // 1 ('foundation-1'), corrompendo a obra montada a partir das respostas.
    // A nota é a única entrada da tela, então o índice acompanha a nota.
    expect(saved!.responses[0].selectedImageIndex).toBe(3);
    expect(saved!.responses[0].selectedElementId).toBe('foundation-4');
    // Ainda não finalizou: só mudou de seção.
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByText('Resolve problemas?')).toBeInTheDocument();
  });

  it('acumula respostas das duas seções e chama onComplete ao finalizar', () => {
    const onComplete = vi.fn();
    render(
      <CategoryQuestionFlow evaluation={baseEvaluation()} onComplete={onComplete} onBack={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: /Próxima Seção/ }));
    const group = screen.getByRole('radiogroup', { name: /Resolve problemas\?/ });
    fireEvent.click(within(group).getByRole('radio', { name: /^5 —/ }));
    fireEvent.click(screen.getByRole('button', { name: /Finalizar Avaliação/ }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    const completed = onComplete.mock.calls[0][0] as Evaluation;
    expect(completed.responses.map(r => r.questionId).sort()).toEqual(['q1', 'q2']);
    expect(completed.responses.find(r => r.questionId === 'q2')!.rating).toBe(5);
    // O que foi entregue ao callback é o mesmo que ficou persistido.
    expect(storage.getCurrentEvaluation()!.responses).toHaveLength(2);
  });

  it('grava as observações da seção junto com as respostas', () => {
    render(
      <CategoryQuestionFlow evaluation={baseEvaluation()} onComplete={vi.fn()} onBack={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText(/Observações da Seção/), { target: { value: 'Boa evolução' } });
    fireEvent.click(screen.getByRole('button', { name: /Próxima Seção/ }));

    expect(storage.getCurrentEvaluation()!.sectionObservations).toEqual({ bloco1: 'Boa evolução' });
  });

  it('chama onBack na primeira seção em vez de retroceder', () => {
    const onBack = vi.fn();
    render(
      <CategoryQuestionFlow evaluation={baseEvaluation()} onComplete={vi.fn()} onBack={onBack} />
    );

    fireEvent.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  // REGRESSÃO: o early-return `if (categoriesWithQuestions.length === 0) return null`
  // ficava ANTES dos hooks, quebrando a ordem de hooks do React e derrubando a tela.
  it('com ZERO categorias correspondentes: não quebra e chama onComplete', () => {
    const onComplete = vi.fn();
    expect(() =>
      render(
        <CategoryQuestionFlow
          // questionIds que não existem em nenhuma competência => nenhuma categoria
          evaluation={baseEvaluation({ questionIds: ['nao-existe'] })}
          onComplete={onComplete}
          onBack={vi.fn()}
        />
      )
    ).not.toThrow();

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /Finalizar Avaliação/ })).toBeNull();
  });

  it('avaliação de atividades sem cargo correspondente não quebra e chama onComplete', () => {
    const onComplete = vi.fn();
    expect(() =>
      render(
        <CategoryQuestionFlow
          evaluation={baseEvaluation({
            evaluationType: 'atividades',
            roleId: 'cargo-apagado',
            questionIds: [],
          })}
          onComplete={onComplete}
          onBack={vi.fn()}
        />
      )
    ).not.toThrow();
    // Nenhuma atividade => nenhuma pergunta, mas o bloco 'activities-block' é
    // criado incondicionalmente, então a tela renderiza vazia (comportamento atual).
    expect(screen.getByText('Avaliação de Atividades')).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });

  // Regressão: `useState(evaluation.responses)` não normalizava o valor, então
  // uma avaliação legada/importada sem `responses` derrubava a tela no primeiro
  // `responses.find(...)`. As demais views já se protegiam; esta não.
  it('responses undefined não derruba CategoryQuestionFlow', () => {
    const legacy = baseEvaluation();
    delete (legacy as Partial<Evaluation>).responses;
    expect(() =>
      render(
        <CategoryQuestionFlow
          evaluation={legacy as Evaluation}
          onComplete={vi.fn()}
          onBack={vi.fn()}
        />
      )
    ).not.toThrow();
  });
});
