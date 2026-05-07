import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { AlertTriangle, ShieldCheck, ThermometerSnowflake, Activity } from 'lucide-react';
import { mockAlerts, mockValidations, Tree } from '../data/mockData';

interface TreeHistoryModalProps {
  tree: Tree | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TreeHistoryModal({ tree, isOpen, onClose }: TreeHistoryModalProps) {
  if (!tree) return null;

  // 1. Buscamos todas as validações dessa árvore
  const treeValidations = mockValidations.filter(v => v.treeId === tree.id).map(v => ({
    id: v.id,
    type: 'validation',
    date: new Date(v.timestamp),
    title: `Validação em Campo - ${v.status === 'approved' ? 'Aprovada' : 'Pendente'}`,
    description: v.notes,
    author: v.fiscalName,
    temperature: v.temperature,
    status: v.status
  }));

  // 2. Buscamos todos os alertas dessa árvore
  const treeAlerts = mockAlerts.filter(a => a.treeId === tree.id).map(a => ({
    id: a.id,
    type: 'alert',
    date: new Date(a.timestamp),
    title: `Alerta: ${a.type === 'fire' ? 'Incêndio' : a.type === 'temperature' ? 'Temperatura' : a.type === 'intrusion' ? 'Intrusão' : 'Offline'}`,
    description: a.message,
    author: 'Sensor ESP32',
    temperature: a.temperature,
    severity: a.severity
  }));

  // 3. Juntamos tudo e ordenamos do mais recente para o mais antigo
  const historyEvents = [...treeValidations, ...treeAlerts].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 border-b pb-4">
            <Activity className="size-5 text-blue-600" />
            Histórico da Árvore: {tree.species}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border mb-6">
            <div>
              <p className="text-sm text-gray-500">ID NFC</p>
              <p className="font-mono font-semibold">{tree.nfcId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Data de Registro</p>
              <p className="font-semibold">{new Date(tree.registrationDate).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {historyEvents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>Nenhum evento registrado no histórico desta árvore ainda.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-200 ml-4 pl-6 space-y-8">
              {historyEvents.map((event, index) => (
                <div key={`${event.type}-${event.id}-${index}`} className="relative">
                  {/* Ícone da Linha do Tempo */}
                  <div className={`absolute -left-[35px] p-1.5 rounded-full border-2 border-white ${
                    event.type === 'alert' 
                      ? event.severity === 'critical' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}>
                    {event.type === 'alert' ? <AlertTriangle className="size-4" /> : <ShieldCheck className="size-4" />}
                  </div>

                  {/* Card do Evento */}
                  <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-gray-800">{event.title}</h4>
                      <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                        {event.date.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 border-t pt-3 mt-2">
                      <Badge variant="outline" className="text-gray-600 bg-gray-50">
                        {event.type === 'alert' ? 'Detectado por: ' : 'Fiscal: '} 
                        <span className="font-semibold ml-1">{event.author}</span>
                      </Badge>
                      
                      {event.temperature && event.temperature > 0 && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 flex items-center gap-1">
                          <ThermometerSnowflake className="size-3" />
                          {event.temperature}°C
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}