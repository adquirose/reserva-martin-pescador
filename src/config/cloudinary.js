// Configuración de Cloudinary para subida de imágenes

// Configuración para upload
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'martin-pescador-preset',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  folder: 'reserva-martin-pescador', // Ruta específica simplificada
};

// Validar configuración
export const validateCloudinaryConfig = () => {
  const { cloudName, uploadPreset } = CLOUDINARY_CONFIG;
  
  if (!cloudName || cloudName === 'your-cloud-name') {
    throw new Error('VITE_CLOUDINARY_CLOUD_NAME no está configurado');
  }
  
  if (!uploadPreset || uploadPreset === 'martin-pescador-preset') {
    throw new Error('VITE_CLOUDINARY_UPLOAD_PRESET no está configurado');
  }
  
  return true;
};