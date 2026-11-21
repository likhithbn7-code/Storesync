import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight,
  Clock3, Heart, Menu, Minus, PackageCheck, Plus, Search, ShieldCheck, ShoppingBag,
  SlidersHorizontal, Sparkles, Star, Truck, X,
} from 'lucide-react'
import { categories, cities, products } from './products.js'

const money = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(amount)

const wordMatch = (product, query) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return `${product.name} ${product.subtitle} ${product.category} ${product.description}`
    .toLowerCase()
    .includes(needle)
}

function App() {
  const [page, setPage] = useState('home')
  const [product, setProduct] = useState(null)
  const [cart, setCart] = useState({})
  const [catalog, setCatalog] = useState(products)
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

  useEffect(() => {
    let active = true
    fetch('/api/health')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('API unavailable')))
      .then((data) => { if (active) setServiceStatus(data.services) })
      .catch(() => {})
    fetch('/api/products')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Database unavailable')))
      .then((data) => { if (active && Array.isArray(data.products) && data.products.length) setCatalog(data.products) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setOpenSearchIds(null)
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({ q: search, category, city, maxPrice: String(maxPrice) })
      try {
        const response = await fetch(`/api/search?${params}`, { signal: controller.signal })
        if (!response.ok) throw new Error('OpenSearch unavailable')
        const data = await response.json()
        setOpenSearchIds(data.products.map((item) => item.id))
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

  useEffect(() => {
    if (page !== 'success' || !orderResult?.persisted || !orderId) return undefined
    let active = true
    const pollOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) return
        const data = await response.json()
        if (active && data.order?.event_status) {
          setOrderResult((current) => ({ ...current, eventStatus: data.order.event_status }))
        }
      } catch {}
    }
    void pollOrder()
    const timer = window.setInterval(pollOrder, 1000)
    return () => { active = false; window.clearInterval(timer) }
  }, [page, orderId, orderResult?.persisted])

  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const subtotal = Object.entries(cart).reduce((sum, [id, quantity]) => {
    const item = catalog.find((entry) => entry.id === id)
    return sum + (item?.price ?? 0) * quantity
  }, 0)

  const filteredProducts = useMemo(() => {
    const filtered = catalog.filter((item) => {
      const categoryMatches = category === 'All finds' || item.category === category
      const cityMatches = city === 'All cities' || item.cities.includes(city)
      const searchMatches = openSearchIds !== null
        ? openSearchIds.includes(item.id)
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
    setCart((current) => ({ ...current, [item.id]: (current[item.id] || 0) + quantity }))
  }

  const updateQuantity = (id, next) => {
    setCart((current) => {
      const updated = { ...current }
      if (next <= 0) delete updated[id]
      else updated[id] = next
      return updated
    })
  }

  const toggleLiked = (id) => setLiked((current) => current.includes(id)
    ? current.filter((itemId) => itemId !== id)
    : [...current, id])

  const placeOrder = async (event) => {
    event.preventDefault()
    if (placingOrder) return
    setOrderError('')
    const form = new FormData(event.currentTarget)
    if (serviceStatus.postgres) {
      setPlacingOrder(true)
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            customer: { name: form.get('name'), email: form.get('email') },
            items: Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'The order could not be saved.')
        setOrderId(data.order.id)
        setOrderResult({ persisted: true, eventStatus: data.order.eventStatus })
        const productsResponse = await fetch('/api/products')
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setCatalog(productsData.products)
        }
        setCart({})
        go('success')
      } catch (error) {
        setOrderError(error.message)
      } finally {
        setPlacingOrder(false)
      }
      return
    }
    const newOrderId = `SS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
    setOrderId(newOrderId)
    setOrderResult({ persisted: false, eventStatus: 'simulated' })
    setCart({})
    go('success')
  }

  const submitSearch = (event) => {
    event.preventDefault()
    setCategory('All finds')
    go('shop')
  }

  return (
    <div className="app-shell">
      <div className="announcement">
        <span className="announcement-stars">✳</span>
        <span>A little more thoughtful. A lot more you.</span>
        <span className="announcement-promo">Complimentary delivery on orders over ₹2,499</span>
        <ArrowRight size={13} strokeWidth={1.7} />
      </div>
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
            <button onClick={() => openShop('Audio')}>Audio</button>
            <button onClick={() => openShop('Everyday')}>Everyday</button>
          </nav>
          <form className="header-search" onSubmit={submitSearch} role="search">
            <Search size={17} strokeWidth={1.7} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} onFocus={() => { if (page !== 'shop') setPage('shop') }} placeholder="Find your next favourite" aria-label="Search the shop" />
            <kbd>↵</kbd>
          </form>
          <div className="header-actions">
            <button className="icon-button favorites-action" aria-label={`Favorites, ${liked.length} saved`} onClick={() => { setCategory('All finds'); setSearch(''); go('shop') }}>
              <Heart size={19} strokeWidth={1.65} />
              {liked.length > 0 && <span className="mini-count">{liked.length}</span>}
            </button>
            <button className="bag-button" onClick={() => go('cart')} aria-label={`Shopping bag, ${cartCount} items`}>
              <ShoppingBag size={19} strokeWidth={1.65} />
              <span className="bag-label">Bag</span>
              <span className="bag-count">{String(cartCount).padStart(2, '0')}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {page === 'home' && <HomePage onShop={openShop} onProduct={(item) => go('product', { product: item })} onAdd={addToCart} onToggleLike={toggleLiked} liked={liked} cartCount={cartCount} />}
        {page === 'shop' && <ShopPage products={filteredProducts} searchSource={searchSource} search={search} setSearch={setSearch} category={category} setCategory={setCategory} city={city} setCity={setCity} maxPrice={maxPrice} setMaxPrice={setMaxPrice} sort={sort} setSort={setSort} onProduct={(item) => go('product', { product: item })} onAdd={addToCart} liked={liked} onToggleLike={toggleLiked} filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen} />}
        {page === 'product' && product && <ProductPage product={product} onBack={() => go('shop')} onAdd={addToCart} />}
        {page === 'cart' && <CartPage catalog={catalog} cart={cart} onQuantity={updateQuantity} subtotal={subtotal} onShop={() => openShop()} onCheckout={() => go('checkout')} />}
        {page === 'checkout' && <CheckoutPage catalog={catalog} cart={cart} subtotal={subtotal} onBack={() => go('cart')} onSubmit={placeOrder} orderError={orderError} placingOrder={placingOrder} databaseConnected={serviceStatus.postgres} />}
        {page === 'success' && <SuccessPage orderId={orderId} orderResult={orderResult} onShop={() => { setOrderId(''); setOrderResult(null); openShop() }} />}
      </main>

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
          <div className="footer-links"><h4>Explore</h4><button onClick={() => openShop()}>Shop all</button><button onClick={() => openShop('Audio')}>Audio</button><button onClick={() => openShop('Home tech')}>Home tech</button><button onClick={() => openShop('Everyday')}>Everyday</button></div>
          <div className="footer-links"><h4>Here to help</h4><button>Shipping & delivery</button><button>Returns & exchanges</button><button>Contact us</button><button>FAQs</button></div>
          <div className="footer-note"><span className="eyebrow">A NOTE FROM US</span><p>Good things should fit into your life, not the other way around. That's why every find here earns its place.</p><button onClick={() => go('home')}>A little more about us <ArrowUpRight size={14} /></button></div>
        </div>
        <div className="footer-bottom"><span>© 2026 StoreSync Studio</span><span className="footer-demo"><span className="demo-dot" />{serviceStatus.postgres ? 'Aiven PostgreSQL connected' : 'sample catalogue'} · {serviceStatus.kafka ? 'Kafka connected' : 'Kafka pending'} · {serviceStatus.opensearch ? 'OpenSearch connected' : 'OpenSearch pending'}</span><span>Made for everyday India <span className="heart-char">♥</span></span></div>
      </footer>
      <div className="prototype-ribbon"><span className="demo-dot" /> Demo prototype <span>·</span> {serviceStatus.postgres ? 'Aiven order persistence active' : 'simulated checkout'}</div>
    </div>
  )
}

function HomePage({ onShop, onProduct, onAdd, onToggleLike, liked, cartCount }) {
  const featured = [products[0], products[2], products[3], products[1]]
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
          <div className="hero-image-label"><span>THE STORESYNC EDIT</span><span>01 — 08</span></div>
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
          <div className="product-grid home-product-grid">{featured.map((item, index) => <ProductCard item={item} key={item.id} index={index} onProduct={onProduct} onAdd={onAdd} onToggleLike={onToggleLike} liked={liked.includes(item.id)} />)}</div>
          <button className="button button-outline mobile-view-all" onClick={() => onShop()}>Explore all finds <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="story-band">
        <div className="story-visual"><img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1100&q=85" alt="Friends sharing a creative moment" /><div className="story-sticker">Less, but<br /><i>lovelier.</i></div></div>
        <div className="story-copy"><span className="eyebrow">A SMALL THOUGHT</span><h2>Not more things.<br /><i>Better things.</i></h2><p>We believe the best kind of shopping leaves you with more room to enjoy the things you already love. So we look for useful, well-made pieces that feel right from the first hello.</p><button className="text-link" onClick={() => onShop()}>See what made the cut <ArrowRight size={15} /></button><div className="story-signoff"><span className="signature">the storesync team</span><span>CURATED WITH CARE IN INDIA</span></div></div>
      </section>

      <section className="newsletter-section"><div className="newsletter-spark">✳</div><span className="eyebrow">A LITTLE NOTE, NOW AND THEN</span><h2>Good things are <i>worth sharing.</i></h2><p>New finds, thoughtful ideas and the occasional little surprise.<br />Only when we have something nice to say.</p><NewsletterForm /><small className="newsletter-consent">By signing up, you agree to our very reasonable email habits.</small></section>
      <div className="home-cart-nudge" aria-live="polite">{cartCount > 0 && <span>{cartCount} {cartCount === 1 ? 'good find' : 'good finds'} in your bag</span>}</div>
    </>
  )
}

function ProductCard({ item, index = 0, onProduct, onAdd, onToggleLike, liked }) {
  return (
    <article className={`product-card product-card-${index % 4}`}>
      <div className={`product-card-image ${item.tone}`} role="button" tabIndex="0" onClick={() => onProduct(item)} onKeyDown={(event) => event.key === 'Enter' && onProduct(item)} aria-label={`View ${item.name}`}>
        <span className="photo-emoji">{item.icon}</span>
        <img src={item.image} alt={item.name} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }} />
        {item.badge && <span className="product-badge">{item.badge}</span>}
        <button className={`favorite-button ${liked ? 'is-liked' : ''}`} onClick={(event) => { event.stopPropagation(); onToggleLike(item.id) }} aria-label={liked ? `Remove ${item.name} from favorites` : `Save ${item.name}`}><Heart size={17} fill={liked ? 'currentColor' : 'none'} strokeWidth={1.6} /></button>
        <button className="quick-add" onClick={(event) => { event.stopPropagation(); onAdd(item) }}><Plus size={15} /> Quick add</button>
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

function ShopPage({ products: visibleProducts, searchSource, search, setSearch, category, setCategory, city, setCity, maxPrice, setMaxPrice, sort, setSort, onProduct, onAdd, liked, onToggleLike, filtersOpen, setFiltersOpen }) {
  const clearFilters = () => { setCategory('All finds'); setCity('All cities'); setMaxPrice(30000); setSearch('') }
  return (
    <section className="shop-page section-block">
      <div className="breadcrumb"><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button><ChevronRight size={13} /><span>Shop all</span></div>
      <div className="shop-intro"><span className="eyebrow">A LITTLE OF WHAT YOU LOVE</span><div className="shop-intro-row"><div><h1>{category === 'All finds' ? 'The good finds.' : <>{category}<span className="title-period">.</span></>}</h1><p>Thoughtful tech and everyday pieces, picked to fit real life.</p></div><div className="shop-note"><span>08</span><small>GOOD THINGS<br />AND COUNTING</small></div></div></div>
      <div className="shop-toolbar"><button className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} /> Filters <span className="filter-count">{[category !== 'All finds', city !== 'All cities', maxPrice < 30000].filter(Boolean).length || '0'}</span></button><div className="shop-result-count">Showing <b>{visibleProducts.length}</b> of 8 finds <small>· {searchSource}</small></div><label className="sort-select"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="top-rated">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={14} /></label></div>
      <div className="shop-layout">
        <aside className={`filter-sidebar ${filtersOpen ? 'filters-open' : ''}`}>
          <div className="filter-title-row"><span>Filters</span><button onClick={clearFilters}>Clear all</button><button className="filter-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={18} /></button></div>
          <div className="filter-group"><span className="filter-group-title">Category <Minus size={14} /></span><div className="filter-options">{categories.map((item) => <button key={item.name} className={`filter-option ${category === item.name ? 'selected' : ''}`} onClick={() => setCategory(item.name)}><span className="filter-radio" />{item.name}<small>{item.count}</small></button>)}</div></div>
          <div className="filter-group"><span className="filter-group-title">Deliver to <Minus size={14} /></span><select className="city-select" value={city} onChange={(event) => setCity(event.target.value)}><option>All cities</option>{cities.map((item) => <option key={item}>{item}</option>)}</select><small className="filter-help">Availability shown is sample data.</small></div>
          <div className="filter-group price-filter"><span className="filter-group-title">Price range <Minus size={14} /></span><input type="range" min="2000" max="30000" step="500" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /><div className="price-range-labels"><span>₹2,000</span><span>Up to {money(maxPrice)}</span></div></div>
          <div className="filter-sidebar-note"><Sparkles size={15} /><span>Thoughtfully picked.<br />Never overwhelming.</span></div>
        </aside>
        <div className="catalogue-content">
          <form className="catalogue-search" onSubmit={(event) => event.preventDefault()}><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Looking for something?" aria-label="Search products" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</form>
          {visibleProducts.length ? <div className="product-grid catalogue-grid">{visibleProducts.map((item, index) => <ProductCard item={item} key={item.id} index={index} onProduct={onProduct} onAdd={onAdd} onToggleLike={onToggleLike} liked={liked.includes(item.id)} />)}</div> : <div className="empty-results"><span className="empty-symbol">◌</span><h3>No good finds just yet.</h3><p>Try a different search or give your filters a little more room.</p><button className="button button-dark" onClick={clearFilters}>Clear filters</button></div>}
          <div className="catalogue-bottom-note"><span className="note-dash" /> That's all 08 for now <span className="note-dash" /></div>
        </div>
      </div>
    </section>
  )
}

function ProductPage({ product: item, onBack, onAdd }) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  return (
    <section className="product-detail section-block">
      <div className="breadcrumb"><button onClick={onBack}>Shop all</button><ChevronRight size={13} /><span>{item.name}</span></div>
      <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to the good finds</button>
      <div className="product-detail-layout">
        <div className={`product-detail-image ${item.tone}`}><span className="photo-emoji">{item.icon}</span><img src={item.image} alt={item.name} onError={(event) => { event.currentTarget.style.display = 'none' }} /><div className="detail-image-caption"><span>THE STORESYNC EDIT</span><span>01 / 01</span></div></div>
        <div className="product-detail-copy"><span className="eyebrow">{item.category} · A THOUGHTFUL PICK</span><h1>{item.name}<span className="title-period">.</span></h1><p className="detail-subtitle">{item.subtitle}</p><div className="detail-rating"><span className="rating-stars"><Star size={14} fill="currentColor" /> {item.rating}</span><span className="rating-divider" /> <span>{item.reviews} lovely reviews</span></div><div className="detail-price"><strong>{money(item.price)}</strong>{item.compareAt && <del>{money(item.compareAt)}</del>}{item.compareAt && <span className="detail-save">Save {money(item.compareAt - item.price)}</span>}</div><p className="detail-description">{item.description}</p><ul className="detail-points">{item.detail.map((point) => <li key={point}><Check size={15} />{point}</li>)}</ul><div className="detail-availability"><span className="city-pulse" /> Sample availability in <b>{item.cities.slice(0, 3).join(', ')}</b></div><div className="detail-buy-row"><div className="quantity-stepper"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={14} /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button></div><button className="button button-dark add-detail-button" onClick={() => { onAdd(item, quantity); setAdded(true) }}>{added ? <><Check size={16} /> Added to your bag</> : <>Add to bag <ShoppingBag size={16} /></>}</button></div><small className="prototype-inline">Prototype checkout · no live inventory or payment</small><div className="detail-benefits"><div><Truck size={17} /><span><b>Complimentary delivery</b><small>over ₹2,499</small></span></div><div><Clock3 size={17} /><span><b>Easy 7-day returns</b><small>take your time</small></span></div></div></div>
      </div>
      <div className="detail-bottom-note"><span>GOOD CHOICES, MADE SIMPLE</span><i>✳</i><span>THOUGHTFULLY PICKED IN INDIA</span></div>
    </section>
  )
}

function CartPage({ catalog, cart, onQuantity, subtotal, onShop, onCheckout }) {
  const items = Object.entries(cart).map(([id, quantity]) => ({ product: catalog.find((item) => item.id === id), quantity })).filter((entry) => entry.product)
  const delivery = subtotal === 0 || subtotal >= 2499 ? 0 : 99
  return (
    <section className="cart-page section-block">
      <div className="breadcrumb"><button onClick={onShop}>Shop all</button><ChevronRight size={13} /><span>Your bag</span></div>
      <div className="cart-heading"><div><span className="eyebrow">GOOD THINGS, GATHERED</span><h1>Your bag<span className="title-period">.</span></h1></div><span className="cart-item-count">{items.reduce((count, entry) => count + entry.quantity, 0)} items</span></div>
      {items.length === 0 ? <div className="empty-cart"><div className="empty-bag-icon"><ShoppingBag size={32} strokeWidth={1.2} /></div><span className="eyebrow">NOTHING HERE JUST YET</span><h2>A little room for <i>something good.</i></h2><p>Your next favourite is waiting to be found.</p><button className="button button-dark" onClick={onShop}>Explore the edit <ArrowRight size={16} /></button></div> : <div className="cart-layout"><div className="cart-list"><div className="cart-list-head"><span>YOUR FINDS ({items.length})</span><span>SUBTOTAL</span></div>{items.map(({ product: item, quantity }) => <div className="cart-item" key={item.id}><div className={`cart-item-image ${item.tone}`}><span>{item.icon}</span><img src={item.image} alt={item.name} onError={(event) => { event.currentTarget.style.display = 'none' }} /></div><div className="cart-item-info"><span className="eyebrow">{item.category}</span><h3>{item.name}</h3><p>{item.subtitle}</p><div className="cart-mobile-price">{money(item.price * quantity)}</div><div className="cart-item-controls"><div className="quantity-stepper"><button onClick={() => onQuantity(item.id, quantity - 1)} aria-label={`Decrease ${item.name} quantity`}><Minus size={13} /></button><span>{quantity}</span><button onClick={() => onQuantity(item.id, quantity + 1)} aria-label={`Increase ${item.name} quantity`}><Plus size={13} /></button></div><button className="remove-link" onClick={() => onQuantity(item.id, 0)}>Remove</button></div></div><strong className="cart-line-total">{money(item.price * quantity)}</strong></div>)}<button className="continue-shopping" onClick={onShop}><ArrowLeft size={14} /> Keep looking around</button></div><aside className="order-summary"><span className="eyebrow">A LITTLE RECAP</span><h2>Order summary</h2><div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-line"><span>Delivery</span><span>{delivery === 0 ? 'Complimentary' : money(delivery)}</span></div>{delivery > 0 && <div className="delivery-progress"><span>You're {money(2499 - subtotal)} away from complimentary delivery.</span><div><i style={{ width: `${Math.min((subtotal / 2499) * 100, 100)}%` }} /></div></div>}<div className="summary-total"><span>Total</span><strong>{money(subtotal + delivery)}</strong></div><small className="tax-note">All taxes included. A promise we intend to keep.</small><button className="button button-dark checkout-button" onClick={onCheckout}>Continue to checkout <ArrowRight size={16} /></button><div className="summary-prototype"><ShieldCheck size={15} /><span>Prototype flow. Your order is simulated; nothing is charged.</span></div><div className="summary-assurance"><span><Truck size={15} />Easy delivery</span><span><Clock3 size={15} />7-day returns</span></div></aside></div>}
    </section>
  )
}

function CheckoutPage({ catalog, cart, subtotal, onBack, onSubmit, orderError, placingOrder, databaseConnected }) {
  const items = Object.entries(cart).map(([id, quantity]) => ({ product: catalog.find((item) => item.id === id), quantity })).filter((entry) => entry.product)
  const delivery = subtotal === 0 || subtotal >= 2499 ? 0 : 99
  if (!items.length) return <section className="empty-cart section-block"><h2>Your bag is taking a little break.</h2><button className="button button-dark" onClick={onBack}>Back to your bag</button></section>
  return (
    <section className="checkout-page section-block">
      {orderError && <p role="alert" className="checkout-error">{orderError}</p>}
      <div className="breadcrumb"><button onClick={onBack}>Your bag</button><ChevronRight size={13} /><span>Checkout</span></div>
      <div className="checkout-header"><div><span className="eyebrow">ALMOST AT THE GOOD PART</span><h1>Let's make it <i>yours.</i></h1></div><div className="checkout-steps"><span className="step-done"><Check size={12} /> Bag</span><i /><span className="step-active">02 &nbsp; Details</span><i /><span>03 &nbsp; Done</span></div></div>
      <div className="checkout-layout"><form className="checkout-form" onSubmit={onSubmit}><div className="form-section"><div className="form-section-heading"><span className="form-number">01</span><div><h2>Where should we send the good stuff?</h2><p>{databaseConnected ? 'Name, email and order will be saved in Aiven PostgreSQL.' : 'Your details stay in this offline demo and are not saved.'}</p></div></div><div className="form-grid"><label className="form-field full-field">Full name <input name="name" autoComplete="name" placeholder="e.g. Aditi Sharma" required /></label><label className="form-field">Email address <input type="email" name="email" autoComplete="email" placeholder="aditi@example.com" required /></label><label className="form-field">Phone number <input type="tel" name="phone" autoComplete="tel" placeholder="+91 98765 43210" pattern="[+0-9 ()-]{10,16}" required /></label><label className="form-field full-field">Street address <input name="address" autoComplete="street-address" placeholder="House, building and street" required /></label><label className="form-field">City <select name="city" defaultValue="" required><option value="" disabled>Select your city</option>{cities.map((city) => <option key={city}>{city}</option>)}</select></label><label className="form-field">PIN code <input name="pincode" inputMode="numeric" autoComplete="postal-code" placeholder="560 001" pattern="[0-9 ]{6,7}" required /></label></div></div><div className="form-section payment-section"><div className="form-section-heading"><span className="form-number">02</span><div><h2>How would you like to pay?</h2><p>Choose a demo payment option to continue.</p></div></div><label className="payment-option selected-payment"><input type="radio" name="payment" value="cod" defaultChecked /><span className="payment-radio" /><span className="payment-copy"><b>Cash on delivery</b><small>Pay when your order arrives</small></span><span className="payment-tag">POPULAR</span></label><label className="payment-option"><input type="radio" name="payment" value="upi" /><span className="payment-radio" /><span className="payment-copy"><b>UPI payment</b><small>GPay, PhonePe, Paytm & more</small></span><span className="upi-mark">UPI</span></label></div><div className="checkout-note"><ShieldCheck size={16} /><span>{databaseConnected ? 'Order and sample stock will be saved in Aiven PostgreSQL. No payment is collected.' : 'Offline demo checkout only. No order is saved or stock changed.'}</span></div><button className="button button-dark place-order-button" type="submit" disabled={placingOrder}>{placingOrder ? 'Saving order…' : databaseConnected ? 'Place sample order · ' : 'Place demo order · '}{!placingOrder && money(subtotal + delivery)} <ArrowRight size={16} /></button><button className="checkout-back" type="button" onClick={onBack}><ArrowLeft size={14} /> Return to your bag</button></form><aside className="checkout-summary"><span className="eyebrow">THE GOOD STUFF</span><h2>Your order</h2><div className="checkout-items">{items.map(({ product: item, quantity }) => <div className="checkout-item" key={item.id}><div className={`checkout-item-image ${item.tone}`}><span>{item.icon}</span><img src={item.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /><b>{quantity}</b></div><div><strong>{item.name}</strong><small>{item.subtitle}</small></div><span>{money(item.price * quantity)}</span></div>)}</div><div className="checkout-summary-lines"><div><span>Subtotal</span><span>{money(subtotal)}</span></div><div><span>Delivery</span><span>{delivery === 0 ? 'Complimentary' : money(delivery)}</span></div><div className="checkout-grand-total"><b>Total</b><strong>{money(subtotal + delivery)}</strong></div></div><div className="checkout-delivery-note"><Truck size={16} /><span>Estimated delivery in 3–5 working days</span></div></aside></div>
    </section>
  )
}

function SuccessPage({ orderId, orderResult, onShop }) {
  const saved = orderResult?.persisted
  const eventText = orderResult?.eventStatus === 'processed'
    ? 'Kafka consumer processed ORDER_PLACED.'
    : orderResult?.eventStatus === 'sent'
      ? 'ORDER_PLACED was sent to Kafka; consumer processing is pending.'
      : orderResult?.eventStatus === 'pending'
        ? 'Order saved; Kafka event is pending.'
        : 'This order is only simulated. Nothing was sent or saved.'
  return <section className="success-page section-block"><div className="success-art"><div className="success-circle"><Check size={42} strokeWidth={1.2} /></div><span className="success-star star-one">✳</span><span className="success-star star-two">✧</span><span className="success-star star-three">·</span></div><span className="eyebrow">{saved ? 'ORDER STATUS' : 'THAT’S A LOVELY CHOICE'}</span><h1>{saved ? <>Your order<br /><i>is in the system.</i></> : <>Your demo order<br /><i>is in the bag.</i></>}</h1><p>{saved ? 'Your sample order was saved in Aiven PostgreSQL.' : 'For the offline frontend demo, checkout is simulated.'}</p><div className="success-order-number"><small>{saved ? 'ORDER REFERENCE' : 'DEMO ORDER REFERENCE'}</small><strong>{orderId || 'SS-DEMO'}</strong></div><div className="success-demo-note"><ShieldCheck size={16} /><span>{eventText} No payment was collected.</span></div><button className="button button-dark" onClick={onShop}>Back to the good finds <ArrowRight size={16} /></button><div className="success-bottom"><span />GOOD THINGS ARE ON THEIR WAY<span /></div></section>
}

function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false)
  return <form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required disabled={submitted} /><button type="submit" disabled={submitted}>{submitted ? <><Check size={15} /> You're on the list</> : <>Count me in <ArrowRight size={15} /></>}</button></form>
}

export default App
