import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Alert, 
  LinearProgress,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { 
  CloudUpload as InitIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { 
  initializeProject, 
  fetchAllSpots, 
  fetchProjectConfig,
  selectIsInitialized,
  selectFirestoreLoading,
  selectFirestoreError,
  selectSpots,
  selectProjectConfig
} from '../store/features/firestore/firestoreSlice';

const FirebaseInitializer = () => {
  const dispatch = useDispatch();
  const [initResult, setInitResult] = useState(null);
  
  // Estados de Redux
  const isInitialized = useSelector(selectIsInitialized);
  const loading = useSelector(selectFirestoreLoading);
  const error = useSelector(selectFirestoreError);
  const spots = useSelector(selectSpots);
  const projectConfig = useSelector(selectProjectConfig);

  const handleInitialize = async () => {
    try {
      setInitResult(null);
      const result = await dispatch(initializeProject()).unwrap();
      setInitResult(result);
      
      // Si la inicialización fue exitosa, cargar los datos
      if (result.success) {
        dispatch(fetchAllSpots());
        dispatch(fetchProjectConfig());
      }
    } catch (err) {
      setInitResult({ error: err });
    }
  };

  const handleRefreshData = () => {
    dispatch(fetchAllSpots());
    dispatch(fetchProjectConfig());
  };

  const getSpotsStats = () => {
    if (!spots.length) return null;
    
    const disponibles = spots.filter(s => s.estado === 'disponible').length;
    const vendidos = spots.filter(s => s.estado === 'vendido').length;
    const reservados = spots.filter(s => s.estado === 'reservado').length;
    
    return { total: spots.length, disponibles, vendidos, reservados };
  };

  const stats = getSpotsStats();

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InitIcon />
            Inicializar Proyecto en Firestore
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Esta herramienta poblará tu base de datos Firestore con los datos del proyecto Reserva Martin Pescador.
            Es seguro ejecutarla múltiples veces - no sobrescribirá datos existentes.
          </Typography>

          {/* Progreso de carga */}
          {loading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Procesando...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {/* Resultado de inicialización */}
          {initResult && !loading && (
            <Box sx={{ mb: 3 }}>
              {initResult.alreadyExists ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Proyecto ya inicializado</Typography>
                  <Typography variant="body2">
                    {initResult.message}
                  </Typography>
                </Alert>
              ) : initResult.success ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">¡Inicialización exitosa!</Typography>
                  <Typography variant="body2">
                    Se crearon {initResult.totalSpots} spots: {initResult.available} disponibles, {initResult.sold} vendidos
                  </Typography>
                </Alert>
              ) : initResult.error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Error durante inicialización</Typography>
                  <Typography variant="body2">
                    {initResult.error}
                  </Typography>
                </Alert>
              ) : null}
            </Box>
          )}

          {/* Error general */}
          {error && !loading && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Error</Typography>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          {/* Información del proyecto actual */}
          {projectConfig && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SuccessIcon color="success" />
                Proyecto Conectado
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="subtitle1">{projectConfig.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {projectConfig.description}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" display="block">
                      Última actualización: {projectConfig.fechaActualizacion?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Estadísticas de spots */}
              {stats && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Estadísticas de Lotes
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Total: ${stats.total}`} 
                      variant="outlined" 
                      size="small"
                    />
                    <Chip 
                      label={`Disponibles: ${stats.disponibles}`} 
                      color="success" 
                      variant="outlined" 
                      size="small"
                    />
                    <Chip 
                      label={`Vendidos: ${stats.vendidos}`} 
                      color="error" 
                      variant="outlined" 
                      size="small"
                    />
                    {stats.reservados > 0 && (
                      <Chip 
                        label={`Reservados: ${stats.reservados}`} 
                        color="warning" 
                        variant="outlined" 
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Botones de acción */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<InitIcon />}
              onClick={handleInitialize}
              disabled={loading}
              color="primary"
            >
              {isInitialized ? 'Reinicializar Proyecto' : 'Inicializar Proyecto'}
            </Button>

            {(spots.length > 0 || projectConfig) && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefreshData}
                disabled={loading}
              >
                Actualizar Datos
              </Button>
            )}
          </Box>

          {/* Información adicional */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" fontSize="small" />
              Información importante
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Los datos se crearán en la colección: <code>{`reserva-martin-pescador`}</code><br/>
              • No se sobrescribirán datos existentes en otras colecciones<br/>
              • Los precios y superficies se generan aleatoriamente para lotes disponibles<br/>
              • Puedes ejecutar esta inicialización múltiples veces sin riesgo
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FirebaseInitializer;