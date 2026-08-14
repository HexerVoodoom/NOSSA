import { useState } from 'react';
import { SavedWork, AssembledElement, QuestionResponse } from '../types';
import { DiamondMesh } from './DiamondMesh';
import { Download } from 'lucide-react';
import { getAllQuestionsFromCompetencies } from '../lib/competencyHelpers';
import { storage } from '../lib/storage';
import { newBlocks as categories } from '../lib/newBlocks';
import { categoryShapes, normalizeCategoryId, getShapeForIndex } from '../lib/categoryShapes';

// Logos
import imgLogoTortola from "figma:asset/0049d96aabf7ea4e2a663d5f83ebd360cb225dfd.png";
import imgLogoNOSSA from "figma:asset/d08376795895de90a85e101961d369a69979dcc3.png";

type ViewMode = 'geometric' | 'architectural';

interface AssemblyViewReadOnlyProps {
  work: SavedWork;
  onBack: () => void;
}


const categoryColors: Record<string, string[]> = {
  'bloco1': ['#3e4e5c', '#516b7a', '#7e9ba8', '#cdbea7', '#e07a5f'],
  'bloco2': ['#2e2c6e', '#4b5d8a', '#7b9acc', '#f4b860', '#f28444'],
  'bloco3': ['#1f3b4d', '#247a76', '#48c9b0', '#f5a05a', '#ff4e50'],
  'bloco4': ['#2c3e50', '#5dade2', '#a9dfbf', '#f9e79f', '#f7dc6f'],
  'bloco5': ['#34495e', '#3498db', '#52c9a9', '#f39c12', '#e74c3c'],
  'bloco6': ['#1a1a2e', '#0f3460', '#16213e', '#e94560', '#f39c12'],
};


// Datas inválidas (registros importados) virariam "Invalid Date" na tela e no PDF
export function formatDate(value?: string | Date | null): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
}



// Converte cor hex (#rgb ou #rrggbb) em canais 0-255. Qualquer valor inválido
// cairia como NaN em setDrawColor/setTextColor e corromperia o PDF.
export function hexToRgb(hex?: string | null): { r: number; g: number; b: number } {
  const fallback = { r: 97, g: 85, b: 245 }; // #6155f5
  if (typeof hex !== 'string') return fallback;
  const value = hex.trim().replace(/^#/, '');
  const full = value.length === 3
    ? value.split('').map(c => c + c).join('')
    : value;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return fallback;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function AssemblyViewReadOnly({ work, onBack }: AssemblyViewReadOnlyProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('architectural');

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
      const responsesByCategory: Record<string, QuestionResponse[]> = {};
      responses.forEach(response => {
        const question = findQuestion(response.questionId);
        // Normaliza para nunca perder respostas em um bucket inexistente
        const categoryId = normalizeCategoryId(question?.categoryId);

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
        const categoryResponses = responsesByCategory[category.id] || [];
        const { r, g, b } = hexToRgb(category.color);

        for (let i = 0; i < categoryResponses.length; i++) {
          const response = categoryResponses[i];
          const question = findQuestion(response.questionId);

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
          pdf.text(category.name || '', pageWidth / 2, headerY + 18, { align: 'center' });

          // Evaluation info
          pdf.setFontSize(11);
          pdf.setTextColor(100, 116, 139); // slate-500
          pdf.text(`${work.collaboratorName || '—'} | ${work.leaderName || '—'}`, pageWidth / 2, headerY + 28, { align: 'center' });
          
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
          // splitTextToSize lança se receber undefined (pergunta legada/importada)
          const questionLines = pdf.splitTextToSize(question.text || 'Pergunta sem texto', pageWidth - 50);
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
          const keywords = (Array.isArray(response.keywords) ? response.keywords : [])
            .filter(k => typeof k === 'string' && k.trim() !== '')
            .slice(0, 3); // a moldura comporta 3 linhas; evita transbordo
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
          pdf.text(`Cargo: ${work.roleName || '—'}`, 20, footerY);
          
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
          pdf.text(formatDate(work.createdAt), pageWidth - 20, footerY, { align: 'right' });
        }
        
        // Adicionar página de observações ao final da seção, se houver
        if (work.sectionObservations && work.sectionObservations[category.id]) {
          // Só adiciona página se já houver conteúdo (senão sobra uma folha em branco)
          if (!isFirstPage) {
            pdf.addPage();
          }
          isFirstPage = false;

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
          pdf.text(category.name || '', pageWidth / 2, obsHeaderY + 18, { align: 'center' });
          
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
          const observationText = String(work.sectionObservations[category.id] ?? '');
          const observationLines: string[] = pdf.splitTextToSize(observationText, pageWidth - 50);
          let yPos = contentY + 15;
          let truncated = false;

          // Render text with line breaks support
          observationLines.forEach((line: string) => {
            if (truncated) return;
            if (yPos > contentY + 160) {
              // Texto longo demais: avisa uma única vez e para de desenhar
              truncated = true;
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
          pdf.text(`Cargo: ${work.roleName || '—'}`, 20, footerY);
          
          // Center: "Observações"
          pdf.text('Observações', pageWidth / 2, footerY, { align: 'center' });
          
          // Right: Date
          pdf.text(formatDate(work.createdAt), pageWidth - 20, footerY, { align: 'right' });
        }
      }
      
      // Nenhuma página gerada: avisa em vez de baixar um PDF em branco
      if (isFirstPage) {
        alert('Não há respostas para gerar o PDF.');
        return;
      }

      // Save PDF
      // Nome de arquivo saneado (nome vazio ou com / quebrava o download)
      const safeName = (work.collaboratorName || 'colaborador')
        .normalize('NFD')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'colaborador';
      pdf.save(`obra-viva-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    }
  };
  
  // Processar elementos selecionados das responses
  const roles = storage.getRoles();
  const role = roles.find(r => r.id === work.roleId);
  const allQuestions = getAllQuestionsFromCompetencies();

  // Registros importados/legados podem não trazer responses
  const responses: QuestionResponse[] = Array.isArray(work.responses) ? work.responses : [];

  const findQuestion = (questionId: string) =>
    allQuestions.find(q => q.id === questionId) ||
    (Array.isArray(role?.customQuestions)
      ? role!.customQuestions!.find(q => q.id === questionId)
      : undefined);

  const selectedElements = responses
    .filter(r => r.selectedImageIndex !== undefined && r.selectedImageIndex !== null)
    .map((r, idx) => {
      const question = findQuestion(r.questionId);
      const categoryId = normalizeCategoryId(question?.categoryId);

      const shapes = categoryShapes[categoryId];
      const colors = categoryColors[categoryId];

      // A nota é a fonte da verdade da forma; `selectedElementId` gravado NÃO é
      // confiável. Em defaultLibrary.json há respostas com nota >= 2 gravadas
      // junto de um id terminado em '-1' (a forma da nota 1): confiar no valor
      // salvo faz avaliações antigas desenharem a obra errada. O caminho de
      // escrita já foi corrigido; aqui derivamos de novo na leitura.
      const rating = Number.isFinite(r.rating) ? Math.min(Math.max(Math.round(r.rating), 1), 5) : 1;
      const colorIndex = rating - 1;
      // getShapeForIndex devolve '' para categoria sem bloco real: nesse caso
      // caímos no primeiro elemento do bloco normalizado, como antes.
      const shapeCode = getShapeForIndex(categoryId, colorIndex) || shapes[0];
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
    
    // Gerar montagem automática para obras antigas.
    // Bucket criado sob demanda: acessar uma chave fixa quebrava para categorias
    // fora de 'cat1'..'cat6' (as reais são 'bloco1'..'bloco6').
    const elementsByCategory: Record<string, AssembledElement[]> = {};

    selectedElements.forEach((element) => {
      const catId = normalizeCategoryId(element.categoryId);
      if (!elementsByCategory[catId]) {
        elementsByCategory[catId] = [];
      }
      elementsByCategory[catId].push({
        ...element,
        categoryId: catId,
        position: { x: 0, y: 0, z: 0 },
        rotation: 0,
        scale: 1,
      });
    });

    const canvasWidth = 1000;
    const centerX = canvasWidth / 2;
    const positionedElements: AssembledElement[] = [];
    
    // Mesmos cálculos do AssemblyView para consistência
    const BASE_SIZE = 80;
    
    const categoryHeights: Record<string, number> = {
      'bloco1': BASE_SIZE * 2.0,        // Piso: 160px
      'bloco3': BASE_SIZE * 1.8 * 0.75, // Paredes: ~108px
      'bloco2': BASE_SIZE * 0.5 * (4/3), // Colunas: ~53px
      'bloco4': BASE_SIZE * 0.25,        // Portas: 20px
      'bloco5': BASE_SIZE * 0.6,         // Janelas: 48px
      'bloco6': BASE_SIZE * 1.2 * (3/5), // Telhado: ~58px
    };

    const floorY = 500;
    const wallY = floorY - categoryHeights['bloco1']/2 - categoryHeights['bloco3']/2;
    const columnY = wallY;
    const doorY = wallY + 10;
    const windowY = wallY - 15;
    const roofY = wallY - categoryHeights['bloco3']/2 - categoryHeights['bloco6']/2 - 5;

    const layoutConfig: Record<string, { y: number; spacing: number }> = {
      'bloco1': { y: floorY, spacing: 100 },
      'bloco3': { y: wallY, spacing: 110 },
      'bloco2': { y: columnY, spacing: 150 },
      'bloco4': { y: doorY, spacing: 180 },
      'bloco5': { y: windowY, spacing: 140 },
      'bloco6': { y: roofY, spacing: 90 },
    };

    Object.entries(elementsByCategory).forEach(([catId, elements]) => {
      if (elements.length === 0) return;

      // Categoria desconhecida cairia em `config` undefined (TypeError)
      const config = layoutConfig[catId] || { y: floorY, spacing: 100 };
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
                  <span className="opacity-70">Data:</span> {formatDate(work.createdAt)}
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