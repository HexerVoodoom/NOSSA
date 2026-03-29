import { Role } from '../types';
import { competencies } from './newCompetencies';

/**
 * Função helper para encontrar IDs de perguntas baseado nos nomes das competências
 */
function getQuestionIdsByCompetencyNames(competencyNames: string[]): string[] {
  const questionIds: string[] = [];
  const foundCompetencies: string[] = [];
  const notFoundCompetencies: string[] = [];
  
  // Normaliza os nomes para comparação (remove acentos, maiúsculas, etc)
  const normalizedNames = competencyNames.map(name => 
    name.toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .trim()
  );
  
  normalizedNames.forEach(requestedName => {
    let found = false;
    
    competencies.forEach(competency => {
      const normalizedCompName = competency.name
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
      
      // Verifica se o nome da competência está na lista (ou contém)
      // Match exato
      if (normalizedCompName === requestedName) {
        found = true;
        foundCompetencies.push(competency.name);
        // Adiciona todos os IDs das perguntas desta competência
        competency.questions.forEach(question => {
          questionIds.push(question.id);
        });
      }
      // Match parcial (para competências com sufixos como "(DIFERENCIAL)", "(PROJEÇÃO)")
      else if (normalizedCompName.includes(requestedName) && requestedName.length > 5) {
        found = true;
        foundCompetencies.push(competency.name);
        competency.questions.forEach(question => {
          questionIds.push(question.id);
        });
      }
    });
    
    if (!found) {
      // Procura o nome original correspondente
      const originalName = competencyNames.find(name => 
        name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() === requestedName
      ) || requestedName;
      notFoundCompetencies.push(originalName);
    }
  });
  
  // Log para debug
  if (notFoundCompetencies.length > 0) {
    console.warn(`⚠️ Competências não encontradas: ${notFoundCompetencies.join(', ')}`);
  }
  
  return questionIds;
}

/**
 * Cargos padrão do sistema
 * NOTA: As competências serão definidas posteriormente - por enquanto os cargos estão vazios
 */
export const defaultRoles: Role[] = [
  {
    id: 'default-role-3d-manager',
    name: '3D Manager',
    type: 'leadership',
    questionIds: getQuestionIdsByCompetencyNames([
      'Autodesenvolvimento',
      'Capacidade de Execução',
      'Capacidade Investigativa',
      'Comunicação',
      'Detalhista',
      'Organização',
      'Orientação para Resultado',
      'Planejamento',
      'Relacionamento Interpessoal',
    ]),
    activities: [
      { id: '3dm-act-1', text: 'Integra os manuais de marca (brandbooks) aos projetos arquitetônicos, assegurando a aplicação correta de padrões gráficos, tipografia, cores e demais elementos visuais.', order: 0 },
      { id: '3dm-act-2', text: 'Desenvolve o Caderno de Arquitetura da Marca, documentando diretrizes técnicas para aplicação de comunicação visual e elementos decorativos nos espaços.', order: 1 },
      { id: '3dm-act-3', text: 'Desenvolve uma biblioteca de blocos, materiais, texturas e modelos 3D padronizados conforme as diretrizes da franquia.', order: 2 },
      { id: '3dm-act-4', text: 'Mantém organizada e atualizada a biblioteca de blocos, materiais, texturas e modelos 3D padronizados conforme as diretrizes da franquia.', order: 3 },
      { id: '3dm-act-5', text: 'Realiza interlocução com o cliente em conjunto com os coordenadores de projetos.', order: 4 },
      { id: '3dm-act-6', text: 'Identifica o contexto em que o projeto está inserido por meio da análise de mapas, imagens, vídeos e outras referências visuais relevantes.', order: 5 },
      { id: '3dm-act-7', text: 'Cria ambientes internos e externos em maquetes digitais a partir de conceitos visuais, utilizando softwares especializados como SketchUp, 3DS Max, Blender ou equivalentes.', order: 6 },
      { id: '3dm-act-8', text: 'Seleciona e sugere mobiliários, revestimentos, paletas de cores e elementos decorativos de acordo com a proposta criativa e as expectativas do cliente.', order: 7 },
      { id: '3dm-act-9', text: 'Projeta espaços em maquetes 3D, definindo mobiliários, revestimentos e paletas de cores que componham ambientes harmônicos e funcionais.', order: 8 },
      { id: '3dm-act-10', text: 'Produz imagens e vídeos realistas dos projetos por meio de técnicas avançadas de renderização, com foco em apresentação e impacto visual.', order: 9 },
      { id: '3dm-act-11', text: 'Aplica técnicas de pós-produção e edição de imagens para aprimorar a qualidade e a percepção visual dos projetos.', order: 10 },
      { id: '3dm-act-12', text: 'Desenvolve apresentações institucionais, materiais gráficos e banners para uso interno e externo, como palestras, eventos e reuniões comerciais.', order: 11 },
      { id: '3dm-act-13', text: 'Gerencia integralmente projetos selecionados, atuando de forma integrada com os coordenadores e demais membros da equipe.', order: 12 },
      { id: '3dm-act-14', text: 'Garante uniformidade visual e qualidade técnica dos materiais gráficos apresentados pela empresa, respeitando a identidade da marca.', order: 13 },
      { id: '3dm-act-15', text: 'Assume a liderança técnica de projetos quando necessário, coordenando o desenvolvimento visual e técnico das entregas.', order: 14 },
      { id: '3dm-act-16', text: 'Salva periodicamente os arquivos criados ou modificados na rede do escritório, assegurando organização e segurança das informações.', order: 15 },
      { id: '3dm-act-17', text: 'Treina estagiários na execução de projetos, modelagem 3D e demais atividades relacionadas à comunicação visual.', order: 16 },
      { id: '3dm-act-18', text: 'Fornece suporte ao desenvolvimento técnico e comportamental dos estagiários, promovendo integração à equipe.', order: 17 },
      { id: '3dm-act-19', text: 'Atualiza-se continuamente em inovações tecnológicas, participando de feiras, eventos e workshops da área.', order: 18 },
    ],
    customQuestions: [],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'default-role-administrador',
    name: 'Administrador',
    type: 'collaborator',
    questionIds: getQuestionIdsByCompetencyNames([
      'Atenção Concentrada',
      'Capacidade de Execução',
      'Comunicação',
      'Comprometimento',
      'Organização',
      'Planejamento',
      'Relacionamento Interpessoal',
      'Resolução de Problemas',
      'Tomada de Decisão',
    ]),
    activities: [
      { id: 'adm-act-1', text: 'Gerencia o ambiente organizacional de trabalho, assegurando a limpeza, a conservação da fachada e o funcionamento adequado da infraestrutura física do escritório.', order: 0 },
      { id: 'adm-act-2', text: 'Administra os processos administrativos gerais, incluindo a segurança patrimonial e a organização dos recursos operacionais.', order: 1 },
      { id: 'adm-act-3', text: 'Cadastra novos projetos nas plataformas de gestão utilizadas pelo escritório.', order: 2 },
      { id: 'adm-act-4', text: 'Gere a manutenção corretiva do escritório, acionando fornecedores e prestadores de serviço sempre que necessário.', order: 3 },
      { id: 'adm-act-5', text: 'Gere a manutenção preventiva do escritório, acionando fornecedores e prestadores de serviço conforme cronogramas e necessidades identificadas.', order: 4 },
      { id: 'adm-act-6', text: 'Organiza a agenda de eventos e atividades internas, como almoços, festas comemorativas, uso da sala de reuniões e envio de informes à equipe.', order: 5 },
      { id: 'adm-act-7', text: 'Administra os contratos dos colaboradores CLT, monitorando prazos, cláusulas e obrigações legais.', order: 6 },
      { id: 'adm-act-8', text: 'Realiza pesquisas internas voltadas ao bem-estar organizacional.', order: 7 },
      { id: 'adm-act-9', text: 'Conduz rodas de conversa no ambiente de trabalho, promovendo diálogo e escuta entre os colaboradores.', order: 8 },
      { id: 'adm-act-10', text: 'Promove eventos de integração entre os integrantes da equipe.', order: 9 },
      { id: 'adm-act-11', text: 'Conduz os processos de admissão de funcionários, conforme as diretrizes internas e a legislação trabalhista vigente.', order: 10 },
      { id: 'adm-act-12', text: 'Conduz os processos de desligamento de funcionários, conforme as diretrizes internas e a legislação trabalhista vigente.', order: 11 },
      { id: 'adm-act-13', text: 'Elabora contratos de trabalho e de prestação de serviços, conforme orientações e normas estabelecidas.', order: 12 },
    ],
    customQuestions: [],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'default-role-desenvolvedor-projetos',
    name: 'Desenvolvedor de Projetos Executivos',
    type: 'collaborator',
    questionIds: getQuestionIdsByCompetencyNames([
      'Atenção Concentrada',
      'Autodesenvolvimento',
      'Capacidade de Execução',
      'Comunicação',
      'Organização',
      'Planejamento',
      'Raciocínio Abstrato',
      'Raciocínio Lógico',
      'Resolução de Problemas',
      'Trabalho em Equipe',
      'Tomada de Decisão',
    ]),
    activities: [
      { id: 'dev-act-1', text: 'Colabora na elaboração e nos ajustes de layout em conjunto com franqueadoras e franqueados, contribuindo para soluções arquitetônicas alinhadas às diretrizes da marca.', order: 0 },
      { id: 'dev-act-2', text: 'Revisa todas as informações prévias do projeto, incluindo estudo preliminar, layout aprovado, imagens, vídeos do local, premissas, normas técnicas e legislação aplicável.', order: 1 },
      { id: 'dev-act-3', text: 'Participa de visitas técnicas, como levantamentos métricos, vistorias em lojas ou obras, sempre que solicitado.', order: 2 },
      { id: 'dev-act-4', text: 'Executa os projetos conforme os padrões técnicos e visuais previamente estabelecidos.', order: 3 },
      { id: 'dev-act-5', text: 'Produz as plantas dos projetos em desenvolvimento, incluindo cotas, níveis, especificações de materiais e indicações de detalhes construtivos.', order: 4 },
      { id: 'dev-act-6', text: 'Define materiais, acabamentos, esquadrias e mobiliários fixos, especificando marcas, modelos e padrões técnicos compatíveis com o projeto e com o cliente.', order: 5 },
      { id: 'dev-act-7', text: 'Elabora desenhos técnicos de detalhes construtivos, como paginação de pisos, forros, bancadas, guarda-corpos, sancas, marquises, entre outros.', order: 6 },
      { id: 'dev-act-8', text: 'Complementa os desenhos técnicos com informações precisas e coerentes com o escopo do projeto.', order: 7 },
      { id: 'dev-act-9', text: 'Elabora o memorial descritivo do projeto conforme orientações e diretrizes previamente estabelecidas pelo escritório.', order: 8 },
      { id: 'dev-act-10', text: 'Anexa o memorial descritivo do projeto na pasta específica da loja na rede interna.', order: 9 },
      { id: 'dev-act-11', text: 'Elabora a lista de compras de materiais e itens de obra, com referências, quantidades e fornecedores sugeridos, quando aplicável ao escopo.', order: 10 },
      { id: 'dev-act-12', text: 'Desenvolve cadernos técnicos de mobiliário, incluindo modelagem detalhada, especificações de materiais, instruções de montagem e acabamentos conforme exigências da franquia.', order: 11 },
      { id: 'dev-act-13', text: 'Desenvolve maquetes eletrônicas 3D com renderizações realistas, utilizando softwares compatíveis e atualizados.', order: 12 },
      { id: 'dev-act-14', text: 'Elabora apresentações visuais dos projetos para apresentação aos clientes, utilizando recursos gráficos e de modelagem alinhados à identidade visual do escritório.', order: 13 },
      { id: 'dev-act-15', text: 'Organiza, padroniza e disponibiliza os arquivos e documentos de projeto em formato adequado para obra (digital), incluindo imagens renderizadas e apresentações, conforme critérios internos.', order: 14 },
      { id: 'dev-act-16', text: 'Confere todas as peças gráficas e documentos do projeto antes da entrega, garantindo qualidade, consistência técnica e padronização visual.', order: 15 },
      { id: 'dev-act-17', text: 'Participa de reuniões de kickoff, presenciais ou on-line, contribuindo para o alinhamento técnico e a organização das etapas iniciais do projeto.', order: 16 },
      { id: 'dev-act-18', text: 'Submete o projeto executivo finalizado na rede interna de backup para validação da Coordenação de Projetos, atendendo aos prazos e requisitos estabelecidos.', order: 17 },
      { id: 'dev-act-19', text: 'Realiza adequações e correções no projeto a partir das devolutivas técnicas recebidas da Coordenação de Projetos.', order: 18 },
      { id: 'dev-act-20', text: 'Notifica os coordenadores sobre o avanço e a conclusão de cada etapa do desenvolvimento por meio da ferramenta de gestão de projetos.', order: 19 },
      { id: 'dev-act-21', text: 'Verifica periodicamente as notificações nas plataformas de trabalho utilizadas, garantindo acompanhamento e resposta às demandas em tempo hábil.', order: 20 },
      { id: 'dev-act-22', text: 'Colabora com as equipes de trabalho e diferentes departamentos, promovendo integração e fluidez na execução das atividades compartilhadas.', order: 21 },
      { id: 'dev-act-23', text: 'Participa de reuniões on-line e presenciais com foco em integração, feedback e alinhamento técnico.', order: 22 },
      { id: 'dev-act-24', text: 'Salva periodicamente os arquivos criados ou modificados na nuvem do escritório, garantindo segurança da informação e organização do material.', order: 23 },
      { id: 'dev-act-25', text: 'Salva e nomeia corretamente todos os arquivos e documentos conforme os padrões de nomenclatura definidos pelo escritório, garantindo uniformidade e rastreabilidade.', order: 24 },
      { id: 'dev-act-26', text: 'Disponibiliza o projeto completo no servidor do escritório, assegurando acesso da equipe à versão final atualizada e devidamente arquivada.', order: 25 },
      { id: 'dev-act-27', text: 'Aloca os materiais desenvolvidos nas pastas específicas de cada projeto na rede interna e comunica o status pela plataforma de gestão (ClickUp).', order: 26 },
      { id: 'dev-act-28', text: 'Atualiza-se continuamente em inovações tecnológicas, participando de feiras, eventos e workshops da área.', order: 27 },
    ],
    customQuestions: [],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'default-role-financeiro',
    name: 'Financeiro',
    type: 'collaborator',
    questionIds: getQuestionIdsByCompetencyNames([
      'Atenção Concentrada',
      'Comportamento Ético',
      'Comunicação',
      'Confiabilidade',
      'Comprometimento',
      'Negociação / Persuasão',
      'Organização',
      'Planejamento',
      'Relacionamento Interpessoal',
      'Resolução de Problemas',
      'Sigilo',
      'Tomada de Decisão',
    ]),
    activities: [
      { id: 'fin-act-1', text: 'Realiza a gestão de recebíveis junto aos clientes, acompanhando prazos e valores.', order: 0 },
      { id: 'fin-act-2', text: 'Administra as despesas fixas do condomínio e do escritório, como aluguel, água, energia, IPTU, internet, entre outras, respeitando prioridades e datas de vencimento.', order: 1 },
      { id: 'fin-act-3', text: 'Realiza os pagamentos de fornecedores e parceiros nas datas previstas, conforme os acordos estabelecidos.', order: 2 },
      { id: 'fin-act-4', text: 'Identifica inadimplências de clientes e parceiros, adotando medidas para regularização e manutenção da saúde financeira do escritório.', order: 3 },
      { id: 'fin-act-5', text: 'Garante o cumprimento das obrigações fiscais e tributárias, em conformidade com as exigências legais vigentes.', order: 4 },
      { id: 'fin-act-6', text: 'Gere o relacionamento com entidades externas, como bancos, contabilidade, prefeitura e advogados, prestando suporte administrativo sempre que necessário.', order: 5 },
      { id: 'fin-act-7', text: 'Atualiza os dados dos contratos na plataforma de gestão utilizada pelo escritório, mantendo o registro das etapas sempre atualizado.', order: 6 },
      { id: 'fin-act-8', text: 'Confere o recebimento dos arquivos editáveis dos projetos antes de liberar pagamentos para as equipes envolvidas.', order: 7 },
      { id: 'fin-act-9', text: 'Acompanha todo o ciclo dos projetos nas plataformas de gestão, desde a formalização do contrato até a entrega final ao cliente.', order: 8 },
    ],
    customQuestions: [],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'default-role-gestor-obra',
    name: 'Gestor de Obra',
    type: 'leadership',
    questionIds: getQuestionIdsByCompetencyNames([
      'Atenção Concentrada',
      'Autodesenvolvimento',
      'Capacidade de Execução',
      'Negociação / Persuasão',
      'Organização',
      'Relacionamento Interpessoal',
      'Resolução de Problemas',
      'Senso Crítico',
      'Tomada de Decisão',
    ]),
    activities: [
      { id: 'obra-act-1', text: 'Mantém-se atualizado em relação aos manuais e diretrizes das franquias atendidas, aplicando corretamente suas exigências durante a execução das obras.', order: 0 },
      { id: 'obra-act-2', text: 'Analisa os projetos antes do início do acompanhamento de obra, verificando diretrizes, premissas e particularidades técnicas.', order: 1 },
      { id: 'obra-act-3', text: 'Participa de reuniões de kickoff e de alinhamento para adequações de projeto ao longo da execução da obra.', order: 2 },
      { id: 'obra-act-4', text: 'Intermedeia ajustes e conflitos relacionados ao escopo do projeto, propondo soluções técnicas e viáveis.', order: 3 },
      { id: 'obra-act-5', text: 'Mede e analisa ajustes e conflitos relacionados ao escopo do projeto, propondo soluções técnicas compatíveis com a execução da obra.', order: 4 },
      { id: 'obra-act-6', text: 'Fornece feedback técnico aos projetistas para aprimoramento de detalhes de projeto, quando identifica falhas ou informações insuficientes.', order: 5 },
      { id: 'obra-act-7', text: 'Confere cotações de orçamentos e quantitativos em relação aos projetos, garantindo precisão e aderência nas contratações.', order: 6 },
      { id: 'obra-act-8', text: 'Solicita ajustes quando identifica incompatibilidades entre o projeto e as condições reais do espaço físico.', order: 7 },
      { id: 'obra-act-9', text: 'Avalia a necessidade de revisões ou novas aprovações junto aos projetistas ao longo do processo de execução.', order: 8 },
      { id: 'obra-act-10', text: 'Responde dúvidas técnicas da equipe de obra relacionadas aos projetos e à execução.', order: 9 },
      { id: 'obra-act-11', text: 'Registra feedbacks na plataforma de gestão de projetos e acompanha o andamento das obras via WhatsApp, garantindo alinhamento com os projetos desenvolvidos.', order: 10 },
      { id: 'obra-act-12', text: 'Cobra empreiteiros pelo envio de fotos e vídeos do andamento e da conclusão das obras, conforme cronograma estabelecido.', order: 11 },
      { id: 'obra-act-13', text: 'Gere o relacionamento com fornecedores, franqueadores e franqueados durante o processo de obra.', order: 12 },
      { id: 'obra-act-14', text: 'Atua como ponto de contato entre a equipe interna, franqueadora, franqueado e fornecedores em todas as etapas do projeto.', order: 13 },
      { id: 'obra-act-15', text: 'Comunica-se de forma contínua com os responsáveis pelo projeto e com a equipe de obra, assegurando alinhamento técnico e operacional.', order: 14 },
      { id: 'obra-act-16', text: 'Preenche o checklist final de conformidades conforme os padrões da franqueadora e do projeto antes da conclusão da obra.', order: 15 },
    ],
    customQuestions: [],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'default-role-gerente-comercial',
    name: 'Gerente Comercial',
    type: 'leadership',
    questionIds: getQuestionIdsByCompetencyNames([
      'Atenção ao Cliente',
      'Autodesenvolvimento',
      'Cordialidade',
      'Comprometimento',
      'Organização',
      'Planejamento',
      'Relacionamento Interpessoal',
      'Responsabilidade',
      'Resolução de Problemas',
      'Tomada de Decisão',
    ]),
    activities: [
      { id: 'com-act-1', text: 'Prospecta ativamente novos clientes e contratos por meio de networking, visitas comerciais e ligações telefônicas estratégicas.', order: 0 },
      { id: 'com-act-2', text: 'Mantém contato com stakeholders em nível nacional e internacional, identificando oportunidades comerciais e tendências de mercado.', order: 1 },
      { id: 'com-act-3', text: 'Presta suporte aos clientes (franqueador e franqueado) por telefone, e-mail e demais canais de comunicação.', order: 2 },
      { id: 'com-act-4', text: 'Negocia com os clientes novos contratos, prazos, entregas, orçamentos e o funcionamento do modelo de trabalho, assegurando alinhamento entre as partes.', order: 3 },
      { id: 'com-act-5', text: 'Conduz reuniões iniciais de alinhamento com os clientes e a equipe de projeto, garantindo compatibilidade entre as expectativas comerciais e o escopo técnico do projeto.', order: 4 },
      { id: 'com-act-6', text: 'Desenvolve propostas comerciais personalizadas em conjunto com a equipe de gestão.', order: 5 },
      { id: 'com-act-7', text: 'Acompanha as aprovações de propostas e contratos de prestação de serviço por meio da plataforma de gestão, assegurando o fluxo correto do processo comercial.', order: 6 },
      { id: 'com-act-8', text: 'Define a composição de preços, estimando custos por projeto, consultorias e honorários, garantindo equilíbrio entre competitividade e rentabilidade.', order: 7 },
      { id: 'com-act-9', text: 'Filtra clientes em potencial por meio de reuniões e pesquisas de mercado, assegurando alinhamento estratégico, rentabilidade e compatibilidade com os valores do escritório.', order: 8 },
      { id: 'com-act-10', text: 'Desenvolve e aprimora continuamente os processos comerciais a partir do mapeamento das etapas de atendimento e vendas, identificando gargalos e oportunidades de melhoria.', order: 9 },
      { id: 'com-act-11', text: 'Realiza análises periódicas de mercado e concorrência (mensais e trimestrais), ajustando campanhas, posicionamento e ofertas com base nos dados coletados.', order: 10 },
      { id: 'com-act-12', text: 'Propõe melhorias contínuas nos processos, estratégias e desempenho financeiro a partir dos resultados comerciais obtidos.', order: 11 },
      { id: 'com-act-13', text: 'Participa de, no mínimo, dois eventos por ano (como Expo Revestir, ABF, Casa Cor SP, NFR, NRA e convenções), com foco em atualização profissional e ampliação de networking estratégico.', order: 12 },
      { id: 'com-act-14', text: 'Avalia a satisfação dos clientes por meio do formulário NPS (Net Promoter Score).', order: 13 },
      { id: 'com-act-15', text: 'Envia formulário cadastral aos clientes para coleta de dados essenciais à formalização e à execução dos projetos.', order: 14 },
    ],
    customQuestions: [],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'default-role-coordenadora-projetos',
    name: 'Coordenadora de Projetos',
    type: 'leadership',
    questionIds: getQuestionIdsByCompetencyNames([
      'Atenção Concentrada',
      'Autodesenvolvimento',
      'Capacidade de Execução',
      'Capacidade Investigativa',
      'Detalhista',
      'Empatia',
      'Foco no Cliente',
      'Organização',
      'Planejamento',
      'Relacionamento Interpessoal',
      'Resolução de Problemas',
      'Tomada de Decisão',
    ]),
    activities: [
      { id: 'coord-act-1', text: 'Realiza o onboarding técnico de estagiários e profissionais recém-contratados.', order: 0 },
      { id: 'coord-act-2', text: 'Delega tarefas compatíveis com o nível de experiência de cada integrante da equipe, supervisionando prazos e qualidade das entregas.', order: 1 },
      { id: 'coord-act-3', text: 'Fornece feedbacks técnicos e comportamentais periódicos aos integrantes da equipe.', order: 2 },
      { id: 'coord-act-4', text: 'Apoia decisões internas relacionadas à gestão da equipe, organização de demandas e melhoria de processos.', order: 3 },
      { id: 'coord-act-5', text: 'Registra as necessidades específicas de cada projeto e as expectativas do cliente durante as reuniões de kickoff na plataforma de gestão ClickUp.', order: 4 },
      { id: 'coord-act-6', text: 'Realiza o primeiro contato com o cliente franqueado.', order: 5 },
      { id: 'coord-act-7', text: 'Garante disponibilidade para comunicação com o cliente via WhatsApp em todas as fases do projeto, assegurando o esclarecimento de dúvidas.', order: 6 },
      { id: 'coord-act-8', text: 'Coordena as tarefas executadas pelos integrantes dos projetos.', order: 7 },
      { id: 'coord-act-9', text: 'Supervisiona o envio dos arquivos em formato XLS dos projetos aprovados pela franqueadora.', order: 8 },
      { id: 'coord-act-10', text: 'Recebe os projetos aprovados, organiza e preenche a planilha de controle de projetos.', order: 9 },
      { id: 'coord-act-11', text: 'Colabora com engenheiros, construtores e fornecedores para garantir a viabilidade técnica dos projetos, assegurando a compatibilização adequada das informações.', order: 10 },
      { id: 'coord-act-12', text: 'Aloca as demandas dos projetos aprovados aos integrantes da equipe de desenvolvedores de projetos.', order: 11 },
      { id: 'coord-act-13', text: 'Gera e gerencia os cronogramas dos projetos no ClickUp, controlando prazos e demandas.', order: 12 },
      { id: 'coord-act-14', text: 'Registra e devolve as modificações necessárias aos desenvolvedores responsáveis pelos projetos.', order: 13 },
      { id: 'coord-act-15', text: 'Revisa e orienta as correções dos projetos em desenvolvimento junto aos arquitetos responsáveis até que atinjam o padrão adequado.', order: 14 },
      { id: 'coord-act-16', text: 'Realiza interlocuções técnicas com franqueadoras e franqueados para garantir alinhamento técnico e conceitual dos projetos, assegurando conformidade com os padrões exigidos.', order: 15 },
      { id: 'coord-act-17', text: 'Levanta as necessidades específicas de cada projeto e as expectativas de cada cliente a partir das reuniões de kickoff.', order: 16 },
      { id: 'coord-act-18', text: 'Computa e organiza todos os dados de entrada dos projetos, incluindo manual de franquia, caderno de normas técnicas e diretrizes de layout padrão.', order: 17 },
      { id: 'coord-act-19', text: 'Mantém o cliente atualizado sobre o andamento dos projetos.', order: 18 },
      { id: 'coord-act-20', text: 'Realiza contato com fornecedores para esclarecimento de dúvidas técnicas ou projetuais quando necessário (elétrica, hidráulica, entre outras).', order: 19 },
      { id: 'coord-act-21', text: 'Envia e acompanha os projetos junto ao franqueado, franqueadora ou concessionárias (aeroportos, shoppings, galerias, entre outros).', order: 20 },
      { id: 'coord-act-22', text: 'Desenvolve o layout inicial dos projetos propostos, considerando possíveis dificuldades e detalhes construtivos.', order: 21 },
      { id: 'coord-act-23', text: 'Envia o layout do projeto proposto para aprovação do cliente.', order: 22 },
      { id: 'coord-act-24', text: 'Participa do comitê de projetos com a ZAMP, responsável pela marca Subway no Brasil.', order: 23 },
      { id: 'coord-act-25', text: 'Confere dimensões, itens da lista de compras, Memorial Descritivo e RRT dos projetos antes da entrega final.', order: 24 },
    ],
    customQuestions: [],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'default-role-auxiliar-servicos-gerais',
    name: 'Auxiliar de Serviços Gerais',
    type: 'collaborator',
    questionIds: getQuestionIdsByCompetencyNames([
      'Organização',
      'Comprometimento',
      'Relacionamento Interpessoal',
      'Responsabilidade',
      'Comportamento Ético',
      'Detalhista',
      'Agilidade',
      'Comunicação',
    ]),
    activities: [
      { id: 'asg-act-1', text: 'Executa a limpeza seguindo uma rotina definida, garantindo padrão de higiene em todos os ambientes, incluindo o depósito de materiais de limpeza e as superfícies.', order: 0 },
      { id: 'asg-act-2', text: 'Manuseia adequadamente equipamentos, móveis, cortinas e utensílios do escritório durante a limpeza.', order: 1 },
      { id: 'asg-act-3', text: 'Mantém a copa e a cozinha limpas e organizadas, garantindo que pia, bancadas, armários, geladeiras, eletrodomésticos e resíduos estejam em seus locais corretos.', order: 2 },
      { id: 'asg-act-4', text: 'Realiza a limpeza e a manutenção básica do quintal e das áreas externas, incluindo varrição, retirada de folhas, limpeza de áreas pavimentadas, rega de plantas e retirada de galhos secos.', order: 3 },
      { id: 'asg-act-5', text: 'Realiza a coleta e o descarte correto do lixo, seguindo as orientações de separação e reciclagem.', order: 4 },
      { id: 'asg-act-6', text: 'Informa com antecedência à administração sobre a necessidade de reposição dos materiais de limpeza.', order: 5 },
      { id: 'asg-act-7', text: 'Reposição materiais de higiene, como papel higiênico, papel toalha, sabonete, entre outros, sempre que necessário.', order: 6 },
      { id: 'asg-act-8', text: 'Utiliza produtos e materiais adequados para cada tipo de superfície, preservando sua conservação.', order: 7 },
      { id: 'asg-act-9', text: 'Troca e lava copos e xícaras das salas sempre que necessário.', order: 8 },
      { id: 'asg-act-10', text: 'Lava adequadamente e diariamente as vasilhas de água das cachorras.', order: 9 },
      { id: 'asg-act-11', text: 'Troca a água das cachorras com frequência, garantindo que esteja sempre limpa e fresca.', order: 10 },
      { id: 'asg-act-12', text: 'Verifica a presença de fezes das cachorras nas áreas internas ou externas do escritório, avisando imediatamente a pessoa responsável (Camila ou Luís) e realizando o descarte quando necessário.', order: 11 },
      { id: 'asg-act-13', text: 'Apoia na preparação de ambientes para reuniões ou eventos internos, conforme orientações recebidas.', order: 12 },
      { id: 'asg-act-14', text: 'Lava itens seguindo os procedimentos e rotinas estabelecidas.', order: 13 },
      { id: 'asg-act-15', text: 'Apoia no preparo de refeições simples, realizando tarefas básicas sob orientação.', order: 14 },
    ],
    customQuestions: [],
    createdAt: new Date('2024-01-01'),
  },
];

// Log inicial mostrando os cargos criados
console.log('📋 Cargos padrão configurados:');
defaultRoles.forEach(role => {
  console.log(`  - ${role.name} (${role.type}): ${role.questionIds.length} perguntas`);
});

/**
 * Verifica se um cargo padrão já foi criado
 */
export function isDefaultRoleCreated(roleId: string, existingRoles: Role[]): boolean {
  return existingRoles.some(role => role.id === roleId);
}

/**
 * Retorna cargos padrão que ainda não foram criados
 */
export function getMissingDefaultRoles(existingRoles: Role[]): Role[] {
  return defaultRoles.filter(defaultRole => 
    !isDefaultRoleCreated(defaultRole.id, existingRoles)
  );
}