import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1220] transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-12 md:py-16">
        {/* Top: Brand Rata Kiri & Navigasi Rata Kanan */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-gray-100 dark:border-white/10">
          {/* Sisi Kiri: Brand & Deskripsi */}
          <div className="flex flex-col gap-3 max-w-md text-left">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="bg-blue-500/10 dark:bg-white/10 p-2 rounded-xl flex items-center justify-center border border-blue-500/20 dark:border-white/10">
                <BookOpen className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Ever<span className="text-blue-500 dark:text-blue-400">Tale</span>
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Dunia cerita digital tempat jutaan pembaca dan kreator bertemu. Baca, tulis, dan temukan novel serta komik terbaik setiap hari.
            </p>
          </div>

          {/* Sisi Kanan: Navigasi Tautan */}
          <nav className="flex flex-wrap items-center gap-x-8 sm:gap-x-10 gap-y-3.5 text-sm font-semibold text-gray-700 dark:text-slate-300 md:justify-end">
            <Link to="/" className="hover:text-blue-500 dark:hover:text-white transition-colors">
              Beranda
            </Link>
            <Link to="/kategori/novel" className="hover:text-blue-500 dark:hover:text-white transition-colors">
              Novel
            </Link>
            <Link to="/kategori/komik" className="hover:text-blue-500 dark:hover:text-white transition-colors">
              Komik
            </Link>
            <Link to="/original" className="hover:text-blue-500 dark:hover:text-white transition-colors">
              Jadwal Update
            </Link>
            <Link to="/daftar-author" className="hover:text-blue-500 dark:hover:text-white transition-colors">
              Gabung Jadi Kreator
            </Link>
          </nav>
        </div>

        {/* Bottom: Copyright di Tengah */}
        <div className="pt-8 flex items-center justify-center text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            © {currentYear} EverTale. Semua hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
