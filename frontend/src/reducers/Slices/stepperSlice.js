// reducers/stepperSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stepperPage: 2, // Initial state value
};

const stepperSlice = createSlice({
  name: 'stepper',
  initialState,
  reducers: {
    setStepperPage: (state, action) => {
      state.stepperPage = action.payload;
    },
  },
});

export const { setStepperPage } = stepperSlice.actions;
export default stepperSlice.reducer;
