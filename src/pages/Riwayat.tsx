import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import HistoryCard from "../components/HistoryCard";
import DataState from "../components/DataState";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { api, errorMessage } from "../lib/api";
import type { HistoryGroup } from "../types";

export default function Riwayat() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useFetch(
    () => api.get<{ data: HistoryGroup[] }>("/history").then((r) => r.data.data),
    [isLoggedIn],
    isLoggedIn
  );
  const readingHistory = data ?? [];

  const clearAll = async () => {
    if (!window.confirm("Hapus semua riwayat baca?")) return;
    try {
      await api.delete("/history");
      reload();
    } catch (e) {
      alert(errorMessage(e));
    }
  };

  if (authLoading) return <DataState loading />;
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-slate-400">Login dulu untuk melihat riwayat bacaanmu.</p>
        <Link to="/login" className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-400">
          Login / Register
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1220] pb-20">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-10">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200 dark:border-white/5 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Riwayat Baca</h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">Lanjutkan petualanganmu dari halaman terakhir.</p>
          </div>
          
          <button onClick={clearAll} className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            <Trash2 className="h-4 w-4" />
            <span>Hapus semua</span>
          </button>
        </div>

        <DataState loading={loading} error={error} empty={!loading && !error && readingHistory.length === 0} emptyText="Belum ada riwayat baca." />
        <div className="space-y-12">
          {readingHistory.map((group) => (
            <div key={group.date}>
              <h2 className="text-xs font-bold tracking-widest text-gray-500 dark:text-slate-400 uppercase mb-4">
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
