import React, { useState } from 'react';
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
  getAllLotes, 
  getLotesByEstado,
  getLotesMultipleVistas,
  getLotesByVista,
  initializeProjectDataNew 
} from '../services/firestoreServiceNew.js';

const FirebaseNewStructure = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [error, setError] = useState(null);

  const handleInitialize = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Iniciando migración a nueva estructura...');
      const initResult = await initializeProjectDataNew();
      setResult(initResult);
      
      // Cargar los lotes creados
      const lotesData = await getAllLotes();
      setLotes(lotesData);
      
      console.log('✅ Migración completada exitosamente');
    } catch (err) {
      console.error('❌ Error durante la migración:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadLotes = async () => {
    setLoading(true);
    setError(null);

    try {
      const lotesData = await getAllLotes();
      setLotes(lotesData);
      console.log('📋 Lotes cargados:', lotesData.length);
    } catch (err) {
      console.error('❌ Error cargando lotes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadByEstado = async (estado) => {
    setLoading(true);
    setError(null);

    try {
      const lotesData = await getLotesByEstado(estado);
      setLotes(lotesData);
      console.log(`📋 Lotes ${estado} cargados:`, lotesData.length);
    } catch (err) {
      console.error(`❌ Error cargando lotes ${estado}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMultipleVistas = async () => {
    setLoading(true);
    setError(null);

    try {
      const lotesData = await getLotesMultipleVistas();
      setLotes(lotesData);
      console.log(`📋 Lotes con múltiples vistas cargados:`, lotesData.length);
    } catch (err) {
      console.error('❌ Error cargando lotes con múltiples vistas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadByVista = async (numeroVista) => {
    setLoading(true);
    setError(null);

    try {
      const lotesData = await getLotesByVista(numeroVista);
      setLotes(lotesData);
      console.log(`📋 Lotes de vista ${numeroVista} cargados:`, lotesData.length);
    } catch (err) {
      console.error(`❌ Error cargando lotes de vista ${numeroVista}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLotesStats = () => {
    if (!lotes.length) return null;
    
    const disponibles = lotes.filter(l => l.estado === 'disponible').length;
    const vendidos = lotes.filter(l => l.estado === 'vendido').length;
    
    return { total: lotes.length, disponibles, vendidos };
  };

  const stats = getLotesStats();

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InitIcon />
            Nueva Estructura Firestore
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Estructura: <code>proyectos/martin-pescador/lotes/</code>
            <br />
            Cada lote contiene: estado, etapa, html, superficies, precio, vistaPrincipal, totalVistas, krpano{'{vista1, vista2, etc}'}
            <br />
            <strong>Múltiples vistas:</strong> Un lote puede aparecer en varias vistas con diferentes coordenadas ATH/ATV
          </Typography>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>Error:</strong> {error}
            </Alert>
          )}

          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<InitIcon />}
              onClick={handleInitialize}
              disabled={loading}
              color="primary"
            >
              Inicializar Nueva Estructura
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleLoadLotes}
              disabled={loading}
            >
              Cargar Todos los Lotes
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => handleLoadByEstado('disponible')}
              disabled={loading}
              color="success"
            >
              Solo Disponibles
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => handleLoadByEstado('vendido')}
              disabled={loading}
              color="error"
            >
              Solo Vendidos
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleLoadMultipleVistas}
              disabled={loading}
              color="info"
            >
              Múltiples Vistas
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => handleLoadByVista(1)}
              disabled={loading}
            >
              Vista 1
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => handleLoadByVista(2)}
              disabled={loading}
            >
              Vista 2
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => handleLoadByVista(3)}
              disabled={loading}
            >
              Vista 3
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => handleLoadByVista(4)}
              disabled={loading}
            >
              Vista 4
            </Button>
          </Box>

          {result && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <strong>✅ Inicialización exitosa:</strong>
              <br />
              • Total lotes: {result.totalLotes}
              <br />
              • Disponibles: {result.disponibles}
              <br />
              • Vendidos: {result.vendidos}
            </Alert>
          )}

          {stats && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Estadísticas de Lotes
              </Typography>
              <Grid container spacing={2}>
                <Grid>
                  <Chip 
                    label={`Total: ${stats.total}`}
                    color="primary"
                    icon={<SuccessIcon />}
                  />
                </Grid>
                <Grid>
                  <Chip 
                    label={`Disponibles: ${stats.disponibles}`}
                    color="success"
                  />
                </Grid>
                <Grid>
                  <Chip 
                    label={`Vendidos: ${stats.vendidos}`}
                    color="error"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {lotes.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Lotes Cargados
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {lotes.map((lote) => (
                  <Card key={lote.id} variant="outlined" sx={{ mb: 1, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={12}>
                        <Typography variant="h6" gutterBottom>
                          Lote {lote.numero} - HTML: {lote.krpano?.html || lote.numero}
                          <Chip 
                            label={`Etapa ${lote.etapa || 1}`}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                          <Chip 
                            label={lote.estado}
                            color={lote.estado === 'disponible' ? 'success' : 'error'}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                          <Chip 
                            label={`${lote.totalVistas || 1} Vista(s)`}
                            color="info"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                          <Chip 
                            label={`Principal: V${lote.vistaPrincipal || 1}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      </Grid>
                      
                      <Grid size={3}>
                        <Typography variant="body2" color="text.secondary">Superficies:</Typography>
                        <Typography variant="body2">
                          • Tránsito: {lote.superficieTransito || 0} m²<br />
                          • Lote: {lote.superficieLote || 0} m²<br />
                          • Total: {lote.superficieTotal || 0} m²
                        </Typography>
                      </Grid>
                      
                      <Grid size={2}>
                        <Typography variant="body2" color="text.secondary">Orilla:</Typography>
                        <Typography variant="body2">
                          {lote.metrosDeOrilla || 0}m
                        </Typography>
                      </Grid>
                      
                      <Grid size={2}>
                        <Typography variant="body2" color="text.secondary">Precio:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: lote.estado === 'disponible' ? 'green' : 'gray' }}>
                          {lote.precio || 'Sin precio'}
                        </Typography>
                      </Grid>
                      
                      <Grid size={5}>
                        <Typography variant="body2" color="text.secondary">Krpano (Múltiples Vistas):</Typography>
                        <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {lote.krpano && Object.keys(lote.krpano)
                            .filter(key => key.startsWith('vista'))
                            .map(vistaKey => (
                              <Typography key={vistaKey} variant="body2" sx={{ fontSize: '0.8rem' }}>
                                • {vistaKey}: ATH: {lote.krpano[vistaKey].ath}, ATV: {lote.krpano[vistaKey].atv}
                              </Typography>
                            ))}
                          {(!lote.krpano || Object.keys(lote.krpano).filter(k => k.startsWith('vista')).length === 0) && (
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'gray' }}>
                              Sin coordenadas disponibles
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FirebaseNewStructure;