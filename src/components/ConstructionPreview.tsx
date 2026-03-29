import { SavedWork, AssembledElement } from '../types';
import { storage } from '../lib/storage';
import { newBlocks } from '../lib/newBlocks';
import { getAllQuestionsFromCompetencies } from '../lib/competencyHelpers';

interface ConstructionPreviewProps {
  evaluation: SavedWork;
  onBack: () => void;
  onCreateBuilding: () => void;
}

// Competency shapes mapping for each category (same as CategoryQuestionFlow)
const categoryShapes: Record<string, string[]> = {
  'cat1': ['foundation-1', 'foundation-2', 'foundation-3', 'foundation-4', 'foundation-5', 'foundation-6', 'foundation-7', 'foundation-8', 'foundation-9', 'foundation-10'],
  'cat2': ['structure-1', 'structure-2', 'structure-3', 'structure-4', 'structure-5', 'structure-6', 'structure-7', 'structure-8', 'structure-9', 'structure-10'],
  'cat3': ['wall-1', 'wall-2', 'wall-3', 'wall-4', 'wall-5', 'wall-6', 'wall-7', 'wall-8', 'wall-9', 'wall-10'],
  'cat4': ['window-1', 'window-2', 'window-3', 'window-4', 'window-5', 'window-6', 'window-7', 'window-8', 'window-9', 'window-10'],
  'cat5': ['detail-1', 'detail-2', 'detail-3', 'detail-4', 'detail-5', 'detail-6', 'detail-7', 'detail-8', 'detail-9', 'detail-10'],
  'cat6': ['roof-1', 'roof-2', 'roof-3', 'roof-4', 'roof-5', 'roof-6', 'roof-7', 'roof-8', 'roof-9', 'roof-10'],
};

export function ConstructionPreview({ evaluation, onBack, onCreateBuilding }: ConstructionPreviewProps) {
  const roles = storage.getRoles();
  const role = roles.find(r => r.id === evaluation.roleId);
  const allQuestions = getAllQuestionsFromCompetencies();
  
  // Helper to calculate elementId from imageIndex (fallback for old data)
  const getElementIdFromImageIndex = (categoryId: string, imageIndex: number | null | undefined, fallbackElementId: string): string => {
    // If we already have an elementId and it's not empty, use it
    if (fallbackElementId && fallbackElementId !== '') return fallbackElementId;
    
    // Otherwise, try to calculate from imageIndex
    if (imageIndex === null || imageIndex === undefined) return '';
    const rowIndex = Math.floor(imageIndex / 5);
    const shapes = categoryShapes[categoryId] || [];
    return shapes[rowIndex] || '';
  };
  
  // Ensure assembledElements exists or create from responses
  const assembledElements: AssembledElement[] = evaluation.assembledElements && evaluation.assembledElements.length > 0
    ? evaluation.assembledElements
    : evaluation.responses.map((response) => {
        // Find the question to get its categoryId
        const question = allQuestions.find(q => q.id === response.questionId) ||
                        role?.customQuestions?.find(q => q.id === response.questionId);
        
        const categoryId = question?.categoryId || 'cat1';
        const elementId = getElementIdFromImageIndex(
          categoryId,
          response.selectedImageIndex,
          response.selectedElementId
        );
        
        return {
          elementId: elementId,
          categoryId: categoryId,
          level: response.rating,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: 1,
        };
      });
  
  // Group elements by category
  const elementsByCategory = assembledElements.reduce((acc, element) => {
    if (!acc[element.categoryId]) {
      acc[element.categoryId] = [];
    }
    acc[element.categoryId].push(element);
    return acc;
  }, {} as Record<string, typeof assembledElements>);

  // Calculate stats
  const totalElements = assembledElements.length;
  const completedQuadrants = Object.keys(elementsByCategory).length;
  const totalQuadrants = newBlocks.length;
  
  // Calculate average level
  const avgLevel = assembledElements.length > 0
    ? assembledElements.reduce((sum, el) => sum + el.level, 0) / assembledElements.length
    : 0;

  const getPerformanceLabel = (avg: number) => {
    if (avg >= 4.5) return 'Excelente';
    if (avg >= 3.5) return 'Avançado';
    if (avg >= 2.5) return 'Progredindo';
    if (avg >= 1.5) return 'Em Desenvolvimento';
    return 'Iniciante';
  };

  // Category display names mapping
  const categoryNames: Record<string, string> = {
    'horizonte': 'Horizonte',
    'fachada': 'Fachada',
    'estrutura': 'Estrutura',
    'fundamento': 'Fundamento'
  };

  const categorySubtitles: Record<string, string> = {
    'horizonte': '(Colaboração e Propósito)',
    'fachada': '(Criatividade e Expressão)',
    'estrutura': '(Habilidade Técnica e Resolução)',
    'fundamento': '(Execução e Responsabilidade)'
  };

  return (
    <div className="bg-white content-stretch flex flex-col gap-[32px] items-center relative min-h-screen w-full pb-[32px] pt-[32px] px-[75.5px] mx-auto">
      {/* Header */}
      <div className="content-stretch flex h-[32px] items-center justify-between relative shrink-0 w-full max-w-[1280px]">
        <button
          onClick={onBack}
          className="h-[32px] rounded-[8px] shrink-0 px-[10px] hover:bg-gray-100 transition-colors"
        >
          <p className="font-['Arial:Regular',sans-serif] text-[14px] text-neutral-950">← Voltar aos Quadrantes</p>
        </button>
        
        <div className="h-[24px] shrink-0">
          <p className="font-['Arial:Regular',sans-serif] text-[16px] text-[#0f172b] text-center">Sua Obra</p>
        </div>
        
        <div className="h-[32px] w-[128px]" />
      </div>

      {/* Main Content */}
      <div className="gap-[24px] grid grid-cols-[1fr_405px] w-full max-w-[1280px]">
        {/* Left Column - Construction Board */}
        <div className="bg-white box-border content-stretch flex flex-col gap-[24px] items-start p-[32px] rounded-[14px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
          {/* Title Section */}
          <div className="content-stretch flex flex-col gap-[8px] items-start w-full">
            <div className="bg-[#64748b] box-border px-[12px] py-[3px] rounded-[100px] w-fit">
              <p className="font-['Arial:Regular',sans-serif] text-[11px] text-center text-white">Arquitetura de Carreira</p>
            </div>
            
            <div className="h-[24px] w-full">
              <p className="font-['Arial:Regular',sans-serif] text-[16px] text-[#0f172b] text-center">Quadro de Construção</p>
            </div>
            
            <div className="h-[20px] w-full">
              <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#45556c] text-center">Estrutura 4 linhas × 3 colunas</p>
            </div>
          </div>

          {/* Quadrants Grid */}
          <div className="content-stretch flex flex-col gap-[24px] items-start w-full">
            {newBlocks.map((category, index) => {
              const elements = elementsByCategory[category.id] || [];
              const categoryNumber = newBlocks.length - index;
              
              return (
                <div key={category.id} className="content-stretch flex flex-col gap-[12px] items-start w-full">
                  {/* Category Header */}
                  <div className="content-stretch flex gap-[12px] h-[32px] items-center w-full">
                    <div className="size-[32px] rounded-[4px] flex items-center justify-center" style={{ backgroundColor: category.color }}>
                      <p className="font-['Arial:Regular',sans-serif] text-[14px] text-white">{categoryNumber}</p>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-baseline gap-[8px]">
                        <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#0f172b]">
                          {categoryNames[category.id] || category.name}
                        </p>
                        <p className="font-['Arial:Regular',sans-serif] text-[12px] text-[#62748e]">
                          {categorySubtitles[category.id] || ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Elements Row */}
                  <div className="h-[203px] relative rounded-[10px] w-full border-2 border-slate-200 p-[26px] flex items-center justify-around gap-[20px]">
                    {elements.length > 0 ? (
                      elements.map((element, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-[8px] flex-1 max-w-[200px]">
                          {/* Element Icon/Shape Preview */}
                          <div className="h-[90px] flex items-center justify-center">
                            <div 
                              className="w-[80px] h-[80px] rounded-[8px] flex items-center justify-center"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <div 
                                className="w-[60px] h-[60px] rounded-[4px]"
                                style={{ backgroundColor: category.color }}
                              />
                            </div>
                          </div>
                          
                          {/* Element Name */}
                          <p className="font-['Arial:Regular',sans-serif] text-[12px] text-[#45556c] text-center line-clamp-2">
                            {element.name}
                          </p>
                          
                          {/* Level Badge */}
                          <div 
                            className="h-[20px] px-[8px] rounded-[4px] flex items-center justify-center"
                            style={{ backgroundColor: category.color }}
                          >
                            <p className="font-['Arial:Regular',sans-serif] text-[12px] text-white">
                              Nível {element.level}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#62748e] text-center w-full">
                        Nenhum elemento neste quadrante
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Stats and Actions */}
        <div className="content-stretch flex flex-col gap-[24px] items-start">
          {/* Overall Performance */}
          <div className="bg-white h-[168px] rounded-[14px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] w-full">
            <div className="box-border content-stretch flex flex-col gap-[16px] h-full items-start p-[24px]">
              <h3 className="font-['Arial:Regular',sans-serif] text-[16px] text-[#0f172b]">
                Performance Geral
              </h3>
              
              <div className="content-stretch flex flex-col gap-[16px] w-full">
                <div className="content-stretch flex h-[32px] items-center justify-between w-full">
                  <p className="font-['Arial:Regular',sans-serif] text-[16px] text-[#45556c]">Nível Médio:</p>
                  <p className="font-['Arial:Regular',sans-serif] text-[24px] text-[#0f172b]">
                    {avgLevel.toFixed(1)}
                  </p>
                </div>
                
                <div className="bg-slate-50 h-[32px] px-[8px] py-[8px] rounded-[4px] w-full flex items-center justify-center">
                  <p className="font-['Arial:Regular',sans-serif] text-[12px] text-[#62748e] text-center">
                    {getPerformanceLabel(avgLevel)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quadrant Colors Legend */}
          <div className="bg-white h-[293px] rounded-[14px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] w-full">
            <div className="box-border content-stretch flex flex-col gap-[16px] h-full items-start p-[24px]">
              <h3 className="font-['Arial:Regular',sans-serif] text-[16px] text-[#0f172b]">
                Cores dos Quadrantes
              </h3>
              
              <div className="content-stretch flex flex-col gap-[12px] w-full">
                {newBlocks.map((category) => (
                  <div key={category.id} className="content-stretch flex flex-col gap-[4px] w-full">
                    <p className="font-['Arial:Regular',sans-serif] text-[12px] text-[#314158]">
                      {categoryNames[category.id] || category.name}
                    </p>
                    
                    <div className="h-[12px] rounded-[4px] w-full" style={{ backgroundColor: category.color }} />
                  </div>
                ))}
              </div>
              
              <div className="border-t border-slate-200 pt-[13px] w-full">
                <p className="font-['Arial:Regular',sans-serif] text-[12px] text-[#62748e] text-center">
                  Frio (esquerda) → Quente (direita)
                </p>
              </div>
            </div>
          </div>

          {/* Building Stats */}
          <div className="bg-white h-[164px] rounded-[14px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] w-full">
            <div className="box-border content-stretch flex flex-col gap-[16px] h-full items-start p-[24px]">
              <h3 className="font-['Arial:Regular',sans-serif] text-[16px] text-[#0f172b]">
                Estatísticas da Obra
              </h3>
              
              <div className="content-stretch flex flex-col gap-[8px] w-full">
                <div className="content-stretch flex h-[20px] items-start justify-between w-full">
                  <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#45556c]">Total de Blocos:</p>
                  <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#0f172b]">{totalElements}</p>
                </div>
                
                <div className="content-stretch flex h-[20px] items-start justify-between w-full">
                  <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#45556c]">Quadrantes Completos:</p>
                  <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#0f172b]">
                    {completedQuadrants}/{totalQuadrants}
                  </p>
                </div>
                
                <div className="content-stretch flex h-[20px] items-start justify-between w-full">
                  <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#45556c]">Total Esperado:</p>
                  <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#0f172b]">
                    {totalElements} blocos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Create Building Button */}
          <button
            onClick={onCreateBuilding}
            className="bg-[#00a63e] h-[40px] rounded-[8px] w-full hover:bg-[#008f36] transition-colors"
          >
            <p className="font-['Arial:Regular',sans-serif] text-[14px] text-white">
              Criar Obra →
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}