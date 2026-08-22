let allProducts = []; 

window.onload = async () => {
    try {
        const response = await fetch("https://kokanvarsa-backend.admin-craftee.workers.dev/products", { cache: "no-store" });
        const dbProducts = await response.json();

        allProducts = dbProducts.map(p => ({
            id: p.id,
            name: p.name,
            cat: p.category || "All", 
            price: p.price,
            unit: p.unit || "१ नग", 
            rating: 5.0,
            img: p.image_url,
            badge: p.stock_status === "In Stock" ? "उपलब्ध" : "Out of Stock"
        }));

        renderProductsList("homeProductsContainer", allProducts);
        renderProductsList("shopProductsContainer", allProducts);

    } catch (error) {
        console.error("प्रॉडक्ट्स लोड करताना एरर आला:", error);
        document.getElementById("homeProductsContainer").innerHTML = "<p style='color:red;'>प्रॉडक्ट्स लोड होऊ शकले नाहीत. इंटरनेट तपासा!</p>";
    }
};

let cartArray = [];

function navigate(pageId) {
    document.querySelectorAll(".page-section").forEach((page) => page.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");

    const navLinks = document.querySelectorAll("#nav-menu a");
    navLinks.forEach((link) => link.classList.remove("active"));
    if (pageId === "home") navLinks[0].classList.add("active");
    if (pageId === "shop") navLinks[1].classList.add("active");
    if (pageId === "about") navLinks[2].classList.add("active");
    if (pageId === "contact") {}; // optional

    if (pageId === "cart") renderCartItems();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// नवीन प्रोफेशनल डिझाईननुसार कार्ड जनरेट करणे
function generateProductCard(product) {
    return `
        <div class="product-card">
            <div class="card-img-wrap">
                <img src="${product.img}" alt="${product.name}">
                <div class="badge-tag">${product.badge}</div>
            </div>
            <div class="card-body">
                <h3 class="product-title">${product.name}</h3>
                <div class="rating">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
                </div>
                <p class="product-price">
                    ₹${product.price} 
                    <span style="font-size: 13px; color: var(--gray-text); font-weight: 500;">/ ${product.unit}</span>
                </p>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
}

function renderProductsList(containerId, productsToRender) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    if(productsToRender.length === 0) {
        container.innerHTML = "<p style='color:gray;'>येथे कोणतीही उत्पादने नाहीत.</p>";
        return;
    }
    productsToRender.forEach((p) => (container.innerHTML += generateProductCard(p)));
}

function filterProducts(category, element) {
    document.querySelectorAll(".category-list li").forEach((li) => li.classList.remove("active"));
    element.classList.add("active");
    let filtered = category === "All" ? allProducts : allProducts.filter((p) => p.cat === category);
    renderProductsList("shopProductsContainer", filtered);
}

function addToCart(productId) {
    const product = allProducts.find((p) => p.id === productId);
    cartArray.push(product);

    document.getElementById("cartBadge").textContent = cartArray.length;
    showToast(`<b>${product.name}</b> कार्टमध्ये जोडले गेले!`);
}

function renderCartItems() {
    const container = document.getElementById("cartItemsRenderArea");
    const totalUI = document.getElementById("cartTotalUI");

    if (cartArray.length === 0) {
        container.innerHTML = '<p style="color:#888; text-align:center; padding: 30px;">तुमचे कार्ट रिकामे आहे. <br><br> <button onclick="navigate(\'shop\')" class="btn-banner">खरेदी करा</button></p>';
        totalUI.textContent = "₹0";
        return;
    }

    let html = "";
    let totalAmount = 0;

    cartArray.forEach((item, index) => {
        totalAmount += item.price;
        html += `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <img src="${item.img}" alt="${item.name}">
                    <div>
                        <h4 style="margin: 0; font-size: 16px; color: var(--dark-text);">${item.name}</h4>
                        <small style="color:var(--gray-text);">₹${item.price} / ${item.unit}</small>
                    </div>
                </div>
                <div class="cart-item-price">
                    <span style="font-size: 16px; color: var(--primary); font-weight:bold;">₹${item.price}</span>
                    <button class="remove-btn" onclick="removeFromCart(${index})" title="काढून टाका">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    totalUI.textContent = "₹" + totalAmount;
}

function removeFromCart(index) {
    cartArray.splice(index, 1);
    document.getElementById("cartBadge").textContent = cartArray.length;
    renderCartItems();
}

function prepareOrderData() {
    if (cartArray.length === 0) {
        alert("तुमच्या कार्टमध्ये कोणतीही उत्पादने नाहीत! कृपया आधी उत्पादने जोडा.");
        event.preventDefault();
        return;
    }

    let detailsString = cartArray.map((item, idx) => `${idx + 1}. ${item.name} (${item.unit}) - ₹${item.price}`).join(" || ");
    let total = cartArray.reduce((sum, item) => sum + item.price, 0);

    document.getElementById("hiddenOrderDetails").value = detailsString;
    document.getElementById("hiddenTotalAmount").value = "₹" + total;
}

function showToast(message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// सर्च करण्यासाठी
document.getElementById("searchInput").addEventListener("input", function (e) {
    const term = e.target.value.toLowerCase();
    if (term.length > 0) navigate("shop");
    const filtered = allProducts.filter((p) => p.name.toLowerCase().includes(term));
    renderProductsList("shopProductsContainer", filtered);
});

// ऑर्डर फॉर्म सबमिट झाल्यावर
document.getElementById("orderForm").addEventListener("submit", async function(event) {
    event.preventDefault(); 

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = "ऑर्डर प्रोसेस होत आहे... ⏳";
    submitBtn.disabled = true;

    const formData = new FormData(this);

    try {
        const response = await fetch("https://kokanvarsa-backend.admin-craftee.workers.dev/order", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            window.location.href = "https://rzp.io/rzp/iOUTiNYy"; 
        } else {
            alert("ऑर्डर नोंदवताना काहीतरी अडचण आली. कृपया पुन्हा प्रयत्न करा.");
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        alert("सर्व्हरशी संपर्क होऊ शकला नाही. इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा!");
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});
