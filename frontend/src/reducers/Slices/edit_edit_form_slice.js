import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  edit_edit_form: false, // Initial state value
};

const goToEditSlice = createSlice({
  name: 'edit_edit_form',
  initialState,
  reducers: {
    toggle_edit_edit_form: (state) => {
      state.edit_edit_form = !state.edit_edit_form;
    },
    reset_edit_edit_form: (state) => {
      state.edit_edit_form = false;
    },
  },
});

export const { toggle_edit_edit_form, reset_edit_edit_form } = goToEditSlice.actions;
export default goToEditSlice.reducer;
