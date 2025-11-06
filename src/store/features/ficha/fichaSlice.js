import { createSlice } from '@reduxjs/toolkit';

const fichaSlice = createSlice({
  name: 'ficha',
  initialState: {
    fichaAbierta: false,
    loteSeleccionado: null,
    loading: false,
    error: null
  },
  reducers: {
    mostrarFicha: (state, action) => {
      state.fichaAbierta = true;
      state.loteSeleccionado = action.payload;
      state.error = null;
    },
    cerrarFicha: (state) => {
      state.fichaAbierta = false;
      state.loteSeleccionado = null;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { 
  mostrarFicha, 
  cerrarFicha, 
  setLoading, 
  setError, 
  clearError 
} = fichaSlice.actions;

// Selectors
export const selectFichaAbierta = (state) => state.ficha.fichaAbierta;
export const selectLoteSeleccionado = (state) => state.ficha.loteSeleccionado;
export const selectFichaLoading = (state) => state.ficha.loading;
export const selectFichaError = (state) => state.ficha.error;

export default fichaSlice.reducer;