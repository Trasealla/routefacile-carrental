
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedMonthlyPlan: null, // Initial state value
  };

  const selectedMonthlyPlanSlice = createSlice({
    name: 'selectedMonthlyPlan',
    initialState: initialState,
    reducers: {
        setSelectedMonthlyPlan: (state, action) => {
        state.selectedMonthlyPlan = action.payload;
      },
    },
  });

  export const { setSelectedMonthlyPlan } = selectedMonthlyPlanSlice.actions;
export default selectedMonthlyPlanSlice.reducer;