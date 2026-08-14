import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase é OPCIONAL. Sem as variáveis de ambiente configuradas, o app roda
 * exatamente como antes: dados só no navegador, sem login. Com elas, os dados
 * passam a ser compartilhados e o login vira obrigatório.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

/**
 * Domínio com acesso liberado sem convite. Precisa ser idêntico ao usado na
 * função `tem_acesso()` do banco (supabase/schema.sql) — o banco é quem de
 * fato barra o acesso; aqui é só para a interface explicar a regra.
 */
export const AUTO_ALLOWED_DOMAIN = 'nossapessoaseempresas.com.br';
