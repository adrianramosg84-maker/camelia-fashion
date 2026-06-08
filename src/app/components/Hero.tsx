import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import logoImg from '../../imports/Copilot_20260527_224643.png';
import { saveCollectionName, subscribeToCollectionName } from '../services/db';

interface HeroProps {
  isPublicView?: boolean;
  onExploreClick?: () => void;
}

export function Hero({ isPublicView = false, onExploreClick }: HeroProps) {
  const [collectionName, setCollectionName] = useState('Nueva Colección');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    const unsub = subscribeToCollectionName((name) => {
      setCollectionName(name);
      setTempName(name);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (tempName.trim()) {
      await saveCollectionName(tempName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempName(collectionName);
    setIsEditing(false);
  };

  return (
    <div className="relative h-[500px] bg-gradient-to-br from-secondary via-background to-muted flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 text-center px-4 max-w-2xl w-full">
        <img src={logoImg} alt="Camelia Fashion" className="h-56 w-56 md:h-72 md:w-72 mx-auto mb-6 object-contain" />

        {!isPublicView && isEditing ? (
          <div className="mb-8 space-y-4">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="text-3xl md:text-4xl font-semibold text-center w-full px-4 py-2 border-2 border-primary rounded-md bg-card"
              style={{ color: '#C4A962' }}
              placeholder="Nombre de la colección"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <div className="flex gap-2 justify-center">
              <button onClick={handleSave} className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:opacity-90 transition-opacity">Guardar</button>
              <button onClick={handleCancel} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-80 transition-opacity">Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 group">
              <h1 className="text-4xl md:text-5xl" style={{ color: '#C4A962' }}>{collectionName}</h1>
              {!isPublicView && (
                <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary/10 rounded-full" title="Editar nombre">
                  <Edit2 className="w-5 h-5" style={{ color: '#C4A962' }} />
                </button>
              )}
            </div>
          </div>
        )}

        <button onClick={onExploreClick} className="bg-primary text-primary-foreground px-8 py-3 rounded-md hover:opacity-90 transition-opacity">
          Explorar colección
        </button>
      </div>
    </div>
  );
}
