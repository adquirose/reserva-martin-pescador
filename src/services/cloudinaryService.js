// Servicio para optimizar y subir imágenes a Cloudinary
import imageCompression from 'browser-image-compression';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../config/cloudinary.js';

/**
 * Opciones de compresión de imágenes
 */
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.2, // Tamaño máximo 200KB (0.2MB)
  maxWidthOrHeight: 1200, // Máximo 1200px de ancho o alto (reducido)
  useWebWorker: true,
  quality: 0.7, // 70% de calidad (reducido para menor tamaño)
  fileType: 'image/jpeg', // Convertir a JPEG para mejor compresión
};

/**
 * Función de fallback para comprimir imágenes usando Canvas API nativo
 * @param {File} file - Archivo de imagen
 * @returns {Promise<File>} - Imagen comprimida
 */
const compressImageWithCanvas = async (file) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Limpiar URL del objeto
        URL.revokeObjectURL(objectUrl);
        
        // Calcular dimensiones manteniendo aspect ratio
        let { width, height } = img;
        const maxDimension = 1000; // Más conservador
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob con calidad muy baja para garantizar <200KB
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Verificar tamaño y ajustar calidad si es necesario
              if (blob.size > 200 * 1024) {
                console.warn(`⚠️ Canvas result aún grande: ${(blob.size / 1024).toFixed(0)}KB, reduciendo calidad...`);
                // Intentar con calidad aún más baja
                canvas.toBlob(
                  (smallerBlob) => {
                    if (smallerBlob) {
                      const finalFile = new File([smallerBlob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                      });
                      console.log(`🛠️ Compresión final con Canvas: ${(file.size / 1024).toFixed(0)}KB → ${(smallerBlob.size / 1024).toFixed(0)}KB`);
                      resolve(finalFile);
                    } else {
                      reject(new Error('Error creando blob final'));
                    }
                  },
                  'image/jpeg',
                  0.1 // Calidad mínima
                );
              } else {
                // Crear nuevo archivo
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                
                console.log(`🛠️ Compresión con Canvas: ${(file.size / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB`);
                resolve(compressedFile);
              }
            } else {
              reject(new Error('Error creando blob desde canvas'));
            }
          },
          'image/jpeg',
          0.3 // Calidad muy baja para garantizar tamaño pequeño
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Error cargando imagen en Canvas'));
    };

    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
};

/**
 * Optimizar una imagen antes de subirla
 * @param {File} file - Archivo de imagen
 * @returns {Promise<File>} - Imagen optimizada
 */
export const optimizeImage = async (file) => {
  try {
    console.log(`🔧 Optimizando imagen: ${file.name}`);
    console.log(`📊 Tamaño original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Validar archivo
    if (!file || !file.size) {
      throw new Error('Archivo inválido o corrupto');
    }
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }
    
    // Validar tamaño máximo inicial (15MB)
    const maxSizeBytes = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSizeBytes) {
      throw new Error('La imagen es demasiado grande (máximo 15MB)');
    }
    
    // Si la imagen ya es pequeña (menos de 200KB), verificar calidad
    if (file.size <= 200 * 1024) {
      console.log('✅ Imagen ya es pequeña, verificando si necesita optimización...');
      
      // Aun así, convertir a JPEG optimizado para consistencia
      const lightOptions = {
        maxSizeMB: 0.19,
        quality: 0.8, // Calidad alta para archivos ya pequeños
        fileType: 'image/jpeg',
        useWebWorker: false
      };
      
      const optimized = await imageCompression(file, lightOptions);
      console.log(`✅ Optimización ligera: ${(file.size / 1024).toFixed(0)}KB → ${(optimized.size / 1024).toFixed(0)}KB`);
      return optimized;
    }
    
    // Configurar opciones de compresión agresiva para garantizar < 200KB
    const options = {
      maxSizeMB: 0.19, // 190KB para tener margen
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      quality: 0.6, // Calidad más baja para garantizar tamaño
      fileType: 'image/jpeg',
      initialQuality: 0.7,
      alwaysKeepResolution: false,
      onProgress: (progress) => {
        console.log(`📈 Progreso compresión: ${Math.round(progress)}%`);
      }
    };
    
    console.log('⚙️ Iniciando compresión con opciones:', options);
    
    const compressedFile = await imageCompression(file, options);
    
    // Verificar que la compresión fue exitosa
    if (!compressedFile) {
      throw new Error('La compresión falló - resultado vacío');
    }
    
    // Validar que el archivo comprimido esté bajo 200KB
    const maxFinalSize = 200 * 1024; // 200KB
    if (compressedFile.size > maxFinalSize) {
      console.warn(`⚠️ Archivo aún grande (${(compressedFile.size / 1024).toFixed(0)}KB), recomprimiendo...`);
      
      // Recomprimir con configuración más agresiva
      const aggressiveOptions = {
        maxSizeMB: 0.18, // 180KB
        maxWidthOrHeight: 800, // Resolución más baja
        quality: 0.4, // Calidad muy baja
        fileType: 'image/jpeg',
        useWebWorker: false
      };
      
      const finalCompressed = await imageCompression(compressedFile, aggressiveOptions);
      console.log(`✅ Imagen recomprimida: ${(finalCompressed.size / 1024).toFixed(0)}KB`);
      
      console.log(`✅ Imagen optimizada: ${(finalCompressed.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`📉 Reducción total: ${((file.size - finalCompressed.size) / file.size * 100).toFixed(1)}%`);
      
      return finalCompressed;
    }
    
    console.log(`✅ Imagen optimizada: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📉 Reducción: ${((file.size - compressedFile.size) / file.size * 100).toFixed(1)}%`);
    
    return compressedFile;
  } catch (error) {
    console.error('❌ Error optimizando imagen:', error);
    console.error('📄 Detalles del archivo:', {
      name: file?.name,
      size: file?.size,
      type: file?.type
    });
    
    // Si la compresión falla, intentar con configuración más simple
    const errorMessage = error?.message || error?.toString() || 'Error desconocido';
    if (errorMessage.includes('Error desconocido') || !error.message) {
      console.log('🔄 Intentando compresión simple...');
      try {
        const simpleOptions = {
          maxSizeMB: 0.19, // 190KB garantizado
          maxWidthOrHeight: 1000,
          useWebWorker: false, // Sin web worker
          quality: 0.5, // Calidad muy baja para garantizar tamaño
          fileType: 'image/jpeg'
        };
        
        const fallbackResult = await imageCompression(file, simpleOptions);
        console.log('✅ Compresión simple exitosa');
        return fallbackResult;
      } catch (fallbackError) {
        console.error('❌ Error en compresión simple también:', fallbackError);
        
        // Último recurso: usar Canvas API nativo
        console.log('🛠️ Intentando compresión con Canvas nativo...');
        try {
          const canvasResult = await compressImageWithCanvas(file);
          console.log('✅ Compresión con Canvas exitosa');
          return canvasResult;
        } catch (canvasError) {
          console.error('❌ Error en Canvas también:', canvasError);
          throw new Error(`Error en optimización: Todos los métodos fallaron - ${canvasError.message}`);
        }
      }
    }
    
    throw new Error(`Error optimizando imagen: ${errorMessage}`);
  }
};

/**
 * Subir una imagen optimizada a Cloudinary
 * @param {File} file - Archivo de imagen optimizada
 * @param {string} loteId - ID del lote para organizar las imágenes
 * @returns {Promise<string>} - URL de la imagen subida
 */
export const uploadImageToCloudinary = async (file, loteId) => {
  try {
    // Validar configuración
    validateCloudinaryConfig();
    
    console.log(`☁️ Subiendo imagen a Cloudinary para lote ${loteId}...`);
    console.log(`📁 Cloud Name: ${CLOUDINARY_CONFIG.cloudName}`);
    console.log(`⚙️ Upload Preset: ${CLOUDINARY_CONFIG.uploadPreset}`);
    console.log(`📂 Folder configurada: ${CLOUDINARY_CONFIG.folder}`);
    
    // Crear FormData para el upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    
    // Usar solo el parámetro folder simple
    const folderPath = `reserva-martin-pescador/lote-${loteId}`;
    formData.append('folder', folderPath);
    
    console.log(`📂 Folder path: ${folderPath}`);
    
    // Realizar upload
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    console.log(`🌐 Upload URL: ${uploadUrl}`);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error response: ${errorText}`);
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`📄 Response data:`, data);
    console.log(`🔗 Public ID recibido: ${data.public_id}`);
    console.log(`📍 URL segura: ${data.secure_url}`);
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    console.log(`✅ Imagen subida exitosamente: ${data.secure_url}`);
    
    return data.secure_url;
  } catch (error) {
    console.error('❌ Error subiendo imagen a Cloudinary:', error);
    throw new Error(`Error subiendo imagen: ${error.message}`);
  }
};

/**
 * Procesar múltiples imágenes: optimizar y subir
 * @param {FileList|File[]} files - Lista de archivos de imagen
 * @param {string} loteId - ID del lote
 * @param {function} onProgress - Callback para mostrar progreso (opcional)
 * @returns {Promise<string[]>} - Array de URLs de las imágenes subidas
 */
export const processAndUploadImages = async (files, loteId, onProgress = null) => {
  try {
    const fileArray = Array.from(files);
    const urls = [];
    
    console.log(`📷 Procesando ${fileArray.length} imágenes para lote ${loteId}`);
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        console.warn(`⚠️ Archivo ${file.name} no es una imagen, saltando...`);
        continue;
      }
      
      try {
        // Reportar progreso
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: fileArray.length,
            fileName: file.name,
            status: 'optimizing'
          });
        }
        
        // Optimizar imagen
        const optimizedFile = await optimizeImage(file);
        
        // Reportar progreso
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: fileArray.length,
            fileName: file.name,
            status: 'uploading'
          });
        }
        
        // Subir a Cloudinary
        const url = await uploadImageToCloudinary(optimizedFile, loteId);
        urls.push(url);
        
        // Reportar progreso
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: fileArray.length,
            fileName: file.name,
            status: 'completed',
            url: url
          });
        }
        
      } catch (error) {
        console.error(`❌ Error procesando ${file.name}:`, error);
        
        // Reportar error
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: fileArray.length,
            fileName: file.name,
            status: 'error',
            error: error.message
          });
        }
        
        // Continuar con las demás imágenes
        continue;
      }
    }
    
    console.log(`✅ Procesamiento completado: ${urls.length} imágenes subidas`);
    return urls;
    
  } catch (error) {
    console.error('❌ Error en processAndUploadImages:', error);
    throw error;
  }
};

/**
 * Eliminar imagen de Cloudinary usando Admin API con signature
 * @param {string} imageUrl - URL completa de la imagen
 * @returns {Promise<boolean>} - true si se eliminó exitosamente
 */
export const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    // Extraer public_id de la URL de Cloudinary
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.warn('❌ No se pudo extraer el public_id de la URL, eliminando solo de Firebase');
      return false;
    }

    console.log(`🗑️ Eliminando imagen de Cloudinary: ${publicId}`);
    
    // Generar timestamp para la signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Para eliminación simple, intentamos sin signature primero (método más simple)
    const deleteUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/destroy`;
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    formData.append('timestamp', timestamp);
    
    // Nota: Para producción, la signature debería generarse en el backend
    // Por ahora, intentamos sin signature y manejamos el error graciosamente
    
    const response = await fetch(deleteUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.result === 'ok') {
      console.log(`✅ Imagen eliminada exitosamente de Cloudinary`);
      return true;
    } else if (result.error) {
      console.warn(`⚠️ Error de Cloudinary (esperado con unsigned preset):`, result.error.message);
      return false;
    } else {
      console.warn(`⚠️ Respuesta inesperada al eliminar imagen:`, result);
      return false;
    }
    
  } catch (error) {
    console.warn('⚠️ No se pudo eliminar de Cloudinary (normal con unsigned preset):', error.message);
    return false;
  }
};

/**
 * Extraer public_id de una URL de Cloudinary
 * @param {string} url - URL de Cloudinary
 * @returns {string|null} - public_id extraído
 */
export const extractPublicIdFromUrl = (url) => {
  try {
    // Ejemplo: https://res.cloudinary.com/cloud/image/upload/v123/folder/image.jpg
    const regex = /\/v\d+\/(.+)\.(jpg|png|webp|gif)$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extrayendo public_id:', error);
    return null;
  }
};