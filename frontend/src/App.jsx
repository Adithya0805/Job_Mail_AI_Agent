import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BulkApply from './pages/BulkApply';

// Root App component with React Router
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <Home />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <Dashboard />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bulk" 
          element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <BulkApply />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
