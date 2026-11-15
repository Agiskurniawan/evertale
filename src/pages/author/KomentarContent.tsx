import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, Ban, Loader2, Check } from "lucide-react";
import CardAuthorComment, {
  type AuthorCommentItem,
} from "../../components/cards/CardAuthorComment";
import ModalBlockedUsers, {
  type BlockedUser,
} from "../../components/modals/ModalBlockedUsers";
import { useFetch } from "../../hooks/useFetch";
import { api, errorMessage } from "../../lib/api";

interface KomentarContentProps {
  onBack?: () => void;
}

export default function KomentarContent({ onBack }: KomentarContentProps) {
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [serialDropdownOpen, setSerialDropdownOpen] = useState(false);

  // Modal pengguna diblokir
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  // Toast Notifikasi
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const serialRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (serialRef.current && !serialRef.current.contains(e.target as Node)) {
        setSerialDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch daftar serial author
  const { data: serials } = useFetch(
    () =>
      api
        .get<{ data: Array<{ id: number; title: string }> }>("/author/books")
        .then((r) => r.data.data),
    []
  );

  // Fetch komentar (filter berdasarkan serial yang dipilih)
  const {
    data: commentsData,
    loading: commentsLoading,
    reload: reloadComments,
  } = useFetch(
    () => {
      const params = new URLSearchParams();
      if (selectedBookId) params.append("bookId", String(selectedBookId));
      return api
        .get<{ data: AuthorCommentItem[] }>(`/author/comments?${params}`)
        .then((r) => r.data.data);
    },
    [selectedBookId]
  );

  const comments = useMemo(() => commentsData ?? [], [commentsData]);

  // ── Kelola pengguna yang diblokir ───────────────────────────
  const fetchBlockedUsers = async () => {
    try {
      setLoadingBlocked(true);
      const res = await api.get<{ data: BlockedUser[] }>("/author/blocked-users");
      setBlockedUsers(res.data.data);
    } catch {
      // abaikan error
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleOpenBlockModal = () => {
    setBlockModalOpen(true);
    fetchBlockedUsers();
  };

  // ── Balas komentar ──────────────────────────────────────────
  const handleReplyComment = async (commentId: number, content: string) => {
    try {
      await api.post(`/author/comments/${commentId}/reply`, { content });
      showToast("Balasan Anda berhasil dikirim!");
      reloadComments();
    } catch (err) {
      alert(errorMessage(err, "Gagal mengirim balasan"));
      throw err;
    }
  };

  // ── Hapus komentar ──────────────────────────────────────────
  const handleDeleteComment = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;
    try {
      await api.delete(`/author/comments/${id}`);
      showToast("Komentar berhasil dihapus");
      reloadComments();
    } catch (err) {
      alert(errorMessage(err, "Gagal menghapus komentar"));
    }
  };

  // ── Blokir pengguna ─────────────────────────────────────────
  const handleBlockUser = async (user: { id: number; name: string }) => {
    if (
      !window.confirm(
        `Blokir @${user.name}? Pengguna ini tidak akan bisa lagi berkomentar di karya Anda.`
      )
    )
      return;
    try {
      await api.post("/author/block-user", { userId: user.id });
      showToast(`@${user.name} berhasil diblokir`);
      reloadComments();
      if (blockModalOpen) fetchBlockedUsers();
    } catch (err) {
      alert(errorMessage(err, "Gagal memblokir pengguna"));
    }
  };

  // ── Buka blokir ─────────────────────────────────────────────
  const handleUnblockUser = async (userId: number, name: string) => {
    try {
      await api.delete(`/author/unblock-user/${userId}`);
      showToast(`Blokir terhadap @${name} telah dibuka`);
      setBlockedUsers((prev) => prev.filter((u) => u.user_id !== userId));
    } catch (err) {
      alert(errorMessage(err, "Gagal membuka blokir"));
    }
  };

  const selectedTitle = useMemo(() => {
    if (!selectedBookId) return "Semua Serial";
    return serials?.find((s) => s.id === selectedBookId)?.title ?? "Semua Serial";
  }, [selectedBookId, serials]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Toast Notifikasi */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Bar: Navigasi Kembali */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 font-semibold text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Komentar</span>
        </button>
      </div>

      {/* Box Utama Komentar */}
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#101726] dark:border-white/10 min-h-[520px] flex flex-col shadow-sm dark:shadow-lg overflow-hidden w-full">
        {/* Header: Filter Serial + Tombol Kelola Blokir */}
        <div className="p-4 md:p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-4">

          {/* Dropdown pilih serial */}
          <div className="relative" ref={serialRef}>
            <button
              type="button"
              onClick={() => setSerialDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 text-xs font-medium text-gray-900 dark:bg-[#0B1220] dark:border-white/10 dark:hover:border-white/20 dark:text-white transition-colors min-w-[160px] justify-between shadow-xs"
            >
              <span className="truncate max-w-[140px]">{selectedTitle}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-400 dark:text-slate-400 transition-transform ${
                  serialDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {serialDropdownOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-60 bg-white border border-gray-200 dark:bg-[#0D1526] dark:border-white/10 rounded-xl shadow-2xl z-30 py-1.5 max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookId(null);
                    setSerialDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                    selectedBookId === null
                      ? "text-blue-600 bg-blue-50 font-semibold dark:text-blue-400 dark:bg-blue-500/10"
                      : "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                >
                  Semua Serial
                </button>
                {serials?.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedBookId(s.id);
                      setSerialDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors truncate ${
                      selectedBookId === s.id
                        ? "text-blue-600 bg-blue-50 font-semibold dark:text-blue-400 dark:bg-blue-500/10"
                        : "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tombol buka modal pengguna diblokir */}
          <button
            type="button"
            onClick={handleOpenBlockModal}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors group"
          >
            <Ban className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
            <span>Kelola pengguna yang diblokir</span>
          </button>
        </div>

        {/* Body Komentar */}
        <div className="flex-1 flex flex-col justify-center">
          {commentsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-500 dark:text-slate-500 text-xs">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 dark:text-blue-400" />
              <span>Memuat komentar...</span>
            </div>
          ) : comments.length === 0 ? (
            /* Tampilan kosong */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center my-auto">
              <div className="relative mb-5 w-44 h-32 flex items-center justify-center">
                <div className="absolute top-0 left-4 w-20 h-16 rounded-2xl bg-emerald-500/90 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white opacity-90 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-white opacity-90 animate-pulse delay-75" />
                    <span className="w-2 h-2 rounded-full bg-white opacity-90 animate-pulse delay-150" />
                  </div>
                  <div className="absolute -bottom-1 left-4 w-3 h-3 bg-emerald-500/90 rotate-45" />
                </div>
                <div className="absolute bottom-0 right-4 w-28 h-24 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-[#0D1526] dark:border-white/20 p-2 shadow-xl flex flex-col items-center justify-center overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 dark:bg-blue-500/20 dark:border-blue-400/40 flex items-center justify-center mb-1 text-blue-500 dark:text-blue-400 font-bold text-xs">
                    ...
                  </div>
                  <span className="text-[10px] text-gray-600 dark:text-slate-400 font-medium">Menunggu...</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-300 mb-1">
                Belum ada komentar.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 max-w-sm">
                Komentar yang diberikan oleh pembaca pada serial Anda akan muncul di sini.
              </p>
            </div>
          ) : (
            /* Daftar komentar */
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {comments.map((comment) => (
                <CardAuthorComment
                  key={comment.id}
                  comment={comment}
                  onReply={handleReplyComment}
                  onDelete={handleDeleteComment}
                  onBlock={handleBlockUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal pengguna yang diblokir */}
      {blockModalOpen && (
        <ModalBlockedUsers
          onClose={() => setBlockModalOpen(false)}
          blockedUsers={blockedUsers}
          loading={loadingBlocked}
          onUnblock={handleUnblockUser}
        />
      )}
    </div>
  );
}


