import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { AlertTriangle, ShieldCheck, ThermometerSnowflake, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Tree } from '../data/mockData';

interface TreeHistoryModalProps {
  tree: Tree | null;
  isOpen: boolean;
  onClose: () => void;
}

interface HistoryEvent {
  id: string;
  type: 'validation' | 'alert';
  date: Date;
  title: string;
  description: string;
  author: string;
  temperature: number | null;
  severity?: string;
}

export default function TreeHistoryModal({ tree, isOpen, onClose }: TreeHistoryModalProps) {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tree || !isOpen) {
      setEvents([]);
      return;
    }

    setLoading(true);
    Promise.all([
      (async () => {
        const { data: direct } = await supabase.from('validations').select('*').eq('tree_id', tree.id);
        const { data: fallback } = await supabase.from('validations').select('*').is('tree_id', null).eq('inspection_data->>tree_nfc_id', tree.nfcId);
        return [...(direct || []), ...(fallback || [])];
      })(),
      supabase.from('alerts').select('*').eq('tree_id', tree.id).then(r => r.data || []),
    ]).then(([validations, alerts]) => {
      const validationEvents: HistoryEvent[] = (validations || []).map((v: any) => ({
        id: v.id,
        type: 'validation',
        date: new Date(v.created_at),
        title: `Validação em Campo - ${
          v.status === 'approved' ? 'Aprovada' : v.status === 'pending' ? 'Pendente' : 'Rejeitada'
        }`,
        description: v.notes || '',
        author: v.fiscal_name || 'Desconhecido',
        temperature: v.sensor_snapshot?.temp ?? null,
      }));

      const alertEvents: HistoryEvent[] = (alerts || []).map((a: any) => ({
        id: a.id,
        type: 'alert',
        date: new Date(a.created_at || a.resolved_at),
        title: `Alerta: ${
          a.type === 'fire' ? 'Incêndio' : a.type === 'temperature' ? 'Temperatura' : a.type === 'intrusion' ? 'Intrusão' : 'Offline'
        }`,
        description: a.message || '',
        author: 'Sensor ESP32',
        temperature: a.temperature ?? null,
        severity: a.severity,
      }));

      setEvents([...validationEvents, ...alertEvents]
        .sort((a, b) => b.date.getTime() - a.date.getTime()));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [tree, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 border-b pb-4">
            <Activity className="size-5 text-blue-600" />
            Histórico da Árvore: {tree?.species}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border mb-6">
            <div>
              <p className="text-sm text-gray-500">ID NFC</p>
              <p className="font-mono font-semibold">{tree?.nfcId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Data de Registro</p>
              <p className="font-semibold">{tree?.registrationDate ? new Date(tree.registrationDate).toLocaleDateString('pt-BR') : '-'}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">
              <p>Carregando histórico...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>Nenhum evento registrado no histórico desta árvore ainda.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-200 ml-4 pl-6 space-y-8">
              {events.map((event, index) => (
                <div key={`${event.type}-${event.id}-${index}`} className="relative">
                  <div className={`absolute -left-[35px] p-1.5 rounded-full border-2 border-white ${
                    event.type === 'alert' 
                      ? event.severity === 'critical' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}>
                    {event.type === 'alert' ? <AlertTriangle className="size-4" /> : <ShieldCheck className="size-4" />}
                  </div>

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
                      
                      {event.temperature != null && (
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
