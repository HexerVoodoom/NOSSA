// Utilitário para processar SVGs e adicionar stroke branco

import DOMPurify from 'dompurify';

// Remove url(...) que aponte para fora do próprio documento.
//
// Medido com o DOMPurify real: sem ALLOWED_URI_REGEXP, `mask`, `filter`,
// `clip-path` e `fill` aceitam `url(https://...)` — não estão na lista de
// URI_SAFE_ATTRIBUTES nem são barrados por FORBID_ATTR. Os navegadores atuais
// recusam buscar documento externo para esses casos, mas isso é política do
// navegador, não nosso controle. A biblioteca só usa `url(#fragmento)`, então
// exigir o `#` não custa nada e fecha o canal de beacon.
const URL_REF_ATTRS = ['mask', 'filter', 'clip-path', 'fill', 'stroke'];
const EXTERNAL_URL_REF = /url\(\s*['"]?\s*(?!#)/i;

DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (!(node instanceof Element)) return;
  URL_REF_ATTRS.forEach(attr => {
    const value = node.getAttribute(attr);
    if (value && EXTERNAL_URL_REF.test(value)) node.removeAttribute(attr);
  });
});

// Atributos de evento (on*) e vetores de script nunca são permitidos.
// O perfil SVG do DOMPurify preserva formas, paths, fills, gradientes e transforms.
export function sanitizeSVG(svgString: string): string {
  if (!svgString) return '';
  return DOMPurify.sanitize(svgString, {
    USE_PROFILES: { svg: true, svgFilters: true },
    // Defesa em profundidade: bloqueia script/handlers e conteúdo HTML aninhado.
    // `style` entra aqui porque o DOMPurify não interpreta CSS: um
    // `<style>@import url(...)</style>` ou `style="background-image:url(...)"`
    // passava inteiro e servia de beacon. Nenhum elemento da biblioteca usa CSS
    // (são todos atributos de apresentação), então barrar não custa nada.
    FORBID_TAGS: ['script', 'foreignObject', 'iframe', 'embed', 'object', 'a', 'set', 'animate', 'style'],
    // NÃO usar ALLOWED_URI_REGEXP aqui. O DOMPurify aplica esse regex a TODO
    // atributo que não é reconhecido como URI-safe: com /^#/ ele descartava
    // width, height, viewBox, x, y, d, transform, stroke... e só sobrava
    // fill="#rrggbb" (que por acaso começa com '#'). O SVG continuava não-vazio,
    // então nada estourava — jsdom não pinta e o teste passava — mas no navegador
    // TODO elemento da obra virava um <svg> vazio: a "Obra Montada" saía em branco.
    // Referência externa é barrada por FORBID_ATTR + o hook acima, sem mutilar
    // a geometria.
    FORBID_ATTR: ['href', 'xlink:href', 'src', 'action', 'formaction', 'style'],
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
