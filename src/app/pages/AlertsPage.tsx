import { useState, useEffect } from 'react';
import { AlertTriangle, Flame, Thermometer, WifiOff, Shield, CheckCircle2, Clock, Filter, Wind, TreePine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { mockAlerts } from '../data/mockData';
import type { Tree, Alert } from '../data/mockData';
import { supabase, mapDbTreeToFrontend } from '../../lib/supabase';
import TreeHistoryModal from '../components/TreeHistoryModal';

const AREA_SENSOR_THRESHOLDS = {
  tempCritical: 40,
  tempWarning: 30,
  gasCritical: 500,
  gasWarning: 120,
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
    type = 'fire';
    severity = 'critical';
    message = `Chama detectada pelo sensor! Temperatura: ${r.temp}°C`;
  } else if (isFireByAlarm) {
    type = 'fire';
    severity = 'critical';
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
    type,
    severity,
    message,
    timestamp: r.created_at || new Date().toISOString(),
    resolved: false,
    temperature: r.temp,
    sensorData: r,
  };
}

export default function AlertsPage() {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [trees, setTrees] = useState<Tree[]>([]);
  const [treeAlerts, setTreeAlerts] = useState<Alert[]>(mockAlerts);
  const [areaAlerts, setAreaAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    supabase.from('trees').select('*').then(({ data }) => {
      if (data) setTrees(data.map(mapDbTreeToFrontend));
    }).catch(() => { });

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
      }).catch(() => { });
  }, []);

  const allAlerts = [...treeAlerts, ...areaAlerts];
  const activeAlerts = allAlerts.filter(a => !a.resolved);
  const criticalAlerts = allAlerts.filter(a => !a.resolved && a.severity === 'critical');

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyTree, setHistoryTree] = useState<Tree | null>(null);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      case 'high': return <Badge className="bg-orange-600">Alto</Badge>;
      case 'medium': return <Badge className="bg-yellow-600">Médio</Badge>;
      case 'low': return <Badge variant="secondary">Baixo</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'fire': return <Flame className="size-5 text-red-600" />;
      case 'temperature': return <Thermometer className="size-5 text-orange-600" />;
      case 'offline': return <WifiOff className="size-5 text-gray-600" />;
      case 'intrusion': return <Shield className="size-5 text-purple-600" />;
      case 'area': return <Wind className="size-5 text-teal-600" />;
      default: return <AlertTriangle className="size-5 text-yellow-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = { fire: 'Incêndio', temperature: 'Temperatura', offline: 'Offline', intrusion: 'Intrusão', area: 'Área' };
    return labels[type] || type;
  };

  const markAsResolved = (alertId: string) => {
    if (alertId.startsWith('area-')) {
      setAreaAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
    } else {
      setTreeAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
    }
  };

  const markAsUnresolved = (alertId: string) => {
    if (alertId.startsWith('area-')) {
      setAreaAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: false } : a));
    } else {
      setTreeAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: false } : a));
    }
  };

  const handleViewHistory = (treeId: string) => {
    if (treeId === 'area') return;
    const selectedTree = trees.find(t => {
      const suffix = treeId.replace('tree-', '');
      return t.nfcId.endsWith(suffix);
    }) || null;
    if (selectedTree) {
      setHistoryTree(selectedTree);
      setIsHistoryOpen(true);
    }
  };

  const renderAlertCard = (alert: Alert) => {
    const isArea = alert.treeId === 'area';
    const tree = isArea ? null : trees.find(t => {
      const suffix = alert.treeId.replace('tree-', '');
      return t.nfcId.endsWith(suffix);
    });
    return (
      <Card key={alert.id} className={`${!alert.resolved ? 'border-l-4' : ''} ${alert.severity === 'critical' ? 'border-l-red-600 bg-red-50 dark:bg-red-900/20' :
        alert.severity === 'high' ? 'border-l-orange-600 bg-orange-50 dark:bg-orange-900/20' :
          alert.severity === 'medium' ? 'border-l-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' :
            'border-l-gray-400'
        }`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-3 rounded-full ${!alert.resolved ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {getSeverityBadge(alert.severity)}
                  <Badge variant="outline">{getTypeLabel(alert.type)}</Badge>
                  {isArea && <Badge className="bg-teal-600">Monitoramento de Área</Badge>}
                  {alert.resolved && (
                    <Badge className="bg-green-600"><CheckCircle2 className="size-3 mr-1" />Resolvido</Badge>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{alert.message}</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {isArea ? (
                    alert.sensorData && (
                      <>
                        <p><strong>Temperatura:</strong> {alert.sensorData.temp}°C</p>
                        <p><strong>Umidade:</strong> {alert.sensorData.umidade ?? '--'}%</p>
                        <p><strong>Gás (CO₂):</strong> {alert.sensorData.gas ?? '--'} ppm</p>
                        <p><strong>Status:</strong> {alert.sensorData.alarme ? 'Alarme ativo' : 'Normal'}</p>
                        <p><strong>Leitura:</strong> {alert.sensorData.msg}</p>
                      </>
                    )
                  ) : (
                    <>
                      <p><strong>Árvore:</strong> {tree?.species}</p>
                      <p><strong>ID NFC:</strong> {tree?.nfcId}</p>
                      <p><strong>Localização:</strong> {tree?.latitude}, {tree?.longitude}</p>
                      {alert.temperature && <p><strong>Temperatura detectada:</strong> <span className="text-red-600 font-bold">{alert.temperature}°C</span></p>}
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{alert.timestamp ? new Date(alert.timestamp).toLocaleString('pt-BR') : '--'}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {!alert.resolved && (
                <>
                  <Button variant="default" size="sm" onClick={() => markAsResolved(alert.id)}>Resolver</Button>
                  {!isArea && <Button variant="outline" size="sm" onClick={() => handleViewHistory(alert.treeId)}>Ver Histórico</Button>}
                </>
              )}
              {alert.resolved && (
                <>
                  <Button variant="outline" size="sm" onClick={() => markAsUnresolved(alert.id)}>Reativar</Button>
                  {!isArea && <Button variant="outline" size="sm" onClick={() => handleViewHistory(alert.treeId)}>Ver Histórico</Button>}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Central de Alertas</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitoramento e gerenciamento de alertas em tempo real</p>
      </div>

      <TreeHistoryModal tree={historyTree} isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Ativos</p>
                <p className="text-3xl font-bold text-red-600">{activeAlerts.length}</p>
              </div>
              <AlertTriangle className="size-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Críticos</p>
                <p className="text-3xl font-bold text-red-700">{criticalAlerts.length}</p>
              </div>
              <Flame className="size-10 text-red-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alertas de Área</p>
                <p className="text-3xl font-bold text-teal-600">{areaAlerts.length}</p>
              </div>
              <Wind className="size-10 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resolvidos Hoje</p>
                <p className="text-3xl font-bold text-green-600">3</p>
              </div>
              <CheckCircle2 className="size-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="fire">Incêndio</SelectItem>
                <SelectItem value="temperature">Temperatura</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="intrusion">Intrusão</SelectItem>
                <SelectItem value="area">Área</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de 2 Colunas: Árvores + Área */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Coluna 1: Alertas de Árvores */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <TreePine className="size-5 text-green-600" />
            Alertas de Árvores
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {treeAlerts
              .filter(a => filterType === 'all' || a.type === filterType)
              .filter(a => filterStatus === 'all' || (filterStatus === 'active' && !a.resolved) || (filterStatus === 'resolved' && a.resolved))
              .map(renderAlertCard)}
            {treeAlerts.filter(a => filterType === 'all' || a.type === filterType).filter(a => filterStatus === 'all' || (filterStatus === 'active' && !a.resolved) || (filterStatus === 'resolved' && a.resolved)).length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle2 className="size-10 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 font-semibold">Nenhum alerta de árvore encontrado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Coluna 2: Alertas de Área */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Wind className="size-5 text-teal-600" />
            Alertas de Área
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {areaAlerts
              .filter(a => filterType === 'all' || a.type === filterType)
              .filter(a => filterStatus === 'all' || (filterStatus === 'active' && !a.resolved) || (filterStatus === 'resolved' && a.resolved))
              .map(renderAlertCard)}
            {areaAlerts.filter(a => filterType === 'all' || a.type === filterType).filter(a => filterStatus === 'all' || (filterStatus === 'active' && !a.resolved) || (filterStatus === 'resolved' && a.resolved)).length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle2 className="size-10 text-teal-600 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 font-semibold">Nenhum alerta de área no momento</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Conecte o Arduino na página de validação para gerar leituras.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Protocolos de Resposta */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50">
        <CardHeader>
          <CardTitle className="text-lg">Protocolos de Resposta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="size-5 text-red-600" />
                <h4 className="font-bold">Alerta de Incêndio</h4>
              </div>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Acionar equipe de combate imediatamente</li>
                <li>Notificar autoridades ambientais</li>
                <li>Isolar área afetada</li>
                <li>Documentar extensão do dano</li>
              </ol>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="size-5 text-orange-600" />
                <h4 className="font-bold">Temperatura Elevada</h4>
              </div>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Verificar leituras de árvores vizinhas</li>
                <li>Enviar equipe para inspeção visual</li>
                <li>Aumentar frequência de monitoramento</li>
                <li>Preparar recursos preventivos</li>
              </ol>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <WifiOff className="size-5 text-gray-600" />
                <h4 className="font-bold">Sensor Offline</h4>
              </div>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Verificar status de conectividade</li>
                <li>Agendar manutenção técnica</li>
                <li>Monitorar árvores próximas</li>
                <li>Substituir bateria se necessário</li>
              </ol>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="size-5 text-purple-600" />
                <h4 className="font-bold">Intrusão Detectada (A ser implementado)</h4>
              </div>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Revisar gravações de movimento</li>
                <li>Notificar equipe de segurança</li>
                <li>Verificar integridade da árvore</li>
                <li>Reforçar monitoramento da área</li>
              </ol>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="size-5 text-teal-600" />
                <h4 className="font-bold">Alerta de Área</h4>
              </div>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Analisar leituras dos sensores da estação USB</li>
                <li>Comparar com dados de árvores vizinhas</li>
                <li>Enviar equipe para inspeção local</li>
                <li>Verificar condições ambientais gerais</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
