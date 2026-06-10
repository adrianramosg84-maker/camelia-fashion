import { useState, useEffect } from 'react';
import { X, TrendingUp, Calendar, ShoppingBag, DollarSign, Package, Printer } from 'lucide-react';
import { Order } from '../types';
import { subscribeToOrders } from '../services/db';

interface SalesReportProps {
  onClose: () => void;
}

export function SalesReport({ onClose }: SalesReportProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'day' | 'month'>('day');

  useEffect(() => {
    const unsub = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Solo pedidos confirmados
  const confirmed = orders.filter((o) => o.status === 'confirmed');

  const todayOrders = confirmed.filter((o) => o.date.slice(0, 10) === todayStr);
  const monthOrders = confirmed.filter((o) => {
    const d = new Date(o.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const currentOrders = view === 'day' ? todayOrders : monthOrders;

  const totalRevenue = currentOrders.reduce((s, o) => s + o.total, 0);
  const totalItems = currentOrders.reduce(
    (s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0
  );

  // Productos más vendidos
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  currentOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productSales[item.id]) {
        productSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
      }
      productSales[item.id].qty += item.quantity;
      productSales[item.id].revenue += (item.price ?? 0) * item.quantity;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Ventas por método de pago
  const byMethod: Record<string, number> = {};
  currentOrders.forEach((o) => {
    byMethod[o.paymentMethod] = (byMethod[o.paymentMethod] ?? 0) + o.total;
  });

  const monthName = now.toLocaleString('es-PE', { month: 'long', year: 'numeric' });

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Informe de Ventas - Camelia Fashion</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 24px; color: #333; }
            h1 { color: #C4A962; font-size: 22px; margin-bottom: 4px; }
            h2 { font-size: 14px; color: #777; margin-bottom: 20px; }
            .cards { display: flex; gap: 12px; margin-bottom: 20px; }
            .card { flex: 1; border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; }
            .card .value { font-size: 22px; font-weight: bold; }
            .card .label { font-size: 11px; color: #888; margin-top: 4px; }
            .green { color: #16a34a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f5f5f5; padding: 8px; text-align: left; font-size: 12px; border-bottom: 2px solid #ddd; }
            td { padding: 7px 8px; border-bottom: 1px solid #eee; font-size: 12px; }
            .section-title { font-size: 13px; font-weight: bold; margin: 16px 0 6px; color: #444; border-left: 3px solid #C4A962; padding-left: 8px; }
            .footer { font-size: 10px; color: #aaa; margin-top: 24px; text-align: right; }
          </style>
        </head>
        <body>
          <h1>Camelia Fashion — Informe de Ventas</h1>
          <h2>${view === 'day'
            ? `Reporte del día — ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}`
            : `Reporte mensual — ${monthName}`}</h2>

          <div class="cards">
            <div class="card">
              <div class="value">${currentOrders.length}</div>
              <div class="label">Pedidos confirmados</div>
            </div>
            <div class="card">
              <div class="value green">S/ ${totalRevenue.toFixed(2)}</div>
              <div class="label">Total recaudado</div>
            </div>
            <div class="card">
              <div class="value">${totalItems}</div>
              <div class="label">Unidades vendidas</div>
            </div>
          </div>

          ${topProducts.length > 0 ? `
            <div class="section-title">Productos más vendidos</div>
            <table>
              <tr><th>#</th><th>Producto</th><th>Unidades</th><th>Total</th></tr>
              ${topProducts.map((p, i) => `
                <tr>
                  <td>${i + 1}</td><td>${p.name}</td>
                  <td>${p.qty}</td>
                  <td class="green">S/ ${p.revenue.toFixed(2)}</td>
                </tr>`).join('')}
            </table>` : ''}

          ${Object.keys(byMethod).length > 0 ? `
            <div class="section-title">Por método de pago</div>
            <table>
              <tr><th>Método</th><th>Total</th></tr>
              ${Object.entries(byMethod).map(([m, a]) =>
                `<tr><td>${m}</td><td class="green">S/ ${(a as number).toFixed(2)}</td></tr>`
              ).join('')}
            </table>` : ''}

          ${currentOrders.length > 0 ? `
            <div class="section-title">Detalle de pedidos</div>
            <table>
              <tr><th>Cliente</th><th>Fecha</th><th>Método</th><th>Total</th></tr>
              ${currentOrders.map(o => `
                <tr>
                  <td>${o.customerName}</td>
                  <td>${new Date(o.date).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>${o.paymentMethod}</td>
                  <td class="green">S/ ${o.total.toFixed(2)}</td>
                </tr>`).join('')}
            </table>` : ''}

          <div class="footer">Generado el ${new Date().toLocaleString('es-PE')} — Camelia Fashion</div>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(printContent);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Informe de Ventas
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-sm font-medium transition-colors"
              title="Imprimir informe"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selector día / mes */}
        <div className="px-6 pt-4 pb-2 flex gap-2">
          <button onClick={() => setView('day')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              view === 'day' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}>
            <Calendar className="w-4 h-4" /> Hoy
          </button>
          <button onClick={() => setView('month')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              view === 'month' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}>
            <Calendar className="w-4 h-4" /> {monthName}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <>
              {/* Tarjetas resumen */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/40 rounded-lg p-4 text-center">
                  <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{currentOrders.length}</p>
                  <p className="text-xs text-muted-foreground">Pedidos</p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold text-green-600">S/ {totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total recaudado</p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-4 text-center">
                  <Package className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{totalItems}</p>
                  <p className="text-xs text-muted-foreground">Unidades vendidas</p>
                </div>
              </div>

              {currentOrders.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No hay ventas confirmadas {view === 'day' ? 'hoy' : 'este mes'}</p>
                </div>
              ) : (
                <>
                  {/* Productos más vendidos */}
                  {topProducts.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Productos más vendidos</h3>
                      <div className="space-y-2">
                        {topProducts.map((p, i) => (
                          <div key={p.name} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                              {i + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.qty} unidades</p>
                            </div>
                            <span className="text-sm font-semibold text-green-600">
                              S/ {p.revenue.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Por método de pago */}
                  {Object.keys(byMethod).length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Por método de pago</h3>
                      <div className="space-y-2">
                        {Object.entries(byMethod).map(([method, amount]) => (
                          <div key={method} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg text-sm">
                            <span>{method}</span>
                            <span className="font-semibold">S/ {amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lista de pedidos del período */}
                  <div>
                    <h3 className="font-semibold mb-3">Detalle de pedidos</h3>
                    <div className="space-y-2">
                      {currentOrders.map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-3 border border-border rounded-lg text-sm">
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.date).toLocaleString('es-PE', {
                                day: '2-digit', month: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                              })} · {order.paymentMethod}
                            </p>
                          </div>
                          <span className="font-bold text-green-600">S/ {order.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
