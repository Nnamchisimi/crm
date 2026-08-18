import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "user") {
        navigate("/signin", { replace: true });
      }
    } catch (err) {
      navigate("/signin", { replace: true });
    }
  }, [navigate]);
};

export default useAuth;
