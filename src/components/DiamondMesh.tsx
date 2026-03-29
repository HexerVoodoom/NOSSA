import { useState, useRef, useEffect } from 'react';
import { AssembledElement } from '../types';
import { ElementRenderer } from './ElementRenderer';

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const BASE_SIZE = 80;
  
  // Função para obter o z-index baseado na categoria
  // Ordem de sobreposição (de baixo para cima): Piso < Paredes < Colunas < Portas/Janelas < Telhado
  const getCategoryZIndex = (categoryId?: string): number => {
    const zIndexMap: Record<string, number> = {
      'cat1': 10,  // Piso - mais atrás
      'cat3': 20,  // Paredes - acima do piso
      'cat2': 30,  // Colunas - sobrepõem paredes
      'cat4': 40,  // Portas - sobrepõem paredes
      'cat5': 50,  // Janelas - sobrepõem paredes
      'cat6': 60,  // Telhado - mais na frente
    };
    return categoryId ? (zIndexMap[categoryId] || 10) : 10;
  };
  
  // Função para obter dimensões baseadas no tipo de elemento
  const getElementDimensions = (shapeCode: string, categoryId?: string): { width: number; height: number } => {
    const baseWidth = BASE_SIZE;
    const baseHeight = BASE_SIZE;
    
    // Ajustar tamanhos por categoria para criar proporções arquitetônicas realistas
    const categoryScaleMap: Record<string, number> = {
      'cat1': 2.0,   // Piso - MAIOR (dobro do tamanho)
      'cat2': 0.5,   // Colunas - 1/2 do tamanho atual (bem menores)
      'cat3': 1.8,   // Paredes - MAIORES
      'cat4': 0.25,  // Portas - 1/4 do tamanho atual (bem menores)
      'cat5': 0.6,   // Janelas - menores
      'cat6': 1.2,   // Telhado - médio
    };
    
    // Base scale da categoria + user scale adjustment
    const baseScale = categoryId ? (categoryScaleMap[categoryId] || 1.0) : 1.0;
    const userScale = categoryId ? (categoryScales[categoryId] || 1.0) : 1.0;
    const scale = baseScale * userScale;
    
    // Fundamento (foundation) - quadrado
    if (shapeCode.startsWith('foundation-')) {
      return { 
        width: baseWidth * scale, 
        height: baseHeight * scale 
      };
    }
    
    // Colunas (structure) - verticais mas não tão altas (reduzido de 5/3 para 4/3)
    if (shapeCode.startsWith('structure-')) {
      return { 
        width: baseWidth * 0.6 * scale,  // Reduzido de 0.8 para 0.6
        height: baseWidth * 0.6 * (4/3) * scale  // Reduzido de 5/3 para 4/3
      };
    }
    
    // Paredes (wall) - horizontais e grandes (aspect-ratio 4:3)
    if (shapeCode.startsWith('wall-')) {
      return { 
        width: baseWidth * 1.3 * scale, 
        height: baseWidth * 1.3 * (3/4) * scale 
      };
    }
    
    // Janelas (window) - pequenas e quadradas
    if (shapeCode.startsWith('window-')) {
      return { 
        width: baseWidth * 0.6 * scale, 
        height: baseWidth * 0.6 * scale 
      };
    }
    
    // Detalhes/Portas (detail) - verticais médias (aspect-ratio 2:3)
    if (shapeCode.startsWith('detail-')) {
      return { 
        width: baseWidth * 0.7 * scale, 
        height: baseWidth * 0.7 * (3/2) * scale 
      };
    }
    
    // Telhados (roof) - largos e baixos (aspect-ratio 5:3)
    if (shapeCode.startsWith('roof-')) {
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
            categoryId: element.categoryId || 'cat1',
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
        const left = assembled.position.x - dimensions.width / 2;
        const top = assembled.position.y - dimensions.height / 2;
        const right = assembled.position.x + dimensions.width / 2;
        const bottom = assembled.position.y + dimensions.height / 2;
        
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
          x: assembled.position.x + offsetX,
          y: assembled.position.y + offsetY,
          z: assembled.position.z || 0,
        }
      }));
      setCenteredElements(newElements);
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
          
          return (
            <div
              key={index}
              className={`absolute transition-all duration-150 ${
                readOnly 
                  ? 'cursor-default' 
                  : isLocked
                  ? 'cursor-not-allowed pointer-events-none'
                  : 'cursor-move hover:shadow-2xl'
              } ${isHovered && !readOnly && !isLocked ? 'ring-2 ring-[#6155f5] ring-offset-2 rounded-lg' : ''}`}
              style={{
                left: assembled.position.x - dimensions.width / 2,
                top: assembled.position.y - dimensions.height / 2,
                width: dimensions.width,
                height: dimensions.height,
                transform: `scale(${isDragging ? 1.1 : isHovered && !isLocked ? 1.05 : 1})`,
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
  );
}