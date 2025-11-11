import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Krpano } from './components/Krpano';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './components/AdminDashboard';
import LoteEditor from './components/LoteEditor';
import RepoblarDB from './components/RepoblarDB';
// import KrpanoSpotsManager from './components/KrpanoSpotsManager';

function App() {
  return (
    <Router>
      <div style={{ height: '100%', width: '100%' }}>
        {/* Sistema simple: cargar desde Firestore y pintar spots */}
        {/* <KrpanoSpotsManager /> */}
        
        <Routes>
          {/* Ruta principal del tour */}
          <Route path="/" element={<Krpano />} />
          
          {/* Ruta de login que redirije al admin */}
          <Route path="/login" element={<Navigate to="/admin" replace />} />
          
          {/* Rutas administrativas protegidas */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          {/* Ruta para editor de lote individual */}
          <Route 
            path="/admin/lote/:id" 
            element={
              <PrivateRoute>
                <LoteEditor />
              </PrivateRoute>
            } 
          />
          {/* Ruta para repoblar base de datos */}
          <Route 
            path="/admin/repoblar" 
            element={
              <PrivateRoute>
                <RepoblarDB />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
