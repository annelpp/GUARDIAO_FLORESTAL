import { ReactNode, useState } from 'react';
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

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Árvores', href: '/trees', icon: ListTree },
    { name: 'Validação', href: '/validation', icon: CheckSquare },
    { name: 'Alertas', href: '/alerts', icon: Bell, badge: 5 },
    { name: 'Relatórios', href: '/reports', icon: FileBarChart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <TreePine className="size-6 text-green-600 dark:text-green-500" />
            <span className="font-bold text-gray-900 dark:text-white">Cerca Digital</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Botão de Tema no Mobile */}
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`
            fixed lg:sticky top-0 left-0 z-30 h-screen w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex flex-col h-full">
            
            {/* Logo Desktop */}
            <div className="p-6 border-b dark:border-gray-800 hidden lg:flex items-center justify-between transition-colors duration-300">
              <Link to="/" className="flex items-center gap-2">
                <TreePine className="size-8 text-green-600 dark:text-green-500" />
                <div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white">Cerca Digital</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Inteligente</div>
                </div>
              </Link>
              {/* Botão de Tema no Desktop */}
              <ThemeToggle />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                      ${isActive 
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold' 
                        : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <Icon className="size-5" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-800 transition-colors duration-300">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-sm transition-colors duration-300">
                <p className="font-semibold text-green-800 dark:text-green-400 mb-1">Sistema Ativo</p>
                <p className="text-green-700 dark:text-green-500/80 text-xs">
                  152 sensores online
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-700 dark:text-green-500/80">Monitorando</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:max-w-[calc(100vw-16rem)]">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay para mobile com leve desfoque no escuro */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-20 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}