// reducers/stepperSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    inputValue: null, // Initial state value
  };

  const inputValueSlice = createSlice({
    name: 'inputValue',
    initialState: initialState,
    reducers: {
        setInputValue: (state, action) => {
        state.inputValue = action.payload;
      },
    },
  });

  export const { setInputValue } = inputValueSlice.actions;
export default inputValueSlice.reducer;