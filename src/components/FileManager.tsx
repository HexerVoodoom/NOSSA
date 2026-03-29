import { useState, useRef } from 'react';
import { FileText, Save, FolderOpen, RotateCcw, X, Check, Download, Upload, AlertTriangle } from 'lucide-react';
import { storage } from '../lib/storage';
import { toast } from 'sonner@2.0.3';

interface FileManagerProps {
  onReload?: () => void;
}

type SaveOptions = {
  members: boolean;
  roles: boolean;
  competencies: boolean;
  evaluations: boolean;
};

type LoadMode = 'add' | 'overwrite';

export function FileManager({ onReload }: FileManagerProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [loadMode, setLoadMode] = useState<LoadMode>('add');
  const [loadedData, setLoadedData] = useState<any>(null);
  const [loadOptions, setLoadOptions] = useState<SaveOptions>({
    members: true,
    roles: true,
    competencies: true,
    evaluations: true,
  });
  
  const [saveOptions, setSaveOptions] = useState<SaveOptions>({
    members: true,
    roles: true,
    competencies: true,
    evaluations: true,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSave = () => {
    setShowMenu(false);
    setShowSaveModal(true);
  };
  
  const handleLoad = () => {
    setShowMenu(false);
    fileInputRef.current?.click();
  };
  
  const handleRestoreBackup = () => {
    setShowMenu(false);
    setShowRestoreConfirm(true);
  };
  
  const executeRestore = () => {
    const success = storage.restoreBackup();
    if (success) {
      toast.success('Versão anterior restaurada! Recarregando página...');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      toast.error('Nenhum backup disponível para restaurar.');
    }
    setShowRestoreConfirm(false);
  };
  
  const executeSave = () => {
    const data: any = {
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
    
    if (saveOptions.members) {
      data.members = storage.getMembers();
    }
    
    if (saveOptions.roles) {
      data.roles = storage.getRoles();
    }
    
    if (saveOptions.competencies) {
      data.competencies = storage.getCompetencies();
    }
    
    if (saveOptions.evaluations) {
      data.evaluations = storage.getEvaluations();
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Nome do arquivo baseado nas opções selecionadas
    const parts = [];
    if (saveOptions.members) parts.push('equipe');
    if (saveOptions.roles) parts.push('cargos');
    if (saveOptions.competencies) parts.push('competencias');
    if (saveOptions.evaluations) parts.push('avaliacoes');
    
    const fileName = `obra-viva-${parts.join('-')}-${new Date().toISOString().split('T')[0]}.json`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Dados exportados com sucesso!');
    setShowSaveModal(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const data = JSON.parse(content);
          
          // Detecta quais dados estão disponíveis no arquivo
          const availableOptions: SaveOptions = {
            members: !!data.members,
            roles: !!data.roles,
            competencies: !!data.competencies,
            evaluations: !!data.evaluations,
          };
          
          setLoadOptions(availableOptions);
          setLoadedData(data);
          setShowLoadModal(true);
        } catch (error) {
          toast.error('Erro ao ler arquivo. Formato inválido.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };
  
  const executeLoad = () => {
    if (!loadedData) return;
    
    // Cria backup antes de carregar
    storage.createBackup();
    
    try {
      if (loadMode === 'overwrite') {
        // Modo sobrescrever: limpa os dados selecionados antes de importar
        if (loadOptions.members && loadedData.members) {
          localStorage.setItem('obra-viva-members', JSON.stringify(loadedData.members));
        }
        
        if (loadOptions.roles && loadedData.roles) {
          localStorage.setItem('obra-viva-roles', JSON.stringify(loadedData.roles));
          localStorage.setItem('obra-viva-initialized', 'true');
        }
        
        if (loadOptions.competencies && loadedData.competencies) {
          localStorage.setItem('obra-viva-competencies', JSON.stringify(loadedData.competencies));
          localStorage.setItem('obra-viva-competencies-initialized', 'true');
        }
        
        if (loadOptions.evaluations && loadedData.evaluations) {
          localStorage.setItem('obra-viva-evaluations', JSON.stringify(loadedData.evaluations));
        }
      } else {
        // Modo adicionar: mescla com dados existentes
        if (loadOptions.members && loadedData.members) {
          const existingMembers = storage.getMembers();
          const newMembers = loadedData.members.filter((m: any) => {
            // Verifica se o ID já existe
            const idExists = existingMembers.some(em => em.id === m.id);
            // Verifica se o nome completo já existe (para evitar duplicados criados em dispositivos diferentes)
            const nameExists = existingMembers.some(em => 
              em.firstName.toLowerCase().trim() === m.firstName.toLowerCase().trim() && 
              (em.lastName || '').toLowerCase().trim() === (m.lastName || '').toLowerCase().trim()
            );
            return !idExists && !nameExists;
          });
          localStorage.setItem('obra-viva-members', JSON.stringify([...existingMembers, ...newMembers]));
        }
        
        if (loadOptions.roles && loadedData.roles) {
          const existingRoles = storage.getRoles();
          const newRoles = loadedData.roles.filter((r: any) => {
            const idExists = existingRoles.some(er => er.id === r.id);
            const nameExists = existingRoles.some(er => er.name.toLowerCase().trim() === r.name.toLowerCase().trim());
            return !idExists && !nameExists;
          });
          localStorage.setItem('obra-viva-roles', JSON.stringify([...existingRoles, ...newRoles]));
        }
        
        if (loadOptions.competencies && loadedData.competencies) {
          const existingComps = storage.getCompetencies();
          const newComps = loadedData.competencies.filter((c: any) => {
            const idExists = existingComps.some(ec => ec.id === c.id);
            const nameExists = existingComps.some(ec => ec.name.toLowerCase().trim() === c.name.toLowerCase().trim());
            return !idExists && !nameExists;
          });
          localStorage.setItem('obra-viva-competencies', JSON.stringify([...existingComps, ...newComps]));
        }
        
        if (loadOptions.evaluations && loadedData.evaluations) {
          const existingEvals = storage.getEvaluations();
          const newEvals = loadedData.evaluations.filter((e: any) => 
            !existingEvals.find(ee => ee.id === e.id)
          );
          localStorage.setItem('obra-viva-evaluations', JSON.stringify([...existingEvals, ...newEvals]));
        }
      }
      
      toast.success('Dados importados com sucesso! Recarregando página...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error('Erro ao importar dados.');
      console.error(error);
    }
    
    setShowLoadModal(false);
    setLoadedData(null);
  };
  
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700 text-sm font-medium flex items-center gap-2"
          aria-label="Menu de Arquivos"
        >
          <FileText className="w-4 h-4" />
          Arquivo
        </button>
      </div>
      
      {/* Menu dropdown - renderizado fora com createPortal */}
      {showMenu && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu dropdown - posicionado de forma fixa no canto superior direito */}
          <div className="fixed top-24 right-6 w-64 bg-white rounded-xl shadow-2xl overflow-hidden z-[110] border border-slate-200">
            <div className="p-4 bg-gradient-to-r from-[#6155f5] to-[#7c3aed]">
              <h3 className="text-white font-semibold text-sm">Gerenciar Dados</h3>
              <p className="text-white/70 text-xs mt-1">Salvar, carregar e restaurar</p>
            </div>
            
            <div className="p-2">
              <button
                onClick={handleSave}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <Save className="w-4 h-4 text-[#6155f5]" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Salvar</div>
                  <div className="text-xs text-slate-500">Exportar dados selecionados</div>
                </div>
              </button>
              
              <button
                onClick={handleLoad}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <FolderOpen className="w-4 h-4 text-[#6155f5]" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Carregar</div>
                  <div className="text-xs text-slate-500">Importar de arquivo</div>
                </div>
              </button>
              
              <div className="border-t border-slate-200 my-2" />
              
              <button
                onClick={handleRestoreBackup}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Restaurar Versão Anterior</div>
                  <div className="text-xs text-slate-500">Desfazer última importação</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6155f5] to-[#7c3aed] flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Salvar Dados</h2>
                    <p className="text-sm text-slate-600">Selecione o que deseja exportar</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={saveOptions.members}
                  onChange={(e) => setSaveOptions(prev => ({ ...prev, members: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-300 text-[#6155f5] focus:ring-[#6155f5]"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Equipe</div>
                  <div className="text-sm text-slate-600">Membros e suas informações</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={saveOptions.roles}
                  onChange={(e) => setSaveOptions(prev => ({ ...prev, roles: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-300 text-[#6155f5] focus:ring-[#6155f5]"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Cargos</div>
                  <div className="text-sm text-slate-600">Configurações de cargos</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={saveOptions.competencies}
                  onChange={(e) => setSaveOptions(prev => ({ ...prev, competencies: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-300 text-[#6155f5] focus:ring-[#6155f5]"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Competências</div>
                  <div className="text-sm text-slate-600">Perguntas e habilidades</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={saveOptions.evaluations}
                  onChange={(e) => setSaveOptions(prev => ({ ...prev, evaluations: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-300 text-[#6155f5] focus:ring-[#6155f5]"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Avaliações Realizadas</div>
                  <div className="text-sm text-slate-600">Obras e histórico completo</div>
                </div>
              </label>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={executeSave}
                disabled={!Object.values(saveOptions).some(v => v)}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#6155f5] to-[#7c3aed] text-white hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Load Modal */}
      {showLoadModal && loadedData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6155f5] to-[#7c3aed] flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Carregar Dados</h2>
                    <p className="text-sm text-slate-600">Configure a importação</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowLoadModal(false);
                    setLoadedData(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Selecione o que importar:</label>
                <div className="space-y-2">
                  {loadedData.members && (
                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={loadOptions.members}
                        onChange={(e) => setLoadOptions(prev => ({ ...prev, members: e.target.checked }))}
                        className="w-5 h-5 rounded border-slate-300 text-[#6155f5] focus:ring-[#6155f5]"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Equipe</div>
                        <div className="text-sm text-slate-600">{loadedData.members.length} membro(s)</div>
                      </div>
                    </label>
                  )}
                  
                  {loadedData.roles && (
                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={loadOptions.roles}
                        onChange={(e) => setLoadOptions(prev => ({ ...prev, roles: e.target.checked }))}
                        className="w-5 h-5 rounded border-slate-300 text-[#6155f5] focus:ring-[#6155f5]"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Cargos</div>
                        <div className="text-sm text-slate-600">{loadedData.roles.length} cargo(s)</div>
                      </div>
                    </label>
                  )}
                  
                  {loadedData.competencies && (
                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={loadOptions.competencies}
                        onChange={(e) => setLoadOptions(prev => ({ ...prev, competencies: e.target.checked }))}
                        className="w-5 h-5 rounded border-slate-300 text-[#6155f5] focus:ring-[#6155f5]"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Competências</div>
                        <div className="text-sm text-slate-600">{loadedData.competencies.length} competência(s)</div>
                      </div>
                    </label>
                  )}
                  
                  {loadedData.evaluations && (
                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={loadOptions.evaluations}
                        onChange={(e) => setLoadOptions(prev => ({ ...prev, evaluations: e.target.checked }))}
                        className="w-5 h-5 rounded border-slate-300 text-[#6155f5] focus:ring-[#6155f5]"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Avaliações Realizadas</div>
                        <div className="text-sm text-slate-600">{loadedData.evaluations.length} avaliação(ões)</div>
                      </div>
                    </label>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Modo de importação:</label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border-2 border-slate-200">
                    <input
                      type="radio"
                      name="loadMode"
                      checked={loadMode === 'add'}
                      onChange={() => setLoadMode('add')}
                      className="mt-0.5 w-5 h-5 border-slate-300 text-[#6155f5] focus:ring-[#6155f5]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Adicionar</div>
                      <div className="text-sm text-slate-600">Mantém dados existentes e adiciona novos</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border-2 border-amber-200 bg-amber-50/50">
                    <input
                      type="radio"
                      name="loadMode"
                      checked={loadMode === 'overwrite'}
                      onChange={() => setLoadMode('overwrite')}
                      className="mt-0.5 w-5 h-5 border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-amber-900 flex items-center gap-2">
                        Sobreescrever
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="text-sm text-amber-700">Remove dados existentes e substitui pelos novos</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setShowLoadModal(false);
                  setLoadedData(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={executeLoad}
                disabled={!Object.values(loadOptions).some(v => v)}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#6155f5] to-[#7c3aed] text-white hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Restaurar Versão Anterior</h2>
                  <p className="text-sm text-slate-600">Esta ação não pode ser desfeita</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-900 font-medium mb-1">Atenção!</p>
                    <p className="text-sm text-amber-800">
                      Todos os dados atuais serão substituídos pela versão de backup salva automaticamente. 
                      Esta ação sobrescreverá as alterações mais recentes.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-600">
                Deseja realmente restaurar a versão anterior? A página será recarregada após a restauração.
              </p>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={executeRestore}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg transition-all font-medium"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}