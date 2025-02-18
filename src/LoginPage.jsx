import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import loginimage from "./images/loginimage.jpg";
import axios from "axios";

function LoginPage() {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "", // For forgot password
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        let url;
        let requestData;

        if (isForgotPassword) {
            url = `${process.env.REACT_APP_API_URL}/forget.php`;
            requestData = { email: formData.email };
        } else {
            url = `${process.env.REACT_APP_API_URL}/api/auth/login`;
            requestData = {
                username: formData.username,
                password: formData.password,
            };
        }

        const response = await axios.post(url, requestData, {
            headers: { "Content-Type": "application/json" },
        });

        const result = response.data;
        const user = result.user;

        if (result.success) {
            if (!isForgotPassword) {
                sessionStorage.setItem("admin", JSON.stringify(user));
                setTimeout(() => {
                    navigate("/home"); 
                }, 100); 
            }
        } else {
            setError(result.message || "An error occurred. Please try again.");
        }
    } catch (err) {
        setError(
            err.response?.data?.message || "Unable to connect to the server. Please try again later."
        );
    } finally {
        setLoading(false);
    }
};


  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 vw-100"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
        src={loginimage}
        alt="Background"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />
      <div
        className="bg-white p-4 rounded shadow-lg"
        style={{
          maxWidth: "400px",
          width: "100%",
          opacity: 0.95,
        }}
      >
        <h2 className="text-center mb-4">{isForgotPassword ? "Forgot Password" : "Sign In"}</h2>
        <form onSubmit={handleFormSubmit}>
          {isForgotPassword ? (
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3 position-relative">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  className="form-control"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <span
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    top: "73%",
                    right: "10px",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#007bff",
                  }}
                >
                  {passwordVisible ? "🙈" : "👁️"}
                </span>
              </div>
            </>
          )}
          {!isForgotPassword && (
            <p
              className="text-end text-primary"
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => {
                setIsForgotPassword(true);
                setError(null); 
              }}
            >
              Forgot Password?
            </p>
          )}
          {error && <div className="alert alert-danger text-center">{error}</div>}
          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
            {loading ? "Processing..." : isForgotPassword ? "Send Reset Link" : "Sign In"}
          </button>
        </form>

        {!isForgotPassword && (
          <p className="text-center">
            Don't have an account? Contact the admin for access.
          </p>
        )}
        {isForgotPassword && (
          <p
            className="text-center text-primary"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => setIsForgotPassword(false)}
          >
            Back to Login
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
