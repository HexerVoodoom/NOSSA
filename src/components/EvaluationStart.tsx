import { useState, useEffect, useRef } from 'react';
import { Role, Member, EvaluationType } from '../types';
import { storage } from '../lib/storage';
import { DS, Button, Card } from './DesignSystem';
import { 
  ChevronDown, 
  UserPlus, 
  User, 
  Users, 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  ListChecks, 
  ShieldCheck,
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import imgBackground from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";

interface EvaluationStartProps {
  onStart: (role: Role, leaderId: string, collaboratorId: string, evaluationType: EvaluationType) => void;
  onBack: () => void;
  onAddMember: () => void;
}

export function EvaluationStart({ onStart, onBack, onAddMember }: EvaluationStartProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedLeader, setSelectedLeader] = useState<string>('');
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);
  const [showCollaboratorDropdown, setShowCollaboratorDropdown] = useState(false);
  
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const leaderDropdownRef = useRef<HTMLDivElement>(null);
  const collaboratorDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setRoles(storage.getRoles());
    setMembers(storage.getMembers());
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) setShowRoleDropdown(false);
      if (leaderDropdownRef.current && !leaderDropdownRef.current.contains(event.target as Node)) setShowLeaderDropdown(false);
      if (collaboratorDropdownRef.current && !collaboratorDropdownRef.current.contains(event.target as Node)) setShowCollaboratorDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const getSelectedMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName || ''}`.trim() : '';
  };
  
  const getSelectedRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : '';
  };
  
  const leadershipRoleNames = roles.filter(r => r.type === 'leadership').map(r => r.name);
  const leaderMembers = members.filter(m => leadershipRoleNames.includes(m.position));
  
  const selectedRoleObj = roles.find(r => r.id === selectedRole);
  const collaboratorMembers = selectedRoleObj 
    ? members.filter(m => m.position === selectedRoleObj.name)
    : [];
  
  const leadershipRoles = roles.filter(r => r.type === 'leadership');
  const collaboratorRoles = roles.filter(r => r.type === 'collaborator');

  const canStart = selectedRole && selectedLeader && selectedCollaborator;
  
  const startEval = (type: EvaluationType) => {
    if (canStart && selectedRoleObj) {
      onStart(selectedRoleObj, selectedLeader, selectedCollaborator, type);
    }
  };
  
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
            <h1 className="text-[18px] font-bold text-white tracking-tight">Nova avaliação</h1>
          </div>
        </nav>
      </header>

      <main className="max-w-[1417px] mx-auto px-6 lg:px-[182.5px] py-12">
        {roles.length === 0 ? (
          <Card className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className={DS.typography.section}>Nenhum cargo cadastrado</h3>
            <p className={DS.typography.body + " mb-8"}>Você precisa criar cargos antes de iniciar uma avaliação.</p>
            <Button onClick={onBack}>Voltar e criar cargos</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* LIDERANÇA */}
            <Card className="border-l-8 border-l-slate-900 space-y-8">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={DS.typography.cardTitle}>Avaliador (Líder)</h3>
                  <p className={DS.typography.caption}>Quem conduzirá o diálogo</p>
                </div>
              </div>

              <div className="relative" ref={leaderDropdownRef}>
                <label className={DS.inputs.label}>Escolha o Líder</label>
                <button
                  onClick={() => setShowLeaderDropdown(!showLeaderDropdown)}
                  className={DS.inputs.base + " flex items-center justify-between"}
                >
                  <span className={selectedLeader ? 'text-slate-900 font-bold' : 'text-slate-400 italic'}>
                    {selectedLeader ? getSelectedMemberName(selectedLeader) : 'Selecione um líder...'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showLeaderDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showLeaderDropdown && (
                  <div className="absolute z-30 w-full mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto p-2">
                    {leaderMembers.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className={DS.typography.body}>Nenhum líder encontrado.</p>
                      </div>
                    ) : (
                      leaderMembers.map(member => (
                        <button
                          key={member.id}
                          onClick={() => { setSelectedLeader(member.id); setShowLeaderDropdown(false); }}
                          className="w-full p-4 text-left hover:bg-slate-50 rounded-xl transition-all"
                        >
                          <p className="font-bold text-slate-900">{member.firstName} {member.lastName || ''}</p>
                          <p className={DS.typography.label + " text-[#6155f5]"}>{member.position}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* ASSOCIADO */}
            <Card className="border-l-8 border-l-[#ff8d28] space-y-8">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-[#ff8d28] flex items-center justify-center text-white">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={DS.typography.cardTitle}>Avaliado (Associado)</h3>
                  <p className={DS.typography.caption}>Quem receberá o feedback</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative" ref={roleDropdownRef}>
                  <label className={DS.inputs.label}>Cargo em Avaliação</label>
                  <button onClick={() => setShowRoleDropdown(!showRoleDropdown)} className={DS.inputs.base + " flex items-center justify-between"}>
                    <span className={selectedRole ? 'text-slate-900 font-bold' : 'text-slate-400 italic'}>
                      {selectedRole ? getSelectedRoleName(selectedRole) : 'Selecione o cargo...'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showRoleDropdown && (
                    <div className="absolute z-30 w-full mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto p-2">
                      {roles.map(role => (
                        <button key={role.id} onClick={() => { setSelectedRole(role.id); setSelectedCollaborator(''); setShowRoleDropdown(false); }} className="w-full p-4 text-left hover:bg-slate-50 rounded-xl transition-all">
                          <p className="font-bold text-slate-900">{role.name}</p>
                          <p className={DS.typography.label}>{role.type === 'leadership' ? 'Gestão' : 'Operação'}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative" ref={collaboratorDropdownRef}>
                  <label className={DS.inputs.label}>Escolha a Pessoa</label>
                  <button disabled={!selectedRole} onClick={() => setShowCollaboratorDropdown(!showCollaboratorDropdown)} className={DS.inputs.base + " flex items-center justify-between disabled:opacity-30"}>
                    <span className={selectedCollaborator ? 'text-slate-900 font-bold' : 'text-slate-400 italic'}>
                      {selectedCollaborator ? getSelectedMemberName(selectedCollaborator) : selectedRole ? 'Selecione a pessoa...' : 'Aguardando cargo...'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showCollaboratorDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showCollaboratorDropdown && (
                    <div className="absolute z-30 w-full mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto p-2">
                      {collaboratorMembers.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">Nenhum membro neste cargo.</div>
                      ) : (
                        collaboratorMembers.map(member => (
                          <button key={member.id} onClick={() => { setSelectedCollaborator(member.id); setShowCollaboratorDropdown(false); }} className="w-full p-4 text-left hover:bg-slate-50 rounded-xl transition-all">
                            <p className="font-bold text-slate-900">{member.firstName} {member.lastName || ''}</p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TIPOS DE AVALIAÇÃO */}
        {canStart && (
          <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className={DS.typography.section}>Escolha a Metodologia</h2>
              <p className={DS.typography.body}>Como você deseja conduzir este ciclo de feedback?</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card interactive onClick={() => startEval('dialogica')} className="group border-b-8 border-b-slate-900">
                <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all mb-6">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className={DS.typography.cardTitle + " mb-2"}>Dialógica</h3>
                <p className={DS.typography.caption + " mb-6"}>Focada em perguntas abertas e desenvolvimento comportamental.</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm tracking-tighter">
                  Iniciar agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>

              <Card interactive onClick={() => startEval('tradicional')} className="group border-b-8 border-b-indigo-500">
                <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all mb-6">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className={DS.typography.cardTitle + " mb-2"}>Tradicional</h3>
                <p className={DS.typography.caption + " mb-6"}>Baseada em afirmações e escala Likert de concordância.</p>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-tighter">
                  Iniciar agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>

              <Card 
                interactive={!!selectedRoleObj?.activities?.length} 
                onClick={() => selectedRoleObj?.activities?.length && startEval('atividades')} 
                className={`group border-b-8 border-b-emerald-500 ${!selectedRoleObj?.activities?.length ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all mb-6">
                  <ListChecks className="w-6 h-6" />
                </div>
                <h3 className={DS.typography.cardTitle + " mb-2"}>Atividades</h3>
                <p className={DS.typography.caption + " mb-6"}>Avaliação técnica das entregas específicas do cargo.</p>
                {selectedRoleObj?.activities?.length ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm tracking-tighter">
                    Iniciar agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                  </div>
                ) : (
                  <p className="text-sm text-red-400 font-bold italic">Sem atividades cadastradas</p>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}