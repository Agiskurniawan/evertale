import foto2 from "../assets/foto2.jpg";

export type HistoryItem = {
  id: number;
  title: string;
  lastReadLabel: string;
  progress: number;
  cover: string;
};

export type HistoryGroup = {
  date: string;
  items: HistoryItem[];
};

export const readingHistory: HistoryGroup[] = [
  {
    date: "14 Oktober 2023",
    items: [
      {
        id: 1,
        title: "Senja di Ujung Semesta",
        lastReadLabel: "Bab 12",
        progress: 55,
        cover: foto2,
      },
      {
        id: 2,
        title: "Nara: Kota Tanpa Pagi",
        lastReadLabel: "Episode 7",
        progress: 27,
        cover: foto2,
      },
    ]
  },
  {
    date: "13 Oktober 2023",
    items: [
      {
        id: 3,
        title: "Di Bawah Hujan Biru",
        lastReadLabel: "Episode 20",
        progress: 77,
        cover: foto2,
      },
      {
        id: 3,
        title: "Di Bawah Hujan Biru",
        lastReadLabel: "Episode 20",
        progress: 77,
        cover: foto2,
      },
    ]
  },
  {
    date: "10 Oktober 2023",
    items: [
      {
        id: 4,
        title: "Pewaris Gerbang Utara",
        lastReadLabel: "Episode 3",
        progress: 10,
        cover: foto2,
      },
      {
        id: 5,
        title: "Sebelum Rindu Usai",
        lastReadLabel: "Bab 15",
        progress: 83,
        cover: foto2,
      },
    ]
  }
];
