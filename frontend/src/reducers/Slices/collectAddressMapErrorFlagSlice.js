import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  collectAddressMapErrorFlag: true, // Initial state value
};

const collectAddressMapErrorFlagSlice = createSlice({
  name: 'collectAddressMapErrorFlag',
  initialState,
  reducers: {
    setCollectAddressMapErrorFlag: (state, action) => {
      // action.payload should be a boolean value (true or false)
      state.collectAddressMapErrorFlag = action.payload;
    },
  },
});

export const { setCollectAddressMapErrorFlag } = collectAddressMapErrorFlagSlice.actions;
export default collectAddressMapErrorFlagSlice.reducer;
