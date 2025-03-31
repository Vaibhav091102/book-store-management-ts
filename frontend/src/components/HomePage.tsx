import { Link } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";
import { Button } from "react-bootstrap";

const HomePage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />
      <div className="container text-center flex-grow-1 mt-5">
        <h1>Welcome to Our Platform!</h1>
        <p className="lead">A great place for buyers and sellers.</p>
        <Button as={Link} to="/login" variant="primary">
          Login
        </Button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
