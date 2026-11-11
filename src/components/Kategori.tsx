import { useState } from "react";
import BookCard from "./BookCard";
import DataState from "./DataState";
import { useFetch } from "../hooks/useFetch";
import { api } from "../lib/api";
import type { BookList, Category } from "../types";

export default function Kategori() {
    const [activeId, setActiveId] = useState<number | null>(null); // null = Semua

    const { data: categories } = useFetch(() => api.get<{ data: Category[] }>("/categories").then((r) => r.data.data), []);
    const { data, loading, error } = useFetch(
        () =>
            api
                .get<BookList>("/books", { params: { category: activeId ?? undefined, sort: "popular", limit: 8 } })
                .then((r) => r.data),
        [activeId]
    );
    const books = data?.data ?? [];
    
    return (
    <section className="w-full bg-gray-50 py-16 md:py-20 transition-colors duration-300 dark:bg-[#080D18]">
        <div className="w-full px-6 md:px-12 lg:px-16">      
        <div className="mb-8">
            <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold tracking-[0.15em] text-blue-500 uppercase">
            <span>Sesuai Seleramu</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl lg:text-4xl dark:text-white">Kategori Populer</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-10">
            {[{ id: null, name: "Semua" }, ...(categories ?? [])].map((category) => (
            <button
            key={category.id ?? "semua"}
            onClick={() => setActiveId(category.id)}
            className={`rounded-full px-6 py-2 text-sm font-medium uppercase transition-all duration-300 ${
                activeId === category.id
                ? "bg-blue-500 text-white shadow-sm"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
            }`}
            >
            {category.name}
            </button>
        ))}
        </div>

        <DataState loading={loading} error={error} empty={!loading && !error && books.length === 0} emptyText="Belum ada karya di kategori ini." />
        <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4">
        {books.map((book) => (
            <BookCard key={book.id} book={book} />
        ))}
        </div>


    </div>
    </section>
);
}