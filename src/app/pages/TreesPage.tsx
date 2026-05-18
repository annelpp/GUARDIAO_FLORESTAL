import { useState, useEffect } from 'react';
import { Loader2, Plus, Search, Filter, MapPin, Thermometer, Calendar, TreePine, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tree } from '../data/mockData';
import { supabase, mapDbTreeToFrontend, mapTreeToDb } from '../../lib/supabase';
import TreeForm from '../components/TreeForm';
import TreeHistoryModal from '../components/TreeHistoryModal';

export default function TreesPage() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTree, setEditingTree] = useState<Tree | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyTree, setHistoryTree] = useState<Tree | null>(null);

  useEffect(() => {
    supabase.from('trees').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setTrees(data.map(mapDbTreeToFrontend));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredTrees = trees.filter(tree => {
    const matchesSearch = tree.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tree.nfcId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || tree.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'safe':
        return <Badge className="bg-green-600">Normal</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-600">Atenção</Badge>;
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'excellent':
        return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50">Excelente</Badge>;
      case 'good':
        return <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50">Boa</Badge>;
      case 'fair':
        return <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50">Regular</Badge>;
      case 'poor':
        return <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50">Ruim</Badge>;
      default:
        return <Badge variant="outline">Desconhecida</Badge>;
    }
  };

  const handleNewTreeClick = () => {
    setEditingTree(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (tree: Tree) => {
    setEditingTree(tree);
    setIsDialogOpen(true);
  };

  const handleViewHistory = (tree: Tree) => {
    setHistoryTree(tree);
    setIsHistoryOpen(true);
  };

  const handleSaveTree = async (data: Partial<Tree>) => {
    const dbPayload = mapTreeToDb({
      ...data,
      status: editingTree?.status || 'safe',
      health: editingTree?.health || 'excellent',
      temperature: editingTree?.temperature ?? 25.0,
      sensorConnected: editingTree?.sensorConnected ?? false,
      registrationDate: editingTree?.registrationDate || new Date().toISOString().split('T')[0],
    });

    if (editingTree) {
      const { error } = await supabase.from('trees').update(dbPayload).eq('id', editingTree.id);
      if (error) { console.error('Erro ao atualizar árvore:', error); return; }
      setTrees(prev => prev.map(t => t.id === editingTree.id ? { ...t, ...data, imageUrl: data.imageUrl || getTreeImage(data.nfcId || t.nfcId) || t.imageUrl } as Tree : t));
    } else {
      const { data: inserted, error } = await supabase.from('trees').insert(dbPayload).select().single();
      if (error) { console.error('Erro ao criar árvore:', error); return; }
      if (inserted) setTrees(prev => [mapDbTreeToFrontend(inserted), ...prev]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cadastro de Árvores</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie e monitore todas as árvores cadastradas</p>
        </div>

        <Button className="flex items-center gap-2" onClick={handleNewTreeClick}>
          <Plus className="size-4" />
          Cadastrar Nova Árvore
        </Button>
      </div>

      {/* Modal Unificado de Cadastro/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTree ? `Editando Dados: ${editingTree.species}` : 'Cadastrar Nova Árvore'}
            </DialogTitle>
          </DialogHeader>

          <TreeForm
            initialData={editingTree}
            onSave={handleSaveTree}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Histórico (Linha do Tempo) */}
      <TreeHistoryModal
        tree={historyTree}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Buscar por espécie ou ID NFC..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="safe">Normal</SelectItem>
                <SelectItem value="warning">Atenção</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Árvores */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTrees.map((tree) => (
          <Card key={tree.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 flex-1">
                  {tree.imageUrl ? (
                    <img
                      src={tree.imageUrl}
                      alt={tree.species}
                      className="size-14 rounded-md object-cover border shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="size-14 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700 flex-shrink-0">
                      <Camera className="size-6 opacity-50" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg mb-1 leading-tight">{tree.species}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono text-xs">{tree.nfcId}</p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {getStatusBadge(tree.status)}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="size-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Idade:</span>
                    <span className="font-semibold">{tree.age} anos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Thermometer className="size-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Temp:</span>
                    <span className={`font-semibold ${tree.temperature > 35 ? 'text-red-600' : tree.temperature > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {tree.temperature}°C
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Localização:</span>
                  <span className="font-mono text-xs">{tree.latitude}, {tree.longitude}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <TreePine className="size-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Dimensões:</span>
                  <span className="font-semibold">{tree.height}m alt, {tree.diameter}cm Ø</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {getHealthBadge(tree.health)}
                  <Badge variant="outline" className="capitalize bg-gray-50 dark:bg-gray-800">
                    {tree.manejo === 'sustentável' ? 'Manejo Sustentável' : 'Preservação Permanente'}
                  </Badge>
                  {tree.sensorConnected ? (
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50">
                      Sensor Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50">
                      Sensor Offline
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700">
                  Atualizado em: {new Date(tree.lastUpdate).toLocaleString('pt-BR')}
                </div>

                <div className="flex gap-2 pt-2">
                  {/* BOTÃO VER HISTÓRICO CONECTADO AO MODAL */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-gray-600 dark:text-gray-300"
                    onClick={() => handleViewHistory(tree)}
                  >
                    Ver Histórico
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(tree)}
                  >
                    Editar Dados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado Vazio (Sem resultados) */}
      {filteredTrees.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <TreePine className="size-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhuma árvore encontrada com os filtros aplicados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}