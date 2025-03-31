import NavBar from "./NavBar";
import { Link, Outlet, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import axios from "axios";

// ✅ Define types for Book and User
interface Book {
  _id: string;
  name: string;
  author: string;
  price: number;
  image?: string;
}

interface User {
  _id: string;
  name: string;
  role: string;
}

interface SellerHomeProps {
  reload: boolean;
}

// ✅ Axios response interface
interface GetAllProductsResponse {
  data: {
    books: Book[];
  }[];
}

export default function SellerHome({ reload }: SellerHomeProps) {
  const location = useLocation();
  const isDashboard = location.pathname === "/seller";
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // ✅ Fetch User from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setError("User not logged in");
    }
    setLoading(false);
  }, []);

  // ✅ Fetch Books from API
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    axios
      .get<GetAllProductsResponse>(
        "http://localhost:5000/api/get-all-product",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        const data = res.data.data;
        const books = data.flatMap((product) => product.books || []);
        setBooks(books);
      })
      .catch((err) => {
        console.error("Error fetching books:", err);
        setError("Failed to load books");
      });
  }, [reload]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <NavBar user={user} />
      <div className="container mt-1">
        {isDashboard ? (
          <>
            <h2 className="text-center mt-4">Welcome to Seller Dashboard</h2>
            <div className="container mt-4">
              {books.length === 0 ? (
                <div className="text-center mt-4">
                  <p>No books found. Please upload one.</p>
                </div>
              ) : (
                <div className="row">
                  {books.map((book) => (
                    <div className="col-md-3 mb-3" key={book._id}>
                      <div
                        className="card h-100 shadow-sm book-card"
                        style={{
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                        }}
                      >
                        <Link
                          to={`/book/${book._id}`}
                          className="text-decoration-none text-dark m-2"
                        >
                          <img
                            src={book.image}
                            alt={book.name}
                            className="img-fluid rounded"
                            style={{ height: "300px", objectFit: "cover" }}
                            onError={(e) =>
                              (e.currentTarget.src = "/placeholder.png")
                            }
                          />
                          <h5 className="m-1">{book.name}</h5>
                          <p className="m-2 text-muted">{book.author}</p>
                          <p className="m-2 text-primary fw-bold">
                            ₹{book.price}
                          </p>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <Outlet />
        )}
      </div>
      <style>
        {`
          .book-card:hover {
            transform: scale(1.03);
            box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
          }
        `}
      </style>
    </div>
  );
}

// ✅ Add PropTypes for type validation
SellerHome.propTypes = {
  reload: PropTypes.bool.isRequired,
};
