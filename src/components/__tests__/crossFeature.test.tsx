import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { CategoryQuestionFlow } from '../CategoryQuestionFlow';
import { WorkDetail } from '../WorkDetail';
import type { Competency, Evaluation, Role, SavedWork } from '../../types';

const KEYS = {
  ROLES: 'obra-viva-roles',
  MEMBERS: 'obra-viva-members',
  COMPETENCIES: 'obra-viva-competencies',
  COMPETENCIES_INITIALIZED: 'obra-viva-competencies-initialized',
  COMPETENCIES_VERSION: 'obra-viva-competencies-version',
  EVALUATIONS: 'obra-viva-evaluations',
  INITIALIZED: 'obra-viva-initialized',
  LIBRARY_INITIALIZED: 'obra-viva-library-initialized',
};

function freezeSeeds() {
  localStorage.setItem(KEYS.INITIALIZED, 'true');
  localStorage.setItem(KEYS.LIBRARY_INITIALIZED, 'true');
  localStorage.setItem(KEYS.COMPETENCIES_INITIALIZED, 'true');
  localStorage.setItem(KEYS.COMPETENCIES_VERSION, '1.4');
}

// Espelha a forma dos dados semeados: uma competência tem perguntas
// `statement` E uma `dialogic`, e o cargo referencia TODAS elas
// (defaultRoles empurra competency.questions inteiro em questionIds).
const COMPETENCIES: Competency[] = [
  {
    id: 'comp-1',
    name: 'Execução',
    categoryId: 'bloco1',
    order: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    questions: [
      { id: 'q1', categoryId: 'bloco1', text: 'Entrega no prazo?', order: 1, type: 'statement' },
      { id: 'q1-dial', categoryId: 'bloco1', text: 'Como foi sua entrega?', order: 2, type: 'dialogic' },
    ],
  },
  {
    id: 'comp-2',
    name: 'Técnica',
    categoryId: 'bloco2',
    order: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    questions: [
      // Bloco SEM pergunta dialógica: numa avaliação dialógica esta seção
      // não tem nada para mostrar.
      { id: 'q2', categoryId: 'bloco2', text: 'Resolve problemas?', order: 1, type: 'statement' },
    ],
  },
];

const ROLE: Role = {
  id: 'role-1',
  name: 'Analista',
  type: 'collaborator',
  questionIds: ['q1', 'q1-dial', 'q2'],
  activities: [{ id: 'a1', text: 'Fechar o caixa diário', order: 1 }],
  createdAt: '2024-01-01T00:00:00.000Z',
};

const baseEvaluation = (over: Partial<Evaluation> = {}): Evaluation => ({
  id: 'ev-1',
  roleId: 'role-1',
  roleName: 'Analista',
  leaderId: 'm-leader',
  collaboratorId: 'm-collab',
  leaderName: 'Líder',
  collaboratorName: 'Maria',
  responses: [],
  questionIds: ['q1', 'q1-dial', 'q2'],
  createdAt: '2024-05-01T12:00:00.000Z',
  completed: false,
  evaluationType: 'tradicional',
  ...over,
});

beforeEach(() => {
  localStorage.clear();
  freezeSeeds();
  localStorage.setItem(KEYS.ROLES, JSON.stringify([ROLE]));
  localStorage.setItem(KEYS.COMPETENCIES, JSON.stringify(COMPETENCIES));
  localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([]));
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify([]));
});

// O filtro de renderização (linha ~174) esconde as perguntas do outro tipo,
// mas handleSaveAndMove percorre `categoryQuestions` NÃO filtrado: toda
// pergunta escondida é gravada com nota 1 sem que ninguém a tenha visto.
// Regressão: o filtro por tipo de avaliação só existia no render, então o
// salvamento gravava resposta (nota 1) para pergunta que o líder nunca viu.
// Agora o filtro vale na origem, em getQuestions.
describe('CategoryQuestionFlow — respostas fantasma por tipo de avaliação', () => {
  it('avaliação dialógica não grava respostas para perguntas statement invisíveis', () => {
    const onComplete = vi.fn();
    render(
      <CategoryQuestionFlow
        evaluation={baseEvaluation({ evaluationType: 'dialogica' })}
        onComplete={onComplete}
        onBack={vi.fn()}
      />
    );

    // Só a dialógica está na tela.
    expect(screen.getByText('Como foi sua entrega?')).toBeInTheDocument();
    expect(screen.queryByText('Entrega no prazo?')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Próxima Seção|Finalizar Avaliação/ }));

    const respostas = (onComplete.mock.calls[0]?.[0] as Evaluation | undefined)?.responses
      ?? JSON.parse(localStorage.getItem('obra-viva-current-evaluation') || '{}').responses;

    expect(respostas.map((r: { questionId: string }) => r.questionId)).not.toContain('q1');
  });

  it('avaliação tradicional não grava respostas para perguntas dialógicas invisíveis', () => {
    render(
      <CategoryQuestionFlow
        evaluation={baseEvaluation({ evaluationType: 'tradicional' })}
        onComplete={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText('Entrega no prazo?')).toBeInTheDocument();
    expect(screen.queryByText('Como foi sua entrega?')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Próxima Seção/ }));

    const salvo = JSON.parse(localStorage.getItem('obra-viva-current-evaluation') || '{}');
    expect(salvo.responses.map((r: { questionId: string }) => r.questionId)).not.toContain('q1-dial');
  });

  it('dialógica: seções sem nenhuma pergunta dialógica não viram etapa vazia', () => {
    render(
      <CategoryQuestionFlow
        evaluation={baseEvaluation({ evaluationType: 'dialogica' })}
        onComplete={vi.fn()}
        onBack={vi.fn()}
      />
    );

    // bloco2 só tem statement: a contagem de etapas não deveria incluí-lo.
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
  });
});

// Interação entre features: excluir o cargo que uma avaliação salva referencia.
describe('WorkDetail — cargo excluído depois da avaliação', () => {
  const work = (over: Partial<SavedWork> = {}): SavedWork => ({
    ...baseEvaluation(),
    completed: true,
    assembledElements: [],
    ...over,
  }) as SavedWork;

  it('avaliação de ATIVIDADES sobrevive à exclusão do cargo', () => {
    localStorage.setItem(KEYS.ROLES, JSON.stringify([])); // cargo excluído
    render(
      <WorkDetail
        work={work({
          evaluationType: 'atividades',
          questionIds: ['a1'],
          responses: [
            { questionId: 'a1', keywords: ['ok', '', ''], rating: 5, selectedElementId: 'foundation-5', selectedImageIndex: 4 },
          ],
        })}
        onBack={vi.fn()}
        onViewAssembly={vi.fn()}
      />
    );

    // A nota 5 foi respondida e persistida; a tela não pode reportar 0
    // perguntas nem média 0.0 só porque o cargo sumiu.
    const total = screen.getByText('Total de Perguntas').parentElement!;
    expect(total.textContent).not.toMatch(/Total de Perguntas0$/);
    expect(screen.queryByText('0.0')).toBeNull();
  });

  it('avaliação tradicional sobrevive à exclusão do líder', () => {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify([]));
    expect(() =>
      render(
        <WorkDetail
          work={work({
            responses: [
              { questionId: 'q1', keywords: ['', '', ''], rating: 4, selectedElementId: 'foundation-4', selectedImageIndex: 3 },
            ],
          })}
          onBack={vi.fn()}
          onViewAssembly={vi.fn()}
        />
      )
    ).not.toThrow();
    expect(screen.getAllByText(/Líder/).length).toBeGreaterThan(0);
  });
});
