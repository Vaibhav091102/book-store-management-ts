import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import axios, { AxiosError } from "axios";
import PropTypes from "prop-types";
import { Navigate, useNavigate } from "react-router-dom";
import BackButton from "./BackButton";

interface CartResponse {
  cart: CartItem[];
}
interface User {
  _id: string;
}

interface CartItem {
  book: Book; // ✅ Now contains the full book object
  quantity: number;
}
interface CartProps {
  user: User | null;
  setCartLength: (length: number) => void;
}

interface Book {
  _id: string;
  name: string;
  image?: string;
  price: number;
  availableCopies: number;
}

const Cart: React.FC<CartProps> = ({ user, setCartLength }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const handleCheckout = async () => {
    try {
      await axios.delete(`https://book-store-management-ts.onrender.com/api/cart/clearall/${user._id}`);
      setCartItems([]);
      setCartLength(0);
      navigate("/confirmation");
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        "Error during checkout:",
        axiosError.response?.data || axiosError.message
      );
    }
  };

  useEffect(() => {
    if (user?._id) {
      axios
        .get<CartResponse>(`https://book-store-management-ts.onrender.com/api/cart/${user._id}`)
        .then((res) => {
          console.log("API Response:", res.data);

          const formattedItems: CartItem[] = Array.isArray(res.data.cart)
            ? res.data.cart.map((item) => ({
                book: item.book || {
                  _id: "N/A",
                  name: "Unknown Book",
                  price: 0,
                  image: "",
                }, // ✅ Fallback for missing book
                quantity: item.quantity,
              }))
            : [];

          setCartItems(formattedItems);
          setCartLength(formattedItems.length);
        })
        .catch((error: unknown) => {
          const axiosError = error as AxiosError;
          console.error(
            "Error fetching cart:",
            axiosError.response?.data || axiosError.message
          );
        });
    }
  }, [user?._id, setCartLength]);

  const handleQuantityChange = async (
    bookId: string,
    delta: number,
    availableCopies: number = 0
  ) => {
    const updatedCartItems = cartItems.map((item) =>
      item.book?._id === bookId
        ? {
            ...item,
            quantity: Math.min(
              availableCopies || 0,
              Math.max(1, (item.quantity || 1) + delta)
            ),
          }
        : item
    );

    setCartItems(updatedCartItems);

    try {
      await axios.put(
        `https://book-store-management-ts.onrender.com/api/cart/update/${user._id}/${bookId}`,
        {
          quantity: updatedCartItems.find((item) => item.book?._id === bookId)
            ?.quantity,
        }
      );
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        "Error updating quantity:",
        axiosError.response?.data || axiosError.message
      );
    }
  };

  const handleRemove = async (bookId: string) => {
    try {
      await axios.delete(
        `https://book-store-management-ts.onrender.com/api/cart/clear/${user._id}/${bookId}`
      );
      setCartItems((prevItems) => {
        const updatedCart = prevItems.filter(
          (item) => item.book?._id !== bookId
        );
        setCartLength(updatedCart.length);
        return updatedCart;
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        "Error removing item:",
        axiosError.response?.data || axiosError.message
      );
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.book?.price || 0) * (item.quantity || 0),
      0
    );
  };

  if (!user) {
    return (
      <h3 className="text-center mt-5">Please log in to view your cart.</h3>
    );
  }

  return (
    <>
      <BackButton />
      <div
        className="cart-page-bg d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f2f2f2, #c9d6ff)",
          padding: "20px",
        }}
      >
        <div className="cart-container bg-white p-4 rounded shadow-lg w-75">
          <h2 className="text-center mb-4">Your Cart</h2>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Remove</th>
                <th>Image</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    Your cart is empty
                  </td>
                </tr>
              ) : (
                cartItems.map((item) => (
                  <tr key={item.book?._id || Math.random()}>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => handleRemove(item.book?._id)}
                      >
                        Remove
                      </Button>
                    </td>
                    <td>
                      {item.book?.image ? (
                        <img
                          src={`https://book-store-management-ts.onrender.com/${item.book.image.replace(
                            /\\/g,
                            "/"
                          )}`}
                          alt={item.book?.name || "Unknown Book"}
                          width="50"
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                    <td>{item.book?.name || "Unknown Book"}</td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(
                            item.book._id,
                            -1,
                            item.book.availableCopies
                          )
                        }
                        disabled={item.quantity === 1}
                      >
                        -
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(
                            item.book._id,
                            1,
                            item.book.availableCopies
                          )
                        }
                        disabled={item.quantity >= item.book.availableCopies}
                      >
                        +
                      </Button>
                    </td>
                    <td>₹{item.book?.price || 0}</td>
                    <td>₹{(item.book?.price || 0) * item.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="text-end">
            <h4>Total: ₹{calculateTotal()}</h4>
            {cartItems.length > 0 && (
              <Button
                variant="success"
                className="mt-3"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

Cart.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }).isRequired,
  setCartLength: PropTypes.func.isRequired,
};

export default Cart;
