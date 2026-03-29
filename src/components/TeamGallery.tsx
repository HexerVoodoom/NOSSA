import { useState, useEffect } from 'react';
import { SavedWork, Member } from '../types';
import { storage } from '../lib/storage';
import { DS, Button, Card } from './DesignSystem';
import { ArrowLeft, FileText, Filter, X, Trash2, Calendar, User, ShieldCheck, ChevronRight, Download } from 'lucide-react';
import { exportToPDF } from '../lib/pdfExport';
import { toast } from 'sonner@2.0.3';
import imgBackground from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";

interface TeamGalleryProps {
  onBack: () => void;
  onViewWork: (work: SavedWork) => void;
  onStartEvaluation: () => void;
}

export function TeamGallery({ onBack, onViewWork, onStartEvaluation }: TeamGalleryProps) {
  const [evaluations, setEvaluations] = useState<SavedWork[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<SavedWork[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    loadEvaluations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [evaluations, selectedRole, startDate, endDate]);

  const loadEvaluations = () => {
    const works = storage.getEvaluations();
    const sorted = works
      .filter(w => w.completed)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setEvaluations(sorted);
  };

  const applyFilters = () => {
    let filtered = [...evaluations];
    if (selectedRole !== 'all') filtered = filtered.filter(work => work.roleId === selectedRole);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(work => new Date(work.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(work => new Date(work.createdAt) <= end);
    }
    setFilteredEvaluations(filtered);
  };

  const getUniqueRoles = () => {
    const roles = storage.getRoles();
    const uniqueRoleIds = Array.from(new Set(evaluations.map(e => e.roleId)));
    return roles.filter(r => uniqueRoleIds.includes(r.id));
  };

  const hasActiveFilters = selectedRole !== 'all' || startDate !== '' || endDate !== '';

  const getCollaboratorInfo = (work: SavedWork): Member | null => {
    const members = storage.getMembers();
    return members.find(m => m.id === work.collaboratorId) || null;
  };

  const getSectionScore = (work: SavedWork, categoryId: string): number => {
    const roles = storage.getRoles();
    const role = roles.find(ro => ro.id === work.roleId);
    if (work.evaluationType === 'atividades') {
      if (categoryId !== 'activities-block') return 0;
      const activityResponses = work.responses.filter(r => role?.activities?.some(a => a.id === r.questionId));
      if (activityResponses.length === 0) return 0;
      return activityResponses.reduce((acc, r) => acc + r.rating, 0) / activityResponses.length;
    }
    const allQuestions = [...(storage.getCompetencies()?.flatMap(c => c.questions) || []), ...(role?.customQuestions || [])];
    const sectionResponses = work.responses.filter(r => {
      const question = allQuestions.find(q => q.id === r.questionId);
      if (!question || question.categoryId !== categoryId) return false;
      if (work.evaluationType === 'tradicional' && question.type === 'dialogic') return false;
      if (work.evaluationType === 'dialogica' && question.type === 'statement') return false;
      return true;
    });
    if (sectionResponses.length === 0) return 0;
    return sectionResponses.reduce((acc, r) => acc + r.rating, 0) / sectionResponses.length;
  };

  const handleExportPDF = (work: SavedWork, e: React.MouseEvent) => {
    e.stopPropagation();
    const collaborator = getCollaboratorInfo(work);
    exportToPDF(work, collaborator);
  };

  const handleDeleteEvaluation = (workId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      storage.deleteEvaluation(workId);
      loadEvaluations();
      toast.success('Avaliação excluída com sucesso!');
    }
  };

  const getEvaluationTypeBadge = (type?: string) => {
    switch(type) {
      case 'dialogica': 
        return { label: 'Dialógica', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      case 'atividades': 
        return { label: 'Atividades', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      default: 
        return { label: 'Tradicional', color: 'bg-slate-50 text-slate-600 border-slate-100' };
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-50 w-full">
        <div className="absolute inset-0 h-[81px] overflow-hidden">
          <img src={imgBackground} alt="" className="w-full h-full object-cover pointer-events-none" />
        </div>
        <nav className="relative flex items-center justify-between px-6 lg:px-[158.5px] py-[16px] h-[81px] border-b border-white/10 backdrop-blur-md bg-black/20">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[18px] font-bold text-white tracking-tight">Avaliações Salvas</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="h-[44px] px-4 rounded-[16px] bg-white/10 border border-white/20 text-white text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtros
            </button>
            <button onClick={onStartEvaluation} className="bg-[#0f172b] h-[44px] px-6 rounded-[16px] text-white text-sm font-bold shadow-sm active:scale-95 transition-all">
              Nova avaliação
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-[1417px] mx-auto px-6 lg:px-[182.5px] py-12 space-y-8">
        {showFilters && (
          <Card className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <label className={DS.inputs.label}>Cargo</label>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className={DS.inputs.base}>
                <option value="all">Todos os cargos</option>
                {getUniqueRoles().map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className={DS.inputs.label}>Data Inicial</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={DS.inputs.base} />
            </div>
            <div className="space-y-2">
              <label className={DS.inputs.label}>Data Final</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={DS.inputs.base} />
            </div>
          </Card>
        )}

        {filteredEvaluations.length === 0 ? (
          <div className="py-24 text-center space-y-6 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-200">
              <FileText className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-400">Nenhuma avaliação encontrada</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvaluations.map((work) => {
              const score = work.responses.reduce((s, r) => s + r.rating, 0) / work.responses.length;
              const badge = getEvaluationTypeBadge(work.evaluationType);
              return (
                <Card key={work.id} interactive onClick={() => onViewWork(work)} className="group p-0 overflow-hidden flex flex-col h-full border border-slate-100">
                  <div className="bg-slate-900 p-6 text-white relative">
                    <div className="absolute top-6 right-6 text-right">
                      <p className="text-2xl font-black tracking-tighter leading-none">{score.toFixed(1)}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase">Média</p>
                    </div>
                    <div className="space-y-1">
                      <div className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color} mb-2`}>
                        {badge.label}
                      </div>
                      <h3 className="text-xl font-black tracking-tighter leading-tight truncate pr-16">{work.collaboratorName}</h3>
                      <p className="text-white/40 text-[13px] font-bold">{work.roleName}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <User className="size-3.5" />
                        <span className="text-[13px] font-bold truncate">Líder: {work.leaderName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="size-3.5" />
                        <span className="text-[13px] font-bold">{new Date(work.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex gap-2">
                      <button 
                        onClick={(e) => handleExportPDF(work, e)} 
                        className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 text-[13px] font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="size-4" /> PDF
                      </button>
                      <button 
                        onClick={(e) => handleDeleteEvaluation(work.id, e)} 
                        className="size-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}