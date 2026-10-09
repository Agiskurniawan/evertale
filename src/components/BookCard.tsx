import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Book } from "../data/books";

type BookCardProps = {
  book: Book;
};

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link to={`/baca/${book.id}`} className="group cursor-pointer block overflow-hidden rounded-2xl border border-white/5 bg-[#0B1220] transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10">
      <div className="relative aspect-3/4 overflow-hidden">
        <img
          src={book.cover}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-white">{book.rating}</span>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-white transition-colors group-hover:text-blue-400">
          {book.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
          <span className="rounded-md bg-white/5 px-2 py-1 text-slate-300">
            {book.genre}
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span><span className="text-white">{book.readers}</span> pembaca</span>
        </div>
      </div>
    </Link>
  );
}
