import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../redux/slices/authSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h2>✈️ SkyBook</h2>
        </div>

        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <h1>
          Welcome, {user?.name || "Passenger"}!
        </h1>

        <p>
          Your flight booking dashboard
        </p>

        <div className="dashboard-grid">

          {/* Search Flights */}
          <button
            type="button"
            className="dashboard-card dashboard-card-button"
            onClick={() => navigate("/search-flights")}
          >
            <span>🔎</span>

            <h3>
              Search Flights
            </h3>

            <p>
              Find and book your next flight.
            </p>
          </button>

          {/* My Bookings */}
          <button
            type="button"
            className="dashboard-card dashboard-card-button"
            onClick={() => navigate("/my-bookings")}
          >
            <span>🎫</span>

            <h3>
              My Bookings
            </h3>

            <p>
              View your flight reservations.
            </p>
          </button>

          {/* My Profile */}
          <button
            type="button"
            className="dashboard-card dashboard-card-button"
            onClick={() => navigate("/profile")}
          >
            <span>👤</span>

            <h3>
              My Profile
            </h3>

            <p>
              Manage your personal information.
            </p>
          </button>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;