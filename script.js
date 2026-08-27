// Current Language State (Default: Marathi)
let currentLang = 'mr';

// Global Data Storage
let allProducts = [];
let cart = [];

// Dictionary for Translations
const siteTranslations = {
    mr: {
        pageMainHeading: "आमची उत्पादने",
        cartTitle: "तुमचे शॉपिंग कार्ट",
        cartEmpty: "कार्ट रिकामे आहे.",
        totalLabel: "एकूण रक्कम:",
        deliveryInfoHeading: "डिलिव्हरी माहिती व पत्ता",
        namePlaceholder: "तुमचे नाव",
        phonePlaceholder: "१० अंकी मोबाईल नंबर",
        addressPlaceholder: "पत्ता पिनकोडसह",
        orderSubmitBtn: "ऑर्डर कन्फर्म करा व पेमेंट करा",
        addToCartText: "Add to Cart",
        inStockText: "उपलब्ध",
        addedAlert: "कार्टमध्ये जोडले गेले!"
    },
    en: {
        pageMainHeading: "Our Products",
        cartTitle: "Your Shopping Cart",
        cartEmpty: "Cart is empty.",
        totalLabel: "Total Amount:",
        deliveryInfoHeading: "Delivery Info & Address",
        namePlaceholder: "Your Name",
        phonePlaceholder: "10-Digit Mobile Number",
        addressPlaceholder: "Address with Pincode",
        orderSubmitBtn: "Confirm Order & Pay",
        addToCartText: "Add to Cart",
        inStockText: "In Stock",
        addedAlert: "added to cart!"
    }
};

// Toggle Language Function
function toggleLanguage() {
    currentLang = currentLang === 'mr' ? 'en' : 'mr';
    
    // Change Button Text
    const btn = document.getElementById('langBtn');
    if(btn) {
        btn.innerText = currentLang === 'mr' ? 'English' : 'मराठी';
    }
    
    // Dictionary Reference
    const t = siteTranslations[currentLang];
    
    // 1. Home Page Elements
    const heroTitle = document.querySelector('.hero-content h2');
    const heroDesc = document.querySelector('.hero-content p');
    const heroBtn = document.querySelector('.hero-content .btn-banner');
    
    if(heroTitle) heroTitle.innerText = currentLang === 'mr' ? "अस्सल कोकणी चव, थेट तुमच्या दारात!" : "Authentic Kokani Flavor, Right at Your Doorstep!";
    if(heroDesc) heroDesc.innerText = currentLang === 'mr' ? "कोकणच्या मातीतील गोडवा आणि आपुलकी, आता तुमच्या घरी." : "The sweetness and warmth of Kokan's soil, now at your home.";
    if(heroBtn) heroBtn.innerText = currentLang === 'mr' ? "सर्व उत्पादने पहा" : "View All Products";

    // 2. Products & Cart Page Elements
    if(document.getElementById('pageMainHeading')) document.getElementById('pageMainHeading').innerText = t.pageMainHeading;
    if(document.getElementById('cartSectionTitle')) document.getElementById('cartSectionTitle').innerText = t.cartTitle;
    if(document.getElementById('cartEmptyText')) document.getElementById('cartEmptyText').innerText = t.cartEmpty;
    if(document.getElementById('totalLabel')) document.getElementById('totalLabel').innerText = t.totalLabel;
    if(document.getElementById('deliveryInfoHeading')) document.getElementById('deliveryInfoHeading').innerText = t.deliveryInfoHeading;
    
    // Update Form Placeholders
    const nameInput = document.querySelector('input[name="customer_name"]');
    const phoneInput = document.querySelector('input[name="customer_phone"]');
    const addressInput = document.querySelector('textarea[name="customer_address"]');
    const submitBtn = document.getElementById('orderSubmitBtn');
    
    if(nameInput) nameInput.placeholder = t.namePlaceholder;
    if(phoneInput) phoneInput.placeholder = t.phonePlaceholder;
    if(addressInput) addressInput.placeholder = t.addressPlaceholder;
    if(submitBtn) submitBtn.innerText = t.orderSubmitBtn;

    // Re-render products and cart safely
    if(typeof renderProducts === 'function' && allProducts.length > 0) {
        renderProducts(allProducts);
    }
    if(typeof renderCart === 'function') {
        renderCart();
    }
}

// Fetch Products from Supabase (तुमचा मूळ डेटा आणणारा कोड)
async function fetchProducts() {
    try {
        let response = await fetch('https://atafmexkgyqalxbrexju.supabase.co/rest/v1/products?select=*', {
            headers: {
                'apikey': 'ANON_KEY_OR_YOUR_KEY', // तुमची सुपाबेसची की असेल तर ती राहील
                'Authorization': 'Bearer ANON_KEY_OR_YOUR_KEY'
            }
        });
        // किंवा जर तुझी साधी fetch पद्धत असेल तर ती इथे काम करेल. 
        // खाली डमी डेटा ऐवजी तुझा Supabase चे रिस्पॉन्सचा कोड युज कर:
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// 🌟 जर आधीची सुपाबेसची लाईन अशी असेल तर तिची खात्री कर:
async function loadProductsFromSupabase() {
    try {
        let res = await fetch("https://atafmexkgyqalxbrexju.supabase.co/rest/v1/products?select=*", {
            headers: {
                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0YWZtZXhrZ3lxYWx4YnJleGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzg2Mjh9.EXAMPLE_KEY" // तुझी खरी key इथे टाकावी किंवा तुझा जुना URL fetch कोड वापरावा
            }
        });
    } catch(e) {}
}

// Render Products Function
function renderProducts(products) {
    const container = document.getElementById('shopProductsContainer');
    if(!container) return;
    
    container.innerHTML = "";
    if(products.length === 0) {
        container.innerHTML = currentLang === 'mr' ? "<p>कोणतीही उत्पादने उपलब्ध नाहीत.</p>" : "<p>No products available.</p>";
        return;
    }
    
    const t = siteTranslations[currentLang];
    
    products.forEach(p => {
        let stockText = p.stock_status || t.inStockText;

        container.innerHTML += `
            <div class="product-card">
                <div class="stock-badge"><i class="fas fa-check-circle"></i> ${stockText}</div>
                <div class="product-img-wrap">
                    <img src="${p.image_url}" alt="${p.name}">
                </div>
                <div class="product-info">
                    <h4 class="product-title">${p.name}</h4>
                    <small style="color:gray; font-weight:500;">${p.unit || '१ नग'}</small>
                    <div class="product-price">₹${p.price}</div>
                    <button class="btn-cart" onclick="addToCart(${p.id})">
                        <i class="fas fa-cart-plus"></i> ${t.addToCartText}
                    </button>
                </div>
            </div>
        `;
    });
}

// Add to Cart Function
function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    if(!product) return;
    
    cart.push(product);
    
    const badge = document.getElementById('cartCount');
    if(badge) badge.innerText = cart.length;
    
    const t = siteTranslations[currentLang];
    alert(product.name + ' ' + t.addedAlert);
    
    if(typeof renderCart === 'function') {
        renderCart();
    }
}

// Render Cart Function
function renderCart() {
    const cartContainer = document.getElementById('cartItemsContainer');
    if(!cartContainer) return;
    
    if(cart.length === 0) {
        cartContainer.innerHTML = `<p id="cartEmptyText">${siteTranslations[currentLang].cartEmpty}</p>`;
        document.getElementById('cartTotalPrice').innerText = "0";
        return;
    }

    cartContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += Number(item.price);
        cartContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                <span>${item.name}</span>
                <span>₹${item.price}</span>
            </div>
        `;
    });

    document.getElementById('cartTotalPrice').innerText = total;
}
