# Guia de entrega — NOSSA / Arquitetura de Carreira (Luís Tortola Arquitetura)

Este pacote contém o código-fonte completo da ferramenta de avaliação de
desempenho. É uma aplicação **100% client-side** (React + Vite): não tem
backend, não usa Supabase nem nenhum servidor — todos os dados (membros,
cargos, competências, avaliações) ficam salvos no `localStorage` do
navegador de quem usa.

## 1. Subir para o repositório de vocês (GitLab)

```bash
# dentro da pasta descompactada
git init
git add .
git commit -m "Importa versão inicial da ferramenta"
git remote add origin <URL_DO_REPO_GITLAB_DE_VOCES>
git branch -M main
git push -u origin main
```

Se preferirem manter o histórico de commits original (recomendado, ajuda a
entender o que foi feito e por quê), me passem a URL + um token de acesso do
GitLab de vocês que eu mesmo faço o push preservando o histórico, em vez de
vocês reimportarem como um commit único.

## 2. Publicar no Cloudflare Pages

1. Painel do Cloudflare → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Selecionem o repositório GitLab (Cloudflare Pages integra nativamente com
   GitLab, não só GitHub).
3. Configuração de build:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `build`
   - **Node version:** 22 (defina `NODE_VERSION=22` nas variáveis de ambiente do projeto, se pedir)
4. Deploy. A cada push no branch `main`, o Cloudflare builda e publica
   sozinho — não tem passo manual depois disso.

## 3. Sobre Supabase (opcional, não é necessário hoje)

A ferramenta funciona inteira sem Supabase — os dados vivem no navegador. Se
no futuro vocês quiserem dados compartilhados entre pessoas/dispositivos
(hoje cada navegador tem sua própria base local), aí sim entraria um backend
com autenticação e banco compartilhado. Isso **não está implementado nesta
versão** — é um projeto à parte caso façam sentido investir nisso mais pra
frente. Não é preciso criar nada no Supabase para rodar o que está aqui.

## 4. Rodando localmente para testar antes de publicar

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm run build    # gera a pasta build/ (o que o Cloudflare também gera)
npm run test     # suíte de testes automatizados (236+ testes)
```

## 5. O que está incluso

- Código-fonte completo (`src/`), com testes automatizados (`npm run test`)
  e testes end-to-end (`e2e/`, via Playwright).
- `docs/`: bibliotecas de competências, cargos, perguntas e membros
  documentadas a partir dos dados reais da ferramenta.
- CI (`.github/workflows/ci.yml`) roda typecheck + testes + build a cada
  push — se migrarem para GitLab, pode ser adaptado para GitLab CI
  (`.gitlab-ci.yml`) reaproveitando os mesmos três comandos.

## Dúvidas / suporte

Qualquer ajuste, bug ou dúvida na migração, é só chamar.
