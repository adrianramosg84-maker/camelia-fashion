import { useState, useEffect } from 'react';
import { X, Package, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Order } from '../types';
import { subscribeToOrders, deleteOrder } from '../services/db';

interface OrderHistoryProps {
  onClose: () => void;
}

export function OrderHistory({ onClose }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este pedido del historial?')) return;
    await deleteOrder(id);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
            <Package className="w-5 h-5" /> Historial de Pedidos
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5" /></button>
        </div>

        {orders.length > 0 && (
          <div className="px-6 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} —{' '}
              <span className="font-semibold text-foreground">S/ {orders.reduce((s, o) => s + o.total, 0).toFixed(2)}</span> acumulado
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Aún no hay pedidos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => setExpandedId((prev) => (prev === order.id ? null : order.id))}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">#{order.id.slice(-6)}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pendiente</span>
                      </div>
                      <p className="font-medium truncate">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.date)} · {order.paymentMethod}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="font-bold text-primary">S/ {order.total.toFixed(2)}</span>
                      {expandedId === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                  {expandedId === order.id && (
                    <div className="border-t border-border p-4 bg-secondary/20 space-y-3">
                      <div className="text-sm space-y-1">
                        <p><strong>Email:</strong> {order.customerEmail}</p>
                        <p><strong>Dirección:</strong> {order.address}, {order.city} {order.zipCode}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-2">Productos:</p>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                              <span>{item.name} × {item.quantity}</span>
                              <span>S/ {((item.price ?? 0) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-border">
                        <button onClick={() => handleDelete(order.id)} className="flex items-center gap-1 text-xs text-destructive hover:underline">
                          <Trash2 className="w-3 h-3" /> Eliminar pedido
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
