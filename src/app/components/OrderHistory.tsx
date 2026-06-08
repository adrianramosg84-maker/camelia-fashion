import { useState, useEffect } from 'react';
import { X, Package, ChevronDown, ChevronUp, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Order } from '../types';
import { subscribeToOrders, deleteOrder, updateOrderStatus, saveProduct } from '../services/db';
import { subscribeToProducts } from '../services/db';
import { Product } from '../types';

interface OrderHistoryProps {
  onClose: () => void;
}

export function OrderHistory({ onClose }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubOrders = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
    });
    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  const handleConfirm = async (order: Order) => {
    if (!window.confirm(`¿Confirmar pago del pedido #${order.id.slice(-6)}?\n\nEsto descontará el stock de los productos.`)) return;
    setProcessingId(order.id);

    // Descontar stock de cada producto
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.id);
      if (product) {
        await saveProduct({ ...product, stock: Math.max(0, product.stock - item.quantity) });
      }
    }

    await updateOrderStatus(order.id, 'confirmed');
    setProcessingId(null);
  };

  const handleReject = async (order: Order) => {
    if (!window.confirm(`¿Rechazar el pedido #${order.id.slice(-6)}?\n\nEl stock NO se descontará.`)) return;
    setProcessingId(order.id);
    await updateOrderStatus(order.id, 'rejected');
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este pedido del historial?')) return;
    await deleteOrder(id);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
  const rejectedOrders = orders.filter((o) => o.status === 'rejected');

  const statusBadge = (status: string) => {
    if (status === 'confirmed') return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Confirmado</span>;
    if (status === 'rejected') return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Rechazado</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1"><Clock className="w-3 h-3" />Pendiente</span>;
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <div key={order.id} className="border border-border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpandedId((prev) => (prev === order.id ? null : order.id))}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">#{order.id.slice(-6)}</span>
            {statusBadge(order.status)}
          </div>
          <p className="font-medium truncate">{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{formatDate(order.date)} · {order.paymentMethod}</p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <span className="font-bold text-primary">S/ {order.total.toFixed(2)}</span>
          {expandedId === order.id
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expandedId === order.id && (
        <div className="border-t border-border p-4 bg-secondary/20 space-y-3">
          {/* Datos del cliente */}
          <div className="text-sm space-y-1">
            <p><strong>Email:</strong> {order.customerEmail}</p>
            <p><strong>Dirección:</strong> {order.address}, {order.city} {order.zipCode}</p>
          </div>

          {/* Productos */}
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

          {/* Botones de acción — solo para pedidos pendientes */}
          {order.status === 'pending' && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={() => handleConfirm(order)}
                disabled={processingId === order.id}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {processingId === order.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Confirmar pago
              </button>
              <button
                onClick={() => handleReject(order)}
                disabled={processingId === order.id}
                className="flex-1 flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Rechazar
              </button>
            </div>
          )}

          {/* Eliminar */}
          <div className="flex justify-end">
            <button
              onClick={() => handleDelete(order.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Eliminar del historial
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
            <Package className="w-5 h-5" /> Historial de Pedidos
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen */}
        {orders.length > 0 && (
          <div className="px-6 py-3 border-b border-border flex gap-4 flex-wrap text-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Pendientes: <strong>{pendingOrders.length}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Confirmados: <strong>{confirmedOrders.length}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Rechazados: <strong>{rejectedOrders.length}</strong>
            </span>
            <span className="ml-auto text-muted-foreground">
              Total confirmado:{' '}
              <strong className="text-foreground">
                S/ {confirmedOrders.reduce((s, o) => s + o.total, 0).toFixed(2)}
              </strong>
            </span>
          </div>
        )}

        {/* Lista */}
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
              {/* Pendientes primero */}
              {pendingOrders.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase mb-2">⏳ Pendientes de confirmar</p>
                  <div className="space-y-2">
                    {pendingOrders.map((order) => <OrderCard key={order.id} order={order} />)}
                  </div>
                </div>
              )}
              {confirmedOrders.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-green-600 uppercase mb-2">✅ Confirmados</p>
                  <div className="space-y-2">
                    {confirmedOrders.map((order) => <OrderCard key={order.id} order={order} />)}
                  </div>
                </div>
              )}
              {rejectedOrders.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-red-600 uppercase mb-2">❌ Rechazados</p>
                  <div className="space-y-2">
                    {rejectedOrders.map((order) => <OrderCard key={order.id} order={order} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
