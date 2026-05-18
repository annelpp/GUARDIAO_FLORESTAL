import { useState, useEffect } from 'react';
import { 
  TreePine, Wifi, AlertTriangle, Activity, 
  MapPin, TrendingUp, Bell, CheckCircle2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { mockAlerts, temperatureHistory, systemStats } from '../data/mockData';
import type { Tree, Alert } from '../data/mockData';
import { supabase, mapDbTreeToFrontend } from '../../lib/supabase';
import { Link } from 'react-router';

import TreeMap from '../components/TreeMap';

const AREA_SENSOR_THRESHOLDS = {
  tempCritical: 40, tempWarning: 30, gasCritical: 500, gasWarning: 120,
};

function sensorReadingToAlert(r: any, index: number): Alert | null {
  const isHot = r.temp != null && r.temp >= AREA_SENSOR_THRESHOLDS.tempCritical;
  const isGas = r.gas != null && r.gas >= AREA_SENSOR_THRESHOLDS.gasCritical;
  const isFireByFlame = r.fogo > 0;
  const isFireByAlarm = r.alarme === true && r.temp != null && r.temp >= AREA_SENSOR_THRESHOLDS.tempCritical;
  const isSmokeAlarm = r.alarme === true && !isFireByFlame && !isFireByAlarm;

  let type: Alert['type'] = 'area';
  let severity: Alert['severity'] = 'low';
  let message = '';

  if (isFireByFlame) {
    type = 'fire'; severity = 'critical';
    message = `Chama detectada pelo sensor! Temperatura: ${r.temp}°C`;
  } else if (isFireByAlarm) {
    type = 'fire'; severity = 'critical';
    message = `Fogo detectado na área monitorada! Temperatura: ${r.temp}°C`;
  } else if (isSmokeAlarm) {
    severity = 'high';
    message = `Alarme de fumaça/gás ativado! Gás: ${r.gas ?? '--'} ppm`;
  } else if (isHot) {
    severity = 'high';
    message = `Temperatura crítica na área: ${r.temp}°C`;
  } else if (isGas) {
    severity = 'high';
    message = `Nível de gás elevado na área: ${r.gas} ppm`;
  } else if (r.temp != null && r.temp >= AREA_SENSOR_THRESHOLDS.tempWarning) {
    severity = 'low';
    message = `Temperatura moderada na área: ${r.temp}°C`;
  } else if (r.gas != null && r.gas >= AREA_SENSOR_THRESHOLDS.gasWarning) {
    severity = 'low';
    message = `Nível de gás moderado na área: ${r.gas} ppm`;
  } else {
    return null;
  }

  return {
    id: `area-${r.id || index}`,
    treeId: 'area',
    type, severity, message,
    timestamp: r.created_at || new Date().toISOString(),
    resolved: false,
    temperature: r.temp,
    sensorData: r,
  };
}

export default function Dashboard() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [areaAlerts, setAreaAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    supabase.from('trees').select('*').then(({ data }) => {
      if (data) setTrees(data.map(mapDbTreeToFrontend));
    }).catch(() => {});

    supabase.from('sensor_readings').select('*').is('tree_id', null).limit(100)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const seen = new Map<string, Alert>();
          data
            .map((r: any, i: number) => sensorReadingToAlert(r, i))
            .filter(Boolean)
            .forEach((a: Alert) => {
              const key = `${a.type}-${a.severity}`;
              if (!seen.has(key)) seen.set(key, a);
            });
          setAreaAlerts([...seen.values()]);
        }
      }).catch(() => {});
  }, []);

  const allAlerts = [...mockAlerts, ...areaAlerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recentAlerts = allAlerts.slice(0, 8);
  const activeAlerts = allAlerts.filter(a => !a.resolved);
  const criticalTrees = trees.filter(t => t.status === 'critical');
  const warningTrees = trees.filter(t => t.status === 'warning');

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

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fire: 'Incêndio', temperature: 'Temperatura', offline: 'Offline', intrusion: 'Intrusão', area: 'Área',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors duration-300">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Árvores</p>
                <p className="text-3xl font-bold">{systemStats.totalTrees}</p>
              </div>
              <TreePine className="size-10 text-green-600" />
            </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <TrendingUp className="size-3 inline mr-1" />
              +12 este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sensores Ativos</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Ativos</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Área Monitorada</p>
                <p className="text-3xl font-bold">{systemStats.areaMonitored}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">hectares</p>
              </div>
              <Activity className="size-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* MAPA INTERATIVO */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              Localização das Árvores
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              {recentAlerts.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Nenhum alerta registrado.</p>
              ) : (
                recentAlerts.map((alert) => {
                  const isArea = alert.treeId === 'area';
                  const tree = isArea ? null : trees.find(t => {
                    const suffix = alert.treeId.replace('tree-', '');
                    return t.nfcId.endsWith(suffix);
                  });
                  return (
                    <div 
                      key={alert.id} 
                      className={`p-3 rounded-lg border ${alert.resolved ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        {getSeverityBadge(alert.severity)}
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-[10px]">{getAlertTypeLabel(alert.type)}</Badge>
                          {isArea && <Badge className="bg-teal-600 text-[10px]">Área</Badge>}
                          {alert.resolved && <CheckCircle2 className="size-4 text-green-600" />}
                        </div>
                      </div>
                      <p className="text-sm font-semibold mb-1">{alert.message}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {isArea ? 'Monitoramento de Área' : tree?.species}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleString('pt-BR') : '--'}
                      </p>
                    </div>
                  );
                })
              )}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">ID: {tree.nfcId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{tree.temperature}°C</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
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
