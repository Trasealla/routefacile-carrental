// reducers/stepperSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  carArray: [], // Initial state value
};

const carArraySlice = createSlice({
  name: "carArray",
  initialState,
  reducers: {
    setCarArray: (state, action) => {
      state.carArray = action.payload;
    },
  },
});

export const { setCarArray } = carArraySlice.actions;
export default carArraySlice.reducer;
