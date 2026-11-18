import { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('techsetup_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Auth & Modale
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newForgotPass, setNewForgotPass] = useState('');

  // Alertes de sécurité connexion
  const [blockedMessage, setBlockedMessage] = useState(null);
  const [loginWarning, setLoginWarning] = useState(null);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Visibilité mots de passe (Connexion)
  const [showPassword, setShowPassword] = useState(false);

  // Visibilité mots de passe (Espace Sécurité Client / Admin)
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Panier & Commandes Client
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('techsetup_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clientOrders, setClientOrders] = useState([]);
  const [clientTab, setClientTab] = useState('shop'); // 'shop', 'orders', 'settings'
  
  // Champs changement de mot de passe (avec confirmation)
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // Admin states
  const [adminTab, setAdminTab] = useState('products'); // 'products', 'stock', 'users', 'settings'
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', description: '', image_url: '', stock: 10 });
  const [editingProduct, setEditingProduct] = useState(null);
  const [usersList, setUsersList] = useState([]);

  // Décompte automatique chaque seconde lorsque lockoutTimer > 0
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const timer = setInterval(() => {
      setLockoutTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTimer]);

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

  const fetchClientOrders = () => {
    if (currentUser && currentUser.role === 'client') {
      fetch(`http://localhost:5000/api/orders/${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => setClientOrders(data))
        .catch((err) => console.error('Erreur commandes :', err));
    }
  };

  useEffect(() => {
    fetchProducts();
    if (currentUser?.role === 'admin') fetchUsers();
    if (currentUser?.role === 'client') fetchClientOrders();
  }, [currentUser]);

  // Connexion sécurisée avec décompte et gestion des essais
  const handleLogin = (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setBlockedMessage(null);
    setLoginWarning(null);

    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 403) {
            setBlockedMessage({ error: data.error, support: data.support });
          } else if (res.status === 429) {
            setLockoutTimer(data.retryAfter || 10);
            setLoginWarning({ message: data.error, suggestForgot: true });
          } else {
            setLoginWarning({
              message: data.error || 'Erreur de connexion',
              suggestForgot: Boolean(data.suggestForgot)
            });
          }
          return;
        }

        if (data.user) {
          setCurrentUser(data.user);
          setIsAuthModalOpen(false);
          setShowPassword(false);
          setBlockedMessage(null);
          setLoginWarning(null);
          setLockoutTimer(0);
          alert(`Bienvenue, ${data.user.name} !`);
        }
      })
      .catch((err) => console.error('Erreur réseau :', err));
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
        } else {
          alert(data.error || "Erreur lors de l'inscription");
        }
      })
      .catch((err) => console.error(err));
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail, newPassword: newForgotPass })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) alert(data.error);
        else {
          alert(data.message);
          setAuthMode('login');
          setForgotEmail('');
          setNewForgotPass('');
          setLoginWarning(null);
          setLockoutTimer(0);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('techsetup_user');
  };

  // Panier & Commande
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert("Ce produit est en rupture de stock.");
      return;
    }
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);

  const handleCheckout = () => {
    if (!currentUser) {
      alert("Veuillez vous connecter pour passer commande.");
      setIsAuthModalOpen(true);
      setIsCartOpen(false);
      return;
    }

    fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, cartItems: cart, totalAmount: totalPrice })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) alert(data.error);
        else {
          alert('Commande validée avec succès !');
          setCart([]);
          localStorage.removeItem('techsetup_cart');
          setIsCartOpen(false);
          fetchProducts();
          fetchClientOrders();
        }
      })
      .catch((err) => console.error(err));
  };

  // Changement de mot de passe sécurisé (avec vérification de la confirmation)
  const handleUserPasswordChange = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas !");
      return;
    }

    fetch('http://localhost:5000/api/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: currentUser.id, 
        oldPassword: passwords.oldPassword, 
        newPassword: passwords.newPassword 
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) alert(data.error);
        else {
          alert(data.message);
          setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
          setShowOldPass(false);
          setShowNewPass(false);
          setShowConfirmPass(false);
        }
      })
      .catch((err) => console.error(err));
  };

  // Actions Admin
  const handleCreateProduct = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    })
      .then((res) => res.json())
      .then(() => {
        alert('Produit ajouté !');
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
        alert('Produit mis à jour !');
        setEditingProduct(null);
        fetchProducts();
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Supprimer ce produit ?")) {
      fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' })
        .then(() => fetchProducts())
        .catch((err) => console.error(err));
    }
  };

  const handleRoleChange = (userId, newRole) => {
    fetch('http://localhost:5000/api/admin/user-role', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newRole })
    }).then(() => fetchUsers());
  };

  const handleStatusChange = (userId, newStatus) => {
    fetch('http://localhost:5000/api/admin/user-status', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newStatus })
    }).then(() => fetchUsers());
  };

  const EyeIcon = ({ visible }) => (
    visible ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
    )
  );

  const VIP_THRESHOLD = 3;
  const totalFideles = usersList.filter(u => u.role === 'client' && u.total_orders >= VIP_THRESHOLD).length;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', color: '#1e293b', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 3%', width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setClientTab('shop')}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)', padding: '6px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <span style={{ fontWeight: '800', fontSize: '18px', background: 'linear-gradient(90deg, #1e293b 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TechSetup Store {currentUser?.role === 'admin' ? '(Admin)' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>👤 {currentUser.name}</span>
              <button onClick={handleLogout} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Déconnexion</button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Connexion / Inscription</button>
          )}

          {(!currentUser || currentUser.role === 'client') && (
            <button onClick={() => setIsCartOpen(!isCartOpen)} style={{ background: '#f1f5f9', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              🛒 Panier : <strong style={{ color: '#2563eb' }}>{cart.length}</strong>
            </button>
          )}
        </div>
      </header>

      {/* Modal Authentification, Compte Bloqué & Limite d'essais */}
      {isAuthModalOpen && !currentUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' }}>
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '400px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <button onClick={() => { setIsAuthModalOpen(false); setBlockedMessage(null); setLoginWarning(null); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            
            {/* Boîte d'alerte compte bloqué orientée Super Admin */}
            {blockedMessage && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', padding: '14px', borderRadius: '8px', marginBottom: '15px', color: '#991b1b', fontSize: '13px', lineHeight: '1.5' }}>
                <strong style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>{blockedMessage.error}</strong>
                <p style={{ margin: 0 }}>{blockedMessage.support}</p>
              </div>
            )}

            {/* Alerte mauvais mot de passe / essais restants / compte à rebours */}
            {loginWarning && authMode === 'login' && (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: '#92400e', fontSize: '13px', lineHeight: '1.4' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>
                  {lockoutTimer > 0
                    ? `Trop de tentatives. Réessayez dans ${lockoutTimer}s.`
                    : loginWarning.message}
                </strong>
                {loginWarning.suggestForgot && (
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(email); setAuthMode('forgot'); setLoginWarning(null); }}
                    style={{ background: 'none', border: 'none', padding: 0, color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}
                  >
                    Mot de passe oublié ? Cliquez ici pour le réinitialiser
                  </button>
                )}
              </div>
            )}

            {authMode === 'login' && (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '20px' }}>Connexion</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Mot de passe</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><EyeIcon visible={showPassword} /></button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button type="button" onClick={() => { setAuthMode('forgot'); setBlockedMessage(null); setLoginWarning(null); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Mot de passe oublié ?</button>
                  </div>
                  <button
                    type="submit"
                    disabled={lockoutTimer > 0}
                    style={{
                      background: lockoutTimer > 0 ? '#94a3b8' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: lockoutTimer > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {lockoutTimer > 0 ? `Patienter (${lockoutTimer}s)...` : 'Se connecter'}
                  </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button onClick={() => { setAuthMode('register'); setBlockedMessage(null); setLoginWarning(null); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Pas encore de compte ? S'inscrire</button>
                </div>
              </>
            )}

            {authMode === 'register' && (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '20px' }}>Créer un compte</h2>
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Nom complet</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Mot de passe</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>S'inscrire</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button onClick={() => setAuthMode('login')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Déjà un compte ? Se connecter</button>
                </div>
              </>
            )}

            {authMode === 'forgot' && (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '20px' }}>Récupération</h2>
                <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '15px' }}>Entrez votre email et choisissez un nouveau mot de passe.</p>
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Email associé</label>
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Nouveau mot de passe</label>
                    <input type="password" value={newForgotPass} onChange={(e) => setNewForgotPass(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Réinitialiser</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button onClick={() => setAuthMode('login')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Retour à la connexion</button>
                </div>
              </>
            )}

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
            <h2 style={{ marginBottom: '20px', fontSize: '22px', color: '#1e293b' }}>⚙️ Espace Administrateur</h2>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setAdminTab('products')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: adminTab === 'products' ? '#2563eb' : '#f1f5f9', color: adminTab === 'products' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}>➕ Ajouter un Produit</button>
              <button onClick={() => setAdminTab('stock')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: adminTab === 'stock' ? '#2563eb' : '#f1f5f9', color: adminTab === 'stock' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}>📦 Stocks & Produits</button>
              <button onClick={() => setAdminTab('users')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: adminTab === 'users' ? '#2563eb' : '#f1f5f9', color: adminTab === 'users' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}>👥 Clients & VIP ({totalFideles})</button>
              <button onClick={() => setAdminTab('settings')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: adminTab === 'settings' ? '#2563eb' : '#f1f5f9', color: adminTab === 'settings' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}>🔒 Sécurité</button>
            </div>

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

            {adminTab === 'stock' && (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Inventaire & Stocks</h3>
                {editingProduct && (
                  <form onSubmit={handleUpdateProduct} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ margin: 0, color: '#2563eb' }}>Modifier : {editingProduct.name}</h4>
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
                )}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: '10px' }}>Produit</th>
                        <th style={{ padding: '10px' }}>Prix</th>
                        <th style={{ padding: '10px' }}>Stock</th>
                        <th style={{ padding: '10px' }}>Alerte</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: '500' }}>{p.name}</td>
                          <td style={{ padding: '10px' }}>${Number(p.price).toFixed(2)}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.stock}</td>
                          <td style={{ padding: '10px' }}>
                            {p.stock < 5 ? (
                              <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>⚠️ Rupture imminente</span>
                            ) : (
                              <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>OK</span>
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

            {adminTab === 'users' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '16px', margin: 0 }}>Gestion des Clients & Fidélité</h3>
                  <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px' }}>
                    💎 Clients Fidèles / VIP (≥ {VIP_THRESHOLD} commandes) : {totalFideles}
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: '10px' }}>Client</th>
                        <th style={{ padding: '10px' }}>Commandes passées</th>
                        <th style={{ padding: '10px' }}>Statut Fidélité</th>
                        <th style={{ padding: '10px' }}>Rôle</th>
                        <th style={{ padding: '10px' }}>Accès</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.filter(u => u.role === 'client').map((u) => {
                        const isVip = u.total_orders >= VIP_THRESHOLD;
                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: '500' }}>{u.name}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                            </td>
                            <td style={{ padding: '10px', fontWeight: 'bold', color: '#2563eb' }}>{u.total_orders} commande(s)</td>
                            <td style={{ padding: '10px' }}>
                              {isVip ? (
                                <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>⭐ Client VIP / Fidèle</span>
                              ) : (
                                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}>Standard</span>
                              )}
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#f1f5f9', color: '#475569' }}>{u.role}</span>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', backgroundColor: u.status === 'blocked' ? '#fee2e2' : '#dcfce7', color: u.status === 'blocked' ? '#dc2626' : '#15803d' }}>
                                {u.status === 'blocked' ? 'Bloqué' : 'Actif'}
                              </span>
                            </td>
                            <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleRoleChange(u.id, 'admin')} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Promouvoir Admin</button>
                              <button onClick={() => handleStatusChange(u.id, u.status === 'blocked' ? 'active' : 'blocked')} style={{ background: u.status === 'blocked' ? '#dcfce7' : '#fee2e2', color: u.status === 'blocked' ? '#15803d' : '#dc2626', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                                {u.status === 'blocked' ? 'Débloquer' : 'Bloquer'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === 'settings' && (
              <form onSubmit={handleUserPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>Changer mon mot de passe Admin</h3>
                
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ancien mot de passe</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input type={showOldPass ? 'text' : 'password'} value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} required style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowOldPass(!showOldPass)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><EyeIcon visible={showOldPass} /></button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Nouveau mot de passe</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input type={showNewPass ? 'text' : 'password'} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><EyeIcon visible={showNewPass} /></button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Confirmer le nouveau mot de passe</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input type={showConfirmPass ? 'text' : 'password'} value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><EyeIcon visible={showConfirmPass} /></button>
                  </div>
                </div>

                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Mettre à jour</button>
              </form>
            )}

          </div>
        ) : currentUser && currentUser.role === 'client' ? (
          /* ================= ESPACE CLIENT CONNECTÉ ================= */
          <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setClientTab('shop')} style={{ padding: '8px 16px', borderRadius: '6px', background: clientTab === 'shop' ? '#2563eb' : '#ffffff', color: clientTab === 'shop' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #e2e8f0' }}>🛍️ Boutique</button>
              <button onClick={() => setClientTab('orders')} style={{ padding: '8px 16px', borderRadius: '6px', background: clientTab === 'orders' ? '#2563eb' : '#ffffff', color: clientTab === 'orders' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #e2e8f0' }}>📦 Mes Commandes ({clientOrders.length})</button>
              <button onClick={() => setClientTab('settings')} style={{ padding: '8px 16px', borderRadius: '6px', background: clientTab === 'settings' ? '#2563eb' : '#ffffff', color: clientTab === 'settings' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #e2e8f0' }}>🔒 Mon Compte & Sécurité</button>
            </div>

            {clientTab === 'shop' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                  <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', marginBottom: '10px' }}>Booste ton espace de travail</h1>
                  <p style={{ color: '#64748b', fontSize: 'clamp(14px, 2vw, 16px)' }}>Les meilleurs accessoires sélectionnés pour les développeurs et créateurs.</p>
                </div>
                {loading ? <p style={{ textAlign: 'center', color: '#64748b' }}>Chargement...</p> : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px', width: '100%' }}>
                    {products.map((product) => (
                      <div key={product.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '200px', backgroundColor: '#e2e8f0', backgroundImage: `url(${product.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                          <span style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', width: 'fit-content', fontWeight: 'bold', marginBottom: '10px' }}>{product.category}</span>
                          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>{product.name}</h3>
                          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '10px', flexGrow: 1 }}>{product.description}</p>
                          <p style={{ fontSize: '13px', fontWeight: 'bold', color: product.stock > 0 ? '#15803d' : '#dc2626', marginBottom: '15px' }}>
                            {product.stock > 0 ? `Stock : ${product.stock} dispo` : 'Rupture de stock'}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>${Number(product.price).toFixed(2)}</span>
                            <button onClick={() => addToCart(product)} disabled={product.stock <= 0} style={{ background: product.stock > 0 ? '#2563eb' : '#94a3b8', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: product.stock > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '14px' }}>Ajouter</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {clientTab === 'orders' && (
              <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginBottom: '20px' }}>Historique de mes Commandes</h3>
                {clientOrders.length === 0 ? (
                  <p style={{ color: '#64748b' }}>Vous n'avez pas encore passé de commande.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {clientOrders.map((order) => (
                      <div key={order.id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#2563eb' }}>Commande #{order.id}</h4>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Passée le : {new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>${Number(order.total_amount).toFixed(2)}</span>
                          <div style={{ fontSize: '11px', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: 'bold' }}>Validée & Payée</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {clientTab === 'settings' && (
              <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '400px' }}>
                <h3 style={{ marginBottom: '15px' }}>Sécurité du Compte</h3>
                <form onSubmit={handleUserPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ancien mot de passe</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input type={showOldPass ? 'text' : 'password'} value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} required style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowOldPass(!showOldPass)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><EyeIcon visible={showOldPass} /></button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Nouveau mot de passe</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input type={showNewPass ? 'text' : 'password'} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><EyeIcon visible={showNewPass} /></button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Confirmer le nouveau mot de passe</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input type={showConfirmPass ? 'text' : 'password'} value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><EyeIcon visible={showConfirmPass} /></button>
                    </div>
                  </div>

                  <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Mettre à jour le mot de passe</button>
                </form>
              </div>
            )}

          </div>
        ) : (
          /* ================= BOUTIQUE VISITEUR (GUEST) ================= */
          <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', marginBottom: '10px' }}>Booste ton espace de travail</h1>
              <p style={{ color: '#64748b', fontSize: 'clamp(14px, 2vw, 16px)' }}>Les meilleurs accessoires sélectionnés pour les développeurs et créateurs.</p>
            </div>

            {loading ? <p style={{ textAlign: 'center', color: '#64748b' }}>Chargement...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px', width: '100%' }}>
                {products.map((product) => (
                  <div key={product.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '200px', backgroundColor: '#e2e8f0', backgroundImage: `url(${product.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <span style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', width: 'fit-content', fontWeight: 'bold', marginBottom: '10px' }}>{product.category}</span>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>{product.name}</h3>
                      <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '10px', flexGrow: 1 }}>{product.description}</p>
                      <p style={{ fontSize: '13px', fontWeight: 'bold', color: product.stock > 0 ? '#15803d' : '#dc2626', marginBottom: '15px' }}>
                        {product.stock > 0 ? `Stock : ${product.stock} dispo` : 'Rupture de stock'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>${Number(product.price).toFixed(2)}</span>
                        <button onClick={() => addToCart(product)} disabled={product.stock <= 0} style={{ background: product.stock > 0 ? '#2563eb' : '#94a3b8', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: product.stock > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '14px' }}>Ajouter</button>
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