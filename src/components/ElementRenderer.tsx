import { getCustomElement, hasCustomElement } from '../lib/customElements';

interface ElementRendererProps {
  code: string;
  color: string;
  mode?: 'geometric' | 'architectural';
  className?: string;
}

// Elementos padrão geométricos por tipo (fallback quando não há elemento incorporado)
const getDefaultElement = (code: string, color: string) => {
  // Foundation (Piso) - Retângulos horizontais
  if (code.startsWith('foundation-')) {
    return (
      <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect x="5" y="5" width="110" height="30" fill={color} stroke="white" strokeWidth="2" rx="4" />
      </svg>
    );
  }
  
  // Structure (Coluna) - Retângulos verticais
  if (code.startsWith('structure-')) {
    return (
      <svg viewBox="0 0 40 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect x="5" y="5" width="30" height="110" fill={color} stroke="white" strokeWidth="2" rx="4" />
      </svg>
    );
  }
  
  // Wall (Parede) - Retângulos horizontais altos
  if (code.startsWith('wall-')) {
    return (
      <svg viewBox="0 0 120 60" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect x="5" y="5" width="110" height="50" fill={color} stroke="white" strokeWidth="2" rx="4" />
      </svg>
    );
  }
  
  // Door (Porta) - Retângulos verticais largos
  if (code.startsWith('door-')) {
    return (
      <svg viewBox="0 0 60 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect x="5" y="5" width="50" height="110" fill={color} stroke="white" strokeWidth="2" rx="4" />
      </svg>
    );
  }
  
  // Window (Janela) - Círculos
  if (code.startsWith('window-')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <circle cx="50" cy="50" r="40" fill={color} stroke="white" strokeWidth="2" />
      </svg>
    );
  }
  
  // Roof (Telhado) - Triângulos
  if (code.startsWith('roof-')) {
    return (
      <svg viewBox="0 0 120 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <polygon points="60,10 110,70 10,70" fill={color} stroke="white" strokeWidth="2" />
      </svg>
    );
  }
  
  // Fallback genérico
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <rect x="10" y="10" width="80" height="80" fill={color} stroke="white" strokeWidth="2" rx="8" />
    </svg>
  );
};

export function ElementRenderer({ code, color, mode = 'architectural', className = '' }: ElementRendererProps) {
  // 1. Prioridade máxima: Elementos incorporados no código
  const builtInElement = getCustomElement(code);
  if (builtInElement) {
    return (
      <div className={`${className} flex items-center justify-center size-full`}>
        <div 
          dangerouslySetInnerHTML={{ __html: builtInElement.svg }}
          className="w-full h-full flex items-center justify-center"
          style={{ color }}
        />
      </div>
    );
  }

  // 2. Fallback: Elemento geométrico padrão
  const element = getDefaultElement(code, color);
  
  return <div className={`${className} flex items-center justify-center size-full`}>{element}</div>;
}
