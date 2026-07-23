document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const btnMinusList = document.querySelectorAll('.btn-minus');
    const btnPlusList = document.querySelectorAll('.btn-plus');
    const shippingDistrict = document.getElementById('shipping-district');
    const paymentInputs = document.querySelectorAll('input[name="payment"]');
    const advancePaymentBox = document.getElementById('advance-payment-box');
    
    const cartItemsList = document.getElementById('cart-items-list');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryCod = document.getElementById('summary-cod');
    const summaryTotal = document.getElementById('summary-total');
    
    const codFeeRow = document.getElementById('cod-fee-row');
    const btnSubmitOrder = document.getElementById('btn-submit-order');
    
    const modalOverlay = document.getElementById('success-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');

    // Sticky Cart Elements
    const mobileStickyCart = document.getElementById('mobile-sticky-cart');
    const stickyCartText = document.getElementById('sticky-cart-text');
    const btnStickyCheckout = document.getElementById('btn-sticky-checkout');
    const messengerBtn = document.querySelector('.messenger-btn');

    // Accordion Elements
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    // State
    // Format: { "550": { name: "550 ml Teapot", price: 790, qty: 0 }, ... }
    let cart = {};
    let selectedDistrict = '';
    let isDistrictSelected = false;
    let isCod = true;

    // Helper: Convert English numerals to Bangla
    function toBnNum(num) {
        const bnNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return num.toString().split('').map(char => {
            if (char >= '0' && char <= '9') {
                return bnNumbers[parseInt(char)];
            }
            return char;
        }).join('');
    }

    // Initialize cart state
    document.querySelectorAll('.qty-input').forEach(input => {
        const id = input.id.replace('qty-', '');
        const parent = input.closest('.quantity-control-mini');
        const btn = parent.querySelector('.btn-plus');
        
        cart[id] = {
            name: btn.dataset.name,
            price: parseInt(btn.dataset.price),
            qty: 0
        };
    });

    // Determine Shipping Logic
    function calculateShipping() {
        let deliveryCharge = 0;
        let codCharge = 0;

        if (isDistrictSelected) {
            if (selectedDistrict === 'dhaka') {
                deliveryCharge = isCod ? 60 : 30;
            } else if (['savar', 'gazipur', 'narayanganj', 'keraniganj'].includes(selectedDistrict)) {
                deliveryCharge = isCod ? 80 : 40;
            } else {
                deliveryCharge = isCod ? 110 : 70;
            }
        }

        if (isCod) {
            codCharge = 20;
        }

        return { deliveryCharge, codCharge };
    }

    // Update Cart UI
    function updateCart() {
        let subtotal = 0;
        let totalItems = 0;
        let html = '';

        for (const [id, item] of Object.entries(cart)) {
            if (item.qty > 0) {
                const itemTotal = item.price * item.qty;
                subtotal += itemTotal;
                totalItems += item.qty;
                
                html += `
                    <div class="cart-item-row">
                        <span>${toBnNum(item.qty)}x ${item.name}</span>
                        <span>৳ ${toBnNum(itemTotal)}</span>
                    </div>
                `;
            }
        }

        if (totalItems === 0) {
            cartItemsList.innerHTML = '<p class="empty-cart-msg">কোনো আইটেম নির্বাচন করা হয়নি।</p>';
            btnSubmitOrder.disabled = true;
        } else {
            cartItemsList.innerHTML = html;
            btnSubmitOrder.disabled = false;
        }

        const { deliveryCharge, codCharge } = calculateShipping();

        const badge = document.getElementById('delivery-charge-badge');
        if (badge) {
            if (isDistrictSelected) {
                badge.style.display = 'block';
                badge.style.color = '#059669';
                
                if (selectedDistrict === 'dhaka') {
                    badge.innerText = '👉 ঢাকা সিটি ডেলিভারি চার্জ: ৬০ টাকা কার্যকর';
                } else if (['savar', 'gazipur', 'narayanganj', 'keraniganj'].includes(selectedDistrict)) {
                    badge.innerText = '👉 এই এলাকার জন্য ডেলিভারি চার্জ: ৮০ টাকা কার্যকর';
                } else {
                    badge.innerText = '👉 ঢাকার বাইরে ডেলিভারি চার্জ: ১১০ টাকা কার্যকর';
                }
            } else {
                badge.style.display = 'none';
            }
        }

        // Summary Calculations
        summarySubtotal.innerText = `৳ ${toBnNum(subtotal)}`;
        summaryShipping.innerText = `৳ ${toBnNum(deliveryCharge)}`;
        
        let total = subtotal + deliveryCharge;

        if (totalItems > 0) {
            if (isCod) {
                codFeeRow.style.display = 'flex';
                total += codCharge;
                summaryCod.innerText = `৳ ${toBnNum(codCharge)}`;
            } else {
                codFeeRow.style.display = 'none';
            }
        } else {
            // Show defaults even if empty for preview
            if (isCod) codFeeRow.style.display = 'flex';
            else codFeeRow.style.display = 'none';
            total = 0;
        }

        summaryTotal.innerText = `৳ ${toBnNum(total)}`;

        // Mobile Sticky Cart Update
        if (mobileStickyCart && stickyCartText) {
            if (totalItems > 0) {
                mobileStickyCart.classList.add('active');
                if (messengerBtn) messengerBtn.classList.add('cart-active');
                stickyCartText.innerText = `নির্বাচিত: ${toBnNum(totalItems)} টি | মোট বিল: ৳${toBnNum(total)}`;
            } else {
                mobileStickyCart.classList.remove('active');
                if (messengerBtn) messengerBtn.classList.remove('cart-active');
            }
        }
    }

    // Product Quantity Handlers
    btnMinusList.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const input = document.getElementById(`qty-${id}`);
            if (cart[id].qty > 0) {
                cart[id].qty--;
                input.value = cart[id].qty;
                updateCart();
            }
        });
    });

    btnPlusList.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const input = document.getElementById(`qty-${id}`);
            cart[id].qty++;
            input.value = cart[id].qty;
            updateCart();
        });
    });

    // Shipping Area Handler
    shippingDistrict.addEventListener('change', (e) => {
        isDistrictSelected = true;
        selectedDistrict = e.target.value;
        updateCart();
    });

    // Payment Method Handler
    paymentInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            isCod = e.target.value === 'cod';
            
            // Toggle Advance Payment Box
            if (isCod) {
                advancePaymentBox.style.display = 'none';
            } else {
                advancePaymentBox.style.display = 'block';
            }
            
            updateCart();
        });
    });

    // Advance Payment Provider Selection
    let selectedAdvanceProvider = '';
    const providerBoxes = document.querySelectorAll('.payment-provider-box');
    
    providerBoxes.forEach(box => {
        box.addEventListener('click', () => {
            providerBoxes.forEach(b => b.classList.remove('selected-provider'));
            box.classList.add('selected-provider');
            selectedAdvanceProvider = box.dataset.provider;
        });
    });

    // Accordion Handler
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;

            // Close all other open accordions
            document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                if (activeItem !== item) {
                    activeItem.classList.remove('active');
                    activeItem.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            // Toggle current accordion
            if (item.classList.contains('active')) {
                item.classList.remove('active');
                content.style.maxHeight = null;
            } else {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Submit Order Handler
    btnSubmitOrder.addEventListener('click', (e) => {
        e.preventDefault(); // Stop native submission since we handle via AJAX fetch

        // Basic Validation
        const name = document.getElementById('cust-name').value.trim();
        const phone = document.getElementById('cust-phone').value.trim();
        const address = document.getElementById('cust-address').value.trim();
        
        let totalQty = 0;
        for (const key in cart) totalQty += cart[key].qty;

        if (totalQty === 0) {
            alert('দয়া করে অন্তত একটি আইটেম নির্বাচন করুন।');
            return;
        }
        if (!name || !phone || !address) {
            alert('দয়া করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা প্রদান করুন।');
            return;
        }
        if (!isDistrictSelected) {
            alert('দয়া করে আপনার ডেলিভারি জেলা নির্বাচন করুন।');
            return;
        }

        if (!isCod) {
            if (!selectedAdvanceProvider) {
                alert('দয়া করে পেমেন্ট মাধ্যম (bKash অথবা Nagad) নির্বাচন করুন।');
                return;
            }
            const payPhone = document.getElementById('payment-phone').value.trim();
            const payTrx = document.getElementById('payment-trx').value.trim();
            if (!payPhone || !payTrx) {
                alert('দয়া করে পেমেন্ট নম্বর এবং ট্রানজেকশন আইডি প্রদান করুন।');
                return;
            }
        }

        // Show loading state on button
        const originalBtnText = btnSubmitOrder.innerText;
        btnSubmitOrder.innerText = 'অর্ডার প্রসেসিং হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন।';
        btnSubmitOrder.disabled = true;

        // Calculate totals and packages for the payload
        let subtotal = 0;
        let packageDetails = [];
        for (const key in cart) {
            if (cart[key].qty > 0) {
                subtotal += cart[key].qty * cart[key].price;
                packageDetails.push(`${cart[key].qty}x ${cart[key].name}`);
            }
        }
        
        const { deliveryCharge, codCharge } = calculateShipping();
        let grandTotal = subtotal + deliveryCharge;
        if (isCod) {
            grandTotal += codCharge;
        }

        // Prepare object for Web3Forms (Keys must match what you want to see in email/dashboard)
        const formData = {
            access_key: "0e3d8af9-b372-4285-a68a-9236f6c69b38",
            Name: name,
            Phone: phone,
            Address: address,
            Package: packageDetails.join(', '),
            TotalPrice: grandTotal + " Tk",
            DeliveryZone: selectedDistrict,
            PaymentMethod: isCod ? 'Cash on Delivery' : `Advance Payment (${selectedAdvanceProvider})`,
            SenderNumber: isCod ? 'N/A' : document.getElementById('payment-phone').value.trim(),
            TransactionID: isCod ? 'N/A' : document.getElementById('payment-trx').value.trim()
        };

        // Send to Web3Forms using AJAX Fetch
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
                console.log('Data successfully sent to Web3Forms');

                // Trigger Success Popup
                modalOverlay.classList.add('active');

                // Restore button and reset form
                btnSubmitOrder.innerText = originalBtnText;
                btnSubmitOrder.disabled = false;
                
                document.getElementById('cust-name').value = '';
                document.getElementById('cust-phone').value = '';
                document.getElementById('cust-address').value = '';
                document.getElementById('shipping-district').value = '';
                if (!isCod) {
                    document.getElementById('payment-phone').value = '';
                    document.getElementById('payment-trx').value = '';
                }
            } else {
                console.log(json.message);
                alert('Something went wrong. Please try again.');
                btnSubmitOrder.innerText = originalBtnText;
                btnSubmitOrder.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error sending to Web3Forms:', error);
            alert('Something went wrong. Please try again.');
            btnSubmitOrder.innerText = originalBtnText;
            btnSubmitOrder.disabled = false;
        });
    });

    // Close Modal Handler
    btnCloseModal.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        // Reset form or redirect if necessary
        location.reload(); 
    });

    // Initialize UI on load
    updateCart();

    // Lightbox Logic
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');

    function closeLightbox() {
        if (!lightboxModal.classList.contains('active')) return;

        lightboxModal.classList.remove('active');
        setTimeout(() => {
            lightboxImg.style.display = 'none';
            lightboxVideo.style.display = 'none';
            lightboxImg.src = '';
            lightboxVideo.src = '';
        }, 300);

        if (window.location.hash === '#view-media') {
            window.history.back();
        }
    }

    lightboxTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const isVideo = trigger.tagName === 'VIDEO';
            if (isVideo) {
                const source = trigger.querySelector('source').src;
                lightboxVideo.src = source;
                lightboxImg.style.display = 'none';
                lightboxVideo.style.display = 'block';
            } else {
                lightboxImg.src = trigger.src;
                lightboxVideo.style.display = 'none';
                lightboxImg.style.display = 'block';
            }
            lightboxModal.classList.add('active');
            window.history.pushState({ modalOpen: true }, '', '#view-media');
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);

    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal || e.target.classList.contains('lightbox-content-wrapper')) {
            closeLightbox();
        }
    });

    // Mobile Sticky Checkout Scroll
    if (btnStickyCheckout) {
        btnStickyCheckout.addEventListener('click', () => {
            const checkoutSection = document.getElementById('cart-summary-box');
            if (checkoutSection) {
                checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Customer Review Carousel Logic
    const carouselTrack = document.querySelector('.review-carousel-track');
    const carouselSlides = document.querySelectorAll('.review-carousel-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');

    if (carouselTrack && carouselSlides.length > 0) {
        let currentIndex = 0;
        const totalSlides = carouselSlides.length;
        let autoPlayInterval;

        function updateCarousel() {
            carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }

        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, 7000); // 7 seconds
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });

        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });

        // Initialize autoplay
        startAutoPlay();

        // Hook into existing Lightbox to pause/resume
        lightboxTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                clearInterval(autoPlayInterval); // Pause when zooming
            });
        });

        lightboxClose.addEventListener('click', () => {
            resetAutoPlay(); // Resume when closing
        });

        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal || e.target.classList.contains('lightbox-content-wrapper')) {
                resetAutoPlay(); // Resume when closing
            }
        });
    }

    // 1. Push a state named '#stay' to trap the first back button press
    function setupHistoryTrap() {
        if (window.location.hash !== '#stay') {
            window.history.pushState({ page: 'landing' }, '', '#stay');
        }
    }

    // 2. Trigger on first user interaction (required by modern browsers)
    ['touchstart', 'click', 'scroll'].forEach(event => {
        window.addEventListener(event, function onFirstInteraction() {
            setupHistoryTrap();
            ['touchstart', 'click', 'scroll'].forEach(e => window.removeEventListener(e, onFirstInteraction));
        }, { passive: true });
    });

    // 3. Listen to 'popstate' event
    window.addEventListener('popstate', function (event) {
        const modal = document.getElementById('lightbox-modal');
        
        // Case 1: Media Modal is open
        if (modal && modal.classList.contains('active')) {
            if (typeof closeLightbox === 'function') {
                closeLightbox();
            } else {
                modal.classList.remove('active');
            }
            // Re-trap so they don't exit the page on modal close back-press
            setupHistoryTrap();
            return;
        }

        // Case 2: Direct page exit attempt
        // By not re-pushing the state instantly on the second consecutive press, it allows a 2-click exit.
        console.log("Accidental page exit prevented once.");
    });
});
