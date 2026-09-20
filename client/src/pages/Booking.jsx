import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Plane,
  Users,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import api from "../services/api";

function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { flightId } = useParams();

  const { selectedFlight } = useSelector(
    (state) => state.flights
  );

  const selectedSeats =
    location.state?.selectedSeats || [];

  const passengers =
    location.state?.passengers || [];

  const passengerCount =
    Number(location.state?.passengerCount) ||
    passengers.length ||
    selectedSeats.length ||
    1;

  const [isCreating, setIsCreating] =
    useState(false);

  const [error, setError] = useState("");

  const primaryPassenger =
    passengers[0] || {};

  const contactEmail =
    primaryPassenger.email || "";

  const contactPhone =
    primaryPassenger.phone || "";

  const originCode =
    typeof selectedFlight?.origin === "object"
      ? selectedFlight.origin?.code
      : selectedFlight?.origin ||
        selectedFlight?.from ||
        selectedFlight?.departureAirport?.code ||
        "MAA";

  const destinationCode =
    typeof selectedFlight?.destination === "object"
      ? selectedFlight.destination?.code
      : selectedFlight?.destination ||
        selectedFlight?.to ||
        selectedFlight?.arrivalAirport?.code ||
        "DEL";

  const airlineName =
    selectedFlight?.airline?.name ||
    selectedFlight?.airlineName ||
    "Airline";

  const flightNumber =
    selectedFlight?.flightNumber ||
    selectedFlight?.flightCode ||
    "Flight";

  const departureDateTime =
    selectedFlight?.departureDateTime ||
    selectedFlight?.departureTime;

  const pricePerPassenger = useMemo(() => {
    const firstPassengerClass =
      passengers[0]?.travelClass ||
      "economy";

    if (
      firstPassengerClass === "business"
    ) {
      return Number(
        selectedFlight?.prices?.business ??
          selectedFlight?.businessPrice ??
          0
      );
    }

    if (
      firstPassengerClass === "first"
    ) {
      return Number(
        selectedFlight?.prices?.first ??
          selectedFlight?.firstClassPrice ??
          0
      );
    }

    return Number(
      selectedFlight?.prices?.economy ??
        selectedFlight?.economyPrice ??
        selectedFlight?.price ??
        0
    );
  }, [passengers, selectedFlight]);

  /*
   * This is only a display estimate.
   * The backend calculates the authoritative
   * fare, tax and convenience fee.
   */
  const estimatedBaseFare =
    passengers.reduce(
      (total, passenger) => {
        let price = 0;

        if (
          passenger.travelClass ===
          "business"
        ) {
          price = Number(
            selectedFlight?.prices
              ?.business ??
              selectedFlight?.businessPrice ??
              0
          );
        } else if (
          passenger.travelClass ===
          "first"
        ) {
          price = Number(
            selectedFlight?.prices
              ?.first ??
              selectedFlight?.firstClassPrice ??
              0
          );
        } else {
          price = Number(
            selectedFlight?.prices
              ?.economy ??
              selectedFlight?.economyPrice ??
              selectedFlight?.price ??
              0
          );
        }

        return total + price;
      },
      0
    );

  const estimatedTax =
    estimatedBaseFare * 0.05;

  const convenienceFee =
    passengerCount * 200;

  const estimatedTotal =
    estimatedBaseFare +
    estimatedTax +
    convenienceFee;

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  const formatDateTime = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleBack = () => {
    navigate(
      `/passenger-details/${flightId}`,
      {
        state: {
          selectedSeats,
          passengerCount,
          passengers,
        },
      }
    );
  };

  const validateBookingData = () => {
    if (!selectedFlight) {
      return "Flight information is missing.";
    }

    if (!flightId) {
      return "Flight ID is missing.";
    }

    if (
      !Array.isArray(passengers) ||
      passengers.length === 0
    ) {
      return "Passenger information is missing.";
    }

    if (
      passengers.length !==
      selectedSeats.length
    ) {
      return "Passenger count and selected seats do not match.";
    }

    if (!contactEmail.trim()) {
      return "Contact email is required.";
    }

    if (!contactPhone.trim()) {
      return "Contact phone is required.";
    }

    for (
      let index = 0;
      index < passengers.length;
      index++
    ) {
      const passenger =
        passengers[index];

      if (
        !passenger.title ||
        !passenger.firstName?.trim() ||
        !passenger.lastName?.trim() ||
        !passenger.dateOfBirth ||
        !passenger.gender ||
        !passenger.travelClass ||
        !selectedSeats[index]
      ) {
        return `Passenger ${
          index + 1
        } has incomplete information.`;
      }
    }

    return "";
  };

  const handleCreateBooking = async () => {
    setError("");

    const validationError =
      validateBookingData();

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsCreating(true);

    try {
      /*
       * Convert frontend passenger data
       * into the exact backend request format.
       */
      const bookingPassengers =
        passengers.map(
          (passenger, index) => ({
            title: passenger.title,
            firstName:
              passenger.firstName.trim(),
            lastName:
              passenger.lastName.trim(),
            dateOfBirth:
              passenger.dateOfBirth,
            gender: passenger.gender,
            passportNumber:
              passenger.passportNumber ||
              "",
            nationality:
              passenger.nationality ||
              "Indian",
            seatNumber:
              selectedSeats[index],
            travelClass:
              passenger.travelClass,
            baggage:
              Number(
                passenger.baggage || 0
              ),
          })
        );

      const requestBody = {
        flightId,
        passengers: bookingPassengers,
        contactEmail:
          contactEmail.trim(),
        contactPhone:
          contactPhone.trim(),
      };

      const response = await api.post(
        "/bookings",
        requestBody
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Booking creation failed."
        );
      }

      const booking =
        response.data.booking;

      toast.success(
        "Booking created successfully!"
      );

      /*
       * Payment page will receive the
       * newly-created booking.
       */
      navigate(
        `/payment/${booking._id}`,
        {
          state: {
            booking,
          },
        }
      );
    } catch (requestError) {
      console.error(
        "CREATE BOOKING ERROR:",
        requestError
      );

      const message =
        requestError.response?.data
          ?.message ||
        requestError.message ||
        "Failed to create booking.";

      setError(message);
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!selectedFlight) {
    return (
      <div className="seat-empty-state">
        <div className="seat-empty-icon">
          ✈️
        </div>

        <h1>
          Flight information not found
        </h1>

        <p>
          Please select a flight again before
          creating your booking.
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
      </div>
    );
  }

  return (
    <div className="booking-page">
      <header className="seat-selection-header">
        <div className="seat-selection-brand">
          <div className="brand-icon">
            ✈
          </div>

          <div>
            <strong>SkyBook</strong>
            <small>
              Flight Booking
            </small>
          </div>
        </div>

        <button
          type="button"
          className="seat-back-button"
          onClick={handleBack}
          disabled={isCreating}
        >
          <ArrowLeft size={17} />
          Back to Passenger Details
        </button>
      </header>

      <main className="booking-content">
        <div className="seat-breadcrumb">
          <span>Search</span>
          <span>/</span>
          <span>Flight Details</span>
          <span>/</span>
          <span>Seat Selection</span>
          <span>/</span>
          <span>Passenger Details</span>
          <span>/</span>
          <strong>Booking Review</strong>
        </div>

        <section className="passenger-title">
          <div>
            <p className="seat-eyebrow">
              STEP 4 OF 5
            </p>

            <h1>
              Review your booking
            </h1>

            <p>
              Check your flight, passengers
              and seats before creating the
              booking.
            </p>
          </div>

          <div className="seat-progress">
            <div className="progress-step completed">
              <CheckCircle2 size={16} />
              Flight
            </div>

            <div className="progress-line"></div>

            <div className="progress-step completed">
              <CheckCircle2 size={16} />
              Seats
            </div>

            <div className="progress-line"></div>

            <div className="progress-step completed">
              <CheckCircle2 size={16} />
              Passenger
            </div>

            <div className="progress-line"></div>

            <div className="progress-step active">
              <span>4</span>
              Booking
            </div>
          </div>
        </section>

        {error && (
          <div className="passenger-error">
            {error}
          </div>
        )}

        <section className="booking-flight-card">
          <div className="booking-airline">
            <div className="booking-airline-icon">
              <Plane size={22} />
            </div>

            <div>
              <strong>
                {airlineName}
              </strong>

              <span>
                Flight {flightNumber}
              </span>
            </div>
          </div>

          <div className="booking-route">
            <strong>
              {originCode}
            </strong>

            <ArrowRight size={20} />

            <strong>
              {destinationCode}
            </strong>
          </div>

          <div className="booking-departure">
            <small>
              DEPARTURE
            </small>

            <strong>
              {formatDateTime(
                departureDateTime
              )}
            </strong>
          </div>
        </section>

        <div className="booking-layout">
          <section className="booking-review-card">
            <div className="booking-card-header">
              <div>
                <h2>
                  Passenger details
                </h2>

                <p>
                  {passengerCount} passenger
                  {passengerCount > 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <Users size={24} />
            </div>

            <div className="booking-passenger-list">
              {passengers.map(
                (passenger, index) => (
                  <div
                    className="booking-passenger"
                    key={index}
                  >
                    <div className="booking-passenger-number">
                      {index + 1}
                    </div>

                    <div className="booking-passenger-main">
                      <strong>
                        {passenger.title}{" "}
                        {
                          passenger.firstName
                        }{" "}
                        {
                          passenger.lastName
                        }
                      </strong>

                      <span>
                        Seat{" "}
                        {
                          selectedSeats[
                            index
                          ]
                        }{" "}
                        ·{" "}
                        {passenger.travelClass}
                      </span>

                      <span>
                        {passenger.gender} ·{" "}
                        {
                          passenger.dateOfBirth
                        }
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="booking-contact-section">
              <h3>
                Contact information
              </h3>

              <div className="booking-contact-grid">
                <div>
                  <small>
                    Email
                  </small>

                  <strong>
                    {contactEmail}
                  </strong>
                </div>

                <div>
                  <small>
                    Phone
                  </small>

                  <strong>
                    {contactPhone}
                  </strong>
                </div>
              </div>
            </div>

            <div className="booking-hold-notice">
              <ShieldCheck size={20} />

              <div>
                <strong>
                  Seats will be held
                  temporarily
                </strong>

                <p>
                  Your booking will remain
                  pending until payment is
                  completed. Pending bookings
                  expire after 15 minutes.
                </p>
              </div>
            </div>
          </section>

          <aside className="booking-summary-card">
            <h2>
              Fare summary
            </h2>

            <div className="summary-info-row">
              <span>
                Passengers
              </span>

              <strong>
                {passengerCount}
              </strong>
            </div>

            <div className="summary-info-row">
              <span>
                Selected seats
              </span>

              <strong>
                {selectedSeats.join(
                  ", "
                )}
              </strong>
            </div>

            <div className="booking-price-section">
              <div className="booking-price-row">
                <span>
                  Base fare
                </span>

                <strong>
                  {formatCurrency(
                    estimatedBaseFare
                  )}
                </strong>
              </div>

              <div className="booking-price-row">
                <span>
                  Tax (5%)
                </span>

                <strong>
                  {formatCurrency(
                    estimatedTax
                  )}
                </strong>
              </div>

              <div className="booking-price-row">
                <span>
                  Convenience fee
                </span>

                <strong>
                  {formatCurrency(
                    convenienceFee
                  )}
                </strong>
              </div>

              <div className="summary-divider"></div>

              <div className="booking-total-row">
                <span>
                  Estimated total
                </span>

                <strong>
                  {formatCurrency(
                    estimatedTotal
                  )}
                </strong>
              </div>
            </div>

            <p className="booking-price-note">
              Final fare is calculated by the
              server when the booking is
              created.
            </p>

            <button
              type="button"
              className="continue-passenger-button"
              onClick={
                handleCreateBooking
              }
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2
                    size={18}
                    className="booking-spinner"
                  />
                  Creating Booking...
                </>
              ) : (
                <>
                  Create Booking
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="booking-secure-note">
              <CheckCircle2 size={16} />

              <span>
                Secure booking with
                temporary seat hold
              </span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Booking;