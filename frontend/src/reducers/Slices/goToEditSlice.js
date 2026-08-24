import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  got_to_edit: false, // Initial state value
};

const goToEditSlice = createSlice({
  name: 'got_to_edit',
  initialState,
  reducers: {
    toggle_got_to_edit: (state) => {
      state.got_to_edit = /* !state.got_to_edit */ true;
    },
    reset_got_to_edit: (state) => {
      state.got_to_edit = false;
    },
  },
});

export const { toggle_got_to_edit, reset_got_to_edit } = goToEditSlice.actions;
export default goToEditSlice.reducer;
