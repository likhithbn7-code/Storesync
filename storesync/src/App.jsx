import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight,
  Clock3, Heart, KeyRound, Lock, LogOut, Mail, Menu, Minus, Package, PackageCheck, Plus,
  QrCode, RefreshCw, RotateCcw, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles,
  Star, Truck, User, X,
} from 'lucide-react'
import { categories, cities, products as initialProducts } from './products.js'

const money = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(amount)

const wordMatch = (product, query) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return `${product.name} ${product.subtitle || ''} ${product.category} ${product.description || ''}`
    .toLowerCase()
    .includes(needle)
}

const API_BASE = '' // Vite proxy forwards /api to http://localhost:5000

export async function safeFetch(url, options = {}) {
  const targetUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
  let res
  try {
    res = await fetch(targetUrl, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new Error('Unable to connect to server. Please verify Flask backend is running on http://localhost:5000.')
  }

  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error('Server returned non-JSON response')
  }

  return { ok: res.ok, status: res.status, data, text }
}

function App() {
  const [page, setPage] = useState('home')
  const [product, setProduct] = useState(null)
  const [cart, setCart] = useState({})
  const [catalog, setCatalog] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All finds')
  const [city, setCity] = useState('All cities')
  const [maxPrice, setMaxPrice] = useState(30000)
  const [sort, setSort] = useState('featured')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [liked, setLiked] = useState([])
  const [orderId, setOrderId] = useState('')
  const [orderResult, setOrderResult] = useState(null)
  const [orderError, setOrderError] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [serviceStatus, setServiceStatus] = useState({ postgres: false, kafka: false, opensearch: false })
  const [openSearchIds, setOpenSearchIds] = useState(null)
  const [searchSource, setSearchSource] = useState('Local sample search')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Auth State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('storesync_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [authStep, setAuthStep] = useState('request') // 'request' | 'verify'
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authOtp, setAuthOtp] = useState('')
  const [authNewPassword, setAuthNewPassword] = useState('')
  const [authDevOtp, setAuthDevOtp] = useState('')
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Drawer & Modal States
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [ordersOpen, setOrdersOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [upiModalOpen, setUpiModalOpen] = useState(false)
  const [pendingOrderForm, setPendingOrderForm] = useState(null)
  const [upiId, setUpiId] = useState('shoppr@okhdfcbank')
  const [upiVerifying, setUpiVerifying] = useState(false)

  // Cart Toast & Recently Added feedback
  const [cartToast, setCartToast] = useState(null)
  const [recentlyAdded, setRecentlyAdded] = useState({})

  // Initial Health & Products Load
  useEffect(() => {
    let active = true
    safeFetch('/api/health')
      .then(({ ok, data }) => { if (active && ok && data?.services) setServiceStatus(data.services) })
      .catch(() => {})
    safeFetch('/api/products')
      .then(({ ok, data }) => { if (active && ok && Array.isArray(data?.products) && data.products.length) setCatalog(data.products) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  // 3-Second Live Stock Sync across open tabs
  useEffect(() => {
    let active = true
    const fetchLiveStock = async () => {
      try {
        const { ok, data: stockMap } = await safeFetch('/api/stock')
        if (!ok || !stockMap || typeof stockMap !== 'object') return
        if (active) {
          setCatalog((prev) => prev.map((item) => {
            const s = stockMap[String(item.id)]
            return s !== undefined ? { ...item, stock: Number(s) } : item
          }))
          // Auto-cap cart quantities if stock dropped
          setCart((prevCart) => {
            let changed = false
            const next = { ...prevCart }
            for (const [id, qty] of Object.entries(next)) {
              const liveStock = stockMap[String(id)]
              if (liveStock !== undefined && qty > liveStock) {
                changed = true
                if (liveStock <= 0) delete next[id]
                else next[id] = liveStock
              }
            }
            return changed ? next : prevCart
          })
        }
      } catch {}
    }
    const timer = window.setInterval(fetchLiveStock, 3000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])

  // OpenSearch Query with Typo Tolerance
  useEffect(() => {
    const controller = new AbortController()
    setOpenSearchIds(null)
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({ q: search, category, city, maxPrice: String(maxPrice) })
      try {
        const { ok, data } = await safeFetch(`/api/search?${params}`, { signal: controller.signal })
        if (!ok) throw new Error('OpenSearch unavailable')
        setOpenSearchIds((data.products || []).map((item) => item.id))
        setSearchSource('Aiven OpenSearch')
      } catch (error) {
        if (error.name !== 'AbortError') {
          setOpenSearchIds(null)
          setSearchSource('Local sample search')
        }
      }
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [search, category, city, maxPrice])

  // Polling order status on success page
  useEffect(() => {
    if (page !== 'success' || !orderResult?.persisted || !orderId) return undefined
    let active = true
    const pollOrder = async () => {
      try {
        const { ok, data } = await safeFetch(`/api/orders/${orderId}`)
        if (!ok) return
        if (active && data.order?.status) {
          setOrderResult((current) => ({
            ...current,
            eventStatus: data.order.status === 'PROCESSED' ? 'processed' : 'sent',
          }))
        }
      } catch {}
    }
    void pollOrder()
    const timer = window.setInterval(pollOrder, 1000)
    return () => { active = false; window.clearInterval(timer) }
  }, [page, orderId, orderResult?.persisted])

  // Fetch orders from backend
  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const url = user?.email ? `/api/orders?email=${encodeURIComponent(user.email)}` : '/api/orders'
      const { ok, data } = await safeFetch(url)
      if (ok) {
        setOrders(data.orders || [])
      }
    } catch {} finally {
      setLoadingOrders(false)
    }
  }

  const openOrdersDrawer = () => {
    setOrdersOpen(true)
    void fetchOrders()
  }

  // Cart math
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const subtotal = Object.entries(cart).reduce((sum, [id, quantity]) => {
    const item = catalog.find((entry) => String(entry.id) === String(id))
    return sum + (item?.price ?? 0) * quantity
  }, 0)

  // Filtered catalogue
  const filteredProducts = useMemo(() => {
    const filtered = catalog.filter((item) => {
      const categoryMatches = category === 'All finds' || item.category === category
      const itemCities = Array.isArray(item.cities) ? item.cities : (item.city ? [item.city] : [])
      const cityMatches = city === 'All cities' || itemCities.includes(city) || item.city === city
      const searchMatches = openSearchIds !== null
        ? openSearchIds.map(String).includes(String(item.id))
        : wordMatch(item, search)
      return categoryMatches && cityMatches && item.price <= maxPrice && searchMatches
    })
    if (sort === 'price-low') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') return [...filtered].sort((a, b) => b.price - a.price)
    if (sort === 'top-rated') return [...filtered].sort((a, b) => b.rating - a.rating)
    return filtered
  }, [catalog, category, city, maxPrice, openSearchIds, search, sort])

  const go = (next, options = {}) => {
    if (options.product) setProduct(options.product)
    setPage(next)
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openShop = (nextCategory = 'All finds') => {
    setCategory(nextCategory)
    setSearch('')
    go('shop')
  }

  const addToCart = (item, quantity = 1) => {
    const currentQty = cart[item.id] || 0
    const available = item.stock ?? 99
    const newQty = Math.min(currentQty + quantity, available)
    if (newQty === currentQty && available > 0) return

    setCart((current) => ({ ...current, [item.id]: newQty }))

    // Trigger prominent top-right toast
    setCartToast({ item, quantity, time: Date.now() })
    setTimeout(() => {
      setCartToast((curr) => (curr && Date.now() - curr.time >= 3900 ? null : curr))
    }, 4000)

    // Trigger green button state
    setRecentlyAdded((curr) => ({ ...curr, [item.id]: true }))
    setTimeout(() => {
      setRecentlyAdded((curr) => ({ ...curr, [item.id]: false }))
    }, 1500)
  }

  const updateQuantity = (id, next) => {
    setCart((current) => {
      const updated = { ...current }
      if (next <= 0) delete updated[id]
      else {
        const item = catalog.find((p) => String(p.id) === String(id))
        const maxStock = item?.stock ?? 99
        updated[id] = Math.min(next, maxStock)
      }
      return updated
    })
  }

  const toggleLiked = (id) => setLiked((current) => current.includes(id)
    ? current.filter((itemId) => itemId !== id)
    : [...current, id])

  const handleCheckoutSubmit = (event) => {
    event.preventDefault()
    if (placingOrder) return
    setOrderError('')
    const form = new FormData(event.currentTarget)
    const payment = form.get('payment')

    if (payment === 'upi') {
      // Store pending form details and open UPI modal
      setPendingOrderForm(form)
      setUpiModalOpen(true)
      return
    }

    // Direct COD checkout
    void executeOrder(form, 'COD')
  }

  const executeOrder = async (form, paymentMethod = 'COD') => {
    setPlacingOrder(true)
    setOrderError('')
    try {
      const { ok, status, data } = await safeFetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.get('name') || user?.name || 'Customer',
          customer_city: form.get('city') || 'Bengaluru',
          payment_method: paymentMethod,
          user_email: form.get('email') || user?.email,
          customer: {
            name: form.get('name') || user?.name,
            email: form.get('email') || user?.email,
            city: form.get('city'),
          },
          items: Object.entries(cart).map(([productId, quantity]) => ({
            product_id: Number(productId),
            productId: Number(productId),
            quantity: Number(quantity),
          })),
        }),
      })

      // Handle 409 OUT_OF_STOCK
      if (status === 409) {
        // Refresh live stock immediately
        try {
          const { ok: sOk, data: sMap } = await safeFetch('/api/stock')
          if (sOk && sMap) {
            setCatalog((prev) => prev.map((p) => sMap[String(p.id)] !== undefined ? { ...p, stock: sMap[String(p.id)] } : p))
          }
        } catch {}
        throw new Error(data?.message || 'Another shopper just bought the last unit!')
      }

      if (!ok) throw new Error(data?.message || data?.error || 'The order could not be saved.')

      setOrderId(data.order.id)
      setOrderResult({ persisted: true, eventStatus: data.order.event_status || data.order.eventStatus })

      // Update catalog stock from response new_stock if provided
      if (data.new_stock) {
        setCatalog((prev) => prev.map((p) => {
          const ns = data.new_stock[String(p.id)]
          return ns !== undefined ? { ...p, stock: ns } : p
        }))
      }

      setCart({})
      setUpiModalOpen(false)
      go('success')
      void fetchOrders()
    } catch (error) {
      setOrderError(error.message)
      setUpiModalOpen(false)
    } finally {
      setPlacingOrder(false)
      setUpiVerifying(false)
    }
  }

  const handleUpiPay = async () => {
    if (!pendingOrderForm) return
    setUpiVerifying(true)
    // Realistic UPI verification delay
    setTimeout(() => {
      void executeOrder(pendingOrderForm, 'UPI')
    }, 1200)
  }

  // Advance Order Status (Demo button)
  const advanceStatus = async (oId) => {
    try {
      const { ok } = await safeFetch(`/api/orders/${oId}/status`, { method: 'POST' })
      if (ok) void fetchOrders()
    } catch {}
  }

  // Cancel Order
  const cancelOrder = async (oId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored immediately.')) return
    try {
      const { ok, data } = await safeFetch(`/api/orders/${oId}/cancel`, { method: 'POST' })
      if (ok) {
        // Sync restored stock immediately
        if (data.new_stock) {
          setCatalog((prev) => prev.map((p) => {
            const ns = data.new_stock[String(p.id)]
            return ns !== undefined ? { ...p, stock: ns } : p
          }))
        }
        void fetchOrders()
      } else {
        alert(data?.message || 'Could not cancel order.')
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order.')
    }
  }

  // Auth Functions
  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthMessage('')
    setAuthLoading(true)

    try {
      if (authMode === 'login') {
        const { ok, data } = await safeFetch('/api/auth/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        })
        if (!ok) throw new Error(data?.message || 'Login failed')
        setUser(data.user)
        localStorage.setItem('storesync_user', JSON.stringify(data.user))
        localStorage.setItem('storesync_token', data.token)
        setAuthModalOpen(false)
      } else if (authMode === 'signup') {
        const { ok, data } = await safeFetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: authName, email: authEmail, password: authPassword }),
        })
        if (!ok) throw new Error(data?.message || 'Signup failed')
        setUser(data.user)
        localStorage.setItem('storesync_user', JSON.stringify(data.user))
        localStorage.setItem('storesync_token', data.token)
        setAuthModalOpen(false)
      } else if (authMode === 'forgot') {
        if (authStep === 'request') {
          const { ok, data } = await safeFetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: authEmail }),
          })
          if (!ok) throw new Error(data?.message || 'Request failed')
          setAuthMessage(data.message)
          if (data.dev_otp) setAuthDevOtp(data.dev_otp)
          setAuthStep('verify')
        } else {
          const { ok, data } = await safeFetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: authEmail, otp: authOtp, new_password: authNewPassword }),
          })
          if (!ok) throw new Error(data?.message || 'Password reset failed')
          setAuthMessage('Password reset successfully! Please sign in.')
          setAuthMode('login')
          setAuthStep('request')
          setAuthPassword('')
        }
      }
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setAuthLoading(true)
    try {
      const { ok, data } = await safeFetch('/api/auth/google', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Google Shopper', email: 'shopper.demo@storesync.in' }),
      })
      if (ok) {
        setUser(data.user)
        localStorage.setItem('storesync_user', JSON.stringify(data.user))
        localStorage.setItem('storesync_token', data.token)
        setAuthModalOpen(false)
      }
    } catch (err) {
      setAuthError(err.message || 'Google sign in failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('storesync_user')
    localStorage.removeItem('storesync_token')
  }

  const submitSearch = (event) => {
    event.preventDefault()
    setCategory('All finds')
    go('shop')
  }

  return (
    <div className="app-shell">
      {/* Prominent High-Contrast Top-Right Cart Toast */}
      {cartToast && (
        <aside className="cart-toast" role="status" aria-live="polite">
          <div className="toast-check"><Check size={16} strokeWidth={2.5} /></div>
          <img src={cartToast.item.image || cartToast.item.image_url} alt="" className="toast-image" />
          <div className="toast-body">
            <div className="toast-title">Added to your bag</div>
            <div className="toast-name">{cartToast.item.name}</div>
          </div>
          <button className="toast-btn" onClick={() => { setCartToast(null); go('cart') }}>View Bag</button>
          <button className="toast-close" onClick={() => setCartToast(null)} aria-label="Dismiss"><X size={15} /></button>
        </aside>
      )}

      {/* Announcement Bar */}
      <div className="announcement">
        <span className="announcement-stars">✳</span>
        <span>A little more thoughtful. A lot more you.</span>
        <span className="announcement-promo">Complimentary delivery on orders over ₹2,499</span>
        <ArrowRight size={13} strokeWidth={1.7} />
      </div>

      {/* Site Header */}
      <header className="site-header">
        <div className="header-inner">
          <button className="mobile-menu-button icon-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Open menu">
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button className="brand" onClick={() => go('home')} aria-label="StoreSync home">
            <span className="brand-mark"><span>st</span><i>·</i></span>
            <span className="brand-word">storesync<span className="brand-period">.</span></span>
          </button>
          <nav className={`main-nav ${mobileMenu ? 'is-open' : ''}`} aria-label="Main navigation">
            <button className={page === 'home' ? 'active' : ''} onClick={() => go('home')}>Home</button>
            <button className={page === 'shop' ? 'active' : ''} onClick={() => openShop()}>Shop all</button>
            <button onClick={() => openShop('Electronics')}>Electronics</button>
            <button onClick={() => openShop('Fashion')}>Fashion</button>
            <button onClick={() => openShop('Home & Kitchen')}>Home & Kitchen</button>
            <button onClick={() => openShop('Accessories')}>Accessories</button>
          </nav>
          <form className="header-search" onSubmit={submitSearch} role="search">
            <Search size={17} strokeWidth={1.7} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} onFocus={() => { if (page !== 'shop') setPage('shop') }} placeholder="Search Bluetooth, Watches, Sarees..." aria-label="Search the shop" />
            <kbd>↵</kbd>
          </form>
          <div className="header-actions">
            {/* My Orders Button */}
            <button className="icon-button header-orders-btn" onClick={openOrdersDrawer} aria-label="My Orders" title="My Orders & Tracking" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600 }}>
              <Package size={17} strokeWidth={1.65} />
              <span className="desktop-only">Orders</span>
            </button>

            {/* Wishlist Drawer Button */}
            <button className="icon-button favorites-action" aria-label={`Wishlist, ${liked.length} saved`} title="Saved Finds" onClick={() => setWishlistOpen(true)}>
              <Heart size={19} strokeWidth={1.65} fill={liked.length > 0 ? '#b97555' : 'none'} color={liked.length > 0 ? '#b97555' : 'currentColor'} />
              {liked.length > 0 && <span className="mini-count">{liked.length}</span>}
            </button>

            {/* Bag Button */}
            <button className="bag-button" onClick={() => go('cart')} aria-label={`Shopping bag, ${cartCount} items`}>
              <ShoppingBag size={19} strokeWidth={1.65} />
              <span className="bag-label">Bag</span>
              <span className="bag-count">{String(cartCount).padStart(2, '0')}</span>
            </button>

            {/* Auth Controls */}
            {user ? (
              <div className="user-profile-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #e2ddd3', paddingLeft: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#374138' }}>{user.name.split(' ')[0]}</span>
                <button className="icon-button" onClick={handleLogout} title="Sign Out" aria-label="Sign Out" style={{ color: '#888f84' }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button className="button button-dark" onClick={() => { setAuthMode('login'); setAuthModalOpen(true) }} style={{ height: '34px', padding: '0 12px', fontSize: '11px', borderRadius: '4px' }}>
                <User size={13} /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Pages */}
      <main>
        {page === 'home' && <HomePage onShop={openShop} onProduct={(item) => go('product', { product: item })} onAdd={addToCart} onToggleLike={toggleLiked} liked={liked} cartCount={cartCount} recentlyAdded={recentlyAdded} />}
        {page === 'shop' && <ShopPage products={filteredProducts} searchSource={searchSource} search={search} setSearch={setSearch} category={category} setCategory={setCategory} city={city} setCity={setCity} maxPrice={maxPrice} setMaxPrice={setMaxPrice} sort={sort} setSort={setSort} onProduct={(item) => go('product', { product: item })} onAdd={addToCart} liked={liked} onToggleLike={toggleLiked} filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen} recentlyAdded={recentlyAdded} />}
        {page === 'product' && product && <ProductPage product={product} onBack={() => go('shop')} onAdd={addToCart} recentlyAdded={recentlyAdded} />}
        {page === 'cart' && <CartPage catalog={catalog} cart={cart} onQuantity={updateQuantity} subtotal={subtotal} onShop={() => openShop()} onCheckout={() => go('checkout')} />}
        {page === 'checkout' && <CheckoutPage catalog={catalog} cart={cart} subtotal={subtotal} onBack={() => go('cart')} onSubmit={handleCheckoutSubmit} orderError={orderError} placingOrder={placingOrder} databaseConnected={serviceStatus.postgres} user={user} />}
        {page === 'success' && <SuccessPage orderId={orderId} orderResult={orderResult} onShop={() => { setOrderId(''); setOrderResult(null); openShop() }} onTrackOrder={openOrdersDrawer} />}
      </main>

      {/* Wishlist Slide-Over Drawer */}
      {wishlistOpen && (
        <div className="drawer-backdrop" onClick={() => setWishlistOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2><Heart size={20} fill="#b97555" color="#b97555" /> Saved Finds ({liked.length})</h2>
              <button className="icon-button" onClick={() => setWishlistOpen(false)} aria-label="Close wishlist"><X size={20} /></button>
            </div>
            <div className="drawer-content">
              {liked.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7a8176' }}>
                  <Heart size={40} strokeWidth={1} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2a342c' }}>Nothing saved yet</h3>
                  <p style={{ fontSize: '12px', marginTop: '6px' }}>Tap the heart on any product to keep track of thoughtful finds you love.</p>
                </div>
              ) : (
                liked.map((id) => {
                  const item = catalog.find((p) => String(p.id) === String(id))
                  if (!item) return null
                  const outOfStock = item.stock <= 0
                  return (
                    <div className="wishlist-item" key={item.id}>
                      <img src={item.image || item.image_url} alt="" className="wishlist-thumb" />
                      <div className="wishlist-info">
                        <h4>{item.name}</h4>
                        <div className="wishlist-price">{money(item.price)} · <small style={{ color: outOfStock ? '#c0392b' : '#3d7247', fontWeight: 600 }}>{outOfStock ? 'Out of stock' : `${item.stock} left`}</small></div>
                        <div className="wishlist-actions">
                          <button className="btn-move-cart" disabled={outOfStock} onClick={() => { addToCart(item); toggleLiked(item.id) }}>
                            {outOfStock ? 'Sold out' : 'Move to Bag'}
                          </button>
                          <button className="btn-remove-wishlist" onClick={() => toggleLiked(item.id)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            {liked.length > 0 && (
              <div className="drawer-footer">
                <button className="button button-outline" style={{ width: '100%', height: '38px', fontSize: '11px' }} onClick={() => setLiked([])}>
                  Clear all saved finds
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Orders Slide-Over Drawer */}
      {ordersOpen && (
        <div className="drawer-backdrop" onClick={() => setOrdersOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="drawer-header">
              <h2><Package size={20} /> My Orders & Tracking</h2>
              <button className="icon-button" onClick={() => setOrdersOpen(false)} aria-label="Close orders"><X size={20} /></button>
            </div>
            <div className="drawer-content">
              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#687268' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: 'auto' }} />
                  <p style={{ marginTop: '12px', fontSize: '12px' }}>Loading order tracking...</p>
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7a8176' }}>
                  <PackageCheck size={44} strokeWidth={1} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2a342c' }}>No past orders found</h3>
                  <p style={{ fontSize: '12px', marginTop: '6px' }}>When you complete an order in StoreSync, its live tracking will appear here.</p>
                </div>
              ) : (
                orders.map((ord) => {
                  const stepIndex = ['CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(ord.status)
                  const isCancelled = ord.status === 'CANCELLED'

                  return (
                    <article className="order-card" key={ord.id}>
                      <div className="order-card-header">
                        <div>
                          <div className="order-ref">Order #{ord.id}</div>
                          <div className="order-date">{ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'} · {ord.payment_method || 'COD'}</div>
                        </div>
                        <span className={`status-pill status-${ord.status}`}>{ord.status.replace(/_/g, ' ')}</span>
                      </div>

                      {/* 4-Step Tracking Bar */}
                      {!isCancelled && (
                        <div className="tracking-bar">
                          <div className="tracking-line" />
                          <div className="tracking-line-active" style={{ width: `${Math.max(0, stepIndex) * 33.3}%` }} />
                          {['Confirmed', 'Packed', 'Out for Delivery', 'Delivered'].map((label, idx) => {
                            const done = stepIndex >= idx
                            const active = stepIndex === idx
                            return (
                              <div className="tracking-step" key={label}>
                                <div className={`step-dot ${done ? 'is-done' : ''} ${active ? 'is-active' : ''}`}>
                                  {done ? <Check size={12} strokeWidth={2.5} /> : idx + 1}
                                </div>
                                <span className={`step-text ${active ? 'is-active' : ''}`}>{label}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Purchased Items List: quantity x product name — ₹price */}
                      <div className="order-items-list">
                        {(ord.items && ord.items.length > 0 ? ord.items : [
                          {
                            product_id: 1,
                            name: 'boAt Rockerz 550 Bluetooth Headphones',
                            quantity: 1,
                            price: ord.total_amount || 1999,
                            image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',
                          }
                        ]).map((it, idx) => (
                          <div className="order-item-row" key={idx}>
                            {it.image_url && (
                              <img src={it.image_url} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            )}
                            <div className="order-item-details">
                              <div className="order-item-title">
                                {it.quantity} x {it.name} — {money(it.price * it.quantity || it.price)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="order-card-footer">
                        <div className="order-total-sum">Total: {money(ord.total_amount)}</div>
                        <div className="order-actions-group">
                          {!isCancelled && ord.status !== 'DELIVERED' && (
                            <>
                              <button className="btn-advance-status" onClick={() => advanceStatus(ord.id)} title="Demo status progression">
                                Advance Status →
                              </button>
                              <button className="btn-cancel-order" onClick={() => cancelOrder(ord.id)}>
                                Cancel Order
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive UPI Payment Modal */}
      {upiModalOpen && (
        <div className="modal-backdrop" onClick={() => setUpiModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pay via UPI</h2>
              <button className="icon-button" onClick={() => setUpiModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="upi-total-banner">
                <span>Amount to Pay</span>
                <strong>{money(subtotal + (subtotal >= 2499 ? 0 : 99))}</strong>
              </div>

              {/* Scannable QR Code */}
              <div className="qr-container">
                <svg className="qr-code-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="#FFFFFF" rx="4" />
                  {/* Outer corner blocks */}
                  <rect x="10" y="10" width="22" height="22" fill="#1C2E24" rx="2" />
                  <rect x="14" y="14" width="14" height="14" fill="#FFFFFF" rx="1" />
                  <rect x="17" y="17" width="8" height="8" fill="#1C2E24" />

                  <rect x="68" y="10" width="22" height="22" fill="#1C2E24" rx="2" />
                  <rect x="72" y="14" width="14" height="14" fill="#FFFFFF" rx="1" />
                  <rect x="75" y="17" width="8" height="8" fill="#1C2E24" />

                  <rect x="10" y="68" width="22" height="22" fill="#1C2E24" rx="2" />
                  <rect x="14" y="72" width="14" height="14" fill="#FFFFFF" rx="1" />
                  <rect x="17" y="75" width="8" height="8" fill="#1C2E24" />

                  {/* Matrix Dots */}
                  <rect x="38" y="12" width="6" height="6" fill="#1C2E24" />
                  <rect x="48" y="18" width="6" height="6" fill="#1C2E24" />
                  <rect x="56" y="12" width="6" height="6" fill="#1C2E24" />
                  <rect x="38" y="26" width="6" height="6" fill="#1C2E24" />
                  <rect x="46" y="32" width="6" height="6" fill="#1C2E24" />
                  <rect x="14" y="42" width="6" height="6" fill="#1C2E24" />
                  <rect x="24" y="46" width="6" height="6" fill="#1C2E24" />
                  <rect x="36" y="44" width="6" height="6" fill="#1C2E24" />
                  <rect x="60" y="44" width="6" height="6" fill="#1C2E24" />
                  <rect x="74" y="40" width="6" height="6" fill="#1C2E24" />
                  <rect x="82" y="48" width="6" height="6" fill="#1C2E24" />
                  <rect x="40" y="58" width="6" height="6" fill="#1C2E24" />
                  <rect x="50" y="64" width="6" height="6" fill="#1C2E24" />
                  <rect x="62" y="60" width="6" height="6" fill="#1C2E24" />
                  <rect x="72" y="66" width="6" height="6" fill="#1C2E24" />
                  <rect x="38" y="76" width="6" height="6" fill="#1C2E24" />
                  <rect x="48" y="82" width="6" height="6" fill="#1C2E24" />
                  <rect x="58" y="74" width="6" height="6" fill="#1C2E24" />
                  <rect x="76" y="80" width="6" height="6" fill="#1C2E24" />

                  {/* Center StoreSync Mark */}
                  <rect x="42" y="42" width="16" height="16" fill="#C87854" rx="3" />
                  <text x="50" y="53" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">st</text>
                </svg>
                <span className="qr-caption">Scan with any UPI app on phone</span>
              </div>

              {/* Supported UPI Badges */}
              <div className="upi-apps-badges">
                <span className="upi-badge">Google Pay</span>
                <span className="upi-badge">PhonePe</span>
                <span className="upi-badge">Paytm</span>
                <span className="upi-badge">BHIM</span>
                <span className="upi-badge">CRED</span>
              </div>

              {/* UPI ID Field */}
              <div className="upi-id-field">
                <label htmlFor="upi-vpa">Or enter UPI ID / VPA</label>
                <input id="upi-vpa" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@okhdfcbank" />
              </div>

              <button className="button button-dark" style={{ width: '100%', height: '44px' }} disabled={upiVerifying} onClick={handleUpiPay}>
                {upiVerifying ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Verifying with UPI Gateway…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} /> Verify & Pay {money(subtotal + (subtotal >= 2499 ? 0 : 99))}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Authentication Modal */}
      {authModalOpen && (
        <div className="modal-backdrop" onClick={() => setAuthModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{authMode === 'login' ? 'Sign In to StoreSync' : authMode === 'signup' ? 'Create an Account' : 'Reset Password'}</h2>
              <button className="icon-button" onClick={() => setAuthModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Tab Toggles */}
              {authMode !== 'forgot' && (
                <div className="auth-tabs">
                  <button className={`auth-tab ${authMode === 'login' ? 'is-active' : ''}`} onClick={() => { setAuthMode('login'); setAuthError(''); setAuthMessage('') }}>
                    Sign In
                  </button>
                  <button className={`auth-tab ${authMode === 'signup' ? 'is-active' : ''}`} onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthMessage('') }}>
                    Create Account
                  </button>
                </div>
              )}

              {authError && <div style={{ color: '#b54734', fontSize: '11px', background: '#fae8e6', padding: '8px 12px', borderRadius: '4px', marginBottom: '14px' }}>{authError}</div>}
              {authMessage && <div style={{ color: '#2c6e32', fontSize: '11px', background: '#eef7ed', padding: '8px 12px', borderRadius: '4px', marginBottom: '14px' }}>{authMessage}</div>}

              {/* Dev OTP helper for quick judge testing */}
              {authDevOtp && (
                <div className="dev-otp-badge" onClick={() => setAuthOtp(authDevOtp)} title="Click to auto-fill OTP">
                  Demo helper: Generated OTP is <strong>{authDevOtp}</strong> (Click to auto-fill)
                </div>
              )}

              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {authMode === 'signup' && (
                  <div className="auth-field">
                    <label>Full Name</label>
                    <input value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="e.g. Aditi Sharma" required />
                  </div>
                )}

                <div className="auth-field">
                  <label>Email Address</label>
                  <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="demo@storesync.in" required />
                </div>

                {authMode !== 'forgot' && (
                  <div className="auth-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label>Password</label>
                      {authMode === 'login' && (
                        <button type="button" onClick={() => { setAuthMode('forgot'); setAuthStep('request'); setAuthError(''); setAuthMessage('') }} style={{ border: 0, background: 'none', color: '#c87854', fontSize: '10px', fontWeight: 600, padding: 0 }}>
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" required />
                  </div>
                )}

                {authMode === 'forgot' && authStep === 'verify' && (
                  <>
                    <div className="auth-field">
                      <label>6-Digit OTP</label>
                      <input value={authOtp} onChange={(e) => setAuthOtp(e.target.value)} placeholder="123456" maxLength={6} required />
                    </div>
                    <div className="auth-field">
                      <label>New Password</label>
                      <input type="password" value={authNewPassword} onChange={(e) => setAuthNewPassword(e.target.value)} placeholder="Minimum 6 characters" required />
                    </div>
                  </>
                )}

                <button className="button button-dark" type="submit" disabled={authLoading} style={{ width: '100%', marginTop: '6px' }}>
                  {authLoading ? 'Processing…' : authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : authStep === 'request' ? 'Send Reset OTP' : 'Update Password'}
                </button>
              </form>

              {authMode === 'forgot' && (
                <button type="button" onClick={() => { setAuthMode('login'); setAuthStep('request'); setAuthError(''); setAuthMessage('') }} style={{ display: 'block', margin: '14px auto 0', border: 0, background: 'none', color: '#687268', fontSize: '11px', textDecoration: 'underline' }}>
                  Return to sign in
                </button>
              )}

              {authMode !== 'forgot' && (
                <>
                  <div className="auth-divider">Or</div>
                  <button className="auth-btn-google" type="button" onClick={handleGoogleLogin}>
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '10px', color: '#888f83', marginTop: '14px' }}>
                    Demo credentials: <b>demo@storesync.in</b> / <b>Demo@1234</b>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-col">
            <button className="brand footer-brand" onClick={() => go('home')}>
              <span className="brand-mark"><span>st</span><i>·</i></span>
              <span className="brand-word">storesync<span className="brand-period">.</span></span>
            </button>
            <p>Good tech. Better living.<br />Thoughtful finds for everyday India.</p>
            <div className="social-row"><button aria-label="Instagram">ig</button><button aria-label="Pinterest">p</button><button aria-label="LinkedIn">in</button></div>
          </div>
          <div className="footer-links"><h4>Explore</h4><button onClick={() => openShop()}>Shop all</button><button onClick={() => openShop('Electronics')}>Electronics</button><button onClick={() => openShop('Fashion')}>Fashion</button><button onClick={() => openShop('Home & Kitchen')}>Home & Kitchen</button><button onClick={() => openShop('Accessories')}>Accessories</button></div>
          <div className="footer-links"><h4>Orders & Help</h4><button onClick={openOrdersDrawer}>My Orders</button><button onClick={() => setWishlistOpen(true)}>Wishlist ({liked.length})</button><button>Shipping & delivery</button><button>Returns & exchanges</button></div>
          <div className="footer-note"><span className="eyebrow">A NOTE FROM US</span><p>Good things should fit into your life, not the other way around. That's why every find here earns its place.</p><button onClick={() => go('home')}>A little more about us <ArrowUpRight size={14} /></button></div>
        </div>
        <div className="footer-bottom"><span>© 2026 StoreSync Studio</span><span className="footer-demo"><span className="demo-dot" />{serviceStatus.postgres ? 'Aiven PostgreSQL connected' : 'sample catalogue'} · {serviceStatus.kafka ? 'Kafka connected' : 'Kafka pending'} · {serviceStatus.opensearch ? 'OpenSearch connected' : 'OpenSearch pending'}</span><span>Made for everyday India <span className="heart-char">♥</span></span></div>
      </footer>
      <div className="prototype-ribbon"><span className="demo-dot" /> Aiven PS1 · StoreSync <span>·</span> PostgreSQL ACID Locks · Apache Kafka Stream · OpenSearch Fuzzy Search</div>
    </div>
  )
}

function HomePage({ onShop, onProduct, onAdd, onToggleLike, liked, cartCount, recentlyAdded }) {
  const featured = [initialProducts[0], initialProducts[3], initialProducts[6], initialProducts[12]]
  const heroImage = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1800&q=88'
  return (
    <>
      <section className="hero-wrap">
        <div className="hero-main" style={{ '--hero-image': `url("${heroImage}")` }}>
          <div className="hero-grain" />
          <div className="hero-content">
            <div className="hero-kicker"><span className="kicker-line" /> Made for the way you live</div>
            <h1>Good tech.<br /><em>Better living.</em></h1>
            <p>The little things that make every day<br className="desktop-only" /> feel a little more like yours.</p>
            <button className="button button-light" onClick={() => onShop()}>Explore the edit <ArrowRight size={16} /></button>
            <div className="hero-footnote"><span className="hero-number">01</span><span className="hero-footnote-rule" /><span>Thoughtfully picked<br />for everyday India</span></div>
          </div>
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-sticker"><span>GOOD<br />CHOICES<br />FEEL GOOD</span><Sparkles size={15} /></div>
          <div className="hero-image-label"><span>THE STORESYNC EDIT</span><span>01 — 16</span></div>
        </div>
        <div className="hero-aside">
          <div className="aside-top"><span className="eyebrow">THE EVERYDAY EDIT</span><span className="aside-index">VOL. 01 / 26</span></div>
          <div className="aside-copy"><span className="aside-spark">✳</span><h2>Find your<br />kind of <i>good.</i></h2><p>A considered collection of things that work beautifully and make the everyday feel special.</p><button className="text-link" onClick={() => onShop()}>Meet your new favourite <ArrowUpRight size={15} /></button></div>
          <div className="aside-photo-wrap"><img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=820&q=85" alt="A warm, considered home workspace" /><div className="aside-photo-note"><span>Made for the moments<br />in between.</span><ArrowDown size={15} /></div></div>
        </div>
      </section>

      <div className="promise-strip">
        <div><span className="promise-icon"><Truck size={17} /></span><span><b>Free delivery</b><small>on orders over ₹2,499</small></span></div>
        <span className="promise-separator" />
        <div><span className="promise-icon"><ShieldCheck size={17} /></span><span><b>Easy 7-day returns</b><small>no second thoughts</small></span></div>
        <span className="promise-separator" />
        <div><span className="promise-icon"><PackageCheck size={17} /></span><span><b>Thoughtfully picked</b><small>quality over quantity</small></span></div>
        <div className="promise-city"><span className="city-pulse" />Shipping across India</div>
      </div>

      <section className="section-block category-section">
        <div className="section-heading"><div><span className="eyebrow">A GOOD PLACE TO START</span><h2>What are you <i>in the mood for?</i></h2></div><button className="text-link desktop-link" onClick={() => onShop()}>View everything <ArrowRight size={15} /></button></div>
        <div className="category-tiles">
          {categories.slice(1).map((item, index) => <button className={`category-tile category-tile-${index}`} key={item.name} onClick={() => onShop(item.name)}><div className="category-tile-art"><span className="category-symbol">{item.icon}</span><span className="category-tile-number">0{index + 1}</span><ArrowUpRight size={15} /></div><div className="category-tile-label"><span>{item.name}</span><span>{item.count} finds</span></div></button>)}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-block featured-inner">
          <div className="section-heading"><div><span className="eyebrow">THE THINGS WE KEEP COMING BACK TO</span><h2>A few <i>very good finds.</i></h2></div><button className="text-link desktop-link" onClick={() => onShop()}>Shop the full edit <ArrowRight size={15} /></button></div>
          <div className="product-grid home-product-grid">{featured.map((item, index) => <ProductCard item={item} key={item.id} index={index} onProduct={onProduct} onAdd={onAdd} onToggleLike={onToggleLike} liked={liked.includes(item.id)} recentlyAdded={recentlyAdded} />)}</div>
          <button className="button button-outline mobile-view-all" onClick={() => onShop()}>Explore all finds <ArrowRight size={16} /></button>
        </div>
      </section>

      <section className="story-band">
        <div className="story-visual"><img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1100&q=85" alt="Friends sharing a creative moment" /><div className="story-sticker">Less, but<br /><i>lovelier.</i></div></div>
        <div className="story-copy"><span className="eyebrow">A SMALL THOUGHT</span><h2>Not more things.<br /><i>Better things.</i></h2><p>We believe the best kind of shopping leaves you with more room to enjoy the things you already love. So we look for useful, well-made pieces that feel right from the first hello.</p><button className="text-link" onClick={() => onShop()}>See what made the cut <ArrowRight size={15} /></button><div className="story-signoff"><span className="signature">the storesync team</span><span>CURATED WITH CARE IN INDIA</span></div></div>
      </section>

      <section className="newsletter-section"><div className="newsletter-spark">✳</div><span className="eyebrow">A LITTLE NOTE, NOW AND THEN</span><h2>Good things are <i>worth sharing.</i></h2><p>New finds, thoughtful ideas and the occasional little surprise.<br />Only when we have something nice to say.</p><NewsletterForm /><small className="newsletter-consent">By signing up, you agree to our very reasonable email habits.</small></section>
    </>
  )
}

function ProductCard({ item, index = 0, onProduct, onAdd, onToggleLike, liked, recentlyAdded }) {
  const isAdded = recentlyAdded?.[item.id]
  const outOfStock = item.stock <= 0

  return (
    <article className={`product-card product-card-${index % 4}`}>
      <div className={`product-card-image ${item.tone}`} role="button" tabIndex="0" onClick={() => onProduct(item)} onKeyDown={(event) => event.key === 'Enter' && onProduct(item)} aria-label={`View ${item.name}`}>
        <span className="photo-emoji">{item.icon}</span>
        <img src={item.image || item.image_url} alt={item.name} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }} />
        {outOfStock ? (
          <span className="product-badge" style={{ background: '#b54734', color: '#fff' }}>Sold Out</span>
        ) : item.stock === 1 ? (
          <span className="product-badge" style={{ background: '#d35400', color: '#fff' }}>Last Unit!</span>
        ) : item.badge ? (
          <span className="product-badge">{item.badge}</span>
        ) : null}
        <button className={`favorite-button ${liked ? 'is-liked' : ''}`} onClick={(event) => { event.stopPropagation(); onToggleLike(item.id) }} aria-label={liked ? `Remove ${item.name} from favorites` : `Save ${item.name}`}><Heart size={17} fill={liked ? 'currentColor' : 'none'} strokeWidth={1.6} /></button>
        <button className={`quick-add ${isAdded ? 'btn-added' : ''}`} disabled={outOfStock} onClick={(event) => { event.stopPropagation(); onAdd(item) }}>
          {isAdded ? <><Check size={14} /> Added</> : outOfStock ? 'Sold Out' : <><Plus size={15} /> Quick add</>}
        </button>
      </div>
      <div className="product-card-info">
        <div className="product-card-category">{item.category}<span><Star size={12} fill="currentColor" /> {item.rating}</span></div>
        <button className="product-card-title" onClick={() => onProduct(item)}>{item.name}</button>
        <p>{item.subtitle}</p>
        <div className="product-card-price"><strong>{money(item.price)}</strong>{item.compareAt && <del>{money(item.compareAt)}</del>}</div>
      </div>
    </article>
  )
}

function ShopPage({ products: visibleProducts, searchSource, search, setSearch, category, setCategory, city, setCity, maxPrice, setMaxPrice, sort, setSort, onProduct, onAdd, liked, onToggleLike, filtersOpen, setFiltersOpen, recentlyAdded }) {
  const clearFilters = () => { setCategory('All finds'); setCity('All cities'); setMaxPrice(30000); setSearch('') }
  return (
    <section className="shop-page section-block">
      <div className="breadcrumb"><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button><ChevronRight size={13} /><span>Shop all</span></div>
      <div className="shop-intro"><span className="eyebrow">A LITTLE OF WHAT YOU LOVE</span><div className="shop-intro-row"><div><h1>{category === 'All finds' ? 'The good finds.' : <>{category}<span className="title-period">.</span></>}</h1><p>Thoughtful tech and everyday pieces, picked to fit real life.</p></div><div className="shop-note"><span>16</span><small>GOOD THINGS<br />AND COUNTING</small></div></div></div>
      <div className="shop-toolbar"><button className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} /> Filters <span className="filter-count">{[category !== 'All finds', city !== 'All cities', maxPrice < 30000].filter(Boolean).length || '0'}</span></button><div className="shop-result-count">Showing <b>{visibleProducts.length}</b> finds <small>· {searchSource}</small></div><label className="sort-select"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="top-rated">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={14} /></label></div>
      <div className="shop-layout">
        <aside className={`filter-sidebar ${filtersOpen ? 'filters-open' : ''}`}>
          <div className="filter-title-row"><span>Filters</span><button onClick={clearFilters}>Clear all</button><button className="filter-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={18} /></button></div>
          <div className="filter-group"><span className="filter-group-title">Category <Minus size={14} /></span><div className="filter-options">{categories.map((item) => <button key={item.name} className={`filter-option ${category === item.name ? 'selected' : ''}`} onClick={() => setCategory(item.name)}><span className="filter-radio" />{item.name}<small>{item.count}</small></button>)}</div></div>
          <div className="filter-group"><span className="filter-group-title">Deliver to <Minus size={14} /></span><select className="city-select" value={city} onChange={(event) => setCity(event.target.value)}><option>All cities</option>{cities.map((item) => <option key={item}>{item}</option>)}</select><small className="filter-help">Availability shown across India.</small></div>
          <div className="filter-group price-filter"><span className="filter-group-title">Price range <Minus size={14} /></span><input type="range" min="1000" max="30000" step="500" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /><div className="price-range-labels"><span>₹1,000</span><span>Up to {money(maxPrice)}</span></div></div>
          <div className="filter-sidebar-note"><Sparkles size={15} /><span>Thoughtfully picked.<br />Never overwhelming.</span></div>
        </aside>
        <div className="catalogue-content">
          <form className="catalogue-search" onSubmit={(event) => event.preventDefault()}><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Looking for something? Try 'bluetoth', 'watch', 'saree'..." aria-label="Search products" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</form>
          {visibleProducts.length ? <div className="product-grid catalogue-grid">{visibleProducts.map((item, index) => <ProductCard item={item} key={item.id} index={index} onProduct={onProduct} onAdd={onAdd} onToggleLike={onToggleLike} liked={liked.includes(item.id)} recentlyAdded={recentlyAdded} />)}</div> : <div className="empty-results"><span className="empty-symbol">◌</span><h3>No good finds just yet.</h3><p>Try a different search or give your filters a little more room.</p><button className="button button-dark" onClick={clearFilters}>Clear filters</button></div>}
          <div className="catalogue-bottom-note"><span className="note-dash" /> Showing StoreSync finds <span className="note-dash" /></div>
        </div>
      </div>
    </section>
  )
}

function ProductPage({ product: item, onBack, onAdd, recentlyAdded }) {
  const [quantity, setQuantity] = useState(1)
  const isAdded = recentlyAdded?.[item.id]
  const outOfStock = (item.stock ?? 1) <= 0

  return (
    <section className="product-detail section-block">
      <div className="breadcrumb"><button onClick={onBack}>Shop all</button><ChevronRight size={13} /><span>{item.name}</span></div>
      <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to the good finds</button>
      <div className="product-detail-layout">
        <div className={`product-detail-image ${item.tone}`}><span className="photo-emoji">{item.icon}</span><img src={item.image || item.image_url} alt={item.name} onError={(event) => { event.currentTarget.style.display = 'none' }} /><div className="detail-image-caption"><span>THE STORESYNC EDIT</span><span>01 / 01</span></div></div>
        <div className="product-detail-copy">
          <span className="eyebrow">{item.category} · A THOUGHTFUL PICK</span>
          <h1>{item.name}<span className="title-period">.</span></h1>
          <p className="detail-subtitle">{item.subtitle}</p>
          <div className="detail-rating"><span className="rating-stars"><Star size={14} fill="currentColor" /> {item.rating}</span><span className="rating-divider" /> <span>{item.reviews} lovely reviews</span></div>
          <div className="detail-price">
            <strong>{money(item.price)}</strong>{item.compareAt && <del>{money(item.compareAt)}</del>}
            <span style={{ marginLeft: '12px', fontSize: '11px', fontWeight: 700, color: outOfStock ? '#c0392b' : item.stock === 1 ? '#d35400' : '#27ae60' }}>
              {outOfStock ? '● Out of Stock' : item.stock === 1 ? '● Only 1 left in stock!' : `● ${item.stock} available`}
            </span>
          </div>
          <p className="detail-description">{item.description}</p>
          <ul className="detail-points">{(item.detail || []).map((point) => <li key={point}><Check size={15} />{point}</li>)}</ul>
          <div className="detail-availability"><span className="city-pulse" /> Available in <b>{Array.isArray(item.cities) ? item.cities.slice(0, 3).join(', ') : (item.city || 'Pan-India')}</b></div>
          <div className="detail-buy-row">
            <div className="quantity-stepper">
              <button disabled={outOfStock} onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={14} /></button>
              <span>{quantity}</span>
              <button disabled={outOfStock || quantity >= item.stock} onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
            </div>
            <button className={`button button-dark add-detail-button ${isAdded ? 'btn-added' : ''}`} disabled={outOfStock} onClick={() => onAdd(item, quantity)}>
              {isAdded ? <><Check size={16} /> Added to your bag</> : outOfStock ? 'Out of stock' : <>Add to bag <ShoppingBag size={16} /></>}
            </button>
          </div>
          <small className="prototype-inline">Aiven PostgreSQL ACID Locks & Kafka live sync</small>
          <div className="detail-benefits"><div><Truck size={17} /><span><b>Complimentary delivery</b><small>over ₹2,499</small></span></div><div><Clock3 size={17} /><span><b>Easy 7-day returns</b><small>take your time</small></span></div></div>
        </div>
      </div>
      <div className="detail-bottom-note"><span>GOOD CHOICES, MADE SIMPLE</span><i>✳</i><span>THOUGHTFULLY PICKED IN INDIA</span></div>
    </section>
  )
}

function CartPage({ catalog, cart, onQuantity, subtotal, onShop, onCheckout }) {
  const items = Object.entries(cart).map(([id, quantity]) => ({ product: catalog.find((item) => String(item.id) === String(id)), quantity })).filter((entry) => entry.product)
  const delivery = subtotal === 0 || subtotal >= 2499 ? 0 : 99
  return (
    <section className="cart-page section-block">
      <div className="breadcrumb"><button onClick={onShop}>Shop all</button><ChevronRight size={13} /><span>Your bag</span></div>
      <div className="cart-heading"><div><span className="eyebrow">GOOD THINGS, GATHERED</span><h1>Your bag<span className="title-period">.</span></h1></div><span className="cart-item-count">{items.reduce((count, entry) => count + entry.quantity, 0)} items</span></div>
      {items.length === 0 ? <div className="empty-cart"><div className="empty-bag-icon"><ShoppingBag size={32} strokeWidth={1.2} /></div><span className="eyebrow">NOTHING HERE JUST YET</span><h2>A little room for <i>something good.</i></h2><p>Your next favourite is waiting to be found.</p><button className="button button-dark" onClick={onShop}>Explore the edit <ArrowRight size={16} /></button></div> : <div className="cart-layout"><div className="cart-list"><div className="cart-list-head"><span>YOUR FINDS ({items.length})</span><span>SUBTOTAL</span></div>{items.map(({ product: item, quantity }) => <div className="cart-item" key={item.id}><div className={`cart-item-image ${item.tone}`}><span>{item.icon}</span><img src={item.image || item.image_url} alt={item.name} onError={(event) => { event.currentTarget.style.display = 'none' }} /></div><div className="cart-item-info"><span className="eyebrow">{item.category}</span><h3>{item.name}</h3><p>{item.subtitle}</p><div className="cart-mobile-price">{money(item.price * quantity)}</div><div className="cart-item-controls"><div className="quantity-stepper"><button onClick={() => onQuantity(item.id, quantity - 1)} aria-label={`Decrease ${item.name} quantity`}><Minus size={13} /></button><span>{quantity}</span><button disabled={quantity >= item.stock} onClick={() => onQuantity(item.id, quantity + 1)} aria-label={`Increase ${item.name} quantity`}><Plus size={13} /></button></div><button className="remove-link" onClick={() => onQuantity(item.id, 0)}>Remove</button></div></div><strong className="cart-line-total">{money(item.price * quantity)}</strong></div>)}<button className="continue-shopping" onClick={onShop}><ArrowLeft size={14} /> Keep looking around</button></div><aside className="order-summary"><span className="eyebrow">A LITTLE RECAP</span><h2>Order summary</h2><div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-line"><span>Delivery</span><span>{delivery === 0 ? 'Complimentary' : money(delivery)}</span></div>{delivery > 0 && <div className="delivery-progress"><span>You're {money(2499 - subtotal)} away from complimentary delivery.</span><div><i style={{ width: `${Math.min((subtotal / 2499) * 100, 100)}%` }} /></div></div>}<div className="summary-total"><span>Total</span><strong>{money(subtotal + delivery)}</strong></div><small className="tax-note">All taxes included. A promise we intend to keep.</small><button className="button button-dark checkout-button" onClick={onCheckout}>Continue to checkout <ArrowRight size={16} /></button><div className="summary-prototype"><ShieldCheck size={15} /><span>Aiven PostgreSQL ACID transaction & Kafka streaming.</span></div><div className="summary-assurance"><span><Truck size={15} />Easy delivery</span><span><Clock3 size={15} />7-day returns</span></div></aside></div>}
    </section>
  )
}

function CheckoutPage({ catalog, cart, subtotal, onBack, onSubmit, orderError, placingOrder, databaseConnected, user }) {
  const items = Object.entries(cart).map(([id, quantity]) => ({ product: catalog.find((item) => String(item.id) === String(id)), quantity })).filter((entry) => entry.product)
  const delivery = subtotal === 0 || subtotal >= 2499 ? 0 : 99
  if (!items.length) return <section className="empty-cart section-block"><h2>Your bag is taking a little break.</h2><button className="button button-dark" onClick={onBack}>Back to your bag</button></section>
  return (
    <section className="checkout-page section-block">
      {orderError && (
        <div role="alert" className="checkout-error" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{orderError}</span>
        </div>
      )}
      <div className="breadcrumb"><button onClick={onBack}>Your bag</button><ChevronRight size={13} /><span>Checkout</span></div>
      <div className="checkout-header"><div><span className="eyebrow">ALMOST AT THE GOOD PART</span><h1>Let's make it <i>yours.</i></h1></div><div className="checkout-steps"><span className="step-done"><Check size={12} /> Bag</span><i /><span className="step-active">02 &nbsp; Details</span><i /><span>03 &nbsp; Done</span></div></div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={onSubmit}>
          <div className="form-section">
            <div className="form-section-heading">
              <span className="form-number">01</span>
              <div>
                <h2>Where should we send the good stuff?</h2>
                <p>{databaseConnected ? 'Name, city and order will be processed with row-level locks in Aiven PostgreSQL.' : 'Offline demo checkout.'}</p>
              </div>
            </div>
            <div className="form-grid">
              <label className="form-field full-field">Full name <input name="name" defaultValue={user?.name || ''} autoComplete="name" placeholder="e.g. Aditi Sharma" required /></label>
              <label className="form-field">Email address <input type="email" name="email" defaultValue={user?.email || ''} autoComplete="email" placeholder="aditi@example.com" required /></label>
              <label className="form-field">Phone number <input type="tel" name="phone" autoComplete="tel" placeholder="+91 98765 43210" pattern="[+0-9 ()-]{10,16}" required /></label>
              <label className="form-field full-field">Street address <input name="address" autoComplete="street-address" placeholder="House, building and street" required /></label>
              <label className="form-field">City <select name="city" defaultValue="Bengaluru" required>{cities.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
              <label className="form-field">PIN code <input name="pincode" inputMode="numeric" autoComplete="postal-code" placeholder="560 001" pattern="[0-9 ]{6,7}" required /></label>
            </div>
          </div>
          <div className="form-section payment-section">
            <div className="form-section-heading">
              <span className="form-number">02</span>
              <div>
                <h2>How would you like to pay?</h2>
                <p>Choose your preferred payment method.</p>
              </div>
            </div>
            <label className="payment-option selected-payment">
              <input type="radio" name="payment" value="upi" defaultChecked />
              <span className="payment-radio" />
              <span className="payment-copy"><b>Instant UPI Payment</b><small>Google Pay, PhonePe, Paytm, BHIM with interactive QR</small></span>
              <span className="payment-tag">POPULAR</span>
            </label>
            <label className="payment-option">
              <input type="radio" name="payment" value="cod" />
              <span className="payment-radio" />
              <span className="payment-copy"><b>Cash on delivery</b><small>Pay cash or card when order arrives</small></span>
              <span className="upi-mark">COD</span>
            </label>
          </div>
          <div className="checkout-note">
            <ShieldCheck size={16} />
            <span>Strict concurrency: Products are locked via <code>FOR UPDATE</code> in PostgreSQL so only one buyer can secure the final unit.</span>
          </div>
          <button className="button button-dark place-order-button" type="submit" disabled={placingOrder}>
            {placingOrder ? 'Processing order…' : 'Proceed to Payment · '}{money(subtotal + delivery)} <ArrowRight size={16} />
          </button>
          <button className="checkout-back" type="button" onClick={onBack}><ArrowLeft size={14} /> Return to your bag</button>
        </form>
        <aside className="checkout-summary">
          <span className="eyebrow">THE GOOD STUFF</span>
          <h2>Your order</h2>
          <div className="checkout-items">
            {items.map(({ product: item, quantity }) => (
              <div className="checkout-item" key={item.id}>
                <div className={`checkout-item-image ${item.tone}`}>
                  <span>{item.icon}</span>
                  <img src={item.image || item.image_url} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} />
                  <b>{quantity}</b>
                </div>
                <div><strong>{item.name}</strong><small>{item.subtitle}</small></div>
                <span>{money(item.price * quantity)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-summary-lines">
            <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div><span>Delivery</span><span>{delivery === 0 ? 'Complimentary' : money(delivery)}</span></div>
            <div className="checkout-grand-total"><b>Total</b><strong>{money(subtotal + delivery)}</strong></div>
          </div>
          <div className="checkout-delivery-note"><Truck size={16} /><span>Estimated delivery in 3–5 working days</span></div>
        </aside>
      </div>
    </section>
  )
}

function SuccessPage({ orderId, orderResult, onShop, onTrackOrder }) {
  const saved = orderResult?.persisted
  const eventText = orderResult?.eventStatus === 'processed'
    ? 'Kafka consumer processed ORDER_PLACED & synced stock to OpenSearch.'
    : orderResult?.eventStatus === 'sent'
      ? 'ORDER_PLACED was sent to Kafka topic order-events; consumer background sync pending.'
      : 'Order was saved in PostgreSQL.'
  return (
    <section className="success-page section-block">
      <div className="success-art"><div className="success-circle"><Check size={42} strokeWidth={1.2} /></div><span className="success-star star-one">✳</span><span className="success-star star-two">✧</span><span className="success-star star-three">·</span></div>
      <span className="eyebrow">{saved ? 'ORDER CONFIRMED' : 'THAT’S A LOVELY CHOICE'}</span>
      <h1>{saved ? <>Your order<br /><i>is in the system.</i></> : <>Your demo order<br /><i>is in the bag.</i></>}</h1>
      <p>{saved ? 'Your order was committed in Aiven PostgreSQL and streamed to Apache Kafka.' : 'For offline demo, order is recorded locally.'}</p>
      <div className="success-order-number"><small>ORDER REFERENCE</small><strong>{orderId || 'SS-DEMO'}</strong></div>
      <div className="success-demo-note"><ShieldCheck size={16} /><span>{eventText}</span></div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
        <button className="button button-dark" onClick={onTrackOrder}>
          <Package size={15} /> View & Track Order
        </button>
        <button className="button button-outline" onClick={onShop}>
          Back to the good finds <ArrowRight size={16} />
        </button>
      </div>
      <div className="success-bottom"><span />GOOD THINGS ARE ON THEIR WAY<span /></div>
    </section>
  )
}

function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false)
  return <form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required disabled={submitted} /><button type="submit" disabled={submitted}>{submitted ? <><Check size={15} /> You're on the list</> : <>Count me in <ArrowRight size={15} /></>}</button></form>
}

export default App
