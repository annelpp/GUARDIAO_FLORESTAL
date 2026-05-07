import { useState, useEffect } from 'react';
import { AlertTriangle, Flame, Thermometer, WifiOff, Shield, CheckCircle2, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { mockAlerts, mockTrees, Tree } from '../data/mockData';
import TreeHistoryModal from '../components/TreeHistoryModal';

export default function AlertsPage() {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [trees, setTrees] = useState<Tree[]>([]);
  useEffect(() => {
    const savedTrees = localStorage.getItem('@CercaDigital:trees');
    if (savedTrees) {
      setTrees(JSON.parse(savedTrees));
    } else {
      setTrees(mockTrees);
    }
  }, []);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyTree, setHistoryTree] = useState<Tree | null>(null);

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && !alert.resolved) ||
                         (filterStatus === 'resolved' && alert.resolved);
    return matchesType && matchesStatus;
  });

  const activeAlerts = mockAlerts.filter(a => !a.resolved);
  const criticalAlerts = mockAlerts.filter(a => !a.resolved && a.severity === 'critical');

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'high':
        return <Badge className="bg-orange-600">Alto</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600">Médio</Badge>;
      case 'low':
        return <Badge variant="secondary">Baixo</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'fire':
        return <Flame className="size-5 text-red-600" />;
      case 'temperature':
        return <Thermometer className="size-5 text-orange-600" />;
      case 'offline':
        return <WifiOff className="size-5 text-gray-600" />;
      case 'intrusion':
        return <Shield className="size-5 text-purple-600" />;
      default:
        return <AlertTriangle className="size-5 text-yellow-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fire: 'Incêndio',
      temperature: 'Temperatura',
      offline: 'Offline',
      intrusion: 'Intrusão',
    };
    return labels[type] || type;
  };

  const markAsResolved = (alertId: string) => {
    console.log('Marcar alerta como resolvido:', alertId);
    // Aqui implementaria a lógica real
  };

  const handleViewHistory = (treeId: string) => {
     const selectedTree = trees.find(t => t.id === treeId) || null;
     if(selectedTree) {
       setHistoryTree(selectedTree);
       setIsHistoryOpen(true);
     } else {
        console.error("Arvore nao encontrada");
     }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Central de Alertas</h1>
        <p className="text-gray-600">Monitoramento e gerenciamento de alertas em tempo real</p>
      </div>

       {/* 5. Inject the Tree History Modal */}
      <TreeHistoryModal 
        tree={historyTree} 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertas Ativos</p>
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
                <p className="text-sm text-gray-600">Críticos</p>
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
                <p className="text-sm text-gray-600">Resolvidos Hoje</p>
                <p className="text-3xl font-bold text-green-600">3</p>
              </div>
              <CheckCircle2 className="size-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-3xl font-bold">12min</p>
              </div>
              <Clock className="size-10 text-blue-600" />
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

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const tree = trees.find(t => t.id === alert.treeId);
          return (
            <Card 
              key={alert.id} 
              className={`${!alert.resolved ? 'border-l-4' : ''} ${
                alert.severity === 'critical' ? 'border-l-red-600 bg-red-50' :
                alert.severity === 'high' ? 'border-l-orange-600 bg-orange-50' :
                alert.severity === 'medium' ? 'border-l-yellow-600 bg-yellow-50' :
                'border-l-gray-400'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-full ${
                      !alert.resolved ? 'bg-white' : 'bg-gray-100'
                    }`}>
                      {getAlertIcon(alert.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getSeverityBadge(alert.severity)}
                        <Badge variant="outline">{getTypeLabel(alert.type)}</Badge>
                        {alert.resolved && (
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="size-3 mr-1" />
                            Resolvido
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-lg mb-1">{alert.message}</h3>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Árvore:</strong> {tree?.species}</p>
                        <p><strong>ID NFC:</strong> {tree?.nfcId}</p>
                        <p>
                          <strong>Localização:</strong> {tree?.latitude}, {tree?.longitude}
                        </p>
                        {alert.temperature && (
                          <p>
                            <strong>Temperatura detectada:</strong>{' '}
                            <span className="text-red-600 font-bold">{alert.temperature}°C</span>
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

<div className="flex flex-col gap-2">
                    {!alert.resolved && (
                      <>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => markAsResolved(alert.id)}
                        >
                          Resolver
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewHistory(alert.treeId)}>
                          Ver Histórico
                        </Button>
                      </>
                    )}
                    {alert.resolved && (
                      <Button variant="outline" size="sm" onClick={() => handleViewHistory(alert.treeId)}>
                        Ver Histórico
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold mb-2">Nenhum alerta encontrado</p>
            <p className="text-sm text-gray-500">Todos os alertas com os filtros aplicados foram resolvidos ou não existem.</p>
          </CardContent>
        </Card>
      )}

      {/* Protocolos de Resposta */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Protocolos de Resposta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
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

            <div className="bg-white rounded-lg p-4">
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

            <div className="bg-white rounded-lg p-4">
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

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="size-5 text-purple-600" />
                <h4 className="font-bold">Intrusão Detectada</h4>
              </div>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Revisar gravações de movimento</li>
                <li>Notificar equipe de segurança</li>
                <li>Verificar integridade da árvore</li>
                <li>Reforçar monitoramento da área</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}