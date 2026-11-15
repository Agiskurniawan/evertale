import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Camera, User, Trash2, Loader2, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api, assetUrl, errorMessage } from "../lib/api";

export default function EditProfil() {
  const { username, bio, avatarUrl, isLoggedIn, loading, updateProfile } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [draftName, setDraftName] = useState(username || "");
  const [draftBio, setDraftBio] = useState(bio || "");

  // Sinkronkan data awal ketika user sudah dimuat
  useEffect(() => {
    if (username) setDraftName(username);
    if (bio) setDraftBio(bio);
  }, [username, bio]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Upload Foto Profil
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2 MB.");
      return;
    }

    try {
      setUploading(true);
      setErrorMsg("");
      const fd = new FormData();
      fd.append("file", file);

      const res = await api.post<{ url: string }>("/upload?type=avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await updateProfile({ avatar_url: res.data.url });
      showToast("Foto profil berhasil diperbarui!");
    } catch (err) {
      setErrorMsg(errorMessage(err, "Gagal mengunggah foto profil"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Hapus Foto Profil
  const handleRemoveAvatar = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto profil?")) return;

    try {
      setUploading(true);
      setErrorMsg("");
      await updateProfile({ avatar_url: null });
      showToast("Foto profil berhasil dihapus");
    } catch (err) {
      setErrorMsg(errorMessage(err, "Gagal menghapus foto profil"));
    } finally {
      setUploading(false);
    }
  };

  // Simpan Nama dan Bio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = draftName.trim();
    if (cleanName.length < 2) {
      setErrorMsg("Nama minimal 2 karakter.");
      return;
    }
    if (cleanName.length > 30) {
      setErrorMsg("Nama maksimal 30 karakter.");
      return;
    }
    if (draftBio.length > 120) {
      setErrorMsg("Bio maksimal 120 karakter.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      await updateProfile({
        username: cleanName,
        bio: draftBio.trim(),
      });
      showToast("Profil berhasil disimpan!");
      setTimeout(() => {
        navigate("/profil");
      }, 700);
    } catch (err) {
      setErrorMsg(errorMessage(err, "Gagal menyimpan perubahan profil"));
    } finally {
      setSaving(false);
    }
  };

  // Saran cepat untuk Bio
  const quickBioSuggestions = [
    "Pencinta novel fantasi & aksi ⚔️",
    "Sedang menulis kisah baru ✨",
    "Membaca santai di waktu luang ☕",
    "Penggemar komik & manhwa 🎨",
    "Suka cerita misteri & romansa 📖",
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#DFE3E8] dark:bg-[#0B1220] px-4 py-8 overflow-hidden transition-colors duration-300">
      {/* ── Ornamen Lingkaran Sudut (Identik dengan Login & Daftar Author) ── */}
      <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-blue-500/10 dark:bg-blue-600/10 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 pointer-events-none" />

      {/* ── Tombol Kembali di Pojok Kiri Atas ── */}
      <button
        type="button"
        onClick={() => navigate("/profil")}
        className="absolute top-6 left-6 z-20 p-2.5 rounded-full bg-[#ECEFF2] dark:bg-white/10 text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 hover:bg-white dark:hover:bg-white/20 transition-all shadow-sm active:scale-95"
        title="Kembali ke Profil"
        aria-label="Kembali ke Profil"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* ── Toast Notifikasi ── */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Card Utama Edit Profil (Pure Card) ── */}
      <div className="w-full max-w-[460px] bg-[#ECEFF2] dark:bg-[#111A2C] rounded-3xl p-7 sm:p-9 shadow-2xl border border-gray-300 dark:border-white/10 relative z-10 transition-colors duration-300">
        {/* Header Kartu */}
        <div className="flex flex-col items-center mb-6 text-center">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Edit <span className="text-blue-600 dark:text-blue-400">Profil</span>
          </h1>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
            Perbarui foto, nama tampilan, dan bio akunmu
          </p>
        </div>

        {/* Lingkaran Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading}
              className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-blue-500 flex items-center justify-center overflow-hidden bg-blue-500/10 hover:border-blue-400 shadow-xl shadow-blue-500/15 active:scale-95 transition-all cursor-pointer"
              title="Tekan untuk mengganti foto profil"
            >
              {avatarUrl ? (
                <img
                  src={assetUrl(avatarUrl)}
                  alt={username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 sm:h-14 sm:w-14 text-blue-500 dark:text-blue-400" />
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition-opacity">
                <Camera className="h-5 w-5 text-blue-300" />
                <span className="text-[10px] font-semibold text-slate-200">Ganti Foto</span>
              </div>

              {/* Uploading Spinner */}
              {uploading && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-1.5 z-10">
                  <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
                  <span className="text-[10px] text-white font-medium">Mengunggah...</span>
                </div>
              )}
            </button>

            {/* Tombol Kamera di Pojok Lingkaran */}
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading}
              className="absolute bottom-0 right-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-black/40 border-2 border-[#ECEFF2] dark:border-[#111A2C] active:scale-90 transition-all cursor-pointer"
              title="Pilih foto dari perangkat"
            >
              <Camera className="h-4 w-4" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              <span>Hapus foto profil</span>
            </button>
          )}
        </div>

        {/* Pesan Error */}
        {errorMsg && (
          <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-500 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Form Edit */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Input Nama Tampilan */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Nama Tampilan <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-gray-500 dark:text-slate-500">
                {draftName.length}/30
              </span>
            </div>
            <input
              type="text"
              required
              value={draftName}
              onChange={(e) => {
                setDraftName(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Masukkan nama tampilan kamu"
              maxLength={30}
              className="w-full bg-[#DEE3E8] dark:bg-[#0B1220] border border-gray-300 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
            />
          </div>

          {/* Input Bio / Tentang */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Bio / Tentang Kamu
              </label>
              <span className="text-[10px] text-gray-500 dark:text-slate-500">
                {draftBio.length}/120
              </span>
            </div>
            <textarea
              rows={3}
              value={draftBio}
              onChange={(e) => {
                setDraftBio(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Tulis sedikit tentang dirimu atau karya favoritmu..."
              maxLength={120}
              className="w-full bg-[#DEE3E8] dark:bg-[#0B1220] border border-gray-300 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium resize-none"
            />

            {/* Pilihan Cepat Status Bio */}
            <div className="mt-1 flex flex-wrap gap-1.5">
              {quickBioSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setDraftBio(suggestion)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all text-left ${
                    draftBio === suggestion
                      ? "bg-blue-600 text-white border-blue-600 font-semibold"
                      : "bg-[#DEE3E8] dark:bg-[#0B1220] text-gray-700 dark:text-slate-300 border-gray-300 dark:border-white/10 hover:border-blue-400"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Perubahan</span>
            )}
          </button>

          {/* Tombol Batal / Kembali */}
          <button
            type="button"
            onClick={() => navigate("/profil")}
            disabled={saving}
            className="text-center text-xs font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors py-1"
          >
            Batal dan Kembali ke Profil
          </button>
        </form>
      </div>
    </div>
  );
}
