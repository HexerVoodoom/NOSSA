import { describe, it, expect } from 'vitest';
import { competencies } from '../newCompetencies';
import { newBlocks } from '../newBlocks';
import { defaultRoles } from '../defaultRoles';
import { customElements } from '../customElements';
import {
  getQuestionById,
  getQuestionsByCompetency,
  getAllQuestionsFromCompetencies,
} from '../competencyHelpers';

// ============================================================================
// AUDITORIA DE INTEGRIDADE DA BIBLIOTECA SEMEADA
// Estes testes travam o estado verificado da biblioteca de competências,
// cargos e blocos. Qualquer edição futura que quebre uma dessas invariantes
// (ID órfão, ID duplicado, categoryId inválido) falha aqui, e não em produção
// no meio de uma avaliação real.
// ============================================================================

const allQuestions = competencies.flatMap(c => c.questions);
const questionIds = new Set(allQuestions.map(q => q.id));
const blockIds = new Set(newBlocks.map(b => b.id));

/** Retorna os valores que aparecem mais de uma vez. */
function duplicates<T>(values: T[]): T[] {
  const seen = new Map<T, number>();
  values.forEach(v => seen.set(v, (seen.get(v) ?? 0) + 1));
  return [...seen.entries()].filter(([, n]) => n > 1).map(([v]) => v);
}

// Réplica exata da regra de storage.keepPrimaryQuestions, para verificar aqui
// quais perguntas semeadas seriam descartadas na leitura do localStorage.
function keptByStorageFilter(q: { id: string; type?: string; parentQuestionId?: string }): boolean {
  if (q.type === 'dialogic') return !q.parentQuestionId || q.id.endsWith('-d1');
  return true;
}

describe('integridade da biblioteca — tamanho', () => {
  it('mantém o inventário conhecido (falha se alguém adicionar/remover às cegas)', () => {
    expect(competencies).toHaveLength(36);
    expect(allQuestions).toHaveLength(127);
    expect(newBlocks).toHaveLength(6);
    expect(defaultRoles).toHaveLength(8);
    expect(Object.keys(customElements)).toHaveLength(60);
  });
});

describe('1. referências órfãs em Role.questionIds', () => {
  it.each(defaultRoles.map(r => [r.id, r] as const))(
    '%s: todo questionId existe na biblioteca',
    (_id, role) => {
      const dangling = role.questionIds.filter(qid => !questionIds.has(qid));
      expect(dangling).toEqual([]);
    },
  );

  it('nenhum cargo fica sem perguntas (falha silenciosa do matcher por nome)', () => {
    const empty = defaultRoles.filter(r => r.questionIds.length === 0).map(r => r.id);
    expect(empty).toEqual([]);
  });

  it('nenhum cargo repete o mesmo questionId (matcher parcial casando 2 competências)', () => {
    defaultRoles.forEach(role => {
      expect({ role: role.id, dups: duplicates(role.questionIds) }).toEqual({
        role: role.id,
        dups: [],
      });
    });
  });

  // O matcher de defaultRoles usa `includes` para nomes com >5 caracteres. Se
  // alguém criar "Comunicação Assertiva" ao lado de "Comunicação", o cargo que
  // pede "Comunicação" passa a receber as DUAS competências, em silêncio.
  it('nenhum nome de competência é substring de outro (armadilha do match parcial)', () => {
    const norm = (s: string) =>
      s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const collisions: string[][] = [];
    competencies.forEach(a =>
      competencies.forEach(b => {
        if (a !== b && norm(a.name).length > 5 && norm(b.name).includes(norm(a.name))) {
          collisions.push([a.name, b.name]);
        }
      }),
    );
    expect(collisions).toEqual([]);
  });

  it('congela a contagem de perguntas por cargo (avaliações reais dependem disso)', () => {
    const snapshot = Object.fromEntries(defaultRoles.map(r => [r.id, r.questionIds.length]));
    expect(snapshot).toEqual({
      'default-role-3d-manager': 38,
      'default-role-administrador': 36,
      'default-role-desenvolvedor-projetos': 44,
      'default-role-financeiro': 44,
      'default-role-gestor-obra': 33,
      'default-role-gerente-comercial': 36,
      'default-role-coordenadora-projetos': 46,
      'default-role-auxiliar-servicos-gerais': 30,
    });
  });
});

describe('2. IDs duplicados', () => {
  it('IDs de competência são únicos', () => {
    expect(duplicates(competencies.map(c => c.id))).toEqual([]);
  });

  // Duplicata global quebra `responses.find(r => r.questionId === q.id)`:
  // a resposta de uma pergunta apareceria na outra.
  it('IDs de pergunta são únicos GLOBALMENTE', () => {
    expect(duplicates(allQuestions.map(q => q.id))).toEqual([]);
  });

  it('IDs de cargo são únicos', () => {
    expect(duplicates(defaultRoles.map(r => r.id))).toEqual([]);
  });

  it('IDs de atividade são únicos entre todos os cargos', () => {
    expect(duplicates(defaultRoles.flatMap(r => r.activities.map(a => a.id)))).toEqual([]);
  });

  it('IDs de bloco são únicos', () => {
    expect(duplicates(newBlocks.map(b => b.id))).toEqual([]);
  });

  // Nomes duplicados fariam o matcher de defaultRoles somar as duas.
  it('nomes de competência são únicos', () => {
    expect(duplicates(competencies.map(c => c.name))).toEqual([]);
  });

  it('chaves de customElements batem com o id interno e os nomes não repetem', () => {
    const keys = Object.keys(customElements);
    expect(keys.filter(k => customElements[k].id !== k)).toEqual([]);
    expect(duplicates(keys.map(k => customElements[k].name))).toEqual([]);
  });
});

describe('3. validade de categoryId', () => {
  it('todo categoryId de competência existe em newBlocks', () => {
    const bad = competencies.filter(c => !blockIds.has(c.categoryId)).map(c => [c.id, c.categoryId]);
    expect(bad).toEqual([]);
  });

  // Se o categoryId da pergunta não existir, o fluxo filtra a categoria fora
  // (`questions.some(q => q.categoryId === cat.id)`) e a pergunta nunca renderiza.
  it('todo categoryId de pergunta existe em newBlocks', () => {
    const bad = allQuestions.filter(q => !blockIds.has(q.categoryId)).map(q => [q.id, q.categoryId]);
    expect(bad).toEqual([]);
  });

  it('a pergunta fica no mesmo bloco da competência pai', () => {
    const bad: string[][] = [];
    competencies.forEach(c =>
      c.questions.forEach(q => {
        if (q.categoryId !== c.categoryId) bad.push([q.id, q.categoryId, c.categoryId]);
      }),
    );
    expect(bad).toEqual([]);
  });

  it('todo bloco tem pelo menos uma pergunta (senão some da UI)', () => {
    const vazios = newBlocks
      .filter(b => !allQuestions.some(q => q.categoryId === b.id))
      .map(b => b.id);
    expect(vazios).toEqual([]);
  });
});

describe('4. back-reference competencyId', () => {
  it('toda pergunta aponta para a competência que a contém', () => {
    const bad: string[][] = [];
    competencies.forEach(c =>
      c.questions.forEach(q => {
        if (q.competencyId !== c.id) bad.push([q.id, String(q.competencyId), c.id]);
      }),
    );
    expect(bad).toEqual([]);
  });
});

describe('5. perguntas dialógicas e o filtro do storage', () => {
  it('todo parentQuestionId aponta para uma pergunta real', () => {
    const bad = allQuestions
      .filter(q => q.parentQuestionId && !questionIds.has(q.parentQuestionId))
      .map(q => [q.id, q.parentQuestionId]);
    expect(bad).toEqual([]);
  });

  // Estado atual verificado: as 36 dialógicas semeadas NÃO têm pai.
  it('a biblioteca semeada não usa parentQuestionId', () => {
    const dialogicas = allQuestions.filter(q => q.type === 'dialogic');
    expect(dialogicas).toHaveLength(36);
    expect(dialogicas.filter(q => q.parentQuestionId)).toEqual([]);
  });

  // ARMADILHA: os IDs semeados terminam em `-dial`, não em `-d1`. Enquanto não
  // tiverem pai, sobrevivem ao filtro. No dia em que alguém setar
  // parentQuestionId numa dessas, TODAS somem do localStorage sem aviso.
  it('nenhuma pergunta semeada é descartada por keepPrimaryQuestions', () => {
    const derrubadas = allQuestions.filter(q => !keptByStorageFilter(q)).map(q => q.id);
    expect(derrubadas).toEqual([]);
  });

  it('cada competência tem exatamente uma dialógica, e ela é a última', () => {
    competencies.forEach(c => {
      const dial = c.questions.filter(q => q.type === 'dialogic');
      expect({ id: c.id, n: dial.length }).toEqual({ id: c.id, n: 1 });
      expect(c.questions[c.questions.length - 1].type).toBe('dialogic');
    });
  });

  it('type e evaluationType são coerentes entre si', () => {
    const bad = allQuestions
      .filter(q =>
        q.type === 'dialogic'
          ? q.evaluationType !== 'dialogica'
          : q.evaluationType !== 'tradicional',
      )
      .map(q => q.id);
    expect(bad).toEqual([]);
  });
});

describe('6. campos order', () => {
  it('order das perguntas é 0..n-1 dentro de cada competência', () => {
    competencies.forEach(c => {
      expect({ id: c.id, orders: c.questions.map(q => q.order) }).toEqual({
        id: c.id,
        orders: c.questions.map((_, i) => i),
      });
    });
  });

  it('order das atividades é 0..n-1 dentro de cada cargo', () => {
    defaultRoles.forEach(r => {
      expect({ id: r.id, orders: r.activities.map(a => a.order) }).toEqual({
        id: r.id,
        orders: r.activities.map((_, i) => i),
      });
    });
  });

  it('order das competências é único e crescente', () => {
    const orders = competencies.map(c => c.order);
    expect(duplicates(orders)).toEqual([]);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });

  // ESTADO ATUAL DOCUMENTADO (não é bug funcional, mas é irregular): a sequência
  // tem um 13.5 e pula o 17. Renumerar mexeria na ordenação exibida ao usuário,
  // então fica registrado em vez de "corrigido" às escondidas.
  it('documenta a irregularidade conhecida da sequência de order', () => {
    const orders = competencies.map(c => c.order);
    expect(orders.filter(o => !Number.isInteger(o))).toEqual([13.5]);
    const inteiros = orders.filter(Number.isInteger);
    const faltando = Array.from({ length: 36 }, (_, i) => i + 1).filter(n => !inteiros.includes(n));
    expect(faltando).toEqual([17]);
  });

  it('order dos blocos é 1..6', () => {
    expect(newBlocks.map(b => b.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('7. competencyHelpers', () => {
  // REGRESSÃO: getQuestionById/getQuestionsByCompetency liam o storage sem
  // garantir o seed. Em localStorage limpo devolviam undefined/[] para IDs
  // perfeitamente válidos.
  it('getQuestionById funciona com localStorage vazio', () => {
    expect(localStorage.length).toBe(0);
    const q = getQuestionById('q-b1-agilidade-1');
    expect(q?.id).toBe('q-b1-agilidade-1');
  });

  it('getQuestionsByCompetency funciona com localStorage vazio', () => {
    expect(localStorage.length).toBe(0);
    expect(getQuestionsByCompetency('comp-b1-agilidade').length).toBeGreaterThan(0);
  });

  it('getQuestionById devolve undefined para ID inexistente', () => {
    expect(getQuestionById('q-nao-existe')).toBeUndefined();
  });

  it('getQuestionsByCompetency devolve [] para competência inexistente', () => {
    expect(getQuestionsByCompetency('comp-nao-existe')).toEqual([]);
  });

  it('getAllQuestionsFromCompetencies devolve a biblioteca completa', () => {
    expect(getAllQuestionsFromCompetencies()).toHaveLength(allQuestions.length);
  });
});

describe('8. customElements / svgProcessor', () => {
  it('nenhum SVG vazio e todos são realmente <svg>', () => {
    Object.entries(customElements).forEach(([key, el]) => {
      expect({ key, ok: el.svg.trim().startsWith('<svg') }).toEqual({ key, ok: true });
    });
  });

  // ESTADO ATUAL DOCUMENTADO: 5 SVGs exportados do Figma contêm coordenadas
  // `-nan` num subpath degenerado. O navegador ignora o trecho inválido, mas é
  // dado corrompido na origem. Editar o asset é decisão de design, não de QA —
  // fica travado aqui para que a lista não CRESÇA.
  it('lista de SVGs com coordenadas NaN não cresce', () => {
    const comNaN = Object.keys(customElements).filter(k => /-nan/i.test(customElements[k].svg));
    expect(comNaN).toEqual([
      'foundation-6',
      'foundation-7',
      'foundation-8',
      'foundation-9',
      'foundation-10',
    ]);
  });

  it('as 6 categorias de elemento têm 10 itens cada', () => {
    const porCategoria: Record<string, number> = {};
    Object.keys(customElements).forEach(k => {
      const cat = k.replace(/-\d+$/, '');
      porCategoria[cat] = (porCategoria[cat] ?? 0) + 1;
    });
    expect(porCategoria).toEqual({
      foundation: 10,
      structure: 10,
      wall: 10,
      door: 10,
      window: 10,
      roof: 10,
    });
  });
});
