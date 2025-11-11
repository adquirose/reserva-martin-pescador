import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Build as BuildIcon
} from '@mui/icons-material';

const RepoblarDB = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const executeFunction = async (functionName, description) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`🔄 Ejecutando: ${description}`);
      
      if (typeof window[functionName] !== 'function') {
        throw new Error(`La función ${functionName} no está disponible. Asegúrate de que la aplicación haya cargado completamente.`);
      }

      const resultado = await window[functionName]();
      setResult({ 
        function: description, 
        data: resultado,
        timestamp: new Date().toLocaleString()
      });
      
      console.log(`✅ ${description} completado:`, resultado);
      
    } catch (err) {
      console.error(`❌ Error en ${description}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        🔧 Repoblar Base de Datos
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
        Herramientas para gestionar los datos de lotes en Firestore
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        
        {/* Verificar Archivos XML */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📂 Verificar Archivos XML
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Verifica que los archivos data.xml y spots.xml contengan todos los lotes
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AssessmentIcon />}
              onClick={() => executeFunction('verificar_datos_xml', 'Verificación de archivos XML')}
              disabled={loading}
              fullWidth
              sx={{ mb: 1 }}
            >
              Verificar Archivos XML
            </Button>
            
            {/* Nuevo botón para verificar campos */}
            <Button
              variant="outlined"
              color="info"
              startIcon={<AssessmentIcon />}
              onClick={() => executeFunction('verificar_campos_xml', 'Verificación de campos XML')}
              disabled={loading}
              fullWidth
            >
              🔍 Ver Campos Capturados
            </Button>
          </CardContent>
        </Card>

        <Divider />

        {/* Repoblar desde XML */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📂 Repoblar desde XML (RECOMENDADO)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Lee directamente desde /krpano/skin/data.xml y spots.xml para poblar la base de datos
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<RefreshIcon />}
              onClick={() => executeFunction('repoblar_desde_xml', 'Repoblación desde XML')}
              disabled={loading}
              fullWidth
              size="large"
            >
              Repoblar desde Archivos XML
            </Button>
          </CardContent>
        </Card>

        <Divider />

        {/* Proceso Completo Simple */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🚀 Proceso Completo Simple
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Repoblar base de datos desde XML y cargar spots automáticamente
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              onClick={() => executeFunction('proceso_completo_simple', 'Proceso completo simple')}
              sx={{ mb: 1 }}
            >
              🚀 Repoblar DB y Cargar Spots
            </Button>
          </CardContent>
        </Card>

        <Divider />

        {/* Estado Actual */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Verificar Estado Actual
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Revisa el estado actual de los datos en Firestore (debe haber 31 lotes)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => executeFunction('verificar_lotes_faltantes', 'Verificación de lotes faltantes')}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                Verificar Lotes Faltantes
              </Button>
              <Button
                variant="outlined"
                color="info"
                onClick={() => executeFunction('contar_lotes_esperados', 'Conteo esperado')}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                Ver Lotes Esperados
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Divider />

        {/* Repoblar completo (método anterior) */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔄 Repoblación Completa (Datos Hardcodeados)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Repuebla toda la base de datos con datos hardcodeados del código (método anterior)
            </Typography>
            <Button
              variant="contained"
              color="warning"
              startIcon={<RefreshIcon />}
              onClick={() => executeFunction('repoblar_base_datos', 'Repoblación completa hardcodeada')}
              disabled={loading}
              fullWidth
              size="large"
            >
              Repoblar con Datos Hardcodeados
            </Button>
          </CardContent>
        </Card>

        <Divider />

        {/* Completar Lotes Faltantes */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔧 Completar Lotes Faltantes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Agrega solo los lotes que faltan sin eliminar los existentes
            </Typography>
            <Button
              variant="contained"
              color="warning"
              startIcon={<BuildIcon />}
              onClick={() => executeFunction('completar_lotes_faltantes', 'Completar lotes faltantes')}
              disabled={loading}
              fullWidth
              size="large"
            >
              Completar Lotes Faltantes
            </Button>
          </CardContent>
        </Card>

        <Divider />

        {/* Repoblar Completo */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🚀 Repoblación Completa
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Repuebla toda la base de datos con los lotes desde los archivos XML
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => executeFunction('repoblar_base_datos', 'Repoblación completa')}
              disabled={loading}
              fullWidth
              size="large"
            >
              Repoblar Base de Datos
            </Button>
          </CardContent>
        </Card>

        <Divider />

        {/* Verificar Integridad */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 Verificar Integridad
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Verifica que todos los datos se hayan guardado correctamente
            </Typography>
            <Button
              variant="outlined"
              color="success"
              startIcon={<BuildIcon />}
              onClick={() => executeFunction('verificar_integridad', 'Verificación de integridad')}
              disabled={loading}
              fullWidth
            >
              Verificar Integridad
            </Button>
          </CardContent>
        </Card>

        {/* Estado de carga */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>
              Ejecutando operación...
            </Typography>
          </Box>
        )}

        {/* Resultados */}
        {result && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              ✅ {result.function} - {result.timestamp}
            </Typography>
            <Box component="pre" sx={{ 
              backgroundColor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1, 
              overflow: 'auto',
              fontSize: '0.875rem'
            }}>
              {JSON.stringify(result.data, null, 2)}
            </Box>
          </Alert>
        )}

        {/* Errores */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              ❌ Error
            </Typography>
            <Typography>{error}</Typography>
          </Alert>
        )}

        {/* Instrucciones */}
        <Card sx={{ mt: 3, backgroundColor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Instrucciones
            </Typography>
            <Typography variant="body2" component="div">
              <ol>
                <li>Primero, verifica el estado actual de la base de datos</li>
                <li>Ejecuta la repoblación completa para cargar todos los lotes</li>
                <li>Verifica la integridad para asegurar que todo esté correcto</li>
                <li>Revisa la consola del navegador para logs detallados</li>
              </ol>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default RepoblarDB;