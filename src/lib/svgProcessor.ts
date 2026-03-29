// Utilitário para processar SVGs e adicionar stroke branco

export function addStrokeToSVG(svgString: string): string {
  try {
    // Criar um parser temporário
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    
    if (!svgElement) {
      return svgString;
    }
    
    // Adicionar stroke branco a todos os elementos de forma
    const shapes = svgElement.querySelectorAll('path, rect, circle, ellipse, polygon, polyline, line');
    
    shapes.forEach(shape => {
      // Se já não tiver stroke definido, adiciona o branco
      if (!shape.getAttribute('stroke')) {
        shape.setAttribute('stroke', 'white');
      }
      
      // Se não tiver stroke-width, adiciona
      if (!shape.getAttribute('stroke-width')) {
        shape.setAttribute('stroke-width', '2');
      }
    });
    
    // Retornar SVG modificado como string
    return new XMLSerializer().serializeToString(svgElement);
  } catch (e) {
    console.error('Erro ao processar SVG:', e);
    return svgString;
  }
}

export function processSVGForUpload(svgString: string): string {
  // Adiciona stroke branco e otimiza o SVG
  return addStrokeToSVG(svgString);
}
