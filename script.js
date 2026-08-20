// --- 1. Product Database ---
// १. हा आता रिकामा राहील, कारण डेटा थेट डेटाबेसमधून येईल
let allProducts = []; 

// २. पेज लोड झाल्यावर डेटाबेसमधून प्रॉडक्ट्स आणणे
window.onload = async () => {
    try {
       // cache: "no-store" मुळे ब्राउझर जुना डेटा वापरणार नाही, दरवेळी नवीन प्रॉडक्ट्स आणेल
const response = await fetch("https://kokanvarsa-backend.admin-craftee.workers.dev/products", { cache: "no-store" });
        const dbProducts = await response.json();

        // डेटाबेसमधून आलेला डेटा तुझ्या जुन्या डिझाईनच्या फॉरमॅटमध्ये सेट करणे
        allProducts = dbProducts.map(p => ({
            id: p.id,
            name: p.name,
            cat: "All", 
            price: p.price,
            unit: "१ किलो / डझन", 
            rating: 5.0,
            img: p.image_url,
            badge: p.stock_status === "In Stock" ? "उपलब्ध" : "Out of Stock"
        }));

        // तुझे जुने फंक्शन्स वापरून प्रॉडक्ट्स स्क्रीनवर दाखवणे
        renderProductsList("homeProductsContainer", allProducts);
        renderProductsList("shopProductsContainer", allProducts);

    } catch (error) {
        console.error("प्रॉडक्ट्स लोड करताना एरर आला:", error);
        document.getElementById("homeProductsContainer").innerHTML = "<p style='color:red;'>प्रॉडक्ट्स लोड होऊ शकले नाहीत. इंटरनेट तपासा!</p>";
    }
};
  

let cartArray = [];

function navigate(pageId) {
  document
    .querySelectorAll(".page-section")
    .forEach((page) => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  const navLinks = document.querySelectorAll("#nav-menu a");
  navLinks.forEach((link) => link.classList.remove("active"));
  if (pageId === "home") navLinks[0].classList.add("active");
  if (pageId === "shop") navLinks[1].classList.add("active");
  if (pageId === "about") navLinks[2].classList.add("active");

  if (pageId === "cart") renderCartItems();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- Generate Product Card ---
function generateProductCard(product) {
    return `
        <div class="product-card">
            <div class="card-header">
                <h3 class="product-title">${product.name}</h3>
                <div class="badge-tag">${product.badge}</div>
            </div>
            <div class="product-img-wrapper">
                <img src="${product.img}" alt="${product.name}">
            </div>
            <div class="rating">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
            </div>
            
            <!-- किंमत आणि प्रमाण (Unit) दाखवण्यासाठी इथे बदल केला आहे -->
            <p class="product-price">
                ₹${product.price} 
                <span style="font-size: 14px; color: var(--gray-text); font-weight: 500;">/ ${product.unit}</span>
            </p>
            
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i> कार्टमध्ये जोडा
            </button>
        </div>
    `;
}


function renderProductsList(containerId, productsToRender) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  productsToRender.forEach(
    (p) => (container.innerHTML += generateProductCard(p)),
  );
}

function filterProducts(category, element) {
  document
    .querySelectorAll(".category-list li")
    .forEach((li) => li.classList.remove("active"));
  element.classList.add("active");
  let filtered =
    category === "All"
      ? allProducts
      : allProducts.filter((p) => p.cat === category);
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
    container.innerHTML =
      '<p style="color:#888; text-align:center; padding: 30px;">तुमचे कार्ट रिकामे आहे. <br><br> <button onclick="navigate(\'shop\')" class="btn-orange">खरेदी करा</button></p>';
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
                    </div>
                </div>
                <div class="cart-item-price">
                    <span style="font-size: 16px; color: var(--primary-color);">₹${item.price}</span>
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
    alert(
      "तुमच्या कार्टमध्ये कोणतीही उत्पादने नाहीत! कृपया आधी उत्पादने जोडा.",
    );
    event.preventDefault();
    return;
  }

  let detailsString = cartArray
    .map((item, idx) => `${idx + 1}. ${item.name} (₹${item.price})`)
    .join(" || ");
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

document.getElementById("searchInput").addEventListener("input", function (e) {
  const term = e.target.value.toLowerCase();
  if (term.length > 0) navigate("shop");
  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(term),
  );
  renderProductsList("shopProductsContainer", filtered);
});




// फॉर्म सबमिट झाल्यावर काय व्हायला पाहिजे याचा कोड
document.getElementById("orderForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // फॉर्म आपोआप रिफ्रेश होण्यापासून थांबवण्यासाठी

    // बटन डिसेबल करा जेणेकरून ग्राहक दोनदा क्लिक करणार नाही
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = "ऑर्डर प्रोसेस होत आहे... ⏳";
    submitBtn.disabled = true;

    // फॉर्ममधील डेटा गोळा करणे
    const formData = new FormData(this);

    try {
        // तुझ्या Cloudflare Backend ला डेटा पाठवणे
        const response = await fetch("https://kokanvarsa-backend.admin-craftee.workers.dev/order", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // ऑर्डर यशस्वी झाल्यावर ग्राहकाला Razorpay च्या पेमेंट पेजवर पाठवा
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
