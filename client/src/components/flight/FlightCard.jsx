import {
  ArrowRight,
  Clock,
  Plane,
  Users,
} from "lucide-react";

function FlightCard({ flight, onSelect }) {
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
    if (!date) return "";

    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const price =
    flight?.pricing?.economy ??
    flight?.economyPrice ??
    flight?.price ??
    0;

  return (
    <div className="flight-card">
      <div className="flight-card-top">
        <div className="airline-info">
          <div className="airline-logo">
            <Plane size={21} />
          </div>

          <div>
            <h3>
              {flight?.airline?.name ||
                flight?.airlineName ||
                "Airline"}
            </h3>

            <p>
              {flight?.flightNumber ||
                flight?.flightCode ||
                "Flight"}
            </p>
          </div>
        </div>

        <div className="flight-status">
          {flight?.status || "scheduled"}
        </div>
      </div>

      <div className="flight-route">
        <div className="route-point">
          <strong>
            {formatTime(departureTime)}
          </strong>

          <span>
            {flight?.origin?.code ||
              flight?.from?.code ||
              flight?.originCode ||
              flight?.from ||
              "MAA"}
          </span>

          <small>
            {formatDate(departureTime)}
          </small>
        </div>

        <div className="route-middle">
          <span>
            <Clock size={15} />
            {flight?.duration
              ? `${flight.duration} min`
              : "Direct"}
          </span>

          <div className="route-line">
            <span></span>
          </div>

          <small>Direct flight</small>
        </div>

        <div className="route-point route-arrival">
          <strong>
            {formatTime(arrivalTime)}
          </strong>

          <span>
            {flight?.destination?.code ||
              flight?.to?.code ||
              flight?.destinationCode ||
              flight?.to ||
              "DEL"}
          </span>

          <small>
            {formatDate(arrivalTime)}
          </small>
        </div>
      </div>

      <div className="flight-card-bottom">
        <div className="availability">
          <Users size={16} />

          <span>
            {flight?.availableSeats ??
              flight?.seatsAvailable ??
              "--"}{" "}
            seats available
          </span>
        </div>

        <div className="flight-price">
          <small>Starting from</small>

          <strong>
            ₹{Number(price).toLocaleString("en-IN")}
          </strong>
        </div>

        <button
          type="button"
          onClick={() => onSelect(flight)}
          className="select-flight-button"
        >
          Select Flight
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}

export default FlightCard;