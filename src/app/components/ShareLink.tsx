import { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';

interface ShareLinkProps {
  onClose: () => void;
}

export function ShareLink({ onClose }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  // Generar enlace público
  const publicLink = `${window.location.origin}${window.location.pathname}?view=public`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = publicLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartir Tienda
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Comparte este enlace con tus clientes para que puedan ver tus productos y realizar compras:
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={publicLink}
              readOnly
              className="flex-1 px-4 py-2 border border-border rounded-md bg-muted text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={handleCopy}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-sm">¿Qué pueden hacer tus clientes?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Ver todos tus productos disponibles</li>
              <li>✓ Filtrar por categorías</li>
              <li>✓ Agregar productos al carrito</li>
              <li>✓ Realizar compras completas</li>
              <li>✗ No pueden editar el inventario</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
