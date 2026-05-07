import { createBrowserRouter } from 'react-router';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TreesPage from './pages/TreesPage';
import ValidationPage from './pages/ValidationPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import HardwareTestPage from './pages/HardwareTestPage'; // 👈 1. Importação da nova página adicionada
import DashboardLayout from './components/DashboardLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/dashboard',
    element: (
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    ),
  },
  {
    path: '/trees',
    element: (
      <DashboardLayout>
        <TreesPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/validation',
    element: (
      <DashboardLayout>
        <ValidationPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/alerts',
    element: (
      <DashboardLayout>
        <AlertsPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/reports',
    element: (
      <DashboardLayout>
        <ReportsPage />
      </DashboardLayout>
    ),
  },
  // 👈 2. Bloco da nova rota do Hardware adicionado!
  {
    path: '/hardware',
    element: (
      <DashboardLayout>
        <HardwareTestPage />
      </DashboardLayout>
    ),
  },
]);