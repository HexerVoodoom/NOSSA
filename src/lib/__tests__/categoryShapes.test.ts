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

  // Verificar só o primeiro id de cada bloco deixava passar uma tabela onde,
  // digamos, bloco3[5] fosse 'door-6': o id existe, então findUnknownShapeIds
  // não reclamaria. Aqui exigimos prefixo único e numeração alinhada ao índice.
  it('dentro de um bloco todos os ids têm o mesmo prefixo e numeração sequencial', () => {
    Object.entries(categoryShapes).forEach(([bloco, shapes]) => {
      const prefixes = new Set(shapes.map(id => id.replace(/-\d+$/, '')));
      expect(prefixes, `${bloco} mistura famílias de elemento`).toHaveLength(1);

      shapes.forEach((id, i) => {
        expect(id, `${bloco}[${i}] fora de ordem`).toMatch(new RegExp(`-${i + 1}$`));
      });
    });
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

  // Regressão: getShapeForIndex usava normalizeCategoryId, que cai em 'bloco1'.
  // Toda resposta de uma avaliação de ATIVIDADES (categoria 'activities-block',
  // que não é bloco nenhum) era gravada como 'foundation-N' — a atividade
  // aparecia desenhada como laje de fundação, e o PDF a listava sob o título de
  // outro bloco. Sem elemento correspondente, o certo é não devolver nenhum.
  it('não inventa elemento para categoria que não é bloco', () => {
    expect(getShapeForIndex('activities-block', 3)).toBe('');
    expect(getShapeForIndex(undefined, 3)).toBe('');
    expect(getShapeForIndex('cat99', 0)).toBe('');
  });

  it('tolera índice ausente ou fora da faixa', () => {
    expect(getShapeForIndex('bloco1', null)).toBe('');
    expect(getShapeForIndex('bloco1', undefined)).toBe('');
    expect(getShapeForIndex('bloco1', 99)).toBe('');
    expect(getShapeForIndex('bloco1', Number.NaN)).toBe('');
  });
});
