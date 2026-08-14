# Dívida técnica — checklist acionável

Levantado na limpeza do export Figma. Cada item é independente e pode ser feito
isoladamente. Ordem sugerida: 1 → 2 → 3 → 4 (do mais barato/reversível para o mais caro).

Contexto da rodada atual: o grafo de alcançabilidade foi construído a partir de
`src/main.tsx` → `src/App.tsx`, seguindo imports transitivamente por todo `src/`
(incluindo especificadores versionados do tipo `pkg@1.2.3`, que contam como import real).
Resultado: dos 48 arquivos em `src/components/ui/`, **apenas `ui/sonner.tsx` era
alcançável** (via `App.tsx` → `Toaster`). Os outros **47 foram deletados**.

---

## 1. Remover dependências npm que ficaram órfãs (edição de `package.json`)

Após a remoção de `src/components/ui/*`, nenhuma referência a estes pacotes existe
mais em `src/`. Custo hoje: tempo de `npm install`, superfície de auditoria/CVE e
manutenção de versões — **não** tamanho de bundle (o tree-shaking já os excluía).

Todos os 26 pacotes Radix declarados:

```
@radix-ui/react-accordion
@radix-ui/react-alert-dialog
@radix-ui/react-aspect-ratio
@radix-ui/react-avatar
@radix-ui/react-checkbox
@radix-ui/react-collapsible
@radix-ui/react-context-menu
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-hover-card
@radix-ui/react-label
@radix-ui/react-menubar
@radix-ui/react-navigation-menu
@radix-ui/react-popover
@radix-ui/react-progress
@radix-ui/react-radio-group
@radix-ui/react-scroll-area
@radix-ui/react-select
@radix-ui/react-separator
@radix-ui/react-slider
@radix-ui/react-slot
@radix-ui/react-switch
@radix-ui/react-tabs
@radix-ui/react-toggle
@radix-ui/react-toggle-group
@radix-ui/react-tooltip
```

Mais os satélites do shadcn/Figma:

```
class-variance-authority
clsx
cmdk
embla-carousel-react
input-otp
react-day-picker
react-hook-form
react-resizable-panels
recharts
tailwind-merge
vaul
```

- [ ] Remover os 37 pacotes acima de `dependencies` em `package.json`.
- [ ] Remover os aliases correspondentes em `vite.config.ts` e os `paths` em `tsconfig.json` (ver item 3).
- [ ] Rodar `npm install` para regravar o `package-lock.json` e depois `npx tsc --noEmit` + build.

**Atenção — não remover:**
- `html2canvas` aparece como "não usado em `src/`", mas é **dependência transitiva de
  `html2pdf.js`** (`{dompurify, html2canvas, jspdf}`), usado em `src/lib/pdfExport.ts`.
  Deixar declarado é aceitável; se remover, confirmar que o build do PDF continua verde.
- `next-themes` e `sonner` continuam necessários (`ui/sonner.tsx`).
- `lucide-react`, `motion`, `dompurify`, `jspdf`, `html2pdf.js` seguem em uso.

---

## 2. PNG de 1,6 MB usado como background em ~10 telas

`src/assets/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png` — **1.624.876 bytes**.
É importado por pelo menos 10 componentes (`HomePage`, `TeamGallery`, `WorkDetail`,
`RolesView`, `RoleEditor`, `EvaluationStart`, `EvaluationSummary`, `TutorialView`,
`CompetenciesView`, `CategoryQuestionFlow`), sempre como imagem de fundo decorativa.

Isso **está** no bundle final e é hoje o maior custo de primeira renderização depois do
chunk de PDF. É um dos poucos itens desta lista que o usuário final sente.

- [ ] Redimensionar para a resolução real de exibição (medir no DOM; provavelmente ≤1920px de largura).
- [ ] Converter para **WebP** (com AVIF opcional e fallback PNG via `<picture>` se for `<img>`).
  Esperado: 1,6 MB → 80–200 KB, sem diferença perceptível para um fundo.
- [ ] Se for usado apenas como `background-image` decorativo, considerar servir via CSS
  e marcar como não bloqueante (`loading="lazy"` / `fetchpriority="low"`).
- [ ] Revisar os outros 3 assets `figma:asset/*` com o mesmo critério.

---

## 3. Especificadores de import versionados (`pkg@1.2.3`) — artefato do export Figma

O export do Figma gerou imports como:

```ts
import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner } from "sonner@2.0.3";
```

Isso não é sintaxe válida de resolução de módulo em Node/bundler; só funciona porque
existem **dois blocos espelhados de alias** mantidos à mão:

- `vite.config.ts` → `resolve.alias` (mapeia `'sonner@2.0.3' → 'sonner'`, etc.)
- `tsconfig.json` → `compilerOptions.paths` (mapeia para `./node_modules/<pkg>`)

Por que remover:
- **Versão duplicada e mentirosa:** a versão no import congela no tempo e diverge da
  versão real do `package-lock.json` sem nenhum erro — a string vira documentação falsa.
- **Dois lugares para manter sincronizados**; esquecer um quebra o typecheck ou o build,
  e os erros resultantes são obscuros.
- Quebra ferramentas padrão (`depcheck`, `knip`, `npm ls`, auto-import da IDE), que é
  exatamente o motivo de a dívida do item 1 ter passado despercebida por tanto tempo.

- [ ] Codemod em `src/`: regex `from ["']([@\w./-]+)@\d+\.\d+\.\d+["']` → `from "$1"`.
      Após a limpeza do `ui/`, restam poucos casos (`sonner@2.0.3`, `next-themes@0.4.6`,
      `lucide-react@0.487.0`).
- [ ] Apagar **todo** o bloco de aliases versionados em `vite.config.ts`
      (manter os `figma:asset/*` até o item 2 ser resolvido, ou migrar para imports relativos).
- [ ] Apagar os `paths` versionados em `tsconfig.json`, mantendo apenas `"@/*": ["./src/*"]`.
- [ ] Verificar com `npx tsc --noEmit` e `npx vite build`.

---

## 4. `tsconfig.json` roda com `strict: false`

Decisão deliberada e documentada no arquivo: o código exportado do Figma não é
strict-clean, e ligar `strict` de uma vez produziria centenas de erros que enterrariam
os bugs reais no ruído. O custo é real: hoje o compilador não pega `null`/`undefined`
nem `any` implícito — a classe de bug mais comum neste app (leituras de `localStorage`
e campos opcionais de `Member`/`Role`).

**Ordem de ratchet recomendada** (uma flag por PR, sempre chegando a zero erro antes da próxima):

1. `noImplicitAny` — maior retorno por esforço; força tipar as fronteiras (props, handlers, parsers).
2. `strictNullChecks` — o mais caro e o que mais paga; fazer só depois do (1), porque o (1)
   revela os tipos que o (2) vai precisar checar.
3. `strictFunctionTypes` + `strictBindCallApply` + `noImplicitThis` — geralmente quase de graça após (1) e (2).
4. `strict: true` (flip final, deve virar no-op) e então `noUncheckedIndexedAccess` como passo opcional seguinte.

- [ ] Antes de começar, garantir a suíte de testes verde — o ratchet é uma refatoração ampla e os testes são a rede.
- [ ] Não usar `// @ts-expect-error` como atalho para fechar um degrau; se precisar, abrir issue vinculada.

---

## Fora de escopo desta rodada (registrado, não tratado)

- `src/imports/*` (≈30 arquivos `svg-*.ts` + `Frame43.tsx`) também aparecem como
  inalcançáveis pelo grafo. **Não foram deletados** — precisam de uma verificação
  própria, já que assets de SVG do Figma podem ser referenciados por caminhos
  não estáticos. Tratar em rodada separada.
- `src/components/figma/ImageWithFallback.tsx` também está inalcançável hoje; mantido
  pelo mesmo motivo (é o fallback padrão do export, provavelmente útil no item 2).
- Chunk `vendor-pdf` de 1,54 MB (`jspdf` + `html2canvas`). Já é carregado via
  `import()` dinâmico, então não bloqueia a primeira renderização — custo aceitável hoje.
