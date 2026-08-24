import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  inputValueDropoffChangeFlag: false, // Initial state value
};

const inputValueDropoffChangeFlagSlice = createSlice({
  name: 'inputValueDropoffChangeFlag',
  initialState,
  reducers: {
    setInputValueDropoffChangeFlag: (state, action) => {
      // action.payload should be a boolean value (true or false)
      state.inputValueDropoffChangeFlag = action.payload;
    },
  },
});

export const { setInputValueDropoffChangeFlag } = inputValueDropoffChangeFlagSlice.actions;
export default inputValueDropoffChangeFlagSlice.reducer;
