import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import HomePage from "./components/HomePage";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import About from "./components/About";
import SellerHome from "./Seller/SellerHome";
import BuyerHome from "./buyer/BuyerHome";
import { useEffect, useState } from "react";
import MyBook from "./Seller/MyBook";
import Profile from "./components/Profile";
import ForgetPassword from "./components/ForgetPassword";
import AddBook from "./Seller/AddBook";
import BookDetails from "./components/BookDetails";
import Cart from "./components/Cart";
import Confirmation from "./components/Confirmation";
import SearchPage from "./components/SearchPage";
import EditBook from "./components/EditBook";
import AuthorDetails from "./components/AuthorDetails";

// ✅ Define Types for User and Seller
interface User {
  _id: string;
  name: string;
  email: string;
  role: "buyer" | "seller";
}

interface Seller {
  _id: string;
  bookstore_name: string;
  address: string;
  phone: string;
}

interface ProtectedRouteProps {
  user: User | null;
  role: "buyer" | "seller";
  children: React.ReactNode;
}

// ✅ Protected Route Component with TypeScript Types
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  user,
  role,
  children,
}) => {
  if (!user) return <Navigate to="/login" replace />;
  return user.role === role ? children : <Navigate to="/" replace />;
};

// ✅ Main App Component
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [bookId, setBookId] = useState<string | null>(null);
  const [reload, setReload] = useState(false);
  const [cartLength, setCartLength] = useState<number>(0);

  // ✅ Function to trigger re-fetch
  const refreshBooks = () => setReload((prev) => !prev);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User; // ✅ Type assertion
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/login"
          element={
            <Login
              setUser={setUser}
              setSeller={setSeller}
              setCartLength={setCartLength}
            />
          }
        />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/about" element={<About />} />

        {/* ✅ Buyer Routes */}
        <Route
          path="/buyer"
          element={
            <ProtectedRoute user={user} role="buyer">
              <BuyerHome cartLength={cartLength} />
            </ProtectedRoute>
          }
        >
          <Route path="profile/:id" element={<Profile />} />
          {/* <Route path="mybooks" element={<MyBook user={user} />} /> */}
          <Route
            path="cart"
            element={<Cart user={user} setCartLength={setCartLength} />}
          />
        </Route>

        <Route path="/confirmation" element={<Confirmation />} />

        {/* ✅ Seller Routes */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute user={user} role="seller">
              <SellerHome reload={reload} />
            </ProtectedRoute>
          }
        >
          <Route path="profile/:id" element={<Profile />} />
          <Route path="mybook" element={<MyBook user={user} />} />
          <Route
            path="add-book/:id"
            element={<AddBook user={user} refreshBooks={refreshBooks} />}
          />
        </Route>

        <Route
          path="/book/:bookId"
          element={
            <BookDetails
              user={user}
              seller={seller as Seller}
              // bookId={bookId}
              cartLength={cartLength}
            />
          }
        />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/edit-book/:bookId" element={<EditBook />} />
        <Route
          path="/author/:authorName"
          element={<AuthorDetails user={user} cartLength={cartLength} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
