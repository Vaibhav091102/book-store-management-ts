import { useState, useEffect, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { Link } from "react-router-dom";
import BackButton from "./BackButton";

// ✅ Define TypeScript types for books and API response
interface Book {
  _id: string;
  name: string;
  author: string;
  image?: string;
}

interface ApiResponse {
  success: boolean;
  data: Book[];
}

const SearchPage = () => {
  const [query, setQuery] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setBooks([]);
      return;
    }

    const fetchBooks = async () => {
      setLoading(true);
      setSearched(true);

      try {
        const res: AxiosResponse<ApiResponse> = await axios.get(
          `https://book-store-management-ts.onrender.com/api/get-books-by-search?search=${query}`
        );

        setBooks(res.data.data || []);
      } catch (err) {
        console.error("Error fetching books:", err);
      }

      setLoading(false);
    };

    // ✅ Clear the previous timeout before starting a new one
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(fetchBooks, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="input-group">
            <BackButton />
            <input
              type="text"
              className="form-control m-2 rounded-2"
              placeholder="Search books or author..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="btn btn-primary m-2 rounded-2 py-0"
              onClick={() => setSearched(true)}
            >
              Search
            </button>
          </div>

          {loading && <p className="text-primary">🔄 Searching...</p>}

          <ul className="list-group mt-3">
            {searched &&
              (books.length > 0 ? (
                books.map((book) => (
                  <Link
                    to={`/book/${book._id}`}
                    style={{ textDecoration: "none", color: "black" }}
                    key={book._id}
                  >
                    <li
                      className="list-group-item list-group-item-action rounded-2 d-flex align-items-center"
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={
                          book.image
                            ? `https://book-store-management-ts.onrender.com/${book.image.replace(
                                /\\/g,
                                "/"
                              )}`
                            : "/placeholder.png"
                        }
                        alt="Book Cover"
                        className="img-fluid me-2"
                        style={{
                          maxHeight: "40px",
                          objectFit: "cover",
                        }}
                      />
                      <div>
                        <strong>{book.name}</strong> by {book.author}
                      </div>
                    </li>
                  </Link>
                ))
              ) : (
                <p className="text-danger">❌ No books found</p>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
