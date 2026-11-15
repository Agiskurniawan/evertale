import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Search, Check, X } from "lucide-react";
import BookCard from "./BookCard";
import DataState from "./DataState";
import { useFetch } from "../hooks/useFetch";
import { api } from "../lib/api";
import type { BookList, Category } from "../types";

export default function Kategori() {
  const [activeId, setActiveId] = useState<number | null>(null); // null = Semua
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: categories } = useFetch(
    () => api.get<{ data: Category[] }>("/categories").then((r) => r.data.data),
    []
  );

  const allCategories = categories ?? [];
  const visibleCategories = allCategories.slice(0, 6);

  // Tutup menu saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setGenreMenuOpen(false);
      }
    }
    if (genreMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [genreMenuOpen]);

  const { data, loading, error } = useFetch(
    () =>
      api
        .get<BookList>("/books", {
          params: { category: activeId ?? undefined, sort: "popular", limit: 8 },
        })
        .then((r) => r.data),
    [activeId]
  );
  const books = data?.data ?? [];

  const filteredCategories = allCategories.filter((c) =>
    c.name.toLowerCase().includes(genreSearch.toLowerCase().trim())
  );

  // Cek apakah genre yang aktif berada di luar 6 genre teratas
  const activeExtraCategory =
    activeId !== null && !visibleCategories.some((c) => c.id === activeId)
      ? allCategories.find((c) => c.id === activeId)
      : null;

  return (
    <section className="w-full bg-[#DFE3E8] py-16 md:py-20 transition-colors duration-300 dark:bg-[#080D18]">
      <div className="w-full px-6 md:px-12 lg:px-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold tracking-[0.15em] text-blue-500 uppercase">
            <span>Sesuai Seleramu</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl lg:text-4xl dark:text-white">
            Kategori Populer
          </h2>
        </div>

        {/* Tab Kategori + Tombol Titik Tiga (•••) — titik tiga selalu di kanan */}
        <div className="flex items-center gap-3 mb-10">
          {/* Wrapper genre pill — bisa wrap */}
          <div className="flex items-center gap-3 flex-wrap flex-1">
            {/* Tombol Semua */}
            <button
              type="button"
              onClick={() => setActiveId(null)}
              className={`rounded-full px-6 py-2 text-sm font-semibold uppercase transition-all duration-200 ${
                activeId === null
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "border border-gray-300 bg-[#ECEFF2] text-gray-700 hover:bg-gray-300/80 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              Semua
            </button>

            {/* Daftar Kategori Populer Utama */}
            {visibleCategories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setActiveId(category.id)}
                className={`rounded-full px-6 py-2 text-sm font-semibold uppercase transition-all duration-200 ${
                  activeId === category.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "border border-gray-300 bg-[#ECEFF2] text-gray-700 hover:bg-gray-300/80 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                }`}
              >
                {category.name}
              </button>
            ))}

            {/* Jika kategori aktif terpilih dari luar 6 teratas, tampilkan pill-nya */}
            {activeExtraCategory && (
              <button
                type="button"
                onClick={() => setActiveId(activeExtraCategory.id)}
                className="rounded-full px-6 py-2 text-sm font-semibold uppercase bg-blue-600 text-white shadow-md shadow-blue-500/20"
              >
                {activeExtraCategory.name}
              </button>
            )}
          </div>

          {/* Tombol Titik Tiga — selalu menempel di ujung kanan */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setGenreMenuOpen(!genreMenuOpen)}
              className={`p-2.5 rounded-full border transition-all active:scale-95 shadow-sm flex items-center justify-center ${
                genreMenuOpen
                  ? "bg-blue-600 text-white border-blue-600 shadow-blue-500/30"
                  : "border-gray-300 bg-[#ECEFF2] text-gray-700 hover:bg-gray-300/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              }`}
              title="Pilih Genre Lainnya"
              aria-label="Pilih Semua Genre"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {/* Popover Pilihan Genre */}
            {genreMenuOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 sm:w-80 rounded-3xl bg-[#ECEFF2] dark:bg-[#101726] border border-gray-300 dark:border-white/10 shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 mb-3">
                  <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Pilih Kategori Genre
                  </span>
                  <button
                    type="button"
                    onClick={() => setGenreMenuOpen(false)}
                    className="text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Input Pencarian Genre */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={genreSearch}
                    onChange={(e) => setGenreSearch(e.target.value)}
                    placeholder="Cari genre..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-gray-100 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Grid Daftar Genre */}
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(null);
                      setGenreMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      activeId === null
                        ? "bg-blue-50 text-blue-600 font-bold dark:bg-blue-500/20 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>SEMUA GENRE</span>
                    {activeId === null && <Check className="h-3.5 w-3.5" />}
                  </button>

                  {filteredCategories.map((c) => {
                    const isSelected = activeId === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => {
                          setActiveId(c.id);
                          setGenreMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left uppercase ${
                          isSelected
                            ? "bg-blue-50 text-blue-600 font-bold dark:bg-blue-500/20 dark:text-blue-400"
                            : "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5"
                        }`}
                      >
                        <span>{c.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <DataState
          loading={loading}
          error={error}
          empty={!loading && !error && books.length === 0}
          emptyText="Belum ada karya di kategori ini."
        />
        <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}
