import { Link } from "react-router-dom";
import { PenLine, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { assetUrl } from "../../lib/api";
import type { AuthorChapterRow } from "../../types";

interface CardEpisodeRowProps {
  serialId: number;
  chapter: AuthorChapterRow;
  index: number;
  total: number;
  isNovel?: boolean;
  onDelete: (chapterId: number, title: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

export default function CardEpisodeRow({
  serialId,
  chapter,
  index,
  total,
  isNovel = false,
  onDelete,
  onMoveUp,
  onMoveDown,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
}: CardEpisodeRowProps) {
  const isTerbit = chapter.status === "Terbit";
  const editUrl = isNovel
    ? `/author/novel-editor?serial=${serialId}&chapter=${chapter.id}`
    : `/author/tulis?serial=${serialId}&episode=${chapter.id}`;

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDrop={(e) => onDrop?.(e, index)}
      onDragEnd={onDragEnd}
      className={`py-3 px-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 rounded-2xl transition-all ${
        isDragging
          ? "opacity-40 bg-blue-500/10 border-2 border-dashed border-blue-500"
          : "hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-gray-100 dark:border-white/5 sm:border-transparent sm:hover:border-gray-200 sm:dark:hover:border-white/5 bg-gray-50/50 sm:bg-transparent dark:bg-white/[0.015] sm:dark:bg-transparent"
      }`}
    >
      {/* Sisi Kiri / Atas: Nomor, Info Bab/Episode, Status */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 w-full">
        {/* Drag Handle Grip (Tarik dan Lepas) */}
        {draggable && (
          <div
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500 transition-colors p-1 flex-shrink-0"
            title="Tahan dan geser untuk mengurutkan bab"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {/* Nomor Bab / Episode */}
        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 w-6 sm:w-7 flex-shrink-0">
          #{chapter.no}
        </span>

        {/* Thumbnail jika ada (atau jika komik) */}
        {chapter.thumbnail_url ? (
          <img
            src={assetUrl(chapter.thumbnail_url)}
            alt={chapter.title}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = "none";
            }}
            className="w-12 h-9 sm:w-16 sm:h-11 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-white/10"
          />
        ) : !isNovel ? (
          <div className="w-12 h-9 sm:w-16 sm:h-11 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 text-gray-400">
            <span className="text-[10px] font-mono">#{chapter.no}</span>
          </div>
        ) : null}

        {/* Judul & Detail Kata / Tanggal */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {chapter.title}
            </p>
            {/* Status terbit/draft di mobile bersebelahan dengan judul */}
            <span
              className={`sm:hidden text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                isTerbit
                  ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                  : "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-slate-400"
              }`}
            >
              {chapter.status}
            </span>
          </div>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
            {chapter.words} kata • {chapter.date}
          </p>
        </div>
      </div>

      {/* Sisi Kanan / Bawah: Tombol Aksi */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-gray-200/60 dark:border-white/5 sm:border-0">
        {/* Tombol Cepat Naik / Turun (Touch-friendly untuk HP & Tablet) */}
        {draggable && (
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveUp?.(index)}
              className="p-1.5 rounded-md text-gray-500 hover:text-blue-500 hover:bg-white dark:hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-colors"
              title="Pindah ke Atas"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => onMoveDown?.(index)}
              className="p-1.5 rounded-md text-gray-500 hover:text-blue-500 hover:bg-white dark:hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-colors"
              title="Pindah ke Bawah"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Status di layar tablet / desktop */}
        <span
          className={`hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
            isTerbit
              ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
              : "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-slate-400"
          }`}
        >
          {chapter.status}
        </span>

        {/* Tombol Edit */}
        <Link
          to={editUrl}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 text-xs font-semibold transition-colors active:scale-95"
          title={isNovel ? "Edit naskah bab" : "Edit episode"}
        >
          <PenLine className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Link>

        {/* Tombol Hapus */}
        <button
          type="button"
          onClick={() => onDelete(chapter.id, chapter.title)}
          className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 dark:bg-white/5 dark:hover:bg-red-500/15 dark:text-slate-400 dark:hover:text-red-400 transition-colors active:scale-95"
          title={isNovel ? "Hapus bab" : "Hapus episode"}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
