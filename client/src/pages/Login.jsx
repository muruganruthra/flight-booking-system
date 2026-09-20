import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { login, clearAuthMessage } from "../redux/slices/authSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    isLoading,
    isAuthenticated,
    isError,
    message,
    user,
  } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }

    return () => {
      dispatch(clearAuthMessage());
    };
  }, [
    isAuthenticated,
    user,
    navigate,
    dispatch,
  ]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    dispatch(login(formData));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          ✈️
        </div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to manage your flights and bookings
        </p>

        {isError && (
          <div className="error-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;