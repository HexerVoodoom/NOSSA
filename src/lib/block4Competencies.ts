import { Competency } from '../types';

// ============================================
// BLOCO 4 — RELAÇÕES INTERNAS E COLABORAÇÃO
// ============================================

export const block4Competencies: Competency[] = [
  // -------------------- COMPETÊNCIA: COMUNICAÇÃO --------------------
  {
    id: 'comp-b4-comunicacao',
    name: 'Comunicação',
    description: '',
    categoryId: 'bloco4',
    questions: [
      { id: 'q-b4-com-1', categoryId: 'bloco4', text: 'Expressa suas ideias de forma clara, objetiva e estruturada.', order: 0, isBonus: false, competencyId: 'comp-b4-comunicacao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-com-2', categoryId: 'bloco4', text: 'Ouve ativamente e demonstra compreensão sobre o que foi comunicado.', order: 1, isBonus: false, competencyId: 'comp-b4-comunicacao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-com-3', categoryId: 'bloco4', text: 'Utiliza canais adequados para cada tipo de mensagem.', order: 2, isBonus: false, competencyId: 'comp-b4-comunicacao', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-com-dial', categoryId: 'bloco4', text: 'Considerando as interações recentes, como você avalia sua clareza ao passar informações e como garante que o que foi dito foi realmente compreendido?', order: 3, isBonus: false, competencyId: 'comp-b4-comunicacao', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 18,
  },

  // -------------------- COMPETÊNCIA: TRABALHO EM EQUIPE --------------------
  {
    id: 'comp-b4-trabalho-equipe',
    name: 'Trabalho em Equipe',
    description: '',
    categoryId: 'bloco4',
    questions: [
      { id: 'q-b4-te-1', categoryId: 'bloco4', text: 'Colabora ativamente com os membros da equipe para atingir objetivos comuns.', order: 0, isBonus: false, competencyId: 'comp-b4-trabalho-equipe', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-te-2', categoryId: 'bloco4', text: 'Adapta-se às diferentes necessidades e estilos de trabalho dos membros da equipe.', order: 1, isBonus: false, competencyId: 'comp-b4-trabalho-equipe', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-te-3', categoryId: 'bloco4', text: 'Oferece ajuda aos colegas quando percebe a oportunidade.', order: 2, isBonus: false, competencyId: 'comp-b4-trabalho-equipe', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-te-4', categoryId: 'bloco4', text: 'Recebe feedbacks com abertura e positividade.', order: 3, isBonus: false, competencyId: 'comp-b4-trabalho-equipe', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-te-dial', categoryId: 'bloco4', text: 'Pensando nos projetos mais recentes, como foi sua atuação em conjunto com o time e como isso funcionou no andamento do trabalho?', order: 4, isBonus: false, competencyId: 'comp-b4-trabalho-equipe', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 19,
  },
  
  // -------------------- COMPETÊNCIA: RELACIONAMENTO INTERPESSOAL --------------------
  {
    id: 'comp-b4-relacionamento-interpessoal',
    name: 'Relacionamento Interpessoal',
    description: '',
    categoryId: 'bloco4',
    questions: [
      { id: 'q-b4-ri-1', categoryId: 'bloco4', text: 'Mantém bons relacionamentos com colegas e liderança.', order: 0, isBonus: false, competencyId: 'comp-b4-relacionamento-interpessoal', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-ri-2', categoryId: 'bloco4', text: 'Demonstra aceitação e respeito pelas diferenças.', order: 1, isBonus: false, competencyId: 'comp-b4-relacionamento-interpessoal', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-ri-3', categoryId: 'bloco4', text: 'Contribui para a construção de um clima organizacional favorável.', order: 2, isBonus: false, competencyId: 'comp-b4-relacionamento-interpessoal', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-ri-dial', categoryId: 'bloco4', text: 'Considerando as interações mais recentes no trabalho, como você se relacionou com colegas de diferentes perfis e como avalia o impacto disso no ambiente?', order: 3, isBonus: false, competencyId: 'comp-b4-relacionamento-interpessoal', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 20,
  },
  
  // -------------------- COMPETÊNCIA: CORDIALIDADE --------------------
  {
    id: 'comp-b4-cordialidade',
    name: 'Cordialidade',
    description: '',
    categoryId: 'bloco4',
    questions: [
      { id: 'q-b4-cor-1', categoryId: 'bloco4', text: 'Estabelece relacionamento gentil e cuidadoso com todas as pessoas.', order: 0, isBonus: false, competencyId: 'comp-b4-cordialidade', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-cor-2', categoryId: 'bloco4', text: 'Pratica tolerância ao lidar com diferenças de opinião.', order: 1, isBonus: false, competencyId: 'comp-b4-cordialidade', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-cor-dial', categoryId: 'bloco4', text: 'Pensando nas situações recentes do trabalho, como foi sua postura no trato diário com as pessoas e como isso funcionou na prática?', order: 2, isBonus: false, competencyId: 'comp-b4-cordialidade', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 21,
  },
  
  // -------------------- COMPETÊNCIA: EMPATIA --------------------
  {
    id: 'comp-b4-empatia',
    name: 'Empatia',
    description: '',
    categoryId: 'bloco4',
    questions: [
      { id: 'q-b4-emp-1', categoryId: 'bloco4', text: 'Ajusta sua comunicação ao contexto emocional da outra pessoa.', order: 0, isBonus: false, competencyId: 'comp-b4-empatia', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-emp-2', categoryId: 'bloco4', text: 'Demonstra sensibilidade diante das necessidades e dificuldades dos colegas.', order: 1, isBonus: false, competencyId: 'comp-b4-empatia', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-emp-3', categoryId: 'bloco4', text: 'Ouve o outro com atenção genuína.', order: 2, isBonus: false, competencyId: 'comp-b4-empatia', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-emp-dial', categoryId: 'bloco4', text: 'Nos projetos e interações mais recentes, como você lidou com as necessidades dos colegas e como isso influenciou as relações?', order: 3, isBonus: false, competencyId: 'comp-b4-empatia', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 22,
  },
  
  // -------------------- COMPETÊNCIA: RESOLUÇÃO DE CONFLITOS --------------------
  {
    id: 'comp-b4-resolucao-conflitos',
    name: 'Resolução de Conflitos',
    description: '',
    categoryId: 'bloco4',
    questions: [
      { id: 'q-b4-rc-1', categoryId: 'bloco4', text: 'Escuta ativamente as perspectivas das pessoas envolvidas em conflitos.', order: 0, isBonus: false, competencyId: 'comp-b4-resolucao-conflitos', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-rc-2', categoryId: 'bloco4', text: 'Busca soluções práticas e eficazes para resolver conflitos.', order: 1, isBonus: false, competencyId: 'comp-b4-resolucao-conflitos', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-rc-dial', categoryId: 'bloco4', text: 'Pensando em conflitos recentes, como você atuou para lidar com essas situações e como avalia os resultados?', order: 2, isBonus: false, competencyId: 'comp-b4-resolucao-conflitos', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 23,
  },
  
  // -------------------- COMPETÊNCIA: DISPONIBILIDADE (INTERNA) --------------------
  {
    id: 'comp-b4-disponibilidade-interna',
    name: 'Disponibilidade (Interna)',
    description: '',
    categoryId: 'bloco4',
    questions: [
      { id: 'q-b4-di-1', categoryId: 'bloco4', text: 'Demonstra prontidão para ajudar e oferecer suporte quando necessário.', order: 0, isBonus: false, competencyId: 'comp-b4-disponibilidade-interna', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-di-2', categoryId: 'bloco4', text: 'Responde prontamente às solicitações e pedidos de apoio da equipe.', order: 1, isBonus: false, competencyId: 'comp-b4-disponibilidade-interna', evaluationType: 'tradicional', type: 'statement' },
      { id: 'q-b4-di-dial', categoryId: 'bloco4', text: 'Considerando as demandas internas mais recentes, como você se mostrou disponível para apoiar a equipe?', order: 2, isBonus: false, competencyId: 'comp-b4-disponibilidade-interna', evaluationType: 'dialogica', type: 'dialogic' },
    ],
    createdAt: new Date('2025-01-24'),
    order: 24,
  },
];
