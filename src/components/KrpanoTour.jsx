import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const KrpanoTour = () => {
  const krpanoRef = useRef(null);
  const krpanoInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerId = useRef('krpano-container-' + Math.random().toString(36).substr(2, 9));

  // Función para verificar si Krpano está realmente listo basado en la documentación oficial
  const verifyKrpanoReadiness = (krpano) => {
    try {
      // Verificar métodos principales de la API según la documentación
      if (!krpano || typeof krpano.call !== 'function' || typeof krpano.get !== 'function' || typeof krpano.set !== 'function') {
        return false;
      }

      // Verificar que podemos acceder a variables básicas del sistema
      const version = krpano.get('version');
      if (!version) return false;

      // Verificar que el view está disponible (usando variables documentadas)
      const hlookat = krpano.get('view.hlookat');
      if (hlookat === null || hlookat === undefined) return false;

      // Verificar que el sistema de capas está funcionando
      const layerCount = krpano.get('layer.count');
      if (layerCount === null || layerCount === undefined) return false;

      console.log('Krpano API completamente verificada:', { version, hlookat, layerCount });
      return true;
    } catch (error) {
      console.warn('Error verificando Krpano API:', error);
      return false;
    }
  };

  // Función para configurar los eventos de Krpano que se comunicarán con el mapa
  const setupKrpanoEvents = (krpano) => {
    if (!verifyKrpanoReadiness(krpano)) {
      console.warn('Krpano no está completamente listo, reintentando en 500ms...');
      setTimeout(() => setupKrpanoEvents(krpano), 500);
      return;
    }

    let lastScene = null;
    let lastAth = null;

    // Función para monitorear cambios en Krpano usando variables documentadas
    const monitorKrpano = () => {
      try {
        // Usar xml.scene según la documentación oficial
        const currentScene = krpano.get('xml.scene');
        const ath = krpano.get('view.hlookat');
        const fov = krpano.get('view.fov');

        // Verificar si cambió la escena
        if (currentScene && currentScene !== lastScene) {
          lastScene = currentScene;
          window.dispatchEvent(new CustomEvent('krpano-scene-change', {
            detail: { scene: currentScene }
          }));
        }

        // Verificar si cambió la dirección (solo si hay diferencia significativa)
        if (ath !== null && fov !== null) {
          const athNum = parseFloat(ath);
          if (lastAth === null || Math.abs(athNum - lastAth) > 2) {
            lastAth = athNum;
            window.dispatchEvent(new CustomEvent('krpano-view-change', {
              detail: { 
                ath: athNum, 
                fov: parseFloat(fov),
                scene: currentScene
              }
            }));
          }
        }
      } catch {
        // Silenciar errores de monitoreo para no spam en consola
      }
    };

    // Monitoreo inicial y periódico
    setTimeout(monitorKrpano, 1000); // Primera actualización después de 1 segundo
    setInterval(monitorKrpano, 500); // Actualizar cada 500ms
  };

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
          
          // Limpiar instancias huérfanas del DOM 
          const existingInstances = document.querySelectorAll('[id*="krpanoSWF"]');
          if (existingInstances.length > 0) {
            console.log('🧹 Limpiando instancias previas del DOM');
            existingInstances.forEach(el => {
              console.log('Removiendo:', el.id);
              el.remove();
            });
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
              console.log('🚀 =============== KRPANO ONREADY EJECUTADO ===============');
              console.log('🎉 Krpano instancia recibida:', krpano);
              
              krpanoInstance.current = krpano;
              
              // CRÍTICO: Múltiples estrategias para establecer la referencia global
              window.krpano = krpano;
              window.krpanoInstance = krpano;  // ⭐ NUEVO: Para KrpanoMap.jsx
              window.globalKrpano = krpano; // Respaldo adicional
              
              console.log('🌍 INSTANCIA EXPUESTA GLOBALMENTE:', window.krpanoInstance);
              
              // Asegurar que embedpano también tenga la referencia
              if (window.embedpano && window.embedpano.get) {
                // Forzar que embedpano mantenga la referencia
                const krpanoId = containerId.current.replace('krpano-container-', 'krpano');
                window.embedpano.instances = window.embedpano.instances || {};
                window.embedpano.instances[krpanoId] = krpano;
                window.embedpano.instances['krpano0'] = krpano; // Referencia estándar
              }
              
              console.log('🔧 Krpano onready - Estableciendo referencias múltiples');
              console.log('📦 krpano instance:', krpano);
              console.log('🌍 window.krpano:', window.krpano);
              console.log('🔄 window.globalKrpano:', window.globalKrpano);
              console.log('🎯 Métodos disponibles:', {
                call: typeof krpano?.call,
                get: typeof krpano?.get, 
                set: typeof krpano?.set
              });
              
              // Usar función de verificación mejorada
              const waitForFullReadiness = () => {
                if (verifyKrpanoReadiness(krpano)) {
                  setLoading(false);
                  console.log('✅ Krpano completamente listo');
                  
                  // Re-establecer referencias múltiples por seguridad
                  window.krpano = krpano;
                  window.globalKrpano = krpano;
                  
                  // Verificar acceso inmediato
                  console.log('🔍 Verificación final de acceso:', {
                    windowKrpano: !!window.krpano,
                    globalKrpano: !!window.globalKrpano,
                    callMethod: typeof window.krpano?.call,
                    getMethod: typeof window.krpano?.get,
                    setMethod: typeof window.krpano?.set,
                    embedpanoAccess: !!window.embedpano?.get?.('krpano0')
                  });
                  
                  // Configurar eventos para sincronizar con el mapa
                  setupKrpanoEvents(krpano);
                  
                  // Emitir evento personalizado con verificación completa
                  const scene = krpano.get('xml.scene');
                  const version = krpano.get('version');
                  
                  // Emitir evento inmediato y con delay
                  const eventDetail = { 
                    krpano: krpano, 
                    scene: scene,
                    version: version,
                    windowKrpano: window.krpano,
                    globalKrpano: window.globalKrpano
                  };
                  
                  // Evento inmediato
                  window.dispatchEvent(new CustomEvent('krpano-ready', { detail: eventDetail }));
                  console.log('🚀 Evento krpano-ready emitido inmediatamente');
                  
                  // Evento con delay adicional para componentes lentos
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('krpano-ready-delayed', { detail: eventDetail }));
                    console.log('⏰ Evento krpano-ready-delayed emitido');
                  }, 200);
                  
                  console.log('Evento krpano-ready emitido:', { scene, version });
                  console.log('window.krpano establecido:', window.krpano);
                  console.log('Verificando métodos:', {
                    call: typeof krpano.call,
                    get: typeof krpano.get,
                    set: typeof krpano.set
                  });
                  
                  // Verificar que window.krpano persiste después de un momento
                  setTimeout(() => {
                    console.log('Verificación después de 1s - window.krpano:', !!window.krpano);
                    console.log('Verificación después de 1s - métodos:', {
                      call: typeof window.krpano?.call,
                      get: typeof window.krpano?.get,
                      set: typeof window.krpano?.set
                    });
                  }, 1000);
                } else {
                  console.log('Krpano aún no está completamente listo, reintentando...');
                  setTimeout(waitForFullReadiness, 200);
                }
              };
              
              // Comenzar verificación con delay inicial
              setTimeout(waitForFullReadiness, 300);
              
              console.log('🏁 =============== FIN KRPANO ONREADY ===============');
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

    // Inicializar Krpano al montar el componente
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {/* Pantalla de carga */}
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
            backgroundColor: '#000000',
            color: '#ffffff',
            zIndex: 1001
          }}
        >
          <CircularProgress size={60} sx={{ color: '#ffffff', mb: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Cargando Tour Virtual...
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
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