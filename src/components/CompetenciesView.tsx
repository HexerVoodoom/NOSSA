import { useState, useEffect } from 'react';
import { Competency } from '../types';
import { newBlocks as categories } from '../lib/newBlocks';
import { storage, STORAGE_KEYS } from '../lib/storage';
import { useStorageSync } from '../lib/useStorageSync';
import { DS, Button, Card } from './DesignSystem';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Edit2,
  Edit3, 
  Trash2, 
  Save, 
  X,
  Check, 
  ChevronDown, 
  ChevronUp,
  ChevronRight
} from 'lucide-react';
import { toast } from "sonner";
import svgPaths from "../imports/svg-1j9eir7tjm";
import imgHeaderBg from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";
import { motion, AnimatePresence } from 'motion/react';

interface CompetenciesViewProps {
  onBack: () => void;
}

// Contador de sequência para ids: `Date.now()` sozinho colide quando o usuário
// clica duas vezes no mesmo milissegundo, gerando ids duplicados (chaves React
// repetidas e perguntas que se sobrescrevem ao editar/excluir).
let idCounter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

// Remove das listas de perguntas dos cargos os ids que deixaram de existir.
// Sem esta limpeza, excluir uma competência/pergunta deixa `role.questionIds`
// apontando para perguntas inexistentes e a avaliação encolhe silenciosamente.
const removeQuestionIdsFromRoles = (removedIds: string[]): number => {
  if (removedIds.length === 0) return 0;
  const removed = new Set(removedIds);
  let affectedRoles = 0;

  storage.getRoles().forEach(role => {
    const questionIds = Array.isArray(role.questionIds) ? role.questionIds : [];
    const kept = questionIds.filter(id => !removed.has(id));
    if (kept.length !== questionIds.length) {
      storage.saveRole({ ...role, questionIds: kept });
      affectedRoles++;
    }
  });

  return affectedRoles;
};

// storage.saveCompetencies devolve false quando a gravação falha (cota do
// navegador esgotada). Sem checar, a tela mostrava "salvo com sucesso" para
// uma escrita que nunca aconteceu.
const persisted = (ok: boolean): boolean => {
  if (!ok) toast.error('Não foi possível salvar: espaço do navegador esgotado.');
  return ok;
};

export function CompetenciesView({ onBack }: CompetenciesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [allCompetencies, setAllCompetencies] = useState(storage.getCompetencies());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompData, setNewCompData] = useState({ name: '', categoryId: '' });

  useEffect(() => {
    setAllCompetencies(storage.getCompetencies());
  }, []);

  useStorageSync([STORAGE_KEYS.COMPETENCIES], () => setAllCompetencies(storage.getCompetencies()));

  // Esc fecha o modal — sem isso ele só podia ser dispensado com o mouse.
  useEffect(() => {
    if (!showAddModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showAddModal]);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id: string, currentText: string) => {
    setEditingId(id);
    setEditValue(currentText);
  };

  const handleSaveEdit = (questionId: string) => {
    // Texto vazio deixaria um card em branco sem nenhuma forma de recuperá-lo.
    const text = editValue.trim();
    if (!text) {
      toast.error('O texto da pergunta não pode ficar vazio');
      return;
    }

    // O spread preserva competencyId/categoryId/type/order da pergunta original.
    const updatedCompetencies = storage.getCompetencies().map(comp => ({
      ...comp,
      questions: (comp.questions ?? []).map(q => q.id === questionId ? { ...q, text } : q)
    }));
    if (!persisted(storage.saveCompetencies(updatedCompetencies))) return;
    setAllCompetencies(updatedCompetencies);
    setEditingId(null);
    toast.success('Pergunta atualizada');
  };

  const openAddModal = () => {
    setNewCompData({ name: '', categoryId: selectedCategory || categories[0].id });
    setShowAddModal(true);
  };

  const handleAddCompetency = () => {
    if (!newCompData.name.trim()) {
      toast.error('O nome da competência é obrigatório');
      return;
    }

    // As perguntas precisam herdar categoryId/competencyId e ter `order`:
    // sem isso elas não são associadas ao bloco e ficam fora da ordenação.
    // Garante um bloco válido mesmo se o select nunca foi tocado.
    const categoryId = newCompData.categoryId || selectedCategory || categories[0].id;
    const stored = storage.getCompetencies();
    const newCompId = uid('comp');
    const newComp: Competency = {
      id: newCompId,
      name: newCompData.name.trim(),
      categoryId,
      // `order` é relativo ao bloco: usar o total global deixaria buracos na
      // ordenação de cada bloco.
      order: stored.filter(c => c.categoryId === categoryId).length,
      questions: [
        {
          id: uid('q-diag'),
          text: 'Como você avalia sua performance nesta competência?',
          type: 'dialogic' as const,
          categoryId,
          competencyId: newCompId,
          order: 0,
        },
        {
          id: uid('q-stat'),
          text: 'Demonstra domínio técnico nos processos da área.',
          type: 'statement' as const,
          categoryId,
          competencyId: newCompId,
          order: 1,
        }
      ],
      createdAt: new Date().toISOString()
    };

    const updated = [...stored, newComp];
    if (!persisted(storage.saveCompetencies(updated))) return;
    setAllCompetencies(storage.getCompetencies());
    setShowAddModal(false);
    // Leva o usuário ao bloco escolhido: criar a competência em outro bloco
    // enquanto se navega dentro de um dava a impressão de que nada aconteceu.
    setSelectedCategory(categoryId);
    toast.success('Competência adicionada com sucesso');
  };

  const handleDeleteCompetency = (id: string) => {
    const competency = allCompetencies.find(c => c.id === id);
    if (!competency) return;

    const questionIds = (competency.questions ?? []).map(q => q.id);
    const confirmed = window.confirm(
      `Excluir a competência "${competency.name}"?\n\n` +
        `${questionIds.length} pergunta(s) serão removidas e deixarão de aparecer nas avaliações dos cargos que as utilizam.`
    );
    if (!confirmed) return;

    // `storage.saveCompetencies` faz merge (upsert) e nunca remove: salvar a
    // lista já filtrada NÃO excluía nada — a competência voltava ao recarregar.
    // A poda dos cargos só pode acontecer depois de a exclusão ter sido
    // realmente gravada: caso contrário os cargos perdiam as referências
    // enquanto a competência continuava lá, e o toast dizia que deu certo.
    if (!persisted(storage.deleteCompetency(id))) return;
    const affectedRoles = removeQuestionIdsFromRoles(questionIds);
    setAllCompetencies(storage.getCompetencies());
    toast.success(
      affectedRoles > 0
        ? `Competência removida — ${affectedRoles} cargo(s) atualizados`
        : 'Competência removida'
    );
  };

  const handleAddQuestion = (competencyId: string, type: 'statement' | 'dialogic') => {
    const updatedCompetencies = storage.getCompetencies().map(comp => {
      if (comp.id === competencyId) {
        const questions = comp.questions ?? [];
        const newQuestion = {
          id: uid(`q-${type}`),
          text: type === 'statement' ? 'Nova afirmação técnica...' : 'Nova pergunta dialógica...',
          type: type,
          categoryId: comp.categoryId,
          competencyId: comp.id,
          order: questions.length,
        };
        return {
          ...comp,
          questions: [...questions, newQuestion]
        };
      }
      return comp;
    });
    if (!persisted(storage.saveCompetencies(updatedCompetencies))) return;
    setAllCompetencies(updatedCompetencies);
    toast.success(type === 'statement' ? 'Afirmação adicionada' : 'Pergunta adicionada');
  };

  const handleDeleteQuestion = (competencyId: string, questionId: string) => {
    if (!window.confirm('Excluir esta pergunta permanentemente? Ela deixará de aparecer nas avaliações dos cargos que a utilizam.')) return;

    const updatedCompetencies = storage.getCompetencies().map(comp => {
      if (comp.id === competencyId) {
        return {
          ...comp,
          questions: (comp.questions ?? []).filter(q => q.id !== questionId)
        };
      }
      return comp;
    });
    if (!persisted(storage.saveCompetencies(updatedCompetencies))) return;
    // Também limpa a referência nos cargos (ver removeQuestionIdsFromRoles).
    const affectedRoles = removeQuestionIdsFromRoles([questionId]);
    setAllCompetencies(storage.getCompetencies());
    toast.success(
      affectedRoles > 0
        ? `Pergunta removida — ${affectedRoles} cargo(s) atualizados`
        : 'Pergunta removida'
    );
  };

  const category = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;
  const categoryCompetencies = selectedCategory ? allCompetencies.filter(c => c.categoryId === selectedCategory) : [];

  return (
    <div className="min-h-screen bg-[#fafafa] relative">
      {/* FIXED HEADER SECTION */}
      <header className="sticky top-0 z-50 w-full">
        <div className="absolute inset-0 h-[81px] overflow-hidden">
          <img src={imgHeaderBg} alt="" className="w-full h-full object-cover pointer-events-none" />
        </div>
        <nav className="relative flex items-center justify-between px-6 lg:px-[158.5px] py-[16px] h-[81px] border-b border-white/10 backdrop-blur-md bg-black/20">
          <div className="flex items-center gap-4">
            <button 
              onClick={selectedCategory ? () => setSelectedCategory(null) : onBack}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white"
              aria-label={selectedCategory ? 'Voltar para a lista de blocos' : 'Voltar'}
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            {selectedCategory ? (
              <div className="flex items-center gap-1 text-white font-bold text-sm">
                <span className="opacity-60">Competências /</span>
                <span>{category?.name}</span>
              </div>
            ) : (
              <h1 className="text-[18px] font-bold text-white tracking-tight">Competências</h1>
            )}
          </div>

          <button 
            onClick={openAddModal}
            className="bg-[#0f172b] h-[44px] px-6 rounded-[16px] flex items-center gap-2 text-white text-sm font-bold shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova competência
          </button>
        </nav>
      </header>

      <main className="relative z-10 max-w-[1417px] mx-auto px-6 lg:px-[182.5px] py-12 pb-24 space-y-12">
        {!selectedCategory ? (
          <>
            {/* SEARCH */}
            <div className="relative w-full max-w-2xl group">
              <div className="absolute inset-0 bg-white rounded-[16px] border border-[#e2e8f0] group-focus-within:border-slate-400 transition-all pointer-events-none shadow-sm" />
              <div className="relative flex items-center h-[54px] pl-[48px] pr-4">
                <div className="absolute left-[16px]">
                  <Search className="w-4 h-4 text-[#90a1b9]" />
                </div>
                <input
                  type="text"
                  aria-label="Pesquisar blocos temáticos"
                  placeholder="Pesquisar por nome ou descrição do bloco..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[#1d293d] text-[14px] font-medium placeholder:text-[#90a1b9]"
                />
              </div>
            </div>

            {/* ESTADO VAZIO DA BUSCA */}
            {filteredCategories.length === 0 && (
              <div className="bg-white rounded-[24px] border border-[#e2e8f0] shadow-sm p-12 text-center">
                <h3 className="text-[24px] font-bold text-[#1d293d] tracking-[-0.6px] mb-4">Nenhum bloco encontrado</h3>
                <p className="text-[#45556c] text-[14px] leading-[22.75px] max-w-[420px] mx-auto">
                  Nenhum bloco corresponde a "{searchTerm}". Ajuste os termos da busca e tente novamente.
                </p>
              </div>
            )}

            {/* GRID OF BLOCKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCategories.map(category => (
                <div
                  key={category.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Explorar bloco ${category.name}`}
                  onClick={() => setSelectedCategory(category.id)}
                  onKeyDown={(e) => {
                    // Card clicável precisa responder a Enter/Espaço para quem navega pelo teclado.
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCategory(category.id);
                    }
                  }}
                  className="group relative bg-white border border-[#e2e8f0] rounded-[24px] h-[320px] shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden p-8 flex flex-col justify-between"
                >
                  <div className="absolute -top-12 -right-4 pointer-events-none select-none">
                    <span className="text-[128px] font-black text-[#f1f5f9] leading-none group-hover:text-[#f8fafc] transition-colors">
                      {/* Numeração fixa do bloco: usar o índice da lista filtrada renumerava os cards durante a busca. */}
                      {categories.findIndex(c => c.id === category.id) + 1}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-6">
                    <div className="h-2 w-12 rounded-full shadow-sm" style={{ backgroundColor: category.color }} />
                    <div className="space-y-4">
                      <h3 className="text-[24px] font-bold text-[#1d293d] leading-tight tracking-tight max-w-[200px]">
                        {category.name}
                      </h3>
                      <p className="text-[#45556c] text-[14px] leading-relaxed line-clamp-4">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-[#45556c] text-[14px] font-bold tracking-[0.7px]">
                      Explorar bloco
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#0f172b] flex items-center justify-center text-white group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="grid gap-8">
            {categoryCompetencies.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-[#e2e8f0] shadow-sm p-12 lg:p-24 text-center">
                <div className="bg-[#f8fafc] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Plus className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-[24px] font-bold text-[#1d293d] tracking-[-0.6px] mb-4">Nenhuma competência neste bloco</h3>
                <p className="text-[#45556c] text-[14px] leading-[22.75px] max-w-[420px] mx-auto mb-10">
                  Adicione competências ao bloco "{category?.name}" para organizar suas perguntas dialógicas e afirmações técnicas.
                </p>
                <button 
                  onClick={openAddModal}
                  className="mx-auto bg-[#0f172b] h-[44px] px-8 rounded-[16px] text-white text-[14px] font-bold shadow-md hover:bg-[#1a2642] transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar primeira competência
                </button>
              </div>
            ) : (
              <>
                {categoryCompetencies.map(competency => {
                  // `questions` pode faltar em dados importados/corrompidos.
                  const questions = competency.questions ?? [];
                  const dialogicQuestions = questions.filter(q => q.type === 'dialogic');
                  const statements = questions.filter(q => q.type === 'statement');

                  return (
                    <div key={competency.id} className="bg-white rounded-[24px] border border-[#e2e8f0] p-12 shadow-sm relative group">
                      <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-[#1d293d]" />
                          <h2 className="text-[24px] font-bold text-[#1d293d] tracking-tight">{competency.name}</h2>
                        </div>
                        <button 
                          onClick={() => handleDeleteCompetency(competency.id)}
                          aria-label={`Excluir competência ${competency.name}`}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[#64748b] text-[14px] font-bold tracking-tight">Base de Diálogo</h3>
                            <button 
                              onClick={() => handleAddQuestion(competency.id, 'dialogic')}
                              className="flex items-center gap-1.5 text-[12px] font-black text-[#6155f5] hover:text-[#0f172b] transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" /> Adicionar
                            </button>
                          </div>
                          {dialogicQuestions.map(q => (
                            <div key={q.id} className="bg-[#f8fafc] rounded-2xl p-8 transition-all hover:bg-slate-100 group/q">
                              {editingId === q.id ? (
                                <div className="space-y-4">
                                  <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    aria-label="Editar pergunta dialógica"
                                    className="w-full min-h-[120px] bg-white border border-slate-200 rounded-xl p-4 outline-none focus:border-[#6155f5] transition-all text-[#1d293d] font-bold"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => setEditingId(null)} className="h-9 px-4 rounded-xl text-sm font-bold text-slate-500 hover:bg-white transition-all">Cancelar</button>
                                    <button onClick={() => handleSaveEdit(q.id)} className="h-9 px-4 rounded-xl text-sm font-bold bg-[#0f172b] text-white transition-all">Salvar</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between gap-4">
                                  <p className="text-[18px] font-bold text-[#1d293d] leading-relaxed italic">"{q.text}"</p>
                                  {/* focus-within mantém as ações visíveis para quem navega por teclado. */}
                                  <div className="flex items-center gap-1 opacity-0 group-hover/q:opacity-100 focus-within:opacity-100 transition-all">
                                    <button onClick={() => handleEdit(q.id, q.text)} aria-label="Editar pergunta dialógica" className="p-2 text-slate-300 hover:text-[#0f172b]">
                                      <Edit3 className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                    <button onClick={() => handleDeleteQuestion(competency.id, q.id)} aria-label="Excluir pergunta dialógica" className="p-2 text-slate-300 hover:text-red-500">
                                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[#64748b] text-[14px] font-bold tracking-tight">Afirmações Técnicas</h3>
                            <button 
                              onClick={() => handleAddQuestion(competency.id, 'statement')}
                              className="flex items-center gap-1.5 text-[12px] font-black text-[#6155f5] hover:text-[#0f172b] transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" /> Adicionar
                            </button>
                          </div>
                          <div className="grid gap-3">
                            {statements.map((q, idx) => (
                              <div key={q.id} className="flex gap-4 p-5 rounded-2xl border border-[#f1f5f9] hover:border-slate-200 transition-all group/q bg-white">
                                <span className="text-sm font-black text-[#90a1b9] mt-1">{idx + 1}</span>
                                <div className="flex-1">
                                  {editingId === q.id ? (
                                    <div className="space-y-3">
                                      <textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        aria-label="Editar afirmação técnica"
                                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-3 outline-none focus:border-[#6155f5] transition-all text-sm font-medium"
                                        autoFocus
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <button onClick={() => setEditingId(null)} aria-label="Cancelar edição" className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" aria-hidden="true" /></button>
                                        <button onClick={() => handleSaveEdit(q.id)} aria-label="Salvar afirmação" className="p-1 text-[#0f172b] hover:text-black"><Check className="w-4 h-4" aria-hidden="true" /></button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex justify-between gap-2">
                                      <p className="text-[#45556c] text-[14px] leading-relaxed font-medium">{q.text}</p>
                                      <div className="flex items-center gap-1 opacity-0 group-hover/q:opacity-100 focus-within:opacity-100 transition-all">
                                        <button onClick={() => handleEdit(q.id, q.text)} aria-label={`Editar afirmação ${idx + 1}`} className="p-1 text-slate-300 hover:text-slate-900">
                                          <Edit3 className="w-4 h-4" aria-hidden="true" />
                                        </button>
                                        <button onClick={() => handleDeleteQuestion(competency.id, q.id)} aria-label={`Excluir afirmação ${idx + 1}`} className="p-1 text-slate-300 hover:text-red-500">
                                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </main>

      {/* MODAL DE ADIÇÃO DE COMPETÊNCIA */}
      <AnimatePresence>
        {showAddModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-nova-competencia"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 id="titulo-nova-competencia" className="text-2xl font-bold text-[#1d293d]">Nova competência</h3>
                  <button onClick={() => setShowAddModal(false)} aria-label="Fechar" className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                    <X className="w-6 h-6 text-slate-400" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="nova-competencia-nome" className="text-[12px] font-bold text-[#64748b] tracking-widest">Nome da competência</label>
                    <input
                      id="nova-competencia-nome"
                      type="text"
                      value={newCompData.name}
                      onChange={(e) => setNewCompData(prev => ({ ...prev, name: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddCompetency(); }}
                      className="w-full h-14 bg-[#f8fafc] border border-slate-200 rounded-2xl px-6 outline-none focus:border-[#6155f5] transition-all font-bold text-[#1d293d]"
                      placeholder="Ex: Pensamento Estratégico"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nova-competencia-bloco" className="text-[12px] font-bold text-[#64748b] tracking-widest">Bloco Temático</label>
                    <select
                      id="nova-competencia-bloco"
                      value={newCompData.categoryId}
                      onChange={(e) => setNewCompData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full h-14 bg-[#f8fafc] border border-slate-200 rounded-2xl px-6 outline-none focus:border-[#6155f5] transition-all font-bold text-[#1d293d] appearance-none"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 h-14 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddCompetency}
                    className="flex-1 h-14 bg-[#0f172b] text-white rounded-2xl font-bold shadow-lg shadow-black/10 hover:translate-y-[-2px] active:translate-y-0 transition-all"
                  >
                    Criar Competência
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}