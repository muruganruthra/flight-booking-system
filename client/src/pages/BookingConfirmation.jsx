import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Download,
  Mail,
  Plane,
  Ticket,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  ArrowRight,
  Loader2,
  CreditCard,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams();

  const bookingFromState =
    location.state?.booking || null;

  const paymentFromState =
    location.state?.payment || null;

  const [booking, setBooking] =
    useState(bookingFromState);

  const [payment, setPayment] =
    useState(paymentFromState);

  const [isLoading, setIsLoading] =
    useState(!bookingFromState);

  const [isGeneratingTicket, setIsGeneratingTicket] =
    useState(false);

  const [isDownloadingTicket, setIsDownloadingTicket] =
    useState(false);

  const [isEmailingTicket, setIsEmailingTicket] =
    useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD BOOKING
  // --------------------------------------------------

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        setError("Booking ID is missing.");
        setIsLoading(false);
        return;
      }

      /*
       * If booking came through navigation state,
       * we already have the required data.
       *
       * Still keep the payment data if available.
       */
      if (bookingFromState) {
        setBooking(bookingFromState);
        setPayment(paymentFromState);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await api.get(
          `/bookings/${bookingId}`
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Failed to load booking."
          );
        }

        setBooking(response.data.booking);
      } catch (requestError) {
        console.error(
          "LOAD CONFIRMATION BOOKING ERROR:",
          requestError
        );

        const message =
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load booking.";

        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [
    bookingId,
    bookingFromState,
    paymentFromState,
  ]);

  // --------------------------------------------------
  // FORMAT CURRENCY
  // --------------------------------------------------

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // --------------------------------------------------
  // FORMAT TIME
  // --------------------------------------------------

  const formatTime = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // --------------------------------------------------
  // GENERATE TICKET
  // --------------------------------------------------

  const handleGenerateTicket = async () => {
    if (!bookingId) {
      return;
    }

    try {
      setIsGeneratingTicket(true);

      const response = await api.post(
        `/bookings/${bookingId}/ticket`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to generate ticket."
        );
      }

      toast.success(
        "Ticket generated successfully."
      );

      /*
       * Backend may return an updated booking.
       * Refresh the booking afterwards so the
       * confirmation page stays synchronized.
       */

      const bookingResponse =
        await api.get(
          `/bookings/${bookingId}`
        );

      if (bookingResponse.data?.success) {
        setBooking(
          bookingResponse.data.booking
        );
      }
    } catch (requestError) {
      console.error(
        "GENERATE TICKET ERROR:",
        requestError
      );

      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Failed to generate ticket.";

      toast.error(message);
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  // --------------------------------------------------
  // DOWNLOAD TICKET
  // --------------------------------------------------

  const handleDownloadTicket = async () => {
    if (!bookingId) {
      return;
    }

    try {
      setIsDownloadingTicket(true);

      /*
       * Make sure the ticket exists first.
       */

      await api.post(
        `/bookings/${bookingId}/ticket`
      );

      const response = await api.get(
        `/bookings/${bookingId}/ticket`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = `ticket-${
        booking?.pnr || bookingId
      }.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success(
        "Ticket downloaded successfully."
      );
    } catch (requestError) {
      console.error(
        "DOWNLOAD TICKET ERROR:",
        requestError
      );

      /*
       * If the backend returns a JSON error as a
       * Blob, show a generic message rather than
       * exposing the raw Blob object.
       */

      toast.error(
        "Unable to download ticket. Please generate the ticket first."
      );
    } finally {
      setIsDownloadingTicket(false);
    }
  };

  // --------------------------------------------------
  // EMAIL TICKET
  // --------------------------------------------------

  const handleEmailTicket = async () => {
    if (!bookingId) {
      return;
    }

    try {
      setIsEmailingTicket(true);

      const response = await api.post(
        `/bookings/${bookingId}/email-ticket`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to email ticket."
        );
      }

      toast.success(
        "Ticket email request sent successfully."
      );
    } catch (requestError) {
      console.error(
        "EMAIL TICKET ERROR:",
        requestError
      );

      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Failed to email ticket.";

      toast.error(message);
    } finally {
      setIsEmailingTicket(false);
    }
  };

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  const handleViewBooking = () => {
    navigate(
      `/my-bookings/${bookingId}`,
      {
        state: {
          booking,
        },
      }
    );
  };

  const handleMyBookings = () => {
    navigate("/my-bookings");
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className="confirmation-empty-state">
        <Loader2
          size={42}
          className="confirmation-spinner"
        />

        <h1>
          Loading confirmation...
        </h1>

        <p>
          Please wait while we load your
          booking details.
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR / NO BOOKING
  // --------------------------------------------------

  if (!booking) {
    return (
      <div className="confirmation-empty-state">
        <div className="confirmation-empty-icon">
          🎫
        </div>

        <h1>
          Booking not found
        </h1>

        <p>
          We could not load your booking
          confirmation.
        </p>

        {error && (
          <div className="confirmation-error">
            {error}
          </div>
        )}

        <button
          type="button"
          className="confirmation-primary-button"
          onClick={handleMyBookings}
        >
          Go to My Bookings
        </button>
      </div>
    );
  }

  const flight = booking.flight || {};

  const departureAirport =
    flight.departureAirport || {};

  const arrivalAirport =
    flight.arrivalAirport || {};

  const airline =
    flight.airline || {};

  const passengers =
    booking.passengers || [];

  const seats = passengers
    .map(
      (passenger) =>
        passenger.seatNumber
    )
    .filter(Boolean);

  const transactionId =
    payment?.transactionId ||
    payment?.transactionID ||
    payment?.id ||
    "Processed successfully";

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">

        {/* =========================================
            SUCCESS HEADER
        ========================================== */}

        <section className="confirmation-success-card">

          <div className="confirmation-success-icon">
            <CheckCircle2 size={48} />
          </div>

          <div>
            <p className="confirmation-eyebrow">
              PAYMENT SUCCESSFUL
            </p>

            <h1>
              Your booking is confirmed
            </h1>

            <p>
              Your payment has been processed
              successfully and your seats are
              confirmed.
            </p>
          </div>

          <div className="confirmation-pnr">
            <span>
              PNR
            </span>

            <strong>
              {booking.pnr || "—"}
            </strong>
          </div>

        </section>

        {/* =========================================
            BOOKING STATUS
        ========================================== */}

        <div className="confirmation-status-row">

          <div className="confirmation-status-item">
            <CheckCircle2 size={18} />

            <div>
              <span>
                Booking status
              </span>

              <strong>
                {booking.status ||
                  "confirmed"}
              </strong>
            </div>
          </div>

          <div className="confirmation-status-item">
            <CreditCard size={18} />

            <div>
              <span>
                Payment status
              </span>

              <strong>
                {booking.paymentStatus ||
                  payment?.status ||
                  "paid"}
              </strong>
            </div>
          </div>

          <div className="confirmation-status-item">
            <Ticket size={18} />

            <div>
              <span>
                Booking date
              </span>

              <strong>
                {formatDate(
                  booking.bookedAt ||
                    booking.createdAt
                )}
              </strong>
            </div>
          </div>

        </div>

        {/* =========================================
            FLIGHT DETAILS
        ========================================== */}

        <section className="confirmation-card">

          <div className="confirmation-card-heading">

            <div>
              <span className="confirmation-section-label">
                Flight
              </span>

              <h2>
                {airline.name ||
                  "Airline"}{" "}
                ·{" "}
                {flight.flightNumber ||
                  "Flight"}
              </h2>
            </div>

            <Plane size={24} />

          </div>

          <div className="confirmation-route">

            {/* DEPARTURE */}

            <div className="confirmation-airport">

              <span>
                Departure
              </span>

              <strong>
                {departureAirport.code ||
                  departureAirport.iataCode ||
                  "—"}
              </strong>

              <p>
                {departureAirport.city ||
                  departureAirport.name ||
                  "Departure airport"}
              </p>

              <div className="confirmation-time">
                <Clock3 size={16} />

                {formatTime(
                  flight.departureDateTime
                )}
              </div>

              <div className="confirmation-date">
                <CalendarDays size={15} />

                {formatDate(
                  flight.departureDateTime
                )}
              </div>

            </div>

            {/* ROUTE LINE */}

            <div className="confirmation-route-line">

              <div className="confirmation-route-dot" />

              <div className="confirmation-route-track">
                <ArrowRight size={20} />
              </div>

              <div className="confirmation-route-dot" />

            </div>

            {/* ARRIVAL */}

            <div className="confirmation-airport">

              <span>
                Arrival
              </span>

              <strong>
                {arrivalAirport.code ||
                  arrivalAirport.iataCode ||
                  "—"}
              </strong>

              <p>
                {arrivalAirport.city ||
                  arrivalAirport.name ||
                  "Arrival airport"}
              </p>

              <div className="confirmation-time">
                <Clock3 size={16} />

                {formatTime(
                  flight.arrivalDateTime
                )}
              </div>

              <div className="confirmation-date">
                <CalendarDays size={15} />

                {formatDate(
                  flight.arrivalDateTime
                )}
              </div>

            </div>

          </div>

        </section>

        {/* =========================================
            PASSENGERS
        ========================================== */}

        <section className="confirmation-card">

          <div className="confirmation-card-heading">

            <div>
              <span className="confirmation-section-label">
                Passengers
              </span>

              <h2>
                Passenger details
              </h2>
            </div>

            <Users size={24} />

          </div>

          <div className="confirmation-passenger-list">

            {passengers.map(
              (passenger, index) => (
                <div
                  className="confirmation-passenger"
                  key={
                    passenger._id ||
                    `${passenger.firstName}-${index}`
                  }
                >

                  <div className="confirmation-passenger-number">
                    {index + 1}
                  </div>

                  <div className="confirmation-passenger-info">

                    <strong>
                      {passenger.title}{" "}
                      {passenger.firstName}{" "}
                      {passenger.lastName}
                    </strong>

                    <span>
                      {passenger.gender
                        ? passenger.gender
                            .charAt(0)
                            .toUpperCase() +
                          passenger.gender.slice(1)
                        : "—"}
                      {" · "}
                      {passenger.nationality ||
                        "Indian"}
                    </span>

                  </div>

                  <div className="confirmation-passenger-seat">

                    <span>
                      Seat
                    </span>

                    <strong>
                      {passenger.seatNumber ||
                        "—"}
                    </strong>

                  </div>

                  <div className="confirmation-passenger-class">

                    <span>
                      Class
                    </span>

                    <strong>
                      {passenger.travelClass
                        ? passenger.travelClass
                            .charAt(0)
                            .toUpperCase() +
                          passenger.travelClass.slice(
                            1
                          )
                        : "Economy"}
                    </strong>

                  </div>

                </div>
              )
            )}

          </div>

        </section>

        {/* =========================================
            PAYMENT DETAILS
        ========================================== */}

        <section className="confirmation-card">

          <div className="confirmation-card-heading">

            <div>
              <span className="confirmation-section-label">
                Payment
              </span>

              <h2>
                Payment details
              </h2>
            </div>

            <CreditCard size={24} />

          </div>

          <div className="confirmation-payment-grid">

            <div>
              <span>
                Payment method
              </span>

              <strong>
                {payment?.paymentMethod ||
                  "Mock Payment"}
              </strong>
            </div>

            <div>
              <span>
                Transaction ID
              </span>

              <strong>
                {transactionId}
              </strong>
            </div>

            <div>
              <span>
                Base fare
              </span>

              <strong>
                {formatCurrency(
                  booking.baseFare
                )}
              </strong>
            </div>

            <div>
              <span>
                Tax
              </span>

              <strong>
                {formatCurrency(
                  booking.tax
                )}
              </strong>
            </div>

            <div>
              <span>
                Convenience fee
              </span>

              <strong>
                {formatCurrency(
                  booking.convenienceFee
                )}
              </strong>
            </div>

            <div className="confirmation-payment-total">
              <span>
                Total paid
              </span>

              <strong>
                {formatCurrency(
                  booking.totalAmount
                )}
              </strong>
            </div>

          </div>

        </section>

        {/* =========================================
            SEAT SUMMARY
        ========================================== */}

        <section className="confirmation-seat-summary">

          <MapPin size={20} />

          <div>
            <span>
              Confirmed seats
            </span>

            <strong>
              {seats.length > 0
                ? seats.join(", ")
                : "—"}
            </strong>
          </div>

          <div className="confirmation-seat-count">
            {seats.length}{" "}
            {seats.length === 1
              ? "seat"
              : "seats"}
          </div>

        </section>

        {/* =========================================
            TICKET ACTIONS
        ========================================== */}

        <section className="confirmation-actions-card">

          <div>
            <span className="confirmation-section-label">
              Your ticket
            </span>

            <h2>
              Download or email your ticket
            </h2>

            <p>
              Generate your ticket after payment
              and keep a copy for your journey.
            </p>
          </div>

          <div className="confirmation-actions">

            <button
              type="button"
              className="confirmation-action-button primary"
              onClick={
                handleGenerateTicket
              }
              disabled={
                isGeneratingTicket ||
                isDownloadingTicket
              }
            >
              {isGeneratingTicket ? (
                <>
                  <Loader2
                    size={18}
                    className="confirmation-spinner"
                  />

                  Generating...
                </>
              ) : (
                <>
                  <Ticket size={18} />

                  Generate Ticket
                </>
              )}
            </button>

            <button
              type="button"
              className="confirmation-action-button"
              onClick={
                handleDownloadTicket
              }
              disabled={
                isGeneratingTicket ||
                isDownloadingTicket
              }
            >
              {isDownloadingTicket ? (
                <>
                  <Loader2
                    size={18}
                    className="confirmation-spinner"
                  />

                  Downloading...
                </>
              ) : (
                <>
                  <Download size={18} />

                  Download PDF
                </>
              )}
            </button>

            <button
              type="button"
              className="confirmation-action-button"
              onClick={
                handleEmailTicket
              }
              disabled={
                isEmailingTicket
              }
            >
              {isEmailingTicket ? (
                <>
                  <Loader2
                    size={18}
                    className="confirmation-spinner"
                  />

                  Sending...
                </>
              ) : (
                <>
                  <Mail size={18} />

                  Email Ticket
                </>
              )}
            </button>

          </div>

        </section>

        {/* =========================================
            FOOTER ACTIONS
        ========================================== */}

        <div className="confirmation-footer-actions">

          <button
            type="button"
            className="confirmation-secondary-button"
            onClick={handleViewBooking}
          >
            View Booking Details
          </button>

          <button
            type="button"
            className="confirmation-primary-button"
            onClick={handleMyBookings}
          >
            Go to My Bookings
          </button>

        </div>

      </div>
    </div>
  );
}

export default BookingConfirmation;