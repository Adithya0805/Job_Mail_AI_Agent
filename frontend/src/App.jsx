import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BulkApply from './pages/BulkApply';

// Root App component with public routes and global state
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Workspace Routes */}
        <Route 
          path="/generator" 
          element={
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Navbar />
              <Home />
            </div>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Navbar />
              <Dashboard />
            </div>
          } 
        />
        <Route 
          path="/bulk" 
          element={
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Navbar />
              <BulkApply />
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
