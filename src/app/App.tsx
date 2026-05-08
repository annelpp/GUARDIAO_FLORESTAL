import { RouterProvider } from 'react-router';
import { router } from './routes';
// Importe o ThemeProvider (ajuste o caminho dependendo de onde você criou o arquivo)
import { ThemeProvider } from './contexts/ThemeContext'; 

export default function App() {
  return (
    // O ThemeProvider agora abraça toda a sua aplicação e suas rotas
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}