import { Competency } from '../types';

// ============================================
// BLOCO 5 — POSTURA PROFISSIONAL E ÉTICA
// ============================================

export const block5Competencies: Competency[] = [
  // -------------------- COMPETÊNCIA: COMPROMETIMENTO --------------------
  {
    id: 'comp-b5-comprometimento',
    name: 'Comprometimento',
    description: '',
    categoryId: 'bloco5',
    questions: [
      { id: 'q-b5-comp-1', categoryId: 'bloco5', text: 'Assume as responsabilidades do seu cargo.', order: 0, isBonus: false, competencyId: 'comp-b5-comprometimento', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-comp-2', categoryId: 'bloco5', text: 'Cumpre combinados e prazos acordados.', order: 1, isBonus: false, competencyId: 'comp-b5-comprometimento', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-comp-dial', categoryId: 'bloco5', text: 'Pensando nas atividades e projetos mais recentes, como você lidou com responsabilidades, prazos e combinados assumidos, e como avalia o resultado disso?', order: 2, isBonus: false, competencyId: 'comp-b5-comprometimento', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 25,
  },
  
  // -------------------- COMPETÊNCIA: RESPONSABILIDADE --------------------
  {
    id: 'comp-b5-responsabilidade',
    name: 'Responsabilidade',
    description: '',
    categoryId: 'bloco5',
    questions: [
      { id: 'q-b5-resp-1', categoryId: 'bloco5', text: 'Demonstra segurança ao exercer suas funções.', order: 0, isBonus: false, competencyId: 'comp-b5-responsabilidade', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-resp-2', categoryId: 'bloco5', text: 'Assume erros e falhas com transparência.', order: 1, isBonus: false, competencyId: 'comp-b5-responsabilidade', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-resp-dial', categoryId: 'bloco5', text: 'Considerando situações recentes de trabalho, como você lidou com erros, imprevistos ou falhas quando eles aconteceram, e como isso funcionou na prática?', order: 2, isBonus: false, competencyId: 'comp-b5-responsabilidade', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 26,
  },
  
  // -------------------- COMPETÊNCIA: COMPORTAMENTO ÉTICO --------------------
  {
    id: 'comp-b5-comportamento-etico',
    name: 'Comportamento Ético',
    description: '',
    categoryId: 'bloco5',
    questions: [
      { id: 'q-b5-ce-1', categoryId: 'bloco5', text: 'Age de acordo com princípios éticos e valores morais.', order: 0, isBonus: false, competencyId: 'comp-b5-comportamento-etico', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-ce-2', categoryId: 'bloco5', text: 'Toma decisões baseadas em princípios éticos sólidos.', order: 1, isBonus: false, competencyId: 'comp-b5-comportamento-etico', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-ce-dial', categoryId: 'bloco5', text: 'Pensando nas decisões e situações recentes do trabalho, como você considerou aspectos éticos no dia a dia e como avalia os efeitos dessas escolhas?', order: 2, isBonus: false, competencyId: 'comp-b5-comportamento-etico', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 27,
  },
  
  // -------------------- COMPETÊNCIA: CONFIABILIDADE --------------------
  {
    id: 'comp-b5-confiabilidade',
    name: 'Confiabilidade',
    description: '',
    categoryId: 'bloco5',
    questions: [
      { id: 'q-b5-conf-1', categoryId: 'bloco5', text: 'Cumpre o que promete.', order: 0, isBonus: false, competencyId: 'comp-b5-confiabilidade', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-conf-2', categoryId: 'bloco5', text: 'Demonstra coerência entre discurso e prática.', order: 1, isBonus: false, competencyId: 'comp-b5-confiabilidade', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-conf-dial', categoryId: 'bloco5', text: 'Nos projetos mais recentes, como foi a relação entre o que você combinou ou prometeu e o que de fato entregou, e como isso funcionou para o trabalho?', order: 2, isBonus: false, competencyId: 'comp-b5-confiabilidade', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 28,
  },
  
  // -------------------- COMPETÊNCIA: TRANSPARÊNCIA --------------------
  {
    id: 'comp-b5-transparencia',
    name: 'Transparência',
    description: '',
    categoryId: 'bloco5',
    questions: [
      { id: 'q-b5-trans-1', categoryId: 'bloco5', text: 'Compartilha informações relevantes de forma clara e no tempo adequado.', order: 0, isBonus: false, competencyId: 'comp-b5-transparencia', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-trans-2', categoryId: 'bloco5', text: 'Expõe suas intenções, limites e dificuldades com honestidade.', order: 1, isBonus: false, competencyId: 'comp-b5-transparencia', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-trans-dial', categoryId: 'bloco5', text: 'Pensando nas situações recentes do trabalho, como você compartilhou informações, limites ou dificuldades com as pessoas envolvidas, e como isso impactou o andamento das atividades?', order: 2, isBonus: false, competencyId: 'comp-b5-transparencia', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 29,
  },
  
  // -------------------- COMPETÊNCIA: SIGILO --------------------
  {
    id: 'comp-b5-sigilo',
    name: 'Sigilo',
    description: '',
    categoryId: 'bloco5',
    questions: [
      { id: 'q-b5-sig-1', categoryId: 'bloco5', text: 'Mantém informações confidenciais em absoluto sigilo.', order: 0, isBonus: false, competencyId: 'comp-b5-sigilo', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-sig-2', categoryId: 'bloco5', text: 'Age com discrição em assuntos sensíveis.', order: 1, isBonus: false, competencyId: 'comp-b5-sigilo', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b5-sig-dial', categoryId: 'bloco5', text: 'Considerando situações recentes que envolveram informações sensíveis ou assuntos delicados, como você lidou com essas informações e como avalia os resultados dessa postura?', order: 2, isBonus: false, competencyId: 'comp-b5-sigilo', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 30,
  },
];
