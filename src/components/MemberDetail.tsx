import { useState, useEffect } from 'react';
import { Member, SavedWork } from '../types';
import { storage } from '../lib/storage';
import { DS, Button, Card } from './DesignSystem';
import { 
  ArrowLeft, 
  Edit2, 
  User, 
  Briefcase, 
  Calendar, 
  Award, 
  TrendingUp, 
  Users as UsersIcon,
  ChevronRight,
  History
} from 'lucide-react';
import imgBackground from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";

interface MemberDetailProps {
  memberId: string;
  onBack: () => void;
  onEditMember: (member: Member) => void;
  onViewWork: (workId: string) => void;
}

export function MemberDetail({ memberId, onBack, onEditMember, onViewWork }: MemberDetailProps) {
  const [member, setMember] = useState<Member | null>(null);
  const [evaluations, setEvaluations] = useState<SavedWork[]>([]);
  
  useEffect(() => {
    const foundMember = storage.getMembers().find(m => m.id === memberId);
    setMember(foundMember || null);
    
    if (foundMember) {
      const allEvaluations = storage.getEvaluations();
      const memberEvaluations = allEvaluations.filter(
        evaluation => evaluation.collaboratorId === memberId || evaluation.leaderId === memberId
      );
      setEvaluations(memberEvaluations);
    }
  }, [memberId]);
  
  if (!member) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className={DS.typography.body}>Membro não encontrado</p>
      </div>
    );
  }
  
  const formatDateLocal = (date: Date | string): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };
  
  const calculateTenure = (startDate: Date): string => {
    const today = new Date();
    const start = new Date(startDate);
    const years = today.getFullYear() - start.getFullYear();
    const months = today.getMonth() - start.getMonth();
    let totalMonths = years * 12 + months;
    if (today.getDate() < start.getDate()) totalMonths--;
    const displayYears = Math.floor(totalMonths / 12);
    const displayMonths = totalMonths % 12;
    if (displayYears > 0 && displayMonths > 0) return `${displayYears} ano${displayYears > 1 ? 's' : ''} e ${displayMonths} meses`;
    if (displayYears > 0) return `${displayYears} ano${displayYears > 1 ? 's' : ''}`;
    return `${displayMonths} meses`;
  };

  const evaluationsAsCollaborator = evaluations.filter(e => e.collaboratorId === memberId);
  const evaluationsAsLeader = evaluations.filter(e => e.leaderId === memberId);

  const avgPerformance = evaluationsAsCollaborator.length > 0
    ? evaluationsAsCollaborator.reduce((sum, evaluation) => {
        const evalAvg = evaluation.responses.reduce((s, r) => s + r.rating, 0) / evaluation.responses.length;
        return sum + evalAvg;
      }, 0) / evaluationsAsCollaborator.length
    : 0;
  
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* HERO HEADER */}
      <header className="sticky top-0 z-50 w-full">
        <div className="absolute inset-0 h-[81px] overflow-hidden">
          <img src={imgBackground} alt="" className="w-full h-full object-cover pointer-events-none" />
        </div>
        <nav className="relative flex items-center justify-between px-6 lg:px-[158.5px] py-[16px] h-[81px] border-b border-white/10 backdrop-blur-md bg-black/20">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-lg border border-slate-200">
                <User className="size-5 text-slate-900" />
              </div>
              <h1 className="text-[18px] font-bold text-white tracking-tight">
                {member.firstName} {member.lastName || ''}
              </h1>
            </div>
          </div>
          <button 
            onClick={() => onEditMember(member)} 
            className="h-[44px] px-6 rounded-[16px] bg-white/10 border border-white/20 text-white text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <Edit2 className="size-4" /> Editar
          </button>
        </nav>
      </header>

      <main className="max-w-[1417px] mx-auto px-6 lg:px-[182.5px] py-12 space-y-12">
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Recebidas', val: evaluationsAsCollaborator.length, icon: Award, color: 'bg-indigo-500' },
            { label: 'Realizadas', val: evaluationsAsLeader.length, icon: UsersIcon, color: 'bg-emerald-500' },
            { label: 'Performance', val: avgPerformance > 0 ? `${avgPerformance.toFixed(1)}/5` : '---', icon: TrendingUp, color: 'bg-orange-500' },
            { label: 'Tempo', val: member.startDate ? calculateTenure(new Date(member.startDate)) : '---', icon: History, color: 'bg-slate-800' }
          ].map((stat, i) => (
            <Card key={i} className="p-6 flex items-center gap-4 border-l-4" style={{ borderLeftColor: stat.color.replace('bg-', '') }}>
              <div className={`size-12 rounded-2xl ${stat.color} text-white flex items-center justify-center shrink-0 shadow-lg shadow-black/5`}>
                <stat.icon className="size-6" />
              </div>
              <div>
                <p className={DS.typography.label}>{stat.label}</p>
                <p className={DS.typography.section + " text-xl"}>{stat.val}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* INFO */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="space-y-8">
              <div className="flex items-center gap-3">
                <Briefcase className="size-4 text-slate-400" />
                <h3 className={DS.typography.label}>Dados Contratuais</h3>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                  <span className={DS.typography.body}>Cargo Oficial</span>
                  <span className={DS.typography.bodyEmphasis}>{member.position}</span>
                </div>
                <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                  <span className={DS.typography.body}>Data de Início</span>
                  <span className={DS.typography.bodyEmphasis}>{member.startDate ? formatDateLocal(member.startDate) : '---'}</span>
                </div>
                {member.birthDate && (
                  <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                    <span className={DS.typography.body}>Nascimento</span>
                    <span className={DS.typography.bodyEmphasis}>{formatDateLocal(member.birthDate)} ({calculateAge(new Date(member.birthDate))} anos)</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* HISTORY */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="size-4 text-slate-400" />
                  <h3 className={DS.typography.label}>Histórico de Ciclos</h3>
                </div>
                <span className={DS.typography.caption}>{evaluations.length} ciclos registrados</span>
              </div>

              {evaluations.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-200">
                    <Award className="size-8" />
                  </div>
                  <p className={DS.typography.body}>Nenhuma avaliação registrada ainda.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {evaluationsAsCollaborator.map(ev => (
                    <div key={ev.id} onClick={() => onViewWork(ev.id)} className="group flex items-center justify-between p-6 rounded-2xl border-2 border-slate-50 hover:border-indigo-500 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all border border-indigo-100 group-hover:border-indigo-500">
                    <History className="size-5" />
                  </div>
                  <div>
                    <p className={DS.typography.bodyEmphasis}>Avaliado por {ev.leaderName}</p>
                    <p className={DS.typography.caption}>
                      {new Date(ev.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900 leading-none">
                            {(ev.responses.reduce((s, r) => s + r.rating, 0) / ev.responses.length).toFixed(1)}
                          </p>
                          <p className={DS.typography.label + " text-[8px]"}>Média</p>
                        </div>
                        <ChevronRight className="size-4 text-slate-300 group-hover:text-indigo-500 transition-all" />
                      </div>
                    </div>
                  ))}
                  
                  {evaluationsAsLeader.map(ev => (
                    <div key={ev.id} onClick={() => onViewWork(ev.id)} className="group flex items-center justify-between p-6 rounded-2xl border-2 border-slate-50 hover:border-emerald-500 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all border border-emerald-100 group-hover:border-emerald-500">
                    <Award className="size-5" />
                  </div>
                  <div>
                    <p className={DS.typography.bodyEmphasis}>Avaliou {ev.collaboratorName}</p>
                    <p className={DS.typography.caption}>
                      {new Date(ev.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                      <ChevronRight className="size-4 text-slate-300 group-hover:text-emerald-500 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}