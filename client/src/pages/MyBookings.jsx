import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Loader2,
  Plane,
  RefreshCw,
  Ticket,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "booking-status confirmed";

      case "cancelled":
        return "booking-status cancelled";

      case "completed":
        return "booking-status completed";

      case "pending":
      default:
        return "booking-status pending";
    }
  };

  const loadBookings = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.get(
        "/bookings/my-bookings"
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load bookings."
        );
      }

      setBookings(response.data.bookings || []);
    } catch (requestError) {
      console.error(
        "GET MY BOOKINGS ERROR:",
        requestError
      );

      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Failed to load your bookings.";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleViewBooking = (bookingId) => {
    navigate(`/my-bookings/${bookingId}`);
  };

  if (isLoading) {
    return (
      <div className="my-bookings-loading">
        <Loader2
          size={38}
          className="my-bookings-spinner"
        />

        <h2>Loading your bookings...</h2>

        <p>
          Please wait while we retrieve your
          reservations.
        </p>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">
        {/* Header */}
        <div className="my-bookings-header">
          <div>
            <span className="my-bookings-eyebrow">
              TRAVEL MANAGEMENT
            </span>

            <h1>My Bookings</h1>

            <p>
              View and manage your flight
              reservations.
            </p>
          </div>

          <button
            type="button"
            className="my-bookings-refresh"
            onClick={loadBookings}
            disabled={isLoading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="my-bookings-error">
            <AlertCircle size={20} />

            <div>
              <strong>
                Unable to load bookings
              </strong>

              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={loadBookings}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!error && bookings.length === 0 && (
          <div className="my-bookings-empty">
            <div className="my-bookings-empty-icon">
              <Ticket size={42} />
            </div>

            <h2>No bookings yet</h2>

            <p>
              You haven't booked a flight yet.
              Search for a flight to get started.
            </p>

            <button
              type="button"
              className="my-bookings-primary"
              onClick={() =>
                navigate("/search-flights")
              }
            >
              Search Flights
            </button>
          </div>
        )}

        {/* Booking List */}
        <div className="my-bookings-list">
          {bookings.map((booking) => {
            const flight = booking.flight || {};

            const airlineName =
              flight.airline?.name ||
              flight.airlineName ||
              "Airline";

            const flightNumber =
              flight.flightNumber || "Flight";

            const departure =
              flight.departureAirport?.code ||
              flight.departureAirport?.iataCode ||
              "MAA";

            const arrival =
              flight.arrivalAirport?.code ||
              flight.arrivalAirport?.iataCode ||
              "DEL";

            const passengers =
              booking.passengers || [];

            return (
              <article
                className="booking-list-card"
                key={booking._id}
              >
                {/* Card Top */}
                <div className="booking-list-top">
                  <div className="booking-list-airline">
                    <div className="booking-plane-icon">
                      <Plane size={20} />
                    </div>

                    <div>
                      <strong>
                        {airlineName}
                      </strong>

                      <span>
                        {flightNumber}
                      </span>
                    </div>
                  </div>

                  <div className="booking-list-right">
                    <span
                      className={getStatusClass(
                        booking.status
                      )}
                    >
                      {booking.status ||
                        "pending"}
                    </span>

                    <div className="booking-list-pnr">
                      <span>PNR</span>
                      <strong>
                        {booking.pnr || "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="booking-list-route">
                  <div className="booking-list-airport">
                    <strong>
                      {departure}
                    </strong>

                    <span>Departure</span>
                  </div>

                  <div className="booking-list-route-line">
                    <div />
                    <Plane size={18} />
                    <div />
                  </div>

                  <div className="booking-list-airport arrival">
                    <strong>
                      {arrival}
                    </strong>

                    <span>Arrival</span>
                  </div>
                </div>

                {/* Information */}
                <div className="booking-list-info">
                  <div>
                    <CalendarDays
                      size={17}
                    />

                    <span>
                      {formatDate(
                        flight.departureDateTime
                      )}
                    </span>
                  </div>

                  <div>
                    <Users size={17} />

                    <span>
                      {passengers.length}{" "}
                      passenger
                      {passengers.length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div>
                    <Ticket size={17} />

                    <span>
                      {passengers
                        .map(
                          (passenger) =>
                            passenger.seatNumber
                        )
                        .filter(Boolean)
                        .join(", ") || "No seats"}
                    </span>
                  </div>

                  <div className="booking-list-amount">
                    <span>Total</span>

                    <strong>
                      {formatCurrency(
                        booking.totalAmount
                      )}
                    </strong>
                  </div>
                </div>

                {/* Footer */}
                <div className="booking-list-footer">
                  <span>
                    Booked{" "}
                    {formatDate(
                      booking.bookedAt ||
                        booking.createdAt
                    )}
                  </span>

                  <button
                    type="button"
                    className="booking-view-button"
                    onClick={() =>
                      handleViewBooking(
                        booking._id
                      )
                    }
                  >
                    View Details
                    <ChevronRight size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyBookings;