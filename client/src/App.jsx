import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SearchFlights from "./pages/SearchFlights";
import FlightDetails from "./pages/FlightDetails";
import SeatSelection from "./pages/SeatSelection";
import PassengerDetails from "./pages/PassengerDetails";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import BookingDetails from "./pages/BookingDetails";
import Profile from "./pages/Profile";


import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected Customer Routes */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/search-flights"
            element={<SearchFlights />}
          />

          <Route
            path="/flight-details/:flightId"
            element={<FlightDetails />}
          />

          <Route
            path="/seat-selection/:flightId"
            element={<SeatSelection />}
          />

          <Route
            path="/passenger-details/:flightId"
            element={<PassengerDetails />}
          />

          <Route
            path="/booking/:flightId"
            element={<Booking />}
          />

          <Route
            path="/payment/:bookingId"
            element={<Payment />}
          />

          <Route
            path="/booking-confirmation/:bookingId"
            element={<BookingConfirmation />}
          />

          <Route
            path="/my-bookings"
            element={<MyBookings />}
          />
          <Route
            path="/profile"
            element={<Profile />}
          />
     
          <Route
            path="/booking-details/:bookingId"
            element={<BookingDetails />}
          />
        </Route>

        {/* Unknown Route */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;