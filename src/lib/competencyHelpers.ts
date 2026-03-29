import { Question } from '../types';
import { storage } from './storage';

/**
 * Extrai todas as perguntas das competências do storage e retorna como um array plano
 * Similar ao formato do antigo defaultQuestions, mas sempre pega dados atualizados
 */
export function getAllQuestionsFromCompetencies(): Question[] {
  // Inicializa as competências se necessário
  storage.initializeCompetencies();
  
  // Carrega as competências do storage (dados atualizados)
  const competencies = storage.getCompetencies();
  
  const allQuestions: Question[] = [];
  
  competencies.forEach(competency => {
    competency.questions.forEach(question => {
      allQuestions.push(question);
    });
  });
  
  return allQuestions;
}

/**
 * Busca uma pergunta específica por ID
 */
export function getQuestionById(questionId: string): Question | undefined {
  const competencies = storage.getCompetencies();
  
  for (const competency of competencies) {
    const question = competency.questions.find(q => q.id === questionId);
    if (question) {
      return question;
    }
  }
  return undefined;
}

/**
 * Busca todas as perguntas de uma categoria específica
 */
export function getQuestionsByCategory(categoryId: string): Question[] {
  const allQuestions = getAllQuestionsFromCompetencies();
  return allQuestions.filter(q => q.categoryId === categoryId);
}

/**
 * Busca todas as perguntas de uma competência específica
 */
export function getQuestionsByCompetency(competencyId: string): Question[] {
  const competencies = storage.getCompetencies();
  const competency = competencies.find(c => c.id === competencyId);
  return competency?.questions || [];
}