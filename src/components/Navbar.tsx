import { Search, Bell, Moon, ChevronDown } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { navLinks } from "../data/navLinks";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0B1220]/90 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-7 md:px-12 lg:px-16">

        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">
              Ever<span className="text-blue-400">Tale</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              link.label === "Kategori" ? (
                <div key={link.path} className="relative group py-2">
                  <NavLink
                    to={link.path}
                    className="text text-slate-300 transition-colors hover:text-white flex items-center gap-1">
                    {link.label}
                    <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                  </NavLink>
                  <div className="absolute left-0 top-full mt-1 w-36 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="rounded-lg bg-[#0B1220] border border-white/10 shadow-xl overflow-hidden flex flex-col py-2">
                      <Link
                        to="/kategori/novel"
                        className="px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                        Novel
                      </Link>
                      <Link
                        to="/kategori/komik"
                        className="px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                        Komik
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="text text-slate-300 transition-colors hover:text-white">
                  {link.label}
                </NavLink>
              )
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            aria-label="Cari"
            className="text-slate-300 transition-colors hover:text-white">
            <Search className="h-5 w-5" />
          </button>

          <button
            aria-label="Notifikasi"
            className="text-slate-300 transition-colors hover:text-white">
            <Bell className="h-5 w-5" />
          </button>

          <button
            aria-label="Ganti tema"
            className="text-slate-300 transition-colors hover:text-white">
            <Moon className="h-5 w-5" />
          </button>

          <NavLink
            to="/login"
            className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-400">
            Login / Register
          </NavLink>
        </div>
      </div>
    </header>
  );
}