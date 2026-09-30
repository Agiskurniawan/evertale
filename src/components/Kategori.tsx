import { useState } from "react";
import BookCard from "./BookCard";
import { books } from "../data/books";
import { categories } from "../data/categories";

export default function Kategori() {
    const [activeCategory, setActiveCategory] = useState("Semua");
    
    return (
    <section className="w-full bg-[#080D18] py-16 md:py-20">
        <div className="w-full px-6 md:px-12 lg:px-16">      
        <div className="mb-8">
            <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold tracking-[0.15em] text-blue-500 uppercase">
            <span>Sesuai Seleramu</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">Kategori Populer</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-10">
            {categories.map((category) => (
            <button
            key={category.id}
            onClick={() => setActiveCategory(category.name)}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${
                activeCategory === category.name
                ? "bg-[#3B82F6] text-white"
                : "border border-white/20 bg-transparent text-white hover:bg-white/10"
            }`}
            >
            {category.name}
            </button>
        ))}
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