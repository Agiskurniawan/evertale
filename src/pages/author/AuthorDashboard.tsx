import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, BarChart2, MessageSquare, Megaphone,
  FlaskConical, Bell, User, Plus, Settings, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import foto2 from "../../assets/foto2.jpg";

const navItems = [
  { key: "serial",     label: "Serial",          icon: BookOpen },
  { key: "analisis",   label: "Analisis",         icon: BarChart2 },
  { key: "komentar",   label: "Komentar",         icon: MessageSquare },
  { key: "iklan",      label: "Berbagi Iklan",    icon: Megaphone },
  { key: "lab",        label: "Lab",              icon: FlaskConical },
  { key: "notif",      label: "Pemberitahuan",    icon: Bell },
];

const serials = [
  {
    id: 1,
    title: "Senja di Ujung Semesta",
    cover: foto2,
    episodes: 14,
    drafts: 0,
    updated: "14/10/2023",
    lang: "Bahasa Indonesia",
    tags: ["#Fantasi", "#Petualangan"],
    status: "Ongoing",
  },
  {
    id: 2,
    title: "Di Bawah Hujan Biru",
    cover: foto2,
    episodes: 30,
    drafts: 2,
    updated: "13/10/2023",
    lang: "Bahasa Indonesia",
    tags: ["#Romansa", "#Drama"],
    status: "Selesai",
  },
  {
    id: 3,
    title: "Kastil di Atas Awan",
    cover: foto2,
    episodes: 3,
    drafts: 1,
    updated: "10/10/2023",
    lang: "Bahasa Indonesia",
    tags: ["#Novel", "#Fiksi"],
    status: "Draft",
  },
];

// ── Konten Serial ──────────────────────────────────────────────
function SerialContent() {
  return (
    <div className="flex flex-col gap-4">
      {serials.map((s) => (
        <div
          key={s.id}
          className="flex items-start gap-4 p-4 rounded-2xl bg-[#101726] border border-white/10 hover:border-white/20 transition-colors"
        >
          {/* Cover */}
          <img
            src={s.cover}
            alt={s.title}
            className="h-24 w-16 rounded-xl object-cover flex-shrink-0 border border-white/10"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white mb-1 truncate">{s.title}</h3>
            <p className="text-xs text-blue-400 mb-0.5">
              Ep. Tulis {s.episodes} · Draft {s.drafts} · Update {s.updated}
            </p>
            <p className="text-xs text-slate-500 mb-2">{s.lang}</p>
            <div className="flex gap-1.5 flex-wrap">
              {s.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link
              to={`/author/karya/${s.id}`}
              className="text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-lg transition-colors text-center"
            >
              Kelola Serial
            </Link>
            <Link
              to="/author/tulis"
              className="text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-colors text-center"
            >
              Kelola Episode
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Placeholder konten tab lain ────────────────────────────────
function PlaceholderContent({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-600 gap-3">
      <Settings className="h-10 w-10 opacity-30" />
      <p className="text-sm">{label} — segera hadir</p>
    </div>
  );
}

// ── Dashboard utama ────────────────────────────────────────────
export default function AuthorDashboard() {
  const { username, registerAsAuthor } = useAuth();
  const [activeTab, setActiveTab] = useState("serial");

  // Tandai user sebagai author saat pertama kali membuka halaman ini
  useEffect(() => {
    registerAsAuthor();
  }, []);

  const activeNav = navItems.find((n) => n.key === activeTab);

  return (
    <div className="flex min-h-[calc(100vh-72px)]">

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 border-r border-white/10 bg-[#0D1526] flex flex-col py-6 px-4 gap-6">
        {/* Avatar + Nama */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center">
            <User className="h-7 w-7 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-white truncate max-w-full">{username}</p>
        </div>

        {/* Tombol Buat Serial */}
        <Link
          to="/author/tulis"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 active:scale-[0.97] transition-all"
        >
          <Plus className="h-4 w-4" />
          Buat Serial
        </Link>

        {/* Navigasi */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left w-full ${
                activeTab === key
                  ? "bg-blue-500/15 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Konten Utama ── */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <ChevronRight className="h-4 w-4" />
          <span className="text-white font-semibold">{activeNav?.label}</span>
        </div>

        {activeTab === "serial"   && <SerialContent />}
        {activeTab === "analisis" && <PlaceholderContent label="Analisis" />}
        {activeTab === "komentar" && <PlaceholderContent label="Komentar" />}
        {activeTab === "iklan"    && <PlaceholderContent label="Berbagi Iklan" />}
        {activeTab === "lab"      && <PlaceholderContent label="Lab" />}
        {activeTab === "notif"    && <PlaceholderContent label="Pemberitahuan" />}
      </main>
    </div>
  );
}
