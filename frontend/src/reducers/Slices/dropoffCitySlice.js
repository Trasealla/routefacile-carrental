// reducers/stepperSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    dropOffCity: null, // Initial state value
  };

  const dropOffCitySlice = createSlice({
    name: 'dropOffCity',
    initialState: initialState,
    reducers: {
        setDropOffCity: (state, action) => {
        state.dropOffCity = action.payload;
      },
    },
  });

  export const { setDropOffCity } = dropOffCitySlice.actions;
export default dropOffCitySlice.reducer;