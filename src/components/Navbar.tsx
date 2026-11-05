import { useState, useRef, useEffect } from "react";
import { Search, Bell, Moon, ChevronDown, User, X, BookOpen } from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { navLinks } from "../data/navLinks";
import { useAuth } from "../context/AuthContext";
import { api, assetUrl } from "../lib/api";
import type { Book } from "../types";

export default function Navbar() {
  const { isLoggedIn, isAuthor, username, logout } = useAuth();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Pencarian ke backend (judul atau genre), ditunda 250ms supaya tidak spam server
  const [found, setFound] = useState<{ q: string; items: Book[] }>({ q: "", items: [] });
  const trimmed = query.trim();
  const searching = trimmed.length > 0 && found.q !== trimmed;
  const results = trimmed.length > 0 && found.q === trimmed ? found.items : [];

  useEffect(() => {
    if (!trimmed) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      api
        .get<{ data: Book[] }>("/books", { params: { q: trimmed, limit: 8 } })
        .then((res) => !cancelled && setFound({ q: trimmed, items: res.data.data }))
        .catch(() => !cancelled && setFound({ q: trimmed, items: [] }));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);

  // Fokus input saat search dibuka
  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  const handleResultClick = (id: number) => {
    navigate(`/baca/${id}`);
    setSearchOpen(false);
    setQuery("");
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0B1220]/90 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-7 md:px-12 lg:px-16">

          {/* Kiri: Logo + Nav */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Ever<span className="text-blue-400">Tale</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-10 md:flex">
              {navLinks.map((link) =>
                link.label === "Kategori" ? (
                  <div key={link.path} className="relative group py-2">
                    <NavLink
                      to={link.path}
                      className="text text-slate-300 transition-colors hover:text-white flex items-center gap-1"
                    >
                      {link.label}
                      <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                    </NavLink>
                    <div className="absolute left-0 top-full mt-1 w-36 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="rounded-lg bg-[#0B1220] border border-white/10 shadow-xl overflow-hidden flex flex-col py-2">
                        <Link to="/kategori/novel" className="px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">Novel</Link>
                        <Link to="/kategori/komik" className="px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">Komik</Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <NavLink key={link.path} to={link.path} className="text text-slate-300 transition-colors hover:text-white">
                    {link.label}
                  </NavLink>
                )
              )}
            </nav>
          </div>

          {/* Kanan: Aksi */}
          <div className="flex items-center gap-3">

            {/* Tombol Search */}
            <button
              aria-label="Cari"
              onClick={() => setSearchOpen(true)}
              className="text-slate-300 transition-colors hover:text-white"
            >
              <Search className="h-5 w-5" />
            </button>

            <button aria-label="Notifikasi" className="text-slate-300 transition-colors hover:text-white">
              <Bell className="h-5 w-5" />
            </button>

            <button aria-label="Ganti tema" className="text-slate-300 transition-colors hover:text-white">
              <Moon className="h-5 w-5" />
            </button>

            {/* Pill Dashboard — muncul jika sudah daftar author */}
            {isLoggedIn && isAuthor && (
              <Link
                to="/author"
                aria-label="Author Dashboard"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:brightness-110 active:scale-[0.97] transition-all duration-200"
              >
                {/* Titik hijau online indicator */}
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                Dashboard
              </Link>
            )}

            {/* Avatar / Login */}
            {isLoggedIn ? (
              <div className="relative group">
                <Link
                  to="/profil"
                  className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors cursor-pointer overflow-hidden shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                >
                  <User className="h-5 w-5" />
                </Link>

                <div className="absolute right-0 top-full mt-3 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="rounded-xl bg-[#131B2B] border border-white/10 shadow-2xl overflow-hidden flex flex-col py-1.5">
                    <div className="px-4 py-2 border-b border-white/10 mb-1">
                      <p className="text-sm font-semibold text-white">{username}</p>
                      <p className="text-xs text-slate-500">Lihat profil</p>
                    </div>
                    <Link to="/profil" className="px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors mx-1.5 rounded-lg">
                      Profil Saya
                    </Link>
                    <button
                      onClick={logout}
                      className="px-4 py-2 text-sm text-left text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors mx-1.5 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="rounded-2xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
              >
                Login / Register
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={(e) => e.target === e.currentTarget && closeSearch()}
        >
          <div className="w-full max-w-lg bg-[#101726] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search className="h-5 w-5 text-slate-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                  if (e.key === "Enter" && results.length > 0) {
                    handleResultClick(results[0].id);
                  }
                }}
                placeholder="Cari judul, genre..."
                className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-600 focus:outline-none"
              />
              <button onClick={closeSearch} className="text-slate-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Hasil */}
            {query.trim().length > 0 && (
              <div className="max-h-72 overflow-y-auto">
                {searching ? (
                  <div className="py-10 text-center text-sm text-slate-500">Mencari...</div>
                ) : results.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-slate-600">
                    <BookOpen className="h-7 w-7 opacity-40" />
                    <p className="text-sm">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
                  </div>
                ) : (
                  results.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleResultClick(book.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                    >
                      <img src={assetUrl(book.cover)} alt={book.title} className="h-10 w-7 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{book.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{book.genre} · ⭐ {book.rating}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Hint saat kosong */}
            {query.trim().length === 0 && (
              <div className="px-4 py-4 text-xs text-slate-600">
                Ketik judul atau genre untuk mulai mencari...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}