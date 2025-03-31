import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import BackButton from "./BackButton";
import NavBar from "../Seller/NavBar";
import NavBarB from "../buyer/NavBarB";

// ✅ Updated User Interface with missing properties
interface User {
  _id: string;
  name: string;
  role: string;
}

interface Book {
  _id: string;
  name: string;
  price: number;
  image: string;
}

interface BooksResponse {
  success: boolean;
  books: Book[];
}

interface WikipediaResponse {
  extract?: string;
}

interface AuthorDetailsProps {
  user: User | null;
  cartLength: number; // Added cartLength
}

const AuthorDetails: React.FC<AuthorDetailsProps> = ({ user, cartLength }) => {
  const { authorName } = useParams<{ authorName?: string }>();
  const [books, setBooks] = useState<Book[]>([]);
  const [authorInfo, setAuthorInfo] = useState<string>("");

  useEffect(() => {
    const fetchBooks = async () => {
      if (!authorName) return;

      try {
        const response: AxiosResponse<BooksResponse> = await axios.get(
          `https://book-store-management-ts.onrender.com/api/books-by-author/${authorName}`
        );
        console.log(response);
        if (response.data?.success) {
          setBooks(response.data.books || []);
        } else {
          console.error("No books found or invalid response:", response.data);
          setBooks([]);
        }
        console.log(books);
      } catch (error) {
        console.log(authorName);
        console.error("Error fetching books:", error);
        setBooks([]);
        console.log(books);
      }
    };

    const fetchWikipediaInfo = async () => {
      if (!authorName) return;

      try {
        const wikiResponse: AxiosResponse<WikipediaResponse> = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            authorName
          )}`
        );

        setAuthorInfo(wikiResponse.data.extract || "");
      } catch (error) {
        console.error("Error fetching author info:", error);
        setAuthorInfo("No information available.");
      }
    };

    fetchBooks();
    fetchWikipediaInfo();
  }, [authorName]);

  return (
    <>
      {user?.role === "buyer" ? (
        <NavBarB user={user} cartLength={cartLength} />
      ) : (
        <NavBar user={user} />
      )}
      <BackButton />
      <div className="container">
        <h2>{authorName}</h2>

        {/* Author Wikipedia Info */}
        {authorInfo && (
          <div className="alert alert-info">
            <strong>About {authorName}:</strong>
            <p>{authorInfo}</p>
          </div>
        )}

        {/* Display Books */}
        <div className="row">
          {books.length > 0 ? (
            books.map((book) => (
              <div key={book._id} className="col-md-3 mb-4">
                <div
                  className="card shadow"
                  style={{ width: "15rem", height: "100%" }}
                >
                  <div className="text-center img-fluid">
                    <img
                      src={`http://localhost:5000/${book.image}`}
                      className="card-img-top"
                      alt={book.name}
                      style={{
                        width: "80%",
                        height: "90%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{book.name}</h5>
                    <p className="text-success">₹{book.price}</p>
                    <Link
                      to={`/book/${book._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No books found by this author.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthorDetails;
