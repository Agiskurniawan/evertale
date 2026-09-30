import HeroSection from "../components/HeroSection";
import Buku from "../components/Buku";
import Populer from "../components/populer";
import Kategori from "../components/Kategori";

export default function Home() {
    return (
    <>
    <HeroSection />
    <Buku />
    <Populer />
    <Kategori />
    </>
);
}