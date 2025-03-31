import { useState, ChangeEvent, FormEvent } from "react";
import axios, { AxiosResponse } from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";

// ✅ Interfaces for props
interface User {
  _id: string;
}

interface AddBookProps {
  user: User | null;
  refreshBooks: () => void;
}

// ✅ Interface for book data
interface BookData {
  name: string;
  author: string;
  price: string;
  summary: string;
  publisher: string;
  publishedYear: string;
  availableCopies: number;
}

const AddBook: React.FC<AddBookProps> = ({ user, refreshBooks }) => {
  const [bookData, setBookData] = useState<BookData>({
    name: "",
    author: "",
    price: "",
    summary: "",
    publisher: "",
    publishedYear: "",
    availableCopies: 1,
  });
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBookData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle image upload
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file)); // Preview the uploaded image
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();

    // Append text fields
    Object.entries(bookData).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    // Append image if available
    if (image) {
      formData.append("image", image);
    }

    try {
      const response: AxiosResponse = await axios.post(
        `http://localhost:5000/api/products/${user._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        setSuccess("Book uploaded successfully!");
        refreshBooks();
        setTimeout(() => navigate("/seller/mybook"), 1000);
      } else {
        setError("Failed to upload the book.");
      }
    } catch (err: any) {
      console.error("Error uploading book:", err);
      setError("Failed to upload the book.");
    }
  };

  return (
    <Container className="my-5">
      <Card className="p-4 shadow-sm rounded">
        <h3 className="text-center mb-4">Add New Book</h3>

        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Book Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter book name"
              value={bookData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Author</Form.Label>
            <Form.Control
              type="text"
              name="author"
              placeholder="Enter author name"
              value={bookData.author}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Price (₹)</Form.Label>
            <Form.Control
              type="number"
              name="price"
              placeholder="Enter price"
              value={bookData.price}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Summary</Form.Label>
            <Form.Control
              as="textarea"
              name="summary"
              placeholder="Enter a short summary"
              value={bookData.summary}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Publisher</Form.Label>
            <Form.Control
              type="text"
              name="publisher"
              placeholder="Enter publisher name"
              value={bookData.publisher}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Published Year</Form.Label>
            <Form.Control
              type="number"
              name="publishedYear"
              placeholder="Enter year"
              value={bookData.publishedYear}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Available Copies</Form.Label>
            <Form.Control
              type="number"
              name="availableCopies"
              placeholder="Enter number of copies"
              value={bookData.availableCopies}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Upload Book Cover</Form.Label>
            <Form.Control type="file" onChange={handleImageChange} required />
            {preview && (
              <img
                src={preview}
                alt="Book Cover Preview"
                className="mt-3 rounded"
                width="50px"
                height="50px"
              />
            )}
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Add Book
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default AddBook;
