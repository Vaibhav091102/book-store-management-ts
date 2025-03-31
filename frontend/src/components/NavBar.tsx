import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
        <NavLink className="navbar-brand fw-bold" to="/">
          QuickKart
        </NavLink>

        <div className="ms-auto">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `btn me-2 ${isActive ? "btn-light" : "btn-outline-light"}`
            }
          >
            About Us
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `btn ${isActive ? "btn-light" : "btn-outline-light"}`
            }
          >
            Login
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
