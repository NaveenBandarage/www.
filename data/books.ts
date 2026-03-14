export type BookStatus = "read" | "reading" | "want-to-read";

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  coverSrc?: string;
  readYear?: number;
  year?: number;
  description?: string;
  genre?: string;
  status: BookStatus;
}

export const booksData: Book[] = [
  {
    id: "notes-on-being-a-man",
    title: "Notes on Being a Man",
    author: "Scott Galloway",
    isbn: "9781668084359",
    coverSrc: "/books/notes-on-being-a-man.jpg",
    readYear: 2026,
    status: "read",
  },
  {
    id: "shot-ready",
    title: "Shot Ready",
    author: "Stephen Curry",
    isbn: "9780593597293",
    coverSrc: "/books/shot-ready.jpg",
    readYear: 2026,
    status: "read",
  },
  {
    id: "go-higher",
    title: "Go Higher",
    author: "Big Sean",
    isbn: "9781668045732",
    coverSrc: "/books/go-higher.jpg",
    readYear: 2026,
    status: "read",
  },
  {
    id: "the-let-them-theory",
    title: "The Let Them Theory",
    author: "Mel Robbins",
    isbn: "9781401971366",
    coverSrc: "/books/the-let-them-theory.jpg",
    readYear: 2026,
    status: "read",
  },
  {
    id: "revenge-of-the-tipping-point",
    title: "Revenge of the Tipping Point",
    author: "Malcolm Gladwell",
    isbn: "9780316581509",
    coverSrc: "/books/revenge-of-the-tipping-point.jpg",
    readYear: 2026,
    status: "read",
  },
];
