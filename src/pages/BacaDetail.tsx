import { useState, useRef } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Star,
  MessageSquare,
  Eye,
  Users,
  X,
  Send,
  Trash2,
  User as UserIcon,
  Loader2,
  Heart,
  BookOpen,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Play,
} from "lucide-react";
import DataState from "../components/DataState";
import ComicReader from "../components/ComicReader";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { api, assetUrl, errorMessage } from "../lib/api";
import type { BookDetail, Episode } from "../types";

export interface CommentItem {
  id: number;
  content: string;
  parent_id: number | null;
  chapter_id: number | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

interface CommentsResponse {
  data: CommentItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

// key={id} → saat pindah dari satu karya ke karya lain, state di-reset otomatis
export default function BacaDetail() {
  const { id } = useParams();
  return <BacaDetailContent key={id} id={id ?? ""} />;
}

function BacaDetailContent({ id }: { id: string }) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const epParam = searchParams.get("ep") || searchParams.get("read");
  const activeEpisodeId = epParam ? Number(epParam) : null;

  const handleOpenEpisode = (chapterId: number) => {
    setSearchParams({ ep: String(chapterId) });
  };

  const handleCloseReader = () => {
    setSearchParams({});
  };

  const book = useFetch(
    () => api.get<{ data: BookDetail }>(`/books/${id}`).then((r) => r.data.data),
    [id, isLoggedIn]
  );
  const eps = useFetch(
    () => api.get<{ data: Episode[] }>(`/books/${id}/chapters`).then((r) => r.data.data),
    [id, isLoggedIn]
  );
  const commentsFetch = useFetch(
    () => api.get<CommentsResponse>(`/books/${id}/comments`).then((r) => r.data),
    [id]
  );

  // Cek apakah kreator karya ini sudah ada di Favorit Kreator
  const favAuthorsFetch = useFetch(
    () => api.get<{ data: { id: number }[] }>("/favorites/authors").then((r) => r.data.data),
    [isLoggedIn],
    isLoggedIn
  );

  const [activeTab, setActiveTab] = useState<"episode" | "komentar">("episode");
  const [favOverride, setFavOverride] = useState<boolean | null>(null);
  const [rateOpen, setRateOpen] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  // Komentar utama
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const commentsSectionRef = useRef<HTMLDivElement>(null);

  // Balas komentar
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReplyId, setSubmittingReplyId] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});

  // Status ikuti kreator
  const [authorFollowed, setAuthorFollowed] = useState<boolean | null>(null);

  if (book.notFound) return <Navigate to="/404" replace />;
  if (book.loading || book.error || !book.data) {
    return (
      <div className="min-h-screen bg-[#DFE3E8] dark:bg-[#0B1220] py-16">
        <DataState loading={book.loading} error={book.error} />
      </div>
    );
  }

  const detail = book.data;
  const isFav = favOverride ?? detail.is_favorite;
  const currentRating = myRating ?? detail.my_rating;

  const isAuthorFollowed =
    authorFollowed !== null
      ? authorFollowed
      : Boolean(favAuthorsFetch.data?.some((a) => a.id === detail.author?.id));

  const toggleFavorite = async () => {
    if (!isLoggedIn) return navigate("/login");
    try {
      if (isFav) await api.delete(`/favorites/books/${detail.id}`);
      else await api.post(`/favorites/books/${detail.id}`);
      setFavOverride(!isFav);
      setNotice(isFav ? "Dihapus dari favorit" : "Ditambahkan ke favorit");
    } catch (e) {
      setNotice(errorMessage(e));
    }
  };

  const toggleFollowAuthor = async () => {
    if (!isLoggedIn) return navigate("/login");
    if (!detail.author?.id) return;
    try {
      if (isAuthorFollowed) {
        await api.delete(`/favorites/authors/${detail.author.id}`);
        setAuthorFollowed(false);
        setNotice(`Berhenti mengikuti ${detail.author.name}`);
      } else {
        await api.post(`/favorites/authors/${detail.author.id}`);
        setAuthorFollowed(true);
        setNotice(`${detail.author.name} ditambahkan ke Favorit Kreator!`);
      }
    } catch (err) {
      setNotice(errorMessage(err));
    }
  };

  const openRate = () => {
    if (!isLoggedIn) return navigate("/login");
    setRateOpen(true);
  };

  const sendRating = async (score: number) => {
    try {
      await api.put(`/books/${detail.id}/rating`, { score });
      setMyRating(score);
      setNotice(`Rating ${score} tersimpan`);
    } catch (e) {
      setNotice(errorMessage(e));
    }
    setRateOpen(false);
  };

  const copyShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setNotice("Tautan berhasil disalin ke papan klip!");
    } else {
      setNotice("Tautan: " + window.location.href);
    }
  };

  const handleKomenClick = () => {
    setActiveTab("komentar");
    setTimeout(() => {
      commentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      commentInputRef.current?.focus();
    }, 80);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return navigate("/login");
    const content = newComment.trim();
    if (!content) return;

    setIsSubmittingComment(true);
    try {
      await api.post(`/books/${detail.id}/comments`, { content });
      setNewComment("");
      setNotice("Komentar berhasil dipublikasikan!");
      commentsFetch.reload();
    } catch (err) {
      setNotice(errorMessage(err));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePostReply = async (parentId: number) => {
    if (!isLoggedIn) return navigate("/login");
    const content = replyText.trim();
    if (!content) return;

    setSubmittingReplyId(parentId);
    try {
      await api.post(`/books/${detail.id}/comments`, { content, parent_id: parentId });
      setReplyText("");
      setReplyingTo(null);
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
      setNotice("Balasan berhasil dipublikasikan!");
      commentsFetch.reload();
    } catch (err) {
      setNotice(errorMessage(err));
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setNotice("Komentar berhasil dihapus");
      commentsFetch.reload();
    } catch (err) {
      setNotice(errorMessage(err));
    }
  };

  const bookInfo = {
    title: detail.title,
    author: detail.author?.name ?? "—",
    views: detail.views,
    readers: detail.readers,
    updateDay: detail.update_day ?? "—",
    synopsis: detail.synopsis ?? "Belum ada sinopsis untuk karya ini.",
    cover: assetUrl(detail.cover),
    bgImage: assetUrl(detail.cover),
  };

  const episodes = (eps.data ?? []).map((e) => ({
    id: e.id,
    title: e.title === e.label ? e.label : `${e.label} · ${e.title}`,
    date: e.date,
    likes: e.likes,
    num: e.num,
    img: assetUrl(e.img ?? detail.cover),
  }));

  const allComments = commentsFetch.data?.data ?? [];
  const rootComments = allComments.filter((c) => !c.parent_id);
  const repliesMap = allComments.reduce<Record<number, CommentItem[]>>((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});
  const commentsTotal = commentsFetch.data?.meta?.total ?? allComments.length;

  // Jika sedang membaca salah satu episode, buka tampilan Comic / Novel Reader
  if (activeEpisodeId) {
    return (
      <ComicReader
        chapterId={activeEpisodeId}
        bookId={detail.id}
        bookTitle={detail.title}
        bookType={detail.type}
        episodes={episodes.map((e) => ({
          id: e.id,
          title: e.title,
          num: e.num,
        }))}
        onClose={handleCloseReader}
        onSelectChapter={handleOpenEpisode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#DFE3E8] dark:bg-[#0B1220] flex flex-col md:bg-[#D5DBE2] dark:md:bg-[#080D18] transition-colors duration-300">
      {/* HEADER SECTION */}
      <div className="relative w-full h-[380px] md:h-[460px]">
        {/* Background Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bookInfo.bgImage})` }}
        >
          <div className="absolute inset-0 bg-gray-900/85 dark:bg-[#0B1220]/85 backdrop-blur-md" />
        </div>

        {/* Mobile Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10 md:hidden">
          <Link to="/" className="p-2 transition-colors hover:text-blue-400">
            <ArrowLeft size={28} />
          </Link>
          <button
            type="button"
            onClick={copyShareLink}
            className="p-2 transition-colors hover:text-blue-400"
            title="Bagikan"
          >
            <Share2 size={24} />
          </button>
        </div>

        {/* Header Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
          <div className="relative mt-8 md:mt-0 w-[170px] h-[240px] md:w-[210px] md:h-[290px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img src={bookInfo.cover} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute top-2.5 left-2.5 z-10">
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-white shadow-md ${
                  detail.type === "komik"
                    ? "bg-[#FF4D6D] shadow-rose-500/30"
                    : "bg-blue-600 shadow-blue-600/30"
                }`}
              >
                {detail.type === "komik" ? "KOMIK" : "NOVEL"}
              </span>
            </div>
          </div>
          <h1 className="text-white text-xl md:text-3xl font-extrabold mt-5 text-center px-4 max-w-4xl line-clamp-2 md:line-clamp-none">
            {bookInfo.title}
          </h1>
          {detail.author ? (
            <Link
              to={`/kreator/${detail.author.id}`}
              className="text-slate-200 hover:text-blue-300 dark:text-slate-300 dark:hover:text-white text-sm mt-2 hidden md:inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>Karya:</span>
              <span className="font-bold underline decoration-blue-400 underline-offset-4 group-hover:text-blue-400">
                {bookInfo.author}
              </span>
            </Link>
          ) : (
            <p className="text-slate-300 dark:text-slate-400 text-sm mt-2 hidden md:block">
              Karya: <span className="font-semibold text-white">{bookInfo.author}</span>
            </p>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full max-w-6xl mx-auto md:px-4 -mt-4 md:-mt-10 relative z-20 pb-16">
        <div className="bg-[#ECEFF2] dark:bg-[#111A2C] border border-gray-300 dark:border-white/5 md:rounded-3xl rounded-t-3xl shadow-xl flex flex-col md:flex-row overflow-hidden min-h-[500px]">
          
          {/* MOBILE ACTION BUTTONS */}
          <div className="md:hidden flex justify-around items-center p-5 border-b border-gray-300 dark:border-white/5 bg-[#E2E6EA] dark:bg-transparent">
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={toggleFavorite}
                className="w-11 h-11 bg-[#D6DCE2] dark:bg-white/5 text-blue-600 dark:text-blue-400 rounded-full flex justify-center items-center hover:bg-blue-500/20 transition-colors shadow-sm"
              >
                <Bookmark size={20} className={isFav ? "fill-blue-600 dark:fill-blue-400" : ""} />
              </button>
              <span className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Favorit</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={openRate}
                className="w-11 h-11 bg-[#D6DCE2] dark:bg-white/5 text-blue-600 dark:text-blue-400 rounded-full flex justify-center items-center hover:bg-blue-500/20 transition-colors shadow-sm"
              >
                <Star size={20} className={currentRating ? "fill-amber-400 text-amber-400" : ""} />
              </button>
              <span className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Rate</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={handleKomenClick}
                className={`w-11 h-11 rounded-full flex justify-center items-center transition-colors shadow-sm ${
                  activeTab === "komentar"
                    ? "bg-blue-600 text-white shadow-blue-500/20"
                    : "bg-[#D6DCE2] dark:bg-white/5 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                }`}
              >
                <MessageSquare size={20} />
              </button>
              <span className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Komen</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={copyShareLink}
                className="w-11 h-11 bg-[#D6DCE2] dark:bg-white/5 text-blue-600 dark:text-blue-400 rounded-full flex justify-center items-center hover:bg-blue-500/20 transition-colors shadow-sm"
              >
                <Share2 size={20} />
              </button>
              <span className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Share</span>
            </div>
          </div>

          {/* MOBILE SINOPSIS & KREATOR */}
          <div className="md:hidden p-5 border-b border-gray-300 dark:border-white/5">
            {/* Mobile Tombol Mulai Membaca */}
            {episodes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const firstEp = episodes[episodes.length - 1] ?? episodes[0];
                  if (firstEp) handleOpenEpisode(firstEp.id);
                }}
                className="w-full mb-4 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 fill-white text-white" />
                <span>Mulai Membaca Episode 1</span>
              </button>
            )}

            {/* Profil Kreator (Mobile) */}
            {detail.author && (
              <div className="mb-4 p-4 rounded-2xl bg-[#E2E6EA] dark:bg-[#0B1220]/50 border border-gray-300 dark:border-white/10 flex items-center justify-between">
                <Link
                  to={`/kreator/${detail.author.id}`}
                  className="flex items-center gap-3 min-w-0 group"
                >
                  <div className="h-11 w-11 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden border border-blue-500/30 flex-shrink-0">
                    {detail.author.avatar ? (
                      <img src={assetUrl(detail.author.avatar)} alt={detail.author.name} className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-slate-400">Penulis Cerita</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600">
                      {detail.author.name}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFollowAuthor}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                      isAuthorFollowed
                        ? "bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40"
                        : "bg-[#ECEFF2] text-gray-700 border-gray-300 dark:bg-white/5 dark:text-slate-300 dark:border-white/10"
                    }`}
                    title={isAuthorFollowed ? "Favorit Kreator (Aktif)" : "Favoritkan Kreator"}
                  >
                    <Heart size={16} className={isAuthorFollowed ? "fill-rose-500 text-rose-500" : ""} />
                  </button>

                  <Link
                    to={`/kreator/${detail.author.id}`}
                    className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 text-xs font-semibold flex items-center gap-1 shadow-sm"
                    title="Lihat Profil & Karya"
                  >
                    <BookOpen size={16} />
                  </Link>
                </div>
              </div>
            )}

            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Sinopsis</h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">
              {bookInfo.synopsis}
            </p>

            {/* Desktop Tombol Mulai Membaca */}
            {episodes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const firstEp = episodes[episodes.length - 1] ?? episodes[0];
                  if (firstEp) handleOpenEpisode(firstEp.id);
                }}
                className="w-full mt-6 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white text-white group-hover:scale-110 transition-transform" />
                <span>Mulai Membaca Episode 1</span>
              </button>
            )}
          </div>

          {/* MAIN TABS & CONTENT COLUMN */}
          <div ref={commentsSectionRef} className="flex-1 p-5 md:p-8">
            
            {/* TAB SELECTOR: EPISODE VS KOMENTAR */}
            <div className="flex items-center gap-6 border-b border-gray-300 dark:border-white/10 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("episode")}
                className={`pb-3 text-base md:text-lg font-bold transition-all flex items-center gap-2 relative ${
                  activeTab === "episode"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <span>Episode</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  activeTab === "episode"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                    : "bg-[#D6DCE2] text-gray-700 dark:bg-white/10 dark:text-slate-400"
                }`}>
                  {episodes.length}
                </span>
                {activeTab === "episode" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("komentar")}
                className={`pb-3 text-base md:text-lg font-bold transition-all flex items-center gap-2 relative ${
                  activeTab === "komentar"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Komentar</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  activeTab === "komentar"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                    : "bg-[#D6DCE2] text-gray-700 dark:bg-white/10 dark:text-slate-400"
                }`}>
                  {commentsTotal}
                </span>
                {activeTab === "komentar" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            </div>

            {/* TAB 1: EPISODE LIST */}
            {activeTab === "episode" && (
              <div>
                <DataState
                  loading={eps.loading}
                  error={eps.error}
                  empty={!eps.loading && !eps.error && episodes.length === 0}
                  emptyText="Belum ada episode yang terbit."
                />
                <div className="flex flex-col gap-3">
                  {episodes.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => handleOpenEpisode(ep.id)}
                      className="group flex items-center p-3 bg-[#E2E6EA]/50 hover:bg-[#D6DCE2] dark:bg-white/[0.02] dark:hover:bg-white/10 rounded-2xl cursor-pointer border border-gray-300/80 hover:border-blue-400/50 dark:border-white/5 dark:hover:border-blue-500/30 transition-all active:scale-[0.99]"
                    >
                      <img
                        src={ep.img}
                        alt={ep.title}
                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="ml-4 flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {ep.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 md:hidden">
                          {ep.date}
                        </p>
                      </div>

                      {/* Desktop Middle Info */}
                      <div className="hidden md:flex flex-1 items-center justify-between px-8">
                        <span className="text-sm text-gray-500 dark:text-slate-400">{ep.date}</span>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                          <Star size={16} className="text-amber-400 fill-amber-400/20" />
                          <span className="text-sm text-gray-900 dark:text-white">{ep.likes}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-slate-300">
                          {ep.num}
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <BookOpen size={14} />
                          <span>Baca</span>
                        </div>
                      </div>

                      {/* Mobile Right Info */}
                      <div className="md:hidden flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1 border border-gray-300 dark:border-white/10 rounded-full px-2 py-1 bg-[#ECEFF2] dark:bg-[#0B1220]">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            {ep.likes}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          Baca &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: KOMENTAR & BALASAN SECTION */}
            {activeTab === "komentar" && (
              <div className="space-y-6">
                {/* Form Kirim Komentar Utama */}
                {isLoggedIn ? (
                  <form onSubmit={handlePostComment} className="flex flex-col gap-3">
                    <div className="flex gap-3 items-start">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden border border-blue-500/20">
                        {user?.avatar_url ? (
                          <img
                            src={assetUrl(user.avatar_url)}
                            alt={user.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <textarea
                          ref={commentInputRef}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          maxLength={500}
                          placeholder="Tulis pendapat atau tanggapanmu mengenai karya ini..."
                          rows={3}
                          className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-300 dark:border-white/10 bg-[#E2E6EA] dark:bg-[#0D1526] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none placeholder:text-gray-400 dark:placeholder:text-slate-500 font-medium"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            {newComment.length}/500 karakter
                          </span>
                          <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmittingComment}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                          >
                            {isSubmittingComment ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Mengirim...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                <span>Kirim Komentar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#E2E6EA] dark:bg-white/5 border border-gray-300 dark:border-white/10 text-center">
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                      Ingin membagikan pendapat atau membalas komentar pembaca lain?
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-md shadow-blue-500/20"
                    >
                      Masuk untuk Berkomentar
                    </Link>
                  </div>
                )}

                {/* Komentar & Balasan Thread List */}
                <div className="pt-4 border-t border-gray-300 dark:border-white/5">
                  <DataState
                    loading={commentsFetch.loading}
                    error={commentsFetch.error}
                    empty={!commentsFetch.loading && !commentsFetch.error && rootComments.length === 0}
                    emptyText="Belum ada komentar. Jadilah pembaca pertama yang meninggalkan jejak!"
                  />

                  <div className="flex flex-col gap-4">
                    {rootComments.map((comment) => {
                      const isOwner = user?.id === comment.user.id;
                      const replies = repliesMap[comment.id] ?? [];
                      const isReplyingThis = replyingTo?.id === comment.id;
                      const hasReplies = replies.length > 0;
                      const isExpanded = expandedReplies[comment.id] ?? false;

                      return (
                        <div
                          key={comment.id}
                          className="p-4 rounded-2xl border border-gray-300/90 dark:border-white/5 bg-[#E2E6EA]/70 dark:bg-white/[0.02] flex flex-col gap-3 transition-colors hover:border-gray-400 dark:hover:border-white/10"
                        >
                          {/* Baris Utama Komentar */}
                          <div className="flex gap-3.5 items-start">
                            {/* Avatar */}
                            <div className="h-9 w-9 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden border border-blue-500/20">
                              {comment.user.avatar ? (
                                <img
                                  src={assetUrl(comment.user.avatar)}
                                  alt={comment.user.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <UserIcon className="h-4 w-4 text-blue-500" />
                              )}
                            </div>

                            {/* Info & Isi */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                                    {comment.user.name}
                                  </span>
                                  {isOwner && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                      Anda
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 dark:text-slate-500">
                                    {formatRelativeTime(comment.created_at)}
                                  </span>
                                  {isOwner && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      title="Hapus komentar"
                                      className="text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-1"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-800 dark:text-slate-300 leading-relaxed whitespace-pre-line break-words font-medium">
                                {comment.content}
                              </p>

                              {/* Aksi: Balas & Toggle Balasan */}
                              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-300/60 dark:border-white/5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!isLoggedIn) return navigate("/login");
                                    if (isReplyingThis) {
                                      setReplyingTo(null);
                                    } else {
                                      setReplyingTo({ id: comment.id, name: comment.user.name });
                                      setReplyText("");
                                    }
                                  }}
                                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                                >
                                  <CornerDownRight className="h-3.5 w-3.5" />
                                  <span>{isReplyingThis ? "Batal Balas" : "Balas"}</span>
                                </button>

                                {hasReplies && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedReplies((prev) => ({
                                        ...prev,
                                        [comment.id]: !isExpanded,
                                      }))
                                    }
                                    className="text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="h-3.5 w-3.5" />
                                        <span>Sembunyikan ({replies.length})</span>
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-3.5 w-3.5" />
                                        <span>Lihat {replies.length} balasan</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Formulir Balas Inline */}
                          {isReplyingThis && (
                            <div className="ml-12 mt-1 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1.5 flex items-center gap-1">
                                <span>Membalas komentar</span>
                                <span className="font-bold">@{replyingTo?.name}</span>
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`Tulis balasan untuk @${replyingTo?.name}...`}
                                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-300 dark:border-white/10 bg-[#ECEFF2] dark:bg-[#0D1526] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handlePostReply(comment.id);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handlePostReply(comment.id)}
                                  disabled={!replyText.trim() || submittingReplyId === comment.id}
                                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
                                >
                                  {submittingReplyId === comment.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Send className="h-3 w-3" />
                                  )}
                                  <span>Kirim</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Daftar Balasan (Nested Replies) */}
                          {hasReplies && isExpanded && (
                            <div className="ml-8 md:ml-12 pl-4 border-l-2 border-blue-500/30 flex flex-col gap-3 pt-2">
                              {replies.map((reply) => {
                                const isReplyOwner = user?.id === reply.user.id;
                                return (
                                  <div
                                    key={reply.id}
                                    className="p-3 rounded-2xl bg-[#D6DCE2]/60 dark:bg-white/[0.03] border border-gray-300 dark:border-white/5 flex gap-3"
                                  >
                                    <div className="h-7 w-7 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden border border-blue-500/20">
                                      {reply.user.avatar ? (
                                        <img
                                          src={assetUrl(reply.user.avatar)}
                                          alt={reply.user.name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <UserIcon className="h-3.5 w-3.5 text-blue-500" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-xs text-gray-900 dark:text-white">
                                            {reply.user.name}
                                          </span>
                                          {isReplyOwner && (
                                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                              Anda
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] text-gray-500 dark:text-slate-500">
                                            {formatRelativeTime(reply.created_at)}
                                          </span>
                                          {isReplyOwner && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteComment(reply.id)}
                                              title="Hapus balasan"
                                              className="text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-800 dark:text-slate-300 leading-relaxed whitespace-pre-line break-words font-medium">
                                        {reply.content}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DESKTOP INFO SIDEBAR */}
          <div className="hidden md:flex flex-col w-[350px] p-8 border-l border-gray-300 dark:border-white/5 bg-[#E2E6EA] dark:bg-[#0B1220]/30">
            {/* Kartu Profil Kreator / Penulis */}
            {detail.author && (
              <div className="mb-6 p-4 rounded-3xl bg-[#ECEFF2] dark:bg-[#0E1626] border border-gray-300 dark:border-white/10 shadow-sm">
                <Link
                  to={`/kreator/${detail.author.id}`}
                  className="flex items-center gap-3 mb-3 group"
                >
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden border border-blue-500/30 flex-shrink-0 group-hover:border-blue-500 transition-colors">
                    {detail.author.avatar ? (
                      <img src={assetUrl(detail.author.avatar)} alt={detail.author.name} className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Penulis Cerita
                    </span>
                    <h4 className="text-base font-extrabold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                      {detail.author.name}
                    </h4>
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-300 dark:border-white/5">
                  <button
                    type="button"
                    onClick={toggleFollowAuthor}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl text-xs font-bold transition-all ${
                      isAuthorFollowed
                        ? "bg-rose-50 text-rose-600 border border-rose-300 hover:bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30"
                        : "bg-[#DFE3E8] text-gray-700 border border-gray-300 hover:bg-gray-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10"
                    }`}
                  >
                    <Heart size={14} className={isAuthorFollowed ? "fill-rose-500 text-rose-500" : ""} />
                    <span>{isAuthorFollowed ? "Mengikuti" : "Favoritkan"}</span>
                  </button>

                  <Link
                    to={`/kreator/${detail.author.id}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/20 transition-all shadow-sm"
                  >
                    <BookOpen size={14} />
                    <span>Lihat Karya</span>
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Eye size={20} />
                <span className="font-bold text-gray-900 dark:text-white">{bookInfo.views}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Users size={20} />
                <span className="font-bold text-gray-900 dark:text-white">{bookInfo.readers}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                UP
              </span>
              <span className="font-bold text-gray-800 dark:text-slate-300 text-sm">
                Update {bookInfo.updateDay}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
              {bookInfo.synopsis}
            </p>

            <p className="text-xs text-gray-600 dark:text-slate-400 mb-6 italic bg-[#D6DCE2] dark:bg-white/5 p-3.5 rounded-2xl border border-gray-300 dark:border-white/5 leading-relaxed">
              Serial ini diberi rating Remaja (13+). Silakan tinjau halaman Peringkat Konten untuk
              informasi lebih lanjut.
            </p>

            {detail.first_chapter_id ? (
              <button
                type="button"
                onClick={() => setActiveTab("episode")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-full transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                Eps. Pertama
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full bg-gray-300 dark:bg-white/10 text-gray-500 dark:text-slate-500 font-bold py-3.5 rounded-full cursor-not-allowed"
              >
                Belum Ada Episode
              </button>
            )}

            {/* Desktop Extra Actions Container (List, Rate, Komen, Share) */}
            <div className="flex justify-around items-center mt-6 border-t border-gray-300 dark:border-white/5 pt-6">
              <button
                type="button"
                onClick={toggleFavorite}
                className="flex flex-col items-center gap-1.5 cursor-pointer text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                  <Bookmark
                    size={22}
                    className={
                      isFav
                        ? "fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400"
                        : ""
                    }
                  />
                </div>
                <span className="text-xs font-semibold">List</span>
              </button>

              <button
                type="button"
                onClick={openRate}
                className="flex flex-col items-center gap-1.5 cursor-pointer text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                  <Star
                    size={22}
                    className={currentRating ? "fill-amber-400 text-amber-400" : ""}
                  />
                </div>
                <span className="text-xs font-semibold">Rate</span>
              </button>

              {/* Komen button on Desktop Sidebar */}
              <button
                type="button"
                onClick={handleKomenClick}
                className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors group ${
                  activeTab === "komentar"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <div
                  className={`p-2 rounded-full transition-colors ${
                    activeTab === "komentar"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "group-hover:bg-blue-500/10"
                  }`}
                >
                  <MessageSquare size={22} />
                </div>
                <span className="text-xs font-semibold">Komen</span>
              </button>

              <button
                type="button"
                onClick={copyShareLink}
                className="flex flex-col items-center gap-1.5 cursor-pointer text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                  <Share2 size={22} />
                </div>
                <span className="text-xs font-semibold">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifikasi singkat toast */}
      {notice && (
        <button
          type="button"
          onClick={() => setNotice("")}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-gray-300 dark:border-white/10 bg-[#ECEFF2] dark:bg-[#101726] px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-2xl"
        >
          {notice}
        </button>
      )}

      {/* Modal beri rating */}
      {rateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && setRateOpen(false)}
        >
          <div className="w-full max-w-xs rounded-3xl border border-gray-300 dark:border-white/10 bg-[#ECEFF2] dark:bg-[#101726] p-6 text-center shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Beri Rating</h3>
              <button
                type="button"
                onClick={() => setRateOpen(false)}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => sendRating(n)}
                  aria-label={`${n} bintang`}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={
                      n <= (currentRating ?? 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 dark:text-slate-600"
                    }
                  />
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-slate-500">
              Rating saat ini: {detail.rating} dari {detail.rating_count} penilaian
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
