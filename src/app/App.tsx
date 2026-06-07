import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { InventoryManager } from './components/InventoryManager';
import { InventoryList } from './components/InventoryList';
import { ShareLink } from './components/ShareLink';
import { PaymentSettings } from './components/PaymentSettings';
import { OrderHistory } from './components/OrderHistory';
import { Product, CartItem } from './types';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Vestido de Verano',
    price: 89.99,
    category: 'Mujer',
    description: 'Vestido floral perfecto para el verano',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
    stock: 5,
  },
  {
    id: 2,
    name: 'Blazer Elegante',
    price: 149.99,
    category: 'Mujer',
    description: 'Blazer para ocasiones especiales',
    image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&h=600&fit=crop',
    stock: 3,
  },
  {
    id: 3,
    name: 'Vestido Casual',
    price: 69.99,
    category: 'Niños',
    description: 'Vestido cómodo para el día a día',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=600&fit=crop',
    stock: 0,
  },
];

export default function App() {
  // ─── Modo público ───────────────────────────────────────────────────────────
  const isPublicView =
    new URLSearchParams(window.location.search).get('view') === 'public';

  // ─── Estado ─────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('camelia-inventory');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modales
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isInventoryListOpen, setIsInventoryListOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPaymentSettingsOpen, setIsPaymentSettingsOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Ref para la sección de productos (scroll desde Hero)
  const productSectionRef = useRef<HTMLDivElement>(null);

  // ─── Persistencia del inventario ────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('camelia-inventory', JSON.stringify(products));
  }, [products]);

  // ─── Handlers de inventario ─────────────────────────────────────────────────
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    // Eliminar también del carrito si estaba
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsInventoryListOpen(false);
    setIsInventoryOpen(true);
  };

  // ─── Handlers del carrito ───────────────────────────────────────────────────
  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const currentQty = existing?.quantity ?? 0;

      if (currentQty >= product.stock) return prev; // sin alert(), sin ruido

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    // Respetar límite de stock
    const clampedQty = Math.min(quantity, product.stock);
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: clampedQty } : item))
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  /**
   * Descuenta el stock de cada producto comprado.
   * Se llama desde Cart una vez que el pedido es confirmado.
   */
  const handlePurchaseSuccess = (purchasedItems: CartItem[]) => {
    setProducts((prev) =>
      prev.map((product) => {
        const bought = purchasedItems.find((item) => item.id === product.id);
        if (!bought) return product;
        return {
          ...product,
          stock: Math.max(0, product.stock - bought.quantity),
        };
      })
    );
  };

  // ─── Categorías y filtros ───────────────────────────────────────────────────
  const categories = ['Todos', 'Mujer', 'Niños', 'Accesorios'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleExploreClick = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={totalItems}
        onCartClick={() => setIsCartOpen(true)}
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          setSearchTerm('');
          productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onInventoryClick={
          !isPublicView
            ? () => {
                setEditingProduct(null);
                setIsInventoryOpen(true);
              }
            : undefined
        }
        onInventoryListClick={
          !isPublicView ? () => setIsInventoryListOpen(true) : undefined
        }
        onShareClick={!isPublicView ? () => setIsShareOpen(true) : undefined}
        onPaymentSettingsClick={
          !isPublicView ? () => setIsPaymentSettingsOpen(true) : undefined
        }
        onOrdersClick={
          !isPublicView ? () => setIsOrderHistoryOpen(true) : undefined
        }
        isPublicView={isPublicView}
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setSearchTerm(term);
          if (term) {
            setSelectedCategory('Todos');
            productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      <Hero isPublicView={isPublicView} onExploreClick={handleExploreClick} />

      {/* Sección de productos */}
      <div ref={productSectionRef} className="container mx-auto px-4 py-12">
        {/* Filtros de categoría */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Aviso de búsqueda activa */}
        {searchTerm && (
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Resultados para <strong>"{searchTerm}"</strong>:{' '}
              {filteredProducts.length} producto
              {filteredProducts.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setSearchTerm('')}
              className="text-primary hover:underline"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              {searchTerm
                ? `No se encontraron productos para "${searchTerm}"`
                : 'No hay productos en esta categoría'}
            </p>
            {!isPublicView && (
              <button
                onClick={() => setIsInventoryOpen(true)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:opacity-90 transition-all"
              >
                Agregar productos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Modales ─────────────────────────────────────────────────────────── */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveItem}
        onClearCart={handleClearCart}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      {!isPublicView && isInventoryOpen && (
        <InventoryManager
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          editProduct={editingProduct}
          onClose={() => {
            setIsInventoryOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {!isPublicView && isInventoryListOpen && (
        <InventoryList
          products={products}
          onDeleteProduct={handleDeleteProduct}
          onEditProduct={handleEditProduct}
          onClose={() => setIsInventoryListOpen(false)}
        />
      )}

      {!isPublicView && isShareOpen && (
        <ShareLink onClose={() => setIsShareOpen(false)} />
      )}

      {!isPublicView && isPaymentSettingsOpen && (
        <PaymentSettings onClose={() => setIsPaymentSettingsOpen(false)} />
      )}

      {!isPublicView && isOrderHistoryOpen && (
        <OrderHistory onClose={() => setIsOrderHistoryOpen(false)} />
      )}

      {/* FAB agregar producto (solo admin) */}
      {!isPublicView && (
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsInventoryOpen(true);
          }}
          className="fixed bottom-8 right-8 bg-accent text-accent-foreground w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
          title="Agregar producto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
