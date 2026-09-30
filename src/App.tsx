import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import EmptyPage from "./pages/EmptyPage";

function App() {
  return (
    <div className="min-h-screen bg-[#0B1220] font-sans">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/original"
          element={<EmptyPage />}
        />

        <Route
          path="/kategori"
          element={<EmptyPage />}
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