# 🚨 PROBLEMA DETECTADO: URLs OBSOLETAS EN EL SERVIDOR

## 🔍 **Diagnóstico del Error**

Los errores de krpano muestran que el archivo `tour.xml` en el servidor remoto **sigue usando URLs antiguas**:

```
❌ ERROR: loading of 'https://lanube360.com/temporales/reserva-martin-pescador2/panos/...' failed!
```

Pero el tour debería usar las **URLs nuevas**:
```
✅ CORRECTO: https://www.lanube360.com/reserva-martin-pescador/panos/...
```

---

## 🔧 **Soluciones Aplicadas**

### ✅ **1. CSP actualizado**
- Agregado `lanube360.com` (sin www) al Content Security Policy
- Tanto para `.htaccess` como `nginx.conf`

### ⚠️ **2. ACCIÓN REQUERIDA: Actualizar servidor remoto**

**El archivo `tour.xml` en el servidor `www.lanube360.com/reserva-martin-pescador/` necesita ser actualizado.**

---

## 📋 **Pasos para solucionar completamente:**

### **Opción A: Usar archivo XML local actualizado**
1. Actualizar [public/krpano/tour.xml](public/krpano/tour.xml) con nuevas URLs
2. Cambiar KrpanoTour.jsx para usar XML local en lugar del remoto

### **Opción B: Actualizar servidor remoto** (Recomendado)
1. Acceder al servidor `www.lanube360.com/reserva-martin-pescador/`
2. Editar el archivo `tour.xml` 
3. Reemplazar todas las URLs:
   - `https://lanube360.com/temporales/reserva-martin-pescador2/` 
   - Por: `https://www.lanube360.com/reserva-martin-pescador/`

---

## 🎯 **Archivos que necesitan actualización en servidor remoto:**

```
www.lanube360.com/reserva-martin-pescador/tour.xml
└── Cambiar todas las URLs de imágenes panorámicas:
    ├── thumburl="https://lanube360.com/temporales/..."  →  "https://www.lanube360.com/reserva-martin-pescador/..."
    ├── preview url="https://lanube360.com/temporales/..." →  "https://www.lanube360.com/reserva-martin-pescador/..."
    └── cube url="https://lanube360.com/temporales/..."    →  "https://www.lanube360.com/reserva-martin-pescador/..."
```

**¿Tienes acceso al servidor para actualizar el tour.xml remoto?**