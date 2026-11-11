export type BookType = "novel" | "komik";

export type Category = { id: number; name: string };

export type Book = {
  id: number;
  title: string;
  type: BookType;
  cover: string | null;
  banner: string | null;
  genre: string;
  genres: string[];
  rating: string;
  readers: string;
  views: string;
  likes: string;
  update_day: string | null;
  story_status: "ongoing" | "selesai";
  author: { id: number; name: string; avatar: string | null } | null;
  synopsis?: string | null; // hanya ada pada permintaan featured=1 (hero)
};

export type BookList = {
  data: Book[];
  meta: { total: number; page: number; limit: number };
};

export type BookDetail = Book & {
  synopsis: string | null;
  language: string;
  rating_count: number;
  chapter_count: number;
  first_chapter_id: number | null;
  is_favorite: boolean;
  my_rating: number | null;
  is_published: boolean;
};

export type Episode = {
  id: number;
  number: number;
  num: string;
  label: string;
  title: string;
  img: string | null;
  date: string;
  likes: string;
  liked: boolean;
};

export type HistoryItem = {
  id: number; // id karya (untuk link /baca/:id)
  chapter_id: number | null;
  title: string;
  cover: string | null;
  lastReadLabel: string;
  progress: number;
  last_read_at: string;
};

export type HistoryGroup = { date: string; items: HistoryItem[] };

export type Kreator = {
  id: number;
  name: string;
  avatar: string | null;
  works: number;
  followers: string;
  genre: string;
};

export type AuthorSerial = {
  id: number;
  title: string;
  type: BookType;
  cover: string | null;
  episodes: number;
  drafts: number;
  updated: string;
  lang: string;
  tags: string[];
  status: string;
};

export type AuthorChapterRow = {
  id: number;
  no: number;
  title: string;
  words: string;
  date: string;
  status: "Terbit" | "Draft";
};

export type AuthorSerialDetail = {
  id: number;
  title: string;
  type: BookType;
  genre: string;
  tags: string[];
  desc: string | null;
  cover: string | null;
  lang: string;
  category_ids: number[];
  update_day: string | null;
  story_status: "ongoing" | "selesai";
  is_published: boolean;
  status: string;
  episodes: number;
  readers: string;
  rating: string;
  updated: string;
  chapters: AuthorChapterRow[];
};

export type AuthorChapterEdit = {
  id: number;
  book_id: number;
  chapter_number: number;
  title: string;
  content: string | null;
  thumbnail_url?: string | null;
  pages?: string[];
  is_published: boolean;
};

export type User = {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  role: "user" | "author" | "admin";
  is_author: boolean;
  is_admin: boolean;
};
