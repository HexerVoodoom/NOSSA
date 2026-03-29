import { Competency } from '../types';

// ============================================
// BLOCO 6 — DESENVOLVIMENTO, ADAPTAÇÃO E FUTURO
// ============================================

export const block6Competencies: Competency[] = [
  // -------------------- COMPETÊNCIA: APRENDIZADO CONTÍNUO --------------------
  {
    id: 'comp-b6-aprendizado-continuo',
    name: 'Aprendizado Contínuo',
    description: '',
    categoryId: 'bloco6',
    questions: [
      { id: 'q-b6-ac-1', categoryId: 'bloco6', text: 'Busca aprendizado contínuo para aprimorar sua atuação.', order: 0, isBonus: false, competencyId: 'comp-b6-aprendizado-continuo', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-ac-2', categoryId: 'bloco6', text: 'Demonstra interesse em desenvolver novas habilidades.', order: 1, isBonus: false, competencyId: 'comp-b6-aprendizado-continuo', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-ac-dial', categoryId: 'bloco6', text: 'Pensando nas experiências de trabalho mais recentes, como você buscou aprender coisas novas e como avalia os efeitos disso?', order: 2, isBonus: false, competencyId: 'comp-b6-aprendizado-continuo', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 31,
  },
  
  // -------------------- COMPETÊNCIA: ADAPTAÇÃO ÀS MUDANÇAS --------------------
  {
    id: 'comp-b6-adaptacao-mudancas',
    name: 'Adaptação às Mudanças',
    description: '',
    categoryId: 'bloco6',
    questions: [
      { id: 'q-b6-am-1', categoryId: 'bloco6', text: 'Adapta-se a mudanças com flexibilidade.', order: 0, isBonus: false, competencyId: 'comp-b6-adaptacao-mudancas', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-am-2', categoryId: 'bloco6', text: 'Mantém desempenho mesmo diante de cenários novos ou incertos.', order: 1, isBonus: false, competencyId: 'comp-b6-adaptacao-mudancas', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-am-dial', categoryId: 'bloco6', text: 'Considerando mudanças recentes no trabalho, como você lidou com essas situações e como isso funcionou para dar continuidade às atividades?', order: 2, isBonus: false, competencyId: 'comp-b6-adaptacao-mudancas', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 32,
  },
  
  // -------------------- COMPETÊNCIA: ABERTURA AO FEEDBACK --------------------
  {
    id: 'comp-b6-abertura-feedback',
    name: 'Abertura ao Feedback',
    description: '',
    categoryId: 'bloco6',
    questions: [
      { id: 'q-b6-af-1', categoryId: 'bloco6', text: 'Utiliza feedbacks como oportunidade de desenvolvimento.', order: 0, isBonus: false, competencyId: 'comp-b6-abertura-feedback', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-af-2', categoryId: 'bloco6', text: 'Solicita feedbacks para aprimorar sua atuação.', order: 1, isBonus: false, competencyId: 'comp-b6-abertura-feedback', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-af-dial', categoryId: 'bloco6', text: 'Pensando em situações recentes, como você lidou com feedbacks recebidos e como isso contribuiu para seu desenvolvimento?', order: 2, isBonus: false, competencyId: 'comp-b6-abertura-feedback', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 33,
  },
  
  // -------------------- COMPETÊNCIA: AUTODESENVOLVIMENTO --------------------
  {
    id: 'comp-b6-autodesenvolvimento',
    name: 'Autodesenvolvimento',
    description: '',
    categoryId: 'bloco6',
    questions: [
      { id: 'q-b6-ad-1', categoryId: 'bloco6', text: 'Reflete sobre sua própria atuação.', order: 0, isBonus: false, competencyId: 'comp-b6-autodesenvolvimento', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-ad-2', categoryId: 'bloco6', text: 'Busca evolução pessoal e profissional.', order: 1, isBonus: false, competencyId: 'comp-b6-autodesenvolvimento', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-ad-dial', categoryId: 'bloco6', text: 'Considerando seu trabalho recente, como você refletiu sobre seu próprio desempenho e como isso ajudou a orientar melhorias?', order: 2, isBonus: false, competencyId: 'comp-b6-autodesenvolvimento', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 34,
  },
  
  // -------------------- COMPETÊNCIA: VISÃO DE FUTURO --------------------
  {
    id: 'comp-b6-visao-futuro',
    name: 'Visão de Futuro',
    description: '',
    categoryId: 'bloco6',
    questions: [
      { id: 'q-b6-vf-1', categoryId: 'bloco6', text: 'Planeja seu desenvolvimento profissional a médio e longo prazo.', order: 0, isBonus: false, competencyId: 'comp-b6-visao-futuro', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-vf-2', categoryId: 'bloco6', text: 'Alinha expectativas pessoais aos objetivos da organização.', order: 1, isBonus: false, competencyId: 'comp-b6-visao-futuro', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-vf-dial', categoryId: 'bloco6', text: 'Pensando no momento atual da sua carreira, como você tem refletido sobre seus próximos passos profissionais?', order: 2, isBonus: false, competencyId: 'comp-b6-visao-futuro', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 35,
  },
  
  // -------------------- COMPETÊNCIA: PROATIVIDADE NO DESENVOLVIMENTO --------------------
  {
    id: 'comp-b6-proatividade-desenvolvimento',
    name: 'Proatividade no Desenvolvimento',
    description: '',
    categoryId: 'bloco6',
    questions: [
      { id: 'q-b6-pd-1', categoryId: 'bloco6', text: 'Busca oportunidades de crescimento dentro da organização.', order: 0, isBonus: false, competencyId: 'comp-b6-proatividade-desenvolvimento', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-pd-2', categoryId: 'bloco6', text: 'Age de forma ativa para evoluir profissionalmente.', order: 1, isBonus: false, competencyId: 'comp-b6-proatividade-desenvolvimento', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b6-pd-dial', categoryId: 'bloco6', text: 'Considerando as oportunidades recentes no trabalho, como você tomou iniciativas para se desenvolver profissionalmente?', order: 2, isBonus: false, competencyId: 'comp-b6-proatividade-desenvolvimento', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 36,
  },
];
