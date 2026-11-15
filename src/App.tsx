import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import EmptyPage from "./pages/EmptyPage";
import KategoriDetail from "./pages/KategoriDetail";
import Original from "./pages/Original";
import Riwayat from "./pages/Riwayat";
import BacaDetail from "./pages/BacaDetail";
import Login from "./pages/Login";
import Profil from "./pages/Profil";
import EditProfil from "./pages/EditProfil";
import Favorit from "./pages/Favorit";
import DaftarAuthor from "./pages/DaftarAuthor";
import KreatorDetail from "./pages/KreatorDetail";
import AuthorDashboard from "./pages/author/AuthorDashboard";
import AuthorKarya from "./pages/author/AuthorKarya";
import AuthorTulis from "./pages/author/AuthorTulis";
import AuthorBuatSerial from "./pages/author/AuthorBuatSerial";
import AuthorNovelEditor from "./pages/author/AuthorNovelEditor";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { darkMode } = useTheme();
  const location = useLocation();

  // Deteksi mode membaca episode/bab aktif di halaman baca
  const searchParams = new URLSearchParams(location.search);
  const isReading =
    location.pathname.startsWith("/baca/") &&
    Boolean(searchParams.get("ep") || searchParams.get("read"));

  // Halaman tanpa navbar dan footer (login, daftar author, edit profil, mode membaca, novel editor)
  const isPureCardPage =
    location.pathname === "/login" ||
    location.pathname === "/daftar-author" ||
    location.pathname === "/profil/edit" ||
    location.pathname === "/edit-profil" ||
    location.pathname === "/author/novel-editor" ||
    isReading;

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } flex flex-col min-h-screen bg-[#DFE3E8] text-gray-900 transition-colors duration-300 dark:bg-[#0B1220] dark:text-white font-sans`}
    >
      {!isPureCardPage && <Navbar />}

      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/original" element={<Original />} />
          <Route path="/kategori/:type" element={<KategoriDetail />} />
          <Route path="/kategori" element={<Original />} />
          <Route path="/riwayat" element={<Riwayat />} />
          <Route path="/baca/:id" element={<BacaDetail />} />
          <Route path="/kreator/:id" element={<KreatorDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/profil/edit" element={<EditProfil />} />
          <Route path="/edit-profil" element={<EditProfil />} />
          <Route path="/favorit" element={<Favorit />} />
          <Route path="/daftar-author" element={<DaftarAuthor />} />
          <Route path="/author" element={<AuthorDashboard />} />
          <Route path="/author/buat-serial" element={<AuthorBuatSerial />} />
          <Route path="/author/karya/:id" element={<AuthorKarya />} />
          <Route path="/author/tulis" element={<AuthorTulis />} />
          <Route path="/author/novel-editor" element={<AuthorNovelEditor />} />
          <Route path="*" element={<EmptyPage />} />
        </Routes>
      </main>

      {!isPureCardPage && <Footer />}
    </div>
  );
}

export default App;
