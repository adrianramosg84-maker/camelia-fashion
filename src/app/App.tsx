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
import { subscribeToProducts, saveProduct, deleteProduct } from './services/db';

export default function App() {
  const isPublicView = new URLSearchParams(window.location.search).get('view') === 'public';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isInventoryListOpen, setIsInventoryListOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPaymentSettingsOpen, setIsPaymentSettingsOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const productSectionRef = useRef<HTMLDivElement>(null);

  // Suscribirse a productos en tiempo real desde Firebase
  useEffect(() => {
    const unsub = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddProduct = async (newProduct: Product) => {
    await saveProduct(newProduct);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    await saveProduct(updatedProduct);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: number) => {
    await deleteProduct(id);
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsInventoryListOpen(false);
    setIsInventoryOpen(true);
  };

  const handleAddToCart = (product: Product, selectedSize?: string, selectedColor?: string) => {
    if (product.stock === 0) return;
    setCartItems((prev) => {
      // Buscar item con misma combinación de id + talla + color
      const existing = prev.find(
        (item) => item.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );
      if (existing && existing.quantity >= product.stock) return prev;
      if (existing) {
        return prev.map((item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize, selectedColor }];
    });
  };

  const handleUpdateQuantity = (id: number, quantity: number, selectedSize?: string, selectedColor?: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
          ? { ...item, quantity: Math.min(quantity, product.stock) }
          : item
      )
    );
  };

  const handleRemoveItem = (id: number, selectedSize?: string, selectedColor?: string) =>
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor)
      )
    );
  const handleClearCart = () => setCartItems([]);

  // El stock NO se descuenta aquí — se descuenta cuando el admin confirma el pago
  const handlePurchaseSuccess = async (_purchasedItems: CartItem[]) => {
    // Solo limpia el carrito, el descuento de stock ocurre en OrderHistory al confirmar
  };

  const categories = ['Todos', 'Mujer', 'Niños', 'Accesorios'];
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const handleExploreClick = () => productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={totalItems}
        onCartClick={() => setIsCartOpen(true)}
        onCategorySelect={(cat) => { setSelectedCategory(cat); setSearchTerm(''); productSectionRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
        onInventoryClick={!isPublicView ? () => { setEditingProduct(null); setIsInventoryOpen(true); } : undefined}
        onInventoryListClick={!isPublicView ? () => setIsInventoryListOpen(true) : undefined}
        onShareClick={!isPublicView ? () => setIsShareOpen(true) : undefined}
        onPaymentSettingsClick={!isPublicView ? () => setIsPaymentSettingsOpen(true) : undefined}
        onOrdersClick={!isPublicView ? () => setIsOrderHistoryOpen(true) : undefined}
        isPublicView={isPublicView}
        searchTerm={searchTerm}
        onSearchChange={(term) => { setSearchTerm(term); if (term) { setSelectedCategory('Todos'); productSectionRef.current?.scrollIntoView({ behavior: 'smooth' }); } }}
      />

      <Hero isPublicView={isPublicView} onExploreClick={handleExploreClick} />

      <div ref={productSectionRef} className="container mx-auto px-4 py-12">
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button key={category} onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === category ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
              {category}
            </button>
          ))}
        </div>

        {searchTerm && (
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Resultados para <strong>"{searchTerm}"</strong>: {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}</span>
            <button onClick={() => setSearchTerm('')} className="text-primary hover:underline">Limpiar</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              {searchTerm ? `No se encontraron productos para "${searchTerm}"` : 'No hay productos en esta categoría'}
            </p>
            {!isPublicView && (
              <button onClick={() => setIsInventoryOpen(true)} className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:opacity-90 transition-all">
                Agregar productos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems}
        onUpdateQuantity={handleUpdateQuantity} onRemove={handleRemoveItem}
        onClearCart={handleClearCart} onPurchaseSuccess={handlePurchaseSuccess} />

      {!isPublicView && isInventoryOpen && (
        <InventoryManager onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct}
          editProduct={editingProduct} onClose={() => { setIsInventoryOpen(false); setEditingProduct(null); }} />
      )}
      {!isPublicView && isInventoryListOpen && (
        <InventoryList products={products} onDeleteProduct={handleDeleteProduct}
          onEditProduct={handleEditProduct} onClose={() => setIsInventoryListOpen(false)} />
      )}
      {!isPublicView && isShareOpen && <ShareLink onClose={() => setIsShareOpen(false)} />}
      {!isPublicView && isPaymentSettingsOpen && <PaymentSettings onClose={() => setIsPaymentSettingsOpen(false)} />}
      {!isPublicView && isOrderHistoryOpen && <OrderHistory onClose={() => setIsOrderHistoryOpen(false)} />}

      {!isPublicView && (
        <button onClick={() => { setEditingProduct(null); setIsInventoryOpen(true); }}
          className="fixed bottom-8 right-8 bg-accent text-accent-foreground w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40" title="Agregar producto">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
