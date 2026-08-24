// reducers/stepperSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  carExtraArray: [], // Initial state value
};

const carExtraArraySlice = createSlice({
  name: 'carExtraArray',
  initialState,
  reducers: {
    setCarExtraArray: (state, action) => {
      state.carExtraArray = action.payload;
    },
  },
});

export const { setCarExtraArray } = carExtraArraySlice.actions;
export default carExtraArraySlice.reducer;
