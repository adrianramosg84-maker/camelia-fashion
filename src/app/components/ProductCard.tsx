import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

export type { Product };

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-xl hover:shadow-primary/10">
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
      <div className="p-4">
        <div className="mb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.category}</p>
            </div>
            {product.price !== undefined && (
              <p className="text-lg font-bold text-primary">S/ {product.price.toFixed(2)}</p>
            )}
          </div>
          <p className="text-sm text-accent mt-1">
            Disponible:{' '}
            <span className="font-semibold">
              {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
            </span>
          </p>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
            isOutOfStock
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-md'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isOutOfStock ? 'Agotado' : 'Agregar'}
        </button>
      </div>
    </div>
  );
}
