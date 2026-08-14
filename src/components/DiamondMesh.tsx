import { useState, useRef, useEffect } from 'react';
import { AssembledElement } from '../types';
import { ElementRenderer } from './ElementRenderer';
import { normalizeCategoryId } from '../lib/categoryShapes';

interface SelectedElement {
  elementId: string;
  shapeCode: string;
  color: string;
  categoryId?: string;
}

type ViewMode = 'geometric' | 'architectural';

interface DiamondMeshProps {
  elements: SelectedElement[]; // Selected elements with shape and color info
  assembledElements: AssembledElement[];
  onUpdateElements: (elements: AssembledElement[]) => void;
  readOnly?: boolean;
  viewMode?: ViewMode;
  categoryScales?: Record<string, number>;
  lockedCategories?: Record<string, boolean>;
}

export function DiamondMesh({ elements, assembledElements, onUpdateElements, readOnly = false, viewMode = 'architectural', categoryScales = {}, lockedCategories = {} }: DiamondMeshProps) {
  const [draggedElement, setDraggedElement] = useState<{ elementId: string; index: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState<number | null>(null);
  const [centeredElements, setCenteredElements] = useState<AssembledElement[]>(assembledElements);
  // Em modo leitura a obra é gerada por layout automático numa "canvas" de
  // 1000px, mas o container real tem ~720px. Com `overflow-hidden`, as fileiras
  // mais largas (14 fundações × 100px = 1300px) ficavam cortadas: 20 dos 51
  // elementos não apareciam. Escalamos a obra inteira para caber.
  const [fitScale, setFitScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const BASE_SIZE = 80;

  // Função para obter o z-index baseado na categoria
  // Ordem de sobreposição (de baixo para cima): Piso < Paredes < Colunas < Portas/Janelas < Telhado
  const getCategoryZIndex = (categoryId?: string): number => {
    const zIndexMap: Record<string, number> = {
      'bloco1': 10,  // Piso - mais atrás
      'bloco3': 20,  // Paredes - acima do piso
      'bloco2': 30,  // Colunas - sobrepõem paredes
      'bloco4': 40,  // Portas - sobrepõem paredes
      'bloco5': 50,  // Janelas - sobrepõem paredes
      'bloco6': 60,  // Telhado - mais na frente
    };
    return zIndexMap[normalizeCategoryId(categoryId)] || 10;
  };

  // Função para obter dimensões baseadas no tipo de elemento
  const getElementDimensions = (shapeCode: string, categoryId?: string): { width: number; height: number } => {
    const baseWidth = BASE_SIZE;
    const baseHeight = BASE_SIZE;
    const code = typeof shapeCode === 'string' ? shapeCode : '';

    // Ajustar tamanhos por categoria para criar proporções arquitetônicas realistas
    const categoryScaleMap: Record<string, number> = {
      'bloco1': 2.0,   // Piso - MAIOR (dobro do tamanho)
      'bloco2': 0.5,   // Colunas - 1/2 do tamanho atual (bem menores)
      'bloco3': 1.8,   // Paredes - MAIORES
      'bloco4': 0.25,  // Portas - 1/4 do tamanho atual (bem menores)
      'bloco5': 0.6,   // Janelas - menores
      'bloco6': 1.2,   // Telhado - médio
    };

    const catKey = normalizeCategoryId(categoryId);
    // Base scale da categoria + user scale adjustment.
    // Escalas 0/negativas/NaN colapsariam o elemento; caem para 1.0.
    const baseScale = categoryScaleMap[catKey] || 1.0;
    const rawUserScale = categoryScales[catKey] ?? categoryScales[categoryId ?? ''] ?? 1.0;
    const userScale = Number.isFinite(rawUserScale) && rawUserScale > 0 ? rawUserScale : 1.0;
    const scale = baseScale * userScale;

    // Fundamento (foundation) - quadrado
    if (code.startsWith('foundation-')) {
      return { 
        width: baseWidth * scale, 
        height: baseHeight * scale 
      };
    }
    
    // Colunas (structure) - verticais mas não tão altas (reduzido de 5/3 para 4/3)
    if (code.startsWith('structure-')) {
      return { 
        width: baseWidth * 0.6 * scale,  // Reduzido de 0.8 para 0.6
        height: baseWidth * 0.6 * (4/3) * scale  // Reduzido de 5/3 para 4/3
      };
    }
    
    // Paredes (wall) - horizontais e grandes (aspect-ratio 4:3)
    if (code.startsWith('wall-')) {
      return { 
        width: baseWidth * 1.3 * scale, 
        height: baseWidth * 1.3 * (3/4) * scale 
      };
    }
    
    // Janelas (window) - pequenas e quadradas
    if (code.startsWith('window-')) {
      return { 
        width: baseWidth * 0.6 * scale, 
        height: baseWidth * 0.6 * scale 
      };
    }
    
    // Detalhes/Portas (detail/door) - verticais médias (aspect-ratio 2:3)
    // 'door-' era ignorado e caía no fallback quadrado
    if (code.startsWith('detail-') || code.startsWith('door-')) {
      return { 
        width: baseWidth * 0.7 * scale, 
        height: baseWidth * 0.7 * (3/2) * scale 
      };
    }
    
    // Telhados (roof) - largos e baixos (aspect-ratio 5:3)
    if (code.startsWith('roof-')) {
      return { 
        width: baseWidth * 1.4 * scale, 
        height: baseWidth * 1.4 * (3/5) * scale 
      };
    }
    
    // Fallback: quadrado
    return { 
      width: baseWidth * scale, 
      height: baseHeight * scale 
    };
  };
  
  const handleMouseDown = (e: React.MouseEvent, elementId: string, index: number) => {
    if (readOnly) return;
    
    // Verificar se a categoria está bloqueada
    const element = assembledElements[index];
    if (!element || !element.position) return; // registro legado sem posição
    if (element.categoryId && lockedCategories[element.categoryId]) {
      // Categoria bloqueada - não permitir drag
      return;
    }
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const offsetX = e.clientX - rect.left - element.position.x;
    const offsetY = e.clientY - rect.top - element.position.y;
    
    setDraggedElement({ elementId, index });
    setDragOffset({ x: offsetX, y: offsetY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    // Free movement - no snapping
    const newElements = [...assembledElements];
    newElements[draggedElement.index] = {
      ...newElements[draggedElement.index],
      position: { x, y, z: 0 },
    };
    
    onUpdateElements(newElements);
  };
  
  const handleMouseUp = () => {
    setDraggedElement(null);
  };
  
  // Initialize positions within canvas if not set
  useEffect(() => {
    if (assembledElements.length === 0 && elements.length > 0) {
      // Wait a bit for container to have dimensions
      const timer = setTimeout(() => {
        if (!containerRef.current) return;
        
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        if (containerWidth === 0 || containerHeight === 0) return;
        
        // Create a grid layout for initial positioning
        const cols = Math.ceil(Math.sqrt(elements.length));
        const rows = Math.ceil(elements.length / cols);
        const spacing = Math.min(
          (containerWidth - 100) / cols,
          (containerHeight - 100) / rows
        );
        const startX = (containerWidth - (cols * spacing)) / 2 + spacing / 2;
        const startY = (containerHeight - (rows * spacing)) / 2 + spacing / 2;
        
        const initialElements: AssembledElement[] = elements.map((element, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          // Position in grid with slight randomization
          const x = startX + col * spacing + (Math.random() - 0.5) * 20;
          const y = startY + row * spacing + (Math.random() - 0.5) * 20;
          
          return {
            elementId: element.elementId,
            shapeCode: element.shapeCode,
            color: element.color,
            categoryId: normalizeCategoryId(element.categoryId),
            position: { x, y, z: 0 },
            rotation: 0,
            scale: 1,
          };
        });
        onUpdateElements(initialElements);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [elements.length, assembledElements.length]);
  
  // Centralize elements in read-only mode
  useEffect(() => {
    if (!readOnly || assembledElements.length === 0) {
      setCenteredElements(assembledElements);
      setFitScale(1);
      return;
    }
    
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      if (containerWidth === 0 || containerHeight === 0) {
        setCenteredElements(assembledElements);
        return;
      }
      
      // Calculate bounding box of all elements
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      assembledElements.forEach((assembled) => {
        const element = elements.find(e => e.elementId === assembled.elementId);
        if (!element) return;
        
        const dimensions = getElementDimensions(element.shapeCode, element.categoryId);
        // Posições ausentes/NaN envenenariam o bounding box (tudo fora da tela)
        const px = Number(assembled.position?.x);
        const py = Number(assembled.position?.y);
        if (!Number.isFinite(px) || !Number.isFinite(py)) return;
        const left = px - dimensions.width / 2;
        const top = py - dimensions.height / 2;
        const right = px + dimensions.width / 2;
        const bottom = py + dimensions.height / 2;

        minX = Math.min(minX, left);
        minY = Math.min(minY, top);
        maxX = Math.max(maxX, right);
        maxY = Math.max(maxY, bottom);
      });
      
      if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
        setCenteredElements(assembledElements);
        return;
      }
      
      // Calculate center of bounding box
      const bboxCenterX = (minX + maxX) / 2;
      const bboxCenterY = (minY + maxY) / 2;
      
      // Calculate offset to center in container
      const offsetX = (containerWidth / 2) - bboxCenterX;
      const offsetY = (containerHeight / 2) - bboxCenterY;
      
      // Apply offset to all elements
      const newElements = assembledElements.map(assembled => ({
        ...assembled,
        position: {
          x: (Number(assembled.position?.x) || 0) + offsetX,
          y: (Number(assembled.position?.y) || 0) + offsetY,
          z: Number(assembled.position?.z) || 0,
        }
      }));
      setCenteredElements(newElements);

      // Escala para caber (nunca amplia, só reduz), com uma margem de 16px.
      const bboxW = maxX - minX;
      const bboxH = maxY - minY;
      const scaleX = bboxW > 0 ? (containerWidth - 16) / bboxW : 1;
      const scaleY = bboxH > 0 ? (containerHeight - 16) / bboxH : 1;
      const fit = Math.min(1, scaleX, scaleY);
      setFitScale(Number.isFinite(fit) && fit > 0 ? fit : 1);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [readOnly, assembledElements, elements]);
  
  return (
    <div className="w-full overflow-x-auto">
      {elements.length === 0 && (
        <div className="text-center p-[24px] bg-yellow-100 rounded-[12px] mb-[16px]">
          <p className="font-['Inter:Semi_Bold',sans-serif] text-[14px] text-black">
            ⚠️ Nenhum elemento foi selecionado. Verifique suas respostas.
          </p>
        </div>
      )}
      
      <div
        ref={containerRef}
        className="relative bg-transparent rounded-[12px] overflow-hidden mx-auto w-full h-full min-h-[500px]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        
        {/* Render elements */}
        <div
          className="absolute inset-0"
          style={fitScale === 1 ? undefined : { transform: `scale(${fitScale})`, transformOrigin: 'center center' }}
        >
        {centeredElements.map((assembled, index) => {
          const element = elements.find(e => e.elementId === assembled.elementId);
          if (!element) {
            // Elemento não encontrado (pode ser de uma versão antiga)
            return null;
          }
          
          const isDragging = draggedElement?.index === index;
          const isHovered = hoveredElement === index;
          const isLocked = element.categoryId && lockedCategories[element.categoryId];
          const dimensions = getElementDimensions(element.shapeCode, element.categoryId);
          
          // Z-index: dragging (1000) > hovered (500) > categoria normal
          const zIndex = isDragging ? 1000 : isHovered ? 500 : getCategoryZIndex(element.categoryId);

          // Posição pode faltar/ser inválida em registros antigos
          const posX = Number(assembled.position?.x);
          const posY = Number(assembled.position?.y);
          const safeX = Number.isFinite(posX) ? posX : 0;
          const safeY = Number.isFinite(posY) ? posY : 0;

          // rotation é `number | {x,y,z}` — os dois ramos precisam ser tratados
          const rawRotation = assembled.rotation;
          const rotationDeg = typeof rawRotation === 'number'
            ? rawRotation
            : Number(rawRotation?.z) || 0;
          const safeRotation = Number.isFinite(rotationDeg) ? rotationDeg : 0;
          const zoom = isDragging ? 1.1 : isHovered && !isLocked ? 1.05 : 1;

          return (
            <div
              key={`${assembled.elementId}-${index}`}
              data-obra-element={element.shapeCode}
              className={`absolute transition-all duration-150 ${
                readOnly 
                  ? 'cursor-default' 
                  : isLocked
                  ? 'cursor-not-allowed pointer-events-none'
                  : 'cursor-move hover:shadow-2xl'
              } ${isHovered && !readOnly && !isLocked ? 'ring-2 ring-[#6155f5] ring-offset-2 rounded-lg' : ''}`}
              style={{
                left: safeX - dimensions.width / 2,
                top: safeY - dimensions.height / 2,
                width: dimensions.width,
                height: dimensions.height,
                transform: `scale(${zoom})${safeRotation ? ` rotate(${safeRotation}deg)` : ''}`,
                zIndex,
                opacity: isLocked ? 0.7 : 1,
              }}
              onMouseDown={(e) => handleMouseDown(e, element.elementId, index)}
              onMouseEnter={() => setHoveredElement(index)}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <ElementRenderer
                code={element.shapeCode}
                color={element.color}
                mode={viewMode}
                className="w-full h-full"
              />
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
