import { useNavigate, Link, Navigate } from "react-router-dom";
import { Crown, Settings, Heart, PenLine, LogOut, Camera, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage, assetUrl } from "../lib/api";

export default function Profil() {
  const { user, username, bio, isAuthor, isLoggedIn, loading, logout, registerAsAuthor } = useAuth();
  const navigate = useNavigate();

  // "Daftar Menjadi Author" → jadikan author di server dulu, baru buka dashboard
  const handleAuthorClick = async (e: React.MouseEvent) => {
    if (isAuthor) return;
    e.preventDefault();
    try {
      await registerAsAuthor();
      navigate("/author");
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      icon: <Crown className="h-5 w-5 text-yellow-400" />,
      label: "EverTale Premium",
      sub: "Keanggotaan Premium",
      to: "#",
    },
    {
      icon: <Settings className="h-5 w-5 text-slate-400" />,
      label: "Setting",
      sub: "Bahasa, bacaan, notifikasi & privasi",
      to: "/setting",
    },
    {
      icon: <Heart className="h-5 w-5 text-slate-400" />,
      label: "Favorit",
      sub: "Daftar bacaan favoritmu",
      to: "/favorit",
    },
    {
      icon: <PenLine className="h-5 w-5 text-slate-400" />,
      label: isAuthor ? "Dashboard Author" : "Daftar Menjadi Author",
      sub: isAuthor ? "Kelola serial dan episode kamu" : "Mulai perjalananmu sebagai penulis",
      to: "/author",
      onClick: handleAuthorClick,
    },
  ];

  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 dark:bg-[#0B1220] px-4 py-10 md:px-12 lg:px-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <p className="text-sm text-gray-500 dark:text-slate-500 mb-1">Akun Saya</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Profil</h1>

        {/* Avatar + Info */}
        <div className="flex items-center gap-5 mb-8">
          <Link
            to="/profil/edit"
            className="relative h-20 w-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center group flex-shrink-0 transition-all hover:border-blue-400 active:scale-95 overflow-hidden shadow-lg shadow-blue-500/10"
            aria-label="Edit profil"
          >
            {user?.avatar_url ? (
              <img
                src={assetUrl(user.avatar_url)}
                alt={username}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-9 w-9 text-blue-500 dark:text-blue-400 group-hover:opacity-60 transition-opacity" />
            )}
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </span>
          </Link>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{username}</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5 line-clamp-2">{bio || "Belum ada bio"}</p>
            <Link
              to="/profil/edit"
              className="inline-flex items-center gap-1.5 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium mt-2 transition-colors"
            >
              <PenLine className="h-3.5 w-3.5" />
              <span>Edit Profil</span>
            </Link>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-white/10 mb-8" />

        {/* Menu Items */}
        <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">
          Keanggotaan &amp; akun
        </p>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#101726]">
          {menuItems.map((item, i) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={item.onClick}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                i < menuItems.length - 1 ? "border-b border-gray-100 dark:border-white/10" : ""
              }`}
            >
              <span className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500 truncate">{item.sub}</p>
              </div>
              <span className="text-gray-400 dark:text-slate-600 text-lg">›</span>
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <span className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <LogOut className="h-5 w-5 text-red-500 dark:text-red-400" />
            </span>
            <p className="text-sm font-semibold text-red-500 dark:text-red-400">Logout</p>
          </button>
        </div>
      </div>
    </div>
  );
}
