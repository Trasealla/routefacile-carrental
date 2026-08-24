import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  errorAddressCollection: false, // Initial state value
};

const errorAddressCollectionSlice = createSlice({
  name: 'errorAddressCollection',
  initialState,
  reducers: {
    setErrorAddressCollection: (state, action) => {
      // action.payload should be a boolean value (true or false)
      state.errorAddressCollection = action.payload;
    },
  },
});

export const { setErrorAddressCollection } = errorAddressCollectionSlice.actions;
export default errorAddressCollectionSlice.reducer;
