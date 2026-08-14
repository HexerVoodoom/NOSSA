# Perguntas de Cargos

Documento por **cargo** (`Role`), mostrando: a tag do cargo (`associado` ou `liderança`), as **competências filtradas** para esse cargo (com suas afirmações técnicas e pergunta dialógica — extraídas da Biblioteca de Competências) e as **atividades específicas do cargo** usadas no fluxo de Avaliação de Atividades.

> No sistema, `Role.type` é a tag que classifica o cargo como `leadership` (liderança) ou `collaborator` (associado). A lista `Role.questionIds` é resolvida a partir dos nomes de competências abaixo (`getQuestionIdsByCompetencyNames`), e é ela que filtra, em tempo de avaliação, quais afirmações e perguntas dialógicas aparecem para o cargo.

## Sumário de cargos

| Cargo | Tag | Competências | Atividades |
|---|---|---|---|
| 3D Manager | `liderança` | 9 | 19 |
| Administrador | `associado` | 9 | 13 |
| Desenvolvedor de Projetos Executivos | `associado` | 11 | 28 |
| Financeiro | `associado` | 12 | 9 |
| Gestor de Obra | `liderança` | 9 | 16 |
| Gerente Comercial | `liderança` | 10 | 15 |
| Coordenadora de Projetos | `liderança` | 12 | 25 |
| Auxiliar de Serviços Gerais | `associado` | 8 | 15 |

---

## 3D Manager

**ID:** `default-role-3d-manager` &nbsp;·&nbsp; **Tag de cargo:** `liderança`

### Competências filtradas para este cargo

#### Autodesenvolvimento · `liderança`

*Competência:* `comp-b6-autodesenvolvimento` &nbsp;·&nbsp; *Categoria:* `bloco6`

Afirmações técnicas:
- `q-b6-ad-1` Reflete sobre sua própria atuação.
- `q-b6-ad-2` Busca evolução pessoal e profissional.

Base de diálogo:
- `q-b6-ad-dial` Considerando seu trabalho recente, como você refletiu sobre seu próprio desempenho e como isso ajudou a orientar melhorias?

#### Capacidade de Execução · `liderança`

*Competência:* `comp-b1-capacidade-execucao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-exec-1` Consegue transformar planos em ações concretas.
- `q-b1-exec-2` Utiliza adequadamente os recursos disponíveis para atingir seus objetivos.
- `q-b1-exec-3` Atua de forma sistemática para concluir o que foi planejado.

Base de diálogo:
- `q-b1-exec-dial` Considerando os últimos projetos, como aconteceu a passagem do planejamento para a execução e que efeito isso teve no trabalho realizado?

#### Capacidade Investigativa · `liderança`

*Competência:* `comp-b2-capacidade-investigativa` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-ci-1` Busca ativamente informações para compreender problemas.
- `q-b2-ci-2` Utiliza fontes variadas para aprofundar o entendimento.
- `q-b2-ci-3` Não se contenta com respostas superficiais.

Base de diálogo:
- `q-b2-ci-dial` Nos últimos projetos, quando surgiram dúvidas ou problemas, como você buscou informações para entender melhor a situação e como isso funcionou na prática?

#### Comunicação · `liderança`

*Competência:* `comp-b4-comunicacao` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-com-1` Expressa suas ideias de forma clara, objetiva e estruturada.
- `q-b4-com-2` Ouve ativamente e demonstra compreensão sobre o que foi comunicado.
- `q-b4-com-3` Utiliza canais adequados para cada tipo de mensagem.

Base de diálogo:
- `q-b4-com-dial` Considerando as interações recentes, como você avalia sua clareza ao passar informações e como garante que o que foi dito foi realmente compreendido?

#### Detalhista · `liderança`

*Competência:* `comp-b1-detalhista` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-detal-1` Garante precisão e qualidade em cada etapa do trabalho.
- `q-b1-detal-2` Dedica tempo necessário para revisar e corrigir detalhes.

Base de diálogo:
- `q-b1-detal-dial` Considerando as entregas dos últimos projetos, como você lidou com os detalhes e revisões e como isso se refletiu no resultado final?

#### Organização · `liderança`

*Competência:* `comp-b1-organizacao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-org-1` Organiza previamente seu material e suas atividades de trabalho.
- `q-b1-org-2` Administra bem o tempo para realizar suas tarefas.
- `q-b1-org-3` Planeja as atividades antes de executá-las.
- `q-b1-org-4` Define metas claras alinhadas aos objetivos estabelecidos.

Base de diálogo:
- `q-b1-org-dial` Nos projetos recentes, como você estruturou e organizou seu trabalho para dar andamento às atividades e como isso impactou o processo?

#### Orientação para Resultado · `liderança`

*Competência:* `comp-b1-orientacao-resultado` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-result-1` Estabelece metas claras e mensuráveis.
- `q-b1-result-2` Busca maximizar produtividade e eficiência.
- `q-b1-result-3` Monitora o progresso das atividades.
- `q-b1-result-4` Corrige desvios que possam comprometer os resultados.
- `q-b1-result-5` Mantém foco nas atividades prioritárias e nos prazos.

Base de diálogo:
- `q-b1-result-dial` Pensando nos projetos recentes, de que forma você acompanhou se o trabalho estava caminhando para os resultados esperados e como isso funcionou na prática?

#### Planejamento · `liderança`

*Competência:* `comp-b1-planejamento` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-plan-1` Estabelece objetivos e metas antes de iniciar suas atividades.
- `q-b1-plan-2` Planeja considerando prioridades e recursos disponíveis.
- `q-b1-plan-3` Ajusta o planejamento quando surgem mudanças.
- `q-b1-plan-4` Antecipa recursos necessários para executar suas demandas.

Base de diálogo:
- `q-b1-plan-dial` Ao lembrar dos últimos projetos, como você se organizou antes de iniciar as atividades e em que medida isso contribuiu para o desenvolvimento do trabalho?

#### Relacionamento Interpessoal · `liderança`

*Competência:* `comp-b4-relacionamento-interpessoal` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-ri-1` Mantém bons relacionamentos com colegas e liderança.
- `q-b4-ri-2` Demonstra aceitação e respeito pelas diferenças.
- `q-b4-ri-3` Contribui para a construção de um clima organizacional favorável.

Base de diálogo:
- `q-b4-ri-dial` Considerando as interações mais recentes no trabalho, como você se relacionou com colegas de diferentes perfis e como avalia o impacto disso no ambiente?

### Atividades do cargo (Avaliação de Atividades)

1. Integra os manuais de marca (brandbooks) aos projetos arquitetônicos, assegurando a aplicação correta de padrões gráficos, tipografia, cores e demais elementos visuais.
2. Desenvolve o Caderno de Arquitetura da Marca, documentando diretrizes técnicas para aplicação de comunicação visual e elementos decorativos nos espaços.
3. Desenvolve uma biblioteca de blocos, materiais, texturas e modelos 3D padronizados conforme as diretrizes da franquia.
4. Mantém organizada e atualizada a biblioteca de blocos, materiais, texturas e modelos 3D padronizados conforme as diretrizes da franquia.
5. Realiza interlocução com o cliente em conjunto com os coordenadores de projetos.
6. Identifica o contexto em que o projeto está inserido por meio da análise de mapas, imagens, vídeos e outras referências visuais relevantes.
7. Cria ambientes internos e externos em maquetes digitais a partir de conceitos visuais, utilizando softwares especializados como SketchUp, 3DS Max, Blender ou equivalentes.
8. Seleciona e sugere mobiliários, revestimentos, paletas de cores e elementos decorativos de acordo com a proposta criativa e as expectativas do cliente.
9. Projeta espaços em maquetes 3D, definindo mobiliários, revestimentos e paletas de cores que componham ambientes harmônicos e funcionais.
10. Produz imagens e vídeos realistas dos projetos por meio de técnicas avançadas de renderização, com foco em apresentação e impacto visual.
11. Aplica técnicas de pós-produção e edição de imagens para aprimorar a qualidade e a percepção visual dos projetos.
12. Desenvolve apresentações institucionais, materiais gráficos e banners para uso interno e externo, como palestras, eventos e reuniões comerciais.
13. Gerencia integralmente projetos selecionados, atuando de forma integrada com os coordenadores e demais membros da equipe.
14. Garante uniformidade visual e qualidade técnica dos materiais gráficos apresentados pela empresa, respeitando a identidade da marca.
15. Assume a liderança técnica de projetos quando necessário, coordenando o desenvolvimento visual e técnico das entregas.
16. Salva periodicamente os arquivos criados ou modificados na rede do escritório, assegurando organização e segurança das informações.
17. Treina estagiários na execução de projetos, modelagem 3D e demais atividades relacionadas à comunicação visual.
18. Fornece suporte ao desenvolvimento técnico e comportamental dos estagiários, promovendo integração à equipe.
19. Atualiza-se continuamente em inovações tecnológicas, participando de feiras, eventos e workshops da área.

---

## Administrador

**ID:** `default-role-administrador` &nbsp;·&nbsp; **Tag de cargo:** `associado`

### Competências filtradas para este cargo

#### Atenção Concentrada · `associado`

*Competência:* `comp-b1-atencao-concentrada` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-atenc-1` Mantém atenção em uma tarefa mesmo em ambientes com interferências.
- `q-b1-atenc-2` Demonstra preocupação constante em executar o trabalho sem erros.
- `q-b1-atenc-3` Identifica erros ou inconsistências no fluxo de atividades.

Base de diálogo:
- `q-b1-atenc-dial` Ao longo dos últimos projetos, como foi sua experiência em manter o foco durante a execução das atividades e quais efeitos isso teve no trabalho?

#### Capacidade de Execução · `associado`

*Competência:* `comp-b1-capacidade-execucao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-exec-1` Consegue transformar planos em ações concretas.
- `q-b1-exec-2` Utiliza adequadamente os recursos disponíveis para atingir seus objetivos.
- `q-b1-exec-3` Atua de forma sistemática para concluir o que foi planejado.

Base de diálogo:
- `q-b1-exec-dial` Considerando os últimos projetos, como aconteceu a passagem do planejamento para a execução e que efeito isso teve no trabalho realizado?

#### Comunicação · `associado`

*Competência:* `comp-b4-comunicacao` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-com-1` Expressa suas ideias de forma clara, objetiva e estruturada.
- `q-b4-com-2` Ouve ativamente e demonstra compreensão sobre o que foi comunicado.
- `q-b4-com-3` Utiliza canais adequados para cada tipo de mensagem.

Base de diálogo:
- `q-b4-com-dial` Considerando as interações recentes, como você avalia sua clareza ao passar informações e como garante que o que foi dito foi realmente compreendido?

#### Comprometimento · `associado`

*Competência:* `comp-b5-comprometimento` &nbsp;·&nbsp; *Categoria:* `bloco5`

Afirmações técnicas:
- `q-b5-comp-1` Assume as responsabilidades do seu cargo.
- `q-b5-comp-2` Cumpre combinados e prazos acordados.

Base de diálogo:
- `q-b5-comp-dial` Pensando nas atividades e projetos mais recentes, como você lidou com responsabilidades, prazos e combinados assumidos, e como avalia o resultado disso?

#### Organização · `associado`

*Competência:* `comp-b1-organizacao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-org-1` Organiza previamente seu material e suas atividades de trabalho.
- `q-b1-org-2` Administra bem o tempo para realizar suas tarefas.
- `q-b1-org-3` Planeja as atividades antes de executá-las.
- `q-b1-org-4` Define metas claras alinhadas aos objetivos estabelecidos.

Base de diálogo:
- `q-b1-org-dial` Nos projetos recentes, como você estruturou e organizou seu trabalho para dar andamento às atividades e como isso impactou o processo?

#### Planejamento · `associado`

*Competência:* `comp-b1-planejamento` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-plan-1` Estabelece objetivos e metas antes de iniciar suas atividades.
- `q-b1-plan-2` Planeja considerando prioridades e recursos disponíveis.
- `q-b1-plan-3` Ajusta o planejamento quando surgem mudanças.
- `q-b1-plan-4` Antecipa recursos necessários para executar suas demandas.

Base de diálogo:
- `q-b1-plan-dial` Ao lembrar dos últimos projetos, como você se organizou antes de iniciar as atividades e em que medida isso contribuiu para o desenvolvimento do trabalho?

#### Relacionamento Interpessoal · `associado`

*Competência:* `comp-b4-relacionamento-interpessoal` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-ri-1` Mantém bons relacionamentos com colegas e liderança.
- `q-b4-ri-2` Demonstra aceitação e respeito pelas diferenças.
- `q-b4-ri-3` Contribui para a construção de um clima organizacional favorável.

Base de diálogo:
- `q-b4-ri-dial` Considerando as interações mais recentes no trabalho, como você se relacionou com colegas de diferentes perfis e como avalia o impacto disso no ambiente?

#### Resolução de Problemas · `associado`

*Competência:* `comp-b2-resolucao-problemas` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-rp-1` Identifica as causas reais dos problemas.
- `q-b2-rp-2` Propõe soluções práticas e eficazes.
- `q-b2-rp-3` Direciona esforços para resolver problemas de forma objetiva.

Base de diálogo:
- `q-b2-rp-dial` Nos últimos projetos, quando surgiram problemas, como você lidou com eles desde a identificação até a solução e como avalia o efeito disso no trabalho?

#### Tomada de Decisão · `associado`

*Competência:* `comp-b2-tomada-decisao` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-td-1` Analisa riscos e benefícios antes de agir.
- `q-b2-td-2` Decide com base no alinhamento estratégico da empresa.

Base de diálogo:
- `q-b2-td-dial` Nos projetos recentes, como você tomou as decisões mais importantes e de que forma elas contribuíram para o avanço das demandas?

### Atividades do cargo (Avaliação de Atividades)

1. Gerencia o ambiente organizacional de trabalho, assegurando a limpeza, a conservação da fachada e o funcionamento adequado da infraestrutura física do escritório.
2. Administra os processos administrativos gerais, incluindo a segurança patrimonial e a organização dos recursos operacionais.
3. Cadastra novos projetos nas plataformas de gestão utilizadas pelo escritório.
4. Gere a manutenção corretiva do escritório, acionando fornecedores e prestadores de serviço sempre que necessário.
5. Gere a manutenção preventiva do escritório, acionando fornecedores e prestadores de serviço conforme cronogramas e necessidades identificadas.
6. Organiza a agenda de eventos e atividades internas, como almoços, festas comemorativas, uso da sala de reuniões e envio de informes à equipe.
7. Administra os contratos dos colaboradores CLT, monitorando prazos, cláusulas e obrigações legais.
8. Realiza pesquisas internas voltadas ao bem-estar organizacional.
9. Conduz rodas de conversa no ambiente de trabalho, promovendo diálogo e escuta entre os colaboradores.
10. Promove eventos de integração entre os integrantes da equipe.
11. Conduz os processos de admissão de funcionários, conforme as diretrizes internas e a legislação trabalhista vigente.
12. Conduz os processos de desligamento de funcionários, conforme as diretrizes internas e a legislação trabalhista vigente.
13. Elabora contratos de trabalho e de prestação de serviços, conforme orientações e normas estabelecidas.

---

## Desenvolvedor de Projetos Executivos

**ID:** `default-role-desenvolvedor-projetos` &nbsp;·&nbsp; **Tag de cargo:** `associado`

### Competências filtradas para este cargo

#### Atenção Concentrada · `associado`

*Competência:* `comp-b1-atencao-concentrada` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-atenc-1` Mantém atenção em uma tarefa mesmo em ambientes com interferências.
- `q-b1-atenc-2` Demonstra preocupação constante em executar o trabalho sem erros.
- `q-b1-atenc-3` Identifica erros ou inconsistências no fluxo de atividades.

Base de diálogo:
- `q-b1-atenc-dial` Ao longo dos últimos projetos, como foi sua experiência em manter o foco durante a execução das atividades e quais efeitos isso teve no trabalho?

#### Autodesenvolvimento · `associado`

*Competência:* `comp-b6-autodesenvolvimento` &nbsp;·&nbsp; *Categoria:* `bloco6`

Afirmações técnicas:
- `q-b6-ad-1` Reflete sobre sua própria atuação.
- `q-b6-ad-2` Busca evolução pessoal e profissional.

Base de diálogo:
- `q-b6-ad-dial` Considerando seu trabalho recente, como você refletiu sobre seu próprio desempenho e como isso ajudou a orientar melhorias?

#### Capacidade de Execução · `associado`

*Competência:* `comp-b1-capacidade-execucao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-exec-1` Consegue transformar planos em ações concretas.
- `q-b1-exec-2` Utiliza adequadamente os recursos disponíveis para atingir seus objetivos.
- `q-b1-exec-3` Atua de forma sistemática para concluir o que foi planejado.

Base de diálogo:
- `q-b1-exec-dial` Considerando os últimos projetos, como aconteceu a passagem do planejamento para a execução e que efeito isso teve no trabalho realizado?

#### Comunicação · `associado`

*Competência:* `comp-b4-comunicacao` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-com-1` Expressa suas ideias de forma clara, objetiva e estruturada.
- `q-b4-com-2` Ouve ativamente e demonstra compreensão sobre o que foi comunicado.
- `q-b4-com-3` Utiliza canais adequados para cada tipo de mensagem.

Base de diálogo:
- `q-b4-com-dial` Considerando as interações recentes, como você avalia sua clareza ao passar informações e como garante que o que foi dito foi realmente compreendido?

#### Organização · `associado`

*Competência:* `comp-b1-organizacao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-org-1` Organiza previamente seu material e suas atividades de trabalho.
- `q-b1-org-2` Administra bem o tempo para realizar suas tarefas.
- `q-b1-org-3` Planeja as atividades antes de executá-las.
- `q-b1-org-4` Define metas claras alinhadas aos objetivos estabelecidos.

Base de diálogo:
- `q-b1-org-dial` Nos projetos recentes, como você estruturou e organizou seu trabalho para dar andamento às atividades e como isso impactou o processo?

#### Planejamento · `associado`

*Competência:* `comp-b1-planejamento` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-plan-1` Estabelece objetivos e metas antes de iniciar suas atividades.
- `q-b1-plan-2` Planeja considerando prioridades e recursos disponíveis.
- `q-b1-plan-3` Ajusta o planejamento quando surgem mudanças.
- `q-b1-plan-4` Antecipa recursos necessários para executar suas demandas.

Base de diálogo:
- `q-b1-plan-dial` Ao lembrar dos últimos projetos, como você se organizou antes de iniciar as atividades e em que medida isso contribuiu para o desenvolvimento do trabalho?

#### Raciocínio Abstrato · `associado`

*Competência:* `comp-b2-raciocinio-abstrato` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-ra-1` Conecta ideias complexas e identifica padrões não evidentes.
- `q-b2-ra-2` Visualiza conceitos futuros e relações sistêmicas.

Base de diálogo:
- `q-b2-ra-dial` Ao olhar para os projetos mais recentes, como você conectou ideias e pensou em cenários possíveis para o trabalho, e quanto isso ajudou no resultado final?

#### Raciocínio Lógico · `associado`

*Competência:* `comp-b2-raciocinio-logico` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-rl-1` Analisa informações de forma objetiva e lógica.
- `q-b2-rl-2` Resolve problemas de maneira sistemática.
- `q-b2-rl-3` Baseia decisões em evidências.

Base de diálogo:
- `q-b2-rl-dial` Pensando nos últimos projetos, como você analisou as informações e chegou às decisões necessárias, e como avalia os resultados disso?

#### Resolução de Problemas · `associado`

*Competência:* `comp-b2-resolucao-problemas` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-rp-1` Identifica as causas reais dos problemas.
- `q-b2-rp-2` Propõe soluções práticas e eficazes.
- `q-b2-rp-3` Direciona esforços para resolver problemas de forma objetiva.

Base de diálogo:
- `q-b2-rp-dial` Nos últimos projetos, quando surgiram problemas, como você lidou com eles desde a identificação até a solução e como avalia o efeito disso no trabalho?

#### Trabalho em Equipe · `associado`

*Competência:* `comp-b4-trabalho-equipe` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-te-1` Colabora ativamente com os membros da equipe para atingir objetivos comuns.
- `q-b4-te-2` Adapta-se às diferentes necessidades e estilos de trabalho dos membros da equipe.
- `q-b4-te-3` Oferece ajuda aos colegas quando percebe a oportunidade.
- `q-b4-te-4` Recebe feedbacks com abertura e positividade.

Base de diálogo:
- `q-b4-te-dial` Pensando nos projetos mais recentes, como foi sua atuação em conjunto com o time e como isso funcionou no andamento do trabalho?

#### Tomada de Decisão · `associado`

*Competência:* `comp-b2-tomada-decisao` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-td-1` Analisa riscos e benefícios antes de agir.
- `q-b2-td-2` Decide com base no alinhamento estratégico da empresa.

Base de diálogo:
- `q-b2-td-dial` Nos projetos recentes, como você tomou as decisões mais importantes e de que forma elas contribuíram para o avanço das demandas?

### Atividades do cargo (Avaliação de Atividades)

1. Colabora na elaboração e nos ajustes de layout em conjunto com franqueadoras e franqueados, contribuindo para soluções arquitetônicas alinhadas às diretrizes da marca.
2. Revisa todas as informações prévias do projeto, incluindo estudo preliminar, layout aprovado, imagens, vídeos do local, premissas, normas técnicas e legislação aplicável.
3. Participa de visitas técnicas, como levantamentos métricos, vistorias em lojas ou obras, sempre que solicitado.
4. Executa os projetos conforme os padrões técnicos e visuais previamente estabelecidos.
5. Produz as plantas dos projetos em desenvolvimento, incluindo cotas, níveis, especificações de materiais e indicações de detalhes construtivos.
6. Define materiais, acabamentos, esquadrias e mobiliários fixos, especificando marcas, modelos e padrões técnicos compatíveis com o projeto e com o cliente.
7. Elabora desenhos técnicos de detalhes construtivos, como paginação de pisos, forros, bancadas, guarda-corpos, sancas, marquises, entre outros.
8. Complementa os desenhos técnicos com informações precisas e coerentes com o escopo do projeto.
9. Elabora o memorial descritivo do projeto conforme orientações e diretrizes previamente estabelecidas pelo escritório.
10. Anexa o memorial descritivo do projeto na pasta específica da loja na rede interna.
11. Elabora a lista de compras de materiais e itens de obra, com referências, quantidades e fornecedores sugeridos, quando aplicável ao escopo.
12. Desenvolve cadernos técnicos de mobiliário, incluindo modelagem detalhada, especificações de materiais, instruções de montagem e acabamentos conforme exigências da franquia.
13. Desenvolve maquetes eletrônicas 3D com renderizações realistas, utilizando softwares compatíveis e atualizados.
14. Elabora apresentações visuais dos projetos para apresentação aos clientes, utilizando recursos gráficos e de modelagem alinhados à identidade visual do escritório.
15. Organiza, padroniza e disponibiliza os arquivos e documentos de projeto em formato adequado para obra (digital), incluindo imagens renderizadas e apresentações, conforme critérios internos.
16. Confere todas as peças gráficas e documentos do projeto antes da entrega, garantindo qualidade, consistência técnica e padronização visual.
17. Participa de reuniões de kickoff, presenciais ou on-line, contribuindo para o alinhamento técnico e a organização das etapas iniciais do projeto.
18. Submete o projeto executivo finalizado na rede interna de backup para validação da Coordenação de Projetos, atendendo aos prazos e requisitos estabelecidos.
19. Realiza adequações e correções no projeto a partir das devolutivas técnicas recebidas da Coordenação de Projetos.
20. Notifica os coordenadores sobre o avanço e a conclusão de cada etapa do desenvolvimento por meio da ferramenta de gestão de projetos.
21. Verifica periodicamente as notificações nas plataformas de trabalho utilizadas, garantindo acompanhamento e resposta às demandas em tempo hábil.
22. Colabora com as equipes de trabalho e diferentes departamentos, promovendo integração e fluidez na execução das atividades compartilhadas.
23. Participa de reuniões on-line e presenciais com foco em integração, feedback e alinhamento técnico.
24. Salva periodicamente os arquivos criados ou modificados na nuvem do escritório, garantindo segurança da informação e organização do material.
25. Salva e nomeia corretamente todos os arquivos e documentos conforme os padrões de nomenclatura definidos pelo escritório, garantindo uniformidade e rastreabilidade.
26. Disponibiliza o projeto completo no servidor do escritório, assegurando acesso da equipe à versão final atualizada e devidamente arquivada.
27. Aloca os materiais desenvolvidos nas pastas específicas de cada projeto na rede interna e comunica o status pela plataforma de gestão (ClickUp).
28. Atualiza-se continuamente em inovações tecnológicas, participando de feiras, eventos e workshops da área.

---

## Financeiro

**ID:** `default-role-financeiro` &nbsp;·&nbsp; **Tag de cargo:** `associado`

### Competências filtradas para este cargo

#### Atenção Concentrada · `associado`

*Competência:* `comp-b1-atencao-concentrada` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-atenc-1` Mantém atenção em uma tarefa mesmo em ambientes com interferências.
- `q-b1-atenc-2` Demonstra preocupação constante em executar o trabalho sem erros.
- `q-b1-atenc-3` Identifica erros ou inconsistências no fluxo de atividades.

Base de diálogo:
- `q-b1-atenc-dial` Ao longo dos últimos projetos, como foi sua experiência em manter o foco durante a execução das atividades e quais efeitos isso teve no trabalho?

#### Comportamento Ético · `associado`

*Competência:* `comp-b5-comportamento-etico` &nbsp;·&nbsp; *Categoria:* `bloco5`

Afirmações técnicas:
- `q-b5-ce-1` Age de acordo com princípios éticos e valores morais.
- `q-b5-ce-2` Toma decisões baseadas em princípios éticos sólidos.

Base de diálogo:
- `q-b5-ce-dial` Pensando nas decisões e situações recentes do trabalho, como você considerou aspectos éticos no dia a dia e como avalia os efeitos dessas escolhas?

#### Comunicação · `associado`

*Competência:* `comp-b4-comunicacao` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-com-1` Expressa suas ideias de forma clara, objetiva e estruturada.
- `q-b4-com-2` Ouve ativamente e demonstra compreensão sobre o que foi comunicado.
- `q-b4-com-3` Utiliza canais adequados para cada tipo de mensagem.

Base de diálogo:
- `q-b4-com-dial` Considerando as interações recentes, como você avalia sua clareza ao passar informações e como garante que o que foi dito foi realmente compreendido?

#### Confiabilidade · `associado`

*Competência:* `comp-b5-confiabilidade` &nbsp;·&nbsp; *Categoria:* `bloco5`

Afirmações técnicas:
- `q-b5-conf-1` Cumpre o que promete.
- `q-b5-conf-2` Demonstra coerência entre discurso e prática.

Base de diálogo:
- `q-b5-conf-dial` Nos projetos mais recentes, como foi a relação entre o que você combinou ou prometeu e o que de fato entregou, e como isso funcionou para o trabalho?

#### Comprometimento · `associado`

*Competência:* `comp-b5-comprometimento` &nbsp;·&nbsp; *Categoria:* `bloco5`

Afirmações técnicas:
- `q-b5-comp-1` Assume as responsabilidades do seu cargo.
- `q-b5-comp-2` Cumpre combinados e prazos acordados.

Base de diálogo:
- `q-b5-comp-dial` Pensando nas atividades e projetos mais recentes, como você lidou com responsabilidades, prazos e combinados assumidos, e como avalia o resultado disso?

#### Negociação / Persuasão · `associado`

*Competência:* `comp-b3-negociacao` &nbsp;·&nbsp; *Categoria:* `bloco3`

Afirmações técnicas:
- `q-b3-np-1` Apresenta argumentos convincentes para defender ideias e soluções.
- `q-b3-np-2` Busca o equilíbrio entre os interesses da empresa e do cliente.

Base de diálogo:
- `q-b3-np-dial` Nos projetos recentes, em quais situações você precisou negociar prazos ou soluções e como você conduziu esse processo para chegar a um acordo?

#### Organização · `associado`

*Competência:* `comp-b1-organizacao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-org-1` Organiza previamente seu material e suas atividades de trabalho.
- `q-b1-org-2` Administra bem o tempo para realizar suas tarefas.
- `q-b1-org-3` Planeja as atividades antes de executá-las.
- `q-b1-org-4` Define metas claras alinhadas aos objetivos estabelecidos.

Base de diálogo:
- `q-b1-org-dial` Nos projetos recentes, como você estruturou e organizou seu trabalho para dar andamento às atividades e como isso impactou o processo?

#### Planejamento · `associado`

*Competência:* `comp-b1-planejamento` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-plan-1` Estabelece objetivos e metas antes de iniciar suas atividades.
- `q-b1-plan-2` Planeja considerando prioridades e recursos disponíveis.
- `q-b1-plan-3` Ajusta o planejamento quando surgem mudanças.
- `q-b1-plan-4` Antecipa recursos necessários para executar suas demandas.

Base de diálogo:
- `q-b1-plan-dial` Ao lembrar dos últimos projetos, como você se organizou antes de iniciar as atividades e em que medida isso contribuiu para o desenvolvimento do trabalho?

#### Relacionamento Interpessoal · `associado`

*Competência:* `comp-b4-relacionamento-interpessoal` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-ri-1` Mantém bons relacionamentos com colegas e liderança.
- `q-b4-ri-2` Demonstra aceitação e respeito pelas diferenças.
- `q-b4-ri-3` Contribui para a construção de um clima organizacional favorável.

Base de diálogo:
- `q-b4-ri-dial` Considerando as interações mais recentes no trabalho, como você se relacionou com colegas de diferentes perfis e como avalia o impacto disso no ambiente?

#### Resolução de Problemas · `associado`

*Competência:* `comp-b2-resolucao-problemas` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-rp-1` Identifica as causas reais dos problemas.
- `q-b2-rp-2` Propõe soluções práticas e eficazes.
- `q-b2-rp-3` Direciona esforços para resolver problemas de forma objetiva.

Base de diálogo:
- `q-b2-rp-dial` Nos últimos projetos, quando surgiram problemas, como você lidou com eles desde a identificação até a solução e como avalia o efeito disso no trabalho?

#### Sigilo · `associado`

*Competência:* `comp-b5-sigilo` &nbsp;·&nbsp; *Categoria:* `bloco5`

Afirmações técnicas:
- `q-b5-sig-1` Mantém informações confidenciais em absoluto sigilo.
- `q-b5-sig-2` Age com discrição em assuntos sensíveis.

Base de diálogo:
- `q-b5-sig-dial` Considerando situações recentes que envolveram informações sensíveis ou assuntos delicados, como você lidou com essas informações e como avalia os resultados dessa postura?

#### Tomada de Decisão · `associado`

*Competência:* `comp-b2-tomada-decisao` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-td-1` Analisa riscos e benefícios antes de agir.
- `q-b2-td-2` Decide com base no alinhamento estratégico da empresa.

Base de diálogo:
- `q-b2-td-dial` Nos projetos recentes, como você tomou as decisões mais importantes e de que forma elas contribuíram para o avanço das demandas?

### Atividades do cargo (Avaliação de Atividades)

1. Realiza a gestão de recebíveis junto aos clientes, acompanhando prazos e valores.
2. Administra as despesas fixas do condomínio e do escritório, como aluguel, água, energia, IPTU, internet, entre outras, respeitando prioridades e datas de vencimento.
3. Realiza os pagamentos de fornecedores e parceiros nas datas previstas, conforme os acordos estabelecidos.
4. Identifica inadimplências de clientes e parceiros, adotando medidas para regularização e manutenção da saúde financeira do escritório.
5. Garante o cumprimento das obrigações fiscais e tributárias, em conformidade com as exigências legais vigentes.
6. Gere o relacionamento com entidades externas, como bancos, contabilidade, prefeitura e advogados, prestando suporte administrativo sempre que necessário.
7. Atualiza os dados dos contratos na plataforma de gestão utilizada pelo escritório, mantendo o registro das etapas sempre atualizado.
8. Confere o recebimento dos arquivos editáveis dos projetos antes de liberar pagamentos para as equipes envolvidas.
9. Acompanha todo o ciclo dos projetos nas plataformas de gestão, desde a formalização do contrato até a entrega final ao cliente.

---

## Gestor de Obra

**ID:** `default-role-gestor-obra` &nbsp;·&nbsp; **Tag de cargo:** `liderança`

### Competências filtradas para este cargo

#### Atenção Concentrada · `liderança`

*Competência:* `comp-b1-atencao-concentrada` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-atenc-1` Mantém atenção em uma tarefa mesmo em ambientes com interferências.
- `q-b1-atenc-2` Demonstra preocupação constante em executar o trabalho sem erros.
- `q-b1-atenc-3` Identifica erros ou inconsistências no fluxo de atividades.

Base de diálogo:
- `q-b1-atenc-dial` Ao longo dos últimos projetos, como foi sua experiência em manter o foco durante a execução das atividades e quais efeitos isso teve no trabalho?

#### Autodesenvolvimento · `liderança`

*Competência:* `comp-b6-autodesenvolvimento` &nbsp;·&nbsp; *Categoria:* `bloco6`

Afirmações técnicas:
- `q-b6-ad-1` Reflete sobre sua própria atuação.
- `q-b6-ad-2` Busca evolução pessoal e profissional.

Base de diálogo:
- `q-b6-ad-dial` Considerando seu trabalho recente, como você refletiu sobre seu próprio desempenho e como isso ajudou a orientar melhorias?

#### Capacidade de Execução · `liderança`

*Competência:* `comp-b1-capacidade-execucao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-exec-1` Consegue transformar planos em ações concretas.
- `q-b1-exec-2` Utiliza adequadamente os recursos disponíveis para atingir seus objetivos.
- `q-b1-exec-3` Atua de forma sistemática para concluir o que foi planejado.

Base de diálogo:
- `q-b1-exec-dial` Considerando os últimos projetos, como aconteceu a passagem do planejamento para a execução e que efeito isso teve no trabalho realizado?

#### Negociação / Persuasão · `liderança`

*Competência:* `comp-b3-negociacao` &nbsp;·&nbsp; *Categoria:* `bloco3`

Afirmações técnicas:
- `q-b3-np-1` Apresenta argumentos convincentes para defender ideias e soluções.
- `q-b3-np-2` Busca o equilíbrio entre os interesses da empresa e do cliente.

Base de diálogo:
- `q-b3-np-dial` Nos projetos recentes, em quais situações você precisou negociar prazos ou soluções e como você conduziu esse processo para chegar a um acordo?

#### Organização · `liderança`

*Competência:* `comp-b1-organizacao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-org-1` Organiza previamente seu material e suas atividades de trabalho.
- `q-b1-org-2` Administra bem o tempo para realizar suas tarefas.
- `q-b1-org-3` Planeja as atividades antes de executá-las.
- `q-b1-org-4` Define metas claras alinhadas aos objetivos estabelecidos.

Base de diálogo:
- `q-b1-org-dial` Nos projetos recentes, como você estruturou e organizou seu trabalho para dar andamento às atividades e como isso impactou o processo?

#### Relacionamento Interpessoal · `liderança`

*Competência:* `comp-b4-relacionamento-interpessoal` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-ri-1` Mantém bons relacionamentos com colegas e liderança.
- `q-b4-ri-2` Demonstra aceitação e respeito pelas diferenças.
- `q-b4-ri-3` Contribui para a construção de um clima organizacional favorável.

Base de diálogo:
- `q-b4-ri-dial` Considerando as interações mais recentes no trabalho, como você se relacionou com colegas de diferentes perfis e como avalia o impacto disso no ambiente?

#### Resolução de Problemas · `liderança`

*Competência:* `comp-b2-resolucao-problemas` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-rp-1` Identifica as causas reais dos problemas.
- `q-b2-rp-2` Propõe soluções práticas e eficazes.
- `q-b2-rp-3` Direciona esforços para resolver problemas de forma objetiva.

Base de diálogo:
- `q-b2-rp-dial` Nos últimos projetos, quando surgiram problemas, como você lidou com eles desde a identificação até a solução e como avalia o efeito disso no trabalho?

#### Senso Crítico · `liderança`

*Competência:* `comp-b2-senso-critico` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-sc-1` Questiona suposições e processos estabelecidos.
- `q-b2-sc-2` Analisa informações antes de aceitar conclusões.

Base de diálogo:
- `q-b2-sc-dial` Pensando nos projetos recentes, como você questionou práticas, informações ou conclusões prontas ao longo do trabalho, e como isso impactou os resultados?

#### Tomada de Decisão · `liderança`

*Competência:* `comp-b2-tomada-decisao` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-td-1` Analisa riscos e benefícios antes de agir.
- `q-b2-td-2` Decide com base no alinhamento estratégico da empresa.

Base de diálogo:
- `q-b2-td-dial` Nos projetos recentes, como você tomou as decisões mais importantes e de que forma elas contribuíram para o avanço das demandas?

### Atividades do cargo (Avaliação de Atividades)

1. Mantém-se atualizado em relação aos manuais e diretrizes das franquias atendidas, aplicando corretamente suas exigências durante a execução das obras.
2. Analisa os projetos antes do início do acompanhamento de obra, verificando diretrizes, premissas e particularidades técnicas.
3. Participa de reuniões de kickoff e de alinhamento para adequações de projeto ao longo da execução da obra.
4. Intermedeia ajustes e conflitos relacionados ao escopo do projeto, propondo soluções técnicas e viáveis.
5. Mede e analisa ajustes e conflitos relacionados ao escopo do projeto, propondo soluções técnicas compatíveis com a execução da obra.
6. Fornece feedback técnico aos projetistas para aprimoramento de detalhes de projeto, quando identifica falhas ou informações insuficientes.
7. Confere cotações de orçamentos e quantitativos em relação aos projetos, garantindo precisão e aderência nas contratações.
8. Solicita ajustes quando identifica incompatibilidades entre o projeto e as condições reais do espaço físico.
9. Avalia a necessidade de revisões ou novas aprovações junto aos projetistas ao longo do processo de execução.
10. Responde dúvidas técnicas da equipe de obra relacionadas aos projetos e à execução.
11. Registra feedbacks na plataforma de gestão de projetos e acompanha o andamento das obras via WhatsApp, garantindo alinhamento com os projetos desenvolvidos.
12. Cobra empreiteiros pelo envio de fotos e vídeos do andamento e da conclusão das obras, conforme cronograma estabelecido.
13. Gere o relacionamento com fornecedores, franqueadores e franqueados durante o processo de obra.
14. Atua como ponto de contato entre a equipe interna, franqueadora, franqueado e fornecedores em todas as etapas do projeto.
15. Comunica-se de forma contínua com os responsáveis pelo projeto e com a equipe de obra, assegurando alinhamento técnico e operacional.
16. Preenche o checklist final de conformidades conforme os padrões da franqueadora e do projeto antes da conclusão da obra.

---

## Gerente Comercial

**ID:** `default-role-gerente-comercial` &nbsp;·&nbsp; **Tag de cargo:** `liderança`

### Competências filtradas para este cargo

#### Atenção ao Cliente · `liderança`

*Competência:* `comp-b3-atencao-cliente` &nbsp;·&nbsp; *Categoria:* `bloco3`

Afirmações técnicas:
- `q-b3-ac-1` Demonstra cuidado e dedicação no atendimento às demandas dos clientes.
- `q-b3-ac-2` Responde com clareza e agilidade às solicitações dos clientes.

Base de diálogo:
- `q-b3-ac-dial` Pensando nas interações recentes, como você conduziu a comunicação e o suporte ao cliente e como avalia a percepção dele sobre o seu trabalho?

#### Autodesenvolvimento · `liderança`

*Competência:* `comp-b6-autodesenvolvimento` &nbsp;·&nbsp; *Categoria:* `bloco6`

Afirmações técnicas:
- `q-b6-ad-1` Reflete sobre sua própria atuação.
- `q-b6-ad-2` Busca evolução pessoal e profissional.

Base de diálogo:
- `q-b6-ad-dial` Considerando seu trabalho recente, como você refletiu sobre seu próprio desempenho e como isso ajudou a orientar melhorias?

#### Cordialidade · `liderança`

*Competência:* `comp-b4-cordialidade` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-cor-1` Estabelece relacionamento gentil e cuidadoso com todas as pessoas.
- `q-b4-cor-2` Pratica tolerância ao lidar com diferenças de opinião.

Base de diálogo:
- `q-b4-cor-dial` Pensando nas situações recentes do trabalho, como foi sua postura no trato diário com as pessoas e como isso funcionou na prática?

#### Comprometimento · `liderança`

*Competência:* `comp-b5-comprometimento` &nbsp;·&nbsp; *Categoria:* `bloco5`

Afirmações técnicas:
- `q-b5-comp-1` Assume as responsabilidades do seu cargo.
- `q-b5-comp-2` Cumpre combinados e prazos acordados.

Base de diálogo:
- `q-b5-comp-dial` Pensando nas atividades e projetos mais recentes, como você lidou com responsabilidades, prazos e combinados assumidos, e como avalia o resultado disso?

#### Organização · `liderança`

*Competência:* `comp-b1-organizacao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-org-1` Organiza previamente seu material e suas atividades de trabalho.
- `q-b1-org-2` Administra bem o tempo para realizar suas tarefas.
- `q-b1-org-3` Planeja as atividades antes de executá-las.
- `q-b1-org-4` Define metas claras alinhadas aos objetivos estabelecidos.

Base de diálogo:
- `q-b1-org-dial` Nos projetos recentes, como você estruturou e organizou seu trabalho para dar andamento às atividades e como isso impactou o processo?

#### Planejamento · `liderança`

*Competência:* `comp-b1-planejamento` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-plan-1` Estabelece objetivos e metas antes de iniciar suas atividades.
- `q-b1-plan-2` Planeja considerando prioridades e recursos disponíveis.
- `q-b1-plan-3` Ajusta o planejamento quando surgem mudanças.
- `q-b1-plan-4` Antecipa recursos necessários para executar suas demandas.

Base de diálogo:
- `q-b1-plan-dial` Ao lembrar dos últimos projetos, como você se organizou antes de iniciar as atividades e em que medida isso contribuiu para o desenvolvimento do trabalho?

#### Relacionamento Interpessoal · `liderança`

*Competência:* `comp-b4-relacionamento-interpessoal` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-ri-1` Mantém bons relacionamentos com colegas e liderança.
- `q-b4-ri-2` Demonstra aceitação e respeito pelas diferenças.
- `q-b4-ri-3` Contribui para a construção de um clima organizacional favorável.

Base de diálogo:
- `q-b4-ri-dial` Considerando as interações mais recentes no trabalho, como você se relacionou com colegas de diferentes perfis e como avalia o impacto disso no ambiente?

#### Responsabilidade · `liderança`

*Competência:* `comp-b5-responsabilidade` &nbsp;·&nbsp; *Categoria:* `bloco5`

Afirmações técnicas:
- `q-b5-resp-1` Demonstra segurança ao exercer suas funções.
- `q-b5-resp-2` Assume erros e falhas com transparência.

Base de diálogo:
- `q-b5-resp-dial` Considerando situações recentes de trabalho, como você lidou com erros, imprevistos ou falhas quando eles aconteceram, e como isso funcionou na prática?

#### Resolução de Problemas · `liderança`

*Competência:* `comp-b2-resolucao-problemas` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-rp-1` Identifica as causas reais dos problemas.
- `q-b2-rp-2` Propõe soluções práticas e eficazes.
- `q-b2-rp-3` Direciona esforços para resolver problemas de forma objetiva.

Base de diálogo:
- `q-b2-rp-dial` Nos últimos projetos, quando surgiram problemas, como você lidou com eles desde a identificação até a solução e como avalia o efeito disso no trabalho?

#### Tomada de Decisão · `liderança`

*Competência:* `comp-b2-tomada-decisao` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-td-1` Analisa riscos e benefícios antes de agir.
- `q-b2-td-2` Decide com base no alinhamento estratégico da empresa.

Base de diálogo:
- `q-b2-td-dial` Nos projetos recentes, como você tomou as decisões mais importantes e de que forma elas contribuíram para o avanço das demandas?

### Atividades do cargo (Avaliação de Atividades)

1. Prospecta ativamente novos clientes e contratos por meio de networking, visitas comerciais e ligações telefônicas estratégicas.
2. Mantém contato com stakeholders em nível nacional e internacional, identificando oportunidades comerciais e tendências de mercado.
3. Presta suporte aos clientes (franqueador e franqueado) por telefone, e-mail e demais canais de comunicação.
4. Negocia com os clientes novos contratos, prazos, entregas, orçamentos e o funcionamento do modelo de trabalho, assegurando alinhamento entre as partes.
5. Conduz reuniões iniciais de alinhamento com os clientes e a equipe de projeto, garantindo compatibilidade entre as expectativas comerciais e o escopo técnico do projeto.
6. Desenvolve propostas comerciais personalizadas em conjunto com a equipe de gestão.
7. Acompanha as aprovações de propostas e contratos de prestação de serviço por meio da plataforma de gestão, assegurando o fluxo correto do processo comercial.
8. Define a composição de preços, estimando custos por projeto, consultorias e honorários, garantindo equilíbrio entre competitividade e rentabilidade.
9. Filtra clientes em potencial por meio de reuniões e pesquisas de mercado, assegurando alinhamento estratégico, rentabilidade e compatibilidade com os valores do escritório.
10. Desenvolve e aprimora continuamente os processos comerciais a partir do mapeamento das etapas de atendimento e vendas, identificando gargalos e oportunidades de melhoria.
11. Realiza análises periódicas de mercado e concorrência (mensais e trimestrais), ajustando campanhas, posicionamento e ofertas com base nos dados coletados.
12. Propõe melhorias contínuas nos processos, estratégias e desempenho financeiro a partir dos resultados comerciais obtidos.
13. Participa de, no mínimo, dois eventos por ano (como Expo Revestir, ABF, Casa Cor SP, NFR, NRA e convenções), com foco em atualização profissional e ampliação de networking estratégico.
14. Avalia a satisfação dos clientes por meio do formulário NPS (Net Promoter Score).
15. Envia formulário cadastral aos clientes para coleta de dados essenciais à formalização e à execução dos projetos.

---

## Coordenadora de Projetos

**ID:** `default-role-coordenadora-projetos` &nbsp;·&nbsp; **Tag de cargo:** `liderança`

### Competências filtradas para este cargo

#### Atenção Concentrada · `liderança`

*Competência:* `comp-b1-atencao-concentrada` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-atenc-1` Mantém atenção em uma tarefa mesmo em ambientes com interferências.
- `q-b1-atenc-2` Demonstra preocupação constante em executar o trabalho sem erros.
- `q-b1-atenc-3` Identifica erros ou inconsistências no fluxo de atividades.

Base de diálogo:
- `q-b1-atenc-dial` Ao longo dos últimos projetos, como foi sua experiência em manter o foco durante a execução das atividades e quais efeitos isso teve no trabalho?

#### Autodesenvolvimento · `liderança`

*Competência:* `comp-b6-autodesenvolvimento` &nbsp;·&nbsp; *Categoria:* `bloco6`

Afirmações técnicas:
- `q-b6-ad-1` Reflete sobre sua própria atuação.
- `q-b6-ad-2` Busca evolução pessoal e profissional.

Base de diálogo:
- `q-b6-ad-dial` Considerando seu trabalho recente, como você refletiu sobre seu próprio desempenho e como isso ajudou a orientar melhorias?

#### Capacidade de Execução · `liderança`

*Competência:* `comp-b1-capacidade-execucao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-exec-1` Consegue transformar planos em ações concretas.
- `q-b1-exec-2` Utiliza adequadamente os recursos disponíveis para atingir seus objetivos.
- `q-b1-exec-3` Atua de forma sistemática para concluir o que foi planejado.

Base de diálogo:
- `q-b1-exec-dial` Considerando os últimos projetos, como aconteceu a passagem do planejamento para a execução e que efeito isso teve no trabalho realizado?

#### Capacidade Investigativa · `liderança`

*Competência:* `comp-b2-capacidade-investigativa` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-ci-1` Busca ativamente informações para compreender problemas.
- `q-b2-ci-2` Utiliza fontes variadas para aprofundar o entendimento.
- `q-b2-ci-3` Não se contenta com respostas superficiais.

Base de diálogo:
- `q-b2-ci-dial` Nos últimos projetos, quando surgiram dúvidas ou problemas, como você buscou informações para entender melhor a situação e como isso funcionou na prática?

#### Detalhista · `liderança`

*Competência:* `comp-b1-detalhista` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-detal-1` Garante precisão e qualidade em cada etapa do trabalho.
- `q-b1-detal-2` Dedica tempo necessário para revisar e corrigir detalhes.

Base de diálogo:
- `q-b1-detal-dial` Considerando as entregas dos últimos projetos, como você lidou com os detalhes e revisões e como isso se refletiu no resultado final?

#### Empatia · `liderança`

*Competência:* `comp-b4-empatia` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-emp-1` Ajusta sua comunicação ao contexto emocional da outra pessoa.
- `q-b4-emp-2` Demonstra sensibilidade diante das necessidades e dificuldades dos colegas.
- `q-b4-emp-3` Ouve o outro com atenção genuína.

Base de diálogo:
- `q-b4-emp-dial` Nos projetos e interações mais recentes, como você lidou com as necessidades dos colegas e como isso influenciou as relações?

#### Foco no Cliente · `liderança`

*Competência:* `comp-b3-foco-cliente` &nbsp;·&nbsp; *Categoria:* `bloco3`

Afirmações técnicas:
- `q-b3-fc-1` Prioriza as necessidades e a satisfação do cliente em suas ações.
- `q-b3-fc-2` Antecipa-se aos problemas que podem afetar a experiência do cliente.

Base de diálogo:
- `q-b3-fc-dial` Considerando os projetos recentes, como você buscou entender e atender às expectativas do cliente e qual foi o impacto disso no resultado?

#### Organização · `liderança`

*Competência:* `comp-b1-organizacao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-org-1` Organiza previamente seu material e suas atividades de trabalho.
- `q-b1-org-2` Administra bem o tempo para realizar suas tarefas.
- `q-b1-org-3` Planeja as atividades antes de executá-las.
- `q-b1-org-4` Define metas claras alinhadas aos objetivos estabelecidos.

Base de diálogo:
- `q-b1-org-dial` Nos projetos recentes, como você estruturou e organizou seu trabalho para dar andamento às atividades e como isso impactou o processo?

#### Planejamento · `liderança`

*Competência:* `comp-b1-planejamento` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-plan-1` Estabelece objetivos e metas antes de iniciar suas atividades.
- `q-b1-plan-2` Planeja considerando prioridades e recursos disponíveis.
- `q-b1-plan-3` Ajusta o planejamento quando surgem mudanças.
- `q-b1-plan-4` Antecipa recursos necessários para executar suas demandas.

Base de diálogo:
- `q-b1-plan-dial` Ao lembrar dos últimos projetos, como você se organizou antes de iniciar as atividades e em que medida isso contribuiu para o desenvolvimento do trabalho?

#### Relacionamento Interpessoal · `liderança`

*Competência:* `comp-b4-relacionamento-interpessoal` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-ri-1` Mantém bons relacionamentos com colegas e liderança.
- `q-b4-ri-2` Demonstra aceitação e respeito pelas diferenças.
- `q-b4-ri-3` Contribui para a construção de um clima organizacional favorável.

Base de diálogo:
- `q-b4-ri-dial` Considerando as interações mais recentes no trabalho, como você se relacionou com colegas de diferentes perfis e como avalia o impacto disso no ambiente?

#### Resolução de Problemas · `liderança`

*Competência:* `comp-b2-resolucao-problemas` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-rp-1` Identifica as causas reais dos problemas.
- `q-b2-rp-2` Propõe soluções práticas e eficazes.
- `q-b2-rp-3` Direciona esforços para resolver problemas de forma objetiva.

Base de diálogo:
- `q-b2-rp-dial` Nos últimos projetos, quando surgiram problemas, como você lidou com eles desde a identificação até a solução e como avalia o efeito disso no trabalho?

#### Tomada de Decisão · `liderança`

*Competência:* `comp-b2-tomada-decisao` &nbsp;·&nbsp; *Categoria:* `bloco2`

Afirmações técnicas:
- `q-b2-td-1` Analisa riscos e benefícios antes de agir.
- `q-b2-td-2` Decide com base no alinhamento estratégico da empresa.

Base de diálogo:
- `q-b2-td-dial` Nos projetos recentes, como você tomou as decisões mais importantes e de que forma elas contribuíram para o avanço das demandas?

### Atividades do cargo (Avaliação de Atividades)

1. Realiza o onboarding técnico de estagiários e profissionais recém-contratados.
2. Delega tarefas compatíveis com o nível de experiência de cada integrante da equipe, supervisionando prazos e qualidade das entregas.
3. Fornece feedbacks técnicos e comportamentais periódicos aos integrantes da equipe.
4. Apoia decisões internas relacionadas à gestão da equipe, organização de demandas e melhoria de processos.
5. Registra as necessidades específicas de cada projeto e as expectativas do cliente durante as reuniões de kickoff na plataforma de gestão ClickUp.
6. Realiza o primeiro contato com o cliente franqueado.
7. Garante disponibilidade para comunicação com o cliente via WhatsApp em todas as fases do projeto, assegurando o esclarecimento de dúvidas.
8. Coordena as tarefas executadas pelos integrantes dos projetos.
9. Supervisiona o envio dos arquivos em formato XLS dos projetos aprovados pela franqueadora.
10. Recebe os projetos aprovados, organiza e preenche a planilha de controle de projetos.
11. Colabora com engenheiros, construtores e fornecedores para garantir a viabilidade técnica dos projetos, assegurando a compatibilização adequada das informações.
12. Aloca as demandas dos projetos aprovados aos integrantes da equipe de desenvolvedores de projetos.
13. Gera e gerencia os cronogramas dos projetos no ClickUp, controlando prazos e demandas.
14. Registra e devolve as modificações necessárias aos desenvolvedores responsáveis pelos projetos.
15. Revisa e orienta as correções dos projetos em desenvolvimento junto aos arquitetos responsáveis até que atinjam o padrão adequado.
16. Realiza interlocuções técnicas com franqueadoras e franqueados para garantir alinhamento técnico e conceitual dos projetos, assegurando conformidade com os padrões exigidos.
17. Levanta as necessidades específicas de cada projeto e as expectativas de cada cliente a partir das reuniões de kickoff.
18. Computa e organiza todos os dados de entrada dos projetos, incluindo manual de franquia, caderno de normas técnicas e diretrizes de layout padrão.
19. Mantém o cliente atualizado sobre o andamento dos projetos.
20. Realiza contato com fornecedores para esclarecimento de dúvidas técnicas ou projetuais quando necessário (elétrica, hidráulica, entre outras).
21. Envia e acompanha os projetos junto ao franqueado, franqueadora ou concessionárias (aeroportos, shoppings, galerias, entre outros).
22. Desenvolve o layout inicial dos projetos propostos, considerando possíveis dificuldades e detalhes construtivos.
23. Envia o layout do projeto proposto para aprovação do cliente.
24. Participa do comitê de projetos com a ZAMP, responsável pela marca Subway no Brasil.
25. Confere dimensões, itens da lista de compras, Memorial Descritivo e RRT dos projetos antes da entrega final.

---

## Auxiliar de Serviços Gerais

**ID:** `default-role-auxiliar-servicos-gerais` &nbsp;·&nbsp; **Tag de cargo:** `associado`

### Competências filtradas para este cargo

#### Organização · `associado`

*Competência:* `comp-b1-organizacao` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-org-1` Organiza previamente seu material e suas atividades de trabalho.
- `q-b1-org-2` Administra bem o tempo para realizar suas tarefas.
- `q-b1-org-3` Planeja as atividades antes de executá-las.
- `q-b1-org-4` Define metas claras alinhadas aos objetivos estabelecidos.

Base de diálogo:
- `q-b1-org-dial` Nos projetos recentes, como você estruturou e organizou seu trabalho para dar andamento às atividades e como isso impactou o processo?

#### Comprometimento · `associado`

*Competência:* `comp-b5-comprometimento` &nbsp;·&nbsp; *Categoria:* `bloco5`

Afirmações técnicas:
- `q-b5-comp-1` Assume as responsabilidades do seu cargo.
- `q-b5-comp-2` Cumpre combinados e prazos acordados.

Base de diálogo:
- `q-b5-comp-dial` Pensando nas atividades e projetos mais recentes, como você lidou com responsabilidades, prazos e combinados assumidos, e como avalia o resultado disso?

#### Relacionamento Interpessoal · `associado`

*Competência:* `comp-b4-relacionamento-interpessoal` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-ri-1` Mantém bons relacionamentos com colegas e liderança.
- `q-b4-ri-2` Demonstra aceitação e respeito pelas diferenças.
- `q-b4-ri-3` Contribui para a construção de um clima organizacional favorável.

Base de diálogo:
- `q-b4-ri-dial` Considerando as interações mais recentes no trabalho, como você se relacionou com colegas de diferentes perfis e como avalia o impacto disso no ambiente?

#### Responsabilidade · `associado`

*Competência:* `comp-b5-responsabilidade` &nbsp;·&nbsp; *Categoria:* `bloco5`

Afirmações técnicas:
- `q-b5-resp-1` Demonstra segurança ao exercer suas funções.
- `q-b5-resp-2` Assume erros e falhas com transparência.

Base de diálogo:
- `q-b5-resp-dial` Considerando situações recentes de trabalho, como você lidou com erros, imprevistos ou falhas quando eles aconteceram, e como isso funcionou na prática?

#### Comportamento Ético · `associado`

*Competência:* `comp-b5-comportamento-etico` &nbsp;·&nbsp; *Categoria:* `bloco5`

Afirmações técnicas:
- `q-b5-ce-1` Age de acordo com princípios éticos e valores morais.
- `q-b5-ce-2` Toma decisões baseadas em princípios éticos sólidos.

Base de diálogo:
- `q-b5-ce-dial` Pensando nas decisões e situações recentes do trabalho, como você considerou aspectos éticos no dia a dia e como avalia os efeitos dessas escolhas?

#### Detalhista · `associado`

*Competência:* `comp-b1-detalhista` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-detal-1` Garante precisão e qualidade em cada etapa do trabalho.
- `q-b1-detal-2` Dedica tempo necessário para revisar e corrigir detalhes.

Base de diálogo:
- `q-b1-detal-dial` Considerando as entregas dos últimos projetos, como você lidou com os detalhes e revisões e como isso se refletiu no resultado final?

#### Agilidade · `associado`

*Competência:* `comp-b1-agilidade` &nbsp;·&nbsp; *Categoria:* `bloco1`

Afirmações técnicas:
- `q-b1-agilidade-1` Realiza suas tarefas de forma rápida sem prejudicar a qualidade do trabalho.
- `q-b1-agilidade-2` Identifica problemas com rapidez.
- `q-b1-agilidade-3` Encontra soluções de forma eficaz e ágil.
- `q-b1-agilidade-4` Utiliza o tempo necessário para executar suas atividades, sem excessos.

Base de diálogo:
- `q-b1-agilidade-dial` Pensando nos projetos mais recentes, de que forma você conduziu as entregas para cumprir os prazos e como avalia o resultado disso?

#### Comunicação · `associado`

*Competência:* `comp-b4-comunicacao` &nbsp;·&nbsp; *Categoria:* `bloco4`

Afirmações técnicas:
- `q-b4-com-1` Expressa suas ideias de forma clara, objetiva e estruturada.
- `q-b4-com-2` Ouve ativamente e demonstra compreensão sobre o que foi comunicado.
- `q-b4-com-3` Utiliza canais adequados para cada tipo de mensagem.

Base de diálogo:
- `q-b4-com-dial` Considerando as interações recentes, como você avalia sua clareza ao passar informações e como garante que o que foi dito foi realmente compreendido?

### Atividades do cargo (Avaliação de Atividades)

1. Executa a limpeza seguindo uma rotina definida, garantindo padrão de higiene em todos os ambientes, incluindo o depósito de materiais de limpeza e as superfícies.
2. Manuseia adequadamente equipamentos, móveis, cortinas e utensílios do escritório durante a limpeza.
3. Mantém a copa e a cozinha limpas e organizadas, garantindo que pia, bancadas, armários, geladeiras, eletrodomésticos e resíduos estejam em seus locais corretos.
4. Realiza a limpeza e a manutenção básica do quintal e das áreas externas, incluindo varrição, retirada de folhas, limpeza de áreas pavimentadas, rega de plantas e retirada de galhos secos.
5. Realiza a coleta e o descarte correto do lixo, seguindo as orientações de separação e reciclagem.
6. Informa com antecedência à administração sobre a necessidade de reposição dos materiais de limpeza.
7. Reposição materiais de higiene, como papel higiênico, papel toalha, sabonete, entre outros, sempre que necessário.
8. Utiliza produtos e materiais adequados para cada tipo de superfície, preservando sua conservação.
9. Troca e lava copos e xícaras das salas sempre que necessário.
10. Lava adequadamente e diariamente as vasilhas de água das cachorras.
11. Troca a água das cachorras com frequência, garantindo que esteja sempre limpa e fresca.
12. Verifica a presença de fezes das cachorras nas áreas internas ou externas do escritório, avisando imediatamente a pessoa responsável (Camila ou Luís) e realizando o descarte quando necessário.
13. Apoia na preparação de ambientes para reuniões ou eventos internos, conforme orientações recebidas.
14. Lava itens seguindo os procedimentos e rotinas estabelecidas.
15. Apoia no preparo de refeições simples, realizando tarefas básicas sob orientação.

---

**Totais:** 8 cargos · 80 vínculos cargo–competência · 140 atividades.
