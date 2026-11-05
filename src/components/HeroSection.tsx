import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { api, assetUrl } from "../lib/api";
import type { BookList } from "../types";

export default function HeroSection() {
  // Karya yang ditandai admin sebagai "Pilihan Editor" (is_featured)
  const { data, loading } = useFetch(
    () => api.get<BookList>("/books", { params: { featured: 1, limit: 3 } }).then((r) => r.data.data),
    []
  );
  const slides = data ?? [];
  const [index, setIndex] = useState(0);

  // Kalau pilihan editor lebih dari satu → ganti otomatis tiap 6 detik
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) return <section className="min-h-[70vh] bg-[#080D18]" />;
  const book = slides[index % Math.max(slides.length, 1)];
  if (!book) return null;

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-[#080D18]">
      <div className="absolute inset-0">
        <img
          src={assetUrl(book.banner ?? book.cover)}
          alt={book.title}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#080D18]/95 via-[#080D18]/70 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-[#080D18] via-transparent to-[#080D18]/30" />
      </div>

      <div className="relative z-10 flex min-h-[80vh] w-full items-center px-6 md:px-12 lg:px-16">
        <div className="max-w-2xl space-y-8">
          <div className="flex items-center gap-3 text-xs font-bold tracking-[0.15em] text-blue-400 uppercase">
            <span>Pilihan Editor <span className="text-white/30 mx-1">/</span> {book.genres.slice(0, 2).join(" ")}</span>
          </div>

          <h1 className="text-6xl font-extrabold leading-[1.15] tracking-tight text-white md:text-[5rem]">
            {book.title}
          </h1>

          <p className="line-clamp-3 max-w-lg text-[1.05rem] leading-relaxed text-slate-300">
            {book.synopsis ?? ""}
          </p>

          <div className="flex items-center gap-5 pt-2">
            <Link to={`/baca/${book.id}`} className="flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.97]">
              Baca Sekarang
            </Link>
            <Link to={`/baca/${book.id}`} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.97]">
              Lihat Detail
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center gap-4 pt-4 text-sm font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-white">{book.rating}</span>
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span><span className="text-white">{book.readers}</span> pembaca</span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span>{book.type === "novel" ? "Novel" : "Komik"} · {book.genre}</span>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 right-10 flex items-center gap-2 z-10">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-7 bg-blue-500" : "w-1.5 bg-white/30"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
