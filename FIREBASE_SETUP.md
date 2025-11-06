# 🔥 Integración Firebase + Krpano

Este documento explica cómo conectar el tour de Krpano con Firestore para gestionar los datos del proyecto.

## ✅ Lo que se ha implementado

### 1. **Configuración Firebase**
- ✅ Instalación del SDK de Firebase
- ✅ Configuración con variables de entorno
- ✅ Conexión segura a Firestore
- ✅ Estructura de colecciones definida

### 2. **Servicios de Datos**
- ✅ Funciones para CRUD de spots/lotes
- ✅ Gestión de configuración del proyecto  
- ✅ Inicialización segura (no sobrescribe datos existentes)
- ✅ Validación de datos existentes

### 3. **Redux Store**
- ✅ Slice de Firestore integrado
- ✅ Actions asíncronas para todas las operaciones
- ✅ Estados de carga y error
- ✅ Selectores optimizados

### 4. **Componentes React**
- ✅ `FirebaseInitializer` - Para poblar la base de datos
- ✅ `SpotsViewer` - Para visualizar y filtrar spots
- ✅ Integración con Material UI
- ✅ Conexión con Krpano

## 🚀 Configuración Rápida

### Paso 1: Configurar Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un proyecto nuevo o usa uno existente
3. Habilita **Firestore Database**
4. En Project Settings > Web apps, obtén las credenciales

### Paso 2: Variables de Entorno
1. Copia el archivo `.env.local.example` como `.env`
2. Completa con tus credenciales de Firebase:

```bash
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdefg
```

### Paso 3: Inicializar Datos
1. Ejecuta `npm run dev`
2. Ve a la pestaña **"Configurar Firebase"**  
3. Haz clic en **"Inicializar Proyecto"**
4. ¡Los datos se crearán automáticamente! 🎉

## 📊 Estructura de Datos

### Colección: `reserva-martin-pescador`

#### Documento: `project-config`
```javascript
{
  title: "Reserva Martin Pescador",
  description: "Tour virtual del proyecto inmobiliario",
  settings: {
    enableMaps: false,
    enableGyro: true,
    enableThumbs: true,
    enableRadar: true
  },
  totalSpots: 30,
  spotsDisponibles: 13,
  spotsVendidos: 17,
  fechaCreacion: timestamp,
  fechaActualizacion: timestamp
}
```

#### Subcolección: `project-data/spots`
```javascript
{
  name: "ficha17",
  numero: "17", 
  html: "17",
  estado: "disponible", // "disponible" | "vendido" | "reservado"
  vista: 4,
  ath: "89.381",
  atv: "32.071", 
  precio: 180000000,
  superficie: 600,
  descripcion: "Lote número 17 - Vista Etapa 4",
  fechaCreacion: timestamp,
  fechaActualizacion: timestamp
}
```

#### Subcolección: `project-data/scenes`
```javascript
{
  name: "scene_e4",
  title: "Vista Etapa 4",
  vista: 4,
  description: "Cuarta vista del proyecto - Sector de desarrollo",
  totalSpots: 8,
  fechaCreacion: timestamp,
  fechaActualizacion: timestamp
}
```

## 🔗 Integración con Krpano

### En los componentes React:
```javascript
// Navegar a un spot en krpano
if (window.krpano) {
  window.krpano.call(`activatespot(${spot.name})`);
}

// Obtener datos actuales
const spots = useSelector(selectSpots);
const availableSpots = useSelector(selectAvailableSpots);
```

### En Krpano XML:
```xml
<!-- Los spots se mantienen como están -->
<spot name="ficha17" estado="disponible" html="17" ath="89.381" atv="32.071"/>
```

## 🛡️ Seguridad

### ✅ Datos Protegidos
- **No sobrescribe** datos existentes
- **Validación** antes de crear
- **Variables de entorno** para credenciales
- **Estructura separada** por proyecto

### Reglas de Firestore Recomendadas
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura a todos, escritura solo autenticados
    match /reserva-martin-pescador/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🎯 Uso en Producción

### Componente SpotsViewer
- 📱 Filtros por estado y vista
- 💰 Precios y superficies
- 🔄 Actualización en tiempo real
- 🎮 Conexión directa con Krpano

### Componente FirebaseInitializer  
- ⚡ Inicialización de una sola vez
- 🛡️ Protección contra duplicados
- 📊 Estadísticas en vivo
- ✅ Validación automática

## 🚨 Importante

1. **Backup**: Los datos NO se sobrescriben, es seguro ejecutar múltiples veces
2. **Colección**: Se crea `reserva-martin-pescador` independiente  
3. **Precios**: Se generan aleatoriamente para lotes disponibles
4. **XML**: El tour.xml original NO se modifica

## 🆘 Solución de Problemas

### Error de conexión
- Verifica las credenciales en `.env`
- Confirma que Firestore esté habilitado
- Revisa las reglas de seguridad

### Datos no aparecen
- Ejecuta "Inicializar Proyecto" primero
- Usa "Actualizar Datos" para refrescar
- Verifica la consola del navegador

### Problemas con Krpano
- Confirma que `window.krpano` esté disponible
- Verifica que los nombres de spots coincidan
- Revisa la consola para errores de JavaScript