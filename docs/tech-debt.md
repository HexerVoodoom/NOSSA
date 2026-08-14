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

- ~~`src/imports/*`~~ — **resolvido na rodada seguinte, ver seção "Rodada 2" abaixo.**
- `src/components/figma/ImageWithFallback.tsx` também está inalcançável hoje; mantido
  pelo mesmo motivo (é o fallback padrão do export, provavelmente útil no item 2).
  **Continua não tratado** — não é de propriedade desta rodada.
- Chunk `vendor-pdf` de 1,54 MB (`jspdf` + `html2canvas`). Já é carregado via
  `import()` dinâmico, então não bloqueia a primeira renderização — custo aceitável hoje.

---

# Rodada 2 — verificação de `src/imports/` e poda de dependências

Método: grafo de alcançabilidade reconstruído a partir de `src/main.tsx`, resolvendo
extensões implícitas (`.ts`, `.tsx`, `/index.ts`) e o alias `@/` do `vite.config.ts`,
somado a um grep textual por `svg-` e `Frame43` em todo `src/` (incluindo
`src/**/__tests__/`, que o grafo a partir da entry não cobre). As duas buscas
convergiram no mesmo resultado — é isso que dá confiança para deletar.

## `src/imports/` — feito

Apenas **2** dos 33 arquivos são alcançáveis:

| Arquivo | Importado por |
|---|---|
| `svg-1j9eir7tjm.ts` | `components/CompetenciesView.tsx` |
| `svg-dp9vj8g4zf.ts` | `components/RolesView.tsx`, `RoleEditor.tsx`, `MembersView.tsx` |

Os outros **31** (30 `svg-*.ts` + `Frame43.tsx`) foram deletados: **67.150 bytes**.
Nenhum deles era alvo de import dinâmico, template string ou `import.meta.glob`
— não há nenhum caminho de resolução não estático neste repo, o que era exatamente
a dúvida que travou a rodada 1.

## Dependências — feito

Os 37 candidatos da rodada 1 foram **re-verificados um a um** contra o código atual,
buscando o nome nu do pacote (não o especificador com sufixo `@versão`, que quebra
o grep ingênuo). **Zero referências para os 37** → todos removidos:
os 26 `@radix-ui/*`, `class-variance-authority`, `clsx`, `cmdk`,
`embla-carousel-react`, `input-otp`, `react-day-picker`, `react-hook-form`,
`react-resizable-panels`, `recharts`, `tailwind-merge`, `vaul`.

Mantidos, com a razão:

| Pacote | Razão da manutenção |
|---|---|
| `sonner`, `next-themes` | usados por `components/ui/sonner.tsx` (alcançável via `App.tsx`) |
| `lucide-react` | ícones, 19 referências |
| `motion` | animações, 8 referências |
| `dompurify` | `lib/svgProcessor.ts` — sanitização de SVG, fronteira de segurança |
| `html2pdf.js` | `import()` dinâmico em `lib/pdfExport.ts` |
| `html2canvas`, `jspdf` | dependências transitivas de `html2pdf.js`; declaradas direto e nomeadas no `manualChunks` do `vite.config.ts`. Sem referência de import própria, mas removê-las passaria a depender de hoisting do npm para a resolução do chunk `vendor-pdf`. Ganho zero, risco não-zero → ficam. |
| `tw-animate-css` | `@import` em `src/index.css` |

**Nota de acoplamento:** o `vite.config.ts` ainda tem ~35 entradas de `alias` mapeando
especificadores versionados (`vaul@1.1.2` → `vaul`) para pacotes que não existem mais.
São chaves inertes — o Vite só as consulta se alguém importar aquele especificador —
mas são ruído e uma armadilha (um alias apontando para um pacote ausente falha só em
tempo de build). Limpá-las é seguro e barato; não foi feito aqui por escopo
(`vite.config.ts` é de outro dono nesta rodada).

Gates após a mudança: `vitest run` 152/152, `tsc --noEmit` 0 erros, `vite build` OK.

## Observações (não tratadas) — CSS e markdown solto

### `src/index.css` vs `src/styles/globals.css` — complementares, não conflitantes

Não há sobreposição. `index.css` é a **entry** (7 linhas): puxa o Tailwind, o
`tw-animate-css`, faz `@import './styles/globals.css'` e define um único `@layer base`
com o reset de altura. `globals.css` (189 linhas) é só **conteúdo**: tokens de tema em
`:root`/`.dark` e camadas base. Ou seja, `globals.css` nunca é carregado sozinho — só
através de `index.css`, que é o único CSS importado por `main.tsx`.

Nada a corrigir. O único desconforto é de nomenclatura: "globals" sugere ser a entry,
quando na verdade a entry é `index.css`. Se for mexer um dia, o rename honesto seria
`styles/tokens.css`. Baixíssima prioridade — é cosmético.

### Markdown solto em `src/`

`src/` deve conter apenas o que o bundler consome. Nenhum destes é importado por
nada; são documentos.

| Arquivo | Destino recomendado |
|---|---|
| `src/PROMPT_MESTRE_RECONSTRUCAO.md` | `docs/` — artefato de processo/prompt, não código |
| `src/PLANTA_BAIXA.md` | `docs/` — documento de arquitetura, é onde um novo dev procuraria |
| `src/VERIFICATION_REPORT.md` | `docs/` — relatório datado; candidato a `docs/archive/` |
| `src/Attributions.md` | **fica** onde está *ou* vai para a raiz. É atribuição de licença de assets; convenção é raiz do repo (`ATTRIBUTIONS.md`), perto de `LICENSE`, não enterrado em `docs/`. |
| `src/guidelines/Guidelines.md` | arquivo **vazio** (0 bytes), resíduo do template Figma. Deletar; se as guidelines forem escritas de fato, o lugar é `docs/`. |

Ressalva antes de mover: `PLANTA_BAIXA.md` e `PROMPT_MESTRE_RECONSTRUCAO.md` podem ser
referenciados por caminho em prompts/automação fora do repo. Mover é trivial de
reverter (one-way door? não), mas vale um grep no histórico antes.
