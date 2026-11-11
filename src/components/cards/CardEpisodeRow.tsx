import { Link } from "react-router-dom";
import { PenLine, Trash2 } from "lucide-react";
import type { AuthorChapterRow } from "../../types";

interface CardEpisodeRowProps {
  serialId: number;
  chapter: AuthorChapterRow;
  onDelete: (chapterId: number, title: string) => void;
}

export default function CardEpisodeRow({
  serialId,
  chapter,
  onDelete,
}: CardEpisodeRowProps) {
  const isTerbit = chapter.status === "Terbit";

  return (
    <div className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 w-7 flex-shrink-0">
          #{chapter.no}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {chapter.title}
          </p>
          <p className="text-[11px] text-gray-600 dark:text-gray-400">
            {chapter.words} kata • {chapter.date}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            isTerbit
              ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
              : "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-slate-400"
          }`}
        >
          {chapter.status}
        </span>

        <Link
          to={`/author/tulis?serial=${serialId}&episode=${chapter.id}`}
          className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 dark:bg-white/5 dark:hover:bg-blue-500/20 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
          title="Edit episode"
        >
          <PenLine className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={() => onDelete(chapter.id, chapter.title)}
          className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 dark:bg-white/5 dark:hover:bg-red-500/20 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
          title="Hapus episode"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
