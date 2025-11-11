import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { 
  fetchAllSpots, 
  selectSpots, 
  selectFirestoreLoading, 
  selectFirestoreError 
} from '../store/features/firestore/firestoreSlice';

const TestReduxFirebase = () => {
  const dispatch = useDispatch();
  const spots = useSelector(selectSpots);
  const loading = useSelector(selectFirestoreLoading);
  const error = useSelector(selectFirestoreError);

  useEffect(() => {
    console.log('🔥 Componente TestReduxFirebase montado');
  }, []);

  const handleFetchLotes = () => {
    console.log('🚀 Obteniendo lotes desde Redux...');
    dispatch(fetchAllSpots());
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test Redux + Firebase Nueva Estructura
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleFetchLotes}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Obtener Lotes'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Lotes encontrados: {spots.length}
      </Typography>

      {spots.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Primeros 3 lotes:
          </Typography>
          {spots.slice(0, 3).map((spot) => (
            <Box key={spot.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
              <Typography variant="body1">
                <strong>ID:</strong> {spot.id}
              </Typography>
              <Typography variant="body2">
                <strong>Superficie:</strong> {spot.superficie}m²
              </Typography>
              <Typography variant="body2">
                <strong>Precio:</strong> UF {typeof spot.precio === 'number' ? spot.precio.toLocaleString('es-CL') : spot.precio}
              </Typography>
              <Typography variant="body2">
                <strong>Estado:</strong> {spot.estado}
              </Typography>
              {spot.vistas && (
                <Typography variant="body2">
                  <strong>Vistas disponibles:</strong> {spot.vistas.length}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TestReduxFirebase;