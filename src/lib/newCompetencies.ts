import { Competency } from '../types';
import { block3Competencies } from './block3Competencies';
import { block4Competencies } from './block4Competencies';
import { block5Competencies } from './block5Competencies';
import { block6Competencies } from './block6Competencies';

// ============================================================================
// COMPETÊNCIAS UNIFICADAS - AFIRMAÇÕES + PERGUNTAS DIALÓGICAS
// ============================================================================

export const competencies: Competency[] = [
  
  // ============================================
  // BLOCO 1
  // ============================================
  
  {
    id: 'comp-b1-agilidade',
    name: 'Agilidade',
    description: '',
    categoryId: 'bloco1',
    questions: [
      { id: 'q-b1-agilidade-1', categoryId: 'bloco1', text: 'Realiza suas tarefas de forma rápida sem prejudicar a qualidade do trabalho.', order: 0, isBonus: false, competencyId: 'comp-b1-agilidade', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-agilidade-2', categoryId: 'bloco1', text: 'Identifica problemas com rapidez.', order: 1, isBonus: false, competencyId: 'comp-b1-agilidade', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-agilidade-3', categoryId: 'bloco1', text: 'Encontra soluções de forma eficaz e ágil.', order: 2, isBonus: false, competencyId: 'comp-b1-agilidade', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-agilidade-4', categoryId: 'bloco1', text: 'Utiliza o tempo necessário para executar suas atividades, sem excessos.', order: 3, isBonus: false, competencyId: 'comp-b1-agilidade', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-agilidade-dial', categoryId: 'bloco1', text: 'Pensando nos projetos mais recentes, de que forma você conduziu as entregas para cumprir os prazos e como avalia o resultado disso?', order: 4, isBonus: false, competencyId: 'comp-b1-agilidade', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 1,
  },
  {
    id: 'comp-b1-capacidade-execucao',
    name: 'Capacidade de Execução',
    description: '',
    categoryId: 'bloco1',
    questions: [
      { id: 'q-b1-exec-1', categoryId: 'bloco1', text: 'Consegue transformar planos em ações concretas.', order: 0, isBonus: false, competencyId: 'comp-b1-capacidade-execucao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-exec-2', categoryId: 'bloco1', text: 'Utiliza adequadamente os recursos disponíveis para atingir seus objetivos.', order: 1, isBonus: false, competencyId: 'comp-b1-capacidade-execucao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-exec-3', categoryId: 'bloco1', text: 'Atua de forma sistemática para concluir o que foi planejado.', order: 2, isBonus: false, competencyId: 'comp-b1-capacidade-execucao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-exec-dial', categoryId: 'bloco1', text: 'Considerando os últimos projetos, como aconteceu a passagem do planejamento para a execução e que efeito isso teve no trabalho realizado?', order: 3, isBonus: false, competencyId: 'comp-b1-capacidade-execucao', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 2,
  },
  {
    id: 'comp-b1-organizacao',
    name: 'Organização',
    description: '',
    categoryId: 'bloco1',
    questions: [
      { id: 'q-b1-org-1', categoryId: 'bloco1', text: 'Organiza previamente seu material e suas atividades de trabalho.', order: 0, isBonus: false, competencyId: 'comp-b1-organizacao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-org-2', categoryId: 'bloco1', text: 'Administra bem o tempo para realizar suas tarefas.', order: 1, isBonus: false, competencyId: 'comp-b1-organizacao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-org-3', categoryId: 'bloco1', text: 'Planeja as atividades antes de executá-las.', order: 2, isBonus: false, competencyId: 'comp-b1-organizacao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-org-4', categoryId: 'bloco1', text: 'Define metas claras alinhadas aos objetivos estabelecidos.', order: 3, isBonus: false, competencyId: 'comp-b1-organizacao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-org-dial', categoryId: 'bloco1', text: 'Nos projetos recentes, como você estruturou e organizou seu trabalho para dar andamento às atividades e como isso impactou o processo?', order: 4, isBonus: false, competencyId: 'comp-b1-organizacao', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 3,
  },
  {
    id: 'comp-b1-planejamento',
    name: 'Planejamento',
    description: '',
    categoryId: 'bloco1',
    questions: [
      { id: 'q-b1-plan-1', categoryId: 'bloco1', text: 'Estabelece objetivos e metas antes de iniciar suas atividades.', order: 0, isBonus: false, competencyId: 'comp-b1-planejamento', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-plan-2', categoryId: 'bloco1', text: 'Planeja considerando prioridades e recursos disponíveis.', order: 1, isBonus: false, competencyId: 'comp-b1-planejamento', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-plan-3', categoryId: 'bloco1', text: 'Ajusta o planejamento quando surgem mudanças.', order: 2, isBonus: false, competencyId: 'comp-b1-planejamento', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-plan-4', categoryId: 'bloco1', text: 'Antecipa recursos necessários para executar suas demandas.', order: 3, isBonus: false, competencyId: 'comp-b1-planejamento', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-plan-dial', categoryId: 'bloco1', text: 'Ao lembrar dos últimos projetos, como você se organizou antes de iniciar as atividades e em que medida isso contribuiu para o desenvolvimento do trabalho?', order: 4, isBonus: false, competencyId: 'comp-b1-planejamento', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 4,
  },
  {
    id: 'comp-b1-priorizacao',
    name: 'Priorização',
    description: '',
    categoryId: 'bloco1',
    questions: [
      { id: 'q-b1-prior-1', categoryId: 'bloco1', text: 'Prioriza tarefas de forma eficiente.', order: 0, isBonus: false, competencyId: 'comp-b1-priorizacao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-prior-2', categoryId: 'bloco1', text: 'Identifica corretamente o que é mais importante e urgente.', order: 1, isBonus: false, competencyId: 'comp-b1-priorizacao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-prior-dial', categoryId: 'bloco1', text: 'Nos projetos mais recentes, como você definiu o que precisava ser feito primeiro e como avalia os resultados dessa escolha?', order: 2, isBonus: false, competencyId: 'comp-b1-priorizacao', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 5,
  },
  {
    id: 'comp-b1-orientacao-resultado',
    name: 'Orientação para Resultado',
    description: '',
    categoryId: 'bloco1',
    questions: [
      { id: 'q-b1-result-1', categoryId: 'bloco1', text: 'Estabelece metas claras e mensuráveis.', order: 0, isBonus: false, competencyId: 'comp-b1-orientacao-resultado', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-result-2', categoryId: 'bloco1', text: 'Busca maximizar produtividade e eficiência.', order: 1, isBonus: false, competencyId: 'comp-b1-orientacao-resultado', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-result-3', categoryId: 'bloco1', text: 'Monitora o progresso das atividades.', order: 2, isBonus: false, competencyId: 'comp-b1-orientacao-resultado', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-result-4', categoryId: 'bloco1', text: 'Corrige desvios que possam comprometer os resultados.', order: 3, isBonus: false, competencyId: 'comp-b1-orientacao-resultado', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-result-5', categoryId: 'bloco1', text: 'Mantém foco nas atividades prioritárias e nos prazos.', order: 4, isBonus: false, competencyId: 'comp-b1-orientacao-resultado', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-result-dial', categoryId: 'bloco1', text: 'Pensando nos projetos recentes, de que forma você acompanhou se o trabalho estava caminhando para os resultados esperados e como isso funcionou na prática?', order: 5, isBonus: false, competencyId: 'comp-b1-orientacao-resultado', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 6,
  },
  {
    id: 'comp-b1-atencao-concentrada',
    name: 'Atenção Concentrada',
    description: '',
    categoryId: 'bloco1',
    questions: [
      { id: 'q-b1-atenc-1', categoryId: 'bloco1', text: 'Mantém atenção em uma tarefa mesmo em ambientes com interferências.', order: 0, isBonus: false, competencyId: 'comp-b1-atencao-concentrada', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-atenc-2', categoryId: 'bloco1', text: 'Demonstra preocupação constante em executar o trabalho sem erros.', order: 1, isBonus: false, competencyId: 'comp-b1-atencao-concentrada', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-atenc-3', categoryId: 'bloco1', text: 'Identifica erros ou inconsistências no fluxo de atividades.', order: 2, isBonus: false, competencyId: 'comp-b1-atencao-concentrada', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-atenc-dial', categoryId: 'bloco1', text: 'Ao longo dos últimos projetos, como foi sua experiência em manter o foco durante a execução das atividades e quais efeitos isso teve no trabalho?', order: 3, isBonus: false, competencyId: 'comp-b1-atencao-concentrada', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 7,
  },
  {
    id: 'comp-b1-detalhista',
    name: 'Detalhista',
    description: '',
    categoryId: 'bloco1',
    questions: [
      { id: 'q-b1-detal-1', categoryId: 'bloco1', text: 'Garante precisão e qualidade em cada etapa do trabalho.', order: 0, isBonus: false, competencyId: 'comp-b1-detalhista', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-detal-2', categoryId: 'bloco1', text: 'Dedica tempo necessário para revisar e corrigir detalhes.', order: 1, isBonus: false, competencyId: 'comp-b1-detalhista', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b1-detal-dial', categoryId: 'bloco1', text: 'Considerando as entregas dos últimos projetos, como você lidou com os detalhes e revisões e como isso se refletiu no resultado final?', order: 2, isBonus: false, competencyId: 'comp-b1-detalhista', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 8,
  },

  // ============================================
  // BLOCO 2
  // ============================================

  {
    id: 'comp-b2-raciocinio-logico',
    name: 'Raciocínio Lógico',
    description: '',
    categoryId: 'bloco2',
    questions: [
      { id: 'q-b2-rl-1', categoryId: 'bloco2', text: 'Analisa informações de forma objetiva e lógica.', order: 0, isBonus: false, competencyId: 'comp-b2-raciocinio-logico', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-rl-2', categoryId: 'bloco2', text: 'Resolve problemas de maneira sistemática.', order: 1, isBonus: false, competencyId: 'comp-b2-raciocinio-logico', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-rl-3', categoryId: 'bloco2', text: 'Baseia decisões em evidências.', order: 2, isBonus: false, competencyId: 'comp-b2-raciocinio-logico', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-rl-dial', categoryId: 'bloco2', text: 'Pensando nos últimos projetos, como você analisou as informações e chegou às decisões necessárias, e como avalia os resultados disso?', order: 3, isBonus: false, competencyId: 'comp-b2-raciocinio-logico', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 9,
  },
  {
    id: 'comp-b2-raciocinio-abstrato',
    name: 'Raciocínio Abstrato',
    description: '',
    categoryId: 'bloco2',
    questions: [
      { id: 'q-b2-ra-1', categoryId: 'bloco2', text: 'Conecta ideias complexas e identifica padrões não evidentes.', order: 0, isBonus: false, competencyId: 'comp-b2-raciocinio-abstrato', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-ra-2', categoryId: 'bloco2', text: 'Visualiza conceitos futuros e relações sistêmicas.', order: 1, isBonus: false, competencyId: 'comp-b2-raciocinio-abstrato', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-ra-dial', categoryId: 'bloco2', text: 'Ao olhar para os projetos mais recentes, como você conectou ideias e pensou em cenários possíveis para o trabalho, e quanto isso ajudou no resultado final?', order: 2, isBonus: false, competencyId: 'comp-b2-raciocinio-abstrato', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 10,
  },
  {
    id: 'comp-b2-capacidade-investigativa',
    name: 'Capacidade Investigativa',
    description: '',
    categoryId: 'bloco2',
    questions: [
      { id: 'q-b2-ci-1', categoryId: 'bloco2', text: 'Busca ativamente informações para compreender problemas.', order: 0, isBonus: false, competencyId: 'comp-b2-capacidade-investigativa', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-ci-2', categoryId: 'bloco2', text: 'Utiliza fontes variadas para aprofundar o entendimento.', order: 1, isBonus: false, competencyId: 'comp-b2-capacidade-investigativa', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-ci-3', categoryId: 'bloco2', text: 'Não se contenta com respostas superficiais.', order: 2, isBonus: false, competencyId: 'comp-b2-capacidade-investigativa', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-ci-dial', categoryId: 'bloco2', text: 'Nos últimos projetos, quando surgiram dúvidas ou problemas, como você buscou informações para entender melhor a situação e como isso funcionou na prática?', order: 3, isBonus: false, competencyId: 'comp-b2-capacidade-investigativa', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 11,
  },
  {
    id: 'comp-b2-senso-critico',
    name: 'Senso Crítico',
    description: '',
    categoryId: 'bloco2',
    questions: [
      { id: 'q-b2-sc-1', categoryId: 'bloco2', text: 'Questiona suposições e processos estabelecidos.', order: 0, isBonus: false, competencyId: 'comp-b2-senso-critico', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-sc-2', categoryId: 'bloco2', text: 'Analisa informações antes de aceitar conclusões.', order: 1, isBonus: false, competencyId: 'comp-b2-senso-critico', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-sc-dial', categoryId: 'bloco2', text: 'Pensando nos projetos recentes, como você questionou práticas, informações ou conclusões prontas ao longo do trabalho, e como isso impactou os resultados?', order: 2, isBonus: false, competencyId: 'comp-b2-senso-critico', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 12,
  },
  {
    id: 'comp-b2-resolucao-problemas',
    name: 'Resolução de Problemas',
    description: '',
    categoryId: 'bloco2',
    questions: [
      { id: 'q-b2-rp-1', categoryId: 'bloco2', text: 'Identifica as causas reais dos problemas.', order: 0, isBonus: false, competencyId: 'comp-b2-resolucao-problemas', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-rp-2', categoryId: 'bloco2', text: 'Propõe soluções práticas e eficazes.', order: 1, isBonus: false, competencyId: 'comp-b2-resolucao-problemas', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-rp-3', categoryId: 'bloco2', text: 'Direciona esforços para resolver problemas de forma objetiva.', order: 2, isBonus: false, competencyId: 'comp-b2-resolucao-problemas', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-rp-dial', categoryId: 'bloco2', text: 'Nos últimos projetos, quando surgiram problemas, como você lidou com eles desde a identificação até a solução e como avalia o efeito disso no trabalho?', order: 3, isBonus: false, competencyId: 'comp-b2-resolucao-problemas', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 13,
  },
  {
    id: 'comp-b2-tomada-decisao',
    name: 'Tomada de Decisão',
    description: '',
    categoryId: 'bloco2',
    questions: [
      { id: 'q-b2-td-1', categoryId: 'bloco2', text: 'Analisa riscos e benefícios antes de agir.', order: 0, isBonus: false, competencyId: 'comp-b2-tomada-decisao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-td-2', categoryId: 'bloco2', text: 'Decide com base no alinhamento estratégico da empresa.', order: 1, isBonus: false, competencyId: 'comp-b2-tomada-decisao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b2-td-dial', categoryId: 'bloco2', text: 'Nos projetos recentes, como você tomou as decisões mais importantes e de que forma elas contribuíram para o avanço das demandas?', order: 2, isBonus: false, competencyId: 'comp-b2-tomada-decisao', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 13.5,
  },

  ...block3Competencies,
  ...block4Competencies,
  ...block5Competencies,
  ...block6Competencies
];

export const traditionalCompetencies = competencies.filter(c => 
  c.questions.some(q => q.evaluationType === 'tradicional')
);

export const dialogicCompetencies = competencies.filter(c => 
  c.questions.some(q => q.evaluationType === 'dialogica')
);
