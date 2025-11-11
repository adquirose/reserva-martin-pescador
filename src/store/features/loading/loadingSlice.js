import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAppLoading: true,
  isKrpanoLoading: false,
  loadingMessage: 'Iniciando aplicación...'
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setAppLoading: (state, action) => {
      state.isAppLoading = action.payload;
    },
    setKrpanoLoading: (state, action) => {
      state.isKrpanoLoading = action.payload;
    },
    setLoadingMessage: (state, action) => {
      state.loadingMessage = action.payload;
    },
    hideAppLoading: (state) => {
      state.isAppLoading = false;
    },
    showKrpanoLoading: (state, action) => {
      state.isKrpanoLoading = true;
      state.loadingMessage = action.payload || 'Cargando tour virtual...';
    },
    hideKrpanoLoading: (state) => {
      state.isKrpanoLoading = false;
    }
  },
});

// Selectores
export const selectIsAppLoading = (state) => state.loading.isAppLoading;
export const selectIsKrpanoLoading = (state) => state.loading.isKrpanoLoading;
export const selectLoadingMessage = (state) => state.loading.loadingMessage;
export const selectIsAnyLoading = (state) => state.loading.isAppLoading || state.loading.isKrpanoLoading;

// Acciones
export const { 
  setAppLoading, 
  setKrpanoLoading, 
  setLoadingMessage, 
  hideAppLoading, 
  showKrpanoLoading, 
  hideKrpanoLoading 
} = loadingSlice.actions;

export default loadingSlice.reducer;