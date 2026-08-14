// Utilitário para processar SVGs e adicionar stroke branco

import DOMPurify from 'dompurify';

// Remove qualquer atributo que referencie algo fora do próprio documento.
//
// Medido com o DOMPurify real: sem ALLOWED_URI_REGEXP, atributos de referência
// (`mask`, `filter`, `clip-path`, `fill`, `stroke`, `marker-start/mid/end`)
// aceitam `url(https://...)` — não estão em URI_SAFE_ATTRIBUTES nem em
// FORBID_ATTR. Navegadores atuais recusam buscar documento externo aí, mas isso
// é política do navegador, não nosso controle.
//
// A primeira versão disto listava os atributos a inspecionar, e a lista saiu
// incompleta: `marker-start/mid/end` ficaram de fora e continuavam abertos.
// Enumerar é frágil — a allowlist do DOMPurify muda entre versões. Verificamos
// TODOS os atributos e falhamos fechado.
const CSS_HEX_ESCAPE = /\\([0-9a-f]{1,6})\s?/gi;
const EXTERNAL_REF = /url\(\s*['"]?\s*(?!#)|:\/\//i;

// `\75 rl(...)` é um url-token válido em CSS: o navegador desescapa antes de
// interpretar, então a checagem também precisa desescapar antes de comparar.
function decodeCssEscapes(value: string): string {
  return value.replace(CSS_HEX_ESCAPE, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (!(node instanceof Element)) return;
  // Cópia do array: remover durante a iteração encurta a NamedNodeMap viva.
  Array.from(node.attributes).forEach(attr => {
    if (EXTERNAL_REF.test(decodeCssEscapes(attr.value))) node.removeAttribute(attr.name);
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
