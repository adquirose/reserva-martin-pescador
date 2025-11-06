import React, { useState, useRef, useEffect } from 'react';
import { Fab, Modal, Box } from '@mui/material';
import { Map as MapIcon, Close as CloseIcon } from '@mui/icons-material';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxMap = () => {
  const [mapOpen, setMapOpen] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Token de Mapbox configurado
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWRxdWlyb3NlIiwiYSI6ImNtZXZ0cHllMDBtdjAybW91b254bm9kMjIifQ.1fMjTWUhZj_1gJ9_WanBhQ';

  useEffect(() => {
    console.log('📋 useEffect ejecutándose - mapOpen:', mapOpen, 'mapContainer.current:', !!mapContainer.current, 'map.current:', !!map.current);
    
    if (mapOpen && !map.current) {
      console.log('✅ Modal abierto - Esperando contenedor...');
      
      // Función para intentar inicializar el mapa
      const tryInitializeMap = () => {
        if (mapContainer.current) {
          console.log('🗺️ Contenedor disponible - Inicializando mapa Mapbox...');
          try {
            map.current = new mapboxgl.Map({
              container: mapContainer.current,
              style: 'mapbox://styles/mapbox/satellite-streets-v12',
              center: [-73.98920897286563, -42.6736054530813], // Coordenadas Reserva Martín Pescador
              zoom: 10,
            });

            // Agregar marcador en la ubicación
            new mapboxgl.Marker({
              color: '#FF0000'
            })
              .setLngLat([-73.98920897286563, -42.6736054530813])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML('<h3>Reserva Martín Pescador</h3><p>Refugio en Patagonia</p>')
              )
              .addTo(map.current);

            // Agregar controles de navegación
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
            map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

            console.log('✅ Mapa Mapbox inicializado correctamente');
          } catch (error) {
            console.error('❌ Error al inicializar Mapbox:', error);
          }
        } else {
          console.log('⏳ Contenedor no disponible, reintentando en 50ms...');
          setTimeout(tryInitializeMap, 50);
        }
      };

      // Iniciar el proceso de inicialización con un pequeño delay
      setTimeout(tryInitializeMap, 100);
    }
  }, [mapOpen]);

  const openMap = () => {
    console.log('🔘 Click en botón Mapbox - Abriendo modal...');
    setMapOpen(true);
  };

  const closeMap = () => {
    if (map.current) {
      console.log('🧹 Limpiando mapa Mapbox...');
      map.current.remove();
      map.current = null;
    }
    setMapOpen(false);
  };

  return (
    <>
      {/* Botón para abrir Mapbox */}
      <Fab
        onClick={openMap}
        title="Ver mapa interactivo"
        sx={{
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 },
          backgroundColor: 'rgba(255, 87, 34, 0.9)', // Naranja vibrante
          border: '2px solid white',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          '&:hover': {
            backgroundColor: 'rgba(255, 87, 34, 1)',
            transform: 'scale(1.05)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <MapIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
      </Fab>

      {/* Modal con mapa Mapbox */}
      <Modal
        open={mapOpen}
        onClose={closeMap}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '90%',
            height: '90%',
            backgroundColor: 'white',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Botón cerrar */}
          <Fab
            onClick={closeMap}
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 2000,
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              width: 48,
              height: 48,
              border: '2px solid white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.95)',
                borderColor: '#2196F3',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <CloseIcon sx={{ fontSize: '1.5rem' }} />
          </Fab>

          {/* Contenedor del mapa Mapbox */}
          <div
            ref={(el) => {
              mapContainer.current = el;
              console.log('📦 Contenedor del mapa asignado:', !!el);
              
              // Si el contenedor se asigna y no hay mapa inicializado, inicializarlo
              if (el && !map.current && mapOpen) {
                console.log('🚀 Inicializando mapa directamente desde ref callback...');
                setTimeout(() => {
                  try {
                    map.current = new mapboxgl.Map({
                      container: el,
                      style: 'mapbox://styles/mapbox/satellite-streets-v12',
                      center: [-73.98920897286563, -42.6736054530813],
                      zoom: 10,
                    });

                    // Agregar marcador
                    new mapboxgl.Marker({
                      color: '#FF0000'
                    })
                      .setLngLat([-73.98920897286563, -42.6736054530813])
                      .setPopup(
                        new mapboxgl.Popup({ offset: 25 })
                          .setHTML('<h3>Reserva Martín Pescador</h3><p>Refugio en Patagonia</p>')
                      )
                      .addTo(map.current);

                    // Agregar controles
                    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
                    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

                    console.log('✅ Mapa Mapbox inicializado desde callback');
                  } catch (error) {
                    console.error('❌ Error al inicializar Mapbox desde callback:', error);
                  }
                }, 50);
              }
            }}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </Box>
      </Modal>
    </>
  );
};

export default MapboxMap;