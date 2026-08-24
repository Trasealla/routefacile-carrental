// reducers/stepperSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedDeliveryCity: null, // Initial state value
  };

  const selectedDeliveryCitySlice = createSlice({
    name: 'selectedDeliveryCity',
    initialState: initialState,
    reducers: {
        setSelectedDeliveryCity: (state, action) => {
        state.selectedDeliveryCity = action.payload;
      },
    },
  });

  export const { setSelectedDeliveryCity } = selectedDeliveryCitySlice.actions;
export default selectedDeliveryCitySlice.reducer;