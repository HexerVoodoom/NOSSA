import { useState, useEffect, useRef } from 'react';
import { Member, Role } from '../types';
import { storage } from '../lib/storage';
import { DS, Button, Card } from './DesignSystem';
import { ArrowLeft, ChevronDown, UserCircle } from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface MemberFormProps {
  member: Member | null;
  onBack: () => void;
  onSave: () => void;
}

export function MemberForm({ member, onBack, onSave }: MemberFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
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
    
    const createDateWithoutTimezone = (dateString: string): Date => {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    };
    
    const newMember: Member = {
      id: member?.id || `member-${Date.now()}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim() || undefined,
      birthDate: formData.birthDate ? createDateWithoutTimezone(formData.birthDate) : undefined,
      startDate: formData.startDate ? createDateWithoutTimezone(formData.startDate) : undefined,
      position: formData.position.trim(),
      createdAt: member?.createdAt || new Date(),
    };
    
    storage.saveMember(newMember);
    toast.success(member ? 'Membro atualizado' : 'Membro adicionado');
    onSave();
  };
  
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className={DS.layout.maxWidth + " flex items-center justify-between"}>
          <div className="flex items-center gap-4">
            <button onClick={onBack} className={DS.buttons.ghost}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={DS.typography.cardTitle}>{member ? 'Editar Perfil' : 'Novo Membro'}</h1>
          </div>
          <Button onClick={handleSubmit}>
            {member ? 'Salvar Alterações' : 'Adicionar Membro'}
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
                <label className={DS.inputs.label}>Nome <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={DS.inputs.base + (errors.firstName ? ' border-red-200 bg-red-50' : '')}
                  placeholder="Ex: João"
                />
                {errors.firstName && <p className="text-red-500 text-xs font-bold">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <label className={DS.inputs.label}>Sobrenome</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={DS.inputs.base}
                  placeholder="Ex: Silva"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={DS.inputs.label}>Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className={DS.inputs.base}
                />
              </div>
              <div className="space-y-2">
                <label className={DS.inputs.label}>Início na Empresa</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
              <label className={DS.inputs.label}>Selecione o Cargo <span className="text-red-500">*</span></label>
              
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={DS.inputs.base + " flex items-center justify-between !bg-white border-slate-200"}
              >
                <span className={formData.position ? 'text-slate-900 font-bold' : 'text-slate-400 italic'}>
                  {formData.position || 'Escolha um cargo configurado...'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              
              {showRoleDropdown && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[300px] overflow-y-auto p-2">
                  {roles.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 italic text-sm">
                      Nenhum cargo configurado.
                    </div>
                  ) : (
                    roles.map(role => (
                      <button
                        type="button"
                        key={role.id}
                        onClick={() => { setFormData({ ...formData, position: role.name }); setShowRoleDropdown(false); }}
                        className="w-full p-4 text-left hover:bg-slate-50 rounded-xl transition-all"
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
