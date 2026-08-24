// reducers/stepperSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  confirmBookingPayload: [], // Initial state value
};

const confirmBookingPayloadSlice = createSlice({
  name: "confirmBookingPayload",
  initialState,
  reducers: {
    setConfirmBookingPayload: (state, action) => {
      state.confirmBookingPayload = action.payload;
    },
  },
});

export const { setConfirmBookingPayload } = confirmBookingPayloadSlice.actions;
export default confirmBookingPayloadSlice.reducer;
