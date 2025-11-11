import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';
import tourReducer from './features/tour/tourSlice';
import firestoreReducer from './features/firestore/firestoreSlice';
import fichaReducer from './features/ficha/fichaSlice';
import authReducer from './features/auth/authSlice';
import loadingReducer from './features/loading/loadingSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    tour: tourReducer,
    firestore: firestoreReducer,
    ficha: fichaReducer,
    auth: authReducer,
    loading: loadingReducer,
  },
});

export default store;