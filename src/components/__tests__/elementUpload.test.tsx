import { describe, it, expect } from 'vitest';
import { sanitizeUploadedElements } from '../ElementUploadView';
import { CUSTOM_ELEMENTS_KEY } from '../../lib/storage';

// REGRESSÃO: handleImport gravava o JSON importado direto no localStorage, sem
// nenhuma checagem de forma e sem passar pelo saneamento de SVG. A chave é
// compartilhada, é exportada e entra nos backups: lixo gravado aqui viaja.
describe('sanitizeUploadedElements — import de elementos customizados', () => {
  it('descarta payloads que não são um mapa de elementos', () => {
    expect(sanitizeUploadedElements([1, 2, 3])).toEqual({});
    expect(sanitizeUploadedElements(42)).toEqual({});
    expect(sanitizeUploadedElements(null)).toEqual({});
    expect(sanitizeUploadedElements('<svg/>')).toEqual({});
  });

  it('descarta entradas cujo svg não é uma string', () => {
    expect(sanitizeUploadedElements({ 'foundation-1': 42 })).toEqual({});
    expect(sanitizeUploadedElements({ 'foundation-1': { id: 'x' } })).toEqual({});
    expect(sanitizeUploadedElements({ 'foundation-1': { svg: null } })).toEqual({});
  });

  it('sanea o SVG importado em vez de confiar no saneamento da renderização', () => {
    const out = sanitizeUploadedElements({
      'foundation-1': {
        id: 'foundation-1',
        name: 'mal.svg',
        svg: '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect width="10" height="10" onload="alert(2)"/></svg>',
      },
    });

    const svg = out['foundation-1'].svg;
    expect(svg).toContain('<rect');
    expect(svg).not.toContain('<script');
    expect(svg).not.toContain('onload');
  });

  it('reancora a chave no id e aceita nome ausente', () => {
    const out = sanitizeUploadedElements({
      'roof-2': { id: 'outro-id', svg: '<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>' },
    });
    expect(out['roof-2'].id).toBe('roof-2');
    expect(out['roof-2'].name).toBe('roof-2');
  });

  it('a chave de armazenamento não muda (backup/export dependem dela)', () => {
    expect(CUSTOM_ELEMENTS_KEY).toBe('obra-viva-custom-elements');
  });
});
