import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { LogOut } from 'lucide-react';

/**
 * Só aparece quando o Supabase está configurado — sem backend não há sessão
 * para encerrar.
 */
export function SignOutButton() {
  if (!isSupabaseConfigured) return null;

  return (
    <button
      onClick={() => { void supabase?.auth.signOut(); }}
      className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700 text-sm font-medium flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" aria-hidden="true" />
      Sair
    </button>
  );
}
