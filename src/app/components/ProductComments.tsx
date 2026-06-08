import { useState, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Comment, Product } from '../types';
import { subscribeToCommentsByProduct, addComment } from '../services/db';

interface ProductCommentsProps {
  product: Product;
  onClose: () => void;
}

export function ProductComments({ product, onClose }: ProductCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsub = subscribeToCommentsByProduct(product.id, setComments);
    return () => unsub();
  }, [product.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSending(true);
    await addComment({
      productId: product.id,
      productName: product.name,
      customerName: name.trim(),
      text: text.trim(),
      date: new Date().toISOString(),
    });
    setText('');
    setSending(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-primary flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Comentarios
            </h2>
            <p className="text-sm text-muted-foreground">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de comentarios */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sé el primero en comentar</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                {/* Comentario del cliente */}
                <div className="bg-secondary/40 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{comment.customerName}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
                {/* Respuesta del admin */}
                {comment.reply && (
                  <div className="ml-4 bg-primary/10 border-l-2 border-primary rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-primary">Camelia Fashion</span>
                      <span className="text-xs text-muted-foreground">
                        {comment.replyDate ? formatDate(comment.replyDate) : ''}
                      </span>
                    </div>
                    <p className="text-sm">{comment.reply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Formulario */}
        <div className="border-t border-border p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre *"
              className="w-full px-4 py-2 border border-border rounded-md bg-input-background text-sm"
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe tu comentario..."
                className="flex-1 px-4 py-2 border border-border rounded-md bg-input-background text-sm"
                required
              />
              <button
                type="submit"
                disabled={sending || !name.trim() || !text.trim()}
                className="bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90 disabled:opacity-50"
              >
                {sending
                  ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  : <Send className="w-5 h-5" />
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
