import { describe, it, expect } from 'vitest';
import {
  computeCategoryStats,
  computeEvaluationStats,
  computeFlatAverage,
  computeOverallAverage,
} from '../evaluationStats';
import type { Question, QuestionResponse } from '../../types';
import { defaultLibrary } from '../defaultLibrary';

const kw: [string, string, string] = ['a', 'b', 'c'];

const resp = (questionId: string, rating: number): QuestionResponse => ({
  questionId,
  keywords: kw,
  rating,
  selectedElementId: '',
});

// Bloco 1 com 3 respostas fracas, bloco 2 com 1 resposta forte.
const questions: Question[] = [
  { id: 'q1', categoryId: 'bloco1', text: 'q1', order: 1, type: 'statement' },
  { id: 'q2', categoryId: 'bloco1', text: 'q2', order: 2, type: 'statement' },
  { id: 'q3', categoryId: 'bloco1', text: 'q3', order: 3, type: 'statement' },
  { id: 'q4', categoryId: 'bloco2', text: 'q4', order: 4, type: 'statement' },
  { id: 'qd', categoryId: 'bloco1', text: 'dialógica', order: 5, type: 'dialogic' },
];

const responses = [resp('q1', 1), resp('q2', 1), resp('q3', 1), resp('q4', 5)];

describe('evaluationStats — média única para galeria, detalhe e PDF', () => {
  it('[regressão] a média geral é a média das médias por bloco, não a média das notas', () => {
    const stats = computeEvaluationStats({
      responses,
      evaluationType: 'tradicional',
      questions,
    });

    // bloco1 = 1.0 (3 perguntas), bloco2 = 5.0 (1 pergunta)
    expect(stats.categoryStats.map(s => s.averageRating)).toEqual([1, 5]);
    // Média das médias: (1 + 5) / 2 = 3.0 — este é o número exibido no produto.
    expect(stats.overallAverage).toBe(3);
    // Média simples (o que a galeria fazia antes): (1+1+1+5)/4 = 2.0.
    // Se as duas coincidissem, este teste não distinguiria as semânticas.
    expect(stats.flatAverage).toBe(2);
    expect(stats.flatAverage).not.toBe(stats.overallAverage);
    expect(stats.totalQuestions).toBe(4);
  });

  it('[regressão] respostas de outro tipo de avaliação não entram na conta', () => {
    // Numa avaliação tradicional, a resposta dialógica (nota 5) é ignorada.
    const comDialogica = [...responses, resp('qd', 5)];

    const tradicional = computeEvaluationStats({
      responses: comDialogica,
      evaluationType: 'tradicional',
      questions,
    });
    expect(tradicional.totalQuestions).toBe(4);
    expect(tradicional.overallAverage).toBe(3);

    // A média simples sobre TODAS as respostas gravadas daria (1+1+1+5+5)/5 = 2.6:
    // era exatamente essa divergência entre galeria e detalhe.
    const flatSobreTudo =
      comDialogica.reduce((s, r) => s + r.rating, 0) / comDialogica.length;
    expect(flatSobreTudo).not.toBe(tradicional.overallAverage);
  });

  it('atividades contam todas as respostas quando activityIds não é informado', () => {
    const atividades = [resp('a1', 4), resp('a2', 2)];

    const semFiltro = computeEvaluationStats({
      responses: atividades,
      evaluationType: 'atividades',
      questions: [],
    });
    expect(semFiltro.totalQuestions).toBe(2);
    expect(semFiltro.overallAverage).toBe(3);

    const comFiltro = computeEvaluationStats({
      responses: atividades,
      evaluationType: 'atividades',
      questions: [],
      activityIds: ['a1'],
    });
    expect(comFiltro.totalQuestions).toBe(1);
    expect(comFiltro.overallAverage).toBe(4);
  });

  it('não renderiza NaN: sem respostas, respostas inválidas ou notas corrompidas', () => {
    for (const bad of [undefined, null, []]) {
      const stats = computeEvaluationStats({
        responses: bad as QuestionResponse[] | null | undefined,
        evaluationType: 'tradicional',
        questions,
      });
      expect(stats.categoryStats).toEqual([]);
      expect(stats.overallAverage).toBe(0);
      expect(stats.flatAverage).toBeNull();
      expect(Number.isNaN(stats.overallAverage)).toBe(false);
    }

    // Nota corrompida vale 0 e NÃO contamina a soma: bloco1 = (0 + 4) / 2 = 2.
    // Se o NaN vazasse para a soma, a média do bloco viraria NaN.
    const corrompidas = [
      { questionId: 'q1', keywords: kw, rating: NaN, selectedElementId: '' },
      { questionId: 'q2', keywords: kw, rating: 4, selectedElementId: '' },
      { questionId: 'q3', keywords: kw, rating: undefined, selectedElementId: '' },
      { questionId: 'q4', keywords: kw, rating: '5', selectedElementId: '' },
    ] as unknown as QuestionResponse[];

    const stats = computeEvaluationStats({
      responses: corrompidas,
      evaluationType: 'tradicional',
      questions,
    });
    const bloco1 = stats.categoryStats.find(s => s.category.id === 'bloco1')!;
    expect(bloco1.averageRating).toBe(1.33); // (0 + 4 + 0) / 3
    const bloco2 = stats.categoryStats.find(s => s.category.id === 'bloco2')!;
    expect(bloco2.averageRating).toBe(0); // '5' é string: não é nota válida
    expect(stats.categoryStats.every(s => Number.isFinite(s.averageRating))).toBe(true);
    expect(Number.isNaN(stats.overallAverage)).toBe(false);
    expect(stats.overallAverage).toBe(0.67);
    expect(stats.overallAverage.toFixed(1)).not.toContain('NaN');
  });

  it('blocos sem respostas somem em vez de virar 0/0', () => {
    const stats = computeCategoryStats({
      responses: [resp('q4', 3)],
      evaluationType: 'tradicional',
      questions,
    });
    expect(stats).toHaveLength(1);
    expect(stats[0].category.id).toBe('bloco2');
    expect(computeOverallAverage([])).toBe(0);
    expect(computeFlatAverage([])).toBeNull();
  });
});

// Paridade contra os DADOS REAIS, com implementação independente.
//
// A primeira versão deste teste era circular: recalculava a "fórmula antiga" a
// partir do agrupamento do próprio módulo novo, então só verificava a divisão
// final. O agrupamento e o filtro por tipo — que são a substância da extração —
// ficavam sem cobertura. Aqui a réplica reimplementa o pdfExport original desde
// as respostas cruas, e roda sobre as duas avaliações de defaultLibrary.json.
describe('paridade com a fórmula original do pdfExport, sobre dados reais', () => {
  const BLOCOS = ['bloco1', 'bloco2', 'bloco3', 'bloco4', 'bloco5', 'bloco6'];

  // Réplica literal do pdfExport antes da extração — independente do módulo novo.
  const calculoAntigo = (work: any, questions: Question[]) => {
    const stats = BLOCOS.map(id => {
      const rs = (work.responses || []).filter((r: any) => {
        const q = questions.find(q => q.id === r.questionId);
        if (!q || q.categoryId !== id) return false;
        if (work.evaluationType === 'tradicional' && q.type === 'dialogic') return false;
        if (work.evaluationType === 'dialogica' && q.type === 'statement') return false;
        return true;
      });
      const total = rs.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
      return { n: rs.length, avg: rs.length ? parseFloat((total / rs.length).toFixed(2)) : 0 };
    }).filter(s => s.n > 0);

    return {
      blocos: stats.length,
      perguntas: stats.reduce((a, s) => a + s.n, 0),
      overall: stats.length ? parseFloat((stats.reduce((a, s) => a + s.avg, 0) / stats.length).toFixed(2)) : 0,
    };
  };

  it.each(defaultLibrary.evaluations.map(e => [e.collaboratorName as string, e] as const))(
    'avaliação de %s produz os mesmos números que antes',
    (_nome, work: any) => {
      const role = defaultLibrary.roles.find(r => r.id === work.roleId) as any;
      const questions = [
        ...defaultLibrary.competencies.flatMap((c: any) => c.questions || []),
        ...((role?.customQuestions || []) as Question[]),
      ] as Question[];

      const antigo = calculoAntigo(work, questions);
      const novo = computeEvaluationStats({
        responses: work.responses,
        evaluationType: work.evaluationType,
        questions,
      });

      expect(novo.categoryStats.length).toBe(antigo.blocos);
      expect(novo.totalQuestions).toBe(antigo.perguntas);
      expect(novo.overallAverage).toBe(antigo.overall);
      // Os dados reais precisam produzir algo: um teste que compara 0 com 0 passa
      // por acidente e não prova nada sobre o agrupamento.
      expect(antigo.perguntas).toBeGreaterThan(0);
      expect(antigo.overall).toBeGreaterThan(0);
    }
  );
});
