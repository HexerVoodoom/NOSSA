import { useState, useEffect } from 'react';
import { Role } from '../types';
import { storage } from '../lib/storage';
import { Trash2, Edit, Edit2, UserCheck, Users, User, ArrowLeft, FileText, Building2, Plus, Filter, ListChecks, FileDown } from 'lucide-react';
import { exportRoleToPDF } from '../lib/pdfExport';
import { getAllQuestionsFromCompetencies } from '../lib/competencyHelpers';
import { DS, Card } from './DesignSystem';
import svgPaths from "../imports/svg-dp9vj8g4zf";
import imgHeaderBg from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";

interface RolesViewProps {
  onBack: () => void;
  onViewRole?: (roleId: string) => void;
  onEditRole: (role: Role) => void;
}

export function RolesView({ onBack, onViewRole, onEditRole }: RolesViewProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'leadership' | 'collaborator'>('all');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    setRoles(storage.getRoles());
  };

  const filteredRoles = roles.filter(role => 
    filterType === 'all' || role.type === filterType
  );

  const leadershipCount = roles.filter(r => r.type === 'leadership').length;
  const collaboratorCount = roles.filter(r => r.type === 'collaborator').length;

  const handleDelete = (role: Role) => {
    if (window.confirm(`Tem certeza que deseja excluir o cargo "${role.name}"? Isso pode afetar membros vinculados.`)) {
      storage.deleteRole(role.id);
      loadRoles();
    }
  };

  const handleAddNewRole = () => {
    onEditRole({ 
      id: '', 
      name: '', 
      type: 'collaborator', 
      questionIds: getAllQuestionsFromCompetencies().map(q => q.id), 
      activities: [], 
      createdAt: new Date() 
    });
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
            <h1 className="text-lg font-bold text-white tracking-tight">Cargos</h1>
          </div>

          <button 
            onClick={handleAddNewRole}
            className="bg-[#0f172b] h-[44px] px-6 rounded-[16px] flex items-center gap-2 text-white text-sm font-bold shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo cargo
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-[1417px] mx-auto px-6 lg:px-[182.5px] pt-[48px] pb-24 space-y-12">
        {/* FILTERS / TABS */}
        <div className="flex bg-white p-1 rounded-2xl border border-[#e2e8f0] w-fit shadow-sm">
          <button
            onClick={() => setFilterType('all')}
            className={`h-10 px-6 rounded-xl text-sm font-bold transition-all ${
              filterType === 'all' 
                ? 'bg-[#f1f5f9] text-[#6155f5]' 
                : 'text-[#62748e] hover:bg-slate-50'
            }`}
          >
            Todos ({roles.length})
          </button>
          <button
            onClick={() => setFilterType('leadership')}
            className={`h-10 px-6 rounded-xl text-sm font-bold transition-all ${
              filterType === 'leadership' 
                ? 'bg-[#f1f5f9] text-[#6155f5]' 
                : 'text-[#62748e] hover:bg-slate-50'
            }`}
          >
            Liderança ({leadershipCount})
          </button>
          <button
            onClick={() => setFilterType('collaborator')}
            className={`h-10 px-6 rounded-xl text-sm font-bold transition-all ${
              filterType === 'collaborator' 
                ? 'bg-[#f1f5f9] text-[#6155f5]' 
                : 'text-[#62748e] hover:bg-slate-50'
            }`}
          >
            Associados ({collaboratorCount})
          </button>
        </div>

        {/* LIST OR EMPTY STATE */}
        {filteredRoles.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#e2e8f0] shadow-sm p-12 lg:p-24 text-center">
            <div className="bg-[#f8fafc] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
              <User className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-[24px] font-bold text-[#1d293d] tracking-[-0.6px] mb-4">Nenhum cargo configurado</h3>
            <p className="text-[#45556c] text-[14px] leading-[22.75px] max-w-[320px] mx-auto mb-10">
              Defina as responsabilidades e indicadores para os cargos da sua organização.
            </p>
            <button 
              onClick={handleAddNewRole}
              className="mx-auto bg-[#0f172b] h-[44px] px-8 rounded-[16px] text-white text-[14px] font-bold shadow-md hover:bg-[#1a2642] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Criar primeiro cargo
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map(role => {
              const isLeadership = role.type === 'leadership';
              
              return (
                <div
                  key={role.id}
                  onClick={() => onViewRole?.(role.id)}
                  className="group relative bg-white border border-[#f1f5f9] rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
                >
                  <div 
                    className={`h-[6px] w-full ${
                      isLeadership ? 'bg-[#6155f5]' : 'bg-[#10b981]'
                    }`} 
                  />
                  
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-2">
                        <h2 className="text-[20px] font-black text-[#0f172b] group-hover:text-[#6155f5] transition-colors leading-tight line-clamp-2 pr-2">
                          {role.name}
                        </h2>
                        <div className="inline-flex items-center px-3 py-1 rounded-[10px] bg-[#f1f5f9] border border-[#e2e8f0] text-[#45556c] text-[14px] font-bold tracking-tight">
                          {isLeadership ? 'Liderança' : 'Associado'}
                        </div>
                      </div>
                      
                      <div className="w-10 h-10 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] flex items-center justify-center text-[#90a1b9] group-hover:bg-[#0f172b] group-hover:text-white transition-all duration-500 shrink-0">
                        {isLeadership ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#90a1b9]">
                          <FileText className="w-4 h-4" />
                          <span className="text-[14px] font-bold">Indicadores</span>
                        </div>
                        <div className="bg-[#f1f5f9] px-2 py-0.5 rounded-[4px] text-[14px] font-bold text-[#0f172b]">
                          {role.questionIds.length}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#90a1b9]">
                          <ListChecks className="w-4 h-4" />
                          <span className="text-[14px] font-bold">Atividades</span>
                        </div>
                        <div className="bg-[#f1f5f9] px-2 py-0.5 rounded-[4px] text-[14px] font-bold text-[#0f172b]">
                          {role.activities?.length || 0}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditRole(role); }}
                        className="flex-1 h-9 rounded-xl bg-[#f1f5f9] text-[#6155f5] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#6155f5] hover:text-white transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Configurar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); exportRoleToPDF(role); }}
                        className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-all"
                        title="Exportar PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(role); }}
                        className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all"
                        title="Excluir cargo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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