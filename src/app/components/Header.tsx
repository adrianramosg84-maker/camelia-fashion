import { useState } from 'react';
import { ShoppingBag, User, Search, Package, Share2, Settings, List, X, ClipboardList, MessageCircle, TrendingUp } from 'lucide-react';
import logoImg from '../../imports/Copilot_20260527_224643.png';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onCategorySelect?: (category: string) => void;
  onInventoryClick?: () => void;
  onInventoryListClick?: () => void;
  onShareClick?: () => void;
  onPaymentSettingsClick?: () => void;
  onOrdersClick?: () => void;
  onCommentsClick?: () => void;
  onSalesReportClick?: () => void;
  isPublicView?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export function Header({
  cartCount,
  onCartClick,
  onCategorySelect,
  onInventoryClick,
  onInventoryListClick,
  onShareClick,
  onPaymentSettingsClick,
  onOrdersClick,
  onCommentsClick,
  onSalesReportClick,
  isPublicView = false,
  searchTerm = '',
  onSearchChange,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const categories = ['Mujer', 'Niños', 'Accesorios'];

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev);
    if (isSearchOpen && onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-28 items-center justify-between px-4">
        {/* Logo + navegación */}
        <div className="flex items-center gap-8">
          <img src={logoImg} alt="Camelia Fashion" className="h-24 w-24 object-contain" />
          <nav className="hidden md:flex gap-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategorySelect?.(cat)}
                className="text-sm hover:text-primary transition-colors"
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* Búsqueda expandible */}
          <div className="flex items-center">
            {isSearchOpen && (
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Buscar productos..."
                autoFocus
                className="w-44 sm:w-56 px-3 py-1.5 border border-border rounded-md bg-background text-sm mr-1 transition-all"
              />
            )}
            <button
              onClick={handleSearchToggle}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              title={isSearchOpen ? 'Cerrar búsqueda' : 'Buscar'}
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </div>

          {/* Usuario — solo decorativo en modo público */}
          {isPublicView && (
            <button
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              title="Cuenta"
            >
              <User className="w-5 h-5" />
            </button>
          )}

          {/* Controles de admin */}
          {!isPublicView && onShareClick && (
            <button
              onClick={onShareClick}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              title="Compartir tienda"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
          {!isPublicView && onPaymentSettingsClick && (
            <button
              onClick={onPaymentSettingsClick}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              title="Configurar pagos"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          {!isPublicView && onOrdersClick && (
            <button onClick={onOrdersClick} className="p-2 hover:bg-secondary rounded-full transition-colors" title="Historial de pedidos">
              <ClipboardList className="w-5 h-5" />
            </button>
          )}
          {!isPublicView && onCommentsClick && (
            <button onClick={onCommentsClick} className="p-2 hover:bg-secondary rounded-full transition-colors" title="Comentarios de clientes">
              <MessageCircle className="w-5 h-5" />
            </button>
          )}
          {!isPublicView && onSalesReportClick && (
            <button onClick={onSalesReportClick} className="p-2 hover:bg-secondary rounded-full transition-colors" title="Informe de ventas">
              <TrendingUp className="w-5 h-5" />
            </button>
          )}
          {!isPublicView && onInventoryListClick && (
            <button
              onClick={onInventoryListClick}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              title="Ver inventario"
            >
              <List className="w-5 h-5" />
            </button>
          )}
          {!isPublicView && onInventoryClick && (
            <button
              onClick={onInventoryClick}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              title="Agregar producto"
            >
              <Package className="w-5 h-5" />
            </button>
          )}

          {/* Carrito — solo en vista pública */}
          {isPublicView && (
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-secondary rounded-full transition-colors"
              title="Carrito de compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
