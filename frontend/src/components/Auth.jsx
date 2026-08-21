import { useState } from "react";
import API from "../api";

export default function Auth({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend check: enforce minimum password length before sending request
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const endpoint = isSignUp ? "/auth/register" : "/auth/login";
    try {
      const { data } = await API.post(endpoint, formData);
      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } catch (err) {
      // Catch backend validation errors or server errors
      const apiMessage =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Something went wrong";

      setError(apiMessage);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc" }}>
      <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          {isSignUp ? "Register" : "Sign In"}
        </button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)} style={{ marginTop: "10px" }}>
        {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
      </button>
    </div>
  );
}