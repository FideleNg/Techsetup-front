import { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Rôle actuel : 'client' (boutique) ou 'admin' (gestion)
  const [activeRole, setActiveRole] = useState('client');

  // Panier persistant via localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('techsetup_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Formulaire d'ajout de produit pour l'Admin
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image_url: ''
  });

  // Sauvegarde automatique du panier
  useEffect(() => {
    localStorage.setItem('techsetup_cart', JSON.stringify(cart));
  }, [cart]);

  // Récupération des produits
  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur chargement produits :', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Gestion du panier
  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);

  // Ajout d'un produit (Admin)
  const handleCreateProduct = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    })
      .then((res) => res.json())
      .then(() => {
        alert('Produit ajouté avec succès !');
        setNewProduct({ name: '', category: '', price: '', description: '', image_url: '' });
        fetchProducts();
      })
      .catch((err) => console.error("Erreur lors de l'ajout :", err));
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Header Unifié */}
      <header style={{ 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '16px 32px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10 
      }}>
        
        {/* Logo Vectoriel & Nom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              padding: '6px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
              marginBottom: '4px'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', lineHeight: '1' }}>
              <span style={{ fontWeight: '800', fontSize: '16px', background: 'linear-gradient(90deg, #1e293b 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                TechSetup
              </span>
              <span style={{ fontWeight: '600', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>
                Store
              </span>
            </div>
          </div>

          {/* Sélecteur de Rôle (Client / Admin) */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', marginLeft: '20px' }}>
            <button 
              onClick={() => setActiveRole('client')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeRole === 'client' ? '#ffffff' : 'transparent', color: activeRole === 'client' ? '#2563eb' : '#64748b', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: activeRole === 'client' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
            >
              🛍️ Boutique Client
            </button>
            <button 
              onClick={() => setActiveRole('admin')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeRole === 'admin' ? '#ffffff' : 'transparent', color: activeRole === 'admin' ? '#2563eb' : '#64748b', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: activeRole === 'admin' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
            >
              🛠️ Espace Admin
            </button>
          </div>
        </div>
        
        {/* Panier (Uniquement visible en mode client) */}
        {activeRole === 'client' && (
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            style={{ 
              background: '#f1f5f9', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', border: '1px solid #e2e8f0', cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Panier : <strong style={{ color: '#2563eb' }}>{cart.length}</strong></span>
          </button>
        )}
      </header>

      {/* Panneau du Panier */}
      {isCartOpen && activeRole === 'client' && (
        <div style={{
          position: 'fixed', top: '73px', right: '20px', width: '350px', backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '20px', zIndex: 100, maxHeight: '80vh', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Mon Panier</h3>
            <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>✕</button>
          </div>

          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', margin: '20px 0' }}>Votre panier est vide.</p>
          ) : (
            <div style={{ overflowY: 'auto', flexGrow: 1, maxHeight: '50vh', marginBottom: '15px' }}>
              {cart.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1e293b' }}>{item.name}</h4>
                    <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 'bold' }}>${Number(item.price).toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => removeFromCart(index)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>
                <span>Total :</span>
                <span style={{ color: '#2563eb' }}>${totalPrice.toFixed(2)}</span>
              </div>
              
              {/* Bouton Commander intégré */}
              <button 
                onClick={() => {
                  alert('Paiement simulé avec succès ! Merci pour votre commande.');
                  setCart([]); // Vide le panier dans l'état React
                  localStorage.removeItem('techsetup_cart'); // Supprime la sauvegarde du navigateur
                  setIsCartOpen(false); // Ferme le panneau du panier
                }}
                style={{ 
                  width: '100%', 
                  background: '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer' 
                }}
              >
                Commander
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contenu Principal selon le Rôle */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {activeRole === 'client' ? (
          /* ================= VUE CLIENT ================= */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Booste ton espace de travail</h1>
              <p style={{ color: '#64748b', fontSize: '16px' }}>Les meilleurs accessoires sélectionnés pour les développeurs et créateurs.</p>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Chargement du catalogue...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
                {products.map((product) => (
                  <div key={product.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Conteneur d'image verrouillé à 200px */}
                    <div style={{ height: '200px', minHeight: '200px', maxHeight: '200px', width: '100%', backgroundColor: '#e2e8f0', backgroundImage: `url(${product.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', flexShrink: 0 }} />

                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', width: 'fit-content', fontWeight: 'bold', marginBottom: '10px' }}>
                        {product.category}
                      </span>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>{product.name}</h3>
                      <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px', flexGrow: 1 }}>
                        {product.description}
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
                          ${Number(product.price).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => addToCart(product)}
                          style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ================= VUE ADMIN ================= */
          <div style={{ maxWidth: '700px', margin: '0 auto', background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '22px', color: '#1e293b' }}>⚙️ Espace Administrateur - Ajouter un produit</h2>
            
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Nom du produit</label>
                <input 
                  type="text" placeholder="Ex: Support PC en aluminium" value={newProduct.name} 
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Catégorie</label>
                  <input 
                    type="text" placeholder="Ex: Accessoires" value={newProduct.category} 
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Prix ($)</label>
                  <input 
                    type="number" step="0.01" placeholder="49.99" value={newProduct.price} 
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Description</label>
                <textarea 
                  placeholder="Description détaillée..." value={newProduct.description} 
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} rows="3"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>URL directe de l'image</label>
                <input 
                  type="url" placeholder="https://..." value={newProduct.image_url} 
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <button 
                type="submit" 
                style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px' }}
              >
                Publier le produit
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;