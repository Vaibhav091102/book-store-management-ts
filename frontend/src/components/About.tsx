import Footer from "./footer";
import NavBar from "./NavBar";
import BackButton from "./BackButton";

const AboutUs = () => {
  return (
    <>
      <NavBar />
      <BackButton />
      <div className="container mt-5">
        {/* About Us Section */}
        <div className="text-center mb-4">
          <h2 className="fw-bold">About Us</h2>
          <p className="lead">Connecting buyers and sellers seamlessly.</p>
        </div>

        {/* Our Experience Section */}
        <div className="card shadow p-4 mb-5">
          <h3 className="fw-bold">Our Experience</h3>
          <p>
            With years of experience in the e-commerce industry, we have built a
            trusted platform that helps buyers find the best products and
            sellers grow their businesses.
          </p>
        </div>

        {/* Our Platform Section */}
        <div className="card shadow p-4 mb-5">
          <h3 className="fw-bold">Our Platform</h3>
          <ul className="list-group">
            <li className="list-group-item">✔️ Secure & Fast Transactions</li>
            <li className="list-group-item">✔️ Verified Buyers & Sellers</li>
            <li className="list-group-item">✔️ 24/7 Customer Support</li>
            <li className="list-group-item">✔️ Easy-to-Use Interface</li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
