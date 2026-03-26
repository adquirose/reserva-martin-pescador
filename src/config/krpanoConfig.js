// Configuración de entorno para rutas de imágenes Krpano
export const KRPANO_CONFIG = {
  // En desarrollo, usar servidor remoto actualizado
  development: {
    baseUrl: import.meta.env.VITE_USE_LOCAL_IMAGES === 'true' 
      ? '' // Rutas locales relativas
      : 'https://www.lanube360.com/reserva-martin-pescador', // Nueva URL del servidor
    fallbackUrl: 'https://www.lanube360.com/reserva-martin-pescador' // Nueva URL de fallback
  },
  
  // En producción, usar nueva URL del servidor
  production: {
    baseUrl: 'https://www.lanube360.com/reserva-martin-pescador',
    fallbackUrl: 'https://www.lanube360.com/reserva-martin-pescador'
  }
};

// Función para obtener la URL base según el entorno
export const getKrpanoBaseUrl = () => {
  const isDevelopment = import.meta.env.DEV;
  const config = isDevelopment ? KRPANO_CONFIG.development : KRPANO_CONFIG.production;
  return config.baseUrl;
};

export default KRPANO_CONFIG;