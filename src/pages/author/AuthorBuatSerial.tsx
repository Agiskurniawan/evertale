import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ChevronRight, Upload } from "lucide-react";
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
  const [judul, setJudul] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [kategori1, setKategori1] = useState("Pilih");
  const [kategori2, setKategori2] = useState("");
  const [thumbPersegi, setThumbPersegi] = useState<string | null>(null);
  const [thumbVertikal, setThumbVertikal] = useState<string | null>(null);
  const [thumbPersegiFile, setThumbPersegiFile] = useState<File | null>(null);
  const [thumbVertikalFile, setThumbVertikalFile] = useState<File | null>(null);
  const inputPersegiRef = useRef<HTMLInputElement>(null);
  const inputVertikalRef = useRef<HTMLInputElement>(null);

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
      if (thumbPersegiFile) coverUrl = await uploadFile(thumbPersegiFile, "cover");
      if (thumbVertikalFile) bannerUrl = await uploadFile(thumbVertikalFile, "banner");

      // Cari category_ids dari nama
      const catIds = categories
        .filter((c) => [kategori1, kategori2].includes(c.name))
        .map((c) => c.id);

      await api.post("/author/books", {
        title: judul.trim(),
        type: tipe,
        synopsis: ringkasan.trim() || null,
        language: bahasa,
        cover_url: coverUrl,
        banner_url: bannerUrl,
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
                <option key={b} value={b} className="bg-[#0D1526]">{b}</option>
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
                className="w-full bg-[#0D1526] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
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
                className="w-full bg-[#0D1526] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <span className="absolute right-4 bottom-3 text-xs text-slate-500">
                {ringkasan.length}/500
              </span>
            </div>
          </FormRow>

          {/* Kategori */}
          <FormRow label="Kategori">
            <div className="flex gap-3">
              <SelectField value={kategori1} onChange={setKategori1}>
                {KATEGORI_OPTIONS.map((k) => (
                  <option key={k} value={k} className="bg-[#0D1526]">{k}</option>
                ))}
              </SelectField>
              <SelectField value={kategori2} onChange={setKategori2}>
                <option value="" className="bg-[#0D1526]">Pilih (Opsi)</option>
                {catNames.filter((k) => k !== kategori1).map((k) => (
                  <option key={k} value={k} className="bg-[#0D1526]">{k}</option>
                ))}
              </SelectField>
            </div>
          </FormRow>
        </section>

        {/* ── Card: Thumbnail ── */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#101726] p-6 mb-5">
          <div className="flex items-start gap-6">
            <span className="w-36 flex-shrink-0 text-sm font-semibold text-gray-700 dark:text-slate-200 pt-1">
              Thumbnail
              <sup className="ml-0.5 text-gray-400 dark:text-slate-500 font-normal text-[10px]">ⓘ</sup>
            </span>

            <div className="flex-1">
              {/* Label kolom */}
              <div className="flex gap-6 mb-3">
                <span className="flex-1 text-center text-sm font-semibold text-blue-400">Persegi</span>
                <span className="flex-1 text-center text-sm font-semibold text-blue-400">Vertikal</span>
              </div>

              {/* Upload boxes */}
              <div className="flex gap-6">
                <ThumbBox
                  preview={thumbPersegi}
                  label="1080 x 1080"
                  aspectClass="aspect-square"
                  onClick={() => inputPersegiRef.current?.click()}
                />
                <input
                  ref={inputPersegiRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleThumb(e, setThumbPersegi, setThumbPersegiFile)}
                />

                <ThumbBox
                  preview={thumbVertikal}
                  label="1080 x 1920"
                  aspectClass="aspect-[9/16]"
                  onClick={() => inputVertikalRef.current?.click()}
                />
                <input
                  ref={inputVertikalRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleThumb(e, setThumbVertikal, setThumbVertikalFile)}
                />
              </div>

              {/* Keterangan */}
              <div className="mt-3 space-y-0.5">
                <p className="text-xs text-blue-400">
                  · Ukuran gambar harus 1080x1080, 1080x1920. Besar file gambar harus kurang dari 500KB.
                </p>
                <p className="text-xs text-blue-400">
                  · Hanya format JPG, JPEG, dan PNG yang diperbolehkan.
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
                                ? "border-blue-400 bg-blue-400"
                                : "border-slate-500 bg-transparent group-hover:border-slate-400"
                            }`}
                          />
                          <span
                            onClick={() => toggleSensitif(key)}
                            className="text-xs text-gray-600 dark:text-slate-300 leading-snug select-none"
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
                    ? "border-blue-400 bg-blue-400"
                    : "border-slate-500 bg-transparent group-hover:border-slate-400"
                }`}
              />
              <span
                onClick={() => setSetuju(!setuju)}
                className="text-sm text-gray-600 dark:text-slate-300 select-none"
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
            className="px-12 py-3 rounded-xl bg-slate-700 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold text-white transition-all active:scale-[0.98] min-w-[160px]"
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
  preview, label, aspectClass, onClick,
}: {
  preview: string | null; label: string; aspectClass: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 ${aspectClass} max-w-[180px] rounded-xl border-2 border-dashed border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-[#0D1526] hover:border-blue-500/50 transition-colors overflow-hidden flex flex-col items-center justify-center gap-2 group`}
    >
      {preview ? (
        <img src={preview} alt="thumbnail preview" className="w-full h-full object-cover" />
      ) : (
        <>
          <Upload className="h-5 w-5 text-gray-400 dark:text-slate-600 group-hover:text-blue-400 transition-colors" />
          <span className="text-xs text-gray-400 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 transition-colors">{label}</span>
          <span className="text-[10px] font-semibold text-blue-400/70 group-hover:text-blue-400 transition-colors">
            Pilih File
          </span>
        </>
      )}
    </button>
  );
}
