import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

/**
 * Imagen con fallback cuando la URL falla o está rota.
 * Muestra un placeholder visual si no hay imagen disponible.
 */
export function ImageWithFallback({ src, alt, className = '', fallback }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    if (fallback) {
      return <img src={fallback} alt={alt} className={className} />;
    }
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 opacity-40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
