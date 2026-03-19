document.addEventListener('DOMContentLoaded', () => {
    // Sticky Navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Reveal Animations using Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // --- Mobile Menu Toggle ---
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('open');
            navLinks.classList.remove('active');
        });
    });

    // --- Cart Logic ---
    let cart = [];
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartCount = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const addCartBtns = document.querySelectorAll('.btn-add-cart');

    function toggleCart() {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('active');
    }

    cartIcon.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    function updateCart() {
        // Update count
        cartCount.textContent = cart.length;

        // Render items
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; margin-top: 2rem;">Your cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                total += parseFloat(item.price);
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        ${item.options ? `<p style="font-size: 0.8rem; color: #777; margin-bottom: 0.2rem;">${item.options}</p>` : ''}
                        <p>$${item.price.toFixed(2)}</p>
                        <button class="remove-item" data-index="${index}">Remove</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        // Update total
        cartTotalPrice.textContent = `$${total.toFixed(2)}`;

        // Attach remove listeners
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                cart.splice(idx, 1);
                updateCart();
            });
        });
    }

    // --- Payment Simulation Logic ---
    const checkoutBtn = document.getElementById('checkout-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentBtn = document.getElementById('close-payment');
    const processPayBtn = document.getElementById('process-pay-btn');
    const paymentBody = document.getElementById('payment-body');
    const paymentSuccess = document.getElementById('payment-success');
    const continueShoppingBtn = document.getElementById('continue-shopping');

    // Quick View Elements
    const quickviewModal = document.getElementById('quickview-modal');
    const closeQuickviewBtn = document.getElementById('close-quickview');
    const qvImg = document.getElementById('qv-img');
    const qvTitle = document.getElementById('qv-title');
    const qvPrice = document.getElementById('qv-price');
    const qvAddCart = document.getElementById('qv-add-cart');
    let currentQvItem = null;

    // Open Quick View (Now replacing direct Add to Cart as well)
    document.querySelectorAll('.btn-quickview, .btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Find the closest product card to get data
            const card = e.target.closest('.product-card');
            const cartBtn = card.querySelector('.btn-add-cart');
            
            const id = cartBtn.getAttribute('data-id');
            const name = cartBtn.getAttribute('data-name');
            const basePrice = parseFloat(cartBtn.getAttribute('data-price'));
            const img = cartBtn.getAttribute('data-img');
            
            currentQvItem = { id, name, basePrice, img };
            
            qvImg.src = img;
            qvTitle.textContent = name;
            
            // Reset selects to default
            const blouseSelect = document.getElementById('qv-blouse');
            const fallSelect = document.getElementById('qv-fall');
            blouseSelect.value = 'Unstitched';
            fallSelect.value = 'Yes';
            
            const updateQvPrice = () => {
                const blousePrice = parseFloat(blouseSelect.options[blouseSelect.selectedIndex].getAttribute('data-price'));
                const fallPrice = parseFloat(fallSelect.options[fallSelect.selectedIndex].getAttribute('data-price'));
                qvPrice.textContent = `$${(basePrice + blousePrice + fallPrice).toFixed(2)}`;
            };

            blouseSelect.addEventListener('change', updateQvPrice);
            fallSelect.addEventListener('change', updateQvPrice);
            
            updateQvPrice();
            quickviewModal.classList.add('active');
        });
    });

    closeQuickviewBtn.addEventListener('click', () => {
        quickviewModal.classList.remove('active');
    });

    qvAddCart.addEventListener('click', () => {
        if (currentQvItem) {
            const blouseSelect = document.getElementById('qv-blouse');
            const fallSelect = document.getElementById('qv-fall');
            
            const blouse = blouseSelect.value;
            const fall = fallSelect.value;
            
            const blousePrice = parseFloat(blouseSelect.options[blouseSelect.selectedIndex].getAttribute('data-price'));
            const fallPrice = parseFloat(fallSelect.options[fallSelect.selectedIndex].getAttribute('data-price'));
            
            const finalPrice = currentQvItem.basePrice + blousePrice + fallPrice;
            
            cart.push({
                id: currentQvItem.id,
                name: currentQvItem.name,
                img: currentQvItem.img,
                price: finalPrice,
                options: `Bustier: ${blouse} | Finishing: ${fall}`
            });
            
            updateCart();
            
            const originalText = qvAddCart.textContent;
            qvAddCart.textContent = 'Added!';
            qvAddCart.style.backgroundColor = '#2c2c2c';
            setTimeout(() => {
                qvAddCart.textContent = originalText;
                qvAddCart.style.backgroundColor = '';
                quickviewModal.classList.remove('active');
                toggleCart();
            }, 800);
        }
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your selection is empty. Please add an item to proceed.");
            return;
        }
        
        // Validate shipping form if it exists
        toggleCart(); // close sidebar
        paymentModal.classList.add('active');
    });

    closePaymentBtn.addEventListener('click', () => {
        paymentModal.classList.remove('active');
    });

    // Payment methods toggling
    document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            // If UPI is selected, hide card form, else show
            if(e.target.classList.contains('upi-btn')) {
                document.getElementById('payment-form').style.display = 'none';
            } else {
                document.getElementById('payment-form').style.display = 'flex';
            }
        });
    });

    // Process payment
    processPayBtn.addEventListener('click', () => {
        // Simple validation check for shipping inputs (in real world this would be robust)
        const inputs = document.querySelectorAll('#payment-body .pay-input[required]');
        let isValid = true;
        inputs.forEach(input => {
            if(!input.value.trim()) isValid = false;
        });
        
        if(!isValid) {
            alert("Please fill in all required delivery details.");
            return;
        }

        const originalText = processPayBtn.textContent;
        processPayBtn.textContent = 'Processing...';
        processPayBtn.disabled = true;

        setTimeout(() => {
            // Success
            paymentBody.style.display = 'none';
            paymentSuccess.style.display = 'block';
            
            // Clear cart
            cart = [];
            updateCart();
        }, 2000);
    });

    continueShoppingBtn.addEventListener('click', () => {
        paymentModal.classList.remove('active');
        // Reset modal state
        setTimeout(() => {
            paymentBody.style.display = 'block';
            paymentSuccess.style.display = 'none';
            processPayBtn.textContent = 'AUTHORIZE PAYMENT';
            processPayBtn.disabled = false;
            // Clear inputs
            document.querySelectorAll('.pay-input').forEach(input => input.value = '');
        }, 500);
    });
});
