// ==========================================
// 1. Global Data Storage
// ==========================================
let allProducts = [];
let cart = [];

// ==========================================
// 2. Theme (Night Mode) Logic
// ==========================================
function toggleNightMode() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    const nightBtns = document.querySelectorAll('#nightModeBtn');
    nightBtns.forEach(btn => {
        btn.innerText = isDark ? "☀️" : "🌙";
    });
}

(function checkSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        window.addEventListener('DOMContentLoaded', () => {
            const nightBtns = document.querySelectorAll('#nightModeBtn');
            nightBtns.forEach(btn => { btn.innerText = "☀️"; });
        });
    }
})();

// ==========================================
// 3. Products Fetch & Render Logic 
// ==========================================
async function fetchAndRenderProducts() {
    try {
        const SUPABASE_KEY = "sb_secret_WFKQT1D2V6gBQgqvIwREug_GV0mypoo"; 

        let response = await fetch('https://atafmexkgyqalxbrexju.supabase.co/rest/v1/products?select=*', {
            headers: {
                'apikey': SUPABASE_KEY, 
                'Authorization': 'Bearer ' + SUPABASE_KEY 
            }
        });
        
        if(response.ok) {
            let data = await response.json();
            allProducts = data; 
            renderProducts(allProducts);
        }
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

function renderProducts(products) {
    const container = document.getElementById('shopProductsContainer');
    if(!container) return; 
    
    container.innerHTML = "";
    if(products.length === 0) {
        container.innerHTML = "<p>कोणतीही उत्पादने उपलब्ध नाहीत.</p>";
        return;
    }
    
    products.forEach(p => {
        let stockText = p.stock_status || "उपलब्ध";
        container.innerHTML += `
            <div class="product-card">
                <div class="stock-badge"><i class="fas fa-check-circle"></i> ${stockText}</div>
                <div class="product-img-wrap">
                    <img src="${p.image_url || 'default.jpg'}" alt="${p.name}">
                </div>
                <div class="product-info">
                    <h4 class="product-title">${p.name}</h4>
                    <small style="color:gray; font-weight:500;">${p.unit || '१ नग'}</small>
                    <div class="product-price">₹${p.price}</div>
                    <button class="btn-cart" onclick="addToCart(${p.id})">
                        <i class="fas fa-cart-plus"></i> कार्टमध्ये जोडा
                    </button>
                </div>
            </div>
        `;
    });
}

// ==========================================
// 4. Cart Logic
// ==========================================
function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    if(!product) return;
    
    cart.push(product);
    
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => badge.innerText = cart.length);
    
    alert(product.name + ' कार्टमध्ये जोडले गेले!');
    
    renderCart();
}

function renderCart() {
    const cartContainer = document.getElementById('cartItemsContainer');
    if(!cartContainer) return; 
    
    if(cart.length === 0) {
        cartContainer.innerHTML = `<p id="cartEmptyText">कार्ट रिकामे आहे.</p>`;
        document.getElementById('cartTotalPrice').innerText = "0";
        return;
    }

    cartContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
        total += Number(item.price);
        cartContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <span>${item.name}</span>
                <span>₹${item.price}</span>
            </div>
        `;
    });

    const totalPriceElement = document.getElementById('cartTotalPrice');
    if(totalPriceElement) totalPriceElement.innerText = total;
}

// ==========================================
// 5. Initialize on Page Load
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const productContainer = document.getElementById('shopProductsContainer');
    if (productContainer) {
        fetchAndRenderProducts();
    }
});
