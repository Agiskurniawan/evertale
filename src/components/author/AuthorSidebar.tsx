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
    <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-white dark:border-white/10 dark:bg-[#0D1526] transition-colors duration-300 hidden md:flex flex-col py-6 px-4 gap-6">
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
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-full">
          {username}
        </p>
      </div>

      {/* Tombol Buat Serial */}
      <Link
        to="/author/buat-serial"
        className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 active:scale-[0.97] transition-all shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Buat Serial
      </Link>

      {/* Menu Navigasi */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = currentTab === key;

          if (onTabChange) {
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left w-full ${
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full ${
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
  );
}
