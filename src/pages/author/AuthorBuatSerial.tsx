import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ChevronRight, Upload, Trash2, Camera, Check } from "lucide-react";
import AuthorSidebar from "../../components/author/AuthorSidebar";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { api, errorMessage } from "../../lib/api";
import type { Category } from "../../types";

// ─── Konstanta ─────────────────────────────────────────────────
const BAHASA_OPTIONS = [
  "Bahasa Indonesia", "English", "日本語", "한국어", "中文",
];

// ─── Komponen utama ────────────────────────────────────────────
export default function AuthorBuatSerial() {
  const { isLoggedIn, isAuthor, loading: authLoading } = useAuth();
  const { data: categoriesData } = useFetch(
    () => api.get<{ data: Category[] }>("/categories").then((r) => r.data.data),
    [],
    isLoggedIn && isAuthor
  );

  if (authLoading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAuthor) return <Navigate to="/profil" replace />;

  return <BuatSerialForm categories={categoriesData ?? []} />;
}

// ─── Form ──────────────────────────────────────────────────────
function BuatSerialForm({ categories }: { categories: Category[] }) {
  const navigate = useNavigate();
  const [bahasa, setBahasa] = useState("Bahasa Indonesia");
  const [tipe, setTipe] = useState<"novel" | "komik">("novel");
  const [statusCerita, setStatusCerita] = useState<"ongoing" | "selesai">("ongoing");
  const [judul, setJudul] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [kategori1, setKategori1] = useState("Pilih");
  const [kategori2, setKategori2] = useState("");
  const [thumbPersegi, setThumbPersegi] = useState<string | null>(null);
  const [thumbVertikal, setThumbVertikal] = useState<string | null>(null);
  const [thumbHero, setThumbHero] = useState<string | null>(null);
  const [thumbPersegiFile, setThumbPersegiFile] = useState<File | null>(null);
  const [thumbVertikalFile, setThumbVertikalFile] = useState<File | null>(null);
  const [thumbHeroFile, setThumbHeroFile] = useState<File | null>(null);
  const inputPersegiRef = useRef<HTMLInputElement>(null);
  const inputVertikalRef = useRef<HTMLInputElement>(null);
  const inputHeroRef = useRef<HTMLInputElement>(null);

  // submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Rating Usia Konten ──
  const [ratingKekerasan,   setRatingKekerasan]   = useState("");
  const [ratingSeksual,     setRatingSeksual]     = useState("");
  const [ratingTelanjang,   setRatingTelanjang]   = useState("");
  const [ratingKasar,       setRatingKasar]       = useState("");
  const [ratingAlkohol,     setRatingAlkohol]     = useState("");
  const [sensitifChecked,   setSensitifChecked]   = useState<Record<string, boolean>>({});
  const [setuju,            setSetuju]            = useState(false);

  const toggleSensitif = (key: string) =>
    setSensitifChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleThumb = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (s: string | null) => void,
    setFile: (f: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Upload satu file ke /api/upload, kembalikan URL relatif
  const uploadFile = async (file: File, type: "cover" | "banner" = "cover"): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post<{ url: string }>(`/upload?type=${type}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const handleSubmit = async () => {
    if (!judul.trim()) { setSubmitError("Judul serial wajib diisi."); return; }
    if (kategori1 === "Pilih") { setSubmitError("Pilih minimal satu kategori."); return; }
    if (!setuju) { setSubmitError("Centang persetujuan terlebih dahulu."); return; }

    setSubmitting(true);
    setSubmitError("");
    try {
      // Upload thumbnail jika ada
      let coverUrl: string | null = null;
      let bannerUrl: string | null = null;
      let heroUrl: string | null = null;
      if (thumbPersegiFile) coverUrl = await uploadFile(thumbPersegiFile, "cover");
      if (thumbVertikalFile) bannerUrl = await uploadFile(thumbVertikalFile, "banner");
      if (thumbHeroFile) heroUrl = await uploadFile(thumbHeroFile, "banner");

      // Cari category_ids dari nama
      const catIds = categories
        .filter((c) => [kategori1, kategori2].includes(c.name))
        .map((c) => c.id);

      await api.post("/author/books", {
        title: judul.trim(),
        type: tipe,
        synopsis: ringkasan.trim() || null,
        language: bahasa,
        story_status: statusCerita,
        cover_url: coverUrl,
        banner_url: heroUrl ?? bannerUrl,
        category_ids: catIds,
      });

      navigate("/author");
    } catch (err) {
      setSubmitError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const FALLBACK_CATS = ["Drama","Fantasi","Petualangan","Romansa","Komedi","Thriller","Horor","Aksi"];
  const catNames = categories.length > 0 ? categories.map((c) => c.name) : FALLBACK_CATS;
  const KATEGORI_OPTIONS = ["Pilih", ...catNames];

  const RATING_OPTIONS = [
    { value: "",    label: "Silakan pilih satu" },
    { value: "0",   label: "Tidak ada" },
    { value: "1",   label: "Ringan" },
    { value: "2",   label: "Sedang" },
    { value: "3",   label: "Berat" },
  ];

  const SENSITIF_GROUPS = [
    {
      id: "eksploitasi",
      desc: "Serial ini mungkin mengandung tema eksploitasi atau pelecehan terhadap anak di bawah umur, hewan, atau orang dewasa yang rentan.",
      items: ["Penyiksaan hewan", "Pelecehan anak", "Kekerasan dalam rumah tangga", "Pelecehan seksual"],
    },
    {
      id: "mental",
      desc: "Serial ini mungkin menampilkan atau menggambarkan tema melukai diri sendiri, bunuh diri, atau krisis kesehatan mental.",
      items: ["Gangguan makan", "Kesehatan mental", "Melukai diri sendiri", "Bunuh diri"],
    },
    {
      id: "ekstremisme",
      desc: "Serial ini mungkin mengandung tema atau alur cerita yang mencakup ekstremisme, kekerasan politik, atau aktivitas kriminal terorganisir.",
      items: ["Ekstremisme", "Kejahatan terorganisir", "Konten politik", "Terorisme"],
    },
    {
      id: "narkoba",
      desc: "Serial ini mungkin mencakup tema atau penggambaran penggunaan zat terlarang, perdagangan narkoba, perundungan, atau perjudian.",
      items: ["Perundungan", "Perjudian", "Penyalahgunaan zat terlarang", "Perdagangan narkoba"],
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-gray-50 dark:bg-[#0B1220]">

      {/* ── Sidebar ── */}
      <AuthorSidebar activeTab="serial" />

      {/* ── Konten ── */}
      <main className="flex-1 px-8 py-8 overflow-y-auto w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 mb-6">
          <Link to="/author" className="hover:text-blue-400 transition-colors">
            Serial
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400 dark:text-slate-600" />
          <span className="text-gray-900 dark:text-white font-semibold">Buat Serial</span>
        </div>

        {/* ── Card: Info Serial ── */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#101726] p-6 mb-5">

          {/* Tipe Serial */}
          <FormRow label="Tipe Serial">
            <div className="flex gap-3">
              {(["novel", "komik"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipe(t)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    tipe === t
                      ? "border-blue-500 bg-blue-500/15 text-blue-400"
                      : "border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#0D1526] text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  {t === "novel" ? "📖 Novel" : "🎨 Komik"}
                </button>
              ))}
            </div>
          </FormRow>

          {/* Bahasa Sumber */}
          <FormRow label="Bahasa Sumber">
            <SelectField value={bahasa} onChange={setBahasa}>
              {BAHASA_OPTIONS.map((b) => (
                <option key={b} value={b} className="bg-white dark:bg-[#0D1526] text-gray-900 dark:text-white">
                  {b}
                </option>
              ))}
            </SelectField>
          </FormRow>

          {/* Judul Serial */}
          <FormRow label="Judul Serial">
            <div className="relative">
              <input
                id="judul-serial"
                type="text"
                value={judul}
                maxLength={50}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Masukkan Judul Serial"
                className="w-full bg-gray-50 dark:bg-[#0D1526] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-slate-500">
                {judul.length}/50
              </span>
            </div>
          </FormRow>

          {/* Ringkasan */}
          <FormRow label="Ringkasan" alignTop>
            <div className="relative">
              <textarea
                id="ringkasan-serial"
                value={ringkasan}
                maxLength={500}
                onChange={(e) => setRingkasan(e.target.value)}
                placeholder="Masukkan Ringkasan Serial"
                rows={6}
                className="w-full bg-gray-50 dark:bg-[#0D1526] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <span className="absolute right-4 bottom-3 text-xs text-gray-400 dark:text-slate-500">
                {ringkasan.length}/500
              </span>
            </div>
          </FormRow>

          {/* Kategori */}
          <FormRow label="Kategori">
            <div className="flex gap-3">
              <SelectField value={kategori1} onChange={setKategori1}>
                {KATEGORI_OPTIONS.map((k) => (
                  <option key={k} value={k} className="bg-white dark:bg-[#0D1526] text-gray-900 dark:text-white">
                    {k}
                  </option>
                ))}
              </SelectField>
              <SelectField value={kategori2} onChange={setKategori2}>
                <option value="" className="bg-white dark:bg-[#0D1526] text-gray-900 dark:text-white">
                  Pilih (Opsi)
                </option>
                {catNames.filter((k) => k !== kategori1).map((k) => (
                  <option key={k} value={k} className="bg-white dark:bg-[#0D1526] text-gray-900 dark:text-white">
                    {k}
                  </option>
                ))}
              </SelectField>
            </div>
          </FormRow>

          {/* Status Cerita */}
          <FormRow label="Status Cerita">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="radio"
                  name="story_status"
                  value="ongoing"
                  checked={statusCerita === "ongoing"}
                  onChange={() => setStatusCerita("ongoing")}
                  className="accent-blue-500 h-4 w-4"
                />
                <span>Berjalan (Ongoing)</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="radio"
                  name="story_status"
                  value="selesai"
                  checked={statusCerita === "selesai"}
                  onChange={() => setStatusCerita("selesai")}
                  className="accent-blue-500 h-4 w-4"
                />
                <span>Tamat (Selesai)</span>
              </label>
            </div>
          </FormRow>
        </section>

        {/* ── Card: Thumbnail ── */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#101726] p-6 mb-5">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-full md:w-36 flex-shrink-0">
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                Thumbnail
                <span className="text-gray-400 dark:text-slate-500 font-normal text-xs" title="Cover serial yang tampil di beranda dan daftar karya">ⓘ</span>
              </span>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Unggah cover untuk menarik perhatian pembaca.
              </p>
            </div>

            <div className="flex-1 w-full">
              {/* Kolom Upload Thumbnail Bersebelahan & Rapi */}
              <div className="flex flex-col sm:flex-row items-start gap-8">
                
                {/* 1. Slot Thumbnail Persegi (1:1) */}
                <div className="flex flex-col items-center gap-2.5 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <Check className="h-3.5 w-3.5" />
                    <span>Thumbnail Persegi (1:1)</span>
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400 font-mono">
                    1080 × 1080 px
                  </span>

                  <ThumbBox
                    preview={thumbPersegi}
                    label="1080 x 1080"
                    boxClass="w-48 h-48 sm:w-52 sm:h-52 aspect-square"
                    onClick={() => inputPersegiRef.current?.click()}
                    onRemove={() => {
                      setThumbPersegi(null);
                      setThumbPersegiFile(null);
                      if (inputPersegiRef.current) inputPersegiRef.current.value = "";
                    }}
                  />
                  <input
                    ref={inputPersegiRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => handleThumb(e, setThumbPersegi, setThumbPersegiFile)}
                  />
                  <span className="text-[11px] text-gray-500 dark:text-slate-500 text-center max-w-[210px]">
                    Digunakan untuk beranda, hero section trending, &amp; kartu buku
                  </span>
                </div>

                {/* 2. Slot Cover Vertikal (9:16) */}
                <div className="flex flex-col items-center gap-2.5 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Check className="h-3.5 w-3.5" />
                    <span>Cover Vertikal / Kartu</span>
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400 font-mono">
                    1080 × 1920 px
                  </span>

                  <ThumbBox
                    preview={thumbVertikal}
                    label="1080 x 1920"
                    boxClass="w-48 h-64 sm:w-52 sm:h-72"
                    onClick={() => inputVertikalRef.current?.click()}
                    onRemove={() => {
                      setThumbVertikal(null);
                      setThumbVertikalFile(null);
                      if (inputVertikalRef.current) inputVertikalRef.current.value = "";
                    }}
                  />
                  <input
                    ref={inputVertikalRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => handleThumb(e, setThumbVertikal, setThumbVertikalFile)}
                  />
                  <span className="text-[11px] text-gray-500 dark:text-slate-500 text-center max-w-[210px]">
                    Digunakan untuk banner halaman baca &amp; detail serial
                  </span>
                </div>

                {/* 3. Slot Banner Hero Section (Landscape 16:9) */}
                <div className="flex flex-col items-center gap-2.5 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    <span>Banner Hero (16:9)</span>
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400 font-mono">
                    1920 × 1080 px
                  </span>

                  <ThumbBox
                    preview={thumbHero}
                    label="1920 x 1080"
                    boxClass="w-64 h-36 sm:w-80 sm:h-44"
                    onClick={() => inputHeroRef.current?.click()}
                    onRemove={() => {
                      setThumbHero(null);
                      setThumbHeroFile(null);
                      if (inputHeroRef.current) inputHeroRef.current.value = "";
                    }}
                  />
                  <input
                    ref={inputHeroRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => handleThumb(e, setThumbHero, setThumbHeroFile)}
                  />
                  <span className="text-[11px] text-gray-500 dark:text-slate-500 text-center max-w-[240px]">
                    Digunakan untuk hero section beranda (gambar seni / artwork landscape)
                  </span>
                </div>

              </div>

              {/* Keterangan Format */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 space-y-1">
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  • Ukuran file gambar maksimal 2 MB per file. Format yang didukung: JPG, JPEG, PNG, dan WebP.
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  • Pastikan gambar tidak melanggar hak cipta dan sesuai pedoman konten.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Card: Penilaian Mandiri Rating Usia Konten ── */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#101726] p-6 mb-5">
          {/* Judul + Deskripsi */}
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Penilaian Mandiri Rating Usia Konten</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-6">
            Semua serial harus menampilkan Rating Usia Konten. Dengan Rating Usia Konten, pembaca dapat
            menikmati konten yang sesuai dengan kelompok usia atau preferensi konten mereka. Untuk
            memastikan Rating Usia Konten yang tepat diberikan kepada serialmu, silakan jawab kuesioner
            mengenai isi serialmu berikut ini. Konten harus mengikuti{" "}
            <span className="text-blue-400">Kebijakan Komunitas dan Pedoman Pengunggahan</span>.
            {" "}Perlu diingat bahwa rating dapat berubah sewaktu-waktu atas kebijakan, dengan atau tanpa
            pemberitahuan sebelumnya.
          </p>

          {/* Dropdown rating */}
          {[
            { label: "Kekerasan",                      value: ratingKekerasan,  set: setRatingKekerasan  },
            { label: "Konten Seksual",                 value: ratingSeksual,    set: setRatingSeksual    },
            { label: "Ketelanjangan",                  value: ratingTelanjang,  set: setRatingTelanjang  },
            { label: "Kata-Kata Kasar",                value: ratingKasar,      set: setRatingKasar      },
            { label: "Alkohol, Narkoba, atau Tembakau",value: ratingAlkohol,    set: setRatingAlkohol    },
          ].map(({ label, value, set }) => (
            <FormRow key={label} label={label}>
              <div className="relative">
                <select
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-[#0D1526] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none ${
                    value === "" ? "text-gray-400 dark:text-slate-500" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {RATING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-gray-50 dark:bg-[#0D1526] text-gray-900 dark:text-white">
                      {o.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                  ▾
                </span>
              </div>
            </FormRow>
          ))}

          {/* Sensitivitas Regional dan Budaya */}
          <FormRow label="Sensitivitas Regional dan Budaya" alignTop>
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Peraturan dan sensitivitas budaya berbeda-beda di setiap negara, negara bagian, dan wilayah.
                Bagian ini akan membantu memastikan Rating Usia Konten serialmu sesuai dengan hukum setempat
                dan regional. Harap periksa semua konten yang termasuk dalam serialmu. Jika berisi topik yang
                mungkin sensitif secara budaya atau dilarang berdasarkan hukum regional, ketersediaan karya
                tersebut mungkin akan dibatasi.
              </p>

              {SENSITIF_GROUPS.map((group) => (
                <div key={group.id} className="rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-[#0D1526]/60 p-4 space-y-3">
                  {/* Deskripsi kelompok */}
                  <p className="text-xs text-blue-400/90 leading-relaxed">
                    {group.desc}
                  </p>
                  {/* Checkbox baris */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2.5">
                    {group.items.map((item) => {
                      const key = `${group.id}:${item}`;
                      return (
                        <label
                          key={item}
                          className="flex items-start gap-2 cursor-pointer group"
                        >
                          <span
                            onClick={() => toggleSensitif(key)}
                            className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 transition-all ${
                              sensitifChecked[key]
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-400 dark:border-slate-500 bg-transparent group-hover:border-blue-500"
                            }`}
                          />
                          <span
                            onClick={() => toggleSensitif(key)}
                            className="text-xs text-gray-700 dark:text-slate-300 leading-snug select-none"
                          >
                            {item}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </FormRow>
        </section>

        {/* ── Card: Persetujuan ── */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#101726] p-6 mb-6">
          <FormRow label="Persetujuan">
            <label className="flex items-center gap-3 cursor-pointer group">
              <span
                onClick={() => setSetuju(!setuju)}
                className={`h-4 w-4 flex-shrink-0 rounded-full border-2 transition-all ${
                  setuju
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-400 dark:border-slate-500 bg-transparent group-hover:border-blue-500"
                }`}
              />
              <span
                onClick={() => setSetuju(!setuju)}
                className="text-sm text-gray-700 dark:text-slate-300 select-none"
              >
                Silakan lakukan penilaian mandiri untuk serialmu.
              </span>
            </label>
          </FormRow>
        </section>

        {/* ── Error pesan ── */}
        {submitError && (
          <div className="mx-auto mb-4 max-w-md rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">
            {submitError}
          </div>
        )}

        {/* ── Tombol Buat Serial ── */}
        <div className="flex justify-center mb-8">
          <button
            id="buat-serial-btn"
            type="button"
            disabled={!setuju || submitting}
            onClick={handleSubmit}
            className="px-12 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-sm font-bold text-white transition-all active:scale-[0.98] min-w-[160px] shadow-lg shadow-blue-500/20"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Membuat...
              </span>
            ) : (
              "Buat Serial"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

// ─── Helper: baris form ────────────────────────────────────────
function FormRow({
  label, children, alignTop = false,
}: {
  label: string; children: React.ReactNode; alignTop?: boolean;
}) {
  return (
    <div className={`flex gap-6 py-4 border-b border-gray-100 dark:border-white/5 last:border-0 ${alignTop ? "items-start" : "items-center"}`}>
      <span className="w-36 flex-shrink-0 text-sm font-semibold text-gray-700 dark:text-slate-200">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ─── Helper: select field ──────────────────────────────────────
function SelectField({
  value, onChange, children,
}: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 w-full bg-gray-50 dark:bg-[#0D1526] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
    >
      {children}
    </select>
  );
}

// ─── Helper: kotak upload thumbnail ───────────────────────────
function ThumbBox({
  preview,
  label,
  boxClass,
  onClick,
  onRemove,
}: {
  preview: string | null;
  label: string;
  boxClass: string;
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      className={`relative ${boxClass} rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-[#0D1526] hover:border-blue-500/60 transition-all overflow-hidden flex flex-col items-center justify-center group shadow-sm`}
    >
      {preview ? (
        <>
          <img src={preview} alt="Thumbnail preview" className="w-full h-full object-cover" />

          {/* Hover overlay dengan tombol Ganti & Hapus */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
            <button
              type="button"
              onClick={onClick}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Ganti Gambar</span>
            </button>

            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="px-3 py-1 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white text-[11px] font-medium active:scale-95 transition-all flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>Hapus</span>
              </button>
            )}
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="w-full h-full flex flex-col items-center justify-center p-4 gap-2 cursor-pointer focus:outline-none"
        >
          <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Upload className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-slate-300 group-hover:text-blue-500 transition-colors">
            Pilih Foto
          </span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">
            {label}
          </span>
        </button>
      )}
    </div>
  );
}
