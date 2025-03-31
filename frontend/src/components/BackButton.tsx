import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} className="border-1 rounded-5 m-2">
      <strong>←</strong>
    </button>
  );
};

export default BackButton;
