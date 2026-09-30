import foto2 from "../assets/foto2.jpg";

export type Book = {
  id: number;
  title: string;
  rating: string;
  genre: string;
  readers: string;
  cover: string;
};

export const books: Book[] = [
  { id: 1, title: "Senja di Ujung Semesta", rating: "4.9", genre: "Fantasi", readers: "128K", cover: foto2 },
  { id: 2, title: "Di Bawah Hujan Biru", rating: "4.8", genre: "Romansa", readers: "95K", cover: foto2 },
  { id: 3, title: "Kastil di Atas Awan", rating: "4.7", genre: "Novel", readers: "85K", cover: foto2 },
  { id: 4, title: "Bisikan Sakura", rating: "4.8", genre: "Komik", readers: "72K", cover: foto2 },
];
