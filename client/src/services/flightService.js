import api from "./api";

// Get all flights
const getFlights = async (params = {}) => {
  const response = await api.get("/flights", {
    params,
  });

  return response.data;
};

// Search flights
const searchFlights = async (searchData = {}) => {
  const response = await api.get("/flights/search", {
    params: searchData,
  });

  return response.data;
};

// Get seat availability
const getFlightSeats = async (flightId) => {
  const response = await api.get(
    `/bookings/seats/${flightId}`
  );

  return response.data;
};

// Create flight - Admin
const createFlight = async (flightData) => {
  const response = await api.post(
    "/flights",
    flightData
  );

  return response.data;
};

// Update flight - Admin
const updateFlight = async (
  flightId,
  flightData
) => {
  const response = await api.put(
    `/flights/${flightId}`,
    flightData
  );

  return response.data;
};

// Delete flight - Admin
const deleteFlight = async (flightId) => {
  const response = await api.delete(
    `/flights/${flightId}`
  );

  return response.data;
};

const flightService = {
  getFlights,
  searchFlights,
  getFlightSeats,
  createFlight,
  updateFlight,
  deleteFlight,
};

export default flightService;