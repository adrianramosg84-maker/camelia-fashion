import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Check } from 'lucide-react';
import { Comment } from '../types';
import { subscribeToAllComments, replyToComment } from '../services/db';

interface AdminCommentsProps {
  onClose: () => void;
}

export function AdminComments({ onClose }: AdminCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAllComments((data) => {
      setComments(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    await replyToComment(commentId, replyText.trim());
    setReplyText('');
    setReplyingId(null);
    setSending(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const pending = comments.filter((c) => !c.reply);
  const answered = comments.filter((c) => c.reply);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> Comentarios de clientes
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {comments.length > 0 && (
          <div className="px-6 py-3 border-b border-border flex gap-4 text-sm">
            <span className="text-amber-600 font-medium">⏳ Sin responder: {pending.length}</span>
            <span className="text-green-600 font-medium">✅ Respondidos: {answered.length}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No hay comentarios aún</p>
            </div>
          ) : (
            <>
              {/* Sin responder primero */}
              {pending.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase mb-3">⏳ Sin responder</p>
                  <div className="space-y-3">
                    {pending.map((comment) => (
                      <div key={comment.id} className="border border-amber-200 bg-amber-50/30 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <span className="font-medium text-sm">{comment.customerName}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              sobre: <strong>{comment.productName}</strong>
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                        </div>
                        <p className="text-sm mb-3">{comment.text}</p>

                        {replyingId === comment.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Escribe tu respuesta..."
                              className="flex-1 px-3 py-2 border border-border rounded-md bg-input-background text-sm"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') handleReply(comment.id); }}
                            />
                            <button onClick={() => handleReply(comment.id)} disabled={sending}
                              className="bg-primary text-primary-foreground px-3 py-2 rounded-md hover:opacity-90 disabled:opacity-50">
                              {sending
                                ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                : <Send className="w-4 h-4" />}
                            </button>
                            <button onClick={() => { setReplyingId(null); setReplyText(''); }}
                              className="px-3 py-2 border border-border rounded-md hover:bg-secondary text-sm">
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setReplyingId(comment.id); setReplyText(''); }}
                            className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:opacity-90">
                            Responder
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Respondidos */}
              {answered.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-green-600 uppercase mb-3">✅ Respondidos</p>
                  <div className="space-y-3">
                    {answered.map((comment) => (
                      <div key={comment.id} className="border border-border rounded-lg p-4 opacity-80">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <span className="font-medium text-sm">{comment.customerName}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              sobre: <strong>{comment.productName}</strong>
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                        </div>
                        <p className="text-sm mb-2">{comment.text}</p>
                        <div className="bg-primary/10 border-l-2 border-primary rounded p-2 text-sm flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p>{comment.reply}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
