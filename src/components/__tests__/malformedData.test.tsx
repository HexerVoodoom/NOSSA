import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkDetail } from '../WorkDetail';
import { TeamGallery } from '../TeamGallery';
import { MemberDetail } from '../MemberDetail';
import type { Member, Role, SavedWork } from '../../types';

const KEYS = {
  ROLES: 'obra-viva-roles',
  EVALUATIONS: 'obra-viva-evaluations',
  MEMBERS: 'obra-viva-members',
  COMPETENCIES: 'obra-viva-competencies',
  COMPETENCIES_INITIALIZED: 'obra-viva-competencies-initialized',
  COMPETENCIES_VERSION: 'obra-viva-competencies-version',
  INITIALIZED: 'obra-viva-initialized',
  LIBRARY_INITIALIZED: 'obra-viva-library-initialized',
};

const ROLE: Role = {
  id: 'role-1',
  name: 'Analista',
  type: 'collaborator',
  questionIds: ['q1'],
  activities: [{ id: 'a1', text: 'Fechar o caixa', order: 1 }],
  createdAt: '2024-01-01T00:00:00.000Z',
};

const MEMBER: Member = {
  id: 'm-collab',
  firstName: 'Maria',
  lastName: 'Silva',
  position: 'Analista',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const COMPETENCIES = [
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
];

/** Avaliação "boa" da qual derivamos as variantes corrompidas. */
const makeWork = (over: Partial<SavedWork> = {}): SavedWork =>
  ({
    id: 'ev-1',
    roleId: 'role-1',
    roleName: 'Analista',
    leaderId: 'm-leader',
    collaboratorId: 'm-collab',
    leaderName: 'João',
    collaboratorName: 'Maria Silva',
    responses: [
      { questionId: 'q1', keywords: ['foco', '', ''], rating: 4, selectedElementId: 'foundation-4' },
    ],
    questionIds: ['q1'],
    createdAt: '2024-05-01T12:00:00.000Z',
    completed: true,
    evaluationType: 'tradicional',
    ...over,
  }) as SavedWork;

/**
 * Casos que reproduzem dados reais corrompidos/legados no localStorage.
 * Cada um já derrubou (ou poluiu) alguma tela antes das correções.
 */
const MALFORMED: Array<[string, SavedWork]> = [
  ['responses undefined', makeWork({ responses: undefined as unknown as SavedWork['responses'] })],
  ['responses vazias', makeWork({ responses: [] })],
  [
    'keywords undefined na resposta',
    makeWork({
      responses: [
        { questionId: 'q1', rating: 3, selectedElementId: '' } as unknown as SavedWork['responses'][0],
      ],
    }),
  ],
  ['createdAt ausente', makeWork({ createdAt: undefined as unknown as string })],
  ['createdAt inválida', makeWork({ createdAt: 'não-é-data' })],
  ['roleId de cargo apagado', makeWork({ roleId: 'cargo-apagado', roleName: '' })],
  [
    'collaboratorId de membro apagado',
    makeWork({ collaboratorId: 'membro-apagado', collaboratorName: '' }),
  ],
];

/** Nenhuma tela pode vazar essas strings para o usuário. */
function expectNoGarbage(container: HTMLElement) {
  const text = container.textContent ?? '';
  expect(text).not.toMatch(/NaN/);
  expect(text).not.toMatch(/Invalid Date/);
  expect(text).not.toMatch(/undefined/);
}

beforeEach(() => {
  localStorage.setItem(KEYS.INITIALIZED, 'true');
  localStorage.setItem(KEYS.LIBRARY_INITIALIZED, 'true');
  localStorage.setItem(KEYS.COMPETENCIES_INITIALIZED, 'true');
  localStorage.setItem(KEYS.COMPETENCIES_VERSION, '1.4');
  localStorage.setItem(KEYS.ROLES, JSON.stringify([ROLE]));
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify([MEMBER]));
  localStorage.setItem(KEYS.COMPETENCIES, JSON.stringify(COMPETENCIES));
  localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([]));
});

// ---------------------------------------------------------------------------
describe('WorkDetail — resistência a dados malformados', () => {
  it.each(MALFORMED)('renderiza sem quebrar: %s', (_label, work) => {
    const { container } = render(<WorkDetail work={work} onBack={vi.fn()} />);
    expectNoGarbage(container);
  });

  it('avaliação sem respostas não exibe NaN na média geral', () => {
    const { container } = render(<WorkDetail work={makeWork({ responses: [] })} onBack={vi.fn()} />);
    expect(screen.getByText('0.0')).toBeInTheDocument();
    expectNoGarbage(container);
  });

  it('createdAt inválida vira "---" em vez de "Invalid Date"', () => {
    const { container } = render(
      <WorkDetail work={makeWork({ createdAt: 'não-é-data' })} onBack={vi.fn()} />
    );
    expect(container.textContent).toContain('---');
    expectNoGarbage(container);
  });
});

// ---------------------------------------------------------------------------
describe('TeamGallery — resistência a dados malformados', () => {
  it.each(MALFORMED)('renderiza sem quebrar: %s', (_label, work) => {
    localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([work]));
    const { container } = render(
      <TeamGallery onBack={vi.fn()} onViewWork={vi.fn()} onStartEvaluation={vi.fn()} />
    );
    expectNoGarbage(container);
  });

  it('card de avaliação sem respostas mostra "---" no lugar da média NaN', () => {
    localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([makeWork({ responses: [] })]));
    const { container } = render(
      <TeamGallery onBack={vi.fn()} onViewWork={vi.fn()} onStartEvaluation={vi.fn()} />
    );
    expect(screen.getByText('Média')).toBeInTheDocument();
    expect(container.textContent).toContain('---');
    expectNoGarbage(container);
  });

  it('ordena avaliações com createdAt inválida sem quebrar a lista', () => {
    localStorage.setItem(
      KEYS.EVALUATIONS,
      JSON.stringify([
        makeWork({ id: 'a', createdAt: 'lixo' }),
        makeWork({ id: 'b', createdAt: '2024-05-01T12:00:00.000Z' }),
        makeWork({ id: 'c', createdAt: undefined as unknown as string }),
      ])
    );
    const { container } = render(
      <TeamGallery onBack={vi.fn()} onViewWork={vi.fn()} onStartEvaluation={vi.fn()} />
    );
    // Três cards renderizados, e a data válida aparece formatada em pt-BR.
    expect(screen.getAllByText('Média')).toHaveLength(3);
    expect(container.textContent).toContain('01/05/2024');
    expectNoGarbage(container);
  });

  it('avaliações incompletas não aparecem na galeria', () => {
    localStorage.setItem(
      KEYS.EVALUATIONS,
      JSON.stringify([makeWork({ id: 'x', completed: false })])
    );
    render(<TeamGallery onBack={vi.fn()} onViewWork={vi.fn()} onStartEvaluation={vi.fn()} />);
    expect(screen.getByText('Nenhuma avaliação encontrada')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
describe('MemberDetail — resistência a dados malformados', () => {
  it.each(MALFORMED)('renderiza sem quebrar: %s', (_label, work) => {
    localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([work]));
    const { container } = render(
      <MemberDetail
        memberId="m-collab"
        onBack={vi.fn()}
        onEditMember={vi.fn()}
        onViewWork={vi.fn()}
      />
    );
    expectNoGarbage(container);
  });

  it('membro sem startDate/birthDate não exibe NaN nem Invalid Date', () => {
    localStorage.setItem(
      KEYS.MEMBERS,
      JSON.stringify([{ id: 'm-collab', firstName: 'Maria', position: 'Analista' }])
    );
    const { container } = render(
      <MemberDetail
        memberId="m-collab"
        onBack={vi.fn()}
        onEditMember={vi.fn()}
        onViewWork={vi.fn()}
      />
    );
    expectNoGarbage(container);
    expect(container.textContent).toContain('---');
  });

  it('datas inválidas em startDate/birthDate degradam para "---"', () => {
    localStorage.setItem(
      KEYS.MEMBERS,
      JSON.stringify([
        {
          id: 'm-collab',
          firstName: 'Maria',
          position: 'Analista',
          startDate: 'lixo',
          birthDate: 'lixo',
          createdAt: 'lixo',
        },
      ])
    );
    const { container } = render(
      <MemberDetail
        memberId="m-collab"
        onBack={vi.fn()}
        onEditMember={vi.fn()}
        onViewWork={vi.fn()}
      />
    );
    expectNoGarbage(container);
  });

  it('data de início no futuro não vira tempo de casa negativo', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 400).toISOString();
    localStorage.setItem(
      KEYS.MEMBERS,
      JSON.stringify([
        { id: 'm-collab', firstName: 'Maria', position: 'Analista', startDate: future },
      ])
    );
    const { container } = render(
      <MemberDetail
        memberId="m-collab"
        onBack={vi.fn()}
        onEditMember={vi.fn()}
        onViewWork={vi.fn()}
      />
    );
    expect(container.textContent).not.toMatch(/-\d+\s+(ano|mes)/);
    expect(container.textContent).toContain('0 meses');
    expectNoGarbage(container);
  });

  it('autoavaliação (líder = associado) não duplica keys nem some do histórico', () => {
    localStorage.setItem(
      KEYS.EVALUATIONS,
      JSON.stringify([makeWork({ id: 'self', leaderId: 'm-collab', collaboratorId: 'm-collab' })])
    );
    const { container } = render(
      <MemberDetail
        memberId="m-collab"
        onBack={vi.fn()}
        onEditMember={vi.fn()}
        onViewWork={vi.fn()}
      />
    );
    // Aparece uma única vez, como "recebida".
    expect(screen.getAllByText(/Avaliado por/)).toHaveLength(1);
    expect(screen.queryByText(/^Avaliou/)).toBeNull();
    expectNoGarbage(container);
  });

  it('membro inexistente mostra estado vazio em vez de quebrar', () => {
    render(
      <MemberDetail
        memberId="nao-existe"
        onBack={vi.fn()}
        onEditMember={vi.fn()}
        onViewWork={vi.fn()}
      />
    );
    expect(screen.getByText('Membro não encontrado')).toBeInTheDocument();
  });
});
