import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Bold, Italic, List, AlignLeft,
  AlignCenter, Eye, Save, Send,
} from "lucide-react";

export default function AuthorTulis() {
  const [title, setTitle] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [content, setContent] = useState("");
  const [genre, setGenre] = useState("Fantasi");
  const [preview, setPreview] = useState(false);

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;

  return (
    <div className="min-h-[calc(100vh-72px)] px-4 py-8 md:px-10 lg:px-14">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          to="/author"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">Tulis Episode Baru</h1>

        {/* Meta fields */}
        <div className="flex flex-col gap-3 mb-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul Serial (contoh: Senja di Ujung Semesta)"
            className="w-full bg-[#101726] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />

          <div className="flex gap-3">
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Judul Episode (contoh: Ep. 1 — Awal Mula)"
              className="flex-1 bg-[#101726] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-[#101726] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            >
              {["Fantasi", "Romansa", "Drama", "Horror", "Komedi", "Novel", "Komik"].map((g) => (
                <option key={g} value={g} className="bg-[#101726]">{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 rounded-t-xl bg-[#101726] border border-white/10 border-b-0">
          <div className="flex items-center gap-0.5">
            {[
              { Icon: Bold, label: "Bold" },
              { Icon: Italic, label: "Italic" },
              { Icon: List, label: "List" },
              { Icon: AlignLeft, label: "Rata Kiri" },
              { Icon: AlignCenter, label: "Rata Tengah" },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* Preview toggle */}
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              preview
                ? "bg-blue-500/20 text-blue-400"
                : "text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            {preview ? "Edit" : "Preview"}
          </button>
        </div>

        {/* Editor / Preview */}
        {preview ? (
          <div className="min-h-[320px] bg-[#101726] border border-white/10 rounded-b-xl px-6 py-5 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {content || <span className="text-slate-600 italic">Belum ada konten...</span>}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Mulai menulis episode di sini..."
            rows={16}
            className="w-full bg-[#101726] border border-white/10 rounded-b-xl px-5 py-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
          />
        )}

        {/* Word count + Actions */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-600">{wordCount} kata</p>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:border-white/20 transition-colors">
              <Save className="h-4 w-4" />
              Simpan Draft
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 active:scale-[0.98] transition-all">
              <Send className="h-4 w-4" />
              Terbitkan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
