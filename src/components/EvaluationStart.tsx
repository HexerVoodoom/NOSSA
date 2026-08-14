import { useState, useEffect, useRef, useId, ReactNode } from 'react';
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

interface SelectOption {
  id: string;
  primary: string;
  secondary?: string;
  secondaryClassName?: string;
}

interface AccessibleSelectProps {
  label: string;
  options: SelectOption[];
  selectedId: string;
  displayValue: string;
  placeholder: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  emptyContent?: ReactNode;
}

/**
 * Combo de seleção acessível (padrão WAI-ARIA listbox):
 * teclado (setas, Home/End, Enter/Espaço, Esc), foco de volta ao gatilho
 * e fechamento ao clicar fora.
 */
function AccessibleSelect({
  label,
  options,
  selectedId,
  displayValue,
  placeholder,
  onSelect,
  disabled = false,
  emptyContent,
}: AccessibleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const labelId = `${baseId}-label`;
  const valueId = `${baseId}-value`;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.focus();
  }, [isOpen, activeIndex]);

  const close = (returnFocus = true) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const open = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, options.length - 1)));
    setIsOpen(true);
  };

  const selectedIndex = options.findIndex(o => o.id === selectedId);

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (options.length === 0) {
        setIsOpen(true);
        return;
      }
      open(selectedIndex >= 0 ? selectedIndex : e.key === 'ArrowDown' ? 0 : options.length - 1);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      close();
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab') {
      close(false);
      return;
    }
    if (options.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const option = options[activeIndex];
      if (option) {
        onSelect(option.id);
        close();
      }
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label id={labelId} className={DS.inputs.label}>{label}</label>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => (isOpen ? close(false) : open(selectedIndex >= 0 ? selectedIndex : 0))}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-labelledby={`${labelId} ${valueId}`}
        className={DS.inputs.base + " flex items-center justify-between" + (disabled ? " disabled:opacity-30" : "")}
      >
        <span id={valueId} className={selectedId ? 'text-slate-900 font-bold' : 'text-slate-400 italic'}>
          {selectedId ? displayValue : placeholder}
        </span>
        <ChevronDown aria-hidden="true" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          onKeyDown={handleListKeyDown}
          className="absolute z-30 w-full mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto p-2"
        >
          {options.length === 0 ? (
            emptyContent
          ) : (
            options.map((option, index) => (
              <button
                type="button"
                key={option.id}
                ref={el => { optionRefs.current[index] = el; }}
                role="option"
                aria-selected={option.id === selectedId}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => { onSelect(option.id); close(); }}
                className="w-full p-4 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none rounded-xl transition-all"
              >
                <p className="font-bold text-slate-900">{option.primary}</p>
                {option.secondary && (
                  <p className={DS.typography.label + (option.secondaryClassName ? ` ${option.secondaryClassName}` : '')}>
                    {option.secondary}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function EvaluationStart({ onStart, onBack, onAddMember }: EvaluationStartProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedLeader, setSelectedLeader] = useState<string>('');
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>('');
  useEffect(() => {
    setRoles(storage.getRoles());
    setMembers(storage.getMembers());
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
            <button onClick={onBack} aria-label="Voltar" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white">
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

              <AccessibleSelect
                label="Escolha o Líder"
                selectedId={selectedLeader}
                displayValue={getSelectedMemberName(selectedLeader)}
                placeholder="Selecione um líder..."
                onSelect={(id) => setSelectedLeader(id)}
                options={leaderMembers.map(member => ({
                  id: member.id,
                  primary: `${member.firstName} ${member.lastName || ''}`.trim(),
                  secondary: member.position,
                  secondaryClassName: 'text-[#6155f5]',
                }))}
                emptyContent={
                  <div className="p-8 text-center">
                    <p className={DS.typography.body}>Nenhum líder encontrado.</p>
                  </div>
                }
              />
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
                <AccessibleSelect
                  label="Cargo em Avaliação"
                  selectedId={selectedRole}
                  displayValue={getSelectedRoleName(selectedRole)}
                  placeholder="Selecione o cargo..."
                  onSelect={(id) => { setSelectedRole(id); setSelectedCollaborator(''); }}
                  options={roles.map(role => ({
                    id: role.id,
                    primary: role.name,
                    secondary: role.type === 'leadership' ? 'Gestão' : 'Operação',
                  }))}
                />

                <AccessibleSelect
                  label="Escolha a Pessoa"
                  disabled={!selectedRole}
                  selectedId={selectedCollaborator}
                  displayValue={getSelectedMemberName(selectedCollaborator)}
                  placeholder={selectedRole ? 'Selecione a pessoa...' : 'Aguardando cargo...'}
                  onSelect={(id) => setSelectedCollaborator(id)}
                  options={collaboratorMembers.map(member => ({
                    id: member.id,
                    primary: `${member.firstName} ${member.lastName || ''}`.trim(),
                  }))}
                  emptyContent={
                    <div className="p-8 text-center text-slate-400 text-sm">Nenhum membro neste cargo.</div>
                  }
                />
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