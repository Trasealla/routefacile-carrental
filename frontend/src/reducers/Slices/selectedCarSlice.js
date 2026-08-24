
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedCar: {}, // Initial state value
};

const selectedCarSlice = createSlice({
  name: 'selectedCar',
  initialState,
  reducers: {
    setSelectedCar: (state, action) => {
      state.selectedCar = action.payload;
    },
  },
});

export const { setSelectedCar } = selectedCarSlice.actions;
export default selectedCarSlice.reducer;
