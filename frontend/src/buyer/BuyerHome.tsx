import { Link, useLocation } from "react-router-dom";
import NavBar from "./NavBarB";
import { useEffect, useState } from "react";
import axios from "axios";
import * as Router from "react-router-dom";

// ✅ Type definitions
interface Book {
  _id: string;
  name: string;
  price: number;
  image: string;
  author: string;
}

interface User {
  _id: string;
  name: string;
  role: string;
}

interface BuyerHomeProps {
  cartLength: number;
}

const Outlet = Router.Outlet;

const BuyerHome: React.FC<BuyerHomeProps> = ({ cartLength }) => {
  const location = useLocation();
  const isDashboard = location.pathname === "/buyer";
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setError("User not logged in");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    axios
      .get("https://book-store-management-ts.onrender.com/api/get-all-product", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = (res.data as { data: { books: any[] }[] }).data;
        const books = data.flatMap((product) => product.books || []);
        setBooks(books);
        console.log(books);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <NavBar user={user} cartLength={cartLength} />
      {isDashboard ? (
        <div className="container mt-1">
          <h2 className="text-center mt-4">Welcome to Buyer Dashboard</h2>
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
                      className="card h-100 shadow-sm book-card "
                      style={{
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
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
                          style={{ maxHeight: "400px", objectFit: "cover" }}
                          // onError={(e) =>
                          //   (e.currentTarget.src = "default-image.jpg")
                          // }
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
        </div>
      ) : (
        <Outlet />
      )}
      <style>
        {`
          .book-card:hover {
            transform: scale(1.03);
            box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
          }
        `}
      </style>
    </>
  );
};

export default BuyerHome;
