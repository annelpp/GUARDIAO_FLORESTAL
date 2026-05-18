import { useState, useEffect } from 'react';
import { Camera, Upload, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tree } from '../data/mockData';

interface TreeFormProps {
  initialData?: Tree | null;
  onSave: (data: Partial<Tree>) => void;
  onCancel: () => void;
}

export default function TreeForm({ initialData, onSave, onCancel }: TreeFormProps) {
  const [formData, setFormData] = useState<Partial<Tree>>({
    species: '',
    nfcId: '',
    age: 0,
    manejo: 'sustentável',
    diameter: 0,
    height: 0,
    imageUrl: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Carrega os dados se for modo Edição
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.imageUrl) setImagePreview(initialData.imageUrl);
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção de Imagem */}
        <div className="space-y-2">
          <Label>Foto da Árvore</Label>
          <div className="relative h-48 w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center overflow-hidden group">
            {imagePreview ? (
              <>
                <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload className="text-white size-6" />
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 dark:text-gray-500">
                <Camera className="mx-auto size-10 mb-2" />
                <span className="text-xs">Anexar arquivo de imagem</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Campos de Texto */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="species">Espécie</Label>
            <Input 
              id="species" 
              value={formData.species} 
              onChange={(e) => setFormData({...formData, species: e.target.value})}
              placeholder="Ex: Ipê Roxo" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nfcId">ID do NFC</Label>
            <Input 
              id="nfcId" 
              value={formData.nfcId} 
              onChange={(e) => setFormData({...formData, nfcId: e.target.value})}
              placeholder="NFC-XXX-000" 
              required 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Idade (anos)</Label>
          <Input 
            id="age" 
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manejo">Manejo</Label>
          <Input 
            id="manejo" 
            value={formData.manejo}
            onChange={(e) => setFormData({...formData, manejo: e.target.value})}
            placeholder="sustentável / permanente"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="diameter">Diâmetro (cm)</Label>
          <Input 
            id="diameter" 
            type="number"
            value={formData.diameter} 
            onChange={(e) => setFormData({...formData, diameter: Number(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Altura (m)</Label>
          <Input 
            id="height" 
            type="number"
            value={formData.height} 
            onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <Save className="size-4 mr-2" />
          {initialData ? 'Salvar Alterações' : 'Cadastrar Árvore'}
        </Button>
      </div>
    </form>
  );
}