import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import EmptyPage from "./pages/EmptyPage";
import KategoriDetail from "./pages/KategoriDetail";
import Original from "./pages/Original";

function App() {
  return (
    <div className="min-h-screen bg-[#0B1220] font-sans">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/original"
          element={<Original />}
        />

        <Route
          path="/kategori/:type"
          element={<KategoriDetail />}
        />

        <Route
          path="/kategori"
          element={<Original />}
        />

        <Route
          path="/riwayat"
          element={<EmptyPage />}
        />

        <Route
          path="/setting"
          element={<EmptyPage />}
        />

        <Route
          path="/login"
          element={<EmptyPage />}
        />

        <Route
          path="*"
          element={<EmptyPage />}
        />
      </Routes>
    </div>
  );
}

export default App;