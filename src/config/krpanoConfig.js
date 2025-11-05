// Configuración de entorno para rutas de imágenes Krpano
export const KRPANO_CONFIG = {
  // En desarrollo, usar servidor local si está disponible, sino usar servidor externo
  development: {
    baseUrl: import.meta.env.VITE_USE_LOCAL_IMAGES === 'true' 
      ? '' // Rutas locales relativas
      : 'https://lanube360.com/temporales/reserva-martin-pescador2', // Servidor externo
    fallbackUrl: 'https://lanube360.com/temporales/reserva-martin-pescador2' // Fallback
  },
  
  // En producción, siempre usar servidor externo
  production: {
    baseUrl: 'https://lanube360.com/temporales/reserva-martin-pescador2',
    fallbackUrl: 'https://lanube360.com/temporales/reserva-martin-pescador2'
  }
};

// Función para obtener la URL base según el entorno
export const getKrpanoBaseUrl = () => {
  const isDevelopment = import.meta.env.DEV;
  const config = isDevelopment ? KRPANO_CONFIG.development : KRPANO_CONFIG.production;
  return config.baseUrl;
};

export default KRPANO_CONFIG;