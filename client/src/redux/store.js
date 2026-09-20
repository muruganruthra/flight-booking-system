import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import flightReducer from "./slices/flightSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    flights: flightReducer,
  },
});

export default store;