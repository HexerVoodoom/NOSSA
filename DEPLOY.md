# Guia de entrega — NOSSA / Arquitetura de Carreira (Luís Tortola Arquitetura)

Este pacote contém o código-fonte completo da ferramenta de avaliação de
desempenho (React + Vite).

Ela funciona de dois jeitos, e vocês escolhem qual usar:

| | Sem Supabase (padrão) | Com Supabase |
|---|---|---|
| Login | não tem | e-mail + senha |
| Onde ficam os dados | no navegador de cada pessoa | num banco compartilhado |
| Cada pessoa vê | só o que ela mesma cadastrou | os mesmos dados, sincronizados |
| Configuração | nenhuma | seção 3 deste guia |

Sem configurar nada, ela roda como está hoje. Preenchendo as duas variáveis de
ambiente da seção 3, ela passa a exigir login e a compartilhar os dados entre
todo mundo — **sem precisar mexer em uma linha de código**.

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

## 3. Ligar no Supabase de vocês (dados compartilhados + login)

Isto já está pronto no código. São 4 passos, todos no painel, sem programar.

### 3.1 Criar o projeto

Em [supabase.com](https://supabase.com) → **New project**. Guardem a senha do
banco que ele pedir. Esperem o projeto terminar de provisionar (~2 min).

### 3.2 Criar as tabelas

No projeto → **SQL Editor** → **New query** → cole o conteúdo inteiro do
arquivo `supabase/schema.sql` que está neste pacote → **Run**.

Isso cria as 4 tabelas (membros, cargos, competências, avaliações), liga a
segurança por linha (RLS) — que é o que impede alguém de fora de ler os dados
— e liga o Realtime, que faz a tela de uma pessoa atualizar sozinha quando
outra salva algo.

### 3.3 Criar os usuários

**Authentication** → **Users** → **Add user** → **Create new user**, com
e-mail e senha, marcando *Auto Confirm User*. Repitam para cada pessoa que vai
usar a ferramenta. Não existe cadastro aberto: só quem vocês criarem aqui
consegue entrar — é proposital.

### 3.4 Informar as chaves para a aplicação

Em **Project Settings** → **API**, copiem:

- **Project URL** → variável `VITE_SUPABASE_URL`
- a chave **anon / public** → variável `VITE_SUPABASE_ANON_KEY`

**No Cloudflare Pages:** projeto → **Settings** → **Environment variables** →
adicionem as duas (em *Production* e *Preview*) → **Retry deployment** para o
build pegar os valores novos.

**Para rodar na máquina de vocês:** copiem `.env.example` para `.env` e
preencham as duas linhas.

Pronto. No próximo acesso, a ferramenta vai pedir login e os dados passam a
ser os mesmos para todo mundo.

### O que acontece com os dados que já existem

Na primeira vez que alguém entrar com o banco vazio, a ferramenta **sobe
automaticamente** o conteúdo que estiver naquele navegador (biblioteca de
competências, cargos, membros e avaliações já cadastrados). Por isso: façam
esse primeiro login **no navegador que tem os dados bons**. Depois disso, o
banco passa a ser a fonte da verdade e os demais navegadores baixam dele.

> Recomendação: antes de ligar o Supabase, usem o botão de exportar da
> ferramenta para guardar um backup em arquivo. É rápido e evita sustos.

### Sobre a chave `anon`

Ela é pública por natureza (vai dentro do navegador, qualquer pessoa consegue
lê-la) — isso é normal e esperado. Quem protege os dados são as políticas de
RLS criadas no passo 3.2, que só liberam leitura/escrita para usuário
autenticado. **Nunca** coloquem a chave `service_role` no `.env` nem no
Cloudflare: essa ignora todas as regras de segurança.

## 4. Rodando localmente para testar antes de publicar

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm run build    # gera a pasta build/ (o que o Cloudflare também gera)
npm run test     # suíte de testes automatizados (240 testes)
```

## 5. O que está incluso

- Código-fonte completo (`src/`), com testes automatizados (`npm run test`)
  e testes end-to-end (`e2e/`, via Playwright).
- `supabase/schema.sql`: tabelas, políticas de segurança (RLS) e Realtime,
  prontos para rodar de uma vez no SQL Editor.
- `.env.example`: modelo das variáveis de ambiente do Supabase.
- `docs/`: bibliotecas de competências, cargos, perguntas e membros
  documentadas a partir dos dados reais da ferramenta.
- CI (`.github/workflows/ci.yml`) roda typecheck + testes + build a cada
  push — se migrarem para GitLab, pode ser adaptado para GitLab CI
  (`.gitlab-ci.yml`) reaproveitando os mesmos três comandos.

## Dúvidas / suporte

Qualquer ajuste, bug ou dúvida na migração, é só chamar.
