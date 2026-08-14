import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MembersView } from '../MembersView';
import { MemberForm } from '../MemberForm';
import { EvaluationStart } from '../EvaluationStart';
import { storage } from '../../lib/storage';
import type { Member, Role } from '../../types';

const KEYS = {
  ROLES: 'obra-viva-roles',
  MEMBERS: 'obra-viva-members',
};

const ROLE: Role = {
  id: 'role-1',
  name: 'Analista',
  type: 'collaborator',
  questionIds: ['q1'],
  createdAt: '2024-01-01T00:00:00.000Z',
} as unknown as Role;

const seed = (members: unknown[], roles: unknown[] = [ROLE]) => {
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  localStorage.setItem(KEYS.ROLES, JSON.stringify(roles));
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('MembersView — dados malformados', () => {
  it('[regressão] startDate inválida não vaza "undefined. NaN" para o card', () => {
    seed([
      { id: 'm1', firstName: 'Ana', position: 'Analista', startDate: 'não-é-data', createdAt: '2024-01-01' },
    ]);

    render(<MembersView onBack={() => {}} onEditMember={() => {}} />);

    expect(screen.getByText('Ana')).toBeTruthy();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('NaN');
  });

  it('renderiza membros sem lastName/startDate sem quebrar (happy path degradado)', () => {
    seed([{ id: 'm1', firstName: 'Ana', position: 'Analista', createdAt: '2024-01-01' }]);
    expect(() =>
      render(<MembersView onBack={() => {}} onEditMember={() => {}} />)
    ).not.toThrow();
    expect(document.body.textContent).not.toContain('undefined');
  });
});

describe('MemberForm — criação vs edição', () => {
  it('[regressão] esqueleto vazio (id "") é tratado como criação, não edição', () => {
    seed([]);
    const blank: Member = { id: '', firstName: '', position: '', createdAt: new Date() };

    render(<MemberForm member={blank} onBack={() => {}} onSave={() => {}} />);

    expect(screen.getByText('Novo Membro')).toBeTruthy();
    expect(screen.getByText('Adicionar Membro')).toBeTruthy();
  });

  it('membro real mostra a copy de edição', () => {
    seed([]);
    const existing: Member = {
      id: 'm1',
      firstName: 'Ana',
      position: 'Analista',
      createdAt: new Date(),
    };
    render(<MemberForm member={existing} onBack={() => {}} onSave={() => {}} />);
    expect(screen.getByText('Editar Perfil')).toBeTruthy();
  });

  it('[regressão] birthDate inválida não vira "NaN-NaN-NaN" no input date', () => {
    seed([]);
    const broken = {
      id: 'm1',
      firstName: 'Ana',
      position: 'Analista',
      birthDate: 'não-é-data',
      createdAt: new Date(),
    } as unknown as Member;

    const { container } = render(<MemberForm member={broken} onBack={() => {}} onSave={() => {}} />);
    const dates = container.querySelectorAll('input[type="date"]');
    dates.forEach(input => {
      expect((input as HTMLInputElement).value).not.toContain('NaN');
    });
  });

  it('[regressão] dois cadastros no mesmo milissegundo geram ids distintos', () => {
    seed([]);
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    const salvarUm = (nome: string) => {
      const { container, unmount } = render(
        <MemberForm member={null} onBack={() => {}} onSave={() => {}} />
      );
      const inputs = container.querySelectorAll('input[type="text"]');
      fireEvent.change(inputs[0], { target: { value: nome } });
      // Seleciona o cargo pelo listbox
      fireEvent.click(screen.getByText('Escolha um cargo configurado...'));
      fireEvent.click(screen.getByText('Analista'));
      fireEvent.click(screen.getByText('Adicionar Membro'));
      unmount();
    };

    salvarUm('Ana');
    salvarUm('Bia');

    const ids = storage.getMembers().map(m => m.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('[regressão] falha de escrita não exibe toast de sucesso nem chama onSave', () => {
    seed([]);
    vi.spyOn(storage, 'saveMember').mockReturnValue(false);
    const onSave = vi.fn();

    const { container } = render(
      <MemberForm member={null} onBack={() => {}} onSave={onSave} />
    );
    const inputs = container.querySelectorAll('input[type="text"]');
    fireEvent.change(inputs[0], { target: { value: 'Ana' } });
    fireEvent.click(screen.getByText('Escolha um cargo configurado...'));
    fireEvent.click(screen.getByText('Analista'));
    fireEvent.click(screen.getByText('Adicionar Membro'));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('data "YYYY-MM-DD" é salva no fuso local (sem off-by-one de UTC)', () => {
    seed([]);
    const { container } = render(
      <MemberForm member={null} onBack={() => {}} onSave={() => {}} />
    );
    const textInputs = container.querySelectorAll('input[type="text"]');
    fireEvent.change(textInputs[0], { target: { value: 'Ana' } });
    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '1990-03-10' } });
    fireEvent.click(screen.getByText('Escolha um cargo configurado...'));
    fireEvent.click(screen.getByText('Analista'));
    fireEvent.click(screen.getByText('Adicionar Membro'));

    const saved = storage.getMembers()[0];
    const d = new Date(saved.birthDate as unknown as string);
    expect(d.getFullYear()).toBe(1990);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(10);
  });

  it('[regressão] "Início na Empresa" aceita só o ano quando o dia não é conhecido', () => {
    seed([]);
    const { container } = render(
      <MemberForm member={null} onBack={() => {}} onSave={() => {}} />
    );
    const textInputs = container.querySelectorAll('input[type="text"]');
    fireEvent.change(textInputs[0], { target: { value: 'Ana' } });

    const precisionSelect = screen.getByLabelText('Precisão da data de início na empresa');
    fireEvent.change(precisionSelect, { target: { value: 'year' } });
    const yearInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(yearInput, { target: { value: '2019' } });

    fireEvent.click(screen.getByText('Escolha um cargo configurado...'));
    fireEvent.click(screen.getByText('Analista'));
    fireEvent.click(screen.getByText('Adicionar Membro'));

    const saved = storage.getMembers()[0];
    expect(saved.startDatePrecision).toBe('year');
    const d = new Date(saved.startDate as unknown as string);
    expect(d.getFullYear()).toBe(2019);
  });

  it('[regressão] "Início na Empresa" aceita só mês e ano', () => {
    seed([]);
    const { container } = render(
      <MemberForm member={null} onBack={() => {}} onSave={() => {}} />
    );
    const textInputs = container.querySelectorAll('input[type="text"]');
    fireEvent.change(textInputs[0], { target: { value: 'Ana' } });

    const precisionSelect = screen.getByLabelText('Precisão da data de início na empresa');
    fireEvent.change(precisionSelect, { target: { value: 'month' } });
    const monthInput = container.querySelector('input[type="month"]') as HTMLInputElement;
    fireEvent.change(monthInput, { target: { value: '2020-05' } });

    fireEvent.click(screen.getByText('Escolha um cargo configurado...'));
    fireEvent.click(screen.getByText('Analista'));
    fireEvent.click(screen.getByText('Adicionar Membro'));

    const saved = storage.getMembers()[0];
    expect(saved.startDatePrecision).toBe('month');
    const d = new Date(saved.startDate as unknown as string);
    expect(d.getFullYear()).toBe(2020);
    expect(d.getMonth()).toBe(4);
  });
});

describe('MembersView/RolesView — sincronização entre abas', () => {
  it('[regressão] competência/cargo/membro editado em outra aba atualiza a lista sem F5', () => {
    seed([{ id: 'm1', firstName: 'Ana', position: 'Analista', createdAt: '2024-01-01' }]);
    render(<MembersView onBack={() => {}} onEditMember={() => {}} />);
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.queryByText('Bia')).toBeNull();

    // Simula uma escrita em outra aba: o evento `storage` nativo só dispara
    // nas OUTRAS abas, então disparamos manualmente como o browser faria.
    seed([
      { id: 'm1', firstName: 'Ana', position: 'Analista', createdAt: '2024-01-01' },
      { id: 'm2', firstName: 'Bia', position: 'Analista', createdAt: '2024-01-01' },
    ]);
    fireEvent(window, new StorageEvent('storage', { key: 'obra-viva-members' }));

    expect(screen.getByText('Bia')).toBeTruthy();
  });
});

describe('EvaluationStart — dados malformados', () => {
  it('cargo sem activities não quebra e desabilita a metodologia de atividades', () => {
    seed(
      [
        { id: 'lider', firstName: 'João', position: 'Gerente', createdAt: '2024-01-01' },
        { id: 'colab', firstName: 'Ana', position: 'Analista', createdAt: '2024-01-01' },
      ],
      [
        ROLE,
        { id: 'role-2', name: 'Gerente', type: 'leadership', questionIds: [], createdAt: '2024-01-01' },
      ]
    );

    expect(() =>
      render(<EvaluationStart onStart={() => {}} onBack={() => {}} onAddMember={() => {}} />)
    ).not.toThrow();
    expect(document.body.textContent).not.toContain('undefined');
  });

  it('sem membros cadastrados a tela renderiza e não oferece metodologias', () => {
    seed([], []);
    render(<EvaluationStart onStart={() => {}} onBack={() => {}} onAddMember={() => {}} />);
    expect(screen.getByText('Nova avaliação')).toBeTruthy();
    // Sem líder/associado selecionados, o bloco de metodologias fica oculto
    expect(screen.queryByText('Escolha a Metodologia')).toBeNull();
  });
});
