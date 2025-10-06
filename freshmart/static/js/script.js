/**
 * script.js
 * Handles interactivity for the FreshMart Grocery Website Template.
 * Version: Includes dynamic Cart Modal Title update.
 * Includes: Mobile Menu, Theme Toggle, Scroll-to-Top,
 * Product Loading (Bestsellers, Shop Page), Filtering/Sorting,
 * Product Detail Modal, Shopping Cart Modal & Functionality.
 * Assumes products.js (with 'products' and 'bestsellerIds' arrays) is loaded first.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        });
    }

    // --- Theme Toggle ---
    const themeToggleBtn = document.querySelector('.theme-toggle-btn');
    if (themeToggleBtn) {
        // Apply saved theme on load
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            let theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
        });
    }

     // --- Scroll-to-Top ---
    const scrollTopBtn = document.querySelector('.scroll-top-btn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==================================
    // CART & MODAL VARIABLES (Corrected & Final)
    // ==================================
    const cartCountSpan = document.querySelector('.cart-count');
    // Cart Modal elements
    const cartModal = document.getElementById('cart-modal');
    const closeCartModalBtn = cartModal ? cartModal.querySelector('.close-modal-btn') : null;
    const cartIcon = document.querySelector('.cart-icon');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSubtotalSpan = document.getElementById('cart-subtotal');
    const cartEmptyMsg = cartModal ? cartModal.querySelector('.cart-empty-msg') : null;
    const cartSummaryDiv = cartModal ? cartModal.querySelector('.cart-summary') : null; // Select the summary container
    const cartActionsDiv = cartModal ? cartModal.querySelector('.cart-actions') : null; // Select the actions container
    const cartModalTitle = cartModal ? cartModal.querySelector('h2') : null; // Select the cart modal title
    // Product Detail Modal elements
    const productDetailModal = document.getElementById('product-detail-modal');
    const closeProductDetailModalBtn = productDetailModal ? productDetailModal.querySelector('.close-modal-btn') : null;
    const productDetailContainer = document.getElementById('product-detail-container');

    let cart = []; // Initialize cart array

    // ==================================
    // CART HELPER FUNCTIONS (LocalStorage, Counter Update)
    // ==================================
    function loadCart() {
        const storedCart = localStorage.getItem('freshmartCart');
        if (storedCart) {
            try {
                cart = JSON.parse(storedCart);
                if (!Array.isArray(cart)) { // Basic validation
                     cart = [];
                     console.warn("Stored cart was not an array, resetting.");
                     localStorage.removeItem('freshmartCart');
                }
                // Ensure quantities are numbers
                cart = cart.map(item => ({ ...item, quantity: parseInt(item.quantity) || 1 }));

            } catch (error) {
                console.error("Error parsing cart from localStorage:", error);
                cart = [];
                localStorage.removeItem('freshmartCart');
            }
        } else {
            cart = [];
        }
        updateCartCounter(); // Update counter after loading/resetting
    }

    function saveCart() {
        try {
            localStorage.setItem('freshmartCart', JSON.stringify(cart));
        } catch (error) {
            console.error("Error saving cart to localStorage:", error);
            // Optionally notify the user that the cart couldn't be saved
        }
    }

    function updateCartCounter() {
        const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0); // Ensure quantity exists
        if (cartCountSpan) {
            cartCountSpan.textContent = totalQuantity;
        }
    }

    // ==================================
    // CORE CART LOGIC FUNCTIONS
    // ==================================
     function addToCart(productId, quantity = 1) {
         if (typeof products === 'undefined') {
            console.error("'products' array not found. Ensure products.js is loaded before script.js.");
            alert("Error: Could not load product data.");
            return;
        }
        const product = products.find(p => p.id === productId);
        if (!product) {
            console.error(`Product with ID ${productId} not found.`);
            return;
        }

        const existingCartItemIndex = cart.findIndex(item => item.id === productId);

        if (existingCartItemIndex > -1) {
            // Item exists, increase quantity
             cart[existingCartItemIndex].quantity = (cart[existingCartItemIndex].quantity || 0) + quantity;
        } else {
            // Add new item
            cart.push({ id: productId, quantity: quantity });
        }

        console.log('Cart updated:', cart);
        updateCartCounter();
        saveCart();

        // Animate cart icon as visual feedback
         const cartIconElement = document.querySelector('.cart-icon i');
        if (cartIconElement) {
            cartIconElement.style.animation = 'tada 0.8s ease';
            setTimeout(() => { cartIconElement.style.animation = ''; }, 800);
        }
        // If the cart modal is open, refresh its content
         if (cartModal && cartModal.classList.contains('open')) {
             displayCartItems();
         }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        console.log(`Item ${productId} removed. Cart:`, cart);
        updateCartCounter();
        saveCart();
        displayCartItems(); // Re-render the cart modal view immediately
    }

    function updateCartItemQuantity(productId, newQuantityInput) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            // Ensure quantity is a number and at least 1
            const newQuantity = Math.max(1, parseInt(newQuantityInput) || 1);
            cart[itemIndex].quantity = newQuantity;

            console.log(`Quantity for ${productId} updated to ${newQuantity}. Cart:`, cart);
            updateCartCounter();
            saveCart();
            displayCartItems(); // Re-render the cart modal view immediately
        }
    }

    // ==================================
    // DISPLAY FUNCTIONS (Cart Modal & Product Detail Modal)
    // ==================================
    function displayCartItems() {
        // Ensure elements and product data are available
        if (!cartItemsContainer || !cartSummaryDiv || !cartActionsDiv || !cartModalTitle || typeof products === 'undefined') {
            console.error("DisplayCartItems: Critical elements (container, summary, actions, title) or products array missing.");
            if (cartModalTitle) cartModalTitle.textContent = "Error";
            if (cartItemsContainer) cartItemsContainer.innerHTML = '<p class="no-products">Error loading cart items.</p>';
            if (cartSummaryDiv) cartSummaryDiv.style.display = 'none';
            if (cartActionsDiv) cartActionsDiv.innerHTML = '';
            return;
        }

        cartItemsContainer.innerHTML = ''; // Clear previous items
        let subtotal = 0;

        if (cart.length === 0) {
            // --- Cart is Empty ---
            cartModalTitle.textContent = "Cart is Empty!";   // SET EMPTY TITLE
            if (cartEmptyMsg) {
                 cartEmptyMsg.textContent = 'Your cart is empty.';
                 cartEmptyMsg.style.display = 'block'; // Show empty message paragraph
            }
            if (cartSummaryDiv) {
                cartSummaryDiv.style.display = 'none'; // Hide subtotal section
            }

            // Replace checkout button with "Shop Now" link
            if (cartActionsDiv) {
                 cartActionsDiv.innerHTML = `<a href="shop.html" class="btn btn-primary shop-now-link-btn">Shop Now</a>`;
                 // Optional: Add listener to close modal when "Shop Now" is clicked
                 const shopNowBtn = cartActionsDiv.querySelector('.shop-now-link-btn');
                 if (shopNowBtn && cartModal) {
                    shopNowBtn.addEventListener('click', () => {
                        cartModal.classList.remove('open');
                        document.body.style.overflow = '';
                    }, { once: true });
                 }
            }

        } else {
            // --- Cart has Items ---
            cartModalTitle.textContent = "Shopping Cart"; // RESTORE DEFAULT TITLE
            if (cartEmptyMsg) {
                cartEmptyMsg.style.display = 'none'; // Hide empty message paragraph
            }
             if (cartSummaryDiv) {
                 cartSummaryDiv.style.display = 'block'; // Show subtotal section
             }

            cart.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const itemQuantity = item.quantity || 0;
                    const itemTotal = product.price * itemQuantity;
                    subtotal += itemTotal;
                    const cartItemElement = document.createElement('div');
                    cartItemElement.classList.add('cart-item');
                    cartItemElement.dataset.productId = item.id;

                    // Simplified item structure
                    cartItemElement.innerHTML = `
                        <img src="${product.imageSrc}" alt="">
                        <div class="item-details">
                            <span class="item-name"></span>
                            <span class="item-price"></span>
                        </div>
                        <div class="item-quantity">
                            <button class="quantity-change" data-change="-1" aria-label="Decrease quantity">-</button>
                            <input type="number" value="${itemQuantity}" min="1" class="quantity-input" aria-label="Item quantity">
                            <button class="quantity-change" data-change="1" aria-label="Increase quantity">+</button>
                        </div>
                        <span class="item-total"></span>
                        <button class="remove-from-cart-btn" aria-label="Remove item"><i class="fa-solid fa-trash-can"></i></button>
                    `;
                    cartItemElement.querySelector('img').alt = product.name;
                    cartItemElement.querySelector('.item-name').textContent = product.name;
                    cartItemElement.querySelector('.item-price').textContent = `$${product.price.toFixed(2)}${product.unit || ''}`;
                    cartItemElement.querySelector('.item-total').textContent = `$${itemTotal.toFixed(2)}`;
                    cartItemsContainer.appendChild(cartItemElement);
                } else {
                     console.warn(`Product details not found for cart item ID: ${item.id}. Item skipped.`);
                }
            });

             // Update subtotal display
             if (cartSubtotalSpan) {
                cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
             }

            // Ensure the button is the "Proceed to Checkout" button
            if (cartActionsDiv) {
                 cartActionsDiv.innerHTML = `<button class="btn btn-primary checkout-btn">Proceed to Checkout</button>`;
            }
        }
    }

    function displayProductDetail(productId) {
        if (typeof products === 'undefined' || !productDetailContainer || !productDetailModal) {
            console.error("Cannot display product detail. Container, modal, or products array missing.");
            return;
        }
        const product = products.find(p => p.id === productId);
        if (!product) {
            console.error(`Product with ID ${productId} not found for detail view.`);
            productDetailContainer.innerHTML = '<p class="no-products">Sorry, product details could not be loaded.</p>';
        } else {
            productDetailContainer.innerHTML = `
                <img src="${product.imageSrc}" alt="" class="product-detail-image">
                <div class="product-detail-info">
                    <h2 class="product-detail-name"></h2>
                    <p class="product-detail-category"></p>
                    <p class="product-detail-price"></p>
                    <p class="product-detail-description"></p>
                    <button class="btn btn-primary add-to-cart-from-detail" data-product-id="${product.id}">Add to Cart</button>
                </div>
            `;
             productDetailContainer.querySelector('.product-detail-image').alt = product.name;
             productDetailContainer.querySelector('.product-detail-name').textContent = product.name;
             productDetailContainer.querySelector('.product-detail-category').textContent = `Category: ${product.category}`;
             productDetailContainer.querySelector('.product-detail-price').textContent = `$${product.price.toFixed(2)}${product.unit || ''}`;
             productDetailContainer.querySelector('.product-detail-description').textContent = product.description || 'No description available.';

             const detailButton = productDetailContainer.querySelector('.add-to-cart-from-detail');
             if (detailButton) {
                 detailButton.textContent = 'Add to Cart';
                 detailButton.disabled = false;
             }
        }
        productDetailModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    // ==================================
    // HELPER: RENDER PRODUCT CARDS ON GRIDS (Card Redesign Applied)
    // ==================================
    function renderProductCardHTML(product) {
        if (!product) return '';
        // Removed description and add-to-cart button from card
        return `
            <div class="product-card" data-id="${product.id}" data-category="${product.category}" data-name="${product.name}" data-price="${product.price}">
                 <img src="${product.imageSrc}" alt="${product.name}">
                 <h3>${product.name}</h3>
                 <p class="price">$${product.price.toFixed(2)}${product.unit ? ` <span>${product.unit}</span>` : ''}</p>
            </div>
        `;
    }

    // ==================================
    // EVENT HANDLERS
    // ==================================

    // --- Product Grid Click Handler (Handles clicks on cards -> Opens Detail Modal) ---
    function handleProductGridClick(event) {
        const productCard = event.target.closest('.product-card');
        if (!productCard) return; // Click wasn't inside a card

        const productId = productCard.dataset.id;
        if (!productId) {
             console.warn("Clicked product card missing data-id attribute.");
             return;
        }

        // Any click within the card now opens details
        console.log(`Card area clicked for ${productId}, opening detail modal.`);
        displayProductDetail(productId);
    }

    // ==================================
    // ATTACHING EVENT LISTENERS & INITIAL RENDERING
    // ==================================

    // --- Homepage Bestseller Logic ---
    const bestsellerGrid = document.getElementById('bestseller-grid');
    if (bestsellerGrid) {
         if (typeof products !== 'undefined' && typeof bestsellerIds !== 'undefined') {
            console.log("Setting up Bestsellers...");
            const bestsellerProducts = bestsellerIds.map(id => products.find(p => p.id === id)).filter(p => p !== undefined);
            bestsellerGrid.innerHTML = bestsellerProducts.length > 0
                ? bestsellerProducts.map(renderProductCardHTML).join('')
                : '<p class="no-products">No bestsellers found.</p>';
            // Attach the grid click handler AFTER rendering
            bestsellerGrid.addEventListener('click', handleProductGridClick);
         } else {
             console.error("Bestseller grid: 'products' or 'bestsellerIds' missing. Load products.js first.");
             bestsellerGrid.innerHTML = '<p class="no-products">Error loading bestseller data.</p>';
         }
    }

    // --- Shop Page Logic ---
    const categoryFilter = document.getElementById('category-filter');
    const sortOptions = document.getElementById('sort-options');
    const productGridShop = document.getElementById('product-grid-shop');
    if (categoryFilter && sortOptions && productGridShop) {
         if (typeof products !== 'undefined') {
            console.log("Setting up Shop Page...");
            // Define display and filter/sort functions locally
            function displayShopProducts(productsToDisplay) {
                if (!productGridShop) return;
                productGridShop.innerHTML = productsToDisplay.length === 0
                    ? '<p class="no-products">No products found matching your criteria.</p>'
                    : productsToDisplay.map(renderProductCardHTML).join(''); // Uses updated card renderer
            }
            const filterAndSortProducts = () => {
                const selectedCategory = categoryFilter.value;
                const selectedSort = sortOptions.value;
                let filtered = products.filter(p => selectedCategory === 'all' || p.category === selectedCategory);
                filtered.sort((a, b) => {
                    const nameA = a.name.toLowerCase(); const nameB = b.name.toLowerCase();
                    const priceA = a.price; const priceB = b.price;
                    switch (selectedSort) {
                        case 'price-asc': return priceA - priceB;
                        case 'price-desc': return priceB - priceA;
                        case 'name-asc': return nameA.localeCompare(nameB);
                        case 'name-desc': return nameB.localeCompare(nameA);
                        default: return 0;
                    }
                });
                displayShopProducts(filtered);
            };
            // Attach listeners and render initial state
            categoryFilter.addEventListener('change', filterAndSortProducts);
            sortOptions.addEventListener('change', filterAndSortProducts);
            filterAndSortProducts(); // Initial render
            // Attach the grid click handler AFTER initial rendering
            productGridShop.addEventListener('click', handleProductGridClick);
         } else {
             console.error("Shop grid: 'products' array missing. Load products.js first.");
             productGridShop.innerHTML = '<p class="no-products">Error loading product data.</p>';
         }
    }

    // --- Modal Open/Close Listeners ---
    // Cart Modal
    if (cartIcon && cartModal && closeCartModalBtn) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            displayCartItems(); // Refresh content
            cartModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
        closeCartModalBtn.addEventListener('click', () => {
            cartModal.classList.remove('open');
            document.body.style.overflow = '';
        });
        cartModal.addEventListener('click', (event) => {
            if (event.target === cartModal) { // Click on background only
                cartModal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }
    // Product Detail Modal
    if (productDetailModal && closeProductDetailModalBtn) {
        closeProductDetailModalBtn.addEventListener('click', () => {
            productDetailModal.classList.remove('open');
            document.body.style.overflow = '';
        });
        productDetailModal.addEventListener('click', (event) => {
            if (event.target === productDetailModal) { // Click on background only
                productDetailModal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Add to Cart from Detail Modal Listener ---
    // This is the only place where addToCart is now triggered by a button click
    if (productDetailContainer) {
        productDetailContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-cart-from-detail')) {
                 const button = event.target;
                 const productId = button.dataset.productId;
                 if (productId) {
                    addToCart(productId, 1);
                    button.textContent = 'Added!';
                    button.disabled = true;
                    // Optional: Reset button state after a delay
                    // setTimeout(() => {
                    //     if (document.body.contains(button)){ // Check if button still exists
                    //         button.textContent = 'Add to Cart';
                    //         button.disabled = false;
                    //     }
                    // }, 1500);
                 } else { console.error("Add button (detail) clicked, but product ID missing."); }
            }
        });
    }

    // --- Cart Item Interactions (Quantity / Remove) Listener ---
     if (cartItemsContainer) {
        // Handles clicks on quantity +/- buttons and remove icon button
        cartItemsContainer.addEventListener('click', (event) => {
            const target = event.target;
            const button = target.closest('button'); // Get the button element if click was on it or inside it (like the icon)
            const cartItemDiv = target.closest('.cart-item');
            if (!cartItemDiv) return;
            const productId = cartItemDiv.dataset.productId;
            if (!productId) return;

            // Quantity Buttons (+/-)
            if (button && button.classList.contains('quantity-change')) {
                const change = parseInt(button.dataset.change);
                const currentQuantityInput = cartItemDiv.querySelector('.quantity-input');
                 if(currentQuantityInput){
                    const currentQuantity = parseInt(currentQuantityInput.value);
                    updateCartItemQuantity(productId, currentQuantity + change); // Let function handle min value
                 }
            }
            // Remove Button (using icon now)
            else if (button && button.classList.contains('remove-from-cart-btn')) {
                 removeFromCart(productId);
            }
        });
         // Handles direct changes to the quantity input field
         cartItemsContainer.addEventListener('change', (event) => {
             const target = event.target;
             if (target.classList.contains('quantity-input')) {
                 const cartItemDiv = target.closest('.cart-item');
                 if (!cartItemDiv) return;
                 const productId = cartItemDiv.dataset.productId;
                 if (!productId) return;
                 updateCartItemQuantity(productId, target.value); // Let function handle validation
             }
         });
     }

     // --- Checkout Button Listener ---
     // Note: This listener is attached to the modal container and relies on the button being present when cart not empty
     if (cartActionsDiv && cartModal) { // Check parent exists
          cartActionsDiv.addEventListener('click', (event) => {
             // Check specifically for the checkout button IF it exists
              if (event.target.classList.contains('checkout-btn')) {
                  if (cart.length > 0) {
                      alert(`Proceeding to checkout with ${cart.length} item type(s)! (Functionality not implemented)`);
                      console.log("Checkout initiated with cart:", JSON.stringify(cart));
                      cartModal.classList.remove('open');
                      document.body.style.overflow = '';
                      // Optional: Clear cart after checkout simulation
                      // cart = []; saveCart(); updateCartCounter(); displayCartItems();
                  } else {
                      // This case shouldn't happen if button is replaced correctly, but good fallback
                      alert('Your cart is empty.');
                  }
              }
              // Note: The 'Shop Now' link has its own temporary listener added in displayCartItems
          });
      }


    // ==================================
    // INITIALIZATION
    // ==================================
    loadCart(); // Load cart from storage FIRST

    // --- Update Footer Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        const currentLocalDate = new Date(); // Get current date in local timezone
        currentYearSpan.textContent = currentLocalDate.getFullYear();
    }

    console.log("FreshMart script fully loaded and initialized (v: Card Redesign + Dynamic Cart Title).");
    console.log("Initial cart state:", cart);

}); // End DOMContentLoaded