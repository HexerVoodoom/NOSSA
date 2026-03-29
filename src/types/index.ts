// Types for Arquitetura de Carreira application

export type EvaluationType = 'dialogica' | 'tradicional' | 'atividades';

export type QuestionType = 'statement' | 'dialogic' | 'activity'; // 'statement' = afirmação, 'dialogic' = pergunta dialógica, 'activity' = atividade

export interface Question {
  id: string;
  categoryId: string;
  text: string;
  order: number;
  isBonus?: boolean; // Perguntas bônus são opcionais e não afetam a avaliação gráfica
  competencyId?: string; // Link para competência
  evaluationType?: EvaluationType; // Para qual tipo de avaliação esta pergunta pertence
  type?: QuestionType; // Tipo da pergunta: afirmação (tradicional) ou dialógica
  parentQuestionId?: string; // Para perguntas dialógicas, referência à afirmação pai
}

export interface Activity {
  id: string;
  text: string;
  order: number;
}

export interface Competency {
  id: string;
  name: string;
  description?: string;
  categoryId: string; // Qual seção esta competência pertence
  questions: Question[]; // Perguntas associadas a esta competência
  createdAt: Date;
  order: number;
}

export interface CustomQuestion extends Question {
  roleId: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  color: string;
}

export interface QuestionResponse {
  questionId: string;
  keywords: [string, string, string];
  rating: number; // 0-5
  selectedElementId: string;
  selectedImageIndex?: number; // 0-14 for the 3x5 grid
}

export interface Role {
  id: string;
  name: string;
  type: 'leadership' | 'collaborator'; // liderança ou associado(a)
  questionIds: string[];
  customQuestions?: CustomQuestion[];
  activities?: Activity[]; // Atividades específicas do cargo para Avaliação de Atividades
  createdAt: Date;
}

export interface Member {
  id: string;
  firstName: string;
  lastName?: string;
  birthDate?: Date;
  startDate?: Date;
  position: string;
  createdAt: Date;
}

export interface Evaluation {
  id: string;
  roleId: string;
  roleName: string;
  leaderId: string;
  collaboratorId: string;
  leaderName?: string; // Keep for backward compatibility
  collaboratorName?: string; // Keep for backward compatibility
  responses: QuestionResponse[];
  questionIds: string[];
  activityIds?: string[]; // IDs das atividades avaliadas (se evaluationType === 'atividades')
  createdAt: Date;
  completed: boolean;
  sectionObservations?: Record<string, string>; // Observações por categoria/seção
  evaluationType?: EvaluationType; // Tipo de avaliação escolhido
}

export interface SectionImages {
  [categoryId: string]: (string | null)[]; // Array of 15 images per category
}

export interface AssembledElement {
  elementId: string;
  shapeCode: string;
  color: string;
  categoryId: string;
  position: { x: number; y: number; z?: number };
  rotation: number | { x: number; y: number; z: number };
  scale: number;
}

export interface SavedWork extends Evaluation {
  assembledElements?: AssembledElement[];
  imageData?: string;
  categoryCommitments?: Record<string, string>; // Comprometimentos por categoria
}