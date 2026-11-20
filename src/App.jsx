import { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://localhost:5000';

const DEFAULT_ADMIN_PERMISSIONS = {
  can_manage_products: false,
  can_manage_orders: true,
  can_manage_cashier: false,
  can_manage_clients: false
};

const isSuperAdmin = (user) => user?.role === 'super_admin';
const isAnyAdmin = (user) => user?.role === 'admin' || user?.role === 'super_admin';

const hasPermission = (user, permKey) => {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.role === 'admin') {
    return Boolean(user.permissions && user.permissions[permKey]);
  }
  return false;
};

const DELIVERY_STATUS_LABELS = {
  pending: 'En attente',
  preparing: 'En préparation',
  shipped: 'Expédiée / En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée'
};

const PAYMENT_STATUS_LABELS = {
  unpaid: 'Non payée',
  deposit_paid: 'Acompte payé',
  paid: 'Payée',
  refunded: 'Remboursée'
};

const CASHIER_TYPE_LABELS = {
  sale: 'Vente directe',
  deposit: 'Acompte réservation',
  balance: 'Solde réservation',
  refund: 'Remboursement',
  expense: 'Dépense / Retrait'
};

const PAYMENT_METHOD_LABELS = {
  cash: 'Espèces',
  mobile_money: 'Mobile Money',
  card: 'Carte bancaire',
  bank_transfer: 'Virement'
};

const SearchAndFiltersBar = ({
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  categories,
  selectedCategory,
  setSelectedCategory,
  activeTabFilter,
  setActiveTabFilter,
  isDark
}) => {
  const selectStyle = {
    padding: '11px 14px',
    borderRadius: '12px',
    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: '13.5px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
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
        marginBottom: '28px',
        boxSizing: 'border-box'
      }}
    >
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

      <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
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
            stroke="#3b82f6"
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
            border: isSearchFocused
              ? '1.5px solid #3b82f6'
              : isDark
              ? '1px solid #334155'
              : '1px solid #cbd5e1',
            fontSize: '13.5px',
            color: isDark ? '#f8fafc' : '#0f172a',
            boxSizing: 'border-box',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            boxShadow: isSearchFocused
              ? '0 4px 14px rgba(59, 130, 246, 0.2)'
              : '0 2px 8px rgba(15, 23, 42, 0.06)',
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
              background: isDark ? '#334155' : '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#e2e8f0' : '#475569',
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

const LandingPage = ({ onGoToShop, onFilterAndGoToShop, onOpenAuth, isDark, palette }) => {
  const cardStyle = {
    backgroundColor: palette.surface,
    border: `1px solid ${palette.border}`,
    borderRadius: '14px',
    padding: '22px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  const badgeStyle = {
    width: 'fit-content',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: isDark ? '#1e3a8a' : '#eff6ff',
    color: isDark ? '#93c5fd' : '#1d4ed8'
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1120px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '38px',
        boxSizing: 'border-box'
      }}
    >
      <section
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          border: `1px solid ${palette.border}`,
          borderRadius: '18px',
          padding: 'clamp(24px, 4vw, 44px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span
            style={{
              width: 'fit-content',
              fontSize: '12px',
              fontWeight: '700',
              padding: '5px 12px',
              borderRadius: '999px',
              backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
              color: isDark ? '#93c5fd' : '#1d4ed8'
            }}
          >
            ⚡ TechSetup Store • Matériel &amp; E-books
          </span>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(24px, 4vw, 40px)',
              lineHeight: '1.18',
              fontWeight: '800',
              color: palette.text
            }}
          >
            Booste ton espace de travail &amp; <span style={{ color: '#3b82f6' }}>tes compétences.</span>
          </h1>

          <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: palette.textMuted }}>
            Équipements informatiques ou livres numériques (informatique, comptabilité, développement personnel) réunis dans une plateforme claire, rapide et fiable.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onGoToShop}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 22px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)'
              }}
            >
              Découvrir la boutique →
            </button>

            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                style={{
                  backgroundColor: palette.surface,
                  color: palette.text,
                  border: `1px solid ${palette.border}`,
                  borderRadius: '10px',
                  padding: '12px 18px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Mon compte
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: palette.surface,
            border: `1.5px solid ${isDark ? '#3b82f6' : '#93c5fd'}`,
            borderRadius: '14px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: '800',
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Offre &amp; Avantages Membres
          </span>
          <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: palette.text }}>
            Réservez dès 10 % d'acompte &amp; devenez VIP
          </h2>
          <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.55', color: palette.textMuted }}>
            Bloquez votre équipement informatique pendant <strong>72 heures</strong> avec un acompte dès 10 %, recevez vos e-books immédiatement après commande, et débloquez le statut <strong>Client VIP</strong> dès 3 commandes.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onFilterAndGoToShop('physical')}
              style={{
                backgroundColor: isDark ? '#1e3a8a' : '#eff6ff',
                color: isDark ? '#93c5fd' : '#1d4ed8',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Matériel →
            </button>
            <button
              type="button"
              onClick={() => onFilterAndGoToShop('digital')}
              style={{
                backgroundColor: isDark ? '#3b0764' : '#f3e8ff',
                color: isDark ? '#d8b4fe' : '#7e22ce',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              E-books →
            </button>
          </div>
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>OFFRES &amp; FORMULES</span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: palette.text }}>
            Des formules adaptées à votre rythme
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
          <div style={cardStyle}>
            <span style={badgeStyle}>Achat Direct</span>
            <strong style={{ fontSize: '17px', color: palette.text }}>Setup &amp; Accessoires Prêts à l'emploi</strong>
            <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.55', color: palette.textMuted }}>
              Ajoutez vos équipements au panier et validez votre commande en quelques clics avec un suivi clair de votre stock disponible.
            </p>
            <button
              type="button"
              onClick={() => onFilterAndGoToShop('physical')}
              style={{
                marginTop: 'auto',
                width: 'fit-content',
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#3b82f6',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Voir le matériel →
            </button>
          </div>

          <div style={cardStyle}>
            <span
              style={{
                ...badgeStyle,
                backgroundColor: isDark ? '#3b0764' : '#f3e8ff',
                color: isDark ? '#d8b4fe' : '#7e22ce'
              }}
            >
              Accès Immédiat
            </span>
            <strong style={{ fontSize: '17px', color: palette.text }}>Pack Savoir : Tech, Compta &amp; Perso</strong>
            <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.55', color: palette.textMuted }}>
              Développez vos compétences pratiques avec des livres numériques accessibles instantanément dès la validation de votre commande.
            </p>
            <button
              type="button"
              onClick={() => onFilterAndGoToShop('digital')}
              style={{
                marginTop: 'auto',
                width: 'fit-content',
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#a855f7',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Explorer les e-books →
            </button>
          </div>

          <div style={cardStyle}>
            <span
              style={{
                ...badgeStyle,
                backgroundColor: isDark ? '#451a03' : '#fef3c7',
                color: isDark ? '#fcd34d' : '#b45309'
              }}
            >
              Flexibilité
            </span>
            <strong style={{ fontSize: '17px', color: palette.text }}>Réservation 72h &amp; Programme VIP</strong>
            <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.55', color: palette.textMuted }}>
              Besoin d'un petit délai pour finaliser ? Réservez dès 10 % d'acompte pendant 72h et profitez d'avantages dès 3 commandes.
            </p>
            <button
              type="button"
              onClick={onGoToShop}
              style={{
                marginTop: 'auto',
                width: 'fit-content',
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#f59e0b',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Découvrir le catalogue →
            </button>
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>NOTRE HISTOIRE</span>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: palette.text }}>
          Pourquoi nous avons créé TechSetup Store
        </h2>
        <p style={{ margin: 0, fontSize: '14.5px', lineHeight: '1.65', color: palette.textMuted }}>
          TechSetup Store est né d'un constat simple : travailler efficacement, étudier ou lancer un projet demande à la fois un poste de travail bien pensé et des ressources claires pour monter en compétences. Plutôt que de multiplier les sites peu fiables, nous avons rassemblé dans un seul espace du matériel informatique sélectionné avec soin et des guides numériques concrets pour progresser au quotidien.
        </p>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>NOS SERVICES</span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: palette.text }}>
            Comment nous vous accompagnons
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
          <div style={cardStyle}>
            <strong style={{ fontSize: '16px', color: palette.text }}>1. Choisissez &amp; Filtrez</strong>
            <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.55', color: palette.textMuted }}>
              Naviguez entre le matériel informatique et les livres numériques, filtrez par catégorie ou utilisez la recherche instantanée.
            </p>
          </div>

          <div style={cardStyle}>
            <strong style={{ fontSize: '16px', color: palette.text }}>2. Achetez ou Réservez</strong>
            <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.55', color: palette.textMuted }}>
              Commandez directement via votre panier ou bloquez un article physique pendant 72h grâce à un acompte minimum de 10 %.
            </p>
          </div>

          <div style={cardStyle}>
            <strong style={{ fontSize: '16px', color: palette.text }}>3. Suivez votre Espace</strong>
            <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.55', color: palette.textMuted }}>
              Retrouvez l'historique de vos commandes, vos réservations actives et personnalisez votre profil en toute simplicité.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          ...cardStyle,
          alignItems: 'center',
          textAlign: 'center',
          padding: '28px 20px'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: palette.text }}>
          Prêt à parcourir le catalogue ?
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: palette.textMuted, maxWidth: '520px' }}>
          Filtrez par catégorie, recherchez un produit ou un e-book, et ajoutez vos choix au panier en un clic.
        </p>
        <button
          type="button"
          onClick={onGoToShop}
          style={{
            marginTop: '6px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Accéder à la boutique →
        </button>
      </section>
    </div>
  );
};

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef(null);

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('techsetup_theme_mode') || 'default';
  });

  const isDark = themeMode === 'dark';

  useEffect(() => {
    localStorage.setItem('techsetup_theme_mode', themeMode);
  }, [themeMode]);

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('techsetup_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [profileCustom, setProfileCustom] = useState({ displayName: '', avatarData: '' });
  const [emailInput, setEmailInput] = useState('');

  const [settingsSection, setSettingsSection] = useState('menu');

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
  const [activePage, setActivePage] = useState('landing');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('techsetup_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [clientOrders, setClientOrders] = useState([]);
  const [clientReservations, setClientReservations] = useState([]);
  const [clientTab, setClientTab] = useState('shop');
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [productToReserve, setProductToReserve] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [adminTab, setAdminTab] = useState('orders');
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

  // --- États Commandes & Livraison (can_manage_orders) ---
  const [adminOrders, setAdminOrders] = useState([]);
  const [deliveryDrafts, setDeliveryDrafts] = useState({});
  const [savingOrderId, setSavingOrderId] = useState(null);

  // --- États Caisse (can_manage_cashier) ---
  const [cashierSummary, setCashierSummary] = useState({
    total_in: 0,
    total_out: 0,
    net_balance: 0,
    transactions: []
  });
  const [newCashTx, setNewCashTx] = useState({
    order_id: '',
    reservation_id: '',
    type: 'sale',
    payment_method: 'cash',
    amount: '',
    note: ''
  });

  const authHeaders = currentUser?.id
    ? { 'x-user-id': String(currentUser.id) }
    : {};

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
    if (currentUser) {
      const key = `techsetup_profile_${currentUser.id}`;
      const saved = localStorage.getItem(key);
      const parsed = saved ? JSON.parse(saved) : { displayName: currentUser.name, avatarData: '' };
      setProfileCustom({ ...parsed, displayName: currentUser.name || parsed.displayName || '' });
      setEmailInput(currentUser.email || '');

      if (isSuperAdmin(currentUser)) {
        setAdminTab('super_admin');
      } else if (hasPermission(currentUser, 'can_manage_orders')) {
        setAdminTab('orders');
      } else if (hasPermission(currentUser, 'can_manage_products')) {
        setAdminTab('stock');
      } else if (hasPermission(currentUser, 'can_manage_cashier')) {
        setAdminTab('cashier');
      } else if (hasPermission(currentUser, 'can_manage_clients')) {
        setAdminTab('users');
      } else {
        setAdminTab('settings');
      }
    } else {
      setProfileCustom({ displayName: '', avatarData: '' });
      setEmailInput('');
    }
  }, [currentUser]);

  const fetchProducts = () => {
    fetch(`${API_BASE}/api/products`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur produits :', err);
        setLoading(false);
      });
  };

  const fetchUsers = () => {
    if (!currentUser || !isAnyAdmin(currentUser)) return;
    fetch(`${API_BASE}/api/admin/users`, {
      headers: { ...authHeaders }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setUsersList(data);
      })
      .catch((err) => console.error('Erreur utilisateurs :', err));
  };

  const fetchAdminOrders = () => {
    if (!currentUser || !hasPermission(currentUser, 'can_manage_orders')) return;
    fetch(`${API_BASE}/api/admin/orders`, {
      headers: { ...authHeaders }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setAdminOrders(data);
          const nextDrafts = {};
          data.forEach((o) => {
            nextDrafts[o.id] = {
              delivery_status: o.delivery_status || 'pending',
              delivery_address: o.delivery_address || '',
              delivery_phone: o.delivery_phone || '',
              delivery_notes: o.delivery_notes || ''
            };
          });
          setDeliveryDrafts(nextDrafts);
        }
      })
      .catch((err) => console.error('Erreur chargement commandes admin :', err));
  };

  const fetchCashierSummary = () => {
    if (!currentUser || !hasPermission(currentUser, 'can_manage_cashier')) return;
    fetch(`${API_BASE}/api/admin/cashier/summary`, {
      headers: { ...authHeaders }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          setCashierSummary({
            total_in: Number(data.total_in || 0),
            total_out: Number(data.total_out || 0),
            net_balance: Number(data.net_balance || 0),
            transactions: Array.isArray(data.transactions) ? data.transactions : []
          });
        }
      })
      .catch((err) => console.error('Erreur chargement caisse :', err));
  };

  const fetchClientOrders = () => {
    if (currentUser && currentUser.role === 'client') {
      fetch(`${API_BASE}/api/orders/${currentUser.id}`, {
        headers: { ...authHeaders }
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setClientOrders(data);
        })
        .catch((err) => console.error('Erreur commandes :', err));
    }
  };

  const fetchClientReservations = () => {
    if (currentUser && currentUser.role === 'client') {
      fetch(`${API_BASE}/api/reservations/${currentUser.id}`, {
        headers: { ...authHeaders }
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setClientReservations(data);
          fetchProducts();
        })
        .catch((err) => console.error('Erreur réservations :', err));
    }
  };

  useEffect(() => {
    fetchProducts();
    if (isAnyAdmin(currentUser)) {
      fetchUsers();
      fetchAdminOrders();
      fetchCashierSummary();
    }
    if (currentUser?.role === 'client') {
      fetchClientOrders();
      fetchClientReservations();
    }
  }, [currentUser]);

  const handleDeliveryDraftChange = (orderId, field, value) => {
    setDeliveryDrafts((prev) => ({
      ...prev,
      [orderId]: {
        delivery_status: 'pending',
        delivery_address: '',
        delivery_phone: '',
        delivery_notes: '',
        ...(prev[orderId] || {}),
        [field]: value
      }
    }));
  };

  const handleSaveOrderDelivery = (orderId) => {
    if (!hasPermission(currentUser, 'can_manage_orders')) {
      alert('Accès refusé : permission de gestion des commandes requise.');
      return;
    }
    const draft = deliveryDrafts[orderId];
    if (!draft) return;

    setSavingOrderId(orderId);
    fetch(`${API_BASE}/api/admin/orders/${orderId}/delivery`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(draft)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Erreur lors de la mise à jour de la livraison.');
          return;
        }
        alert(data.message || 'Livraison mise à jour.');
        fetchAdminOrders();
      })
      .catch((err) => console.error('Erreur livraison :', err))
      .finally(() => setSavingOrderId(null));
  };

  const handleCreateCashierTransaction = (e) => {
    e.preventDefault();
    if (!hasPermission(currentUser, 'can_manage_cashier')) {
      alert('Accès refusé : permission de gestion de caisse requise.');
      return;
    }
    if (Number(newCashTx.amount) <= 0) {
      alert('Veuillez saisir un montant supérieur à 0.');
      return;
    }

    fetch(`${API_BASE}/api/admin/cashier/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({
        order_id: newCashTx.order_id ? Number(newCashTx.order_id) : null,
        reservation_id: newCashTx.reservation_id ? Number(newCashTx.reservation_id) : null,
        type: newCashTx.type,
        payment_method: newCashTx.payment_method,
        amount: Number(newCashTx.amount),
        note: newCashTx.note.trim() || null
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Erreur lors de l'enregistrement en caisse.");
          return;
        }
        alert(data.message || 'Mouvement enregistré.');
        setNewCashTx({
          order_id: '',
          reservation_id: '',
          type: 'sale',
          payment_method: 'cash',
          amount: '',
          note: ''
        });
        fetchCashierSummary();
        if (hasPermission(currentUser, 'can_manage_orders')) {
          fetchAdminOrders();
        }
      })
      .catch((err) => console.error('Erreur caisse :', err));
  };

  const evaluatePasswordStrength = (pwd = '') => {
    const minLength = pwd.length >= 8;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

    const score = [minLength, hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

    let label = 'Faible';
    let color = '#ef4444';
    let percent = 20;

    if (!pwd) {
      label = 'À saisir (min. 8 caractères)';
      color = '#94a3b8';
      percent = 0;
    } else if (!minLength || score <= 2) {
      label = 'Faible';
      color = '#ef4444';
      percent = Math.max(25, score * 20);
    } else if (score === 3) {
      label = 'Moyen';
      color = '#f59e0b';
      percent = 60;
    } else if (score === 4) {
      label = 'Robuste';
      color = '#16a34a';
      percent = 80;
    } else {
      label = 'Très robuste';
      color = '#059669';
      percent = 100;
    }

    return {
      minLength,
      hasLower,
      hasUpper,
      hasNumber,
      hasSymbol,
      score,
      label,
      color,
      percent,
      isValid: minLength && score >= 3
    };
  };

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

    fetch(`${API_BASE}/api/login`, {
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
    const strength = evaluatePasswordStrength(password);
    if (!strength.minLength) {
      alert('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!strength.isValid) {
      alert('Choisissez un mot de passe plus robuste (au moins 8 caractères incluant majuscule, minuscule, chiffre ou symbole).');
      return;
    }

    fetch(`${API_BASE}/api/register`, {
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
    const strength = evaluatePasswordStrength(newForgotPass);
    if (!strength.minLength) {
      alert('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!strength.isValid) {
      alert('Choisissez un nouveau mot de passe plus robuste (au moins 8 caractères avec lettres, chiffres ou symboles).');
      return;
    }

    fetch(`${API_BASE}/api/forgot-password`, {
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
    setIsClientDrawerOpen(false);
    setIsAdminDrawerOpen(false);
    setClientTab('shop');
    setSettingsSection('menu');
    setActivePage('landing');
    localStorage.removeItem('techsetup_user');
  };

  const triggerGalleryPicker = () => {
    if (!currentUser) return;
    fileInputRef.current?.click();
  };

  const handleGalleryFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !currentUser) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format non supporté. Choisissez une image JPG, PNG, WEBP ou GIF.');
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert("L'image est trop lourde (maximum 2 Mo). Choisissez une photo plus légère.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 280;
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compactAvatar = canvas.toDataURL('image/jpeg', 0.82);
        const updated = {
          displayName: currentUser.name || profileCustom.displayName,
          avatarData: compactAvatar
        };
        setProfileCustom(updated);
        localStorage.setItem(`techsetup_profile_${currentUser.id}`, JSON.stringify(updated));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (!currentUser) return;
    const updated = {
      displayName: currentUser.name || profileCustom.displayName,
      avatarData: ''
    };
    setProfileCustom(updated);
    localStorage.setItem(`techsetup_profile_${currentUser.id}`, JSON.stringify(updated));
  };

  const handleSaveEmail = (e) => {
    e.preventDefault();
    const trimmedEmail = emailInput.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      alert('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    fetch(`${API_BASE}/api/user/email`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ email: trimmedEmail })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Erreur lors de la mise à jour de l'e-mail.");
          return;
        }
        if (data.user) {
          setCurrentUser(data.user);
          setEmailInput(data.user.email);
        } else {
          setCurrentUser((prev) => ({ ...prev, email: trimmedEmail }));
        }
        alert(data.message || 'Adresse e-mail mise à jour avec succès !');
      })
      .catch((err) => console.error('Erreur mise à jour e-mail :', err));
  };

  const openReserveModal = (product) => {
    if (product.product_type === 'digital') {
      alert("Ce produit est un livre numérique et s'achète directement sans réservation.");
      return;
    }
    if (product.stock <= 0) {
      alert('Ce produit est en rupture de stock.');
      return;
    }
    if (!currentUser) {
      alert('Veuillez vous connecter pour réserver un produit.');
      setIsAuthModalOpen(true);
      return;
    }
    setProductToReserve(product);
    setDepositAmount((Number(product.price) * 0.1).toFixed(2));
    setIsReserveModalOpen(true);
  };

  const handleCreateReservation = (e) => {
    e.preventDefault();
    const minDeposit = Number(productToReserve.price) * 0.1;
    if (Number(depositAmount) < minDeposit) {
      alert(`L'acompte obligatoire est d'au moins 10% du prix, soit $${minDeposit.toFixed(2)}.`);
      return;
    }

    fetch(`${API_BASE}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
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

    fetch(`${API_BASE}/api/reservations/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
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
      alert('Ce produit est en rupture de stock.');
      return;
    }
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);

  const handleCheckout = () => {
    if (!currentUser) {
      alert('Veuillez vous connecter pour passer commande.');
      setIsAuthModalOpen(true);
      setIsCartOpen(false);
      return;
    }
    fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
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
      alert('Les nouveaux mots de passe ne correspondent pas !');
      return;
    }
    const strength = evaluatePasswordStrength(passwords.newPassword);
    if (!strength.minLength) {
      alert('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!strength.isValid) {
      alert('Choisissez un mot de passe plus robuste (au moins 8 caractères incluant majuscule, minuscule, chiffre ou symbole).');
      return;
    }

    fetch(`${API_BASE}/api/user/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
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
      });
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!hasPermission(currentUser, 'can_manage_products')) {
      alert('Accès refusé : permission de gestion des produits requise.');
      return;
    }
    fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(newProduct)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Action refusée par le serveur.');
          return;
        }
        alert('Article ajouté avec succès !');
        setNewProduct({
          product_type: 'physical',
          name: '',
          category: '',
          price: '',
          description: '',
          image_url: '',
          file_url: '',
          stock: 10
        });
        fetchProducts();
      })
      .catch((err) => console.error('Erreur ajout produit :', err));
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    if (!hasPermission(currentUser, 'can_manage_products')) {
      alert('Accès refusé : permission de gestion des produits requise.');
      return;
    }
    fetch(`${API_BASE}/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(editingProduct)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Action refusée par le serveur.');
          return;
        }
        alert('Article mis à jour !');
        setEditingProduct(null);
        fetchProducts();
      })
      .catch((err) => console.error('Erreur modification produit :', err));
  };

  const handleDeleteProduct = (id) => {
    if (!hasPermission(currentUser, 'can_manage_products')) {
      alert('Accès refusé : permission de gestion des produits requise.');
      return;
    }
    if (window.confirm('Supprimer cet article ?')) {
      fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders }
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            alert(data.error || 'Suppression refusée par le serveur.');
            return;
          }
          fetchProducts();
        })
        .catch((err) => console.error('Erreur suppression produit :', err));
    }
  };

  const handleSuperAdminRoleChange = (targetUser, newRole) => {
    if (!isSuperAdmin(currentUser)) {
      alert('Action réservée exclusivement au Super Admin.');
      return;
    }
    if (targetUser.role === 'super_admin') {
      alert("Le rôle d'un Super Admin ne peut pas être modifié ici.");
      return;
    }

    const nextPermissions =
      newRole === 'admin'
        ? { ...DEFAULT_ADMIN_PERMISSIONS, ...(targetUser.permissions || {}) }
        : {
            can_manage_products: false,
            can_manage_orders: false,
            can_manage_cashier: false,
            can_manage_clients: false
          };

    fetch(`${API_BASE}/api/super-admin/user-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({
        targetUserId: targetUser.id,
        newRole,
        permissions: nextPermissions
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Erreur lors du changement de rôle.');
          return;
        }
        if (data.user && String(data.user.id) === String(currentUser.id)) {
          setCurrentUser(data.user);
        }
        fetchUsers();
      })
      .catch((err) => console.error('Erreur rôle super admin :', err));
  };

  const handleToggleAdminPermission = (adminUser, permKey) => {
    if (!isSuperAdmin(currentUser)) {
      alert("Seul le Super Admin peut modifier les accès d'un administrateur.");
      return;
    }
    if (adminUser.role !== 'admin') return;

    const currentPerms = { ...DEFAULT_ADMIN_PERMISSIONS, ...(adminUser.permissions || {}) };
    const updatedPerms = {
      ...currentPerms,
      [permKey]: !currentPerms[permKey]
    };

    fetch(`${API_BASE}/api/super-admin/user-permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({
        targetUserId: adminUser.id,
        permissions: updatedPerms
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Erreur lors de la mise à jour des accès.');
          return;
        }
        if (data.user && String(data.user.id) === String(currentUser.id)) {
          setCurrentUser(data.user);
        }
        fetchUsers();
      })
      .catch((err) => console.error('Erreur permissions super admin :', err));
  };

  const handleDeleteUserAccount = (targetUser) => {
    if (!isSuperAdmin(currentUser)) {
      alert('Action réservée exclusivement au Super Admin.');
      return;
    }
    if (targetUser.role === 'super_admin' || String(targetUser.id) === String(currentUser.id)) {
      alert('Ce compte ne peut pas être supprimé.');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Supprimer définitivement le compte de ${targetUser.name} (${targetUser.email}) ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    fetch(`${API_BASE}/api/super-admin/users/${targetUser.id}`, {
      method: 'DELETE',
      headers: { ...authHeaders }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Erreur lors de la suppression du compte.');
          return;
        }
        alert(data.message || 'Compte supprimé.');
        fetchUsers();
      })
      .catch((err) => console.error('Erreur suppression compte :', err));
  };

  const handleStatusChange = (userId, newStatus) => {
    if (!hasPermission(currentUser, 'can_manage_clients')) {
      alert('Accès refusé : permission de gestion des clients requise.');
      return;
    }
    fetch(`${API_BASE}/api/admin/user-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ userId, newStatus })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Action refusée par le serveur.');
          return;
        }
        fetchUsers();
      })
      .catch((err) => console.error('Erreur statut utilisateur :', err));
  };

  const EyeIcon = ({ visible }) =>
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
    );

  const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
      <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
    </svg>
  );

  const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  const DefaultModeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="8" y1="20" x2="16" y2="20" />
    </svg>
  );

  const UserProfileIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const effectiveName = (currentUser?.name || profileCustom.displayName || 'Client').trim();
  const userInitial = effectiveName.charAt(0).toUpperCase();

  const VIP_THRESHOLD = 3;
  const totalFideles = usersList.filter((u) => u.role === 'client' && Number(u.total_orders) >= VIP_THRESHOLD).length;
  const totalClients = usersList.filter((u) => u.role === 'client').length;

  const adminNavItems = [
    hasPermission(currentUser, 'can_manage_products') && { id: 'products', label: '➕ Ajouter un Article' },
    hasPermission(currentUser, 'can_manage_products') && { id: 'stock', label: `📦 Catalogue & Stocks (${products.length})` },
    hasPermission(currentUser, 'can_manage_orders') && { id: 'orders', label: `🧾 Commandes & Livraison (${adminOrders.length})` },
    hasPermission(currentUser, 'can_manage_cashier') && { id: 'cashier', label: '💰 Gestion Caisse' },
    hasPermission(currentUser, 'can_manage_clients') && { id: 'users', label: `👥 Clients & VIP (${totalFideles})` },
    isSuperAdmin(currentUser) && { id: 'super_admin', label: '🛡️ Super Admin (Admins & Accès)' },
    { id: 'settings', label: '🔒 Sécurité & Profil' }
  ].filter(Boolean);

  const palette = isDark
    ? {
        pageBg: '#0f172a',
        surface: '#1e293b',
        surfaceAlt: '#0f172a',
        border: '#334155',
        text: '#f8fafc',
        textMuted: '#94a3b8'
      }
    : {
        pageBg: '#f8fafc',
        surface: '#ffffff',
        surfaceAlt: '#f8fafc',
        border: '#e2e8f0',
        text: '#0f172a',
        textMuted: '#64748b'
      };

  const renderPasswordStrengthMeter = (pwd) => {
    if (!pwd) return null;
    const strength = evaluatePasswordStrength(pwd);

    return (
      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <span style={{ color: palette.textMuted }}>Robustesse :</span>
          <strong style={{ color: strength.color }}>{strength.label}</strong>
        </div>

        <div style={{ width: '100%', height: '6px', borderRadius: '999px', backgroundColor: isDark ? '#334155' : '#e2e8f0', overflow: 'hidden' }}>
          <div
            style={{
              width: `${strength.percent}%`,
              height: '100%',
              backgroundColor: strength.color,
              transition: 'width 0.25s ease, background-color 0.25s ease'
            }}
          />
        </div>

        <div style={{ fontSize: '11.5px', color: palette.textMuted, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ color: strength.minLength ? '#16a34a' : '#ef4444' }}>
            {strength.minLength ? '✓' : '✕'} 8+ caractères
          </span>
          <span style={{ color: strength.hasUpper ? '#16a34a' : palette.textMuted }}>
            {strength.hasUpper ? '✓' : '•'} Majuscule
          </span>
          <span style={{ color: strength.hasLower ? '#16a34a' : palette.textMuted }}>
            {strength.hasLower ? '✓' : '•'} Minuscule
          </span>
          <span style={{ color: strength.hasNumber ? '#16a34a' : palette.textMuted }}>
            {strength.hasNumber ? '✓' : '•'} Chiffre
          </span>
          <span style={{ color: strength.hasSymbol ? '#16a34a' : '#f59e0b' }}>
            {strength.hasSymbol ? '✓' : '•'} Symbole (!@#...)
          </span>
        </div>
      </div>
    );
  };

  const renderAvatarCircle = (size = 28, fontSize = 13, clickable = false) => (
    <div
      onClick={clickable ? triggerGalleryPicker : undefined}
      title={clickable ? 'Cliquer pour choisir une photo dans votre galerie' : undefined}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        cursor: clickable ? 'pointer' : 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
        color: '#ffffff',
        fontSize: `${fontSize}px`,
        fontWeight: 'bold'
      }}
    >
      {profileCustom.avatarData ? (
        <img
          src={profileCustom.avatarData}
          alt={effectiveName}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        userInitial
      )}
    </div>
  );

  const renderShopGrid = () => (
    <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
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
        isDark={isDark}
      />

      {loading ? (
        <p style={{ textAlign: 'center', color: palette.textMuted }}>Chargement...</p>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: palette.textMuted }}>
          <p style={{ fontSize: '16px', marginBottom: '12px' }}>Aucun article ne correspond à votre recherche.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Toutes');
              setActiveTabFilter('all');
            }}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '22px', width: '100%', boxSizing: 'border-box' }}>
          {filteredProducts.map((product) => {
            const isDigital = product.product_type === 'digital';
            return (
              <div
                key={product.id}
                style={{
                  background: palette.surface,
                  border: `1px solid ${palette.border}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    height: '200px',
                    backgroundColor: isDark ? '#334155' : '#e2e8f0',
                    backgroundImage: `url(${product.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      fontSize: '11px',
                      backgroundColor: isDigital ? '#7e22ce' : '#1d4ed8',
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontWeight: 'bold'
                    }}
                  >
                    {isDigital ? '📚 E-book' : '💻 Matériel'}
                  </span>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span
                    style={{
                      fontSize: '11px',
                      backgroundColor: isDark ? '#334155' : '#f1f5f9',
                      color: isDark ? '#e2e8f0' : '#475569',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      width: 'fit-content',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}
                  >
                    {product.category}
                  </span>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: palette.text }}>{product.name}</h3>
                  <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: '1.5', marginBottom: '10px', flexGrow: 1 }}>
                    {product.description}
                  </p>

                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: isDigital ? '#a855f7' : product.stock > 0 ? '#16a34a' : '#ef4444',
                      marginBottom: '15px'
                    }}
                  >
                    {isDigital ? '⚡ Accès numérique immédiat' : product.stock > 0 ? `Stock : ${product.stock} dispo` : 'Rupture de stock'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: palette.text }}>${Number(product.price).toFixed(2)}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {!isDigital && (
                        <button
                          onClick={() => openReserveModal(product)}
                          disabled={product.stock <= 0}
                          style={{
                            background: product.stock > 0 ? (isDark ? '#334155' : '#f1f5f9') : '#e2e8f0',
                            color: product.stock > 0 ? palette.text : '#94a3b8',
                            border: `1px solid ${palette.border}`,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold',
                            fontSize: '13px'
                          }}
                        >
                          Réserver
                        </button>
                      )}
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!isDigital && product.stock <= 0}
                        style={{
                          background: !isDigital && product.stock <= 0 ? '#94a3b8' : '#2563eb',
                          color: 'white',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '13px'
                        }}
                      >
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
  );

  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: palette.pageBg,
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        color: palette.text,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleGalleryFileChange}
        style={{ display: 'none' }}
      />

      <header
        style={{
          backgroundColor: palette.surface,
          borderBottom: `1px solid ${palette.border}`,
          padding: '14px clamp(14px, 3vw, 48px)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => {
              setClientTab('shop');
              setActivePage('landing');
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                padding: '6px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span style={{ fontWeight: '800', fontSize: '18px', color: palette.text }}>
              TechSetup Store {isSuperAdmin(currentUser) ? '(Super Admin)' : currentUser?.role === 'admin' ? '(Admin)' : ''}
            </span>
          </div>

          {currentUser && (currentUser.role === 'client' || isAnyAdmin(currentUser)) && (
            <button
              type="button"
              onClick={() => {
                if (isAnyAdmin(currentUser)) {
                  setIsAdminDrawerOpen(true);
                } else {
                  setIsClientDrawerOpen(true);
                }
              }}
              aria-label="Ouvrir le menu"
              style={{
                background: palette.surfaceAlt,
                color: palette.text,
                border: `1px solid ${palette.border}`,
                padding: '6px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>☰</span>
              <span>Menu</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {(!currentUser || currentUser.role === 'client') && (
            <div style={{ display: 'flex', gap: '6px', backgroundColor: palette.surfaceAlt, padding: '4px', borderRadius: '12px', border: `1px solid ${palette.border}` }}>
              <button
                type="button"
                onClick={() => {
                  setClientTab('shop');
                  setActivePage('landing');
                }}
                style={{
                  background: activePage === 'landing' && clientTab === 'shop' ? '#2563eb' : 'transparent',
                  color: activePage === 'landing' && clientTab === 'shop' ? '#ffffff' : palette.text,
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '12.5px'
                }}
              >
                Accueil
              </button>
              <button
                type="button"
                onClick={() => {
                  setClientTab('shop');
                  setActivePage('shop');
                }}
                style={{
                  background: activePage === 'shop' && clientTab === 'shop' ? '#2563eb' : 'transparent',
                  color: activePage === 'shop' && clientTab === 'shop' ? '#ffffff' : palette.text,
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '12.5px'
                }}
              >
                Boutique
              </button>
            </div>
          )}

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 4px',
                  borderRadius: '20px',
                  backgroundColor: palette.surfaceAlt,
                  border: `1px solid ${palette.border}`
                }}
              >
                {renderAvatarCircle(28, 13, true)}
                <span
                  onClick={() => {
                    if (currentUser.role === 'client') {
                      setClientTab('settings');
                      setSettingsSection('menu');
                    } else if (isAnyAdmin(currentUser)) {
                      setAdminTab('settings');
                    }
                  }}
                  style={{ fontSize: '13.5px', fontWeight: '600', color: palette.text, cursor: 'pointer' }}
                >
                  {effectiveName}
                </span>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
              }}
            >
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UserProfileIcon />
              </span>
              <span>Connexion / Inscription</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
            title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            style={{
              background: palette.surfaceAlt,
              padding: '8px 10px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#facc15' : palette.text,
              border: `1px solid ${palette.border}`,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)'
            }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {(!currentUser || currentUser.role === 'client') && (
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              style={{
                background: palette.surfaceAlt,
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: palette.text,
                border: `1px solid ${palette.border}`,
                cursor: 'pointer'
              }}
            >
              🛒 Panier : <strong style={{ color: '#3b82f6' }}>{cart.length}</strong>
            </button>
          )}
        </div>
      </header>

      {currentUser && currentUser.role === 'client' && (
        <>
          {isClientDrawerOpen && (
            <div
              onClick={() => setIsClientDrawerOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                zIndex: 900
              }}
            />
          )}

          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '300px',
              maxWidth: '85vw',
              height: '100vh',
              backgroundColor: palette.surface,
              borderRight: `1px solid ${palette.border}`,
              boxShadow: '12px 0 32px rgba(15, 23, 42, 0.22)',
              zIndex: 950,
              padding: '20px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transform: isClientDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${palette.border}`, paddingBottom: '12px' }}>
              <span style={{ fontWeight: '800', fontSize: '15px', color: palette.text }}>Espace Client</span>
              <button
                onClick={() => setIsClientDrawerOpen(false)}
                style={{
                  background: palette.surfaceAlt,
                  border: `1px solid ${palette.border}`,
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  fontWeight: 'bold',
                  color: palette.textMuted,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {renderAvatarCircle(48, 18, true)}
                <div style={{ minWidth: 0, flexGrow: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14.5px', color: palette.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {effectiveName}
                  </div>
                  <div style={{ fontSize: '12px', color: palette.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={triggerGalleryPicker}
                style={{
                  width: '100%',
                  backgroundColor: isDark ? '#1e3a8a' : '#eff6ff',
                  color: isDark ? '#93c5fd' : '#1d4ed8',
                  border: `1px solid ${isDark ? '#3b82f6' : '#bfdbfe'}`,
                  borderRadius: '8px',
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Changer ma photo de profil
              </button>

              {profileCustom.avatarData && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  style={{
                    width: '100%',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Supprimer la photo
                </button>
              )}

              <a
                href="#parametres"
                onClick={(e) => {
                  e.preventDefault();
                  setClientTab('settings');
                  setSettingsSection('menu');
                  setIsClientDrawerOpen(false);
                }}
                style={{
                  fontSize: '12px',
                  color: '#3b82f6',
                  fontWeight: '600',
                  textDecoration: 'underline'
                }}
              >
                Ouvrir les paramètres →
              </a>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={() => {
                  setClientTab('shop');
                  setActivePage('landing');
                  setIsClientDrawerOpen(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: clientTab === 'shop' && activePage === 'landing' ? (isDark ? '#1e3a8a' : '#eff6ff') : 'transparent',
                  color: clientTab === 'shop' && activePage === 'landing' ? '#3b82f6' : palette.text,
                  fontWeight: '600',
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                🏠 Accueil
              </button>

              <button
                onClick={() => {
                  setClientTab('shop');
                  setActivePage('shop');
                  setIsClientDrawerOpen(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: clientTab === 'shop' && activePage === 'shop' ? (isDark ? '#1e3a8a' : '#eff6ff') : 'transparent',
                  color: clientTab === 'shop' && activePage === 'shop' ? '#3b82f6' : palette.text,
                  fontWeight: '600',
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                🛍️ Boutique &amp; E-books
              </button>

              <button
                onClick={() => {
                  setClientTab('orders');
                  setIsClientDrawerOpen(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: clientTab === 'orders' ? (isDark ? '#1e3a8a' : '#eff6ff') : 'transparent',
                  color: clientTab === 'orders' ? '#3b82f6' : palette.text,
                  fontWeight: '600',
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                📦 Mes Commandes ({clientOrders.length})
              </button>

              <button
                onClick={() => {
                  setClientTab('reservations');
                  fetchClientReservations();
                  setIsClientDrawerOpen(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: clientTab === 'reservations' ? (isDark ? '#1e3a8a' : '#eff6ff') : 'transparent',
                  color: clientTab === 'reservations' ? '#3b82f6' : palette.text,
                  fontWeight: '600',
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                ⏳ Mes Réservations ({clientReservations.length})
              </button>

              <button
                onClick={() => {
                  setClientTab('settings');
                  setSettingsSection('menu');
                  setIsClientDrawerOpen(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: clientTab === 'settings' ? (isDark ? '#1e3a8a' : '#eff6ff') : 'transparent',
                  color: clientTab === 'settings' ? '#3b82f6' : palette.text,
                  fontWeight: '600',
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                ⚙️ Paramètres
              </button>
            </nav>
          </aside>
        </>
      )}

      {currentUser && isAnyAdmin(currentUser) && (
        <>
          {isAdminDrawerOpen && (
            <div
              onClick={() => setIsAdminDrawerOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                zIndex: 900
              }}
            />
          )}

          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '300px',
              maxWidth: '85vw',
              height: '100vh',
              backgroundColor: palette.surface,
              borderRight: `1px solid ${palette.border}`,
              boxShadow: '12px 0 32px rgba(15, 23, 42, 0.22)',
              zIndex: 950,
              padding: '20px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transform: isAdminDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${palette.border}`, paddingBottom: '12px' }}>
              <span style={{ fontWeight: '800', fontSize: '15px', color: palette.text }}>
                {isSuperAdmin(currentUser) ? 'Panneau Super Admin' : 'Panneau Admin'}
              </span>
              <button
                onClick={() => setIsAdminDrawerOpen(false)}
                style={{
                  background: palette.surfaceAlt,
                  border: `1px solid ${palette.border}`,
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  fontWeight: 'bold',
                  color: palette.textMuted,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {renderAvatarCircle(48, 18, true)}
                <div style={{ minWidth: 0, flexGrow: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14.5px', color: palette.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {effectiveName}
                  </div>
                  <div style={{ fontSize: '12px', color: palette.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={triggerGalleryPicker}
                style={{
                  width: '100%',
                  backgroundColor: isDark ? '#1e3a8a' : '#eff6ff',
                  color: isDark ? '#93c5fd' : '#1d4ed8',
                  border: `1px solid ${isDark ? '#3b82f6' : '#bfdbfe'}`,
                  borderRadius: '8px',
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Changer ma photo de profil
              </button>

              {profileCustom.avatarData && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  style={{
                    width: '100%',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Supprimer la photo
                </button>
              )}

              <span
                style={{
                  width: 'fit-content',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: isSuperAdmin(currentUser) ? '#fef3c7' : isDark ? '#1e3a8a' : '#eff6ff',
                  color: isSuperAdmin(currentUser) ? '#b45309' : isDark ? '#93c5fd' : '#1d4ed8'
                }}
              >
                {isSuperAdmin(currentUser) ? 'Super Administrateur' : 'Administrateur (Accès limité)'}
              </span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
              {adminNavItems.map((tab) => {
                const active = adminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setAdminTab(tab.id);
                      setIsAdminDrawerOpen(false);
                      if (tab.id === 'orders') fetchAdminOrders();
                      if (tab.id === 'cashier') fetchCashierSummary();
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: active ? (isDark ? '#1e3a8a' : '#eff6ff') : 'transparent',
                      color: active ? '#3b82f6' : palette.text,
                      fontWeight: '600',
                      fontSize: '13.5px',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: `1px solid ${palette.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${palette.border}`,
                  backgroundColor: palette.surfaceAlt,
                  color: palette.text,
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {isDark ? '☀️ Passer en mode clair' : '🌙 Passer en mode sombre'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdminDrawerOpen(false);
                  handleLogout();
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Déconnexion
              </button>
            </div>
          </aside>
        </>
      )}

      {isReserveModalOpen && productToReserve && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            padding: '15px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              background: palette.surface,
              color: palette.text,
              padding: '25px',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '440px',
              position: 'relative',
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              border: `1px solid ${palette.border}`
            }}
          >
            <button
              onClick={() => {
                setIsReserveModalOpen(false);
                setProductToReserve(null);
              }}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: palette.textMuted }}
            >
              ✕
            </button>

            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Réserver ce produit</h2>
            <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: palette.textMuted }}>
              Article : <strong style={{ color: palette.text }}>{productToReserve.name}</strong> — Prix total :{' '}
              <strong style={{ color: '#3b82f6' }}>${Number(productToReserve.price).toFixed(2)}</strong>
            </p>

            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #f59e0b',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '18px',
                color: '#92400e',
                fontSize: '13px',
                lineHeight: '1.5'
              }}
            >
              <strong style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>⚠️ Conditions importantes de réservation :</strong>
              <ul style={{ margin: '0 0 0 18px', padding: 0 }}>
                <li>
                  Acompte minimum de <strong>10 %</strong> (soit <strong>${(Number(productToReserve.price) * 0.1).toFixed(2)}</strong>).
                </li>
                <li>
                  Validité stricte de <strong>72 heures (3 jours)</strong>.
                </li>
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
                  min={(Number(productToReserve.price) * 0.1).toFixed(2)}
                  max={Number(productToReserve.price).toFixed(2)}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${palette.border}`,
                    backgroundColor: palette.surfaceAlt,
                    color: palette.text,
                    boxSizing: 'border-box',
                    fontSize: '15px',
                    fontWeight: 'bold'
                  }}
                />
                <span style={{ fontSize: '12px', color: palette.textMuted, display: 'block', marginTop: '4px' }}>
                  Reste à payer sous 72h :{' '}
                  <strong style={{ color: palette.text }}>${Math.max(0, Number(productToReserve.price) - Number(depositAmount || 0)).toFixed(2)}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Accepter et Réserver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReserveModalOpen(false);
                    setProductToReserve(null);
                  }}
                  style={{ background: palette.surfaceAlt, color: palette.text, border: `1px solid ${palette.border}`, padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAuthModalOpen && !currentUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '15px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              background: palette.surface,
              color: palette.text,
              padding: '25px',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '400px',
              position: 'relative',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              border: `1px solid ${palette.border}`
            }}
          >
            <button
              onClick={() => {
                setIsAuthModalOpen(false);
                setBlockedMessage(null);
              }}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: palette.textMuted }}
            >
              ✕
            </button>

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
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setAuthMode('forgot');
                        }}
                        style={{ background: 'none', border: 'none', padding: 0, color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
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
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Mot de passe</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: palette.textMuted }}
                      >
                        <EyeIcon visible={showPassword} />
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button type="button" onClick={() => setAuthMode('forgot')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      Mot de passe oublié ?
                    </button>
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
                  <button onClick={() => setAuthMode('register')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    Pas encore de compte ? S'inscrire
                  </button>
                </div>
              </>
            )}

            {authMode === 'register' && (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '20px' }}>Créer un compte</h2>
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Nom complet</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Mot de passe</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                    />
                    {renderPasswordStrengthMeter(password)}
                  </div>
                  <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    S'inscrire
                  </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button onClick={() => setAuthMode('login')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    Déjà un compte ? Se connecter
                  </button>
                </div>
              </>
            )}

            {authMode === 'forgot' && (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '20px' }}>Récupération</h2>
                <p style={{ fontSize: '13px', color: palette.textMuted, textAlign: 'center', marginBottom: '15px' }}>
                  Entrez votre email et choisissez un nouveau mot de passe (8 caractères minimum).
                </p>
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Email associé</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={newForgotPass}
                      onChange={(e) => setNewForgotPass(e.target.value)}
                      minLength={8}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                    />
                    {renderPasswordStrengthMeter(newForgotPass)}
                  </div>
                  <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Réinitialiser
                  </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button onClick={() => setAuthMode('login')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    Retour à la connexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isCartOpen && (!currentUser || currentUser.role === 'client') && (
        <div
          style={{
            position: 'fixed',
            top: '85px',
            right: '3%',
            width: '94%',
            maxWidth: '360px',
            backgroundColor: palette.surface,
            color: palette.text,
            border: `1px solid ${palette.border}`,
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            padding: '20px',
            zIndex: 100,
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${palette.border}`, paddingBottom: '10px', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Mon Panier</h3>
            <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: palette.textMuted }}>
              ✕
            </button>
          </div>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: palette.textMuted, fontSize: '14px', margin: '20px 0' }}>Votre panier est vide.</p>
          ) : (
            <div style={{ overflowY: 'auto', flexGrow: 1, maxHeight: '50vh', marginBottom: '15px' }}>
              {cart.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `1px solid ${palette.border}`, paddingBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{item.name}</h4>
                    <span
                      style={{
                        fontSize: '11px',
                        backgroundColor: item.product_type === 'digital' ? '#f3e8ff' : '#eff6ff',
                        color: item.product_type === 'digital' ? '#7e22ce' : '#1d4ed8',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}
                    >
                      {item.product_type === 'digital' ? '📚 E-book' : '💻 Matériel'}
                    </span>
                    <div style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 'bold', marginTop: '2px' }}>${Number(item.price).toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => removeFromCart(index)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && (
            <div style={{ borderTop: `1px solid ${palette.border}`, paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>
                <span>Total :</span>
                <span style={{ color: '#3b82f6' }}>${totalPrice.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Valider la commande
              </button>
            </div>
          )}
        </div>
      )}

      <main style={{ width: '100%', maxWidth: '100%', flexGrow: 1, padding: 'clamp(18px, 3vw, 36px) clamp(14px, 3vw, 48px)', boxSizing: 'border-box' }}>
        {currentUser && isAnyAdmin(currentUser) ? (
          <div
            style={{
              width: '100%',
              maxWidth: '100%',
              background: palette.surface,
              padding: 'clamp(18px, 3vw, 30px)',
              borderRadius: '12px',
              border: `1px solid ${palette.border}`,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
              boxSizing: 'border-box'
            }}
          >
            <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>
              {isSuperAdmin(currentUser) ? '🛡️ Espace Super Administrateur' : '⚙️ Espace Administrateur (Accès Limités)'}
            </h2>

            {adminTab === 'products' && hasPermission(currentUser, 'can_manage_products') && (
              <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>Publier un nouvel article ou service numérique</h3>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Type d'article</label>
                  <select
                    value={newProduct.product_type}
                    onChange={(e) => setNewProduct({ ...newProduct, product_type: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, boxSizing: 'border-box', backgroundColor: palette.surfaceAlt, color: palette.text, fontSize: '14px', fontWeight: 'bold' }}
                  >
                    <option value="physical">💻 Matériel Informatique (Physique)</option>
                    <option value="digital">📚 Livre Numérique / E-book (Numérique)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Nom de l'article</label>
                  <input
                    type="text"
                    placeholder="Ex: Clavier Mécanique ou Maîtriser Python"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Catégorie</label>
                    <input
                      type="text"
                      placeholder={newProduct.product_type === 'digital' ? 'Ex: Informatique, Comptabilité, Dev Personnel' : 'Ex: Périphériques'}
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Prix ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="29.99"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                    />
                  </div>
                  {newProduct.product_type === 'physical' && (
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Stock initial</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Description</label>
                  <textarea
                    placeholder="Description détaillée..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    rows="3"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>URL de l'image de couverture</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                  />
                </div>

                {newProduct.product_type === 'digital' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>Lien de téléchargement du livre (PDF/EPUB)</label>
                    <input
                      type="url"
                      placeholder="https://... mon-livre.pdf"
                      value={newProduct.file_url}
                      onChange={(e) => setNewProduct({ ...newProduct, file_url: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, color: palette.text, boxSizing: 'border-box' }}
                    />
                  </div>
                )}

                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Publier l'article
                </button>
              </form>
            )}

            {adminTab === 'stock' && hasPermission(currentUser, 'can_manage_products') && (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Catalogue &amp; Stocks</h3>
                {editingProduct && (
                  <form onSubmit={handleUpdateProduct} style={{ background: palette.surfaceAlt, padding: '20px', borderRadius: '8px', border: `1px solid ${palette.border}`, marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ margin: 0, color: '#3b82f6' }}>Modifier : {editingProduct.name}</h4>
                    <select
                      value={editingProduct.product_type}
                      onChange={(e) => setEditingProduct({ ...editingProduct, product_type: e.target.value })}
                      style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${palette.border}`, backgroundColor: palette.surface, color: palette.text, fontWeight: 'bold' }}
                    >
                      <option value="physical">Matériel Physique</option>
                      <option value="digital">Livre Numérique</option>
                    </select>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Nom" style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${palette.border}`, backgroundColor: palette.surface, color: palette.text }} />
                      <input type="text" value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} placeholder="Catégorie" style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${palette.border}`, backgroundColor: palette.surface, color: palette.text }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} placeholder="Prix" style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${palette.border}`, backgroundColor: palette.surface, color: palette.text }} />
                      {editingProduct.product_type === 'physical' && (
                        <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} placeholder="Stock" style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${palette.border}`, backgroundColor: palette.surface, color: palette.text }} />
                      )}
                    </div>
                    <input type="url" value={editingProduct.image_url} onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })} placeholder="URL Image" style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${palette.border}`, backgroundColor: palette.surface, color: palette.text }} />
                    {editingProduct.product_type === 'digital' && (
                      <input type="url" value={editingProduct.file_url || ''} onChange={(e) => setEditingProduct({ ...editingProduct, file_url: e.target.value })} placeholder="Lien du fichier E-book" style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${palette.border}`, backgroundColor: palette.surface, color: palette.text }} />
                    )}
                    <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} placeholder="Description" rows="2" style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${palette.border}`, backgroundColor: palette.surface, color: palette.text }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Enregistrer
                      </button>
                      <button type="button" onClick={() => setEditingProduct(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${palette.border}`, color: palette.textMuted }}>
                        <th style={{ padding: '10px' }}>Article</th>
                        <th style={{ padding: '10px' }}>Type</th>
                        <th style={{ padding: '10px' }}>Prix</th>
                        <th style={{ padding: '10px' }}>Stock / Accès</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} style={{ borderBottom: `1px solid ${palette.border}` }}>
                          <td style={{ padding: '10px', fontWeight: '500' }}>{p.name}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ fontSize: '11px', backgroundColor: p.product_type === 'digital' ? '#f3e8ff' : '#eff6ff', color: p.product_type === 'digital' ? '#7e22ce' : '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                              {p.product_type === 'digital' ? 'E-book' : 'Matériel'}
                            </span>
                          </td>
                          <td style={{ padding: '10px' }}>${Number(p.price).toFixed(2)}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.product_type === 'digital' ? 'Illimité (Numérique)' : p.stock}</td>
                          <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                            <button onClick={() => setEditingProduct(p)} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                              Modifier
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === 'orders' && hasPermission(currentUser, 'can_manage_orders') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px' }}>🧾 Gestion des Commandes &amp; Livraison</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: palette.textMuted }}>
                      Mettez à jour le statut d'expédition/livraison et les coordonnées client.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchAdminOrders}
                    style={{
                      background: palette.surfaceAlt,
                      color: palette.text,
                      border: `1px solid ${palette.border}`,
                      padding: '7px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '12.5px'
                    }}
                  >
                    ↻ Actualiser
                  </button>
                </div>

                {adminOrders.length === 0 ? (
                  <p style={{ color: palette.textMuted, fontSize: '14px' }}>Aucune commande enregistrée pour le moment.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {adminOrders.map((ord) => {
                      const draft = deliveryDrafts[ord.id] || {
                        delivery_status: ord.delivery_status || 'pending',
                        delivery_address: ord.delivery_address || '',
                        delivery_phone: ord.delivery_phone || '',
                        delivery_notes: ord.delivery_notes || ''
                      };

                      return (
                        <div
                          key={ord.id}
                          style={{
                            padding: '16px',
                            borderRadius: '12px',
                            border: `1px solid ${palette.border}`,
                            backgroundColor: palette.surfaceAlt,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <strong>Commande #{ord.id}</strong> — <span style={{ color: '#3b82f6', fontWeight: '700' }}>${Number(ord.total_amount).toFixed(2)}</span>
                              <div style={{ fontSize: '12.5px', color: palette.textMuted, marginTop: '2px' }}>
                                Client : <strong>{ord.client_name}</strong> ({ord.client_email})
                                {ord.created_at ? ` • ${new Date(ord.created_at).toLocaleString()}` : ''}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '11.5px',
                                  fontWeight: '700',
                                  padding: '4px 9px',
                                  borderRadius: '6px',
                                  backgroundColor: ord.payment_status === 'paid' ? '#dcfce7' : '#fef3c7',
                                  color: ord.payment_status === 'paid' ? '#15803d' : '#b45309'
                                }}
                              >
                                Paiement : {PAYMENT_STATUS_LABELS[ord.payment_status] || ord.payment_status || 'Payée'}
                              </span>

                              <span
                                style={{
                                  fontSize: '11.5px',
                                  fontWeight: '700',
                                  padding: '4px 9px',
                                  borderRadius: '6px',
                                  backgroundColor: isDark ? '#1e3a8a' : '#eff6ff',
                                  color: isDark ? '#93c5fd' : '#1d4ed8'
                                }}
                              >
                                Livraison : {DELIVERY_STATUS_LABELS[draft.delivery_status] || draft.delivery_status}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                                Statut de livraison
                              </label>
                              <select
                                value={draft.delivery_status}
                                onChange={(e) => handleDeliveryDraftChange(ord.id, 'delivery_status', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  border: `1px solid ${palette.border}`,
                                  backgroundColor: palette.surface,
                                  color: palette.text,
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}
                              >
                                <option value="pending">En attente</option>
                                <option value="preparing">En préparation</option>
                                <option value="shipped">Expédiée / En livraison</option>
                                <option value="delivered">Livrée</option>
                                <option value="cancelled">Annulée</option>
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                                Adresse de livraison
                              </label>
                              <input
                                type="text"
                                placeholder="Quartier, avenue, repère..."
                                value={draft.delivery_address}
                                onChange={(e) => handleDeliveryDraftChange(ord.id, 'delivery_address', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  border: `1px solid ${palette.border}`,
                                  backgroundColor: palette.surface,
                                  color: palette.text,
                                  fontSize: '13px',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                                Téléphone livraison
                              </label>
                              <input
                                type="text"
                                placeholder="+243..."
                                value={draft.delivery_phone}
                                onChange={(e) => handleDeliveryDraftChange(ord.id, 'delivery_phone', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  border: `1px solid ${palette.border}`,
                                  backgroundColor: palette.surface,
                                  color: palette.text,
                                  fontSize: '13px',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                                Note / livreur
                              </label>
                              <input
                                type="text"
                                placeholder="Instruction ou nom du livreur"
                                value={draft.delivery_notes}
                                onChange={(e) => handleDeliveryDraftChange(ord.id, 'delivery_notes', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  border: `1px solid ${palette.border}`,
                                  backgroundColor: palette.surface,
                                  color: palette.text,
                                  fontSize: '13px',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              disabled={savingOrderId === ord.id}
                              onClick={() => handleSaveOrderDelivery(ord.id)}
                              style={{
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '12.5px',
                                cursor: 'pointer'
                              }}
                            >
                              {savingOrderId === ord.id ? 'Enregistrement...' : 'Enregistrer la livraison'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {adminTab === 'cashier' && hasPermission(currentUser, 'can_manage_cashier') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px' }}>💰 Gestion de la Caisse</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: palette.textMuted }}>
                      Suivez les entrées, sorties, remboursements et le solde net de la caisse.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchCashierSummary}
                    style={{
                      background: palette.surfaceAlt,
                      color: palette.text,
                      border: `1px solid ${palette.border}`,
                      padding: '7px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '12.5px'
                    }}
                  >
                    ↻ Actualiser
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt }}>
                    <div style={{ fontSize: '12px', color: palette.textMuted, fontWeight: '600' }}>Total Entrées</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>
                      +${Number(cashierSummary.total_in || 0).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt }}>
                    <div style={{ fontSize: '12px', color: palette.textMuted, fontWeight: '600' }}>Total Sorties / Remboursements</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>
                      -${Number(cashierSummary.total_out || 0).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt }}>
                    <div style={{ fontSize: '12px', color: palette.textMuted, fontWeight: '600' }}>Solde Net Caisse</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#3b82f6', marginTop: '4px' }}>
                      ${Number(cashierSummary.net_balance || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleCreateCashierTransaction}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid ${palette.border}`,
                    backgroundColor: palette.surfaceAlt,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <strong style={{ fontSize: '14px' }}>Enregistrer une opération de caisse</strong>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Type d'opération</label>
                      <select
                        value={newCashTx.type}
                        onChange={(e) => setNewCashTx({ ...newCashTx, type: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: `1px solid ${palette.border}`,
                          backgroundColor: palette.surface,
                          color: palette.text,
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        <option value="sale">Vente directe</option>
                        <option value="deposit">Acompte réservation</option>
                        <option value="balance">Solde réservation</option>
                        <option value="refund">Remboursement</option>
                        <option value="expense">Dépense / Retrait</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Mode de paiement</label>
                      <select
                        value={newCashTx.payment_method}
                        onChange={(e) => setNewCashTx({ ...newCashTx, payment_method: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: `1px solid ${palette.border}`,
                          backgroundColor: palette.surface,
                          color: palette.text,
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        <option value="cash">Espèces</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="card">Carte bancaire</option>
                        <option value="bank_transfer">Virement</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Montant ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={newCashTx.amount}
                        onChange={(e) => setNewCashTx({ ...newCashTx, amount: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: `1px solid ${palette.border}`,
                          backgroundColor: palette.surface,
                          color: palette.text,
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>N° Commande (optionnel)</label>
                      <input
                        type="number"
                        placeholder="Ex: 12"
                        value={newCashTx.order_id}
                        onChange={(e) => setNewCashTx({ ...newCashTx, order_id: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: `1px solid ${palette.border}`,
                          backgroundColor: palette.surface,
                          color: palette.text,
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Motif / Note</label>
                    <input
                      type="text"
                      placeholder="Ex: Encaissement commande #12 ou frais de course..."
                      value={newCashTx.note}
                      onChange={(e) => setNewCashTx({ ...newCashTx, note: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: `1px solid ${palette.border}`,
                        backgroundColor: palette.surface,
                        color: palette.text,
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      style={{
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px 16px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      + Ajouter l'opération
                    </button>
                  </div>
                </form>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${palette.border}`, color: palette.textMuted }}>
                        <th style={{ padding: '10px' }}>Type</th>
                        <th style={{ padding: '10px' }}>Mode</th>
                        <th style={{ padding: '10px' }}>Montant</th>
                        <th style={{ padding: '10px' }}>Commande</th>
                        <th style={{ padding: '10px' }}>Note</th>
                        <th style={{ padding: '10px' }}>Par</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashierSummary.transactions.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '14px', color: palette.textMuted }}>
                            Aucune transaction enregistrée en caisse.
                          </td>
                        </tr>
                      ) : (
                        cashierSummary.transactions.map((tx) => {
                          const isOut = tx.type === 'refund' || tx.type === 'expense';
                          return (
                            <tr key={tx.id} style={{ borderBottom: `1px solid ${palette.border}` }}>
                              <td style={{ padding: '10px', fontWeight: '600' }}>
                                {CASHIER_TYPE_LABELS[tx.type] || tx.type}
                              </td>
                              <td style={{ padding: '10px' }}>
                                {PAYMENT_METHOD_LABELS[tx.payment_method] || tx.payment_method}
                              </td>
                              <td style={{ padding: '10px', fontWeight: '800', color: isOut ? '#ef4444' : '#16a34a' }}>
                                {isOut ? '-' : '+'}${Number(tx.amount).toFixed(2)}
                              </td>
                              <td style={{ padding: '10px' }}>{tx.order_id ? `#${tx.order_id}` : '—'}</td>
                              <td style={{ padding: '10px', color: palette.textMuted }}>{tx.note || '—'}</td>
                              <td style={{ padding: '10px', fontSize: '12px', color: palette.textMuted }}>
                                {tx.recorded_by_name || `#${tx.recorded_by}`}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === 'users' && hasPermission(currentUser, 'can_manage_clients') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '16px', margin: 0 }}>Gestion des Clients &amp; Fidélité ({totalClients})</h3>
                  <span style={{ backgroundColor: isDark ? '#1e3a8a' : '#eff6ff', color: isDark ? '#93c5fd' : '#1d4ed8', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px' }}>
                    💎 Clients Fidèles / VIP (≥ {VIP_THRESHOLD} commandes) : {totalFideles}
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${palette.border}`, color: palette.textMuted }}>
                        <th style={{ padding: '10px' }}>Client</th>
                        <th style={{ padding: '10px' }}>Commandes passées</th>
                        <th style={{ padding: '10px' }}>Statut Fidélité</th>
                        <th style={{ padding: '10px' }}>Accès</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList
                        .filter((u) => u.role === 'client')
                        .map((u) => {
                          const isVip = Number(u.total_orders) >= VIP_THRESHOLD;
                          return (
                            <tr key={u.id} style={{ borderBottom: `1px solid ${palette.border}` }}>
                              <td style={{ padding: '10px' }}>
                                <div style={{ fontWeight: '500' }}>{u.name}</div>
                                <div style={{ fontSize: '12px', color: palette.textMuted }}>{u.email}</div>
                              </td>
                              <td style={{ padding: '10px', fontWeight: 'bold', color: '#3b82f6' }}>{u.total_orders} commande(s)</td>
                              <td style={{ padding: '10px' }}>
                                {isVip ? (
                                  <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>⭐ Client VIP / Fidèle</span>
                                ) : (
                                  <span style={{ backgroundColor: palette.surfaceAlt, color: palette.textMuted, padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}>Standard</span>
                                )}
                              </td>
                              <td style={{ padding: '10px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', backgroundColor: u.status === 'blocked' ? '#fee2e2' : '#dcfce7', color: u.status === 'blocked' ? '#dc2626' : '#15803d' }}>
                                  {u.status === 'blocked' ? 'Bloqué' : 'Actif'}
                                </span>
                              </td>
                              <td style={{ padding: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => handleStatusChange(u.id, u.status === 'blocked' ? 'active' : 'blocked')}
                                  style={{ background: u.status === 'blocked' ? '#dcfce7' : '#fee2e2', color: u.status === 'blocked' ? '#15803d' : '#dc2626', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                                >
                                  {u.status === 'blocked' ? 'Débloquer' : 'Bloquer'}
                                </button>
                                {isSuperAdmin(currentUser) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUserAccount(u)}
                                    style={{ background: '#7f1d1d', color: '#ffffff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                                  >
                                    Supprimer
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {isSuperAdmin(currentUser) && adminTab === 'super_admin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '17px' }}>🛡️ Administrateurs &amp; Limitation des Accès</h3>
                  <p style={{ margin: 0, fontSize: '12.5px', color: palette.textMuted }}>
                    Seul le Super Admin peut attribuer ou restreindre les accès d'un admin, promouvoir un compte ou supprimer un compte.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {usersList
                    .filter((u) => u.role === 'admin')
                    .map((adm) => {
                      const perms = { ...DEFAULT_ADMIN_PERMISSIONS, ...(adm.permissions || {}) };
                      return (
                        <div
                          key={adm.id}
                          style={{
                            padding: '14px',
                            borderRadius: '10px',
                            border: `1px solid ${palette.border}`,
                            backgroundColor: palette.surfaceAlt,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <strong>{adm.name}</strong> <span style={{ fontSize: '12px', color: palette.textMuted }}>({adm.email})</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => handleSuperAdminRoleChange(adm, 'client')}
                                style={{
                                  backgroundColor: '#fef3c7',
                                  color: '#b45309',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  fontWeight: '700',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                Retirer Admin
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUserAccount(adm)}
                                style={{
                                  backgroundColor: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fca5a5',
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  fontWeight: '700',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '13px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={Boolean(perms.can_manage_orders)} onChange={() => handleToggleAdminPermission(adm, 'can_manage_orders')} />
                              Commandes &amp; Livraison
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={Boolean(perms.can_manage_cashier)} onChange={() => handleToggleAdminPermission(adm, 'can_manage_cashier')} />
                              Caisse
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={Boolean(perms.can_manage_products)} onChange={() => handleToggleAdminPermission(adm, 'can_manage_products')} />
                              Produits &amp; Stocks
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={Boolean(perms.can_manage_clients)} onChange={() => handleToggleAdminPermission(adm, 'can_manage_clients')} />
                              Clients
                            </label>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <strong style={{ fontSize: '14px' }}>Promouvoir ou supprimer un compte client</strong>
                  {usersList
                    .filter((u) => u.role === 'client')
                    .map((cli) => (
                      <div
                        key={cli.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${palette.border}`,
                          backgroundColor: palette.surfaceAlt,
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div>
                          <strong>{cli.name}</strong> <span style={{ fontSize: '12px', color: palette.textMuted }}>({cli.email})</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleSuperAdminRoleChange(cli, 'admin')}
                            style={{
                              backgroundColor: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              padding: '5px 11px',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Promouvoir
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUserAccount(cli)}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fca5a5',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {adminTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '460px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '18px', backgroundColor: palette.surfaceAlt, borderRadius: '12px', border: `1px solid ${palette.border}`, textAlign: 'center' }}>
                  {renderAvatarCircle(76, 28, true)}
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{effectiveName}</div>
                    <div style={{ fontSize: '12px', color: palette.textMuted, marginTop: '2px' }}>
                      Cliquez sur votre photo ou sur les boutons ci-dessous pour gérer votre photo de profil.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={triggerGalleryPicker}
                      style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Changer ma photo de profil
                    </button>

                    {profileCustom.avatarData && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          borderRadius: '8px',
                          padding: '9px 16px',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Supprimer la photo
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleUserPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '18px', backgroundColor: palette.surfaceAlt, borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                  <h3 style={{ fontSize: '16px', margin: 0 }}>Changer mon mot de passe</h3>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ancien mot de passe</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input type={showOldPass ? 'text' : 'password'} value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} required style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surface, color: palette.text, boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowOldPass(!showOldPass)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: palette.textMuted }}>
                        <EyeIcon visible={showOldPass} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Nouveau mot de passe</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input type={showNewPass ? 'text' : 'password'} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} minLength={8} required style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surface, color: palette.text, boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: palette.textMuted }}>
                        <EyeIcon visible={showNewPass} />
                      </button>
                    </div>
                    {renderPasswordStrengthMeter(passwords.newPassword)}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Confirmer le nouveau mot de passe</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input type={showConfirmPass ? 'text' : 'password'} value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} minLength={8} required style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: palette.surface, color: palette.text, boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: palette.textMuted }}>
                        <EyeIcon visible={showConfirmPass} />
                      </button>
                    </div>
                  </div>
                  <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Mettre à jour
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : currentUser && currentUser.role === 'client' ? (
          <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            {clientTab === 'shop' &&
              (activePage === 'landing' ? (
                <LandingPage
                  onGoToShop={() => {
                    setActiveTabFilter('all');
                    setSelectedCategory('Toutes');
                    setActivePage('shop');
                  }}
                  onFilterAndGoToShop={(type) => {
                    setActiveTabFilter(type);
                    setSelectedCategory('Toutes');
                    setActivePage('shop');
                  }}
                  onOpenAuth={null}
                  isDark={isDark}
                  palette={palette}
                />
              ) : (
                renderShopGrid()
              ))}

            {clientTab === 'orders' && (
              <div style={{ background: palette.surface, padding: 'clamp(18px, 3vw, 28px)', borderRadius: '12px', border: `1px solid ${palette.border}`, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0 }}>Historique de mes Commandes &amp; E-books</h3>
                  <button
                    onClick={() => {
                      setClientTab('shop');
                      setActivePage('shop');
                    }}
                    style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px' }}
                  >
                    ← Retour à la boutique
                  </button>
                </div>
                {clientOrders.length === 0 ? (
                  <p style={{ color: palette.textMuted }}>Vous n'avez pas encore passé de commande.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {clientOrders.map((order) => (
                      <div key={order.id} style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.surfaceAlt, padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#3b82f6' }}>Commande #{order.id}</h4>
                          <span style={{ fontSize: '12px', color: palette.textMuted }}>Passée le : {new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>${Number(order.total_amount).toFixed(2)}</span>
                          <div style={{ fontSize: '11px', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: 'bold' }}>Payée &amp; Validée</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {clientTab === 'reservations' && (
              <div style={{ background: palette.surface, padding: 'clamp(18px, 3vw, 28px)', borderRadius: '12px', border: `1px solid ${palette.border}`, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0 }}>Mes Réservations de Matériel (Délai 72h)</h3>
                  <button
                    onClick={() => {
                      setClientTab('shop');
                      setActivePage('shop');
                    }}
                    style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px' }}
                  >
                    ← Retour à la boutique
                  </button>
                </div>
                <p style={{ fontSize: '13px', color: palette.textMuted, marginBottom: '20px' }}>
                  Toute réservation non soldée dans les 72 heures est automatiquement annulée. Vous pouvez aussi annuler manuellement (l'acompte ne sera pas remboursé).
                </p>
                {clientReservations.length === 0 ? (
                  <p style={{ color: palette.textMuted }}>Vous n'avez aucune réservation en cours.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {clientReservations.map((resv) => {
                      const remainingBalance = Math.max(0, Number(resv.total_price) - Number(resv.deposit_paid));
                      const isExpired = resv.status === 'expired';
                      const isCancelled = resv.status === 'cancelled';
                      const isActive = resv.status === 'active';

                      return (
                        <div
                          key={resv.id}
                          style={{
                            border: `1px solid ${palette.border}`,
                            padding: '15px',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px',
                            backgroundColor: isExpired || isCancelled ? (isDark ? '#3f1d1d' : '#fef2f2') : palette.surfaceAlt
                          }}
                        >
                          <div>
                            <h4 style={{ margin: '0 0 5px 0' }}>
                              {resv.product_name} (Réf #{resv.id})
                            </h4>
                            <div style={{ fontSize: '13px', color: palette.textMuted }}>
                              Acompte versé : <strong style={{ color: '#16a34a' }}>${Number(resv.deposit_paid).toFixed(2)}</strong> / ${Number(resv.total_price).toFixed(2)} — Reste à payer :{' '}
                              <strong style={{ color: palette.text }}>${remainingBalance.toFixed(2)}</strong>
                            </div>
                            <span style={{ fontSize: '12px', color: isExpired || isCancelled ? '#ef4444' : palette.textMuted, display: 'block', marginTop: '4px' }}>
                              {isCancelled ? 'Réservation annulée par vos soins' : `Expire le : ${new Date(resv.expires_at).toLocaleString()}`}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                backgroundColor: isCancelled || isExpired ? '#fee2e2' : '#fef3c7',
                                color: isCancelled || isExpired ? '#dc2626' : '#b45309'
                              }}
                            >
                              {isCancelled ? 'Annulée' : isExpired ? 'Expirée (72h)' : 'Active (En attente)'}
                            </span>

                            {isActive && (
                              <button
                                onClick={() => handleCancelReservation(resv.id)}
                                style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                              >
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
              <div id="parametres" style={{ width: '100%', maxWidth: '780px', margin: '0 auto', background: palette.surface, padding: 'clamp(20px, 3vw, 30px)', borderRadius: '14px', border: `1px solid ${palette.border}`, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {settingsSection !== 'menu' && (
                      <button
                        type="button"
                        onClick={() => setSettingsSection('menu')}
                        style={{ background: palette.surfaceAlt, color: palette.text, border: `1px solid ${palette.border}`, padding: '6px 11px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12.5px' }}
                      >
                        ← Paramètres
                      </button>
                    )}
                    <h2 style={{ margin: 0, fontSize: '20px' }}>
                      {settingsSection === 'menu' && 'Paramètres'}
                      {settingsSection === 'photo' && 'Changer ma photo de profil'}
                      {settingsSection === 'logins' && 'Changer mes logins'}
                      {settingsSection === 'advanced' && 'Paramètre avancé'}
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setClientTab('shop');
                      setActivePage('shop');
                    }}
                    style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px' }}
                  >
                    ← Boutique
                  </button>
                </div>

                {settingsSection === 'menu' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setSettingsSection('photo')}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: '16px 18px',
                        borderRadius: '12px',
                        border: `1px solid ${palette.border}`,
                        backgroundColor: palette.surfaceAlt,
                        color: palette.text,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '15px',
                        fontWeight: '700'
                      }}
                    >
                      <span>Changer ma photo de profil</span>
                      <span style={{ color: '#3b82f6' }}>→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSection('logins')}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: '16px 18px',
                        borderRadius: '12px',
                        border: `1px solid ${palette.border}`,
                        backgroundColor: palette.surfaceAlt,
                        color: palette.text,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '15px',
                        fontWeight: '700'
                      }}
                    >
                      <span>Changer mes logins</span>
                      <span style={{ color: '#3b82f6' }}>→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSection('advanced')}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: '16px 18px',
                        borderRadius: '12px',
                        border: `1px solid ${palette.border}`,
                        backgroundColor: palette.surfaceAlt,
                        color: palette.text,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '15px',
                        fontWeight: '700'
                      }}
                    >
                      <span>Paramètre avancé</span>
                      <span style={{ color: '#3b82f6' }}>→</span>
                    </button>
                  </div>
                )}

                {settingsSection === 'photo' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: palette.surfaceAlt, borderRadius: '12px', border: `1px solid ${palette.border}`, textAlign: 'center' }}>
                    {renderAvatarCircle(88, 32, true)}
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '16px' }}>{effectiveName}</div>
                      <div style={{ fontSize: '12.5px', color: palette.textMuted, marginTop: '2px' }}>
                        Cliquez sur votre photo ou sur les boutons ci-dessous pour gérer votre photo de profil.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={triggerGalleryPicker}
                        style={{
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 18px',
                          fontSize: '13.5px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Changer ma photo de profil
                      </button>

                      {profileCustom.avatarData && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            borderRadius: '10px',
                            padding: '10px 18px',
                            fontSize: '13.5px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Supprimer la photo
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {settingsSection === 'logins' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <form
                      onSubmit={handleSaveEmail}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        padding: '18px',
                        backgroundColor: palette.surfaceAlt,
                        borderRadius: '12px',
                        border: `1px solid ${palette.border}`
                      }}
                    >
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>
                          Nom (non modifiable)
                        </label>
                        <input
                          type="text"
                          value={currentUser?.name || ''}
                          readOnly
                          disabled
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: `1px solid ${palette.border}`,
                            backgroundColor: isDark ? '#0f172a' : '#e2e8f0',
                            color: palette.textMuted,
                            boxSizing: 'border-box',
                            cursor: 'not-allowed'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', marginBottom: '5px' }}>
                          Adresse e-mail
                        </label>
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: `1px solid ${palette.border}`,
                            backgroundColor: palette.surface,
                            color: palette.text,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        style={{
                          width: 'fit-content',
                          background: '#2563eb',
                          color: 'white',
                          border: 'none',
                          padding: '9px 16px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Enregistrer l'adresse e-mail
                      </button>
                    </form>

                    <form
                      onSubmit={handleUserPasswordChange}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        padding: '18px',
                        backgroundColor: palette.surfaceAlt,
                        borderRadius: '12px',
                        border: `1px solid ${palette.border}`
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '700' }}>Changer le mot de passe</span>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
                          Ancien mot de passe
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type={showOldPass ? 'text' : 'password'}
                            value={passwords.oldPassword}
                            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                            required
                            style={{
                              width: '100%',
                              padding: '10px 40px 10px 10px',
                              borderRadius: '8px',
                              border: `1px solid ${palette.border}`,
                              backgroundColor: palette.surface,
                              color: palette.text,
                              boxSizing: 'border-box'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPass(!showOldPass)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: palette.textMuted
                            }}
                          >
                            <EyeIcon visible={showOldPass} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
                          Nouveau mot de passe
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            minLength={8}
                            required
                            style={{
                              width: '100%',
                              padding: '10px 40px 10px 10px',
                              borderRadius: '8px',
                              border: `1px solid ${palette.border}`,
                              backgroundColor: palette.surface,
                              color: palette.text,
                              boxSizing: 'border-box'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: palette.textMuted
                            }}
                          >
                            <EyeIcon visible={showNewPass} />
                          </button>
                        </div>
                        {renderPasswordStrengthMeter(passwords.newPassword)}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
                          Confirmer le nouveau mot de passe
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type={showConfirmPass ? 'text' : 'password'}
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            minLength={8}
                            required
                            style={{
                              width: '100%',
                              padding: '10px 40px 10px 10px',
                              borderRadius: '8px',
                              border: `1px solid ${palette.border}`,
                              backgroundColor: palette.surface,
                              color: palette.text,
                              boxSizing: 'border-box'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: palette.textMuted
                            }}
                          >
                            <EyeIcon visible={showConfirmPass} />
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        style={{
                          width: 'fit-content',
                          background: '#2563eb',
                          color: 'white',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Mettre à jour le mot de passe
                      </button>
                    </form>
                  </div>
                )}

                {settingsSection === 'advanced' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '18px', backgroundColor: palette.surfaceAlt, borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>Mode d'affichage</div>
                    <div style={{ fontSize: '12.5px', color: palette.textMuted }}>Le mode par défaut correspond au mode clair.</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                      {[
                        { id: 'light', label: 'Mode clair', icon: <SunIcon /> },
                        { id: 'dark', label: 'Mode sombre', icon: <MoonIcon /> },
                        { id: 'default', label: 'Mode par défaut (clair)', icon: <DefaultModeIcon /> }
                      ].map((mode) => {
                        const active = themeMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setThemeMode(mode.id)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 14px',
                              borderRadius: '10px',
                              border: active ? '1.5px solid #2563eb' : `1px solid ${palette.border}`,
                              backgroundColor: active ? (isDark ? '#1e3a8a' : '#eff6ff') : palette.surface,
                              color: palette.text,
                              fontWeight: active ? '700' : '600',
                              fontSize: '13.5px',
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ color: active ? '#3b82f6' : palette.textMuted, display: 'flex', alignItems: 'center' }}>{mode.icon}</span>
                              <span>{mode.label}</span>
                            </span>
                            <span>{active ? '✓' : ''}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activePage === 'landing' ? (
          <LandingPage
            onGoToShop={() => {
              setActiveTabFilter('all');
              setSelectedCategory('Toutes');
              setActivePage('shop');
            }}
            onFilterAndGoToShop={(type) => {
              setActiveTabFilter(type);
              setSelectedCategory('Toutes');
              setActivePage('shop');
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            isDark={isDark}
            palette={palette}
          />
        ) : (
          renderShopGrid()
        )}
      </main>
    </div>
  );
}

export default App;