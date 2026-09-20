import { Search } from "lucide-react";

function FlightSummary({
  from,
  to,
  date,
  passengers,
  resultCount,
}) {
  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "";

  return (
    <div className="flight-summary">
      <div className="summary-icon">
        <Search size={21} />
      </div>

      <div>
        <h2>
          {from || "---"}{" "}
          <span>→</span>{" "}
          {to || "---"}
        </h2>

        <p>
          {formattedDate || "Select a date"}{" "}
          •{" "}
          {passengers || 1}{" "}
          {Number(passengers) === 1
            ? "Passenger"
            : "Passengers"}
        </p>
      </div>

      <div className="result-count">
        <strong>{resultCount}</strong>
        <span>
          {resultCount === 1
            ? "Flight found"
            : "Flights found"}
        </span>
      </div>
    </div>
  );
}

export default FlightSummary;