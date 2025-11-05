import React from 'react'
import KrpanoTour from './components/KrpanoTour'
import TourOverlay from './components/TourOverlay'

function App() {
  // La aplicación ahora solo muestra el tour Krpano - sin vista alternativa
  return (
    <>
      <KrpanoTour />
      <TourOverlay />
    </>
  )
}

export default App
