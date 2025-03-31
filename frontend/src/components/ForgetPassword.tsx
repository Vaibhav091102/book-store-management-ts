import { useState, ChangeEvent, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

interface FormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

interface Message {
  text: string;
  type: "success" | "danger";
}

const ForgetPassword: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<Message | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://book-store-management-ts.onrender.com/api/auth/forget-password",
        formData
      );

      setMessage({ text: "Password change successful!", type: "success" });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      const axiosError = error as AxiosError;
      setMessage({
        text: axiosError.response?.data?.message || "Process failed",
        type: "danger",
      });
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">Change Password</h2>

            {message && (
              <div className={`alert alert-${message.type}`} role="alert">
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-control"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Change Password
              </button>
            </form>

            <div className="d-flex justify-content-between mt-3 text-sm">
              <p>
                Do not have an account?{" "}
                <a href="/signup" className="text-primary">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
