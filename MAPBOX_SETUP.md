# Configuración del Mapa Mapbox

## Obtener Token de Mapbox

Para que el mapa funcione correctamente, necesitas obtener un token de acceso de Mapbox:

1. **Crear cuenta gratuita en Mapbox:**
   - Ve a https://www.mapbox.com/
   - Haz clic en "Start building for free"
   - Registrate con tu email

2. **Obtener el token de acceso:**
   - Una vez registrado, ve a https://account.mapbox.com/access-tokens/
   - Copia el "Default public token" que aparece
   - O crea un nuevo token con los permisos necesarios

3. **Token ya configurado:**
   ✅ El token de Mapbox ya está configurado en el proyecto
   ✅ Las coordenadas del proyecto Martín Pescador en Chile ya están configuradas

## Coordenadas del Proyecto

Las coordenadas reales del proyecto Martín Pescador están configuradas:

```javascript
const sceneCoordinates = {
  'scene_e1': [-73.9892090, -42.6736055], // Etapa 1
  'scene_e2': [-73.9891090, -42.6735055], // Etapa 2
  'scene_e3': [-73.9893090, -42.6737055], // Etapa 3
  'scene_e4': [-73.9890090, -42.6738055], // Etapa 4
};
```

**Ubicación**: Región de Los Lagos, Chile  
**Coordenadas base**: -73.9892090, -42.6736055

## Funcionalidades del Mapa

El mapa Mapbox integrado incluye:

- **Sincronización con Krpano**: El mapa se actualiza automáticamente cuando cambias de escena en el tour
- **Campo de visión**: Muestra un área roja indicando la dirección y campo de visión actual del tour
- **Marcador de posición**: Punto rojo que indica la ubicación actual en el mapa
- **Controles de navegación**: Zoom y rotación del mapa
- **Vista satelital**: Muestra imágenes reales del terreno
- **Minimizable**: Se puede contraer y expandir usando el botón del mapa

## Configuración Avanzada

Puedes personalizar:

- **Estilo del mapa**: Cambiar `mapbox://styles/mapbox/satellite-streets-v12` por otros estilos
- **Zoom inicial**: Ajustar el valor de `zoom: 18`
- **Inclinación**: Modificar `pitch: 45` para cambiar la perspectiva 3D
- **Colores del radar**: Cambiar los colores en `fill-color` y `line-color`

El mapa aparece en la esquina inferior derecha de la pantalla y es completamente funcional sin interferir con el tour de Krpano.