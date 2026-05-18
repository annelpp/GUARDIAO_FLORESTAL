import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, FileText, 
  Download, Calendar, PieChart 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { alertStats, systemStats, mockAlerts } from '../data/mockData';
import type { Tree } from '../data/mockData';
import { supabase, mapDbTreeToFrontend } from '../../lib/supabase';
import { exportToCSV, generateFullPDFReport, generateExecutiveSummary } from '../utils/exportUtils';

export default function ReportsPage() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    supabase.from('trees').select('*').then(({ data }) => {
      if (data) setTrees(data.map(mapDbTreeToFrontend));
    }).catch(() => {});
  }, []);

  const healthDistribution = [
    { name: 'Excelente', value: 58, color: '#10b981' },
    { name: 'Boa', value: 72, color: '#3b82f6' },
    { name: 'Regular', value: 21, color: '#f59e0b' },
    { name: 'Ruim', value: 5, color: '#ef4444' },
  ];

  const manejoDistribution = [
    { name: 'Manejo Sustentável', value: 89, color: '#8b5cf6' },
    { name: 'Preservação Permanente', value: 67, color: '#06b6d4' },
  ];

  const speciesDistribution = [
    { species: 'Ipê Roxo', count: 42 },
    { species: 'Jatobá', count: 38 },
    { species: 'Mogno', count: 25 },
    { species: 'Cedro', count: 22 },
    { species: 'Peroba Rosa', count: 15 },
    { species: 'Aroeira', count: 14 },
  ];

  const monthlyGrowth = [
    { month: 'Set/25', trees: 120, alerts: 15, validations: 45 },
    { month: 'Out/25', trees: 128, alerts: 12, validations: 52 },
    { month: 'Nov/25', trees: 135, alerts: 8, validations: 58 },
    { month: 'Dez/25', trees: 142, alerts: 5, validations: 64 },
    { month: 'Jan/26', trees: 148, alerts: 4, validations: 71 },
    { month: 'Fev/26', trees: 153, alerts: 3, validations: 76 },
    { month: 'Mar/26', trees: 156, alerts: 5, validations: 82 },
  ];

  const exportReport = async (type: string) => {
    setIsExporting(true); // Impede múltiplos cliques
    try {
      switch (type) {
        case 'pdf':
          await generateFullPDFReport(trees, mockAlerts, 'dashboard-charts-container');
          break;
        case 'excel':
          exportToCSV(trees);
          break;
        case 'summary':
          generateExecutiveSummary(trees, mockAlerts);
          break;
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Análise completa do sistema de monitoramento</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => exportReport('summary')}
          disabled={isExporting}
        >
          <Download className="size-4" />
          Exportar Resumo
        </Button>
      </div>

      {/* 2. DIV EMBRULHANDO TUDO QUE QUEREMOS FOTOGRAFAR PARA O PDF */}
      <div id="dashboard-charts-container" className="space-y-6 bg-gray-50 dark:bg-transparent p-2 -m-2 rounded-xl transition-colors">
        
        {/* KPIs Principais */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Crescimento Mensal</p>
                <TrendingUp className="size-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold mb-1">+8</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="size-3" />
                +5.4% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Redução de Alertas</p>
                <TrendingDown className="size-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold mb-1">-47%</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingDown className="size-3" />
                Melhor mês do ano
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Uptime Sistema</p>
                <BarChart3 className="size-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold mb-1">{systemStats.uptime}%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">99.5% meta mensal</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Eficiência</p>
                <PieChart className="size-4 text-purple-600" />
              </div>
              <p className="text-3xl font-bold mb-1">97.4%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sensores ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Crescimento ao Longo do Tempo */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento do Sistema (Últimos 7 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="trees" stroke="#10b981" strokeWidth={3} name="Árvores Cadastradas" />
                <Line yAxisId="right" type="monotone" dataKey="validations" stroke="#3b82f6" strokeWidth={2} name="Validações" />
                <Line yAxisId="right" type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} name="Alertas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Distribuição por Tipo de Alerta */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={alertStats.byType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {alertStats.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {alertStats.byType.map((item) => (
                  <div key={item.type} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.type}: <strong>{item.count}</strong></span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tendência de Alertas */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Alertas (6 Meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={alertStats.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="alerts" fill="#ef4444" name="Alertas" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50 transition-colors">
                <p className="text-sm text-green-800">
                  <strong>Tendência Positiva:</strong> Redução de 80% nos alertas desde outubro
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Saúde das Árvores */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Saúde das Árvores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={healthDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {healthDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {healthDistribution.map((item) => (
                  <Badge 
                    key={item.name} 
                    variant="outline"
                    className="flex items-center gap-1 bg-white dark:bg-gray-800 dark:!border-gray-700"
                    style={{ borderColor: item.color, color: item.color }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de Espécies */}
          <Card>
            <CardHeader>
              <CardTitle>Top Espécies Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={speciesDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="species" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tipo de Manejo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Manejo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={manejoDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {manejoDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                {manejoDistribution.map((item) => (
                  <div key={item.name} className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 shadow-sm transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold">{item.name}</span>
                      </div>
                      <Badge variant="outline" className="text-lg px-3">{item.value}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {((item.value / 156) * 100).toFixed(1)}% do total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Executivo */}
        <Card className="bg-gradient-to-br from-green-50 dark:from-green-900/10 to-blue-50 dark:to-blue-900/10 border-green-200 dark:border-green-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold text-green-800">Conquistas</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>{trees.length || 156} árvores</strong> monitoradas ativamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>97.4%</strong> de sensores operacionais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>82 validações</strong> realizadas este mês</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Redução de <strong>80%</strong> em alertas críticos</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-blue-800">Próximos Passos</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Calendar className="size-4 text-blue-600 mt-0.5" />
                    <span>Expandir para <strong>Zona C</strong> (50 novas árvores)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="size-4 text-blue-600 mt-0.5" />
                    <span>Implementar alertas via <strong>SMS</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="size-4 text-blue-600 mt-0.5" />
                    <span>Treinar <strong>3 novos fiscais</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="size-4 text-blue-600 mt-0.5" />
                    <span>Upgrade de sensores na <strong>Zona A</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      
      {/* FIM DA DIV DOS GRÁFICOS */}
      </div>

      {/* Opções de Export - Ficam de fora do print! */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => exportReport('pdf')} 
              disabled={isExporting}
              className="h-auto py-4 flex-col gap-2 hover:border-green-600 hover:text-green-700 transition-colors"
            >
              <FileText className="size-6" />
              <span>{isExporting ? 'Gerando PDF...' : 'Relatório Completo (PDF)'}</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => exportReport('excel')} 
              disabled={isExporting}
              className="h-auto py-4 flex-col gap-2 hover:border-blue-600 hover:text-blue-700 transition-colors"
            >
              <Download className="size-6" />
              <span>Dados Brutos (CSV)</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => exportReport('summary')} 
              disabled={isExporting}
              className="h-auto py-4 flex-col gap-2 hover:border-purple-600 hover:text-purple-700 transition-colors"
            >
              <BarChart3 className="size-6" />
              <span>Resumo Executivo (PDF)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}