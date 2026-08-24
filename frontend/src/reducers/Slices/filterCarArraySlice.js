// reducers/stepperSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filterCarArray: [], // Initial state value
};

const filterCarArraySlice = createSlice({
  name: 'filterCarArray',
  initialState,
  reducers: {
    setFilterCarArray: (state, action) => {
      state.filterCarArray = action.payload;
    },
  },
});

export const { setFilterCarArray } = filterCarArraySlice.actions;
export default filterCarArraySlice.reducer;
