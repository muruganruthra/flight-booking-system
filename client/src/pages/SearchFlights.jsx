import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import FlightSearch from "../components/flight/FlightSearch";
import FlightCard from "../components/flight/FlightCard";
import FlightFilters from "../components/flight/FlightFilters";
import FlightSummary from "../components/flight/FlightSummary";

import {
  searchFlights,
  setSelectedFlight,
} from "../redux/slices/flightSlice";

function SearchFlights() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    searchResults,
    isSearching,
    isError,
    message,
  } = useSelector((state) => state.flights);

  const [searchInfo, setSearchInfo] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1,
  });

  const [hasSearched, setHasSearched] =
    useState(false);

  const [sortBy, setSortBy] =
    useState("default");

  const handleSearch = async (searchData) => {
    setSearchInfo(searchData);
    setHasSearched(true);

    await dispatch(
      searchFlights(searchData)
    );
  };

  const handleSelectFlight = (flight) => {
  dispatch(
    setSelectedFlight({
      ...flight,
      passengers: searchInfo.passengers,
    })
  );

  navigate(`/flight-details/${flight._id}`);
};

  const sortedFlights = useMemo(() => {
    const flights = [...searchResults];

    if (sortBy === "price-low") {
      flights.sort((a, b) => {
        const priceA =
          a?.pricing?.economy ??
          a?.economyPrice ??
          a?.price ??
          0;

        const priceB =
          b?.pricing?.economy ??
          b?.economyPrice ??
          b?.price ??
          0;

        return priceA - priceB;
      });
    }

    if (sortBy === "price-high") {
      flights.sort((a, b) => {
        const priceA =
          a?.pricing?.economy ??
          a?.economyPrice ??
          a?.price ??
          0;

        const priceB =
          b?.pricing?.economy ??
          b?.economyPrice ??
          b?.price ??
          0;

        return priceB - priceA;
      });
    }

    if (sortBy === "duration") {
      flights.sort(
        (a, b) =>
          Number(a?.duration || 0) -
          Number(b?.duration || 0)
      );
    }

    return flights;
  }, [searchResults, sortBy]);

  return (
    <div className="search-flights-page">
      <header className="search-page-header">
        <div className="search-page-brand">
          <span>✈️</span>
          <strong>SkyBook</strong>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="back-dashboard-button"
        >
          Dashboard
        </button>
      </header>

      <main className="search-flights-content">
        <section className="search-hero">
          <div>
            <p className="search-eyebrow">
              FIND YOUR JOURNEY
            </p>

            <h1>
              Search and book your flight
            </h1>

            <p>
              Find available flights and choose
              the journey that works for you.
            </p>
          </div>

          <FlightSearch
            onSearch={handleSearch}
            isLoading={isSearching}
          />
        </section>

        {hasSearched && (
          <>
            <FlightSummary
              from={searchInfo.from}
              to={searchInfo.to}
              date={searchInfo.date}
              passengers={searchInfo.passengers}
              resultCount={sortedFlights.length}
            />

            {isError && (
              <div className="search-error">
                {message ||
                  "Unable to search flights."}
              </div>
            )}

            {!isError && (
              <div className="results-section">
                <div className="results-header">
                  <div>
                    <h2>
                      Available Flights
                    </h2>

                    <p>
                      Choose a flight to continue
                      your booking.
                    </p>
                  </div>

                  <FlightFilters
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                  />
                </div>

                {isSearching ? (
                  <div className="search-loading">
                    <div className="loading-spinner"></div>
                    <p>
                      Searching available
                      flights...
                    </p>
                  </div>
                ) : sortedFlights.length === 0 ? (
                  <div className="no-flights">
                    <div>✈️</div>

                    <h3>
                      No flights found
                    </h3>

                    <p>
                      Try another route or
                      departure date.
                    </p>
                  </div>
                ) : (
                  <div className="flight-results">
                    {sortedFlights.map(
                      (flight) => (
                        <FlightCard
                          key={flight._id}
                          flight={flight}
                          onSelect={
                            handleSelectFlight
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default SearchFlights;