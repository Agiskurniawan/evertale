import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Camera, User, Info, Trash2, Loader2, Check } from "lucide-react";
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

  const [draftName, setDraftName] = useState(username);
  const [draftBio, setDraftBio] = useState(bio || "");

  // Sinkronkan data awal ketika user sudah dimuat
  useEffect(() => {
    setDraftName(username);
    setDraftBio(bio || "");
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
      alert("Ukuran gambar maksimal 2 MB");
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
      }, 800);
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
    "Hanya membaca santai di waktu luang ☕",
    "Penggemar komik & manhwa 🎨",
    "Suka cerita misteri & romansa 📖",
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 dark:bg-[#0B1220] px-4 py-8 md:px-12 lg:px-16">
      {/* Toast Notifikasi Sukses */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Navigasi Kembali */}
        <Link
          to="/profil"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Profil</span>
        </Link>

        {/* Judul Halaman */}
        <p className="text-sm text-blue-500 dark:text-blue-400 font-semibold tracking-wide uppercase mb-1">Pengaturan Akun</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Profil</h1>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-8">
          Ubah foto profil, nama tampilan, dan bio Anda di EverTale.
        </p>

        {/* Card Utama */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#101726] p-6 md:p-8 shadow-xl">
          {/* Section Foto Profil Lingkaran */}
          <div className="flex flex-col items-center justify-center pb-8 border-b border-gray-100 dark:border-white/10">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">Foto Profil</p>

            <div className="relative group">
              {/* Lingkaran Profil */}
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={uploading}
                aria-label="Ganti foto profil"
                className="relative h-32 w-32 md:h-36 md:w-36 rounded-full border-2 border-blue-500/30 flex items-center justify-center overflow-hidden bg-blue-500/10 hover:border-blue-400 shadow-xl shadow-blue-500/10 active:scale-95 transition-all cursor-pointer group"
              >
                {avatarUrl ? (
                  <img
                    src={assetUrl(avatarUrl)}
                    alt={username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-blue-500 dark:text-blue-400 group-hover:opacity-60 transition-opacity" />
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition-opacity">
                  <Camera className="h-6 w-6 text-blue-300" />
                  <span className="text-[11px] font-medium text-slate-200">Ganti Foto</span>
                </div>

                {/* Uploading Overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 z-10">
                    <Loader2 className="h-7 w-7 text-blue-400 animate-spin" />
                    <span className="text-xs text-white font-medium">Mengunggah...</span>
                  </div>
                )}
              </button>

              {/* Lencana Kamera Bulat */}
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={uploading}
                aria-label="Pilih foto"
                className="absolute bottom-1 right-1 h-10 w-10 md:h-11 md:w-11 rounded-full bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center shadow-lg shadow-black/40 border-2 border-white dark:border-[#101726] active:scale-90 transition-all cursor-pointer"
              >
                <Camera className="h-5 w-5" />
              </button>

              {/* Input file tersembunyi */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Opsi hapus foto jika ada */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={uploading}
                className="text-xs font-medium text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              >
                Unggah Foto Baru
              </button>
              {avatarUrl && (
                <>
                  <span className="text-gray-300 dark:text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Foto</span>
                  </button>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-500 mt-1">
              JPG, PNG, atau WebP (maksimal 2 MB)
            </p>
          </div>

          {/* Form Nama & Bio */}
          <form onSubmit={handleSubmit} className="pt-6 flex flex-col gap-6">
            {/* Pesan Error */}
            {errorMsg && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">
                {errorMsg}
              </div>
            )}

            {/* 1. Nama */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span>Nama</span>
                </label>
                <span className="text-xs text-gray-500 dark:text-slate-500">{draftName.length}/30</span>
              </div>
              <input
                type="text"
                value={draftName}
                onChange={(e) => {
                  setDraftName(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                maxLength={30}
                placeholder="Masukkan nama tampilan Anda..."
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 dark:text-slate-500">
                Nama ini akan terlihat oleh pembaca dan penulis lain di seluruh cerita dan komentar.
              </p>
            </div>

            {/* 2. Bio */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span>Bio (Tentang)</span>
                </label>
                <span className="text-xs text-gray-500 dark:text-slate-500">{draftBio.length}/120</span>
              </div>
              <textarea
                value={draftBio}
                onChange={(e) => {
                  setDraftBio(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                maxLength={120}
                rows={3}
                placeholder="Tuliskan sedikit tentang dirimu atau cerita favoritmu..."
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />

              {/* Saran Cepat Bio */}
              <div className="mt-1">
                <p className="text-xs text-gray-500 dark:text-slate-500 mb-2">Pilih status cepat:</p>
                <div className="flex flex-wrap gap-2">
                  {quickBioSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setDraftBio(suggestion)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all text-left ${
                        draftBio === suggestion
                          ? "bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-300 font-medium"
                          : "border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => navigate("/profil")}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-98 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
