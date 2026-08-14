import { useState, useEffect, useId } from 'react';
import { supabase, isSupabaseConfigured, AUTO_ALLOWED_DOMAIN } from '../lib/supabase/client';
import { DS, Button, Card } from './DesignSystem';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ArrowLeft, UserPlus, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AllowedEmail {
  email: string;
  invited_by: string | null;
  created_at: string;
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

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('allowed_emails')
      .select('email, invited_by, created_at')
      .order('created_at', { ascending: true });
    if (error) {
      setLoadError(error.message);
    } else {
      setLoadError(null);
      setEmails(data ?? []);
    }
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
    const { error } = await supabase.from('allowed_emails').insert({ email });
    setSubmitting(false);

    if (error) {
      toast.error(
        error.code === '23505'
          ? 'Esse e-mail já está na lista.'
          : `Não foi possível convidar: ${error.message}`
      );
      return;
    }
    setNewEmail('');
    toast.success(`${email} agora pode entrar.`);
    void load();
  };

  const handleRemove = async () => {
    if (!supabase || !toRemove) return;
    const { error } = await supabase
      .from('allowed_emails')
      .delete()
      .eq('email', toRemove.email);
    if (error) {
      toast.error(`Não foi possível remover: ${error.message}`);
    } else {
      toast.success(`${toRemove.email} não tem mais acesso.`);
      void load();
    }
    setToRemove(null);
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
            <p role="alert" className="text-red-500 text-xs font-bold">
              Não foi possível carregar a lista: {loadError}
            </p>
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
                    {entry.invited_by && (
                      <p className={DS.typography.caption + ' truncate'}>
                        convidado por {entry.invited_by}
                      </p>
                    )}
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
