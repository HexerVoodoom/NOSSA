import { test, expect, Page } from '@playwright/test';

// Caminho crítico ponta a ponta, no Chromium de verdade.
//
// Por que isto existe: a suíte de unidade roda em jsdom, que NÃO faz layout nem
// pinta. Um `<svg>` sem width/height/viewBox continua sendo um nó válido no
// jsdom, então a suíte passava em verde enquanto a tela "Obra Montada" saía
// COMPLETAMENTE EM BRANCO no navegador. Só um browser real pega isso.
//
// Rodar com:  npx playwright test
// (deliberadamente FORA do CI — um e2e instável é pior que nenhum)

const OPTION = '[role="listbox"] [role="option"], [role="listbox"] button';

type Failures = { consoleErrors: string[]; pageErrors: string[] };

function captureFailures(page: Page): Failures {
  const f: Failures = { consoleErrors: [], pageErrors: [] };
  page.on('console', m => { if (m.type() === 'error') f.consoleErrors.push(m.text()); });
  page.on('pageerror', e => f.pageErrors.push(`${e.name}: ${e.message}`));
  return f;
}

async function pickOption(page: Page, triggerText: string, optionText: string) {
  await page.locator('button', { hasText: triggerText }).first().click();
  await page.locator(OPTION).filter({ hasText: optionText }).first().click();
}

test.describe('Obra Viva — caminho crítico', () => {
  test('avaliar, salvar, reabrir e ver a obra montada', async ({ page }) => {
    const failures = captureFailures(page);

    // 1. Home
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Arquitetura de Carreira' })).toBeVisible();

    // 2. Nova avaliação: líder, cargo, colaborador
    await page.locator('button', { hasText: 'Nova Avaliação' }).first().click();
    await pickOption(page, 'Selecione um líder...', 'Luís Tortola');
    await pickOption(page, 'Selecione o cargo...', 'Coordenador(a) de Projetos');
    await pickOption(page, 'Selecione a pessoa...', 'Camila Coutinho');

    // 3. Metodologia tradicional (escala Likert 1..5)
    // NOTA a11y: os cards de metodologia são <div> com onClick — não são
    // <button>, não recebem foco nem funcionam pelo teclado. Por isso clicamos
    // no título em vez de usar getByRole('button').
    await page.getByRole('heading', { name: 'Tradicional', exact: true }).click();
    await expect(page.locator('[role="radiogroup"]').first()).toBeVisible();

    // 4. Responder todas as seções com notas DIFERENTES (1, 3, 5)
    const RATINGS = [1, 3, 5];
    let sections = 0;
    for (;;) {
      sections++;
      expect(sections, 'número de seções fora do esperado').toBeLessThanOrEqual(10);
      await expect(page.locator('[role="radiogroup"]').first()).toBeVisible();
      const groups = page.locator('[role="radiogroup"]');
      const total = await groups.count();
      expect(total, 'seção sem perguntas').toBeGreaterThan(0);
      for (let i = 0; i < total; i++) {
        await groups.nth(i).locator('[role="radio"]').nth(RATINGS[i % 3] - 1).click();
      }
      await page.locator('#section-observations').fill(`Observação da seção ${sections}.`);

      const isLast = (await page.locator('button', { hasText: 'Finalizar Avaliação' }).count()) > 0;
      await page.locator('button', { hasText: isLast ? 'Finalizar Avaliação' : 'Próxima Seção' }).first().click();
      if (isLast) break;
    }
    expect(sections).toBe(6);

    // 5. Resumo
    await expect(page.getByRole('heading', { name: 'Resumo da Avaliação' })).toBeVisible();
    await expect(page.getByText('Camila Coutinho')).toBeVisible();
    await expect(page.getByText('Observação da seção 1.')).toBeVisible();

    // 6. Salvar -> galeria
    await page.locator('button', { hasText: /^Salvar/ }).first().click();
    await expect(page.getByRole('heading', { name: 'Avaliações Salvas' })).toBeVisible();

    // Notas diferentes precisam gerar ELEMENTOS diferentes (bug que já foi ao ar:
    // nota 5 gravava o mesmo elemento da nota 1).
    const elementIds: string[] = await page.evaluate(() => {
      const works = JSON.parse(localStorage.getItem('obra-viva-evaluations') || '[]');
      const last = works[works.length - 1];
      return [...new Set(last.responses.map((r: { selectedElementId: string }) => r.selectedElementId))] as string[];
    });
    expect(elementIds).toEqual(expect.arrayContaining(['foundation-1', 'foundation-3', 'foundation-5']));
    // Seis blocos -> seis famílias de elementos, nunca uma só.
    const families = new Set(elementIds.map(id => id.split('-')[0]));
    expect(families).toEqual(new Set(['foundation', 'structure', 'wall', 'door', 'window', 'roof']));

    // 7. Abrir a obra salva
    await page.locator('text=Camila Couti').first().click();
    await expect(page.getByRole('heading', { name: 'Avaliação Salva' })).toBeVisible();

    // 8. Obra montada (somente leitura)
    await page.locator('button', { hasText: 'Ver Obra Montada' }).click();
    await expect(page.getByText('Visualização da Obra')).toBeVisible();
    await expect(page.getByText('Nenhum elemento foi selecionado')).toHaveCount(0);

    // --- O que só um navegador de verdade consegue verificar ---
    await expect(page.locator('[data-obra-element]').first()).toBeVisible();
    // dá tempo ao efeito de centralização/fit (150ms) + transição
    await page.waitForTimeout(600);

    const geometry = await page.evaluate(() => {
      const canvas = document.querySelector('.diamond-mesh-container div.relative') as HTMLElement;
      const box = canvas.getBoundingClientRect();
      const nodes = [...canvas.querySelectorAll<HTMLElement>('[data-obra-element]')];
      return {
        canvas: { w: box.width, h: box.height },
        items: nodes.map(n => {
          const r = n.getBoundingClientRect();
          const svg = n.querySelector('svg');
          return {
            code: n.dataset.obraElement || '',
            left: r.left - box.left,
            top: r.top - box.top,
            w: r.width,
            h: r.height,
            z: n.style.zIndex,
            hasSvg: !!svg,
            // um <svg> sem geometria não pinta nada (era exatamente o bug)
            paints: !!svg && (svg.hasAttribute('viewBox') || svg.hasAttribute('width')),
            svgBox: svg ? (() => { const b = svg.getBoundingClientRect(); return b.width * b.height; })() : 0,
          };
        }),
      };
    });

    expect(geometry.items.length).toBeGreaterThan(10);

    // (a) todo elemento desenha um SVG com geometria — não um <svg> vazio
    expect(geometry.items.filter(i => !i.hasSvg)).toEqual([]);
    expect(geometry.items.filter(i => !i.paints)).toEqual([]);
    expect(geometry.items.filter(i => i.svgBox <= 0)).toEqual([]);

    // (b) nada colapsado em 0x0 nem empilhado em (0,0)
    expect(geometry.items.filter(i => i.w < 2 || i.h < 2)).toEqual([]);
    expect(geometry.items.filter(i => i.left === 0 && i.top === 0).length).toBeLessThanOrEqual(1);

    // (c) nada fora da tela — a obra inteira cabe na canvas
    const offscreen = geometry.items.filter(
      i => i.left + i.w < 0 || i.top + i.h < 0 || i.left > geometry.canvas.w || i.top > geometry.canvas.h
    );
    expect(offscreen.map(i => i.code)).toEqual([]);

    // (d) notas/categorias diferentes produzem tamanhos diferentes — não um mar
    //     de quadrados genéricos idênticos
    const sizes = new Set(geometry.items.map(i => `${Math.round(i.w)}x${Math.round(i.h)}`));
    expect(sizes.size).toBeGreaterThanOrEqual(4);

    // (e) empilhamento por categoria: piso atrás, telhado na frente
    const zIndexes = new Set(geometry.items.map(i => i.z));
    expect(zIndexes.size).toBeGreaterThanOrEqual(4);

    // 9. Nenhum erro de console / exceção não capturada em toda a caminhada
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  });

  test('telas secundárias carregam sem erro de console', async ({ page }) => {
    const failures = captureFailures(page);
    for (const label of ['Membros', 'Cargos', 'Competências', 'Manual']) {
      await page.goto('/');
      await page.locator('button').filter({ hasText: new RegExp(`^${label}`) }).first().click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
      // sem estouro horizontal
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${label} estoura na horizontal`).toBeLessThanOrEqual(1);
    }
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  });
});
