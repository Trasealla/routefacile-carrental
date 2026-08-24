// reducers/stepperSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedCollectCity: null, // Initial state value
  };

  const selectedCollectCitySlice = createSlice({
    name: 'selectedCollectCity',
    initialState: initialState,
    reducers: {
        setSelectedCollectCity: (state, action) => {
        state.selectedCollectCity = action.payload;
      },
    },
  });

  export const { setSelectedCollectCity } = selectedCollectCitySlice.actions;
export default selectedCollectCitySlice.reducer;