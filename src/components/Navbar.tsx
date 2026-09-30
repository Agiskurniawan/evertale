import { Search, Bell, Moon, } from "lucide-react";
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
              <NavLink
                key={link.path}
                to={link.path}
                className="text text-slate-300 transition-colors hover:text-white">
                {link.label}
              </NavLink>
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