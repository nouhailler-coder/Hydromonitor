import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, LogIn, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutFirebase,
  User,
} from '../auth/firebase';
import { hydroApi } from '../api/hydroApi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  verifiedProfile: any;
  onAuthChange: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  verifiedProfile,
  onAuthChange,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onAuthChange();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la connexion Google Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onAuthChange();
    } catch (err: any) {
      setError(err?.message || 'Erreur d’authentification Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutFirebase();
      onAuthChange();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0D1626] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="font-display font-semibold text-base text-slate-100">
              Authentification Firebase &amp; Vérification JWT
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {currentUser ? (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase font-semibold mb-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Session Firebase Active (/api/me vérifié)
                </div>
                <div className="space-y-1 text-xs font-mono text-slate-300">
                  <div>
                    <span className="text-slate-500">UID:</span> {currentUser.uid}
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span> {currentUser.email || '—'}
                  </div>
                  <div>
                    <span className="text-slate-500">Rôle Backend:</span>{' '}
                    <span className="px-1.5 py-0.5 rounded bg-[#0EA5E9]/20 text-[#38BDF8] uppercase">
                      {verifiedProfile?.role || 'admin'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Projet GCP:</span>{' '}
                    {verifiedProfile?.project_id || 'gen-lang-client-0257614236'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Votre Firebase ID Token est transmis via l&apos;en-tête HTTP{' '}
                <code className="text-[#38BDF8] font-mono">Authorization: Bearer &lt;token&gt;</code>{' '}
                à chaque requête vers les routes protégées et d&apos;administration Cloud Run.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 text-xs font-medium transition"
                >
                  Se déconnecter
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#0EA5E9] text-slate-950 font-semibold text-xs hover:bg-[#38BDF8] transition"
                >
                  Continuer
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 leading-relaxed">
                La consultation des rivières est publique. L&apos;authentification Firebase est
                requise pour accéder à l&apos;administration des jobs Cloud Run et vérifier{' '}
                <code className="text-[#38BDF8] font-mono">GET /api/me</code>.
              </p>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-100 text-slate-950 font-semibold text-xs hover:bg-white transition flex items-center justify-center gap-2 shadow"
              >
                <LogIn className="w-4 h-4" />
                Continuer avec Google (Firebase Auth)
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3 text-[11px] font-mono uppercase text-slate-500">
                  ou Email / Mot de passe
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ingenieur@hydromonitor.fr"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#0EA5E9] text-slate-950 font-semibold text-xs hover:bg-[#38BDF8] transition flex items-center justify-center gap-2"
                >
                  {mode === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      Se connecter
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Créer un compte
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-xs text-[#38BDF8] hover:underline"
                >
                  {mode === 'login'
                    ? 'Pas encore de compte ? Créer un identifiant Firebase'
                    : 'Déjà inscrit ? Se connecter avec un compte existant'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
