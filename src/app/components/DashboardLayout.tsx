import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { 
  TreePine, LayoutDashboard, ListTree, CheckSquare, 
  Bell, FileBarChart, Menu, X 
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <TreePine className="size-6 text-green-600" />
            <span className="font-bold">Cerca Digital</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`
            fixed lg:sticky top-0 left-0 z-30 h-screen w-64 bg-white border-r 
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b hidden lg:block">
              <Link to="/" className="flex items-center gap-2">
                <TreePine className="size-8 text-green-600" />
                <div>
                  <div className="font-bold text-lg">Cerca Digital</div>
                  <div className="text-xs text-gray-600">Inteligente</div>
                </div>
              </Link>
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
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-green-50 text-green-700 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50'
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
            <div className="p-4 border-t">
              <div className="bg-green-50 rounded-lg p-4 text-sm">
                <p className="font-semibold text-green-800 mb-1">Sistema Ativo</p>
                <p className="text-green-700 text-xs">
                  152 sensores online
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-700">Monitorando</span>
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

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
