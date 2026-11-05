import BookCard from "./BookCard";
import DataState from "./DataState";
import { useFetch } from "../hooks/useFetch";
import { api } from "../lib/api";
import type { BookList } from "../types";

export default function Buku() {
    const { data, loading, error } = useFetch(
        () => api.get<BookList>("/books", { params: { sort: "rating", limit: 4 } }).then((r) => r.data),
        []
    );
    const books = data?.data ?? [];

    return (
    <section className="min-h-screen w-full bg-[#080D18] py-16 md:py-20">
    <div className="w-full px-6 md:px-12 lg:px-16">
        <div className="mb-10">
            <div className="flex items-center gap-3 text-xs font-bold tracking-[0.15em] text-blue-400 uppercase">
                <span>Pilihan Spesial</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">Rekomendasi untuk Kamu</h2>
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
