import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllLotes as getAllSpots,
  getLoteById as getSpotById,
  createLote as createSpot,
  updateLote as updateSpot,
  deleteLote as deleteSpot,
  initializeProjectDataNew as initializeProjectData
} from '../../../services/firestoreServiceNew';

// Función temporal para getProjectConfig (mantener compatibilidad)
const getProjectConfig = async () => {
  return {
    title: 'Reserva Martin Pescador',
    description: 'Tour virtual del proyecto inmobiliario',
    settings: {
      enableMaps: false,
      enableGyro: true,
      enableThumbs: true
    }
  };
};

// Función temporal para deleteSpot está ahora mapeada correctamente a deleteLote

// ===== THUNKS ASÍNCRONOS =====

// Obtener todos los spots
export const fetchAllSpots = createAsyncThunk(
  'firestore/fetchAllSpots',
  async (_, { rejectWithValue }) => {
    try {
      const spots = await getAllSpots();
      return spots;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener spots por estado
export const fetchSpotsByEstado = createAsyncThunk(
  'firestore/fetchSpotsByEstado',
  async (estado, { rejectWithValue }) => {
    try {
      // Obtener todos los lotes y filtrar por estado
      const allSpots = await getAllSpots();
      const spots = allSpots.filter(spot => spot.estado === estado);
      return { estado, spots };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener un spot específico
export const fetchSpotById = createAsyncThunk(
  'firestore/fetchSpotById',
  async (spotId, { rejectWithValue }) => {
    try {
      const spot = await getSpotById(spotId);
      return spot;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Crear nuevo spot
export const createNewSpot = createAsyncThunk(
  'firestore/createSpot',
  async (spotData, { rejectWithValue }) => {
    try {
      const spotId = await createSpot(spotData);
      return { id: spotId, ...spotData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Actualizar spot
export const updateExistingSpot = createAsyncThunk(
  'firestore/updateSpot',
  async ({ spotId, spotData }, { rejectWithValue }) => {
    try {
      await updateSpot(spotId, spotData);
      return { id: spotId, ...spotData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Eliminar spot
export const deleteExistingSpot = createAsyncThunk(
  'firestore/deleteSpot',
  async (spotId, { rejectWithValue }) => {
    try {
      await deleteSpot(spotId);
      return spotId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener configuración del proyecto
export const fetchProjectConfig = createAsyncThunk(
  'firestore/fetchProjectConfig',
  async (_, { rejectWithValue }) => {
    try {
      const config = await getProjectConfig();
      return config;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Inicializar datos del proyecto
export const initializeProject = createAsyncThunk(
  'firestore/initializeProject',
  async (_, { rejectWithValue }) => {
    try {
      await initializeProjectData();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ===== ESTADO INICIAL =====
const initialState = {
  // Datos
  spots: [],
  selectedSpot: null,
  projectConfig: null,
  
  // Estados de carga
  loading: false,
  spotLoading: false,
  configLoading: false,
  
  // Errores
  error: null,
  spotError: null,
  configError: null,
  
  // Filtros y estados
  currentFilter: 'all', // 'all', 'disponible', 'vendido', 'reservado'
  initialized: false
};

// ===== SLICE =====
export const firestoreSlice = createSlice({
  name: 'firestore',
  initialState,
  reducers: {
    // Acciones síncronas
    clearError: (state) => {
      state.error = null;
      state.spotError = null;
      state.configError = null;
    },
    setCurrentFilter: (state, action) => {
      state.currentFilter = action.payload;
    },
    clearSelectedSpot: (state) => {
      state.selectedSpot = null;
    },
    resetFirestoreState: () => initialState
  },
  extraReducers: (builder) => {
    // Fetch all spots
    builder
      .addCase(fetchAllSpots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSpots.fulfilled, (state, action) => {
        state.loading = false;
        state.spots = action.payload;
        state.error = null;
      })
      .addCase(fetchAllSpots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Fetch spots by estado
      .addCase(fetchSpotsByEstado.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpotsByEstado.fulfilled, (state, action) => {
        state.loading = false;
        state.spots = action.payload.spots;
        state.currentFilter = action.payload.estado;
        state.error = null;
      })
      .addCase(fetchSpotsByEstado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Fetch spot by ID
      .addCase(fetchSpotById.pending, (state) => {
        state.spotLoading = true;
        state.spotError = null;
      })
      .addCase(fetchSpotById.fulfilled, (state, action) => {
        state.spotLoading = false;
        state.selectedSpot = action.payload;
        state.spotError = null;
      })
      .addCase(fetchSpotById.rejected, (state, action) => {
        state.spotLoading = false;
        state.spotError = action.payload;
      })

    // Create spot
      .addCase(createNewSpot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewSpot.fulfilled, (state, action) => {
        state.loading = false;
        state.spots.push(action.payload);
        state.error = null;
      })
      .addCase(createNewSpot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Update spot
      .addCase(updateExistingSpot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingSpot.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.spots.findIndex(spot => spot.id === action.payload.id);
        if (index !== -1) {
          state.spots[index] = action.payload;
        }
        if (state.selectedSpot && state.selectedSpot.id === action.payload.id) {
          state.selectedSpot = action.payload;
        }
        state.error = null;
      })
      .addCase(updateExistingSpot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Delete spot
      .addCase(deleteExistingSpot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingSpot.fulfilled, (state, action) => {
        state.loading = false;
        state.spots = state.spots.filter(spot => spot.id !== action.payload);
        if (state.selectedSpot && state.selectedSpot.id === action.payload) {
          state.selectedSpot = null;
        }
        state.error = null;
      })
      .addCase(deleteExistingSpot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Project config
      .addCase(fetchProjectConfig.pending, (state) => {
        state.configLoading = true;
        state.configError = null;
      })
      .addCase(fetchProjectConfig.fulfilled, (state, action) => {
        state.configLoading = false;
        state.projectConfig = action.payload;
        state.configError = null;
      })
      .addCase(fetchProjectConfig.rejected, (state, action) => {
        state.configLoading = false;
        state.configError = action.payload;
      })

    // Initialize project
      .addCase(initializeProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeProject.fulfilled, (state) => {
        state.loading = false;
        state.initialized = true;
        state.error = null;
      })
      .addCase(initializeProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// ===== ACCIONES =====
export const {
  clearError,
  setCurrentFilter,
  clearSelectedSpot,
  resetFirestoreState
} = firestoreSlice.actions;

// ===== SELECTORES =====
export const selectSpots = (state) => state.firestore.spots;
export const selectSelectedSpot = (state) => state.firestore.selectedSpot;
export const selectProjectConfig = (state) => state.firestore.projectConfig;
export const selectFirestoreLoading = (state) => state.firestore.loading;
export const selectSpotLoading = (state) => state.firestore.spotLoading;
export const selectConfigLoading = (state) => state.firestore.configLoading;
export const selectFirestoreError = (state) => state.firestore.error;
export const selectSpotError = (state) => state.firestore.spotError;
export const selectConfigError = (state) => state.firestore.configError;
export const selectCurrentFilter = (state) => state.firestore.currentFilter;
export const selectIsInitialized = (state) => state.firestore.initialized;

// Selectores computados
export const selectAvailableSpots = (state) => 
  state.firestore.spots.filter(spot => spot.estado === 'disponible');

export const selectSoldSpots = (state) => 
  state.firestore.spots.filter(spot => spot.estado === 'vendido');

export const selectReservedSpots = (state) => 
  state.firestore.spots.filter(spot => spot.estado === 'reservado');

export const selectSpotsByVista = (vista) => (state) =>
  state.firestore.spots.filter(spot => spot.vista === vista);

export default firestoreSlice.reducer;