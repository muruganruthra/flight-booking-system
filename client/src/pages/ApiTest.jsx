import { useEffect, useState } from "react";
import api from "../services/api";

function ApiTest() {
  const [message, setMessage] = useState("Connecting to server...");
  const [error, setError] = useState("");

  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await api.get("/health");

        setMessage(response.data.message);
      } catch (error) {
        console.error(error);

        setError("Unable to connect to backend server.");
      }
    };

    testAPI();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1>✈️ Flight Booking System</h1>

        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <p style={{ color: "green" }}>{message}</p>
        )}
      </div>
    </div>
  );
}

export default ApiTest;