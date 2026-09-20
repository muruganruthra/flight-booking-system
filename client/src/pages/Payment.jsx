import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  LockKeyhole,
  Smartphone,
  WalletCards,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import api from "../services/api";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams();

  const { selectedFlight } = useSelector(
    (state) => state.flights
  );

  const bookingFromState = location.state?.booking || null;

  const [booking, setBooking] = useState(
    bookingFromState
  );

  const [isLoadingBooking, setIsLoadingBooking] =
    useState(!bookingFromState);

  const [paymentMethod, setPaymentMethod] =
    useState("upi");

  const [isPaying, setIsPaying] = useState(false);

  const [error, setError] = useState("");

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardHolder: "",
  });

  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("");
  const [wallet, setWallet] = useState("");

  // --------------------------------------------------
  // LOAD BOOKING
  // --------------------------------------------------

  useEffect(() => {
    const loadBooking = async () => {
      // Booking already came from BookingDetails/Booking page
      if (bookingFromState) {
        setBooking(bookingFromState);
        setIsLoadingBooking(false);
        return;
      }

      if (!bookingId) {
        setIsLoadingBooking(false);
        setError("Booking ID is missing.");
        return;
      }

      try {
        setIsLoadingBooking(true);
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
          "LOAD PAYMENT BOOKING ERROR:",
          requestError
        );

        const message =
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load booking.";

        setError(message);
        toast.error(message);
      } finally {
        setIsLoadingBooking(false);
      }
    };

    loadBooking();
  }, [bookingId, bookingFromState]);

  // --------------------------------------------------
  // PAYMENT TOTAL
  // --------------------------------------------------

  const totalAmount = useMemo(() => {
    return Number(
      booking?.totalAmount ??
        booking?.amount ??
        0
    );
  }, [booking]);

  // --------------------------------------------------
  // BOOKING INFORMATION
  // --------------------------------------------------

  const passengerCount =
    booking?.passengers?.length || 0;

  const flightNumber =
    booking?.flight?.flightNumber ||
    selectedFlight?.flightNumber ||
    "Flight";

  const airlineName =
    booking?.flight?.airline?.name ||
    selectedFlight?.airline?.name ||
    selectedFlight?.airlineName ||
    "Airline";

  const pnr = booking?.pnr || "Pending";

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
  // CARD INPUT
  // --------------------------------------------------

  const handleCardChange = (field, value) => {
    setCardDetails((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // --------------------------------------------------
  // VALIDATE PAYMENT
  // --------------------------------------------------

  const validatePaymentDetails = () => {
    if (!bookingId) {
      return "Booking ID is missing.";
    }

    if (!booking) {
      return "Booking information is missing. Please return to the booking page.";
    }

    if (!totalAmount || totalAmount <= 0) {
      return "Invalid booking amount.";
    }

    if (booking.status !== "pending") {
      return `This booking cannot be paid because its status is "${booking.status}".`;
    }

    if (
      booking.paymentStatus &&
      booking.paymentStatus !== "pending"
    ) {
      return `This booking cannot be paid because its payment status is "${booking.paymentStatus}".`;
    }

    if (!paymentMethod) {
      return "Please select a payment method.";
    }

    // CARD VALIDATION
    if (paymentMethod === "card") {
      if (
        !cardDetails.cardNumber.trim() ||
        !cardDetails.expiry.trim() ||
        !cardDetails.cvv.trim() ||
        !cardDetails.cardHolder.trim()
      ) {
        return "Please enter all card details.";
      }

      const cleanCardNumber =
        cardDetails.cardNumber.replace(/\s/g, "");

      if (cleanCardNumber.length < 12) {
        return "Please enter a valid card number.";
      }

      if (cardDetails.cvv.length < 3) {
        return "Please enter a valid CVV.";
      }
    }

    // UPI VALIDATION
    if (
      paymentMethod === "upi" &&
      !upiId.trim()
    ) {
      return "Please enter your UPI ID.";
    }

    // NET BANKING VALIDATION
    if (
      paymentMethod === "netbanking" &&
      !bank
    ) {
      return "Please select a bank.";
    }

    // WALLET VALIDATION
    if (
      paymentMethod === "wallet" &&
      !wallet
    ) {
      return "Please select a wallet.";
    }

    return "";
  };

  // --------------------------------------------------
  // CREATE PAYMENT
  // --------------------------------------------------

  const handlePayment = async () => {
    setError("");

    const validationError =
      validatePaymentDetails();

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsPaying(true);

    try {
      /*
       * Backend expects exactly:
       *
       * {
       *   bookingId,
       *   amount,
       *   paymentMethod
       * }
       *
       * Card/UPI/bank/wallet details are not
       * sent because the backend currently uses
       * processMockPayment().
       */

      const requestBody = {
        bookingId,
        amount: totalAmount,
        paymentMethod,
      };

      console.log(
        "PAYMENT REQUEST:",
        requestBody
      );

      const response = await api.post(
        "/payments",
        requestBody
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Payment failed."
        );
      }

      const payment =
        response.data.payment;

      const confirmedBooking =
        response.data.booking;

      toast.success(
        "Payment successful! Booking confirmed."
      );

      /*
       * Move to confirmation page.
       */

      navigate(
        `/booking-confirmation/${bookingId}`,
        {
          state: {
            booking: confirmedBooking,
            payment,
          },
        }
      );
    } catch (requestError) {
      console.error(
        "CREATE PAYMENT ERROR:",
        requestError
      );

      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Payment failed.";

      setError(message);

      toast.error(message);
    } finally {
      setIsPaying(false);
    }
  };

  // --------------------------------------------------
  // BACK TO BOOKING
  // --------------------------------------------------

  const handleBack = () => {
    if (isPaying) {
      return;
    }

    navigate(`/booking/${bookingId}`, {
      state: {
        booking,
      },
    });
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (isLoadingBooking) {
    return (
      <div className="payment-empty-state">
        <Loader2
          size={40}
          className="payment-spinner"
        />

        <h1>
          Loading payment details...
        </h1>

        <p>
          Please wait while we load your
          booking.
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // BOOKING NOT FOUND
  // --------------------------------------------------

  if (!booking) {
    return (
      <div className="payment-empty-state">
        <div className="payment-empty-icon">
          💳
        </div>

        <h1>
          Booking information not found
        </h1>

        <p>
          Your booking details are not
          available on this payment page.
        </p>

        <button
          type="button"
          className="payment-primary-button"
          onClick={() =>
            navigate("/search-flights")
          }
        >
          Search Flights
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // PAYMENT PAGE
  // --------------------------------------------------

  return (
    <div className="payment-page">
      <div className="payment-container">

        {/* =========================================
            HEADER
        ========================================== */}

        <div className="payment-header">
          <button
            type="button"
            className="payment-back-button"
            onClick={handleBack}
            disabled={isPaying}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div>
            <p className="payment-eyebrow">
              SECURE CHECKOUT
            </p>

            <h1>
              Complete your payment
            </h1>

            <p>
              Your seat is temporarily held
              while you complete payment.
            </p>
          </div>
        </div>

        {/* =========================================
            MAIN PAYMENT LAYOUT
        ========================================== */}

        <div className="payment-layout">

          {/* =======================================
              LEFT SIDE
          ======================================== */}

          <div className="payment-main">

            {/* ---------------------------------------
                BOOKING SUMMARY
            ---------------------------------------- */}

            <section className="payment-card">
              <div className="payment-card-header">

                <div>
                  <span className="payment-section-label">
                    Booking
                  </span>

                  <h2>
                    {airlineName} ·{" "}
                    {flightNumber}
                  </h2>
                </div>

                <div className="payment-pnr">
                  <span>PNR</span>

                  <strong>
                    {pnr}
                  </strong>
                </div>
              </div>

              <div className="payment-booking-grid">

                <div>
                  <span>
                    Passengers
                  </span>

                  <strong>
                    {passengerCount}
                  </strong>
                </div>

                <div>
                  <span>
                    Seats
                  </span>

                  <strong>
                    {booking.passengers
                      ?.map(
                        (passenger) =>
                          passenger.seatNumber
                      )
                      .join(", ") || "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Travel class
                  </span>

                  <strong>
                    {booking.passengers?.[0]
                      ?.travelClass
                      ? booking.passengers[0]
                          .travelClass
                          .charAt(0)
                          .toUpperCase() +
                        booking.passengers[0]
                          .travelClass
                          .slice(1)
                      : "Economy"}
                  </strong>
                </div>

                <div>
                  <span>
                    Booking status
                  </span>

                  <strong className="payment-status">
                    {booking.status ||
                      "Pending"}
                  </strong>
                </div>
              </div>
            </section>

            {/* ---------------------------------------
                PAYMENT METHODS
            ---------------------------------------- */}

            <section className="payment-card">

              <div className="payment-section-heading">

                <div>
                  <span className="payment-section-label">
                    Payment method
                  </span>

                  <h2>
                    Choose how you want to pay
                  </h2>
                </div>

                <LockKeyhole size={20} />
              </div>

              {/* PAYMENT METHOD BUTTONS */}

              <div className="payment-method-grid">

                {/* UPI */}

                <button
                  type="button"
                  className={`payment-method ${
                    paymentMethod === "upi"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setPaymentMethod("upi")
                  }
                  disabled={isPaying}
                >
                  <Smartphone size={22} />

                  <span>
                    UPI
                  </span>

                  {paymentMethod ===
                    "upi" && (
                    <CheckCircle2
                      size={18}
                    />
                  )}
                </button>

                {/* CARD */}

                <button
                  type="button"
                  className={`payment-method ${
                    paymentMethod === "card"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setPaymentMethod("card")
                  }
                  disabled={isPaying}
                >
                  <CreditCard size={22} />

                  <span>
                    Card
                  </span>

                  {paymentMethod ===
                    "card" && (
                    <CheckCircle2
                      size={18}
                    />
                  )}
                </button>

                {/* NET BANKING */}

                <button
                  type="button"
                  className={`payment-method ${
                    paymentMethod ===
                    "netbanking"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setPaymentMethod(
                      "netbanking"
                    )
                  }
                  disabled={isPaying}
                >
                  <Landmark size={22} />

                  <span>
                    Net Banking
                  </span>

                  {paymentMethod ===
                    "netbanking" && (
                    <CheckCircle2
                      size={18}
                    />
                  )}
                </button>

                {/* WALLET */}

                <button
                  type="button"
                  className={`payment-method ${
                    paymentMethod === "wallet"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setPaymentMethod("wallet")
                  }
                  disabled={isPaying}
                >
                  <WalletCards size={22} />

                  <span>
                    Wallet
                  </span>

                  {paymentMethod ===
                    "wallet" && (
                    <CheckCircle2
                      size={18}
                    />
                  )}
                </button>
              </div>

              {/* =====================================
                  UPI FORM
              ====================================== */}

              {paymentMethod === "upi" && (
                <div className="payment-form">

                  <label>
                    UPI ID

                    <input
                      type="text"
                      placeholder="example@upi"
                      value={upiId}
                      onChange={(event) =>
                        setUpiId(
                          event.target.value
                        )
                      }
                      disabled={isPaying}
                    />
                  </label>

                  <p className="payment-helper">
                    Example:
                    yourname@oksbi
                  </p>
                </div>
              )}

              {/* =====================================
                  CARD FORM
              ====================================== */}

              {paymentMethod === "card" && (
                <div className="payment-form">

                  <label>
                    Card holder name

                    <input
                      type="text"
                      placeholder="Name on card"
                      value={
                        cardDetails.cardHolder
                      }
                      onChange={(event) =>
                        handleCardChange(
                          "cardHolder",
                          event.target.value
                        )
                      }
                      disabled={isPaying}
                    />
                  </label>

                  <label>
                    Card number

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      value={
                        cardDetails.cardNumber
                      }
                      onChange={(event) =>
                        handleCardChange(
                          "cardNumber",
                          event.target.value
                        )
                      }
                      disabled={isPaying}
                    />
                  </label>

                  <div className="payment-form-row">

                    <label>
                      Expiry

                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={
                          cardDetails.expiry
                        }
                        onChange={(event) =>
                          handleCardChange(
                            "expiry",
                            event.target.value
                          )
                        }
                        disabled={isPaying}
                      />
                    </label>

                    <label>
                      CVV

                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="123"
                        value={
                          cardDetails.cvv
                        }
                        onChange={(event) =>
                          handleCardChange(
                            "cvv",
                            event.target.value
                          )
                        }
                        disabled={isPaying}
                      />
                    </label>

                  </div>

                  <p className="payment-helper">
                    This is a mock payment flow.
                    No real card transaction is
                    performed.
                  </p>
                </div>
              )}

              {/* =====================================
                  NET BANKING FORM
              ====================================== */}

              {paymentMethod ===
                "netbanking" && (
                <div className="payment-form">

                  <label>
                    Select bank

                    <select
                      value={bank}
                      onChange={(event) =>
                        setBank(
                          event.target.value
                        )
                      }
                      disabled={isPaying}
                    >
                      <option value="">
                        Select your bank
                      </option>

                      <option value="sbi">
                        State Bank of India
                      </option>

                      <option value="hdfc">
                        HDFC Bank
                      </option>

                      <option value="icici">
                        ICICI Bank
                      </option>

                      <option value="axis">
                        Axis Bank
                      </option>

                      <option value="kotak">
                        Kotak Mahindra Bank
                      </option>
                    </select>
                  </label>
                </div>
              )}

              {/* =====================================
                  WALLET FORM
              ====================================== */}

              {paymentMethod === "wallet" && (
                <div className="payment-form">

                  <label>
                    Select wallet

                    <select
                      value={wallet}
                      onChange={(event) =>
                        setWallet(
                          event.target.value
                        )
                      }
                      disabled={isPaying}
                    >
                      <option value="">
                        Select your wallet
                      </option>

                      <option value="paytm">
                        Paytm
                      </option>

                      <option value="phonepe">
                        PhonePe
                      </option>

                      <option value="amazonpay">
                        Amazon Pay
                      </option>
                    </select>
                  </label>
                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="payment-error">
                  {error}
                </div>
              )}
            </section>

            {/* ---------------------------------------
                SECURITY INFORMATION
            ---------------------------------------- */}

            <div className="payment-security">

              <LockKeyhole size={18} />

              <div>
                <strong>
                  Secure payment
                </strong>

                <p>
                  Your payment is processed
                  through the project's mock
                  payment gateway.
                </p>
              </div>

            </div>
          </div>

          {/* =======================================
              RIGHT SIDE
          ======================================== */}

          <aside className="payment-summary-card">

            <span className="payment-section-label">
              Payment summary
            </span>

            <h2>
              Amount payable
            </h2>

            <div className="payment-total">
              {formatCurrency(totalAmount)}
            </div>

            <div className="payment-summary-divider" />

            {/* BASE FARE */}

            <div className="payment-summary-row">

              <span>
                Base fare
              </span>

              <strong>
                {formatCurrency(
                  booking.baseFare
                )}
              </strong>

            </div>

            {/* TAX */}

            <div className="payment-summary-row">

              <span>
                Tax
              </span>

              <strong>
                {formatCurrency(
                  booking.tax
                )}
              </strong>

            </div>

            {/* CONVENIENCE FEE */}

            <div className="payment-summary-row">

              <span>
                Convenience fee
              </span>

              <strong>
                {formatCurrency(
                  booking.convenienceFee
                )}
              </strong>

            </div>

            <div className="payment-summary-divider" />

            {/* TOTAL */}

            <div className="payment-summary-row payment-summary-final">

              <span>
                Total
              </span>

              <strong>
                {formatCurrency(
                  totalAmount
                )}
              </strong>

            </div>

            {/* PAY BUTTON */}

            <button
              type="button"
              className="payment-pay-button"
              onClick={handlePayment}
              disabled={isPaying}
            >
              {isPaying ? (
                <>
                  <Loader2
                    size={19}
                    className="payment-spinner"
                  />

                  Processing payment...
                </>
              ) : (
                <>
                  Pay{" "}
                  {formatCurrency(
                    totalAmount
                  )}
                </>
              )}
            </button>

            {/* TRUST MESSAGE */}

            <div className="payment-trust">

              <CheckCircle2 size={17} />

              <span>
                Booking will be confirmed
                after successful payment.
              </span>

            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}

export default Payment;