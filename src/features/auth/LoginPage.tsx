import React, { useState } from 'react';
import {
  Eye, EyeOff, Lock, User, Briefcase,
  KeyRound, ArrowLeft, CheckCircle2, ShieldCheck,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

// Stored credentials (mutable so reset password actually works in-session)
let STORED_CREDENTIALS = {
  username: 'shettythanvi036',
  email: 'shettythanvi036@gmail.com',
  password: 'Shetty@12',
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

// ─── Shared input style ───────────────────────────────────────────────────────
const inputCls =
  'w-full bg-slate-700/60 border border-slate-600 text-white placeholder-slate-500 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  const map = [
    { label: 'Too short',  color: 'bg-slate-600' },
    { label: 'Weak',       color: 'bg-rose-500' },
    { label: 'Fair',       color: 'bg-amber-400' },
    { label: 'Good',       color: 'bg-blue-400' },
    { label: 'Strong',     color: 'bg-emerald-400' },
  ];
  return { score, ...map[score] };
}

// ════════════════════════════════════════════════════════════════════════════
//  FORGOT PASSWORD VIEW
// ════════════════════════════════════════════════════════════════════════════
interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [step, setStep] = useState<'identity' | 'reset' | 'success'>('identity');
  const [identity, setIdentity] = useState('');       // username or email
  const [identityError, setIdentityError] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetError, setResetError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getStrength(newPass);

  // ── Step 1: verify identity ──────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentityError('');
    if (!identity.trim()) {
      setIdentityError('Please enter your username or email.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const match =
      identity.trim() === STORED_CREDENTIALS.username ||
      identity.trim().toLowerCase() === STORED_CREDENTIALS.email.toLowerCase();
    if (match) {
      setStep('reset');
    } else {
      setIdentityError('No account found with that username or email.');
    }
    setLoading(false);
  };

  // ── Step 2: set new password ─────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPass.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setResetError('Passwords do not match.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // Actually update the stored credentials
    STORED_CREDENTIALS.password = newPass;
    setStep('success');
    setLoading(false);
  };

  return (
    <div className="animate-fade-in-up space-y-5">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm font-medium transition cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Sign In
      </button>

      {/* Step: identity */}
      {step === 'identity' && (
        <form onSubmit={handleVerify} noValidate className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Reset Password</h2>
            <p className="text-xs text-slate-400">
              Enter your username or email address and we'll verify your account.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                autoFocus
                value={identity}
                onChange={e => { setIdentity(e.target.value); setIdentityError(''); }}
                placeholder="Enter username or email"
                className={inputCls}
              />
            </div>
            {identityError && (
              <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                {identityError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !identity.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-2.5 text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? <><Spinner /> Verifying…</> : 'Verify Account'}
          </button>
        </form>
      )}

      {/* Step: reset */}
      {step === 'reset' && (
        <form onSubmit={handleReset} noValidate className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Set New Password</h2>
            <p className="text-xs text-slate-400">
              Account verified ✓ — choose a strong new password.
            </p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showNew ? 'text' : 'password'}
                autoFocus
                value={newPass}
                onChange={e => { setNewPass(e.target.value); setResetError(''); }}
                placeholder="Enter new password"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {newPass && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-[11px] font-medium ${
                  strength.score <= 1 ? 'text-rose-400' :
                  strength.score === 2 ? 'text-amber-400' :
                  strength.score === 3 ? 'text-blue-400' : 'text-emerald-400'
                }`}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPass}
                onChange={e => { setConfirmPass(e.target.value); setResetError(''); }}
                placeholder="Re-enter new password"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Match indicator */}
            {confirmPass && (
              <p className={`mt-1.5 text-[11px] font-medium flex items-center gap-1.5 ${
                newPass === confirmPass ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {newPass === confirmPass
                  ? <><CheckCircle2 className="w-3 h-3" /> Passwords match</>
                  : <><span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" /> Passwords do not match</>
                }
              </p>
            )}
          </div>

          {/* Error */}
          {resetError && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-red-400">
              {resetError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !newPass || !confirmPass}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-2.5 text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {loading ? <><Spinner /> Updating…</> : <><KeyRound className="w-4 h-4" /> Update Password</>}
          </button>
        </form>
      )}

      {/* Step: success */}
      {step === 'success' && (
        <div className="text-center space-y-4 animate-scale-in py-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Password Updated!</h2>
            <p className="text-xs text-slate-400 mt-1">
              Your password has been reset successfully. Sign in with your new password.
            </p>
          </div>
          <button
            onClick={onBack}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-2.5 text-sm transition shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            Go to Sign In
          </button>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  MAIN LOGIN PAGE
// ════════════════════════════════════════════════════════════════════════════
const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (
      username === STORED_CREDENTIALS.username &&
      password === STORED_CREDENTIALS.password
    ) {
      onLoginSuccess();
    } else {
      setError('Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1629 0%, #1e2a45 50%, #0f1629 100%)' }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #006fc7, transparent)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #4f46e5, transparent)' }}
        />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #006fc7, #36abf7)',
              boxShadow: '0 8px 32px rgba(6,111,199,0.4)',
            }}
          >
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
            Central Business Workflow
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {view === 'login' ? 'Sign in to your workspace' : 'Reset your account password'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl shadow-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === 'forgot' && (
            <ForgotPassword onBack={() => setView('login')} />
          )}

          {/* ── LOGIN VIEW ── */}
          {view === 'login' && (
            <form onSubmit={handleSubmit} noValidate className="space-y-5 animate-fade-in-up">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    placeholder="Enter your username"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition cursor-pointer underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-red-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full text-white font-semibold rounded-xl py-2.5 text-sm transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #006fc7, #0c8ee9)',
                  boxShadow: '0 4px 16px rgba(6,111,199,0.35)',
                }}
              >
                {loading ? <><Spinner /> Signing in…</> : 'Sign In'}
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-slate-600 text-xs mt-6">
            Central Business Workflow &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
