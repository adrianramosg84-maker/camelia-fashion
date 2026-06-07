import { useState } from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';
import { Checkout } from './Checkout';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  onClearCart: () => void;
  onPurchaseSuccess: (items: CartItem[]) => void;
}

export function Cart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onClearCart,
  onPurchaseSuccess,
}: CartProps) {
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
          <Checkout
            total={total}
            items={items}
            onBack={() => setShowCheckout(false)}
            onSuccess={handleCheckoutSuccess}
          />
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
                <div className="text-center text-muted-foreground py-12">
                  Tu carrito está vacío
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b pb-4">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium">{item.name}</h3>
                          {item.price !== undefined && (
                            <span className="font-semibold text-primary">
                              S/ {item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {/* Botón "-" — mínimo 1 */}
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:bg-secondary rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          {/* Botón "+" — máximo = stock disponible */}
                          <button
                            onClick={() => {
                              if (item.quantity < item.stock) {
                                onUpdateQuantity(item.id, item.quantity + 1);
                              }
                            }}
                            disabled={item.quantity >= item.stock}
                            className="p-1 hover:bg-secondary rounded disabled:opacity-40 disabled:cursor-not-allowed"
                            title={
                              item.quantity >= item.stock
                                ? 'Stock máximo alcanzado'
                                : 'Aumentar cantidad'
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <span className="ml-2 text-sm font-semibold">
                            S/ {((item.price ?? 0) * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="ml-auto p-1 hover:bg-destructive/10 text-destructive rounded"
                            title="Eliminar del carrito"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Aviso de stock máximo */}
                        {item.quantity >= item.stock && (
                          <p className="text-xs text-amber-600 mt-1">
                            Máximo disponible: {item.stock} unidades
                          </p>
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
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:opacity-90 transition-all hover:shadow-md"
                >
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
