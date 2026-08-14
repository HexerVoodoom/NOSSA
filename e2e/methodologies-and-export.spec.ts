import { test, expect, Page, Download } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

// Cobertura das lacunas do caminho crítico:
//   - metodologia DIALÓGICA ponta a ponta (filtro por NOME de competência)
//   - metodologia ATIVIDADES ponta a ponta (categoryId 'activities-block')
//   - geração de PDF de verdade (html2pdf em WorkDetail/RolesView e jsPDF no
//     "Compartilhar" da obra montada) — nenhum desses caminhos jamais rodou
//   - round trip exportar/importar configuração no gerenciador de arquivos
//
// Rodar com: npm run test:e2e

const OPTION = '[role="listbox"] [role="option"], [role="listbox"] button';

type Failures = { consoleErrors: string[]; pageErrors: string[] };

function captureFailures(page: Page): Failures {
  const f: Failures = { consoleErrors: [], pageErrors: [] };
  page.on('console', m => { if (m.type() === 'error') f.consoleErrors.push(m.text()); });
  page.on('pageerror', e => f.pageErrors.push(`${e.name}: ${e.message}`));
  page.on('dialog', d => { void d.dismiss(); }); // alert() do fallback de erro do PDF
  return f;
}

async function pickOption(page: Page, triggerText: string, optionText: string) {
  await page.locator('button', { hasText: triggerText }).first().click();
  await page.locator(OPTION).filter({ hasText: optionText }).first().click();
}

async function startEvaluation(page: Page, methodology: string, role = 'Coordenador(a) de Projetos') {
  await page.goto('/');
  await page.locator('button', { hasText: 'Nova Avaliação' }).first().click();
  await pickOption(page, 'Selecione um líder...', 'Luís Tortola');
  await pickOption(page, 'Selecione o cargo...', role);
  await pickOption(page, 'Selecione a pessoa...', 'Camila Coutinho');
  await page.getByRole('heading', { name: methodology, exact: true }).click();
  await expect(page.locator('[role="radiogroup"]').first()).toBeVisible();
}

/** Percorre todas as seções respondendo com notas 1/3/5 alternadas. */
async function answerAllSections(page: Page, opts: { keywords?: boolean } = {}) {
  const RATINGS = [1, 3, 5];
  const seen: { name: string; questions: string[] }[] = [];
  for (;;) {
    expect(seen.length, 'seções demais — provável loop').toBeLessThanOrEqual(12);
    await expect(page.locator('[role="radiogroup"]').first()).toBeVisible();
    const name = (await page.locator('header h1').first().innerText()).trim();
    const cards = page.locator('main [role="radiogroup"]');
    const total = await cards.count();
    expect(total, `seção "${name}" sem perguntas`).toBeGreaterThan(0);

    const texts = await page.locator('main p.text-2xl').allInnerTexts();
    seen.push({ name, questions: texts.map(t => t.trim()) });

    for (let i = 0; i < total; i++) {
      await cards.nth(i).locator('[role="radio"]').nth(RATINGS[i % 3] - 1).click();
    }
    if (opts.keywords) {
      const inputs = page.getByLabel(/^Palavra-chave [123]$/);
      const n = await inputs.count();
      for (let i = 0; i < n; i++) await inputs.nth(i).fill(`kw${seen.length}-${i}`);
    }
    await page.locator('#section-observations').fill(`Observação da seção ${seen.length}.`);

    const isLast = (await page.locator('button', { hasText: 'Finalizar Avaliação' }).count()) > 0;
    await page.locator('button', { hasText: isLast ? 'Finalizar Avaliação' : 'Próxima Seção' }).first().click();
    if (isLast) break;
  }
  return seen;
}

/** Geometria dos elementos da obra montada, medida no browser de verdade. */
async function readArtwork(page: Page) {
  await page.waitForTimeout(700);
  return page.evaluate(() => {
    const canvas = document.querySelector('.diamond-mesh-container div.relative') as HTMLElement | null;
    if (!canvas) return null;
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
          paints: !!svg && (svg.hasAttribute('viewBox') || svg.hasAttribute('width')),
          svgArea: svg ? svg.getBoundingClientRect().width * svg.getBoundingClientRect().height : 0,
        };
      }),
    };
  });
}

async function savedWork(page: Page) {
  return page.evaluate(() => {
    const works = JSON.parse(localStorage.getItem('obra-viva-evaluations') || '[]');
    return works[works.length - 1];
  });
}

const OUT = path.join(os.tmpdir(), 'obra-viva-e2e');
fs.mkdirSync(OUT, { recursive: true });

async function saveDownload(d: Download, name: string) {
  const file = path.join(OUT, name);
  await d.saveAs(file);
  return { file, size: fs.statSync(file).size };
}

test.describe('Metodologias dialógica e atividades', () => {
  test('dialógica: perguntas certas, palavras-chave, resumo, salvamento e obra', async ({ page }) => {
    const failures = captureFailures(page);

    await startEvaluation(page, 'Dialógica');
    const sections = await answerAllSections(page, { keywords: true });

    // As perguntas dialógicas são casadas por NOME de competência (não por id).
    // Se esse casamento quebrar, o resultado é zero pergunta ou pergunta demais.
    expect(sections.length).toBeGreaterThan(0);
    for (const s of sections) expect(s.questions.length, `${s.name} sem perguntas`).toBeGreaterThan(0);

    // 2. Resumo
    await expect(page.getByRole('heading', { name: 'Resumo da Avaliação' })).toBeVisible();
    await expect(page.getByText('Observação da seção 1.')).toBeVisible();

    // 3. Salvar
    await page.locator('button', { hasText: /^Salvar/ }).first().click();
    await expect(page.getByRole('heading', { name: 'Avaliações Salvas' })).toBeVisible();

    const work = await savedWork(page);
    expect(work.evaluationType).toBe('dialogica');
    // palavras-chave persistidas
    const withKw = work.responses.filter((r: any) => (r.keywords || []).some((k: string) => k));
    expect(withKw.length, 'nenhuma palavra-chave persistida').toBe(work.responses.length);
    // notas diferentes -> elementos diferentes, e nenhum id vazio
    const ids = [...new Set(work.responses.map((r: any) => r.selectedElementId))] as string[];
    expect(ids.filter(id => !id), 'resposta dialógica sem elemento').toEqual([]);
    expect(ids.length).toBeGreaterThan(1);

    // 4. Obra montada
    await page.locator('text=Camila Couti').first().click();
    await page.locator('button', { hasText: 'Ver Obra Montada' }).click();
    await expect(page.getByText('Visualização da Obra')).toBeVisible();
    await expect(page.getByText('Nenhum elemento foi selecionado')).toHaveCount(0);

    const art = await readArtwork(page);
    expect(art, 'canvas da obra não encontrada').not.toBeNull();
    expect(art!.items.length, 'obra dialógica vazia').toBeGreaterThan(0);
    expect(art!.items.filter(i => !i.paints), 'svg sem geometria').toEqual([]);
    expect(art!.items.filter(i => i.svgArea <= 0)).toEqual([]);
    expect(
      art!.items.filter(i => i.left + i.w < 0 || i.top + i.h < 0 || i.left > art!.canvas.w || i.top > art!.canvas.h),
      'elemento fora da canvas'
    ).toEqual([]);

    await page.locator('.diamond-mesh-container').first()
      .screenshot({ path: path.join(OUT, 'artwork-dialogica.png') });

    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  });

  // REGRESSÃO: o filtro dialógico casava por NOME de competência
  // (`competencies.find(c => c.name === q.competencyName)`). `find` devolve a
  // PRIMEIRA homônima, então duas competências de mesmo nome se confundiam e a
  // pergunta dialógica de uma competência que o cargo NÃO usa entrava na
  // avaliação por carona no nome da outra. Reproduzido no navegador.
  test('dialógica: competência homônima NÃO injeta pergunta que o cargo não tem', async ({ page }) => {
    const failures = captureFailures(page);
    await page.goto('/');

    const INTRUSA = 'PERGUNTA INTRUSA DE COMPETENCIA HOMONIMA';
    const injected = await page.evaluate((texto) => {
      const comps = JSON.parse(localStorage.getItem('obra-viva-competencies') || '[]');
      // clona o NOME de uma competência existente que tenha dialógica
      const alvo = comps.find((c: any) => c.questions?.some((q: any) => q.type === 'dialogic'));
      if (!alvo) return null;
      comps.push({
        ...alvo,
        id: 'comp-clone-e2e',
        questions: [{
          id: 'q-clone-e2e-dial',
          categoryId: alvo.questions[0].categoryId,
          text: texto,
          order: 99,
          isBonus: false,
          competencyId: 'comp-clone-e2e',
          evaluationType: 'dialogica',
          type: 'dialogic',
        }],
      });
      localStorage.setItem('obra-viva-competencies', JSON.stringify(comps));
      return alvo.name;
    }, INTRUSA);
    expect(injected, 'nenhuma competência com pergunta dialógica na biblioteca').not.toBeNull();

    await startEvaluation(page, 'Dialógica');
    const sections = await answerAllSections(page);
    const todas = sections.flatMap(s => s.questions);
    const vazou = todas.some(t => t.includes(INTRUSA));
    console.log(`[homônima] competência clonada: "${injected}" — pergunta intrusa apareceu: ${vazou}`);
    expect(vazou, 'pergunta de competência homônima vazou para a avaliação').toBe(false);
    // e a avaliação continua tendo perguntas de verdade (não "consertamos" zerando)
    expect(todas.length).toBeGreaterThan(0);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  });

  test('atividades: perguntas do cargo, salvamento e o que a obra mostra', async ({ page }) => {
    const failures = captureFailures(page);

    await startEvaluation(page, 'Atividades');
    const sections = await answerAllSections(page);
    expect(sections.length).toBe(1);
    expect(sections[0].name).toContain('Atividades');
    expect(sections[0].questions.length).toBeGreaterThan(0);

    await expect(page.getByRole('heading', { name: 'Resumo da Avaliação' })).toBeVisible();
    await page.locator('button', { hasText: /^Salvar/ }).first().click();
    await expect(page.getByRole('heading', { name: 'Avaliações Salvas' })).toBeVisible();

    const work = await savedWork(page);
    expect(work.evaluationType).toBe('atividades');
    expect(work.responses.length).toBe(sections[0].questions.length);

    // DOCUMENTA O COMPORTAMENTO ATUAL: 'activities-block' não é um bloco, então
    // getShapeForIndex devolve '' e nenhuma resposta carrega elemento. A obra de
    // uma avaliação de atividades é, por construção, vazia.
    const ids = [...new Set(work.responses.map((r: any) => r.selectedElementId))];
    expect(ids).toEqual(['']);

    await page.locator('text=Camila Couti').first().click();
    await page.locator('button', { hasText: 'Ver Obra Montada' }).click();
    await expect(page.getByText('Visualização da Obra')).toBeVisible();

    // Uma avaliação de ATIVIDADES não tem bloco correspondente, então não gera
    // obra. Antes isso desenhava 25 lajes idênticas achatadas numa linha de 1px;
    // agora a tela diz que não há obra e o canvas fica oculto. Este teste
    // verifica exatamente essa honestidade — o canvas NÃO deve estar visível.
    await expect(page.getByText(/não gera obra montada/i)).toBeVisible();
    await expect(page.locator('.diamond-mesh-container').first()).toBeHidden();

    const art = await readArtwork(page);
    expect(art?.items.length ?? 0, 'atividades não deve desenhar elemento algum').toBe(0);
    await page.screenshot({ path: path.join(OUT, 'artwork-atividades.png') });

    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  });
});

test.describe('Geração de PDF', () => {
  test('exportRoleToPDF a partir da lista de cargos produz um arquivo', async ({ page }) => {
    const failures = captureFailures(page);
    await page.goto('/');
    await page.locator('button').filter({ hasText: /^Cargos/ }).first().click();
    await expect(page.locator('h1, h2').first()).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      page.locator('button[aria-label^="Exportar PDF do cargo"]').first().click(),
    ]);
    const { file, size } = await saveDownload(download, 'cargo.pdf');
    console.log('[pdf cargo]', download.suggestedFilename(), size, 'bytes');
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    expect(size).toBeGreaterThan(20_000);
    expect(fs.readFileSync(file).subarray(0, 5).toString()).toBe('%PDF-');

    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  });

  test('exportToPDF e o "Compartilhar" da obra montada produzem arquivos', async ({ page }) => {
    const failures = captureFailures(page);

    await startEvaluation(page, 'Tradicional');
    await answerAllSections(page);
    await page.locator('button', { hasText: /^Salvar/ }).first().click();
    await expect(page.getByRole('heading', { name: 'Avaliações Salvas' })).toBeVisible();
    await page.locator('text=Camila Couti').first().click();
    await expect(page.getByRole('heading', { name: 'Avaliação Salva' })).toBeVisible();

    // (a) html2pdf, a partir do detalhe da obra
    const [d1] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      page.locator('button', { hasText: 'Exportar PDF' }).first().click(),
    ]);
    const r1 = await saveDownload(d1, 'avaliacao.pdf');
    console.log('[pdf avaliacao]', d1.suggestedFilename(), r1.size, 'bytes');
    expect(fs.readFileSync(r1.file).subarray(0, 5).toString()).toBe('%PDF-');
    expect(r1.size).toBeGreaterThan(20_000);

    // (b) jsPDF à mão, a partir da obra montada
    await page.locator('button', { hasText: 'Ver Obra Montada' }).click();
    await expect(page.getByText('Visualização da Obra')).toBeVisible();
    const [d2] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      // O botão "Compartilhar" (handleSharePDF) é rotulado apenas "PDF", no
      // rodapé fixo da obra montada.
      page.locator('.fixed.bottom-0 button', { hasText: 'PDF' }).first().click(),
    ]);
    const r2 = await saveDownload(d2, 'compartilhar.pdf');
    const bytes = fs.readFileSync(r2.file);
    const pages = (bytes.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    console.log('[pdf compartilhar]', d2.suggestedFilename(), r2.size, 'bytes,', pages, 'páginas');
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pages).toBeGreaterThan(1);

    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  });
});

test('round trip exportar/importar configuração', async ({ page }) => {
  const failures = captureFailures(page);
  await page.goto('/');

  // Uma avaliação real, com caracteres que costumam quebrar serialização
  // (acentos, aspas, markup, barra invertida), para o round trip ter o que perder.
  await page.evaluate(() => {
    const evals = JSON.parse(localStorage.getItem('obra-viva-evaluations') || '[]');
    evals.push({
      id: 'e2e-roundtrip',
      collaboratorName: 'Ana "Aninha" Gonçalves \\ Silva',
      leaderName: 'Luís Tortola',
      roleId: 'role-1',
      roleName: 'Cargo <b>teste</b>',
      evaluationType: 'tradicional',
      createdAt: new Date().toISOString(),
      questionIds: [],
      responses: [{ questionId: 'q-b1-agilidade-1', rating: 4, keywords: ['ação', 'çé', '<script>'], selectedElementId: 'foundation-4', selectedImageIndex: 3 }],
      sectionObservations: { bloco1: 'Observação com "aspas" & <tags>' },
    });
    localStorage.setItem('obra-viva-evaluations', JSON.stringify(evals));
  });
  await page.reload();

  // Estado inicial completo no localStorage
  const before = await page.evaluate(() => ({
    members: localStorage.getItem('obra-viva-members'),
    roles: localStorage.getItem('obra-viva-roles'),
    competencies: localStorage.getItem('obra-viva-competencies'),
    evaluations: localStorage.getItem('obra-viva-evaluations'),
  }));

  await page.locator('button[aria-label="Menu de Arquivos"]').first().click();
  await page.getByRole('menuitem').filter({ hasText: /Salvar|Exportar/ }).first().click();
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30_000 }),
    page.locator('button', { hasText: /^(Exportar|Salvar)/ }).last().click(),
  ]);
  const { file, size } = await saveDownload(download, 'config.json');
  console.log('[export json]', download.suggestedFilename(), size, 'bytes');
  const exported = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(exported.version).toBe('2.0');

  // Zera tudo e reimporta
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('button[aria-label="Menu de Arquivos"]').first().click();
  await page.getByRole('menuitem').filter({ hasText: /Carregar|Abrir|Importar/ }).first().click();
  await page.setInputFiles('input[type="file"]', file);
  await expect(page.getByText('Modo de importação:')).toBeVisible();
  // modo "Sobreescrever" (os radios não têm atributo value; vamos pelo rótulo)
  await page.locator('label', { hasText: 'Sobreescrever' }).locator('input[type="radio"]').check();
  await page.getByRole('button', { name: 'Importar', exact: true }).click();
  await page.waitForTimeout(2500);

  const after = await page.evaluate(() => ({
    members: localStorage.getItem('obra-viva-members'),
    roles: localStorage.getItem('obra-viva-roles'),
    competencies: localStorage.getItem('obra-viva-competencies'),
    evaluations: localStorage.getItem('obra-viva-evaluations'),
  }));

  for (const key of ['members', 'roles', 'competencies', 'evaluations'] as const) {
    const b = JSON.parse(before[key] || 'null');
    const a = JSON.parse(after[key] || 'null');
    expect(a, `${key} perdido no round trip`).not.toBeNull();
    if (b) expect(a).toEqual(b);
  }

  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
});
