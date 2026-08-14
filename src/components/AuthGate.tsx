import { useState, useEffect, useId } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { startSync } from '../lib/supabase/sync';
import { DS, Button, Card } from './DesignSystem';
import { LogIn } from 'lucide-react';

/**
 * Portão de entrada do app.
 *
 * Sem Supabase configurado (nenhuma variável de ambiente), renderiza as
 * crianças direto: o app segue funcionando só com dados locais, como sempre.
 * Com Supabase configurado, exige login antes de mostrar qualquer coisa e
 * sincroniza os dados do banco antes de liberar a tela.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailId = useId();
  const passwordId = useId();

  useEffect(() => {
    if (!supabase) { setCheckingSession(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Puxa os dados do banco assim que há sessão, antes de liberar as telas —
  // caso contrário o app renderizaria com o cache local desatualizado.
  useEffect(() => {
    if (!session || synced || syncing) return;
    setSyncing(true);
    startSync()
      .catch(err => console.error('Falha ao sincronizar com o Supabase:', err))
      .finally(() => { setSyncing(false); setSynced(true); });
  }, [session, synced, syncing]);

  if (!isSupabaseConfigured) return <>{children}</>;

  if (checkingSession) {
    return <FullScreenMessage>Carregando…</FullScreenMessage>;
  }

  if (session) {
    if (!synced) return <FullScreenMessage>Sincronizando dados…</FullScreenMessage>;
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : signInError.message
      );
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <Card className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className={DS.typography.section}>Arquitetura de Carreira</h1>
          <p className={DS.typography.body}>Entre com sua conta para acessar a ferramenta.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor={emailId} className={DS.inputs.label}>E-mail</label>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={DS.inputs.base}
              placeholder="voce@empresa.com.br"
            />
          </div>

          <div>
            <label htmlFor={passwordId} className={DS.inputs.label}>Senha</label>
            <input
              id={passwordId}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={DS.inputs.base}
              placeholder="••••••••"
            />
          </div>

          {error && <p role="alert" className="text-red-500 text-xs font-bold">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            <LogIn className="size-4" aria-hidden="true" />
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          As contas são criadas pelo administrador no painel do Supabase. Se não
          consegue entrar, procure quem administra a ferramenta.
        </p>
      </Card>
    </div>
  );
}

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <p className={DS.typography.body} role="status">{children}</p>
    </div>
  );
}
