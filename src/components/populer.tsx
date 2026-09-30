import { useState } from "react";
import BookCard from "./BookCard";
import { books } from "../data/books";

export default function Populer() {
  const [activeTab, setActiveTab] = useState("Trending");

  return (
    <section className="w-full bg-[#080D18] py-10 md:py-16">
      <div className="w-full px-6 md:px-12 lg:px-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3 text-xs font-bold tracking-[0.15em] text-blue-400 uppercase">
              <span>Paling Banyak Dibaca</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Temukan Kisah Berikutnya
            </h2>
          </div>
          
          <div className="flex items-center rounded-xl bg-[#0B1220] p-1 border border-white/5">
            <button
              onClick={() => setActiveTab("Trending")}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeTab === "Trending"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
              Trending
            </button>
            <button
              onClick={() => setActiveTab("Populer")}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeTab === "Populer"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Populer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}
