import { SlidersHorizontal } from "lucide-react";

function FlightFilters({ sortBy, setSortBy }) {
  return (
    <div className="flight-filters">
      <div className="filter-title">
        <SlidersHorizontal size={18} />
        <span>Sort Flights</span>
      </div>

      <select
        value={sortBy}
        onChange={(event) => {
          setSortBy(event.target.value);
        }}
      >
        <option value="default">
          Recommended
        </option>

        <option value="price-low">
          Price: Low to High
        </option>

        <option value="price-high">
          Price: High to Low
        </option>

        <option value="duration">
          Shortest Duration
        </option>
      </select>
    </div>
  );
}

export default FlightFilters;