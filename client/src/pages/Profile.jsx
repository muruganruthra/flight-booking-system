import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-card">
            <h2>Profile</h2>

            <p>
              Please login to view your profile.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="profile-primary-button"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-header-brand">
          <h2>✈️ SkyBook</h2>
          <span>My Profile</span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="profile-back-button"
        >
          ← Dashboard
        </button>
      </header>

      <main className="profile-container">

        {/* Profile Header */}
        <section className="profile-card profile-hero-card">
          <div className="profile-avatar">
            {user.name
              ? user.name.charAt(0).toUpperCase()
              : "P"}
          </div>

          <div className="profile-hero-info">
            <p className="profile-label">
              Passenger Profile
            </p>

            <h1>
              {user.name || "Passenger"}
            </h1>

            <p>
              {user.email || "Email not available"}
            </p>
          </div>
        </section>

        {/* Personal Information */}
        <section className="profile-card">
          <div className="profile-card-heading">
            <div>
              <p className="profile-label">
                Account Information
              </p>

              <h2>
                Personal Information
              </h2>
            </div>

            <span className="profile-status">
              Active
            </span>
          </div>

          <div className="profile-info-grid">

            <div className="profile-info-item">
              <span>Name</span>
              <strong>
                {user.name || "Not available"}
              </strong>
            </div>

            <div className="profile-info-item">
              <span>Email</span>
              <strong>
                {user.email || "Not available"}
              </strong>
            </div>

            <div className="profile-info-item">
              <span>Phone</span>
              <strong>
                {user.phone || "Not provided"}
              </strong>
            </div>

            <div className="profile-info-item">
              <span>Account Role</span>
              <strong>
                {user.role === "admin"
                  ? "Administrator"
                  : "Passenger"}
              </strong>
            </div>

          </div>
        </section>

        {/* Quick Actions */}
        <section className="profile-card">
          <div className="profile-card-heading">
            <div>
              <p className="profile-label">
                Quick Actions
              </p>

              <h2>
                Manage Your Account
              </h2>
            </div>
          </div>

          <div className="profile-actions">

            <button
              type="button"
              onClick={() => navigate("/my-bookings")}
              className="profile-action-button"
            >
              <span>🎫</span>

              <div>
                <strong>
                  My Bookings
                </strong>

                <small>
                  View your reservations and tickets
                </small>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/search-flights")}
              className="profile-action-button"
            >
              <span>🔎</span>

              <div>
                <strong>
                  Search Flights
                </strong>

                <small>
                  Find and book a new flight
                </small>
              </div>
            </button>

          </div>
        </section>

      </main>
    </div>
  );
}

export default Profile;