import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { 
  Home as LoteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  AttachMoney as PriceIcon,
  SquareFoot as AreaIcon
} from '@mui/icons-material';

import {
  fetchAllSpots,
  fetchSpotsByEstado,
  selectSpots,
  selectFirestoreLoading,
  selectFirestoreError,
  selectCurrentFilter
} from '../store/features/firestore/firestoreSlice';

const SpotsViewer = () => {
  const dispatch = useDispatch();
  const [selectedVista, setSelectedVista] = useState('all');
  
  // Estados de Redux
  const spots = useSelector(selectSpots);
  const loading = useSelector(selectFirestoreLoading);
  const error = useSelector(selectFirestoreError);
  const currentFilter = useSelector(selectCurrentFilter);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (spots.length === 0) {
      dispatch(fetchAllSpots());
    }
  }, [dispatch, spots.length]);

  // Filtrar spots por vista
  const getFilteredSpots = () => {
    let filteredSpots = [...spots];
    
    if (selectedVista !== 'all') {
      filteredSpots = filteredSpots.filter(spot => spot.vista === parseInt(selectedVista));
    }
    
    return filteredSpots;
  };

  const filteredSpots = getFilteredSpots();

  // Estadísticas
  const getStats = (spotsList = spots) => {
    return {
      total: spotsList.length,
      disponibles: spotsList.filter(s => s.estado === 'disponible').length,
      vendidos: spotsList.filter(s => s.estado === 'vendido').length,
      reservados: spotsList.filter(s => s.estado === 'reservado').length
    };
  };

  const stats = getStats(filteredSpots);

  // Manejadores de eventos
  const handleFilterChange = (estado) => {
    if (estado === 'all') {
      dispatch(fetchAllSpots());
    } else {
      dispatch(fetchSpotsByEstado(estado));
    }
  };

  const handleVistaChange = (event) => {
    setSelectedVista(event.target.value);
  };

  const handleRefresh = () => {
    if (currentFilter === 'all') {
      dispatch(fetchAllSpots());
    } else {
      dispatch(fetchSpotsByEstado(currentFilter));
    }
  };

  // Función para formatear precio
  const formatPrice = (price) => {
    if (!price) return 'No definido';
    
    // Si es un string, devolverlo tal como está (ej: "Consultar precio a...")
    if (typeof price === 'string') {
      return price;
    }
    
    // Si es un número, formatearlo como moneda
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Componente para mostrar un spot individual
  const SpotCard = ({ spot }) => (
    <Card 
      sx={{ 
        height: '100%',
        border: spot.estado === 'disponible' ? '2px solid' : '1px solid',
        borderColor: spot.estado === 'disponible' ? 'success.main' : 'divider'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LoteIcon />
            Lote {spot.html || spot.numero}
          </Typography>
          <Chip 
            label={spot.estado} 
            color={
              spot.estado === 'disponible' ? 'success' : 
              spot.estado === 'vendido' ? 'error' : 
              'warning'
            }
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {spot.descripcion || `Lote ${spot.numero} - Vista ${spot.vista}`}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <strong>Vista:</strong> {spot.vista} | <strong>Estado:</strong> {spot.estadoDetallado || spot.estado}
          </Typography>
          
          {spot.superficie && (
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AreaIcon fontSize="small" />
              {spot.superficie.toLocaleString()} m²
            </Typography>
          )}
          
          {spot.metrosOrilla > 0 && (
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              🌊 {spot.metrosOrilla} mts orilla lago
            </Typography>
          )}
          
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PriceIcon fontSize="small" />
            {formatPrice(spot.precio)}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Posición: ATH {spot.ath}°, ATV {spot.atv}°
          </Typography>
        </Box>

        {/* Botón para interactuar con Krpano */}
        <Button 
          variant="outlined" 
          size="small" 
          fullWidth 
          sx={{ mt: 2 }}
          onClick={() => {
            // Aquí se puede agregar lógica para navegar a este spot en krpano
            if (window.krpano) {
              window.krpano.call(`activatespot(${spot.name})`);
            }
          }}
        >
          Ver en Tour
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando spots...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="subtitle2">Error al cargar los spots</Typography>
        <Typography variant="body2">{error}</Typography>
        <Button onClick={handleRefresh} size="small" sx={{ mt: 1 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado y controles */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LoteIcon />
          Spots del Proyecto
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {/* Filtros y estadísticas */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Filtros */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FilterIcon />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={currentFilter}
                  label="Estado"
                  onChange={(e) => handleFilterChange(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="disponible">Disponibles</MenuItem>
                  <MenuItem value="vendido">Vendidos</MenuItem>
                  <MenuItem value="reservado">Reservados</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Vista</InputLabel>
                <Select
                  value={selectedVista}
                  label="Vista"
                  onChange={handleVistaChange}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="1">Vista 1</MenuItem>
                  <MenuItem value="2">Vista 2</MenuItem>
                  <MenuItem value="3">Vista 3</MenuItem>
                  <MenuItem value="4">Vista 4</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* Estadísticas */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Chip label={`Total: ${stats.total}`} variant="outlined" size="small" />
              <Chip label={`Disponibles: ${stats.disponibles}`} color="success" variant="outlined" size="small" />
              <Chip label={`Vendidos: ${stats.vendidos}`} color="error" variant="outlined" size="small" />
              {stats.reservados > 0 && (
                <Chip label={`Reservados: ${stats.reservados}`} color="warning" variant="outlined" size="small" />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Grid de spots */}
      {filteredSpots.length === 0 ? (
        <Alert severity="info">
          No se encontraron spots con los filtros aplicados.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredSpots.map((spot) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={spot.id}>
              <SpotCard spot={spot} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SpotsViewer;