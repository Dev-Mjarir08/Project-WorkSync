import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './router.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
