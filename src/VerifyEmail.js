import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3007";


export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); 
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verifyEmail = async () => {
      try {
        console.log("🔹 Sending verification request with token:", token);

       const res = await axios.post(
            `${API_URL}/api/auth/verify-email`,
            { token },
            {
              headers: { "Content-Type": "application/json" },
            }
          );


        console.log(" Backend response:", res);

        if (res.data && res.data.success) {
          setStatus("success");
          setMessage(res.data.message || "Email verified successfully!");
         
          setTimeout(() => {
            navigate("/signin");
          }, 10000);
        } else {
          setStatus("error");
          setMessage(res.data.message || "Verification failed.");
        }
      } catch (err) {
        console.error(" Verification error:", err.response || err);

        const backendMessage =
          err.response?.data?.message ||
          "Verification failed or token expired.";
        setStatus("error");
        setMessage(backendMessage);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === "loading" && <h2>Verifying your email...</h2>}

        {status === "success" && (
          <>
            <h2 style={{ color: "green" }}>Email Verified</h2>
            <p>{message}</p>
            <p>Redirecting to login...</p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 style={{ color: "red" }}>Verification Failed</h2>
            <p>{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
};
