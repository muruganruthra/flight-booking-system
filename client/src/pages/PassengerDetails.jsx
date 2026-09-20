import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  Mail,
  Phone,
  CalendarDays,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useSelector } from "react-redux";

function PassengerDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { flightId } = useParams();

  const { selectedFlight } = useSelector(
    (state) => state.flights
  );

  const selectedSeats =
    location.state?.selectedSeats || [];

  const passengerCount =
    Number(location.state?.passengerCount) ||
    selectedSeats.length ||
    1;

  const [passengers, setPassengers] = useState(
    Array.from(
      { length: passengerCount },
      (_, index) => ({
        title: "",
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        travelClass: "economy",
        passportNumber: "",
        nationality: "Indian",
        baggage: 0,
        email: index === 0 ? "" : "",
        phone: index === 0 ? "" : "",
      })
    )
  );

  const [error, setError] = useState("");

  const updatePassenger = (
    index,
    field,
    value
  ) => {
    setPassengers((previous) =>
      previous.map((passenger, passengerIndex) =>
        passengerIndex === index
          ? {
              ...passenger,
              [field]: value,
            }
          : passenger
      )
    );
  };

  const validateForm = () => {
    for (
      let index = 0;
      index < passengers.length;
      index++
    ) {
      const passenger = passengers[index];

      if (
        !passenger.title ||
        !passenger.firstName.trim() ||
        !passenger.lastName.trim() ||
        !passenger.gender ||
        !passenger.dateOfBirth ||
        !passenger.travelClass
      ) {
        return `Please complete all required details for Passenger ${
          index + 1
        }.`;
      }
    }

    const primaryPassenger = passengers[0];

    if (!primaryPassenger.email.trim()) {
      return "Email address is required.";
    }

    if (!primaryPassenger.phone.trim()) {
      return "Phone number is required.";
    }

    return "";
  };

  const handleContinue = () => {
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    navigate(`/booking/${flightId}`, {
      state: {
        selectedSeats,
        passengerCount,
        passengers,
      },
    });
  };

  const handleBack = () => {
    navigate(`/seat-selection/${flightId}`, {
      state: {
        selectedSeats,
        passengerCount,
      },
    });
  };

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

  const flightNumber =
    selectedFlight?.flightNumber ||
    selectedFlight?.flightCode ||
    "Flight";

  if (!selectedFlight) {
    return (
      <div className="seat-empty-state">
        <h1>Flight information not found</h1>

        <p>
          Please select a flight again before
          entering passenger details.
        </p>

        <button
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
    <div className="passenger-page">
      <header className="seat-selection-header">
        <div className="seat-selection-brand">
          <div className="brand-icon">✈</div>

          <div>
            <strong>SkyBook</strong>
            <small>Flight Booking</small>
          </div>
        </div>

        <button
          className="seat-back-button"
          onClick={handleBack}
        >
          <ArrowLeft size={17} />
          Back to Seats
        </button>
      </header>

      <main className="passenger-content">
        <div className="seat-breadcrumb">
          <span>Search</span>
          <span>/</span>
          <span>Flight Details</span>
          <span>/</span>
          <span>Seat Selection</span>
          <span>/</span>
          <strong>Passenger Details</strong>
        </div>

        <section className="passenger-title">
          <div>
            <p className="seat-eyebrow">
              STEP 3 OF 5
            </p>

            <h1>Passenger details</h1>

            <p>
              Enter the details exactly as they
              appear on the passenger's ID.
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

            <div className="progress-step active">
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

        <section className="passenger-flight-card">
          <div>
            <small>YOUR FLIGHT</small>

            <strong>
              {originCode} → {destinationCode}
            </strong>

            <span>{flightNumber}</span>
          </div>

          <div>
            <small>SELECTED SEATS</small>

            <strong>
              {selectedSeats.join(", ")}
            </strong>
          </div>

          <div>
            <small>PASSENGERS</small>

            <strong>{passengerCount}</strong>
          </div>
        </section>

        {error && (
          <div className="passenger-error">
            {error}
          </div>
        )}

        <div className="passenger-layout">
          <section className="passenger-form-card">
            <div className="passenger-card-header">
              <div>
                <h2>Passenger information</h2>

                <p>
                  {passengerCount} passenger
                  {passengerCount > 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <User size={24} />
            </div>

            {passengers.map(
              (passenger, index) => (
                <div
                  className="passenger-block"
                  key={index}
                >
                  <div className="passenger-block-title">
                    <div className="passenger-number">
                      {index + 1}
                    </div>

                    <div>
                      <h3>
                        Passenger {index + 1}
                      </h3>

                      <span>
                        Seat{" "}
                        {selectedSeats[index] ||
                          "Not selected"}
                      </span>
                    </div>
                  </div>

                  <div className="passenger-grid">
                    {/* Title */}
                    <div className="form-group">
                      <label>
                        Title *
                      </label>

                      <select
                        value={
                          passenger.title
                        }
                        onChange={(event) =>
                          updatePassenger(
                            index,
                            "title",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select title
                        </option>

                        <option value="Mr">
                          Mr
                        </option>

                        <option value="Mrs">
                          Mrs
                        </option>

                        <option value="Ms">
                          Ms
                        </option>

                        <option value="Miss">
                          Miss
                        </option>

                        <option value="Dr">
                          Dr
                        </option>
                      </select>
                    </div>

                    {/* First Name */}
                    <div className="form-group">
                      <label>
                        First Name *
                      </label>

                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={
                          passenger.firstName
                        }
                        onChange={(event) =>
                          updatePassenger(
                            index,
                            "firstName",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    {/* Last Name */}
                    <div className="form-group">
                      <label>
                        Last Name *
                      </label>

                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={
                          passenger.lastName
                        }
                        onChange={(event) =>
                          updatePassenger(
                            index,
                            "lastName",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    {/* Gender */}
                    <div className="form-group">
                      <label>
                        Gender *
                      </label>

                      <select
                        value={
                          passenger.gender
                        }
                        onChange={(event) =>
                          updatePassenger(
                            index,
                            "gender",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select gender
                        </option>

                        <option value="male">
                          Male
                        </option>

                        <option value="female">
                          Female
                        </option>

                        <option value="other">
                          Other
                        </option>
                      </select>
                    </div>

                    {/* Date of Birth */}
                    <div className="form-group">
                      <label>
                        Date of Birth *
                      </label>

                      <div className="input-icon">
                        <CalendarDays
                          size={17}
                        />

                        <input
                          type="date"
                          value={
                            passenger.dateOfBirth
                          }
                          onChange={(event) =>
                            updatePassenger(
                              index,
                              "dateOfBirth",
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Travel Class */}
                    <div className="form-group">
                      <label>
                        Travel Class *
                      </label>

                      <select
                        value={
                          passenger.travelClass
                        }
                        onChange={(event) =>
                          updatePassenger(
                            index,
                            "travelClass",
                            event.target.value
                          )
                        }
                      >
                        <option value="economy">
                          Economy
                        </option>

                        <option value="business">
                          Business
                        </option>

                        <option value="first">
                          First Class
                        </option>
                      </select>
                    </div>

                    {/* Nationality */}
                    <div className="form-group">
                      <label>
                        Nationality
                      </label>

                      <input
                        type="text"
                        value={
                          passenger.nationality
                        }
                        onChange={(event) =>
                          updatePassenger(
                            index,
                            "nationality",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    {/* Passport */}
                    <div className="form-group">
                      <label>
                        Passport Number
                      </label>

                      <input
                        type="text"
                        placeholder="Optional"
                        value={
                          passenger.passportNumber
                        }
                        onChange={(event) =>
                          updatePassenger(
                            index,
                            "passportNumber",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    {/* Email */}
                    {index === 0 && (
                      <>
                        <div className="form-group">
                          <label>
                            Email *
                          </label>

                          <div className="input-icon">
                            <Mail size={17} />

                            <input
                              type="email"
                              placeholder="you@example.com"
                              value={
                                passenger.email
                              }
                              onChange={(event) =>
                                updatePassenger(
                                  index,
                                  "email",
                                  event.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                          <label>
                            Phone *
                          </label>

                          <div className="input-icon">
                            <Phone size={17} />

                            <input
                              type="tel"
                              placeholder="Enter phone number"
                              value={
                                passenger.phone
                              }
                              onChange={(event) =>
                                updatePassenger(
                                  index,
                                  "phone",
                                  event.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            )}
          </section>

          <aside className="passenger-summary-card">
            <h2>Trip summary</h2>

            <div className="passenger-route">
              <strong>
                {originCode}
              </strong>

              <ArrowRight size={17} />

              <strong>
                {destinationCode}
              </strong>
            </div>

            <div className="summary-info-row">
              <span>Flight</span>

              <strong>
                {flightNumber}
              </strong>
            </div>

            <div className="summary-info-row">
              <span>Passengers</span>

              <strong>
                {passengerCount}
              </strong>
            </div>

            <div className="summary-info-row">
              <span>Seats</span>

              <strong>
                {selectedSeats.join(", ")}
              </strong>
            </div>

            <div className="summary-info-row">
              <span>Class</span>

              <strong>
                {passengers
                  .map(
                    (passenger) =>
                      passenger.travelClass
                  )
                  .join(", ")}
              </strong>
            </div>

            <div className="summary-security">
              <CheckCircle2 size={18} />

              <span>
                Your information is securely
                processed.
              </span>
            </div>

            <button
              className="continue-passenger-button"
              onClick={handleContinue}
            >
              Continue to Booking
              <ArrowRight size={18} />
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default PassengerDetails;