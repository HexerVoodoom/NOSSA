import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamGallery } from '../TeamGallery';
import { WorkDetail } from '../WorkDetail';
import { ConstructionPreview } from '../ConstructionPreview';
import { AssemblyViewReadOnly } from '../AssemblyViewReadOnly';
import type { Competency, Role, SavedWork } from '../../types';

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
      { id: 'q2', categoryId: 'bloco2', text: 'Resolve problemas?', order: 1, type: 'statement' },
    ],
  },
];

const ROLE: Role = {
  id: 'role-1',
  name: 'Analista',
  type: 'collaborator',
  questionIds: ['q1', 'q1-dial', 'q2'],
  createdAt: '2024-01-01T00:00:00.000Z',
};

// bloco1 = 1.0 (só q1 conta; a dialógica nota 5 é de outro tipo de avaliação)
// bloco2 = 5.0  =>  média das médias = 3.0
// A média simples que a galeria fazia antes daria (1+5+5)/3 = 3.7.
const WORK: SavedWork = {
  id: 'ev-1',
  roleId: 'role-1',
  roleName: 'Analista',
  leaderId: 'm-leader',
  collaboratorId: 'm-collab',
  leaderName: 'Líder',
  collaboratorName: 'Maria',
  questionIds: ['q1', 'q1-dial', 'q2'],
  responses: [
    { questionId: 'q1', keywords: ['', '', ''], rating: 1, selectedElementId: 'foundation-1', selectedImageIndex: 0 },
    { questionId: 'q1-dial', keywords: ['', '', ''], rating: 5, selectedElementId: 'foundation-5', selectedImageIndex: 4 },
    { questionId: 'q2', keywords: ['', '', ''], rating: 5, selectedElementId: 'structure-5', selectedImageIndex: 4 },
  ],
  createdAt: '2024-05-01T12:00:00.000Z',
  completed: true,
  evaluationType: 'tradicional',
  assembledElements: [],
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(KEYS.INITIALIZED, 'true');
  localStorage.setItem(KEYS.LIBRARY_INITIALIZED, 'true');
  localStorage.setItem(KEYS.COMPETENCIES_INITIALIZED, 'true');
  localStorage.setItem(KEYS.COMPETENCIES_VERSION, '1.4');
  localStorage.setItem(KEYS.ROLES, JSON.stringify([ROLE]));
  localStorage.setItem(KEYS.COMPETENCIES, JSON.stringify(COMPETENCIES));
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify([]));
  localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([WORK]));
});

describe('Média única entre galeria e detalhe', () => {
  it('[regressão] o card da galeria mostra a MESMA média da tela de detalhe', () => {
    const { unmount } = render(
      <TeamGallery onBack={vi.fn()} onViewWork={vi.fn()} onStartEvaluation={vi.fn()} />
    );
    const cardMedia = screen.getByText('Média').previousElementSibling!.textContent;
    unmount();

    render(<WorkDetail work={WORK} onBack={vi.fn()} onViewAssembly={vi.fn()} />);
    const detalheMedia = screen.getByText('Média Geral')
      .closest('div')!.parentElement!
      .querySelector('.text-6xl')!.textContent;

    expect(cardMedia).toBe(detalheMedia);
    // Semântica autoritativa: média das médias por bloco, filtrando por tipo.
    expect(cardMedia).toBe('3.0');
    // A média simples de todas as respostas gravadas (o bug) daria 3.7.
    expect(cardMedia).not.toBe('3.7');
  });

  it('avaliação sem respostas mostra "---" no card, nunca NaN', () => {
    localStorage.setItem(
      KEYS.EVALUATIONS,
      JSON.stringify([{ ...WORK, responses: [] }])
    );
    render(<TeamGallery onBack={vi.fn()} onViewWork={vi.fn()} onStartEvaluation={vi.fn()} />);
    expect(screen.getByText('Média').previousElementSibling!.textContent).toBe('---');
    expect(screen.queryByText(/NaN/)).toBeNull();
  });
});

// Registro histórico corrompido: nota 4 gravada junto do elemento da nota 1.
// defaultLibrary.json tem 11 casos assim em 142 respostas.
const WORK_CORROMPIDO: SavedWork = {
  ...WORK,
  responses: [
    { questionId: 'q1', keywords: ['', '', ''], rating: 4, selectedElementId: 'foundation-1', selectedImageIndex: 0 },
  ],
  assembledElements: [],
};

describe('selectedElementId gravado é tratado como não confiável', () => {
  it('[regressão] ConstructionPreview deriva a forma da NOTA (4 => foundation-4)', () => {
    render(
      <ConstructionPreview
        evaluation={WORK_CORROMPIDO}
        onBack={vi.fn()}
        onCreateBuilding={vi.fn()}
      />
    );
    expect(screen.getByText('foundation-4')).toBeInTheDocument();
    expect(screen.queryByText('foundation-1')).toBeNull();
  });

  it('[regressão] AssemblyViewReadOnly desenha a forma da NOTA (4 => foundation-4)', () => {
    const { container } = render(
      <AssemblyViewReadOnly work={WORK_CORROMPIDO} onBack={vi.fn()} />
    );
    const desenhados = Array.from(container.querySelectorAll('[data-obra-element]'))
      .map(n => n.getAttribute('data-obra-element'));
    expect(desenhados).toContain('foundation-4');
    expect(desenhados).not.toContain('foundation-1');
  });
});
