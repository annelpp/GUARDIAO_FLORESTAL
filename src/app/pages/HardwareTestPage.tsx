import { useState, useRef, useEffect } from 'react';
import { Usb, Flame, Thermometer, Wind, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface SensorData {
  temp: number;
  gas: number;
  fogo: number;
}

export default function HardwareTestPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string>('');
  
  const readerRef = useRef<any>(null);
  const portRef = useRef<any>(null);

  const connectUSB = async () => {
    try {
      if (!('serial' in navigator)) {
        setError('Seu navegador não suporta a Web Serial API. Use o Google Chrome ou Edge.');
        return;
      }

      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 }); // Mesma velocidade do Serial.begin()
      
      portRef.current = port;
      setIsConnected(true);
      setError('');

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
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
          if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
            try {
              const parsed = JSON.parse(trimmedLine);
              setSensorData(parsed);
            } catch (err) {
              console.log('Erro ao ler JSON:', trimmedLine);
            }
          }
        }
      }
    } catch (err: any) {
      setError(`Erro na conexão USB: ${err.message}`);
      setIsConnected(false);
    }
  };

  const disconnectUSB = async () => {
    if (readerRef.current) {
      await readerRef.current.cancel();
    }
    if (portRef.current) {
      await portRef.current.close();
    }
    setIsConnected(false);
    setSensorData(null);
  };

  useEffect(() => {
    return () => {
      if (isConnected) disconnectUSB();
    };
  }, [isConnected]);

  const getGasStatus = (gas: number) => {
    if (gas > 250) return { label: 'Perigo de Incêndio (Fumaça)', color: 'bg-red-600', alert: true };
    if (gas > 119) return { label: 'Indício de Fumaça', color: 'bg-yellow-600', alert: true };
    return { label: 'Tudo nos conformes', color: 'bg-green-600', alert: false };
  };

  //MUDAR AQUI AS TEMPERATURAS
  const gasStatus = sensorData ? getGasStatus(sensorData.gas) : null;
  const isFlameDetected = sensorData?.fogo === 1;
  const isHeatExcessive = sensorData ? sensorData.temp > 32.0 : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Usb className="size-8 text-blue-600" /> 
            Laboratório de Hardware
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Leitura em tempo real do ESP32 via cabo USB (Web Serial API)</p>
        </div>
        
        {!isConnected ? (
          <Button onClick={connectUSB} className="bg-blue-600 hover:bg-blue-700">
            Conectar ESP32 (USB)
          </Button>
        ) : (
          <Button variant="destructive" onClick={disconnectUSB}>
            Desconectar
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
          <AlertTriangle className="size-5" /> {error}
        </div>
      )}

      {/* Painel de Dados */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* TEMPERATURA */}
        <Card className={`transition-colors ${isHeatExcessive ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Thermometer className={isHeatExcessive ? 'text-red-600' : 'text-gray-500'} />
              Temperatura (DS18B20)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sensorData ? (
              <>
                <p className={`text-4xl font-bold ${isHeatExcessive ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                  {sensorData.temp.toFixed(1)}°C
                </p>
                {isHeatExcessive && (
                  <Badge variant="destructive" className="mt-2">Calor Excessivo!</Badge>
                )}
              </>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm">Aguardando dados...</p>
            )}
          </CardContent>
        </Card>

        {/* FUMAÇA / GÁS */}
        <Card className={`transition-colors ${gasStatus?.alert ? (sensorData!.gas > 250 ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20') : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wind className={gasStatus?.alert ? 'text-yellow-600' : 'text-gray-500'} />
              Sensor de Gás (MQ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sensorData ? (
              <>
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{sensorData.gas}</p>
                <Badge className={`mt-2 ${gasStatus?.color}`}>
                  {gasStatus?.label}
                </Badge>
              </>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm">Aguardando dados...</p>
            )}
          </CardContent>
        </Card>

        {/* CHAMA */}
        <Card className={`transition-colors ${isFlameDetected ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className={isFlameDetected ? 'text-red-600' : 'text-gray-500'} />
              Sensor de Chama
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sensorData ? (
              <>
                {isFlameDetected ? (
                  <div>
                    <p className="text-4xl font-bold text-red-600 mb-2">FOGO!</p>
                    <Badge variant="destructive" className="animate-pulse">Emergência</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="size-8" />
                    <span className="text-xl font-bold">Seguro</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm">Aguardando dados...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Log de atividade crua para debug */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-500 dark:text-gray-400">Monitor Serial (RAW JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-32 flex items-center justify-center">
            {isConnected ? (
               sensorData ? JSON.stringify(sensorData) : "Lendo porta COM..."
            ) : (
              <span className="text-gray-600 dark:text-gray-400">Nenhum dispositivo conectado.</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}