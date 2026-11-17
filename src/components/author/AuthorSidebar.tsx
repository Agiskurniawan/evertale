import { Link, useSearchParams, useLocation } from "react-router-dom";
import { BookOpen, BarChart2, MessageSquare, User, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { assetUrl } from "../../lib/api";

interface AuthorSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const NAV_ITEMS = [
  { key: "serial", label: "Serial", icon: BookOpen },
  { key: "analisis", label: "Analisis", icon: BarChart2 },
  { key: "komentar", label: "Komentar", icon: MessageSquare },
];

export default function AuthorSidebar({ activeTab, onTabChange }: AuthorSidebarProps) {
  const { user, username } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Tentukan tab aktif jika tidak diberikan via props
  const currentTab =
    activeTab ||
    searchParams.get("tab") ||
    (location.pathname === "/author/buat-serial"
      ? "serial"
      : location.pathname.startsWith("/author/karya")
      ? "serial"
      : location.pathname.startsWith("/author/tulis")
      ? "serial"
      : "serial");

  return (
    <>
      {/* ── Top Bar untuk Layar Mobile & Tablet (< lg) ── */}
      <div className="w-full bg-white dark:bg-[#0D1526] border-b border-gray-200 dark:border-white/10 px-4 py-3 flex flex-col gap-2.5 lg:hidden transition-colors shadow-xs">
        {/* Baris Atas: Info Profil Singkat & Tombol Aksi Utama */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-blue-500/10 border border-blue-500/30 dark:bg-blue-500/20 dark:border-blue-500/40 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.avatar_url ? (
                <img
                  src={assetUrl(user.avatar_url)}
                  alt={username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[130px] sm:max-w-[220px]">
                  {username}
                </p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                  Author
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Buat Serial / Dashboard */}
          {location.pathname === "/author/buat-serial" ? (
            <Link
              to="/author"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-white px-3.5 py-2 text-xs font-semibold active:scale-95 transition-all shadow-xs"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Daftar Serial</span>
            </Link>
          ) : (
            <Link
              to="/author/buat-serial"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white px-3.5 py-2 text-xs font-semibold active:scale-95 transition-all shadow-sm shadow-blue-500/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Buat Serial</span>
            </Link>
          )}
        </div>

        {/* Baris Bawah: Tab Navigasi (Serial, Analisis, Komentar) */}
        <nav className="flex items-center gap-1 bg-gray-100 dark:bg-[#080D1A] p-1 rounded-xl">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const isActive = currentTab === key;

            if (onTabChange) {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onTabChange(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white text-blue-600 font-bold shadow-xs dark:bg-[#131D33] dark:text-blue-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              );
            }

            return (
              <Link
                key={key}
                to={`/author?tab=${key}`}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-blue-600 font-bold shadow-xs dark:bg-[#131D33] dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Sidebar Vertikal untuk Layar Desktop (>= lg) ── */}
      <aside className="w-56 lg:w-60 flex-shrink-0 border-r border-gray-200 bg-white dark:border-white/10 dark:bg-[#0D1526] transition-colors duration-300 hidden lg:flex flex-col py-6 px-4 gap-6 sticky top-0 h-fit min-h-[calc(100vh-72px)]">
        {/* Profil Author */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full bg-blue-500/10 border-2 border-blue-500/30 dark:bg-blue-500/20 dark:border-blue-500/40 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.avatar_url ? (
              <img
                src={assetUrl(user.avatar_url)}
                alt={username}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-7 w-7 text-blue-500 dark:text-blue-400" />
            )}
          </div>
          <div className="text-center w-full">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-full">
              {username}
            </p>
            <span className="text-[11px] text-blue-500 font-medium">Author</span>
          </div>
        </div>

        {/* Tombol Buat Serial */}
        <Link
          to="/author/buat-serial"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 py-2.5 px-4 text-sm font-semibold text-white hover:bg-blue-400 active:scale-[0.97] transition-all shadow-sm shadow-blue-500/25"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Serial</span>
        </Link>

        {/* Menu Navigasi */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const isActive = currentTab === key;

            if (onTabChange) {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onTabChange(key)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left w-full ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/15 dark:text-blue-400"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              );
            }

            return (
              <Link
                key={key}
                to={`/author?tab=${key}`}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors w-full ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/15 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
