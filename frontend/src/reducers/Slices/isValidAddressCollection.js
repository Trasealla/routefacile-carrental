import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isValidAddressCollection: false, // Initial state value
};

const isValidAddressCollectionSlice = createSlice({
  name: 'isValidAddressCollection',
  initialState,
  reducers: {
    setIsValidAddressCollection: (state, action) => {
      // action.payload should be a boolean value (true or false)
      state.isValidAddressCollection = action.payload;
    },
  },
});

export const { setIsValidAddressCollection } = isValidAddressCollectionSlice.actions;
export default isValidAddressCollectionSlice.reducer;
