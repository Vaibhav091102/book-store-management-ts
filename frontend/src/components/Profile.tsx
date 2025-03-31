import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "./BackButton";

// ✅ Define Types
interface User {
  _id: string;
  name: string;
  email: string;
  role: "buyer" | "seller";
}

interface SellerInfo {
  bookstore_name: string;
  address: string;
  phone: string;
}

interface FormData {
  name: string;
  address: string;
  phone: string;
}

export default function Profile() {
  const { id } = useParams<{ id: string }>(); // ✅ Type safety for route params
  const [profileData, setProfileData] = useState<User | null>(null);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    phone: "",
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.reload();
    navigate("/login");
  };

  // ✅ Fetch profile data with proper typing
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get<{
          user: User;
          sellerInfo?: SellerInfo;
        }>(`https://book-store-management-ts.onrender.com/api/profile/${id}`);

        const { user, sellerInfo } = response.data;
        setProfileData(user);
        if (sellerInfo) setSellerInfo(sellerInfo);

        // Set initial form data
        setFormData({
          name: user.name || "",
          address: sellerInfo?.address || "",
          phone: sellerInfo?.phone || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    if (id) fetchProfileData();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put<{ user: User; sellerInfo?: SellerInfo }>(
        `https://book-store-management-ts.onrender.com/api/profile/update/${id}`,
        formData
      );

      const { user, sellerInfo } = response.data;
      setProfileData(user);
      if (sellerInfo) setSellerInfo(sellerInfo);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!profileData) {
    return <p>Loading profile...</p>;
  }

  return (
    <>
      <BackButton />
      <div className="container text-center">
        {/* Profile Picture */}
        <img
          src={"/blank-profile-picture-973460_1280.webp"}
          alt="Profile"
          className="rounded-circle mb-3"
          width="150"
          height="150"
        />

        {/* Information Table */}
        <table className="table table-bordered mt-4">
          <tbody>
            <tr>
              <th>Name</th>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                  />
                ) : (
                  formData.name
                )}
              </td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{profileData.email}</td>
            </tr>
            {profileData.role === "seller" && sellerInfo && (
              <>
                <tr>
                  <th>Bookstore Name</th>
                  <td>{sellerInfo.bookstore_name}</td>
                </tr>
                <tr>
                  <th>Phone</th>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control"
                      />
                    ) : (
                      sellerInfo.phone
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Address</th>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="form-control"
                      />
                    ) : (
                      sellerInfo.address
                    )}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Edit/Save Button */}
        {!isEditing ? (
          <button className="btn btn-primary m-3" onClick={handleEdit}>
            Edit Profile
          </button>
        ) : (
          <button className="btn btn-success m-3" onClick={handleSave}>
            Save Changes
          </button>
        )}
        <button className="btn btn-danger m-3" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  );
}
