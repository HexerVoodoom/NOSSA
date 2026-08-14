import { useState, useEffect, useId, useRef } from 'react';
import { supabase, isSupabaseConfigured, AUTO_ALLOWED_DOMAIN } from '../lib/supabase/client';
import { DS, Button, Card } from './DesignSystem';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ArrowLeft, UserPlus, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AllowedEmail {
  email: string;
  created_at: string;
}

const SEM_PERMISSAO =
  'Você não tem permissão para alterar a lista de acessos. Peça a alguém com ' +
  'e-mail do domínio da empresa.';

// 42501 = insufficient_privilege; PGRST301 = JWT ausente/expirado.
function isPermissionError(error: { code?: string }): boolean {
  return error.code === '42501' || error.code === 'PGRST301';
}

interface AccessManagementProps {
  onBack: () => void;
}

/**
 * Quem pode entrar na ferramenta.
 *
 * Esta tela é conveniência: quem de fato barra o acesso é o banco (políticas de
 * RLS conferem o e-mail do usuário contra esta mesma lista). Tirar alguém daqui
 * corta o acesso mesmo que a pessoa já esteja com a sessão aberta na próxima
 * vez que o app falar com o banco.
 */
export function AccessManagement({ onBack }: AccessManagementProps) {
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toRemove, setToRemove] = useState<AllowedEmail | null>(null);
  const newEmailId = useId();
  const inviteInputRef = useRef<HTMLInputElement>(null);
  const loadedOnce = useRef(false);

  const load = async () => {
    if (!supabase) return;
    // Só mostra "Carregando…" na primeira vez: recarregar depois de convidar
    // ou remover desmontava a lista e jogava o foco do teclado para o body.
    if (!loadedOnce.current) setLoading(true);
    const { data, error } = await supabase
      .from('allowed_emails')
      .select('email, created_at')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Falha ao carregar a lista de acessos:', error);
      setLoadError('Não foi possível carregar a lista de acessos.');
    } else {
      setLoadError(null);
      setEmails(data ?? []);
    }
    loadedOnce.current = true;
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    // O banco guarda tudo minúsculo; sem normalizar aqui, "Ana@x.com" viraria
    // uma entrada que nunca casa com o login de "ana@x.com".
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    if (email.endsWith(`@${AUTO_ALLOWED_DOMAIN}`)) {
      toast.info(`Não precisa convidar: todo e-mail @${AUTO_ALLOWED_DOMAIN} já tem acesso.`);
      setNewEmail('');
      return;
    }

    setSubmitting(true);
    // `invited_by` é enviado explicitamente, mesmo existindo DEFAULT auth.uid()
    // na coluna: a política de INSERT exige `invited_by = auth.uid()`, e depender
    // da ordem entre aplicar o default e avaliar o WITH CHECK deixaria o convite
    // quebrando por um detalhe interno do banco.
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('allowed_emails')
      .insert({ email, invited_by: userData.user?.id ?? null });
    setSubmitting(false);

    if (error) {
      // Mensagens do Postgres vêm em inglês e falando de "row-level security
      // policy" — inútil para quem usa a ferramenta. O texto cru vai para o
      // console de quem for investigar.
      console.error('Falha ao convidar:', error);
      if (error.code === '23505') toast.error('Esse e-mail já está na lista.');
      else if (isPermissionError(error)) toast.error(SEM_PERMISSAO);
      else toast.error('Não foi possível convidar. Tente de novo.');
      return;
    }
    setNewEmail('');
    toast.success(`${email} agora pode entrar.`);
    await load();
    inviteInputRef.current?.focus();
  };

  const handleRemove = async () => {
    if (!supabase || !toRemove) return;
    const target = toRemove;
    setToRemove(null);

    // `select()` faz o PostgREST devolver as linhas afetadas. Sem isso, uma
    // exclusão barrada pela RLS volta "0 linhas e nenhum erro" e a tela dizia
    // "não tem mais acesso" para alguém que continuava com acesso.
    const { data, error } = await supabase
      .from('allowed_emails')
      .delete()
      .eq('email', target.email)
      .select('email');

    if (error) {
      console.error('Falha ao remover acesso:', error);
      toast.error(isPermissionError(error) ? SEM_PERMISSAO : 'Não foi possível remover. Tente de novo.');
    } else if (!data || data.length === 0) {
      toast.error(SEM_PERMISSAO);
    } else {
      toast.success(`${target.email} não tem mais acesso.`);
    }
    await load();
    inviteInputRef.current?.focus();
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Nav onBack={onBack} />
        <main className={DS.layout.maxWidth + ' py-12'}>
          <Card>
            <p className={DS.typography.body}>
              O controle de acesso só existe quando a ferramenta está ligada ao
              banco de dados (Supabase). Hoje ela está rodando apenas com dados
              locais neste navegador, sem login.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Nav onBack={onBack} />

      <main className={DS.layout.maxWidth + ' py-12 space-y-8'}>
        <Card className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className={DS.typography.section}>Acesso liberado por domínio</h2>
              <p className={DS.typography.body}>
                Qualquer pessoa com e-mail <strong>@{AUTO_ALLOWED_DOMAIN}</strong>{' '}
                entra direto, sem precisar de convite. Para e-mails de fora
                (Gmail, e-mail do cliente, etc.), use a lista abaixo.
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <h2 className={DS.typography.section}>Convidados</h2>
            <p className={DS.typography.caption}>
              E-mails de fora do domínio que podem entrar na ferramenta.
            </p>
          </div>

          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor={newEmailId} className="sr-only">E-mail para convidar</label>
              <input
                id={newEmailId}
                ref={inviteInputRef}
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={DS.inputs.base}
                placeholder="pessoa@empresa.com.br"
              />
            </div>
            <Button type="submit" disabled={submitting}>
              <UserPlus className="size-4" aria-hidden="true" />
              {submitting ? 'Convidando…' : 'Convidar'}
            </Button>
          </form>

          {loading && <p className={DS.typography.body} role="status">Carregando…</p>}

          {loadError && (
            <p role="alert" className="text-red-700 text-xs font-bold">{loadError}</p>
          )}

          {!loading && !loadError && emails.length === 0 && (
            <p className={DS.typography.caption}>
              Ninguém de fora do domínio foi convidado ainda.
            </p>
          )}

          {emails.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {emails.map(entry => (
                <li key={entry.email} className="flex items-center justify-between py-4 gap-4">
                  <div className="min-w-0">
                    <p className={DS.typography.bodyEmphasis + ' truncate'}>{entry.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToRemove(entry)}
                    className={DS.buttons.danger + ' shrink-0'}
                    aria-label={`Remover acesso de ${entry.email}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>

      <DeleteConfirmDialog
        isOpen={toRemove !== null}
        title="Remover acesso?"
        message={
          toRemove
            ? `${toRemove.email} não vai mais conseguir entrar na ferramenta. As avaliações que essa pessoa já registrou continuam salvas.`
            : ''
        }
        onConfirm={handleRemove}
        onClose={() => setToRemove(null)}
      />
    </div>
  );
}

function Nav({ onBack }: { onBack: () => void }) {
  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
      <div className={DS.layout.maxWidth + ' flex items-center gap-4'}>
        <button type="button" onClick={onBack} aria-label="Voltar" className={DS.buttons.ghost}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className={DS.typography.cardTitle}>Quem pode acessar</h1>
      </div>
    </nav>
  );
}
