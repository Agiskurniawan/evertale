import type { HistoryItem } from "../data/history";

export default function HistoryCard({ item }: { item: HistoryItem }) {
  return (
    <div className="flex flex-row rounded-xl bg-[#111A2C] border border-white/5 p-4 sm:p-5 gap-4 sm:gap-6 transition-all hover:border-white/20">
      
      <div className="w-20 h-28 sm:w-24 sm:h-32 shrink-0 overflow-hidden rounded-md">
        <img 
          src={item.cover} 
          alt={item.title} 
          className="h-full w-full object-cover" 
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        
        <div>
          <h3 className="text-white font-bold text-base sm:text-lg mb-1 truncate">{item.title}</h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-4">Terakhir dibaca: {item.lastReadLabel}</p>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-[#0B1220] rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${item.progress}%` }} 
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">{item.progress}%</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap">
            Lanjutkan Membaca
          </button>
        </div>

      </div>
      
    </div>
  );
}
