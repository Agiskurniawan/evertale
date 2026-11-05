import { useState } from "react";
import { Heart, User } from "lucide-react";
import { Link } from "react-router-dom";
import BookCard from "../components/BookCard";
import DataState from "../components/DataState";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { api } from "../lib/api";
import type { Book, Kreator } from "../types";

type Tab = "akun" | "kreator";

export default function Favorit() {
  const [tab, setTab] = useState<Tab>("akun");
  const { isLoggedIn, loading: authLoading } = useAuth();

  const books = useFetch(
    () => api.get<{ data: Book[] }>("/favorites/books").then((r) => r.data.data),
    [isLoggedIn],
    isLoggedIn
  );
  const kreators = useFetch(
    () => api.get<{ data: Kreator[] }>("/favorites/authors").then((r) => r.data.data),
    [isLoggedIn],
    isLoggedIn
  );
  const favBooks = books.data ?? [];
  const favKreator = kreators.data ?? [];

  if (authLoading) return <DataState loading />;
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-slate-400">Login dulu untuk melihat favoritmu.</p>
        <Link to="/login" className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-400">
          Login / Register
        </Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "akun", label: "Favorit Akun" },
    { key: "kreator", label: "Favorit Kreator" },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)]">

      {/* ── Tab bar ── */}
      <div className="border-b border-white/10 bg-[#0B1220] sticky top-[72px] z-10">
        <div className="flex gap-0 px-4 md:px-12 lg:px-16">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative py-4 px-6 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Konten ── */}
      <div className="px-4 py-8 md:px-12 lg:px-16">
        <div>

          {/* Tab: Favorit Akun */}
          {tab === "akun" && books.loading && <DataState loading />}
          {tab === "akun" && books.error && <DataState error={books.error} />}
          {tab === "akun" && !books.loading && !books.error && (
            favBooks.length === 0 ? (
              <EmptyState
                icon={<Heart className="h-12 w-12 opacity-20 text-slate-400" />}
                title="Favorit Kosong"
                desc="Tambahkan webtoon ORIGINAL atau CANVAS favoritmu dan dapatkan notifikasi setiap ada episode baru."
              />
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                  {favBooks.length} Serial Tersimpan
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {favBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )
          )}

          {/* Tab: Favorit Kreator */}
          {tab === "kreator" && kreators.loading && <DataState loading />}
          {tab === "kreator" && kreators.error && <DataState error={kreators.error} />}
          {tab === "kreator" && !kreators.loading && !kreators.error && (
            favKreator.length === 0 ? (
              <EmptyState
                icon={<User className="h-12 w-12 opacity-20 text-slate-400" />}
                title="Belum Ada Kreator Favorit"
                desc="Ikuti kreator favoritmu dan lihat karya terbaru mereka di sini."
              />
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                  {favKreator.length} Kreator Diikuti
                </p>
                <div className="flex flex-col gap-3">
                  {favKreator.map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#101726] border border-white/10 hover:border-blue-500/30 hover:bg-[#121d30] transition-all duration-200 group"
                    >
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/60 transition-colors">
                        <User className="h-5 w-5 text-blue-400" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{k.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{k.genre}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{k.works} karya · {k.followers} pengikut</p>
                      </div>

                      {/* Tombol Lihat */}
                      <Link
                        to={`/author`}
                        className="flex-shrink-0 text-xs font-semibold text-blue-400 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50 px-4 py-2 rounded-xl transition-all duration-200 active:scale-95"
                      >
                        Lihat
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}

// ── Komponen empty state ──────────────────────────────────────
function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-base font-semibold text-white mt-2">{title}</p>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{desc}</p>
    </div>
  );
}
