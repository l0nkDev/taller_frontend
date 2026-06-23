import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import Login from './features/auth/Login';
import MainLayout from './features/dashboard/MainLayout';

import { UsersView } from './features/users/Users';
import { MenuView } from './features/menu/Menu';

import type { JSX } from 'react';
import { FloorView } from './features/floor/Floor';
import { OrdersView } from './features/orders/Orders';
import { BIView } from './features/bi/BI';
import { SalesHistoryView } from './features/bi/SalesHistory';
import './index.css'

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAppSelector((state) => state.auth.token);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <DefaultRoute />;
  }
  return children;
};

const DefaultRoute = () => {
  const user = useAppSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'waiter') return <Navigate to="/floorplan" replace />;
  if (user.role === 'kitchen') return <Navigate to="/orders" replace />;
  return <Navigate to="/menu" replace />; // Admin default
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
          <Route index element={<DefaultRoute />} />
          <Route path="users" element={<RoleProtectedRoute allowedRoles={['admin']}><UsersView /></RoleProtectedRoute>} />
          <Route path="menu" element={<RoleProtectedRoute allowedRoles={['admin']}><MenuView /></RoleProtectedRoute>} />
          <Route path="floorplan" element={<RoleProtectedRoute allowedRoles={['admin', 'waiter']}><FloorView/></RoleProtectedRoute>} />
          <Route path="orders" element={<RoleProtectedRoute allowedRoles={['admin', 'kitchen']}><OrdersView/></RoleProtectedRoute>} />
          <Route path="bi" element={<RoleProtectedRoute allowedRoles={['admin']}><BIView /></RoleProtectedRoute>} />
          <Route path="history" element={<RoleProtectedRoute allowedRoles={['admin']}><SalesHistoryView /></RoleProtectedRoute>} />
        </Route>
        <Route path="*" element={<DefaultRoute />} />
      </Routes>
    </BrowserRouter>
  );
}