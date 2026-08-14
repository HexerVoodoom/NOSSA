-- Schema da ferramenta de Arquitetura de Carreira.
--
-- Rode este arquivo inteiro uma vez no SQL Editor do projeto Supabase
-- (Dashboard -> SQL Editor -> New query -> colar -> Run). Rodar de novo depois
-- é seguro: tudo aqui é idempotente.
--
-- Modelo de dados: cada tabela guarda o registro inteiro como JSONB no campo
-- `data`, com o `id` do domínio como chave primária. Isso é deliberado — o app
-- já trata esses objetos como documentos (é o que ele grava no localStorage),
-- e assim o schema não muda toda vez que um campo novo aparece no produto.

-- ---------------------------------------------------------------------------
-- 1. Tabelas de dados
-- ---------------------------------------------------------------------------

create table if not exists public.members (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.competencies (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.evaluations (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

-- Marca que a carga inicial já foi feita. É uma linha só, gravada de forma
-- atômica: sem isso, dois primeiros acessos simultâneos semeariam o banco duas
-- vezes, e apagar todas as competências faria a carga inicial voltar a rodar,
-- ressuscitando dados excluídos de propósito.
create table if not exists public.app_meta (
  key text primary key,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Quem pode entrar
-- ---------------------------------------------------------------------------

-- Lista de e-mails convidados. Quem tem e-mail do domínio corporativo entra
-- sem precisar estar aqui (ver `email_e_corporativo` abaixo).
create table if not exists public.allowed_emails (
  email      text primary key check (email = lower(email)),
  role       text not null default 'member' check (role in ('member', 'admin')),
  invited_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

-- E-mail do usuário logado, direto de auth.users.
--
-- Por que não ler do JWT: o token traz `user_metadata`, que o próprio usuário
-- consegue alterar via auth.updateUser() — usar aquilo como base de permissão
-- deixaria qualquer pessoa se declarar admin. `email_confirmed_at` é o sinal
-- confiável de e-mail verificado, e só existe na tabela auth.users.
create or replace function public.current_email()
returns text language sql stable security definer set search_path = '' as $$
  select lower(u.email)
    from auth.users u
   where u.id = (select auth.uid())
     and u.email_confirmed_at is not null
     and coalesce(u.is_anonymous, false) = false
$$;

-- Domínio corporativo: comparação EXATA da parte depois do @.
--
-- Nunca use LIKE '%nossapessoaseempresas.com.br' aqui: isso casaria com
-- "evilnossapessoaseempresas.com.br", que qualquer um pode registrar.
create or replace function public.email_e_corporativo(e text)
returns boolean language sql immutable as $$
  select e is not null
     and array_length(string_to_array(e, '@'), 1) = 2
     and split_part(e, '@', 2) = 'nossapessoaseempresas.com.br'
$$;

create or replace function public.tem_acesso()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.email_e_corporativo(public.current_email())
      or exists (
           select 1 from public.allowed_emails a
            where a.email = public.current_email()
         )
$$;

-- Quem pode convidar e remover pessoas.
--
-- DECISÃO DO CLIENTE: todo e-mail do domínio corporativo é admin ("permissão
-- total"). Consequência aceita conscientemente: qualquer pessoa da empresa
-- pode liberar acesso para gente de fora. Para restringir, troque esta função
-- por uma lista explícita de e-mails.
create or replace function public.e_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.email_e_corporativo(public.current_email())
      or exists (
           select 1 from public.allowed_emails a
            where a.email = public.current_email() and a.role = 'admin'
         )
$$;

revoke execute on function public.current_email() from anon, authenticated;
grant execute on function public.tem_acesso() to authenticated;
grant execute on function public.e_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------
--
-- ATENÇÃO: sem estas políticas, a chave publicável (anon key) que vai no
-- navegador daria acesso total ao banco. E "apenas autenticado" NÃO basta:
-- com login pelo Google, qualquer conta Gmail do mundo se autentica sozinha.
-- Por isso toda política confere `tem_acesso()`, não só `authenticated`.

alter table public.members        enable row level security;
alter table public.roles          enable row level security;
alter table public.competencies   enable row level security;
alter table public.evaluations    enable row level security;
alter table public.app_meta       enable row level security;
alter table public.allowed_emails enable row level security;

do $$
declare t text;
begin
  foreach t in array array['members', 'roles', 'competencies', 'evaluations', 'app_meta'] loop
    -- Remove as políticas da versão anterior deste arquivo, que liberavam
    -- tudo para qualquer usuário autenticado.
    execute format('drop policy if exists "usuarios autenticados leem %1$s" on public.%1$I', t);
    execute format('drop policy if exists "usuarios autenticados escrevem %1$s" on public.%1$I', t);

    execute format('drop policy if exists "acesso liberado le %1$s" on public.%1$I', t);
    execute format(
      'create policy "acesso liberado le %1$s" on public.%1$I
         for select to authenticated using ((select public.tem_acesso()))', t
    );

    execute format('drop policy if exists "acesso liberado grava %1$s" on public.%1$I', t);
    execute format(
      'create policy "acesso liberado grava %1$s" on public.%1$I
         for all to authenticated
         using ((select public.tem_acesso()))
         with check ((select public.tem_acesso()))', t
    );
  end loop;
end $$;

-- A lista de convidados: todo mundo com acesso enxerga, só admin altera.
-- Se qualquer pessoa autorizada pudesse inserir, uma única conta invadida
-- viraria "liberar acesso para quem eu quiser".
drop policy if exists "convidados visiveis" on public.allowed_emails;
create policy "convidados visiveis" on public.allowed_emails
  for select to authenticated using ((select public.tem_acesso()));

drop policy if exists "somente admin convida" on public.allowed_emails;
create policy "somente admin convida" on public.allowed_emails
  for insert to authenticated with check ((select public.e_admin()));

drop policy if exists "somente admin remove" on public.allowed_emails;
create policy "somente admin remove" on public.allowed_emails
  for delete to authenticated using ((select public.e_admin()));

drop policy if exists "somente admin edita" on public.allowed_emails;
create policy "somente admin edita" on public.allowed_emails
  for update to authenticated
  using ((select public.e_admin())) with check ((select public.e_admin()));

-- ---------------------------------------------------------------------------
-- 4. Realtime
-- ---------------------------------------------------------------------------
--
-- Faz o app de uma pessoa atualizar sozinho quando outra salva algo.
-- O Realtime respeita as políticas de RLS acima na hora de decidir quem recebe
-- cada mudança. Não use `replica identity full` nestas tabelas: eventos de
-- DELETE são entregues sem filtro de RLS, e com a configuração padrão eles
-- carregam apenas o id — sem `full`, nenhum dado pessoal vaza por ali.

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

do $$
declare t text;
begin
  foreach t in array array['members', 'roles', 'competencies', 'evaluations'] loop
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
