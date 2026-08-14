// Utilitário para processar SVGs e adicionar stroke branco

import DOMPurify from 'dompurify';

// Atributos de evento (on*) e vetores de script nunca são permitidos.
// O perfil SVG do DOMPurify preserva formas, paths, fills, gradientes e transforms.
export function sanitizeSVG(svgString: string): string {
  if (!svgString) return '';
  return DOMPurify.sanitize(svgString, {
    USE_PROFILES: { svg: true, svgFilters: true },
    // Defesa em profundidade: bloqueia script/handlers e conteúdo HTML aninhado
    FORBID_TAGS: ['script', 'foreignObject', 'iframe', 'embed', 'object', 'a', 'set', 'animate'],
    // NÃO usar ALLOWED_URI_REGEXP aqui. O DOMPurify aplica esse regex a TODO
    // atributo que não é reconhecido como URI-safe: com /^#/ ele descartava
    // width, height, viewBox, x, y, d, transform, stroke... e só sobrava
    // fill="#rrggbb" (que por acaso começa com '#'). O SVG continuava não-vazio,
    // então nada estourava — jsdom não pinta e o teste passava — mas no navegador
    // TODO elemento da obra virava um <svg> vazio: a "Obra Montada" saía em branco.
    // O objetivo (impedir <use>/<image> apontando para fora) é atingido barrando
    // os atributos de referência externa, sem mutilar a geometria.
    FORBID_ATTR: ['href', 'xlink:href', 'src', 'action', 'formaction'],
  });
}

export function addStrokeToSVG(svgString: string): string {
  try {
    // Sanitiza ANTES de qualquer parsing/serialização
    const safeSvgString = sanitizeSVG(svgString);

    // Criar um parser temporário
    const parser = new DOMParser();
    const doc = parser.parseFromString(safeSvgString, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (!svgElement) {
      return '';
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

    // Retornar SVG modificado como string (já sanitizado)
    return new XMLSerializer().serializeToString(svgElement);
  } catch (e) {
    console.error('Erro ao processar SVG:', e);
    // Fail-closed: em caso de erro não devolve o conteúdo bruto
    return '';
  }
}

export function processSVGForUpload(svgString: string): string {
  // Sanitiza, adiciona stroke branco e otimiza o SVG
  return addStrokeToSVG(svgString);
}
