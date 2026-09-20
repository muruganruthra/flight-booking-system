import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { register, clearAuthMessage } from "../redux/slices/authSlice";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    isLoading,
    isAuthenticated,
    isError,
    message,
  } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const {
    name,
    email,
    phone,
    password,
    confirmPassword,
  } = formData;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }

    return () => {
      dispatch(clearAuthMessage());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters");
      return;
    }

    dispatch(
      register({
        name,
        email,
        phone,
        password,
      })
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          ✈️
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join our flight booking platform
        </p>

        {isError && (
          <div className="error-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;