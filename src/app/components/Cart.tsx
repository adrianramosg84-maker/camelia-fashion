import { useState } from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';
import { Checkout } from './Checkout';
import { ImageWithFallback } from './figma/ImageWithFallback';

const COLOR_MAP: Record<string, string> = {
  Negro: '#1a1a1a', Blanco: '#ffffff', Rojo: '#ef4444', Rosa: '#ec4899',
  Azul: '#3b82f6', Verde: '#22c55e', Amarillo: '#eab308', Morado: '#a855f7',
  Naranja: '#f97316', Gris: '#6b7280', Beige: '#d4b896', Celeste: '#7dd3fc',
};

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  onRemove: (id: number, selectedSize?: string, selectedColor?: string) => void;
  onClearCart: () => void;
  onPurchaseSuccess: (items: CartItem[]) => void;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemove, onClearCart, onPurchaseSuccess }: CartProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const total = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

  const handleCheckoutSuccess = () => {
    onPurchaseSuccess(items);
    onClearCart();
    setShowCheckout(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-xl flex flex-col">
        {showCheckout ? (
          <Checkout total={total} items={items} onBack={() => setShowCheckout(false)} onSuccess={handleCheckoutSuccess} />
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2>Carrito de compras</h2>
              <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">Tu carrito está vacío</div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="flex gap-4 border-b pb-4">
                      <ImageWithFallback src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          {item.price !== undefined && (
                            <span className="font-semibold text-primary text-sm">S/ {item.price.toFixed(2)}</span>
                          )}
                        </div>

                        {/* Talla y color seleccionados */}
                        <div className="flex items-center gap-2 mb-1">
                          {item.selectedSize && (
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded font-medium">
                              {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="flex items-center gap-1 text-xs bg-secondary px-2 py-0.5 rounded">
                              <span
                                className="w-3 h-3 rounded-full inline-block border border-border"
                                style={{ backgroundColor: COLOR_MAP[item.selectedColor] ?? item.selectedColor }}
                              />
                              {item.selectedColor}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">{item.category}</p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1), item.selectedSize, item.selectedColor)}
                            className="p-1 hover:bg-secondary rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => {
                              if (item.quantity < item.stock) {
                                onUpdateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor);
                              }
                            }}
                            disabled={item.quantity >= item.stock}
                            className="p-1 hover:bg-secondary rounded disabled:opacity-40 disabled:cursor-not-allowed"
                            title={item.quantity >= item.stock ? 'Stock máximo alcanzado' : 'Aumentar cantidad'}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <span className="ml-2 text-sm font-semibold">
                            S/ {((item.price ?? 0) * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => onRemove(item.id, item.selectedSize, item.selectedColor)}
                            className="ml-auto p-1 hover:bg-destructive/10 text-destructive rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {item.quantity >= item.stock && (
                          <p className="text-xs text-amber-600 mt-1">Máximo: {item.stock} unidades</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-6">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">S/ {total.toFixed(2)}</span>
                </div>
                <button onClick={() => setShowCheckout(true)}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:opacity-90 transition-all hover:shadow-md">
                  Proceder al pago
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
