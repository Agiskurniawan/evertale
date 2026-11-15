import { useState } from "react";
import { Flame, Trophy } from "lucide-react";
import BookCard from "./BookCard";
import DataState from "./DataState";
import { useFetch } from "../hooks/useFetch";
import { api } from "../lib/api";
import type { BookList } from "../types";

export default function Populer() {
  const [activeTab, setActiveTab] = useState<"Trending" | "Populer">("Trending");

  // Trending = disort berdasarkan view_count, Populer = disort berdasarkan reader_count
  const { data, loading, error } = useFetch(
    () =>
      api
        .get<BookList>("/books", {
          params: { sort: activeTab === "Trending" ? "trending" : "popular", limit: 4 },
        })
        .then((r) => r.data),
    [activeTab]
  );
  const books = data?.data ?? [];

  return (
    <section className="w-full bg-[#D5DBE2] py-12 md:py-16 transition-colors duration-300 dark:bg-[#080D18]">
      <div className="w-full px-6 md:px-12 lg:px-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3 text-xs font-bold tracking-[0.15em] text-blue-500 dark:text-blue-400 uppercase">
              <span>Paling Banyak Dibaca</span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white">
              Temukan Kisah Berikutnya
            </h2>
            <p className="mt-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
              {activeTab === "Trending"
                ? "Cerita yang paling banyak ditonton dan sedang hangat diperbincangkan"
                : "Cerita terfavorit dengan jumlah pembaca aktif terbanyak"}
            </p>
          </div>

          <div className="flex items-center rounded-2xl bg-gray-300/70 p-1 border border-gray-300 dark:bg-[#0B1220] dark:border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("Trending")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === "Trending"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
              }`}
            >
              <Flame className={`h-4 w-4 ${activeTab === "Trending" ? "text-amber-300 fill-amber-300" : ""}`} />
              <span>Trending</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("Populer")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === "Populer"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
              }`}
            >
              <Trophy className={`h-4 w-4 ${activeTab === "Populer" ? "text-amber-300 fill-amber-300" : ""}`} />
              <span>Populer</span>
            </button>
          </div>
        </div>

        <DataState
          loading={loading}
          error={error}
          empty={!loading && !error && books.length === 0}
          emptyText="Belum ada karya untuk kategori ini."
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
