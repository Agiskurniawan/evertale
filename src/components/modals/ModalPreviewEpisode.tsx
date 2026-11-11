import { Monitor, Smartphone, X } from "lucide-react";
import { assetUrl } from "../../lib/api";

interface ModalPreviewEpisodeProps {
  mode: "pc" | "mobile";
  onClose: () => void;
  chapterNumber: number;
  chapterTitle: string;
  pages: string[];
  novelContent: string;
  creatorNote?: string;
}

export default function ModalPreviewEpisode({
  mode,
  onClose,
  chapterNumber,
  chapterTitle,
  pages,
  novelContent,
  creatorNote,
}: ModalPreviewEpisodeProps) {
  const isMobile = mode === "mobile";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`bg-white dark:bg-[#0D1526] border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
          isMobile ? "w-full max-w-sm h-[720px]" : "w-full max-w-3xl h-[680px]"
        }`}
      >
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#101726]">
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Smartphone className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            ) : (
              <Monitor className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            )}
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              Pratinjau {isMobile ? "Seluler" : "PC"} • Ep. {chapterNumber}:{" "}
              {chapterTitle || "Tanpa Judul"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Isi Pratinjau */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center bg-gray-100 dark:bg-[#070B14]">
          {pages.length > 0 && (
            <div className="w-full flex flex-col items-center gap-1">
              {pages.map((img, i) => (
                <img
                  key={i}
                  src={assetUrl(img)}
                  alt={`Halaman ${i + 1}`}
                  className="w-full max-w-md object-contain"
                />
              ))}
            </div>
          )}

          {novelContent && (
            <div className="max-w-xl w-full py-6 text-gray-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {novelContent}
            </div>
          )}

          {!pages.length && !novelContent && (
            <div className="my-auto text-gray-400 dark:text-slate-600 text-xs">
              Belum ada konten atau halaman gambar untuk dipratinjau.
            </div>
          )}

          {creatorNote && (
            <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 max-w-md w-full text-xs text-blue-600 dark:text-blue-300">
              <p className="font-bold mb-1">Catatan Kreator:</p>
              <p>{creatorNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
