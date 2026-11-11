import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, ChevronLeft, Calendar, Loader2 } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { api, assetUrl } from "../../lib/api";

type ChartPoint = { label: string; views: number; subscribers?: number };

type SerialRow = {
  id: number;
  title: string;
  cover: string;
  episodes: number;
  views: number;
  subscribers: number;
  comments: number;
};

type Mode = "harian" | "mingguan" | "bulanan";
type Metric = "views" | "subscribers";

interface AnalisisContentProps {
  onBack?: () => void;
}

export default function AnalisisContent({ onBack }: AnalisisContentProps) {
  const [mode, setMode] = useState<Mode>("harian");
  const [activeMetric, setActiveMetric] = useState<Metric>("views");
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [serialDropdownOpen, setSerialDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const serialRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (serialRef.current && !serialRef.current.contains(e.target as Node)) {
        setSerialDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch daftar serial author
  const { data: serials, loading: serialsLoading } = useFetch(
    () => api.get<{ data: SerialRow[] }>("/author/analytics/serials").then((r) => r.data.data),
    []
  );

  // Fetch data chart (re-fetch saat mode / bookId berubah)
  const { data: chartData, loading: chartLoading } = useFetch(
    () => {
      const params = new URLSearchParams({ mode });
      if (selectedBookId) params.append("bookId", String(selectedBookId));
      return api
        .get<{ data: ChartPoint[] }>(`/author/analytics/chart?${params}`)
        .then((r) => r.data.data);
    },
    [mode, selectedBookId]
  );

  const selectedSerial = useMemo(() => {
    if (!selectedBookId) return null;
    return serials?.find((s) => s.id === selectedBookId) ?? null;
  }, [selectedBookId, serials]);

  const selectedTitle = selectedSerial ? selectedSerial.title : "Semua Serial";
  const points = useMemo(() => chartData ?? [], [chartData]);

  const totalViews = useMemo(() => {
    return points.reduce((acc, p) => acc + (p.views || 0), 0);
  }, [points]);

  const totalSubscribers = useMemo(() => {
    if (selectedSerial) return selectedSerial.subscribers;
    return serials ? serials.reduce((acc, s) => acc + s.subscribers, 0) : 0;
  }, [selectedSerial, serials]);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const modeLabel =
    mode === "harian" ? "Harian" : mode === "mingguan" ? "Mingguan" : "Bulanan";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ─── Top Bar: Breadcrumb + Waktu Pembaruan ─────────── */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 font-semibold text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Analisis</span>
        </button>

        <span className="text-[11px] text-gray-500 dark:text-slate-500">
          Diperbarui {todayFormatted} 05:00 WIB
        </span>
      </div>

      {/* ─── Dropdown Pilihan Serial ───────────────────────── */}
      <div className="relative" ref={serialRef}>
        <button
          type="button"
          onClick={() => setSerialDropdownOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-900 dark:bg-[#101726] dark:border-white/10 dark:hover:border-white/20 dark:text-white text-sm font-medium transition-colors shadow-sm"
        >
          <span className="truncate">{selectedTitle}</span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 dark:text-slate-400 transition-transform ${
              serialDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {serialDropdownOpen && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-200 dark:bg-[#0D1526] dark:border-white/10 rounded-xl shadow-2xl z-30 py-1.5 max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedBookId(null);
                setSerialDropdownOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                selectedBookId === null
                  ? "text-blue-600 bg-blue-50 font-semibold dark:text-blue-400 dark:bg-blue-500/10"
                  : "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5"
              }`}
            >
              Semua Serial
            </button>
            {serials?.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedBookId(s.id);
                  setSerialDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs transition-colors truncate ${
                  selectedBookId === s.id
                    ? "text-blue-600 bg-blue-50 font-semibold dark:text-blue-400 dark:bg-blue-500/10"
                    : "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Bar Filter Tanggal & Periode ─────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Tanggal Dropdown */}
        <div className="relative" ref={dateRef}>
          <button
            type="button"
            onClick={() => setDateDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-900 dark:bg-[#101726] dark:border-white/10 dark:hover:border-white/20 text-xs font-semibold dark:text-white transition-colors shadow-sm"
          >
            <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-slate-400" />
            <span>{todayFormatted}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-400 dark:text-slate-400 transition-transform ${
                dateDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dateDropdownOpen && (
            <div className="absolute top-full mt-1.5 left-0 bg-white border border-gray-200 dark:bg-[#0D1526] dark:border-white/10 rounded-xl shadow-xl z-20 p-3 text-xs text-gray-600 dark:text-slate-400 w-52">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Periode Terpilih</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-500 mb-2">
                Menampilkan data hingga hari ini ({todayFormatted}).
              </p>
              <button
                type="button"
                onClick={() => setDateDropdownOpen(false)}
                className="w-full text-center py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25 font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          )}
        </div>

        {/* Periode Segments */}
        <div className="inline-flex rounded-xl bg-gray-200 border border-gray-300 dark:bg-[#101726] dark:border-white/10 p-0.5 text-xs">
          {(["harian", "mingguan", "bulanan"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-lg font-medium capitalize transition-all ${
                mode === m
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Box Utama: Metric Tabs + Grafik Line/Area ────────── */}
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#101726] dark:border-white/10 overflow-hidden shadow-sm dark:shadow-lg w-full">
        {/* Tab Metrik */}
        <div className="grid grid-cols-2 border-b border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveMetric("views")}
            className={`p-5 text-left transition-colors relative ${
              activeMetric === "views" ? "bg-gray-50/60 dark:bg-white/[0.03]" : "hover:bg-gray-50/30 dark:hover:bg-white/[0.015]"
            }`}
          >
            {activeMetric === "views" && (
              <span className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Page Views {modeLabel}
            </p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {totalViews.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">-</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("subscribers")}
            className={`p-5 text-left transition-colors relative border-l border-gray-200 dark:border-white/10 ${
              activeMetric === "subscribers" ? "bg-gray-50/60 dark:bg-white/[0.03]" : "hover:bg-gray-50/30 dark:hover:bg-white/[0.015]"
            }`}
          >
            {activeMetric === "subscribers" && (
              <span className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Subscribers {modeLabel}
            </p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {totalSubscribers.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">-</p>
          </button>
        </div>

        {/* Area Grafik */}
        <div className="p-6">
          <div className="h-64 w-full">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center text-slate-500 gap-2 text-xs">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span>Memuat grafik analisis...</span>
              </div>
            ) : points.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                Belum ada data untuk ditampilkan
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={points}
                  margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1A2436"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    axisLine={{ stroke: "#1A2436" }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const val = Number(payload[0].value || 0);
                      return (
                        <div className="bg-[#0D1526] border border-white/15 rounded-xl px-3 py-2 text-xs shadow-xl">
                          <p className="text-slate-400 mb-0.5">{label}</p>
                          <p className="text-blue-400 font-bold">
                            {val.toLocaleString("id-ID")}{" "}
                            {activeMetric === "views" ? "Views" : "Subscribers"}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeMetric === "views" ? "views" : "subscribers"}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#metricGrad)"
                    dot={{ fill: "#3B82F6", r: 2 }}
                    activeDot={{ r: 5, fill: "#3B82F6", stroke: "#0B1220", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
            <span>Semua Bahasa</span>
          </div>
        </div>
      </div>

      {/* Catatan di bawah grafik */}
      <div className="text-[11px] text-slate-500 space-y-1">
        <p>• Data tersedia untuk maksimal 2 tahun.</p>
        <p>
          • Penundaan sinkronisasi sesekali mungkin terjadi. Kami sarankan untuk
          memeriksa data 48 jam setelah tanggal yang dipilih untuk hasil yang lebih akurat.
        </p>
      </div>

      {/* ─── Box Analisis Serial (Tabel) ─────────────────────── */}
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#101726] dark:border-white/10 overflow-hidden shadow-sm dark:shadow-lg w-full mt-2">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Analisis Serial</h2>
        </div>

        {serialsLoading ? (
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-slate-500 text-xs py-12">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500 dark:text-blue-400" />
            <span>Memuat daftar serial...</span>
          </div>
        ) : !serials || serials.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-slate-500 text-xs">
            Belum ada serial yang dibuat.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 font-semibold">
                  <th className="text-left px-6 py-3.5">Judul</th>
                  <th className="text-center px-4 py-3.5">Episode</th>
                  <th className="text-center px-4 py-3.5">Page Views</th>
                  <th className="text-center px-4 py-3.5">Subscribers</th>
                  <th className="text-center px-4 py-3.5">Komentar</th>
                  <th className="text-center px-6 py-3.5">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {serials.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {s.cover ? (
                          <img
                            src={assetUrl(s.cover)}
                            alt={s.title}
                            className="h-9 w-6 rounded object-cover flex-shrink-0 border border-gray-200 dark:border-white/10"
                          />
                        ) : (
                          <div className="h-9 w-6 rounded bg-gray-200 dark:bg-slate-800 flex-shrink-0" />
                        )}
                        <span className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">
                          {s.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600 dark:text-slate-300">
                      {s.episodes}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600 dark:text-slate-300">
                      {s.views.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600 dark:text-slate-300">
                      {s.subscribers.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600 dark:text-slate-300">
                      {s.comments.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/author/karya/${s.id}`}
                        className="inline-block px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-300 dark:hover:text-white font-medium text-xs transition-colors"
                      >
                        Episode
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-[11px] text-gray-600 dark:text-gray-400 space-y-1">
        <p>• Ini adalah data kumulatif hingga pembaruan terakhir.</p>
        <p>
          • Penundaan sinkronisasi sesekali mungkin terjadi. Kami sarankan untuk
          memeriksa data 48 jam setelah tanggal yang dipilih untuk hasil yang lebih akurat.
        </p>
      </div>
    </div>
  );
}
