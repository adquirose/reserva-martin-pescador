import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Collapse } from '@mui/material';
import { Map, ExpandMore } from '@mui/icons-material';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Token de Mapbox
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWRxdWlyb3NlIiwiYSI6ImNtOXgxb3RnczAzNmsya29ydzBoNXFpMTgifQ.n_OdwVRikLLg7D9ca47O4Q';

const MapboxRadar = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentScene, setCurrentScene] = useState(null);

  const createFOVPolygon = (centerLng, centerLat, heading, fov, distance) => {
    const points = [[centerLng, centerLat]]; // Punto central
    
    const startAngle = heading - fov / 2;
    const endAngle = heading + fov / 2;
    const steps = 20;
    
    // Crear puntos del arco
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (endAngle - startAngle) * i / steps;
      const x = centerLng + distance * Math.sin(angle);
      const y = centerLat + distance * Math.cos(angle);
      points.push([x, y]);
    }
    
    points.push([centerLng, centerLat]); // Cerrar el polígono
    return points;
  };

  const addRadarLayer = () => {
    if (!map.current) return;

    // Agregar fuente y capa para el campo de visión del radar
    map.current.addSource('radar-fov', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[]]
        }
      }
    });

    map.current.addLayer({
      id: 'radar-fov-fill',
      type: 'fill',
      source: 'radar-fov',
      paint: {
        'fill-color': '#ff0000',
        'fill-opacity': 0.3
      }
    });

    map.current.addLayer({
      id: 'radar-fov-line',
      type: 'line',
      source: 'radar-fov',
      paint: {
        'line-color': '#ff0000',
        'line-width': 2,
        'line-opacity': 0.8
      }
    });
  };

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    // Coordenadas del proyecto Martín Pescador en Chile
    const sceneCoordinates = {
      'scene_e1': [-73.9892090, -42.6736055], // Etapa 1
      'scene_e2': [-73.9891090, -42.6735055], // Etapa 2 (ligeramente desplazada)
      'scene_e3': [-73.9893090, -42.6737055], // Etapa 3 (ligeramente desplazada)
      'scene_e4': [-73.9890090, -42.6738055], // Etapa 4 (ligeramente desplazada)
    };

    const handleSceneChange = (event) => {
      const { scene } = event.detail;
      setCurrentScene(scene);
      
      if (sceneCoordinates[scene] && map.current && markerRef.current) {
        const coords = sceneCoordinates[scene];
        
        // Actualizar posición del marcador
        markerRef.current.setLngLat(coords);
        
        // Centrar el mapa en la nueva posición
        map.current.flyTo({
          center: coords,
          zoom: 18,
          duration: 1000
        });
      }
    };

    const handleViewChange = (event) => {
      const { ath, fov } = event.detail; // ath: heading horizontal, fov: field of view
      
      if (!map.current || !currentScene || !sceneCoordinates[currentScene]) return;

      const coords = sceneCoordinates[currentScene];
      const [lng, lat] = coords;
      
      // Calcular el campo de visión basado en el FOV y la dirección del tour
      const fovRad = (fov || 90) * Math.PI / 180;
      const athRad = (ath || 0) * Math.PI / 180;
      const distance = 0.0001; // Distancia del campo de visión en grados

      // Crear polígono del campo de visión
      const fovPolygon = createFOVPolygon(lng, lat, athRad, fovRad, distance);
      
      // Actualizar la fuente del radar
      if (map.current.getSource('radar-fov')) {
        map.current.getSource('radar-fov').setData({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [fovPolygon]
          }
        });
      }
    };
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // Estilo satelital
      center: [-73.9892090, -42.6736055], // Centro del proyecto Martín Pescador en Chile
      zoom: 18,
      pitch: 45, // Inclinación para vista 3D
      bearing: 0,
      antialias: true
    });

    map.current.on('load', () => {
      // Agregar controles de navegación
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
      
      // Crear marcador principal
      const el = document.createElement('div');
      el.className = 'radar-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#ff0000';
      el.style.border = '3px solid #ffffff';
      el.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.8)';
      
      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat([-73.9892090, -42.6736055])
        .addTo(map.current);

      // Agregar capa de radar/campo de visión
      addRadarLayer();
    });

    // Escuchar eventos de Krpano
    window.addEventListener('krpano-scene-change', handleSceneChange);
    window.addEventListener('krpano-view-change', handleViewChange);

    return () => {
      window.removeEventListener('krpano-scene-change', handleSceneChange);
      window.removeEventListener('krpano-view-change', handleViewChange);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [currentScene]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        width: isExpanded ? 300 : 50,
        height: isExpanded ? 200 : 50,
      }}
    >
      {/* Botón de toggle */}
      <IconButton
        onClick={toggleExpanded}
        sx={{
          position: 'absolute',
          top: 5,
          right: 5,
          zIndex: 1001,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          width: 40,
          height: 40,
        }}
      >
        {isExpanded ? <ExpandMore /> : <Map />}
      </IconButton>

      {/* Contenedor del mapa */}
      <Collapse in={isExpanded} orientation="vertical">
        <Box
          ref={mapContainer}
          sx={{
            width: '100%',
            height: 200,
            borderRadius: '12px',
          }}
        />
      </Collapse>

      {/* Indicador de escena actual */}
      {isExpanded && currentScene && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {currentScene.replace('scene_', 'Etapa ').replace('e', '')}
        </Box>
      )}
    </Box>
  );
};

export default MapboxRadar;