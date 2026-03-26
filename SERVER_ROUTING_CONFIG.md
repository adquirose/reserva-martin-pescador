# 🚀 Configuración de Routing SPA para Producción

Este documento explica cómo configurar el servidor de producción para que las rutas de React Router (como `/admin`) funcionen correctamente cuando se accede directamente.

## 🎯 **Problema**
Cuando intentas acceder a `https://www.reservamartinpescador.cl/admin` directamente, el servidor devuelve 404 porque busca un archivo físico `/admin` que no existe.

## ✅ **Solución**
Configurar el servidor para que redirija todas las rutas SPA a `/index.html`, permitiendo que React Router maneje la navegación.

---

## 🔧 **Por Tipo de Servidor**

### **Apache** (.htaccess)
✅ Ya configurado en el archivo [.htaccess](.htaccess)

Copia el archivo `.htaccess` al directorio raíz de tu sitio web:
```bash
# Copiar a la raíz del sitio
cp .htaccess /var/www/html/.htaccess
```

### **Nginx** 
✅ Usar configuración en [nginx.conf](nginx.conf)

Añadir al archivo de configuración del sitio:
```bash
# Copiar configuración
sudo cp nginx.conf /etc/nginx/sites-available/reservamartinpescador.cl
sudo ln -s /etc/nginx/sites-available/reservamartinpescador.cl /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### **Vercel**
✅ Ya configurado en [vercel.json](vercel.json)

Solo necesitas hacer deploy - Vercel detecta automáticamente el archivo.

### **Netlify**
✅ Ya configurado en [public/_redirects](public/_redirects)

Netlify detecta automáticamente el archivo `_redirects`.

### **Render.com**
✅ Ya configurado en [public/_redirects](public/_redirects)

Render.com también usa el archivo `_redirects`.

---

## 🔍 **Verificación**

### Probar que funciona:
1. ✅ `https://www.reservamartinpescador.cl` - Página principal
2. ✅ `https://www.reservamartinpescador.cl/admin` - Panel de administración
3. ✅ Actualizar página en `/admin` - No debería dar 404
4. ✅ Navegación con botón "atrás" del browser

### Si aún no funciona:

1. **Verificar el servidor web usado:**
   ```bash
   curl -I https://www.reservamartinpescador.cl
   # Buscar "Server:" en la respuesta
   ```

2. **Apache**: Verificar que mod_rewrite esté habilitado:
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

3. **Nginx**: Verificar sintaxis:
   ```bash
   sudo nginx -t
   ```

---

## 📁 **Archivos Incluidos**

- `.htaccess` - Configuración Apache ✅
- `nginx.conf` - Configuración Nginx ✅  
- `vercel.json` - Configuración Vercel ✅
- `public/_redirects` - Configuración Netlify/Render ✅

## 🚨 **Importante**

- Estos archivos también mantienen la configuración CORS para el tour krpano
- Las rutas `/api/`, `/assets/` y `/krpano/` están excluidas del rewrite
- Se incluyen headers de seguridad y optimización de cache