import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import NavBarB from "../buyer/NavBarB";
import NavBar from "../Seller/NavBar";
import BackButton from "./BackButton";
import { Book, User, Seller } from "../../src/type"; // ✅ Import shared types

interface BookDetailsProps {
  user: User | null;
  seller: Seller | null;
  cartLength: number;
}
const BookDetails: React.FC<BookDetailsProps> = ({
  user,
  seller,
  cartLength,
}) => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const navigate = useNavigate();
  if (!user || !seller) {
    return <Navigate to="/login" replace />;
  }

  const handleAddToCart = async (book: Book) => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> =
        await axios.post("http://localhost:5000/api/cart/add", {
          userId: user?._id,
          productId: book.productId,
          bookId: book._id,
          quantity: 1,
        });

      if (response.data.success) {
        alert("Book added to cart successfully!");
        navigate("/buyer/cart");
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error adding book to cart:", error);
      alert("Failed to add book to cart.");
    }
  };

  const handleDelete = async (bookId: string) => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> =
        await axios.delete(
          `http://localhost:5000/api/products/delete-book/${bookId}`
        );

      if (response.data.success) {
        alert("Book deleted successfully!");
        navigate("/seller/mybook");
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete book. Please try again.");
    }
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response: AxiosResponse<{ data: Book }> = await axios.get(
          `http://localhost:5000/api/single-product-details/${bookId}`
        );
        setBook(response.data.data);
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  if (!book) {
    return <h3 className="text-center mt-5">Loading...</h3>;
  }

  return (
    <>
      {user && user.role === "buyer" ? (
        <NavBarB user={user} cartLength={cartLength} />
      ) : (
        <NavBar user={user} />
      )}
      <BackButton />
      <div className="container mt-0">
        <div className="row m-1">
          <div className="col-md-6 d-flex flex-column align-items-start">
            <img
              src={book.image}
              alt={book.name || "No Image Available"}
              className="img-fluid rounded shadow mb-3"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
            <h2>{book.name || "Unknown Title"}</h2>
          </div>

          <div className="col-md-6">
            <p className="text-muted">
              by{" "}
              <Link
                to={`/author/${encodeURIComponent(book.author)}`}
                className="text-primary"
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                {book.author || "Unknown Author"}
              </Link>
            </p>
            <h4 className="text-success">₹{book.price || "N/A"}</h4>
            <p>
              <strong>Publisher:</strong> {book.publisher}
            </p>
            <p>
              <strong>Published Year:</strong> {book.publishedYear}
            </p>
            <p>
              <strong>Available Copies:</strong> {book.availableCopies}
            </p>
            <p className="mt-3">{book.summary}</p>

            {user && user.role === "buyer" && (
              <Button variant="primary" onClick={() => handleAddToCart(book)}>
                Add to Cart
              </Button>
            )}
            {user &&
              user.role === "seller" &&
              book.sellerId === seller.user_id && (
                <>
                  <Button
                    variant="warning"
                    className="ms-2"
                    onClick={() => navigate(`/edit-book/${book._id}`)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="danger"
                    className="ms-2"
                    onClick={() => handleDelete(bookId!)}
                  >
                    Delete
                  </Button>
                </>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookDetails;
