
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  editUserBookingObject: {}, // Initial state value
};

const editUserBookingObjectSlice = createSlice({
  name: 'editUserBookingObject',
  initialState,
  reducers: {
    setEditUserBookingObject: (state, action) => {
      state.editUserBookingObject = action.payload;
    },
  },
});

export const { setEditUserBookingObject } = editUserBookingObjectSlice.actions;
export default editUserBookingObjectSlice.reducer;
