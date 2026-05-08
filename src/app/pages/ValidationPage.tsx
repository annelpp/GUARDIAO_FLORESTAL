import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { 
  Smartphone, CheckCircle2, MapPin, Thermometer,
  Clock, User, FileText, AlertTriangle, Droplets, 
  Wind, Usb, ShieldCheck, Flame, Info, Terminal, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { mockTrees, mockValidations, Tree } from '../data/mockData';

interface SensorData {
  temp: number;
  umidade: number;
  gas: number;
  alarme: boolean;
  msg: string;
}

export default function ValidationPage() {
  // ==========================================
  // ESTADO: ROTAS E URL PARAMETERS (NFC)
  // ==========================================
  const [searchParams] = useSearchParams(); // <-- Captura os parâmetros
  const treeIdFromUrl = searchParams.get('treeId'); // <-- Pega especificamente o "treeId"

  // ==========================================
  // ESTADO 1: MONITORAMENTO DE ÁREA (ARDUINO)
  // ==========================================
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [serialError, setSerialError] = useState<string>('');
  const [serialLogs, setSerialLogs] = useState<string[]>([]);
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<any>(null);
  const portRef = useRef<any>(null);

  // ==========================================
  // ESTADO 2: AUDITORIA DE ÁRVORE (NFC + HUMANO)
  // ==========================================
  const [treeStep, setTreeStep] = useState<'idle' | 'nfc' | 'inspection'>('idle');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [fiscalName, setFiscalName] = useState('');
  const [fiscalId, setFiscalId] = useState('');
  const [notes, setNotes] = useState('');
  const [nfcVerified, setNfcVerified] = useState(false);

  const [inspectionData, setInspectionData] = useState({
    trunkCondition: '', foliageHealth: '', soilCondition: '', nfcTagIntegrity: '',
    visualDamage: false, pestsSigns: false, illegalCutSigns: false,
    fireRiskLevel: '', currentDiameter: '', weatherCondition: '',
    soilMoisture: '', photosCount: 0,
  });

  const [localTrees, setLocalTrees] = useState<Tree[]>(mockTrees);

  useEffect(() => {
    const savedTrees = localStorage.getItem('@CercaDigital:trees');
    if (savedTrees) setLocalTrees(JSON.parse(savedTrees));
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
  // LÓGICA DO ARDUINO (ÁREA)
  // ==========================================
  const connectPhysicalSensor = async () => {
    try {
      if (!('serial' in navigator)) {
        setSerialError('Navegador incompatível com porta serial. Use Chrome ou Edge.');
        return;
      }

      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      
      // Impede o ESP32/Arduino de resetar ao abrir a porta
      await port.setSignals({ dataTerminalReady: false, requestToSend: false });

      portRef.current = port;
      setIsConnected(true);
      setSerialError('');
      setSerialLogs(['> Sistema Guardião Base estabelecido. Monitorando perímetro...']);

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let partialData = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        
        partialData += value;
        const lines = partialData.split('\n');
        partialData = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            const timestamp = new Date().toLocaleTimeString('pt-BR');
            let logMsg = trimmedLine; // Começa com o texto cru, caso não seja JSON

            // Se for um pacote JSON, nós interceptamos e formatamos bonito!
            if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
              try {
                const parsed = JSON.parse(trimmedLine);
                if (parsed.temp !== undefined && parsed.umidade !== undefined) {
                  setSensorData(parsed);
                  
                  // Lógica de ícones para o log
                  const icone = parsed.alarme ? '⚠️ PERIGO' : (parsed.temp >= 32 ? '⚠️ ATENÇÃO' : ' OK');
                  const msgTratada = parsed.alarme ? parsed.msg : (parsed.temp >= 32 ? "Temperatura necessita atenção" : parsed.msg);
                  
                  // Formatação amigável para o olho humano 
                  logMsg = `Temp: ${parsed.temp.toFixed(1)}°C | Umi: ${parsed.umidade.toFixed(0)}% | Gás: ${parsed.gas} | ${icone} (${msgTratada})`;
                }
              } catch (err) {
                // Se der erro ao ler o JSON, ignora e imprime o texto cru
              }
            }

            // Adiciona a linha (formatada ou crua) na telinha preta
            setSerialLogs(prev => [...prev.slice(-49), `[${timestamp}] ${logMsg}`]);
          }
        }
      }
    } catch (err: any) {
      if (err.message.includes("No port selected")) {
        setSerialError("Seleção cancelada pelo usuário.");
      } else if (err.message.includes("Failed to open") || err.message.includes("Access denied")) {
        setSerialError("A porta COM está trancada! Feche o monitor serial do VS Code.");
      } else {
        setSerialError(`Erro de conexão USB: ${err.message}`);
      }
      setIsConnected(false);
    }
  };

  const disconnectSensor = async () => {
    if (readerRef.current) await readerRef.current.cancel();
    if (portRef.current) await portRef.current.close();
    setIsConnected(false);
    setSensorData(null);
    setSerialLogs(prev => [...prev, '> Monitoramento de área desativado.']);
  };

  useEffect(() => {
    return () => { if (isConnected) disconnectSensor(); };
  }, [isConnected]);

  // ==========================================
  // LÓGICA DA ÁRVORE (NFC + INSPEÇÃO)
  // ==========================================
  const startTreeValidation = () => {
    if (!fiscalName || !fiscalId || !selectedTreeId) return;
    setTreeStep('nfc');
    setTimeout(() => {
      setNfcVerified(true);
      setTreeStep('inspection');
    }, 1500);
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
      fireRiskLevel: '', currentDiameter: '', weatherCondition: '',
      soilMoisture: '', photosCount: 0,
    });
  };

  const submitValidation = () => {
    let finalStatus = 'approved';
    
    if (
      inspectionData.illegalCutSigns || 
      (sensorData && sensorData.alarme === true)
    ) {
      finalStatus = 'rejected';
    }
    
    alert(`Certificado Emitido! Status: ${finalStatus === 'approved' ? 'APROVADA ✅' : 'REJEITADA ❌'}`);
    resetTreeValidation();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-green-600 size-8"/> Central de Operações em Campo
        </h1>
        <p className="text-gray-600">Monitore o perímetro via IoT e realize auditorias individuais simultaneamente.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        
        {/* ========================================== */}
        {/* COLUNA ESQUERDA: ESTAÇÃO DE ÁREA (ARDUINO) */}
        {/* ========================================== */}
        <Card className="border-blue-200 bg-slate-50 shadow-md sticky top-6">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg pb-4">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2"><Activity className="size-5"/> Estação de Área (IoT)</span>
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
                    <p className="text-sm text-slate-600 px-4">Conecte o sensor base na porta USB para monitorar perigos no perímetro (Incêndios, Gás, etc) antes de iniciar as rondas.</p>
                    {serialError && <p className="text-sm text-red-600 font-bold">{serialError}</p>}
                    <Button onClick={connectPhysicalSensor} className="bg-blue-600 hover:bg-blue-700 w-full mt-2">
                        Conectar Estação USB
                    </Button>
               </div>
            ) : (
              <div className="space-y-4">
                
                {/* 1. CABEÇALHO DO STATUS (3 níveis: Perigo, Atenção, Seguro) */}
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     {sensorData?.alarme ? (
                       <AlertTriangle className="size-5 text-red-600" />
                     ) : sensorData?.temp !== undefined && sensorData.temp >= 32 ? (
                       <AlertTriangle className="size-5 text-orange-500" />
                     ) : (
                       <CheckCircle2 className="size-5 text-green-600" />
                     )}
                     <span className={`font-semibold ${
                        sensorData?.alarme ? 'text-red-800' : 
                        sensorData?.temp !== undefined && sensorData.temp >= 32 ? 'text-orange-800' : 
                        'text-green-800'
                     }`}>
                        {sensorData?.alarme ? 'ALERTA CRÍTICO NO PERÍMETRO' : 
                         sensorData?.temp !== undefined && sensorData.temp >= 32 ? 'ATENÇÃO NO PERÍMETRO' : 
                         'Área Segura para Ronda'}
                     </span>
                   </div>
                   <Button variant="outline" size="sm" onClick={disconnectSensor} className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                     Desconectar
                   </Button>
                </div>
                
                {/* 2. CAIXA DE MENSAGEM (Forçando aviso de temperatura alta se necessário) */}
                {sensorData && (
                    <div className={`px-3 py-1.5 rounded text-sm italic flex items-center gap-2 border shadow-sm ${
                        sensorData.alarme ? 'bg-red-50 border-red-200 text-red-700' : 
                        sensorData.temp >= 32 ? 'bg-orange-50 border-orange-200 text-orange-700' : 
                        'bg-white border-slate-200 text-slate-700'
                    }`}>
                        <Info className={`size-4 ${sensorData.alarme ? 'text-red-500' : sensorData.temp >= 32 ? 'text-orange-500' : 'text-blue-500'}`}/> 
                        Status da Área: <strong>
                          {sensorData.alarme ? sensorData.msg : (sensorData.temp >= 32 ? "Temperatura necessita atenção" : sensorData.msg)}
                        </strong>
                    </div>
                )}
                
                {/* 3. OS 4 CARTÕES DE DADOS */}
                <div className="grid grid-cols-4 gap-2">
                  <div className={`p-2 rounded-lg border text-center shadow-sm flex flex-col items-center justify-center h-20 transition-colors ${
                      sensorData?.temp !== undefined && sensorData.temp >= 40 ? 'bg-red-100 border-red-500' : 
                      sensorData?.temp !== undefined && sensorData.temp >= 32 ? 'bg-orange-100 border-orange-400' : 
                      'bg-white'
                  }`}>
                      <Thermometer className={`size-5 mb-1 ${
                          sensorData?.temp !== undefined && sensorData.temp >= 40 ? 'text-red-600' : 
                          sensorData?.temp !== undefined && sensorData.temp >= 32 ? 'text-orange-600' : 
                          'text-orange-500'
                      }`}/>
                      <span className={`font-bold text-sm ${
                          sensorData?.temp !== undefined && sensorData.temp >= 40 ? 'text-red-700' : 
                          sensorData?.temp !== undefined && sensorData.temp >= 32 ? 'text-orange-700' : 
                          'text-slate-800'
                      }`}>
                          {sensorData?.temp !== undefined ? sensorData.temp.toFixed(1) : '--'}°C
                      </span>
                  </div>

                  <div className="bg-white p-2 rounded-lg border text-center shadow-sm flex flex-col items-center justify-center h-20">
                      <Droplets className="size-5 text-blue-400 mb-1"/>
                      <span className="font-bold text-sm">{sensorData?.umidade !== undefined ? sensorData.umidade.toFixed(0) : '--'}%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border text-center shadow-sm flex flex-col items-center justify-center h-20">
                      <Wind className="size-5 text-slate-500 mb-1"/>
                      <span className="font-bold text-sm">{sensorData?.gas ?? '--'}</span>
                  </div>
                  
                  {/* CARTÃO DE STATUS GERAL (3 níveis) */}
                  <div className={`p-2 rounded-lg border text-center shadow-sm flex flex-col items-center justify-center h-20 transition-colors ${
                      sensorData?.alarme ? 'bg-red-100 border-red-500' : 
                      sensorData?.temp !== undefined && sensorData.temp >= 32 ? 'bg-orange-100 border-orange-400' : 
                      'bg-white'
                  }`}>
                      <Flame className={`size-5 mb-1 ${
                          sensorData?.alarme ? 'text-red-600' : 
                          sensorData?.temp !== undefined && sensorData.temp >= 32 ? 'text-orange-500' : 
                          'text-green-500'
                      }`}/>
                      <span className={`font-bold text-xs tracking-wider ${
                          sensorData?.alarme ? 'text-red-600' : 
                          sensorData?.temp !== undefined && sensorData.temp >= 32 ? 'text-orange-600' : 
                          'text-green-600'
                      }`}>
                          {sensorData?.alarme ? 'PERIGO' : 
                           sensorData?.temp !== undefined && sensorData.temp >= 32 ? 'ATENÇÃO' : 
                           'SEGURO'}
                      </span>
                  </div>
                </div>

                {/* CONSOLE FICA ABAIXO DISSO INALTERADO... */}
                <div className="w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
                  <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      <Terminal className="size-3" /> Console de Monitoramento
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-[10px] text-green-400 font-mono">LIVE</span>
                    </div>
                  </div>
                  <div className="h-40 p-3 overflow-y-auto text-[11px] font-mono text-green-400 space-y-1">
                    {serialLogs.length === 0 ? (
                      <span className="text-slate-500">Aguardando dados...</span>
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========================================== */}
        {/* COLUNA DIREITA: AUDITORIA DE ÁRVORE (NFC) */}
        {/* ========================================== */}
        <Card className="border-green-200 shadow-sm">
          <CardHeader className="bg-green-600 text-white rounded-t-lg pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="size-5"/> Auditoria Individual (Árvores)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fiscal">Nome do Fiscal *</Label>
                <Input id="fiscal" placeholder="João Silva" value={fiscalName} onChange={(e) => setFiscalName(e.target.value)} disabled={treeStep !== 'idle'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiscalId">ID Operacional *</Label>
                <Input id="fiscalId" placeholder="12345" value={fiscalId} onChange={(e) => setFiscalId(e.target.value)} disabled={treeStep !== 'idle'} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Árvore Alvo da Inspeção</Label>
              
              {/* <-- NOVO AVISO VISUAL ADICIONADO --> */}
              {/* Se veio via URL, a gente informa visualmente o fiscal que a árvore foi selecionada via NFC */}
              {treeIdFromUrl ? (
                <div className="p-3 border rounded bg-green-50 text-green-800 flex items-center gap-2">
                  <Smartphone className="size-4" /> 
                  <span className="font-semibold">Selecionada via Tag NFC</span>
                </div>
              ) : null}
              {/* <--------------------------------> */}

              {/* <-- ALTERAÇÃO NO DISABLED: Adicionado || !!treeIdFromUrl --> */}
              <Select value={selectedTreeId || ''} onValueChange={setSelectedTreeId} disabled={treeStep !== 'idle' || !!treeIdFromUrl}>
                <SelectTrigger><SelectValue placeholder="Selecione a árvore encontrada..." /></SelectTrigger>
                <SelectContent>
                  {localTrees.map(t => <SelectItem key={t.id} value={t.id}>{t.species} ({t.nfcId})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {treeStep === 'idle' && (
              <Button onClick={startTreeValidation} className="w-full bg-green-600 hover:bg-green-700 h-12 text-md" disabled={!fiscalName || !fiscalId || !selectedTreeId}>
                <Smartphone className="size-5 mr-2" /> Ler Identidade (NFC)
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
                    <AlertTriangle className="size-5 text-yellow-500"/> Check-list Humano
                </h3>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="font-semibold text-sm text-yellow-800 mb-3">Sinais de Infrações</p>
                  <div className="space-y-3">
                      <div className="flex items-center space-x-2 bg-white p-2 rounded border">
                        <Checkbox id="illegalCutSigns" checked={inspectionData.illegalCutSigns} onCheckedChange={(c) => setInspectionData(prev => ({ ...prev, illegalCutSigns: c === true }))} />
                        <label htmlFor="illegalCutSigns" className="text-sm font-bold text-red-600 cursor-pointer">Identificado Sinais de Corte Ilegal</label>
                      </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Parecer do Fiscal sobre a Árvore</Label>
                  <Textarea id="notes" placeholder="Condições gerais, presença de fauna, saúde da folhagem..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>

                <div className="p-3 bg-slate-50 rounded border text-xs text-slate-600">
                    <strong>Resumo do Certificado:</strong> Será anexado a esta auditoria o estado ambiental fornecido pela <em>Estação de Área</em>. 
                    Status atual: <span className={sensorData?.alarme ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{sensorData?.alarme ? 'PERIGO' : 'SEGURO'}</span>.
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={submitValidation} className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                    <CheckCircle2 className="size-5 mr-2" /> Finalizar e Salvar
                  </Button>
                  <Button variant="outline" onClick={resetTreeValidation} size="lg">Cancelar</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}