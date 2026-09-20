import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import flightService from "../../services/flightService";

// Get all flights
export const getFlights = createAsyncThunk(
  "flights/getFlights",
  async (params = {}, thunkAPI) => {
    try {
      return await flightService.getFlights(params);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch flights";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Search flights
export const searchFlights = createAsyncThunk(
  "flights/searchFlights",
  async (searchData = {}, thunkAPI) => {
    try {
      return await flightService.searchFlights(searchData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Flight search failed";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get seat availability
export const getFlightSeats = createAsyncThunk(
  "flights/getFlightSeats",
  async (flightId, thunkAPI) => {
    try {
      return await flightService.getFlightSeats(flightId);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch seat availability";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create flight - Admin
export const createFlight = createAsyncThunk(
  "flights/createFlight",
  async (flightData, thunkAPI) => {
    try {
      return await flightService.createFlight(flightData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create flight";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update flight - Admin
export const updateFlight = createAsyncThunk(
  "flights/updateFlight",
  async ({ flightId, flightData }, thunkAPI) => {
    try {
      return await flightService.updateFlight(
        flightId,
        flightData
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update flight";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete flight - Admin
export const deleteFlight = createAsyncThunk(
  "flights/deleteFlight",
  async (flightId, thunkAPI) => {
    try {
      return await flightService.deleteFlight(flightId);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete flight";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  flights: [],
  searchResults: [],
  seats: [],
  selectedFlight: null,

  isLoading: false,
  isSearching: false,
  isLoadingSeats: false,

  isSuccess: false,
  isError: false,
  message: "",
};

const flightSlice = createSlice({
  name: "flights",

  initialState,

  reducers: {
    setSelectedFlight: (state, action) => {
      state.selectedFlight = action.payload;
    },

    clearSelectedFlight: (state) => {
      state.selectedFlight = null;
    },

    clearFlightResults: (state) => {
      state.flights = [];
      state.searchResults = [];
    },

    clearFlightMessage: (state) => {
      state.message = "";
      state.isError = false;
      state.isSuccess = false;
    },

    clearSeats: (state) => {
      state.seats = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // GET FLIGHTS
      .addCase(getFlights.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })

      .addCase(getFlights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;

        state.flights =
          action.payload?.flights || [];

        state.message =
          action.payload?.message || "";
      })

      .addCase(getFlights.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;

        state.message =
          action.payload || "Failed to fetch flights";
      })

      // SEARCH FLIGHTS
      .addCase(searchFlights.pending, (state) => {
        state.isSearching = true;
        state.isError = false;
        state.message = "";
      })

      .addCase(searchFlights.fulfilled, (state, action) => {
        state.isSearching = false;
        state.isSuccess = true;
        state.isError = false;

        state.searchResults =
          action.payload?.flights ||
          action.payload?.results ||
          [];

        state.message =
          action.payload?.message || "";
      })

      .addCase(searchFlights.rejected, (state, action) => {
        state.isSearching = false;
        state.isSuccess = false;
        state.isError = true;

        state.message =
          action.payload || "Flight search failed";
      })

      // SEAT AVAILABILITY
      .addCase(getFlightSeats.pending, (state) => {
        state.isLoadingSeats = true;
        state.isError = false;
        state.message = "";
      })

      .addCase(getFlightSeats.fulfilled, (state, action) => {
        state.isLoadingSeats = false;
        state.isSuccess = true;
        state.isError = false;

        state.seats =
          action.payload?.seats || [];

        state.message =
          action.payload?.message || "";
      })

      .addCase(getFlightSeats.rejected, (state, action) => {
        state.isLoadingSeats = false;
        state.isSuccess = false;
        state.isError = true;

        state.message =
          action.payload ||
          "Failed to fetch seat availability";
      })

      // CREATE FLIGHT
      .addCase(createFlight.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })

      .addCase(createFlight.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;

        const createdFlight =
          action.payload?.flight;

        if (createdFlight) {
          state.flights.push(createdFlight);
        }

        state.message =
          action.payload?.message ||
          "Flight created successfully";
      })

      .addCase(createFlight.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;

        state.message =
          action.payload ||
          "Failed to create flight";
      })

      // UPDATE FLIGHT
      .addCase(updateFlight.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })

      .addCase(updateFlight.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;

        const updatedFlight =
          action.payload?.flight;

        if (updatedFlight) {
          const index =
            state.flights.findIndex(
              (flight) =>
                flight._id === updatedFlight._id
            );

          if (index !== -1) {
            state.flights[index] =
              updatedFlight;
          }
        }

        state.message =
          action.payload?.message ||
          "Flight updated successfully";
      })

      .addCase(updateFlight.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;

        state.message =
          action.payload ||
          "Failed to update flight";
      })

      // DELETE FLIGHT
      .addCase(deleteFlight.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })

      .addCase(deleteFlight.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;

        const deletedFlightId =
          action.meta.arg;

        state.flights =
          state.flights.filter(
            (flight) =>
              flight._id !== deletedFlightId
          );

        state.message =
          action.payload?.message ||
          "Flight deleted successfully";
      })

      .addCase(deleteFlight.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;

        state.message =
          action.payload ||
          "Failed to delete flight";
      });
  },
});

export const {
  setSelectedFlight,
  clearSelectedFlight,
  clearFlightResults,
  clearFlightMessage,
  clearSeats,
} = flightSlice.actions;

export default flightSlice.reducer;