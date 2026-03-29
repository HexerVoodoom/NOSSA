import { useState, useEffect } from 'react';
import { Role, Activity, Competency, SavedWork } from '../types';
import { storage } from '../lib/storage';
import { newBlocks as categories } from '../lib/newBlocks';
import { DS, Card } from './DesignSystem';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  X, 
  ChevronDown, 
  ChevronUp, 
  GripVertical,
  Sparkles,
  UserCheck,
  Users,
  LayoutGrid,
  ListChecks,
  Award,
  Check
} from 'lucide-react';
import { toast } from "sonner@2.0.3";
import { motion, AnimatePresence } from 'motion/react';
import svgPaths from "../imports/svg-dp9vj8g4zf";
import imgHeaderBg from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";

interface RoleEditorProps {
  role: Role;
  onBack: () => void;
  onDelete: () => void;
  onViewWork?: (work: SavedWork) => void;
}

export function RoleEditor({ role, onBack, onDelete }: RoleEditorProps) {
  const isNew = !role.id;
  const [roleName, setRoleName] = useState(role.name);
  const [roleType, setRoleType] = useState<'leadership' | 'collaborator'>(role.type);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(role.questionIds);
  const [activities, setActivities] = useState<Activity[]>(role.activities || []);
  const [expandedCompetencies, setExpandedCompetencies] = useState<Set<string>>(new Set());
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [originalQuestionTexts, setOriginalQuestionTexts] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isActivitiesExpanded, setIsActivitiesExpanded] = useState(true);

  useEffect(() => {
    storage.initializeCompetencies();
    const loadedCompetencies = storage.getCompetencies();
    setCompetencies(loadedCompetencies);
    
    const texts: Record<string, string> = {};
    loadedCompetencies.forEach(comp => {
      comp.questions.forEach(q => {
        texts[q.id] = q.text;
      });
    });
    setOriginalQuestionTexts(texts);
  }, [role.id, isNew]);

  const totalSelectedItems = selectedQuestionIds.length;

  const toggleCompetency = (competencyId: string) => {
    const competency = competencies.find(c => c.id === competencyId);
    if (!competency) return;
    
    const competencyQuestionIds = competency.questions.map(q => q.id);
    const isFullySelected = competencyQuestionIds.every(qId => selectedQuestionIds.includes(qId));
    
    if (isFullySelected) {
      setSelectedQuestionIds(selectedQuestionIds.filter(id => !competencyQuestionIds.includes(id)));
    } else {
      const otherIds = selectedQuestionIds.filter(id => !competencyQuestionIds.includes(id));
      setSelectedQuestionIds([...otherIds, ...competencyQuestionIds]);
    }
  };

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    );
  };
  
  const toggleExpanded = (competencyId: string) => {
    setExpandedCompetencies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(competencyId)) newSet.delete(competencyId);
      else newSet.add(competencyId);
      return newSet;
    });
  };

  const handleUpdateQuestionText = (questionId: string, newText: string) => {
    setCompetencies(prev => prev.map(comp => ({
      ...comp,
      questions: comp.questions.map(q => q.id === questionId ? { ...q, text: newText } : q)
    })));
  };

  const handleSaveSingleQuestion = (questionId: string) => {
    let currentText = '';
    competencies.forEach(comp => {
      const q = comp.questions.find(q => q.id === questionId);
      if (q) currentText = q.text;
    });
    storage.saveCompetencies(competencies);
    setOriginalQuestionTexts(prev => ({ ...prev, [questionId]: currentText }));
    toast.success('Pergunta atualizada');
  };

  const handleAddActivity = () => {
    const newActivity: Activity = { id: `activity-${Date.now()}`, text: '', order: activities.length };
    setActivities([...activities, newActivity]);
    setIsActivitiesExpanded(true);
  };

  const handleSave = () => {
    if (!roleName.trim()) {
      toast.error('O nome do cargo é obrigatório');
      return;
    }
    storage.saveCompetencies(competencies);
    const updatedRole: Role = {
      ...role,
      id: role.id || `role-${Date.now()}`,
      name: roleName.trim(),
      type: roleType,
      questionIds: selectedQuestionIds,
      activities: activities.filter(a => a.text.trim() !== ''),
      createdAt: role.createdAt || new Date(),
    };
    storage.saveRole(updatedRole);
    toast.success('Cargo salvo com sucesso');
    onBack();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] relative">
      {/* FIXED HEADER SECTION */}
      <header className="sticky top-0 z-50 w-full">
        <div className="absolute inset-0 h-[81px] overflow-hidden">
          <img 
            src={imgHeaderBg} 
            alt="" 
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>
        <nav className="relative flex items-center justify-between px-6 lg:px-[158.5px] py-[16px] h-[81px] border-b border-white/10 backdrop-blur-md bg-black/20">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {isNew ? 'Novo Cargo' : 'Editar Cargo'}
            </h1>
          </div>

          <button 
            onClick={handleSave}
            className="bg-[#0f172b] h-[44px] px-12 rounded-[16px] flex items-center justify-center text-white text-sm font-bold shadow-sm active:scale-95 transition-all"
          >
            Salvar
          </button>
        </nav>
      </header>

      <main className="relative z-10 max-w-[1417px] mx-auto px-6 lg:px-[182.5px] py-12">
        <div className="max-w-[1052px] mx-auto space-y-12">
          
          {/* CARD: IDENTIDADE DO CARGO */}
          <Card className="p-12 space-y-12">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h2 className="text-[18px] font-bold text-[#1d293d] tracking-tight">Cargo</h2>
            </div>

            <div className="grid md:grid-cols-[1fr_300px] gap-12">
              <div className="space-y-3">
                <label className="text-[#64748b] text-[14px] font-bold tracking-tight">Nome oficial</label>
                <input 
                  type="text" 
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full text-[28px] font-black text-[#1d293d] bg-transparent border-b border-slate-300 py-4 focus:border-[#6155f5] outline-none transition-all placeholder:text-slate-300"
                  placeholder="Ex: Designer sênior"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[#64748b] text-[14px] font-bold tracking-tight">Tipo de atuação</label>
                <div className="flex p-1 bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] h-[54px]">
                  <button 
                    onClick={() => setRoleType('leadership')}
                    className={`flex-1 rounded-xl text-sm font-bold transition-all ${
                      roleType === 'leadership' ? 'bg-white shadow-md text-[#1d293d]' : 'text-[#64748b] hover:text-[#45556c]'
                    }`}
                  >
                    Liderança
                  </button>
                  <button 
                    onClick={() => setRoleType('collaborator')}
                    className={`flex-1 rounded-xl text-sm font-bold transition-all ${
                      roleType === 'collaborator' ? 'bg-white shadow-md text-[#1d293d]' : 'text-[#64748b] hover:text-[#45556c]'
                    }`}
                  >
                    Associado
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* CARD: ATIVIDADES ESPECÍFICAS */}
          <Card className="p-0 overflow-hidden">
            <button 
              onClick={() => setIsActivitiesExpanded(!isActivitiesExpanded)}
              className="w-full flex items-center justify-between p-12 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <ListChecks className="w-5 h-5" />
                </div>
                <h2 className="text-[18px] font-bold text-[#1d293d] tracking-tight">Atividades específicas</h2>
                <div className="bg-[#e2e8f0] px-3 py-1 rounded-[10px] text-[#0f172b] text-[14px] font-bold">
                  {activities.length}
                </div>
              </div>
              <div className="text-slate-500">
                {isActivitiesExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>

            <AnimatePresence>
              {isActivitiesExpanded && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-100">
                  <div className="p-12 space-y-12 bg-white">
                    <p className="text-[#45556c] text-[14px] leading-relaxed">
                      Descreva as responsabilidades técnicas exclusivas deste cargo.
                    </p>

                    <div className="space-y-6">
                      {activities.map((activity, index) => (
                        <div key={activity.id} className="flex items-start gap-4 group">
                          <span className="mt-4 text-[14px] font-bold text-slate-300 tabular-nums">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1">
                            <textarea 
                              value={activity.text}
                              onChange={(e) => setActivities(activities.map(a => a.id === activity.id ? { ...a, text: e.target.value } : a))}
                              placeholder="Responsabilidade técnica..."
                              className="w-full min-h-[80px] bg-[#f8fafc] border border-slate-100 rounded-2xl p-6 outline-none focus:border-[#6155f5] transition-all text-[#1d293d] font-bold resize-none"
                            />
                          </div>
                          <button onClick={() => setActivities(activities.filter(a => a.id !== activity.id))} className="p-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        onClick={handleAddActivity} 
                        className="w-full h-[64px] border-2 border-dashed border-[#e2e8f0] rounded-[16px] text-[#90a1b9] hover:text-[#6155f5] hover:border-[#6155f5] transition-all text-[14px] font-bold flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar atividade
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* CARD: BIBLIOTECA DE COMPETÊNCIAS */}
          <Card className="p-12 space-y-12">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-[18px] font-bold text-[#1d293d] tracking-tight">Biblioteca de competências</h2>
              </div>
              <div className="text-right space-y-1">
                <div className="text-[18px] font-black text-[#1d293d]">{totalSelectedItems}</div>
                <div className="text-[#64748b] text-[12px] font-bold uppercase tracking-wider">selecionados</div>
              </div>
            </div>

            <div className="space-y-16">
              {categories.map((category, catIdx) => {
                const categoryCompetencies = competencies.filter(c => c.categoryId === category.id);
                const selectedInCat = categoryCompetencies.filter(c => c.questions.some(q => selectedQuestionIds.includes(q.id))).length;

                return (
                  <div key={category.id} className="space-y-8">
                    <div className="flex items-end justify-between border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-[32px] font-black text-slate-200 leading-none">{catIdx + 1}</span>
                        <h3 className="text-[18px] font-bold text-[#1d293d]">{category.name}</h3>
                      </div>
                      <span className="text-[#64748b] text-[12px] font-bold uppercase tracking-wider">
                        {selectedInCat} / {categoryCompetencies.length} ativas
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {categoryCompetencies.map(competency => {
                        const isExpanded = expandedCompetencies.has(competency.id);
                        const compQuestions = competency.questions;
                        const selectedCount = compQuestions.filter(q => selectedQuestionIds.includes(q.id)).length;
                        const isFullySelected = selectedCount === compQuestions.length;
                        const isPartiallySelected = selectedCount > 0 && !isFullySelected;

                        return (
                          <div key={competency.id} className="border border-slate-50 rounded-[20px] overflow-hidden transition-all hover:border-slate-200">
                            <div className="flex items-center gap-6 p-6">
                              <button 
                                onClick={() => toggleCompetency(competency.id)}
                                className={`size-6 rounded-[8px] border-2 transition-all flex items-center justify-center shrink-0 ${
                                  isFullySelected ? 'bg-[#1d293d] border-[#1d293d] text-white' : isPartiallySelected ? 'bg-slate-200 border-slate-400' : 'bg-white border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                {isFullySelected && <Check className="w-4 h-4" />}
                                {isPartiallySelected && <div className="size-2 bg-slate-600 rounded-full" />}
                              </button>
                              
                              <button className="flex-1 text-left" onClick={() => toggleExpanded(competency.id)}>
                                <p className={`text-[15px] font-bold transition-colors ${selectedCount > 0 ? 'text-[#1d293d]' : 'text-slate-400'}`}>
                                  {competency.name}
                                </p>
                              </button>

                              <div className="flex items-center gap-6">
                                <span className="text-[#90a1b9] text-[12px] font-bold tabular-nums">
                                  {selectedCount}/{compQuestions.length}
                                </span>
                                <button onClick={() => toggleExpanded(competency.id)} className={`p-2 rounded-lg hover:bg-slate-50 transition-all ${isExpanded ? "rotate-180" : ""}`}>
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                </button>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-[#f8fafc] border-t border-slate-50 p-8 space-y-12">
                                  {/* Pergunta Dialógica */}
                                  {compQuestions.filter(q => q.type === 'dialogic' && !q.parentQuestionId).map(q => {
                                    const isEdited = q.text !== (originalQuestionTexts[q.id] || '');
                                    return (
                                      <div key={q.id} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#64748b] text-[12px] font-bold tracking-widest">Base de diálogo</span>
                                          {isEdited && (
                                            <button onClick={() => handleSaveSingleQuestion(q.id)} className="px-3 py-1 bg-[#1d293d] text-white text-[11px] font-black rounded-[6px] hover:bg-black transition-all flex items-center gap-1.5">
                                              <Check className="w-3 h-3" /> Salvar
                                            </button>
                                          )}
                                        </div>
                                        <textarea 
                                          value={q.text}
                                          onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                                          className={`w-full bg-white border border-slate-200 rounded-2xl p-6 outline-none focus:border-[#6155f5] transition-all text-[16px] font-bold leading-relaxed ${isEdited ? 'border-[#6155f5]' : 'italic text-slate-600'}`}
                                          rows={3}
                                        />
                                      </div>
                                    );
                                  })}

                                  {/* Afirmações Técnicas */}
                                  <div className="space-y-4">
                                    <span className="text-[#64748b] text-[12px] font-bold tracking-widest">Afirmações técnicas</span>
                                    <div className="grid gap-2">
                                      {compQuestions.filter(q => q.type === 'statement').map(q => {
                                        const isSelected = selectedQuestionIds.includes(q.id);
                                        return (
                                          <button 
                                            key={q.id}
                                            onClick={() => toggleQuestion(q.id)}
                                            className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                                              isSelected ? 'bg-white border-[#1d293d] shadow-sm' : 'bg-transparent border-transparent text-slate-600 hover:bg-white hover:border-slate-200'
                                            }`}
                                          >
                                            <div className={`size-5 rounded-[6px] border-2 transition-all flex items-center justify-center shrink-0 ${
                                              isSelected ? 'bg-[#1d293d] border-[#1d293d] text-white' : 'border-slate-400'
                                            }`}>
                                              {isSelected && <Check className="w-3 h-3" />}
                                            </div>
                                            <p className={`text-[14px] ${isSelected ? 'font-bold text-[#1d293d]' : 'font-medium'}`}>{q.text}</p>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {!isNew && (
            <div className="pt-12 border-t border-slate-100 flex justify-center">
              <button 
                className="px-8 py-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 transition-all flex items-center gap-2" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-5 h-5" />
                Arquivar este cargo permanentemente
              </button>
            </div>
          )}
        </div>
      </main>

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        title="Excluir Cargo?"
        message="Esta ação removerá o cargo permanentemente."
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => { storage.deleteRole(role.id); onDelete(); }}
      />
    </div>
  );
}