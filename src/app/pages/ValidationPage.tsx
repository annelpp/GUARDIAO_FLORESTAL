import { useState } from 'react';
import { 
  Smartphone, Wifi, CheckCircle2, XCircle, 
  MapPin, Thermometer, Clock, User, FileText,
  Camera, AlertTriangle, Ruler, Droplets, Wind, Bug
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
import { mockTrees, mockValidations } from '../data/mockData';

export default function ValidationPage() {
  const [validationStep, setValidationStep] = useState<'idle' | 'nfc' | 'sensor' | 'inspection' | 'complete'>('idle');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [fiscalName, setFiscalName] = useState('');
  const [fiscalId, setFiscalId] = useState('');
  const [notes, setNotes] = useState('');
  const [nfcVerified, setNfcVerified] = useState(false);
  const [sensorVerified, setSensorVerified] = useState(false);
  
  // Novos campos de inspeção
  const [inspectionData, setInspectionData] = useState({
    trunkCondition: '',
    foliageHealth: '',
    soilCondition: '',
    nfcTagIntegrity: '',
    visualDamage: false,
    pestsSigns: false,
    illegalCutSigns: false,
    fireRiskLevel: '',
    currentDiameter: '',
    weatherCondition: '',
    soilMoisture: '',
    photosCount: 0,
  });

  const selectedTree = mockTrees.find(t => t.id === selectedTreeId);

  const startValidation = () => {
    if (!fiscalName || !fiscalId) return;
    
    setValidationStep('nfc');
    // Simular leitura NFC após 2 segundos
    setTimeout(() => {
      setNfcVerified(true);
      setSelectedTreeId('tree-001'); // Simular árvore encontrada
      setValidationStep('sensor');
      
      // Simular conexão com sensor após mais 2 segundos
      setTimeout(() => {
        setSensorVerified(true);
        setValidationStep('inspection');
      }, 2000);
    }, 2000);
  };

  const resetValidation = () => {
    setValidationStep('idle');
    setSelectedTreeId(null);
    setNfcVerified(false);
    setSensorVerified(false);
    setNotes('');
    setInspectionData({
      trunkCondition: '',
      foliageHealth: '',
      soilCondition: '',
      nfcTagIntegrity: '',
      visualDamage: false,
      pestsSigns: false,
      illegalCutSigns: false,
      fireRiskLevel: '',
      currentDiameter: '',
      weatherCondition: '',
      soilMoisture: '',
      photosCount: 0,
    });
  };

  const submitValidation = () => {
    console.log('Validação enviada:', {
      treeId: selectedTreeId,
      fiscalName,
      fiscalId,
      notes,
      nfcVerified,
      sensorVerified,
      inspectionData,
      timestamp: new Date().toISOString(),
    });
    alert('Validação enviada com sucesso!');
    resetValidation();
  };

  const simulatePhotoCapture = () => {
    setInspectionData(prev => ({ ...prev, photosCount: prev.photosCount + 1 }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Validação em Campo</h1>
        <p className="text-gray-600">Sistema de validação dupla: NFC + Sensor em tempo real</p>
      </div>

      {/* Explicação do Sistema */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <Smartphone className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">Como Funciona a Validação</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span><strong>Leitura NFC:</strong> Aproxime seu celular da etiqueta NFC na árvore para ler o "RG Digital"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span><strong>Conexão com Sensor:</strong> O sistema conecta automaticamente via Bluetooth ao ESP32 da árvore</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span><strong>Verificação em Tempo Real:</strong> Valida que a árvore está "viva" e no local correto</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Processo de Validação */}
        <Card>
          <CardHeader>
            <CardTitle>Nova Validação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações do Fiscal */}
            <div className="space-y-2">
              <Label htmlFor="fiscal">Nome do Fiscal *</Label>
              <Input
                id="fiscal"
                placeholder="Seu nome completo"
                value={fiscalName}
                onChange={(e) => setFiscalName(e.target.value)}
                disabled={validationStep !== 'idle'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalId">ID do Fiscal *</Label>
              <Input
                id="fiscalId"
                placeholder="Seu ID de fiscal"
                value={fiscalId}
                onChange={(e) => setFiscalId(e.target.value)}
                disabled={validationStep !== 'idle'}
              />
            </div>

            {/* Botão Iniciar ou Status */}
            {validationStep === 'idle' && (
              <Button 
                onClick={startValidation} 
                className="w-full" 
                size="lg"
                disabled={!fiscalName || !fiscalId}
              >
                <Smartphone className="size-5 mr-2" />
                Iniciar Validação NFC
              </Button>
            )}

            {/* Status NFC */}
            {validationStep !== 'idle' && (
              <div className="space-y-4">
                <Alert className={nfcVerified ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}>
                  <div className="flex items-center gap-3">
                    {nfcVerified ? (
                      <CheckCircle2 className="size-5 text-green-600" />
                    ) : (
                      <div className="size-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    <AlertDescription>
                      {nfcVerified ? (
                        <span className="text-green-800 font-semibold">✓ NFC Lido com Sucesso</span>
                      ) : (
                        <span className="text-blue-800">Aguardando leitura NFC...</span>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>

                {/* Status Sensor */}
                {validationStep === 'sensor' || validationStep === 'inspection' || validationStep === 'complete' ? (
                  <Alert className={sensorVerified ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}>
                    <div className="flex items-center gap-3">
                      {sensorVerified ? (
                        <CheckCircle2 className="size-5 text-green-600" />
                      ) : (
                        <div className="size-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      )}
                      <AlertDescription>
                        {sensorVerified ? (
                          <span className="text-green-800 font-semibold">✓ Sensor Verificado</span>
                        ) : (
                          <span className="text-blue-800">Conectando ao sensor via Bluetooth...</span>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                ) : null}
              </div>
            )}

            {/* Dados da Árvore (após NFC) */}
            {selectedTree && validationStep !== 'idle' && (
              <div className="bg-gray-50 rounded-lg p-4 border space-y-3">
                <h4 className="font-bold">Dados da Árvore</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-gray-400" />
                    <span className="text-gray-600">Espécie:</span>
                    <span className="font-semibold">{selectedTree.species}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">ID NFC:</span>
                    <Badge variant="outline">{selectedTree.nfcId}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-gray-400" />
                    <span className="text-gray-600">Idade:</span>
                    <span className="font-semibold">{selectedTree.age} anos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-gray-400" />
                    <span className="text-gray-600">GPS:</span>
                    <span className="font-mono text-xs">{selectedTree.latitude}, {selectedTree.longitude}</span>
                  </div>
                  {sensorVerified && (
                    <div className="flex items-center gap-2">
                      <Thermometer className="size-4 text-gray-400" />
                      <span className="text-gray-600">Temperatura Atual:</span>
                      <span className="font-bold text-green-600">{selectedTree.temperature}°C</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inspeção da Árvore */}
            {validationStep === 'inspection' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trunkCondition">Condição do Tronco</Label>
                  <Select
                    id="trunkCondition"
                    value={inspectionData.trunkCondition}
                    onValueChange={(value) => setInspectionData(prev => ({ ...prev, trunkCondition: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a condição do tronco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excelente">Excelente</SelectItem>
                      <SelectItem value="bom">Bom</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="ruim">Ruim</SelectItem>
                      <SelectItem value="muito_ruim">Muito Ruim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foliageHealth">Saúde da Folhagem</Label>
                  <Select
                    id="foliageHealth"
                    value={inspectionData.foliageHealth}
                    onValueChange={(value) => setInspectionData(prev => ({ ...prev, foliageHealth: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a saúde da folhagem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excelente">Excelente</SelectItem>
                      <SelectItem value="bom">Bom</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="ruim">Ruim</SelectItem>
                      <SelectItem value="muito_ruim">Muito Ruim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soilCondition">Condição do Solo</Label>
                  <Select
                    id="soilCondition"
                    value={inspectionData.soilCondition}
                    onValueChange={(value) => setInspectionData(prev => ({ ...prev, soilCondition: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a condição do solo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excelente">Excelente</SelectItem>
                      <SelectItem value="bom">Bom</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="ruim">Ruim</SelectItem>
                      <SelectItem value="muito_ruim">Muito Ruim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nfcTagIntegrity">Integridade da Tag NFC</Label>
                  <Select
                    id="nfcTagIntegrity"
                    value={inspectionData.nfcTagIntegrity}
                    onValueChange={(value) => setInspectionData(prev => ({ ...prev, nfcTagIntegrity: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a integridade da tag NFC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excelente">Excelente</SelectItem>
                      <SelectItem value="bom">Bom</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="ruim">Ruim</SelectItem>
                      <SelectItem value="muito_ruim">Muito Ruim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visualDamage">Danos Visuais</Label>
                  <Checkbox
                    id="visualDamage"
                    checked={inspectionData.visualDamage}
                    onCheckedChange={(checked) => setInspectionData(prev => ({ ...prev, visualDamage: checked === true }))}
                  >
                    Há danos visuais na árvore?
                  </Checkbox>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pestsSigns">Sinais de Pragas</Label>
                  <Checkbox
                    id="pestsSigns"
                    checked={inspectionData.pestsSigns}
                    onCheckedChange={(checked) => setInspectionData(prev => ({ ...prev, pestsSigns: checked === true }))}
                  >
                    Há sinais de pragas na árvore?
                  </Checkbox>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="illegalCutSigns">Sinais de Corte Ilegal</Label>
                  <Checkbox
                    id="illegalCutSigns"
                    checked={inspectionData.illegalCutSigns}
                    onCheckedChange={(checked) => setInspectionData(prev => ({ ...prev, illegalCutSigns: checked === true }))}
                  >
                    Há sinais de corte ilegal na árvore?
                  </Checkbox>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fireRiskLevel">Nível de Risco de Incêndio</Label>
                  <Select
                    id="fireRiskLevel"
                    value={inspectionData.fireRiskLevel}
                    onValueChange={(value) => setInspectionData(prev => ({ ...prev, fireRiskLevel: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o nível de risco de incêndio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                      <SelectItem value="muito_alto">Muito Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentDiameter">Diâmetro Atual (cm)</Label>
                  <Input
                    id="currentDiameter"
                    placeholder="Digite o diâmetro atual da árvore"
                    value={inspectionData.currentDiameter}
                    onChange={(e) => setInspectionData(prev => ({ ...prev, currentDiameter: e.target.value }))}
                    type="number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weatherCondition">Condição do Tempo</Label>
                  <Select
                    id="weatherCondition"
                    value={inspectionData.weatherCondition}
                    onValueChange={(value) => setInspectionData(prev => ({ ...prev, weatherCondition: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a condição do tempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sol">Sol</SelectItem>
                      <SelectItem value="nublado">Nublado</SelectItem>
                      <SelectItem value="chuva">Chuva</SelectItem>
                      <SelectItem value="neve">Neve</SelectItem>
                      <SelectItem value="tempestade">Tempestade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soilMoisture">Umidade do Solo (%)</Label>
                  <Input
                    id="soilMoisture"
                    placeholder="Digite a umidade do solo"
                    value={inspectionData.soilMoisture}
                    onChange={(e) => setInspectionData(prev => ({ ...prev, soilMoisture: e.target.value }))}
                    type="number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photosCount">Fotos Capturadas</Label>
                  <div className="flex items-center gap-2">
                    <Camera className="size-4 text-gray-400" />
                    <span className="text-gray-600">Capturadas:</span>
                    <span className="font-bold text-green-600">{inspectionData.photosCount}</span>
                    <Button
                      onClick={simulatePhotoCapture}
                      className="ml-2"
                      size="sm"
                    >
                      Capturar Foto
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Adicione observações sobre o estado da árvore, área ao redor, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={submitValidation} className="flex-1">
                    <CheckCircle2 className="size-4 mr-2" />
                    Aprovar e Enviar
                  </Button>
                  <Button variant="outline" onClick={resetValidation}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Validações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Validações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {mockValidations.map((validation) => {
                const tree = mockTrees.find(t => t.id === validation.treeId);
                return (
                  <div key={validation.id} className="p-4 bg-gray-50 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{tree?.species}</p>
                        <p className="text-xs text-gray-600">{tree?.nfcId}</p>
                      </div>
                      <Badge className={
                        validation.status === 'approved' ? 'bg-green-600' :
                        validation.status === 'rejected' ? 'bg-red-600' :
                        'bg-yellow-600'
                      }>
                        {validation.status === 'approved' ? 'Aprovado' :
                         validation.status === 'rejected' ? 'Rejeitado' :
                         'Pendente'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        {validation.nfcVerified ? (
                          <CheckCircle2 className="size-3 text-green-600" />
                        ) : (
                          <XCircle className="size-3 text-red-600" />
                        )}
                        <span>NFC</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {validation.sensorVerified ? (
                          <CheckCircle2 className="size-3 text-green-600" />
                        ) : (
                          <XCircle className="size-3 text-red-600" />
                        )}
                        <span>Sensor</span>
                      </div>
                      {validation.sensorVerified && (
                        <div className="flex items-center gap-1">
                          <Thermometer className="size-3 text-gray-400" />
                          <span>{validation.temperature}°C</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <User className="size-3" />
                      <span>{validation.fiscalName}</span>
                      <span>•</span>
                      <span>{new Date(validation.timestamp).toLocaleDateString('pt-BR')}</span>
                    </div>

                    {validation.notes && (
                      <p className="text-xs text-gray-600 italic border-l-2 pl-2">
                        {validation.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Validações Hoje</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold">95%</p>
              </div>
              <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold">45s</p>
              </div>
              <Clock className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}