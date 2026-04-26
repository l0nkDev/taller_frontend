import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import Login from './features/auth/Login';
import MainLayout from './features/dashboard/MainLayout';

import { UsersView } from './features/users/Users';
import { MenuView } from './features/menu/Menu';

import type { JSX } from 'react';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAppSelector((state) => state.auth.token);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<Navigate to="/menu" replace />} />
          <Route path="users" element={<UsersView />} />
          <Route path="menu" element={<MenuView />} />
        </Route>
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </BrowserRouter>
  );
}