import { useState, useMemo } from 'react';
import { Evaluation, SavedWork } from '../types';
import { storage } from '../lib/storage';
import { newBlocks as categories } from '../lib/newBlocks';
import { getAllQuestionsFromCompetencies } from '../lib/competencyHelpers';
import { DS, Button, Card } from './DesignSystem';
import { 
  ArrowLeft, 
  Download, 
  Save, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  User,
  BarChart3,
  ChevronUp,
  ChevronDown,
  FileText
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import imgBackground from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";

interface EvaluationSummaryProps {
  evaluation: Evaluation;
  onBack: () => void;
  onSave: (work: SavedWork) => void;
  onExportPDF?: () => void;
}

export function EvaluationSummary({ evaluation, onBack, onSave, onExportPDF }: EvaluationSummaryProps) {
  const roles = storage.getRoles();
  const role = roles.find(r => r.id === evaluation.roleId);
  const allQuestions = getAllQuestionsFromCompetencies();

  // State for save confirmation modal
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  // State for category commitments
  const [categoryCommitments, setCategoryCommitments] = useState<Record<string, string>>({});

  // Calcular estatísticas por categoria
  const categoryStats = (evaluation.evaluationType === 'atividades' 
    ? [{ id: 'activities-block', name: 'Avaliação de Atividades', order: 1, color: '#34d399' }]
    : categories
  ).map(category => {
    const responsesInCategory = evaluation.responses.filter(r => {
      // Para atividades, a questão vem do role
      if (evaluation.evaluationType === 'atividades') {
        const activity = role?.activities?.find(a => a.id === r.questionId);
        return activity !== undefined && category.id === 'activities-block';
      }

      const question = allQuestions.find(q => q.id === r.questionId) ||
                      role?.customQuestions?.find(q => q.id === r.questionId);
      
      if (!question || question.categoryId !== category.id) return false;

      // Filtrar baseado no tipo de avaliação para não misturar notas
      if (evaluation.evaluationType === 'tradicional' && question.type === 'dialogic') {
        return false;
      }
      if (evaluation.evaluationType === 'dialogica' && question.type === 'statement') {
        return false;
      }

      return true;
    });
    
    const totalRating = responsesInCategory.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = responsesInCategory.length > 0 ? totalRating / responsesInCategory.length : 0;
    const totalQuestions = responsesInCategory.length;
    
    return {
      category,
      totalQuestions,
      averageRating: parseFloat(averageRating.toFixed(2)),
      responses: responsesInCategory,
    };
  }).filter(stat => stat.totalQuestions > 0);

  // Média geral
  const overallAverage = categoryStats.length > 0 
    ? parseFloat((categoryStats.reduce((sum, stat) => sum + stat.averageRating, 0) / categoryStats.length).toFixed(2))
    : 0;

  // Total de perguntas respondidas (filtradas pelo tipo)
  const totalQuestions = categoryStats.reduce((sum, stat) => sum + stat.totalQuestions, 0);

  // Palavras-chave mais mencionadas (filtradas pelo tipo)
  const allKeywords = evaluation.responses.flatMap(r => {
    // Buscar tipo da pergunta
    const allQs = [...(role?.customQuestions || []), ...allQuestions];
    const question = allQs.find(q => q.id === r.questionId);
    
    // Se não for dialógica, não conta palavras-chave (conforme nova regra)
    if (question && question.type !== 'dialogic') return [];

    // Para atividades (legado/fallback)
    if (evaluation.evaluationType === 'atividades') {
      const activity = role?.activities?.find(a => a.id === r.questionId);
      if (!activity) return [];
      return r.keywords.filter(k => k && k.trim() !== '');
    }

    if (!question) return [];

    // Filtrar baseado no tipo de avaliação
    if (evaluation.evaluationType === 'tradicional' && question.type === 'dialogic') {
      return [];
    }
    if (evaluation.evaluationType === 'dialogica' && question.type === 'statement') {
      return [];
    }

    return r.keywords.filter(k => k && k.trim() !== '');
  });
  const keywordCount: Record<string, number> = {};
  allKeywords.forEach(keyword => {
    const key = keyword.toLowerCase().trim();
    keywordCount[key] = (keywordCount[key] || 0) + 1;
  });
  const topKeywords = Object.entries(keywordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));

  const handleSave = () => {
    const work: SavedWork = {
      id: crypto.randomUUID(),
      roleId: evaluation.roleId,
      roleName: evaluation.roleName,
      collaboratorId: evaluation.collaboratorId,
      collaboratorName: evaluation.collaboratorName,
      leaderId: evaluation.leaderId,
      leaderName: evaluation.leaderName,
      responses: evaluation.responses,
      questionIds: evaluation.questionIds || [],
      sectionObservations: evaluation.sectionObservations || {},
      categoryCommitments: categoryCommitments, // Salvar comprometimentos
      assembledElements: [],
      createdAt: new Date().toISOString(),
      completed: true,
      evaluationType: evaluation.evaluationType, // Incluir tipo de avaliação
    };

    onSave(work);
    toast.success('✓ Avaliação salva com sucesso! Agora você pode vê-la na Galeria da Equipe.');
  };

  const getRatingLabel = (rating: number, evaluationType?: string): string => {
    if (evaluationType === 'tradicional') {
      const labels = [
        'Não atendeu ao desempenho esperado',
        'Atendeu parcialmente, precisando aprimorar muito',
        'Atendeu parcialmente, precisando aprimorar pouco',
        'Atendeu plenamente',
        'Superou as expectativas'
      ];
      return labels[Math.max(0, Math.min(4, Math.round(rating) - 1))];
    } else if (evaluationType === 'dialogica') {
      const labels = ['Quase não funcionou', 'Funcionou pouco', 'Funcionou em parte', 'Funcionou bem', 'Funcionou muito bem'];
      return labels[Math.max(0, Math.min(4, Math.round(rating) - 1))];
    } else if (evaluationType === 'atividades') {
      const labels = ['Insuficiente', 'Regular', 'Bom', 'Muito Bom', 'Excepcional'];
      return labels[Math.max(0, Math.min(4, Math.round(rating) - 1))];
    }
    return 'Não avaliado';
  };

  // Função para obter rótulo de contribuição para médias por categoria
  const getContributionLabel = (rating: number): string => {
    const labels = [
      'As ações quase não contribuíram para o projeto',
      'As ações contribuíram pouco para o projeto',
      'As ações contribuíram moderadamente para o projeto',
      'As ações contribuíram bastante para o projeto',
      'As ações contribuíram expressivamente para o projeto'
    ];
    return labels[Math.max(0, Math.min(4, Math.round(rating) - 1))];
  };

  // Função para obter label de média (usa escala de desempenho para tradicional, contribuição para outras)
  const getAverageLabel = (rating: number, evaluationType?: string): string => {
    if (evaluationType === 'tradicional') {
      return getRatingLabel(rating, 'tradicional');
    }
    return getContributionLabel(rating);
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return '#10b981'; // green
    if (rating >= 3.5) return '#3b82f6'; // blue
    if (rating >= 2.5) return '#f59e0b'; // amber
    if (rating >= 1.5) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Deseja salvar a avaliação?</h3>
            <p className="text-slate-600 mb-6">
              Ao salvar, a avaliação ficará disponível na Galeria da Equipe.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleSave();
                  setShowSaveConfirm(false);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg"
              >
                Sim, salvar
              </button>
              <button
                onClick={() => {
                  setShowSaveConfirm(false);
                  // Garantir que limpa a avaliação atual e volta
                  storage.clearCurrentEvaluation();
                  onBack();
                }}
                className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-200 font-medium"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowSaveConfirm(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 16 16">
                <path d="M8 12.6667L3.33333 8L8 3.33333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                <path d="M12.6667 8H3.33333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </svg>
            </button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Resumo da Avaliação</h1>
              <p className="text-sm text-white/80">Análise completa de desempenho</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#6155f5] hover:bg-white/90 transition-all duration-200 shadow-lg"
              >
                <Save className="w-5 h-5" />
                Salvar
              </button>
              {onExportPDF && (
                <button
                  onClick={onExportPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-200"
                >
                  <Download className="w-5 h-5" />
                  Exportar PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sidebar - Informações Gerais */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Card de Informações */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#6155f5]" />
                <h2 className="text-lg font-bold text-slate-900">Informações</h2>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500">Associado(a)</p>
                  <p className="font-semibold text-slate-900">{evaluation.collaboratorName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Líder</p>
                  <p className="font-semibold text-slate-900">{evaluation.leaderName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Cargo</p>
                  <p className="font-semibold text-slate-900">{evaluation.roleName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Data</p>
                  <p className="font-semibold text-slate-900">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Total de Perguntas</p>
                  <p className="font-semibold text-slate-900">{totalQuestions}</p>
                </div>
              </div>
            </div>

            {/* Card de Média Geral */}
            <div 
              className="rounded-2xl p-6 text-white shadow-lg"
              style={{ backgroundColor: getRatingColor(overallAverage) }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-6 h-6" />
                <h2 className="text-lg font-bold">Média Geral</h2>
              </div>
              
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{overallAverage.toFixed(1)}</div>
                <div className="text-white/80 text-sm">de 5.0</div>
              </div>
            </div>

            {/* Escala de Avaliação */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[#6155f5]" />
                <h2 className="text-lg font-bold text-slate-900">Escala de Avaliação Geral</h2>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center text-white font-bold">5</div>
                  <span className="text-slate-700">As ações contribuíram expressivamente para o projeto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white font-bold">4</div>
                  <span className="text-slate-700">As ações contribuíram bastante para o projeto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#f59e0b] flex items-center justify-center text-white font-bold">3</div>
                  <span className="text-slate-700">As ações contribuíram moderadamente para o projeto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#f97316] flex items-center justify-center text-white font-bold">2</div>
                  <span className="text-slate-700">As ações contribuíram pouco para o projeto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#ef4444] flex items-center justify-center text-white font-bold">1</div>
                  <span className="text-slate-700">As ações quase não contribuíram para o projeto</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Estatísticas por Categoria */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Desempenho por Categoria */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Desempenho por Categoria</h2>
              
              <div className="space-y-4">
                {categoryStats.map(stat => (
                  <div 
                    key={stat.category.id}
                    className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: getRatingColor(stat.averageRating) }}
                        >
                          {stat.averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-between flex-1">
                          <div>
                            <h3 className="font-bold text-slate-900">{stat.category.name}</h3>
                            <p className="text-sm text-slate-600">{stat.totalQuestions} perguntas</p>
                          </div>
                          <p 
                            className="font-bold text-slate-600 text-sm max-w-[200px] text-right"
                            style={{ color: getRatingColor(stat.averageRating) }}
                          >
                            {getAverageLabel(stat.averageRating, evaluation.evaluationType)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
                      <div 
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(stat.averageRating / 5) * 100}%`,
                          backgroundColor: getRatingColor(stat.averageRating)
                        }}
                      />
                    </div>

                    {/* Dropdown de perguntas detalhadas */}
                    <button
                      onClick={() => toggleCategory(stat.category.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 transition-all mb-3"
                    >
                      <span className="text-sm font-semibold text-slate-700">
                        {expandedCategories.includes(stat.category.id) ? 'Ocultar' : 'Ver'} Perguntas Detalhadas
                      </span>
                      {expandedCategories.includes(stat.category.id) ? (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      )}
                    </button>

                    {/* Lista de perguntas (colapsável) */}
                    {expandedCategories.includes(stat.category.id) && (
                      <div className="space-y-3 mb-3">
                        {stat.responses
                          .filter((response) => {
                            // Para atividades
                            if (evaluation.evaluationType === 'atividades') {
                              return role?.activities?.some(a => a.id === response.questionId);
                            }

                            const question = allQuestions.find(q => q.id === response.questionId) ||
                                            role?.customQuestions?.find(q => q.id === response.questionId);
                            if (!question) return false;
                            
                            // Filtrar baseado no tipo de avaliação
                            if (evaluation.evaluationType === 'tradicional' && question.type === 'dialogic') {
                              return false;
                            }
                            if (evaluation.evaluationType === 'dialogica' && question.type === 'statement') {
                              return false;
                            }
                            return true;
                          })
                          .map((response, idx) => {
                          const questionText = evaluation.evaluationType === 'atividades'
                            ? role?.activities?.find(a => a.id === response.questionId)?.text
                            : (allQuestions.find(q => q.id === response.questionId) ||
                               role?.customQuestions?.find(q => q.id === response.questionId))?.text;
                          
                          const keywords = response.keywords.filter(k => k && k.trim() !== '');
                          
                          if (!questionText) return null;
                          
                          return (
                            <div 
                              key={response.questionId}
                              className="p-3 bg-white rounded-lg border border-slate-200"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <p className="text-sm font-medium text-slate-800 flex-1">
                                  {idx + 1}. {questionText}
                                </p>
                                <div className="flex flex-col items-end gap-1">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                    style={{ backgroundColor: getRatingColor(response.rating || 1) }}
                                  >
                                    {response.rating || 1}
                                  </div>
                                  <span className="text-xs font-medium text-slate-600">
                                    {getRatingLabel(response.rating || 1, evaluation.evaluationType)}
                                  </span>
                                </div>
                              </div>
                              {keywords.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {keywords.map((keyword, kidx) => (
                                    <span 
                                      key={kidx}
                                      className="px-3 py-1 rounded-full text-xs font-medium bg-slate-600 text-white"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Campo de Comprometimento */}
                    <div className="mt-4 pt-4 border-t-2 border-slate-200">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        {stat.averageRating >= 4.0 
                          ? "O que aconteceu para ter essa pontuação? O que fazer para que minha entrega seja excelente?"
                          : "O que posso fazer para melhorar nesse aspecto?"}
                      </label>
                      <textarea
                        value={categoryCommitments[stat.category.id] || ''}
                        onChange={(e) => {
                          setCategoryCommitments(prev => ({
                            ...prev,
                            [stat.category.id]: e.target.value
                          }));
                        }}
                        placeholder={stat.averageRating >= 4.0 ? "Descreva como alcançar a excelência..." : "Descreva suas ações de melhoria..."}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-slate-400 focus:outline-none transition-colors resize-none bg-white text-sm"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Palavras-chave */}
            {topKeywords.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Palavras-chave Mais Mencionadas</h2>
                
                <div className="flex flex-wrap gap-2">
                  {topKeywords.map(({ keyword, count }) => (
                    <div 
                      key={keyword}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#6155f5] to-[#7c3aed] text-white flex items-center gap-2"
                    >
                      <span className="font-semibold">{keyword}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observações Gerais */}
            {Object.keys(evaluation.sectionObservations || {}).length > 0 && (
              <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#6155f5]" />
                  <h2 className="text-xl font-bold text-slate-900">Observações por Categoria</h2>
                </div>
                
                <div className="space-y-4">
                  {categoryStats.map(stat => {
                    const observation = evaluation.sectionObservations?.[stat.category.id];
                    if (!observation || !observation.trim()) return null;
                    
                    return (
                      <div 
                        key={stat.category.id}
                        className="p-4 rounded-xl border-2"
                        style={{ 
                          backgroundColor: `${stat.category.color}08`,
                          borderColor: `${stat.category.color}30`
                        }}
                      >
                        <h3 
                          className="font-bold mb-2"
                          style={{ color: stat.category.id === 'cat6' ? '#d97706' : stat.category.color }}
                        >
                          {stat.category.name}
                        </h3>
                        <p className="text-slate-700 whitespace-pre-wrap">{observation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}