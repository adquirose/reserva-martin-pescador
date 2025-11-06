import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Button, CircularProgress } from '@mui/material';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const FirebaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [error, setError] = useState(null);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError(null);
      
      // Intentar una operación simple de lectura
      const testDocRef = doc(db, 'test', 'connection');
      await getDoc(testDocRef);
      
      setConnectionStatus('success');
      console.log('✅ Conexión con Firebase exitosa');
    } catch (err) {
      setConnectionStatus('error');
      setError(err.message);
      console.error('❌ Error de conexión:', err);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        🔥 Test de Conexión Firebase
      </Typography>
      
      {connectionStatus === 'testing' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography>Probando conexión...</Typography>
        </Box>
      )}
      
      {connectionStatus === 'success' && (
        <Alert severity="success">
          <Typography variant="subtitle2">¡Conexión exitosa!</Typography>
          <Typography variant="body2">
            Firebase está configurado correctamente. Proyecto: <code>lanube360-29882</code>
          </Typography>
        </Alert>
      )}
      
      {connectionStatus === 'error' && (
        <Alert severity="error">
          <Typography variant="subtitle2">Error de conexión</Typography>
          <Typography variant="body2">
            {error}
          </Typography>
          <Button onClick={testConnection} size="small" sx={{ mt: 1 }}>
            Reintentar
          </Button>
        </Alert>
      )}
      
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Configuración actual:</strong><br/>
          • Proyecto: lanube360-29882<br/>
          • Región: Por defecto (us-central1)<br/>
          • Colección objetivo: reserva-martin-pescador
        </Typography>
      </Box>
    </Box>
  );
};

export default FirebaseConnectionTest;