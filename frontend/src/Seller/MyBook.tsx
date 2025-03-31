import { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { Link, Navigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { Book, User, ApiResponse } from "../../src/type";

interface MyBookProps {
  user: User | null;
}

const MyBook: React.FC<MyBookProps> = ({ user }) => {
  const [books, setBooks] = useState<Book[]>([]);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res: AxiosResponse<ApiResponse<{ books: Book[] }[]>> =
          await axios.get(`https://book-store-management-ts.onrender.com/api/products/${user._id}`);

        const bookData = res.data.data;
        setBooks(
          Array.isArray(bookData) && bookData.length > 0
            ? bookData[0].books
            : []
        );
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    if (user._id) {
      fetchBooks();
    }
  }, [user._id]);

  return (
    <>
      <BackButton />
      <div className="container">
        <h2 className="text-center mb-3">My Books</h2>

        {books.length === 0 ? (
          <div className="text-center mt-4">
            <p>No books found. Please upload one.</p>
            <Link
              to={`/seller/add-book/${user._id}`}
              className="btn btn-primary"
            >
              Add Book
            </Link>
          </div>
        ) : (
          <div className="row">
            {books.map((book) => (
              <div className="col-md-3 mb-3" key={book._id}>
                <div className="card h-100 shadow-sm book-card">
                  <Link
                    to={`/book/${book._id}`}
                    className="text-decoration-none text-dark"
                  >
                    <img
                      src={
                        book.image
                          ? `http://localhost:5000/${book.image}`
                          : "/placeholder.png"
                      }
                      alt={book.name}
                      className="img-fluid"
                      loading="lazy"
                      style={{ height: "250px", objectFit: "cover" }}
                    />
                    <h5 className="m-1">{book.name}</h5>
                    <p className="m-2 text-muted">{book.author}</p>
                    <p className="m-2 text-primary fw-bold">₹{book.price}</p>
                  </Link>
                </div>
              </div>
            ))}
            <Link
              to={`/seller/add-book/${user._id}`}
              className="btn btn-primary m-2"
            >
              Add Book
            </Link>
          </div>
        )}
        <style>
          {`
          .book-card:hover {
            transform: scale(1.05);
            box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.3);
          }
          `}
        </style>
      </div>
    </>
  );
};

export default MyBook;
