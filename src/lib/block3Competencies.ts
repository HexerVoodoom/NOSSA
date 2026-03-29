import { Competency } from '../types';

// ============================================
// BLOCO 3 — RELAÇÃO COM CLIENTES E STAKEHOLDERS
// ============================================

export const block3Competencies: Competency[] = [
  // -------------------- COMPETÊNCIA: FOCO NO CLIENTE --------------------
  {
    id: 'comp-b3-foco-cliente',
    name: 'Foco no Cliente',
    description: '',
    categoryId: 'bloco3',
    questions: [
      { id: 'q-b3-fc-1', categoryId: 'bloco3', text: 'Prioriza as necessidades e a satisfação do cliente em suas ações.', order: 0, isBonus: false, competencyId: 'comp-b3-foco-cliente', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b3-fc-2', categoryId: 'bloco3', text: 'Antecipa-se aos problemas que podem afetar a experiência do cliente.', order: 1, isBonus: false, competencyId: 'comp-b3-foco-cliente', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b3-fc-dial', categoryId: 'bloco3', text: 'Considerando os projetos recentes, como você buscou entender e atender às expectativas do cliente e qual foi o impacto disso no resultado?', order: 2, isBonus: false, competencyId: 'comp-b3-foco-cliente', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 14,
  },
  
  // -------------------- COMPETÊNCIA: ATENÇÃO AO CLIENTE --------------------
  {
    id: 'comp-b3-atencao-cliente',
    name: 'Atenção ao Cliente',
    description: '',
    categoryId: 'bloco3',
    questions: [
      { id: 'q-b3-ac-1', categoryId: 'bloco3', text: 'Demonstra cuidado e dedicação no atendimento às demandas dos clientes.', order: 0, isBonus: false, competencyId: 'comp-b3-atencao-cliente', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b3-ac-2', categoryId: 'bloco3', text: 'Responde com clareza e agilidade às solicitações dos clientes.', order: 1, isBonus: false, competencyId: 'comp-b3-atencao-cliente', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b3-ac-dial', categoryId: 'bloco3', text: 'Pensando nas interações recentes, como você conduziu a comunicação e o suporte ao cliente e como avalia a percepção dele sobre o seu trabalho?', order: 2, isBonus: false, competencyId: 'comp-b3-atencao-cliente', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 15,
  },
  
  // -------------------- COMPETÊNCIA: NEGOCIAÇÃO / PERSUASÃO --------------------
  {
    id: 'comp-b3-negociacao',
    name: 'Negociação / Persuasão',
    description: '',
    categoryId: 'bloco3',
    questions: [
      { id: 'q-b3-np-1', categoryId: 'bloco3', text: 'Apresenta argumentos convincentes para defender ideias e soluções.', order: 0, isBonus: false, competencyId: 'comp-b3-negociacao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b3-np-2', categoryId: 'bloco3', text: 'Busca o equilíbrio entre os interesses da empresa e do cliente.', order: 1, isBonus: false, competencyId: 'comp-b3-negociacao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b3-np-dial', categoryId: 'bloco3', text: 'Nos projetos recentes, em quais situações você precisou negociar prazos ou soluções e como você conduziu esse processo para chegar a um acordo?', order: 2, isBonus: false, competencyId: 'comp-b3-negociacao', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 16,
  },
];
