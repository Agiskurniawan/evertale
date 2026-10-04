import { useState } from "react";
import BookCard from "../components/BookCard";
import { books } from "../data/books";

export default function Original() {
  const [activeDay, setActiveDay] = useState("SAB");
  const [sortBy, setSortBy] = useState("Popularitas");

  const days = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN",];
  const sortOptions = ["Popularitas", "Berdasarkan Jumlah Like", "Berdasarkan Tanggal"];

  return (
    <div className="min-h-screen bg-[#0B1220] pb-20">
      <div className="border-b border-white/5 bg-[#0B1220]">
        <div className="px-6 md:px-12 lg:px-16 overflow-x-auto">
          <div className="flex items-center gap-8 md:gap-12 w-full max-w-5xl">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`py-4 text-xs md:text-sm whitespace-nowrap border-b-[3px] transition-all hover:text-white ${
                  activeDay === day
                    ? "border-blue-500 text-blue-500 font-bold"
                    : "border-transparent text-slate-400 font-semibold hover:border-slate-400"
                }`}
              >
                {day}
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
