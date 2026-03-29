import { useState } from 'react';
import { SavedWork, AssembledElement } from '../types';
import { DiamondMesh } from './DiamondMesh';
import { Download, ZoomIn, ZoomOut, Lock, Unlock } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getAllQuestionsFromCompetencies } from '../lib/competencyHelpers';
import { storage } from '../lib/storage';
import { newBlocks as categories } from '../lib/newBlocks';

// Logos
import imgLogoTortola from "figma:asset/0049d96aabf7ea4e2a663d5f83ebd360cb225dfd.png";
import imgLogoNOSSA from "figma:asset/d08376795895de90a85e101961d369a69979dcc3.png";

type ViewMode = 'geometric' | 'architectural';

interface AssemblyViewReadOnlyProps {
  work: SavedWork;
  onBack: () => void;
}

// Definições de elementos e cores por categoria (mesmas do CategoryQuestionFlow)
const categoryShapes: Record<string, string[]> = {
  'cat1': ['foundation-1', 'foundation-2', 'foundation-3', 'foundation-4', 'foundation-5', 'foundation-6', 'foundation-7', 'foundation-8', 'foundation-9', 'foundation-10'],  // Piso - 2 modelos x 5 níveis
  'cat2': ['structure-1', 'structure-2', 'structure-3', 'structure-4', 'structure-5', 'structure-6', 'structure-7', 'structure-8', 'structure-9', 'structure-10'], // Coluna - 2 modelos x 5 níveis
  'cat3': ['wall-1', 'wall-2', 'wall-3', 'wall-4', 'wall-5', 'wall-6', 'wall-7', 'wall-8', 'wall-9', 'wall-10'], // Parede - 2 modelos x 5 níveis
  'cat4': ['door-1', 'door-2', 'door-3', 'door-4', 'door-5', 'door-6', 'door-7', 'door-8', 'door-9', 'door-10'], // Porta - 2 modelos x 5 níveis
  'cat5': ['window-1', 'window-2', 'window-3', 'window-4', 'window-5', 'window-6', 'window-7', 'window-8', 'window-9', 'window-10'], // Janela - 2 modelos x 5 níveis
  'cat6': ['roof-1', 'roof-2', 'roof-3', 'roof-4', 'roof-5', 'roof-6', 'roof-7', 'roof-8', 'roof-9', 'roof-10'], // Telhado - 2 modelos x 5 níveis
};

const categoryColors: Record<string, string[]> = {
  'cat1': ['#3e4e5c', '#516b7a', '#7e9ba8', '#cdbea7', '#e07a5f'],
  'cat2': ['#2e2c6e', '#4b5d8a', '#7b9acc', '#f4b860', '#f28444'],
  'cat3': ['#1f3b4d', '#247a76', '#48c9b0', '#f5a05a', '#ff4e50'],
  'cat4': ['#2c3e50', '#5dade2', '#a9dfbf', '#f9e79f', '#f7dc6f'],
  'cat5': ['#34495e', '#3498db', '#52c9a9', '#f39c12', '#e74c3c'],
  'cat6': ['#1a1a2e', '#0f3460', '#16213e', '#e94560', '#f39c12'],
};

export function AssemblyViewReadOnly({ work, onBack }: AssemblyViewReadOnlyProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('architectural');
  const categories = newBlocks;
  
  const handleSharePDF = async () => {
    try {
      // Dynamic imports for PDF generation libraries
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      let isFirstPage = true;
      
      // Group responses by category
      const responsesByCategory: { [key: string]: typeof work.responses } = {};
      work.responses.forEach(response => {
        const question = allQuestions.find(q => q.id === response.questionId) ||
                        role?.customQuestions?.find(q => q.id === response.questionId);
        const categoryId = question?.categoryId || 'cat1';
        
        if (!responsesByCategory[categoryId]) {
          responsesByCategory[categoryId] = [];
        }
        responsesByCategory[categoryId].push(response);
      });
      
      // Get ordered categories with questions
      const categoriesWithQuestions = categories.filter(cat => 
        responsesByCategory[cat.id] && responsesByCategory[cat.id].length > 0
      );
      
      // Generate pages for each question
      for (const category of categoriesWithQuestions) {
        const categoryResponses = responsesByCategory[category.id];
        const catColorHex = category.color || '#6155f5';
        const r = parseInt(catColorHex.slice(1, 3), 16);
        const g = parseInt(catColorHex.slice(3, 5), 16);
        const b = parseInt(catColorHex.slice(5, 7), 16);
        
        for (let i = 0; i < categoryResponses.length; i++) {
          const response = categoryResponses[i];
          const question = allQuestions.find(q => q.id === response.questionId) ||
                          role?.customQuestions?.find(q => q.id === response.questionId);
          
          if (!question) continue;
          
          // Add new page (except for first page)
          if (!isFirstPage) {
            pdf.addPage();
          }
          isFirstPage = false;
          
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          // Header with Outline
          const headerY = 10;
          pdf.setDrawColor(r, g, b);
          pdf.setLineWidth(0.8);
          pdf.roundedRect(10, headerY, pageWidth - 20, 45, 3, 3, 'D');
          
          // Logos in JS PDF
          try {
            pdf.addImage(imgLogoTortola, 'PNG', 15, headerY + 10, 35, 25);
            pdf.addImage(imgLogoNOSSA, 'PNG', pageWidth - 55, headerY + 10, 40, 25);
          } catch (e) {
            console.warn('Could not add logos to PDF');
          }
          
          // Category name
          pdf.setFontSize(22);
          pdf.setTextColor(r, g, b);
          pdf.text(category.name, pageWidth / 2, headerY + 18, { align: 'center' });
          
          // Evaluation info
          pdf.setFontSize(11);
          pdf.setTextColor(100, 116, 139); // slate-500
          pdf.text(`${work.collaboratorName} | ${work.leaderName}`, pageWidth / 2, headerY + 28, { align: 'center' });
          
          // Question number indicator
          pdf.setFontSize(9);
          pdf.text(`Pergunta ${i + 1} de ${categoryResponses.length}`, pageWidth / 2, headerY + 38, { align: 'center' });
          
          // Content area with colored border
          const contentY = 65;
          pdf.setDrawColor(r, g, b);
          pdf.setLineWidth(0.5);
          pdf.roundedRect(15, contentY, pageWidth - 30, 180, 3, 3, 'D');
          
          // Question text
          pdf.setTextColor(15, 23, 43); // #0f172b
          pdf.setFontSize(13);
          const questionLines = pdf.splitTextToSize(question.text, pageWidth - 50);
          let yPos = contentY + 15;
          pdf.text(questionLines, 25, yPos);
          
          yPos += (questionLines.length * 6) + 15;
          
          // Keywords section - outline only
          pdf.setDrawColor(r, g, b);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(25, yPos, pageWidth - 50, 45, 2, 2, 'D');
          
          // Keywords title
          pdf.setFontSize(11);
          pdf.setTextColor(r, g, b);
          pdf.text('Palavras-chave', 32, yPos + 8);
          
          // Keywords list
          pdf.setFontSize(10);
          pdf.setTextColor(71, 85, 105); // slate-600
          const keywords = response.keywords.filter(k => k && k.trim() !== '');
          if (keywords.length > 0) {
            keywords.forEach((keyword, idx) => {
              pdf.setDrawColor(r, g, b);
              pdf.roundedRect(32, yPos + 12 + (idx * 9), pageWidth - 64, 7, 1, 1, 'D');
              pdf.setTextColor(51, 65, 85);
              pdf.text(keyword, 35, yPos + 17 + (idx * 9));
            });
          } else {
            pdf.setTextColor(148, 163, 184); // slate-400
            pdf.setFontSize(9);
            pdf.text('Nenhuma palavra-chave fornecida', 32, yPos + 20);
          }
          
          yPos += 55;
          
          // Rating section - outline only
          pdf.setDrawColor(r, g, b);
          pdf.roundedRect(25, yPos, pageWidth - 50, 50, 2, 2, 'D');
          
          // Rating title
          pdf.setFontSize(11);
          pdf.setTextColor(r, g, b);
          pdf.text(work.evaluationType === 'tradicional' ? 'Escala Likert de Frequência' : 'Avaliação de Satisfação', 32, yPos + 8);
          
          // Rating scale visualization
          const ratingStartX = pageWidth / 2 - 35;
          const ratingY = yPos + 20;
          const boxSize = 12;
          const boxSpacing = 15;
          
          // Labels baseadas no tipo
          const labels = work.evaluationType === 'tradicional' 
            ? ['Nunca', 'Raram.', 'Às vezes', 'Freq.', 'Sempre']
            : ['Insat.', 'Pouco', 'Neutro', 'Satis.', 'Muito'];

          // Level labels
          pdf.setFontSize(7);
          pdf.setTextColor(100, 116, 139); // slate-500
          for (let level = 1; level <= 5; level++) {
            const x = ratingStartX + (level - 1) * boxSpacing;
            pdf.text(labels[level-1], x + boxSize / 2, ratingY - 3, { align: 'center' });
          }
          
          // Rating boxes
          for (let level = 1; level <= 5; level++) {
            const x = ratingStartX + (level - 1) * boxSpacing;
            
            if (level === response.rating) {
              // Selected rating - filled with category color
              pdf.setFillColor(r, g, b);
              pdf.roundedRect(x, ratingY, boxSize, boxSize, 2, 2, 'F');
              
              // Checkmark
              pdf.setTextColor(255, 255, 255);
              pdf.setFontSize(10);
              pdf.text('✓', x + boxSize / 2, ratingY + boxSize / 2, { align: 'center', baseline: 'middle' });
            } else {
              // Unselected - border only
              pdf.setDrawColor(r, g, b);
              pdf.roundedRect(x, ratingY, boxSize, boxSize, 2, 2, 'D');
              
              // Level number
              pdf.setTextColor(r, g, b);
              pdf.setFontSize(9);
              pdf.text(level.toString(), x + boxSize / 2, ratingY + boxSize / 2, { align: 'center', baseline: 'middle' });
            }
          }
          
          // Footer with metadata
          const footerY = pageHeight - 15;
          pdf.setDrawColor(226, 232, 240);
          pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
          
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          
          // Left: Cargo
          pdf.text(`Cargo: ${work.roleName}`, 20, footerY);
          
          // Center: Page number
          const totalPages = categoriesWithQuestions.reduce((sum, cat) => 
            sum + (responsesByCategory[cat.id]?.length || 0), 0
          );
          let currentPageNum = 0;
          for (const cat of categoriesWithQuestions) {
            const catResponses = responsesByCategory[cat.id] || [];
            if (cat.id === category.id) {
              currentPageNum += i + 1;
              break;
            }
            currentPageNum += catResponses.length;
          }
          pdf.text(`${currentPageNum} / ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
          
          // Right: Date
          pdf.text(new Date(work.createdAt).toLocaleDateString('pt-BR'), pageWidth - 20, footerY, { align: 'right' });
        }
        
        // Adicionar página de observações ao final da seção, se houver
        if (work.sectionObservations && work.sectionObservations[category.id]) {
          pdf.addPage();
          
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          // Header with Outline
          const obsHeaderY = 10;
          pdf.setDrawColor(r, g, b);
          pdf.setLineWidth(0.8);
          pdf.roundedRect(10, obsHeaderY, pageWidth - 20, 45, 3, 3, 'D');
          
          // Logos
          try {
            pdf.addImage(imgLogoTortola, 'PNG', 15, obsHeaderY + 10, 35, 25);
            pdf.addImage(imgLogoNOSSA, 'PNG', pageWidth - 55, obsHeaderY + 10, 40, 25);
          } catch (e) {
            console.warn('Could not add logos to PDF');
          }
          
          // Category name
          pdf.setFontSize(22);
          pdf.setTextColor(r, g, b);
          pdf.text(category.name, pageWidth / 2, obsHeaderY + 18, { align: 'center' });
          
          // Section subtitle
          pdf.setFontSize(14);
          pdf.setTextColor(100, 116, 139);
          pdf.text('📝 Observações da Seção', pageWidth / 2, obsHeaderY + 33, { align: 'center' });
          
          // Content area with colored border
          const contentY = 65;
          pdf.setDrawColor(r, g, b);
          pdf.setLineWidth(0.5);
          pdf.roundedRect(15, contentY, pageWidth - 30, 180, 3, 3, 'D');
          
          // Observations text
          pdf.setTextColor(15, 23, 43); // slate-900
          pdf.setFontSize(11);
          const observationText = work.sectionObservations[category.id];
          const observationLines = pdf.splitTextToSize(observationText, pageWidth - 50);
          let yPos = contentY + 15;
          
          // Render text with line breaks support
          observationLines.forEach((line: string) => {
            if (yPos > contentY + 160) {
              // If text is too long, truncate with ellipsis
              pdf.setTextColor(148, 163, 184); // slate-400
              pdf.setFontSize(9);
              pdf.text('(texto truncado - visualize na aplicação para ver o conteúdo completo)', pageWidth / 2, yPos, { align: 'center' });
              return;
            }
            pdf.text(line, 25, yPos);
            yPos += 6;
          });
          
          // Footer with metadata
          const footerY = pageHeight - 15;
          pdf.setDrawColor(226, 232, 240);
          pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
          
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          
          // Left: Cargo
          pdf.text(`Cargo: ${work.roleName}`, 20, footerY);
          
          // Center: "Observações"
          pdf.text('Observações', pageWidth / 2, footerY, { align: 'center' });
          
          // Right: Date
          pdf.text(new Date(work.createdAt).toLocaleDateString('pt-BR'), pageWidth - 20, footerY, { align: 'right' });
        }
      }
      
      // Save PDF
      pdf.save(`obra-viva-${work.collaboratorName}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    }
  };
  
  // Processar elementos selecionados das responses
  const roles = storage.getRoles();
  const role = roles.find(r => r.id === work.roleId);
  const allQuestions = getAllQuestionsFromCompetencies();
  
  const selectedElements = work.responses
    .filter(r => r.selectedImageIndex !== undefined && r.selectedImageIndex !== null)
    .map((r, idx) => {
      const question = allQuestions.find(q => q.id === r.questionId) ||
                      role?.customQuestions?.find(q => q.id === r.questionId);
      const categoryId = question?.categoryId || 'cat1';
      
      const shapes = categoryShapes[categoryId] || categoryShapes['cat1'];
      const colors = categoryColors[categoryId] || categoryColors['cat1'];
      
      // Usar diretamente o selectedElementId que já foi calculado corretamente
      const shapeCode = r.selectedElementId || shapes[r.selectedImageIndex!] || shapes[0];
      // A cor é baseada no rating (nível de 1-5)
      const colorIndex = (r.rating || 1) - 1;
      const color = colors[colorIndex] || colors[0];
      
      return {
        elementId: `element-${idx}-${shapeCode}-${colorIndex}`,
        shapeCode,
        color,
        categoryId,
      };
    });
  
  // Se não existir assembledElements (obras antigas), gerar montagem automática
  const getAssembledElements = (): AssembledElement[] => {
    if (work.assembledElements && work.assembledElements.length > 0) {
      return work.assembledElements;
    }
    
    // Gerar montagem automática para obras antigas
    const elementsByCategory: Record<string, AssembledElement[]> = {
      'cat1': [],
      'cat2': [],
      'cat3': [],
      'cat4': [],
      'cat5': [],
      'cat6': [],
    };
    
    selectedElements.forEach((element) => {
      if (element.categoryId) {
        elementsByCategory[element.categoryId].push({
          ...element,
          position: { x: 0, y: 0, z: 0 },
          rotation: 0,
          scale: 1,
        });
      }
    });
    
    const canvasWidth = 1000;
    const centerX = canvasWidth / 2;
    const positionedElements: AssembledElement[] = [];
    
    // Mesmos cálculos do AssemblyView para consistência
    const BASE_SIZE = 80;
    
    const categoryHeights = {
      'cat1': BASE_SIZE * 2.0,        // Piso: 160px
      'cat3': BASE_SIZE * 1.8 * 0.75, // Paredes: ~108px
      'cat2': BASE_SIZE * 0.5 * (4/3), // Colunas: ~53px 
      'cat4': BASE_SIZE * 0.25,        // Portas: 20px
      'cat5': BASE_SIZE * 0.6,         // Janelas: 48px
      'cat6': BASE_SIZE * 1.2 * (3/5), // Telhado: ~58px
    };
    
    const floorY = 500;
    const wallY = floorY - categoryHeights['cat1']/2 - categoryHeights['cat3']/2;
    const columnY = wallY;
    const doorY = wallY + 10;
    const windowY = wallY - 15;
    const roofY = wallY - categoryHeights['cat3']/2 - categoryHeights['cat6']/2 - 5;
    
    const layoutConfig = {
      'cat1': { y: floorY, spacing: 100 },
      'cat3': { y: wallY, spacing: 110 },
      'cat2': { y: columnY, spacing: 150 },
      'cat4': { y: doorY, spacing: 180 },
      'cat5': { y: windowY, spacing: 140 },
      'cat6': { y: roofY, spacing: 90 },
    };
    
    Object.entries(elementsByCategory).forEach(([catId, elements]) => {
      if (elements.length === 0) return;
      
      const config = layoutConfig[catId as keyof typeof layoutConfig];
      const totalWidth = (elements.length - 1) * config.spacing;
      const startX = centerX - totalWidth / 2;
      
      elements.forEach((element, idx) => {
        positionedElements.push({
          ...element,
          position: {
            x: startX + (idx * config.spacing),
            y: config.y,
            z: 0,
          },
        });
      });
    });
    
    return positionedElements;
  };
  
  const assembledElements = getAssembledElements();
  
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-center relative min-h-screen w-full pb-[120px] mx-auto max-w-[900px]"
         style={{ backgroundImage: "linear-gradient(90deg, rgba(255, 141, 40, 0.1) 0%, rgba(255, 141, 40, 0.1) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%))" }}>
      <div className="bg-[#6155f5] h-[199px] shrink-0 w-full" />
      
      <p className="absolute left-[38px] top-[57px] font-['Effra:Bold',sans-serif] text-[40px] text-[#ffcc00] leading-[normal] not-italic">
        Obra
        <br />
        Viva
      </p>
      
      <p className="font-['Inter:Bold',sans-serif] text-[30px] text-black text-center px-[16px]">
        Obra Montada
      </p>
      
      <div className="w-full max-w-[800px] px-[16px]">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-center p-[24px] relative rounded-[12px] bg-white">
          <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.3)] border-solid inset-0 pointer-events-none rounded-[12px]" />
          
          <div className="w-full z-10">
            <div className="flex items-start justify-between mb-[16px] gap-4">
              <div>
                <h3 className="font-['Inter:Bold',sans-serif] text-[20px] text-black mb-[8px]">
                  Visualização da Obra
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-black">
                  Esta é a obra montada e salva. A edição não está disponível.
                </p>
              </div>
            </div>
            
            {/* Diamond mesh canvas - Read only */}
            <div className="diamond-mesh-container pointer-events-none mt-[24px]">
              <DiamondMesh
                elements={selectedElements}
                assembledElements={assembledElements}
                onUpdateElements={() => {}}
                readOnly={true}
                viewMode={viewMode}
              />
            </div>
            
            <div className="bg-gray-50 rounded-[12px] p-[16px] mt-[24px] mb-[24px]">
              <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[16px] text-black mb-[12px]">
                Detalhes da Avaliação
              </h4>
              <div className="space-y-[8px]">
                <p className="font-['Inter:Regular',sans-serif] text-[14px]">
                  <span className="opacity-70">Cargo:</span> {work.roleName}
                </p>
                <p className="font-['Inter:Regular',sans-serif] text-[14px]">
                  <span className="opacity-70">Associado(a):</span> {work.collaboratorName}
                </p>
                <p className="font-['Inter:Regular',sans-serif] text-[14px]">
                  <span className="opacity-70">Líder:</span> {work.leaderName}
                </p>
                <p className="font-['Inter:Regular',sans-serif] text-[14px]">
                  <span className="opacity-70">Data:</span> {new Date(work.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            {/* Observações por Seção */}
            {work.sectionObservations && Object.keys(work.sectionObservations).length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[12px] p-[16px] mt-[24px] mb-[24px] border-2 border-blue-200">
                <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[16px] text-black mb-[12px]">
                  📝 Observações por Seção
                </h4>
                <div className="space-y-[12px]">
                  {categories
                    .filter(cat => work.sectionObservations?.[cat.id])
                    .map(cat => (
                      <div key={cat.id} className="bg-white rounded-lg p-3 border border-blue-100">
                        <h5 className="font-['Inter:Semi_Bold',sans-serif] text-[14px] text-slate-900 mb-2">
                          {cat.name}
                        </h5>
                        <p className="font-['Inter:Regular',sans-serif] text-[13px] text-slate-700 whitespace-pre-wrap">
                          {work.sectionObservations[cat.id]}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white box-border content-stretch flex flex-col gap-[10px] h-[78px] items-center justify-center p-[16px] rounded-tl-[24px] rounded-tr-[24px] w-full border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-50">
        <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
          <button
            onClick={onBack}
            className="px-[16px] py-[12px] rounded-[12px] border border-black"
          >
            <p className="font-['Inter:Regular',sans-serif] text-[18px] text-black">← Voltar</p>
          </button>
          <button
            onClick={handleSharePDF}
            className="bg-white px-[16px] py-[12px] rounded-[12px] border border-black flex items-center gap-[8px]"
          >
            <Download className="size-[18px]" />
            <p className="font-['Inter:Regular',sans-serif] text-[18px] text-black">PDF</p>
          </button>
        </div>
      </div>
    </div>
  );
}