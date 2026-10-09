import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import EmptyPage from "./pages/EmptyPage";
import KategoriDetail from "./pages/KategoriDetail";
import Original from "./pages/Original";
import Riwayat from "./pages/Riwayat";
import BacaDetail from "./pages/BacaDetail";
import Login from "./pages/Login";

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
          path="/Riwayat"
          element={<Riwayat />}
        />

        <Route
          path="/baca/:id"
          element={<BacaDetail />}
        />


        <Route
          path="/login"
          element={<Login />}
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