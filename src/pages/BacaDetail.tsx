import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Share2, Bookmark, Star, MessageSquare, Download, Eye, Users, X } from "lucide-react";
import DataState from "../components/DataState";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { api, assetUrl, errorMessage } from "../lib/api";
import type { BookDetail, Episode } from "../types";

// key={id} → saat pindah dari satu karya ke karya lain, state (favorit, rating) di-reset otomatis
export default function BacaDetail() {
  const { id } = useParams();
  return <BacaDetailContent key={id} id={id ?? ""} />;
}

function BacaDetailContent({ id }: { id: string }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const book = useFetch(() => api.get<{ data: BookDetail }>(`/books/${id}`).then((r) => r.data.data), [id, isLoggedIn]);
  const eps = useFetch(() => api.get<{ data: Episode[] }>(`/books/${id}/chapters`).then((r) => r.data.data), [id, isLoggedIn]);

  const [favOverride, setFavOverride] = useState<boolean | null>(null);
  const [rateOpen, setRateOpen] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  if (book.notFound) return <Navigate to="/404" replace />;
  if (book.loading || book.error || !book.data) {
    return (
      <div className="min-h-screen bg-[#0B1220]">
        <DataState loading={book.loading} error={book.error} />
      </div>
    );
  }

  const detail = book.data;
  const isFav = favOverride ?? detail.is_favorite;
  const currentRating = myRating ?? detail.my_rating;

  const toggleFavorite = async () => {
    if (!isLoggedIn) return navigate("/login");
    try {
      if (isFav) await api.delete(`/favorites/books/${detail.id}`);
      else await api.post(`/favorites/books/${detail.id}`);
      setFavOverride(!isFav);
      setNotice(isFav ? "Dihapus dari favorit" : "Ditambahkan ke favorit");
    } catch (e) {
      setNotice(errorMessage(e));
    }
  };

  const openRate = () => {
    if (!isLoggedIn) return navigate("/login");
    setRateOpen(true);
  };

  const sendRating = async (score: number) => {
    try {
      await api.put(`/books/${detail.id}/rating`, { score });
      setMyRating(score);
      setNotice(`Rating ${score} tersimpan`);
    } catch (e) {
      setNotice(errorMessage(e));
    }
    setRateOpen(false);
  };

  const bookInfo = {
    title: detail.title,
    author: detail.author?.name ?? "—",
    views: detail.views,
    readers: detail.readers,
    updateDay: detail.update_day ?? "—",
    synopsis: detail.synopsis ?? "Belum ada sinopsis.",
    cover: assetUrl(detail.cover),
    bgImage: assetUrl(detail.cover),
  };

  const episodes = (eps.data ?? []).map((e) => ({
    id: e.id,
    // "Bab 12" saja kalau judulnya memang sama, selain itu "Bab 1 · Awal Mula"
    title: e.title === e.label ? e.label : `${e.label} · ${e.title}`,
    date: e.date,
    likes: e.likes,
    num: e.num,
    img: assetUrl(e.img ?? detail.cover),
  }));

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col md:bg-[#080D18]">
      {/* HEADER SECTION */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        {/* Background Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bookInfo.bgImage})` }}
        >
          <div className="absolute inset-0 bg-[#0B1220]/80 backdrop-blur-md"></div>
        </div>

        {/* Mobile Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10 md:hidden">
          <Link to="/" className="p-2 transition-colors hover:text-blue-400">
            <ArrowLeft size={28} />
          </Link>
          <button className="p-2 transition-colors hover:text-blue-400">
            <Share2 size={24} />
          </button>
        </div>

        {/* Header Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
          <div className="mt-8 md:mt-0 w-[180px] h-[250px] md:w-[220px] md:h-[300px] rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <img src={bookInfo.cover} alt="Cover" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white text-xl md:text-3xl font-extrabold mt-6 text-center px-4 max-w-4xl line-clamp-2 md:line-clamp-none">
            {bookInfo.title}
          </h1>
          <p className="text-slate-400 text-sm mt-3 hidden md:block">
            {bookInfo.author}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full max-w-6xl mx-auto md:px-4 -mt-4 md:-mt-10 relative z-20">
        <div className="bg-[#111A2C] border border-white/5 md:rounded-xl rounded-t-3xl shadow-xl flex flex-col md:flex-row overflow-hidden min-h-[500px]">
          
          {/* MOBILE ACTION BUTTONS */}
          <div className="md:hidden flex justify-around items-center p-6 border-b border-white/5">
            <div className="flex flex-col items-center gap-2">
              <button onClick={toggleFavorite} className="w-12 h-12 bg-white/5 text-blue-400 rounded-full flex justify-center items-center hover:bg-blue-500/20 transition-colors">
                <Bookmark size={22} className={isFav ? "fill-blue-400" : ""} />
              </button>
              <span className="text-xs text-slate-300">List</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={openRate} className="w-12 h-12 bg-white/5 text-blue-400 rounded-full flex justify-center items-center hover:bg-blue-500/20 transition-colors">
                <Star size={22} className={currentRating ? "fill-amber-400 text-amber-400" : ""} />
              </button>
              <span className="text-xs text-slate-300">Rate</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="w-12 h-12 bg-white/5 text-blue-400 rounded-full flex justify-center items-center hover:bg-blue-500/20 transition-colors">
                <MessageSquare size={22} />
              </button>
              <span className="text-xs text-slate-300">Komen</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="w-12 h-12 bg-white/5 text-blue-400 rounded-full flex justify-center items-center hover:bg-blue-500/20 transition-colors">
                <Download size={22} />
              </button>
              <span className="text-xs text-slate-300">Download</span>
            </div>
          </div>

          {/* MOBILE SINOPSIS */}
          <div className="md:hidden p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white mb-3">Sinopsis</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {bookInfo.synopsis}
            </p>
          </div>

          {/* EPISODE LIST COLUMN */}
          <div className="flex-1 p-4 md:p-8">
            <div className="hidden md:flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Episode</h2>
            </div>
            <h2 className="md:hidden text-lg font-bold text-white px-2 mb-4">Episode</h2>
            
            <DataState loading={eps.loading} error={eps.error} empty={!eps.loading && !eps.error && episodes.length === 0} emptyText="Belum ada episode yang terbit." />
            <div className="flex flex-col gap-3">
              {episodes.map((ep) => (
                <div key={ep.id} className="group flex items-center p-3 hover:bg-white/5 rounded-xl cursor-pointer border md:border-b md:border-x-0 md:border-t-0 border-white/5 transition-colors">
                  <img src={ep.img} alt={ep.title} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg" />
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{ep.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 md:hidden">{ep.date}</p>
                  </div>
                  
                  {/* Desktop Middle Info */}
                  <div className="hidden md:flex flex-1 items-center justify-between px-8">
                    <span className="text-sm text-slate-400">{ep.date}</span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Star size={16} className="text-amber-400 fill-amber-400/20" />
                      <span className="text-sm text-white">{ep.likes}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-300">{ep.num}</span>
                  </div>

                  {/* Mobile Right Info */}
                  <div className="md:hidden flex flex-col items-end">
                    <div className="flex items-center gap-1 border border-white/10 rounded-full px-2 py-1 bg-[#0B1220]">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-white">{ep.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DESKTOP INFO SIDEBAR */}
          <div className="hidden md:flex flex-col w-[350px] p-8 border-l border-white/5 bg-[#0B1220]/30">
             <div className="flex items-center gap-6 mb-8">
               <div className="flex items-center gap-2 text-blue-400">
                 <Eye size={20} />
                 <span className="font-bold text-white">{bookInfo.views}</span>
               </div>
               <div className="flex items-center gap-2 text-blue-400">
                 <Users size={20} />
                 <span className="font-bold text-white">{bookInfo.readers}</span>
               </div>
             </div>

             <div className="flex items-center gap-3 mb-6">
               <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">UP</span>
               <span className="font-bold text-slate-300">Update {bookInfo.updateDay}</span>
             </div>

             <p className="text-sm text-slate-400 leading-relaxed mb-6">
               {bookInfo.synopsis}
             </p>
             
             <p className="text-xs text-slate-500 mb-8 italic bg-white/5 p-3 rounded-lg border border-white/5">
               Serial ini diberi rating Remaja (13+). Silakan tinjau halaman Peringkat Konten untuk informasi lebih lanjut.
             </p>

             <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-full transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20">
               Eps. Pertama
             </button>
             
             {/* Desktop Extra Actions Container */}
             <div className="flex justify-around items-center mt-8 border-t border-white/5 pt-8">
                <div onClick={toggleFavorite} className="flex flex-col items-center gap-2 cursor-pointer text-slate-400 hover:text-blue-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                    <Bookmark size={22} className={isFav ? "fill-blue-400 text-blue-400" : ""} />
                  </div>
                  <span className="text-xs font-semibold">List</span>
                </div>
                <div onClick={openRate} className="flex flex-col items-center gap-2 cursor-pointer text-slate-400 hover:text-blue-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                    <Star size={22} className={currentRating ? "fill-amber-400 text-amber-400" : ""} />
                  </div>
                  <span className="text-xs font-semibold">Rate</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer text-slate-400 hover:text-blue-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                    <Share2 size={22} />
                  </div>
                  <span className="text-xs font-semibold">Share</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Notifikasi singkat */}
      {notice && (
        <button
          onClick={() => setNotice("")}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[#101726] px-5 py-2.5 text-sm text-white shadow-2xl"
        >
          {notice}
        </button>
      )}

      {/* Modal beri rating */}
      {rateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && setRateOpen(false)}
        >
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#101726] p-6 text-center shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Beri Rating</h3>
              <button onClick={() => setRateOpen(false)} className="text-slate-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => sendRating(n)} aria-label={`${n} bintang`} className="p-1 transition-transform hover:scale-110">
                  <Star size={32} className={n <= (currentRating ?? 0) ? "fill-amber-400 text-amber-400" : "text-slate-600"} />
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Rating saat ini: {detail.rating} dari {detail.rating_count} penilaian</p>
          </div>
        </div>
      )}
    </div>
  );
}
