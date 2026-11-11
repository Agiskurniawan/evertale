import { X } from "lucide-react";

interface ModalClipStudioProps {
  onClose: () => void;
}

export default function ModalClipStudio({ onClose }: ModalClipStudioProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0D1526] border border-gray-200 dark:border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Impor dari Clip Studio Paint
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-xs text-gray-700 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>Untuk mengunggah gambar dari Clip Studio Paint:</p>
          <ol className="list-decimal pl-5 space-y-1.5 text-gray-600 dark:text-slate-400">
            <li>Buka karya komik Anda di Clip Studio Paint.</li>
            <li>
              Pilih menu <b>File &gt; Export (Single Layer) &gt; .png</b> atau{" "}
              <b>Export Webtoon</b>.
            </li>
            <li>Simpan file gambar di komputer Anda (lebar maksimal 800px).</li>
            <li>
              Klik tombol <b>Pilih file untuk diunggah</b> di halaman ini untuk
              memilih seluruh file hasil ekspor.
            </li>
          </ol>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-xs font-semibold text-white transition-colors"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
