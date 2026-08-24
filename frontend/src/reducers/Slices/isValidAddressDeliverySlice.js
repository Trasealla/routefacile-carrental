import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isValidAddressDelivery: false, // Initial state value
};

const isValidAddressDeliverySlice = createSlice({
  name: 'isValidAddressDelivery',
  initialState,
  reducers: {
    setIsValidAddressDelivery: (state, action) => {
      // action.payload should be a boolean value (true or false)
      state.isValidAddressDelivery = action.payload;
    },
  },
});

export const { setIsValidAddressDelivery } = isValidAddressDeliverySlice.actions;
export default isValidAddressDeliverySlice.reducer;
