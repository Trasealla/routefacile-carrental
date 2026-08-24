// reducers/stepperSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  addProtection: {
    pai: false,
    cdw: false,
    scdw: false,
    baby_seat: false,
    gps: false,
    driver: false,
    activeKM: null,
    extra_km : null
  },
};

const addProtectionSlice = createSlice({
  name: "addProtection",
  initialState,
  reducers: {
    setAddProtection: (state, action) => {
      state.addProtection = { ...state.addProtection, ...action.payload };
    },
    resetAddProtection: (state) => {
      state.addProtection = initialState.addProtection;
    },
  },
});

export const { setAddProtection, resetAddProtection } =
  addProtectionSlice.actions;
export default addProtectionSlice.reducer;
