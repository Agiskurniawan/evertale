import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
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
  Minus,
  RotateCcw,
  RotateCw,
  Check,
  AlertCircle,
  Loader2,
  X,
  Upload,
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
  const [showNoteField, setShowNoteField] = useState<boolean>(false);

  // Status format toolbar aktif (bold, italic, underline, alignment)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  });

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

        // Jangan simpan duplikat jika konten sama
        if (list.length > 0 && list[0].content === curContent) return;

        const newVersion: VersionItem = {
          id: String(Date.now()),
          timestamp: Date.now(),
          dateStr: `${now.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} ${dateStr}`,
          wordCount: words,
          title: curTitle,
          content: curContent,
        };

        // Simpan maksimal 15 snapshot
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
    setTimeout(() => setToastMsg(""), 3200);
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
      const nextNum = (serial.data.chapters?.length || 0) + 1;
      setChapterNumber(nextNum);
      isInitialLoad.current = false;
    }
  }, [chapter.data, serial.data, chapterId]);

  // Hitung jumlah kata dan karakter live
  const stats = useMemo(() => {
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
        window.history.replaceState(null, "", `/author/novel-editor?serial=${serialId}&chapter=${resultId}`);
      }

      setSaveStatus("saved");
      const timeStr = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSavedTime(timeStr);
      setIsPublished(publish);

      saveVersionSnapshot(title.trim(), contentHtml, stats.words);

      if (!isAutosave) {
        showToast(publish ? "Bab berhasil diterbitkan" : "Draf bab berhasil disimpan");
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

  // Deteksi status tombol toolbar yang sedang aktif
  const updateActiveFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
      });
    } catch {
      // Abaikan jika queryCommandState tidak didukung pada konteks tertentu
    }
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
        updateActiveFormats();
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateActiveFormats]);

  // Rich-Text Toolbar Actions tanpa kehilangan fokus / selection
  const executeCommand = (cmd: string, val: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, val);
    handleEditorInput();
    updateActiveFormats();
  };

  // Sisipkan Pemisah Adegan (Scene Break ***)
  const insertSceneBreak = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const dividerHtml = `<p class="scene-break" style="text-align: center; margin: 2.25rem 0; font-weight: 600; letter-spacing: 0.3em; color: #a1a1aa; user-select: none;">***</p><p><br></p>`;
    document.execCommand("insertHTML", false, dividerHtml);
    handleEditorInput();
    updateActiveFormats();
  };

  // Pembersihan Paste dari Word / Docs agar paragraf & baris bersih
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");

    if (text) {
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
      showToast("Thumbnail bab berhasil diunggah");
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
      showToast("Versi naskah berhasil dipulihkan");
      setSaveStatus("unsaved");
    }
  };

  if (authLoading) return null;
  if (!isLoggedIn) return navigate("/login") as unknown as null;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        darkMode ? "dark bg-[#0B1220] text-[#E2E8F0]" : "bg-[#DFE3E8] text-[#1E293B]"
      }`}
    >
      {/* ── Toast Notifikasi Elegan ── */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-4 py-2.5 text-xs font-medium shadow-lg animate-fade-in">
          <Check className="h-3.5 w-3.5 text-blue-400 dark:text-blue-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── HEADER ATAS (Tipis, Bersih & Seimbang) ── */}
      {!isFocusMode && (
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 sm:px-8 bg-[#DFE3E8]/90 dark:bg-[#0B1220]/90 backdrop-blur-md border-b border-neutral-300/50 dark:border-white/[0.07]">
          {/* Sisi Kiri: Kembali & Info Novel */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              to={`/author/karya/${serialId || ""}`}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              title="Kembali ke Kelola Novel"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-2 min-w-0 text-xs">
              <span className="font-semibold text-neutral-600 dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
                {serial.data?.title || "Judul Novel"}
              </span>
              <span className="text-neutral-300 dark:text-white/20">/</span>
              <span className="text-neutral-800 dark:text-blue-400 font-semibold">
                Bab {chapterNumber}
              </span>
            </div>
          </div>

          {/* Sisi Tengah: Status Autosave Halus */}
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                <span>Menyimpan...</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Tersimpan {lastSavedTime ? `pukul ${lastSavedTime}` : ""}</span>
              </span>
            )}
            {saveStatus === "unsaved" && (
              <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Perubahan belum disimpan</span>
              </span>
            )}
          </div>

          {/* Sisi Kanan: Kontrol & Tombol Aksi */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Riwayat Versi */}
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors relative"
              title="Riwayat Versi Naskah"
            >
              <History className="h-4 w-4" />
              {versionList.length > 0 && (
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
              )}
            </button>

            {/* Mode Fokus */}
            <button
              type="button"
              onClick={() => setIsFocusMode(true)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors hidden sm:inline-flex"
              title="Mode Fokus (Layar Penuh)"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Mode Gelap/Terang */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block" />

            {/* Pratinjau */}
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
              <span className="hidden sm:inline">Pratinjau</span>
            </button>

            {/* Simpan Draft */}
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors"
            >
              Simpan Draft
            </button>

            {/* Terbitkan (Tombol Utama yang Menonjol) */}
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {isPublished ? "Perbarui" : "Terbitkan"}
            </button>
          </div>
        </header>
      )}

      {/* ── Tombol Kembali (Panah) di Pojok Kiri saat Mode Fokus (Kembali ke Mode Normal) ── */}
      {isFocusMode && (
        <button
          type="button"
          onClick={() => setIsFocusMode(false)}
          className="fixed top-4 left-5 z-50 h-9 w-9 rounded-xl flex items-center justify-center bg-[#DFE3E8]/95 dark:bg-[#101726]/95 backdrop-blur-md border border-neutral-300/60 dark:border-white/[0.08] shadow-sm text-neutral-700 dark:text-white hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all active:scale-95 animate-fade-in cursor-pointer"
          title="Keluar dari Mode Fokus (Kembali ke Tampilan Normal)"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Floating Exit Button saat Mode Fokus */}
      {isFocusMode && (
        <div className="fixed top-4 right-5 z-50 flex items-center gap-2 bg-[#DFE3E8]/95 dark:bg-[#101726]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-300/60 dark:border-white/[0.07] shadow-sm animate-fade-in">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium px-2 py-1"
          >
            Simpan Draft
          </button>
          <button
            type="button"
            onClick={() => setIsFocusMode(false)}
            className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Keluar dari Mode Fokus"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── TOOLBAR FORMAT (Ringkas, Menyatu di Atas Naskah) ── */}
      <div
        className={`sticky ${
          isFocusMode ? "top-4 mb-8" : "top-14"
        } z-20 w-full flex justify-center py-2 px-4 pointer-events-none transition-all`}
      >
        <div className="pointer-events-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#0D1526]/95 backdrop-blur-md border border-neutral-200/80 dark:border-white/[0.08] shadow-md max-w-full overflow-x-auto scrollbar-none">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("bold")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.bold
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-neutral-600 dark:text-slate-300 hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            }`}
            title="Tebal (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("italic")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.italic
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-neutral-600 dark:text-slate-300 hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            }`}
            title="Miring (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("underline")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.underline
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-neutral-600 dark:text-slate-300 hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            }`}
            title="Garis Bawah (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>

          <span className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("justifyLeft")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.justifyLeft
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-neutral-600 dark:text-slate-300 hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            }`}
            title="Rata Kiri"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("justifyCenter")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.justifyCenter
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-neutral-600 dark:text-slate-300 hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            }`}
            title="Rata Tengah"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("justifyRight")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.justifyRight
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-neutral-600 dark:text-slate-300 hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            }`}
            title="Rata Kanan"
          >
            <AlignRight className="h-4 w-4" />
          </button>

          <span className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

          {/* Pemisah Adegan (Format Seragam dengan Toolbar) */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertSceneBreak}
            className="p-1.5 rounded-lg text-neutral-600 dark:text-slate-300 hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors flex items-center gap-1 cursor-pointer"
            title="Sisipkan Pemisah Adegan (***)"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("undo")}
            className="p-1.5 rounded-lg text-neutral-600 dark:text-slate-300 hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Urungkan (Undo)"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("redo")}
            className="p-1.5 rounded-lg text-neutral-600 dark:text-slate-300 hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Ulangi (Redo)"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── AREA MENULIS UTAMA (Ruang Bersih, Tenang & Elegan) ── */}
      <main
        className={`flex-1 w-full max-w-[700px] mx-auto px-5 sm:px-0 flex flex-col transition-all ${
          isFocusMode ? "pt-12 sm:pt-16 pb-16" : "py-6 sm:py-10"
        }`}
      >
        {/* Pesan Kesalahan */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── BARIS METADATA BAB (Menyatu Alami dengan Halaman, Tanpa Card Tebal) ── */}
        {!isFocusMode && (
          <div className="mb-6 flex flex-col gap-3">
            {/* Baris Atas: Nomor Bab & Thumbnail Opsional */}
            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-white">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-wide uppercase text-xs text-neutral-700 dark:text-white">
                  Bab
                </span>
                <input
                  type="number"
                  min={1}
                  value={chapterNumber}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    setChapterNumber(val);
                    triggerAutosave(title, contentHtml);
                  }}
                  className="w-14 bg-transparent font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-300 dark:border-white/30 focus:border-blue-500 dark:focus:border-blue-400 outline-none px-1 py-0.5 text-center transition-colors"
                />
              </div>

              {/* Thumbnail Opsional Halus */}
              <div className="flex items-center gap-2">
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleThumbnailUpload}
                />
                {useCustomThumbnail && thumbnailUrl ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={assetUrl(thumbnailUrl)}
                      alt="Thumbnail Bab"
                      className="h-6 w-9 rounded object-cover border border-neutral-200 dark:border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailUrl("");
                        setUseCustomThumbnail(false);
                        setSaveStatus("unsaved");
                      }}
                      className="text-[11px] text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isUploadingThumb}
                    onClick={() => thumbInputRef.current?.click()}
                    className="text-[11px] text-neutral-500 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
                    title="Opsional: Cover utama novel dipakai jika dikosongkan"
                  >
                    {isUploadingThumb ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3" />
                    )}
                    <span>+ Thumbnail bab (opsional)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Input Judul Bab Besar & Elegan (Seperti Dokumen Asli) */}
            <input
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                triggerAutosave(e.target.value, contentHtml);
              }}
              placeholder="Judul Bab"
              className="w-full bg-transparent font-serif text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/35 outline-none border-b border-transparent focus:border-neutral-300 dark:focus:border-white/20 pb-2 transition-colors"
            />
          </div>
        )}

        {/* ── CANVAS MENULIS NASKAH (Pusat Perhatian, Bersih Tanpa Kotak Tebal) ── */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          onPaste={handlePaste}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          data-placeholder="Mulai menulis ceritamu di sini..."
          className="flex-1 w-full min-h-[520px] outline-none font-novel text-[18px] sm:text-[19px] leading-[1.85] text-neutral-900 dark:text-white selection:bg-blue-500/20 novel-canvas pb-16"
        />

        {/* ── CATATAN PENULIS (Minimalis & Rapi di Akhir Bab) ── */}
        {!isFocusMode && (
          <div className="mt-8 pt-6 border-t border-neutral-200/60 dark:border-neutral-800/60">
            {!showNoteField && !creatorNote ? (
              <button
                type="button"
                onClick={() => setShowNoteField(true)}
                className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                + Tambah catatan penulis untuk pembaca (opsional)
              </button>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Catatan Penulis di Akhir Bab (Opsional)
                  </span>
                  {!creatorNote && (
                    <button
                      type="button"
                      onClick={() => setShowNoteField(false)}
                      className="text-xs text-neutral-400 hover:text-neutral-600"
                    >
                      Batal
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  maxLength={300}
                  value={creatorNote}
                  onChange={(e) => setCreatorNote(e.target.value)}
                  placeholder="Tuliskan pesan singkat untuk pembaca di akhir bab ini..."
                  className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 outline-none focus:border-neutral-400 resize-none transition-colors"
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── BAR BAWAH (Statistik Tenang, Ukuran Terbaca & Warna Netral) ── */}
      <footer className="sticky bottom-0 z-30 h-10 bg-[#DFE3E8]/95 dark:bg-[#0B1220]/95 backdrop-blur-md border-t border-neutral-300/50 dark:border-white/[0.07] px-4 sm:px-8 flex items-center justify-between text-[13px] text-neutral-600 dark:text-slate-200 font-sans">
        <div className="flex items-center gap-4">
          <span>{stats.words.toLocaleString()} kata</span>
          <span className="opacity-40">•</span>
          <span>{stats.chars.toLocaleString()} karakter</span>
          <span className="hidden sm:inline opacity-40">•</span>
          <span className="hidden sm:inline">± {stats.readTime} menit baca</span>
        </div>

        <div className="text-xs">
          {saveStatus === "saving" && <span>Menyimpan...</span>}
          {saveStatus === "saved" && <span>Tersimpan</span>}
          {saveStatus === "unsaved" && <span>Belum disimpan</span>}
        </div>
      </footer>

      {/* ── MODAL RIWAYAT VERSI (Desain Bersih & Tenang) ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#101726] border border-neutral-200 dark:border-white/[0.07] rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[75vh]">
            <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Riwayat Versi Naskah
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {versionList.length === 0 ? (
                <div className="text-center py-10 text-neutral-400 text-xs">
                  Belum ada riwayat versi naskah. Snapshot disimpan otomatis saat Anda menulis.
                </div>
              ) : (
                versionList.map((ver, idx) => (
                  <div
                    key={ver.id}
                    className="py-2.5 px-3 flex items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-neutral-900 dark:text-white">
                          {ver.dateStr}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            Terbaru
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                        {ver.wordCount} kata
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(ver)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
                    >
                      Pulihkan
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-[11px] text-neutral-400">
              <span>Maksimal 15 snapshot tersimpan di browser.</span>
              {versionList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Hapus seluruh riwayat versi bab ini?")) {
                      localStorage.removeItem(historyKey);
                      setVersionList([]);
                    }
                  }}
                  className="text-red-500 hover:underline"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PRATINJAU PEMBACA ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`bg-[#DFE3E8] dark:bg-[#0B1220] border border-neutral-300/60 dark:border-white/[0.07] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              previewDevice === "mobile"
                ? "w-full max-w-sm h-[680px]"
                : "w-full max-w-2xl h-[650px]"
            }`}
          >
            {/* Header Preview */}
            <div className="px-5 py-3 border-b border-neutral-200/60 dark:border-white/[0.07] flex items-center justify-between bg-white/60 dark:bg-[#101726]">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Pratinjau Pembaca • Bab {chapterNumber}
              </span>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      previewDevice === "desktop"
                        ? "bg-white dark:bg-[#27272A] text-neutral-900 dark:text-white shadow-xs"
                        : "text-neutral-500"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      previewDevice === "mobile"
                        ? "bg-white dark:bg-[#27272A] text-neutral-900 dark:text-white shadow-xs"
                        : "text-neutral-500"
                    }`}
                  >
                    HP
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Konten Pratinjau Teks Lora / Serif */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 font-novel text-neutral-800 dark:text-neutral-200 text-[18px] leading-[1.85] space-y-4">
              <div className="text-center pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Bab {chapterNumber}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900 dark:text-white mt-1">
                  {title || "Judul Bab"}
                </h2>
                <p className="text-xs text-neutral-400 font-sans mt-2">
                  {stats.words} kata • ± {stats.readTime} menit baca
                </p>
              </div>

              {contentHtml ? (
                <div
                  className="space-y-4"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <p className="text-center text-neutral-400 italic py-10 font-sans text-sm">
                  Naskah bab masih kosong.
                </p>
              )}

              {creatorNote && (
                <div className="mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs font-sans text-neutral-500">
                  <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Catatan Penulis:
                  </p>
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
