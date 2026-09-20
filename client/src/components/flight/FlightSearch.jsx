import { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";

function FlightSearch({ onSearch, isLoading }) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.from || !formData.to || !formData.date) {
      return;
    }

    if (formData.from === formData.to) {
      return;
    }

    onSearch({
      from: formData.from.toUpperCase(),
      to: formData.to.toUpperCase(),
      date: formData.date,
      passengers: Number(formData.passengers),
    });
  };

  return (
    <form className="flight-search-form" onSubmit={handleSubmit}>
      <div className="search-field">
        <label>
          <MapPin size={17} />
          From
        </label>

        <input
          type="text"
          name="from"
          value={formData.from}
          onChange={handleChange}
          placeholder="MAA"
          maxLength={3}
          required
        />

        <span>Airport code</span>
      </div>

      <div className="search-field">
        <label>
          <MapPin size={17} />
          To
        </label>

        <input
          type="text"
          name="to"
          value={formData.to}
          onChange={handleChange}
          placeholder="DEL"
          maxLength={3}
          required
        />

        <span>Airport code</span>
      </div>

      <div className="search-field">
        <label>
          <Calendar size={17} />
          Departure
        </label>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="search-field">
        <label>
          <Users size={17} />
          Passengers
        </label>

        <select
          name="passengers"
          value={formData.passengers}
          onChange={handleChange}
        >
          {Array.from({ length: 9 }, (_, index) => index + 1).map(
            (number) => (
              <option key={number} value={number}>
                {number} {number === 1 ? "Passenger" : "Passengers"}
              </option>
            )
          )}
        </select>
      </div>

      <button
        type="submit"
        className="flight-search-button"
        disabled={isLoading}
      >
        <Search size={19} />

        {isLoading ? "Searching..." : "Search Flights"}
      </button>
    </form>
  );
}

export default FlightSearch;