// reducers/stepperSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  countries: [], // Initial state value
};

const countryCodeSlice = createSlice({
  name: "countries",
  initialState,
  reducers: {
    setCountries: (state, action) => {
      state.countries = action.payload;
    },
  },
});

export const { setCountries } = countryCodeSlice.actions;
export default countryCodeSlice.reducer;
