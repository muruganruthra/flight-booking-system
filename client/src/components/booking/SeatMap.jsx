import { Check, Lock, UserRound } from "lucide-react";

function SeatMap({
  seats = [],
  selectedSeats = [],
  onSeatSelect,
  maxSeats = 1,
}) {
  const getSeatNumber = (seat, index) => {
    if (typeof seat === "string") {
      return seat;
    }

    return (
      seat?.seatNumber ||
      seat?.number ||
      seat?.seat ||
      seat?.name ||
      `S${index + 1}`
    );
  };

  const getSeatStatus = (seat) => {
    if (typeof seat === "string") {
      return "available";
    }

    return (
      seat?.status ||
      seat?.seatStatus ||
      (seat?.isBooked
        ? "booked"
        : seat?.isHeld
        ? "held"
        : "available")
    ).toLowerCase();
  };

  const getSeatClass = (seat, index) => {
    const seatNumber = getSeatNumber(seat, index);
    const status = getSeatStatus(seat);

    if (selectedSeats.includes(seatNumber)) {
      return "seat selected";
    }

    if (
      status === "booked" ||
      status === "occupied" ||
      status === "unavailable"
    ) {
      return "seat booked";
    }

    if (
      status === "held" ||
      status === "reserved"
    ) {
      return "seat held";
    }

    return "seat available";
  };

  const handleSeatClick = (seat, index) => {
    const seatNumber = getSeatNumber(seat, index);
    const status = getSeatStatus(seat);

    if (
      status === "booked" ||
      status === "occupied" ||
      status === "unavailable" ||
      status === "held" ||
      status === "reserved"
    ) {
      return;
    }

    onSeatSelect(seatNumber);
  };

  /*
    The backend may return seats in different formats.
    We normalize them here so the UI remains flexible.
  */
  const normalizedSeats = Array.isArray(seats)
    ? seats
    : [];

  /*
    If the API returns an empty array, create a
    standard 6-column economy layout so the page
    is still visually usable.
  */
  const displaySeats =
    normalizedSeats.length > 0
      ? normalizedSeats
      : Array.from({ length: 30 }, (_, index) => ({
          seatNumber: `${Math.floor(index / 6) + 1}${String.fromCharCode(
            65 + (index % 6)
          )}`,
          status: "available",
        }));

  const rows = [];

  for (let i = 0; i < displaySeats.length; i += 6) {
    rows.push(displaySeats.slice(i, i + 6));
  }

  return (
    <div className="seat-map-wrapper">
      <div className="seat-map-legend">
        <div className="seat-legend-item">
          <span className="legend-seat available"></span>
          <span>Available</span>
        </div>

        <div className="seat-legend-item">
          <span className="legend-seat selected"></span>
          <span>Selected</span>
        </div>

        <div className="seat-legend-item">
          <span className="legend-seat booked"></span>
          <span>Booked</span>
        </div>

        <div className="seat-legend-item">
          <span className="legend-seat held"></span>
          <span>Held</span>
        </div>
      </div>

      <div className="aircraft-cabin">
        <div className="aircraft-front">
          <div className="cockpit-window"></div>
          <span>FRONT</span>
        </div>

        <div className="seat-column-labels">
          <span>A</span>
          <span>B</span>
          <span>C</span>
          <span></span>
          <span>D</span>
          <span>E</span>
          <span>F</span>
        </div>

        <div className="seat-rows">
          {rows.map((row, rowIndex) => {
            const rowNumber = rowIndex + 1;

            return (
              <div
                className="seat-row"
                key={`row-${rowNumber}`}
              >
                <span className="row-number">
                  {rowNumber}
                </span>

                <div className="seat-group">
                  {row.slice(0, 3).map(
                    (seat, index) => {
                      const actualIndex =
                        rowIndex * 6 + index;

                      const seatNumber =
                        getSeatNumber(
                          seat,
                          actualIndex
                        );

                      const seatClass =
                        getSeatClass(
                          seat,
                          actualIndex
                        );

                      return (
                        <button
                          key={seatNumber}
                          type="button"
                          className={seatClass}
                          onClick={() =>
                            handleSeatClick(
                              seat,
                              actualIndex
                            )
                          }
                          disabled={
                            seatClass.includes(
                              "booked"
                            ) ||
                            seatClass.includes(
                              "held"
                            )
                          }
                          title={
                            seatClass.includes(
                              "booked"
                            )
                              ? "Seat already booked"
                              : seatClass.includes(
                                  "held"
                                )
                              ? "Seat temporarily held"
                              : selectedSeats.includes(
                                  seatNumber
                                )
                              ? "Selected seat"
                              : "Select seat"
                          }
                        >
                          {seatClass.includes(
                            "selected"
                          ) ? (
                            <Check size={15} />
                          ) : seatClass.includes(
                              "booked"
                            ) ? (
                            <Lock size={13} />
                          ) : (
                            <UserRound size={14} />
                          )}

                          <span>
                            {seatNumber}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="aisle"></div>

                <div className="seat-group">
                  {row.slice(3, 6).map(
                    (seat, index) => {
                      const actualIndex =
                        rowIndex * 6 +
                        index +
                        3;

                      const seatNumber =
                        getSeatNumber(
                          seat,
                          actualIndex
                        );

                      const seatClass =
                        getSeatClass(
                          seat,
                          actualIndex
                        );

                      return (
                        <button
                          key={seatNumber}
                          type="button"
                          className={seatClass}
                          onClick={() =>
                            handleSeatClick(
                              seat,
                              actualIndex
                            )
                          }
                          disabled={
                            seatClass.includes(
                              "booked"
                            ) ||
                            seatClass.includes(
                              "held"
                            )
                          }
                          title={
                            seatClass.includes(
                              "booked"
                            )
                              ? "Seat already booked"
                              : seatClass.includes(
                                  "held"
                                )
                              ? "Seat temporarily held"
                              : "Select seat"
                          }
                        >
                          {seatClass.includes(
                            "selected"
                          ) ? (
                            <Check size={15} />
                          ) : seatClass.includes(
                              "booked"
                            ) ? (
                            <Lock size={13} />
                          ) : (
                            <UserRound size={14} />
                          )}

                          <span>
                            {seatNumber}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="aircraft-rear">
          <span>REAR</span>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="selected-seat-message">
          <Check size={17} />
          <span>
            {selectedSeats.length} of{" "}
            {maxSeats} seat
            {maxSeats !== 1 ? "s" : ""} selected
          </span>
        </div>
      )}
    </div>
  );
}

export default SeatMap;