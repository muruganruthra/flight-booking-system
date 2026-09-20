import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Mail,
  Plane,
  RefreshCw,
  Ticket,
  UserRound,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

function BookingDetails() {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isGeneratingTicket, setIsGeneratingTicket] =
    useState(false);

  const [isDownloading, setIsDownloading] =
    useState(false);

  const [isEmailing, setIsEmailing] =
    useState(false);

  const [isCancelling, setIsCancelling] =
    useState(false);

  const [showCancelConfirm, setShowCancelConfirm] =
    useState(false);

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "booking-details-status confirmed";

      case "cancelled":
        return "booking-details-status cancelled";

      case "completed":
        return "booking-details-status completed";

      case "pending":
      default:
        return "booking-details-status pending";
    }
  };

  const loadBooking = async () => {
    setIsLoading(true);
    setError("");

    try {
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
        "GET BOOKING DETAILS ERROR:",
        requestError
      );

      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Failed to load booking details.";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  /*
   * Generate ticket
   */
  const handleGenerateTicket = async () => {
    setIsGeneratingTicket(true);

    try {
      const response = await api.post(
        `/bookings/${bookingId}/ticket`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to generate ticket."
        );
      }

      toast.success("Ticket generated successfully.");

      await loadBooking();
    } catch (requestError) {
      console.error(
        "GENERATE TICKET ERROR:",
        requestError
      );

      toast.error(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to generate ticket."
      );
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  /*
   * Download ticket
   */
  const handleDownloadTicket = async () => {
    setIsDownloading(true);

    try {
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

      const url = window.URL.createObjectURL(
        blob
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = `ticket-${booking?.pnr || bookingId}.pdf`;

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

      toast.error(
        "Ticket is not available. Generate the ticket first."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  /*
   * Email ticket
   */
  const handleEmailTicket = async () => {
    setIsEmailing(true);

    try {
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

      toast.error(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to send ticket email."
      );
    } finally {
      setIsEmailing(false);
    }
  };

  /*
   * Cancel booking
   */
  const handleCancelBooking = async () => {
    setIsCancelling(true);

    try {
      const response = await api.post(
        `/bookings/${bookingId}/cancel`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to cancel booking."
        );
      }

      toast.success(
        response.data?.message ||
          "Booking cancelled successfully."
      );

      setShowCancelConfirm(false);

      await loadBooking();
    } catch (requestError) {
      console.error(
        "CANCEL BOOKING ERROR:",
        requestError
      );

      toast.error(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to cancel booking."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="booking-details-loading">
        <Loader2
          size={40}
          className="booking-details-spinner"
        />

        <h2>Loading booking...</h2>

        <p>
          Please wait while we retrieve your
          reservation.
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-details-error-page">
        <AlertCircle size={48} />

        <h1>Booking not found</h1>

        <p>
          {error ||
            "We could not find this booking."}
        </p>

        <button
          type="button"
          className="booking-details-primary"
          onClick={() =>
            navigate("/my-bookings")
          }
        >
          <ArrowLeft size={18} />
          Back to My Bookings
        </button>
      </div>
    );
  }

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

  const isConfirmed =
    booking.status === "confirmed";

  const isCancelled =
    booking.status === "cancelled";

  const isPending =
    booking.status === "pending";

  return (
    <div className="booking-details-page">
      <div className="booking-details-container">
        {/* Header */}
        <div className="booking-details-header">
          <button
            type="button"
            className="booking-details-back"
            onClick={() =>
              navigate("/my-bookings")
            }
          >
            <ArrowLeft size={18} />
            My Bookings
          </button>

          <div className="booking-details-heading">
            <div>
              <span className="booking-details-eyebrow">
                RESERVATION DETAILS
              </span>

              <h1>
                {airlineName} · {flightNumber}
              </h1>

              <p>
                PNR:{" "}
                <strong>
                  {booking.pnr || "N/A"}
                </strong>
              </p>
            </div>

            <span
              className={getStatusClass(
                booking.status
              )}
            >
              {booking.status || "pending"}
            </span>
          </div>
        </div>

        {/* Pending Notice */}
        {isPending && (
          <div className="booking-details-warning">
            <AlertCircle size={20} />

            <div>
              <strong>
                Payment is still pending
              </strong>

              <p>
                Complete payment before your
                temporary seat reservation expires.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/payment/${booking._id}`,
                  {
                    state: { booking },
                  }
                )
              }
            >
              Complete Payment
            </button>
          </div>
        )}

        {/* Cancelled Notice */}
        {isCancelled && (
          <div className="booking-details-cancelled-notice">
            <XCircle size={20} />

            <div>
              <strong>
                This booking has been cancelled
              </strong>

              <p>
                No further ticket actions are
                available for this reservation.
              </p>
            </div>
          </div>
        )}

        {/* Flight */}
        <section className="booking-details-card">
          <div className="booking-details-card-header">
            <div>
              <span className="booking-details-section-label">
                Flight
              </span>

              <h2>
                {airlineName} · {flightNumber}
              </h2>
            </div>

            {isConfirmed && (
              <span className="booking-details-confirmed">
                <CheckCircle2 size={16} />
                Confirmed
              </span>
            )}
          </div>

          <div className="booking-details-route">
            <div>
              <strong>{departure}</strong>

              <span>Departure</span>
            </div>

            <div className="booking-details-route-line">
              <div />
              <Plane size={19} />
              <div />
            </div>

            <div className="booking-details-arrival">
              <strong>{arrival}</strong>

              <span>Arrival</span>
            </div>
          </div>

          <div className="booking-details-flight-info">
            <div>
              <CalendarDays size={17} />

              <span>
                {formatDate(
                  flight.departureDateTime
                )}
              </span>
            </div>

            <div>
              <Plane size={17} />

              <span>
                {flight.durationMinutes
                  ? `${flight.durationMinutes} minutes`
                  : "Duration unavailable"}
              </span>
            </div>
          </div>
        </section>

        {/* Passengers */}
        <section className="booking-details-card">
          <div className="booking-details-card-header">
            <div>
              <span className="booking-details-section-label">
                Passengers
              </span>

              <h2>
                {booking.passengers?.length || 0}{" "}
                passenger
                {(booking.passengers?.length ||
                  0) !== 1
                  ? "s"
                  : ""}
              </h2>
            </div>
          </div>

          <div className="booking-details-passengers">
            {booking.passengers?.map(
              (passenger, index) => (
                <div
                  className="booking-details-passenger"
                  key={
                    passenger._id ||
                    `${passenger.firstName}-${index}`
                  }
                >
                  <div className="booking-details-user-icon">
                    <UserRound size={19} />
                  </div>

                  <div className="booking-details-passenger-main">
                    <strong>
                      {passenger.title}{" "}
                      {passenger.firstName}{" "}
                      {passenger.lastName}
                    </strong>

                    <span>
                      {passenger.nationality ||
                        "Indian"}
                    </span>
                  </div>

                  <div>
                    <span>Seat</span>
                    <strong>
                      {passenger.seatNumber ||
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Class</span>
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

                  <div>
                    <span>Baggage</span>
                    <strong>
                      {passenger.baggage || 0} kg
                    </strong>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Contact */}
        <section className="booking-details-card">
          <div className="booking-details-card-header">
            <div>
              <span className="booking-details-section-label">
                Contact
              </span>

              <h2>Booking contact</h2>
            </div>
          </div>

          <div className="booking-details-contact">
            <div>
              <span>Email</span>
              <strong>
                {booking.contactEmail || "N/A"}
              </strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>
                {booking.contactPhone || "N/A"}
              </strong>
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="booking-details-card">
          <div className="booking-details-card-header">
            <div>
              <span className="booking-details-section-label">
                Payment
              </span>

              <h2>Fare breakdown</h2>
            </div>

            <span
              className={`booking-details-payment-status ${
                booking.paymentStatus || "pending"
              }`}
            >
              {booking.paymentStatus ||
                "pending"}
            </span>
          </div>

          <div className="booking-details-fare">
            <div>
              <span>Base fare</span>

              <strong>
                {formatCurrency(
                  booking.baseFare
                )}
              </strong>
            </div>

            <div>
              <span>Tax</span>

              <strong>
                {formatCurrency(booking.tax)}
              </strong>
            </div>

            <div>
              <span>Convenience fee</span>

              <strong>
                {formatCurrency(
                  booking.convenienceFee
                )}
              </strong>
            </div>
          </div>

          <div className="booking-details-total">
            <span>Total amount</span>

            <strong>
              {formatCurrency(
                booking.totalAmount
              )}
            </strong>
          </div>
        </section>

        {/* Actions */}
        <section className="booking-details-actions">
          {isConfirmed && (
            <>
              <button
                type="button"
                className="booking-action-primary"
                onClick={handleGenerateTicket}
                disabled={isGeneratingTicket}
              >
                {isGeneratingTicket ? (
                  <Loader2
                    size={18}
                    className="booking-details-spinner"
                  />
                ) : (
                  <FileText size={18} />
                )}

                {isGeneratingTicket
                  ? "Generating..."
                  : "Generate Ticket"}
              </button>

              <button
                type="button"
                className="booking-action-secondary"
                onClick={handleDownloadTicket}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2
                    size={18}
                    className="booking-details-spinner"
                  />
                ) : (
                  <Download size={18} />
                )}

                {isDownloading
                  ? "Downloading..."
                  : "Download Ticket"}
              </button>

              <button
                type="button"
                className="booking-action-secondary"
                onClick={handleEmailTicket}
                disabled={isEmailing}
              >
                {isEmailing ? (
                  <Loader2
                    size={18}
                    className="booking-details-spinner"
                  />
                ) : (
                  <Mail size={18} />
                )}

                {isEmailing
                  ? "Sending..."
                  : "Email Ticket"}
              </button>
            </>
          )}

          {!isCancelled && (
            <button
              type="button"
              className="booking-action-danger"
              onClick={() =>
                setShowCancelConfirm(true)
              }
              disabled={isCancelling}
            >
              <XCircle size={18} />
              Cancel Booking
            </button>
          )}

          <button
            type="button"
            className="booking-action-refresh"
            onClick={loadBooking}
            disabled={isLoading}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </section>

        {/* Cancellation Modal */}
        {showCancelConfirm && (
          <div className="booking-cancel-overlay">
            <div className="booking-cancel-modal">
              <div className="booking-cancel-icon">
                <XCircle size={28} />
              </div>

              <h2>
                Cancel this booking?
              </h2>

              <p>
                This will cancel the reservation
                for PNR{" "}
                <strong>
                  {booking.pnr}
                </strong>
                .
              </p>

              <div className="booking-cancel-actions">
                <button
                  type="button"
                  className="booking-cancel-back"
                  onClick={() =>
                    setShowCancelConfirm(false)
                  }
                  disabled={isCancelling}
                >
                  Keep Booking
                </button>

                <button
                  type="button"
                  className="booking-cancel-confirm"
                  onClick={
                    handleCancelBooking
                  }
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2
                        size={17}
                        className="booking-details-spinner"
                      />
                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel Booking"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingDetails;