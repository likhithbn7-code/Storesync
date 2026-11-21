import React from 'react';

// ============================================================================
// StoreSync - Modern Storefront, Cart, Checkout, Auth & AI Assistant
// ============================================================================

    const NAV_CATEGORIES = [
      { id: 'Home', label: 'Home' },
      { id: 'All', label: 'Shop all' },
      { id: 'Electronics', label: 'Electronics' },
      { id: 'Fashion', label: 'Fashion' },
      { id: 'Home & Kitchen', label: 'Home & Kitchen' },
      { id: 'Accessories', label: 'Accessories' },
    ];

    const MOOD_TILES = [
      { num: '01', name: 'Electronics', glyph: 'â™«', detail: 'Audio, smartwatches & desk tech', bg: 'bg-sage' },
      { num: '02', name: 'Fashion', glyph: 'âœ§', detail: 'Handloom drapes & everyday carry', bg: 'bg-blush' },
      { num: '03', name: 'Home & Kitchen', glyph: 'âŒ‚', detail: 'Warm lighting & tactile living', bg: 'bg-slate-tint' },
      { num: '04', name: 'Accessories', glyph: 'â—·', detail: 'Timepieces & travel essentials', bg: 'bg-light-surface-container-low' },
    ];

    const INITIAL_PRODUCTS = [
      { id: 1, name: 'boAt Rockerz 550', subtitle: '50mm drivers Â· 20hr playback', category: 'Electronics', variant: 'Matte Black', price: 1999.00, rating: 4.8, reviews: 214, stock: 14, tag: 'Bestseller', cities: ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrAY0wpGTwthEbjk-BdyqZ_eZEUfJW9S82xhq5iyKuYo9MJRRcwwD_skjxe04AsIONBRCQp3G92zzqKWEkR3nEgci8hX6spBtH-M8L-_pW6lWJnyVh1MrNVMzLACEHvuDpp2xMhgdeJVLzaZvBk4wTTvNnNZVShAucRDVPG19_FMJgbEhKbpgaFeQ3FUz-HEiAMEaNpeeX7UwaLErZjVrMfPD7OH0TAGT8YIrUAfUap9pXB3ApwJWv0UfJZ3-g' },
      { id: 2, name: 'Sony WH-1000XM5', subtitle: 'Industry-leading ANC wireless', category: 'Electronics', variant: 'Silver Mist', price: 24990.00, rating: 4.9, reviews: 162, stock: 1, tag: 'Last Unit!', cities: ['Bengaluru', 'Mumbai', 'Delhi'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrAKjcQvpQUFEF7BL5ux2LcOn6RYPr938_Bf1CSsUgl96jwVNbpvUcxfoP2Sr6YZxc33_QFgic1eX1v7ZZVDT_bP7ulmeLHRdIz05nQB-6I34Hag4O6jVhboaEPQdr8GephjdZGChC27t31TZg77OzvUFWr79JXKJbT8V0numAkonkRwjXWXdBs5VtLydozBD6l9cO1HDM2fvp6tzT1ZiwRCDIBPTuHCCzZJschdZNDp8C475RkEdcBVWtFK' },
      { id: 3, name: 'Marshall Emberton II', subtitle: '360Â° portable Bluetooth speaker', category: 'Electronics', variant: 'Cream Brass', price: 14999.00, rating: 4.8, reviews: 94, stock: 6, tag: 'Bestseller', cities: ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrC7GCqBKGbGOLoXuBTAsJs-Wy05MZYIakhJNU89ECeHjL_27EsZTvdVz_fYkRbFpgl8fcbXIwaATrbQ-I2oOZPlGcOjGz1ssbNRj6h_Dbt2eC4jyVS2aGTM2RNIMBd7hP4tTo0X2lrp6dPJgJ2dFDxXC8zh4U9uZn7Juno9Xin3zIwou3SFG5hFikf8v785FhdhylJ3E0JqdEro-cCN5jrtxSVQfyRsZNbrnUAhBk00KWqdaFWAryOg-A' },
      { id: 4, name: 'Keychron K2 Wireless', subtitle: 'Hot-swappable tactile mechanical', category: 'Electronics', variant: 'Slate Grey', price: 8499.00, rating: 4.7, reviews: 73, stock: 5, tag: 'Studio Pick', cities: ['Bengaluru', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrBZ1g6YV5jEC6dvE93da4ZmRrh0n4HdxCer1VUMkGpeb16Anlnl4ZLc_kSkJ3GwHkBcFjWQFxrApqt2P0ZmJQY9mWRc_ri41yB7jIpc_vxpcXJRAMS9Xjz8c4NFK6xXLpDVuhC5gGuCWn1vde9bhbU4qaJsknKOVKxv9lvSDawxn3L75Vx7y9X7w8MmgA0oMyz9LkjDEs4C53fqFAA6Wp20soSRblNvVz1-APRbMt9L0t7Kafiz-ish' },
      { id: 5, name: 'Kanjeevaram Silk Saree', subtitle: 'Handwoven mulberry zari border', category: 'Fashion', variant: 'Crimson Zari', price: 8499.00, rating: 4.9, reviews: 89, stock: 1, tag: 'Last Unit!', cities: ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrDwzH96FFCzuBYBhRC-lvSG9QxawVW9SFilXgAOGZz9wTuknTD4LuXUbBjkJc5jXyM9SZGsFVbf-etI7eCgwBaz0YiZMZgw8WhTKDs_-43gFAFMmNy31zFq3uoztYvuTrbVI5SaJDWIozuDeerH8cAy9Yho0UW23ZcqmY71N81LALFGlagMy9onKmHIrpoKGaSKIvMp696_OHh6XqxO9_oGA-lgBtjmTkdj9-iLMpw4VI1oZw' },
      { id: 6, name: 'Linen Oversized Kurta', subtitle: 'Breathable 100% European flax', category: 'Fashion', variant: 'Warm Ivory', price: 2899.00, rating: 4.6, reviews: 58, stock: 12, tag: 'Timeless', cities: ['Bengaluru', 'Mumbai', 'Delhi'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrAtSNmPDI8GE8QBwHP6gdJ1SpHaQD-Hp_AJjRj7K9wC-MDCLDT-5k9zqZMdPl-QBJYBPSuyMMOzZr6h4vLM4bSI2pUW25QuhVTMwWKA_aoAdOfjHei1-xAkxf0MSzu6o9PwYFH5Biyk7P-B9eRU5z9xJqu2MNFvALj8EUC8-47inAJMEQUCsvcXZFqkGCXUdpq_-ZWyRgiGIHoq1EfX42pkRWF7_1t4SrAkmRBG3xUQNL-IIgAjNLQBFCJnV5I' },
      { id: 7, name: 'Merino Knit Cardigan', subtitle: 'Fine-gauge everyday layering', category: 'Fashion', variant: 'Sandstone', price: 4299.00, rating: 4.7, reviews: 41, stock: 8, tag: 'New Drop', cities: ['Delhi', 'Mumbai'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrDa15vJbqb9IvErMKy2oLXxpX6nNoNFZUv4leDXuPYTtQAoYAnbqbqtLCJsqZRZEknuQg5mBtuDFCEHrj4SC6d3ztPkyjHarP0Itky_AigXw4cC4IbtA8lpFGwvpl7XZyfTJvIKLcAtV2qlQPw7B1RJB_4ZnjnuntPT_Gp_LKaNzbKfT3S3nKRrp_U4P0dIozlnJVB27v8gkYy8KkTxT1u8QVwnQqJ5rfpE4ClVKsrgjf3Wz1PfiQ' },
      { id: 8, name: 'Handloom Cotton Stole', subtitle: 'Natural indigo block-printed wrap', category: 'Fashion', variant: 'Indigo Loom', price: 1499.00, rating: 4.8, reviews: 67, stock: 18, tag: 'Bestseller', cities: ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrBx4HGbpVta2b1q7RjVTfMtpZgS_3YhbxBf02Gegj7WG9HFZHIhojh0XlA_oOff_iEzHno1U_VSLUzH1OqqXHW5r12_FstLfEeB_gMoUyg6ReInQ1odousXaBRdpSQ0uwTySsLvLDBwmbEJfD2JonXQW1TQvxDFH36miQopmf61VYuyp5muBn61fHcfvwgOiWmCnBQ9KX9Cmr06mQQytiYjpqqkcud8KOmY1HuaMql7cJEnGik' },
      { id: 9, name: 'Aurelia Cordless Lamp', subtitle: 'Warm 2700K dimmable brass', category: 'Home & Kitchen', variant: 'Brushed Brass', price: 4999.00, rating: 4.9, reviews: 112, stock: 7, tag: 'Bestseller', cities: ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrAcmtx_HvulKGW6C60RaNV1snwQTiSYfmvG7MSyu-lHt8NBQ17Kes_9CZTtN3uJb64vn_ZoHXTH4LNRVAFnE_AIiKYPnfnECoywxRcPFrjotFAzGet63o7nG_kCwL-kIREQgy333Dl3ugRpLSQdAXxWmQ5GO6pPvDsRizsYc55cBDnH7n7dPNvfYm-nzdEqEFXObE3RW25tbZjLYPrVHReKkteaQ1SFUaDs7IUJYpKih7TnYl5p' },
      { id: 10, name: 'Nordic Oak Lounge Chair', subtitle: 'Solid ash frame & bouclÃ© seat', category: 'Home & Kitchen', variant: 'Natural Oak', price: 18999.00, rating: 4.8, reviews: 34, stock: 3, tag: 'Studio Pick', cities: ['Bengaluru', 'Mumbai'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrC3l6IDHbzyCUNSiutiBvg679lB45Pgb7BizK_IP84gz16Q5YnfvtuHhLOxxGGgNAxfsXWqWX5Id9XhtEGyhwyFVrjC85msYJAboa0pcZI73_IxK1vh3O5x19o6ofHLfPdX3Ww2IVEVpneZccvPt4ZdZSSWqbdlM7uDFYoufTPiqNSCXA2I9nRB1qTGer6wf9fjL56uwE1BjMJPcmdNICeedmBkKAKyNo1Uw28YNZcvBsB_u8Lt3g' },
      { id: 11, name: 'Stoneware Pour-Over Set', subtitle: 'Matte glazed ceramic carafe', category: 'Home & Kitchen', variant: 'Oatmeal Glaze', price: 2299.00, rating: 4.7, reviews: 83, stock: 11, tag: 'Timeless', cities: ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrA-qn8PrSJWbN_1A9XqiZ3BZ9Fihq2MnmaXuKxkw9r4Hgs_bpdDYpVuX55snBIZehj5iEkGqvhoRdFHOywbA8tJHDM68kpEjMLz5gU1dgQ-mc2qsKv7kD7gru6iXQk1BIW_3ixuy2gfz91LEdGd2RacNvFvaVsfu3PBpQAHUXgnVfNGAC-jhC8lyXvAhSpFqfWqMxs8L4q9cI-vIwrEnw0kYmq3W3lSJbLhdsUPwNoZUg' },
      { id: 12, name: 'Hardcover Design Monograph', subtitle: '240-page linen-bound edition', category: 'Home & Kitchen', variant: 'Ivory Cloth', price: 1699.00, rating: 4.8, reviews: 49, stock: 15, tag: 'Giftable', cities: ['Bengaluru', 'Delhi', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrAZqcYk2S65YtWUZmgJFsllnSo5A0I5vQPsU4d1cL_Shd9NnB1hM8GMpQUH0B5NUByCI8Ogy2i3DK38rznwOA0H28fZQu9yoiCigEkGEWpbR233ab39HB4gEW2_2dwimDyt9frikDgMrPqSwYRwnG4dnGnnP_yfjmNkHdBO5WtE-RnKN4PWTfJknDGYM2ZrpamA2VBI-3EPatN-1aW_N5NRopOWJguD7q-RVRV0sGVbp5td' },
      { id: 13, name: 'Titan Neo Watch', subtitle: '40mm brushed steel & sapphire', category: 'Accessories', variant: 'Midnight Dial', price: 3499.00, rating: 4.7, reviews: 128, stock: 9, tag: 'Timeless', cities: ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrAa6BFFihxhD0AznhA9gqacAksO_-ycg_1JyoyZnWKG3N8gwPikK18mUDAzezYSqOKIHoP2xDEen1xsjzW_zMcSx9tBroe67bWJVYnvq7lXngr2O8uI4WVW9-Y0mw9PjlKzFh1zU0CukBPrTamD-UIlQPCivQXheAUFqRmdQSOuVK1gEUXvmevRPcqS7FimfP8G1m063dKRFEpMn2oW5XzTVReenqzDO0TpOQ81mOSkDKOGRAUJuw' },
      { id: 14, name: 'Commuter Waxed Backpack', subtitle: '16" laptop sleeve Â· water-resistant', category: 'Accessories', variant: 'Forest Olive', price: 4599.00, rating: 4.8, reviews: 95, stock: 10, tag: 'Bestseller', cities: ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrBA0T9TA0BepnpBHeY7DehM6HywZJkJ6mRRwRsoCSfHLf0fl19Von3A1tvqSqTdIpv_b25xJ0s0A76rl4gSphzEiLkU4VRrsF_xRwm-ujIMDO6jqDG-MaTkPUgnlQGJqN0e4wYcj6QBegVBR0KBm8fTBPeGvyZnT4Lwk6Z3NmiIQ7GlFbon7wCMjJHFllnhYQK-2d2zBQNvwxMeG1hr3idZIYx9oKSXL8dG-5zO3XL7N08FyL-gab7D2UQ' },
      { id: 15, name: 'Molded EVA Travel Case', subtitle: 'Hardshell audio & cable organizer', category: 'Accessories', variant: 'Charcoal', price: 1299.00, rating: 4.6, reviews: 64, stock: 22, tag: 'Everyday', cities: ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrD3uX4gZ6zIbYPxe8MeHKwlMn4fYYlEjOCqTk-IY2Usaq9ohmUxxTt9qrt3RjL3ax1wJxjKjNLddsLKZ3lMvxddGwg-W9F2Xj1P8oSk2wYwC1eJmOFNyz4n-0y6ksXHJUo6RkcqbsYxH4nk5mmGDnTfhHD-5bveHZueB1G4cfEsiyyLEYN4MbC4p1Wn8evLwvyky4DB-D_F_phWUKAeW7DBq-8kVsy0sn9hv49w7vEHwkap7ve8zhcPUg' },
      { id: 16, name: 'Desk Valet & Cable Tray', subtitle: 'Full-grain vegetable-tanned leather', category: 'Accessories', variant: 'Chestnut', price: 1899.00, rating: 4.8, reviews: 53, stock: 13, tag: 'Timeless', cities: ['Bengaluru', 'Mumbai', 'Hyderabad'], image: 'https://lh3.googleusercontent.com/aida/ALJJyrA0lXoJf6yncuNdsrQbt_gtqpi6ord-g3aca6c1kpCpHC9nS9Vt0SWK9bp3r_PTVQt9xQ2VpN9otVbwbmDvYkJVBiH6hJHjNKa57bDeZVREQAdzUXmlwHj8A89uG2U2mVBcLBJkJrl1rinEmhfKt-4Lf_rc8gyYR2AemmITXftjizy8qK6mjjqgyxihQIhJVltum6Q40EO55OnJ-5SLqfTqIcfuHajtD7NLLIMSMZVZgOFsbu1uqt6A6g' },
    ];

    const FEATURED_IDS = [1, 2, 5, 13];
    const UPI_APPS = ['GPay', 'PhonePe', 'Paytm', 'BHIM', 'CRED'];

    const INITIAL_ORDERS = [
      {
        id: 'ST-4829',
        created_at: '20 Nov 2026, 02:15 PM',
        payment_method: 'UPI',
        status: 'OUT_FOR_DELIVERY',
        total_amount: 5498.00,
        items: [
          { name: 'boAt Rockerz 550', quantity: 1, price: 1999.00, image: 'https://lh3.googleusercontent.com/aida/ALJJyrAY0wpGTwthEbjk-BdyqZ_eZEUfJW9S82xhq5iyKuYo9MJRRcwwD_skjxe04AsIONBRCQp3G92zzqKWEkR3nEgci8hX6spBtH-M8L-_pW6lWJnyVh1MrNVMzLACEHvuDpp2xMhgdeJVLzaZvBk4wTTvNnNZVShAucRDVPG19_FMJgbEhKbpgaFeQ3FUz-HEiAMEaNpeeX7UwaLErZjVrMfPD7OH0TAGT8YIrUAfUap9pXB3ApwJWv0UfJZ3-g' },
          { name: 'Titan Neo Watch', quantity: 1, price: 3499.00, image: 'https://lh3.googleusercontent.com/aida/ALJJyrAa6BFFihxhD0AznhA9gqacAksO_-ycg_1JyoyZnWKG3N8gwPikK18mUDAzezYSqOKIHoP2xDEen1xsjzW_zMcSx9tBroe67bWJVYnvq7lXngr2O8uI4WVW9-Y0mw9PjlKzFh1zU0CukBPrTamD-UIlQPCivQXheAUFqRmdQSOuVK1gEUXvmevRPcqS7FimfP8G1m063dKRFEpMn2oW5XzTVReenqzDO0TpOQ81mOSkDKOGRAUJuw' },
        ],
      },
    ];

    const ORDER_STEPS = ['CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const STEP_LABELS = ['Confirmed', 'Packed', 'Out for Delivery', 'Delivered'];
    const PAYMENT_METHODS = [
      { id: 'COD', title: 'Cash on delivery', subtitle: 'Pay when your order arrives at your door', badge: 'POPULAR', icon: 'banknote' },
      { id: 'UPI', title: 'Instant Wallet / UPI', subtitle: 'Fast one-tap payment via QR / UPI apps', badge: '', icon: 'smartphone' },
      { id: 'CARD', title: 'Credit or Debit Card', subtitle: 'Visa, Mastercard, or RuPay â€” encrypted checkout', badge: '', icon: 'credit-card' },
    ];

    function formatINR(amount) {
      return `â‚¹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function LucideIcon({ name, className = 'w-5 h-5' }) {
      const ref = React.useRef(null);
      React.useEffect(() => {
        if (ref.current && window.lucide) {
          ref.current.innerHTML = `<i data-lucide="${name}" class="${className}" aria-hidden="true"></i>`;
          window.lucide.createIcons({ root: ref.current });
        }
      }, [name, className]);
      return <span ref={ref} className="inline-flex items-center justify-center shrink-0" aria-hidden="true" />;
    }

    function GoogleLogoSVG() {
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-8.97z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
        </svg>
      );
    }

    function StoresyncSPA() {
      const [view, setView] = React.useState('home');
      const [activeCategory, setActiveCategory] = React.useState('Home');
      const [products, setProducts] = React.useState(INITIAL_PRODUCTS);
      const [query, setQuery] = React.useState('');
      const [cart, setCart] = React.useState([
        { ...INITIAL_PRODUCTS[0], quantity: 1 },
        { ...INITIAL_PRODUCTS[12], quantity: 1 },
      ]);
      const [wishlist, setWishlist] = React.useState([1, 5]);
      const [orders, setOrders] = React.useState(INITIAL_ORDERS);
      const [user, setUser] = React.useState(() => {
        try {
          const saved = window.localStorage.getItem('storesync_user');
          return saved ? JSON.parse(saved) : null;
        } catch (_) {
          return null;
        }
      });

      const [deliverCity, setDeliverCity] = React.useState('All cities');
      const [maxPrice, setMaxPrice] = React.useState(30000);
      const [sortBy, setSortBy] = React.useState('featured');
      const [deliverExpanded, setDeliverExpanded] = React.useState(true);
      const [priceExpanded, setPriceExpanded] = React.useState(true);

      const [ordersOpen, setOrdersOpen] = React.useState(false);
      const [wishlistOpen, setWishlistOpen] = React.useState(false);
      const [authOpen, setAuthOpen] = React.useState(false);
      const [upiOpen, setUpiOpen] = React.useState(false);
      const [aiOpen, setAiOpen] = React.useState(false);

      const [paymentMethod, setPaymentMethod] = React.useState('COD');
      const [orderSuccess, setOrderSuccess] = React.useState(false);
      const [orderError, setOrderError] = React.useState('');
      const [upiVerifying, setUpiVerifying] = React.useState(false);
      const [selectedUpiApp, setSelectedUpiApp] = React.useState('GPay');
      const [vpa, setVpa] = React.useState('demo@okhdfcbank');

      const [authTab, setAuthTab] = React.useState('signin');
      const [forgotStep, setForgotStep] = React.useState(0);
      const [authForm, setAuthForm] = React.useState({ name: '', email: '', password: '', otp: '' });

      const [newsletterEmail, setNewsletterEmail] = React.useState('');
      const [newsletterSaved, setNewsletterSaved] = React.useState(false);
      const [aiInput, setAiInput] = React.useState('');
      const [aiMessages, setAiMessages] = React.useState([
        { id: 1, sender: 'bot', text: 'Hi! Ask me for recommendations under â‚¹2,000, live stock checks, or order tracking.', product: INITIAL_PRODUCTS[0] },
      ]);

      const [form, setForm] = React.useState({
        customer_name: 'Aditi Sharma',
        user_email: 'demo@storesync.in',
        phone: '+91 98450 12345',
        street: '42 Indiranagar 100 Feet Road',
        customer_city: 'Bengaluru',
        pin: '560038',
      });

      const searchRef = React.useRef(null);

      React.useEffect(() => {
        const onKeyDown = (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            searchRef.current?.focus();
          }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
      }, []);

      React.useEffect(() => {
        const timer = window.setTimeout(() => {
          if (!query.trim()) {
            setProducts(INITIAL_PRODUCTS);
            return;
          }
          fetch(`/api/search?q=${encodeURIComponent(query)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (Array.isArray(data?.products)) setProducts(data.products);
            })
            .catch(() => {});
        }, 250);
        return () => window.clearTimeout(timer);
      }, [query]);

      const bagCount = cart.reduce((sum, i) => sum + i.quantity, 0);
      const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const deliveryFee = subtotal >= 2499 || subtotal === 0 ? 0 : 99;
      const total = subtotal + deliveryFee;

      const handleSelectCategory = (catId) => {
        setActiveCategory(catId);
        if (catId === 'Home') {
          setView('home');
        } else {
          setView('shop');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      const clearFilters = () => {
        setActiveCategory('All');
        setDeliverCity('All cities');
        setMaxPrice(30000);
        setQuery('');
        setSortBy('featured');
      };

      const addToBag = (product) => {
        if (product.stock <= 0) return;
        setCart((prev) => {
          const existing = prev.find((x) => x.id === product.id);
          if (existing) {
            return prev.map((x) => (x.id === product.id ? { ...x, quantity: Math.min(product.stock, x.quantity + 1) } : x));
          }
          return [...prev, { ...product, quantity: 1 }];
        });
      };

      const updateCartQty = (id, delta) => {
        setCart((prev) =>
          prev.map((x) =>
            x.id === id
              ? { ...x, quantity: Math.max(1, Math.min(x.stock || 99, x.quantity + delta)) }
              : x
          )
        );
      };

      const removeFromCart = (id) => {
        setCart((prev) => prev.filter((x) => x.id !== id));
      };

      const toggleWishlist = (id) => {
        setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      };

      const finalizeOrder = async (method) => {
        setOrderError('');
        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_name: form.customer_name,
              customer_city: form.customer_city,
              payment_method: method,
              user_email: form.user_email,
              items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity, price: i.price })),
            }),
          });
          if (res.status === 409) {
            setOrderError('OUT_OF_STOCK: One or more items just sold out.');
            return;
          }
        } catch (_) {}

        setOrders((prev) => [
          {
            id: `ST-${Math.floor(4830 + Math.random() * 90)}`,
            created_at: 'Just now',
            payment_method: method,
            status: 'CONFIRMED',
            total_amount: total,
            items: cart.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
          },
          ...prev,
        ]);
        setOrderSuccess(true);
      };

      const handleAuthSubmit = async (e) => {
        e.preventDefault();
        if (forgotStep === 1) {
          try { await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: authForm.email }) }); } catch (_) {}
          setForgotStep(2);
          return;
        }
        if (forgotStep === 2) {
          try { await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: authForm.email, otp: authForm.otp, password: authForm.password }) }); } catch (_) {}
          setForgotStep(0);
        } else {
          const ep = authTab === 'signin' ? '/api/auth/login' : '/api/auth/signup';
          try { await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authForm) }); } catch (_) {}
        }
        const profile = { name: authForm.name || 'Aditi Sharma', email: authForm.email || 'demo@storesync.in' };
        try { window.localStorage.setItem('storesync_user', JSON.stringify(profile)); } catch (_) {}
        setUser(profile);
        setAuthOpen(false);
      };

      const handleGoogleAuth = async () => {
        try { await fetch('/api/auth/google', { method: 'POST' }); } catch (_) {}
        const profile = { name: 'Aditi Sharma', email: 'aditi@gmail.com' };
        try { window.localStorage.setItem('storesync_user', JSON.stringify(profile)); } catch (_) {}
        setUser(profile);
        setAuthOpen(false);
      };

      const sendAiMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setAiMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: trimmed }]);
        setAiInput('');
        try {
          const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: trimmed }) });
          if (res.ok) {
            const data = await res.json();
            setAiMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: data.reply || 'Here is what I found:', product: data.products?.[0] }]);
            return;
          }
        } catch (_) {}
        const match = INITIAL_PRODUCTS.find((p) => p.name.toLowerCase().includes(trimmed.toLowerCase())) || INITIAL_PRODUCTS[0];
        setAiMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: `I recommend ${match.name} (${formatINR(match.price)}) â€” ${match.stock} units in stock.`, product: match }]);
      };

      const featuredProducts = INITIAL_PRODUCTS.filter((p) => FEATURED_IDS.includes(p.id));

      const shopProducts = products
        .filter((p) => activeCategory === 'Home' || activeCategory === 'All' || p.category === activeCategory)
        .filter((p) => deliverCity === 'All cities' || (p.cities || []).includes(deliverCity))
        .filter((p) => p.price <= maxPrice)
        .filter((p) => !query.trim() || p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()) || (p.subtitle || '').toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => {
          if (sortBy === 'price-asc') return a.price - b.price;
          if (sortBy === 'price-desc') return b.price - a.price;
          if (sortBy === 'rating') return b.rating - a.rating;
          return a.id - b.id;
        });

      const wishedProducts = INITIAL_PRODUCTS.filter((p) => wishlist.includes(p.id));

      return (
        <div id="top" className="min-h-screen flex flex-col bg-light-surface text-light-on-surface">
          {/* 1. Top Announcement Bar */}
          <div className="bg-forest text-white px-gutter-lg py-2 text-center font-label text-label-sm">
            <span>âœ³ A little more thoughtful. A lot more you. Complimentary delivery on orders over â‚¹2,499 â†’</span>
          </div>

          {/* 2. Sticky Navigation Bar */}
          <header className="sticky top-0 z-40 border-b border-light-outline-variant bg-light-surface/95 backdrop-blur-md">
            <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-gutter-md px-gutter-lg py-3 lg:px-page-margin" aria-label="Main navigation">
              <div className="flex items-center gap-gutter-lg">
                <a
                  href="#top"
                  onClick={(e) => { e.preventDefault(); handleSelectCategory('Home'); }}
                  className="flex shrink-0 items-center gap-gutter-sm"
                >
                  <span className="flex w-9 h-9 items-center justify-center rounded-full bg-forest text-white font-headline text-label-lg shadow-sm">
                    st
                  </span>
                  <span className="font-headline text-title-lg text-light-on-surface tracking-tight">storesync.</span>
                </a>

                <div className="hidden xl:flex items-center gap-gutter-md">
                  {NAV_CATEGORIES.map((c) => {
                    const isActive = (view === 'home' && c.id === 'Home') || (view === 'shop' && activeCategory === c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCategory(c.id)}
                        className={`font-label text-label-md transition-colors duration-state-change ${
                          isActive ? 'text-light-primary font-semibold' : 'text-light-on-surface-variant hover:text-light-on-surface'
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="order-3 xl:order-none relative w-full xl:max-w-xs flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-light-on-surface-variant flex items-center">
                  <LucideIcon name="search" className="w-4 h-4" />
                </span>
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (view !== 'shop') {
                      setActiveCategory('All');
                      setView('shop');
                    }
                  }}
                  placeholder="Search Bluetooth, Watch, Saree... â†µ"
                  className="h-10 w-full rounded-full border border-light-outline-variant bg-light-surface-container-low pl-10 pr-14 font-body text-body-sm text-light-on-surface outline-none focus:border-light-primary focus:bg-white"
                  aria-label="Search products"
                />
                <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-light-outline-variant bg-white px-1.5 py-0.5 font-mono text-label-sm text-light-on-surface-variant sm:block">
                  âŒ˜ K
                </kbd>
              </label>

              <div className="flex shrink-0 items-center gap-gutter-sm">
                <button
                  type="button"
                  onClick={() => setOrdersOpen(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white border border-light-outline-variant px-3 font-label text-label-md text-light-on-surface hover:border-light-primary"
                >
                  <LucideIcon name="package" className="w-4 h-4 text-light-primary" />
                  <span>Orders</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWishlistOpen(true)}
                  aria-label="Wishlist"
                  className="relative flex w-10 h-10 items-center justify-center rounded-full bg-white border border-light-outline-variant text-light-on-surface hover:border-light-primary"
                >
                  <LucideIcon name="heart" className="w-4 h-4" />
                  <span className="absolute -right-1 -top-1 flex w-[18px] h-[18px] items-center justify-center rounded-full bg-light-primary font-label text-label-sm text-light-on-primary tabular-nums">
                    {wishlist.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setOrderSuccess(false); setView('cart'); }}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-forest px-3.5 font-label text-label-md text-white shadow-sm hover:bg-forest-dark"
                >
                  <LucideIcon name="shopping-bag" className="w-4 h-4" />
                  <span>Bag {bagCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white border border-light-outline-variant px-3.5 font-label text-label-md text-light-on-surface hover:border-light-primary"
                >
                  <LucideIcon name="user-round" className="w-4 h-4" />
                  <span>{user ? user.name.split(' ')[0] : 'Sign In'}</span>
                </button>
              </div>
            </nav>
          </header>

          <main className="flex-1 mx-auto w-full max-w-7xl px-gutter-lg py-gutter-xl lg:px-page-margin flex flex-col gap-section">
            {view === 'home' ? (
              <>
                {/* 1. Dual Hero Editorial Showcase */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-stretch">
                  <div className="lg:col-span-6 rounded-3xl bg-white border border-light-outline-variant shadow-sm p-gutter-xl flex flex-col justify-between gap-gutter-lg">
                    <div className="flex flex-col items-start gap-gutter-md">
                      <div className="flex flex-wrap items-center justify-between w-full gap-2">
                        <span className="font-label text-label-sm tracking-widest uppercase text-terracotta">
                          â€” MADE FOR THE WAY YOU LIVE
                        </span>
                        <span className="rounded-full bg-light-surface-container-low border border-light-outline-variant px-3 py-1 font-label text-label-sm text-light-on-surface">
                          GOOD CHOICES FEEL GOOD âœ§
                        </span>
                      </div>

                      <h1 className="font-headline text-display-lg-mobile md:text-display-lg text-light-on-surface text-balance" data-design-text-token="display-lg">
                        Good tech. <span className="text-terracotta">Better living.</span>
                      </h1>

                      <p className="font-body text-body-lg text-light-on-surface-variant max-w-prose">
                        The little things that make every day feel a little more like yours.
                      </p>

                      <button
                        type="button"
                        onClick={() => handleSelectCategory('All')}
                        className="inline-flex h-12 items-center gap-2 rounded-xl bg-forest px-6 font-label text-label-lg text-white shadow-md hover:bg-forest-dark"
                      >
                        <span>Explore the edit â†’</span>
                      </button>
                    </div>

                    <p className="font-mono text-label-sm text-light-on-surface-variant border-t border-light-outline-variant pt-3">
                      01 â€” Thoughtfully picked for everyday India
                    </p>
                  </div>

                  <div className="lg:col-span-6 rounded-3xl bg-white border border-light-outline-variant shadow-sm p-gutter-xl flex flex-col justify-between gap-gutter-md">
                    <div className="flex flex-col items-start gap-gutter-sm">
                      <span className="font-mono text-label-sm uppercase tracking-widest text-light-primary">
                        THE EVERYDAY EDIT VOL. 01 / 26
                      </span>
                      <h2 className="font-headline text-headline-lg text-light-on-surface">
                        Find your kind of <span className="italic">good.</span>
                      </h2>
                      <p className="font-body text-body-md text-light-on-surface-variant">
                        A considered collection of things that work beautifully and make the everyday feel special.
                      </p>
                      <button
                        type="button"
                        onClick={() => addToBag(INITIAL_PRODUCTS[0])}
                        className="inline-flex items-center gap-1 font-label text-label-lg text-terracotta hover:underline"
                      >
                        <span>Meet your new favourite â†—</span>
                      </button>
                    </div>

                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-light-surface-container-low border border-light-outline-variant">
                      <img src="https://lh3.googleusercontent.com/aida/ALJJyrAcmtx_HvulKGW6C60RaNV1snwQTiSYfmvG7MSyu-lHt8NBQ17Kes_9CZTtN3uJb64vn_ZoHXTH4LNRVAFnE_AIiKYPnfnECoywxRcPFrjotFAzGet63o7nG_kCwL-kIREQgy333Dl3ugRpLSQdAXxWmQ5GO6pPvDsRizsYc55cBDnH7n7dPNvfYm-nzdEqEFXObE3RW25tbZjLYPrVHReKkteaQ1SFUaDs7IUJYpKih7TnYl5p" alt="Warm cordless floor lamp showcase" className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 border border-light-outline-variant px-3 py-1.5 font-label text-label-sm text-light-on-surface">
                        Made for the moments in between. â†“
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. Promise Strip */}
                <section className="rounded-2xl bg-white border border-light-outline-variant px-gutter-lg py-4 grid grid-cols-2 lg:grid-cols-4 gap-gutter-md text-center font-label text-label-md text-light-on-surface">
                  <div>Free delivery over â‚¹2,499</div>
                  <div>Easy 7-day returns</div>
                  <div>Thoughtfully picked</div>
                  <div>Shipping across India</div>
                </section>

                {/* 3. Category Mood Tiles */}
                <section className="flex flex-col gap-gutter-lg">
                  <div>
                    <p className="font-label text-label-sm uppercase tracking-widest text-terracotta">MOOD TILES</p>
                    <h2 className="mt-1 font-headline text-headline-md text-light-on-surface">What are you in the mood for?</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-lg">
                    {MOOD_TILES.map((tile) => (
                      <a
                        key={tile.name}
                        href="#catalog-section"
                        onClick={(e) => { e.preventDefault(); handleSelectCategory(tile.name); }}
                        className={`${tile.bg} rounded-2xl border border-light-outline-variant p-gutter-lg flex flex-col justify-between gap-gutter-lg hover:border-forest transition-colors duration-state-change`}
                      >
                        <div className="flex items-center justify-between font-mono text-title-md text-light-on-surface">
                          <span>{tile.num}</span>
                          <span>{tile.glyph}</span>
                        </div>
                        <div>
                          <h3 className="font-headline text-title-lg text-light-on-surface">{tile.name}</h3>
                          <p className="font-body text-body-sm text-light-on-surface-variant mt-1">{tile.detail}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>

                {/* 4. Featured Finds Grid */}
                <section id="catalog-section" className="flex flex-col gap-gutter-lg">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <p className="font-label text-label-sm uppercase tracking-widest text-terracotta">FEATURED FINDS</p>
                      <h2 className="mt-1 font-headline text-headline-md text-light-on-surface">
                        A few very good finds.
                      </h2>
                    </div>
                    <button type="button" onClick={() => handleSelectCategory('All')} className="font-label text-label-lg text-terracotta hover:underline">
                      View all ({INITIAL_PRODUCTS.length}) â†’
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-lg">
                    {featuredProducts.map((p) => {
                      const wished = wishlist.includes(p.id);
                      return (
                        <article key={p.id} className="rounded-2xl bg-white border border-light-outline-variant shadow-sm p-gutter-md flex flex-col justify-between gap-gutter-md">
                          <div className="flex flex-col gap-gutter-sm">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`rounded-full px-2.5 py-0.5 font-label text-label-sm ${p.stock === 1 ? 'bg-light-on-surface text-light-surface' : 'bg-light-surface-container-low text-light-on-surface border border-light-outline-variant'}`}>
                                {p.tag}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleWishlist(p.id)}
                                aria-label={`Wishlist ${p.name}`}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center ${wished ? 'border-terracotta bg-blush text-terracotta' : 'border-light-outline-variant bg-light-surface text-light-on-surface-variant'}`}
                              >
                                <LucideIcon name="heart" className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="aspect-[4/3] rounded-xl bg-light-surface-container-low overflow-hidden">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>

                            <div>
                              <p className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant">{p.category}</p>
                              <h3 className="font-title text-title-md text-light-on-surface mt-0.5">{p.name}</h3>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 pt-2 border-t border-light-outline-variant">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-title-md font-semibold tabular-nums">{formatINR(p.price)}</span>
                              <span className="font-body text-body-sm text-light-on-surface-variant tabular-nums">â˜… {p.rating} ({p.reviews})</span>
                            </div>
                            <button
                              type="button"
                              disabled={p.stock <= 0}
                              onClick={() => addToBag(p)}
                              className="h-10 rounded-xl bg-forest text-white font-label text-label-md hover:bg-forest-dark disabled:bg-light-surface-container disabled:text-light-on-surface-variant"
                            >
                              + Quick add
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                {/* 5. Story Manifesto Band */}
                <section className="rounded-3xl bg-white border border-light-outline-variant shadow-sm p-gutter-xl lg:p-section grid grid-cols-1 lg:grid-cols-12 gap-gutter-xl items-center">
                  <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-light-outline-variant aspect-[4/3]">
                    <img src="https://lh3.googleusercontent.com/aida/ALJJyrA0lXoJf6yncuNdsrQbt_gtqpi6ord-g3aca6c1kpCpHC9nS9Vt0SWK9bp3r_PTVQt9xQ2VpN9otVbwbmDvYkJVBiH6hJHjNKa57bDeZVREQAdzUXmlwHj8A89uG2U2mVBcLBJkJrl1rinEmhfKt-4Lf_rc8gyYR2AemmITXftjizy8qK6mjjqgyxihQIhJVltum6Q40EO55OnJ-5SLqfTqIcfuHajtD7NLLIMSMZVZgOFsbu1uqt6A6g" alt="Flat-lay workspace essentials" className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-terracotta text-white px-3.5 py-1.5 font-label text-label-sm shadow-sm">
                      Less, but <span className="italic">lovelier.</span>
                    </span>
                  </div>

                  <div className="lg:col-span-7 flex flex-col items-start gap-gutter-md">
                    <span className="font-label text-label-sm uppercase tracking-widest text-terracotta">OUR MANIFESTO</span>
                    <h2 className="font-headline text-headline-lg text-light-on-surface text-balance">
                      Not more things. Better things.
                    </h2>
                    <p className="font-body text-body-lg text-light-on-surface-variant max-w-prose text-pretty">
                      Every object we carry earns its place on your desk, in your wardrobe, or around your homeâ€”crafted to age gracefully and dispatched directly from Bengaluru, Mumbai, Delhi, and Hyderabad.
                    </p>
                    <p className="font-mono text-label-md text-light-on-surface">â€” the storesync team</p>
                  </div>
                </section>

                {/* 6. Newsletter Section */}
                <section className="rounded-3xl bg-light-surface-container-low border border-light-outline-variant p-gutter-xl flex flex-col md:flex-row md:items-center justify-between gap-gutter-lg pb-gutter-xl">
                  <div className="max-w-lg">
                    <p className="font-label text-label-sm uppercase tracking-widest text-terracotta">THE SUNDAY NOTE</p>
                    <h2 className="mt-1 font-headline text-headline-md text-light-on-surface">Good things are worth sharing.</h2>
                    <p className="font-body text-body-md text-light-on-surface-variant mt-1">
                      Small-batch drops, restock alerts, and studio notesâ€”once a week.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => { e.preventDefault(); if (newsletterEmail.trim()) setNewsletterSaved(true); }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-gutter-sm w-full md:w-auto"
                  >
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterSaved(false); }}
                      placeholder="demo@storesync.in"
                      aria-label="Newsletter email"
                      className="h-12 w-full sm:w-64 rounded-xl border border-light-outline-variant bg-white px-4 font-body text-body-md text-light-on-surface focus:border-forest focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="h-12 px-6 rounded-xl bg-forest text-white font-label text-label-lg hover:bg-forest-dark shrink-0"
                    >
                      {newsletterSaved ? 'Youâ€™re in âœ“' : 'Count me in â†’'}
                    </button>
                  </form>
                </section>
              </>
            ) : view === 'shop' ? (
              /* VIEW 1: CATALOG & SHOP WITH LEFT FILTER SIDEBAR */
              <section className="flex flex-col gap-gutter-xl pb-gutter-xl">
                <div className="flex flex-col gap-gutter-md border-b border-light-outline-variant pb-gutter-lg">
                  <span className="font-label text-label-sm uppercase tracking-widest text-terracotta">
                    A LITTLE OF WHAT YOU LOVE
                  </span>
                  <div className="flex flex-wrap items-center gap-gutter-md">
                    <h1 className="font-headline text-display-lg-mobile md:text-display-lg text-light-on-surface">
                      {activeCategory === 'All' || activeCategory === 'Home' ? 'The good finds.' : `${activeCategory}.`}
                    </h1>
                    <span className="rounded-full bg-light-surface-container-low border border-light-outline-variant px-3 py-1 font-mono text-label-sm text-light-on-surface">
                      {shopProducts.length} GOOD THINGS AND COUNTING
                    </span>
                  </div>
                  <p className="font-body text-body-lg text-light-on-surface-variant max-w-2xl">
                    Thoughtful tech and everyday pieces, picked to fit real life.
                  </p>

                  <div className="relative max-w-2xl">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-light-on-surface-variant flex items-center">
                      <LucideIcon name="search" className="w-4 h-4" />
                    </span>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Looking for something? Try 'bluetooth', 'watch', 'saree'..."
                      aria-label="Catalog search"
                      className="h-12 w-full rounded-xl border border-light-outline-variant bg-light-surface-container-low pl-11 pr-12 font-body text-body-md text-light-on-surface focus:border-light-primary focus:bg-white focus:outline-none"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-light-outline-variant flex items-center justify-center text-light-on-surface-variant hover:text-light-on-surface"
                      >
                        âœ•
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="font-mono text-label-sm text-light-on-surface-variant">
                      Showing {shopProducts.length} finds Â· Aiven OpenSearch
                    </p>
                    <label className="inline-flex items-center gap-2 font-label text-label-md text-light-on-surface">
                      <span>Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-9 rounded-lg border border-light-outline-variant bg-white px-3 font-label text-label-md text-light-on-surface focus:border-light-primary focus:outline-none"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-xl items-start">
                  {/* Left Filter Sidebar */}
                  <aside className="lg:col-span-3 rounded-2xl bg-white border border-light-outline-variant shadow-sm p-gutter-lg flex flex-col gap-gutter-lg">
                    <div className="flex items-center justify-between border-b border-light-outline-variant pb-3">
                      <h2 className="font-headline text-title-lg text-light-on-surface">Filters</h2>
                      <button type="button" onClick={clearFilters} className="font-label text-label-sm text-terracotta hover:underline">
                        Clear all
                      </button>
                    </div>

                    {/* Category Radios */}
                    <div className="flex flex-col gap-2.5 border-b border-light-outline-variant pb-gutter-md">
                      <p className="font-label text-label-md font-semibold text-light-on-surface">Category</p>
                      {[
                        { id: 'All', label: 'All finds', count: INITIAL_PRODUCTS.length },
                        { id: 'Electronics', label: 'Electronics', count: INITIAL_PRODUCTS.filter((p) => p.category === 'Electronics').length },
                        { id: 'Fashion', label: 'Fashion', count: INITIAL_PRODUCTS.filter((p) => p.category === 'Fashion').length },
                        { id: 'Home & Kitchen', label: 'Home & Kitchen', count: INITIAL_PRODUCTS.filter((p) => p.category === 'Home & Kitchen').length },
                        { id: 'Accessories', label: 'Accessories', count: INITIAL_PRODUCTS.filter((p) => p.category === 'Accessories').length },
                      ].map((cat) => {
                        const checked = activeCategory === cat.id || (activeCategory === 'Home' && cat.id === 'All');
                        return (
                          <label key={cat.id} className="flex items-center justify-between cursor-pointer py-1">
                            <span className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name="catalog-category"
                                checked={checked}
                                onChange={() => setActiveCategory(cat.id)}
                                className="text-forest focus:ring-forest"
                              />
                              <span className={`font-body text-body-sm ${checked ? 'font-semibold text-light-on-surface' : 'text-light-on-surface-variant'}`}>
                                {cat.label}
                              </span>
                            </span>
                            <span className="font-mono text-label-sm text-light-on-surface-variant tabular-nums">
                              ({String(cat.count).padStart(2, '0')})
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Deliver to */}
                    <div className="flex flex-col gap-2.5 border-b border-light-outline-variant pb-gutter-md">
                      <button
                        type="button"
                        onClick={() => setDeliverExpanded((v) => !v)}
                        className="flex items-center justify-between font-label text-label-md font-semibold text-light-on-surface"
                      >
                        <span>Deliver to</span>
                        <span className="font-mono text-label-md">{deliverExpanded ? 'âˆ’' : '+'}</span>
                      </button>
                      {deliverExpanded && (
                        <>
                          <select
                            value={deliverCity}
                            onChange={(e) => setDeliverCity(e.target.value)}
                            aria-label="Deliver to city"
                            className="h-10 rounded-xl border border-light-outline-variant bg-light-surface-container-low px-3 font-body text-body-sm text-light-on-surface focus:border-forest focus:outline-none"
                          >
                            <option value="All cities">All cities</option>
                            <option value="Bengaluru">Bengaluru</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Hyderabad">Hyderabad</option>
                          </select>
                          <p className="font-body text-label-sm text-light-on-surface-variant">
                            Availability shown across India.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Price range */}
                    <div className="flex flex-col gap-2.5 border-b border-light-outline-variant pb-gutter-md">
                      <button
                        type="button"
                        onClick={() => setPriceExpanded((v) => !v)}
                        className="flex items-center justify-between font-label text-label-md font-semibold text-light-on-surface"
                      >
                        <span>Price range</span>
                        <span className="font-mono text-label-md">{priceExpanded ? 'âˆ’' : '+'}</span>
                      </button>
                      {priceExpanded && (
                        <>
                          <input
                            type="range"
                            min={1000}
                            max={30000}
                            step={500}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            aria-label="Maximum price"
                            className="w-full accent-forest cursor-pointer"
                          />
                          <div className="flex items-center justify-between font-mono text-label-sm text-light-on-surface-variant tabular-nums">
                            <span>â‚¹1,000</span>
                            <span>Up to â‚¹{maxPrice.toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Sticky Note */}
                    <div className="rounded-xl bg-light-surface-container-low border border-light-outline-variant p-3.5 flex items-start gap-2.5">
                      <LucideIcon name="sparkles" className="w-4 h-4 text-terracotta mt-0.5" />
                      <p className="font-body text-body-sm text-light-on-surface">
                        Thoughtfully picked. Never overwhelming.
                      </p>
                    </div>
                  </aside>

                  {/* Product Grid */}
                  <div className="lg:col-span-9">
                    {shopProducts.length === 0 ? (
                      <div className="rounded-2xl bg-white border border-light-outline-variant p-gutter-xl text-center flex flex-col items-center gap-3">
                        <p className="font-headline text-title-lg">No matching finds</p>
                        <p className="font-body text-body-md text-light-on-surface-variant">Try adjusting your city, price range, or search keywords.</p>
                        <button type="button" onClick={clearFilters} className="h-10 px-5 rounded-xl bg-forest text-white font-label text-label-md">
                          Reset all filters
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter-lg">
                        {shopProducts.map((p) => {
                          const wished = wishlist.includes(p.id);
                          return (
                            <article key={p.id} className="rounded-2xl bg-white border border-light-outline-variant shadow-sm p-gutter-md flex flex-col justify-between gap-gutter-md">
                              <div className="flex flex-col gap-gutter-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`rounded-full px-2.5 py-0.5 font-label text-label-sm ${p.stock === 1 ? 'bg-light-on-surface text-light-surface' : 'bg-light-surface-container-low text-light-on-surface border border-light-outline-variant'}`}>
                                    {p.tag}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleWishlist(p.id)}
                                    aria-label={`Wishlist ${p.name}`}
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center ${wished ? 'border-terracotta bg-blush text-terracotta' : 'border-light-outline-variant bg-light-surface text-light-on-surface-variant'}`}
                                  >
                                    <LucideIcon name="heart" className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="aspect-[4/3] rounded-xl bg-light-surface-container-low overflow-hidden">
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                </div>

                                <div>
                                  <p className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant">{p.category}</p>
                                  <h3 className="font-title text-title-md text-light-on-surface mt-0.5">{p.name}</h3>
                                  <p className="font-body text-body-sm text-light-on-surface-variant mt-0.5">{p.subtitle}</p>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 pt-2 border-t border-light-outline-variant">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-title-md font-semibold tabular-nums">{formatINR(p.price)}</span>
                                  <span className="font-body text-body-sm text-light-on-surface-variant tabular-nums">â˜… {p.rating} ({p.reviews})</span>
                                </div>
                                <button
                                  type="button"
                                  disabled={p.stock <= 0}
                                  onClick={() => addToBag(p)}
                                  className="h-10 rounded-xl bg-forest text-white font-label text-label-md hover:bg-forest-dark disabled:bg-light-surface-container disabled:text-light-on-surface-variant"
                                >
                                  + Quick add
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : view === 'cart' ? (
              /* VIEW 2: CART PAGE ("Your bag.") */
              <section className="flex flex-col gap-gutter-xl pb-gutter-xl">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-light-outline-variant pb-4">
                  <div>
                    <p className="font-label text-label-sm uppercase tracking-widest text-terracotta">GOOD THINGS, GATHERED</p>
                    <h1 className="mt-1 font-headline text-display-lg-mobile md:text-display-lg text-light-on-surface">
                      Your bag. <span className="font-mono text-title-lg text-light-on-surface-variant">({bagCount})</span>
                    </h1>
                  </div>
                </div>

                {cart.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-light-outline-variant p-gutter-xl text-center flex flex-col items-center gap-4">
                    <h2 className="font-headline text-headline-md">Your bag is empty</h2>
                    <p className="font-body text-body-md text-light-on-surface-variant">Discover thoughtful tech, handloom drapes, and studio essentials.</p>
                    <button type="button" onClick={() => handleSelectCategory('All')} className="h-11 px-6 rounded-xl bg-forest text-white font-label text-label-lg">
                      Explore the catalog â†’
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-xl items-start">
                    {/* Left Column â€” Your Finds List */}
                    <div className="lg:col-span-7 flex flex-col gap-gutter-md">
                      <div className="flex items-center justify-between border-b border-light-outline-variant pb-2 font-label text-label-sm uppercase tracking-widest text-light-on-surface-variant">
                        <span>YOUR FINDS ({bagCount})</span>
                        <span>SUBTOTAL</span>
                      </div>

                      <div className="flex flex-col divide-y divide-light-outline-variant bg-white rounded-2xl border border-light-outline-variant p-gutter-lg shadow-sm">
                        {cart.map((item) => (
                          <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4 min-w-0">
                              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-light-surface-container-low shrink-0" />
                              <div className="min-w-0 flex flex-col gap-1">
                                <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant">{item.category}</span>
                                <h3 className="font-title text-title-md text-light-on-surface">{item.name}</h3>
                                <p className="font-body text-body-sm text-light-on-surface-variant">{item.subtitle || item.variant}</p>
                                <div className="mt-2 flex items-center gap-4">
                                  <div className="inline-flex items-center gap-2 rounded-lg border border-light-outline-variant bg-light-surface px-2.5 py-1">
                                    <button type="button" onClick={() => updateCartQty(item.id, -1)} aria-label="Decrease quantity" className="w-5 text-center font-mono">-</button>
                                    <span className="font-mono text-label-md tabular-nums">{item.quantity}</span>
                                    <button
                                      type="button"
                                      disabled={item.quantity >= (item.stock || 99)}
                                      onClick={() => updateCartQty(item.id, 1)}
                                      aria-label="Increase quantity"
                                      className="w-5 text-center font-mono disabled:opacity-40"
                                    >+</button>
                                  </div>
                                  <button type="button" onClick={() => removeFromCart(item.id)} className="font-label text-label-sm text-terracotta hover:underline">
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                            <span className="font-mono text-title-md font-semibold text-light-on-surface tabular-nums self-end sm:self-center">
                              {formatINR(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button type="button" onClick={() => handleSelectCategory('All')} className="self-start font-label text-label-md text-light-primary hover:underline pt-2">
                        â† Keep looking around
                      </button>
                    </div>

                    {/* Right Column â€” Order Summary Card */}
                    <aside className="lg:col-span-5 rounded-2xl bg-white border border-light-outline-variant shadow-sm p-gutter-lg flex flex-col gap-4">
                      <div>
                        <p className="font-label text-label-sm uppercase tracking-widest text-terracotta">A LITTLE RECAP</p>
                        <h2 className="mt-1 font-headline text-headline-md text-light-on-surface">Order summary</h2>
                      </div>

                      <div className="border-t border-light-outline-variant pt-3 flex flex-col gap-2 text-body-md">
                        <div className="flex justify-between">
                          <span className="text-light-on-surface-variant">Subtotal</span>
                          <span className="font-mono tabular-nums">{formatINR(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-light-on-surface-variant">Delivery</span>
                          <span className="font-mono">{deliveryFee === 0 ? 'Complimentary' : formatINR(deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between font-headline text-headline-md pt-3 border-t border-light-outline-variant">
                          <span>Total</span>
                          <span className="font-mono tabular-nums">{formatINR(total)}</span>
                        </div>
                      </div>

                      <p className="font-body text-body-sm text-light-on-surface-variant">
                        All taxes included. A promise we intend to keep.
                      </p>

                      <button
                        type="button"
                        onClick={() => { setOrderSuccess(false); setView('checkout'); }}
                        className="h-12 w-full rounded-xl bg-forest text-white font-label text-label-lg shadow-md hover:bg-forest-dark"
                      >
                        Continue to checkout â†’
                      </button>

                      <div className="rounded-xl bg-light-surface-container-low border border-light-outline-variant p-3.5 flex flex-col gap-1.5 font-body text-body-sm text-light-on-surface-variant">
                        <p>âœ“ Aiven PostgreSQL ACID transaction &amp; Kafka streaming.</p>
                        <p>ðŸšš Easy delivery Â· â± 7-day returns</p>
                      </div>
                    </aside>
                  </div>
                )}
              </section>
            ) : (
              /* VIEW 3: CHECKOUT PAGE ("Let's make it yours.") */
              <section className="flex flex-col gap-gutter-xl pb-gutter-xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-light-outline-variant pb-4">
                  <div>
                    <button type="button" onClick={() => setView('cart')} className="font-label text-label-sm text-light-primary hover:underline mb-2">â† Return to your bag</button>
                    <p className="font-label text-label-sm uppercase tracking-widest text-terracotta">ALMOST AT THE GOOD PART</p>
                    <h1 className="font-headline text-display-lg-mobile md:text-display-lg text-light-on-surface">
                      {orderSuccess ? <>Thank you, <span className="text-light-primary">{form.customer_name.split(' ')[0]}.</span></> : <>Let&apos;s make it <span className="text-light-primary">yours.</span></>}
                    </h1>
                  </div>
                  <ol className="flex items-center gap-3 font-label text-label-sm">
                    <li className="text-light-primary">âœ“ Bag</li>
                    <li>/</li>
                    <li className={orderSuccess ? 'text-light-on-surface-variant' : 'text-light-primary font-semibold'}>02 Details</li>
                    <li>/</li>
                    <li className={orderSuccess ? 'text-light-primary font-semibold' : 'text-light-on-surface-variant'}>03 Done</li>
                  </ol>
                </div>

                {orderError && <div className="rounded-xl bg-white border border-error p-3 text-error font-body text-body-sm">{orderError}</div>}

                {orderSuccess ? (
                  <div className="rounded-2xl bg-white border border-light-outline-variant p-gutter-xl max-w-xl flex flex-col items-start gap-4">
                    <h2 className="font-headline text-headline-md">Order Confirmed!</h2>
                    <p className="font-body text-body-md text-light-on-surface-variant">Receipt sent to {form.user_email}. Delivery to {form.customer_city} in 3â€“5 business days.</p>
                    <button type="button" onClick={() => setOrdersOpen(true)} className="h-11 px-5 rounded-xl bg-forest text-white font-label text-label-lg">Track Order â†’</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-xl items-start">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (paymentMethod === 'UPI') setUpiOpen(true);
                        else finalizeOrder(paymentMethod);
                      }}
                      className="lg:col-span-7 flex flex-col gap-gutter-xl"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter-md">
                        <input required placeholder="Full Name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="sm:col-span-2 h-11 rounded-xl border-0 bg-light-surface-container-low px-3.5" />
                        <input required type="email" placeholder="Email" value={form.user_email} onChange={(e) => setForm({ ...form, user_email: e.target.value })} className="h-11 rounded-xl border-0 bg-light-surface-container-low px-3.5" />
                        <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11 rounded-xl border-0 bg-light-surface-container-low px-3.5" />
                        <input required placeholder="Street Address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="sm:col-span-2 h-11 rounded-xl border-0 bg-light-surface-container-low px-3.5" />
                        <select value={form.customer_city} onChange={(e) => setForm({ ...form, customer_city: e.target.value })} className="h-11 rounded-xl border-0 bg-light-surface-container-low px-3.5">
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Hyderabad">Hyderabad</option>
                        </select>
                        <input required maxLength={6} placeholder="PIN Code" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} className="h-11 rounded-xl border-0 bg-light-surface-container-low px-3.5 font-mono" />
                      </div>

                      <div className="flex flex-col gap-3">
                        {PAYMENT_METHODS.map((m) => (
                          <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)} className={`w-full text-left rounded-xl border p-gutter-md flex items-center justify-between ${paymentMethod === m.id ? 'border-light-primary bg-light-primary-container/60 ring-2 ring-light-primary/20' : 'border-light-outline-variant bg-white'}`}>
                            <div className="flex items-center gap-3">
                              <LucideIcon name={m.icon} className="w-5 h-5 text-light-primary" />
                              <div>
                                <p className="font-title text-title-md">{m.title}</p>
                                <p className="font-body text-body-sm text-light-on-surface-variant">{m.subtitle}</p>
                              </div>
                            </div>
                            {m.badge && <span className="rounded-full bg-light-primary-container px-2.5 py-0.5 font-label text-label-sm text-light-on-primary-container">{m.badge}</span>}
                          </button>
                        ))}
                        <p className="font-body text-body-sm text-light-on-surface-variant">Strict concurrency: Locked via PostgreSQL FOR UPDATE row locks.</p>
                      </div>

                      <button type="submit" className="h-12 rounded-xl bg-light-primary text-light-on-primary font-label text-label-lg shadow-md hover:bg-indigo-700">
                        Place Order Â· {formatINR(total)} â†’
                      </button>
                    </form>

                    <aside className="lg:col-span-5 rounded-2xl bg-white border border-light-outline-variant shadow-sm p-gutter-lg flex flex-col gap-4">
                      <p className="font-label text-label-sm uppercase tracking-widest text-light-primary">THE GOOD STUFF</p>
                      <h2 className="font-headline text-headline-md">Your order</h2>
                      <ul className="flex flex-col gap-3 divide-y divide-light-outline-variant">
                        {cart.map((item) => (
                          <li key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                              <div className="min-w-0">
                                <p className="font-title text-title-sm truncate">{item.name}</p>
                                <div className="mt-1 inline-flex items-center gap-2 rounded-md border border-light-outline-variant px-2 py-0.5">
                                  <button type="button" onClick={() => updateCartQty(item.id, -1)}>-</button>
                                  <span className="font-mono text-label-sm">{item.quantity}</span>
                                  <button type="button" onClick={() => updateCartQty(item.id, 1)}>+</button>
                                </div>
                              </div>
                            </div>
                            <span className="font-mono font-semibold tabular-nums">{formatINR(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-light-outline-variant pt-3 flex flex-col gap-1.5 text-body-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{formatINR(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Delivery</span><span>{deliveryFee === 0 ? 'Complimentary' : formatINR(deliveryFee)}</span></div>
                        <div className="flex justify-between font-headline text-title-lg pt-2 border-t border-light-outline-variant"><span>Total</span><span>{formatINR(total)}</span></div>
                      </div>
                      <div className="rounded-xl bg-light-surface-container-low px-3.5 py-2.5 flex items-center gap-2 text-body-sm">
                        <LucideIcon name="truck" className="w-4 h-4 text-light-primary" />
                        <span>Estimated delivery in 3â€“5 business days</span>
                      </div>
                    </aside>
                  </div>
                )}
              </section>
            )}
          </main>

          {/* Persistent Deep Forest Green Site Footer & Architecture Status Ribbon */}
          <footer className="bg-forest text-white">
            <div className="mx-auto max-w-7xl px-gutter-lg py-gutter-xl lg:px-page-margin grid grid-cols-1 md:grid-cols-12 gap-gutter-xl border-b border-white/15">
              <div className="md:col-span-4 flex flex-col gap-gutter-sm">
                <div className="flex items-center gap-2">
                  <span className="flex w-8 h-8 items-center justify-center rounded-full bg-white text-forest font-headline text-label-md">st</span>
                  <span className="font-headline text-title-lg tracking-tight text-white">storesync.</span>
                </div>
                <p className="font-body text-body-sm text-white/80 max-w-sm">
                  Good tech. Better living. Thoughtful finds for everyday India.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  {['ig', 'p', 'in'].map((soc) => (
                    <span key={soc} className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center font-mono text-label-sm text-white/90">
                      {soc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <p className="font-label text-label-sm uppercase tracking-widest text-white/70">Explore</p>
                {[
                  { id: 'All', label: 'Shop all' },
                  { id: 'Electronics', label: 'Electronics' },
                  { id: 'Fashion', label: 'Fashion' },
                  { id: 'Home & Kitchen', label: 'Home & Kitchen' },
                  { id: 'Accessories', label: 'Accessories' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className="text-left font-body text-body-sm text-white/85 hover:text-white"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="md:col-span-3 flex flex-col gap-2">
                <p className="font-label text-label-sm uppercase tracking-widest text-white/70">Orders &amp; Help</p>
                <button type="button" onClick={() => setOrdersOpen(true)} className="text-left font-body text-body-sm text-white/85 hover:text-white">My Orders</button>
                <button type="button" onClick={() => setWishlistOpen(true)} className="text-left font-body text-body-sm text-white/85 hover:text-white">Wishlist</button>
                <button type="button" onClick={() => setView('cart')} className="text-left font-body text-body-sm text-white/85 hover:text-white">Shipping &amp; delivery</button>
                <button type="button" onClick={() => setAiOpen(true)} className="text-left font-body text-body-sm text-white/85 hover:text-white">Returns &amp; exchanges</button>
              </div>

              <div className="md:col-span-3 flex flex-col gap-2">
                <p className="font-label text-label-sm uppercase tracking-widest text-white/70">A NOTE FROM US</p>
                <p className="font-body text-body-sm text-white/80">
                  Good things should fit into your life, not the other way around. Dispatched from Bengaluru, Mumbai, Delhi, and Hyderabad.
                </p>
                <button type="button" onClick={() => handleSelectCategory('Home')} className="text-left font-label text-label-sm text-white hover:underline pt-1">
                  A little more about us â†—
                </button>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-gutter-lg py-gutter-md lg:px-page-margin flex flex-col sm:flex-row items-center justify-between gap-2 font-body text-body-sm text-white/80">
              <span>Â© 2026 StoreSync Studio Â· Aiven PostgreSQL connected Â· Kafka connected Â· OpenSearch connected Â· Made for everyday India â™¥</span>
            </div>

            <div className="bg-forest-dark px-gutter-lg py-2 text-center font-mono text-label-sm text-white/85 border-t border-white/10">
              â–  Aiven PS1 Â· StoreSync Â· PostgreSQL ACID Locks Â· Apache Kafka Stream Â· OpenSearch Fuzzy Search
            </div>
          </footer>

          {/* Orders Drawer */}
          {ordersOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Orders Drawer">
              <div className="w-full max-w-md bg-light-surface h-full overflow-y-auto p-gutter-lg flex flex-col gap-4 border-l border-light-outline-variant">
                <div className="flex items-center justify-between border-b border-light-outline-variant pb-3">
                  <h2 className="font-headline text-title-lg">My Orders &amp; Tracking</h2>
                  <button type="button" onClick={() => setOrdersOpen(false)} aria-label="Close"><LucideIcon name="x" className="w-4 h-4" /></button>
                </div>
                {orders.map((o) => {
                  const idx = ORDER_STEPS.indexOf(o.status);
                  return (
                    <article key={o.id} className="rounded-2xl bg-white border border-light-outline-variant p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-semibold">Order #{o.id}</span>
                        <span className="rounded-full bg-light-primary-container px-2.5 py-0.5 font-label text-label-sm text-light-on-primary-container">{o.status}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center font-label text-label-sm">
                        {ORDER_STEPS.map((st, i) => (
                          <div key={st} className={i <= idx ? 'text-light-primary font-semibold' : 'text-light-on-surface-variant'}>
                            {i <= idx ? 'âœ“ ' : `${i + 1}. `}{STEP_LABELS[i]}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                          <button type="button" onClick={() => setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: ORDER_STEPS[Math.min(3, idx + 1)] } : x))} className="h-8 px-3 rounded-lg bg-forest text-white font-label text-label-sm">Advance Status â†’</button>
                        )}
                        <button type="button" onClick={() => setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: 'CANCELLED' } : x))} className="h-8 px-3 rounded-lg border border-light-outline-variant font-label text-label-sm">Cancel Order</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wishlist Drawer */}
          {wishlistOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Wishlist Drawer">
              <div className="w-full max-w-md bg-light-surface h-full overflow-y-auto p-gutter-lg flex flex-col gap-4 border-l border-light-outline-variant">
                <div className="flex items-center justify-between border-b border-light-outline-variant pb-3">
                  <h2 className="font-headline text-title-lg">Saved Finds ({wishedProducts.length})</h2>
                  <button type="button" onClick={() => setWishlistOpen(false)} aria-label="Close"><LucideIcon name="x" className="w-4 h-4" /></button>
                </div>
                {wishedProducts.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-white border border-light-outline-variant p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-title text-title-sm truncate">{item.name}</p>
                        <p className="font-mono text-label-sm">{formatINR(item.price)} Â· {item.stock} left</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => { addToBag(item); toggleWishlist(item.id); }} className="h-8 px-3 rounded-lg bg-forest text-white font-label text-label-sm">Move to Bag</button>
                      <button type="button" onClick={() => toggleWishlist(item.id)} className="h-8 px-2.5 rounded-lg border border-light-outline-variant font-label text-label-sm text-terracotta">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exact User Authentication Modal */}
          {authOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Authentication">
              <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 flex flex-col gap-4 border border-light-outline-variant">
                <div className="flex items-center justify-between border-b border-light-outline-variant pb-3">
                  <h2 className="font-headline text-title-lg text-forest">
                    {forgotStep > 0 ? 'Reset Password' : authTab === 'signin' ? 'Sign In to StoreSync' : 'Create an Account'}
                  </h2>
                  <button type="button" onClick={() => { setAuthOpen(false); setForgotStep(0); }} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-light-surface">
                    âœ•
                  </button>
                </div>

                {forgotStep === 0 && (
                  <div className="grid grid-cols-2 border-b border-light-outline-variant">
                    <button
                      type="button"
                      onClick={() => setAuthTab('signin')}
                      className={`pb-2.5 text-sm ${authTab === 'signin' ? 'border-b-2 border-forest text-forest font-semibold' : 'text-gray-500 font-medium'}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthTab('signup')}
                      className={`pb-2.5 text-sm ${authTab === 'signup' ? 'border-b-2 border-forest text-forest font-semibold' : 'text-gray-500 font-medium'}`}
                    >
                      Create Account
                    </button>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                  {authTab === 'signup' && forgotStep === 0 && (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="mName" className="text-xs font-bold uppercase tracking-wider text-gray-600">FULL NAME</label>
                      <input id="mName" required value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder="e.g. Aditi Sharma" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="mEmail" className="text-xs font-bold uppercase tracking-wider text-gray-600">EMAIL ADDRESS</label>
                    <input id="mEmail" required type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder="demo@storesync.in" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
                  </div>

                  {forgotStep === 2 && (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="mOtp" className="text-xs font-bold uppercase tracking-wider text-gray-600">6-DIGIT OTP (Demo: 482910)</label>
                      <input id="mOtp" required value={authForm.otp} onChange={(e) => setAuthForm({ ...authForm, otp: e.target.value })} placeholder="482910" className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-mono" />
                    </div>
                  )}

                  {forgotStep !== 1 && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="mPass" className="text-xs font-bold uppercase tracking-wider text-gray-600">PASSWORD</label>
                        {authTab === 'signin' && forgotStep === 0 && (
                          <button type="button" onClick={() => setForgotStep(1)} className="text-xs font-semibold text-terracotta hover:underline">
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <input id="mPass" required type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
                    </div>
                  )}

                  <button type="submit" className="w-full bg-forest hover:bg-forest-dark text-white py-3.5 rounded-lg font-semibold text-sm transition-colors duration-state-change">
                    {forgotStep === 1 ? 'Send OTP' : forgotStep === 2 ? 'Reset & Sign In' : authTab === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                {forgotStep === 0 && (
                  <>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="flex-1 border-t border-gray-200" />
                      <span>OR</span>
                      <div className="flex-1 border-t border-gray-200" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="w-full bg-white border border-gray-300 rounded-lg py-3 text-sm font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50"
                    >
                      <GoogleLogoSVG />
                      <span>Continue with Google</span>
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      Demo credentials: demo@storesync.in / Demo@1234
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* UPI Modal */}
          {upiOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Pay via UPI">
              <div className="w-full max-w-md rounded-2xl bg-white border border-light-outline-variant shadow-2xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-light-outline-variant pb-3">
                  <h2 className="font-headline text-title-lg text-forest">Instant Wallet / UPI</h2>
                  <button type="button" onClick={() => setUpiOpen(false)} aria-label="Close"><LucideIcon name="x" className="w-4 h-4" /></button>
                </div>

                <div className="rounded-xl bg-light-surface-container-low border border-light-outline-variant p-3 flex items-center justify-between">
                  <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant">Amount to pay</span>
                  <span className="font-mono text-title-lg font-semibold text-forest tabular-nums">{formatINR(total)}</span>
                </div>

                <div className="flex flex-col items-center gap-2 rounded-xl border border-light-outline-variant bg-light-surface p-4">
                  <svg viewBox="0 0 120 120" className="w-28 h-28 text-forest" aria-label="UPI QR Code">
                    <rect width="120" height="120" fill="#FFFFFF" rx="8" />
                    <rect x="10" y="10" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="20" y="20" width="10" height="10" fill="currentColor" />
                    <rect x="80" y="10" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="90" y="20" width="10" height="10" fill="currentColor" />
                    <rect x="10" y="80" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="20" y="90" width="10" height="10" fill="currentColor" />
                    <path d="M50 14h10v10H50zm15 10h10v10H65zM50 48h20v20H50zm30 20h14v14H80zM50 82h14v14H50zm28 12h24v12H78z" fill="currentColor" />
                  </svg>
                  <span className="font-mono text-label-sm text-light-on-surface-variant">Scan with any UPI app Â· {selectedUpiApp}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSelectedUpiApp(app)}
                      className={`rounded-full px-3 py-1 font-label text-label-sm border ${
                        selectedUpiApp === app ? 'bg-forest text-white border-forest' : 'bg-white text-light-on-surface border-light-outline-variant'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>

                <input value={vpa} onChange={(e) => setVpa(e.target.value)} aria-label="UPI VPA" placeholder="username@okhdfcbank" className="h-11 rounded-xl border border-light-outline-variant bg-light-surface-container-low px-3.5 font-mono text-body-sm" />

                <button
                  type="button"
                  onClick={() => {
                    setUpiVerifying(true);
                    window.setTimeout(() => {
                      setUpiVerifying(false);
                      setUpiOpen(false);
                      finalizeOrder('UPI');
                    }, 1200);
                  }}
                  className="h-11 rounded-xl bg-light-primary text-light-on-primary font-label text-label-lg hover:bg-indigo-700"
                >
                  {upiVerifying ? 'Verifying UPI...' : `Verify & Pay ${formatINR(total)}`}
                </button>
              </div>
            </div>
          )}

          {/* StoreSync AI Floating Assistant */}
          <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
            {aiOpen && (
              <section aria-label="StoreSync AI" className="w-[340px] sm:w-[370px] rounded-2xl bg-white border border-light-outline-variant shadow-xl overflow-hidden flex flex-col">
                <div className="bg-forest text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LucideIcon name="sparkles" className="w-4 h-4" />
                    <span className="font-title text-title-sm">StoreSync AI</span>
                  </div>
                  <button type="button" onClick={() => setAiOpen(false)} aria-label="Close StoreSync AI"><LucideIcon name="x" className="w-4 h-4" /></button>
                </div>
                <div className="p-3 max-h-[260px] overflow-y-auto bg-light-surface flex flex-col gap-2">
                  {aiMessages.map((m) => (
                    <div key={m.id} className={`flex flex-col gap-1.5 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 font-body text-body-sm ${m.sender === 'user' ? 'bg-forest text-white' : 'bg-white border border-light-outline-variant text-light-on-surface'}`}>
                        {m.text}
                      </div>
                      {m.product && (
                        <div className="w-full rounded-xl bg-white border border-light-outline-variant p-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={m.product.image} alt={m.product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            <div className="min-w-0">
                              <p className="font-title text-label-md truncate">{m.product.name}</p>
                              <p className="font-mono text-label-sm text-light-primary tabular-nums">{formatINR(m.product.price)}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => addToBag(m.product)} className="shrink-0 rounded-lg bg-forest px-2.5 py-1 font-label text-label-sm text-white">+ Quick add</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); sendAiMessage(aiInput); }} className="p-2.5 bg-white border-t border-light-outline-variant flex gap-2">
                  <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Ask about products or stock..." className="flex-1 h-9 rounded-full border border-light-outline-variant bg-light-surface-container-low px-3 font-body text-body-sm" />
                  <button type="submit" aria-label="Send" className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center shrink-0"><LucideIcon name="send" className="w-4 h-4" /></button>
                </form>
              </section>
            )}
            <button type="button" onClick={() => setAiOpen((v) => !v)} className="inline-flex h-12 items-center gap-2 rounded-full bg-forest px-5 font-label text-label-lg text-white shadow-lg hover:bg-forest-dark">
              <LucideIcon name="sparkles" className="w-4 h-4" />
              <span>{aiOpen ? 'Close StoreSync AI' : 'Ask StoreSync AI'}</span>
            </button>
          </div>
        </div>
      );
    }

export default StoresyncSPA;
