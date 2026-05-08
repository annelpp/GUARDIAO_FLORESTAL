import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { 
  TreePine, LayoutDashboard, ListTree, CheckSquare, 
  Bell, FileBarChart, Menu, X 
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
// IMPORTANTE: Ajuste o caminho do ThemeToggle se a pasta for diferente
import { ThemeToggle } from '../components/ThemeToggle'; 

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Árvores', href: '/trees', icon: ListTree },
    { name: 'Validação', href: '/validation', icon: CheckSquare },
    { name: 'Alertas', href: '/alerts', icon: Bell, badge: 5 },
    { name: 'Relatórios', href: '/reports', icon: FileBarChart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* ========================================== */}
      {/* HEADER MOBILE (Fica por baixo do menu)     */}
      {/* ========================================== */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-30 w-full shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between px-4 py-3 w-full">
          <Link to="/" className="flex items-center gap-2">
            <TreePine className="size-7 text-green-600 dark:text-green-500" />
            <span className="font-bold text-lg text-gray-900 dark:text-white">Cerca Digital</span>
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            {/* Botão de Tema no Mobile */}
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-7" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        

        <aside 
          className={`
            fixed inset-y-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col
            transition-all duration-300 ease-in-out
            w-[280px] lg:w-64
            ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'}
            lg:sticky lg:top-0 lg:z-30
          `}
        >
          <div className="flex flex-col h-full">
            
            {/* Logo Desktop & Mobile Close */}
            <div className="p-4 lg:p-6 border-b dark:border-gray-800 flex items-center justify-between transition-colors duration-300 gap-2">
              
              {/* Adicionado min-w-0 para ajudar o truncate no Flexbox */}
              <Link to="/" className="flex items-center gap-2 overflow-hidden min-w-0">
                <TreePine className="size-8 text-green-600 dark:text-green-500 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-lg leading-tight text-gray-900 dark:text-white truncate">Cerca Digital</div>
                  <div className="text-xs font-semibold text-green-600 dark:text-green-500 tracking-wider uppercase truncate">Inteligente</div>
                </div>
              </Link>
              
              {/* Container dos botões blindado com shrink-0 */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Botão de Tema no Desktop */}
                <div className="hidden lg:block shrink-0">
                  <ThemeToggle />
                </div>
                {/* Botão de Fechar Exclusivo para Mobile */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="lg:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="size-6" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                      ${isActive 
                        ? 'bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-none' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`size-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge variant="destructive" className={isActive ? 'bg-white text-green-700 dark:bg-gray-900 dark:text-green-500' : ''}>
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900 mt-auto transition-colors duration-300">
              <div className="bg-green-100/50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-800/50 text-sm transition-colors duration-300">
                <p className="font-bold text-green-900 dark:text-green-400 mb-1">Sistema Ativo</p>
                <p className="text-green-700 dark:text-green-500/80 text-xs font-medium">
                  152 sensores online
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600 dark:bg-green-500"></span>
                  </span>
                  <span className="text-[11px] font-bold tracking-wider text-green-700 dark:text-green-500/80 uppercase">Monitorando</span>
                </div>
              </div>
            </div>

          </div>
        </aside>


        <main className="flex-1 lg:max-w-[calc(100vw-16rem)] w-full">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>


      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}