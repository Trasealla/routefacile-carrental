// reducers/stepperSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  savedCar: null, // Initial state value
};

const savedCarSlice = createSlice({
  name: "savedCar",
  initialState,
  reducers: {
    setSavedCar: (state, action) => {
      state.savedCar = action.payload;
    },
  },
});

export const { setSavedCar } = savedCarSlice.actions;
export default savedCarSlice.reducer;
