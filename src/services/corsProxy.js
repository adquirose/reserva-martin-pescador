// Servicio para manejar peticiones CORS a recursos externos
class CorsProxyService {
  constructor() {
    // URLs base para diferentes proyectos
    this.endpoints = {
      fundodehesa: 'https://lanube360.com/fundodehesa360',
      martinpescador: 'https://lanube360.com/temporales/reserva-martin-pescador2'
    };
  }

  /**
   * Realiza peticiones HTTP con manejo de CORS
   * @param {string} project - Proyecto (fundodehesa, martinpescador)
   * @param {string} path - Ruta del recurso
   * @param {Object} options - Opciones de fetch
   * @returns {Promise} - Respuesta de la petición
   */
  async fetchWithProxy(project, path, options = {}) {
    const isDev = import.meta.env.DEV;
    
    if (isDev) {
      // En desarrollo, usar proxy de Vite
      const proxyPath = this.getProxyPath(project, path);
      return fetch(proxyPath, options);
    } else {
      // En producción, usar servicios CORS proxy
      return this.fetchWithCorsProxy(project, path, options);
    }
  }

  /**
   * Obtiene la ruta del proxy para desarrollo
   */
  getProxyPath(project, path) {
    switch (project) {
      case 'fundodehesa':
        return `/api/fundodehesa${path}`;
      case 'martinpescador':
        return `/api/panos${path}`;
      default:
        throw new Error(`Proyecto no soportado: ${project}`);
    }
  }

  /**
   * Usa servicios CORS proxy para producción
   */
  async fetchWithCorsProxy(project, path, options = {}) {
    const targetUrl = `${this.endpoints[project]}${path}`;
    
    // Intentar con diferentes servicios CORS proxy
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://cors-anywhere.herokuapp.com/${targetUrl}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
    ];

    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl, {
          ...options,
          headers: {
            ...options.headers,
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.ok) {
          return response;
        }
      } catch (error) {
        console.warn(`Proxy failed: ${proxyUrl}`, error);
        continue;
      }
    }

    // Si todos los proxies fallan, intentar directo (puede fallar por CORS)
    console.warn('Todos los proxies fallaron, intentando directo...');
    return fetch(targetUrl, options);
  }

  /**
   * Carga un archivo XML específico
   */
  async loadXML(project, filename) {
    try {
      const response = await this.fetchWithProxy(project, `/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Verificar errores de parsing
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error(`Error parseando XML: ${parserError.textContent}`);
      }
      
      return xmlDoc;
    } catch (error) {
      console.error(`Error cargando XML ${filename} desde ${project}:`, error);
      throw error;
    }
  }

  /**
   * Carga tour.clean.xml específicamente para Fundo de Hesa
   */
  async loadFundoDeHesaTour() {
    return this.loadXML('fundodehesa', 'tour.clean.xml');
  }

  /**
   * Carga cualquier archivo de tour para Martin Pescador
   */
  async loadMartinPescadorFile(filename) {
    return this.fetchWithProxy('martinpescador', `/${filename}`);
  }
}

// Crear instancia singleton
export const corsProxy = new CorsProxyService();

// Funciones de conveniencia
export const loadFundoDeHesaTour = () => corsProxy.loadFundoDeHesaTour();
export const loadMartinPescadorFile = (filename) => corsProxy.loadMartinPescadorFile(filename);

export default corsProxy;