import { useState, useRef, useMemo } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  Trash2,
  Info,
  Smartphone,
  Monitor,
  AlertCircle,
  Check,
  Loader2,
  FileText,
} from "lucide-react";
import DataState from "../../components/DataState";
import AuthorSidebar from "../../components/author/AuthorSidebar";
import ModalPreviewEpisode from "../../components/modals/ModalPreviewEpisode";
import ModalClipStudio from "../../components/modals/ModalClipStudio";
import ModalPedomanKonten from "../../components/modals/ModalPedomanKonten";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { api, assetUrl, errorMessage } from "../../lib/api";
import type { AuthorChapterEdit, AuthorSerialDetail } from "../../types";

export default function AuthorTulis() {
  const { isLoggedIn, isAuthor, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const serialId = params.get("serial");
  const episodeId = params.get("episode");
  const ready = isLoggedIn && isAuthor;

  const serial = useFetch(
    () =>
      api
        .get<{ data: AuthorSerialDetail }>(`/author/books/${serialId}`)
        .then((r) => r.data.data),
    [serialId],
    ready && Boolean(serialId)
  );

  const episode = useFetch(
    () =>
      api
        .get<{ data: AuthorChapterEdit }>(`/author/chapters/${episodeId}`)
        .then((r) => r.data.data),
    [episodeId],
    ready && Boolean(episodeId)
  );

  if (authLoading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAuthor) return <Navigate to="/profil" replace />;

  const loading = serial.loading || episode.loading;
  const error = serial.error || episode.error;
  if (loading || error) return <DataState loading={loading} error={error} />;

  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-gray-50 dark:bg-[#0B1220]">
      {/* Sidebar Reusable */}
      <AuthorSidebar activeTab="serial" />

      {/* Konten Form Kelola Episode */}
      <main className="flex-1 px-4 py-8 md:px-10 lg:px-14 overflow-y-auto w-full">
        <EpisodeEditor
          serial={serial.data}
          episode={episode.data}
          serialId={serialId}
        />
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Editor Form Komponen
// ─────────────────────────────────────────────────────────────
interface EpisodeEditorProps {
  serial: AuthorSerialDetail | null;
  episode: AuthorChapterEdit | null;
  serialId: string | null;
}

function EpisodeEditor({ serial, episode, serialId }: EpisodeEditorProps) {
  const navigate = useNavigate();

  const defaultChapterNumber = useMemo(() => {
    if (episode?.chapter_number) return episode.chapter_number;
    if (serial?.chapters?.length) return serial.chapters.length + 1;
    return 1;
  }, [episode, serial]);

  // Form State
  const [chapterNumber, setChapterNumber] = useState<number>(defaultChapterNumber);
  const [chapterTitle, setChapterTitle] = useState(episode?.title ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    episode?.thumbnail_url ?? ""
  );
  const [pages, setPages] = useState<string[]>(episode?.pages ?? []);
  const [novelContent, setNovelContent] = useState<string>(episode?.content ?? "");
  const [creatorNote, setCreatorNote] = useState<string>("");
  const [allowComments, setAllowComments] = useState<boolean>(true);
  const [publishMode, setPublishMode] = useState<"segera" | "jadwalkan">("segera");
  const [scheduledDate, setScheduledDate] = useState<string>("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingPages, setUploadingPages] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Modals state
  const [previewModal, setPreviewModal] = useState<"pc" | "mobile" | null>(null);
  const [clipStudioModal, setClipStudioModal] = useState(false);
  const [proTipsModal, setProTipsModal] = useState(false);

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isComic = serial?.type === "komik";

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Upload Thumbnail
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran thumbnail maksimal 2 MB.");
      return;
    }

    try {
      setUploadingThumb(true);
      setErrorMsg("");
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<{ url: string }>("/upload?type=thumbnail", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setThumbnailUrl(res.data.url);
      showToast("Thumbnail berhasil diunggah!");
    } catch (err) {
      setErrorMsg(errorMessage(err, "Gagal mengunggah thumbnail."));
    } finally {
      setUploadingThumb(false);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  };

  // Upload Pages / Halaman Gambar
  const handlePagesUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    try {
      setUploadingPages(true);
      setErrorMsg("");
      const newPages: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} melebihi 5 MB, dilewati.`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post<{ url: string }>("/upload?type=page", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        newPages.push(res.data.url);
      }

      setPages((prev) => [...prev, ...newPages]);
      showToast(`${newPages.length} gambar berhasil diunggah!`);
    } catch (err) {
      setErrorMsg(errorMessage(err, "Gagal mengunggah gambar."));
    } finally {
      setUploadingPages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handlePagesUpload(e.dataTransfer.files);
    }
  };

  const handleClearAllPages = () => {
    if (pages.length === 0) return;
    if (window.confirm("Hapus semua gambar yang telah diunggah di episode ini?")) {
      setPages([]);
      showToast("Semua gambar dihapus.");
    }
  };

  // Simpan / Terbitkan Episode
  const handleSubmit = async (publish: boolean) => {
    if (!chapterTitle.trim()) {
      setErrorMsg("Silakan masukkan judul episode.");
      return;
    }
    if (!serialId) {
      setErrorMsg("ID Serial tidak ditemukan.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const payload = {
        chapter_number: Number(chapterNumber) || 1,
        title: chapterTitle.trim(),
        content: novelContent || null,
        thumbnail_url: thumbnailUrl || null,
        pages: pages.length > 0 ? pages : undefined,
        is_published: publish,
      };

      if (episode) {
        await api.put(`/author/chapters/${episode.id}`, payload);
        showToast(
          publish ? "Episode berhasil diterbitkan!" : "Draft berhasil disimpan!"
        );
      } else {
        await api.post(`/author/books/${serialId}/chapters`, payload);
        showToast(
          publish ? "Episode berhasil diterbitkan!" : "Draft berhasil disimpan!"
        );
      }

      setTimeout(() => {
        navigate(`/author/karya/${serialId}`);
      }, 700);
    } catch (err) {
      setErrorMsg(errorMessage(err, "Gagal menyimpan episode."));
    } finally {
      setSaving(false);
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

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
        <Link
          to={`/author/karya/${serialId || ""}`}
          className="inline-flex items-center gap-1 font-semibold text-gray-900 dark:text-white hover:text-blue-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Serial</span>
        </Link>
        <span>/</span>
        <Link
          to={`/author/karya/${serialId || ""}`}
          className="hover:text-gray-700 dark:hover:text-white transition-colors"
        >
          Kelola Episode
        </Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-white font-medium">
          {episode ? "Edit Episode" : "Tambah Episode"}
        </span>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ─── KARTU 1: Informasi Dasar Serial & Episode ──────── */}
      <div className="rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 p-6 flex flex-col gap-5 shadow-lg w-full">
        {/* Judul Serial */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-3">
          <label className="text-sm font-bold text-gray-900 dark:text-white">Judul Serial</label>
          <div className="md:col-span-3">
            <input
              type="text"
              readOnly
              value={serial?.title ?? "Judul Serial"}
              className="w-full bg-gray-100 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-500 dark:text-slate-300 text-sm focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {/* Nomor Episode */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
            <span>Nomor Episode</span>
            <span
              title="Urutan nomor episode dalam serial ini"
              className="text-gray-400 dark:text-slate-400 cursor-help"
            >
              <Info className="h-3.5 w-3.5" />
            </span>
          </label>
          <div className="md:col-span-3">
            <input
              type="number"
              min={1}
              value={chapterNumber}
              onChange={(e) => setChapterNumber(Math.max(1, Number(e.target.value)))}
              className="w-28 bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Judul Episode */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-3">
          <label className="text-sm font-bold text-gray-900 dark:text-white">Judul Episode</label>
          <div className="md:col-span-3 relative">
            <input
              type="text"
              maxLength={60}
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Silakan masukkan judul episode."
              className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-14 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-slate-500">
              {chapterTitle.length}/60
            </span>
          </div>
        </div>
      </div>

      {/* ─── KARTU 2: Media, File Gambar / Naskah ────────────── */}
      <div className="rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 p-6 flex flex-col gap-6 shadow-lg w-full">
        {/* Thumbnail Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <label className="text-sm font-bold text-gray-900 dark:text-white pt-2">Thumbnail</label>
          <div className="md:col-span-3 flex flex-col gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-[202px] h-[142px] rounded-xl bg-gray-100 dark:bg-[#0B1220] border-2 border-dashed border-gray-300 dark:border-white/15 hover:border-blue-500/50 transition-colors relative flex flex-col items-center justify-center overflow-hidden flex-shrink-0 group">
                {thumbnailUrl ? (
                  <>
                    <img
                      src={assetUrl(thumbnailUrl)}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => thumbInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold"
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl("")}
                        className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-3">
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-500">
                      202 x 142
                    </span>
                    <button
                      type="button"
                      disabled={uploadingThumb}
                      onClick={() => thumbInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 text-gray-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {uploadingThumb ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5 text-blue-400" />
                      )}
                      <span>Pilih File</span>
                    </button>
                  </div>
                )}
              </div>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleThumbnailUpload}
              />
            </div>

            <div className="text-[11px] text-gray-500 dark:text-slate-500 space-y-0.5 leading-relaxed">
              <p>• Ukuran yang disarankan adalah 202x142 dan gambar harus kurang dari 500kb.</p>
              <p>• Hanya format JPG, JPEG, dan PNG yang diperbolehkan.</p>
              <p>• Nama file hanya boleh berupa huruf dan angka bahasa Inggris.</p>
              <p>
                • Gambar yang diunggah dengan rasio 16x9 sebelum tahun 2025 akan ditampilkan dalam ukuran 202x142.
              </p>
            </div>
          </div>
        </div>

        {/* Upload File / Halaman Komik */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border-t border-gray-100 dark:border-white/5 pt-6">
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white pt-2">
            <span>Pilih File</span>
            <span
              title="Unggah halaman gambar komik atau naskah tulisan"
              className="text-gray-400 dark:text-slate-400 cursor-help"
            >
              <Info className="h-3.5 w-3.5" />
            </span>
          </label>

          <div className="md:col-span-3 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => handlePagesUpload(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPages}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {uploadingPages ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>Pilih file untuk diunggah</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClipStudioModal(true)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#0B1220] hover:bg-gray-200 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white text-xs font-medium transition-colors"
                >
                  Impor dari Clip Studio Paint
                </button>

                <button
                  type="button"
                  onClick={handleClearAllPages}
                  disabled={pages.length === 0}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 text-gray-500 dark:text-slate-400 hover:text-red-400 text-xs font-medium transition-colors disabled:opacity-40"
                >
                  Hapus Semua
                </button>
              </div>

              <span className="text-xs text-gray-500 dark:text-slate-500 font-mono">
                {pages.length > 0 ? `${pages.length} Gambar` : "0/50MB"}
              </span>
            </div>

            {/* Dropzone Box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => {
                if (pages.length === 0) fileInputRef.current?.click();
              }}
              className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-[#0B1220]/70 p-8 flex flex-col items-center justify-center text-center transition-colors min-h-[190px] cursor-pointer hover:border-blue-500/40 w-full"
            >
              {pages.length === 0 ? (
                <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-slate-400">
                  <ImageIcon className="h-8 w-8 text-gray-400 dark:text-slate-500 mb-1" />
                  <p className="text-xs font-medium text-gray-700 dark:text-slate-300">
                    Seret dan lepas file gambar
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-500">
                    atau klik di sini untuk memilih file dari perangkat Anda
                  </p>
                </div>
              ) : (
                <div
                  className="w-full flex flex-col gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-xs font-semibold text-gray-900 dark:text-white text-left">
                    Daftar Halaman ({pages.length} gambar diunggah)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-1">
                    {pages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#101726] aspect-[2/3]"
                      >
                        <img
                          src={assetUrl(img)}
                          alt={`Halaman ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white font-mono">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1 right-1 p-1 rounded bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-gray-500 dark:text-slate-500 space-y-0.5 leading-relaxed">
              <p>
                • Sistem akan memotong dan mengurangi ukuran gambar yang melebihi dimensi maksimal 800x1280px secara otomatis.
              </p>
              <p>
                • Gambar yang melebihi dimensi maksimal dapat dioptimalkan dengan berbagai cara.
              </p>
              <p>
                • Ukuran file maksimal untuk semua gambar adalah 2MB. Anda dapat mengunggah hingga 50MB, total 100 gambar.
              </p>
              <p>• Hanya format JPG, JPEG, PNG yang didukung.</p>
            </div>

            {/* Naskah / Teks Cerita */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  <span>Isi Cerita / Teks Episode {isComic ? "(Opsional)" : ""}</span>
                </label>
                <span className="text-[11px] text-gray-500 dark:text-slate-500">
                  {novelContent.trim()
                    ? `${novelContent.trim().split(/\s+/).length} kata`
                    : "0 kata"}
                </span>
              </div>
              <textarea
                rows={6}
                value={novelContent}
                onChange={(e) => setNovelContent(e.target.value)}
                placeholder="Tuliskan naskah atau cerita episode di sini..."
                className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white text-xs leading-relaxed placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-y"
              />
            </div>
          </div>
        </div>

        {/* Tips PRO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border-t border-gray-100 dark:border-white/5 pt-6">
          <label className="text-sm font-bold text-gray-900 dark:text-white pt-1">Tips PRO</label>
          <div className="md:col-span-3 text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
            <span>
              Ketelanjangan, konten seksual eksplisit, kekerasan yang tidak perlu, konten yang kasar atau berbahaya, dan pelanggaran hak cipta atau merek dagang apa pun tidak diperbolehkan.{" "}
            </span>
            <button
              type="button"
              onClick={() => setProTipsModal(true)}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-semibold underline underline-offset-2 ml-1"
            >
              Detail Selengkapnya
            </button>
          </div>
        </div>

        {/* Pratinjau */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-t border-gray-100 dark:border-white/5 pt-6">
          <label className="text-sm font-bold text-gray-900 dark:text-white">Pratinjau</label>
          <div className="md:col-span-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreviewModal("pc")}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Monitor className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              <span>Pratinjau PC</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewModal("mobile")}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Smartphone className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              <span>Pratinjau Seluler</span>
            </button>
          </div>
        </div>

        {/* Catatan Kreator */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border-t border-gray-100 dark:border-white/5 pt-6">
          <label className="text-sm font-bold text-gray-900 dark:text-white pt-2">
            Catatan Kreator <span className="text-xs text-gray-500 dark:text-slate-500 font-normal">(opsional)</span>
          </label>
          <div className="md:col-span-3 relative">
            <textarea
              rows={3}
              maxLength={400}
              value={creatorNote}
              onChange={(e) => setCreatorNote(e.target.value)}
              placeholder="Masukkan pesan untuk penggemarmu."
              className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl p-3.5 pb-7 text-gray-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
            <span className="absolute right-3 bottom-2.5 text-[11px] text-gray-400 dark:text-slate-500">
              {creatorNote.length}/400
            </span>
          </div>
        </div>
      </div>

      {/* ─── KARTU 3: Pengaturan Komentar & Publikasi ───────── */}
      <div className="rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 p-6 flex flex-col gap-6 shadow-lg w-full">
        {/* Komentar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-sm font-bold text-gray-900 dark:text-white">Komentar</label>
          <div className="md:col-span-3 flex items-center gap-8">
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300 font-medium cursor-pointer">
              <input
                type="radio"
                name="comments"
                checked={allowComments}
                onChange={() => setAllowComments(true)}
                className="accent-blue-500 h-4 w-4"
              />
              <span>Aktifkan</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300 font-medium cursor-pointer">
              <input
                type="radio"
                name="comments"
                checked={!allowComments}
                onChange={() => setAllowComments(false)}
                className="accent-blue-500 h-4 w-4"
              />
              <span>Nonaktifkan</span>
            </label>
          </div>
        </div>

        {/* Publikasikan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border-t border-gray-100 dark:border-white/5 pt-6">
          <label className="text-sm font-bold text-gray-900 dark:text-white pt-1">Publikasikan</label>
          <div className="md:col-span-3 flex flex-col gap-3">
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="radio"
                  name="publish_schedule"
                  checked={publishMode === "segera"}
                  onChange={() => setPublishMode("segera")}
                  className="accent-blue-500 h-4 w-4"
                />
                <span>Segera</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="radio"
                  name="publish_schedule"
                  checked={publishMode === "jadwalkan"}
                  onChange={() => setPublishMode("jadwalkan")}
                  className="accent-blue-500 h-4 w-4"
                />
                <span>Jadwalkan untuk nanti</span>
              </label>
            </div>

            {publishMode === "jadwalkan" && (
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="pt-1">
              <button
                type="button"
                onClick={() =>
                  alert("Tidak ada episode yang sedang dijadwalkan saat ini.")
                }
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#0B1220] text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white text-xs font-medium transition-colors"
              >
                Periksa Episode Terjadwal <span className="text-blue-500 dark:text-blue-400 font-bold">0</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Aksi Bawah */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSubmit(false)}
          className="px-8 py-3 rounded-xl bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 text-gray-700 dark:text-slate-200 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan Draft"}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => handleSubmit(true)}
          className="px-9 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{episode ? "Simpan Perubahan" : "Tambah Episode"}</span>
        </button>
      </div>

      {/* Modals yang diekstrak */}
      {previewModal && (
        <ModalPreviewEpisode
          mode={previewModal}
          onClose={() => setPreviewModal(null)}
          chapterNumber={chapterNumber}
          chapterTitle={chapterTitle}
          pages={pages}
          novelContent={novelContent}
          creatorNote={creatorNote}
        />
      )}

      {clipStudioModal && (
        <ModalClipStudio onClose={() => setClipStudioModal(false)} />
      )}

      {proTipsModal && (
        <ModalPedomanKonten onClose={() => setProTipsModal(false)} />
      )}
    </div>
  );
}
