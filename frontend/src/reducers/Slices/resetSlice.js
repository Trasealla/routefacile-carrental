// reducers/resetSlice.js
import { createSlice } from "@reduxjs/toolkit";

const resetSlice = createSlice({
  name: "reset",
  initialState: {},
  reducers: {
    resetState: (state) => {
      // This will be handled in the root reducer
    },
  },
});

export const { resetState } = resetSlice.actions;
export default resetSlice.reducer;
