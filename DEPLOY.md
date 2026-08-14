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

### 3.3 Quem pode entrar

Há duas formas de entrar: **com a conta Google** ou com **e-mail e senha**.

Quem tem acesso liberado:

1. **Qualquer e-mail `@nossapessoaseempresas.com.br`** — entra direto, sem
   precisar de convite, com permissão total (inclusive para convidar outros).
2. **E-mails convidados** — qualquer outro endereço (Gmail pessoal, e-mail do
   cliente) só entra depois de ser adicionado na tela **Acessos**, dentro da
   própria ferramenta (botão no topo da tela inicial).

Quem não está em nenhum dos dois casos consegue fazer login, mas vê uma tela
de "sem acesso" e não enxerga dado nenhum — isso é garantido pelo banco, não
só pela tela.

**Para habilitar o login com Google:** Supabase → **Authentication** →
**Providers** → **Google** → ativar, e seguir as instruções para criar o
OAuth Client no Google Cloud (o painel mostra a *callback URL* que vocês devem
colar lá). Desativem os provedores que não forem usar.

**Para criar um usuário de e-mail e senha:** **Authentication** → **Users** →
**Add user** → **Create new user**, marcando *Auto Confirm User*.

> ### ⚠️ Passo obrigatório de segurança
>
> Em **Authentication** → **Sign In / Providers**, **desligue "Allow new users
> to sign up"**.
>
> Com essa opção ligada, qualquer pessoa na internet pode se cadastrar sozinha
> informando um e-mail inventado terminado em `@nossapessoaseempresas.com.br`
> — e, pela regra de domínio, entraria como **administrador**, com acesso
> total aos dados e ao controle de acessos. Todo usuário de senha deve ser
> criado à mão em **Authentication → Users**.
>
> Pelo mesmo motivo: **nunca desligue "Confirm email"**. Ela é a segunda
> barreira que impede um cadastro desses de valer.

> Atenção, e é proposital: **habilitar o Google não abre a ferramenta para
> qualquer um.** Qualquer pessoa do mundo com conta Google consegue *fazer
> login*, mas só quem está nas duas listas acima consegue *ver dados*. Essa
> separação é o que o passo 3.2 configurou.

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
RLS criadas no passo 3.2, que conferem o e-mail de quem está logado contra o
domínio corporativo e a lista de convidados. **Nunca** coloquem a chave
`service_role` no `.env` nem no Cloudflare: essa ignora todas as regras de
segurança.

### Decisões de segurança que vocês devem conhecer

- **Todo mundo do domínio corporativo é administrador.** Foi pedido assim
  ("permissão total"). Na prática: qualquer pessoa `@nossapessoaseempresas.com.br`
  pode convidar gente de fora. Se um dia quiserem restringir isso a poucas
  pessoas, é uma alteração pequena na função `e_admin()` do `schema.sql`.
- **Sair da ferramenta apaga os dados daquele navegador.** Isso é de propósito:
  em computador compartilhado, a próxima pessoa não pode ver a base de RH de
  quem usou antes.
- **Dados de RH são dados pessoais (LGPD).** Vale checar em qual região o
  projeto Supabase foi criado (fora do Brasil implica transferência
  internacional, que precisa de base legal documentada) e formalizar o contrato
  de operador com a Supabase. Vale também definir por quanto tempo as
  avaliações ficam guardadas.

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
