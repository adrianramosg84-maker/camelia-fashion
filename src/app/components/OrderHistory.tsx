import { useState } from 'react';
import { X, Package, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryProps {
  onClose: () => void;
}

export function OrderHistory({ onClose }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>(() => {
    return JSON.parse(localStorage.getItem('camelia-orders') ?? '[]');
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('¿Eliminar este pedido del historial?')) return;
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    localStorage.setItem('camelia-orders', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (!window.confirm('¿Eliminar todo el historial de pedidos? Esta acción no se puede deshacer.')) return;
    setOrders([]);
    localStorage.removeItem('camelia-orders');
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
            <Package className="w-5 h-5" />
            Historial de Pedidos
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen */}
        {orders.length > 0 && (
          <div className="px-6 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total —{' '}
              <span className="font-semibold text-foreground">
                S/{' '}
                {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
              </span>{' '}
              acumulado
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-destructive hover:underline"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Aún no hay pedidos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  {/* Fila resumen */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{order.id}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {order.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="font-medium truncate">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.date)} · {order.paymentMethod}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="font-bold text-primary">
                        S/ {order.total.toFixed(2)}
                      </span>
                      {expandedId === order.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Detalle expandible */}
                  {expandedId === order.id && (
                    <div className="border-t border-border p-4 bg-secondary/20 space-y-3">
                      {/* Datos del cliente */}
                      <div className="text-sm space-y-1">
                        <p><strong>Email:</strong> {order.customerEmail}</p>
                        <p>
                          <strong>Dirección:</strong> {order.address}, {order.city}{' '}
                          {order.zipCode}
                        </p>
                      </div>

                      {/* Productos */}
                      <div>
                        <p className="text-sm font-semibold mb-2">Productos:</p>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm text-muted-foreground"
                            >
                              <span>
                                {item.name} × {item.quantity}
                              </span>
                              <span>
                                S/ {((item.price ?? 0) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex justify-end pt-2 border-t border-border">
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="flex items-center gap-1 text-xs text-destructive hover:underline"
                        >
                          <Trash2 className="w-3 h-3" />
                          Eliminar pedido
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
