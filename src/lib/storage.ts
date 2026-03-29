import { Role, Evaluation, SavedWork, SectionImages, Member, Competency } from '../types';
import { traditionalCompetencies } from './newCompetencies';
import { defaultRoles, getMissingDefaultRoles } from './defaultRoles';

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
};

const initializeDefaultRoles = () => {
  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!initialized) {
    // Usa os novos cargos padrão do defaultRoles.ts
    const roles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES) || '[]');
    defaultRoles.forEach(role => {
      // Evita duplicatas
      if (!roles.some((r: Role) => r.id === role.id)) {
        roles.push(role);
      }
    });
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    console.log('✅ Cargos padrão inicializados:', defaultRoles.length);
  } else {
    // Se já foi inicializado, verifica se há novos cargos padrão para adicionar
    const roles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES) || '[]');
    
    // 1. Adiciona cargos que não existem
    const missingRoles = getMissingDefaultRoles(roles);
    if (missingRoles.length > 0) {
      missingRoles.forEach(role => roles.push(role));
      console.log('✅ Novos cargos padrão adicionados:', missingRoles.length);
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
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
      if (updatedCount > 0) console.log('✅ Atividades atualizadas em cargos existentes:', updatedCount);
    }
  }
};

const initializeDefaultCompetencies = () => {
  const initialized = localStorage.getItem(STORAGE_KEYS.COMPETENCIES_INITIALIZED);
  if (!initialized) {
    // Filtra e converte as datas para string antes de salvar
    const competenciesToSave = traditionalCompetencies.map(comp => ({
      ...comp,
      createdAt: comp.createdAt.toISOString(),
      // Filtra perguntas dialógicas d2, d3, d4 - mantém a principal ou d1
      questions: comp.questions.filter(q => {
        // Mantém todas as afirmações (statements)
        if (q.type === 'statement') return true;
        
        // Mantém perguntas dialógicas principais (sem pai) ou que terminam em -d1
        if (q.type === 'dialogic') {
          return !q.parentQuestionId || q.id.endsWith('-d1');
        }
        
        return true;
      })
    }));
    localStorage.setItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(competenciesToSave));
    localStorage.setItem(STORAGE_KEYS.COMPETENCIES_INITIALIZED, 'true');
    localStorage.setItem(STORAGE_KEYS.COMPETENCIES_VERSION, '1.4');
    console.log('✅ Competências inicializadas:', competenciesToSave.length);
  }
};

// Migração para remover perguntas dialógicas extras e atualizar textos (v1.4)
const migrateCompetencies = () => {
  const version = localStorage.getItem(STORAGE_KEYS.COMPETENCIES_VERSION);
  const data = localStorage.getItem(STORAGE_KEYS.COMPETENCIES);
  
  // Se não tem versão ou se a versão é antiga (menor que 1.4), aplica a migração
  if (data && version !== '1.4') {
    console.log('🔄 Migrando competências para versão 1.4 (atualização de textos Blocos 1, 2, 4-6)...');
    
    // Para garantir que as perguntas atualizadas sejam carregadas,
    // vamos mesclar as customizações do usuário com os novos textos padrão
    const currentStored: Competency[] = JSON.parse(data);
    
    const migratedCompetencies = traditionalCompetencies.map(defaultComp => {
      const storedComp = currentStored.find(c => c.id === defaultComp.id);
      
      // Se a competência existia, preservamos apenas o que for customizado (se houver lógica para isso)
      // No momento, vamos priorizar os novos textos padrão para garantir que as correções do usuário apareçam
      if (storedComp) {
        // Se quisermos manter algo do usuário, faríamos aqui. 
        // Mas o pedido é "adicione as perguntas de novo", então vamos sobrescrever com o padrão novo.
        return {
          ...defaultComp,
          createdAt: defaultComp.createdAt.toISOString(),
          questions: defaultComp.questions.filter(q => {
            if (q.type === 'statement') return true;
            if (q.type === 'dialogic') return !q.parentQuestionId || q.id.endsWith('-d1');
            return true;
          })
        };
      }
      
      return {
        ...defaultComp,
        createdAt: defaultComp.createdAt.toISOString(),
        questions: defaultComp.questions.filter(q => {
          if (q.type === 'statement') return true;
          if (q.type === 'dialogic') return !q.parentQuestionId || q.id.endsWith('-d1');
          return true;
        })
      };
    });
    
    localStorage.setItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(migratedCompetencies));
    localStorage.setItem(STORAGE_KEYS.COMPETENCIES_VERSION, '1.4');
    console.log('✅ Migração concluída! Textos das competências atualizados para v1.4.');
  }
};

export const storage = {
  // Roles
  getRoles(): Role[] {
    initializeDefaultRoles();
    const data = localStorage.getItem(STORAGE_KEYS.ROLES);
    return data ? JSON.parse(data) : [];
  },
  
  saveRole(role: Role): void {
    const roles = this.getRoles();
    const index = roles.findIndex(r => r.id === role.id);
    if (index >= 0) {
      roles[index] = role;
    } else {
      roles.push(role);
    }
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  },
  
  deleteRole(roleId: string): void {
    const roles = this.getRoles().filter(r => r.id !== roleId);
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  },
  
  // Evaluations
  getEvaluations(): SavedWork[] {
    const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    return data ? JSON.parse(data) : [];
  },
  
  saveEvaluation(evaluation: SavedWork): void {
    const evaluations = this.getEvaluations();
    const index = evaluations.findIndex(e => e.id === evaluation.id);
    if (index >= 0) {
      evaluations[index] = evaluation;
    } else {
      evaluations.push(evaluation);
    }
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  },
  
  deleteEvaluation(evaluationId: string): void {
    const evaluations = this.getEvaluations().filter(e => e.id !== evaluationId);
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  },
  
  // Current evaluation (in progress)
  getCurrentEvaluation(): Evaluation | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_EVALUATION);
    return data ? JSON.parse(data) : null;
  },
  
  saveCurrentEvaluation(evaluation: Evaluation): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_EVALUATION, JSON.stringify(evaluation));
  },
  
  clearCurrentEvaluation(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_EVALUATION);
  },
  
  // Section Images
  getSectionImages(): SectionImages {
    const data = localStorage.getItem(STORAGE_KEYS.SECTION_IMAGES);
    return data ? JSON.parse(data) : {};
  },
  
  saveSectionImages(sectionImages: SectionImages): void {
    localStorage.setItem(STORAGE_KEYS.SECTION_IMAGES, JSON.stringify(sectionImages));
  },
  
  // Members
  getMembers(): Member[] {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : [];
  },
  
  saveMember(member: Member): void {
    const members = this.getMembers();
    const index = members.findIndex(m => m.id === member.id);
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },
  
  deleteMember(memberId: string): void {
    const members = this.getMembers().filter(m => m.id !== memberId);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },
  
  // Visual Mode
  getVisualMode(): 'geometric' | 'architectural' | 'images' {
    const data = localStorage.getItem(STORAGE_KEYS.VISUAL_MODE);
    return data ? (data as 'geometric' | 'architectural' | 'images') : 'images';
  },
  
  saveVisualMode(mode: 'geometric' | 'architectural' | 'images'): void {
    localStorage.setItem(STORAGE_KEYS.VISUAL_MODE, mode);
  },
  
  // Competencies
  getCompetencies(): Competency[] {
    const data = localStorage.getItem(STORAGE_KEYS.COMPETENCIES);
    const competencies: Competency[] = data ? JSON.parse(data) : [];
    
    // Filtra perguntas dialógicas d2, d3, d4 - mantém a principal ou d1
    return competencies.map(comp => ({
      ...comp,
      questions: comp.questions.filter(q => {
        // Mantém todas as afirmações (statements)
        if (q.type === 'statement') return true;
        
        // Mantém perguntas dialógicas principais (sem pai) ou que terminam em -d1
        if (q.type === 'dialogic') {
          return !q.parentQuestionId || q.id.endsWith('-d1');
        }
        
        return true;
      })
    }));
  },
  
  saveCompetency(competency: Competency): void {
    const competencies = this.getCompetencies();
    const index = competencies.findIndex(c => c.id === competency.id);
    
    // Aplica filtro antes de salvar
    const filteredCompetency = {
      ...competency,
      questions: competency.questions.filter(q => {
        // Mantém todas as afirmações (statements)
        if (q.type === 'statement') return true;
        
        // Mantém perguntas dialógicas principais (sem pai) ou que terminam em -d1
        if (q.type === 'dialogic') {
          return !q.parentQuestionId || q.id.endsWith('-d1');
        }
        
        return true;
      })
    };
    
    if (index >= 0) {
      competencies[index] = filteredCompetency;
    } else {
      competencies.push(filteredCompetency);
    }
    localStorage.setItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(competencies));
  },

  saveCompetencies(newCompetencies: Competency[]): void {
    const existingCompetencies = this.getCompetencies();
    
    // Filtra e mescla
    const updatedCompetencies = [...existingCompetencies];
    
    newCompetencies.forEach(newComp => {
      const filteredComp = {
        ...newComp,
        questions: newComp.questions.filter(q => {
          if (q.type === 'statement') return true;
          if (q.type === 'dialogic') return !q.parentQuestionId || q.id.endsWith('-d1');
          return true;
        })
      };
      
      const index = updatedCompetencies.findIndex(c => c.id === filteredComp.id);
      if (index >= 0) {
        updatedCompetencies[index] = filteredComp;
      } else {
        updatedCompetencies.push(filteredComp);
      }
    });
    
    localStorage.setItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(updatedCompetencies));
  },
  
  deleteCompetency(competencyId: string): void {
    const competencies = this.getCompetencies().filter(c => c.id !== competencyId);
    localStorage.setItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(competencies));
  },
  
  initializeCompetencies(): void {
    initializeDefaultCompetencies();
    migrateCompetencies();
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
      customElements: localStorage.getItem('obra-viva-custom-elements') || null,
      visualMode: this.getVisualMode(),
    };
    return JSON.stringify(data, null, 2);
  },

  importConfiguration(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      // Validação básica
      if (!data.version || !data.competencies) {
        throw new Error('Formato de arquivo inválido');
      }

      // Importa competências COM FILTRO
      const filteredCompetencies = data.competencies.map((comp: Competency) => ({
        ...comp,
        questions: comp.questions.filter((q: any) => {
          // Mantém todas as afirmações (statements)
          if (q.type === 'statement') return true;
          
          // Mantém perguntas dialógicas principais (sem pai) ou que terminam em -d1
          if (q.type === 'dialogic') {
            return !q.parentQuestionId || q.id.endsWith('-d1');
          }
          
          return true;
        })
      }));
      
      localStorage.setItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(filteredCompetencies));
      localStorage.setItem(STORAGE_KEYS.COMPETENCIES_INITIALIZED, 'true');

      // Importa cargos se existirem
      if (data.roles) {
        localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(data.roles));
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }

      // Importa elementos customizados se existirem
      if (data.customElements) {
        localStorage.setItem('obra-viva-custom-elements', data.customElements);
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
      if (!data.version || !data.evaluations) {
        throw new Error('Formato de arquivo inválido');
      }

      // Importa membros (se não existirem, cria novos)
      if (data.members) {
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
      customElements: localStorage.getItem('obra-viva-custom-elements') || null,
    };
    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backupData));
    console.log('✅ Backup criado:', new Date(backupData.timestamp).toLocaleString());
  },

  restoreBackup(): boolean {
    try {
      const backupString = localStorage.getItem(STORAGE_KEYS.BACKUP);
      if (!backupString) {
        return false;
      }

      const backup = JSON.parse(backupString);

      // Filtra competências antes de restaurar
      const filteredCompetencies = backup.competencies.map((comp: Competency) => ({
        ...comp,
        questions: comp.questions.filter((q: any) => {
          // Mantém todas as afirmações (statements)
          if (q.type === 'statement') return true;
          
          // Mantém perguntas dialógicas principais (sem pai) ou que terminam em -d1
          if (q.type === 'dialogic') {
            return !q.parentQuestionId || q.id.endsWith('-d1');
          }
          
          return true;
        })
      }));

      // Restaura todos os dados do backup
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(backup.members));
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(backup.roles));
      localStorage.setItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(filteredCompetencies));
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(backup.evaluations));
      
      if (backup.visualMode) {
        this.saveVisualMode(backup.visualMode);
      }
      
      if (backup.sectionImages) {
        this.saveSectionImages(backup.sectionImages);
      }
      
      if (backup.customElements) {
        localStorage.setItem('obra-viva-custom-elements', backup.customElements);
      }

      console.log('✅ Backup restaurado de:', new Date(backup.timestamp).toLocaleString());
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