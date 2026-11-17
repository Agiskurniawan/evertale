import { useState, useRef, useEffect } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  Info,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import DataState from "../../components/DataState";
import AuthorSidebar from "../../components/author/AuthorSidebar";
import CardEpisodeRow from "../../components/cards/CardEpisodeRow";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { api, assetUrl, errorMessage } from "../../lib/api";
import type { AuthorSerialDetail, Category } from "../../types";

const BAHASA_OPTIONS = [
  "Bahasa Indonesia",
  "English",
  "日本語",
  "한국어",
  "中文",
];

const HARI_UPDATE_OPTIONS = [
  { value: "", label: "Tidak Ditentukan" },
  { value: "SENIN", label: "Senin" },
  { value: "SELASA", label: "Selasa" },
  { value: "RABU", label: "Rabu" },
  { value: "KAMIS", label: "Kamis" },
  { value: "JUMAT", label: "Jumat" },
  { value: "SABTU", label: "Sabtu" },
  { value: "MINGGU", label: "Minggu" },
];

export default function AuthorKarya() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, isAuthor, loading: authLoading } = useAuth();

  const {
    data: serial,
    loading,
    error,
    notFound,
    reload,
  } = useFetch(
    () =>
      api
        .get<{ data: AuthorSerialDetail }>(`/author/books/${id}`)
        .then((r) => r.data.data),
    [id],
    isLoggedIn && isAuthor
  );

  const { data: categoriesData } = useFetch(
    () => api.get<{ data: Category[] }>("/categories").then((r) => r.data.data),
    [],
    isLoggedIn && isAuthor
  );

  if (authLoading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAuthor) return <Navigate to="/profil" replace />;

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)] text-slate-500">
        Serial tidak ditemukan.
      </div>
    );
  }

  if (loading || error || !serial) return <DataState loading={loading} error={error} />;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-72px)] bg-gray-50 dark:bg-[#0B1220]">
      {/* Sidebar Reusable */}
      <AuthorSidebar activeTab="serial" />

      {/* Konten Form Edit / Kelola Serial (Full Width) */}
      <main className="flex-1 px-4 py-6 sm:px-8 lg:px-12 overflow-y-auto w-full">
        <EditSerialForm
          serial={serial}
          categories={categoriesData ?? []}
          onReload={reload}
        />
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Komponen Form Edit / Kelola Serial
// ─────────────────────────────────────────────────────────────
function EditSerialForm({
  serial,
  categories,
  onReload,
}: {
  serial: AuthorSerialDetail;
  categories: Category[];
  onReload: () => void;
}) {
  const navigate = useNavigate();

  // Form Fields State
  const [statusPenerbitan, setStatusPenerbitan] = useState<"ongoing" | "selesai">(
    serial.story_status || "ongoing"
  );
  const [bahasaSumber, setBahasaSumber] = useState<string>(
    serial.lang || "Bahasa Indonesia"
  );
  const [judulSerial, setJudulSerial] = useState<string>(serial.title || "");
  const [ringkasan, setRingkasan] = useState<string>(serial.desc || "");

  // Categories
  const categoryNames = categories.map((c) => c.name);
  const initialCat1 = serial.tags?.[0]?.replace("#", "") || categoryNames[0] || "Drama";
  const initialCat2 = serial.tags?.[1]?.replace("#", "") || "";

  const [kategori1, setKategori1] = useState<string>(initialCat1);
  const [kategori2, setKategori2] = useState<string>(initialCat2);
  const [updateDay, setUpdateDay] = useState<string>(serial.update_day || "");

  // Thumbnails
  const [thumbPersegiUrl, setThumbPersegiUrl] = useState<string | null>(
    serial.cover || null
  );
  const [thumbVertikalUrl, setThumbVertikalUrl] = useState<string | null>(null);
  const [thumbHeroUrl, setThumbHeroUrl] = useState<string | null>(
    serial.banner || null
  );
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  const filePersegiRef = useRef<HTMLInputElement>(null);
  const fileVertikalRef = useRef<HTMLInputElement>(null);
  const fileHeroRef = useRef<HTMLInputElement>(null);

  // Status submission
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const isNovel = serial.type === "novel";
  const [chaptersList, setChaptersList] = useState(serial.chapters || []);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    setChaptersList(serial.chapters || []);
  }, [serial.chapters]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Reorder API call (Drag and Drop)
  const handleReorder = async (newList: typeof serial.chapters) => {
    setChaptersList(newList);
    try {
      await api.put(`/author/books/${serial.id}/chapters/reorder`, {
        chapter_ids: newList.map((c) => c.id),
      });
      showToast(
        isNovel
          ? "Urutan bab berhasil diperbarui!"
          : "Urutan episode berhasil diperbarui!"
      );
      onReload();
    } catch (err) {
      showToast(errorMessage(err, "Gagal memperbarui urutan bab"));
      setChaptersList(serial.chapters || []);
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    _index: number
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetIdx: number
  ) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      return;
    }
    const updated = [...chaptersList];
    const [movedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, movedItem);

    // Update nomor bab secara lokal
    const renumbered = updated.map((item, idx) => ({ ...item, no: idx + 1 }));
    setDraggedIdx(null);
    handleReorder(renumbered);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...chaptersList];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    const renumbered = updated.map((item, idx) => ({ ...item, no: idx + 1 }));
    handleReorder(renumbered);
  };

  const handleMoveDown = (index: number) => {
    if (index === chaptersList.length - 1) return;
    const updated = [...chaptersList];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    const renumbered = updated.map((item, idx) => ({ ...item, no: idx + 1 }));
    handleReorder(renumbered);
  };

  // Upload Thumbnail Persegi (Cover Utama)
  const handleUploadPersegi = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2 MB.");
      return;
    }
    try {
      setUploadingThumb(true);
      setErrorMsg("");
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<{ url: string }>("/upload?type=cover", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setThumbPersegiUrl(res.data.url);
      showToast("Thumbnail persegi berhasil diunggah!");
    } catch (err) {
      setErrorMsg(errorMessage(err, "Gagal mengunggah thumbnail."));
    } finally {
      setUploadingThumb(false);
      if (filePersegiRef.current) filePersegiRef.current.value = "";
    }
  };

  // Upload Thumbnail Vertikal (Banner / Cover 9:16)
  const handleUploadVertikal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2 MB.");
      return;
    }
    try {
      setUploadingBanner(true);
      setErrorMsg("");
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<{ url: string }>("/upload?type=banner", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setThumbVertikalUrl(res.data.url);
      showToast("Thumbnail vertikal berhasil diunggah!");
    } catch (err) {
      setErrorMsg(errorMessage(err, "Gagal mengunggah thumbnail vertikal."));
    } finally {
      setUploadingBanner(false);
      if (fileVertikalRef.current) fileVertikalRef.current.value = "";
    }
  };

  // Upload Banner Hero Section (Landscape 16:9)
  const handleUploadHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5 MB.");
      return;
    }
    try {
      setUploadingHero(true);
      setErrorMsg("");
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<{ url: string }>("/upload?type=banner", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setThumbHeroUrl(res.data.url);
      showToast("Banner hero berhasil diunggah!");
    } catch (err) {
      setErrorMsg(errorMessage(err, "Gagal mengunggah banner hero."));
    } finally {
      setUploadingHero(false);
      if (fileHeroRef.current) fileHeroRef.current.value = "";
    }
  };

  // Hapus Episode
  const handleDeleteChapter = async (chapterId: number, title: string) => {
    if (!window.confirm(`Hapus episode "${title}"?`)) return;
    try {
      await api.delete(`/author/chapters/${chapterId}`);
      showToast(`Episode "${title}" dihapus`);
      onReload();
    } catch (e) {
      alert(errorMessage(e));
    }
  };

  // Simpan Perubahan Serial
  const handleSaveSerial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulSerial.trim()) {
      setErrorMsg("Judul serial wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const catIds = categories
        .filter((c) => [kategori1, kategori2].includes(c.name))
        .map((c) => c.id);

      await api.put(`/author/books/${serial.id}`, {
        title: judulSerial.trim(),
        synopsis: ringkasan.trim() || null,
        language: bahasaSumber,
        story_status: statusPenerbitan,
        update_day: updateDay || null,
        cover_url: thumbPersegiUrl || thumbVertikalUrl || thumbHeroUrl,
        banner_url: thumbHeroUrl || thumbVertikalUrl || thumbPersegiUrl,
        category_ids: catIds,
      });

      showToast("Perubahan serial berhasil disimpan!");
      onReload();
    } catch (err) {
      setErrorMsg(errorMessage(err, "Gagal menyimpan perubahan serial."));
    } finally {
      setSaving(false);
    }
  };

  // Hapus Seluruh Serial
  const handleDeleteSerial = async () => {
    if (
      !window.confirm(
        `PERINGATAN: Apakah Anda yakin ingin menghapus serial "${serial.title}" beserta seluruh episodenya? Tindakan ini tidak dapat dibatalkan.`
      )
    )
      return;

    try {
      setDeleting(true);
      await api.delete(`/author/books/${serial.id}`);
      alert("Serial berhasil dihapus.");
      navigate("/author");
    } catch (err) {
      alert(errorMessage(err, "Gagal menghapus serial."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* Toast Notifikasi */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Breadcrumb & Judul Halaman */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Link
            to="/author"
            className="inline-flex items-center gap-1 font-semibold text-gray-900 dark:text-white hover:text-blue-400 dark:hover:text-blue-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Serial</span>
          </Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-white font-medium">Edit Serial</span>
        </div>

        <button
          type="button"
          onClick={handleDeleteSerial}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Hapus Serial Ini</span>
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Serial</h1>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSerial} className="flex flex-col gap-6 w-full">
        {/* ─── KARTU 1: Status, Judul, Kategori ───────── */}
        <div className="rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 p-4 sm:p-6 flex flex-col gap-5 shadow-lg w-full">
          {/* Status Penerbitan */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <label className="text-sm font-bold text-gray-900 dark:text-white">Status Penerbitan</label>
            <div className="sm:col-span-3">
              <select
                value={statusPenerbitan}
                onChange={(e) =>
                  setStatusPenerbitan(e.target.value as "ongoing" | "selesai")
                }
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="ongoing">Berjalan (Ongoing)</option>
                <option value="selesai">Tamat (Selesai)</option>
              </select>
            </div>
          </div>

          {/* Bahasa Sumber */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <label className="text-sm font-bold text-gray-900 dark:text-white">Bahasa Sumber</label>
            <div className="sm:col-span-3">
              <select
                value={bahasaSumber}
                onChange={(e) => setBahasaSumber(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                {BAHASA_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Judul Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <label className="text-sm font-bold text-gray-900 dark:text-white">Judul Serial</label>
            <div className="sm:col-span-3 relative">
              <input
                type="text"
                maxLength={50}
                value={judulSerial}
                onChange={(e) => setJudulSerial(e.target.value)}
                placeholder="Masukkan judul serial..."
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-14 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-slate-500">
                {judulSerial.length}/50
              </span>
            </div>
          </div>

          {/* Ringkasan */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
            <label className="text-sm font-bold text-gray-900 dark:text-white pt-2">Ringkasan</label>
            <div className="sm:col-span-3 relative">
              <textarea
                rows={4}
                maxLength={500}
                value={ringkasan}
                onChange={(e) => setRingkasan(e.target.value)}
                placeholder="Tuliskan ringkasan / sinopsis serial..."
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl p-3.5 pb-7 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
              />
              <span className="absolute right-3.5 bottom-2 text-xs text-gray-400 dark:text-slate-500">
                {ringkasan.length}/500
              </span>
            </div>
          </div>

          {/* Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <label className="text-sm font-bold text-gray-900 dark:text-white">Kategori</label>
            <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={kategori1}
                onChange={(e) => setKategori1(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors uppercase"
              >
                {categoryNames.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={kategori2}
                onChange={(e) => setKategori2(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors uppercase"
              >
                <option value="">(Pilih Kategori Tambahan)</option>
                {categoryNames
                  .filter((cat) => cat !== kategori1)
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── KARTU 2: Thumbnail Persegi & Vertikal ─────────────── */}
        <div className="rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 p-6 flex flex-col gap-5 shadow-lg w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <label className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white pt-2">
              <span>Thumbnail</span>
              <span
                title="Unggah gambar sampul persegi dan vertikal"
                className="text-gray-400 dark:text-slate-400 cursor-help"
              >
                <Info className="h-3.5 w-3.5" />
              </span>
            </label>

            <div className="md:col-span-3 flex flex-col gap-4">
              <div className="flex items-start gap-6 flex-wrap">
                {/* 1. Thumbnail Persegi */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Persegi
                  </span>
                  <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] rounded-xl bg-gray-100 dark:bg-[#0B1220] border-2 border-dashed border-gray-300 dark:border-white/15 relative overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500/50 transition-colors">
                    {thumbPersegiUrl ? (
                      <>
                        <img
                          src={assetUrl(thumbPersegiUrl)}
                          alt="Cover Persegi"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => filePersegiRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold"
                          >
                            Ganti
                          </button>
                          <button
                            type="button"
                            onClick={() => setThumbPersegiUrl(null)}
                            className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={uploadingThumb}
                        onClick={() => filePersegiRef.current?.click()}
                        className="flex flex-col items-center gap-1.5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white p-2 transition-colors disabled:opacity-50"
                      >
                        {uploadingThumb ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Upload className="h-5 w-5 text-blue-400" />
                        )}
                        <span className="text-[11px] font-medium">Unggah Foto</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={filePersegiRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleUploadPersegi}
                  />
                </div>

                {/* 2. Thumbnail Vertikal */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Vertikal
                  </span>
                  <div className="w-[110px] h-[140px] sm:w-[125px] sm:h-[160px] rounded-xl bg-gray-100 dark:bg-[#0B1220] border-2 border-dashed border-gray-300 dark:border-white/15 relative overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500/50 transition-colors">
                    {thumbVertikalUrl ? (
                      <>
                        <img
                          src={assetUrl(thumbVertikalUrl)}
                          alt="Cover Vertikal"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileVertikalRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold"
                          >
                            Ganti
                          </button>
                          <button
                            type="button"
                            onClick={() => setThumbVertikalUrl(null)}
                            className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={uploadingBanner}
                        onClick={() => fileVertikalRef.current?.click()}
                        className="flex flex-col items-center gap-1.5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white p-2 transition-colors disabled:opacity-50"
                      >
                        {uploadingBanner ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Upload className="h-5 w-5 text-blue-400" />
                        )}
                        <span className="text-[11px] font-medium">Unggah Foto</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileVertikalRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleUploadVertikal}
                  />
                </div>

                {/* 3. Banner Hero Section */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Banner Hero Beranda
                  </span>
                  <div className="w-[200px] h-[112px] sm:w-[240px] sm:h-[135px] rounded-xl bg-gray-100 dark:bg-[#0B1220] border-2 border-dashed border-gray-300 dark:border-white/15 relative overflow-hidden flex flex-col items-center justify-center group hover:border-emerald-500/50 transition-colors">
                    {thumbHeroUrl ? (
                      <>
                        <img
                          src={assetUrl(thumbHeroUrl)}
                          alt="Banner Hero"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileHeroRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                          >
                            Ganti
                          </button>
                          <button
                            type="button"
                            onClick={() => setThumbHeroUrl(null)}
                            className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={uploadingHero}
                        onClick={() => fileHeroRef.current?.click()}
                        className="flex flex-col items-center gap-1.5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white p-2 transition-colors disabled:opacity-50"
                      >
                        {uploadingHero ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Upload className="h-5 w-5 text-emerald-400" />
                        )}
                        <span className="text-[11px] font-medium">Unggah Foto</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">1920 × 520 px (Ideal)</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileHeroRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleUploadHero}
                  />
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 text-center max-w-[240px]">
                    Ukuran pas hero: 1920 × 520 px. Jika rasio berbeda, sistem crop otomatis.
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 dark:text-slate-500 space-y-0.5 leading-relaxed pt-1">
                <p>
                  • Thumbnail Persegi 1080×1080px · Vertikal 1080×1920px · Banner Hero 1920×1080px.
                </p>
                <p>• Hanya format JPG, JPEG, PNG, dan WebP yang diperbolehkan. Maks 2 MB (Banner Hero maks 5 MB).</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── KARTU 3: Jadwal Tayang ────────────────────────────── */}
        <div className="rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 p-6 flex flex-col gap-5 shadow-lg w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <label className="text-sm font-bold text-gray-900 dark:text-white">Jadwal Update</label>
            <div className="md:col-span-3">
              <select
                value={updateDay}
                onChange={(e) => setUpdateDay(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                {HARI_UPDATE_OPTIONS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tombol Simpan Perubahan Serial */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate("/author")}
            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </form>

      {/* ─── KARTU 4: Kelola Daftar Bab / Episode ─────────── */}
      <div className="rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 p-4 sm:p-6 flex flex-col gap-4 shadow-lg w-full mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {isNovel ? "Daftar Bab Novel" : "Daftar Episode Komik"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-500">
              Total {chaptersList.length} {isNovel ? "bab" : "episode"} dalam karya ini.{" "}
              {chaptersList.length > 1 && (
                <span className="text-blue-500 dark:text-blue-400 font-medium">
                  Tahan & geser (drag & drop) untuk mengurutkan ulang.
                </span>
              )}
            </p>
          </div>

          <Link
            to={
              isNovel
                ? `/author/novel-editor?serial=${serial.id}`
                : `/author/tulis?serial=${serial.id}`
            }
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-95 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isNovel ? "Tambah Bab" : "Tambah Episode"}</span>
          </Link>
        </div>

        {chaptersList.length === 0 ? (
          <div className="py-12 text-center text-gray-400 dark:text-slate-500 text-xs">
            Belum ada {isNovel ? "bab" : "episode"} yang ditulis. Klik "
            {isNovel ? "Tambah Bab" : "Tambah Episode"}" untuk mulai menulis!
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {chaptersList.map((chapter, index) => (
              <CardEpisodeRow
                key={chapter.id}
                serialId={serial.id}
                chapter={chapter}
                index={index}
                total={chaptersList.length}
                isNovel={isNovel}
                draggable={chaptersList.length > 1}
                isDragging={draggedIdx === index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={() => setDraggedIdx(null)}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onDelete={handleDeleteChapter}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
