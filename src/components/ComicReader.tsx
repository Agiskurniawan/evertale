import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ListOrdered,
  Loader2,
  Check,
} from "lucide-react";
import { api, assetUrl, errorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface ChapterDetail {
  id: number;
  number: number;
  label: string;
  title: string;
  content: string | null;
  pages: string[];
  likes: string;
  liked: boolean;
  prev_id: number | null;
  next_id: number | null;
  book: {
    id: number;
    title: string;
    type: "novel" | "komik";
    cover: string | null;
  };
}

interface ComicReaderProps {
  chapterId: number;
  bookId: string | number;
  bookTitle: string;
  bookType?: "novel" | "komik";
  episodes: Array<{
    id: number;
    title: string;
    num: string;
    number?: number;
  }>;
  onClose: () => void;
  onSelectChapter: (id: number) => void;
}

export default function ComicReader({
  chapterId,
  bookTitle,
  bookType = "komik",
  episodes,
  onClose,
  onSelectChapter,
}: ComicReaderProps) {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Status like lokal
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<string>("0");
  const [likeLoading, setLikeLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Muat data bab saat chapterId berubah
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    // Scroll ke bagian paling atas saat membuka bab baru
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    api
      .get<{ data: ChapterDetail }>(`/chapters/${chapterId}`)
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data);
          setIsLiked(Boolean(res.data.data.liked));
          setLikeCount(res.data.data.likes);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(errorMessage(err, "Gagal memuat episode."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  // Tutup menu dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Handle Like / Suka bab
  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      showToast("Silakan masuk terlebih dahulu untuk menyukai episode.");
      return;
    }
    if (likeLoading) return;

    try {
      setLikeLoading(true);
      if (isLiked) {
        const res = await api.delete<{ data: { liked: boolean; likes: string } }>(
          `/chapters/${chapterId}/like`
        );
        setIsLiked(false);
        setLikeCount(res.data.data.likes);
        showToast("Batal menyukai episode.");
      } else {
        const res = await api.post<{ data: { liked: boolean; likes: string } }>(
          `/chapters/${chapterId}/like`
        );
        setIsLiked(true);
        setLikeCount(res.data.data.likes);
        showToast("Episode disukai! ❤️");
      }
    } catch (err) {
      showToast(errorMessage(err, "Gagal menyukai episode"));
    } finally {
      setLikeLoading(false);
    }
  };

  // Bagikan tautan bab
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Tautan episode berhasil disalin ke papan klip!");
    } else {
      showToast("Tautan: " + window.location.href);
    }
  };

  const isComic = (data?.book?.type ?? bookType) === "komik";

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col relative z-50">
      {/* ── Toast Notifikasi ── */}
      {toastMsg && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-2xl animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Top Bar Minimalis dengan Tombol Kembali Utama ── */}
      <header className="sticky top-0 z-40 w-full bg-[#080D18]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all flex-shrink-0 active:scale-95 border border-white/10 cursor-pointer"
            title="Kembali ke Halaman Serial"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs font-bold">Kembali</span>
          </button>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
              {bookTitle}
            </h1>
            <p className="text-[11px] text-blue-400 font-medium truncate">
              {data ? `${data.label} · ${data.title}` : "Memuat episode..."}
            </p>
          </div>
        </div>

        {/* Tombol Aksi Kanan */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Menu Dropdown Pilih Episode */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Daftar Episode"
            >
              <ListOrdered className="h-4 w-4" />
              <span className="hidden sm:inline">Episode</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 max-h-80 overflow-y-auto rounded-2xl bg-[#0F172A] border border-white/10 shadow-2xl p-2 z-50">
                <p className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wider border-b border-white/10 mb-1">
                  Pilih Episode ({episodes.length})
                </p>
                <div className="space-y-1">
                  {episodes.map((ep) => {
                    const isCurrent = ep.id === chapterId;
                    return (
                      <button
                        key={ep.id}
                        type="button"
                        onClick={() => {
                          onSelectChapter(ep.id);
                          setMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                          isCurrent
                            ? "bg-blue-600 text-white font-bold"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="truncate pr-2">{ep.title}</span>
                        <span className="text-[10px] font-mono opacity-70">{ep.num}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tombol Bagikan */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Bagikan Episode Ini"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── Main Content Area (Webtoon Comic Strip / Novel Text) ── */}
      <main className="flex-1 w-full flex flex-col items-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-36 gap-3 text-slate-400 text-sm">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p>Memuat episode, mohon tunggu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-36 gap-4 text-center px-4">
            <p className="text-rose-400 text-sm font-semibold">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Kembali ke Serial
            </button>
          </div>
        ) : data ? (
          <div className="w-full flex flex-col items-center">
            {/* Header info bab */}
            <div className="w-full max-w-2xl text-center py-6 px-4">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                {data.label}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {data.title}
              </h2>
            </div>

            {/* ─── TAMPILAN KHUSUS KOMIK: Vertical Webtoon Strip ─── */}
            {isComic ? (
              <div className="w-full max-w-2xl md:max-w-3xl flex flex-col items-center bg-[#070B14] shadow-2xl">
                {data.pages && data.pages.length > 0 ? (
                  /* Jika kreator sudah mengunggah halaman gambar */
                  data.pages.map((pageUrl, idx) => (
                    <img
                      key={idx}
                      src={assetUrl(pageUrl)}
                      alt={`Halaman ${idx + 1}`}
                      className="w-full h-auto block select-none border-0"
                      loading="lazy"
                    />
                  ))
                ) : (
                  <div className="w-full py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <p className="text-sm font-medium">Belum ada halaman gambar komik yang diunggah untuk episode ini.</p>
                  </div>
                )}
              </div>
            ) : (
              /* ─── TAMPILAN KHUSUS NOVEL: Text Reader Mode ─── */
              <div className="w-full max-w-3xl px-6 sm:px-10 py-10 leading-relaxed font-serif text-slate-200 text-base sm:text-lg selection:bg-blue-600 selection:text-white">
                {data.content ? (
                  /<[a-z][\s\S]*>/i.test(data.content) ? (
                    <div
                      className="novel-content space-y-4 leading-[1.9]"
                      dangerouslySetInnerHTML={{ __html: data.content }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap leading-[1.9]">{data.content}</div>
                  )
                ) : (
                  <p className="text-center text-slate-500 py-12 italic">
                    Belum ada naskah teks yang dimasukkan untuk bab ini.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* ── Akhir Episode: Navigasi Sebelumnya & Selanjutnya ── */}
      {data && !loading && (
        <div className="w-full max-w-xl mx-auto py-12 px-4 flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-3 w-full flex-wrap">
            {/* Tombol Episode Sebelumnya (Disabled jika tidak ada episode sebelumnya) */}
            <button
              type="button"
              disabled={!data.prev_id}
              onClick={() => data.prev_id && onSelectChapter(data.prev_id)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-20 disabled:cursor-not-allowed disabled:pointer-events-none text-xs sm:text-sm font-semibold text-slate-200 transition-all active:scale-95 cursor-pointer"
              title={data.prev_id ? "Episode Sebelumnya" : "Tidak ada episode sebelumnya"}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Tombol Suka / Like dengan hitungan */}
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-lg cursor-pointer ${
                isLiked
                  ? "bg-rose-600 text-white shadow-rose-600/30"
                  : "bg-white/10 hover:bg-white/15 text-slate-200"
              }`}
              title="Sukai Episode Ini"
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? "fill-white text-white" : "text-rose-400"}`}
              />
              <span>{likeCount}</span>
            </button>

            {/* Tombol Episode Selanjutnya (Disabled jika episode berakhir / episode terakhir) */}
            <button
              type="button"
              disabled={!data.next_id}
              onClick={() => data.next_id && onSelectChapter(data.next_id)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed disabled:pointer-events-none text-xs sm:text-sm font-semibold text-white transition-all active:scale-95 shadow-md shadow-blue-600/20 cursor-pointer"
              title={data.next_id ? "Episode Selanjutnya" : "Episode terakhir (tidak ada episode berikutnya)"}
            >
              <span>Selanjutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
