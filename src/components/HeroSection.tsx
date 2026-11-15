import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { api, assetUrl } from "../lib/api";
import type { Book, BookList } from "../types";

// Gambar fallback: Hinata anime dengan anting bulan (sesuai screenshot asli)
const SAMPLE_HERO_ART = "/sample_hero_art.jpg";
const FALLBACK_COVER = "/uploads/covers/1794143446719-8bf6t7ldnx9.jpg";

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
      <section className="w-full min-h-[70vh] md:min-h-[80vh] bg-[#0B1220] animate-pulse" />
    );
  }

  if (slides.length === 0) return null;

  return (
    <section
      className="relative w-full min-h-[72vh] md:min-h-[80vh] lg:min-h-[85vh] overflow-hidden bg-[#0B1220] select-none group/hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Track Slider Horisontal (Bisa di-scroll / digeser untuk 10 trending karya) ── */}
      <div
        className="flex w-full h-full transition-transform duration-600 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((book, slideIdx) => {
          // Resolusi gambar: banner hero karya -> cover karya -> sample anime art Hinata
          const heroArt = book.banner
            ? assetUrl(book.banner)
            : book.cover
            ? assetUrl(book.cover)
            : assetUrl(SAMPLE_HERO_ART);

          return (
            <div
              key={book.id || slideIdx}
              className="w-full h-full flex-shrink-0 relative overflow-hidden flex items-center min-h-[72vh] md:min-h-[80vh] lg:min-h-[85vh]"
            >
              {/* ── Artwork di Sisi Kanan dengan Gradasi Menghilang Halus ke Sisi Kiri ── */}
              <div className="absolute right-0 top-0 bottom-0 w-full sm:w-4/5 md:w-3/5 lg:w-3/5 overflow-hidden pointer-events-none">
                <img
                  src={heroArt}
                  alt={book.title}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src !== assetUrl(SAMPLE_HERO_ART)) {
                      img.src = assetUrl(SAMPLE_HERO_ART);
                    } else {
                      img.src = assetUrl(FALLBACK_COVER);
                    }
                  }}
                  className="w-full h-full object-cover object-right sm:object-center"
                />
                {/* Gradasi menyatu dengan latar belakang #0B1220 */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220] via-[#0B1220]/85 sm:via-[#0B1220]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/60 sm:via-transparent to-transparent sm:hidden" />
              </div>

              {/* ── Konten Sisi Kiri (Sesuai Desain Asli di Screenshot) ── */}
              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-16 py-12 md:py-16">
                <div className="max-w-2xl flex flex-col justify-center">
                  
                  {/* Tag Atas: PILIHAN EDITOR / GENRE */}
                  <p className="text-xs sm:text-sm font-bold tracking-widest text-blue-400 uppercase mb-3 sm:mb-4 flex items-center gap-2">
                    <span>PILIHAN EDITOR</span>
                    <span className="opacity-40">/</span>
                    <span>{(book.genre || "FANTASI ROMANSA").toUpperCase()}</span>
                  </p>

                  {/* Judul Besar */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.12] tracking-tight mb-3 sm:mb-4 drop-shadow-md">
                    {book.title}
                  </h1>

                  {/* Sinopsis */}
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6 sm:mb-8 max-w-xl">
                    {book.synopsis || "Di antara ribuan bintang, ada satu kisah yang menunggu untuk ditemukan."}
                  </p>

                  {/* Dua Tombol Aksi: Baca Sekarang & Lihat Detail */}
                  <div className="flex items-center gap-3.5 mb-6 sm:mb-8 flex-wrap">
                    <Link
                      to={`/baca/${book.id}`}
                      className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center cursor-pointer"
                    >
                      Baca Sekarang
                    </Link>

                    <Link
                      to={`/baca/${book.id}`}
                      className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-semibold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Baris Metadata: Rating, Pembaca, Tipe & Genre */}
                  <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-400 font-medium flex-wrap">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-white">{book.rating || "4.9"}</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">{book.readers || "128K"} pembaca</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">
                      {book.type === "novel" ? "Novel" : "Komik"} - {book.genre || "Fantasi"}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Indikator Slide di Pojok Kanan Bawah (Sesuai Screenshot: [--] . .) ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-14 flex items-center gap-1.5 z-20">
          {slides.map((s, i) => (
            <button
              key={s.id || i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                i === index
                  ? "w-8 sm:w-10 h-1 sm:h-1.5 bg-blue-500 shadow-sm shadow-blue-500/50"
                  : "w-1.5 sm:w-2 h-1 sm:h-1.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Tombol Panah Navigasi Samping Desktop (Muncul saat Hover) ── */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Slide sebelumnya"
            onClick={handlePrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl opacity-0 group-hover/hero:opacity-100 transition-all active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Slide berikutnya"
            onClick={handleNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl opacity-0 group-hover/hero:opacity-100 transition-all active:scale-90 cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </section>
  );
}
