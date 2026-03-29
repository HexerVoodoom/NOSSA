import { ArrowLeft, Sparkles, Info } from 'lucide-react';
import { ElementRenderer } from './ElementRenderer';

interface ElementsLibraryProps {
  onBack: () => void;
}

// Elementos organizados por categoria
const libraryCategories = [
  {
    id: 'fundamento',
    title: 'Base e Propósito',
    subtitle: 'Linha 1 · Piso, Fundação, Alicerce',
    description: 'Fundação e alinhamento com valores organizacionais - representa raízes, origem e propósito profissional',
    colors: ['#3e4e5c', '#516b7a', '#7e9ba8', '#cdbea7', '#e07a5f'],
    elements: [
      { code: 'foundation-1', name: 'Laje de Piso Nível 1', type: 'Fundação Sólida' },
      { code: 'foundation-2', name: 'Laje de Piso Nível 2', type: 'Base Estruturada' },
      { code: 'foundation-3', name: 'Laje de Piso Nível 3', type: 'Fundação Equilibrada' },
      { code: 'foundation-4', name: 'Laje de Piso Nível 4', type: 'Base Elevada' },
      { code: 'foundation-5', name: 'Laje de Piso Nível 5', type: 'Fundação Premium' },
      { code: 'foundation-6', name: 'Bloco de Fundação Nível 1', type: 'Alicerce Inicial' },
      { code: 'foundation-7', name: 'Bloco de Fundação Nível 2', type: 'Base Dupla' },
      { code: 'foundation-8', name: 'Bloco de Fundação Nível 3', type: 'Fundação Tripla' },
      { code: 'foundation-9', name: 'Bloco de Fundação Nível 4', type: 'Alicerce Avançado' },
      { code: 'foundation-10', name: 'Bloco de Fundação Nível 5', type: 'Base Completa' }
    ]
  },
  {
    id: 'sustentacao',
    title: 'Sustentação e Impacto',
    subtitle: 'Linha 2 · Estrutura, Colunas, Vigas',
    description: 'Estrutura e estabilidade - representa precisão técnica, autonomia e base de suporte',
    colors: ['#2e2c6e', '#4b5d8a', '#7b9acc', '#f4b860', '#f28444'],
    elements: [
      { code: 'structure-1', name: 'Coluna Estrutural Nível 1', type: 'Tijolos Escuros Texturizados' },
      { code: 'structure-2', name: 'Coluna Estrutural Nível 2', type: 'Tijolos Cinza Escuro Texturizados' },
      { code: 'structure-3', name: 'Coluna Estrutural Nível 3', type: 'Tijolos Cinza Médio Texturizados' },
      { code: 'structure-4', name: 'Coluna Estrutural Nível 4', type: 'Tijolos Cinza Claro Texturizados' },
      { code: 'structure-5', name: 'Coluna Estrutural Nível 5', type: 'Tijolos Bege Texturizados' },
      { code: 'structure-6', name: 'Coluna Estrutural Nível 1 Lisa', type: 'Tijolos Escuros Lisos' },
      { code: 'structure-7', name: 'Coluna Estrutural Nível 2 Lisa', type: 'Tijolos Cinza Escuro Lisos' },
      { code: 'structure-8', name: 'Coluna Estrutural Nível 3 Lisa', type: 'Tijolos Cinza Claro Lisos' },
      { code: 'structure-9', name: 'Coluna Estrutural Nível 4 Lisa', type: 'Tijolos Bege Lisos' },
      { code: 'structure-10', name: 'Coluna Estrutural Nível 5 Lisa', type: 'Tijolos Terracota Lisos' }
    ]
  },
  {
    id: 'fachada',
    title: 'Corpo de Trabalho',
    subtitle: 'Linha 3 · Paredes, Painéis, Divisórias',
    description: 'Criatividade e organização - representa design, estrutura e personalidade visual',
    colors: ['#1f3b4d', '#247a76', '#48c9b0', '#f5a05a', '#ff4e50'],
    elements: [
      { code: 'wall-1', name: 'Parede de Tijolos Nível 1', type: 'Tijolo Escuro' },
      { code: 'wall-2', name: 'Parede de Tijolos Nível 2', type: 'Tijolo Cinza' },
      { code: 'wall-3', name: 'Parede de Tijolos Nível 3', type: 'Tijolo Azul' },
      { code: 'wall-4', name: 'Parede de Tijolos Nível 4', type: 'Tijolo Bege' },
      { code: 'wall-5', name: 'Parede de Tijolos Nível 5', type: 'Tijolo Laranja' },
      { code: 'wall-6', name: 'Painel Modular Nível 1', type: 'Painel Liso Escuro' },
      { code: 'wall-7', name: 'Painel Modular Nível 2', type: 'Painel Geométrico' },
      { code: 'wall-8', name: 'Painel Modular Nível 3', type: 'Painel Cinza Claro' },
      { code: 'wall-9', name: 'Painel Modular Nível 4', type: 'Painel Bege' },
      { code: 'wall-10', name: 'Painel Modular Nível 5', type: 'Painel Terracota' }
    ]
  },
  {
    id: 'horizonte',
    title: 'Comunicação e Atitude',
    subtitle: 'Linha 4 · Janelas, Aberturas, Rosáceas',
    description: 'Comunicação e atitude - representa abertura, diálogo e expressão visual',
    colors: ['#2c3e50', '#5dade2', '#a9dfbf', '#f9e79f', '#f7dc6f'],
    elements: [
      { code: 'window-1', name: 'Rosácea Nível 1', type: 'Janela Circular Azul' },
      { code: 'window-2', name: 'Rosácea Nível 2', type: 'Janela Circular Escura' },
      { code: 'window-3', name: 'Rosácea Nível 3', type: 'Janela Circular Média' },
      { code: 'window-4', name: 'Rosácea Nível 4', type: 'Janela Circular Clara' },
      { code: 'window-5', name: 'Rosácea Nível 5', type: 'Janela Circular Quente' },
      { code: 'window-6', name: 'Janela Arqueada Nível 1', type: 'Arco com Peitoril Azul' },
      { code: 'window-7', name: 'Janela Arqueada Nível 2', type: 'Arco com Peitoril Cinza' },
      { code: 'window-8', name: 'Janela Arqueada Nível 3', type: 'Arco com Peitoril Médio' },
      { code: 'window-9', name: 'Janela Arqueada Nível 4', type: 'Arco com Peitoril Marrom' },
      { code: 'window-10', name: 'Janela Arqueada Nível 5', type: 'Arco com Peitoril Laranja' }
    ]
  },
  {
    id: 'diferencial',
    title: 'Diferencial e Valor',
    subtitle: 'Linha 5 · Detalhes, Ornamentos, Acabamentos',
    description: 'Diferenciação e valor - representa qualidade, acabamento e elementos únicos',
    colors: ['#34495e', '#3498db', '#52c9a9', '#f39c12', '#e74c3c'],
    elements: [
      { code: 'detail-1', name: 'Janela Moderna Nível 1', type: 'Moldura Escura' },
      { code: 'detail-2', name: 'Janela Moderna Nível 2', type: 'Moldura Cinza' },
      { code: 'detail-3', name: 'Janela Moderna Nível 3', type: 'Moldura Clara' },
      { code: 'detail-4', name: 'Janela Moderna Nível 4', type: 'Moldura Bege' },
      { code: 'detail-5', name: 'Janela Moderna Nível 5', type: 'Moldura Laranja' },
      { code: 'detail-6', name: 'Porta Clássica Nível 1', type: 'Painéis Escuros' },
      { code: 'detail-7', name: 'Porta Clássica Nível 2', type: 'Painéis Verdes' },
      { code: 'detail-8', name: 'Porta Clássica Nível 3', type: 'Painéis Azuis' },
      { code: 'detail-9', name: 'Porta Clássica Nível 4', type: 'Painéis Bege' },
      { code: 'detail-10', name: 'Porta Clássica Nível 5', type: 'Painéis Terracota' }
    ]
  },
  {
    id: 'sintese',
    title: 'Síntese e Futuro',
    subtitle: 'Linha 6 · Telhados, Coberturas, Cúpulas',
    description: 'Síntese e futuro - representa culminação, proteção e visão de longo prazo',
    colors: ['#1a1a2e', '#0f3460', '#16213e', '#e94560', '#f39c12'],
    elements: [
      { code: 'roof-1', name: 'Telhado Triangular Nível 1', type: 'Telhas Escuras Completas' },
      { code: 'roof-2', name: 'Telhado Triangular Nível 2', type: 'Telhas Médio-Escuras Completas' },
      { code: 'roof-3', name: 'Telhado Triangular Nível 3', type: 'Telhas Cinzas Completas' },
      { code: 'roof-4', name: 'Telhado Triangular Nível 4', type: 'Telhas Bege Completas' },
      { code: 'roof-5', name: 'Telhado Triangular Nível 5', type: 'Telhas Laranja Completas' },
      { code: 'roof-6', name: 'Telhado Elevado Nível 1', type: 'Telhas Escuras Elevadas' },
      { code: 'roof-7', name: 'Telhado Elevado Nível 2', type: 'Telhas Médio-Escuras Elevadas' },
      { code: 'roof-8', name: 'Telhado Elevado Nível 3', type: 'Telhas Cinzas Elevadas' },
      { code: 'roof-9', name: 'Telhado Elevado Nível 4', type: 'Telhas Bege Elevadas' },
      { code: 'roof-10', name: 'Telhado Elevado Nível 5', type: 'Telhas Laranja Elevadas' }
    ]
  }
];

// Temperatura de cores
const colorTemperature = [
  { level: 1, label: 'Muito Frio', description: 'Azul escuro / Cinza' },
  { level: 2, label: 'Frio', description: 'Azul médio' },
  { level: 3, label: 'Neutro', description: 'Azul claro / Verde' },
  { level: 4, label: 'Quente', description: 'Bege / Laranja claro' },
  { level: 5, label: 'Muito Quente', description: 'Laranja / Vermelho' }
];

export function ElementsLibrary({ onBack }: ElementsLibraryProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-[#6155f5] to-[#7c3aed] overflow-hidden">
        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#ffcc00]">
                <Sparkles className="w-6 h-6 text-[#6155f5]" />
              </div>
              <div>
                <h1 className="text-white text-3xl">Biblioteca de Elementos</h1>
                <p className="text-white/80 text-sm">21+ elementos únicos organizados em 6 categorias × 5 níveis de temperatura</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Sistema de Temperatura */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-[#6155f5] mt-0.5" />
            <div>
              <h2 className="text-xl text-slate-800 mb-1">Sistema de Temperatura de Cores</h2>
              <p className="text-sm text-slate-600">
                Cada nível de performance tem uma temperatura de cor específica: do frio (azul/cinza) ao quente (laranja/vermelho)
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            {colorTemperature.map(item => (
              <div key={item.level} className="space-y-2">
                <div className="text-center">
                  <div className="text-lg text-slate-800">Nível {item.level}</div>
                  <div className="text-sm text-slate-600">{item.label}</div>
                </div>
                <div className="h-16 rounded-lg bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 flex items-center justify-center">
                  <span className="text-xs text-slate-500">{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categorias e Elementos */}
        {libraryCategories.map((category, idx) => (
          <div key={category.id} className="bg-white rounded-2xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xl text-slate-800">{category.title}</h3>
                <p className="text-sm text-slate-500">{category.subtitle}</p>
              </div>
              <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {category.elements.length} elementos
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">{category.description}</p>

            {/* Paleta de Cores */}
            <div className="mb-4">
              <p className="text-xs text-slate-600 mb-2">Paleta de Cores:</p>
              <div className="flex gap-2">
                {category.colors.map((color, i) => (
                  <div key={i} className="flex-1">
                    <div 
                      className="h-10 rounded-lg border border-slate-300"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-center text-slate-500 mt-1">Nível {i + 1}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid de Elementos */}
            <div className="grid grid-cols-5 gap-4">
              {category.elements.map((element, i) => {
                // Definir aspect ratio baseado no tipo de elemento
                let aspectClass = 'aspect-square';
                
                if (element.code.startsWith('foundation-')) {
                  aspectClass = 'aspect-[1355/233]'; // Proporções do Figma: h-[232.628px] w-[1355.19px]
                } else if (element.code.startsWith('structure-')) {
                  aspectClass = 'aspect-[51/305]'; // Proporções do Figma: h-[305.298px] w-[50.64px] (vertical)
                } else if (element.code.startsWith('wall-')) {
                  aspectClass = 'aspect-[1089/575]'; // Proporções do Figma: h-[575px] w-[1089px]
                } else if (element.code.startsWith('window-')) {
                  aspectClass = 'aspect-square'; // Janelas circulares e arqueadas variam, mas são compactas
                } else if (element.code.startsWith('detail-')) {
                  aspectClass = 'aspect-[118/251]'; // Proporções do Figma: h-[251.336px] w-[118.149px] (vertical)
                } else if (element.code.startsWith('roof-')) {
                  aspectClass = 'aspect-[1423/430]'; // Proporções do Figma: h-[429.983px] w-[1422.56px]
                }
                
                return (
                  <div key={i} className="relative group">
                    {element.isBonus && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                          <Sparkles className="w-3 h-3" />
                          BÔNUS
                        </div>
                      </div>
                    )}
                    <div className="border-2 border-slate-200 rounded-lg p-4 hover:border-[#6155f5] transition-all group-hover:shadow-lg">
                      <div className={`bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 mb-3 w-full ${aspectClass} flex items-center justify-center overflow-hidden`}>
                        <ElementRenderer
                          code={element.code}
                          color={category.colors[2]}
                          mode="architectural"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="text-xs text-slate-700 text-center mb-1">{element.name}</h4>
                      <p className="text-[10px] text-slate-500 text-center mb-1">{element.type}</p>
                      <code className="text-[10px] text-slate-400 block text-center truncate">{element.code}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}