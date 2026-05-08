import { 
  TreePine, Wifi, AlertTriangle, Activity, 
  MapPin, TrendingUp, Bell, CheckCircle2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { mockTrees, mockAlerts, temperatureHistory, systemStats } from '../data/mockData';
import { Link } from 'react-router';

import TreeMap from '../components/TreeMap';

export default function Dashboard() {
  const activeAlerts = mockAlerts.filter(a => !a.resolved);
  const criticalTrees = mockTrees.filter(t => t.status === 'critical');
  const warningTrees = mockTrees.filter(t => t.status === 'warning');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      case 'high': return <Badge className="bg-orange-600">Alto</Badge>;
      case 'medium': return <Badge className="bg-yellow-600">Médio</Badge>;
      case 'low': return <Badge variant="secondary">Baixo</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors duration-300">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Árvores</p>
                <p className="text-3xl font-bold">{systemStats.totalTrees}</p>
              </div>
              <TreePine className="size-10 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <TrendingUp className="size-3 inline mr-1" />
              +12 este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sensores Ativos</p>
                <p className="text-3xl font-bold">{systemStats.activeSensors}</p>
              </div>
              <Wifi className="size-10 text-blue-600" />
            </div>
            <Progress value={(systemStats.activeSensors / systemStats.totalTrees) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertas Ativos</p>
                <p className="text-3xl font-bold text-red-600">{activeAlerts.length}</p>
              </div>
              <AlertTriangle className="size-10 text-red-600" />
            </div>
            <Link to="/alerts">
              <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                Ver todos os alertas →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Área Monitorada</p>
                <p className="text-3xl font-bold">{systemStats.areaMonitored}</p>
                <p className="text-xs text-gray-500">hectares</p>
              </div>
              <Activity className="size-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* MAPA INTERATIVO SUBSTITUÍDO AQUI */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              Localização das Árvores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Renderização do nosso novo componente Leaflet */}
            <TreeMap />
          </CardContent>
        </Card>

        {/* Alertas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="size-5" />
                Alertas Recentes
              </span>
              {activeAlerts.length > 0 && (
                <Badge variant="destructive">{activeAlerts.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {mockAlerts.slice(0, 8).map((alert) => {
                const tree = mockTrees.find(t => t.id === alert.treeId);
                return (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-lg border ${alert.resolved ? 'bg-gray-50' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      {getSeverityBadge(alert.severity)}
                      {alert.resolved && (
                        <CheckCircle2 className="size-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm font-semibold mb-1">{alert.message}</p>
                    <p className="text-xs text-gray-600">{tree?.species}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Temperatura */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Histórico de Temperatura (Últimas 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tree001" stroke="#10b981" name="Ipê Roxo" strokeWidth={2} />
              <Line type="monotone" dataKey="tree002" stroke="#3b82f6" name="Jatobá" strokeWidth={2} />
              <Line type="monotone" dataKey="tree003" stroke="#ef4444" name="Mogno (Crítico)" strokeWidth={2} />
              <Line type="monotone" dataKey="tree005" stroke="#f59e0b" name="Peroba Rosa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Árvores em Situação Crítica/Atenção */}
      {(criticalTrees.length > 0 || warningTrees.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-600" />
              Árvores Requerendo Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...criticalTrees, ...warningTrees].map((tree) => (
                <div key={tree.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(tree.status)}`} />
                    <div>
                      <p className="font-semibold">{tree.species}</p>
                      <p className="text-sm text-gray-600">ID: {tree.nfcId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{tree.temperature}°C</p>
                    <p className="text-xs text-gray-600">
                      {tree.status === 'critical' ? 'Temperatura Crítica' : 'Temperatura Elevada'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}