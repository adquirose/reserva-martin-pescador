import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  Card, 
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  PlayArrow as LoadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { cargarTodosLosSpots } from '../services/krpanoSpotsService';

const TestKrpanoSpots = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const scenes = [
    { id: 'scene_e1', name: 'Vista Etapa 1' },
    { id: 'scene_e2', name: 'Vista Etapa 2' },
    { id: 'scene_e3', name: 'Vista Etapa 3' },
    { id: 'scene_e4', name: 'Vista Etapa 4' }
  ];

  const testLoadSpots = async (sceneId) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`🎯 Probando carga de spots para: ${sceneId}`);
      
      // Simular carga de spots (ahora se hace directamente en Krpano)
      await cargarTodosLosSpots(sceneId);
      
      setResult({
        sceneId,
        executed: false,
        message: 'Spots cargados directamente en Krpano',
        timestamp: new Date().toLocaleTimeString()
      });

      console.log(`✅ Spots generados para ${sceneId}`);

    } catch (err) {
      console.error('❌ Error cargando spots:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testExecuteInKrpano = async (sceneId) => {
    if (!window.krpano) {
      setError('Krpano no está disponible. Asegúrate de estar en la pestaña del tour.');
      return;
    }

    if (!window.loadSpotsForCurrentScene) {
      setError('Funciones de spots no registradas. Recarga la página.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Usar la función global registrada
      await window.loadSpotsForCurrentScene(sceneId);
      setResult({
        sceneId,
        executed: true,
        message: 'Spots ejecutados via función global',
        timestamp: new Date().toLocaleTimeString()
      });
      console.log(`🚀 Spots ejecutados en Krpano para ${sceneId}`);
    } catch (err) {
      console.error('❌ Error ejecutando en Krpano:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test Krpano Spots Service
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Prueba la carga dinámica de spots desde Firebase hacia Krpano.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
          {error}
        </Alert>
      )}

      {result && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resultado - {result.timestamp}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={result.sceneId} 
                color="primary" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                label={result.message || 'Ejecutado'} 
                color={result.executed ? "success" : "info"} 
                icon={result.executed ? <SuccessIcon /> : undefined}
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              Estado: {result.executed ? 'Ejecutado en Krpano' : 'Preparado para ejecución'}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" gutterBottom>
        Probar por escena:
      </Typography>

      {scenes.map((scene) => (
        <Card key={scene.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                {scene.name}
              </Typography>
              
              <Box>
                <Button
                  variant="outlined"
                  startIcon={loading ? <CircularProgress size={16} /> : <LoadIcon />}
                  onClick={() => testLoadSpots(scene.id)}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  Generar Comandos
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} /> : <LoadIcon />}
                  onClick={() => testExecuteInKrpano(scene.id)}
                  disabled={loading}
                >
                  Ejecutar en Krpano
                </Button>
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Scene ID: <code>{scene.id}</code>
            </Typography>
          </CardContent>
        </Card>
      ))}

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Instrucciones:</strong><br />
          1. <strong>Generar Comandos:</strong> Carga los datos desde Firebase y genera comandos Krpano<br />
          2. <strong>Ejecutar en Krpano:</strong> Ejecuta los comandos directamente en la instancia de Krpano (requiere que el tour esté cargado)
        </Typography>
      </Alert>
    </Box>
  );
};

export default TestKrpanoSpots;