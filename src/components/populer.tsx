import { useState } from "react";
import BookCard from "./BookCard";
import DataState from "./DataState";
import { useFetch } from "../hooks/useFetch";
import { api } from "../lib/api";
import type { BookList } from "../types";

export default function Populer() {
  const [activeTab, setActiveTab] = useState("Trending");

  // Trending = paling banyak dibuka, Populer = paling banyak pembaca
  const { data, loading, error } = useFetch(
    () =>
      api
        .get<BookList>("/books", { params: { sort: activeTab === "Trending" ? "trending" : "popular", limit: 4 } })
        .then((r) => r.data),
    [activeTab]
  );
  const books = data?.data ?? [];

  return (
    <section className="w-full bg-gray-100 py-10 md:py-16 transition-colors duration-300 dark:bg-[#080D18]">
      <div className="w-full px-6 md:px-12 lg:px-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3 text-xs font-bold tracking-[0.15em] text-blue-500 dark:text-blue-400 uppercase">
              <span>Paling Banyak Dibaca</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white">
              Temukan Kisah Berikutnya
            </h2>
          </div>
          
          <div className="flex items-center rounded-xl bg-gray-200 p-1 border border-gray-300 dark:bg-[#0B1220] dark:border-white/5">
            <button
              onClick={() => setActiveTab("Trending")}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeTab === "Trending"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-300/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
              }`}>
              Trending
            </button>
            <button
              onClick={() => setActiveTab("Populer")}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeTab === "Populer"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-300/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
              }`}
            >
              Populer
            </button>
          </div>
        </div>

        <DataState loading={loading} error={error} empty={!loading && !error && books.length === 0} emptyText="Belum ada karya." />
        <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}
