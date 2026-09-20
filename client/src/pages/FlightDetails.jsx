import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plane,
  Users,
} from "lucide-react";

import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function FlightDetails() {
  const navigate = useNavigate();
  const { flightId } = useParams();

  const { selectedFlight } = useSelector(
    (state) => state.flights
  );

  /*
   * The selected flight is stored in Redux
   * when the passenger clicks "Select Flight".
   *
   * If the user directly opens this URL without
   * selecting a flight first, we don't have the
   * flight data in Redux.
   */
  if (
    !selectedFlight ||
    selectedFlight._id !== flightId
  ) {
    return (
      <div className="flight-details-page">
        <header className="flight-details-header">
          <div className="flight-details-brand">
            <span>✈️</span>
            <strong>SkyBook</strong>
          </div>

          <button
            type="button"
            className="details-back-button"
            onClick={() =>
              navigate("/search-flights")
            }
          >
            <ArrowLeft size={17} />
            Back to Search
          </button>
        </header>

        <main className="flight-details-empty">
          <div className="empty-icon">
            ✈️
          </div>

          <h1>Flight information not found</h1>

          <p>
            Please search for a flight and select
            one to view its details.
          </p>

          <button
            type="button"
            className="primary-details-button"
            onClick={() =>
              navigate("/search-flights")
            }
          >
            Search Flights
          </button>
        </main>
      </div>
    );
  }

  const flight = selectedFlight;

  const departureTime = flight?.departureTime
    ? new Date(flight.departureTime)
    : null;

  const arrivalTime = flight?.arrivalTime
    ? new Date(flight.arrivalTime)
    : null;

  const formatTime = (date) => {
    if (!date) return "--:--";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getAirportCode = (airport, fallback) => {
    if (!airport) return fallback;

    if (typeof airport === "string") {
      return airport;
    }

    return (
      airport.code ||
      airport.iataCode ||
      fallback
    );
  };

  const getAirportName = (airport) => {
    if (!airport) {
      return "Airport";
    }

    if (typeof airport === "string") {
      return airport;
    }

    return (
      airport.name ||
      airport.airportName ||
      "Airport"
    );
  };

  const originCode = getAirportCode(
    flight.origin || flight.from,
    flight.originCode || flight.from || "MAA"
  );

  const destinationCode = getAirportCode(
    flight.destination || flight.to,
    flight.destinationCode ||
      flight.to ||
      "DEL"
  );

  const originName = getAirportName(
    flight.origin || flight.from
  );

  const destinationName = getAirportName(
    flight.destination || flight.to
  );

  const airlineName =
    flight.airline?.name ||
    flight.airlineName ||
    "Airline";

  const flightNumber =
    flight.flightNumber ||
    flight.flightCode ||
    "Flight";

  const economyPrice =
    flight?.pricing?.economy ??
    flight?.economyPrice ??
    0;

  const businessPrice =
    flight?.pricing?.business ??
    flight?.businessPrice ??
    0;

  const firstPrice =
    flight?.pricing?.first ??
    flight?.firstPrice ??
    0;

  const selectedPrice = Number(economyPrice);

  const tax = Math.round(
    selectedPrice * 0.05
  );

  const convenienceFee = 200;

  const total =
    selectedPrice +
    tax +
    convenienceFee;

  const availableSeats =
    flight.availableSeats ??
    flight.seatsAvailable ??
    flight.seats?.available ??
    "--";

  const handleContinue = () => {
    navigate(
      `/seat-selection/${flight._id}`
    );
  };

  return (
    <div className="flight-details-page">
      <header className="flight-details-header">
        <div className="flight-details-brand">
          <span>✈️</span>
          <strong>SkyBook</strong>
        </div>

        <button
          type="button"
          className="details-back-button"
          onClick={() =>
            navigate("/search-flights")
          }
        >
          <ArrowLeft size={17} />
          Back to Search
        </button>
      </header>

      <main className="flight-details-content">
        <div className="details-breadcrumb">
          <button
            type="button"
            onClick={() =>
              navigate("/search-flights")
            }
          >
            Search Flights
          </button>

          <span>/</span>

          <strong>Flight Details</strong>
        </div>

        <section className="flight-details-title">
          <div>
            <p className="details-eyebrow">
              SELECTED FLIGHT
            </p>

            <h1>
              {originCode} → {destinationCode}
            </h1>

            <p>
              Review your flight before selecting
              your seats.
            </p>
          </div>

          <div className="selected-flight-badge">
            <CheckCircle2 size={17} />
            Selected
          </div>
        </section>

        <div className="details-layout">
          <section className="details-main">

            {/* Airline information */}

            <div className="details-card airline-details-card">
              <div className="airline-details-logo">
                <Plane size={25} />
              </div>

              <div>
                <h2>{airlineName}</h2>

                <p>
                  Flight {flightNumber}
                </p>
              </div>

              <div className="details-status">
                {flight.status ||
                  "scheduled"}
              </div>
            </div>

            {/* Route */}

            <div className="details-card">
              <div className="details-card-heading">
                <CalendarDays size={19} />

                <h2>Flight Schedule</h2>
              </div>

              <p className="schedule-date">
                {formatDate(departureTime)}
              </p>

              <div className="details-route">

                <div className="details-route-point">
                  <strong>
                    {formatTime(
                      departureTime
                    )}
                  </strong>

                  <h3>{originCode}</h3>

                  <p>{originName}</p>
                </div>

                <div className="details-route-middle">
                  <div className="duration-label">
                    <Clock3 size={15} />

                    {flight.duration
                      ? `${flight.duration} min`
                      : "Direct"}
                  </div>

                  <div className="details-route-line">
                    <span></span>
                  </div>

                  <small>
                    Direct flight
                  </small>
                </div>

                <div className="details-route-point arrival">
                  <strong>
                    {formatTime(
                      arrivalTime
                    )}
                  </strong>

                  <h3>
                    {destinationCode}
                  </h3>

                  <p>
                    {destinationName}
                  </p>
                </div>

              </div>
            </div>

            {/* Flight information */}

            <div className="details-card">
              <div className="details-card-heading">
                <Plane size={19} />

                <h2>
                  Flight Information
                </h2>
              </div>

              <div className="information-grid">

                <div className="information-item">
                  <span>Flight Number</span>
                  <strong>
                    {flightNumber}
                  </strong>
                </div>

                <div className="information-item">
                  <span>Duration</span>
                  <strong>
                    {flight.duration
                      ? `${flight.duration} minutes`
                      : "Direct"}
                  </strong>
                </div>

                <div className="information-item">
                  <span>Available Seats</span>
                  <strong>
                    {availableSeats}
                  </strong>
                </div>

                <div className="information-item">
                  <span>Status</span>
                  <strong className="status-text">
                    {flight.status ||
                      "scheduled"}
                  </strong>
                </div>

              </div>
            </div>

            {/* Fare options */}

            <div className="details-card">
              <div className="details-card-heading">
                <Users size={19} />

                <h2>
                  Fare Options
                </h2>
              </div>

              <div className="fare-options">

                <div className="fare-option active">
                  <div>
                    <strong>
                      Economy
                    </strong>

                    <span>
                      Standard cabin
                    </span>
                  </div>

                  <strong>
                    ₹
                    {Number(
                      economyPrice
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                {Number(businessPrice) > 0 && (
                  <div className="fare-option">
                    <div>
                      <strong>
                        Business
                      </strong>

                      <span>
                        Premium cabin
                      </span>
                    </div>

                    <strong>
                      ₹
                      {Number(
                        businessPrice
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                )}

                {Number(firstPrice) > 0 && (
                  <div className="fare-option">
                    <div>
                      <strong>
                        First Class
                      </strong>

                      <span>
                        Premium first-class cabin
                      </span>
                    </div>

                    <strong>
                      ₹
                      {Number(
                        firstPrice
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                )}

              </div>
            </div>
          </section>

          {/* Price summary */}

          <aside className="details-sidebar">
            <div className="price-summary-card">
              <h2>
                Fare Summary
              </h2>

              <div className="price-summary-route">
                <span>
                  {originCode}
                </span>

                <span>→</span>

                <span>
                  {destinationCode}
                </span>
              </div>

              <div className="price-row">
                <span>
                  Economy fare
                </span>

                <strong>
                  ₹
                  {selectedPrice.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div className="price-row">
                <span>
                  Taxes (5%)
                </span>

                <strong>
                  ₹
                  {tax.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div className="price-row">
                <span>
                  Convenience fee
                </span>

                <strong>
                  ₹
                  {convenienceFee.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div className="price-divider"></div>

              <div className="price-total">
                <span>
                  Total per passenger
                </span>

                <strong>
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <button
                type="button"
                className="continue-seat-button"
                onClick={handleContinue}
              >
                Continue to Seat Selection
                <ArrowRight size={18} />
              </button>

              <p className="price-note">
                Final fare may change based on
                passenger count and selected
                cabin.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default FlightDetails;