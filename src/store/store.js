import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';
import tourReducer from './features/tour/tourSlice';
import firestoreReducer from './features/firestore/firestoreSlice';
import fichaReducer from './features/ficha/fichaSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    tour: tourReducer,
    firestore: firestoreReducer,
    ficha: fichaReducer,
  },
});

export default store;