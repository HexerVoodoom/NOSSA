import { describe, it, expect, vi } from 'vitest';
import { storage, CUSTOM_ELEMENTS_KEY } from '../storage';
import { defaultLibrary } from '../defaultLibrary';
import type { Competency, Member, Role, SavedWork } from '../../types';

const KEYS = {
  ROLES: 'obra-viva-roles',
  EVALUATIONS: 'obra-viva-evaluations',
  CURRENT_EVALUATION: 'obra-viva-current-evaluation',
  SECTION_IMAGES: 'obra-viva-section-images',
  MEMBERS: 'obra-viva-members',
  INITIALIZED: 'obra-viva-initialized',
  VISUAL_MODE: 'obra-viva-visual-mode',
  COMPETENCIES: 'obra-viva-competencies',
  COMPETENCIES_INITIALIZED: 'obra-viva-competencies-initialized',
  BACKUP: 'obra-viva-backup',
  COMPETENCIES_VERSION: 'obra-viva-competencies-version',
  LIBRARY_INITIALIZED: 'obra-viva-library-initialized',
  LEGACY_CUSTOM_ELEMENTS: 'custom-elements',
};

const quotaError = () => {
  const err = new DOMException('quota', 'QuotaExceededError');
  return err;
};

/** Faz `setItem` estourar QuotaExceededError apenas para as chaves informadas. */
function failWritesFor(keys: string[]) {
  const real = localStorage.setItem.bind(localStorage);
  return vi.spyOn(localStorage, 'setItem').mockImplementation((k: string, v: string) => {
    if (keys.includes(k)) throw quotaError();
    real(k, v);
  });
}

const makeRole = (id: string, name = id): Role =>
  ({ id, name, description: '', activities: [] }) as unknown as Role;

const makeMember = (id: string, firstName = id): Member => ({
  id,
  firstName,
  position: 'Desenvolvedor',
  createdAt: '2024-01-01T00:00:00.000Z',
});

const makeEvaluation = (id: string): SavedWork =>
  ({ id, memberId: 'm1', createdAt: '2024-01-01T00:00:00.000Z' }) as unknown as SavedWork;

const makeCompetency = (id: string, questions: unknown): Competency =>
  ({ id, name: id, categoryId: 'c', questions }) as unknown as Competency;

const q = (id: string, type: string, parentQuestionId?: string) =>
  ({ id, type, parentQuestionId, categoryId: 'c', text: id, order: 0 }) as unknown as never;

// ---------------------------------------------------------------------------
describe('safeParse — JSON corrompido', () => {
  it('roles truncados: não estoura e se recupera com os cargos padrão', () => {
    localStorage.setItem(KEYS.ROLES, '[{"id":"a",');
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    let roles: unknown;
    expect(() => {
      roles = storage.getRoles();
    }).not.toThrow();
    expect(Array.isArray(roles)).toBe(true);
    expect((roles as unknown[]).length).toBeGreaterThan(0);
    expect(console.error).toHaveBeenCalled();
  });

  it.each([
    [KEYS.EVALUATIONS, () => storage.getEvaluations()],
    [KEYS.MEMBERS, () => storage.getMembers()],
    [KEYS.COMPETENCIES, () => storage.getCompetencies()],
  ])('%s truncado devolve array vazio em vez de estourar', (key, read) => {
    localStorage.setItem(key, '[{"id":"a",');
    // marca como inicializado para getRoles não repopular a partir dos padrões
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    let result: unknown;
    expect(() => {
      result = read();
    }).not.toThrow();
    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('current-evaluation corrompida devolve null', () => {
    localStorage.setItem(KEYS.CURRENT_EVALUATION, '{oops');
    expect(storage.getCurrentEvaluation()).toBeNull();
  });

  it('section-images corrompidas devolvem objeto vazio', () => {
    localStorage.setItem(KEYS.SECTION_IMAGES, 'not json');
    expect(storage.getSectionImages()).toEqual({});
  });

  it('backup corrompido: getBackupInfo devolve exists:false e restoreBackup false', () => {
    localStorage.setItem(KEYS.BACKUP, '{"members":[');
    expect(storage.getBackupInfo()).toEqual({ exists: false });
    expect(storage.restoreBackup()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
describe('safeSetItem — QuotaExceededError', () => {
  it('não estoura e não marca flags quando a gravação das competências falha', () => {
    failWritesFor([KEYS.COMPETENCIES]);

    expect(() => storage.resetCompetencies()).not.toThrow();

    // REGRESSÃO: marcar "initialized"/"version" com o dado NÃO gravado fazia o
    // app achar que já tinha competências — telas vazias para sempre.
    expect(localStorage.getItem(KEYS.COMPETENCIES)).toBeNull();
    expect(localStorage.getItem(KEYS.COMPETENCIES_INITIALIZED)).toBeNull();
    expect(localStorage.getItem(KEYS.COMPETENCIES_VERSION)).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('migração v1.4 não grava a versão se a escrita das competências falhar', () => {
    localStorage.setItem(KEYS.COMPETENCIES, JSON.stringify([makeCompetency('old', [])]));
    localStorage.setItem(KEYS.COMPETENCIES_VERSION, '1.0');
    localStorage.setItem(KEYS.COMPETENCIES_INITIALIZED, 'true');
    localStorage.setItem(KEYS.LIBRARY_INITIALIZED, 'true');
    failWritesFor([KEYS.COMPETENCIES]);

    expect(() => storage.initializeCompetencies()).not.toThrow();

    expect(localStorage.getItem(KEYS.COMPETENCIES_VERSION)).toBe('1.0');
    expect(JSON.parse(localStorage.getItem(KEYS.COMPETENCIES)!)[0].id).toBe('old');
  });

  it('importConfiguration devolve false (e não marca inicializado) se a cota estourar', () => {
    failWritesFor([KEYS.COMPETENCIES]);
    const payload = JSON.stringify({
      version: '1.0',
      competencies: [makeCompetency('c1', [])],
      roles: [makeRole('r1')],
    });

    expect(storage.importConfiguration(payload)).toBe(false);
    expect(localStorage.getItem(KEYS.COMPETENCIES_INITIALIZED)).toBeNull();
    // não deve seguir importando o resto após a falha
    expect(localStorage.getItem(KEYS.ROLES)).toBeNull();
  });

  it('quota em qualquer chave nunca propaga exceção para o chamador', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw quotaError();
    });
    expect(() => storage.saveMember(makeMember('m1'))).not.toThrow();
    expect(() => storage.saveEvaluation(makeEvaluation('e1'))).not.toThrow();
    expect(() => storage.saveVisualMode('geometric')).not.toThrow();
    expect(() => storage.createBackup()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
describe('restoreBackup', () => {
  it('backup sem members/roles/competencies/evaluations não sobrescreve os dados atuais', () => {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify([makeMember('m1', 'Ana')]));
    localStorage.setItem(KEYS.ROLES, JSON.stringify([makeRole('r1', 'Dev')]));
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    localStorage.setItem(KEYS.COMPETENCIES, JSON.stringify([makeCompetency('c1', [])]));
    localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([makeEvaluation('e1')]));
    localStorage.setItem(
      KEYS.BACKUP,
      JSON.stringify({ timestamp: '2024-01-01T00:00:00.000Z', visualMode: 'geometric' })
    );

    expect(storage.restoreBackup()).toBe(true);

    // REGRESSÃO: JSON.stringify(undefined) === undefined -> gravava a string
    // "undefined" e apagava tudo silenciosamente.
    for (const key of [KEYS.MEMBERS, KEYS.ROLES, KEYS.COMPETENCIES, KEYS.EVALUATIONS]) {
      expect(localStorage.getItem(key)).not.toBe('undefined');
    }
    expect(storage.getMembers()).toHaveLength(1);
    expect(storage.getMembers()[0].firstName).toBe('Ana');
    expect(storage.getEvaluations()).toHaveLength(1);
    expect(storage.getCompetencies()).toHaveLength(1);
    expect(storage.getVisualMode()).toBe('geometric');
  });

  it('restaura as coleções presentes no backup', () => {
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    localStorage.setItem(
      KEYS.BACKUP,
      JSON.stringify({
        timestamp: '2024-01-01T00:00:00.000Z',
        members: [makeMember('m9', 'Bia')],
        evaluations: [makeEvaluation('e9')],
        competencies: [makeCompetency('c9', [q('s1', 'statement'), q('x-d2', 'dialogic', 'p')])],
        customElements: '{"a":1}',
      })
    );

    expect(storage.restoreBackup()).toBe(true);
    expect(storage.getMembers().map(m => m.id)).toEqual(['m9']);
    expect(storage.getEvaluations().map(e => e.id)).toEqual(['e9']);
    // filtro de perguntas aplicado na restauração
    expect(storage.getCompetencies()[0].questions.map(x => x.id)).toEqual(['s1']);
    expect(localStorage.getItem(CUSTOM_ELEMENTS_KEY)).toBe('{"a":1}');
  });

  it('sem backup devolve false', () => {
    expect(storage.restoreBackup()).toBe(false);
    expect(storage.getBackupInfo()).toEqual({ exists: false });
  });

  it('createBackup + getBackupInfo expõem o timestamp', () => {
    storage.createBackup();
    const info = storage.getBackupInfo();
    expect(info.exists).toBe(true);
    expect(Number.isNaN(Date.parse(info.timestamp!))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
describe('initializeDefaultLibrary (via storage.initializeCompetencies)', () => {
  it('semeia a biblioteca padrão numa store totalmente vazia', () => {
    storage.initializeCompetencies();

    expect(storage.getMembers()).toHaveLength(defaultLibrary.members.length);
    expect(JSON.parse(localStorage.getItem(KEYS.EVALUATIONS)!)).toHaveLength(
      defaultLibrary.evaluations.length
    );
    expect(JSON.parse(localStorage.getItem(KEYS.COMPETENCIES)!)).toHaveLength(
      defaultLibrary.competencies.length
    );
    expect(localStorage.getItem(KEYS.LIBRARY_INITIALIZED)).toBe('true');
    expect(localStorage.getItem(KEYS.COMPETENCIES_VERSION)).toBe('1.4');
  });

  it('não sobrescreve dados já existentes do usuário', () => {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify([makeMember('m1', 'Ana')]));
    localStorage.setItem(KEYS.COMPETENCIES, JSON.stringify([makeCompetency('c1', [])]));
    localStorage.setItem(KEYS.COMPETENCIES_INITIALIZED, 'true');
    localStorage.setItem(KEYS.COMPETENCIES_VERSION, '1.4');
    localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([makeEvaluation('e1')]));

    storage.initializeCompetencies();

    expect(storage.getMembers()).toEqual([expect.objectContaining({ id: 'm1' })]);
    expect(storage.getEvaluations().map(e => e.id)).toEqual(['e1']);
    expect(storage.getCompetencies().map(c => c.id)).toEqual(['c1']);
  });

  it('NÃO semeia avaliações quando a store está apenas parcialmente vazia', () => {
    // REGRESSÃO: semear avaliações aqui criaria registros apontando para
    // membros/cargos que não existem nesta store.
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify([makeMember('m1', 'Ana')]));

    storage.initializeCompetencies();

    expect(storage.getEvaluations()).toEqual([]);
    expect(storage.getMembers().map(m => m.id)).toEqual(['m1']);
    expect(localStorage.getItem(KEYS.LIBRARY_INITIALIZED)).toBe('true');
  });

  it('é idempotente: rodar duas vezes não duplica nada', () => {
    storage.initializeCompetencies();
    const snapshot = localStorage.getItem(KEYS.MEMBERS);
    const evals = localStorage.getItem(KEYS.EVALUATIONS);
    storage.initializeCompetencies();
    expect(localStorage.getItem(KEYS.MEMBERS)).toBe(snapshot);
    expect(localStorage.getItem(KEYS.EVALUATIONS)).toBe(evals);
  });
});

// ---------------------------------------------------------------------------
describe('keepPrimaryQuestions / filtro de competências', () => {
  it('mantém statements, dialógicas sem pai e -d1; descarta -d2/-d3/-d4', () => {
    localStorage.setItem(
      KEYS.COMPETENCIES,
      JSON.stringify([
        makeCompetency('c1', [
          q('s1', 'statement'),
          q('s2-d2', 'statement'), // statement sempre fica, mesmo com sufixo
          q('main', 'dialogic'),
          q('main-d1', 'dialogic', 'main'),
          q('main-d2', 'dialogic', 'main'),
          q('main-d3', 'dialogic', 'main'),
          q('main-d4', 'dialogic', 'main'),
        ]),
      ])
    );

    expect(storage.getCompetencies()[0].questions.map(x => x.id)).toEqual([
      's1',
      's2-d2',
      'main',
      'main-d1',
    ]);
  });

  it('tolera competência sem a propriedade questions', () => {
    localStorage.setItem(
      KEYS.COMPETENCIES,
      JSON.stringify([{ id: 'c1', name: 'x', categoryId: 'c' }])
    );
    expect(() => storage.getCompetencies()).not.toThrow();
    expect(storage.getCompetencies()[0].questions).toEqual([]);
    // preserva os demais campos
    expect(storage.getCompetencies()[0].name).toBe('x');
  });

  it('tolera questions null / não-array', () => {
    localStorage.setItem(
      KEYS.COMPETENCIES,
      JSON.stringify([makeCompetency('a', null), makeCompetency('b', 'oops')])
    );
    expect(storage.getCompetencies().map(c => c.questions)).toEqual([[], []]);
  });

  it('saveCompetency aplica o filtro antes de gravar', () => {
    storage.saveCompetency(
      makeCompetency('c1', [q('m', 'dialogic'), q('m-d2', 'dialogic', 'm')])
    );
    expect(JSON.parse(localStorage.getItem(KEYS.COMPETENCIES)!)[0].questions).toHaveLength(1);
  });

  it('saveCompetencies mescla por id sem duplicar', () => {
    storage.saveCompetency(makeCompetency('c1', [q('s1', 'statement')]));
    storage.saveCompetencies([
      makeCompetency('c1', [q('s2', 'statement')]),
      makeCompetency('c2', []),
    ]);
    const all = storage.getCompetencies();
    expect(all.map(c => c.id)).toEqual(['c1', 'c2']);
    expect(all[0].questions.map(x => x.id)).toEqual(['s2']);
  });

  it('deleteCompetency remove apenas o alvo', () => {
    storage.saveCompetency(makeCompetency('c1', []));
    storage.saveCompetency(makeCompetency('c2', []));
    storage.deleteCompetency('c1');
    expect(storage.getCompetencies().map(c => c.id)).toEqual(['c2']);
  });
});

// ---------------------------------------------------------------------------
describe('migrateCustomElementsKey', () => {
  it('move a chave legada para a canônica e remove a antiga', () => {
    localStorage.setItem(KEYS.LEGACY_CUSTOM_ELEMENTS, '{"svg":"legacy"}');
    localStorage.setItem(KEYS.LIBRARY_INITIALIZED, 'true');
    localStorage.setItem(KEYS.COMPETENCIES_INITIALIZED, 'true');
    localStorage.setItem(KEYS.COMPETENCIES_VERSION, '1.4');

    storage.initializeCompetencies();

    expect(localStorage.getItem(CUSTOM_ELEMENTS_KEY)).toBe('{"svg":"legacy"}');
    expect(localStorage.getItem(KEYS.LEGACY_CUSTOM_ELEMENTS)).toBeNull();
  });

  it('não sobrescreve um valor canônico já existente', () => {
    localStorage.setItem(KEYS.LEGACY_CUSTOM_ELEMENTS, '{"svg":"legacy"}');
    localStorage.setItem(CUSTOM_ELEMENTS_KEY, '{"svg":"atual"}');
    localStorage.setItem(KEYS.LIBRARY_INITIALIZED, 'true');
    localStorage.setItem(KEYS.COMPETENCIES_INITIALIZED, 'true');
    localStorage.setItem(KEYS.COMPETENCIES_VERSION, '1.4');

    storage.initializeCompetencies();

    expect(localStorage.getItem(CUSTOM_ELEMENTS_KEY)).toBe('{"svg":"atual"}');
    expect(localStorage.getItem(KEYS.LEGACY_CUSTOM_ELEMENTS)).toBeNull();
  });

  it('não apaga a chave legada se a gravação canônica falhar (cota)', () => {
    localStorage.setItem(KEYS.LEGACY_CUSTOM_ELEMENTS, '{"svg":"legacy"}');
    localStorage.setItem(KEYS.LIBRARY_INITIALIZED, 'true');
    localStorage.setItem(KEYS.COMPETENCIES_INITIALIZED, 'true');
    localStorage.setItem(KEYS.COMPETENCIES_VERSION, '1.4');
    failWritesFor([CUSTOM_ELEMENTS_KEY]);

    storage.initializeCompetencies();

    expect(localStorage.getItem(KEYS.LEGACY_CUSTOM_ELEMENTS)).toBe('{"svg":"legacy"}');
  });

  it('sem chave legada não faz nada', () => {
    localStorage.setItem(KEYS.LIBRARY_INITIALIZED, 'true');
    localStorage.setItem(KEYS.COMPETENCIES_INITIALIZED, 'true');
    localStorage.setItem(KEYS.COMPETENCIES_VERSION, '1.4');
    storage.initializeCompetencies();
    expect(localStorage.getItem(CUSTOM_ELEMENTS_KEY)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
describe('CRUD round-trips', () => {
  it('saveRole/getRoles: cria, atualiza por id e apaga', () => {
    const before = storage.getRoles().length; // dispara seed dos cargos padrão
    storage.saveRole(makeRole('custom-1', 'Pedreiro'));
    expect(storage.getRoles()).toHaveLength(before + 1);

    storage.saveRole(makeRole('custom-1', 'Mestre de Obras'));
    expect(storage.getRoles()).toHaveLength(before + 1);
    expect(storage.getRoles().find(r => r.id === 'custom-1')!.name).toBe('Mestre de Obras');

    storage.deleteRole('custom-1');
    expect(storage.getRoles().find(r => r.id === 'custom-1')).toBeUndefined();
    expect(storage.getRoles()).toHaveLength(before);
  });

  it('saveMember/deleteMember', () => {
    expect(storage.getMembers()).toEqual([]);
    storage.saveMember(makeMember('m1', 'Ana'));
    storage.saveMember(makeMember('m2', 'Bia'));
    expect(storage.getMembers().map(m => m.id)).toEqual(['m1', 'm2']);

    storage.saveMember(makeMember('m1', 'Ana Maria'));
    expect(storage.getMembers()).toHaveLength(2);
    expect(storage.getMembers()[0].firstName).toBe('Ana Maria');

    storage.deleteMember('m1');
    expect(storage.getMembers().map(m => m.id)).toEqual(['m2']);
    storage.deleteMember('inexistente');
    expect(storage.getMembers().map(m => m.id)).toEqual(['m2']);
  });

  it('saveEvaluation/deleteEvaluation', () => {
    storage.saveEvaluation(makeEvaluation('e1'));
    storage.saveEvaluation(makeEvaluation('e2'));
    expect(storage.getEvaluations().map(e => e.id)).toEqual(['e1', 'e2']);
    storage.saveEvaluation(makeEvaluation('e1'));
    expect(storage.getEvaluations()).toHaveLength(2);
    storage.deleteEvaluation('e2');
    expect(storage.getEvaluations().map(e => e.id)).toEqual(['e1']);
  });

  it('current evaluation: save / get / clear', () => {
    expect(storage.getCurrentEvaluation()).toBeNull();
    storage.saveCurrentEvaluation({ id: 'ev' } as never);
    expect(storage.getCurrentEvaluation()).toEqual({ id: 'ev' });
    storage.clearCurrentEvaluation();
    expect(storage.getCurrentEvaluation()).toBeNull();
  });

  it('section images: round-trip', () => {
    storage.saveSectionImages({ intro: 'data:image/png;base64,AAA' } as never);
    expect(storage.getSectionImages()).toEqual({ intro: 'data:image/png;base64,AAA' });
  });
});

// ---------------------------------------------------------------------------
describe('getVisualMode', () => {
  it.each(['geometric', 'architectural', 'images'] as const)('aceita %s', mode => {
    storage.saveVisualMode(mode);
    expect(storage.getVisualMode()).toBe(mode);
  });

  it.each(['', 'GEOMETRIC', 'null', '{"mode":"geometric"}', 'hacked'])(
    'valor adulterado %j cai no fallback "images"',
    bad => {
      localStorage.setItem(KEYS.VISUAL_MODE, bad);
      expect(storage.getVisualMode()).toBe('images');
    }
  );

  it('sem valor gravado devolve "images"', () => {
    expect(storage.getVisualMode()).toBe('images');
  });
});

// ---------------------------------------------------------------------------
describe('import/export', () => {
  it('exportConfiguration é um round-trip válido de importConfiguration', () => {
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    storage.saveCompetency(makeCompetency('c1', [q('s1', 'statement')]));
    storage.saveRole(makeRole('r1'));
    storage.saveVisualMode('geometric');
    const dump = storage.exportConfiguration();

    localStorage.clear();
    expect(storage.importConfiguration(dump)).toBe(true);
    expect(storage.getCompetencies().map(c => c.id)).toEqual(['c1']);
    expect(storage.getVisualMode()).toBe('geometric');
  });

  it.each([
    ['JSON inválido', 'não é json'],
    ['competencies ausente', JSON.stringify({ version: '1.0' })],
    ['competencies não-array', JSON.stringify({ version: '1.0', competencies: { a: 1 } })],
    ['version ausente', JSON.stringify({ competencies: [] })],
    ['payload nulo', 'null'],
    ['array na raiz', JSON.stringify([{ id: 'c1' }])],
  ])('importConfiguration rejeita %s sem estourar nem gravar nada', (_label, payload) => {
    let result: boolean | undefined;
    expect(() => {
      result = storage.importConfiguration(payload);
    }).not.toThrow();
    expect(result).toBe(false);
    expect(localStorage.getItem(KEYS.COMPETENCIES)).toBeNull();
    expect(localStorage.getItem(KEYS.COMPETENCIES_INITIALIZED)).toBeNull();
    expect(localStorage.getItem(KEYS.ROLES)).toBeNull();
  });

  it.each([
    ['JSON inválido', '{'],
    ['evaluations ausente', JSON.stringify({ version: '1.0' })],
    ['evaluations não-array', JSON.stringify({ version: '1.0', evaluations: 'x' })],
    ['version ausente', JSON.stringify({ evaluations: [] })],
    ['payload nulo', 'null'],
  ])('importEvaluations rejeita %s sem importar pela metade', (_label, payload) => {
    let result: boolean | undefined;
    expect(() => {
      result = storage.importEvaluations(payload);
    }).not.toThrow();
    expect(result).toBe(false);
    expect(localStorage.getItem(KEYS.EVALUATIONS)).toBeNull();
    expect(localStorage.getItem(KEYS.MEMBERS)).toBeNull();
  });

  it('importEvaluations round-trip preserva avaliações e membros', () => {
    storage.saveMember(makeMember('m1', 'Ana'));
    storage.saveEvaluation(makeEvaluation('e1'));
    const dump = storage.exportEvaluations();

    localStorage.clear();
    expect(storage.importEvaluations(dump)).toBe(true);
    expect(storage.getMembers().map(m => m.id)).toEqual(['m1']);
    expect(storage.getEvaluations().map(e => e.id)).toEqual(['e1']);
  });

  // Regressão: importEvaluations() já devolveu `true` mesmo sem gravar nada,
  // porque saveEvaluation/saveMember descartavam o retorno de safeSetItem. Com
  // a cota estourada o usuário via "importado com sucesso" e perdia o arquivo.
  // Agora os mutadores propagam o resultado e o import aborta na primeira falha.
  it('importEvaluations devolve false quando a cota estoura', () => {
    const payload = JSON.stringify({
      version: '1.0',
      members: [makeMember('m1')],
      evaluations: [makeEvaluation('e1')],
    });
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw quotaError();
    });

    expect(storage.importEvaluations(payload)).toBe(false);
  });

  it('importEvaluations não relata sucesso sem ter gravado nada', () => {
    const payload = JSON.stringify({ version: '1.0', evaluations: [makeEvaluation('e1')] });
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw quotaError();
    });
    expect(storage.importEvaluations(payload)).toBe(false);
    vi.restoreAllMocks();
    expect(storage.getEvaluations()).toEqual([]);
  });

  it('importEvaluations não duplica membros já existentes', () => {
    storage.saveMember(makeMember('m1', 'Ana'));
    const payload = JSON.stringify({
      version: '1.0',
      members: [makeMember('m1', 'Outra Ana')],
      evaluations: [makeEvaluation('e1')],
    });
    expect(storage.importEvaluations(payload)).toBe(true);
    expect(storage.getMembers()).toHaveLength(1);
    expect(storage.getMembers()[0].firstName).toBe('Ana');
  });
});
