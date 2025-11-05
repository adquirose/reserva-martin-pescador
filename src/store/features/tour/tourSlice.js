import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showTour: true,
};

export const tourSlice = createSlice({
  name: 'tour',
  initialState,
  reducers: {
    showTour: (state) => {
      state.showTour = true;
    },
    hideTour: (state) => {
      state.showTour = false;
    },
    toggleTour: (state) => {
      state.showTour = !state.showTour;
    },
  },
});

export const { showTour, hideTour, toggleTour } = tourSlice.actions;

export default tourSlice.reducer;