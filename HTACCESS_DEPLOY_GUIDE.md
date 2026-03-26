# 📋 Configuración de Archivos .htaccess

## 🎯 **Tienes DOS archivos .htaccess diferentes:**

### 1. **`.htaccess`** - Para lanube360.com
- 🌐 **Usar en:** `https://www.lanube360.com/reserva-martin-pescador/`
- 🎯 **Propósito:** Configurar CORS para que tu aplicación pueda acceder desde `www.reservamartinpescador.cl`
- ⚙️ **Contiene:** Headers CORS, configuración para archivos del tour krpano

### 2. **`.htaccess-reservamartinpescador`** - Para tu dominio
- 🌐 **Usar en:** `https://www.reservamartinpescador.cl/`
- 🎯 **Propósito:** Routing SPA para React Router (solucionar problema `/admin`)
- ⚙️ **Contiene:** Rewrite rules, cache, compresión, seguridad

---

## 🚀 **Instrucciones de Deploy:**

### **En el servidor lanube360.com:**
```bash
# Subir el archivo actual .htaccess
scp .htaccess usuario@lanube360.com:/ruta/del/tour/
```

### **En el servidor de www.reservamartinpescador.cl:**
```bash
# Renombrar y subir el archivo específico
cp .htaccess-reservamartinpescador .htaccess
scp .htaccess usuario@reservamartinpescador.cl:/var/www/html/
```

---

## ✅ **Verificación:**

### Después de subir ambos archivos:

1. **CORS funcionando (lanube360.com):**
   ```bash
   curl -H "Origin: https://www.reservamartinpescador.cl" \
        -I https://www.lanube360.com/reserva-martin-pescador/tour.js
   # Debe mostrar: Access-Control-Allow-Origin: https://www.reservamartinpescador.cl
   ```

2. **Routing SPA funcionando (reservamartinpescador.cl):**
   - ✅ `https://www.reservamartinpescador.cl/` - Página principal
   - ✅ `https://www.reservamartinpescador.cl/admin` - No debe dar 404
   - ✅ Refresh en `/admin` - Debe mantenerse en la página

---

## 🔧 **Si usas cPanel:**
1. Ve al File Manager
2. Navega a `public_html/`
3. Sube `.htaccess-reservamartinpescador`
4. Renómbralo a `.htaccess`