/**
 * Navegação por teclado nos cards clicáveis.
 *
 * Contexto: em todo o app os alvos de navegação eram `<div onClick>` sem
 * role/tabIndex/handler de tecla. Na etapa "Escolha a Metodologia" isso tornava
 * o fluxo IMPOSSÍVEL de concluir sem mouse. Estes testes travam o contrato:
 * foco por Tab, ativação por Enter e por Espaço (sem rolar a página), botões
 * aninhados que não disparam o card, e estado do grupo de metodologia.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Card } from '../DesignSystem';
import { MembersView } from '../MembersView';
import { TeamGallery } from '../TeamGallery';
import { EvaluationStart } from '../EvaluationStart';
import type { Role } from '../../types';

vi.mock('../../lib/pdfExport', () => ({ exportToPDF: vi.fn() }));

const KEYS = {
  ROLES: 'obra-viva-roles',
  MEMBERS: 'obra-viva-members',
  EVALUATIONS: 'obra-viva-evaluations',
};

const COLLAB_ROLE = {
  id: 'role-collab',
  name: 'Analista',
  type: 'collaborator',
  questionIds: ['q1'],
  activities: [{ id: 'a1', name: 'Entrega X' }],
  createdAt: '2024-01-01T00:00:00.000Z',
} as unknown as Role;

const LEADER_ROLE = {
  id: 'role-leader',
  name: 'Gestor',
  type: 'leadership',
  questionIds: ['q1'],
  createdAt: '2024-01-01T00:00:00.000Z',
} as unknown as Role;

const MEMBERS = [
  { id: 'm-leader', firstName: 'Bruna', lastName: 'Lima', position: 'Gestor', createdAt: '2024-01-01' },
  { id: 'm-collab', firstName: 'Ana', lastName: 'Souza', position: 'Analista', createdAt: '2024-01-01' },
];

const seed = () => {
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify(MEMBERS));
  localStorage.setItem(KEYS.ROLES, JSON.stringify([LEADER_ROLE, COLLAB_ROLE]));
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

/** Escolhe uma opção num AccessibleSelect pelo rótulo do gatilho. */
const pickOption = (triggerName: RegExp, optionName: RegExp) => {
  fireEvent.click(screen.getByRole('button', { name: triggerName }));
  fireEvent.click(screen.getByRole('option', { name: optionName }));
};

/** Leva a EvaluationStart até a etapa "Escolha a Metodologia". */
const renderUntilMethodology = (onStart = vi.fn()) => {
  seed();
  render(<EvaluationStart onStart={onStart} onBack={() => {}} onAddMember={() => {}} />);
  pickOption(/Escolha o Líder/i, /Bruna Lima/i);
  pickOption(/Cargo em Avaliação/i, /^Analista/i);
  pickOption(/Escolha a Pessoa/i, /Ana Souza/i);
  return onStart;
};

// ---------------------------------------------------------------------------
// Card (DesignSystem) — a correção de raiz
// ---------------------------------------------------------------------------

describe('Card interactive — semântica de botão', () => {
  it('é alcançável por Tab e se anuncia como botão', () => {
    render(
      <>
        <button>antes</button>
        <Card interactive onClick={() => {}}>Conteúdo</Card>
      </>,
    );
    const card = screen.getByRole('button', { name: 'Conteúdo' });
    expect(card.tabIndex).toBe(0);

    screen.getByRole('button', { name: 'antes' }).focus();
    card.focus(); // jsdom não implementa Tab; tabIndex=0 é o que o torna focável
    expect(document.activeElement).toBe(card);
  });

  it('Enter aciona o card', () => {
    const onClick = vi.fn();
    render(<Card interactive onClick={onClick}>Conteúdo</Card>);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Conteúdo' }), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Espaço aciona o card E impede o scroll da página (preventDefault)', () => {
    const onClick = vi.fn();
    render(<Card interactive onClick={onClick}>Conteúdo</Card>);
    const card = screen.getByRole('button', { name: 'Conteúdo' });

    // fireEvent devolve false quando o handler chamou preventDefault.
    const notPrevented = fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(notPrevented).toBe(false);
  });

  it('card não-interativo continua sem role nem tabIndex (nada regrediu)', () => {
    render(<Card>Estático</Card>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Estático').getAttribute('tabindex')).toBeNull();
  });

  it('botão aninhado não dispara o handler do card (clique)', () => {
    const onCard = vi.fn();
    const onNested = vi.fn();
    render(
      <Card interactive onClick={onCard} aria-label="card">
        <button onClick={onNested}>excluir</button>
      </Card>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'excluir' }));
    expect(onNested).toHaveBeenCalledTimes(1);
    expect(onCard).not.toHaveBeenCalled();
  });

  it('Enter num botão aninhado não dispara o handler do card (teclado)', () => {
    const onCard = vi.fn();
    render(
      <Card interactive onClick={onCard} aria-label="card">
        <button>excluir</button>
      </Card>,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: 'excluir' }), { key: 'Enter', bubbles: true });
    expect(onCard).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// EvaluationStart — o caso bloqueante
// ---------------------------------------------------------------------------

describe('EvaluationStart — grupo de metodologia', () => {
  it('expõe radiogroup com três radios e estado não selecionado', () => {
    renderUntilMethodology();
    const group = screen.getByRole('radiogroup', { name: /Metodologia/i });
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(3);
    radios.forEach(r => expect(r.getAttribute('aria-checked')).toBe('false'));
  });

  it('o grupo é uma única parada de Tab (tabindex rotativo)', () => {
    renderUntilMethodology();
    const radios = screen.getAllByRole('radio');
    expect(radios.map(r => r.tabIndex)).toEqual([0, -1, -1]);
  });

  it('Enter no card Dialógica inicia a avaliação', () => {
    const onStart = renderUntilMethodology();
    const dialogica = screen.getAllByRole('radio')[0];
    dialogica.focus();
    expect(document.activeElement).toBe(dialogica);

    fireEvent.keyDown(dialogica, { key: 'Enter' });
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][3]).toBe('dialogica');
  });

  it('Espaço no card Tradicional inicia a avaliação sem rolar a página', () => {
    const onStart = renderUntilMethodology();
    const tradicional = screen.getAllByRole('radio')[1];
    const notPrevented = fireEvent.keyDown(tradicional, { key: ' ', code: 'Space' });
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][3]).toBe('tradicional');
    expect(notPrevented).toBe(false);
  });

  it('marca aria-checked na metodologia escolhida', () => {
    renderUntilMethodology();
    const radios = screen.getAllByRole('radio');
    fireEvent.keyDown(radios[1], { key: 'Enter' });
    expect(screen.getAllByRole('radio')[1].getAttribute('aria-checked')).toBe('true');
    expect(screen.getAllByRole('radio')[0].getAttribute('aria-checked')).toBe('false');
  });

  it('setas movem o foco dentro do grupo sem iniciar nada', () => {
    const onStart = renderUntilMethodology();
    const radios = screen.getAllByRole('radio');
    radios[0].focus();
    fireEvent.keyDown(radios[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getAllByRole('radio')[1]);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('Atividades sem atividades cadastradas fica fora da ordem de foco e não inicia', () => {
    const onStart = vi.fn();
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(MEMBERS));
    localStorage.setItem(
      KEYS.ROLES,
      JSON.stringify([LEADER_ROLE, { ...COLLAB_ROLE, activities: [] }]),
    );
    render(<EvaluationStart onStart={onStart} onBack={() => {}} onAddMember={() => {}} />);
    pickOption(/Escolha o Líder/i, /Bruna Lima/i);
    pickOption(/Cargo em Avaliação/i, /^Analista/i);
    pickOption(/Escolha a Pessoa/i, /Ana Souza/i);

    const atividades = screen.getAllByRole('radio')[2];
    expect(atividades.tabIndex).toBe(-1);
    expect(atividades.getAttribute('aria-disabled')).toBe('true');
    fireEvent.keyDown(atividades, { key: 'Enter' });
    expect(onStart).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// MembersView
// ---------------------------------------------------------------------------

describe('MembersView — cards de membro', () => {
  const renderMembers = () => {
    seed();
    const onViewMember = vi.fn();
    const onEditMember = vi.fn();
    render(<MembersView onBack={() => {}} onViewMember={onViewMember} onEditMember={onEditMember} />);
    return { onViewMember, onEditMember };
  };

  it('cada card é focável e Enter abre o perfil', () => {
    const { onViewMember } = renderMembers();
    const card = screen.getByRole('button', { name: /Ver perfil de Ana Souza/i });
    expect(card.tabIndex).toBe(0);
    card.focus();
    expect(document.activeElement).toBe(card);

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onViewMember).toHaveBeenCalledWith('m-collab');
  });

  it('Espaço abre o perfil sem rolar a página', () => {
    const { onViewMember } = renderMembers();
    const card = screen.getByRole('button', { name: /Ver perfil de Ana Souza/i });
    const notPrevented = fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(onViewMember).toHaveBeenCalledTimes(1);
    expect(notPrevented).toBe(false);
  });

  it('os botões Editar/Excluir permanecem alcançáveis e não disparam o card', () => {
    const { onViewMember, onEditMember } = renderMembers();
    const editar = screen.getByRole('button', { name: /Editar Ana Souza/i });
    expect(editar.tabIndex).toBe(0);

    fireEvent.click(editar);
    expect(onEditMember).toHaveBeenCalledTimes(1);
    expect(onViewMember).not.toHaveBeenCalled();

    fireEvent.keyDown(editar, { key: 'Enter', bubbles: true });
    expect(onViewMember).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// TeamGallery
// ---------------------------------------------------------------------------

describe('TeamGallery — cards de avaliação', () => {
  const WORK = {
    id: 'w1',
    roleId: COLLAB_ROLE.id,
    roleName: 'Analista',
    leaderId: 'm-leader',
    leaderName: 'Bruna Lima',
    collaboratorId: 'm-collab',
    collaboratorName: 'Ana Souza',
    responses: [],
    questionIds: [],
    createdAt: '2024-05-01T12:00:00.000Z',
    completed: true,
    evaluationType: 'tradicional',
  };

  const renderGallery = () => {
    seed();
    localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([WORK]));
    const onViewWork = vi.fn();
    render(<TeamGallery onBack={() => {}} onViewWork={onViewWork} onStartEvaluation={() => {}} />);
    return onViewWork;
  };

  it('o card é focável e Enter abre a avaliação', () => {
    const onViewWork = renderGallery();
    const card = screen.getByRole('button', { name: /Ver avaliação de Ana Souza/i });
    expect(card.tabIndex).toBe(0);
    card.focus();
    expect(document.activeElement).toBe(card);

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onViewWork).toHaveBeenCalledTimes(1);
  });

  it('Espaço abre a avaliação sem rolar a página', () => {
    const onViewWork = renderGallery();
    const card = screen.getByRole('button', { name: /Ver avaliação de Ana Souza/i });
    const notPrevented = fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(onViewWork).toHaveBeenCalledTimes(1);
    expect(notPrevented).toBe(false);
  });

  it('os botões PDF/Excluir são alcançáveis e não disparam o card', () => {
    const onViewWork = renderGallery();
    const pdf = screen.getByRole('button', { name: /Exportar PDF/i });
    expect(pdf.tabIndex).toBe(0);
    fireEvent.click(pdf);
    expect(onViewWork).not.toHaveBeenCalled();

    fireEvent.keyDown(pdf, { key: ' ', code: 'Space', bubbles: true });
    expect(onViewWork).not.toHaveBeenCalled();

    expect(screen.getByRole('button', { name: /Excluir avaliação de Ana Souza/i })).toBeTruthy();
  });
});
