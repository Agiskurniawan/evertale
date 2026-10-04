import HistoryCard from "../components/HistoryCard";
import { readingHistory } from "../data/history";
import { Trash2 } from "lucide-react";

export default function Riwayat() {
  return (
    <div className="min-h-screen bg-[#0B1220] pb-20">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-10">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/5 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Riwayat Baca</h1>
            <p className="text-sm text-slate-400">Lanjutkan petualanganmu dari halaman terakhir.</p>
          </div>
          
          <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
            <Trash2 className="h-4 w-4" />
            <span>Hapus semua</span>
          </button>
        </div>

        <div className="space-y-12">
          {readingHistory.map((group) => (
            <div key={group.date}>
              <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
                {group.date}
              </h2>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                {group.items.map((item) => (
                  <HistoryCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
