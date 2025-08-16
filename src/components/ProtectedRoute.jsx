// src/components/ProtectedRoute.jsx
import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../api/auth';

const ProtectedRoute = ({ children, Component, requiredRole }) => { 
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const userRole = getUserRole();
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  const ComponentToRender = Component || (() => children);

  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        backgroundColor: '#f5f5f5'
      }}>
        Memuat...
      </div>
    }>
      <ComponentToRender />
    </Suspense>
  );
};

export default ProtectedRoute;