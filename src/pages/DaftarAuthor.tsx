import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { PenTool, Check, AlertCircle, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";

const GENRE_OPTIONS = [
  "Fantasi",
  "Romansa",
  "Aksi",
  "Drama",
  "Komedi",
  "Horor",
  "Misteri",
  "Sci-Fi",
  "Slice of Life",
];

const PENGALAMAN_OPTIONS = [
  { value: "pemula", label: "Baru pertama kali menulis / menggambar serial" },
  { value: "hobi", label: "Menulis sebagai hobi di waktu luang" },
  { value: "berpengalaman", label: "Pernah menerbitkan karya di platform lain" },
];

export default function DaftarAuthor() {
  const { username, bio, isAuthor, isLoggedIn, loading, updateProfile, registerAsAuthor } = useAuth();
  const navigate = useNavigate();

  // State Form
  const [namaPena, setNamaPena] = useState(username || "");
  const [fokusKarya, setFokusKarya] = useState<"novel" | "komik">("novel");
  const [genreUtama, setGenreUtama] = useState("Fantasi");
  const [bioKreator, setBioKreator] = useState(bio || "");
  const [pengalaman, setPengalaman] = useState("pemula");
  const [setujuPedoman, setSetujuPedoman] = useState(false);

  // Status submission
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [suksesMsg, setSuksesMsg] = useState("");

  useEffect(() => {
    if (username && !namaPena) setNamaPena(username);
    if (bio && !bioKreator) setBioKreator(bio);
  }, [username, bio]);

  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isAuthor) return <Navigate to="/author" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanNama = namaPena.trim();
    if (cleanNama.length < 2) {
      setErrorMsg("Nama pena minimal 2 karakter.");
      return;
    }
    if (!setujuPedoman) {
      setErrorMsg("Harap setujui pedoman kreator sebelum melanjutkan.");
      return;
    }

    try {
      setSubmitting(true);

      const payloadBio =
        bioKreator.trim() ||
        `Kreator ${fokusKarya === "novel" ? "Novel" : "Komik"} spesialis genre ${genreUtama}.`;
      await updateProfile({
        username: cleanNama,
        bio: payloadBio,
      });

      await registerAsAuthor();

      setSuksesMsg("Selamat! Akun kreatormu berhasil diaktifkan.");
      setTimeout(() => {
        navigate("/author");
      }, 1000);
    } catch (err) {
      setErrorMsg(errorMessage(err, "Gagal mendaftar sebagai kreator. Coba lagi beberapa saat lagi."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#DFE3E8] dark:bg-[#0B1220] px-4 py-10 overflow-hidden transition-colors duration-300">
      {/* ── Ornamen Lingkaran Sudut (Sesuai Konsep Gambar) ── */}
      <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-blue-500/10 dark:bg-blue-600/10 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 pointer-events-none" />

      {/* Toast Sukses */}
      {suksesMsg && (
        <div className="fixed top-8 right-8 z-50 flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/25 animate-in fade-in">
          <Check className="h-5 w-5" />
          <span>{suksesMsg}</span>
        </div>
      )}

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

      {/* ── Card Daftar Author Terpusat ── */}
      <div className="w-full max-w-[500px] bg-[#ECEFF2] dark:bg-[#111A2C] rounded-3xl p-7 sm:p-9 shadow-2xl border border-gray-300 dark:border-white/10 relative z-10 transition-colors duration-300">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 rounded-2xl bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 mb-2 border border-blue-500/25 shadow-sm">
            <PenTool className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Daftar <span className="text-blue-600 dark:text-blue-400">Kreator</span>
          </h1>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
            Lengkapi profil penamu untuk mulai mempublikasikan karya
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nama Pena */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 ml-1">
              Nama Pena / Alias Penulis <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={namaPena}
              onChange={(e) => setNamaPena(e.target.value)}
              placeholder="Contoh: Raditya Cahya"
              maxLength={40}
              className="w-full bg-[#DEE3E8] dark:bg-[#0B1220] border border-gray-300 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
            />
          </div>

          {/* Format Karya */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 ml-1">
              Format Karya Utama
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFokusKarya("novel")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  fokusKarya === "novel"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-[#DEE3E8] dark:bg-[#0B1220] text-gray-700 dark:text-slate-300 border-gray-300 dark:border-white/10 hover:border-blue-400"
                }`}
              >
                📖 Novel Teks
              </button>
              <button
                type="button"
                onClick={() => setFokusKarya("komik")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  fokusKarya === "komik"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-[#DEE3E8] dark:bg-[#0B1220] text-gray-700 dark:text-slate-300 border-gray-300 dark:border-white/10 hover:border-blue-400"
                }`}
              >
                🎨 Komik Webtoon
              </button>
            </div>
          </div>

          {/* Genre & Pengalaman */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 ml-1">
                Genre Utama
              </label>
              <select
                value={genreUtama}
                onChange={(e) => setGenreUtama(e.target.value)}
                className="w-full bg-[#DEE3E8] dark:bg-[#0B1220] border border-gray-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-semibold"
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g} className="bg-white dark:bg-[#0B1220]">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 ml-1">
                Pengalaman
              </label>
              <select
                value={pengalaman}
                onChange={(e) => setPengalaman(e.target.value)}
                className="w-full bg-[#DEE3E8] dark:bg-[#0B1220] border border-gray-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-semibold"
              >
                {PENGALAMAN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0B1220]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio Penulis */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 ml-1">
              Bio / Moto Penulis
            </label>
            <textarea
              value={bioKreator}
              onChange={(e) => setBioKreator(e.target.value)}
              placeholder="Ceritakan sedikit tentang karya yang akan kamu buat..."
              rows={2}
              maxLength={200}
              className="w-full bg-[#DEE3E8] dark:bg-[#0B1220] border border-gray-300 dark:border-white/10 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-medium resize-none"
            />
          </div>

          {/* Persetujuan Pedoman */}
          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#DEE3E8]/70 dark:bg-white/5 border border-gray-300 dark:border-white/10 cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="checkbox"
              checked={setujuPedoman}
              onChange={(e) => setSetujuPedoman(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
              Saya menyetujui <span className="font-bold text-blue-600 dark:text-blue-400">Pedoman Komunitas Kreator EverTale</span> dan menyatakan karya yang diunggah bebas dari plagiarisme.
            </span>
          </label>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mengaktifkan Akun...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Aktifkan Akun Kreator</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
