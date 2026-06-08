import { useState, useEffect } from 'react';
import { Upload, X, Plus } from 'lucide-react';
import { Product } from '../types';

interface InventoryManagerProps {
  onAddProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  editProduct?: Product | null;
  onClose: () => void;
}

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const PRESET_COLORS = [
  { name: 'Negro', hex: '#1a1a1a' },
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Verde', hex: '#22c55e' },
  { name: 'Amarillo', hex: '#eab308' },
  { name: 'Morado', hex: '#a855f7' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Gris', hex: '#6b7280' },
  { name: 'Beige', hex: '#d4b896' },
  { name: 'Celeste', hex: '#7dd3fc' },
];

export function InventoryManager({ onAddProduct, onUpdateProduct, editProduct, onClose }: InventoryManagerProps) {
  const isEditing = !!editProduct;
  const [formData, setFormData] = useState({
    name: '', price: '', stock: '', category: 'Mujer', description: '', image: '',
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [imageIsUrl, setImageIsUrl] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name,
        price: editProduct.price?.toString() ?? '',
        stock: editProduct.stock.toString(),
        category: editProduct.category,
        description: editProduct.description ?? '',
        image: editProduct.image,
      });
      setPreviewImage(editProduct.image);
      setImageIsUrl(!editProduct.image.startsWith('data:'));
      setSelectedSizes(editProduct.sizes ?? []);
      setSelectedColors(editProduct.colors ?? []);
    }
  }, [editProduct]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const addCustomColor = () => {
    const trimmed = customColor.trim();
    if (trimmed && !selectedColors.includes(trimmed)) {
      setSelectedColors((prev) => [...prev, trimmed]);
      setCustomColor('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('La imagen es mayor a 500 KB. Se recomienda usar imágenes más pequeñas o una URL externa.');
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      setImageIsUrl(false);
      setFormData((prev) => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image: url }));
    setPreviewImage(url);
    setImageIsUrl(true);
  };

  const clearImage = () => {
    setPreviewImage('');
    setImageIsUrl(false);
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameClean = formData.name.trim();
    if (nameClean && formData.price && formData.stock && formData.image) {
      const productData: Product = {
        id: editProduct?.id ?? Date.now(),
        name: nameClean,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        category: formData.category,
        description: formData.description.trim(),
        image: formData.image,
        sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
        colors: selectedColors.length > 0 ? selectedColors : undefined,
      };
      if (isEditing && onUpdateProduct) {
        onUpdateProduct(productData);
      } else {
        onAddProduct(productData);
      }
      setFormData({ name: '', price: '', stock: '', category: 'Mujer', description: '', image: '' });
      setPreviewImage('');
      setSelectedSizes([]);
      setSelectedColors([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary">
            {isEditing ? 'Editar Prenda' : 'Agregar Prenda al Inventario'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Imagen */}
          <div>
            <label className="block mb-2">Foto de la prenda *</label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              {previewImage ? (
                <div className="relative">
                  <img src={previewImage} alt="Preview" className="w-full h-48 object-cover rounded" onError={() => setPreviewImage('')} />
                  <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click para subir imagen</span>
                    <span className="text-xs text-muted-foreground mt-1">Recomendado: menos de 500 KB</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <div className="flex items-center gap-2">
                    <hr className="flex-1 border-border" />
                    <span className="text-xs text-muted-foreground">o usa una URL</span>
                    <hr className="flex-1 border-border" />
                  </div>
                  <input type="url" onChange={handleImageUrlChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input-background text-sm"
                    placeholder="https://ejemplo.com/imagen.jpg" />
                </div>
              )}
            </div>
            {imageIsUrl && <p className="text-xs text-muted-foreground mt-1">Usando URL externa.</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className="block mb-2">Nombre de la prenda *</label>
            <input type="text" value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-border rounded-md bg-input-background"
              placeholder="Ej: Vestido floral" required />
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Precio *</label>
              <input type="number" step="0.01" min="0" value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-md bg-input-background"
                placeholder="0.00" required />
            </div>
            <div>
              <label className="block mb-2">Cantidad *</label>
              <input type="number" min="0" value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-md bg-input-background"
                placeholder="0" required />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block mb-2">Categoría *</label>
            <select value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-border rounded-md bg-input-background">
              <option value="Mujer">Mujer</option>
              <option value="Niños">Niños</option>
              <option value="Accesorios">Accesorios</option>
            </select>
          </div>

          {/* Tallas */}
          <div>
            <label className="block mb-2">Tallas disponibles</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => (
                <button key={size} type="button" onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 rounded-md border-2 text-sm font-medium transition-all ${
                    selectedSizes.includes(size)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  }`}>
                  {size}
                </button>
              ))}
            </div>
            {selectedSizes.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">Sin tallas = talla única</p>
            )}
          </div>

          {/* Colores */}
          <div>
            <label className="block mb-2">Colores disponibles</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_COLORS.map((color) => (
                <button key={color.name} type="button" onClick={() => toggleColor(color.name)}
                  title={color.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColors.includes(color.name)
                      ? 'border-primary scale-110 shadow-md'
                      : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
            {/* Color personalizado */}
            <div className="flex gap-2">
              <input type="text" value={customColor} onChange={(e) => setCustomColor(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-border rounded-md bg-input-background text-sm"
                placeholder="Otro color (ej: Vino, Coral...)"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomColor(); } }} />
              <button type="button" onClick={addCustomColor}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80">
                + Agregar
              </button>
            </div>
            {/* Colores seleccionados */}
            {selectedColors.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedColors.map((color) => {
                  const preset = PRESET_COLORS.find((c) => c.name === color);
                  return (
                    <span key={color}
                      className="flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-xs">
                      {preset && (
                        <span className="w-3 h-3 rounded-full inline-block border border-border"
                          style={{ backgroundColor: preset.hex }} />
                      )}
                      {color}
                      <button type="button" onClick={() => toggleColor(color)} className="ml-1 hover:text-destructive">×</button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block mb-2">Descripción</label>
            <textarea value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-border rounded-md bg-input-background"
              placeholder="Descripción de la prenda..." rows={3} />
          </div>

          <button type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:opacity-90 transition-all hover:shadow-md flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            {isEditing ? 'Actualizar Producto' : 'Agregar al Inventario'}
          </button>
        </form>
      </div>
    </div>
  );
}
