import { describe, it, expect } from 'vitest';
import {
  categoryShapes,
  findUnknownShapeIds,
  getShapeForIndex,
  normalizeCategoryId,
  resolveCategoryId,
} from '../categoryShapes';
import { newBlocks } from '../newBlocks';

describe('categoryShapes — fonte única do mapa bloco → elemento', () => {
  // Este é o teste que teria evitado o pior erro desta branch: uma cópia
  // divergente da tabela apontava 'bloco5' para 'detail-*', prefixo que nunca
  // existiu, e o elemento caía no quadrado genérico do fallback sem erro algum.
  it('todo id referenciado existe em customElements', () => {
    expect(findUnknownShapeIds()).toEqual([]);
  });

  it('cobre exatamente os blocos reais de newBlocks', () => {
    expect(Object.keys(categoryShapes).sort()).toEqual(newBlocks.map(b => b.id).sort());
  });

  it('mantém a ordem da planta: piso, coluna, parede, porta, janela, telhado', () => {
    const prefixOf = (id: string) => id.replace(/-\d+$/, '');
    expect([
      prefixOf(categoryShapes.bloco1[0]),
      prefixOf(categoryShapes.bloco2[0]),
      prefixOf(categoryShapes.bloco3[0]),
      prefixOf(categoryShapes.bloco4[0]),
      prefixOf(categoryShapes.bloco5[0]),
      prefixOf(categoryShapes.bloco6[0]),
    ]).toEqual(['foundation', 'structure', 'wall', 'door', 'window', 'roof']);
  });

  it('cada bloco tem os 10 elementos e nenhum id se repete entre blocos', () => {
    const all = Object.values(categoryShapes).flat();
    Object.values(categoryShapes).forEach(shapes => expect(shapes).toHaveLength(10));
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('resolveCategoryId / normalizeCategoryId', () => {
  it('aceita ids atuais e traduz os legados cat*', () => {
    expect(resolveCategoryId('bloco3')).toBe('bloco3');
    expect(resolveCategoryId('cat3')).toBe('bloco3');
  });

  // resolveCategoryId devolve null em vez de mascarar: cair em 'bloco1' desenha
  // uma atividade como se fosse fundação — errado com aparência de certo.
  it('devolve null para categoria desconhecida ou ausente', () => {
    expect(resolveCategoryId('activities-block')).toBeNull();
    expect(resolveCategoryId(undefined)).toBeNull();
    expect(resolveCategoryId('cat99')).toBeNull();
  });

  it('normalizeCategoryId garante um bloco desenhável', () => {
    expect(normalizeCategoryId('activities-block')).toBe('bloco1');
    expect(normalizeCategoryId('cat6')).toBe('bloco6');
  });
});

describe('getShapeForIndex', () => {
  // Regressão: um consumidor fazia Math.floor(index / 5), então qualquer nota
  // de 1 a 5 resolvia para o primeiro elemento do bloco.
  it('usa o índice direto, sem dividir por 5', () => {
    expect(getShapeForIndex('bloco1', 0)).toBe('foundation-1');
    expect(getShapeForIndex('bloco1', 3)).toBe('foundation-4');
    expect(getShapeForIndex('bloco4', 4)).toBe('door-5');
  });

  it('tolera índice ausente ou fora da faixa', () => {
    expect(getShapeForIndex('bloco1', null)).toBe('');
    expect(getShapeForIndex('bloco1', undefined)).toBe('');
    expect(getShapeForIndex('bloco1', 99)).toBe('');
    expect(getShapeForIndex('bloco1', Number.NaN)).toBe('');
  });
});
