import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card } from "react-bootstrap";

export default function Confirmation() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/buyer");
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [navigate]);

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Card
        className="text-center shadow p-4"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <Card.Body>
          <h1 className="text-success fw-bold">🎉 Congratulations! 🎉</h1>
          <p className="fs-4 text-muted">Your purchase was successful.</p>
        </Card.Body>
      </Card>
    </Container>
  );
}
