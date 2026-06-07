import { useState } from 'react';
import { X, Trash2, Edit, Search } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface InventoryListProps {
  products: Product[];
  onDeleteProduct: (id: number) => void;
  onEditProduct: (product: Product) => void;
  onClose: () => void;
}

export function InventoryList({
  products,
  onDeleteProduct,
  onEditProduct,
  onClose,
}: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (product: Product) => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar "${product.name}"?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      onDeleteProduct(product.id);
    }
  };

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStock = products.filter((p) => p.stock === 0).length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary">Gestionar Inventario</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen de inventario */}
        <div className="px-6 pt-4 pb-2 flex gap-4 flex-wrap">
          <div className="bg-secondary/50 rounded-lg px-4 py-2 text-sm">
            <span className="text-muted-foreground">Total productos: </span>
            <span className="font-semibold">{products.length}</span>
          </div>
          <div className="bg-secondary/50 rounded-lg px-4 py-2 text-sm">
            <span className="text-muted-foreground">Unidades en stock: </span>
            <span className="font-semibold">{totalStock}</span>
          </div>
          {outOfStock > 0 && (
            <div className="bg-destructive/10 rounded-lg px-4 py-2 text-sm">
              <span className="text-destructive">Agotados: </span>
              <span className="font-semibold text-destructive">{outOfStock}</span>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="p-6 pt-2 border-b border-border space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input-background"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-border rounded-md bg-input-background"
            >
              <option value="Todos">Todas las categorías</option>
              <option value="Mujer">Mujer</option>
              <option value="Niños">Niños</option>
              <option value="Accesorios">Accesorios</option>
            </select>
          </div>
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredProducts.length} de {products.length} producto
            {products.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              {searchTerm || filterCategory !== 'Todos'
                ? 'No se encontraron productos con esos filtros'
                : 'No hay productos en el inventario'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-24 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      {product.price !== undefined && (
                        <span className="font-semibold text-primary whitespace-nowrap">
                          S/ {product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={`text-sm ${
                          product.stock === 0 ? 'text-destructive' : 'text-accent'
                        }`}
                      >
                        Stock: {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
                      </span>
                      {product.stock === 0 && (
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                          Agotado
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="p-2 hover:bg-primary/10 text-primary rounded transition-colors"
                      title="Editar producto"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
