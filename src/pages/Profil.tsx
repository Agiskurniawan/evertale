import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Crown, Settings, Heart, PenLine, LogOut, X, Camera, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";

export default function Profil() {
  const { username, bio, isAuthor, isLoggedIn, loading, logout, updateProfile, registerAsAuthor } = useAuth();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [draftName, setDraftName] = useState(username);
  const [draftBio, setDraftBio] = useState(bio);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const openModal = () => {
    setDraftName(username);
    setDraftBio(bio);
    setFormError("");
    setShowModal(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    setFormError("");
    try {
      await updateProfile(draftName.trim() || "Pembaca", draftBio.trim());
      setShowModal(false);
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

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
    <div className="min-h-[calc(100vh-72px)] px-4 py-10 md:px-12 lg:px-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <p className="text-sm text-slate-500 mb-1">Akun Saya</p>
        <h1 className="text-3xl font-bold text-white mb-8">Profil</h1>

        {/* Avatar + Info */}
        <div className="flex items-center gap-5 mb-8">
          <button
            onClick={openModal}
            className="relative h-20 w-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center group flex-shrink-0 transition-all hover:border-blue-400 active:scale-95"
            aria-label="Edit profil"
          >
            <User className="h-9 w-9 text-blue-400 group-hover:opacity-60 transition-opacity" />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </span>
          </button>

          <div>
            <h2 className="text-xl font-bold text-white">{username}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{bio || "Belum ada bio"}</p>
          </div>
        </div>

        <hr className="border-white/10 mb-8" />

        {/* Menu Items */}
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">
          Keanggotaan &amp; akun
        </p>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#101726]">
          {menuItems.map((item, i) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={item.onClick}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors ${
                i < menuItems.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              <span className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-slate-500 truncate">{item.sub}</p>
              </div>
              <span className="text-slate-600 text-lg">›</span>
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-white/10 hover:bg-white/5 transition-colors"
          >
            <span className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <LogOut className="h-5 w-5 text-red-400" />
            </span>
            <p className="text-sm font-semibold text-red-400">Logout</p>
          </button>
        </div>
      </div>

      {/* Modal Edit Profil */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="w-full max-w-sm bg-[#101726] rounded-2xl border border-white/10 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Edit Profil</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Username</label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Nama kamu"
                  maxLength={30}
                  className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Bio</label>
                <textarea
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  placeholder="Ceritakan sedikit tentang dirimu..."
                  maxLength={120}
                  rows={3}
                  className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {formError && <p className="text-xs text-red-400">{formError}</p>}

              <button
                onClick={saveProfile}
                disabled={saving}
                className="mt-1 w-full rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
