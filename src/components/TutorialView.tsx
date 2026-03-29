import { ArrowLeft, BookOpen, Users, ClipboardCheck, Building2, BarChart3, Home, FileText } from 'lucide-react';
import imgBackground from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";

interface TutorialViewProps {
  onBack: () => void;
}

export function TutorialView({ onBack }: TutorialViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header with colored background */}
      <header className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={imgBackground} 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white shadow-lg">
              <BookOpen className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">Tutorial de Navegação</h1>
              <p className="text-white/90 mt-1">Aprenda a usar todas as funcionalidades do Arquitetura de Carreira</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          
          {/* Início */}
          <section className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#6155f5] to-[#7c3aed]">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">1. Início - Tela Principal</h2>
            </div>
            
            <div className="space-y-4 ml-14">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Navegação Principal</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                    <span><strong>Nova Avaliaç��o:</strong> Inicia o processo de avaliação de desempenho de um associado(a)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                    <span><strong>Galeria da Equipe:</strong> Visualiza todas as avaliações salvas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                    <span><strong>Membros:</strong> Gerencia os membros da equipe (líderes e associados)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                    <span><strong>Cargos:</strong> Configura cargos e personaliza perguntas de avaliação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                    <span><strong>Competências:</strong> Gerencia as competências e perguntas do sistema</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                    <span><strong>Avaliações Salvas:</strong> Visualiza dados consolidados de todas as avaliações concluídas</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 mt-6">
                <h3 className="font-semibold text-slate-900">Botão "Arquivo" (Canto Superior Direito)</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                    <span><strong>Salvar Dados:</strong> Exporta dados selecionados (equipe, cargos, competências, avaliações)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                    <span><strong>Carregar Dados:</strong> Importa dados de um arquivo JSON (pode adicionar ou sobrescrever)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                    <span><strong>Restaurar Versão Anterior:</strong> Recupera o último backup automático do sistema</span>
                  </li>
                </ul>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> O sistema cria backups automáticos antes de cada importação e ao salvar novas avaliações.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Membros */}
          <section className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#34d399] to-[#10b981]">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">2. Gerenciamento de Membros</h2>
            </div>
            
            <div className="space-y-4 ml-14">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Como Adicionar um Membro</h3>
                <ol className="space-y-2 text-slate-700 list-decimal list-inside">
                  <li>Clique em <strong>"Novo Membro"</strong></li>
                  <li>Preencha os dados: Nome, Sobrenome, E-mail, Cargo</li>
                  <li>Selecione o tipo: <strong>Líder</strong> ou <strong>Associado(a)</strong></li>
                  <li>Clique em <strong>"Salvar Membro"</strong></li>
                </ol>
              </div>

              <div className="space-y-2 mt-6">
                <h3 className="font-semibold text-slate-900">Funcionalidades</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#34d399] font-bold mt-0.5">•</span>
                    <span><strong>Filtrar por cargo:</strong> Use o dropdown para filtrar membros por cargo específico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#34d399] font-bold mt-0.5">•</span>
                    <span><strong>Buscar:</strong> Digite nome ou cargo na barra de busca</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#34d399] font-bold mt-0.5">•</span>
                    <span><strong>Editar:</strong> Clique no card do membro para ver detalhes e editar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#34d399] font-bold mt-0.5">•</span>
                    <span><strong>Excluir:</strong> Na tela de detalhes, use o botão "Excluir Membro"</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cargos */}
          <section className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706]">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">3. Configuração de Cargos</h2>
            </div>
            
            <div className="space-y-4 ml-14">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Como Criar um Cargo</h3>
                <ol className="space-y-2 text-slate-700 list-decimal list-inside">
                  <li>Clique em <strong>"Novo Cargo"</strong></li>
                  <li>Digite o nome do cargo (ex: "Gerente de Loja")</li>
                  <li>Selecione o tipo: <strong>Liderança</strong> ou <strong>Associado(a)</strong></li>
                  <li>Clique em <strong>"Criar Cargo"</strong></li>
                  <li>Após criar, você pode clicar em <strong>"Editar"</strong> para personalizar as perguntas</li>
                </ol>
              </div>

              <div className="space-y-2 mt-6">
                <h3 className="font-semibold text-slate-900">Personalização de Perguntas</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] font-bold mt-0.5">•</span>
                    <span>Cada cargo pode ter perguntas personalizadas diferentes do padrão</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] font-bold mt-0.5">•</span>
                    <span>Na tela de edição do cargo, navegue até "Perguntas Personalizadas"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] font-bold mt-0.5">•</span>
                    <span>Selecione quais perguntas incluir na avaliação deste cargo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] font-bold mt-0.5">•</span>
                    <span>Edite o texto das perguntas específicas para este cargo</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 mt-6">
                <h3 className="font-semibold text-slate-900">Exportação de PDF do Cargo</h3>
                <p className="text-slate-700 mb-3">
                  Cada cargo pode ser exportado como um <strong>formulário PDF imprimível</strong> para aplicação manual de avaliações.
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] font-bold mt-0.5">•</span>
                    <span><strong>Botão de Exportar:</strong> Na lista de cargos, clique no ícone de download para gerar o PDF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] font-bold mt-0.5">•</span>
                    <span><strong>Cabeçalho de Dados:</strong> O PDF inclui campos para preenchimento manual (Nome do Avaliando, Nome do Avaliador, Data da Avaliação, Número da Avaliação e Data de Entrada na Empresa)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] font-bold mt-0.5">•</span>
                    <span><strong>Escala Likert Horizontal:</strong> Cada categoria exibe a escala de avaliação (1-5) no cabeçalho, com checkboxes e descrições alinhadas horizontalmente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] font-bold mt-0.5">•</span>
                    <span><strong>Checkboxes por Pergunta:</strong> Cada pergunta/afirmação tem 5 checkboxes (1-5) ao lado direito para marcação rápida</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] font-bold mt-0.5">•</span>
                    <span><strong>Escalas por Tipo de Avaliação:</strong> Perguntas tradicionais/dialógicas usam a escala de desempenho (Não atendeu → Superou expectativas), enquanto atividades usam escala simplificada (Insuficiente → Excepcional)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] font-bold mt-0.5">•</span>
                    <span><strong>Organização por Bloco:</strong> As perguntas são agrupadas pelos 6 blocos temáticos (Base, Estrutura, Fachada, Horizonte, Detalhes, Propósito) com cores identificadoras</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-green-800">
                  ✅ <strong>Uso Prático:</strong> Este PDF é ideal para aplicar avaliações presenciais, em reuniões 1:1, ou para enviar ao associado(a) para auto-avaliação impressa.
                </p>
              </div>
            </div>
          </section>

          {/* Competências */}
          <section className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed]">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">4. Gestão de Competências</h2>
            </div>
            
            <div className="space-y-4 ml-14">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Estrutura das Competências</h3>
                <p className="text-slate-700">
                  As competências estão organizadas em <strong>6 categorias</strong> (Base, Estrutura, Fachada, Horizonte, Detalhes, Propósito). Cada competência contém múltiplas perguntas de avaliação.
                </p>
              </div>

              <div className="space-y-2 mt-6">
                <h3 className="font-semibold text-slate-900">Como Gerenciar</h3>
                <ol className="space-y-2 text-slate-700 list-decimal list-inside">
                  <li>Navegue pela lista de categorias e competências</li>
                  <li>Clique em <strong>"Nova Competência"</strong> para criar uma nova</li>
                  <li>Preencha o nome e selecione a categoria (Base, Estrutura, etc.)</li>
                  <li>Adicione perguntas à competência usando <strong>"Nova Pergunta"</strong></li>
                  <li>Para cada pergunta, defina se é <strong>Bônus</strong> (opcional) ou não</li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-amber-800">
                  ⚠️ <strong>Importante:</strong> Perguntas bônus são opcionais e não geram elementos arquitetônicos na visualização final.
                </p>
              </div>
            </div>
          </section>

          {/* Avaliação */}
          <section className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#db2777]">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">5. Processo de Avaliação</h2>
            </div>
            
            <div className="space-y-4 ml-14">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Passo a Passo</h3>
                <ol className="space-y-3 text-slate-700 list-decimal list-inside">
                  <li className="space-y-1">
                    <strong>Iniciar Avaliação</strong>
                    <p className="text-sm ml-5">Selecione o líder, associado(a) e cargo na tela inicial</p>
                  </li>
                  <li className="space-y-1">
                    <strong>Responder Perguntas por Categoria</strong>
                    <p className="text-sm ml-5">Navegue pelas 6 categorias respondendo cada pergunta com:</p>
                    <ul className="text-sm ml-9 mt-1 space-y-1">
                      <li>• 3 palavras-chave</li>
                      <li>• Nível de satisfação (1-5)</li>
                      <li>• Elemento visual (automático, pode escolher entre modelos)</li>
                    </ul>
                  </li>
                  <li className="space-y-1">
                    <strong>Observações da Seção</strong>
                    <p className="text-sm ml-5">Ao final de cada categoria, adicione comentários opcionais</p>
                  </li>
                  <li className="space-y-1">
                    <strong>Montar a Visualização</strong>
                    <p className="text-sm ml-5">Após finalizar, organize os elementos arquitetônicos na tela de montagem</p>
                  </li>
                  <li className="space-y-1">
                    <strong>Salvar ou Exportar</strong>
                    <p className="text-sm ml-5">Salve a avaliação na galeria ou exporte como imagem PNG</p>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Galeria */}
          <section className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0891b2]">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">6. Galeria da Equipe</h2>
            </div>
            
            <div className="space-y-4 ml-14">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Visualização de Avaliações</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#06b6d4] font-bold mt-0.5">•</span>
                    <span><strong>Cards de Avaliações:</strong> Mostra miniatura, nome do associado, cargo e data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#06b6d4] font-bold mt-0.5">•</span>
                    <span><strong>Filtros:</strong> Filtre por data ou cargo específico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#06b6d4] font-bold mt-0.5">•</span>
                    <span><strong>Detalhes:</strong> Clique em um card para ver a avaliação completa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#06b6d4] font-bold mt-0.5">•</span>
                    <span><strong>Exportar PDF:</strong> Na tela de detalhes, gere um relatório completo em PDF</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Dicas Finais */}
          <section className="bg-gradient-to-br from-[#6155f5]/10 to-[#7c3aed]/10 rounded-2xl p-8 border-2 border-[#6155f5]/20 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#ffcc00] to-[#fbbf24]">
                <FileText className="w-6 h-6 text-[#6155f5]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">💡 Dicas e Boas Práticas</h2>
            </div>
            
            <div className="space-y-3 ml-14 text-slate-700">
              <p className="flex items-start gap-2">
                <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                <span><strong>Backup Regular:</strong> Use o botão "Arquivo" → "Salvar Dados" para criar backups periódicos</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                <span><strong>Perguntas Bônus:</strong> Use para reflexões adicionais que não impactam a visualização final</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                <span><strong>Navegação entre Seções:</strong> Use os pills no topo para pular entre categorias durante a avaliação</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#6155f5] font-bold mt-0.5">•</span>
                <span><strong>Variações de Visualização:</strong> Experimente o botão "Gerar Nova Visualização" para ver diferentes composições</span>
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}