import { useState, useEffect } from 'react';

const SearchAndFiltersBar = ({
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  categories,
  selectedCategory,
  setSelectedCategory,
  activeTabFilter,
  setActiveTabFilter
}) => {
  const selectStyle = {
    padding: '11px 14px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13.5px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
    outline: 'none'
  };

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
        marginBottom: '28px'
      }}
    >
      {/* 1. Menu déroulant : Type de catalogue */}
      <select
        aria-label="Filtrer par catalogue"
        value={activeTabFilter}
        onChange={(e) => {
          setActiveTabFilter(e.target.value);
          setSelectedCategory('Toutes');
        }}
        style={selectStyle}
      >
        <option value="all">Tout le catalogue</option>
        <option value="physical">Matériel Informatique</option>
        <option value="digital">Livres Numériques (E-books)</option>
      </select>

      {/* 2. Menu déroulant : Catégories */}
      <select
        aria-label="Filtrer par catégorie"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={selectStyle}
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat === 'Toutes' ? 'Toutes les catégories' : cat}
          </option>
        ))}
      </select>

      {/* 3. Barre de recherche avec loupe */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
        <div
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={{
            width: '100%',
            padding: '11px 36px 11px 40px',
            borderRadius: '12px',
            border: isSearchFocused ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
            fontSize: '13.5px',
            color: '#0f172a',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            boxShadow: isSearchFocused
              ? '0 4px 14px rgba(37, 99, 235, 0.14)'
              : '0 2px 8px rgba(15, 23, 42, 0.04)',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

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
  const [forgotEmail, setForgotEmail] = useState('');
  const [newForgotPass, setNewForgotPass] = useState('');

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [blockedMessage, setBlockedMessage] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [activeTabFilter, setActiveTabFilter] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('techsetup_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clientOrders, setClientOrders] = useState([]);
  const [clientReservations, setClientReservations] = useState([]);
  const [clientTab, setClientTab] = useState('shop');
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [productToReserve, setProductToReserve] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [adminTab, setAdminTab] = useState('products');
  const [newProduct, setNewProduct] = useState({
    product_type: 'physical',
    name: '',
    category: '',
    price: '',
    description: '',
    image_url: '',
    file_url: '',
    stock: 10
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const timer = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
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
      .then((data) => { setProducts(data); setLoading(false); })
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

  const fetchClientReservations = () => {
    if (currentUser && currentUser.role === 'client') {
      fetch(`http://localhost:5000/api/reservations/${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          setClientReservations(data);
          fetchProducts();
        })
        .catch((err) => console.error('Erreur réservations :', err));
    }
  };

  useEffect(() => {
    fetchProducts();
    if (currentUser?.role === 'admin') fetchUsers();
    if (currentUser?.role === 'client') {
      fetchClientOrders();
      fetchClientReservations();
    }
  }, [currentUser]);

  const availableProductsForCategories = products.filter((p) => {
    if (activeTabFilter === 'physical') return p.product_type === 'physical';
    if (activeTabFilter === 'digital') return p.product_type === 'digital';
    return true;
  });
  const categories = ['Toutes', ...new Set(availableProductsForCategories.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products.filter((product) => {
    const matchesTab = activeTabFilter === 'all' || product.product_type === activeTabFilter;
    const matchesCategory = selectedCategory === 'Toutes' || product.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query));

    return matchesTab && matchesCategory && matchesSearch;
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    setBlockedMessage(null);

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
          } else {
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);
            if (newAttempts >= 3) setLockoutTimer(10);
          }
          return;
        }

        if (data.user) {
          setCurrentUser(data.user);
          setIsAuthModalOpen(false);
          setShowPassword(false);
          setFailedAttempts(0);
          setLockoutTimer(0);
          setBlockedMessage(null);
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
          setFailedAttempts(0);
          setLockoutTimer(0);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('techsetup_user');
  };

  const openReserveModal = (product) => {
    if (product.product_type === 'digital') {
      alert("Ce produit est un livre numérique et s'achète directement sans réservation.");
      return;
    }
    if (product.stock <= 0) {
      alert("Ce produit est en rupture de stock.");
      return;
    }
    if (!currentUser) {
      alert("Veuillez vous connecter pour réserver un produit.");
      setIsAuthModalOpen(true);
      return;
    }
    setProductToReserve(product);
    setDepositAmount((Number(product.price) * 0.10).toFixed(2));
    setIsReserveModalOpen(true);
  };

  const handleCreateReservation = (e) => {
    e.preventDefault();
    const minDeposit = Number(productToReserve.price) * 0.10;
    if (Number(depositAmount) < minDeposit) {
      alert(`L'acompte obligatoire est d'au moins 10% du prix, soit $${minDeposit.toFixed(2)}.`);
      return;
    }

    fetch('http://localhost:5000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        productId: productToReserve.id,
        productName: productToReserve.name,
        totalPrice: productToReserve.price,
        depositPaid: Number(depositAmount)
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          alert(data.message);
          setIsReserveModalOpen(false);
          setProductToReserve(null);
          setDepositAmount('');
          fetchProducts();
          fetchClientReservations();
          setClientTab('reservations');
        }
      })
      .catch((err) => console.error(err));
  };

  const handleCancelReservation = (reservationId) => {
    const confirmation = window.confirm(
      "⚠️ Attention : Êtes-vous sûr de vouloir annuler cette réservation ?\n\nConformément aux conditions générales, le montant de l'acompte versé ne vous sera PAS remboursé."
    );
    if (!confirmation) return;

    fetch('http://localhost:5000/api/reservations/cancel', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) alert(data.error);
        else {
          alert(data.message);
          fetchClientReservations();
          fetchProducts();
        }
      })
      .catch((err) => console.error('Erreur annulation :', err));
  };

  const addToCart = (product) => {
    if (product.product_type === 'physical' && product.stock <= 0) {
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
          alert('Commande validée avec succès ! Les accès aux livres numériques sont désormais actifs dans votre espace.');
          setCart([]);
          localStorage.removeItem('techsetup_cart');
          setIsCartOpen(false);
          fetchProducts();
          fetchClientOrders();
        }
      });
  };

  const handleUserPasswordChange = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas !");
      return;
    }
    fetch('http://localhost:5000/api/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, oldPassword: passwords.oldPassword, newPassword: passwords.newPassword })
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
      });
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    }).then(() => {
      alert('Article ajouté avec succès !');
      setNewProduct({ product_type: 'physical', name: '', category: '', price: '', description: '', image_url: '', file_url: '', stock: 10 });
      fetchProducts();
    });
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct)
    }).then(() => { alert('Article mis à jour !'); setEditingProduct(null); fetchProducts(); });
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Supprimer cet article ?")) {
      fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' }).then(() => fetchProducts());
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

      {/* Modal Réservation */}
      {isReserveModalOpen && productToReserve && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '15px', boxSizing: 'border-box' }}>
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '440px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}>
            <button onClick={() => { setIsReserveModalOpen(false); setProductToReserve(null); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>Réserver ce produit</h2>
            <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#475569' }}>
              Article : <strong>{productToReserve.name}</strong> — Prix total : <strong style={{ color: '#2563eb' }}>${Number(productToReserve.price).toFixed(2)}</strong>
            </p>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', padding: '14px', borderRadius: '8px', marginBottom: '18px', color: '#92400e', fontSize: '13px', lineHeight: '1.5' }}>
              <strong style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>⚠️ Conditions importantes de réservation :</strong>
              <ul style={{ margin: '0 0 0 18px', padding: 0 }}>
                <li>Acompte minimum de <strong>10 %</strong> (soit <strong>${(Number(productToReserve.price) * 0.10).toFixed(2)}</strong>).</li>
                <li>Validité stricte de <strong>72 heures (3 jours)</strong>.</li>
                <li>Passé ce délai sans solde, la réservation est automatiquement annulée (acompte non remboursable).</li>
              </ul>
            </div>

            <form onSubmit={handleCreateReservation} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
                  Montant de l'acompte à payer ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={(Number(productToReserve.price) * 0.10).toFixed(2)}
                  max={Number(productToReserve.price).toFixed(2)}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px', fontWeight: 'bold' }}
                />
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                  Reste à payer sous 72h : <strong>${Math.max(0, Number(productToReserve.price) - Number(depositAmount || 0)).toFixed(2)}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Accepter et Réserver
                </button>
                <button type="button" onClick={() => { setIsReserveModalOpen(false); setProductToReserve(null); }} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Auth */}
      {isAuthModalOpen && !currentUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' }}>
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '400px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <button onClick={() => { setIsAuthModalOpen(false); setBlockedMessage(null); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            
            {blockedMessage && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', padding: '14px', borderRadius: '8px', marginBottom: '15px', color: '#991b1b', fontSize: '13px', lineHeight: '1.5' }}>
                <strong style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>{blockedMessage.error}</strong>
                <p style={{ margin: 0 }}>{blockedMessage.support}</p>
              </div>
            )}

            {authMode === 'login' && !blockedMessage && (failedAttempts > 0 || lockoutTimer > 0) && (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: '#92400e', fontSize: '13px', lineHeight: '1.4' }}>
                {lockoutTimer > 0 ? (
                  <strong>Trop de tentatives échouées. Patientez {lockoutTimer}s avant de réessayer.</strong>
                ) : (
                  <>
                    <strong>Mot de passe incorrect ({failedAttempts}/3 essais).</strong>
                    <div style={{ marginTop: '5px' }}>
                      <button type="button" onClick={() => { setForgotEmail(email); setAuthMode('forgot'); }} style={{ background: 'none', border: 'none', padding: 0, color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        Mot de passe oublié ?
                      </button>
                    </div>
                  </>
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
                    <button type="button" onClick={() => setAuthMode('forgot')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Mot de passe oublié ?</button>
                  </div>
                  <button type="submit" disabled={lockoutTimer > 0} style={{ background: lockoutTimer > 0 ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: lockoutTimer > 0 ? 'not-allowed' : 'pointer' }}>
                    {lockoutTimer > 0 ? `Patienter (${lockoutTimer}s)...` : 'Se connecter'}
                  </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button onClick={() => setAuthMode('register')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Pas encore de compte ? S'inscrire</button>
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
                    <span style={{ fontSize: '11px', backgroundColor: item.product_type === 'digital' ? '#f3e8ff' : '#eff6ff', color: item.product_type === 'digital' ? '#7e22ce' : '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      {item.product_type === 'digital' ? '📚 E-book' : '💻 Matériel'}
                    </span>
                    <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: 'bold', marginTop: '2px' }}>${Number(item.price).toFixed(2)}</div>
                  </div>
                  <button onClick={() => removeFromCart(index)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Retirer</button>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}><span>Total :</span><span style={{ color: '#2563eb' }}>${totalPrice.toFixed(2)}</span></div>
              <button onClick={handleCheckout} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Valider la commande</button>
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
              <button onClick={() => setAdminTab('products')} style={{ padding: '8px 16px', borderRadius: '6px', background: adminTab === 'products' ? '#2563eb' : '#f1f5f9', color: adminTab === 'products' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>➕ Ajouter un Article</button>
              <button onClick={() => setAdminTab('stock')} style={{ padding: '8px 16px', borderRadius: '6px', background: adminTab === 'stock' ? '#2563eb' : '#f1f5f9', color: adminTab === 'stock' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>📦 Catalogue & Stocks</button>
              <button onClick={() => setAdminTab('users')} style={{ padding: '8px 16px', borderRadius: '6px', background: adminTab === 'users' ? '#2563eb' : '#f1f5f9', color: adminTab === 'users' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>👥 Clients & VIP ({totalFideles})</button>
              <button onClick={() => setAdminTab('settings')} style={{ padding: '8px 16px', borderRadius: '6px', background: adminTab === 'settings' ? '#2563eb' : '#f1f5f9', color: adminTab === 'settings' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>🔒 Sécurité</button>
            </div>

            {adminTab === 'products' && (
              <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>Publier un nouvel article ou service numérique</h3>
                
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Type d'article</label>
                  <select
                    value={newProduct.product_type}
                    onChange={(e) => setNewProduct({ ...newProduct, product_type: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                  >
                    <option value="physical">💻 Matériel Informatique (Physique)</option>
                    <option value="digital">📚 Livre Numérique / E-book (Numérique)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Nom de l'article</label>
                  <input type="text" placeholder="Ex: Clavier Mécanique ou Maîtriser Python" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Catégorie</label>
                    <input type="text" placeholder={newProduct.product_type === 'digital' ? "Ex: Informatique, Comptabilité, Dev Personnel" : "Ex: Périphériques"} value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Prix ($)</label>
                    <input type="number" step="0.01" placeholder="29.99" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  {newProduct.product_type === 'physical' && (
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Stock initial</label>
                      <input type="number" placeholder="10" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Description</label>
                  <textarea placeholder="Description détaillée..." value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>URL de l'image de couverture</label>
                  <input type="url" placeholder="https://..." value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>

                {newProduct.product_type === 'digital' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Lien de téléchargement du livre (PDF/EPUB)</label>
                    <input type="url" placeholder="https://... mon-livre.pdf" value={newProduct.file_url} onChange={(e) => setNewProduct({ ...newProduct, file_url: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                )}

                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Publier l'article</button>
              </form>
            )}

            {adminTab === 'stock' && (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Catalogue & Stocks</h3>
                {editingProduct && (
                  <form onSubmit={handleUpdateProduct} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ margin: 0, color: '#2563eb' }}>Modifier : {editingProduct.name}</h4>
                    <select value={editingProduct.product_type} onChange={(e) => setEditingProduct({ ...editingProduct, product_type: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                      <option value="physical">Matériel Physique</option>
                      <option value="digital">Livre Numérique</option>
                    </select>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Nom" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <input type="text" value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} placeholder="Catégorie" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} placeholder="Prix" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      {editingProduct.product_type === 'physical' && (
                        <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} placeholder="Stock" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      )}
                    </div>
                    <input type="url" value={editingProduct.image_url} onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })} placeholder="URL Image" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    {editingProduct.product_type === 'digital' && (
                      <input type="url" value={editingProduct.file_url || ''} onChange={(e) => setEditingProduct({ ...editingProduct, file_url: e.target.value })} placeholder="Lien du fichier E-book" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    )}
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
                        <th style={{ padding: '10px' }}>Article</th>
                        <th style={{ padding: '10px' }}>Type</th>
                        <th style={{ padding: '10px' }}>Prix</th>
                        <th style={{ padding: '10px' }}>Stock / Accès</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: '500' }}>{p.name}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ fontSize: '11px', backgroundColor: p.product_type === 'digital' ? '#f3e8ff' : '#eff6ff', color: p.product_type === 'digital' ? '#7e22ce' : '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                              {p.product_type === 'digital' ? 'E-book' : 'Matériel'}
                            </span>
                          </td>
                          <td style={{ padding: '10px' }}>${Number(p.price).toFixed(2)}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>
                            {p.product_type === 'digital' ? 'Illimité (Numérique)' : p.stock}
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
              <button onClick={() => setClientTab('shop')} style={{ padding: '8px 16px', borderRadius: '6px', background: clientTab === 'shop' ? '#2563eb' : '#ffffff', color: clientTab === 'shop' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #e2e8f0' }}>🛍️ Boutique & E-books</button>
              <button onClick={() => setClientTab('orders')} style={{ padding: '8px 16px', borderRadius: '6px', background: clientTab === 'orders' ? '#2563eb' : '#ffffff', color: clientTab === 'orders' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #e2e8f0' }}>📦 Mes Commandes ({clientOrders.length})</button>
              <button onClick={() => { setClientTab('reservations'); fetchClientReservations(); }} style={{ padding: '8px 16px', borderRadius: '6px', background: clientTab === 'reservations' ? '#2563eb' : '#ffffff', color: clientTab === 'reservations' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #e2e8f0' }}>⏳ Mes Réservations ({clientReservations.length})</button>
              <button onClick={() => setClientTab('settings')} style={{ padding: '8px 16px', borderRadius: '6px', background: clientTab === 'settings' ? '#2563eb' : '#ffffff', color: clientTab === 'settings' ? '#ffffff' : '#475569', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #e2e8f0' }}>🔒 Mon Compte & Sécurité</button>
            </div>

            {clientTab === 'shop' && (
              <div>
                <SearchAndFiltersBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isSearchFocused={isSearchFocused}
                  setIsSearchFocused={setIsSearchFocused}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  activeTabFilter={activeTabFilter}
                  setActiveTabFilter={setActiveTabFilter}
                />

                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', marginBottom: '10px', color: '#3b82f6', fontWeight: '800' }}>Booste ton espace de travail & compétences</h1>
                  <p style={{ color: '#64748b', fontSize: 'clamp(14px, 2vw, 16px)' }}>Équipements informatiques ou livres numériques (informatique, comptabilité, développement personnel).</p>
                </div>

                {loading ? <p style={{ textAlign: 'center', color: '#64748b' }}>Chargement...</p> : filteredProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <p style={{ fontSize: '16px', marginBottom: '12px' }}>Aucun article ne correspond à votre recherche.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCategory('Toutes'); setActiveTabFilter('all'); }}
                      style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px', width: '100%' }}>
                    {filteredProducts.map((product) => {
                      const isDigital = product.product_type === 'digital';
                      return (
                        <div key={product.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ height: '200px', backgroundColor: '#e2e8f0', backgroundImage: `url(${product.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                            <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '11px', backgroundColor: isDigital ? '#7e22ce' : '#1d4ed8', color: '#ffffff', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                              {isDigital ? '📚 E-book' : '💻 Matériel'}
                            </span>
                          </div>
                          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', width: 'fit-content', fontWeight: '600', marginBottom: '8px' }}>{product.category}</span>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>{product.name}</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '10px', flexGrow: 1 }}>{product.description}</p>
                            
                            <p style={{ fontSize: '13px', fontWeight: 'bold', color: isDigital ? '#7e22ce' : (product.stock > 0 ? '#15803d' : '#dc2626'), marginBottom: '15px' }}>
                              {isDigital ? '⚡ Accès numérique immédiat' : (product.stock > 0 ? `Stock : ${product.stock} dispo` : 'Rupture de stock')}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>${Number(product.price).toFixed(2)}</span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {!isDigital && (
                                  <button onClick={() => openReserveModal(product)} disabled={product.stock <= 0} style={{ background: product.stock > 0 ? '#f1f5f9' : '#e2e8f0', color: product.stock > 0 ? '#0f172a' : '#94a3b8', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '8px', cursor: product.stock > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '13px' }}>Réserver</button>
                                )}
                                <button onClick={() => addToCart(product)} disabled={!isDigital && product.stock <= 0} style={{ background: !isDigital && product.stock <= 0 ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                                  {isDigital ? 'Acheter' : 'Ajouter'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {clientTab === 'orders' && (
              <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginBottom: '20px' }}>Historique de mes Commandes & E-books</h3>
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
                          <div style={{ fontSize: '11px', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: 'bold' }}>Payée & Validée</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {clientTab === 'reservations' && (
              <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginBottom: '8px' }}>Mes Réservations de Matériel (Délai 72h)</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                  Toute réservation non soldée dans les 72 heures est automatiquement annulée. Vous pouvez aussi annuler manuellement (l'acompte ne sera pas remboursé).
                </p>
                {clientReservations.length === 0 ? (
                  <p style={{ color: '#64748b' }}>Vous n'avez aucune réservation en cours.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {clientReservations.map((resv) => {
                      const remainingBalance = Math.max(0, Number(resv.total_price) - Number(resv.deposit_paid));
                      const isExpired = resv.status === 'expired';
                      const isCancelled = resv.status === 'cancelled';
                      const isActive = resv.status === 'active';

                      return (
                        <div key={resv.id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', backgroundColor: (isExpired || isCancelled) ? '#fef2f2' : '#ffffff' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{resv.product_name} (Réf #{resv.id})</h4>
                            <div style={{ fontSize: '13px', color: '#475569' }}>
                              Acompte versé : <strong style={{ color: '#15803d' }}>${Number(resv.deposit_paid).toFixed(2)}</strong> / ${Number(resv.total_price).toFixed(2)} — Reste à payer : <strong>${remainingBalance.toFixed(2)}</strong>
                            </div>
                            <span style={{ fontSize: '12px', color: (isExpired || isCancelled) ? '#dc2626' : '#64748b', display: 'block', marginTop: '4px' }}>
                              {isCancelled ? 'Réservation annulée par vos soins' : `Expire le : ${new Date(resv.expires_at).toLocaleString()}`}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', backgroundColor: isCancelled ? '#fee2e2' : isExpired ? '#fee2e2' : '#fef3c7', color: isCancelled ? '#dc2626' : isExpired ? '#dc2626' : '#b45309' }}>
                              {isCancelled ? 'Annulée' : isExpired ? 'Expirée (72h)' : 'Active (En attente)'}
                            </span>

                            {isActive && (
                              <button onClick={() => handleCancelReservation(resv.id)} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                                Annuler
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
          /* ================= BOUTIQUE VISITEUR ================= */
          <div style={{ width: '100%' }}>
            <SearchAndFiltersBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearchFocused={isSearchFocused}
              setIsSearchFocused={setIsSearchFocused}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              activeTabFilter={activeTabFilter}
              setActiveTabFilter={setActiveTabFilter}
            />

            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', marginBottom: '10px', color: '#3b82f6', fontWeight: '800' }}>Booste ton espace de travail & compétences</h1>
              <p style={{ color: '#64748b', fontSize: 'clamp(14px, 2vw, 16px)' }}>Équipements informatiques ou livres numériques (informatique, comptabilité, développement personnel).</p>
            </div>

            {loading ? <p style={{ textAlign: 'center', color: '#64748b' }}>Chargement...</p> : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <p style={{ fontSize: '16px', marginBottom: '12px' }}>Aucun article ne correspond à votre recherche.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('Toutes'); setActiveTabFilter('all'); }}
                  style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px', width: '100%' }}>
                {filteredProducts.map((product) => {
                  const isDigital = product.product_type === 'digital';
                  return (
                    <div key={product.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '200px', backgroundColor: '#e2e8f0', backgroundImage: `url(${product.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '11px', backgroundColor: isDigital ? '#7e22ce' : '#1d4ed8', color: '#ffffff', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                          {isDigital ? '📚 E-book' : '💻 Matériel'}
                        </span>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', width: 'fit-content', fontWeight: '600', marginBottom: '8px' }}>{product.category}</span>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>{product.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '10px', flexGrow: 1 }}>{product.description}</p>
                        
                        <p style={{ fontSize: '13px', fontWeight: 'bold', color: isDigital ? '#7e22ce' : (product.stock > 0 ? '#15803d' : '#dc2626'), marginBottom: '15px' }}>
                          {isDigital ? '⚡ Accès numérique immédiat' : (product.stock > 0 ? `Stock : ${product.stock} dispo` : 'Rupture de stock')}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>${Number(product.price).toFixed(2)}</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {!isDigital && (
                              <button onClick={() => openReserveModal(product)} disabled={product.stock <= 0} style={{ background: product.stock > 0 ? '#f1f5f9' : '#e2e8f0', color: product.stock > 0 ? '#0f172a' : '#94a3b8', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '8px', cursor: product.stock > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '13px' }}>Réserver</button>
                            )}
                            <button onClick={() => addToCart(product)} disabled={!isDigital && product.stock <= 0} style={{ background: !isDigital && product.stock <= 0 ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                              {isDigital ? 'Acheter' : 'Ajouter'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;