import { useState } from "react";
import { useParams } from "react-router-dom";
import BookCard from "../components/BookCard";
import { books } from "../data/books";
import { categories } from "../data/categories";

export default function KategoriDetail() {
  useParams<{ type: string }>();
  const [activeCategory, setActiveCategory] = useState("DRAMA");
  const [sortBy, setSortBy] = useState("Popularitas");

  const sortOptions = ["Popularitas", "Berdasarkan Jumlah Like", "Berdasarkan Tanggal"];

  return (
    <div className="min-h-screen bg-[#0B1220] pb-20">
      <div className="border-b border-white/5 bg-[#0B1220]">
        <div className="px-6 md:px-12 lg:px-16 overflow-x-auto">
          <div className="flex space-x-6 md:space-x-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.name)}
                className={`py-4 text-xs md:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeCategory === category.name
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-16 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="text-white text-sm font-bold">
            {books.length} <span className="text-slate-400 font-normal">serial</span>
          </div>

          <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
            {sortOptions.map((option, index) => (
              <div key={option} className="flex items-center">
                <button
                  onClick={() => setSortBy(option)}
                  className={`transition-colors ${
                    sortBy === option ? "text-blue-500 font-medium" : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {option}
                </button>
                {index < sortOptions.length - 1 && (
                  <span className="mx-2 text-white/20">|</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4 xl:grid-cols-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}
