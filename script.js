const API_URL = "https://kokanvarsa-backend.admin-craftee.workers.dev";
let allProducts = [];
let cart = [];

window.onload = async () => {
    try {
        const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch (err) {
        document.getElementById('shopProductsContainer').innerHTML = "<p style='color:red;'>डेटा लोड करण्यात त्रुटी आली!</p>";
    }
};

function renderProducts(products) {
    const container = document.getElementById('shopProductsContainer');
    container.innerHTML = "";
    if(products.length === 0) {
        container.innerHTML = "<p>कोणतीही उत्पादने उपलब्ध नाहीत.</p>";
        return;
    }
    products.forEach(p => {
        // उपलब्धता बॅज ठरवणे (In Stock असल्यास 'उपलब्ध')
        let stockText = p.stock_status || "उपलब्ध";

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
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
    });
}

function filterProducts(category, element) {
    document.querySelectorAll('.category-list li').forEach(li => li.classList.remove('active'));
    element.classList.add('active');
    
    if(category === 'All') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

function navigate(pageId) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    const links = document.querySelectorAll('#nav-menu li a');
    links.forEach(l => l.classList.remove('active'));
    
    if(pageId === 'shop') {
        links[0].classList.add('active');
        links[1].classList.add('active');
    } else if(pageId === 'about') {
        links[2].classList.add('active');
    } else if(pageId === 'contact') {
        links[3].classList.add('active');
    }
    
    if(pageId === 'cart') renderCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleSearch(query) {
    const term = query.toLowerCase().trim();
    if(term === "") {
        renderProducts(allProducts);
        return;
    }
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(term));
    renderProducts(filtered);
    navigate('shop');
}

function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    cart.push(product);
    document.getElementById('cartCount').innerText = cart.length;
    alert(product.name + ' कार्टमध्ये जोडले गेले!');
}

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    container.innerHTML = "";
    if(cart.length === 0) {
        container.innerHTML = "<p style='color:gray; text-align:center;'>कार्ट रिकामे आहे.</p>";
        document.getElementById('cartTotalPrice').innerText = "₹0";
        return;
    }
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong style="font-size:15px;">${item.name}</strong> <br>
                    <small style="color:gray;">${item.unit || '१ नग'}</small>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="color:var(--primary); font-weight:bold;">₹${item.price}</span>
                    <button onclick="removeFromCart(${index})" style="background:#ffebee; color:#c62828; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;" title="काढून टाका"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });
    document.getElementById('cartTotalPrice').innerText = "₹" + total;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    document.getElementById('cartCount').innerText = cart.length;
    renderCart();
}

function prepareOrderData() {
    if(cart.length === 0) {
        alert("कार्ट रिकामे आहे!");
        event.preventDefault();
        return;
    }
    let details = cart.map((item, i) => `${i+1}. ${item.name} (${item.unit || '१ नग'}) - ₹${item.price}`).join(" || ");
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('hiddenOrderDetails').value = details;
    document.getElementById('hiddenTotalAmount').value = "₹" + total;
}
