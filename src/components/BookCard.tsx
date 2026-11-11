import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Book } from "../types";
import { assetUrl } from "../lib/api";

type BookCardProps = {
  book: Book;
};

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link to={`/baca/${book.id}`} className="group cursor-pointer block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-xl dark:border-white/5 dark:bg-[#0B1220] dark:hover:border-white/20 dark:hover:shadow-2xl dark:hover:shadow-blue-500/10">
      <div className="relative aspect-3/4 overflow-hidden">
        <img
          src={assetUrl(book.cover)}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-white">{book.rating}</span>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-500 dark:text-white dark:group-hover:text-blue-400">
          {book.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-700 dark:bg-white/5 dark:text-slate-300">
            {book.genre}
          </span>
          <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-slate-600" />
          <span><span className="font-semibold text-gray-900 dark:text-white">{book.readers}</span> pembaca</span>
        </div>
      </div>
    </Link>
  );
}
