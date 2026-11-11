import { X } from "lucide-react";

interface ModalPedomanKontenProps {
  onClose: () => void;
}

export default function ModalPedomanKonten({ onClose }: ModalPedomanKontenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0D1526] border border-gray-200 dark:border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Pedoman Konten Kreator</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-xs text-gray-700 dark:text-slate-300 space-y-2 leading-relaxed max-h-72 overflow-y-auto">
          <p>Untuk menjaga kenyamanan seluruh pembaca, dilarang mempublikasikan:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-slate-400">
            <li>Konten pornografi, ketelanjangan, atau seksual eksplisit.</li>
            <li>Kekerasan fisik ekstrem, sadisme, atau penyiksaan tanpa batas.</li>
            <li>Ujaran kebencian, diskriminasi SARA, atau pelecehan individu.</li>
            <li>Karya jiplakan atau pelanggaran hak cipta milik kreator lain.</li>
          </ul>
          <p className="text-gray-500 dark:text-slate-400 pt-1">
            Karya yang melanggar pedoman dapat dinonaktifkan atau dihapus oleh sistem.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-xs font-semibold text-white transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
