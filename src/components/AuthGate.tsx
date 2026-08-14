import { useState, useEffect, useRef, useId } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, AUTO_ALLOWED_DOMAIN } from '../lib/supabase/client';
import { startSync, stopSync } from '../lib/supabase/sync';
import { DS, Button, Card } from './DesignSystem';
import { LogIn, ShieldAlert, CloudOff } from 'lucide-react';

type SyncState = 'idle' | 'syncing' | 'ready' | 'denied' | 'unavailable';

/**
 * Portão de entrada do app.
 *
 * Sem Supabase configurado (nenhuma variável de ambiente), renderiza as
 * crianças direto: o app segue funcionando só com dados locais, como sempre.
 *
 * Com Supabase configurado, exige login E carrega os dados do banco antes de
 * mostrar qualquer tela. Se a carga falhar, NÃO libera o app: entrar com o
 * cache da pessoa anterior na tela seria mostrar dados de RH para quem talvez
 * não tenha acesso a eles.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>('idle');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  // Identifica de quem é a sessão já sincronizada. Trocar de usuário na mesma
  // máquina precisa refazer a carga: sem isto, o segundo a entrar via o cache
  // do primeiro.
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) { setCheckingSession(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'SIGNED_OUT') {
        syncedUserId.current = null;
        setSyncState('idle');
        void stopSync();
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  const runSync = () => {
    setSyncState('syncing');
    startSync()
      .then(async result => {
        if (result === 'ok') { setSyncState('ready'); return; }
        if (result === 'denied') {
          // Recusa confirmada pelo banco: desmonta e limpa, senão os
          // interceptadores e o cache da pessoa anterior continuariam vivos
          // atrás da tela de "sem acesso".
          await stopSync();
          setSyncState('denied');
          return;
        }
        // 'unavailable': não deu para falar com o banco. NÃO limpar nada — a
        // limpeza apagaria a fila de alterações que ainda não subiram, e uma
        // oscilação de rede viraria perda de trabalho.
        setSyncState('unavailable');
      })
      .catch(err => {
        console.error('Falha ao sincronizar com o Supabase:', err);
        setSyncState('unavailable');
      });
  };

  useEffect(() => {
    if (!userId) return;
    if (syncedUserId.current === userId) return;

    // Marca antes de começar: o StrictMode invoca este efeito duas vezes, e
    // sem a trava as duas execuções disparariam a carga inicial em paralelo.
    syncedUserId.current = userId;
    runSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!isSupabaseConfigured) return <>{children}</>;

  if (checkingSession) return <FullScreenMessage>Carregando…</FullScreenMessage>;

  if (session) {
    if (syncState === 'ready') return <>{children}</>;
    if (syncState === 'denied') return <AccessDenied onRetry={runSync} />;
    if (syncState === 'unavailable') return <Unavailable onRetry={runSync} />;
    return <FullScreenMessage>Sincronizando dados…</FullScreenMessage>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      // Mensagens do provedor vêm em inglês e técnicas demais para quem usa a
      // ferramenta; o texto original fica no console para investigação.
      console.error('Falha no login:', signInError);
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : 'Não foi possível entrar. Tente de novo em instantes.'
      );
    }
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    if (!supabase) return;
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (oauthError) {
      console.error('Falha no login com Google:', oauthError);
      setError('Não foi possível entrar com o Google. Tente de novo.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className={DS.typography.section}>Arquitetura de Carreira</h1>
          <p className={DS.typography.body}>Entre com sua conta para acessar a ferramenta.</p>
        </div>

        <Button variant="secondary" onClick={handleGoogle} className="w-full">
          Entrar com Google
        </Button>

        <div className="flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-bold tracking-wider text-slate-400">OU</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor={emailId} className={DS.inputs.label}>E-mail</label>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              required
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
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
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={DS.inputs.base}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p id={errorId} role="alert" className="text-red-700 text-xs font-bold">{error}</p>
          )}

          <Button
            type="submit"
            aria-disabled={submitting}
            onClick={(e) => { if (submitting) e.preventDefault(); }}
            className="w-full"
          >
            <LogIn className="size-4" aria-hidden="true" />
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Quem tem e-mail <strong>@{AUTO_ALLOWED_DOMAIN}</strong> entra direto.
          Outros e-mails precisam ser convidados por alguém que já usa a
          ferramenta.
        </p>
      </Card>
    </div>
  );
}

/**
 * Autenticou, mas o banco não liberou os dados: e-mail fora da lista de acesso
 * (o caso comum, já que qualquer conta Google consegue fazer login) ou banco
 * fora do ar. A mensagem cobre os dois sem prometer qual é.
 */
function AccessDenied({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md space-y-6 text-center">
        <div className="size-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto">
          <ShieldAlert className="size-6 text-white" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className={DS.typography.section}>Sem acesso</h1>
          <p className={DS.typography.body}>
            Sua conta entrou, mas não tem permissão para ver os dados desta
            ferramenta. Peça a alguém que já usa a ferramenta para convidar seu
            e-mail — ou entre com um e-mail <strong>@{AUTO_ALLOWED_DOMAIN}</strong>.
          </p>
        </div>
        <div className="space-y-3">
          <Button onClick={onRetry} className="w-full">Tentar de novo</Button>
          <Button
            variant="secondary"
            onClick={() => { void supabase?.auth.signOut(); }}
            className="w-full"
          >
            Sair e entrar com outra conta
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * Autenticou e tem acesso, mas o banco não respondeu. Diferente de "sem
 * acesso": aqui nada é apagado do navegador, porque pode haver alteração ainda
 * não enviada esperando a conexão voltar.
 */
function Unavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md space-y-6 text-center">
        {/* Ícone e tom diferentes da tela de "sem acesso": aqui não é recusa,
            é indisponibilidade — não há nada de errado com a conta. */}
        <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
          <CloudOff className="size-6 text-slate-600" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className={DS.typography.section}>Sem conexão com o banco</h1>
          <p className={DS.typography.body}>
            Não foi possível carregar os dados agora. Verifique sua internet e
            tente de novo.
          </p>
          <p className="text-sm text-slate-600">
            Nada do que você já salvou foi perdido — o que ainda não subiu fica
            guardado e é enviado quando a conexão voltar.
          </p>
        </div>
        <div className="space-y-3">
          <Button onClick={onRetry} className="w-full">Tentar de novo</Button>
          {/* Sem esta saída, quem ficasse offline num computador compartilhado
              não teria como encerrar a própria sessão pela interface. */}
          <Button
            variant="secondary"
            onClick={() => { void supabase?.auth.signOut(); }}
            className="w-full"
          >
            Sair
          </Button>
        </div>
      </Card>
    </div>
  );
}

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center" aria-busy="true">
      <p className={DS.typography.body} role="status">{children}</p>
    </div>
  );
}
