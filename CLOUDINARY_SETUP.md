# Configuración de Cloudinary para Subida de Imágenes

## 📋 Resumen del Sistema

Se ha implementado un sistema completo de gestión de imágenes para lotes que incluye:

- ✅ **Optimización automática** de imágenes antes de subir
- ✅ **Compresión inteligente** (max 1MB, 1920px, 80% calidad)
- ✅ **Subida a Cloudinary** con organización por lotes
- ✅ **Interfaz de administración** para gestionar imágenes
- ✅ **Visualización en cards** solo cuando hay imágenes disponibles

## 🔧 Configuración Requerida

### 1. Crear cuenta en Cloudinary
1. Ve a [cloudinary.com](https://cloudinary.com) y crea una cuenta gratuita
2. En tu dashboard, anota los siguientes datos:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Configurar Upload Preset
1. En tu dashboard de Cloudinary, ve a **Settings → Upload**
2. Crea un nuevo **Upload Preset**:
   - **Preset Name**: `martin-pescador-preset` (o el que prefieras)
   - **Signing Mode**: `Unsigned` (para subidas desde frontend)
   - **Folder**: Puedes dejarlo vacío (se configurará automáticamente)
   - **Allowed formats**: `jpg,jpeg,png,webp`
   - **Auto backup**: Activado (recomendado)
   - **File size limit**: 10MB (será reducido por optimización)

### 3. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con:

```bash
# Configuración de Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name-aqui
VITE_CLOUDINARY_UPLOAD_PRESET=martin-pescador-preset
VITE_CLOUDINARY_API_KEY=tu-api-key-aqui
```

**⚠️ IMPORTANTE**: 
- Reemplaza `tu-cloud-name-aqui` con tu Cloud Name real
- Reemplaza `tu-api-key-aqui` con tu API Key real
- El upload preset debe coincidir con el que creaste

### 4. Ejemplo de archivo .env
```bash
VITE_CLOUDINARY_CLOUD_NAME=martin-pescador-dev
VITE_CLOUDINARY_UPLOAD_PRESET=martin-pescador-preset
VITE_CLOUDINARY_API_KEY=123456789012345
```

## 🚀 Cómo Usar el Sistema

### Para Administradores:

1. **Acceder al editor de lote**:
   - Ve a `/admin/dashboard`
   - Haz clic en "Editar" de cualquier lote
   - O ve directamente a `/admin/lote/NUMERO_LOTE`

2. **Subir imágenes**:
   - En la sección "Gestión de Imágenes"
   - Haz clic en "Seleccionar Imágenes"
   - Elige múltiples archivos (JPG, PNG, WebP)
   - Verás un preview de las imágenes seleccionadas
   - Haz clic en "Subir Imágenes"
   - El sistema optimizará y subirá automáticamente

3. **Gestionar imágenes existentes**:
   - Las imágenes actuales se muestran en la parte superior
   - Usa el botón ❌ para eliminar imágenes
   - Las nuevas imágenes se agregan al final de la lista

### Para Usuarios (Vista de lote):

- Las imágenes aparecen automáticamente en la card del lote
- Solo se muestran si hay imágenes disponibles
- Carousel interactivo con navegación por flechas
- Si no hay imágenes, la sección se oculta completamente

## 📁 Organización de Archivos

Las imágenes se organizan en Cloudinary de la siguiente manera:
```
martin-pescador/
└── lotes/
    ├── 1/
    │   ├── 1_1699123456789.jpg
    │   └── 1_1699123567890.jpg
    ├── 24/
    │   └── 24_1699123678901.jpg
    └── M8/
        ├── M8_1699123789012.jpg
        └── M8_1699123890123.jpg
```

## 🔧 Características Técnicas

### Optimización Automática:
- **Tamaño máximo**: 1MB por imagen
- **Resolución máxima**: 1920px (ancho o alto)
- **Calidad**: 80% (balance perfecto calidad/tamaño)
- **Formato**: Conversión automática a JPEG
- **Web Workers**: Para optimización sin bloquear UI

### Seguridad:
- Upload preset sin firma para facilidad de uso
- Validación de tipos de archivo en frontend
- Organización automática por carpetas
- IDs únicos para evitar conflictos

### Performance:
- Carga lazy de imágenes en carousel
- Compresión antes de upload para velocidad
- URLs optimizadas de Cloudinary con CDN global
- Preview inmediato durante selección

## 🐛 Solución de Problemas

### Error: "VITE_CLOUDINARY_CLOUD_NAME no está configurado"
- Verifica que el archivo `.env` existe en la raíz
- Confirma que la variable tiene el valor correcto
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "Upload preset not found"
- Verifica que el upload preset existe en Cloudinary
- Confirma que está configurado como "Unsigned"
- Revisa que el nombre coincide exactamente

### Las imágenes no aparecen en la card
- Verifica que se subieron correctamente en el admin
- Confirma que el lote tiene el array `imagenes` en Firebase
- Revisa la consola para errores de CORS

### Imágenes muy pesadas
- El sistema optimiza automáticamente, pero puedes:
- Reducir `maxSizeMB` en `cloudinaryService.js`
- Ajustar `maxWidthOrHeight` para resoluciones menores
- Cambiar `quality` para mayor compresión

## 🔄 Próximos Pasos Recomendados

1. **Configurar transformaciones automáticas** en Cloudinary:
   - Crear versiones thumbnail automáticas
   - Aplicar filtros de calidad automáticos
   - Generar múltiples formatos (WebP, AVIF)

2. **Implementar eliminación segura**:
   - Crear endpoint backend para eliminar de Cloudinary
   - Evitar eliminación directa desde frontend

3. **Mejorar UX**:
   - Drag & drop para subida de imágenes
   - Reordenamiento de imágenes por arrastre
   - Zoom en carousel para vista detallada

4. **Análitics**:
   - Tracking de imágenes más vistas
   - Métricas de performance de carga
   - Reportes de uso de almacenamiento