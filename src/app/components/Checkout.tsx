import { useState, useEffect } from 'react';
import { CreditCard, Lock, ArrowLeft, Smartphone, Building2, CheckCircle2, MessageCircle } from 'lucide-react';
import { CartItem, PaymentConfig, Order } from '../types';
import { saveOrder, subscribeToPaymentConfig } from '../services/db';

interface CheckoutProps {
  total: number;
  items: CartItem[];
  onBack: () => void;
  onSuccess: () => void;
}

export function Checkout({ total, items, onBack, onSuccess }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'yape' | 'plin' | 'paypal'>('transfer');
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', city: '', zipCode: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);

  useEffect(() => {
    const unsub = subscribeToPaymentConfig((cfg) => {
      setPaymentConfig(cfg);
      if (cfg) {
        if (cfg.accountNumber) setPaymentMethod('transfer');
        else if (cfg.yapeNumber) setPaymentMethod('yape');
        else if (cfg.plinNumber) setPaymentMethod('plin');
        else if (cfg.paypalEmail) setPaymentMethod('paypal');
      }
    });
    return () => unsub();
  }, []);

  const availableMethods = paymentConfig ? [
    paymentConfig.accountNumber ? 'transfer' : null,
    paymentConfig.yapeNumber ? 'yape' : null,
    paymentConfig.plinNumber ? 'plin' : null,
    paymentConfig.paypalEmail ? 'paypal' : null,
  ].filter(Boolean) : [];

  const buildWhatsappMessage = (order: Order) => {
    const itemsList = order.items.map((i) => `• ${i.name} x${i.quantity} — S/ ${((i.price ?? 0) * i.quantity).toFixed(2)}`).join('\n');
    return `*Nuevo pedido #${order.id.slice(-6)}*\n\n*Cliente:* ${order.customerName}\n*Email:* ${order.customerEmail}\n*Dirección:* ${order.address}, ${order.city} ${order.zipCode}\n\n*Productos:*\n${itemsList}\n\n*Total: S/ ${order.total.toFixed(2)}*\n*Método:* ${order.paymentMethod}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));

    const methodLabels: Record<string, string> = { transfer: 'Transferencia bancaria', yape: 'Yape', plin: 'Plin', paypal: 'PayPal' };
    const order: Order = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      customerName: formData.name,
      customerEmail: formData.email,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipCode,
      items: [...items],
      total,
      paymentMethod: methodLabels[paymentMethod] ?? paymentMethod,
      status: 'pending',
    };

    await saveOrder(order);
    setIsProcessing(false);
    setOrderConfirmed(order);
  };

  // ─── Confirmación ───────────────────────────────────────────────────────────
  if (orderConfirmed) {
    const whatsappMsg = encodeURIComponent(buildWhatsappMessage(orderConfirmed));
    const whatsappNumber = paymentConfig?.whatsappNumber?.replace(/\D/g, '') ?? '';
    const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${whatsappMsg}` : `https://wa.me/?text=${whatsappMsg}`;

    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-6 overflow-y-auto">
        <CheckCircle2 className="w-20 h-20 text-green-500" />
        <div>
          <h2 className="text-2xl font-bold mb-2">¡Pedido recibido!</h2>
          <p className="text-muted-foreground text-sm">Pedido #{orderConfirmed.id.slice(-6)}</p>
        </div>

        <div className="w-full bg-secondary/40 rounded-lg p-4 text-left text-sm space-y-2">
          {paymentMethod === 'transfer' && paymentConfig && (<>
            <p className="font-semibold text-base mb-3">Datos para transferencia:</p>
            <p><strong>Banco:</strong> {paymentConfig.bankName}</p>
            <p><strong>Titular:</strong> {paymentConfig.accountHolder}</p>
            <p><strong>Tipo:</strong> {paymentConfig.accountType === 'ahorros' ? 'Ahorros' : 'Corriente'}</p>
            <p><strong>Cuenta:</strong> {paymentConfig.accountNumber}</p>
            <p className="pt-2 border-t border-border"><strong>Monto:</strong> <span className="text-primary text-base">S/ {orderConfirmed.total.toFixed(2)}</span></p>
          </>)}
          {paymentMethod === 'yape' && paymentConfig && (<>
            <p className="font-semibold text-base mb-3">Pagar con Yape:</p>
            {paymentConfig.yapeQR && <img src={paymentConfig.yapeQR} alt="QR Yape" className="w-36 h-36 mx-auto mb-2 object-contain" />}
            <p><strong>Número:</strong> {paymentConfig.yapeNumber}</p>
            <p className="pt-2 border-t border-border"><strong>Monto:</strong> <span className="text-primary text-base">S/ {orderConfirmed.total.toFixed(2)}</span></p>
          </>)}
          {paymentMethod === 'plin' && paymentConfig && (<>
            <p className="font-semibold text-base mb-3">Pagar con Plin:</p>
            {paymentConfig.plinQR && <img src={paymentConfig.plinQR} alt="QR Plin" className="w-36 h-36 mx-auto mb-2 object-contain" />}
            <p><strong>Número:</strong> {paymentConfig.plinNumber}</p>
            <p className="pt-2 border-t border-border"><strong>Monto:</strong> <span className="text-primary text-base">S/ {orderConfirmed.total.toFixed(2)}</span></p>
          </>)}
          {paymentMethod === 'paypal' && paymentConfig && (<>
            <p className="font-semibold text-base mb-3">Pagar con PayPal:</p>
            <p><strong>Email:</strong> {paymentConfig.paypalEmail}</p>
            <p className="pt-2 border-t border-border"><strong>Monto:</strong> <span className="text-primary text-base">S/ {orderConfirmed.total.toFixed(2)}</span></p>
          </>)}
        </div>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-md transition-colors font-medium">
          <MessageCircle className="w-5 h-5" />
          Enviar comprobante por WhatsApp
        </a>
        <button onClick={onSuccess} className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:opacity-90 transition-all">
          Volver a la tienda
        </button>
      </div>
    );
  }

  // ─── Sin métodos configurados ───────────────────────────────────────────────
  if (availableMethods.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4">
        <CreditCard className="w-16 h-16 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Métodos de pago no configurados</h3>
        <p className="text-sm text-muted-foreground">La tienda aún no tiene métodos de pago. Por favor intenta más tarde.</p>
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-2">
          <ArrowLeft className="w-4 h-4" /> Volver al carrito
        </button>
      </div>
    );
  }

  // ─── Formulario ─────────────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 border-b border-border">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver al carrito
        </button>
        <h2 className="text-xl font-semibold">Finalizar Compra</h2>
        <div className="mt-4 bg-secondary p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total a pagar:</span>
            <span className="text-2xl font-bold text-primary">S/ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Método de Pago</h3>
          <div className="grid grid-cols-2 gap-3">
            {paymentConfig?.accountNumber && (
              <button type="button" onClick={() => setPaymentMethod('transfer')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${paymentMethod === 'transfer' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                <Building2 className="w-5 h-5 mb-2 text-primary" />
                <div className="font-medium text-sm">Transferencia</div>
                <div className="text-xs text-muted-foreground">Bancaria</div>
              </button>
            )}
            {paymentConfig?.yapeNumber && (
              <button type="button" onClick={() => setPaymentMethod('yape')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${paymentMethod === 'yape' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                <Smartphone className="w-5 h-5 mb-2 text-primary" />
                <div className="font-medium text-sm">Yape</div>
                <div className="text-xs text-muted-foreground">Pago móvil</div>
              </button>
            )}
            {paymentConfig?.plinNumber && (
              <button type="button" onClick={() => setPaymentMethod('plin')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${paymentMethod === 'plin' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                <Smartphone className="w-5 h-5 mb-2 text-primary" />
                <div className="font-medium text-sm">Plin</div>
                <div className="text-xs text-muted-foreground">Pago móvil</div>
              </button>
            )}
            {paymentConfig?.paypalEmail && (
              <button type="button" onClick={() => setPaymentMethod('paypal')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${paymentMethod === 'paypal' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                <CreditCard className="w-5 h-5 mb-2 text-primary" />
                <div className="font-medium text-sm">PayPal</div>
                <div className="text-xs text-muted-foreground">Internacional</div>
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Lock className="w-4 h-4" />Información de Contacto y Envío</h3>
          <div className="space-y-4">
            {[
              { label: 'Nombre completo', key: 'name', type: 'text', placeholder: 'Juan Pérez' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'tu@email.com' },
              { label: 'Dirección', key: 'address', type: 'text', placeholder: 'Calle Principal 123' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm mb-2">{label} *</label>
                <input type={type} value={formData[key as keyof typeof formData]}
                  onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input-background" placeholder={placeholder} required />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Ciudad *</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input-background" placeholder="Lima" required />
              </div>
              <div>
                <label className="block text-sm mb-2">Código Postal *</label>
                <input type="text" value={formData.zipCode} onChange={(e) => setFormData((p) => ({ ...p, zipCode: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input-background" placeholder="15001" required />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <button type="submit" disabled={isProcessing}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing ? (
              <><div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />Procesando...</>
            ) : (
              <><Lock className="w-5 h-5" />Confirmar Pedido — S/ {total.toFixed(2)}</>
            )}
          </button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            <Lock className="w-3 h-3 inline mr-1" />Pago seguro y encriptado
          </p>
        </div>
      </form>
    </div>
  );
}
