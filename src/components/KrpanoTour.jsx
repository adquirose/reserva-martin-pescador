import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import BrandingCard from './BrandingCard';

const KrpanoTour = () => {
  const krpanoRef = useRef(null);
  const krpanoInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerId = useRef('krpano-container-' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    // Función para cargar el script de Krpano
    const loadKrpanoScript = () => {
      return new Promise((resolve, reject) => {
        // Verificar si ya existe el script
        if (window.embedpano) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = '/krpano/tour.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Error cargando script de Krpano'));
        document.head.appendChild(script);
      });
    };

    // Cargar e inicializar Krpano
    const initKrpano = async () => {
      try {
        setError(null);
        await loadKrpanoScript();
        
        // Esperar a que el DOM esté completamente listo
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (krpanoRef.current && window.embedpano) {
          // Limpiar instancia anterior si existe
          if (krpanoInstance.current) {
            try {
              krpanoInstance.current.removepano();
            } catch {
              console.log('No hay instancia previa para limpiar');
            }
          }

          // Asignar ID único al contenedor
          krpanoRef.current.id = containerId.current;

          // Configuración del tour de Krpano
          window.embedpano({
            swf: "/krpano/tour.swf",
            xml: "/krpano/tour.xml",
            target: containerId.current,
            html5: "prefer",
            passQueryParameters: true,
            mwheel: false,
            onready: (krpano) => {
              krpanoInstance.current = krpano;
              setLoading(false);
              console.log('Krpano tour cargado exitosamente');
            },
            onerror: (errorMsg) => {
              console.error('Error de Krpano:', errorMsg);
              setError(`Error iniciando tour: ${errorMsg}`);
              setLoading(false);
            }
          });
        } else {
          setError('No se pudo encontrar el contenedor del tour o embedpano no está disponible');
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || 'Error cargando el tour de Krpano');
        setLoading(false);
        console.error('Error cargando el tour de Krpano:', err);
      }
    };

    initKrpano();

    // Cleanup al desmontar el componente
    return () => {
      if (krpanoInstance.current) {
        try {
          krpanoInstance.current.removepano();
          krpanoInstance.current = null;
        } catch (error) {
          console.error('Error al limpiar instancia de Krpano:', error);
        }
      }
    };
  }, []);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: '#000000',
      }}
    >
      {/* Contenedor del tour */}
      <Box
        ref={krpanoRef}
        sx={{
          width: '100%',
          height: '100%',
          '& > div': {
            width: '100% !important',
            height: '100% !important'
          }
        }}
      />

      {/* Pantalla de carga con branding */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            zIndex: 1001
          }}
        >
          <BrandingCard 
            size="large"
            variant="white"
            sx={{ mb: 4, maxWidth: 400 }}
          />
          
          <CircularProgress 
            size={60} 
            sx={{ 
              color: '#ffffff', 
              mb: 3,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
          
          <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 500 }}>
            Cargando Tour Virtual...
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, color: '#ffffff' }}>
            Por favor espera mientras se cargan las imágenes 360°
          </Typography>
        </Box>
      )}

      {/* Pantalla de error */}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            color: '#ffffff',
            textAlign: 'center',
            p: 4,
            zIndex: 1001
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: '#ff6b6b' }}>
            Error al cargar el tour
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, opacity: 0.8 }}>
            {error}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            Por favor, recarga la página e intenta de nuevo
          </Typography>
        </Box>
      )}

      <noscript>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            color: '#ffffff',
            fontSize: '18px',
            textAlign: 'center'
          }}
        >
          ERROR:<br /><br />
          Javascript no activado<br /><br />
        </Box>
      </noscript>
    </Box>
  );
};

export default KrpanoTour;