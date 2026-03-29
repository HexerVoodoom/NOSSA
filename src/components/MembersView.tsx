import { useState, useEffect } from 'react';
import { Member } from '../types';
import { storage } from '../lib/storage';
import { DS } from './DesignSystem';
import { 
  ArrowLeft,
  Briefcase, 
  Calendar, 
  Trash2, 
  Edit2,
  ChevronRight
} from 'lucide-react';
import svgPaths from "../imports/svg-dp9vj8g4zf";
import imgHeaderBg from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";

interface MembersViewProps {
  onBack: () => void;
  onViewMember?: (memberId: string) => void;
  onEditMember: (member: Member) => void;
}

export function MembersView({ onBack, onViewMember, onEditMember }: MembersViewProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = () => {
    setMembers(storage.getMembers());
  };
  
  const isLeadershipPosition = (position: string): boolean => {
    const roles = storage.getRoles();
    const role = roles.find(r => r.name === position);
    return role?.type === 'leadership';
  };
  
  const formatStartDate = (date: Date | string): string => {
    const d = new Date(date);
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${months[d.getMonth()]}. ${d.getFullYear()}`;
  };

  const handleDelete = (member: Member) => {
    if (window.confirm(`Tem certeza que deseja excluir ${member.firstName} ${member.lastName || ''}?`)) {
      storage.deleteMember(member.id);
      loadMembers();
    }
  };

  const filteredMembers = members.filter(member => {
    const searchString = `${member.firstName} ${member.lastName || ''} ${member.position}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleAddNewMember = () => {
    onEditMember({ id: '', firstName: '', position: '', createdAt: new Date() });
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* FIXED HEADER SECTION */}
      <div className="sticky top-0 z-50">
        <div className="absolute inset-0 h-[81px] overflow-hidden">
          <img 
            src={imgHeaderBg} 
            alt="" 
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>
        <nav className="relative flex items-center justify-between px-6 lg:px-[158.5px] py-[16px] h-[81px] border-b border-white/10 backdrop-blur-sm bg-black/10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight">Membros</h1>
          </div>

          <button 
            onClick={handleAddNewMember}
            className="bg-[#0f172b] h-[44px] px-6 rounded-[16px] flex items-center gap-2 text-white text-sm font-bold shadow-sm active:scale-95 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d={svgPaths.p32887f80} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              <path d={svgPaths.p3694d280} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              <path d="M12.6667 5.33333V9.33333" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              <path d="M14.6667 7.33333H10.6667" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            </svg>
            Novo membro
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-[1417px] mx-auto px-6 lg:px-[182.5px] pt-[48px] pb-24 space-y-12">
        {/* FILTERS CONTAINER */}
        <div className="w-full">
          <div className="relative w-full h-[54px] group">
            <div className="absolute inset-0 bg-[#f8fafc] rounded-[16px] border border-[#b1b1b1] group-focus-within:border-slate-400 group-focus-within:bg-white transition-all pointer-events-none" />
            <div className="relative flex items-center h-full pl-[48px] pr-4">
              <div className="absolute left-[16px]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 14L11.1067 11.1067" stroke="#90A1B9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  <path d={svgPaths.p107a080} stroke="#90A1B9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Buscar por nome ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[#1d293d] text-[14px] font-normal placeholder:text-[#90a1b9]"
              />
            </div>
          </div>
        </div>

        {/* LIST OR EMPTY STATE */}
        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#e2e8f0] shadow-sm p-12 lg:p-24 text-center">
            <div className="bg-[#f8fafc] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d={svgPaths.pfcdd580} stroke="#E2E8F0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                <path d={svgPaths.p1fe95580} stroke="#E2E8F0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                <path d={svgPaths.p2a06b680} stroke="#E2E8F0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                <path d={svgPaths.p1517b200} stroke="#E2E8F0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
              </svg>
            </div>
            
            <h3 className="text-[24px] font-bold text-[#1d293d] tracking-[-0.6px] mb-4">Nenhum membro encontrado</h3>
            <p className="text-[#45556c] text-[14px] leading-[22.75px] max-w-[320px] mx-auto mb-10">
              Comece adicionando os associados e líderes da sua organização para iniciar as avaliações.
            </p>
            
            <button 
              onClick={handleAddNewMember}
              className="mx-auto bg-[#0f172b] h-[44px] px-8 rounded-[16px] text-white text-[14px] font-bold shadow-md hover:bg-[#1a2642] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Adicionar primeiro membro
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => {
              const isLeader = isLeadershipPosition(member.position);
              
              return (
                <div
                  key={member.id}
                  onClick={() => onViewMember?.(member.id)}
                  className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-slate-200 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0f172b] group-hover:text-white transition-all duration-500">
                      {isLeader ? <Briefcase className="w-6 h-6" /> : <svg width="24" height="24" viewBox="0 0 40 40" fill="none" className="scale-50 opacity-60 group-hover:opacity-100 transition-opacity">
                        <path d={svgPaths.pfcdd580} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                        <path d={svgPaths.p1517b200} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                      </svg>}
                    </div>
                    <div className="flex gap-1 text-slate-300">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditMember(member); }}
                        className="p-2 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(member); }}
                        className="p-2 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#0f172b] tracking-tight">
                        {member.firstName} {member.lastName || ''}
                      </h2>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[12px] font-bold tracking-tight border border-slate-200">
                        {member.position}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-sm text-slate-400 font-medium italic">Admissão</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {member.startDate ? formatStartDate(member.startDate) : '---'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-slate-300 group-hover:text-[#0f172b] transition-all font-bold text-sm tracking-tight">
                    <span>Ver perfil completo</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}