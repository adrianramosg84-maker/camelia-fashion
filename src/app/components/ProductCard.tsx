import { useState } from 'react';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductComments } from './ProductComments';

export type { Product };

const COLOR_MAP: Record<string, string> = {
  Negro: '#1a1a1a', Blanco: '#ffffff', Rojo: '#ef4444', Rosa: '#ec4899',
  Azul: '#3b82f6', Verde: '#22c55e', Amarillo: '#eab308', Morado: '#a855f7',
  Naranja: '#f97316', Gris: '#6b7280', Beige: '#d4b896', Celeste: '#7dd3fc',
};

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length === 1 ? product.sizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors && product.colors.length === 1 ? product.colors[0] : undefined
  );
  const [showComments, setShowComments] = useState(false);

  const needsSize = product.sizes && product.sizes.length > 0;
  const needsColor = product.colors && product.colors.length > 0;
  const canAdd = !isOutOfStock && (!needsSize || selectedSize) && (!needsColor || selectedColor);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-xl hover:shadow-primary/10 flex flex-col">
      {/* Imagen */}
      <div className="aspect-[3/4] overflow-hidden bg-muted relative">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Agotado</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Nombre, categoría y precio */}
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.category}</p>
          </div>
          {product.price !== undefined && (
            <p className="text-lg font-bold text-primary ml-2">S/ {product.price.toFixed(2)}</p>
          )}
        </div>

        {/* Descripción */}
        {product.description && (
          <p className="text-sm text-muted-foreground mt-1 mb-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Stock */}
        <p className="text-sm text-accent mb-2">
          Disponible:{' '}
          <span className="font-semibold">
            {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
          </span>
        </p>

        {/* Selector de tallas */}
        {needsSize && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Talla:</p>
            <div className="flex flex-wrap gap-1">
              {product.sizes!.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-1 text-xs rounded border transition-all ${
                    selectedSize === size
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de colores */}
        {needsColor && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">
              Color: {selectedColor && <span className="font-medium text-foreground">{selectedColor}</span>}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.colors!.map((color) => {
                const hex = COLOR_MAP[color];
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-primary scale-110 shadow-md'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex ?? color }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Aviso si falta seleccionar */}
        {!isOutOfStock && !canAdd && (
          <p className="text-xs text-amber-600 mb-1">
            {!selectedSize && needsSize && !selectedColor && needsColor
              ? 'Selecciona talla y color'
              : !selectedSize && needsSize
              ? 'Selecciona una talla'
              : 'Selecciona un color'}
          </p>
        )}

        {/* Botón agregar */}
        <button
          onClick={() => canAdd && onAddToCart(product, selectedSize, selectedColor)}
          disabled={!canAdd}
          className={`mt-auto w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
            !canAdd
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-md'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isOutOfStock ? 'Agotado' : 'Agregar'}
        </button>

        {/* Botón comentarios */}
        <button
          onClick={() => setShowComments(true)}
          className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 px-4 rounded-md border border-border text-sm text-muted-foreground hover:bg-secondary transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          Comentarios
        </button>
      </div>

      {/* Modal comentarios */}
      {showComments && (
        <ProductComments product={product} onClose={() => setShowComments(false)} />
      )}
    </div>
  );
}
  );
}
