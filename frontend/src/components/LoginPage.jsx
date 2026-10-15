import React, { useState } from 'react';
import { Building2, LockKeyhole, UserRound, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('manager');
  const [password, setPassword] = useState('Manager123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(username, password);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Cimenterie Executive</h1>
            <p className="text-sm text-slate-400">Secure sales intelligence</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-white">Sign in</h2>
        <p className="mt-1 text-sm text-slate-400">Use your dashboard account to continue.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Username</span>
            <div className="mt-1 relative">
              <UserRound className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="w-full rounded-xl bg-slate-950 border border-slate-700 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Password</span>
            <div className="mt-1 relative">
              <LockKeyhole className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="w-full rounded-xl bg-slate-950 border border-slate-700 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400" />
            </div>
          </label>
          {error && <p className="flex items-center gap-2 text-sm text-rose-300"><AlertCircle className="w-4 h-4" />{error}</p>}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 py-3 text-sm font-bold text-slate-950 transition-colors">
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-[11px] leading-relaxed text-slate-500">Demo accounts are available for admin, manager, and analyst roles.</p>
      </div>
    </main>
  );
}
