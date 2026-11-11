import { useState } from "react";
import { CornerDownRight, Ban, Trash2, Send, X, Loader2, User } from "lucide-react";
import { assetUrl } from "../../lib/api";

export type AuthorCommentItem = {
  id: number;
  content: string;
  created_at: string;
  parent_id: number | null;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
  book: {
    id: number;
    title: string;
    cover: string | null;
    language: string;
  };
  chapter: {
    id: number;
    no: number;
    title: string;
  } | null;
};

interface CardAuthorCommentProps {
  comment: AuthorCommentItem;
  onReply: (commentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number) => void;
  onBlock: (user: { id: number; name: string }) => void;
}

export default function CardAuthorComment({
  comment,
  onReply,
  onDelete,
  onBlock,
}: CardAuthorCommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      setSubmittingReply(true);
      await onReply(comment.id, replyText.trim());
      setReplyText("");
      setIsReplying(false);
    } finally {
      setSubmittingReply(false);
    }
  };

  const formattedDate = new Date(comment.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="p-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col gap-3">
      {/* Baris User & Aksi */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/30 dark:bg-blue-500/20 dark:border-blue-500/40 flex items-center justify-center overflow-hidden flex-shrink-0">
            {comment.user.avatar ? (
              <img
                src={assetUrl(comment.user.avatar)}
                alt={comment.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {comment.user.name}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-blue-600 font-medium dark:bg-white/5 dark:border-white/10 dark:text-blue-400">
                {comment.book.title}
                {comment.chapter && ` • Ep. ${comment.chapter.no}`}
              </span>
            </div>
            <span className="text-[11px] text-gray-500 dark:text-slate-500">{formattedDate}</span>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsReplying((prev) => !prev)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 text-xs font-semibold transition-colors"
          >
            <CornerDownRight className="h-3.5 w-3.5" />
            <span>Balas</span>
          </button>

          <button
            type="button"
            onClick={() => onBlock(comment.user)}
            title="Blokir pengguna ini"
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 dark:bg-white/5 dark:hover:bg-red-500/15 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
          >
            <Ban className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            title="Hapus komentar"
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 dark:bg-white/5 dark:hover:bg-red-500/15 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Isi Komentar */}
      <p className="text-sm text-gray-700 dark:text-slate-200 pl-13 leading-relaxed whitespace-pre-wrap">
        {comment.content}
      </p>

      {/* Input Balasan Inline */}
      {isReplying && (
        <div className="mt-2 pl-13 flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 dark:bg-[#0B1220] dark:border-white/10 rounded-xl p-2 focus-within:border-blue-500 transition-colors">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Balas sebagai author..."
              className="flex-1 bg-transparent text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none px-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
            />
            <button
              type="button"
              onClick={handleSendReply}
              disabled={submittingReply || !replyText.trim()}
              className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {submittingReply ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Kirim</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsReplying(false);
                setReplyText("");
              }}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-900 dark:hover:bg-white/10 dark:text-slate-500 dark:hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
