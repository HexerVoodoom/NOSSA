import { useState, useEffect } from 'react';
import { Upload, X, Check, Download, Info, Save, CheckCircle2 } from 'lucide-react';
import { processSVGForUpload, sanitizeSVG } from '../lib/svgProcessor';
import { getCustomElementsStats } from '../lib/customElements';
import { CUSTOM_ELEMENTS_KEY, safeSetItem } from '../lib/storage';

interface UploadedElement {
  id: string;
  svg: string;
  name: string;
}

interface ElementUploadViewProps {
  onBack: () => void;
}

// Estrutura de elementos: 60 elementos no total
const ELEMENT_STRUCTURE = [
  { section: 'Seção 1: Base & Propósito (Piso)', prefix: 'foundation', count: 10 },
  { section: 'Seção 2: Sustentação & Impacto (Coluna)', prefix: 'structure', count: 10 },
  { section: 'Seção 3: Corpo de Trabalho (Parede)', prefix: 'wall', count: 10 },
  { section: 'Seção 4: Comunicação & Abertura (Porta)', prefix: 'door', count: 10 },
  { section: 'Seção 5: Transparência & Visão (Janela)', prefix: 'window', count: 10 },
  { section: 'Seção 6: Proteção & Cobertura (Telhado)', prefix: 'roof', count: 10 },
];

// Teto por arquivo. O localStorage tem ~5 MB no total e um SVG do Illustrator
// com raster embutido passa disso sozinho: sem o corte, o primeiro upload
// grande derruba a gravação de TODOS os outros elementos.
const MAX_SVG_BYTES = 512 * 1024;

// Um JSON importado ia direto para o estado e para o localStorage sem nenhuma
// checagem de forma: `[1,2,3]` ou `{"foundation-1": 42}` corrompia a chave
// compartilhada, que é exportada e entra nos backups.
function isUploadedElement(value: unknown): value is UploadedElement {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  return typeof v.svg === 'string';
}

export function sanitizeUploadedElements(raw: unknown): Record<string, UploadedElement> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, UploadedElement> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!id || !isUploadedElement(value)) continue;
    // Um arquivo importado nunca passou por processSVGForUpload: sanitiza aqui
    // em vez de confiar apenas no saneamento de renderização.
    const svg = processSVGForUpload(value.svg);
    if (!svg) continue;
    out[id] = { id, svg, name: typeof value.name === 'string' ? value.name : id };
  }
  return out;
}

export function ElementUploadView({ onBack }: ElementUploadViewProps) {
  const [uploadedElements, setUploadedElements] = useState<Record<string, UploadedElement>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Carregar elementos salvos do localStorage ao montar.
  // Era um useState(fn) usado como efeito: o inicializador disparava setState
  // durante o próprio render. useEffect é o hook correto para isso.
  useEffect(() => {
    const savedCustomElements = localStorage.getItem(CUSTOM_ELEMENTS_KEY);
    if (!savedCustomElements) return;
    try {
      const parsed = JSON.parse(savedCustomElements);
      if (parsed && typeof parsed === 'object') setUploadedElements(parsed);
    } catch (e) {
      // Silenciar aqui fazia a biblioteca aparecer vazia e o usuário concluir
      // que os envios sumiram, sem qualquer pista do que houve.
      console.error('Erro ao carregar elementos:', e);
      alert('Não foi possível carregar os elementos salvos: o conteúdo armazenado está corrompido.');
    }
  }, []);

  // Uma escrita que falha por cota não pode passar despercebida: antes o
  // setItem cru estourava QuotaExceededError e derrubava a tela, com o estado
  // já atualizado — a UI mostrava um envio que não existia no armazenamento.
  const persist = (updated: Record<string, UploadedElement>): boolean => {
    if (!safeSetItem(CUSTOM_ELEMENTS_KEY, JSON.stringify(updated))) {
      alert('Espaço do navegador esgotado: o elemento NÃO foi salvo. Remova elementos antigos e tente de novo.');
      return false;
    }
    setUploadedElements(updated);
    return true;
  };

  const acceptSvgFile = async (file: File, elementId: string): Promise<void> => {
    if (file.size > MAX_SVG_BYTES) {
      alert(`Arquivo muito grande (${Math.round(file.size / 1024)} KB). O limite por elemento é ${MAX_SVG_BYTES / 1024} KB.`);
      return;
    }
    let processedSVG = '';
    try {
      processedSVG = processSVGForUpload(await file.text());
    } catch (error) {
      console.error('Erro ao ler o SVG:', error);
    }
    if (!processedSVG) {
      alert('Não foi possível ler este SVG (arquivo inválido ou sem conteúdo desenhável).');
      return;
    }
    persist({ ...uploadedElements, [elementId]: { id: elementId, svg: processedSVG, name: file.name } });
  };

  const handleDrop = async (e: React.DragEvent, elementId: string) => {
    e.preventDefault();
    setDragOver(null);

    const files = Array.from(e.dataTransfer.files);
    const svgFile = files.find(f => f.type === 'image/svg+xml' || f.name.endsWith('.svg'));

    if (svgFile) await acceptSvgFile(svgFile, elementId);
  };

  const handleDragOver = (e: React.DragEvent, elementId: string) => {
    e.preventDefault();
    setDragOver(elementId);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>, elementId: string) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/svg+xml' || file.name.endsWith('.svg'))) {
      await acceptSvgFile(file, elementId);
    }
  };

  const handleRemove = (elementId: string) => {
    const updated = { ...uploadedElements };
    delete updated[elementId];
    persist(updated);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(uploadedElements, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custom-elements.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // `file.text()` estava FORA do try: um arquivo ilegível estourava uma
        // promise rejeitada sem tratamento.
        const imported = sanitizeUploadedElements(JSON.parse(await file.text()));
        if (Object.keys(imported).length === 0) {
          alert('Nenhum elemento válido foi encontrado no arquivo.');
          return;
        }
        persist(imported);
      } catch (error) {
        console.error('Erro ao importar elementos:', error);
        alert('Erro ao importar arquivo JSON');
      } finally {
        // Sem isso, reimportar o MESMO arquivo não dispara onChange.
        e.target.value = '';
      }
    }
  };

  const totalElements = ELEMENT_STRUCTURE.reduce((sum, s) => sum + s.count, 0);
  const uploadedCount = Object.keys(uploadedElements).length;
  
  // Verificar elementos incorporados ao código
  const builtInStats = getCustomElementsStats();
  const hasBuiltInElements = builtInStats.total > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-[#6155f5] to-[#7c3aed] overflow-hidden">
        <div className="absolute inset-0 bg-black/5" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Upload de Elementos SVG
              </h1>
              <p className="text-white/80">
                Faça upload dos elementos arquitetônicos em formato SVG
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                disabled={uploadedCount === 0}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Exportar
              </button>
              <label className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 flex items-center gap-2 text-white cursor-pointer">
                <Upload className="w-5 h-5" />
                Importar JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Built-in Elements Banner */}
        {hasBuiltInElements && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900 mb-1">
                ✅ Biblioteca Completa Incorporada!
              </p>
              <p className="text-sm text-green-800">
                <strong>{builtInStats.total} elementos customizados</strong> já estão incorporados no código e funcionando em toda a aplicação. Eles não dependem do localStorage e funcionam em qualquer navegador/dispositivo.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(builtInStats.byCategory).map(([category, count]) => (
                  count > 0 && (
                    <span key={category} className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                      {category}: {count}
                    </span>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Como funciona:</p>
            <p>Os elementos carregados aqui serão automaticamente usados nas <strong>telas de perguntas</strong> e <strong>montagem de obras</strong>. Se um elemento não for carregado, o sistema usará a forma geométrica padrão.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">
              Progresso do Upload
            </span>
            <span className="text-sm font-bold text-[#6155f5]">
              {uploadedCount} / {totalElements}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6155f5] to-[#7c3aed] transition-all duration-500"
              style={{ width: `${(uploadedCount / totalElements) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        {ELEMENT_STRUCTURE.map((section) => (
          <div key={section.prefix} className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {section.section}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: section.count }, (_, i) => {
                const elementId = `${section.prefix}-${i + 1}`;
                const uploaded = uploadedElements[elementId];
                const isDragOver = dragOver === elementId;

                return (
                  <div key={elementId} className="relative">
                    <label
                      onDrop={(e) => handleDrop(e, elementId)}
                      onDragOver={(e) => handleDragOver(e, elementId)}
                      onDragLeave={handleDragLeave}
                      className={`
                        block aspect-square rounded-xl border-2 border-dashed cursor-pointer
                        transition-all duration-200 overflow-hidden
                        ${uploaded 
                          ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                          : isDragOver
                          ? 'border-[#6155f5] bg-[#6155f5]/10 scale-105'
                          : 'border-slate-300 bg-white hover:border-[#6155f5] hover:bg-slate-50'
                        }
                      `}
                    >
                      <input
                        type="file"
                        accept=".svg,image/svg+xml"
                        onChange={(e) => handleFileInput(e, elementId)}
                        className="hidden"
                      />
                      
                      {uploaded ? (
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                          {/* Sanitiza de novo na renderização: o localStorage pode ter sido adulterado */}
                          <div
                            dangerouslySetInnerHTML={{ __html: sanitizeSVG(uploaded.svg) }}
                            className="w-full h-full flex items-center justify-center"
                          />
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemove(elementId);
                            }}
                            className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <Upload className={`w-8 h-8 mb-2 ${isDragOver ? 'text-[#6155f5]' : 'text-slate-400'}`} />
                          <span className="text-xs font-medium text-slate-600 text-center">
                            {elementId}
                          </span>
                          <span className="text-xs text-slate-400 text-center mt-1">
                            Clique ou arraste
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium transition-all duration-200"
          >
            ← Voltar para Home
          </button>
        </div>
      </div>
    </div>
  );
}