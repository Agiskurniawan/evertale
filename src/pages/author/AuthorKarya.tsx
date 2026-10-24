import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Plus, BookOpen, Users, Star,
  Clock, MoreHorizontal,
} from "lucide-react";
import foto2 from "../../assets/foto2.jpg";

const serials: Record<string, {
  title: string; genre: string; lang: string;
  episodes: number; readers: string; rating: string;
  updated: string; tags: string[]; desc: string;
  chapters: { no: number; title: string; words: string; date: string; status: string }[];
}> = {
  "1": {
    title: "Senja di Ujung Semesta", genre: "Fantasi", lang: "Bahasa Indonesia",
    episodes: 14, readers: "8.2K", rating: "4.9", updated: "14/10/2023",
    tags: ["#Fantasi", "#Petualangan"],
    desc: "Di antara ribuan bintang, ada satu kisah yang menunggu untuk ditemukan.",
    chapters: [
      { no: 1, title: "Awal Mula", words: "1.2K", date: "10 Okt 2023", status: "Terbit" },
      { no: 2, title: "Pertemuan di Ujung Senja", words: "1.8K", date: "12 Okt 2023", status: "Terbit" },
      { no: 3, title: "Rahasia di Balik Tirai", words: "2.1K", date: "14 Okt 2023", status: "Terbit" },
      { no: 4, title: "Bayangan Tak Bernama", words: "1.5K", date: "16 Okt 2023", status: "Draft" },
    ],
  },
  "2": {
    title: "Di Bawah Hujan Biru", genre: "Romansa", lang: "Bahasa Indonesia",
    episodes: 30, readers: "4.2K", rating: "4.8", updated: "13/10/2023",
    tags: ["#Romansa", "#Drama"],
    desc: "Sebuah pertemuan tak terduga di bawah hujan mengubah segalanya.",
    chapters: [
      { no: 1, title: "Hujan Pertama", words: "1.4K", date: "01 Okt 2023", status: "Terbit" },
      { no: 2, title: "Temu Tak Sengaja", words: "2.0K", date: "03 Okt 2023", status: "Terbit" },
    ],
  },
  "3": {
    title: "Kastil di Atas Awan", genre: "Novel", lang: "Bahasa Indonesia",
    episodes: 3, readers: "—", rating: "—", updated: "10/10/2023",
    tags: ["#Novel", "#Fiksi"],
    desc: "Sebuah kastil misterius mengambang di atas awan membawa petualangan tak terduga.",
    chapters: [
      { no: 1, title: "Bab Pertama", words: "900", date: "10 Okt 2023", status: "Draft" },
    ],
  },
};

export default function AuthorKarya() {
  const { id } = useParams<{ id: string }>();
  const serial = serials[id ?? "1"];

  if (!serial) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)] text-slate-500">
        Serial tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] px-4 py-8 md:px-10 lg:px-14">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          to="/author"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        {/* Header Serial */}
        <div className="flex items-start gap-5 p-5 rounded-2xl bg-[#101726] border border-white/10 mb-6">
          <img
            src={foto2}
            alt={serial.title}
            className="h-28 w-20 rounded-xl object-cover flex-shrink-0 border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white mb-1">{serial.title}</h1>
            <p className="text-xs text-slate-400 mb-2">{serial.desc}</p>
            <p className="text-xs text-slate-500 mb-3">{serial.lang}</p>

            {/* Tags */}
            <div className="flex gap-1.5 flex-wrap mb-4">
              {serial.tags.map((t) => (
                <span key={t} className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{serial.episodes} Episode</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{serial.readers} Pembaca</span>
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{serial.rating}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Update {serial.updated}</span>
            </div>
          </div>
        </div>

        {/* Daftar Episode */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Daftar Episode</p>
          <Link
            to="/author/tulis"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Episode
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#101726]">
          {serial.chapters.map((c, i) => (
            <div
              key={c.no}
              className={`flex items-center gap-4 px-5 py-3.5 ${
                i < serial.chapters.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              <span className="text-xs font-bold text-slate-600 w-8 flex-shrink-0">#{c.no}</span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{c.words} kata · {c.date}</p>
              </div>

              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                c.status === "Terbit"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-white/10 text-slate-400"
              }`}>
                {c.status}
              </span>

              <button className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
