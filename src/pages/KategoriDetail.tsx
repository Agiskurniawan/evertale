import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MoreHorizontal, X, Search, Check } from "lucide-react";
import BookCard from "../components/BookCard";
import DataState from "../components/DataState";
import { useFetch } from "../hooks/useFetch";
import { api } from "../lib/api";
import type { BookList, Category } from "../types";

export default function KategoriDetail() {
  const { type } = useParams<{ type: string }>(); // "novel" atau "komik"
  const bookType = type === "novel" || type === "komik" ? type : undefined;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popular");

  // State menu titik 3 pilihan genre
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { label: "Popularitas", key: "popular" },
    { label: "Berdasarkan Jumlah Like", key: "likes" },
    { label: "Berdasarkan Tanggal", key: "latest" },
  ];

  const { data: categories } = useFetch(
    () => api.get<{ data: Category[] }>("/categories").then((r) => r.data.data),
    []
  );
  const allCategories = categories ?? [];
  const activeId = selectedId ?? allCategories[0]?.id ?? null; // default: kategori pertama

  // Tutup menu genre saat klik di luar
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
          params: { type: bookType, category: activeId, sort: sortBy, limit: 50 },
        })
        .then((r) => r.data),
    [bookType, activeId, sortBy],
    activeId !== null
  );
  const books = data?.data ?? [];

  // Filter daftar genre di dalam menu popover
  const filteredCategories = allCategories.filter((c) =>
    c.name.toLowerCase().includes(genreSearch.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1220] pb-20 transition-colors duration-300">
      {/* ── Sub-Navbar Kategori & Tombol Titik 3 Genre di Kanan ── */}
      <div className="border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0B1220] sticky top-[72px] z-30 transition-colors duration-300">
        <div className="px-6 md:px-12 lg:px-16 flex items-center justify-between gap-3">
          {/* Baris Genre Horizontal yang Bisa Di-scroll */}
          <div className="overflow-x-auto scrollbar-none flex-1 py-1">
            <div className="flex space-x-6 md:space-x-8">
              {allCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedId(category.id);
                    setGenreMenuOpen(false);
                  }}
                  className={`py-4 text-xs md:text-sm font-semibold uppercase whitespace-nowrap border-b-2 transition-colors ${
                    activeId === category.id
                      ? "border-blue-500 text-blue-500 font-bold"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tombol Titik 3 di Ujung Kanan untuk Membuka Semua Genre */}
          <div className="relative flex-shrink-0 py-2.5" ref={menuRef}>
            <button
              type="button"
              onClick={() => setGenreMenuOpen(!genreMenuOpen)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                genreMenuOpen
                  ? "bg-blue-500 text-white border-blue-500 shadow-blue-500/20"
                  : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-500 dark:hover:text-white"
              }`}
              title="Pilih Genre Lainnya"
              aria-label="Pilih Genre Lainnya"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Pilih Genre</span>
            </button>

            {/* Popover / Dropdown Menu Pilihan Genre */}
            {genreMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 shadow-2xl p-4 z-50 animate-fade-in flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
                  <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Semua Genre
                  </span>
                  <button
                    type="button"
                    onClick={() => setGenreMenuOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Input Pencarian Genre Cepat */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={genreSearch}
                    onChange={(e) => setGenreSearch(e.target.value)}
                    placeholder="Cari genre..."
                    className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Grid Pilihan Genre */}
                <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto p-0.5">
                  {filteredCategories.map((cat) => {
                    const isSelected = activeId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(cat.id);
                          setGenreMenuOpen(false);
                          setGenreSearch("");
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-blue-500 text-white shadow-sm"
                            : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-blue-500 dark:hover:text-white"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                      </button>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <div className="col-span-2 py-4 text-center text-xs text-gray-400 dark:text-slate-500">
                      Genre tidak ditemukan
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Konten Daftar Buku ── */}
      <div className="px-6 md:px-12 lg:px-16 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="text-gray-900 dark:text-white text-sm font-bold">
            {bookType && (
              <span className="mr-2 font-normal text-gray-500 dark:text-slate-400 capitalize">
                {bookType} ·
              </span>
            )}
            {data?.meta.total ?? 0}{" "}
            <span className="text-gray-500 dark:text-slate-400 font-normal">serial</span>
          </div>

          <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
            {sortOptions.map((option, index) => (
              <div key={option.key} className="flex items-center">
                <button
                  onClick={() => setSortBy(option.key)}
                  className={`transition-colors ${
                    sortBy === option.key
                      ? "text-blue-500 font-medium"
                      : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  {option.label}
                </button>
                {index < sortOptions.length - 1 && (
                  <span className="mx-2 text-gray-300 dark:text-white/20">|</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <DataState
          loading={loading}
          error={error}
          empty={!loading && !error && books.length === 0}
          emptyText="Belum ada karya di kategori ini."
        />
        <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4 xl:grid-cols-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}
