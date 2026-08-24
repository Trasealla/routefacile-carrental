// reducers/stepperSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    inputValueDropoff: null, // Initial state value
  };

  const inputValueDropoffSlice = createSlice({
    name: 'inputValueDropoff',
    initialState: initialState,
    reducers: {
        setInputValueDropoff: (state, action) => {
        state.inputValueDropoff = action.payload;
      },
    },
  });

  export const { setInputValueDropoff } = inputValueDropoffSlice.actions;
export default inputValueDropoffSlice.reducer;