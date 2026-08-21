import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Download,
  FileCheck2,
  FilePlus2,
  Files,
  FolderKanban,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { getSupabaseBrowserClient, portalBasePath } from '../../lib/supabase';
import {
  FILE_ACCEPT,
  PORTAL_BUCKET,
  formatBytes,
  formatDate,
  sanitizeFileName,
  submissionStatuses,
  validateFiles,
  type CaseRecord,
  type CaseUpdate,
  type DocumentRecord,
  type Profile,
  type Submission,
  type SubmissionStatus,
  type Visibility,
} from '../../lib/portal';

type Notice = { kind: 'success' | 'error'; message: string } | null;
type ClientTab = 'cases' | 'upload' | 'submissions';
type AdminTab = 'dashboard' | 'clients' | 'cases' | 'submissions';

const documentTypes = ['Genel Evrak', 'Çek', 'Fatura', 'Cari Hesap Ekstresi', 'Vekâletname', 'Dilekçe', 'Mahkeme Evrakı', 'Diğer'];
const caseStatuses = ['Açık', 'Hazırlık', 'İncelemede', 'Duruşma Bekleniyor', 'İcra Takibinde', 'Sonuçlandı', 'Kapalı'];

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/invalid login credentials/i.test(message)) return 'E-posta veya şifre hatalı.';
  if (/email not confirmed/i.test(message)) return 'E-posta adresinizi doğrulamanız gerekiyor.';
  if (/network|fetch/i.test(message)) return 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.';
  if (/row-level security|policy/i.test(message)) return 'Bu işlem için yetkiniz bulunmuyor.';
  if (/already registered|already exists/i.test(message)) return 'Bu e-posta adresiyle bir hesap zaten var.';
  return message || 'Beklenmeyen bir hata oluştu.';
}

function Button({ children, className = '', variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const variants = {
    primary: 'bg-[var(--ink-strong)] text-[var(--bg-elevated)] hover:bg-[var(--brand-deep)]',
    secondary: 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--ink-strong)] hover:bg-[var(--brand-soft)]',
    ghost: 'text-[var(--ink-default)] hover:bg-[var(--brand-soft)]',
    danger: 'border border-[var(--danger)]/30 text-[var(--danger)] hover:bg-[var(--accent-soft)]',
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[var(--ink-strong)]">
      <span>{label}</span>
      {children}
      {hint && <span className="text-xs font-normal text-[var(--ink-muted)]">{hint}</span>}
    </label>
  );
}

const inputClass = 'min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm text-[var(--ink-strong)] placeholder:text-[var(--ink-faint)] focus:border-[var(--brand)]';

function Alert({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <div role={notice.kind === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${notice.kind === 'error' ? 'border-[var(--danger)]/30 bg-[var(--accent-soft)] text-[var(--danger)]' : 'border-[var(--success)]/30 bg-[var(--brand-soft)] text-[var(--ink-strong)]'}`}>
      {notice.kind === 'error' ? <CircleAlert className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />}
      <span>{notice.message}</span>
    </div>
  );
}

function LoadingScreen({ label = 'Portal hazırlanıyor…' }: { label?: string }) {
  return (
    <div className="grid min-h-[62vh] place-items-center px-5">
      <div className="flex items-center gap-3 text-sm text-[var(--ink-muted)]">
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon = Files, title, description, action }: { icon?: typeof Files; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-14 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-deep)]"><Icon className="size-5" /></div>
      <h3 className="font-display text-xl font-medium text-[var(--ink-strong)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--ink-muted)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = submissionStatuses[status as SubmissionStatus] || status;
  return <span className="inline-flex rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-deep)]">{label}</span>;
}

async function openDocument(client: SupabaseClient, document: DocumentRecord, setNotice: (notice: Notice) => void) {
  setNotice(null);
  const { data, error } = await client.storage.from(PORTAL_BUCKET).createSignedUrl(document.storage_path, 60);
  if (error) {
    setNotice({ kind: 'error', message: `Belge açılamadı: ${friendlyError(error)}` });
    return;
  }
  window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}

function Login({ client }: { client: SupabaseClient }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setNotice({ kind: 'error', message: friendlyError(error) });
    setBusy(false);
  }

  async function resetPassword() {
    if (!email.trim()) {
      setNotice({ kind: 'error', message: 'Önce e-posta adresinizi yazın.' });
      return;
    }
    setBusy(true);
    const redirectTo = `${window.location.origin}${portalBasePath === '/' ? '' : portalBasePath}?mode=setup`;
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setNotice(error ? { kind: 'error', message: friendlyError(error) } : { kind: 'success', message: 'Şifre yenileme bağlantısı e-posta adresinize gönderildi.' });
    setBusy(false);
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden px-5 py-10 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,var(--brand-soft),transparent_35%),radial-gradient(circle_at_88%_80%,var(--accent-soft),transparent_30%)]" />
      <div className="relative mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden bg-[var(--ink-strong)] p-12 text-[var(--bg-elevated)] lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs tracking-wide text-white/70"><ShieldCheck className="size-4" /> Güvenli Müvekkil Portalı</div>
            <h1 className="font-display text-5xl font-medium leading-[1.05] text-white">Dosyalarınız,<br /><em className="font-light">güvenle elinizin altında.</em></h1>
            <p className="mt-6 max-w-md text-sm font-light leading-7 text-white/65">Dava ve takip dosyalarınızı görüntüleyin, paylaşılan belgelere erişin ve evraklarınızı güvenli biçimde iletin.</p>
          </div>
          <p className="text-xs text-white/45">Dişçi Hukuk Bürosu · Yetkisiz erişim yasaktır.</p>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8 grid size-12 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-deep)]"><LockKeyhole className="size-5" /></div>
          <p className="eyebrow">Müvekkil Girişi</p>
          <h2 className="mt-3 font-display text-3xl font-medium text-[var(--ink-strong)]">Hoş geldiniz</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">Hesabınız yalnızca büromuz tarafından oluşturulur. Açık kayıt bulunmamaktadır.</p>

          <form onSubmit={submit} className="mt-8 grid gap-5">
            <Field label="E-posta adresi">
              <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Şifre">
              <input className={inputClass} type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Alert notice={notice} />
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
              Güvenli Giriş
            </Button>
            <button type="button" disabled={busy} onClick={resetPassword} className="mx-auto text-sm text-[var(--brand-deep)] underline-offset-4 hover:underline">Şifremi unuttum</button>
          </form>
        </section>
      </div>
    </div>
  );
}

function PasswordSetup({ client, onDone }: { client: SupabaseClient; onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 10) {
      setNotice({ kind: 'error', message: 'Şifre en az 10 karakter olmalıdır.' });
      return;
    }
    if (password !== confirm) {
      setNotice({ kind: 'error', message: 'Şifreler eşleşmiyor.' });
      return;
    }
    setBusy(true);
    const { error } = await client.auth.updateUser({ password });
    if (error) setNotice({ kind: 'error', message: friendlyError(error) });
    else {
      window.history.replaceState({}, '', window.location.pathname);
      onDone();
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto grid min-h-[65vh] max-w-lg place-items-center px-5 py-12">
      <form onSubmit={submit} className="w-full rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-md)] sm:p-9">
        <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-deep)]"><LockKeyhole className="size-5" /></div>
        <p className="eyebrow">Hesap Aktivasyonu</p>
        <h1 className="mt-3 font-display text-3xl font-medium">Şifrenizi belirleyin</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">En az 10 karakterli, başka bir yerde kullanmadığınız güçlü bir şifre seçin.</p>
        <div className="mt-7 grid gap-5">
          <Field label="Yeni şifre"><input className={inputClass} type="password" autoComplete="new-password" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <Field label="Yeni şifre (tekrar)"><input className={inputClass} type="password" autoComplete="new-password" required minLength={10} value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
          <Alert notice={notice} />
          <Button type="submit" disabled={busy}>{busy && <LoaderCircle className="size-4 animate-spin" />}Şifreyi Kaydet</Button>
        </div>
      </form>
    </div>
  );
}

function MFAGate({ client, onVerified }: { client: SupabaseClient; onVerified: () => void }) {
  const [mode, setMode] = useState<'loading' | 'enroll' | 'challenge'>('loading');
  const [factorId, setFactorId] = useState('');
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: aal, error: aalError } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!active) return;
      if (aalError) {
        setNotice({ kind: 'error', message: friendlyError(aalError) });
        setMode('challenge');
        return;
      }
      if (aal.currentLevel === 'aal2') {
        onVerified();
        return;
      }
      const { data: factors, error: factorError } = await client.auth.mfa.listFactors();
      if (!active) return;
      if (factorError) {
        setNotice({ kind: 'error', message: friendlyError(factorError) });
        setMode('challenge');
        return;
      }
      const verified = factors.totp.find((factor) => factor.status === 'verified');
      if (verified) {
        setFactorId(verified.id);
        setMode('challenge');
        return;
      }
      const { data: enrollment, error: enrollError } = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Dişçi Hukuk Portalı' });
      if (!active) return;
      if (enrollError) {
        setNotice({ kind: 'error', message: friendlyError(enrollError) });
        setMode('challenge');
        return;
      }
      setFactorId(enrollment.id);
      setQr(enrollment.totp.qr_code);
      setSecret(enrollment.totp.secret);
      setMode('enroll');
    })();
    return () => { active = false; };
  }, [client, onVerified]);

  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setNotice({ kind: 'error', message: friendlyError(challengeError) });
      setBusy(false);
      return;
    }
    const { error } = await client.auth.mfa.verify({ factorId, challengeId: challenge.id, code: code.trim() });
    if (error) setNotice({ kind: 'error', message: 'Kod doğrulanamadı. Yeni kodu kontrol edip tekrar deneyin.' });
    else onVerified();
    setBusy(false);
  }

  if (mode === 'loading') return <LoadingScreen label="İki aşamalı doğrulama kontrol ediliyor…" />;

  return (
    <div className="mx-auto grid min-h-[65vh] max-w-xl place-items-center px-5 py-12">
      <form onSubmit={verify} className="w-full rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-md)] sm:p-9">
        <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-deep)]"><ShieldCheck className="size-5" /></div>
        <p className="eyebrow">Yönetici Güvenliği</p>
        <h1 className="mt-3 font-display text-3xl font-medium">{mode === 'enroll' ? 'İki aşamalı doğrulamayı kurun' : 'Doğrulama kodunu girin'}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{mode === 'enroll' ? 'QR kodunu bir doğrulayıcı uygulamayla tarayın. Yönetici paneli yalnızca AAL2 oturumlarla açılır.' : 'Doğrulayıcı uygulamanızdaki güncel 6 haneli kodu girin.'}</p>
        {mode === 'enroll' && qr && (
          <div className="mt-6 grid justify-items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-white p-5">
            <img src={qr} alt="Doğrulayıcı uygulama için QR kodu" className="size-48" />
            <code className="max-w-full break-all text-center text-xs text-slate-700">{secret}</code>
          </div>
        )}
        <div className="mt-6 grid gap-4">
          <Field label="6 haneli kod"><input className={`${inputClass} text-center text-lg tracking-[0.35em]`} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} /></Field>
          <Alert notice={notice} />
          <Button type="submit" disabled={busy || !factorId}>{busy && <LoaderCircle className="size-4 animate-spin" />}Doğrula ve Devam Et</Button>
        </div>
      </form>
    </div>
  );
}

function PortalShell<T extends string>({ profile, tabs, current, onChange, onSignOut, children }: {
  profile: Profile;
  tabs: { id: T; label: string; icon: typeof Files }[];
  current: T;
  onChange: (tab: T) => void;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[var(--bg-base)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--bg-elevated)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMenuOpen(true)} className="grid size-11 place-items-center rounded-xl hover:bg-[var(--brand-soft)] lg:hidden" aria-label="Portal menüsünü aç"><Menu className="size-5" /></button>
            <div>
              <p className="font-display text-lg font-medium text-[var(--ink-strong)]">Dişçi Hukuk</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted)]">Müvekkil Portalı</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-medium">{profile.display_name}</p><p className="text-xs text-[var(--ink-muted)]">{profile.role === 'admin' ? 'Yönetici' : 'Müvekkil'}</p></div>
            <Button variant="ghost" onClick={onSignOut} aria-label="Çıkış yap"><LogOut className="size-4" /><span className="hidden sm:inline">Çıkış</span></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl lg:grid-cols-[240px_1fr]">
        <aside className="hidden min-h-[calc(100vh-13rem)] border-r border-[var(--border-soft)] px-4 py-7 lg:block">
          <nav aria-label="Portal menüsü" className="grid gap-1">
            {tabs.map((tab) => <NavButton key={tab.id} tab={tab} active={current === tab.id} onClick={() => onChange(tab.id)} />)}
          </nav>
          <div className="mt-8 rounded-2xl bg-[var(--brand-soft)] p-4 text-xs leading-5 text-[var(--ink-muted)]"><ShieldCheck className="mb-2 size-4 text-[var(--brand-deep)]" />Belgeleriniz özel depolama alanında korunur. Bağlantılar kısa süreli ve kişiye özeldir.</div>
        </aside>
        <main className="min-w-0 px-4 py-7 sm:px-6 sm:py-9 lg:px-10">{children}</main>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/35" aria-label="Menüyü kapat" onClick={() => setMenuOpen(false)} />
          <aside className="relative h-full w-[min(84vw,320px)] bg-[var(--bg-elevated)] p-5 shadow-2xl">
            <div className="mb-8 flex items-center justify-between"><p className="font-display text-xl font-medium">Portal Menüsü</p><button className="grid size-10 place-items-center rounded-xl hover:bg-[var(--brand-soft)]" onClick={() => setMenuOpen(false)} aria-label="Menüyü kapat"><X className="size-5" /></button></div>
            <nav className="grid gap-1">{tabs.map((tab) => <NavButton key={tab.id} tab={tab} active={current === tab.id} onClick={() => { onChange(tab.id); setMenuOpen(false); }} />)}</nav>
          </aside>
        </div>
      )}
    </div>
  );
}

function NavButton<T extends string>({ tab, active, onClick }: { tab: { id: T; label: string; icon: typeof Files }; active: boolean; onClick: () => void }) {
  const Icon = tab.icon;
  return <button type="button" onClick={onClick} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${active ? 'bg-[var(--ink-strong)] text-[var(--bg-elevated)]' : 'text-[var(--ink-default)] hover:bg-[var(--brand-soft)]'}`}><Icon className="size-4" />{tab.label}</button>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 font-display text-3xl font-medium text-[var(--ink-strong)] sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">{description}</p>}</div>
      {action}
    </div>
  );
}

function DocumentList({ client, documents, setNotice }: { client: SupabaseClient; documents: DocumentRecord[]; setNotice: (notice: Notice) => void }) {
  if (!documents.length) return <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--ink-muted)]">Henüz paylaşılmış belge yok.</p>;
  return (
    <ul className="grid gap-2">
      {documents.map((document) => (
        <li key={document.id} className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-3.5 sm:flex-row sm:items-center">
          <div className="min-w-0"><p className="truncate text-sm font-medium text-[var(--ink-strong)]">{document.file_name}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{document.document_type} · {formatBytes(document.size_bytes)} · {formatDate(document.created_at)}</p></div>
          <Button variant="secondary" onClick={() => void openDocument(client, document, setNotice)}><Download className="size-4" />Görüntüle / İndir</Button>
        </li>
      ))}
    </ul>
  );
}

function ClientPortal({ client, session, profile }: { client: SupabaseClient; session: Session; profile: Profile }) {
  const [tab, setTab] = useState<ClientTab>('cases');
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [updates, setUpdates] = useState<CaseUpdate[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    const [caseResult, submissionResult] = await Promise.all([
      client.from('cases').select('*').order('updated_at', { ascending: false }),
      client.from('submissions').select('id,client_id,case_id,subject,description,document_type,status,created_at,updated_at').order('created_at', { ascending: false }),
    ]);
    const error = caseResult.error || submissionResult.error;
    if (error) setNotice({ kind: 'error', message: friendlyError(error) });
    else {
      setCases((caseResult.data || []) as CaseRecord[]);
      setSubmissions((submissionResult.data || []) as Submission[]);
    }
    setLoading(false);
  }, [client]);

  useEffect(() => { void load(); }, [load]);

  async function showCase(caseRecord: CaseRecord) {
    setSelectedCase(caseRecord);
    setNotice(null);
    const [updateResult, documentResult] = await Promise.all([
      client.from('case_updates').select('*').eq('case_id', caseRecord.id).order('published_at', { ascending: false }),
      client.from('documents').select('*').eq('case_id', caseRecord.id).order('created_at', { ascending: false }),
    ]);
    const error = updateResult.error || documentResult.error;
    if (error) setNotice({ kind: 'error', message: friendlyError(error) });
    else {
      setUpdates((updateResult.data || []) as CaseUpdate[]);
      setDocuments((documentResult.data || []) as DocumentRecord[]);
    }
  }

  const tabs = [
    { id: 'cases' as const, label: 'Dosyalarım', icon: FolderKanban },
    { id: 'upload' as const, label: 'Evrak Gönder', icon: FilePlus2 },
    { id: 'submissions' as const, label: 'Gönderilerim', icon: FileCheck2 },
  ];

  return (
    <PortalShell profile={profile} tabs={tabs} current={tab} onChange={(next) => { setTab(next); setSelectedCase(null); setNotice(null); }} onSignOut={() => void client.auth.signOut()}>
      <Alert notice={notice} />
      {loading ? <LoadingScreen label="Bilgileriniz yükleniyor…" /> : tab === 'cases' ? (
        selectedCase ? <ClientCaseDetail client={client} caseRecord={selectedCase} updates={updates} documents={documents} notice={notice} setNotice={setNotice} onBack={() => setSelectedCase(null)} /> : (
          <>
            <PageHeader eyebrow="Dosyalarım" title={`Merhaba, ${profile.display_name}`} description="Size ait dava ve takip dosyalarının güncel durumunu burada görebilirsiniz." />
            {cases.length ? <div className="grid gap-4 md:grid-cols-2">{cases.map((caseRecord) => <button key={caseRecord.id} type="button" onClick={() => void showCase(caseRecord)} className="group rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-5 text-left shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-[var(--shadow-md)]"><div className="flex items-start justify-between gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]"><BriefcaseBusiness className="size-4" /></div><StatusBadge status={caseRecord.status} /></div><h2 className="mt-5 font-display text-xl font-medium text-[var(--ink-strong)]">{caseRecord.title}</h2>{caseRecord.reference_number && <p className="mt-1 text-xs text-[var(--ink-muted)]">Dosya / Takip No: {caseRecord.reference_number}</p>}<p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--ink-default)]">{caseRecord.client_summary || 'Dosya açıklaması henüz eklenmedi.'}</p><div className="mt-5 flex items-center justify-between border-t border-[var(--border-soft)] pt-4 text-xs text-[var(--ink-muted)]"><span>Son güncelleme {formatDate(caseRecord.updated_at)}</span><ChevronRight className="size-4 transition group-hover:translate-x-0.5" /></div></button>)}</div> : <EmptyState icon={FolderKanban} title="Henüz dosya bulunmuyor" description="Büronuz sizinle bir dosya paylaştığında burada görüntülenecek." />}
          </>
        )
      ) : tab === 'upload' ? <SubmissionForm client={client} userId={session.user.id} onCreated={async () => { await load(); setTab('submissions'); }} /> : <ClientSubmissions client={client} submissions={submissions} setNotice={setNotice} />}
    </PortalShell>
  );
}

function ClientCaseDetail({ client, caseRecord, updates, documents, notice, setNotice, onBack }: { client: SupabaseClient; caseRecord: CaseRecord; updates: CaseUpdate[]; documents: DocumentRecord[]; notice: Notice; setNotice: (notice: Notice) => void; onBack: () => void }) {
  return (
    <>
      <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm text-[var(--brand-deep)] hover:underline"><ArrowLeft className="size-4" />Dosyalarıma dön</button>
      <Alert notice={notice} />
      <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="eyebrow">Dosya Detayı</p><h1 className="mt-2 font-display text-3xl font-medium">{caseRecord.title}</h1>{caseRecord.reference_number && <p className="mt-2 text-sm text-[var(--ink-muted)]">Dosya / Takip No: {caseRecord.reference_number}</p>}</div><StatusBadge status={caseRecord.status} /></div>
        {caseRecord.client_summary && <p className="mt-6 max-w-3xl border-t border-[var(--border-soft)] pt-5 text-sm leading-7 text-[var(--ink-default)]">{caseRecord.client_summary}</p>}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section><h2 className="mb-4 font-display text-2xl font-medium">Paylaşılan Belgeler</h2><DocumentList client={client} documents={documents} setNotice={setNotice} /></section>
        <section><h2 className="mb-4 font-display text-2xl font-medium">Durum Güncellemeleri</h2>{updates.length ? <ol className="grid gap-3">{updates.map((update) => <li key={update.id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-4"><p className="text-xs text-[var(--ink-muted)]">{formatDate(update.published_at, true)}</p><h3 className="mt-2 font-medium text-[var(--ink-strong)]">{update.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--ink-default)]">{update.body}</p></li>)}</ol> : <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--ink-muted)]">Henüz paylaşılmış güncelleme yok.</p>}</section>
      </div>
    </>
  );
}

function SubmissionForm({ client, userId, onCreated }: { client: SupabaseClient; userId: string; onCreated: () => Promise<void> }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [notice, setNotice] = useState<Notice>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const validationError = validateFiles(files);
    if (validationError) { setNotice({ kind: 'error', message: validationError }); return; }
    setBusy(true);
    setNotice(null);
    setProgress('Gönderi kaydı oluşturuluyor…');
    const { data: submission, error: submissionError } = await client.from('submissions').insert({ client_id: userId, subject: subject.trim(), description: description.trim() || null, document_type: documentType, status: 'new' }).select('id').single();
    if (submissionError || !submission) {
      setNotice({ kind: 'error', message: friendlyError(submissionError) }); setBusy(false); setProgress(''); return;
    }
    let completed = 0;
    for (const file of files) {
      setProgress(`${files.length} dosyadan ${completed + 1}. yükleniyor…`);
      const path = `${userId}/submissions/${submission.id}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
      const { error: uploadError } = await client.storage.from(PORTAL_BUCKET).upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false });
      if (uploadError) {
        setNotice({ kind: 'error', message: `${file.name} yüklenemedi. Gönderi kaydedildi; lütfen büromuzla iletişime geçin. ${friendlyError(uploadError)}` }); setBusy(false); setProgress(''); return;
      }
      const { error: documentError } = await client.from('documents').insert({ submission_id: submission.id, case_id: null, owner_client_id: userId, uploaded_by: userId, uploader_party: 'client', visibility: 'client', document_type: documentType, storage_path: path, file_name: file.name, mime_type: file.type, size_bytes: file.size });
      if (documentError) {
        setNotice({ kind: 'error', message: `${file.name} kaydı tamamlanamadı. Gönderi kaydedildi; lütfen büromuzla iletişime geçin. ${friendlyError(documentError)}` }); setBusy(false); setProgress(''); return;
      }
      completed += 1;
    }
    setNotice({ kind: 'success', message: 'Evraklarınız güvenli biçimde gönderildi.' });
    setBusy(false); setProgress('');
    await onCreated();
  }

  return (
    <>
      <PageHeader eyebrow="Evrak Gönder" title="Yeni evrak iletin" description="Evrakınızın mevcut bir dosyaya bağlı olması gerekmez. İnceleme sonrasında büromuz gerekirse ilgili dosyayla eşleştirir." />
      <form onSubmit={submit} className="grid max-w-3xl gap-5 rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-sm)] sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2"><Field label="Konu"><input className={inputClass} required maxLength={200} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Örn. İcra takibi için çek ve faturalar" /></Field><Field label="Evrak türü"><select className={inputClass} value={documentType} onChange={(e) => setDocumentType(e.target.value)}>{documentTypes.map((type) => <option key={type}>{type}</option>)}</select></Field></div>
        <Field label="Kısa açıklama" hint="Kişisel veya hassas bilgileri yalnızca işlem için gerekliyse ekleyin."><textarea className={`${inputClass} min-h-28 resize-y`} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Evrakların ne için gönderildiğini kısaca açıklayın." /></Field>
        <Field label="Dosyalar" hint="PDF, JPG, JPEG, PNG veya DOCX · Her dosya en fazla 15 MB · En fazla 10 dosya"><input className={`${inputClass} cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--brand-soft)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--brand-deep)]`} type="file" multiple accept={FILE_ACCEPT} required onChange={(e) => setFiles(Array.from(e.target.files || []))} /></Field>
        {files.length > 0 && <ul className="grid gap-1 rounded-xl bg-[var(--brand-soft)] p-3 text-xs text-[var(--ink-default)]">{files.map((file) => <li key={`${file.name}-${file.size}`} className="flex justify-between gap-3"><span className="truncate">{file.name}</span><span className="shrink-0 text-[var(--ink-muted)]">{formatBytes(file.size)}</span></li>)}</ul>}
        <Alert notice={notice} />
        {progress && <p role="status" className="flex items-center gap-2 text-sm text-[var(--ink-muted)]"><LoaderCircle className="size-4 animate-spin" />{progress}</p>}
        <Button type="submit" disabled={busy}><Upload className="size-4" />Evrakları Güvenli Gönder</Button>
      </form>
    </>
  );
}

function ClientSubmissions({ client, submissions, setNotice }: { client: SupabaseClient; submissions: Submission[]; setNotice: (notice: Notice) => void }) {
  const [documentsBySubmission, setDocumentsBySubmission] = useState<Record<string, DocumentRecord[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  async function toggle(submission: Submission) {
    if (expanded === submission.id) { setExpanded(null); return; }
    setExpanded(submission.id);
    if (documentsBySubmission[submission.id]) return;
    const { data, error } = await client.from('documents').select('*').eq('submission_id', submission.id).order('created_at');
    if (error) setNotice({ kind: 'error', message: friendlyError(error) });
    else setDocumentsBySubmission((current) => ({ ...current, [submission.id]: (data || []) as DocumentRecord[] }));
  }

  return (
    <><PageHeader eyebrow="Gönderilerim" title="Evrak gönderileriniz" description="Gönderdiğiniz evrakların inceleme durumunu ve eklerini takip edin." />{submissions.length ? <div className="grid gap-3">{submissions.map((submission) => <article key={submission.id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)]"><button type="button" onClick={() => void toggle(submission)} className="flex w-full flex-col justify-between gap-4 p-4 text-left sm:flex-row sm:items-center sm:p-5"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-medium text-[var(--ink-strong)]">{submission.subject}</h2><StatusBadge status={submission.status} /></div><p className="mt-2 text-xs text-[var(--ink-muted)]">{submission.document_type} · {formatDate(submission.created_at, true)}</p></div><ChevronRight className={`size-4 shrink-0 transition ${expanded === submission.id ? 'rotate-90' : ''}`} /></button>{expanded === submission.id && <div className="border-t border-[var(--border-soft)] px-4 py-5 sm:px-5">{submission.description && <p className="mb-4 whitespace-pre-wrap text-sm leading-6 text-[var(--ink-default)]">{submission.description}</p>}<DocumentList client={client} documents={documentsBySubmission[submission.id] || []} setNotice={setNotice} /></div>}</article>)}</div> : <EmptyState icon={FileCheck2} title="Henüz gönderiniz yok" description="Evrak Gönder ekranından ilettiğiniz belgeler burada durumlarıyla listelenecek." />}</>
  );
}

function AdminPortal({ client, session, profile }: { client: SupabaseClient; session: Session; profile: Profile }) {
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [profileResult, caseResult, submissionResult, documentResult] = await Promise.all([
      client.from('profiles').select('*').order('display_name'),
      client.from('cases').select('*').order('updated_at', { ascending: false }),
      client.from('submissions').select('*').order('updated_at', { ascending: false }),
      client.from('documents').select('*').order('created_at', { ascending: false }),
    ]);
    const error = profileResult.error || caseResult.error || submissionResult.error || documentResult.error;
    if (error) setNotice({ kind: 'error', message: friendlyError(error) });
    else {
      setProfiles((profileResult.data || []) as Profile[]);
      setCases((caseResult.data || []) as CaseRecord[]);
      setSubmissions((submissionResult.data || []) as Submission[]);
      setDocuments((documentResult.data || []) as DocumentRecord[]);
    }
    setLoading(false);
  }, [client]);

  useEffect(() => { void load(); }, [load]);
  const clients = profiles.filter((item) => item.role === 'client');
  const tabs = [
    { id: 'dashboard' as const, label: 'Gösterge Paneli', icon: LayoutDashboard },
    { id: 'clients' as const, label: 'Müvekkiller', icon: Users },
    { id: 'cases' as const, label: 'Dosyalar', icon: FolderKanban },
    { id: 'submissions' as const, label: 'Gelen Evraklar', icon: FileCheck2 },
  ];

  return (
    <PortalShell profile={profile} tabs={tabs} current={tab} onChange={(next) => { setTab(next); setNotice(null); }} onSignOut={() => void client.auth.signOut()}>
      <Alert notice={notice} />
      {loading ? <LoadingScreen label="Yönetici paneli yükleniyor…" /> : tab === 'dashboard' ? <AdminDashboard cases={cases} submissions={submissions} clients={clients} onNavigate={setTab} /> : tab === 'clients' ? <AdminClients client={client} clients={clients} onChanged={load} setNotice={setNotice} /> : tab === 'cases' ? <AdminCases client={client} adminId={session.user.id} cases={cases} clients={clients} documents={documents} onChanged={load} setNotice={setNotice} /> : <AdminSubmissions client={client} submissions={submissions} cases={cases} documents={documents} onChanged={load} setNotice={setNotice} />}
    </PortalShell>
  );
}

function AdminDashboard({ cases, submissions, clients, onNavigate }: { cases: CaseRecord[]; submissions: Submission[]; clients: Profile[]; onNavigate: (tab: AdminTab) => void }) {
  const cards = [
    { label: 'Yeni gelen evrak', value: submissions.filter((item) => item.status === 'new').length, icon: FilePlus2, tab: 'submissions' as const },
    { label: 'İnceleme bekleyen', value: submissions.filter((item) => ['new', 'reviewing'].includes(item.status)).length, icon: Files, tab: 'submissions' as const },
    { label: 'Aktif müvekkil', value: clients.filter((item) => item.is_active).length, icon: Users, tab: 'clients' as const },
  ];
  return (
    <><PageHeader eyebrow="Yönetim" title="Gösterge Paneli" description="Müvekkil portalındaki güncel iş yükünün kısa özeti." />
      <div className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon, tab }) => <button key={label} onClick={() => onNavigate(tab)} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-5 text-left shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5"><div className="flex items-center justify-between"><div className="grid size-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]"><Icon className="size-4" /></div><span className="font-display text-4xl font-medium">{value}</span></div><p className="mt-5 text-sm text-[var(--ink-muted)]">{label}</p></button>)}</div>
      <section className="mt-8"><h2 className="mb-4 font-display text-2xl font-medium">Yakın zamanda güncellenen dosyalar</h2>{cases.length ? <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)]"><ul className="divide-y divide-[var(--border-soft)]">{cases.slice(0, 6).map((item) => <li key={item.id} className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center"><div><p className="font-medium">{item.title}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{item.reference_number || 'Numara yok'}</p></div><div className="flex items-center gap-3"><StatusBadge status={item.status} /><span className="text-xs text-[var(--ink-muted)]">{formatDate(item.updated_at)}</span></div></li>)}</ul></div> : <EmptyState icon={FolderKanban} title="Henüz dosya yok" description="İlk dosyayı Dosyalar ekranından oluşturabilirsiniz." />}</section>
    </>
  );
}

function AdminClients({ client, clients, onChanged, setNotice }: { client: SupabaseClient; clients: Profile[]; onChanged: () => Promise<void>; setNotice: (notice: Notice) => void }) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);

  async function invite(event: FormEvent) {
    event.preventDefault(); setBusy(true); setNotice(null);
    const { error } = await client.functions.invoke('invite-client', { body: { email: email.trim(), displayName: displayName.trim(), companyName: companyName.trim() || null } });
    if (error) setNotice({ kind: 'error', message: friendlyError(error) });
    else { setNotice({ kind: 'success', message: 'Müvekkil daveti gönderildi.' }); setEmail(''); setDisplayName(''); setCompanyName(''); await onChanged(); }
    setBusy(false);
  }

  async function saveClient(event: FormEvent) {
    event.preventDefault(); if (!editing) return; setBusy(true);
    const { error } = await client.from('profiles').update({ display_name: editing.display_name.trim(), company_name: editing.company_name?.trim() || null, is_active: editing.is_active }).eq('id', editing.id);
    if (error) setNotice({ kind: 'error', message: friendlyError(error) });
    else { setNotice({ kind: 'success', message: 'Müvekkil bilgileri güncellendi.' }); setEditing(null); await onChanged(); }
    setBusy(false);
  }

  return (
    <><PageHeader eyebrow="Yönetim" title="Müvekkiller" description="Yeni müvekkil davet edin, bilgileri düzenleyin veya erişimi pasifleştirin." />
      <form onSubmit={invite} className="mb-7 grid gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-5 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"><Field label="Ad soyad / yetkili"><input className={inputClass} required maxLength={160} value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></Field><Field label="Şirket adı"><input className={inputClass} maxLength={160} value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></Field><Field label="E-posta"><input className={inputClass} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field><Button type="submit" disabled={busy}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}Davet Et</Button></form>
      {clients.length ? <div className="grid gap-3">{clients.map((item) => <article key={item.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><h2 className="font-medium">{item.display_name}</h2><span className={`rounded-full px-2 py-0.5 text-[11px] ${item.is_active ? 'bg-[var(--brand-soft)] text-[var(--brand-deep)]' : 'bg-[var(--accent-soft)] text-[var(--danger)]'}`}>{item.is_active ? 'Aktif' : 'Pasif'}</span></div><p className="mt-1 text-sm text-[var(--ink-muted)]">{item.company_name || 'Şirket adı yok'} · {item.email || 'E-posta yok'}</p></div><Button variant="secondary" onClick={() => setEditing(item)}>Düzenle</Button></article>)}</div> : <EmptyState icon={Users} title="Henüz müvekkil yok" description="Yukarıdaki formdan ilk müvekkili davet edin." />}
      {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><form onSubmit={saveClient} className="w-full max-w-lg rounded-3xl bg-[var(--bg-elevated)] p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><h2 className="font-display text-2xl font-medium">Müvekkili Düzenle</h2><button type="button" onClick={() => setEditing(null)} aria-label="Pencereyi kapat"><X className="size-5" /></button></div><div className="grid gap-4"><Field label="Ad soyad / yetkili"><input className={inputClass} required value={editing.display_name} onChange={(e) => setEditing({ ...editing, display_name: e.target.value })} /></Field><Field label="Şirket adı"><input className={inputClass} value={editing.company_name || ''} onChange={(e) => setEditing({ ...editing, company_name: e.target.value })} /></Field><label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />Portal erişimi aktif</label><div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Vazgeç</Button><Button type="submit" disabled={busy}>Kaydet</Button></div></div></form></div>}
    </>
  );
}

function AdminCases({ client, adminId, cases, clients, documents, onChanged, setNotice }: { client: SupabaseClient; adminId: string; cases: CaseRecord[]; clients: Profile[]; documents: DocumentRecord[]; onChanged: () => Promise<void>; setNotice: (notice: Notice) => void }) {
  const [selected, setSelected] = useState<CaseRecord | null>(null);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);

  async function createCase(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    const { error } = await client.from('cases').insert({ client_id: clientId, title: title.trim(), reference_number: reference.trim() || null, status: 'Açık' });
    if (error) setNotice({ kind: 'error', message: friendlyError(error) }); else { setNotice({ kind: 'success', message: 'Dosya oluşturuldu.' }); setTitle(''); setReference(''); await onChanged(); }
    setBusy(false);
  }

  return (
    <><PageHeader eyebrow="Yönetim" title="Dosyalar" description="Müvekkile bağlı dosyaları oluşturun ve paylaşılabilir içerikleri yönetin." />
      <form onSubmit={createCase} className="mb-7 grid gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-5 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end"><Field label="Dosya başlığı"><input className={inputClass} required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} /></Field><Field label="Müvekkil"><select className={inputClass} required value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="" disabled>Müvekkil seçin</option>{clients.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.display_name}</option>)}</select></Field><Field label="Dosya / takip no"><input className={inputClass} maxLength={100} value={reference} onChange={(e) => setReference(e.target.value)} /></Field><Button type="submit" disabled={busy || !clientId}><Plus className="size-4" />Dosya Oluştur</Button></form>
      {selected ? <AdminCaseDetail client={client} adminId={adminId} caseRecord={selected} documents={documents.filter((item) => item.case_id === selected.id)} onBack={() => setSelected(null)} onChanged={async () => { await onChanged(); }} setNotice={setNotice} /> : cases.length ? <div className="grid gap-3">{cases.map((item) => <button key={item.id} onClick={() => setSelected(item)} className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-4 text-left transition hover:border-[var(--brand)] sm:flex-row sm:items-center"><div><h2 className="font-medium">{item.title}</h2><p className="mt-1 text-xs text-[var(--ink-muted)]">{clients.find((clientProfile) => clientProfile.id === item.client_id)?.display_name || 'Müvekkil'} · {item.reference_number || 'Numara yok'}</p></div><div className="flex items-center gap-3"><StatusBadge status={item.status} /><ChevronRight className="size-4" /></div></button>)}</div> : <EmptyState icon={FolderKanban} title="Henüz dosya yok" description="Yukarıdaki formdan ilk dosyayı oluşturun." />}
    </>
  );
}

function AdminCaseDetail({ client, adminId, caseRecord, documents, onBack, onChanged, setNotice }: { client: SupabaseClient; adminId: string; caseRecord: CaseRecord; documents: DocumentRecord[]; onBack: () => void; onChanged: () => Promise<void>; setNotice: (notice: Notice) => void }) {
  const [status, setStatus] = useState(caseRecord.status);
  const [summary, setSummary] = useState(caseRecord.client_summary || '');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateBody, setUpdateBody] = useState('');
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [visibility, setVisibility] = useState<Visibility>('client');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveCase(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    const { error } = await client.from('cases').update({ status, client_summary: summary.trim() || null }).eq('id', caseRecord.id);
    if (error) setNotice({ kind: 'error', message: friendlyError(error) }); else { setNotice({ kind: 'success', message: 'Dosya bilgileri güncellendi.' }); await onChanged(); }
    setBusy(false);
  }

  async function addUpdate(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    const { error } = await client.from('case_updates').insert({ case_id: caseRecord.id, title: updateTitle.trim(), body: updateBody.trim(), created_by: adminId });
    if (error) setNotice({ kind: 'error', message: friendlyError(error) }); else { setNotice({ kind: 'success', message: 'Müvekkile açık güncelleme yayımlandı.' }); setUpdateTitle(''); setUpdateBody(''); await onChanged(); }
    setBusy(false);
  }

  async function uploadDocument(event: FormEvent) {
    event.preventDefault(); if (!file) return;
    const validation = validateFiles([file]); if (validation) { setNotice({ kind: 'error', message: validation }); return; }
    setBusy(true);
    const path = `${caseRecord.client_id}/cases/${caseRecord.id}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await client.storage.from(PORTAL_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) { setNotice({ kind: 'error', message: friendlyError(uploadError) }); setBusy(false); return; }
    const { error } = await client.from('documents').insert({ case_id: caseRecord.id, submission_id: null, owner_client_id: caseRecord.client_id, uploaded_by: adminId, uploader_party: 'admin', visibility, document_type: documentType, storage_path: path, file_name: file.name, mime_type: file.type, size_bytes: file.size });
    if (error) setNotice({ kind: 'error', message: `Dosya yüklendi ancak kayıt tamamlanamadı: ${friendlyError(error)}` }); else { setNotice({ kind: 'success', message: 'Belge dosyaya eklendi.' }); setFile(null); await onChanged(); }
    setBusy(false);
  }

  return (
    <div className="mt-7"><button onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm text-[var(--brand-deep)]"><ArrowLeft className="size-4" />Dosya listesine dön</button><h2 className="font-display text-3xl font-medium">{caseRecord.title}</h2>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <form onSubmit={saveCase} className="grid content-start gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-5"><h3 className="font-display text-xl font-medium">Dosya Bilgileri</h3><Field label="Durum"><select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>{caseStatuses.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Müvekkile açık kısa açıklama"><textarea className={`${inputClass} min-h-28`} maxLength={5000} value={summary} onChange={(e) => setSummary(e.target.value)} /></Field><Button type="submit" disabled={busy}>Bilgileri Kaydet</Button></form>
        <form onSubmit={addUpdate} className="grid content-start gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-5"><div><h3 className="font-display text-xl font-medium">Müvekkile Açık Güncelleme</h3><p className="mt-1 text-xs text-[var(--danger)]">Bu alan müvekkil tarafından görülebilir. İç not yazmayın.</p></div><Field label="Başlık"><input className={inputClass} required maxLength={160} value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} /></Field><Field label="Açıklama"><textarea className={`${inputClass} min-h-28`} required maxLength={5000} value={updateBody} onChange={(e) => setUpdateBody(e.target.value)} /></Field><Button type="submit" disabled={busy}>Güncellemeyi Yayımla</Button></form>
        <form onSubmit={uploadDocument} className="grid content-start gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-5"><h3 className="font-display text-xl font-medium">Belge Yükle</h3><Field label="Belge türü"><select className={inputClass} value={documentType} onChange={(e) => setDocumentType(e.target.value)}>{documentTypes.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Görünürlük"><select className={inputClass} value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)}><option value="client">Müvekkile Açık</option><option value="internal">Yalnızca İç Kullanım</option></select></Field><Field label="Dosya" hint="PDF, JPG, JPEG, PNG veya DOCX · En fazla 15 MB"><input className={inputClass} type="file" accept={FILE_ACCEPT} required onChange={(e) => setFile(e.target.files?.[0] || null)} /></Field><Button type="submit" disabled={busy || !file}><Upload className="size-4" />Belgeyi Yükle</Button></form>
        <section><h3 className="mb-4 font-display text-xl font-medium">Dosya Belgeleri</h3><DocumentList client={client} documents={documents} setNotice={setNotice} /></section>
      </div>
    </div>
  );
}

function AdminSubmissions({ client, submissions, cases, documents, onChanged, setNotice }: { client: SupabaseClient; submissions: Submission[]; cases: CaseRecord[]; documents: DocumentRecord[]; onChanged: () => Promise<void>; setNotice: (notice: Notice) => void }) {
  const [drafts, setDrafts] = useState<Record<string, { status: SubmissionStatus; internal_note: string; case_id: string }>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const draftFor = (item: Submission) => drafts[item.id] || { status: item.status, internal_note: item.internal_note || '', case_id: item.case_id || '' };

  async function save(item: Submission) {
    setBusyId(item.id); const draft = draftFor(item);
    const { error } = await client.from('submissions').update({ status: draft.status, internal_note: draft.internal_note.trim() || null, case_id: draft.case_id || null }).eq('id', item.id);
    if (error) setNotice({ kind: 'error', message: friendlyError(error) }); else { setNotice({ kind: 'success', message: 'Gönderi güncellendi. İç not müvekkile gösterilmez.' }); await onChanged(); }
    setBusyId(null);
  }

  return (
    <><PageHeader eyebrow="Yönetim" title="Gelen Evraklar" description="Bağımsız gönderileri inceleyin, durumunu değiştirin, iç not ekleyin veya bir dosyaya bağlayın." />{submissions.length ? <div className="grid gap-5">{submissions.map((item) => { const draft = draftFor(item); return <article key={item.id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-medium">{item.subject}</h2><StatusBadge status={item.status} /></div><p className="mt-1 text-xs text-[var(--ink-muted)]">{item.document_type} · {formatDate(item.created_at, true)}</p></div></div>{item.description && <p className="mt-4 whitespace-pre-wrap rounded-xl bg-[var(--bg-base)] p-3 text-sm leading-6">{item.description}</p>}<div className="mt-5"><DocumentList client={client} documents={documents.filter((doc) => doc.submission_id === item.id)} setNotice={setNotice} /></div><div className="mt-5 grid gap-4 border-t border-[var(--border-soft)] pt-5 lg:grid-cols-3"><Field label="Durum"><select className={inputClass} value={draft.status} onChange={(e) => setDrafts({ ...drafts, [item.id]: { ...draft, status: e.target.value as SubmissionStatus } })}>{Object.entries(submissionStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Bir dosyaya bağla"><select className={inputClass} value={draft.case_id} onChange={(e) => setDrafts({ ...drafts, [item.id]: { ...draft, case_id: e.target.value } })}><option value="">Bağımsız gönderi</option>{cases.filter((caseRecord) => caseRecord.client_id === item.client_id).map((caseRecord) => <option key={caseRecord.id} value={caseRecord.id}>{caseRecord.title}</option>)}</select></Field><Field label="Yalnızca yönetici iç notu" hint="Bu alan hiçbir koşulda müvekkile gösterilmez."><textarea className={`${inputClass} min-h-24`} maxLength={10000} value={draft.internal_note} onChange={(e) => setDrafts({ ...drafts, [item.id]: { ...draft, internal_note: e.target.value } })} /></Field></div><div className="mt-4 flex justify-end"><Button onClick={() => void save(item)} disabled={busyId === item.id}>{busyId === item.id && <LoaderCircle className="size-4 animate-spin" />}Değişiklikleri Kaydet</Button></div></article>; })}</div> : <EmptyState icon={FileCheck2} title="Gelen evrak yok" description="Müvekkillerin gönderdiği bağımsız evraklar burada listelenecek." />}</>
  );
}

export default function PortalApp() {
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [setupDone, setSetupDone] = useState(false);
  const [adminMfaReady, setAdminMfaReady] = useState(false);

  useEffect(() => {
    if (!client) { setLoading(false); return; }
    let mounted = true;
    void client.auth.getSession().then(({ data }) => { if (mounted) { setSession(data.session); setLoading(false); } });
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setProfile(null); setAdminMfaReady(false); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [client]);

  useEffect(() => {
    if (!client || !session) return;
    let active = true;
    void (async () => {
      setLoading(true); setProfileError('');
      const { data, error } = await client.from('profiles').select('*').eq('id', session.user.id).single();
      if (!active) return;
      if (error) setProfileError('Portal profiliniz bulunamadı. Lütfen büromuzla iletişime geçin.');
      else setProfile(data as Profile);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [client, session]);

  if (!client) return <div className="mx-auto my-16 max-w-2xl px-5"><div role="alert" className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--accent-soft)] p-6"><h1 className="font-display text-2xl font-medium">Portal yapılandırılmamış</h1><p className="mt-2 text-sm leading-6">PUBLIC_SUPABASE_URL ve PUBLIC_SUPABASE_PUBLISHABLE_KEY environment değişkenlerini tanımlayın.</p></div></div>;
  if (loading) return <LoadingScreen />;
  if (!session) return <Login client={client} />;
  const setupMode = new URLSearchParams(window.location.search).get('mode') === 'setup' && !setupDone;
  if (setupMode) return <PasswordSetup client={client} onDone={() => setSetupDone(true)} />;
  if (profileError) return <div className="mx-auto my-16 max-w-xl px-5"><Alert notice={{ kind: 'error', message: profileError }} /><Button className="mt-4" variant="secondary" onClick={() => void client.auth.signOut()}><LogOut className="size-4" />Çıkış Yap</Button></div>;
  if (!profile) return <LoadingScreen />;
  if (!profile.is_active) return <div className="mx-auto my-16 max-w-xl px-5"><div className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--bg-elevated)] p-6"><CircleAlert className="size-6 text-[var(--danger)]" /><h1 className="mt-4 font-display text-2xl font-medium">Hesabınız pasif</h1><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">Portal erişiminiz geçici olarak durdurulmuş. Bilgi için büromuzla iletişime geçin.</p><Button className="mt-5" variant="secondary" onClick={() => void client.auth.signOut()}>Çıkış Yap</Button></div></div>;
  if (profile.role === 'admin' && !adminMfaReady) return <MFAGate client={client} onVerified={() => setAdminMfaReady(true)} />;
  if (profile.role === 'admin') return <AdminPortal client={client} session={session} profile={profile} />;
  return <ClientPortal client={client} session={session} profile={profile} />;
}
