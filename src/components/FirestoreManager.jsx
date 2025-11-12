import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';

import {
  fetchAllSpots,
  fetchSpotsByEstado,
  fetchProjectConfig,
  initializeProject,
  setCurrentFilter,
  clearError,
  selectSpots,
  selectProjectConfig,
  selectFirestoreLoading,
  selectFirestoreError,
  selectCurrentFilter,
  selectIsInitialized,
  selectAvailableSpots,
  selectSoldSpots
} from '../store/features/firestore/firestoreSlice';

const FirestoreManager = () => {
  const dispatch = useDispatch();
  const spots = useSelector(selectSpots);
  const projectConfig = useSelector(selectProjectConfig);
  const loading = useSelector(selectFirestoreLoading);
  const error = useSelector(selectFirestoreError);
  const currentFilter = useSelector(selectCurrentFilter);
  const initialized = useSelector(selectIsInitialized);
  const availableSpots = useSelector(selectAvailableSpots);
  const soldSpots = useSelector(selectSoldSpots);

  const [showInitialize, setShowInitialize] = useState(false);

  useEffect(() => {
    // Cargar configuración del proyecto al montar
    dispatch(fetchProjectConfig());
    
    // Si hay spots, cargarlos
    if (initialized) {
      dispatch(fetchAllSpots());
    }
  }, [dispatch, initialized]);

  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    dispatch(setCurrentFilter(newFilter));
    
    if (newFilter === 'all') {
      dispatch(fetchAllSpots());
    } else {
      dispatch(fetchSpotsByEstado(newFilter));
    }
  };

  const handleRefresh = () => {
    dispatch(clearError());
    if (currentFilter === 'all') {
      dispatch(fetchAllSpots());
    } else {
      dispatch(fetchSpotsByEstado(currentFilter));
    }
    dispatch(fetchProjectConfig());
  };

  const handleInitialize = async () => {
    try {
      await dispatch(initializeProject()).unwrap();
      // Después de inicializar, cargar los datos
      dispatch(fetchAllSpots());
      setShowInitialize(false);
    } catch {
      // Error silenciado en producción
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'disponible': return 'success';
      case 'vendido': return 'error';
      case 'reservado': return 'warning';
      default: return 'default';
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'No especificado';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  if (loading && !spots.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando datos de Firestore...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Gestión Firestore - {projectConfig?.title || 'Reserva Martin Pescador'}
        </Typography>
        <Box>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          {!initialized && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowInitialize(true)}
              sx={{ ml: 1 }}
            >
              Inicializar Proyecto
            </Button>
          )}
        </Box>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                Disponibles
              </Typography>
              <Typography variant="h4">
                {availableSpots.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                Vendidos
              </Typography>
              <Typography variant="h4">
                {soldSpots.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Total Lotes
              </Typography>
              <Typography variant="h4">
                {spots.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por estado</InputLabel>
          <Select
            value={currentFilter}
            onChange={handleFilterChange}
            label="Filtrar por estado"
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="disponible">Disponibles</MenuItem>
            <MenuItem value="vendido">Vendidos</MenuItem>
            <MenuItem value="reservado">Reservados</MenuItem>
          </Select>
        </FormControl>
        
        {loading && <CircularProgress size={20} />}
      </Box>

      {/* Errores */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Inicialización */}
      {showInitialize && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Box>
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleInitialize}
                disabled={loading}
              >
                Confirmar
              </Button>
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setShowInitialize(false)}
              >
                Cancelar
              </Button>
            </Box>
          }
        >
          ¿Deseas inicializar el proyecto con datos de ejemplo? Esto creará la estructura en Firestore.
        </Alert>
      )}

      {/* Lista de spots */}
      <Grid container spacing={2}>
        {spots.map((spot) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={spot.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">
                    Lote {spot.numero}
                  </Typography>
                  <Chip 
                    label={spot.estado} 
                    color={getEstadoColor(spot.estado)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {spot.descripcion}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Vista:</strong> {spot.vista}
                </Typography>
                
                {spot.superficie && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Superficie:</strong> {spot.superficie} m²
                  </Typography>
                )}
                
                {spot.precio && (
                  <Typography variant="body2" color="primary.main" sx={{ mb: 1 }}>
                    <strong>Precio:</strong> {formatPrice(spot.precio)}
                  </Typography>
                )}
                
                <Typography variant="caption" color="text.secondary">
                  Posición: ath={spot.ath}, atv={spot.atv}
                </Typography>
                
                <Box mt={2}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => {
                      // Aquí puedes integrar con krpano para ir al spot
                      if (window.krpano) {
                        window.krpano.call(`loadscene(scene_e${spot.vista}, null, MERGE)`);
                      }
                    }}
                  >
                    Ver en Tour
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {spots.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No hay datos disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Inicializa el proyecto para crear datos de ejemplo
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setShowInitialize(true)}
            startIcon={<AddIcon />}
          >
            Inicializar Proyecto
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FirestoreManager;