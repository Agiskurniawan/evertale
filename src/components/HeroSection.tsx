import { Star, BookOpen, ArrowRight } from "lucide-react";
import foto1 from "../assets/foto1.jpg";

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-[#080D18]">
      <div className="absolute inset-0">
        <img
          src={foto1}
          alt="Fantasy night cityscape"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#080D18]/95 via-[#080D18]/70 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-[#080D18] via-transparent to-[#080D18]/30" />
      </div>

      <div className="relative z-10 flex min-h-[80vh] w-full items-center px-6 md:px-12 lg:px-16">
        <div className="max-w-2xl space-y-8">
          <div className="flex items-center gap-3 text-xs font-bold tracking-[0.15em] text-blue-400 uppercase">
            <span>Pilihan Editor <span className="text-white/30 mx-1">/</span> Fantasi Romansa</span>
          </div>

          <h1 className="text-6xl font-extrabold leading-[1.15] tracking-tight text-white md:text-[5rem]">
            Senja di Ujung<br />Semesta
          </h1>

          <p className="max-w-lg text-[1.05rem] leading-relaxed text-slate-300">
            Di antara ribuan bintang, ada satu kisah yang menunggu untuk ditemukan.
          </p>

          <div className="flex items-center gap-5 pt-2">
            <button className="flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.97]">
              Baca Sekarang
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.97]">
              Lihat Detail
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-4 pt-4 text-sm font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-white">4.9</span>
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span><span className="text-white">128K</span> pembaca</span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span>Novel · Fantasi</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-10 flex items-center gap-2 z-10">
        <div className="h-1.5 w-7 rounded-full bg-blue-500"></div>
        <div className="h-1.5 w-1.5 rounded-full bg-white/30"></div>
        <div className="h-1.5 w-1.5 rounded-full bg-white/30"></div>
      </div>
    </section>
  );
}