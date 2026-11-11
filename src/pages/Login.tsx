import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const switchMode = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isLogin && password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    setSubmitting(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-10 px-4 min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-[420px] bg-white dark:bg-[#101726] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/5 relative">
        
        {/* Top Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-500/15 via-blue-500/5 to-transparent dark:from-blue-500/40 dark:via-blue-600/10 dark:to-transparent pointer-events-none" />

        <div className="relative z-10 p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-gray-100 dark:bg-white/10 p-1.5 rounded-lg flex items-center justify-center backdrop-blur-sm border border-gray-200 dark:border-white/10">
                <BookOpen className="h-5 w-5 text-gray-900 dark:text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Ever<span className="text-blue-500 dark:text-blue-400">Tale</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Selamat Datang</h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">EverTale - Dunia Cerita Dimulai di Sini</p>
          </div>

          {/* Toggle Switch */}
          <div className="flex bg-gray-100 dark:bg-[#192235] rounded-full p-1 mb-6 border border-gray-200 dark:border-white/5">
            <button
              onClick={() => switchMode(true)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                isLogin ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => switchMode(false)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                !isLogin ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-white ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-white ml-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            {!isLogin && (
              <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-semibold text-gray-700 dark:text-white ml-1">Konfirmasi Password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            )}

            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-blue-500 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">atau</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={() => setError("Login dengan Google belum tersedia.")}
            className="w-full rounded-xl bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 py-3 text-sm font-semibold text-gray-700 dark:text-white flex items-center justify-center gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLogin ? "Masuk dengan Google" : "Daftar dengan Google"}
          </button>

          {/* Bottom text */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              onClick={() => switchMode(!isLogin)}
              className="text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors"
            >
              {isLogin ? "Daftar" : "Masuk"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
