import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Book } from "../types";
import { assetUrl } from "../lib/api";

type BookCardProps = {
  book: Book;
};

export default function BookCard({ book }: BookCardProps) {
  const isComic = book.type === "komik";

  return (
    <Link
      to={`/baca/${book.id}`}
      className="group cursor-pointer block overflow-hidden rounded-2xl border border-gray-300/80 bg-[#ECEFF2] transition-all duration-300 hover:border-blue-400 hover:bg-[#D8DCE1] hover:shadow-xl dark:border-white/5 dark:bg-[#0B1220] dark:hover:bg-[#131D30] dark:hover:border-white/20 dark:hover:shadow-2xl dark:hover:shadow-blue-500/10"
    >
      <div className="relative aspect-3/4 overflow-hidden">
        <img
          src={assetUrl(book.cover)}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge Tipe: KOMIK / NOVEL di Kiri Atas (Sesuai Referensi Gambar) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-white shadow-md backdrop-blur-sm ${
              isComic
                ? "bg-[#FF4D6D] shadow-rose-500/30"
                : "bg-blue-600 shadow-blue-600/30"
            }`}
          >
            {isComic ? "KOMIK" : "NOVEL"}
          </span>
        </div>

        {/* Rating di Kanan Atas */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm z-10">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-white">{book.rating}</span>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <h3 className="line-clamp-1 text-base md:text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {book.title}
        </h3>
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          <span
            className={`rounded-md px-2 py-0.5 font-bold ${
              isComic
                ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
            }`}
          >
            {isComic ? "Komik" : "Novel"}
          </span>
          <span className="rounded-md bg-[#DFE4EA] px-2 py-0.5 text-gray-700 dark:bg-white/5 dark:text-slate-300 font-semibold">
            {book.genre}
          </span>
          <span className="h-1 w-1 rounded-full bg-gray-400 dark:bg-slate-600" />
          <span>
            <span className="font-bold text-gray-900 dark:text-white">{book.readers}</span> pembaca
          </span>
        </div>
      </div>
    </Link>
  );
}
