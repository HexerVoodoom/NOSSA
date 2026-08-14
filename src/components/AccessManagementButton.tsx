import { isSupabaseConfigured } from '../lib/supabase/client';
import { ShieldCheck } from 'lucide-react';

/**
 * Só aparece quando a ferramenta está ligada ao banco — sem login não existe
 * controle de acesso para gerenciar.
 */
export function AccessManagementButton({ onClick }: { onClick: () => void }) {
  if (!isSupabaseConfigured) return null;

  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700 text-sm font-medium flex items-center gap-2"
    >
      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
      Acessos
    </button>
  );
}
