import { Category, EvaluationType, Question, QuestionResponse } from '../types';
import { newBlocks } from './newBlocks';

// FONTE ÚNICA do cálculo de médias de uma avaliação.
//
// Antes desta extração, a galeria (TeamGallery) fazia média simples de TODAS as
// respostas gravadas, enquanto a tela de detalhe (WorkDetail) e o resumo
// (EvaluationSummary) filtravam por tipo de avaliação e faziam média das médias
// por bloco. A mesma avaliação aparecia como 2.3 na galeria e 2.8 no detalhe.
// A semântica do detalhe é a autoritativa, porque é ela que o PDF imprime.
//
// TRADE-OFF DELIBERADO (não é bug):
// `overallAverage` é a MÉDIA DAS MÉDIAS POR BLOCO. Um bloco com 1 pergunta
// respondida pesa o mesmo que um bloco com 12. Portanto `overallAverage` NÃO é
// a média das notas. Mantemos esse comportamento porque mudá-lo moveria toda
// nota já exibida e impressa no produto — é uma decisão de produto, não uma
// correção técnica. Para tornar essa decisão barata no futuro, expomos também
// `flatAverage` (média simples das respostas que entram no cálculo, ponderada
// por número de perguntas). Hoje NENHUMA tela exibe `flatAverage`.

export const ACTIVITIES_CATEGORY: Category = {
  id: 'activities-block',
  name: 'Avaliação de Atividades',
  order: 1,
  color: '#34d399',
};

export interface CategoryStat {
  category: Category;
  totalQuestions: number;
  averageRating: number;
  responses: QuestionResponse[];
}

export interface EvaluationStatsInput {
  responses: QuestionResponse[] | undefined | null;
  evaluationType?: EvaluationType | string;
  /** Perguntas do catálogo (competências) + perguntas customizadas do cargo. */
  questions: Question[];
  /**
   * Só para avaliações de atividades: quando informado, apenas respostas cujo
   * `questionId` está nesta lista entram no cálculo. O detalhe salvo (WorkDetail)
   * NÃO informa — de propósito: se o cargo/atividade for excluído depois da
   * avaliação, o relatório salvo continua mostrando as notas gravadas em vez de
   * cair para "0 perguntas / média 0.0".
   */
  activityIds?: string[] | null;
}

export interface EvaluationStats {
  categoryStats: CategoryStat[];
  /** Média das médias por bloco — o número exibido no produto. */
  overallAverage: number;
  /** Média simples das respostas consideradas; `null` quando não há nenhuma. */
  flatAverage: number | null;
  totalQuestions: number;
}

// Nota inválida (undefined, null, NaN, string) vira 0 em vez de contaminar a
// soma com NaN e renderizar "NaN" na tela.
function safeRating(rating: unknown): number {
  return typeof rating === 'number' && Number.isFinite(rating) ? rating : 0;
}

// Arredonda para 2 casas sem devolver NaN nem -0.
function round2(value: number): number {
  return Number.isFinite(value) ? parseFloat(value.toFixed(2)) : 0;
}

/**
 * Decide se uma resposta entra em um bloco, aplicando o filtro por tipo de
 * avaliação (é isso que impede misturar notas dialógicas com tradicionais).
 */
export function isResponseInCategory(
  response: QuestionResponse,
  categoryId: string,
  input: Pick<EvaluationStatsInput, 'evaluationType' | 'questions' | 'activityIds'>
): boolean {
  if (input.evaluationType === 'atividades') {
    if (categoryId !== ACTIVITIES_CATEGORY.id) return false;
    if (Array.isArray(input.activityIds)) {
      return input.activityIds.includes(response.questionId);
    }
    return true;
  }

  const question = input.questions.find(q => q.id === response.questionId);
  if (!question || question.categoryId !== categoryId) return false;

  if (input.evaluationType === 'tradicional' && question.type === 'dialogic') return false;
  if (input.evaluationType === 'dialogica' && question.type === 'statement') return false;

  return true;
}

export function getStatCategories(evaluationType?: EvaluationType | string): Category[] {
  return evaluationType === 'atividades' ? [ACTIVITIES_CATEGORY] : newBlocks;
}

/**
 * Estatísticas por bloco. Blocos sem nenhuma pergunta respondida são removidos —
 * o que também garante que nenhuma divisão 0/0 (NaN) chegue à tela.
 */
export function computeCategoryStats(input: EvaluationStatsInput): CategoryStat[] {
  const responses = Array.isArray(input.responses) ? input.responses : [];

  return getStatCategories(input.evaluationType)
    .map(category => {
      const responsesInCategory = responses.filter(r =>
        r && isResponseInCategory(r, category.id, input)
      );
      const totalRating = responsesInCategory.reduce((sum, r) => sum + safeRating(r.rating), 0);
      const averageRating =
        responsesInCategory.length > 0 ? totalRating / responsesInCategory.length : 0;

      return {
        category,
        totalQuestions: responsesInCategory.length,
        averageRating: round2(averageRating),
        responses: responsesInCategory,
      };
    })
    .filter(stat => stat.totalQuestions > 0);
}

/** Média das médias por bloco (ver trade-off no topo do arquivo). */
export function computeOverallAverage(categoryStats: CategoryStat[]): number {
  if (categoryStats.length === 0) return 0;
  const sum = categoryStats.reduce((acc, stat) => acc + safeRating(stat.averageRating), 0);
  return round2(sum / categoryStats.length);
}

/**
 * Média simples (ponderada por pergunta) das respostas consideradas.
 * Não é exibida em lugar nenhum hoje; existe para que trocar a semântica seja
 * uma decisão de produto de uma linha.
 */
export function computeFlatAverage(categoryStats: CategoryStat[]): number | null {
  const all = categoryStats.flatMap(stat => stat.responses);
  if (all.length === 0) return null;
  const sum = all.reduce((acc, r) => acc + safeRating(r.rating), 0);
  return round2(sum / all.length);
}

export function computeEvaluationStats(input: EvaluationStatsInput): EvaluationStats {
  const categoryStats = computeCategoryStats(input);
  return {
    categoryStats,
    overallAverage: computeOverallAverage(categoryStats),
    flatAverage: computeFlatAverage(categoryStats),
    totalQuestions: categoryStats.reduce((sum, stat) => sum + stat.totalQuestions, 0),
  };
}
