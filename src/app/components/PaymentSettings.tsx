import { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { PaymentConfig } from '../types';
import { savePaymentConfig, subscribeToPaymentConfig } from '../services/db';

interface PaymentSettingsProps {
  onClose: () => void;
}

const DEFAULT_CONFIG: PaymentConfig = {
  accountNumber: '', accountHolder: '', bankName: '', accountType: 'ahorros',
  yapeNumber: '', plinNumber: '', yapeQR: '', plinQR: '', paypalEmail: '', whatsappNumber: '',
};

export function PaymentSettings({ onClose }: PaymentSettingsProps) {
  const [config, setConfig] = useState<PaymentConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPaymentConfig((cfg) => {
      if (cfg) setConfig({ ...DEFAULT_CONFIG, ...cfg });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = (field: 'yapeQR' | 'plinQR') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setConfig((prev) => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    await savePaymentConfig(config);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-card rounded-lg p-8 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Cargando configuración...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10 rounded-t-lg">
          <h2 className="text-xl font-semibold text-primary">Configurar Métodos de Pago</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* WhatsApp */}
          <div className="border border-green-200 bg-green-50/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-lg">💬 WhatsApp de contacto</h3>
            <p className="text-sm text-muted-foreground mb-3">Número al que tus clientes enviarán el comprobante. Incluye código de país (ej: 51 para Perú).</p>
            <input type="tel" value={config.whatsappNumber} onChange={(e) => setConfig((p) => ({ ...p, whatsappNumber: e.target.value }))}
              className="w-full px-4 py-2 border border-border rounded-md bg-input-background" placeholder="51999999999" />
          </div>

          {/* Transferencia */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-lg">🏦 Transferencia Bancaria</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Nombre del titular</label>
                <input type="text" value={config.accountHolder} onChange={(e) => setConfig((p) => ({ ...p, accountHolder: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input-background" placeholder="Tu nombre completo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Banco</label>
                  <select value={config.bankName} onChange={(e) => setConfig((p) => ({ ...p, bankName: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-md bg-input-background">
                    <option value="">Seleccionar banco</option>
                    <option value="BCP">BCP</option>
                    <option value="BBVA">BBVA</option>
                    <option value="Interbank">Interbank</option>
                    <option value="Scotiabank">Scotiabank</option>
                    <option value="Banco de la Nación">Banco de la Nación</option>
                    <option value="Banbif">Banbif</option>
                    <option value="Pichincha">Pichincha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Tipo de cuenta</label>
                  <select value={config.accountType} onChange={(e) => setConfig((p) => ({ ...p, accountType: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-md bg-input-background">
                    <option value="ahorros">Ahorros</option>
                    <option value="corriente">Corriente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Número de cuenta</label>
                <input type="text" value={config.accountNumber} onChange={(e) => setConfig((p) => ({ ...p, accountNumber: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input-background" placeholder="123456789012345678" />
              </div>
            </div>
          </div>

          {/* Yape */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-lg">📱 Yape</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Número Yape</label>
                <input type="tel" value={config.yapeNumber} onChange={(e) => setConfig((p) => ({ ...p, yapeNumber: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input-background" placeholder="999 999 999" />
              </div>
              <div>
                <label className="block text-sm mb-2">QR Yape (opcional)</label>
                {config.yapeQR ? (
                  <div className="relative inline-block">
                    <img src={config.yapeQR} alt="Yape QR" className="w-40 h-40 object-contain border rounded" />
                    <button onClick={() => setConfig((p) => ({ ...p, yapeQR: '' }))} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Subir QR</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload('yapeQR')} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Plin */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-lg">💳 Plin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Número Plin</label>
                <input type="tel" value={config.plinNumber} onChange={(e) => setConfig((p) => ({ ...p, plinNumber: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input-background" placeholder="999 999 999" />
              </div>
              <div>
                <label className="block text-sm mb-2">QR Plin (opcional)</label>
                {config.plinQR ? (
                  <div className="relative inline-block">
                    <img src={config.plinQR} alt="Plin QR" className="w-40 h-40 object-contain border rounded" />
                    <button onClick={() => setConfig((p) => ({ ...p, plinQR: '' }))} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Subir QR</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload('plinQR')} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* PayPal */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-lg">💰 PayPal</h3>
            <input type="email" value={config.paypalEmail} onChange={(e) => setConfig((p) => ({ ...p, paypalEmail: e.target.value }))}
              className="w-full px-4 py-2 border border-border rounded-md bg-input-background" placeholder="tu@email.com" />
          </div>
        </div>

        <div className="p-6 border-t border-border bg-muted/30 rounded-b-lg">
          <button onClick={handleSave}
            className={`w-full py-3 rounded-md transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'}`}>
            <Save className="w-5 h-5" />
            {saved ? '¡Guardado!' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}
