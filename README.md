# Proyecto React + Vite + Redux Toolkit + Material UI

Este proyecto está configurado con las siguientes tecnologías:

- **React** - Biblioteca de JavaScript para construir interfaces de usuario
- **Vite** - Herramienta de build rápida para desarrollo web
- **Redux Toolkit** - Herramientas oficiales para gestión de estado eficiente con Redux
- **Material UI** - Biblioteca de componentes React que implementa Material Design de Google

## 🚀 Características

- ⚡ Desarrollo rápido con Vite
- 🔄 Gestión de estado con Redux Toolkit
- 🎨 Componentes de Material UI
- 📱 Diseño responsive
- 🔧 Configuración lista para usar

## 📁 Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── Counter.jsx     # Componente de ejemplo con Redux
├── store/              # Configuración de Redux
│   ├── store.js        # Store principal
│   └── features/       # Slices de Redux Toolkit
│       └── counter/
│           └── counterSlice.js
├── theme/              # Configuración de Material UI
│   └── theme.js        # Tema personalizado
├── App.jsx            # Componente principal
└── main.jsx           # Punto de entrada
```

## 🛠️ Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## 🚦 Cómo ejecutar

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre [http://localhost:5173](http://localhost:5173) en tu navegador

## 🔧 Tecnologías utilizadas

### Dependencias principales
- `react` - ^18.3.1
- `@reduxjs/toolkit` - Última versión
- `react-redux` - Para conectar React con Redux
- `@mui/material` - Componentes de Material UI
- `@emotion/react` & `@emotion/styled` - Para estilos de Material UI
- `@mui/icons-material` - Iconos de Material UI

### Herramientas de desarrollo
- `vite` - ^7.2.0
- `@vitejs/plugin-react` - Plugin de React para Vite

## 📝 Ejemplos incluidos

El proyecto incluye un componente `Counter` que demuestra:
- Uso de hooks de Redux (`useSelector`, `useDispatch`)
- Componentes de Material UI (`Card`, `Button`, `Typography`, etc.)
- Iconos de Material UI
- Manejo de estado con Redux Toolkit

## 🎨 Personalización

### Tema de Material UI
Puedes personalizar el tema en `src/theme/theme.js`. El tema actual incluye:
- Colores primarios y secundarios personalizados
- Configuración de tipografía

### Redux Store
Agrega nuevos slices en `src/store/features/` y regístralos en `src/store/store.js`.

## 📚 Recursos útiles

- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vitejs.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Material UI](https://mui.com/)

---

¡Feliz coding! 🚀
