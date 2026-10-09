import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Share2, Bookmark, Star, MessageSquare, Download, Eye, Users } from "lucide-react";
import foto2 from "../assets/foto2.jpg";
import { books } from "../data/books";
import { readingHistory } from "../data/history";

export default function BacaDetail() {

  const { id } = useParams();

  let foundBook: any = books.find((b) => b.id.toString() === id);
  
  if (!foundBook) {
    for (const group of readingHistory) {
      const item = group.items.find((i) => i.id.toString() === id);
      if (item) {
        foundBook = item;
        break;
      }
    }
  }

  // Dummy data merged with found book data
  const bookInfo = {
    title: foundBook?.title || "Judul Tidak Diketahui",
    author: "Author Dummy",
    views: "552.240",
    readers: foundBook?.readers || "17.947",
    updateDay: "MINGGU",
    synopsis: "Dihantui rasa sakit dan kemalangan sejak awal, Shin-Ae memutuskan untuk tidak lagi berhubungan dengan orang lain atau pun percintaan. Meskipun merasa cukup dengan kehidupannya yang tidak sosial, membosankan, dan tanpa cinta, gaya hidupnya berubah setelah ia merusak pakaian orang asing yang tak menaruh curiga. Tara & Sagara, dua siswa dengan hobi 'terlarang' berjuang untuk menciptakan ruang agar bisa menjadi diri sendiri dengan membentuk klub ekskul samaran.",
    cover: foundBook?.cover || foto2,
    bgImage: foundBook?.cover || foto2,
  };

  const episodes = [
    { id: 198, title: "Episode 45 (TAMAT)", date: "26 Sep 2026", likes: "1.193", num: "#45", img: foto2 },
    { id: 197, title: "Episode 44", date: "19 Sep 2026", likes: "1.079", num: "#44", img: foto2 },
    { id: 196, title: "Episode 43", date: "12 Sep 2026", likes: "1.066", num: "#43", img: foto2 },
    { id: 195, title: "Episode 42", date: "5 Sep 2026", likes: "1.243", num: "#42", img: foto2 },
    { id: 194, title: "Episode 41", date: "29 Agt 2026", likes: "1.144", num: "#41", img: foto2 },
    { id: 193, title: "Episode 40", date: "22 Agt 2026", likes: "1.150", num: "#40", img: foto2 },
    { id: 192, title: "Episode 39", date: "15 Agt 2026", likes: "1.398", num: "#39", img: foto2 },
    { id: 191, title: "Episode 38", date: "8 Agt 2026", likes: "1.286", num: "#38", img: foto2 },
  ];

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
              <button className="w-12 h-12 bg-white/5 text-blue-400 rounded-full flex justify-center items-center hover:bg-blue-500/20 transition-colors">
                <Bookmark size={22} />
              </button>
              <span className="text-xs text-slate-300">List</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="w-12 h-12 bg-white/5 text-blue-400 rounded-full flex justify-center items-center hover:bg-blue-500/20 transition-colors">
                <Star size={22} />
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
                <div className="flex flex-col items-center gap-2 cursor-pointer text-slate-400 hover:text-blue-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                    <Bookmark size={22} />
                  </div>
                  <span className="text-xs font-semibold">List</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer text-slate-400 hover:text-blue-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                    <Star size={22} />
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
    </div>
  );
}
