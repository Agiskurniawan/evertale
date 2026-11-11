import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import DataState from "../../components/DataState";
import AuthorSidebar from "../../components/author/AuthorSidebar";
import CardAuthorSerial from "../../components/cards/CardAuthorSerial";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { api } from "../../lib/api";
import type { AuthorSerial } from "../../types";
import AnalisisContent from "./AnalisisContent";
import KomentarContent from "./KomentarContent";

// ── Konten Serial ──────────────────────────────────────────────
function SerialContent() {
  const { data, loading, error } = useFetch(
    () => api.get<{ data: AuthorSerial[] }>("/author/books").then((r) => r.data.data),
    []
  );
  const serials = data ?? [];

  return (
    <div className="flex flex-col gap-4 w-full">
      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && serials.length === 0}
        emptyText="Belum ada serial. Klik “Buat Serial” untuk mulai menulis."
      />
      {serials.map((serial) => (
        <CardAuthorSerial key={serial.id} serial={serial} />
      ))}
    </div>
  );
}

// ── Dashboard Utama ────────────────────────────────────────────
export default function AuthorDashboard() {
  const { isLoggedIn, isAuthor, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "serial");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "serial" || tab === "analisis" || tab === "komentar")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAuthor) return <Navigate to="/profil" replace />;

  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-gray-50 dark:bg-[#0B1220] transition-colors duration-300">
      {/* Sidebar Reusable */}
      <AuthorSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Konten Utama */}
      <main className="flex-1 px-6 py-8 overflow-y-auto w-full">
        {activeTab === "serial" && (
          <div className="flex items-center gap-2 text-sm mb-6">
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <span className="text-gray-900 dark:text-white font-semibold">Serial</span>
          </div>
        )}

        {activeTab === "serial" && <SerialContent />}
        {activeTab === "analisis" && (
          <AnalisisContent onBack={() => handleTabChange("serial")} />
        )}
        {activeTab === "komentar" && (
          <KomentarContent onBack={() => handleTabChange("serial")} />
        )}
      </main>
    </div>
  );
}
