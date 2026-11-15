import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  Save,
  Send,
  Eye,
  History,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Divide,
  RotateCcw,
  RotateCw,
  Check,
  AlertCircle,
  Loader2,
  X,
  Clock,
  BookOpen,
  PenTool,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useFetch } from "../../hooks/useFetch";
import { api, assetUrl, errorMessage } from "../../lib/api";
import type { AuthorChapterEdit, AuthorSerialDetail } from "../../types";

interface VersionItem {
  id: string;
  timestamp: number;
  dateStr: string;
  wordCount: number;
  title: string;
  content: string;
}

export default function AuthorNovelEditor() {
  const { isLoggedIn, isAuthor, loading: authLoading } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const serialId = params.get("serial");
  const chapterId = params.get("chapter");
  const ready = isLoggedIn && isAuthor;

  // Data serial & chapter
  const serial = useFetch(
    () =>
      api
        .get<{ data: AuthorSerialDetail }>(`/author/books/${serialId}`)
        .then((r) => r.data.data),
    [serialId],
    ready && Boolean(serialId)
  );

  const chapter = useFetch(
    () =>
      api
        .get<{ data: AuthorChapterEdit }>(`/author/chapters/${chapterId}`)
        .then((r) => r.data.data),
    [chapterId],
    ready && Boolean(chapterId)
  );

  // Editor Form States
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [title, setTitle] = useState<string>("");
  const [contentHtml, setContentHtml] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [useCustomThumbnail, setUseCustomThumbnail] = useState<boolean>(false);
  const [creatorNote, setCreatorNote] = useState<string>("");
  const [isPublished, setIsPublished] = useState<boolean>(false);

  // Status & UI States
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isUploadingThumb, setIsUploadingThumb] = useState<boolean>(false);

  // References
  const editorRef = useRef<HTMLDivElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const isInitialLoad = useRef<boolean>(true);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeChapterIdRef = useRef<string | null>(chapterId);

  // Local storage version history key
  const historyKey = useMemo(() => {
    return `novel_draft_history_${serialId || "0"}_${chapterId || "new"}`;
  }, [serialId, chapterId]);

  const [versionList, setVersionList] = useState<VersionItem[]>([]);

  // Load versions from localStorage
  const loadVersionHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(historyKey);
      if (stored) {
        const parsed = JSON.parse(stored) as VersionItem[];
        setVersionList(parsed);
      } else {
        setVersionList([]);
      }
    } catch {
      setVersionList([]);
    }
  }, [historyKey]);

  useEffect(() => {
    loadVersionHistory();
  }, [loadVersionHistory]);

  // Save snapshot to version history
  const saveVersionSnapshot = useCallback(
    (curTitle: string, curContent: string, words: number) => {
      if (!curContent.trim() && !curTitle.trim()) return;
      try {
        const now = new Date();
        const dateStr = now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const stored = localStorage.getItem(historyKey);
        let list: VersionItem[] = stored ? JSON.parse(stored) : [];

        // Don't save duplicate if text hasn't changed
        if (list.length > 0 && list[0].content === curContent) return;

        const newVersion: VersionItem = {
          id: String(Date.now()),
          timestamp: Date.now(),
          dateStr: `${now.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} ${dateStr}`,
          wordCount: words,
          title: curTitle,
          content: curContent,
        };

        // Keep maximum 15 snapshots
        list = [newVersion, ...list].slice(0, 15);
        localStorage.setItem(historyKey, JSON.stringify(list));
        setVersionList(list);
      } catch (e) {
        console.error("Gagal menyimpan snapshot versi:", e);
      }
    },
    [historyKey]
  );

  // Show Toast
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Sync data saat chapter dimuat dari backend
  useEffect(() => {
    if (chapter.data) {
      setChapterNumber(chapter.data.chapter_number || 1);
      setTitle(chapter.data.title || "");
      const html = chapter.data.content || "";
      setContentHtml(html);
      if (editorRef.current && isInitialLoad.current) {
        editorRef.current.innerHTML = html;
        isInitialLoad.current = false;
      }
      if (chapter.data.thumbnail_url) {
        setThumbnailUrl(chapter.data.thumbnail_url);
        setUseCustomThumbnail(true);
      }
      setIsPublished(Boolean(chapter.data.is_published));
      setSaveStatus("saved");
      setLastSavedTime(
        new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      );
    } else if (serial.data && !chapterId && isInitialLoad.current) {
      // Menambah bab baru
      const nextNum = (serial.data.chapters?.length || 0) + 1;
      setChapterNumber(nextNum);
      isInitialLoad.current = false;
    }
  }, [chapter.data, serial.data, chapterId]);

  // Hitung jumlah kata dan karakter live
  const stats = useMemo(() => {
    // Bersihkan tag HTML untuk menghitung kata naskah sebenarnya
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = contentHtml;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    const cleanText = plainText.trim();
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    const chars = cleanText.length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    return { words, chars, readTime, plainText };
  }, [contentHtml]);

  // Handler simpan (Draft / Terbit)
  const handleSave = async (publish: boolean, isAutosave = false) => {
    if (!title.trim() && !isAutosave) {
      setErrorMsg("Silakan masukkan judul bab terlebih dahulu.");
      return;
    }
    if (!contentHtml.trim() && !isAutosave) {
      setErrorMsg("Naskah bab masih kosong. Silakan tulis naskah Anda.");
      return;
    }
    if (!serialId) {
      setErrorMsg("Serial tidak valid.");
      return;
    }

    try {
      if (!isAutosave) setErrorMsg("");
      setSaveStatus("saving");

      const finalThumb = useCustomThumbnail && thumbnailUrl.trim() ? thumbnailUrl.trim() : null;
      const payload = {
        chapter_number: Number(chapterNumber) || 1,
        title: title.trim() || `Bab ${chapterNumber}`,
        content: contentHtml,
        thumbnail_url: finalThumb,
        is_published: publish,
      };

      let resultId = activeChapterIdRef.current;

      if (activeChapterIdRef.current) {
        await api.put(`/author/chapters/${activeChapterIdRef.current}`, payload);
      } else {
        const res = await api.post<{ data: { id: number; chapter_number: number } }>(
          `/author/books/${serialId}/chapters`,
          payload
        );
        resultId = String(res.data.data.id);
        activeChapterIdRef.current = resultId;
        // Ganti URL tanpa reload agar state tersambung ke ID bab baru
        window.history.replaceState(null, "", `/author/novel-editor?serial=${serialId}&chapter=${resultId}`);
      }

      setSaveStatus("saved");
      const timeStr = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSavedTime(timeStr);
      setIsPublished(publish);

      // Simpan snapshot versi
      saveVersionSnapshot(title.trim(), contentHtml, stats.words);

      if (!isAutosave) {
        showToast(publish ? "Bab berhasil diterbitkan!" : "Draft naskah berhasil disimpan!");
      }
    } catch (err) {
      setSaveStatus("unsaved");
      if (!isAutosave) {
        setErrorMsg(errorMessage(err, "Gagal menyimpan bab."));
      }
    }
  };

  // Autosave otomatis dengan debounce 4 detik
  const triggerAutosave = useCallback(
    (curTitle: string, curHtml: string) => {
      setSaveStatus("unsaved");
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

      autosaveTimerRef.current = setTimeout(() => {
        if (curTitle.trim() || curHtml.trim()) {
          handleSave(isPublished, true);
        }
      }, 4000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPublished, chapterNumber, useCustomThumbnail, thumbnailUrl, serialId]
  );

  // Monitor perubahan konten dari editor
  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContentHtml(html);
      triggerAutosave(title, html);
    }
  };

  // Peringatan saat menutup tab dengan perubahan belum tersimpan
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // Rich-Text Toolbar Actions
  const executeCommand = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
    }
  };

  // Sisipkan Pemisah Adegan (Scene Break ***)
  const insertSceneBreak = () => {
    const dividerHtml = `<p class="scene-break" style="text-align: center; margin: 2rem 0; font-weight: bold; letter-spacing: 0.25em; color: #94a3b8; user-select: none;">***</p><p><br></p>`;
    document.execCommand("insertHTML", false, dividerHtml);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
    }
  };

  // Pembersihan Paste dari Word / Docs agar paragraf & styling bersih
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");

    if (text) {
      // Pisahkan teks per baris baru menjadi paragraf yang rapi
      const paragraphs = text
        .split(/\r?\n\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (paragraphs.length > 0) {
        const cleanHtml = paragraphs.map((p) => `<p>${p.replace(/\r?\n/g, "<br>")}</p>`).join("");
        document.execCommand("insertHTML", false, cleanHtml);
      } else {
        document.execCommand("insertText", false, text);
      }
      handleEditorInput();
    }
  };

  // Upload Thumbnail Bab Khusus
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2 MB.");
      return;
    }

    try {
      setIsUploadingThumb(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<{ url: string }>("/upload?type=thumbnail", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setThumbnailUrl(res.data.url);
      setUseCustomThumbnail(true);
      showToast("Thumbnail bab berhasil diunggah!");
      setSaveStatus("unsaved");
    } catch (err) {
      alert(errorMessage(err, "Gagal mengunggah thumbnail."));
    } finally {
      setIsUploadingThumb(false);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  };

  // Pulihkan Versi dari Riwayat
  const handleRestoreVersion = (version: VersionItem) => {
    if (
      window.confirm(
        `Pulihkan naskah ke versi ${version.dateStr} (${version.wordCount} kata)? Perubahan naskah saat ini akan diganti.`
      )
    ) {
      setTitle(version.title);
      setContentHtml(version.content);
      if (editorRef.current) {
        editorRef.current.innerHTML = version.content;
      }
      setShowHistoryModal(false);
      showToast("Versi naskah berhasil dipulihkan!");
      setSaveStatus("unsaved");
    }
  };

  if (authLoading) return null;
  if (!isLoggedIn) return navigate("/login") as unknown as null;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        darkMode ? "dark bg-[#080D18] text-slate-100" : "bg-[#F4F6F9] text-gray-900"
      }`}
    >
      {/* ── Toast Notifikasi ── */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-blue-600 px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-2xl animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── TOPBAR EDITOR ── */}
      {!isFocusMode && (
        <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-white/95 dark:bg-[#0D1526]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-xs">
          {/* Sisi Kiri: Kembali & Info Novel */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              to={`/author/karya/${serialId || ""}`}
              className="p-1.5 sm:p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title="Kembali ke Kelola Novel"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Novel
                </span>
                <span className="text-gray-300 dark:text-slate-600">•</span>
                <span className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[120px] sm:max-w-[200px]">
                  {serial.data?.title || "Judul Novel"}
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-xs">
                Bab {chapterNumber}: {title || "Tanpa Judul"}
              </h1>
            </div>
          </div>

          {/* Sisi Tengah: Status Autosave */}
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 font-medium">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400 animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan otomatis...</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                <span>Tersimpan {lastSavedTime ? `(${lastSavedTime})` : ""}</span>
              </span>
            )}
            {saveStatus === "unsaved" && (
              <span className="flex items-center gap-1.5 text-amber-500">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Ada perubahan belum tersimpan</span>
              </span>
            )}
          </div>

          {/* Sisi Kanan: Aksi & Tombol Simpan */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Riwayat Versi */}
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative"
              title="Riwayat Versi Naskah"
            >
              <History className="h-4 w-4" />
              {versionList.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
              )}
            </button>

            {/* Mode Fokus Layar Penuh */}
            <button
              type="button"
              onClick={() => setIsFocusMode(true)}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors hidden sm:inline-flex"
              title="Mode Fokus (Layar Penuh)"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Mode Gelap/Terang */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Pratinjau Tampilan Pembaca */}
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5 text-blue-500" />
              <span className="hidden sm:inline">Pratinjau</span>
            </button>

            {/* Simpan Draft */}
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-800 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Simpan Draft</span>
              <span className="sm:hidden">Draft</span>
            </button>

            {/* Terbitkan */}
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isPublished ? "Perbarui" : "Terbitkan"}</span>
            </button>
          </div>
        </header>
      )}

      {/* Floating Exit Button saat Mode Fokus */}
      {isFocusMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 dark:bg-[#101726]/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-xs font-semibold"
          >
            Simpan Draft
          </button>
          <button
            type="button"
            onClick={() => setIsFocusMode(false)}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-slate-300"
            title="Keluar dari Mode Fokus"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── AREA UTAMA EDITOR ── */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 md:py-10 flex flex-col gap-6">
        {/* Pesan Kesalahan */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm text-red-500 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── CARD METADATA BAB: NOMOR & JUDUL & THUMBNAIL (OPSIONAL) ── */}
        {!isFocusMode && (
          <div className="rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Nomor Bab */}
              <div className="w-28 shrink-0">
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 block mb-1">
                  Nomor Bab
                </label>
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#080D18] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-blue-500">Bab</span>
                  <input
                    type="number"
                    min={1}
                    value={chapterNumber}
                    onChange={(e) => {
                      const val = Math.max(1, Number(e.target.value));
                      setChapterNumber(val);
                      triggerAutosave(title, contentHtml);
                    }}
                    className="w-full bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Judul Bab */}
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 block mb-1">
                  Judul Bab
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    triggerAutosave(e.target.value, contentHtml);
                  }}
                  placeholder="Contoh: Awal Mula Sang Pengelana..."
                  className="w-full bg-gray-50 dark:bg-[#080D18] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm sm:text-base font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Thumbnail Bab (Opsional Khusus Novel Sesuai Permintaan Pengguna) */}
            <div className="border-t border-gray-100 dark:border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-14 rounded-lg bg-gray-100 dark:bg-[#080D18] border border-gray-200 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                  {useCustomThumbnail && thumbnailUrl ? (
                    <img
                      src={assetUrl(thumbnailUrl)}
                      alt="Thumbnail Bab"
                      className="w-full h-full object-cover"
                    />
                  ) : serial.data?.cover ? (
                    <img
                      src={assetUrl(serial.data.cover)}
                      alt="Cover Novel"
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                <div>
                  <p className="font-bold text-gray-800 dark:text-slate-200">
                    Thumbnail Bab{" "}
                    <span className="text-[10px] font-normal text-gray-400 dark:text-slate-500">
                      (Tidak Wajib / Opsional)
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    {useCustomThumbnail && thumbnailUrl
                      ? "Menggunakan gambar khusus untuk bab ini."
                      : "Otomatis menggunakan cover utama novel."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleThumbnailUpload}
                />
                {useCustomThumbnail && thumbnailUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailUrl("");
                      setUseCustomThumbnail(false);
                      setSaveStatus("unsaved");
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-500/20 text-red-500 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Pakai Cover Novel
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isUploadingThumb}
                    onClick={() => thumbInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {isUploadingThumb ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3 text-blue-500" />
                    )}
                    <span>Unggah Thumbnail Bab</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TOOLBAR FORMATTING TEKS ── */}
        <div className="sticky top-[58px] z-20 flex items-center justify-between flex-wrap gap-1.5 p-2 rounded-2xl bg-white/95 dark:bg-[#101726]/95 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-md">
          {/* Kelompok Formatting Teks Dasar */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 active:scale-95 transition-all"
              title="Tebal (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 active:scale-95 transition-all"
              title="Miring (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("underline")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 active:scale-95 transition-all"
              title="Garis Bawah (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-gray-200 dark:bg-white/10" />

          {/* Kelompok Perataan (Alignment) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => executeCommand("justifyLeft")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 active:scale-95 transition-all"
              title="Rata Kiri"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyCenter")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 active:scale-95 transition-all"
              title="Rata Tengah"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyRight")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 active:scale-95 transition-all"
              title="Rata Kanan"
            >
              <AlignRight className="h-4 w-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-gray-200 dark:bg-white/10" />

          {/* Pemisah Adegan (Scene Break ***) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={insertSceneBreak}
              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
              title="Sisipkan Pemisah Adegan (***)"
            >
              <Divide className="h-3.5 w-3.5" />
              <span>Pemisah (***)</span>
            </button>
          </div>

          <div className="h-5 w-px bg-gray-200 dark:bg-white/10" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => executeCommand("undo")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 active:scale-95 transition-all"
              title="Urungkan (Undo)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("redo")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 active:scale-95 transition-all"
              title="Ulangi (Redo)"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── CANVAS MENULIS UTAMA (CONTENT EDITABLE) ── */}
        <div className="relative rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 p-6 sm:p-12 shadow-sm min-h-[600px] flex flex-col">
          {/* Header Naskah */}
          <div className="mb-6 text-center border-b border-gray-100 dark:border-white/5 pb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500">
              Bab {chapterNumber}
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
              {title || "Judul Bab Novel"}
            </h2>
          </div>

          {/* ContentEditable Writing Canvas */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onPaste={handlePaste}
            data-placeholder="Mulai ketik naskah bab novel Anda di sini... Tekan Enter untuk paragraf baru. Anda juga dapat menempelkan (paste) naskah dari Microsoft Word atau Google Docs."
            className="flex-1 w-full outline-hidden text-base sm:text-lg leading-[1.85] font-serif text-gray-800 dark:text-slate-100 selection:bg-blue-500 selection:text-white empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 dark:empty:before:text-slate-600 empty:before:pointer-events-none space-y-4"
          />
        </div>

        {/* Catatan Penulis (Opsional) */}
        {!isFocusMode && (
          <div className="rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 p-5 shadow-sm">
            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 block mb-1.5">
              Catatan Penulis di Akhir Bab (Opsional)
            </label>
            <textarea
              rows={3}
              maxLength={300}
              value={creatorNote}
              onChange={(e) => setCreatorNote(e.target.value)}
              placeholder="Sampaikan pesan hangat kepada pembaca setelah menyelesaikan bab ini..."
              className="w-full bg-gray-50 dark:bg-[#080D18] border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>
        )}
      </main>

      {/* ── FOOTER BARIS STATISTIK LIVE ── */}
      <footer className="sticky bottom-0 z-30 bg-white/95 dark:bg-[#0D1526]/95 backdrop-blur-md border-t border-gray-200 dark:border-white/10 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-slate-400">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <span className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
            <PenTool className="h-3.5 w-3.5 text-blue-500" />
            <span>{stats.words.toLocaleString()} Kata</span>
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-purple-500" />
            <span>{stats.chars.toLocaleString()} Karakter</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <Clock className="h-3.5 w-3.5" />
            <span>± {stats.readTime} Menit Baca</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === "saving" && <span className="text-blue-500">Menyimpan...</span>}
          {saveStatus === "saved" && (
            <span className="text-emerald-600 dark:text-emerald-400">Tersimpan</span>
          )}
          {saveStatus === "unsaved" && (
            <span className="text-amber-500">Belum disimpan</span>
          )}
        </div>
      </footer>

      {/* ── MODAL RIWAYAT VERSI (LOCAL VERSION HISTORY) ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#0D1526] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#101726]">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Riwayat Versi Naskah
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
              {versionList.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Belum ada riwayat versi naskah yang tercatat. Versi akan tersimpan otomatis saat Anda menulis.
                </div>
              ) : (
                versionList.map((ver, idx) => (
                  <div
                    key={ver.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-white/5 px-3 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {ver.dateStr}
                        </span>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                            Terbaru
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                        {ver.wordCount} kata • Judul: "{ver.title || "Tanpa Judul"}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(ver)}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-600 dark:text-blue-400 text-xs font-bold transition-all"
                    >
                      Pulihkan
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#101726] border-t border-gray-200 dark:border-white/10 flex justify-between items-center text-[11px] text-gray-500 dark:text-slate-400">
              <span>Menyimpan 15 snapshot versi terakhir di memori browser Anda.</span>
              {versionList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Hapus seluruh riwayat versi untuk bab ini?")) {
                      localStorage.removeItem(historyKey);
                      setVersionList([]);
                    }
                  }}
                  className="text-red-500 hover:underline"
                >
                  Hapus Riwayat
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PRATINJAU PEMBACA ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className={`bg-white dark:bg-[#070B14] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              previewDevice === "mobile"
                ? "w-full max-w-sm h-[700px]"
                : "w-full max-w-3xl h-[680px]"
            }`}
          >
            {/* Header Preview */}
            <div className="px-5 py-3 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#0D1526]">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Pratinjau Pembaca • Bab {chapterNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch Device */}
                <div className="flex items-center rounded-lg bg-gray-200 dark:bg-white/10 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewDevice === "desktop"
                        ? "bg-white dark:bg-[#101726] text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-gray-600 dark:text-slate-400"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewDevice === "mobile"
                        ? "bg-white dark:bg-[#101726] text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-gray-600 dark:text-slate-400"
                    }`}
                  >
                    HP
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Isi Bacaan Novel */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 leading-relaxed font-serif text-gray-800 dark:text-slate-200 text-sm sm:text-base space-y-4">
              <div className="text-center pb-6 border-b border-gray-200 dark:border-white/10 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                  Bab {chapterNumber}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {title || "Judul Bab"}
                </h2>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                  {stats.words} kata • {stats.readTime} menit baca
                </p>
              </div>

              {contentHtml ? (
                <div
                  className="novel-reader-content space-y-4"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <p className="text-center text-gray-400 italic py-12">
                  Naskah bab masih kosong.
                </p>
              )}

              {creatorNote && (
                <div className="mt-10 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 font-sans">
                  <p className="font-bold mb-1">Catatan Penulis:</p>
                  <p>{creatorNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
