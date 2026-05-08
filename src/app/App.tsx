import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './contexts/ThemeContext'; 
// 1. Importar o Toaster
import { Toaster } from 'sonner';

export default function App() {
  return (
    <ThemeProvider>
      <Toaster richColors position="top-center" closeButton />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}