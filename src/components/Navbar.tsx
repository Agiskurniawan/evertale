import { useState, useRef, useEffect } from "react";
import {
  Search, Bell, Moon, Sun, ChevronDown, User, X, BookOpen,
  MoreVertical, Compass, BookMarked, History, Heart, LayoutDashboard,
  MessageSquare, BookHeart, Check,
} from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { navLinks } from "../data/navLinks";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api, assetUrl } from "../lib/api";
import type { Book } from "../types";

// ─── Tipe Notifikasi ────────────────────────────────────────────
type NotifKind = "update" | "reply";

interface Notif {
  id: number;
  kind: NotifKind;
  message: string;
  link: string;
  read: boolean;
  time: string;
}

// Ambil notifikasi dari backend
async function fetchNotifications(): Promise<Notif[]> {
  try {
    const res = await api.get<{ data: Notif[] }>("/notifications");
    return res.data.data ?? [];
  } catch {
    return [];
  }
}

// Tandai semua notifikasi sudah dibaca
async function markAllRead(): Promise<void> {
  try {
    await api.post("/notifications/read-all");
  } catch {
    // abaikan jika endpoint belum siap
  }
}

export default function Navbar() {
  const { isLoggedIn, isAuthor, username, user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Notifikasi ────────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchNotifications().then(setNotifs);
  }, [isLoggedIn]);

  // Tutup popover saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const handleOpenNotif = async () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen && unreadCount > 0) {
      await markAllRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleNotifClick = (link: string) => {
    navigate(link);
    setNotifOpen(false);
  };

  // ── Pencarian ─────────────────────────────────────────────────
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
      <header className="sticky top-0 z-50 w-full border-b border-gray-300 bg-[#DFE3E8]/95 backdrop-blur dark:border-white/5 dark:bg-[#0B1220]/90 transition-colors duration-300">
        <div className="flex items-center justify-between px-6 py-6 md:px-12 lg:px-16">

          {/* Kiri: Logo + Navigasi */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ever<span className="text-blue-500">Tale</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-10 md:flex">
              {navLinks.map((link) =>
                link.label === "Kategori" ? (
                  <div key={link.path} className="relative group py-2">
                    <NavLink
                      to={link.path}
                      className="text text-gray-600 transition-colors hover:text-gray-900 dark:text-slate-300 dark:hover:text-white flex items-center gap-1"
                    >
                      {link.label}
                      <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                    </NavLink>
                    <div className="absolute left-0 top-full mt-1 w-36 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="rounded-xl bg-white border border-gray-200 shadow-xl overflow-hidden flex flex-col py-2 dark:bg-[#0B1220] dark:border-white/10">
                        <Link to="/kategori/novel" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors">Novel</Link>
                        <Link to="/kategori/komik" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors">Komik</Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <NavLink key={link.path} to={link.path} className="text text-gray-600 transition-colors hover:text-gray-900 dark:text-slate-300 dark:hover:text-white">
                    {link.label}
                  </NavLink>
                )
              )}
            </nav>
          </div>

          {/* Kanan: Tombol Aksi */}
          <div className="flex items-center gap-3">

            {/* Search */}
            <button
              aria-label="Cari"
              onClick={() => setSearchOpen(true)}
              className="text-gray-600 transition-colors hover:text-gray-900 dark:text-slate-300 dark:hover:text-white p-1.5"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* ── Lonceng Notifikasi ── */}
            <div className="relative" ref={notifRef}>
              <button
                aria-label="Notifikasi"
                onClick={handleOpenNotif}
                className="relative text-gray-600 transition-colors hover:text-gray-900 dark:text-slate-300 dark:hover:text-white p-1.5"
              >
                <Bell className="h-5 w-5" />
                {/* Badge belum dibaca */}
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Popover Notifikasi */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#101726] border border-gray-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Notifikasi</span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Daftar Notifikasi */}
                  <div className="max-h-80 overflow-y-auto">
                    {!isLoggedIn ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                        <Bell className="h-7 w-7 text-gray-300 dark:text-slate-600 mb-2" />
                        <p className="text-xs text-gray-500 dark:text-slate-500">
                          Masuk untuk melihat notifikasi Anda.
                        </p>
                      </div>
                    ) : notifs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                        <Bell className="h-7 w-7 text-gray-300 dark:text-slate-600 mb-2" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                          Belum ada notifikasi
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-500">
                          Favorit serial dan aktifkan notifikasi untuk mendapat update bab terbaru.
                        </p>
                      </div>
                    ) : (
                      notifs.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => handleNotifClick(n.link)}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-white/5 last:border-0 ${
                            n.read
                              ? "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                              : "bg-blue-50/60 dark:bg-blue-500/5 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                          }`}
                        >
                          {/* Ikon jenis notif */}
                          <div className={`mt-0.5 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            n.kind === "reply"
                              ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          }`}>
                            {n.kind === "reply"
                              ? <MessageSquare className="h-4 w-4" />
                              : <BookHeart className="h-4 w-4" />
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${n.read ? "text-gray-700 dark:text-slate-300" : "text-gray-900 dark:text-white font-medium"}`}>
                              {n.message}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                          </div>

                          {/* Titik biru tanda belum dibaca */}
                          {!n.read && (
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Footer — tandai semua dibaca */}
                  {isLoggedIn && notifs.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/10">
                      <button
                        type="button"
                        onClick={async () => {
                          await markAllRead();
                          setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
                        }}
                        className="text-xs text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Tandai semua sudah dibaca
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tombol Ganti Tema (Gelap/Terang) */}
            <button
              type="button"
              aria-label="Ganti tema"
              onClick={toggleDarkMode}
              className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              title={darkMode ? "Mode Gelap (Aktif)" : "Mode Terang (Aktif)"}
            >
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Pill Dashboard Author — hanya desktop */}
            {isLoggedIn && isAuthor && (
              <Link
                to="/author"
                aria-label="Author Dashboard"
                className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:brightness-110 active:scale-[0.97] transition-all duration-200"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                Dashboard
              </Link>
            )}

            {/* Avatar / Tombol Masuk */}
            {isLoggedIn ? (
              <div className="relative group">
                <Link
                  to="/profil"
                  className="h-10 w-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-white hover:border-blue-400 transition-colors cursor-pointer overflow-hidden shadow-lg shadow-blue-500/10 active:scale-[0.98]"
                >
                  {user?.avatar_url ? (
                    <img src={assetUrl(user.avatar_url)} alt={username} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-blue-400" />
                  )}
                </Link>

                <div className="absolute right-0 top-full mt-3 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="rounded-xl bg-white border border-gray-200 shadow-2xl overflow-hidden flex flex-col py-1.5 dark:bg-[#131B2B] dark:border-white/10">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10 mb-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{username}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">Lihat profil</p>
                    </div>
                    <Link to="/profil" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors mx-1.5 rounded-lg">Profil Saya</Link>
                    <Link to="/favorit" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors mx-1.5 rounded-lg">Favorit Saya</Link>
                    <button
                      onClick={logout}
                      className="px-4 py-2 text-sm text-left text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-white/5 dark:hover:text-red-300 transition-colors mx-1.5 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="rounded-xl bg-blue-500 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-blue-400 shadow-sm"
              >
                Masuk
              </NavLink>
            )}

            {/* Tombol Menu Mobile (titik tiga) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl border transition-all active:scale-95 ${
                mobileMenuOpen
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-200/80 border-gray-300 text-gray-700 hover:bg-gray-300 dark:bg-white/5 dark:border-white/10 dark:text-white"
              }`}
              aria-label="Menu navigasi mobile"
              title="Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <MoreVertical className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Menu Mobile Dropdown ── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-300 dark:border-white/10 bg-[#DFE3E8] dark:bg-[#0E1626] px-6 py-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1.5">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`
                }
              >
                <Compass className="h-4 w-4" />
                <span>Beranda</span>
              </NavLink>

              <NavLink
                to="/original"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`
                }
              >
                <BookMarked className="h-4 w-4" />
                <span>Original</span>
              </NavLink>

              {/* Sub-menu Kategori */}
              <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mt-2">
                Pilih Kategori
              </div>
              <div className="grid grid-cols-2 gap-2 pl-2">
                <Link
                  to="/kategori/novel"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/70 dark:bg-white/5 border border-gray-300/70 dark:border-white/10 text-gray-800 dark:text-white text-center hover:border-blue-400 transition-colors"
                >
                  📖 Kategori Novel
                </Link>
                <Link
                  to="/kategori/komik"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/70 dark:bg-white/5 border border-gray-300/70 dark:border-white/10 text-gray-800 dark:text-white text-center hover:border-blue-400 transition-colors"
                >
                  🎨 Kategori Komik
                </Link>
              </div>

              <NavLink
                to="/riwayat"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors mt-2 ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`
                }
              >
                <History className="h-4 w-4" />
                <span>Riwayat Baca</span>
              </NavLink>

              <NavLink
                to="/favorit"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`
                }
              >
                <Heart className="h-4 w-4" />
                <span>Favorit & Kreator</span>
              </NavLink>

              {isLoggedIn && isAuthor && (
                <Link
                  to="/author"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white mt-1 shadow-md shadow-blue-500/20"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard Author</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={(e) => e.target === e.currentTarget && closeSearch()}
        >
          <div className="w-full max-w-lg bg-white dark:bg-[#101726] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden">

            {/* Input Pencarian */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <Search className="h-5 w-5 text-gray-400 dark:text-slate-500 flex-shrink-0" />
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
                className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none"
              />
              <button onClick={closeSearch} className="text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Hasil */}
            {query.trim().length > 0 && (
              <div className="max-h-72 overflow-y-auto">
                {searching ? (
                  <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-500">Mencari...</div>
                ) : results.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-gray-500 dark:text-slate-600">
                    <BookOpen className="h-7 w-7 opacity-40" />
                    <p className="text-sm">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
                  </div>
                ) : (
                  results.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleResultClick(book.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left border-b border-gray-100 dark:border-white/5 last:border-0"
                    >
                      <img src={assetUrl(book.cover)} alt={book.title} className="h-10 w-7 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{book.title}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">{book.genre} · ⭐ {book.rating}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Hint saat kolom kosong */}
            {query.trim().length === 0 && (
              <div className="px-4 py-4 text-xs text-gray-500 dark:text-slate-600">
                Ketik judul atau genre untuk mulai mencari...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
