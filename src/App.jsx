import { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('techsetup_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [authMode, setAuthMode] = useState('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Nouveaux états pour afficher/masquer les mots de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('techsetup_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Admin states
  const [adminTab, setAdminTab] = useState('products');
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', description: '', image_url: '', stock: 10 });
  const [editingProduct, setEditingProduct] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
    localStorage.setItem('techsetup_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('techsetup_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => console.error('Erreur produits :', err));
  };

  const fetchUsers = () => {
    fetch('http://localhost:5000/api/admin/users')
      .then((res) => res.json())
      .then((data) => setUsersList(data))
      .catch((err) => console.error('Erreur utilisateurs :', err));
  };

  useEffect(() => {
    fetchProducts();
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  // Auth
  const handleLogin = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          setIsAuthModalOpen(false);
          setShowPassword(false);
          alert(`Bienvenue, ${data.user.name} !`);
        } else {
          alert(data.error || 'Erreur de connexion');
        }
      })
      .catch((err) => console.error(err));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          alert('Compte créé avec succès ! Connectez-vous.');
          setAuthMode('login');
          setShowPassword(false);
        } else {
          alert(data.error || "Erreur lors de l'inscription");
        }
      })
      .catch((err) => console.error(err));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('techsetup_user');
  };

  // Cart
  const addToCart = (product) => setCart([...cart, product]);
  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const handleCheckout = () => {
    alert('Paiement simulé avec succès ! Merci pour votre commande.');
    setCart([]);
    localStorage.removeItem('techsetup_cart');
    setIsCartOpen(false);
  };

  // Admin Actions Produits
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
        setNewProduct({ name: '', category: '', price: '', description: '', image_url: '', stock: 10 });
        fetchProducts();
      })
      .catch((err) => console.error(err));
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct)
    })
      .then((res) => res.json())
      .then(() => {
        alert('Produit mis à jour avec succès !');
        setEditingProduct(null);
        fetchProducts();
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' })
        .then(() => {
          alert('Produit supprimé !');
          fetchProducts();
        })
        .catch((err) => console.error(err));
    }
  };

  // Admin Actions Utilisateurs
  const handleRoleChange = (userId, newRole) => {
    fetch('http://localhost:5000/api/admin/user-role', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newRole })
    })
      .then(() => {
        alert('Rôle mis à jour !');
        fetchUsers();
      })
      .catch((err) => console.error(err));
  };

  const handleStatusChange = (userId, newStatus) => {
    fetch('http://localhost:5000/api/admin/user-status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newStatus })
    })
      .then(() => {
        alert(`Compte ${newStatus === 'blocked' ? 'bloqué' : 'activé'} avec succès !`);
        fetchUsers();
      })
      .catch((err) => console.error(err));
  };

  const handleAdminPasswordChange = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, ...passwords })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) alert(data.error);
        else {
          alert(data.message);
          setPasswords({ oldPassword: '', newPassword: '' });
          setShowOldPassword(false);
          setShowNewPassword(false);
        }
      })
      .catch((err) => console.error(err));
  };

  // Composant réutilisable pour l'icône œil ouvert / œil barré
  const EyeIcon = ({ visible }) => (
    visible ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  );

  const totalClients = usersList.filter(u => u.role === 'client').length;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', color: '#1e293b', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 3%', width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)', padding: '6px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <span style={{ fontWeight: '800', fontSize: '18px', background: 'linear-gradient(90deg, #1e293b 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TechSetup {currentUser?.role === 'admin' ? '(Admin Dashboard)' : 'Store'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>{currentUser.name}</span>
              <button onClick={handleLogout} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Déconnexion</button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Connexion / Inscription</button>
          )}

          {(!currentUser || currentUser.role === 'client') && (
            <button onClick={() => setIsCartOpen(!isCartOpen)} style={{ background: '#f1f5f9', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Panier : <strong style={{ color: '#2563eb' }}>{cart.length}</strong></span>
            </button>
          )}
        </div>
      </header>

      {/* Modal Auth avec bouton Voir/Masquer le mot de passe */}
      {isAuthModalOpen && !currentUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' }}>
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '400px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <button onClick={() => { setIsAuthModalOpen(false); setShowPassword(false); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '20px' }}>{authMode === 'login' ? 'Connexion' : 'Créer un compte'}</h2>
            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {authMode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Nom complet</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Mot de passe</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 0 }}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>
              <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>{authMode === 'login' ? 'Se connecter' : "S'inscrire"}</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setShowPassword(false); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>{authMode === 'login' ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Panneau Panier */}
      {isCartOpen && (!currentUser || currentUser.role === 'client') && (
        <div style={{ position: 'fixed', top: '75px', right: '3%', width: '94%', maxWidth: '360px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)', padding: '20px', zIndex: 100, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Mon Panier</h3>
            <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>✕</button>
          </div>
          {cart.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', margin: '20px 0' }}>Votre panier est vide.</p> : (
            <div style={{ overflowY: 'auto', flexGrow: 1, maxHeight: '50vh', marginBottom: '15px' }}>
              {cart.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1e293b' }}>{item.name}</h4>
                    <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 'bold' }}>${Number(item.price).toFixed(2)}</span>
                  </div>
                  <button onClick={() => removeFromCart(index)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Retirer</button>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}><span>Total :</span><span style={{ color: '#2563eb' }}>${totalPrice.toFixed(2)}</span></div>
              <button onClick={handleCheckout} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Commander</button>
            </div>
          )}
        </div>
      )}

      {/* Contenu Principal */}
      <main style={{ width: '100%', flexGrow: 1, padding: '30px 3%', boxSizing: 'border-box' }}>
        
        {currentUser && currentUser.role === 'admin' ? (
          /* ================= DASHBOARD ADMIN ================= */
          <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', background: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '22px', color: '#1e293b' }}>Espace Administrateur</h2>
            
            {/* Onglets Admin */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setAdminTab('products')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: adminTab === 'products' ? '#2563eb' : '#f1f5f9', color: adminTab === 'products' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}>Ajouter un Produit</button>
              <button onClick={() => setAdminTab('stock')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: adminTab === 'stock' ? '#2563eb' : '#f1f5f9', color: adminTab === 'stock' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}>Gestion des Stocks & Produits</button>
              <button onClick={() => setAdminTab('users')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: adminTab === 'users' ? '#2563eb' : '#f1f5f9', color: adminTab === 'users' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}>Clients & Rôles ({totalClients})</button>
              <button onClick={() => setAdminTab('settings')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: adminTab === 'settings' ? '#2563eb' : '#f1f5f9', color: adminTab === 'settings' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}>Sécurité</button>
            </div>

            {/* Onglet 1 : Ajouter un produit */}
            {adminTab === 'products' && (
              <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>Publier un nouvel article</h3>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Nom du produit</label>
                  <input type="text" placeholder="Ex: Clavier Mécanique" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Catégorie</label>
                    <input type="text" placeholder="Ex: Périphériques" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Prix ($)</label>
                    <input type="number" step="0.01" placeholder="89.99" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Stock initial</label>
                    <input type="number" placeholder="10" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Description</label>
                  <textarea placeholder="Description..." value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>URL de l'image</label>
                  <input type="url" placeholder="https://..." value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Publier le produit</button>
              </form>
            )}

            {/* Onglet 2 : Gestion des Stocks & Modification / Suppression */}
            {adminTab === 'stock' && (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Inventaire & Stocks des Produits</h3>
                
                {editingProduct ? (
                  <form onSubmit={handleUpdateProduct} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ margin: 0, color: '#2563eb' }}>Modifier le produit : {editingProduct.name}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Nom" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <input type="text" value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} placeholder="Catégorie" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} placeholder="Prix" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} placeholder="Stock" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <input type="url" value={editingProduct.image_url} onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })} placeholder="URL Image" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} placeholder="Description" rows="2" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Enregistrer</button>
                      <button type="button" onClick={() => setEditingProduct(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Annuler</button>
                    </div>
                  </form>
                ) : null}

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: '10px' }}>Produit</th>
                        <th style={{ padding: '10px' }}>Catégorie</th>
                        <th style={{ padding: '10px' }}>Prix</th>
                        <th style={{ padding: '10px' }}>Stock dispo</th>
                        <th style={{ padding: '10px' }}>Alerte Rupture</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: '500' }}>{p.name}</td>
                          <td style={{ padding: '10px', color: '#64748b' }}>{p.category}</td>
                          <td style={{ padding: '10px' }}>${Number(p.price).toFixed(2)}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.stock} unité(s)</td>
                          <td style={{ padding: '10px' }}>
                            {p.stock < 5 ? (
                              <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                                Risque de rupture ({p.stock} restants)
                              </span>
                            ) : (
                              <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                                Stock OK
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                            <button onClick={() => setEditingProduct(p)} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Modifier</button>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Supprimer</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Onglet 3 : Gestion des Clients fidèles & Rôles & Blocage */}
            {adminTab === 'users' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '16px', margin: 0 }}>Gestion des Comptes Utilisateurs</h3>
                  <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px' }}>
                    Clients fidèles inscrits : {totalClients}
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: '10px' }}>Nom</th>
                        <th style={{ padding: '10px' }}>Email</th>
                        <th style={{ padding: '10px' }}>Rôle</th>
                        <th style={{ padding: '10px' }}>Statut du compte</th>
                        <th style={{ padding: '10px' }}>Actions Rôle</th>
                        <th style={{ padding: '10px' }}>Actions Accès</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: '500' }}>{u.name}</td>
                          <td style={{ padding: '10px', color: '#64748b' }}>{u.email}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', backgroundColor: u.role === 'admin' ? '#dbeafe' : '#f1f5f9', color: u.role === 'admin' ? '#1d4ed8' : '#475569' }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', backgroundColor: u.status === 'blocked' ? '#fee2e2' : '#dcfce7', color: u.status === 'blocked' ? '#dc2626' : '#15803d' }}>
                              {u.status === 'blocked' ? 'Bloqué' : 'Actif'}
                            </span>
                          </td>
                          <td style={{ padding: '10px' }}>
                            {u.id !== currentUser.id && (
                              <button onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'client' : 'admin')} style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                                Passer en {u.role === 'admin' ? 'client' : 'admin'}
                              </button>
                            )}
                          </td>
                          <td style={{ padding: '10px' }}>
                            {u.id !== currentUser.id && (
                              <button 
                                onClick={() => handleStatusChange(u.id, u.status === 'blocked' ? 'active' : 'blocked')}
                                style={{ background: u.status === 'blocked' ? '#dcfce7' : '#fee2e2', color: u.status === 'blocked' ? '#15803d' : '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                              >
                                {u.status === 'blocked' ? 'Débloquer' : 'Bloquer'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Onglet 4 : Sécurité (Changer mot de passe admin avec Voir/Masquer) */}
            {adminTab === 'settings' && (
              <form onSubmit={handleAdminPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>Changer mon mot de passe Admin</h3>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ancien mot de passe</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type={showOldPassword ? 'text' : 'password'} 
                      value={passwords.oldPassword} 
                      onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} 
                      required 
                      style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 0 }}
                    >
                      <EyeIcon visible={showOldPassword} />
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Nouveau mot de passe</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type={showNewPassword ? 'text' : 'password'} 
                      value={passwords.newPassword} 
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} 
                      required 
                      style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 0 }}
                    >
                      <EyeIcon visible={showNewPassword} />
                    </button>
                  </div>
                </div>
                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Mettre à jour le mot de passe</button>
              </form>
            )}

          </div>
        ) : (
          /* ================= BOUTIQUE CLIENT / VISITEUR ================= */
          <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', marginBottom: '10px' }}>Booste ton espace de travail</h1>
              <p style={{ color: '#64748b', fontSize: 'clamp(14px, 2vw, 16px)' }}>Les meilleurs accessoires sélectionnés pour les développeurs et créateurs.</p>
            </div>

            {loading ? <p style={{ textAlign: 'center', color: '#64748b' }}>Chargement...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px', width: '100%' }}>
                {products.map((product) => (
                  <div key={product.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '200px', minHeight: '200px', maxHeight: '200px', width: '100%', backgroundColor: '#e2e8f0', backgroundImage: `url(${product.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', flexShrink: 0 }} />
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <span style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', width: 'fit-content', fontWeight: 'bold', marginBottom: '10px' }}>{product.category}</span>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>{product.name}</h3>
                      <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px', flexGrow: 1 }}>{product.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>${Number(product.price).toFixed(2)}</span>
                        <button onClick={() => addToCart(product)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Ajouter</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;