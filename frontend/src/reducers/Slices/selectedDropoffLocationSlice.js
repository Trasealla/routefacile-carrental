// reducers/stepperSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedDropoffLocation: null, // Initial state value
  };

  const selectedDropoffLocationSlice = createSlice({
    name: 'selectedDropoffLocation',
    initialState: initialState,
    reducers: {
        setSelectedDropoffLocation: (state, action) => {
        state.selectedDropoffLocation = action.payload;
      },
    },
  });

  export const { setSelectedDropoffLocation } = selectedDropoffLocationSlice.actions;
export default selectedDropoffLocationSlice.reducer;