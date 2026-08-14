import { customElements } from './customElements';

// FONTE ÚNICA do mapa bloco -> elementos.
//
// Esta tabela já esteve duplicada em CategoryQuestionFlow, AssemblyViewReadOnly,
// ConstructionPreview e DiamondMesh. As cópias divergiram: uma delas apontava
// 'bloco4' para janelas (o correto é porta) e 'bloco5' para 'detail-*', um
// prefixo que nunca existiu em customElements — o elemento caía no quadrado
// genérico do fallback e ninguém percebia. Manter uma cópia só é o que impede
// isso de voltar; o teste em __tests__/categoryShapes.test.ts garante que todo
// id daqui existe de verdade.
//
// Ordem conforme PLANTA_BAIXA.md: 1 piso · 2 coluna · 3 parede · 4 porta ·
// 5 janela · 6 telhado.
export const categoryShapes: Record<string, string[]> = {
  bloco1: ['foundation-1', 'foundation-2', 'foundation-3', 'foundation-4', 'foundation-5', 'foundation-6', 'foundation-7', 'foundation-8', 'foundation-9', 'foundation-10'],
  bloco2: ['structure-1', 'structure-2', 'structure-3', 'structure-4', 'structure-5', 'structure-6', 'structure-7', 'structure-8', 'structure-9', 'structure-10'],
  bloco3: ['wall-1', 'wall-2', 'wall-3', 'wall-4', 'wall-5', 'wall-6', 'wall-7', 'wall-8', 'wall-9', 'wall-10'],
  bloco4: ['door-1', 'door-2', 'door-3', 'door-4', 'door-5', 'door-6', 'door-7', 'door-8', 'door-9', 'door-10'],
  bloco5: ['window-1', 'window-2', 'window-3', 'window-4', 'window-5', 'window-6', 'window-7', 'window-8', 'window-9', 'window-10'],
  bloco6: ['roof-1', 'roof-2', 'roof-3', 'roof-4', 'roof-5', 'roof-6', 'roof-7', 'roof-8', 'roof-9', 'roof-10'],
};

export const DEFAULT_CATEGORY_ID = 'bloco1';

// Aceita ids atuais ('bloco3'), legados ('cat3') e ausentes.
// Devolve null quando o id não corresponde a bloco nenhum, para que a chamada
// decida o que fazer. Cair silenciosamente em 'bloco1' desenha uma atividade
// como se fosse fundação — errado com cara de certo.
export function resolveCategoryId(categoryId?: string | null): string | null {
  if (!categoryId) return null;
  const legacy = /^cat(\d+)$/.exec(categoryId);
  const normalized = legacy ? `bloco${legacy[1]}` : categoryId;
  return categoryShapes[normalized] ? normalized : null;
}

// Versão que garante um bloco válido, para quem precisa desenhar algo.
export function normalizeCategoryId(categoryId?: string | null): string {
  return resolveCategoryId(categoryId) ?? DEFAULT_CATEGORY_ID;
}

// `selectedImageIndex` é o índice DIRETO em categoryShapes[bloco] (0..9),
// derivado da nota (nota - 1). Já houve consumidor dividindo por 5, o que
// devolvia sempre o primeiro elemento independentemente da nota.
export function getShapeForIndex(categoryId: string | null | undefined, index: number | null | undefined): string {
  const block = normalizeCategoryId(categoryId);
  const shapes = categoryShapes[block] ?? [];
  if (index === null || index === undefined || !Number.isFinite(index)) return '';
  return shapes[Math.max(0, Math.trunc(index))] ?? '';
}

// Todo id referenciado acima precisa existir em customElements.
export function findUnknownShapeIds(): string[] {
  return Object.values(categoryShapes)
    .flat()
    .filter(id => !(id in customElements));
}
