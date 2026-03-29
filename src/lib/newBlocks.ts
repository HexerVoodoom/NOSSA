import { Category } from '../types';

// Novos blocos para substituir as categorias antigas
export const newBlocks: (Category & { description: string })[] = [
  {
    id: 'bloco1',
    name: 'Execução e Produtividade',
    description: 'Avalia a capacidade de transformar planos em entregas concretas, com organização, foco e eficiência. Observa como a pessoa gerencia tempo, prioridades, prazos e volume de trabalho, garantindo constância e qualidade na execução das atividades.',
    order: 1,
    color: '#6155f5',
  },
  {
    id: 'bloco2',
    name: 'Qualidade Técnica e Cognitiva',
    description: 'Avalia o domínio técnico, a capacidade de raciocínio, análise e resolução de problemas. Considera a atenção aos detalhes, o pensamento lógico e crítico, a clareza intelectual e a aplicação adequada do conhecimento no trabalho.',
    order: 2,
    color: '#34d399',
  },
  {
    id: 'bloco3',
    name: 'Relação com Clientes e Stakeholders',
    description: 'Avalia como a pessoa se comunica e se relaciona com clientes, parceiros e demais partes envolvidas. Observa empatia, clareza, confiabilidade, postura profissional e a capacidade de compreender necessidades e alinhar expectativas.',
    order: 3,
    color: '#ff8d28',
  },
  {
    id: 'bloco4',
    name: 'Relações Internas e Colaboração',
    description: 'Avalia a qualidade das relações interpessoais no ambiente interno. Considera trabalho em equipe, comunicação, empatia, disponibilidade para ajudar, respeito às diferenças e contribuição para um clima organizacional saudável.',
    order: 4,
    color: '#f472b6',
  },
  {
    id: 'bloco5',
    name: 'Postura Profissional e Ética',
    description: 'Avalia atitudes, valores e comportamentos no exercício profissional. Observa responsabilidade, comprometimento, ética, transparência, confiabilidade e coerência entre discurso e prática no dia a dia de trabalho.',
    order: 5,
    color: '#60a5fa',
  },
  {
    id: 'bloco6',
    name: 'Desenvolvimento, Adaptação e Futuro',
    description: 'Avalia a capacidade de aprender, adaptar-se e evoluir continuamente. Considera abertura a feedbacks, busca por desenvolvimento, flexibilidade diante de mudanças, visão de futuro e disposição para crescer junto com a organização.',
    order: 6,
    color: '#a78bfa',
  },
];