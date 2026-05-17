import imgIpe from '@/app/assets/images/Ipe_roxo.jpg';
import imgJatoba from '@/app/assets/images/jatoba.jpg';
import imgMogno from '@/app/assets/images/mogno.jpg';
import imgCedro from '@/app/assets/images/Cedro (Cedrela fissilis).jpg';
import imgPeroba from '@/app/assets/images/Peroba Rosa (Aspidosperma polyneuron).jpg';
import imgAroeira from '@/app/assets/images/Aroeira (Myracrodruon urundeuva).webp';

export interface Tree {
  id: string;
  nfcId: string;
  species: string;
  age: number;
  latitude: number;
  longitude: number;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  temperature: number;
  lastUpdate: string;
  status: 'safe' | 'warning' | 'critical';
  sensorConnected: boolean;
  registrationDate: string;
  manejo: 'sustentável' | 'permanente';
  diameter: number; // cm
  height: number; // metros
  imageUrl?: string;

  // --- NOVAS PROPRIEDADES PARA A FICHA TÉCNICA ---
  location?: string;
  baseDiameter?: string;
  baseHeight?: string;
  lastValidation?: string;
}

export interface Alert {
  id: string;
  treeId: string;
  type: 'fire' | 'temperature' | 'offline' | 'intrusion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  temperature?: number;
}

export interface ValidationRecord {
  id: string;
  treeId: string;
  fiscalName: string;
  timestamp: string;
  nfcVerified: boolean;
  sensorVerified: boolean;
  temperature: number;
  location: string;
  notes: string;
  status: 'approved' | 'rejected' | 'pending';
}

// Mock datas
export const mockTrees: Tree[] = [
  {
    id: 'tree-001',
    nfcId: 'NFC-IPE-001',
    species: 'Ipê Roxo (Handroanthus impetiginosus)',
    age: 45,
    latitude: -3.1190,
    longitude: -60.0217,
    health: 'excellent',
    temperature: 28.5,
    lastUpdate: '2026-04-06T10:30:00',
    status: 'safe',
    sensorConnected: true,
    registrationDate: '2024-01-15',
    manejo: 'sustentável',
    diameter: 65,
    height: 18.5,
    imageUrl: imgIpe,
    // Adaptações para a UI da Ficha Técnica
    location: '-3.1190, -60.0217',
    baseDiameter: '65',
    baseHeight: '18.5',
    lastValidation: '06/04/2026',
  },
  {
    id: 'tree-002',
    nfcId: 'NFC-JAT-002',
    species: 'Jatobá (Hymenaea courbaril)',
    age: 60,
    latitude: -3.1195,
    longitude: -60.0220,
    health: 'good',
    temperature: 29.2,
    lastUpdate: '2026-04-06T10:28:00',
    status: 'safe',
    sensorConnected: true,
    registrationDate: '2024-01-15',
    manejo: 'permanente',
    diameter: 80,
    height: 22.0,
    imageUrl: imgJatoba,
    location: '-3.1195, -60.0220',
    baseDiameter: '80',
    baseHeight: '22.0',
    lastValidation: '06/04/2026',
  },
  {
    id: 'tree-003',
    nfcId: 'NFC-MAH-003',
    species: 'Mogno (Swietenia macrophylla)',
    age: 38,
    latitude: -3.1200,
    longitude: -60.0225,
    health: 'excellent',
    temperature: 42.8,
    lastUpdate: '2026-04-06T10:25:00',
    status: 'critical',
    sensorConnected: true,
    registrationDate: '2024-02-10',
    manejo: 'sustentável',
    diameter: 55,
    height: 16.0,
    imageUrl: imgMogno,
    location: '-3.1200, -60.0225',
    baseDiameter: '55',
    baseHeight: '16.0',
    lastValidation: '06/04/2026',
  },
  {
    id: 'tree-004',
    nfcId: 'NFC-CED-004',
    species: 'Cedro (Cedrela fissilis)',
    age: 52,
    latitude: -3.1185,
    longitude: -60.0212,
    health: 'good',
    temperature: 27.8,
    lastUpdate: '2026-04-06T10:32:00',
    status: 'safe',
    sensorConnected: true,
    registrationDate: '2024-01-20',
    manejo: 'permanente',
    diameter: 70,
    height: 20.5,
    imageUrl: imgCedro,
    location: '-3.1185, -60.0212',
    baseDiameter: '70',
    baseHeight: '20.5',
    lastValidation: '06/04/2026',
  },
  {
    id: 'tree-005',
    nfcId: 'NFC-PER-005',
    species: 'Peroba Rosa (Aspidosperma polyneuron)',
    age: 41,
    latitude: -3.1205,
    longitude: -60.0230,
    health: 'fair',
    temperature: 35.5,
    lastUpdate: '2026-04-06T10:20:00',
    status: 'warning',
    sensorConnected: true,
    registrationDate: '2024-03-05',
    manejo: 'sustentável',
    diameter: 58,
    height: 17.0,
    imageUrl: imgPeroba,
    location: '-3.1205, -60.0230',
    baseDiameter: '58',
    baseHeight: '17.0',
    lastValidation: '06/04/2026',
  },
  {
    id: 'tree-006',
    nfcId: 'NFC-ARO-006',
    species: 'Aroeira (Myracrodruon urundeuva)',
    age: 55,
    latitude: -3.1180,
    longitude: -60.0208,
    health: 'excellent',
    temperature: 28.0,
    lastUpdate: '2026-04-06T10:33:00',
    status: 'safe',
    sensorConnected: true,
    registrationDate: '2024-01-25',
    manejo: 'permanente',
    diameter: 72,
    height: 19.5,
    imageUrl: imgAroeira,
    location: '-3.1180, -60.0208',
    baseDiameter: '72',
    baseHeight: '19.5',
    lastValidation: '06/04/2026',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    treeId: 'tree-003',
    type: 'fire',
    severity: 'critical',
    message: 'Temperatura crítica detectada: 42.8°C',
    timestamp: '2026-04-06T10:25:00',
    resolved: false,
    temperature: 42.8,
  },
  {
    id: 'alert-002',
    treeId: 'tree-005',
    type: 'temperature',
    severity: 'medium',
    message: 'Temperatura elevada: 35.5°C',
    timestamp: '2026-04-06T10:20:00',
    resolved: false,
    temperature: 35.5,
  },
  {
    id: 'alert-003',
    treeId: 'tree-002',
    type: 'temperature',
    severity: 'low',
    message: 'Temperatura acima do normal: 32.1°C',
    timestamp: '2026-04-06T09:15:00',
    resolved: true,
    temperature: 32.1,
  },
  {
    id: 'alert-004',
    treeId: 'tree-001',
    type: 'offline',
    severity: 'medium',
    message: 'Sensor desconectado por 10 minutos',
    timestamp: '2026-04-06T08:45:00',
    resolved: true,
  },
  {
    id: 'alert-005',
    treeId: 'tree-004',
    type: 'intrusion',
    severity: 'high',
    message: 'Movimento detectado fora do horário autorizado',
    timestamp: '2026-04-05T23:30:00',
    resolved: true,
  },
];

export const mockValidations: ValidationRecord[] = [
  {
    id: 'val-001',
    treeId: 'tree-001',
    fiscalName: 'Carlos Silva',
    timestamp: '2026-04-05T14:30:00',
    nfcVerified: true,
    sensorVerified: true,
    temperature: 28.5,
    location: 'Zona A, Setor 1',
    notes: 'Árvore em excelente estado. Sensores funcionando normalmente.',
    status: 'approved',
  },
  {
    id: 'val-002',
    treeId: 'tree-002',
    fiscalName: 'Ana Paula',
    timestamp: '2026-04-05T15:00:00',
    nfcVerified: true,
    sensorVerified: true,
    temperature: 29.0,
    location: 'Zona A, Setor 1',
    notes: 'Verificação concluída. Árvore preservada conforme plano.',
    status: 'approved',
  },
  {
    id: 'val-003',
    treeId: 'tree-003',
    fiscalName: 'Roberto Lima',
    timestamp: '2026-04-04T11:20:00',
    nfcVerified: true,
    sensorVerified: false,
    temperature: 0,
    location: 'Zona B, Setor 2',
    notes: 'Sensor apresentou falha na conexão. Necessário manutenção.',
    status: 'pending',
  },
  {
    id: 'val-004',
    treeId: 'tree-004',
    fiscalName: 'Carlos Silva',
    timestamp: '2026-04-04T16:45:00',
    nfcVerified: true,
    sensorVerified: true,
    temperature: 27.5,
    location: 'Zona A, Setor 1',
    notes: 'Situação regular. Área bem preservada.',
    status: 'approved',
  },
];

export const temperatureHistory = [
  { time: '00:00', tree001: 25, tree002: 26, tree003: 25, tree005: 24 },
  { time: '02:00', tree001: 24, tree002: 25, tree003: 24, tree005: 23 },
  { time: '04:00', tree001: 23, tree002: 24, tree003: 23, tree005: 22 },
  { time: '06:00', tree001: 24, tree002: 25, tree003: 24, tree005: 23 },
  { time: '08:00', tree001: 26, tree002: 27, tree003: 28, tree005: 27 },
  { time: '10:00', tree001: 28, tree002: 29, tree003: 42, tree005: 35 },
  { time: '12:00', tree001: 29, tree002: 30, tree003: 38, tree005: 32 },
];

export const alertStats = {
  total: 47,
  resolved: 42,
  pending: 5,
  critical: 1,
  byType: [
    { type: 'Incêndio', count: 12, color: '#ef4444' },
    { type: 'Temperatura', count: 18, color: '#f97316' },
    { type: 'Offline', count: 10, color: '#6b7280' },
    { type: 'Intrusão', count: 7, color: '#8b5cf6' },
  ],
  trend: [
    { month: 'Out', alerts: 15 },
    { month: 'Nov', alerts: 12 },
    { month: 'Dez', alerts: 8 },
    { month: 'Jan', alerts: 5 },
    { month: 'Fev', alerts: 4 },
    { month: 'Mar', alerts: 3 },
  ],
};

export const systemStats = {
  totalTrees: 156,
  activeSensors: 152,
  alertsToday: 5,
  validationsToday: 12,
  areaMonitored: 450, // hectares
  uptime: 99.7,
};