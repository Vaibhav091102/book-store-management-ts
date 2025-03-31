import { NavLink } from "react-router-dom";

interface User {
  _id: string;
}

interface NavBarProps {
  user: User | null; // ✅ Allow null here
}

const NavBar: React.FC<NavBarProps> = ({ user }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
      <NavLink className="navbar-brand d-flex align-items-center" to="/seller">
        QuickKart
      </NavLink>

      <div className="ms-auto">
        <NavLink to="/search" className="btn btn-outline-light me-2">
          🔍
        </NavLink>
        <NavLink to="/seller/mybook" className="btn btn-outline-light me-2">
          My Book
        </NavLink>
        {user ? (
          <NavLink
            to={`/seller/profile/${user._id}`}
            className="btn btn-outline-light"
          >
            Profile
          </NavLink>
        ) : (
          <NavLink to="/login" className="btn btn-outline-light">
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
