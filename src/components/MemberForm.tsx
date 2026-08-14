import { useState, useEffect, useRef, useId } from 'react';
import { Member, Role } from '../types';
import { storage } from '../lib/storage';
import { DS, Button, Card } from './DesignSystem';
import { ArrowLeft, ChevronDown, UserCircle } from 'lucide-react';
import { toast } from "sonner";

interface MemberFormProps {
  member: Member | null;
  onBack: () => void;
  onSave: () => void;
}

export function MemberForm({ member, onBack, onSave }: MemberFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listboxId = useId();
  const firstNameId = useId();
  const lastNameId = useId();
  const birthDateId = useId();
  const startDateId = useId();

  // `member` pode chegar como um esqueleto vazio (id '') vindo do botão
  // "Novo membro": nesse caso é criação, não edição.
  const isEditing = !!member?.id;

  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    // Data inválida gerava "NaN-NaN-NaN" no input type="date"
    if (Number.isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState({
    firstName: member?.firstName || '',
    lastName: member?.lastName || '',
    birthDate: formatDateForInput(member?.birthDate),
    startDate: formatDateForInput(member?.startDate),
    position: member?.position || '',
  });
  
  useEffect(() => {
    setRoles(storage.getRoles());
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setShowRoleDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (showRoleDropdown) optionRefs.current[activeRoleIndex]?.focus();
  }, [showRoleDropdown, activeRoleIndex]);

  const closeDropdown = (returnFocus = true) => {
    setShowRoleDropdown(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const openDropdown = (index: number) => {
    setActiveRoleIndex(Math.max(0, Math.min(index, roles.length - 1)));
    setShowRoleDropdown(true);
  };

  const selectRole = (roleName: string) => {
    setFormData(prev => ({ ...prev, position: roleName }));
    closeDropdown();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (roles.length === 0) return;
      const selectedIndex = roles.findIndex(r => r.name === formData.position);
      const fallback = e.key === 'ArrowDown' ? 0 : roles.length - 1;
      openDropdown(selectedIndex >= 0 ? selectedIndex : fallback);
    } else if (e.key === 'Escape' && showRoleDropdown) {
      e.preventDefault();
      closeDropdown();
    }
  };

  const handleListboxKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (roles.length === 0) {
      if (e.key === 'Escape' || e.key === 'Tab') closeDropdown();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveRoleIndex(prev => (prev + 1) % roles.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveRoleIndex(prev => (prev - 1 + roles.length) % roles.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveRoleIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveRoleIndex(roles.length - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
    } else if (e.key === 'Tab') {
      closeDropdown(false);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const role = roles[activeRoleIndex];
      if (role) selectRole(role.name);
    }
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Nome é obrigatório';
    if (!formData.position.trim()) newErrors.position = 'Cargo é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Constrói a data no fuso local: `new Date('YYYY-MM-DD')` é interpretado
    // como UTC e volta um dia atrás em fusos negativos.
    const createDateWithoutTimezone = (dateString: string): Date | undefined => {
      const [year, month, day] = dateString.split('-').map(Number);
      if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return undefined;
      const d = new Date(year, month - 1, day);
      return Number.isNaN(d.getTime()) ? undefined : d;
    };

    const newMember: Member = {
      // Date.now() sozinho colide em dois cadastros no mesmo milissegundo
      // (ids duplicados, key do React repetida e edição no membro errado)
      id: member?.id || `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim() || undefined,
      birthDate: formData.birthDate ? createDateWithoutTimezone(formData.birthDate) : undefined,
      startDate: formData.startDate ? createDateWithoutTimezone(formData.startDate) : undefined,
      position: formData.position.trim(),
      createdAt: member?.createdAt || new Date(),
    };

    // storage.saveMember retorna false quando a escrita falha: antes o toast de
    // sucesso aparecia mesmo sem nada ter sido salvo.
    if (!storage.saveMember(newMember)) {
      toast.error('Não foi possível salvar o membro. Libere espaço e tente novamente.');
      return;
    }

    toast.success(isEditing ? 'Membro atualizado' : 'Membro adicionado');
    onSave();
  };
  
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className={DS.layout.maxWidth + " flex items-center justify-between"}>
          <div className="flex items-center gap-4">
            <button type="button" onClick={onBack} aria-label="Voltar" className={DS.buttons.ghost}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={DS.typography.cardTitle}>{isEditing ? 'Editar Perfil' : 'Novo Membro'}</h1>
          </div>
          <Button onClick={handleSubmit}>
            {isEditing ? 'Salvar Alterações' : 'Adicionar Membro'}
          </Button>
        </div>
      </nav>

      <main className={DS.layout.maxWidth + " py-12"}>
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
          <Card className="space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
              <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <UserCircle className="size-12" />
              </div>
              <div>
                <h3 className={DS.typography.section}>Informações Pessoais</h3>
                <p className={DS.typography.caption}>Dados básicos do associado ou líder.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor={firstNameId} className={DS.inputs.label}>Nome <span className="text-red-500">*</span></label>
                <input
                  id={firstNameId}
                  type="text"
                  aria-required="true"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? `${firstNameId}-error` : undefined}
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className={DS.inputs.base + (errors.firstName ? ' border-red-200 bg-red-50' : '')}
                  placeholder="Ex: João"
                />
                {errors.firstName && <p id={`${firstNameId}-error`} className="text-red-500 text-xs font-bold">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor={lastNameId} className={DS.inputs.label}>Sobrenome</label>
                <input
                  id={lastNameId}
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className={DS.inputs.base}
                  placeholder="Ex: Silva"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor={birthDateId} className={DS.inputs.label}>Data de Nascimento</label>
                <input
                  id={birthDateId}
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className={DS.inputs.base}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={startDateId} className={DS.inputs.label}>Início na Empresa</label>
                <input
                  id={startDateId}
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={DS.inputs.base}
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
              <div>
                <h3 className={DS.typography.section}>Cargo e Atuação</h3>
                <p className={DS.typography.caption}>Selecione um dos cargos configurados na arquitetura.</p>
              </div>
            </div>

            <div className="relative" ref={dropdownRef}>
              <label className={DS.inputs.label} id={listboxId + '-label'}>Selecione o Cargo <span className="text-red-500">*</span></label>

              <button
                type="button"
                ref={triggerRef}
                onClick={() => (showRoleDropdown ? closeDropdown(false) : openDropdown(roles.findIndex(r => r.name === formData.position)))}
                onKeyDown={handleTriggerKeyDown}
                aria-haspopup="listbox"
                aria-expanded={showRoleDropdown}
                aria-controls={showRoleDropdown ? listboxId : undefined}
                aria-labelledby={`${listboxId}-label ${listboxId}-value`}
                aria-invalid={!!errors.position}
                className={DS.inputs.base + " flex items-center justify-between !bg-white border-slate-200"}
              >
                <span id={`${listboxId}-value`} className={formData.position ? 'text-slate-900 font-bold' : 'text-slate-400 italic'}>
                  {formData.position || 'Escolha um cargo configurado...'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
              </button>

              {showRoleDropdown && (
                <div
                  id={listboxId}
                  role="listbox"
                  aria-labelledby={`${listboxId}-label`}
                  onKeyDown={handleListboxKeyDown}
                  className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[300px] overflow-y-auto p-2"
                >
                  {roles.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 italic text-sm">
                      Nenhum cargo configurado.
                    </div>
                  ) : (
                    roles.map((role, index) => (
                      <button
                        type="button"
                        key={role.id}
                        ref={el => { optionRefs.current[index] = el; }}
                        role="option"
                        aria-selected={formData.position === role.name}
                        tabIndex={index === activeRoleIndex ? 0 : -1}
                        onClick={() => selectRole(role.name)}
                        className="w-full p-4 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none rounded-xl transition-all"
                      >
                        <p className="font-bold text-slate-900 text-sm">{role.name}</p>
                        <p className={DS.typography.label}>{role.type === 'leadership' ? 'Gestão' : 'Operação'}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
              
              {errors.position && <p className="text-red-500 text-xs font-bold mt-2">{errors.position}</p>}
              
              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                * Novos cargos devem ser criados primeiro na aba <span className="font-bold text-slate-600">Arquitetura de Cargos</span>.
              </p>
            </div>
          </Card>
        </form>
      </main>
    </div>
  );
}
