import { describe, it, expect } from 'vitest';
import { sanitizeSVG } from '../svgProcessor';
import { customElements } from '../customElements';

// REGRESSÃO — bug encontrado só ao rodar o app num navegador de verdade.
//
// `sanitizeSVG` usava `ALLOWED_URI_REGEXP: /^#/`. O DOMPurify aplica esse regex
// a TODO atributo que não é reconhecido como URI-safe, então ele apagava
// width, height, viewBox, x, y, d, transform, stroke e stroke-width — sobrava
// apenas `fill="#rrggbb"`, que por acaso começa com '#'.
//
// O SVG resultante continuava não-vazio, então nenhum teste em jsdom acusava
// nada (jsdom não faz layout nem pinta). No Chromium, porém, cada elemento da
// obra virava um `<svg>` sem geometria: a tela "Obra Montada" saía COMPLETAMENTE
// EM BRANCO, com 51 elementos no DOM e zero pixels desenhados.
const FIGMA_FLOOR = customElements['foundation-1'].svg;

describe('sanitizeSVG — preservação de geometria (regressão)', () => {
  it('preserva os atributos de geometria do <svg> raiz', () => {
    const out = sanitizeSVG(FIGMA_FLOOR);
    expect(out).toContain('width="1874"');
    expect(out).toContain('height="250"');
    expect(out).toContain('viewBox="0 0 1874 250"');
  });

  it('preserva geometria, transform e stroke das formas filhas', () => {
    const out = sanitizeSVG(FIGMA_FLOOR);
    expect(out).toContain('x="1874"');
    expect(out).toContain('transform="rotate(90 1874 0)"');
    expect(out).toContain('stroke="white"');
    expect(out).toContain('stroke-width="2"');
    expect(out).toContain('fill="#3E4E5B"');
  });

  it('preserva o atributo "d" de paths', () => {
    const out = sanitizeSVG('<svg viewBox="0 0 10 10"><path d="M0 0 L10 10 Z" fill="red"/></svg>');
    expect(out).toContain('d="M0 0 L10 10 Z"');
    expect(out).toContain('viewBox="0 0 10 10"');
  });

  it('todo elemento da biblioteca mantém geometria após sanitizar', () => {
    const semGeometria = Object.entries(customElements).filter(([, el]) => {
      const out = sanitizeSVG(el.svg);
      // precisa sobrar pelo menos uma referência de geometria desenhável
      return !/viewBox=|width=|\bd="|points=|\br="/.test(out);
    });
    expect(semGeometria.map(([id]) => id)).toEqual([]);
  });

  it('continua bloqueando script, handlers e referências externas', () => {
    const malicious =
      '<svg width="10" height="10" onload="alert(1)">' +
      '<script>alert(2)</script>' +
      '<image href="https://evil.example/x.png" />' +
      '<a href="https://evil.example"><rect width="5" height="5" onclick="alert(3)"/></a>' +
      '</svg>';
    const out = sanitizeSVG(malicious);
    expect(out).not.toContain('script');
    expect(out).not.toContain('onload');
    expect(out).not.toContain('onclick');
    expect(out).not.toContain('evil.example');
    expect(out).not.toContain('href');
    // ...sem sacrificar a geometria legítima
    expect(out).toContain('width="10"');
  });
});
