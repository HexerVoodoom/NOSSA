import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssemblyViewReadOnly, hexToRgb, formatDate } from '../AssemblyViewReadOnly';
import { normalizeCategoryId } from '../../lib/categoryShapes';
import { DiamondMesh } from '../DiamondMesh';
import { ElementRenderer } from '../ElementRenderer';
import type { SavedWork, AssembledElement } from '../../types';

// Obra legada: sem assembledElements e com categorias reais ('bloco*').
// Antes da correção, a montagem automática fazia
// `elementsByCategory['bloco1'].push(...)` em um mapa que só tinha 'cat1'..'cat6'
// => TypeError e tela em branco.
const LEGACY_WORK: SavedWork = {
  id: 'ev-1',
  roleId: 'role-1',
  roleName: 'Analista',
  leaderId: 'l1',
  collaboratorId: 'c1',
  leaderName: 'Líder',
  collaboratorName: 'Associado',
  questionIds: ['q-b1-agilidade-1'],
  responses: [
    {
      questionId: 'q-b1-agilidade-1',
      keywords: ['a', 'b', 'c'],
      rating: 3,
      selectedElementId: 'foundation-3',
      selectedImageIndex: 2,
    },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  completed: true,
};

describe('AssemblyViewReadOnly — helpers', () => {
  it('hexToRgb aceita 6 dígitos, 3 dígitos e cai no padrão em valores inválidos', () => {
    expect(hexToRgb('#6155f5')).toEqual({ r: 97, g: 85, b: 245 });
    expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    // [regressão] parseInt(hex.slice(...)) produzia NaN e corrompia o PDF
    for (const bad of [undefined, null, '', 'rebeccapurple', '#12', '#zzzzzz']) {
      const rgb = hexToRgb(bad as string | undefined);
      expect(Number.isNaN(rgb.r) || Number.isNaN(rgb.g) || Number.isNaN(rgb.b)).toBe(false);
      expect(rgb).toEqual({ r: 97, g: 85, b: 245 });
    }
  });

  it('normalizeCategoryId traduz ids legados e desconhecidos', () => {
    expect(normalizeCategoryId('bloco3')).toBe('bloco3');
    expect(normalizeCategoryId('cat3')).toBe('bloco3');
    expect(normalizeCategoryId(undefined)).toBe('bloco1');
    expect(normalizeCategoryId('inexistente')).toBe('bloco1');
  });

  it('formatDate não exibe "Invalid Date"', () => {
    expect(formatDate('2024-01-01T00:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(formatDate('não-é-data')).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });
});

describe('AssemblyViewReadOnly — renderização', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('[regressão] renderiza obra legada sem assembledElements', () => {
    render(<AssemblyViewReadOnly work={LEGACY_WORK} onBack={() => {}} />);
    expect(screen.getByText('Obra Montada')).toBeInTheDocument();
    expect(screen.getByText('Analista')).toBeInTheDocument();
  });

  // Uma avaliação de ATIVIDADES não tem bloco: suas perguntas nem estão no
  // catálogo de competências. O caminho de escrita já recusa inventar elemento,
  // mas a leitura normalizava para 'bloco1' e desenhava 25 lajes idênticas
  // achatadas numa linha de 1px. Melhor dizer que não há obra.
  it('[regressão] avaliação de atividades mostra estado vazio, não lajes inventadas', () => {
    const atividades = {
      ...LEGACY_WORK,
      evaluationType: 'atividades',
      questionIds: ['ativ-1', 'ativ-2'],
      responses: [
        { questionId: 'ativ-1', keywords: ['', '', ''], rating: 5, selectedElementId: '', selectedImageIndex: 4 },
        { questionId: 'ativ-2', keywords: ['', '', ''], rating: 2, selectedElementId: '', selectedImageIndex: 1 },
      ],
    } as unknown as SavedWork;

    const { container } = render(<AssemblyViewReadOnly work={atividades} onBack={() => {}} />);

    expect(screen.getByText(/não gera obra montada/i)).toBeInTheDocument();
    expect(container.querySelectorAll('[data-obra-element]')).toHaveLength(0);
  });

  it('[regressão] sobrevive a responses ausente (registro importado)', () => {
    const broken = { ...LEGACY_WORK, responses: undefined } as unknown as SavedWork;
    render(<AssemblyViewReadOnly work={broken} onBack={() => {}} />);
    expect(screen.getByText('Obra Montada')).toBeInTheDocument();
  });

  it('[regressão] createdAt inválido não vira "Invalid Date" na tela', () => {
    const broken = { ...LEGACY_WORK, createdAt: 'xx' } as unknown as SavedWork;
    render(<AssemblyViewReadOnly work={broken} onBack={() => {}} />);
    expect(screen.queryByText(/Invalid Date/)).toBeNull();
  });
});

describe('DiamondMesh', () => {
  const element = { elementId: 'e1', shapeCode: 'foundation-1', color: '#3e4e5c', categoryId: 'bloco1' };

  it('[regressão] posição ausente/NaN não gera coordenadas inválidas', () => {
    const assembled = [
      { ...element, position: undefined, rotation: 0, scale: 1 },
    ] as unknown as AssembledElement[];

    const { container } = render(
      <DiamondMesh elements={[element]} assembledElements={assembled} onUpdateElements={() => {}} readOnly />
    );
    const node = container.querySelector('[data-obra-element]') as HTMLElement;
    expect(node).toBeTruthy();
    expect(node.style.left).not.toContain('NaN');
    expect(node.style.top).not.toContain('NaN');
  });

  it('[regressão] rotation como objeto {x,y,z} é aplicada sem NaN', () => {
    const assembled = [
      { ...element, position: { x: 10, y: 10, z: 0 }, rotation: { x: 0, y: 0, z: 45 }, scale: 1 },
    ] as AssembledElement[];

    const { container } = render(
      <DiamondMesh elements={[element]} assembledElements={assembled} onUpdateElements={() => {}} readOnly />
    );
    const node = container.querySelector('[data-obra-element]') as HTMLElement;
    expect(node.style.transform).toContain('rotate(45deg)');
    expect(node.style.transform).not.toContain('NaN');
  });
});

describe('ElementRenderer', () => {
  it('[regressão] código ausente ou desconhecido cai no elemento padrão sem quebrar', () => {
    const { container: semCodigo } = render(
      <ElementRenderer code={undefined as unknown as string} color={undefined as unknown as string} />
    );
    expect(semCodigo.querySelector('svg')).toBeTruthy();

    const { container: chaveDePrototipo } = render(<ElementRenderer code="constructor" color="#000" />);
    expect(chaveDePrototipo.querySelector('svg')).toBeTruthy();
  });
});
