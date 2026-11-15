import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError("Konfirmasi kata sandi tidak cocok.");
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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#DFE3E8] dark:bg-[#0B1220] px-4 py-8 overflow-hidden transition-colors duration-300">
      {/* ── Ornamen Lingkaran Sudut (Sesuai Konsep Gambar) ── */}
      <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-blue-500/10 dark:bg-blue-600/10 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 pointer-events-none" />

      {/* ── Tombol Kembali di Pojok Kiri Atas ── */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 p-2.5 rounded-full bg-[#ECEFF2] dark:bg-white/10 text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 hover:bg-white dark:hover:bg-white/20 transition-all shadow-sm active:scale-95"
        title="Kembali"
        aria-label="Kembali"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* ── Card Login Terpusat (Pure Card Sesuai Gambar Referensi) ── */}
      <div className="w-full max-w-[440px] bg-[#ECEFF2] dark:bg-[#111A2C] rounded-3xl p-7 sm:p-9 shadow-2xl border border-gray-300 dark:border-white/10 relative z-10 transition-colors duration-300">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 rounded-2xl bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 mb-2 border border-blue-500/25 shadow-sm">
            <BookOpen className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Ever<span className="text-blue-600 dark:text-blue-400">Tale</span>
          </h1>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
            {isLogin ? "Masuk ke akun membaca kamu" : "Daftar akun baru untuk mulai membaca"}
          </p>
        </div>

        {/* Toggle Mode: Login / Register */}
        <div className="flex bg-[#D8DDE3] dark:bg-[#192235] rounded-2xl p-1 mb-6 border border-gray-300 dark:border-white/5">
          <button
            type="button"
            onClick={() => switchMode(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              isLogin
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              !isLogin
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Formulir */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email / Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 ml-1">
              Email / Akun
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-3 bg-[#DEE3E8] dark:bg-[#0B1220] border border-gray-300 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 ml-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-[#DEE3E8] dark:bg-[#0B1220] border border-gray-300 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password (Saat Mode Daftar) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 ml-1">
                Ulangi Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#DEE3E8] dark:bg-[#0B1220] border border-gray-300 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                />
              </div>
            </div>
          )}

          {/* Lupa Password (saat mode login) */}
          {isLogin && (
            <div className="flex justify-end">
              <span className="text-xs font-medium text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 cursor-pointer">
                Lupa kata sandi?
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{isLogin ? "Masuk ke Akun" : "Daftar Akun Baru"}</span>
            )}
          </button>
        </form>

        {/* Bawah: Alternatif Switch */}
        <div className="mt-6 pt-5 border-t border-gray-300/80 dark:border-white/10 text-center">
          <p className="text-xs text-gray-600 dark:text-slate-400">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              type="button"
              onClick={() => switchMode(!isLogin)}
              className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
            >
              {isLogin ? "Daftar Sekarang" : "Masuk Sekarang"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
