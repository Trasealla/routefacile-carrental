import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoginFromRegister: false, // Initial state value
};

const isLoginFromRegisterSlice = createSlice({
  name: 'isLoginFromRegister',
  initialState,
  reducers: {
    setIsLoginFromRegister: (state, action) => {
      // action.payload should be a boolean value (true or false)
      state.isLoginFromRegister = action.payload;
    },
  },
});

export const { setIsLoginFromRegister } = isLoginFromRegisterSlice.actions;
export default isLoginFromRegisterSlice.reducer;
