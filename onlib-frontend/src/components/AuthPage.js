import React, { useState } from "react";
import "./AuthPage.css";

const AuthPage = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async () => {
    const endpoint = isRegistering ? "/users/register" : "/users/login";
    const body = isRegistering ? { name, email, password } : { email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const user = await response.json();

        // Adicione este log para inspecionar a resposta
        console.log("Response from backend:", user);

        if (user && user.id) {
          // Verificar e armazenar corretamente o userId
          localStorage.setItem("userId", user.id.toString()); // Certifique-se de que seja uma string
          console.log("Stored User ID:", localStorage.getItem("userId"));
        } else {
          console.error("User object or user.id is missing in the response");
        }

        onAuthSuccess(user);
        setError(null);
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || "Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h1>{isRegistering ? "Register" : "Login"}</h1>
      {isRegistering && (
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleAuth}>
        {isRegistering ? "Register" : "Login"}
      </button>
      <button className="switch-button" onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? "Switch to Login" : "Switch to Register"}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AuthPage;