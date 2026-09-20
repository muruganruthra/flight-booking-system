import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Plane,
  Users,
  CalendarDays,
  MapPin,
  Armchair,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import SeatMap from "../components/booking/SeatMap";
import {
  getFlightSeats,
  clearSeats,
} from "../redux/slices/flightSlice";

function SeatSelection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { flightId } = useParams();

  const {
    selectedFlight,
    seats,
    isLoadingSeats,
    isError,
    message,
  } = useSelector((state) => state.flights);

  const [selectedSeats, setSelectedSeats] = useState([]);

  const passengerCount =
    Number(selectedFlight?.passengers) || 1;

  useEffect(() => {
    if (!selectedFlight) {
      return;
    }

    if (selectedFlight._id !== flightId) {
      return;
    }

    dispatch(clearSeats());
    dispatch(getFlightSeats(flightId));

    return () => {
      dispatch(clearSeats());
    };
  }, [dispatch, flightId, selectedFlight]);

  const flight = selectedFlight;

  // ========================================
  // FLIGHT INFORMATION
  // ========================================

  const originCode =
    typeof flight?.origin === "object"
      ? flight.origin?.code
      : flight?.origin ||
        flight?.from ||
        flight?.departureAirport?.code ||
        "MAA";

  const destinationCode =
    typeof flight?.destination === "object"
      ? flight.destination?.code
      : flight?.destination ||
        flight?.to ||
        flight?.arrivalAirport?.code ||
        "DEL";

  const originCity =
    typeof flight?.origin === "object"
      ? flight.origin?.city
      : flight?.originCity ||
        flight?.departureAirport?.city ||
        "Chennai";

  const destinationCity =
    typeof flight?.destination === "object"
      ? flight.destination?.city
      : flight?.destinationCity ||
        flight?.arrivalAirport?.city ||
        "Delhi";

  const airlineName =
    flight?.airline?.name ||
    flight?.airlineName ||
    "SkyBook Airways";

  const flightNumber =
    flight?.flightNumber ||
    flight?.flightCode ||
    "SBA101";

  const departureTime = flight?.departureDateTime
    ? new Date(flight.departureDateTime).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      )
    : "--:--";

  const arrivalTime = flight?.arrivalDateTime
    ? new Date(flight.arrivalDateTime).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      )
    : "--:--";

  const flightDate = flight?.departureDateTime
    ? new Date(flight.departureDateTime).toLocaleDateString(
        "en-IN",
        {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Date unavailable";

  const durationMinutes =
    Number(flight?.durationMinutes) || 0;

  const durationHours = Math.floor(durationMinutes / 60);
  const remainingMinutes = durationMinutes % 60;

  const durationText =
    durationMinutes > 0
      ? `${durationHours}h ${remainingMinutes}m`
      : "--";

  const economyPrice = Number(
    flight?.pricing?.economy ??
      flight?.economyPrice ??
      flight?.price ??
      0
  );

  const farePerPassenger = economyPrice;

  const seatFee = 0;

  const subtotal =
    farePerPassenger * passengerCount;

  const total = subtotal + seatFee;

  // ========================================
  // AVAILABLE SEATS
  // ========================================

  const availableSeatCount = useMemo(() => {
    if (!Array.isArray(seats)) {
      return 0;
    }

    return seats.filter((seat) => {
      if (typeof seat === "string") {
        return true;
      }

      const status = (
        seat?.status ||
        seat?.seatStatus ||
        "available"
      ).toLowerCase();

      return (
        status === "available" ||
        status === "open"
      );
    }).length;
  }, [seats]);

  // ========================================
  // SEAT SELECTION
  // ========================================

  const handleSeatSelect = (seatNumber) => {
    setSelectedSeats((previous) => {
      if (previous.includes(seatNumber)) {
        return previous.filter(
          (seat) => seat !== seatNumber
        );
      }

      if (previous.length >= passengerCount) {
        return previous;
      }

      return [...previous, seatNumber];
    });
  };

  const handleContinue = () => {
    if (
      selectedSeats.length !==
      passengerCount
    ) {
      return;
    }

    navigate(
      `/passenger-details/${flightId}`,
      {
        state: {
          selectedSeats,
          passengerCount,
        },
      }
    );
  };

  // ========================================
  // FLIGHT NOT FOUND
  // ========================================

  if (
    !flight ||
    flight._id !== flightId
  ) {
    return (
      <div className="seat-selection-page">
        <header className="seat-selection-header">
          <div className="seat-selection-brand">
            <div className="brand-icon">
              <Plane size={20} />
            </div>

            <strong>SkyBook</strong>
          </div>
        </header>

        <main className="seat-empty-state">
          <div className="seat-empty-icon">
            <Plane size={34} />
          </div>

          <h1>Flight information not found</h1>

          <p>
            Please search for a flight and select
            one before choosing seats.
          </p>

          <button
            type="button"
            className="seat-primary-button"
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

  return (
    <div className="seat-selection-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="seat-selection-header">

        <div className="seat-selection-brand">
          <div className="brand-icon">
            <Plane size={20} />
          </div>

          <div>
            <strong>SkyBook</strong>
            <small>Flight Booking</small>
          </div>
        </div>

        <button
          type="button"
          className="seat-back-button"
          onClick={() =>
            navigate(
              `/flight-details/${flightId}`
            )
          }
        >
          <ArrowLeft size={17} />
          Flight Details
        </button>

      </header>

      <main className="seat-selection-content">

        {/* ======================================
            BREADCRUMB
        ====================================== */}

        <div className="seat-breadcrumb">

          <button
            type="button"
            onClick={() =>
              navigate("/search-flights")
            }
          >
            Search
          </button>

          <span>/</span>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/flight-details/${flightId}`
              )
            }
          >
            Flight Details
          </button>

          <span>/</span>

          <strong>Seat Selection</strong>

        </div>

        {/* ======================================
            PAGE TITLE
        ====================================== */}

        <section className="seat-page-title">

          <div>

            <p className="seat-eyebrow">
              STEP 2 OF 5
            </p>

            <h1>Select your seats</h1>

            <p>
              Choose your preferred seats for
              your journey.
            </p>

          </div>

          <div className="seat-progress">

            <div className="progress-step completed">
              <CheckCircle2 size={16} />
              Flight
            </div>

            <div className="progress-line"></div>

            <div className="progress-step active">
              <span>2</span>
              Seats
            </div>

            <div className="progress-line"></div>

            <div className="progress-step">
              <span>3</span>
              Passenger
            </div>

            <div className="progress-line"></div>

            <div className="progress-step">
              <span>4</span>
              Payment
            </div>

          </div>

        </section>

        {/* ======================================
            SELECTED FLIGHT CARD
        ====================================== */}

        <section className="selected-flight-card">

          <div className="selected-flight-top">

            <div className="selected-flight-airline">

              <div className="airline-logo">
                <Plane size={22} />
              </div>

              <div>
                <h2>{airlineName}</h2>

                <span>
                  Flight {flightNumber}
                </span>
              </div>

            </div>

            <div className="flight-status-badge">
              Scheduled
            </div>

          </div>

          <div className="selected-flight-main">

            {/* Departure */}

            <div className="airport-block">

              <span className="airport-label">
                DEPARTURE
              </span>

              <strong className="airport-time">
                {departureTime}
              </strong>

              <strong className="airport-code">
                {originCode}
              </strong>

              <span className="airport-city">
                <MapPin size={14} />
                {originCity}
              </span>

            </div>

            {/* Route */}

            <div className="flight-route-line">

              <span className="route-duration">
                <Clock3 size={14} />
                {durationText}
              </span>

              <div className="route-line">
                <span></span>
                <Plane size={18} />
                <span></span>
              </div>

              <span className="route-direct">
                Direct
              </span>

            </div>

            {/* Arrival */}

            <div className="airport-block arrival">

              <span className="airport-label">
                ARRIVAL
              </span>

              <strong className="airport-time">
                {arrivalTime}
              </strong>

              <strong className="airport-code">
                {destinationCode}
              </strong>

              <span className="airport-city">
                <MapPin size={14} />
                {destinationCity}
              </span>

            </div>

          </div>

          <div className="selected-flight-bottom">

            <div className="flight-detail-item">
              <CalendarDays size={17} />
              <div>
                <small>Date</small>
                <strong>{flightDate}</strong>
              </div>
            </div>

            <div className="flight-detail-item">
              <Users size={17} />
              <div>
                <small>Passengers</small>
                <strong>
                  {passengerCount}{" "}
                  {passengerCount === 1
                    ? "Passenger"
                    : "Passengers"}
                </strong>
              </div>
            </div>

            <div className="flight-detail-item">
              <Armchair size={17} />
              <div>
                <small>Cabin</small>
                <strong>Economy</strong>
              </div>
            </div>

            <div className="flight-detail-item">
              <div>
                <small>From</small>
                <strong>
                  ₹
                  {farePerPassenger.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            </div>

          </div>

        </section>

        {/* ======================================
            ERROR
        ====================================== */}

        {isError && (
          <div className="seat-error-message">
            {message ||
              "Unable to load seat availability."}
          </div>
        )}

        {/* ======================================
            MAIN SEAT AREA
        ====================================== */}

        <div className="seat-layout">

          {/* ====================================
              SEAT MAP
          ==================================== */}

          <section className="seat-map-card">

            <div className="seat-card-header">

              <div>

                <h2>
                  Choose your seat
                </h2>

                <p>
                  Select{" "}
                  {passengerCount === 1
                    ? "one seat"
                    : `${passengerCount} seats`}
                  {" "}for your journey.
                </p>

              </div>

              {!isLoadingSeats &&
                Array.isArray(seats) && (
                  <div className="available-seat-count">
                    <span></span>
                    {availableSeatCount} available
                  </div>
                )}

            </div>

            {/* Legend */}

            <div className="seat-legend">

              <div className="legend-item">
                <span className="legend-seat available"></span>
                Available
              </div>

              <div className="legend-item">
                <span className="legend-seat selected"></span>
                Selected
              </div>

              <div className="legend-item">
                <span className="legend-seat occupied"></span>
                Occupied
              </div>

              <div className="legend-item">
                <span className="legend-seat held"></span>
                Held
              </div>

            </div>

            {isLoadingSeats ? (
              <div className="seat-loading">

                <div className="loading-spinner"></div>

                <h3>
                  Loading seat map...
                </h3>

                <p>
                  Checking the latest seat
                  availability.
                </p>

              </div>
            ) : (
              <SeatMap
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatSelect={
                  handleSeatSelect
                }
                maxSeats={passengerCount}
              />
            )}

          </section>

          {/* ====================================
              BOOKING SUMMARY
          ==================================== */}

          <aside className="seat-summary-card">

            <div className="summary-heading">

              <div>
                <h2>Booking Summary</h2>
                <p>
                  Review your selection
                </p>
              </div>

              <div className="summary-plane">
                <Plane size={19} />
              </div>

            </div>

            <div className="seat-summary-route">

              <div>
                <strong>
                  {originCode}
                </strong>
                <small>
                  {originCity}
                </small>
              </div>

              <div className="summary-route-arrow">
                <ArrowRight size={18} />
              </div>

              <div>
                <strong>
                  {destinationCode}
                </strong>
                <small>
                  {destinationCity}
                </small>
              </div>

            </div>

            <div className="seat-summary-airline">

              <Plane size={16} />

              <span>
                {airlineName} ·{" "}
                {flightNumber}
              </span>

            </div>

            {/* Passenger */}

            <div className="summary-section">

              <div className="summary-label">
                Passengers
              </div>

              <div className="summary-value">
                {passengerCount}
              </div>

            </div>

            {/* Seats */}

            <div className="summary-section">

              <div className="summary-label">
                Selected Seats
              </div>

              {selectedSeats.length === 0 ? (
                <div className="no-seat-selected">
                  Select your seats from the
                  seat map
                </div>
              ) : (
                <div className="selected-seat-list">

                  {selectedSeats.map(
                    (seat) => (
                      <span key={seat}>
                        <Armchair size={13} />
                        {seat}
                      </span>
                    )
                  )}

                </div>
              )}

            </div>

            {/* Price */}

            <div className="summary-price-section">

              <div className="summary-price-row">

                <span>
                  Fare × {passengerCount}
                </span>

                <strong>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div className="summary-price-row">

                <span>
                  Seat selection
                </span>

                <strong>
                  {seatFee === 0
                    ? "Free"
                    : `₹${seatFee.toLocaleString(
                        "en-IN"
                      )}`}
                </strong>

              </div>

              <div className="summary-divider"></div>

              <div className="summary-total-row">

                <span>Total</span>

                <strong>
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            </div>

            {/* Continue */}

            <button
              type="button"
              className="continue-passenger-button"
              disabled={
                selectedSeats.length !==
                passengerCount
              }
              onClick={handleContinue}
            >

              <span>
                {selectedSeats.length !==
                passengerCount
                  ? `Select ${
                      passengerCount -
                      selectedSeats.length
                    } more seat${
                      passengerCount -
                        selectedSeats.length !==
                      1
                        ? "s"
                        : ""
                    }`
                  : "Continue to Passenger Details"}
              </span>

              <ArrowRight size={18} />

            </button>

            <p className="seat-summary-note">
              Your selected seats will be held
              when the booking is created.
            </p>

          </aside>

        </div>

      </main>

    </div>
  );
}

export default SeatSelection;