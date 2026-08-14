-- Schema da ferramenta de Arquitetura de Carreira.
--
-- Rode este arquivo inteiro uma vez no SQL Editor do projeto Supabase
-- (Dashboard -> SQL Editor -> New query -> colar -> Run).
--
-- Modelo de dados: cada tabela guarda o registro inteiro como JSONB no campo
-- `data`, com o `id` do domínio como chave primária. Isso é deliberado — o app
-- já trata esses objetos como documentos (é o que ele grava no localStorage
-- hoje), e assim o schema não precisa mudar toda vez que um campo novo aparece
-- no produto. As buscas do app são sempre "traz tudo", não há consulta por
-- campo interno que justificasse normalizar em colunas.

create table if not exists public.members (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.competencies (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.evaluations (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security: sem isto, a chave publicável (anon key) que vai no
-- navegador daria acesso de leitura e escrita a qualquer pessoa na internet.
alter table public.members      enable row level security;
alter table public.roles        enable row level security;
alter table public.competencies enable row level security;
alter table public.evaluations  enable row level security;

-- Somente usuários autenticados (criados por vocês no painel do Supabase)
-- leem e escrevem. Visitantes anônimos não enxergam nada.
do $$
declare t text;
begin
  foreach t in array array['members', 'roles', 'competencies', 'evaluations'] loop
    execute format(
      'drop policy if exists "usuarios autenticados leem %1$s" on public.%1$I', t
    );
    execute format(
      'create policy "usuarios autenticados leem %1$s" on public.%1$I
         for select to authenticated using (true)', t
    );

    execute format(
      'drop policy if exists "usuarios autenticados escrevem %1$s" on public.%1$I', t
    );
    execute format(
      'create policy "usuarios autenticados escrevem %1$s" on public.%1$I
         for all to authenticated using (true) with check (true)', t
    );
  end loop;
end $$;

-- Realtime: faz o app de uma pessoa atualizar sozinho quando outra pessoa
-- salva algo, sem precisar recarregar a página.
do $$
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.members;
alter publication supabase_realtime add table public.roles;
alter publication supabase_realtime add table public.competencies;
alter publication supabase_realtime add table public.evaluations;
