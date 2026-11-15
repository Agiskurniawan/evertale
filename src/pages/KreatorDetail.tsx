import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Heart, Share2, ArrowLeft, Sparkles } from "lucide-react";
import BookCard from "../components/BookCard";
import DataState from "../components/DataState";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { api, assetUrl, errorMessage } from "../lib/api";
import type { Book } from "../types";

interface CreatorProfile {
  id: number;
  name: string;
  avatar: string | null;
  bio: string | null;
  role: string;
  works_count: number;
  followers_count: string;
}

export default function KreatorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [activeFilter, setActiveFilter] = useState<"semua" | "novel" | "komik">("semua");
  const [authorFollowed, setAuthorFollowed] = useState<boolean | null>(null);
  const [notice, setNotice] = useState("");

  // Profil Kreator
  const creatorFetch = useFetch(
    () => api.get<{ data: CreatorProfile }>(`/users/${id}`).then((r) => r.data.data),
    [id]
  );

  // Status apakah pengguna mengikuti kreator ini
  const favAuthorsFetch = useFetch(
    () => api.get<{ data: { id: number }[] }>("/favorites/authors").then((r) => r.data.data),
    [isLoggedIn, id],
    isLoggedIn
  );

  // Daftar karya oleh kreator ini
  const booksFetch = useFetch(
    () =>
      api
        .get<{ data: Book[] }>("/books", {
          params: {
            author_id: id,
            type: activeFilter === "semua" ? undefined : activeFilter,
            limit: 50,
          },
        })
        .then((r) => r.data.data),
    [id, activeFilter]
  );

  const creator = creatorFetch.data;
  const books = booksFetch.data ?? [];

  const isFollowing =
    authorFollowed !== null
      ? authorFollowed
      : Boolean(favAuthorsFetch.data?.some((a) => String(a.id) === String(id)));

  const toggleFollow = async () => {
    if (!isLoggedIn) return navigate("/login");
    if (!id) return;

    try {
      if (isFollowing) {
        await api.delete(`/favorites/authors/${id}`);
        setAuthorFollowed(false);
        setNotice(`Berhenti mengikuti ${creator?.name || "kreator"}`);
      } else {
        await api.post(`/favorites/authors/${id}`);
        setAuthorFollowed(true);
        setNotice(`${creator?.name || "Kreator"} ditambahkan ke Favorit Kreator!`);
      }
    } catch (err) {
      setNotice(errorMessage(err));
    }
  };

  const copyShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setNotice("Tautan profil kreator disalin!");
    }
  };

  if (creatorFetch.loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#DFE3E8] dark:bg-[#0B1220] py-16 flex items-center justify-center">
        <DataState loading />
      </div>
    );
  }

  if (creatorFetch.error || !creator) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#DFE3E8] dark:bg-[#0B1220] py-16 px-4">
        <DataState error={creatorFetch.error || "Kreator tidak ditemukan."} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#DFE3E8] dark:bg-[#0B1220] transition-colors duration-300 pb-20 pt-6 sm:pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Tombol Kembali (Menyatu dengan Latar Belakang) ── */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-[#ECEFF2] dark:bg-white/10 border border-gray-300 dark:border-white/10 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </button>
        </div>

        {/* ── Profil Kreator Card ── */}
        <div className="rounded-3xl bg-[#ECEFF2] dark:bg-[#111A2C] border border-gray-300 dark:border-white/10 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Avatar & Identitas */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-blue-500/20 border-4 border-[#ECEFF2] dark:border-[#111A2C] shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {creator.avatar ? (
                  <img
                    src={assetUrl(creator.avatar)}
                    alt={creator.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-blue-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-sm">
                    Kreator Resmi
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white truncate">
                  {creator.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 max-w-xl leading-relaxed font-medium">
                  {creator.bio || "Penulis dan kreator cerita di EverTale. Membawa imajinasi menjadi kenyataan."}
                </p>
              </div>
            </div>

            {/* Statistik & Aksi Follow */}
            <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end gap-4">
              {/* Statistik */}
              <div className="flex items-center gap-6 text-center">
                <div className="px-4 py-2 rounded-2xl bg-[#DEE3E8] dark:bg-white/5 border border-gray-300 dark:border-white/5">
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {creator.works_count}
                  </p>
                  <p className="text-xs font-semibold text-gray-600 dark:text-slate-400">Total Karya</p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-[#DEE3E8] dark:bg-white/5 border border-gray-300 dark:border-white/5">
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {creator.followers_count}
                  </p>
                  <p className="text-xs font-semibold text-gray-600 dark:text-slate-400">Pengikut</p>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={toggleFollow}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-md active:scale-95 ${
                    isFollowing
                      ? "bg-rose-50 text-rose-600 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFollowing ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>{isFollowing ? "Mengikuti" : "Favoritkan Kreator"}</span>
                </button>

                <button
                  type="button"
                  onClick={copyShareLink}
                  className="p-2.5 rounded-2xl border border-gray-300 dark:border-white/10 bg-[#DEE3E8] dark:bg-white/5 text-gray-700 dark:text-white hover:bg-gray-300/80 transition-colors"
                  title="Bagikan Profil"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Koleksi Karya Kreator ── */}
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Karya Terbitan</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                Serial oleh {creator.name}
              </h2>
            </div>

            {/* Filter Jenis: Semua / Novel / Komik */}
            <div className="flex items-center rounded-2xl bg-[#D6DCE2] p-1 border border-gray-300 dark:bg-[#0E1626] dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveFilter("semua")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "semua"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Semua ({creator.works_count})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("novel")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "novel"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Novel
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("komik")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "komik"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Komik
              </button>
            </div>
          </div>

          <DataState
            loading={booksFetch.loading}
            error={booksFetch.error}
            empty={!booksFetch.loading && !booksFetch.error && books.length === 0}
            emptyText="Kreator ini belum menerbitkan karya pada kategori ini."
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </div>

      {/* Toast Notifikasi */}
      {notice && (
        <button
          type="button"
          onClick={() => setNotice("")}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-gray-300 dark:border-white/10 bg-[#ECEFF2] dark:bg-[#101726] px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-2xl"
        >
          {notice}
        </button>
      )}
    </div>
  );
}
