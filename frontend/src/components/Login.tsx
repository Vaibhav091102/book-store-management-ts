import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ✅ Import global types
import { User, Seller } from "../../src/type";

// ✅ Define component props with TypeScript
interface LoginProps {
  setUser: (user: User | null) => void;
  setSeller: (seller: Seller | null) => void;
  setCartLength: (length: number) => void;
}

// ✅ Define the component
const Login: React.FC<LoginProps> = ({ setUser, setSeller, setCartLength }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "danger";
  } | null>(null);
  const [localUser, setLocalUser] = useState<User | null>(null); // ✅ Local user state
  const navigate = useNavigate();

  // ✅ Handle input changes
  const HandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submission
  const HandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      const userData: User = res.data.user;
      const token = res.data.token;
      const sellerDetails: Seller = res.data.sellerDetails;

      setSeller(sellerDetails);
      setUser(userData);
      setLocalUser(userData); // ✅ Store locally

      // ✅ Store data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      localStorage.setItem("seller", JSON.stringify(sellerDetails));

      setMessage({ text: "Login successful!", type: "success" });

      setTimeout(() => {
        if (userData.role === "buyer") {
          navigate("/buyer");
        } else {
          navigate("/seller");
        }
      }, 0);
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || "Login failed",
        type: "danger",
      });
    }
  };

  // ✅ Fetch cart length after login
  useEffect(() => {
    if (localUser?._id) {
      axios
        .get(`http://localhost:5000/api/cart/${localUser._id}`)
        .then((res) => {
          const formattedItems = Array.isArray(res.data.cart)
            ? res.data.cart
            : [];
          setCartLength(formattedItems.length);
        })
        .catch((err) => console.error("Error fetching cart:", err));
    }
  }, [localUser, setCartLength]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">Login</h2>

            {message && (
              <div className={`alert alert-${message.type}`} role="alert">
                {message.text}
              </div>
            )}

            <form onSubmit={HandleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={HandleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={HandleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>
            </form>

            <div className="d-flex justify-content-between mt-3 text-sm">
              <p>
                Do not have an account?{" "}
                <a href="/signup" className="text-primary">
                  Sign up
                </a>
              </p>
              <a href="/forget-password" className="text-primary">
                Forgot Password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
