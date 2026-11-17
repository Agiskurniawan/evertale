import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { api, assetUrl } from "../lib/api";
import type { Book, BookList } from "../types";

export default function HeroSection() {
  // Ambil hingga 10 karya trending untuk hero section yang bisa di-scroll / digeser
  const { data, loading } = useFetch(
    () =>
      api
        .get<BookList>("/books", { params: { sort: "trending", limit: 10 } })
        .then((r) => r.data.data),
    []
  );

  const slides: Book[] = data && data.length > 0 ? data.slice(0, 10) : [];
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handlePrev = useCallback(() => {
    if (slides.length <= 1) return;
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleNext = useCallback(() => {
    if (slides.length <= 1) return;
    setIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Rotasi otomatis tiap 6 detik jika tidak di-hover / disentuh
  useEffect(() => {
    if (slides.length < 2 || isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused, handleNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (loading) {
    return (
      <section className="w-full h-[340px] sm:h-[400px] md:h-[480px] lg:h-[520px] bg-[#0B1220] animate-pulse" />
    );
  }

  if (slides.length === 0) return null;

  return (
    <section
      className="relative w-full h-[340px] sm:h-[400px] md:h-[480px] lg:h-[520px] overflow-hidden bg-[#0B1220] select-none group/hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Track Slider Horisontal ── */}
      <div
        className="flex w-full h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((book, slideIdx) => {
          const heroArt = assetUrl(book.banner || book.cover);

          return (
            <div
              key={book.id || slideIdx}
              className="w-full h-full flex-shrink-0 relative overflow-hidden"
            >
              {/* ── Gambar Penuh (Full-bleed cover dari Database) ── */}
              <img
                src={heroArt}
                alt={book.title}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.src = assetUrl(null);
                }}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />

              {/* ── Gradasi kiri ke kanan (agar teks terbaca) ── */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220] via-[#0B1220]/70 to-transparent" />

              {/* ── Gradasi bawah ke atas (menyatu dengan halaman) ── */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/40 to-transparent" />

              {/* ── Pil Tag Buku & Rating di Kiri Atas ── */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-6 md:left-10 flex items-center gap-2 z-10">
                {/* Tag: tipe buku (Novel/Komik) */}
                <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-md">
                  {book.type === "novel" ? "NOVEL" : "KOMIK"}
                </span>
                {/* Tag: genre */}
                {(book.genre) && (
                  <span className="px-2.5 py-1 rounded-md bg-[#101726]/80 backdrop-blur-sm text-blue-300 text-[10px] sm:text-xs font-semibold border border-blue-500/20">
                    {book.genre.toUpperCase()}
                  </span>
                )}
                {/* Rating */}
                <span className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] sm:text-xs font-semibold flex items-center gap-1 border border-white/10">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {book.rating || "4.9"}
                </span>
              </div>

              {/* ── Konten Teks & Tombol di Kiri Bawah ── */}
              <div className="absolute bottom-0 left-0 right-0 z-10 px-4 sm:px-6 md:px-10 pb-5 sm:pb-7 md:pb-9">

                {/* Judul Novel */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mb-2 line-clamp-2 drop-shadow-md max-w-lg">
                  {book.title}
                </h1>

                {/* Sinopsis (max 2 baris) */}
                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed line-clamp-2 max-w-[480px] mb-3 sm:mb-4 hidden sm:block">
                  {book.synopsis || "Di antara ribuan bintang, ada satu kisah yang menunggu untuk ditemukan."}
                </p>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2.5 mb-3">
                  {/* Baca Sekarang - warna tema biru */}
                  <Link
                    to={`/baca/${book.id}`}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all duration-150 hover:-translate-y-0.5"
                  >
                    <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Baca Sekarang</span>
                  </Link>
                </div>

                {/* Metadata kecil: pembaca & tipe */}
                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 font-medium">
                  <span>{book.readers || "128K"} pembaca</span>
                  <span className="opacity-40">•</span>
                  <span>{book.type === "novel" ? "Novel" : "Komik"} - {book.genre || "Fantasi"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Indikator Slide (bawah tengah) ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {slides.map((s, i) => (
            <button
              key={s.id || i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                i === index
                  ? "w-6 sm:w-7 h-1.5 bg-blue-500 shadow-sm shadow-blue-500/50"
                  : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Tombol Panah (muncul saat hover desktop) ── */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Slide sebelumnya"
            onClick={handlePrev}
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg opacity-0 group-hover/hero:opacity-100 transition-all active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Slide berikutnya"
            onClick={handleNext}
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg opacity-0 group-hover/hero:opacity-100 transition-all active:scale-90 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
}
