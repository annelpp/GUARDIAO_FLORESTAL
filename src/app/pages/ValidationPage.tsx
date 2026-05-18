import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import {
  Smartphone, CheckCircle2, MapPin, Thermometer,
  Clock, User, FileText, AlertTriangle, Droplets,
  Wind, Usb, ShieldCheck, Flame, Info, Terminal, Activity,
  CheckSquare, RefreshCw, Check, ChevronsUpDown, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../components/ui/alert-dialog';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cn } from '../components/ui/utils';
import { Tree, ValidationRecord } from '../data/mockData';
import { supabase, mapDbTreeToFrontend } from '../../lib/supabase';
import { toast } from '../../lib/toast';

// ==========================================
// FUNÇÕES AUXILIARES (FORA DO COMPONENTE)
// ==========================================

/**
 * Dispara o feedback sonoro de forma segura.
 * Colocada fora para evitar recriações de escopo e garantir estabilidade.
 */
const playFeedback = (type: 'success' | 'error') => {
  try {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.5;
    // O catch é essencial para que o erro de áudio não trave o restante da função chamadora
    audio.play().catch(e => console.warn("Aviso: Áudio bloqueado ou não encontrado.", e));
  } catch (err) {
    console.error("Erro crítico ao tentar reproduzir som:", err);
  }
};

// Formata a linha do console em algo legível para não-técnicos
function formatLogLine(raw: string): string {
  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const d = JSON.parse(raw);
      const partes: string[] = [];
      if (typeof d.temp === 'number') partes.push(`Temp: ${d.temp.toFixed(1)}°C`);
      if (typeof d.umidade === 'number') partes.push(`Umidade: ${d.umidade.toFixed(0)}%`);
      if (typeof d.gas === 'number') partes.push(`Gás: ${d.gas}`);
      partes.push(d.alarme ? '🚨 ALARME ATIVO' : 'Sem alarme');
      if (d.msg) partes.push(`(${d.msg})`);
      return partes.join('  |  ');
    } catch (_e) { /* fallback */ }
  }
  return raw;
}

// Interface atualizada para acomodar os dados vindos fisicamente do Arduino
interface SensorData {
  temp: number | null;
  gasStatus: string;
  alarme: boolean;
  msg: string;
  gas: number | null;
  fogo: number | null;
  umidade: number | null;
}

const fiscaisList = [
  { id: 'FIS-001', name: 'Adenilson Prestes' },
  { id: 'FIS-002', name: 'Alef Barrozo' },
  { id: 'FIS-003', name: 'Ana Costa' },
  { id: 'FIS-004', name: 'Anne Pereira' },
  { id: 'FIS-005', name: 'Brendo Freitas' },
  { id: 'FIS-006', name: 'Carlos Santos' },
  { id: 'FIS-007', name: 'Cecília Colares' },
  { id: 'FIS-008', name: 'Cibely Dácio' },
  { id: 'FIS-009', name: 'Eduarda Bomfim' },
  { id: 'FIS-010', name: 'Gabriel Costa' },
  { id: 'FIS-011', name: 'Gabriella Marciao' },
  { id: 'FIS-012', name: 'Gustavo Bichara' },
  { id: 'FIS-013', name: 'Hugo Monteiro' },
  { id: 'FIS-014', name: 'João Torres' },
  { id: 'FIS-015', name: 'João Menezes' },
  { id: 'FIS-016', name: 'João Ferreira' },
  { id: 'FIS-017', name: 'Larissa Vieira' },
  { id: 'FIS-018', name: 'Lauriene Rufino' },
  { id: 'FIS-019', name: 'Lucas Teixeira' },
  { id: 'FIS-020', name: 'Lucas Silva' },
  { id: 'FIS-021', name: 'Lucas Vasconcelos' },
  { id: 'FIS-022', name: 'Lucas Freitas' },
  { id: 'FIS-023', name: 'Lucas Salomão' },
  { id: 'FIS-024', name: 'Marcos Souza' },
  { id: 'FIS-025', name: 'Matheus Tavares' },
  { id: 'FIS-026', name: 'Micael Barrozo' },
  { id: 'FIS-027', name: 'Randrews Reis' },
  { id: 'FIS-028', name: 'Rômulo Araújo' },
  { id: 'FIS-029', name: 'Sérgio Nascimento' },
  { id: 'FIS-030', name: 'Vinicius Souza' },
  { id: 'FIS-031', name: 'Vinicius Souza' },
  { id: 'FIS-032', name: 'Vitor Monteiro' },
  { id: 'FIS-033', name: 'Vitória Pereira' },
];

export default function ValidationPage() {
  // ==========================================
  // ESTADO: ROTAS E URL PARAMETERS (NFC)
  // ==========================================
  const [searchParams] = useSearchParams();
  const treeIdFromUrl = searchParams.get('treeId');

  // ==========================================
  // ESTADO 1: MONITORAMENTO DE ÁREA (ARDUINO FÍSICO)
  // ==========================================
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({
    temp: null,
    gasStatus: 'Aguardando...',
    alarme: false,
    msg: 'Monitoramento inativo',
    gas: null,
    fogo: null,
    umidade: null,
  });

  const [serialError, setSerialError] = useState<string>('');
  const [serialLogs, setSerialLogs] = useState<string[]>([]);
  const [sensorHistory, setSensorHistory] = useState<{ temp: number | null; gasStatus: string; alarme: boolean; msg: string; recorded_at: string; gas: number | null; fogo: number | null; umidade: number | null }[]>([]);

  const logEndRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<any>(null);
  const portRef = useRef<any>(null);
  const auditoriaRef = useRef<HTMLDivElement>(null);

  // === EFEITO DE ROLAGEM AUTOMÁTICA ===
  useEffect(() => {
    if (treeIdFromUrl && auditoriaRef.current) {
      setTimeout(() => {
        auditoriaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }, [treeIdFromUrl]);

  // Captura snapshots dos sensores no histórico + salva no Supabase
  useEffect(() => {
    if (isConnected && sensorData && sensorData.temp !== null) {
      const snapshot = { ...sensorData, gas: sensorData.gas, fogo: sensorData.fogo, umidade: sensorData.umidade, recorded_at: new Date().toISOString() };
      setSensorHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && last.temp === sensorData.temp && last.alarme === sensorData.alarme) return prev;
        return [...prev, snapshot];
      });
      supabase.from('sensor_readings').insert({
        tree_id: null,
        temp: sensorData.temp,
        umidade: sensorData.umidade,
        gas: sensorData.gas,
        alarme: sensorData.alarme,
        fogo: sensorData.fogo,
        msg: sensorData.msg,
      }).then().catch(() => { });
    }
  }, [sensorData, isConnected]);

  // ==========================================
  // CARGA INICIAL DO SUPABASE
  // ==========================================
  useEffect(() => {
    supabase.from('trees').select('id, nfc_id, species')
      .then(({ data }) => {
        if (data) setDbTrees(data);
      })
      .catch(() => { });

    supabase.from('validations').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped: ValidationRecord[] = data.map((r: any) => ({
            id: r.id,
            treeId: r.tree_id,
            fiscalName: r.fiscal_name,
            timestamp: r.created_at,
            nfcVerified: r.nfc_verified,
            sensorVerified: r.sensor_snapshot?.sensorVerified ?? false,
            temperature: r.sensor_snapshot?.temperature ?? 0,
            location: r.inspection_data?.location ?? '',
            notes: r.notes ?? '',
            status: r.status,
            _treeSpecies: r.inspection_data?.tree_species ?? '',
            _treeNfcId: r.inspection_data?.tree_nfc_id ?? '',
          }));
          setValidationHistory(mapped);
        }
      })
      .catch(() => { });

    supabase.from('sensor_readings').select('*').limit(100)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSensorHistory(data.map((r: any) => ({
            temp: r.temp,
            gasStatus: r.gas != null ? (r.fogo ? `Fogo: ${r.fogo}` : r.gas <= 200 ? `Gás: ${r.gas}` : `Gás: ${r.gas}`) : '--',
            alarme: r.alarme ?? false,
            msg: r.msg ?? '',
            recorded_at: r.created_at || new Date().toISOString(),
            gas: r.gas,
            fogo: r.fogo,
            umidade: r.umidade,
          })).reverse());
        }
      })
      .catch(() => { });
  }, []);

  // ==========================================
  // ESTADO 2: AUDITORIA DE ÁRVORE (NFC + HUMANO)
  // ==========================================
  const [treeStep, setTreeStep] = useState<'idle' | 'nfc' | 'inspection'>('idle');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [fiscalName, setFiscalName] = useState('');
  const [fiscalId, setFiscalId] = useState('');
  const [validationHistory, setValidationHistory] = useState<ValidationRecord[]>([]);
  const [fiscalOpen, setFiscalOpen] = useState(false);
  const [fiscalSearch, setFiscalSearch] = useState('');
  const [expandedValId, setExpandedValId] = useState<string | null>(null);
  const [expandedSnapIdx, setExpandedSnapIdx] = useState<number | null>(null);
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);

  const clearSensorHistory = () => {
    setSensorHistory([]);
    supabase.from('sensor_readings').delete().neq('id', 0).then().catch(() => { });
    setClearHistoryOpen(false);
  };
  const fiscalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (fiscalRef.current && !fiscalRef.current.contains(e.target as Node)) {
        setFiscalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredFiscais = fiscaisList.filter(f =>
    f.name.toLowerCase().includes(fiscalSearch.toLowerCase()) ||
    f.id.toLowerCase().includes(fiscalSearch.toLowerCase())
  );
  const [notes, setNotes] = useState('');
  const [nfcVerified, setNfcVerified] = useState(false);

  const [inspectionData, setInspectionData] = useState({
    trunkCondition: '', foliageHealth: '', soilCondition: '', nfcTagIntegrity: '',
    visualDamage: false, pestsSigns: false, illegalCutSigns: false,
    fireRiskLevel: '', currentDiameter: '', currentHeight: '', weatherCondition: '',
    soilMoisture: '', photosCount: 0,
  });

  // Lógica para Cálculo de Biomassa Acima do Solo (AGB - Above Ground Biomass)
  // Utiliza uma fórmula genérica simplificada: 0.05 * (Diâmetro^2) * Altura
  const calcularBiomassa = (diametroCm: string, alturaM: string) => {
    const d = parseFloat(diametroCm);
    const h = parseFloat(alturaM);
    if (isNaN(d) || isNaN(h) || d <= 0 || h <= 0) return null;

    const biomassaKg = 0.05 * Math.pow(d, 2) * h;
    // Retorna em Toneladas (t) se for muito grande, ou Quilogramas (kg)
    return biomassaKg > 1000
      ? `${(biomassaKg / 1000).toFixed(2)} t`
      : `${biomassaKg.toFixed(2)} kg`;
  };

  const [localTrees, setLocalTrees] = useState<Tree[]>([]);
  const [dbTrees, setDbTrees] = useState<{ id: string; nfc_id: string; species: string }[]>([]);
  const fullTreeData = localTrees.find(t => t.id === selectedTreeId);

  useEffect(() => {
    supabase.from('trees').select('*').then(({ data }) => {
      if (data) {
        const mapped = data.map(mapDbTreeToFrontend);
        setLocalTrees(mapped);
        setDbTrees(data.map((r: any) => ({ id: r.id, nfc_id: r.nfc_id, species: r.species })));
      }
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (treeIdFromUrl && localTrees.some(t => t.id === treeIdFromUrl)) {
      setSelectedTreeId(treeIdFromUrl);
    }
  }, [treeIdFromUrl, localTrees]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialLogs]);


  // ==========================================
  // LÓGICA DO ARDUINO FÍSICO VIA CABO USB-C
  // ==========================================
  const connectPhysicalSensor = async () => {
    try {
      if (!('serial' in navigator)) {
        setSerialError('Seu navegador/dispositivo não suporta conexão USB Serial. No Android, ative a flag "Web Serial API" no Chrome.');
        return;
      }

      const port = await (navigator as any).serial.requestPort();
      // O BaudRate deve ser EXATAMENTE igual ao Serial.begin(115200) do seu main.cpp do Arduino
      await port.open({ baudRate: 115200 });

      portRef.current = port;
      setIsConnected(true);
      setSerialError('');
      setSerialLogs(['> Conexão Física Estabelecida. Aguardando dados do ESP32/Arduino...']);

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }

        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          // Guarda o pedaço final que pode estar cortado para o próximo ciclo
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;

            const timestamp = new Date().toLocaleTimeString('pt-BR');
            let logMsg = cleanLine;

            // Variáveis para rastrear o que foi explicitamente parseado nesta linha
            let parsedTemp: number | null = null;
            let parsedGas: string | null = null;
            let parsedAlarm: boolean | null = null;
            let parsedMsg: string | null = null;
            let dataReceived = false;

            // === TENTA FORMATO JSON PRIMEIRO (mesmo formato da HardwareTestPage) ===
            if (cleanLine.startsWith('{') && cleanLine.endsWith('}')) {
              try {
                const json = JSON.parse(cleanLine);
                if (typeof json.temp === 'number') {
                  parsedTemp = json.temp;
                  dataReceived = true;
                  if (json.temp >= 30) {
                    playFeedback('error');
                    toast.error("Alerta Crítico: Calor Extremo", { description: "Temperatura acima de 40°C no perímetro." });
                  }
                }
                if (typeof json.gas === 'number') {
                  if (json.gas >= 500) {
                    parsedGas = "FUMAÇA DETECTADA!";
                    parsedAlarm = true;
                    parsedMsg = "Fogo ou fumaça densa identificados!";
                    playFeedback('error');
                    toast.error("PERIGO DE INCÊNDIO", { description: "Concentração letal de fumaça detectada.", duration: Infinity });
                  } else if (json.gas > 119) {
                    parsedGas = "Aviso: Nível Médio";
                    parsedMsg = "Indícios de fumaça na área";
                  } else {
                    parsedGas = "Normal";
                    if (parsedAlarm !== true) {
                      parsedAlarm = false;
                      parsedMsg = "Perímetro estabilizado";
                    }
                  }
                  dataReceived = true;
                }
                if (typeof json.fogo === 'number' && json.fogo === 1) {
                  parsedAlarm = true;
                  parsedMsg = "CHAMA DETECTADA!";
                  playFeedback('error');
                  toast.error("PERIGO DE INCÊNDIO", { description: "Chama detectada pelo sensor!", duration: Infinity });
                  dataReceived = true;
                }
              } catch (_e) {
                // JSON inválido — cai no parser de texto abaixo
              }
            }

            // === FALLBACK: FORMATO TEXTO (Temperatura:XX.XX°C|, GAS NORMAL, etc.) ===
            if (!dataReceived) {
              if (cleanLine.includes("Temperatura:")) {
                const tempStr = cleanLine.split("Temperatura:")[1]?.split("°C")[0];
                if (tempStr) {
                  const tempVal = parseFloat(tempStr);
                  if (!isNaN(tempVal)) {
                    parsedTemp = tempVal;
                    dataReceived = true;
                    if (tempVal >= 30) {
                      playFeedback('error');
                      toast.error("Alerta Crítico: Calor Extremo", { description: "Temperatura acima de 40°C no perímetro." });
                    }
                  }
                }
              }

              if (cleanLine.includes("PERIGO: INCÊNDIO DETECTADO")) {
                parsedGas = "FUMAÇA DETECTADA!";
                parsedAlarm = true;
                parsedMsg = "Fogo ou fumaça densa identificados!";
                dataReceived = true;
                playFeedback('error');
                toast.error("PERIGO DE INCÊNDIO", { description: "Concentração letal de fumaça detectada.", duration: Infinity });
              }
              else if (cleanLine.includes("Indícios de fumaça detectados")) {
                parsedGas = "Aviso: Nível Médio";
                dataReceived = true;
                toast.warning("Atenção Perímetro", { description: "Indícios de fumaça identificados na área." });
              }
              else if (cleanLine.includes("GAS NORMAL")) {
                parsedGas = "Normal";
                parsedAlarm = false;
                parsedMsg = "Perímetro estabilizado";
                dataReceived = true;
              }
            }

            // Atualiza o Console de Logs com o ícone adequado
            const hasAlarm = parsedAlarm === true;
            const icone = hasAlarm ? '⚠️ PERIGO' : '🟢 OK';
            logMsg = `[Físico] ${formatLogLine(cleanLine)}`;

            // Atualiza o estado com updater funcional para evitar closures estagnadas
            if (dataReceived) {
              setSensorData(prev => ({
                ...prev,
                temp: parsedTemp !== null ? parsedTemp : prev.temp,
                gasStatus: parsedGas !== null ? parsedGas : prev.gasStatus,
                alarme: parsedAlarm !== null ? parsedAlarm : prev.alarme,
                msg: parsedMsg !== null ? parsedMsg : prev.msg,
                gas: parsedTemp !== null && cleanLine.startsWith('{') ? (JSON.parse(cleanLine).gas ?? prev.gas) : prev.gas,
                fogo: parsedTemp !== null && cleanLine.startsWith('{') ? (JSON.parse(cleanLine).fogo ?? prev.fogo) : prev.fogo,
                umidade: parsedTemp !== null && cleanLine.startsWith('{') ? (JSON.parse(cleanLine).umidade ?? prev.umidade) : prev.umidade,
              }));
            } else {
              // Mesmo sem conseguir parsear, marca o monitoramento como ativo
              setSensorData(prev =>
                prev.msg === 'Monitoramento inativo'
                  ? { ...prev, msg: 'Monitoramento ativo' }
                  : prev
              );
            }

            // Limita o log a 50 linhas para não travar a memória do celular
            setSerialLogs(prev => [...prev.slice(-49), `[${timestamp}] ${logMsg}`]);
          }
        }
      }

    } catch (err: any) {
      if (err.message.includes("No port selected")) {
        setSerialError("Seleção de dispositivo cancelada.");
      } else if (err.message.includes("Failed to open") || err.message.includes("Access denied")) {
        setSerialError("A porta COM está ocupada (Feche a IDE do Arduino ou VS Code).");
      } else {
        setSerialError(`Erro de conexão USB: ${err.message}`);
      }
      setIsConnected(false);
    }
  };

  const disconnectSensor = async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
      }
    } catch (_e) { /* reader já cancelado */ }
    try {
      if (portRef.current) {
        await portRef.current.close();
      }
    } catch (_e) { /* porta já fechada */ }
    readerRef.current = null;
    portRef.current = null;
    setIsConnected(false);
    setSensorData({ temp: null, gasStatus: 'Aguardando...', alarme: false, msg: 'Monitoramento inativo' });
    setSerialLogs(prev => [...prev, '> Cabo USB Desconectado.']);
  };

  // Cleanup apenas no desmonte do componente, sem interferir em desconexões manuais
  useEffect(() => {
    return () => { disconnectSensor(); };
  }, []);

  const clearLogs = () => {
    setSerialLogs([]);
  };

  // ==========================================
  // LÓGICA DA ÁRVORE (NFC + INSPEÇÃO)
  // ==========================================
  const startTreeValidation = () => {
    if (!fiscalName || !fiscalId || !selectedTreeId) return;

    if (treeIdFromUrl) {
      setNfcVerified(true);
      setTreeStep('inspection');
      playFeedback('success');
      toast.success("Acesso via NFC detectado!");
    } else {
      setTreeStep('nfc');
      setTimeout(() => {
        setNfcVerified(true);
        setTreeStep('inspection');
        playFeedback('success');
        toast.success("Tag NFC lida com sucesso!");
      }, 1500);
    }
  };

  const resetTreeValidation = () => {
    setTreeStep('idle');
    // Só reseta a árvore se ELA NÃO VEIO PELA URL NFC ATENÇÃO AQUI HEIN
    if (!treeIdFromUrl) {
      setSelectedTreeId(null);
    }
    setNfcVerified(false);
    setNotes('');
    setInspectionData({
      trunkCondition: '', foliageHealth: '', soilCondition: '', nfcTagIntegrity: '',
      visualDamage: false, pestsSigns: false, illegalCutSigns: false,
      fireRiskLevel: '', currentDiameter: '', currentHeight: '', weatherCondition: '',
      soilMoisture: '', photosCount: 0,
    });
  };

  // ==========================================
  // FINALIZAÇÃO DA AUDITORIA
  // ==========================================
  const submitValidation = () => {
    let finalStatus: 'approved' | 'rejected' | 'pending' = 'approved';

    if (
      inspectionData.illegalCutSigns ||
      (sensorData && sensorData.alarme === true)
    ) {
      finalStatus = 'rejected';
    }

    const newRecord: ValidationRecord = {
      id: `val-${Date.now()}`,
      treeId: selectedTreeId!,
      fiscalName,
      timestamp: new Date().toISOString(),
      nfcVerified,
      sensorVerified: sensorData?.alarme === false,
      temperature: sensorData?.temp ?? 0,
      location: fullTreeData?.location || '',
      notes,
      status: finalStatus,
    };

    setValidationHistory(prev => [newRecord, ...prev]);

    (async () => {
      const { error } = await supabase.from('validations').insert({
        tree_id: selectedTreeId,
        fiscal_name: fiscalName,
        fiscal_id: fiscalId,
        nfc_verified: nfcVerified,
        sensor_snapshot: {
          sensorVerified: sensorData?.alarme === false,
          temperature: sensorData?.temp ?? 0,
        },
        inspection_data: {
          location: fullTreeData?.location || '',
          tree_species: fullTreeData?.species || '',
          tree_nfc_id: fullTreeData?.nfcId || '',
          ...inspectionData,
        },
        biomass_calculated: calcularBiomassa(inspectionData.currentDiameter, inspectionData.currentHeight),
        notes,
        photos_count: inspectionData.photosCount,
        status: finalStatus,
      });
      if (error) console.error('Erro ao salvar validação no Supabase:', error);
    })();

    try {
      if (finalStatus === 'approved') {
        playFeedback('success');
        toast.success("Certificado Emitido!", {
          description: "Árvore aprovada e dados salvos no sistema.",
          duration: 4000,
        });
      } else {
        playFeedback('error');
        toast.error("Alerta de Irregularidade!", {
          description: "Relatório salvo com status de REJEITADO.",
          duration: 5000,
        });
      }
    } catch (e) {
      console.warn("Falha no feedback:", e);
    } finally {
      resetTreeValidation();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="text-green-600 size-8" /> Central de Operações em Campo
        </h1>
        <p className="text-gray-600">Monitore o perímetro ligando o cabo USB-C e realize auditorias individuais (NFC).</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:items-start">

        {/* ========================================== */}
        {/* COLUNA ESQUERDA: ESTAÇÃO DE ÁREA (ARDUINO FÍSICO) */}
        {/* ========================================== */}
        <Card className="border-blue-200 bg-slate-50 shadow-md static lg:sticky lg:top-6 h-fit z-10">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg pb-4">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2"><Activity className="size-5" /> Estação de Área (Física via USB)</span>
              {isConnected ? (
                <Badge variant="outline" className="bg-green-500/20 text-white border-none animate-pulse">Online</Badge>
              ) : (
                <Badge variant="secondary" className="bg-white/20 text-white">Offline</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {!isConnected ? (
              <div className="space-y-3 text-center py-6">
                <Usb className="size-12 mx-auto text-blue-300" />
                <p className="text-sm text-slate-600 px-4">Conecte o Arduino/ESP32 à porta USB do seu dispositivo (PC ou Celular Android) para ler os sensores em campo.</p>
                {serialError && <p className="text-sm text-red-600 font-bold">{serialError}</p>}
                <Button onClick={connectPhysicalSensor} className="bg-blue-600 hover:bg-blue-700 w-full mt-2 h-12 text-md">
                  Conectar Cabo USB-C
                </Button>
              </div>
            ) : (
              <div className="space-y-4">

                {/* 1. CABEÇALHO DO STATUS */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sensorData?.alarme ? (
                      <AlertTriangle className="size-5 text-red-600" />
                    ) : sensorData?.temp !== null && sensorData.temp >= 30 ? (
                      <AlertTriangle className="size-5 text-orange-500" />
                    ) : (
                      <CheckCircle2 className="size-5 text-green-600" />
                    )}
                    <span className={`font-semibold ${sensorData?.alarme ? 'text-red-800' :
                      sensorData?.temp !== null && sensorData.temp >= 30 ? 'text-orange-800' :
                        'text-green-800'
                      }`}>
                      {sensorData?.alarme ? 'ALERTA CRÍTICO NO PERÍMETRO' :
                        sensorData?.temp !== null && sensorData.temp >= 30 ? 'ATENÇÃO TÉRMICA' :
                          'Área Segura e Conectada'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={disconnectSensor} className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    Desconectar
                  </Button>
                </div>

                {/* 2. CAIXA DE MENSAGEM */}
                {sensorData && (
                  <div className={`px-3 py-1.5 rounded text-sm italic flex items-center gap-2 border shadow-sm ${sensorData.alarme ? 'bg-red-50 border-red-200 text-red-700' :
                    sensorData.temp !== null && sensorData.temp >= 30 ? 'bg-orange-50 border-orange-200 text-orange-700' :
                      'bg-white border-slate-200 text-slate-700'
                    }`}>
                    <Info className={`size-4 ${sensorData.alarme ? 'text-red-500' : sensorData.temp !== null && sensorData.temp >= 30 ? 'text-orange-500' : 'text-blue-500'}`} />
                    Status da Área: <strong>{sensorData.msg}</strong>
                  </div>
                )}

                {/* 3. OS 4 CARTÕES DE DADOS FÍSICOS */}
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-2 rounded-lg border text-center shadow-sm flex flex-col items-center justify-center h-20 transition-colors ${sensorData?.temp !== null && sensorData.temp >= 40 ? 'bg-red-100 border-red-500' :
                    sensorData?.temp !== null && sensorData.temp >= 30 ? 'bg-orange-100 border-orange-400' :
                      'bg-white'
                    }`}>
                    <Thermometer className={`size-5 mb-1 ${sensorData?.temp !== null && sensorData.temp >= 40 ? 'text-red-600' :
                      sensorData?.temp !== null && sensorData.temp >= 30 ? 'text-orange-600' :
                        'text-orange-500'
                      }`} />
                    <span className={`font-bold text-sm ${sensorData?.temp !== null && sensorData.temp >= 40 ? 'text-red-700' :
                      sensorData?.temp !== null && sensorData.temp >= 30 ? 'text-orange-700' :
                        'text-slate-800'
                      }`}>
                      {sensorData?.temp !== null ? sensorData.temp.toFixed(1) : '--'}°C
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-lg border text-center shadow-sm flex flex-col items-center justify-center h-20">
                    <Wind className={`size-5 mb-1 ${sensorData.alarme ? 'text-red-500' : 'text-slate-500'}`} />
                    <span className={`font-bold text-xs ${sensorData.alarme ? 'text-red-600' : 'text-slate-600'}`}>{sensorData.gasStatus}</span>
                  </div>

                  {/* CARTÃO DE STATUS GERAL DA ESTAÇÃO */}
                  <div className={`p-2 rounded-lg border text-center shadow-sm flex flex-col items-center justify-center h-20 transition-colors ${sensorData?.alarme ? 'bg-red-100 border-red-500' :
                    sensorData?.temp !== null && sensorData.temp >= 30 ? 'bg-orange-100 border-orange-400' :
                      'bg-white'
                    }`}>
                    <Flame className={`size-5 mb-1 ${sensorData?.alarme ? 'text-red-600' :
                      sensorData?.temp !== null && sensorData.temp >= 30 ? 'text-orange-500' :
                        'text-green-500'
                      }`} />
                    <span className={`font-bold text-xs tracking-wider ${sensorData?.alarme ? 'text-red-600' :
                      sensorData?.temp !== null && sensorData.temp >= 30 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                      {sensorData?.alarme ? 'PERIGO' :
                        sensorData?.temp !== null && sensorData.temp >= 30 ? 'ATENÇÃO' :
                          'SEGURO'}
                    </span>
                  </div>
                </div>

                {/* CONSOLE FÍSICO */}
                <div className="w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
                  <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      <Terminal className="size-3" /> Console de Dados USB (Raw)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-[10px] text-green-400 font-mono">LIVE RX/TX</span>
                      <Button
                        onClick={clearLogs}
                        variant="ghost"
                        size="icon"
                        className="size-6 text-slate-400 hover:text-white hover:bg-slate-700"
                        title="Limpar console de logs"
                        type="button"
                      >
                        <RefreshCw className="size-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="h-40 p-3 overflow-y-auto text-[11px] font-mono text-green-400 space-y-1">
                    {serialLogs.length === 0 ? (
                      <span className="text-slate-500">Aguardando bits físicos do Arduino...</span>
                    ) : (
                      serialLogs.map((log, idx) => (
                        <div key={idx} className="break-all hover:bg-slate-800 px-1 rounded transition-colors">
                          {log}
                        </div>
                      ))
                    )}
                    <div ref={logEndRef} />
                  </div>
                </div>

                {/* AVISO DE INSTABILIDADE */}
                <div className="flex items-start gap-2 px-2 py-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded">
                  <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>A conexão USB com o Arduino pode apresentar instabilidades dependendo do cabo, da porta e do dispositivo utilizado. Mantenha o cabo firmemente conectado.</span>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* HISTÓRICO DE LEITURAS DOS SENSORES */}
            {/* ========================================== */}
            <details className="group">
              <summary className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors list-none">
                <Clock className="size-3.5" />
                Histórico de Leituras ({sensorHistory.length})
                <span className="flex-1" />
                {sensorHistory.length > 0 && (
                  <AlertDialog open={clearHistoryOpen} onOpenChange={setClearHistoryOpen}>
                    <AlertDialogTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 -mr-1">
                        Limpar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="size-5" /> Limpar Histórico de Leituras
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3 pt-2">
                          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-3">
                            <strong>⚠️ Atenção:</strong> Para uma validação real dos dados coletados, mantenha o histórico por no mínimo <strong>3 dias consecutivos</strong> de leituras. Isso permite identificar padrões, anomalias e tendências térmicas da região monitorada.
                          </p>
                          <p className="text-sm text-slate-600">
                            A limpeza apaga todos os registros de leitura <strong>da sessão atual e do banco de dados</strong>. Esta ação é irreversível.
                          </p>
                          <p className="text-sm text-slate-500 italic">
                            Recomendamos exportar os dados antes de limpar, caso necessário para relatórios futuros.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e: React.MouseEvent) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={(e: React.MouseEvent) => { e.stopPropagation(); clearSensorHistory(); }} className="bg-red-600 hover:bg-red-700">
                          Sim, limpar histórico
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <ChevronsUpDown className="size-3 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-3 max-h-96 overflow-y-auto space-y-1.5">
                {sensorHistory.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhuma leitura registrada ainda. Conecte o Arduino para começar.</p>
                ) : (
                  [...sensorHistory].reverse().map((snap, idx) => {
                    const realIdx = sensorHistory.length - 1 - idx;
                    const isExpanded = expandedSnapIdx === realIdx;
                    const isAlarm = snap.alarme;
                    const isWarning = !isAlarm && snap.temp !== null && snap.temp >= 30;
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "rounded-lg border shadow-sm transition-all cursor-pointer",
                          isExpanded ? "ring-1" : "hover:border-slate-300",
                          isAlarm ? "bg-red-50 border-red-200 ring-red-200" :
                            isWarning ? "bg-orange-50 border-orange-200 ring-orange-200" :
                              isExpanded ? "border-blue-300 ring-blue-200" : "bg-white border-slate-200"
                        )}
                        onClick={() => setExpandedSnapIdx(isExpanded ? null : realIdx)}
                      >
                        {/* CABEÇALHO — sempre visível */}
                        <div className="px-3 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            {isAlarm ? (
                              <Flame className="size-4 shrink-0 text-red-500" />
                            ) : isWarning ? (
                              <AlertTriangle className="size-4 shrink-0 text-orange-500" />
                            ) : (
                              <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "font-bold text-sm font-mono",
                                  isAlarm ? "text-red-700" : isWarning ? "text-orange-700" : "text-slate-800"
                                )}>
                                  {snap.temp?.toFixed(1)}°C
                                </span>
                                <span className={cn(
                                  "text-[10px] font-semibold uppercase tracking-wider",
                                  isAlarm ? "text-red-600" : isWarning ? "text-orange-600" : "text-green-600"
                                )}>
                                  {isAlarm ? 'Perigo' : isWarning ? 'Atenção' : 'Normal'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">{snap.msg}</p>
                            </div>
                          </div>
                          <span className="text-slate-400 font-mono text-[10px] shrink-0 ml-2">
                            {snap.recorded_at ? new Date(snap.recorded_at).toLocaleTimeString('pt-BR') : '--:--:--'}
                          </span>
                        </div>

                        {/* DETALHES EXPANSÍVEIS */}
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Thermometer className="size-3.5 text-orange-500" />
                                <span>Temperatura: <strong>{snap.temp?.toFixed(1)}°C</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Wind className="size-3.5 text-slate-500" />
                                <span>Gás: <strong>{snap.gasStatus}</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                {isAlarm ? (
                                  <Flame className="size-3.5 text-red-500" />
                                ) : (
                                  <CheckCircle2 className="size-3.5 text-green-500" />
                                )}
                                <span>Alarme: <strong>{isAlarm ? 'Ativo' : 'Inativo'}</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Clock className="size-3.5 text-slate-400" />
                                <span>
                                  {snap.recorded_at ? new Date(snap.recorded_at).toLocaleString('pt-BR') : '--/--/---- --:--:--'}
                                </span>
                              </div>
                            </div>
                            {snap.msg && snap.msg !== 'Monitoramento inativo' && (
                              <div className="text-[11px] text-slate-600 bg-slate-50 rounded px-2 py-1.5 border border-slate-100 italic">
                                "{snap.msg}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </details>
          </CardContent>
        </Card>

        {/* ========================================== */}
        {/* COLUNA DIREITA: AUDITORIA DE ÁRVORE (NFC) */}
        {/* ========================================== */}
        <div ref={auditoriaRef} className="scroll-mt-24">
          <Card className="border-green-200 shadow-sm">
            <CardHeader className="bg-green-600 text-white rounded-t-lg pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="size-5" /> Auditoria Individual (Árvores)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

              <div className="space-y-2">
                <Label>Fiscal Responsável *</Label>
                <div className="relative" ref={fiscalRef}>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={fiscalOpen}
                    className="w-full justify-between"
                    disabled={treeStep !== 'idle'}
                    onClick={() => setFiscalOpen(!fiscalOpen)}
                  >
                    {fiscalName ? (
                      <span>{fiscalName} <span className="text-xs text-muted-foreground">({fiscalId})</span></span>
                    ) : (
                      <span className="text-muted-foreground">Selecione o fiscal...</span>
                    )}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                  {fiscalOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-hidden">
                      <div className="flex items-center gap-2 border-b px-3">
                        <Search className="size-4 shrink-0 opacity-50" />
                        <input
                          className="flex h-10 w-full bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Buscar fiscal por nome ou ID..."
                          value={fiscalSearch}
                          onChange={(e) => setFiscalSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {filteredFiscais.length === 0 && (
                          <div className="py-6 text-center text-sm">Nenhum fiscal encontrado.</div>
                        )}
                        {filteredFiscais.map((f) => (
                          <div
                            key={f.id}
                            className="flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent"
                            onClick={() => {
                              setFiscalName(f.name);
                              setFiscalId(f.id);
                              setFiscalOpen(false);
                              setFiscalSearch('');
                            }}
                          >
                            <Check className={cn("mr-2 size-4", fiscalId === f.id ? "opacity-100" : "opacity-0")} />
                            <User className="size-4 mr-2 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span>{f.name}</span>
                              <span className="text-xs text-muted-foreground">{f.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Árvore Alvo da Inspeção</Label>

                {/* Banner de Confirmação NFC */}
                {treeIdFromUrl && (
                  <div className="p-3 border rounded-lg bg-green-50 text-green-800 flex items-center justify-between mb-2 border-green-200">
                    <div className="flex items-center gap-2">
                      <Smartphone className="size-4" />
                      <span className="font-semibold text-sm">Identidade Confirmada via NFC</span>
                    </div>
                    <Badge className="bg-green-600">ID: {selectedTreeId}</Badge>
                  </div>
                )}

                <Select value={selectedTreeId || ''} onValueChange={setSelectedTreeId} disabled={treeStep !== 'idle' || !!treeIdFromUrl}>
                  <SelectTrigger><SelectValue placeholder="Selecione a árvore encontrada..." /></SelectTrigger>
                  <SelectContent>
                    {localTrees.map(t => <SelectItem key={t.id} value={t.id}>{t.species} ({t.nfcId})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* === REPORT COMPLETO DA ÁRVORE === */}
              {selectedTreeId && fullTreeData && (
                <div className="grid grid-cols-1 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <Info className="size-4 text-blue-500" /> Ficha Técnica da Espécie
                    </h3>
                    <Badge variant={fullTreeData.status === 'healthy' ? 'outline' : 'destructive'} className={fullTreeData.status === 'healthy' ? 'bg-green-100 text-green-700 border-green-200' : ''}>
                      {fullTreeData.status === 'healthy' ? 'Saudável' : 'Atenção'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 text-sm mt-2">
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Espécie</span>
                      <span className="font-medium truncate" title={fullTreeData.species}>{fullTreeData.species}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Idade Estimada</span>
                      <span className="font-medium">{fullTreeData.age || '12 anos'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">NFC Tag</span>
                      <span className="font-medium text-blue-600">{fullTreeData.nfcId}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Coordenadas</span>
                      <span className="font-medium flex items-center gap-1"><MapPin className="size-3 text-slate-400" /> {fullTreeData.location}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Dimensões Base</span>
                      <span className="font-medium">
                        D: {fullTreeData.baseDiameter || '45cm'} | A: {fullTreeData.baseHeight || '15m'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Última Auditoria</span>
                      <span className="font-medium flex items-center gap-1"><Clock className="size-3 text-slate-400" /> {fullTreeData.lastValidation}</span>
                    </div>
                  </div>

                  {/* SEÇÃO DE DADOS AMBIENTAIS E BIOMASSA HISTÓRICA */}
                  <div className="mt-3 p-3 bg-white rounded border border-slate-200 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Contexto Ambiental Local</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Thermometer className="size-4 text-orange-500" />
                        <span className="font-semibold text-slate-700">
                          {sensorData?.temp !== null ? `${sensorData.temp.toFixed(1)}°C (Físico)` : 'Cabo Desconectado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="size-4 text-green-600" />
                        <span className="font-semibold text-slate-700">
                          Biomassa Est.: {calcularBiomassa(fullTreeData.baseDiameter || '45', fullTreeData.baseHeight || '15') || '--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Histórico Recente</p>
                    <ul className="text-[11px] space-y-1 text-slate-600">
                      <li className="flex items-center gap-2">🟢 12/03/24 - Nenhuma anomalia detectada.</li>
                      <li className="flex items-center gap-2">🟡 05/02/24 - Stress hídrico leve detectado.</li>
                    </ul>
                  </div>
                </div>
              )}

              {treeStep === 'idle' && (
                <Button
                  onClick={startTreeValidation}
                  className="w-full bg-green-600 hover:bg-green-700 h-12 text-md shadow-md transition-all"
                  disabled={!fiscalName || !fiscalId || !selectedTreeId}
                >
                  {treeIdFromUrl ? (
                    <>
                      <CheckSquare className="size-5 mr-2" /> Iniciar Auditoria
                    </>
                  ) : (
                    <>
                      <Smartphone className="size-5 mr-2 animate-pulse" /> Ler Identidade Físicamente (NFC)
                    </>
                  )}
                </Button>
              )}

              {treeStep !== 'idle' && (
                <Alert className={nfcVerified ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}>
                  <div className="flex items-center gap-3">
                    {nfcVerified ? <CheckCircle2 className="size-5 text-green-600" /> : <div className="size-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />}
                    <AlertDescription>
                      {nfcVerified ? <span className="text-green-800 font-semibold">✓ Localização e NFC Confirmados</span> : <span className="text-slate-600">Aproximando celular da Tag...</span>}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {treeStep === 'inspection' && (
                <div className="space-y-5 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="size-5 text-yellow-500" /> Check-list Humano
                  </h3>

                  {/* 1. SINAIS DE INFRAÇÃO */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="font-semibold text-sm text-yellow-800 mb-3">Sinais de Infrações</p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 bg-white p-2 rounded border">
                        <Checkbox id="illegalCutSigns" checked={inspectionData.illegalCutSigns} onCheckedChange={(c) => setInspectionData(prev => ({ ...prev, illegalCutSigns: c === true }))} />
                        <label htmlFor="illegalCutSigns" className="text-sm font-bold text-red-600 cursor-pointer">Identificado Sinais de Corte Ilegal</label>
                      </div>
                    </div>
                  </div>

                  {/* 2. BLOCO DE BIOMETRIA E BIOMASSA */}
                  <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                      <Activity className="size-4 text-green-600" /> Biometria e Cálculo de Biomassa Atual
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="diameter">Diâmetro do Tronco (cm) - DAP</Label>
                        <Input
                          id="diameter"
                          type="number"
                          placeholder="Ex: 50"
                          value={inspectionData.currentDiameter}
                          onChange={(e) => setInspectionData(prev => ({ ...prev, currentDiameter: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Altura Estimada (m)</Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="Ex: 18"
                          value={inspectionData.currentHeight}
                          onChange={(e) => setInspectionData(prev => ({ ...prev, currentHeight: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* VISUALIZADOR DE BIOMASSA EM TEMPO REAL */}
                    <div className="p-3 bg-green-50 rounded border border-green-200 flex justify-between items-center">
                      <span className="text-sm text-green-800 font-medium">Biomassa Calculada (Atual):</span>
                      <span className="text-lg font-bold text-green-700">
                        {calcularBiomassa(inspectionData.currentDiameter, inspectionData.currentHeight) || 'Aguardando medidas...'}
                      </span>
                    </div>
                  </div>

                  {/* 3. PARECER DO FISCAL */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Parecer do Fiscal sobre a Árvore</Label>
                    <Textarea id="notes" placeholder="Condições gerais, presença de fauna, saúde da folhagem..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                  </div>

                  {/* 4. RESUMO DO AMBIENTE IOT */}
                  <div className="p-3 bg-slate-50 rounded border text-xs text-slate-600">
                    <strong>Resumo do Certificado:</strong> Será anexado a esta auditoria o estado ambiental fornecido pela <em>Estação de Área</em> via USB.
                    Status atual: <span className={sensorData?.alarme ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{sensorData?.alarme ? 'PERIGO (FUMAÇA)' : 'SEGURO'}</span>.
                  </div>

                  {/* 5. AÇÕES DE FINALIZAÇÃO */}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={submitValidation} className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                      <CheckCircle2 className="size-5 mr-2" /> Finalizar e Salvar
                    </Button>
                    <Button variant="outline" onClick={resetTreeValidation} size="lg">Cancelar</Button>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* HISTÓRICO DE VALIDAÇÕES */}
              {/* ========================================== */}
              <div className="pt-4 border-t border-slate-200">
                <details className="group">
                  <summary className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors list-none">
                    <FileText className="size-3.5" />
                    Histórico de Validações ({validationHistory.length})
                    <ChevronsUpDown className="size-3 ml-auto group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-3 max-h-96 overflow-y-auto space-y-2">
                    {validationHistory.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">Nenhuma validação realizada ainda.</p>
                    ) : (
                      validationHistory.map((v) => {
                        const tree = localTrees.find(t => t.id === v.treeId);
                        const treeName = tree?.species ?? (v as any)._treeSpecies ?? null;
                        const treeNfcId = tree?.nfcId ?? (v as any)._treeNfcId ?? null;
                        const isExpanded = expandedValId === v.id;
                        return (
                          <div
                            key={v.id}
                            className={cn(
                              "rounded-lg border shadow-sm transition-all cursor-pointer",
                              isExpanded ? "border-green-300 ring-1 ring-green-200" : "border-slate-200 hover:border-slate-300",
                              v.status === 'approved' ? "bg-white" : v.status === 'rejected' ? "bg-red-50" : "bg-yellow-50"
                            )}
                            onClick={() => setExpandedValId(isExpanded ? null : v.id)}
                          >
                            {/* CABEÇALHO — sempre visível */}
                            <div className="p-3 space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  {treeName ? (
                                    <>
                                      <p className="text-sm font-bold text-slate-800 truncate">{treeName}</p>
                                      <p className="text-[11px] text-slate-400 font-mono">{treeNfcId}</p>
                                    </>
                                  ) : (
                                    <p className="text-sm text-slate-400 italic">Árvore não encontrada</p>
                                  )}
                                </div>
                                <Badge className={cn(
                                  "shrink-0",
                                  v.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                    v.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                      'bg-yellow-100 text-yellow-700 border-yellow-200'
                                )}>
                                  {v.status === 'approved' ? 'Aprovado' : v.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                <span className="flex items-center gap-1">
                                  <User className="size-3" /> {v.fiscalName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {new Date(v.timestamp).toLocaleString('pt-BR')}
                                </span>
                              </div>
                            </div>

                            {/* DETALHES EXPANSÍVEIS */}
                            {isExpanded && (
                              <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <Smartphone className="size-3.5 text-blue-500" />
                                    <span>NFC: <strong>{v.nfcVerified ? 'Verificado ✓' : 'Não verificado ✗'}</strong></span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <Activity className="size-3.5 text-green-500" />
                                    <span>Sensor: <strong>{v.sensorVerified ? 'OK ✓' : 'Falha ✗'}</strong></span>
                                  </div>
                                  {v.temperature > 0 && (
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                      <Thermometer className="size-3.5 text-orange-500" />
                                      <span>Temperatura: <strong>{v.temperature.toFixed(1)}°C</strong></span>
                                    </div>
                                  )}
                                  {v.location && (
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                      <MapPin className="size-3.5 text-red-400" />
                                      <span className="truncate">{v.location}</span>
                                    </div>
                                  )}
                                </div>
                                {v.notes && (
                                  <div className="text-[11px] text-slate-600 bg-slate-50 rounded px-2 py-1.5 border border-slate-100 italic">
                                    "{v.notes}"
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}