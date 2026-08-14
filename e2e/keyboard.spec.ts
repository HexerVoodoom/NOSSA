import { test, expect, Page } from '@playwright/test';

/**
 * Caminhada COMPLETA de teclado, num Chromium de verdade.
 *
 * Por que isto existe: a suíte de unidade roda em jsdom, que não faz layout, não
 * pinta e não implementa `:focus-visible`. Ela consegue afirmar que a classe
 * `focus-visible:ring-2` está no DOM — e não consegue afirmar NADA sobre o anel
 * ser visível. Um `outline-none` concorrente, ou uma variante que o Tailwind não
 * gerou, deixaria a classe inerte e os testes de unidade continuariam verdes.
 *
 * Regra deste arquivo: ZERO `click()`. Só `page.keyboard.press(...)`.
 * (`focus()` também é proibido no caminho crítico — só Tab/setas/Enter.)
 *
 * Rodar com: npx playwright test e2e/keyboard.spec.ts
 * (deliberadamente FORA do CI — um e2e instável é pior que nenhum)
 */

// O card usa `transition-all`, então o box-shadow do anel ENTRA em ~150ms.
// Ler o estilo computado no instante do Tab devolve o estado intermediário
// (box-shadow transparente) e acusa um falso positivo. Esperamos a transição.
const TRANSITION_MS = 400;

type Failures = { consoleErrors: string[]; pageErrors: string[] };

function captureFailures(page: Page): Failures {
  const f: Failures = { consoleErrors: [], pageErrors: [] };
  page.on('console', m => { if (m.type() === 'error') f.consoleErrors.push(m.text()); });
  page.on('pageerror', e => f.pageErrors.push(`${e.name}: ${e.message}`));
  return f;
}

type Focus = { tag: string; role: string; text: string; label: string };

async function focusInfo(page: Page): Promise<Focus> {
  return page.evaluate(() => {
    const a = document.activeElement as HTMLElement | null;
    if (!a || a === document.body) return { tag: a ? 'BODY' : 'NULL', role: '', text: '', label: '' };
    return {
      tag: a.tagName,
      role: a.getAttribute('role') || '',
      text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
      label: a.getAttribute('aria-label') || '',
    };
  });
}

/** Tab até o elemento focado casar com `match`. Falha nomeando onde parou. */
async function tabTo(page: Page, match: RegExp, what: string, max = 60): Promise<Focus> {
  const seen: string[] = [];
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    const info = await focusInfo(page);
    seen.push(`${info.tag}[${info.role}] ${(info.label || info.text).slice(0, 40)}`);
    if (match.test(`${info.label} ${info.text}`)) return info;
  }
  throw new Error(`Não alcancei "${what}" em ${max} Tabs. Percorri:\n  ${seen.join('\n  ')}`);
}

/**
 * Escolhe uma opção num AccessibleSelect usando SÓ teclado:
 * Tab até o gatilho, ArrowDown abre e foca a lista, ArrowDown percorre,
 * Enter confirma e devolve o foco ao gatilho.
 */
async function pickByKeyboard(page: Page, trigger: RegExp, option: RegExp, what: string) {
  await tabTo(page, trigger, `gatilho de ${what}`);
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[role="listbox"]'), `listbox de ${what} não abriu com ArrowDown`).toBeVisible();
  for (let i = 0; i < 60; i++) {
    const info = await focusInfo(page);
    expect(info.role, `o foco saiu da listbox de ${what} (foi para ${info.tag})`).toBe('option');
    if (option.test(info.text)) {
      await page.keyboard.press('Enter');
      await expect(page.locator('[role="listbox"]')).toHaveCount(0);
      // Enter devolve o foco ao gatilho: sem isso o usuário fica órfão.
      expect((await focusInfo(page)).tag, `foco não voltou ao gatilho de ${what}`).toBe('BUTTON');
      return;
    }
    await page.keyboard.press('ArrowDown');
  }
  throw new Error(`Opção ${option} não encontrada em ${what}`);
}

type RingStyle = {
  outlineStyle: string; outlineWidth: string; outlineColor: string; outlineOffset: string;
  boxShadow: string; ringColor: string; ringOffsetColor: string;
  matchesFocusVisible: boolean; className: string;
};

/** Estilo computado do elemento focado AGORA — não a classe que está no DOM. */
async function focusStyle(page: Page): Promise<RingStyle> {
  await page.waitForTimeout(TRANSITION_MS);
  return page.evaluate(() => {
    const a = document.activeElement as HTMLElement;
    const cs = getComputedStyle(a);
    return {
      outlineStyle: cs.outlineStyle,
      outlineWidth: cs.outlineWidth,
      outlineColor: cs.outlineColor,
      outlineOffset: cs.outlineOffset,
      boxShadow: cs.boxShadow,
      ringColor: cs.getPropertyValue('--tw-ring-color').trim(),
      ringOffsetColor: cs.getPropertyValue('--tw-ring-offset-color').trim(),
      matchesFocusVisible: a.matches(':focus-visible'),
      className: a.className,
    };
  });
}

/**
 * Há indicador PINTADO? Um `ring` do Tailwind compila para box-shadow, então
 * box-shadow "none" ou só com camadas transparentes/zeradas não conta.
 */
function paintedIndicator(s: Pick<RingStyle, 'outlineStyle' | 'outlineWidth' | 'boxShadow'>) {
  const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
  const layers = s.boxShadow === 'none' ? [] : s.boxShadow.split(/,(?![^(]*\))/);
  const shadow = layers.some(l => {
    if (/rgba?\([^)]*,\s*0\s*\)|\/\s*0\s*\)/.test(l)) return false;        // cor transparente
    return /\d/.test(l) && !/^\s*\S+\s+0px 0px 0px 0px\s*$/.test(l.trim()); // geometria zerada
  });
  return { outline, shadow, any: outline || shadow };
}

/** Contraste WCAG entre duas cores CSS quaisquer, resolvidas pelo próprio Chrome. */
async function contrastRatio(page: Page, a: string, b: string): Promise<number> {
  return page.evaluate(([c1, c2]) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const toRgb = (c: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b2] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b2];
    };
    const lum = (rgb: number[]) => {
      const [r, g, b2] = rgb.map(v => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
    };
    const l1 = lum(toRgb(c1));
    const l2 = lum(toRgb(c2));
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }, [a, b]);
}

/** Primeira cor de fundo opaca subindo a árvore a partir do elemento focado. */
async function surfaceBehindFocus(page: Page): Promise<string> {
  return page.evaluate(() => {
    let el = (document.activeElement as HTMLElement).parentElement;
    while (el) {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'transparent' && !/,\s*0\)$/.test(bg)) return bg;
      el = el.parentElement;
    }
    return 'rgb(255, 255, 255)';
  });
}

// ---------------------------------------------------------------------------

test.describe('Operável só pelo teclado', () => {
  test('avaliação inteira, do início ao salvamento, sem um único clique', async ({ page }) => {
    const failures = captureFailures(page);
    const focusAfterNavigation: Record<string, Focus> = {};

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Arquitetura de Carreira' })).toBeVisible();

    // 1. Home -> Nova Avaliação (botão nativo)
    await tabTo(page, /Nova Avaliação/, 'Nova Avaliação');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Escolha o Líder')).toBeVisible();
    focusAfterNavigation['home -> nova avaliação'] = await focusInfo(page);

    // 2. Líder, cargo e pessoa — três comboboxes customizados
    await pickByKeyboard(page, /Selecione um líder/, /Luís Tortola/, 'líder');
    await pickByKeyboard(page, /Selecione o cargo/, /Coordenador\(a\) de Projetos/, 'cargo');
    await pickByKeyboard(page, /Selecione a pessoa/, /Camila Coutinho/, 'colaborador');

    // 3. Metodologia — radiogroup
    await expect(page.locator('[role="radiogroup"][aria-label="Escolha a Metodologia"]')).toBeVisible();
    await tabTo(page, /Dialógica/, 'primeiro radio de metodologia');
    expect((await focusInfo(page)).role).toBe('radio');

    // --- ANEL DE FOCO: estilo COMPUTADO, não a classe no DOM -----------------
    const ring = await focusStyle(page);
    const painted = paintedIndicator(ring);
    expect(ring.matchesFocusVisible, 'o card não casa :focus-visible ao chegar por Tab').toBe(true);
    expect(
      painted.any,
      `nenhum indicador pintado: outline=${ring.outlineStyle} ${ring.outlineWidth}; box-shadow=${ring.boxShadow}`,
    ).toBe(true);
    // `focus-visible:outline-none` mata o outline nativo: se o ring não pintar,
    // o usuário fica SEM indicador nenhum. Então o box-shadow é obrigatório.
    expect(ring.outlineStyle, 'premissa mudou: o outline nativo voltou').toBe('none');
    expect(painted.shadow, '`ring-2` do Tailwind não virou box-shadow pintado').toBe(true);
    expect(ring.ringColor, '--tw-ring-color vazio: a variante ring-slate-900 não aplicou').not.toBe('');
    console.log('[anel] radio de metodologia:', JSON.stringify(ring, null, 2));

    // --- Contraste do anel (WCAG 1.4.11 pede 3:1) ----------------------------
    const surface = await surfaceBehindFocus(page);
    const vsOffset = await contrastRatio(page, ring.ringColor, ring.ringOffsetColor);
    const vsSurface = await contrastRatio(page, ring.ringColor, surface);
    console.log(
      `[contraste] anel ${ring.ringColor} vs offset ${ring.ringOffsetColor} = ${vsOffset.toFixed(2)}:1 | ` +
      `vs superfície ${surface} = ${vsSurface.toFixed(2)}:1`,
    );
    expect(vsOffset, 'anel invisível contra o próprio ring-offset').toBeGreaterThanOrEqual(3);
    expect(vsSurface, 'anel invisível contra a superfície ao redor').toBeGreaterThanOrEqual(3);

    // --- O anel muda PIXELS de verdade? --------------------------------------
    const card = page.locator('[role="radio"]').first();
    const shot = async () => { await page.waitForTimeout(TRANSITION_MS); return card.screenshot(); };
    const focused = await shot();
    await page.keyboard.press('Shift+Tab');
    await expect(card).not.toBeFocused();
    const unfocused = await shot();
    expect(
      Buffer.compare(focused, unfocused),
      'screenshot idêntico com e sem foco: o anel não pinta um pixel sequer',
    ).not.toBe(0);
    await page.keyboard.press('Tab');
    await expect(card).toBeFocused();

    // --- Radiogroup: setas MOVEM o foco sem iniciar a avaliação --------------
    await page.keyboard.press('ArrowRight');
    expect((await focusInfo(page)).text, 'ArrowRight não moveu para Tradicional').toContain('Tradicional');
    await expect(
      page.getByRole('heading', { name: 'Escolha a Metodologia' }),
      'a seta iniciou a avaliação — não dá para navegar o grupo',
    ).toBeVisible();

    // O grupo é UMA parada de Tab: Tab sai do grupo, não anda entre as opções.
    await page.keyboard.press('Tab');
    const afterTab = await focusInfo(page);
    expect(afterTab.role, 'Tab andou dentro do radiogroup — não é uma parada só').not.toBe('radio');
    await page.keyboard.press('Shift+Tab');
    expect((await focusInfo(page)).text, 'Shift+Tab não voltou para a opção corrente').toContain('Tradicional');

    // 4. Enter inicia (Tradicional: escala Likert)
    await page.keyboard.press('Enter');
    await expect(page.locator('[role="radiogroup"]').first()).toBeVisible();
    focusAfterNavigation['metodologia -> questionário'] = await focusInfo(page);

    // 5. Responder todas as seções pelo teclado
    let sections = 0;
    for (;;) {
      sections++;
      expect(sections, 'seções demais — provável laço').toBeLessThanOrEqual(10);
      const groups = await page.locator('[role="radiogroup"]').count();
      expect(groups, 'seção sem perguntas').toBeGreaterThan(0);

      // Cada grupo de notas é uma parada de Tab (roving tabindex). Tab entra,
      // as setas andam DENTRO do grupo e já marcam.
      let answered = 0;
      for (let guard = 0; guard < 120 && answered < groups; guard++) {
        await page.keyboard.press('Tab');
        const info = await focusInfo(page);
        if (info.role !== 'radio') continue;
        for (let step = 0; step <= answered % 4; step++) await page.keyboard.press('ArrowRight');
        answered++;
      }
      expect(answered, `só ${answered}/${groups} grupos de nota alcançados por Tab na seção ${sections}`).toBe(groups);

      const isLast = (await page.locator('button', { hasText: 'Finalizar Avaliação' }).count()) > 0;
      await tabTo(page, isLast ? /Finalizar Avaliação/ : /Próxima Seção/, isLast ? 'Finalizar' : 'Próxima Seção');
      await page.keyboard.press('Enter');
      if (isLast) break;
      await expect(page.locator('[role="radiogroup"]').first()).toBeVisible();
      if (sections === 1) focusAfterNavigation['seção 1 -> seção 2'] = await focusInfo(page);
    }
    expect(sections).toBe(6);

    // 6. Resumo
    await expect(page.getByRole('heading', { name: 'Resumo da Avaliação' })).toBeVisible();
    focusAfterNavigation['questionário -> resumo'] = await focusInfo(page);
    await expect(page.getByText('Camila Coutinho')).toBeVisible();

    // 7. Salvar
    await tabTo(page, /Salvar/, 'Salvar');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Avaliações Salvas' })).toBeVisible();
    focusAfterNavigation['resumo -> galeria'] = await focusInfo(page);

    const saved = await page.evaluate(
      () => JSON.parse(localStorage.getItem('obra-viva-evaluations') || '[]').length,
    );
    expect(saved, 'a avaliação feita só com teclado não foi persistida').toBeGreaterThan(0);

    // 8. Card da galeria abre pelo teclado, e também mostra o anel
    await tabTo(page, /Camila Couti/, 'card da avaliação salva');
    const galleryRing = await focusStyle(page);
    expect(
      paintedIndicator(galleryRing).any,
      `card da galeria sem indicador pintado: ${JSON.stringify(galleryRing)}`,
    ).toBe(true);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Avaliação Salva' })).toBeVisible();
    focusAfterNavigation['galeria -> avaliação salva'] = await focusInfo(page);

    console.log('[foco após cada navegação]', JSON.stringify(focusAfterNavigation, null, 2));

    // Nenhuma troca de tela pode largar o foco em document.body: isso encalha o
    // usuário de teclado no topo do documento, com o conteúdo novo a N Tabs de
    // distância. Era o estado de TODAS as navegações antes deste teste.
    const stranded = Object.entries(focusAfterNavigation)
      .filter(([, f]) => f.tag === 'BODY' || f.tag === 'NULL')
      .map(([k]) => k);
    expect(stranded, 'foco perdido em document.body após navegar').toEqual([]);

    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  });

  test('a opção desabilitada Atividades é pulada pelas setas e não ativa', async ({ page }) => {
    const failures = captureFailures(page);

    // Nenhum cargo do seed está sem atividades, então o estado desabilitado
    // seria INALCANÇÁVEL num teste de dados reais. Semeamos um cargo vazio —
    // é setup de dados, a interação continua 100% teclado.
    await page.goto('/');
    await page.evaluate(() => {
      const roles = JSON.parse(localStorage.getItem('obra-viva-roles') || '[]');
      const members = JSON.parse(localStorage.getItem('obra-viva-members') || '[]');
      roles.push({
        id: 'role-sem-atividades', name: 'Cargo Sem Atividades', type: 'collaborator',
        activities: [], competencies: [], questions: [],
      });
      members.push({
        id: 'member-sem-atividades', firstName: 'Zulmira', lastName: 'Teste',
        position: 'Cargo Sem Atividades', email: '', phone: '',
      });
      localStorage.setItem('obra-viva-roles', JSON.stringify(roles));
      localStorage.setItem('obra-viva-members', JSON.stringify(members));
    });
    await page.reload();

    await tabTo(page, /Nova Avaliação/, 'Nova Avaliação');
    await page.keyboard.press('Enter');
    await pickByKeyboard(page, /Selecione um líder/, /Luís Tortola/, 'líder');
    await pickByKeyboard(page, /Selecione o cargo/, /Cargo Sem Atividades/, 'cargo');
    await pickByKeyboard(page, /Selecione a pessoa/, /Zulmira/, 'colaborador');

    const atividades = page.locator('[role="radio"]', { hasText: 'Atividades' });
    await expect(atividades).toHaveAttribute('aria-disabled', 'true');
    await expect(atividades).toHaveAttribute('tabindex', '-1');

    // Duas opções habilitadas: ArrowRight duas vezes tem de voltar à primeira,
    // sem nunca parar na desabilitada.
    await tabTo(page, /Dialógica/, 'primeiro radio');
    await page.keyboard.press('ArrowRight');
    expect((await focusInfo(page)).text).toContain('Tradicional');
    await page.keyboard.press('ArrowRight');
    expect((await focusInfo(page)).text, 'a seta parou na opção desabilitada').toContain('Dialógica');
    await page.keyboard.press('ArrowLeft');
    expect((await focusInfo(page)).text, 'ArrowLeft parou na opção desabilitada').toContain('Tradicional');

    // Nem por Tab a desabilitada recebe foco.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const f = await focusInfo(page);
      expect(
        f.role === 'radio' && f.text.startsWith('Atividades'),
        'Tab focou a opção desabilitada',
      ).toBe(false);
    }

    // E mesmo forçando o foco nela, Enter/Espaço não iniciam nada.
    await atividades.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(
      page.getByRole('heading', { name: 'Escolha a Metodologia' }),
      'Enter/Espaço na opção desabilitada iniciou a avaliação',
    ).toBeVisible();

    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  });
});
