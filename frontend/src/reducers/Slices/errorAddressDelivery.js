import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  errorAddressDelivery: false, // Initial state value
};

const errorAddressDeliverySlice = createSlice({
  name: 'errorAddressDelivery',
  initialState,
  reducers: {
    setErrorAddressDelivery: (state, action) => {
      // action.payload should be a boolean value (true or false)
      state.errorAddressDelivery = action.payload;
    },
  },
});

export const { setErrorAddressDelivery } = errorAddressDeliverySlice.actions;
export default errorAddressDeliverySlice.reducer;
