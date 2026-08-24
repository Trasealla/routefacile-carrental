// reducers/stepperSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    pickupCity: null, // Initial state value
  };

  const pickupCitySlice = createSlice({
    name: 'pickupCity',
    initialState: initialState,
    reducers: {
        setPickupCity: (state, action) => {
        state.pickupCity = action.payload;
      },
    },
  });

  export const { setPickupCity } = pickupCitySlice.actions;
export default pickupCitySlice.reducer;