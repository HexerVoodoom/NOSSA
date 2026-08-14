import { Role, Evaluation, SavedWork, SectionImages, Member, Competency, Question } from '../types';
import { traditionalCompetencies } from './newCompetencies';
import { defaultRoles, getMissingDefaultRoles } from './defaultRoles';
import { defaultLibrary } from './defaultLibrary';

const STORAGE_KEYS = {
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
};

// Chave canônica dos elementos SVG customizados. Exportada porque a tela de
// upload também precisa gravar aqui — ela usava a chave legada 'custom-elements',
// o que fazia backup/export/restore ignorarem silenciosamente esses elementos.
export const CUSTOM_ELEMENTS_KEY = 'obra-viva-custom-elements';

// Chave usada antes da unificação. Mantida só para a migração abaixo.
const LEGACY_CUSTOM_ELEMENTS_KEY = 'custom-elements';

// Move os elementos gravados sob a chave antiga para a canônica, uma única vez.
// Sem isso, quem já tinha elementos enviados os veria "sumir" na unificação.
const migrateCustomElementsKey = (): void => {
  const legacy = localStorage.getItem(LEGACY_CUSTOM_ELEMENTS_KEY);
  if (!legacy) return;

  if (!localStorage.getItem(CUSTOM_ELEMENTS_KEY)) {
    if (!safeSetItem(CUSTOM_ELEMENTS_KEY, legacy)) return;
    log('✅ Elementos customizados migrados para a chave canônica');
  }
  localStorage.removeItem(LEGACY_CUSTOM_ELEMENTS_KEY);
};

// Logger só de desenvolvimento — evita poluir o console em produção.
// Erros reais continuam usando console.error.
const log = (...args: unknown[]): void => {
  if (import.meta.env.DEV) console.log(...args);
};

// Normaliza `createdAt` para string ISO. O tipo de domínio aceita Date ou
// string (o que vem do JSON/localStorage já é string), então converter às cegas
// com toISOString() quebraria para os valores já serializados.
const toIsoString = (value: Date | string): string =>
  typeof value === 'string' ? value : value.toISOString();

// Competência como ela realmente vive no localStorage: `createdAt` é uma string
// ISO (JSON não tem Date), embora o tipo de domínio declare `Date`.
type StoredCompetency = Omit<Competency, 'createdAt'> & { createdAt: string };

// Escrita defensiva no localStorage. Base64 de imagens é armazenado aqui, então
// QuotaExceededError é risco real: em vez de estourar uma exceção não tratada
// (tela branca no meio de um salvamento), registramos o erro e devolvemos false
// para quem quiser reagir.
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.code === 22);
    if (isQuota) {
      console.error(
        `Espaço do navegador esgotado ao salvar "${key}" (${value.length} caracteres). ` +
          'Os dados NÃO foram gravados — remova imagens ou avaliações antigas.',
        error
      );
    } else {
      console.error(`Erro ao gravar "${key}" no localStorage:`, error);
    }
    return false;
  }
}

// Mantém apenas as perguntas "primárias": todas as afirmações (statements) e,
// entre as dialógicas, só as principais (sem pai) ou as que terminam em -d1.
// Descarta d2, d3, d4. Tolera `questions` ausente em dados corrompidos/importados.
function keepPrimaryQuestions<Q extends Pick<Question, 'id' | 'type' | 'parentQuestionId'>>(
  questions: Q[] | undefined | null
): Q[] {
  if (!Array.isArray(questions)) return [];
  return questions.filter(q => {
    // Mantém todas as afirmações (statements)
    if (q.type === 'statement') return true;

    // Mantém perguntas dialógicas principais (sem pai) ou que terminam em -d1
    if (q.type === 'dialogic') {
      return !q.parentQuestionId || q.id.endsWith('-d1');
    }

    return true;
  });
}

// Aplica o filtro de perguntas a uma competência, preservando os demais campos.
function filterCompetencyQuestions<C extends { questions?: Question[] }>(comp: C): C {
  return { ...comp, questions: keepPrimaryQuestions(comp.questions) };
}

// Parses a localStorage value defensively — corrupted/truncated JSON (quota
// eviction, manual edits, extension interference) falls back instead of
// throwing and white-screening the app.
function safeParse<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Erro ao ler "${key}" do localStorage, usando valor padrão:`, error);
    return fallback;
  }
}

// Seeds the client's default library (members, roles, competencies, evaluations)
// on first run, before any other empty-state initialization. Never overwrites
// data the user already has stored.
const initializeDefaultLibrary = () => {
  const initialized = localStorage.getItem(STORAGE_KEYS.LIBRARY_INITIALIZED);
  if (initialized) return;

  // Evaluations reference member/role/competency IDs from this same library,
  // so only seed them when the rest of the store is empty too — otherwise a
  // partially-populated store (e.g. from a prior session) would seed
  // evaluations pointing at members/roles that don't exist.
  const storeIsEmpty =
    !localStorage.getItem(STORAGE_KEYS.MEMBERS) &&
    !localStorage.getItem(STORAGE_KEYS.ROLES) &&
    !localStorage.getItem(STORAGE_KEYS.COMPETENCIES) &&
    !localStorage.getItem(STORAGE_KEYS.EVALUATIONS);

  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    safeSetItem(STORAGE_KEYS.MEMBERS, JSON.stringify(defaultLibrary.members));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROLES)) {
    safeSetItem(STORAGE_KEYS.ROLES, JSON.stringify(defaultLibrary.roles));
    safeSetItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPETENCIES)) {
    safeSetItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(defaultLibrary.competencies));
    safeSetItem(STORAGE_KEYS.COMPETENCIES_INITIALIZED, 'true');
    safeSetItem(STORAGE_KEYS.COMPETENCIES_VERSION, '1.4');
  }
  if (storeIsEmpty) {
    safeSetItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(defaultLibrary.evaluations));
  }

  safeSetItem(STORAGE_KEYS.LIBRARY_INITIALIZED, 'true');
  log('✅ Biblioteca padrão instalada:', {
    members: defaultLibrary.members.length,
    roles: defaultLibrary.roles.length,
    competencies: defaultLibrary.competencies.length,
    evaluations: defaultLibrary.evaluations.length,
  });
};

const initializeDefaultRoles = () => {
  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!initialized) {
    // Usa os novos cargos padrão do defaultRoles.ts
    const roles = safeParse<Role[]>(STORAGE_KEYS.ROLES, []);
    defaultRoles.forEach(role => {
      // Evita duplicatas
      if (!roles.some((r: Role) => r.id === role.id)) {
        roles.push(role);
      }
    });
    safeSetItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
    safeSetItem(STORAGE_KEYS.INITIALIZED, 'true');
    log('✅ Cargos padrão inicializados:', defaultRoles.length);
  } else {
    // Se já foi inicializado, verifica se há novos cargos padrão para adicionar
    const roles = safeParse<Role[]>(STORAGE_KEYS.ROLES, []);
    
    // 1. Adiciona cargos que não existem
    const missingRoles = getMissingDefaultRoles(roles);
    if (missingRoles.length > 0) {
      missingRoles.forEach(role => roles.push(role));
      log('✅ Novos cargos padrão adicionados:', missingRoles.length);
    }

    // 2. Atualiza atividades de cargos existentes se estiverem vazias ou desatualizadas
    let updatedCount = 0;
    defaultRoles.forEach(defaultRole => {
      const existingRoleIndex = roles.findIndex((r: Role) => r.id === defaultRole.id);
      if (existingRoleIndex >= 0) {
        const existingRole = roles[existingRoleIndex];
        // Se o cargo padrão tem atividades e o existente não tem, ou se queremos forçar atualização
        if (defaultRole.activities && (!existingRole.activities || existingRole.activities.length === 0)) {
          roles[existingRoleIndex] = {
            ...existingRole,
            activities: defaultRole.activities
          };
          updatedCount++;
        }
      }
    });

    if (missingRoles.length > 0 || updatedCount > 0) {
      safeSetItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
      if (updatedCount > 0) log('✅ Atividades atualizadas em cargos existentes:', updatedCount);
    }
  }
};

const initializeDefaultCompetencies = () => {
  const initialized = localStorage.getItem(STORAGE_KEYS.COMPETENCIES_INITIALIZED);
  if (!initialized) {
    // Filtra as perguntas e converte as datas para string antes de salvar
    const competenciesToSave: StoredCompetency[] = traditionalCompetencies.map(comp =>
      filterCompetencyQuestions({ ...comp, createdAt: toIsoString(comp.createdAt) })
    );
    // Só marca como inicializado se a gravação deu certo (ver safeSetItem).
    if (safeSetItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(competenciesToSave))) {
      safeSetItem(STORAGE_KEYS.COMPETENCIES_INITIALIZED, 'true');
      safeSetItem(STORAGE_KEYS.COMPETENCIES_VERSION, '1.4');
      log('✅ Competências inicializadas:', competenciesToSave.length);
    }
  }
};

// Migração para remover perguntas dialógicas extras e atualizar textos (v1.4)
const migrateCompetencies = () => {
  const version = localStorage.getItem(STORAGE_KEYS.COMPETENCIES_VERSION);
  const data = localStorage.getItem(STORAGE_KEYS.COMPETENCIES);
  
  // Se não tem versão ou se a versão é antiga (menor que 1.4), aplica a migração
  if (data && version !== '1.4') {
    log('🔄 Migrando competências para versão 1.4 (atualização de textos Blocos 1, 2, 4-6)...');
    
    // A migração sobrescreve o conteúdo armazenado com os textos padrão novos
    // (não há customização de usuário a preservar hoje).
    const migratedCompetencies: StoredCompetency[] = traditionalCompetencies.map(defaultComp =>
      filterCompetencyQuestions({ ...defaultComp, createdAt: toIsoString(defaultComp.createdAt) })
    );

    // Só marca a versão como migrada se a gravação realmente aconteceu —
    // senão o app acharia que migrou enquanto os dados antigos continuam lá.
    if (safeSetItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(migratedCompetencies))) {
      safeSetItem(STORAGE_KEYS.COMPETENCIES_VERSION, '1.4');
      log('✅ Migração concluída! Textos das competências atualizados para v1.4.');
    }
  }
};

export const storage = {
  // Roles
  getRoles(): Role[] {
    initializeDefaultRoles();
    return safeParse<Role[]>(STORAGE_KEYS.ROLES, []);
  },
  
  saveRole(role: Role): void {
    const roles = this.getRoles();
    const index = roles.findIndex(r => r.id === role.id);
    if (index >= 0) {
      roles[index] = role;
    } else {
      roles.push(role);
    }
    safeSetItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  },
  
  deleteRole(roleId: string): void {
    const roles = this.getRoles().filter(r => r.id !== roleId);
    safeSetItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  },
  
  // Evaluations
  getEvaluations(): SavedWork[] {
    return safeParse<SavedWork[]>(STORAGE_KEYS.EVALUATIONS, []);
  },
  
  saveEvaluation(evaluation: SavedWork): void {
    const evaluations = this.getEvaluations();
    const index = evaluations.findIndex(e => e.id === evaluation.id);
    if (index >= 0) {
      evaluations[index] = evaluation;
    } else {
      evaluations.push(evaluation);
    }
    safeSetItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  },
  
  deleteEvaluation(evaluationId: string): void {
    const evaluations = this.getEvaluations().filter(e => e.id !== evaluationId);
    safeSetItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  },
  
  // Current evaluation (in progress)
  getCurrentEvaluation(): Evaluation | null {
    return safeParse<Evaluation | null>(STORAGE_KEYS.CURRENT_EVALUATION, null);
  },
  
  saveCurrentEvaluation(evaluation: Evaluation): void {
    safeSetItem(STORAGE_KEYS.CURRENT_EVALUATION, JSON.stringify(evaluation));
  },
  
  clearCurrentEvaluation(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_EVALUATION);
  },
  
  // Section Images
  getSectionImages(): SectionImages {
    return safeParse<SectionImages>(STORAGE_KEYS.SECTION_IMAGES, {});
  },
  
  saveSectionImages(sectionImages: SectionImages): void {
    safeSetItem(STORAGE_KEYS.SECTION_IMAGES, JSON.stringify(sectionImages));
  },
  
  // Members
  getMembers(): Member[] {
    return safeParse<Member[]>(STORAGE_KEYS.MEMBERS, []);
  },
  
  saveMember(member: Member): void {
    const members = this.getMembers();
    const index = members.findIndex(m => m.id === member.id);
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    safeSetItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },
  
  deleteMember(memberId: string): void {
    const members = this.getMembers().filter(m => m.id !== memberId);
    safeSetItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },
  
  // Visual Mode
  getVisualMode(): 'geometric' | 'architectural' | 'images' {
    // Valida o valor lido: um cast cego devolveria lixo se a chave tivesse sido
    // adulterada ou gravada por uma versão antiga.
    const data = localStorage.getItem(STORAGE_KEYS.VISUAL_MODE);
    return data === 'geometric' || data === 'architectural' || data === 'images' ? data : 'images';
  },
  
  saveVisualMode(mode: 'geometric' | 'architectural' | 'images'): void {
    safeSetItem(STORAGE_KEYS.VISUAL_MODE, mode);
  },
  
  // Competencies
  getCompetencies(): Competency[] {
    const competencies = safeParse<Competency[]>(STORAGE_KEYS.COMPETENCIES, []);

    // Filtra perguntas dialógicas d2, d3, d4 - mantém a principal ou d1
    return competencies.map(filterCompetencyQuestions);
  },

  saveCompetency(competency: Competency): void {
    const competencies = this.getCompetencies();
    const index = competencies.findIndex(c => c.id === competency.id);

    // Aplica filtro antes de salvar
    const filteredCompetency = filterCompetencyQuestions(competency);

    if (index >= 0) {
      competencies[index] = filteredCompetency;
    } else {
      competencies.push(filteredCompetency);
    }
    safeSetItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(competencies));
  },

  saveCompetencies(newCompetencies: Competency[]): void {
    const existingCompetencies = this.getCompetencies();
    
    // Filtra e mescla
    const updatedCompetencies = [...existingCompetencies];
    
    newCompetencies.forEach(newComp => {
      const filteredComp = filterCompetencyQuestions(newComp);

      const index = updatedCompetencies.findIndex(c => c.id === filteredComp.id);
      if (index >= 0) {
        updatedCompetencies[index] = filteredComp;
      } else {
        updatedCompetencies.push(filteredComp);
      }
    });
    
    safeSetItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(updatedCompetencies));
  },
  
  deleteCompetency(competencyId: string): void {
    const competencies = this.getCompetencies().filter(c => c.id !== competencyId);
    safeSetItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(competencies));
  },
  
  initializeCompetencies(): void {
    initializeDefaultLibrary();
    initializeDefaultCompetencies();
    migrateCompetencies();
    migrateCustomElementsKey();
  },
  
  // Função para resetar as competências (útil para debug)
  resetCompetencies(): void {
    localStorage.removeItem(STORAGE_KEYS.COMPETENCIES);
    localStorage.removeItem(STORAGE_KEYS.COMPETENCIES_INITIALIZED);
    initializeDefaultCompetencies();
  },

  // Export/Import de configurações (competências + elementos customizados)
  exportConfiguration(): string {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      competencies: this.getCompetencies(),
      roles: this.getRoles(),
      customElements: localStorage.getItem(CUSTOM_ELEMENTS_KEY) || null,
      visualMode: this.getVisualMode(),
    };
    return JSON.stringify(data, null, 2);
  },

  importConfiguration(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      // Validação básica
      if (!data.version || !Array.isArray(data.competencies)) {
        throw new Error('Formato de arquivo inválido');
      }

      // Importa competências COM FILTRO
      const filteredCompetencies = data.competencies.map((comp: Competency) =>
        filterCompetencyQuestions(comp)
      );

      // Se a gravação falhar (cota), não marca como inicializado nem segue
      // importando o resto — o import inteiro é reportado como falha.
      if (!safeSetItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(filteredCompetencies))) {
        return false;
      }
      safeSetItem(STORAGE_KEYS.COMPETENCIES_INITIALIZED, 'true');

      // Importa cargos se existirem
      if (data.roles) {
        safeSetItem(STORAGE_KEYS.ROLES, JSON.stringify(data.roles));
        safeSetItem(STORAGE_KEYS.INITIALIZED, 'true');
      }

      // Importa elementos customizados se existirem
      if (data.customElements) {
        safeSetItem(CUSTOM_ELEMENTS_KEY, data.customElements);
      }

      // Importa modo visual se existir
      if (data.visualMode) {
        this.saveVisualMode(data.visualMode);
      }

      return true;
    } catch (error) {
      console.error('Erro ao importar configuração:', error);
      return false;
    }
  },

  // Export/Import de avaliações
  exportEvaluations(): string {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      evaluations: this.getEvaluations(),
      members: this.getMembers(),
    };
    return JSON.stringify(data, null, 2);
  },

  importEvaluations(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      // Validação básica
      if (!data.version || !Array.isArray(data.evaluations)) {
        throw new Error('Formato de arquivo inválido');
      }

      // Importa membros (se não existirem, cria novos)
      if (Array.isArray(data.members)) {
        const existingMembers = this.getMembers();
        data.members.forEach((member: Member) => {
          if (!existingMembers.find(m => m.id === member.id)) {
            this.saveMember(member);
          }
        });
      }

      // Importa avaliações
      data.evaluations.forEach((evaluation: SavedWork) => {
        this.saveEvaluation(evaluation);
      });

      return true;
    } catch (error) {
      console.error('Erro ao importar avaliações:', error);
      return false;
    }
  },

  // Backup and Restore
  createBackup(): void {
    const backupData = {
      timestamp: new Date().toISOString(),
      members: this.getMembers(),
      roles: this.getRoles(),
      competencies: this.getCompetencies(),
      evaluations: this.getEvaluations(),
      visualMode: this.getVisualMode(),
      sectionImages: this.getSectionImages(),
      customElements: localStorage.getItem(CUSTOM_ELEMENTS_KEY) || null,
    };
    safeSetItem(STORAGE_KEYS.BACKUP, JSON.stringify(backupData));
    log('✅ Backup criado:', new Date(backupData.timestamp).toLocaleString());
  },

  restoreBackup(): boolean {
    try {
      const backupString = localStorage.getItem(STORAGE_KEYS.BACKUP);
      if (!backupString) {
        return false;
      }

      const backup = JSON.parse(backupString);

      // Restaura apenas as coleções presentes no backup. Gravar uma coleção
      // ausente escreveria a string "undefined" na chave e apagaria os dados
      // atuais do usuário (perda de dados silenciosa).
      if (Array.isArray(backup.members)) {
        safeSetItem(STORAGE_KEYS.MEMBERS, JSON.stringify(backup.members));
      }
      if (Array.isArray(backup.roles)) {
        safeSetItem(STORAGE_KEYS.ROLES, JSON.stringify(backup.roles));
      }
      if (Array.isArray(backup.competencies)) {
        // Filtra competências antes de restaurar
        const filteredCompetencies = backup.competencies.map((comp: Competency) =>
          filterCompetencyQuestions(comp)
        );
        safeSetItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(filteredCompetencies));
      }
      if (Array.isArray(backup.evaluations)) {
        safeSetItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(backup.evaluations));
      }


      if (backup.visualMode) {
        this.saveVisualMode(backup.visualMode);
      }
      
      if (backup.sectionImages) {
        this.saveSectionImages(backup.sectionImages);
      }
      
      if (backup.customElements) {
        safeSetItem(CUSTOM_ELEMENTS_KEY, backup.customElements);
      }

      log('✅ Backup restaurado de:', new Date(backup.timestamp).toLocaleString());
      return true;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return false;
    }
  },

  getBackupInfo(): { exists: boolean; timestamp?: string } {
    const backupString = localStorage.getItem(STORAGE_KEYS.BACKUP);
    if (!backupString) {
      return { exists: false };
    }

    try {
      const backup = JSON.parse(backupString);
      return {
        exists: true,
        timestamp: backup.timestamp,
      };
    } catch {
      return { exists: false };
    }
  },
};