// ===== PAYSTACK PAYMENT INTEGRATION =====
// COMPLETE REPLACEMENT FOR M-PESA - NO CORS ERRORS!

const PAYSTACK_CONFIG = {
    publicKey: 'pk_test_742dfa8f8b8b05c532cb6af8a5787eaf74e3ab8d',
    currency: 'KES'
};

const SITE_URL = 'https://tevin-tech.netlify.app';

document.addEventListener('DOMContentLoaded', function() {
    // Package selection (keeping your existing design)
    const packageCards = document.querySelectorAll('.package-card');
    const selectedPackageInput = document.getElementById('selectedPackageInput');
    const summaryPackage = document.getElementById('summaryPackage');
    const summaryPrice = document.getElementById('summaryPrice');
    const summaryTotal = document.getElementById('summaryTotal');
    
    const packages = {
        basic: { name: 'Basic', price: 'KES 25,000', total: 'KES 25,000' },
        professional: { name: 'Professional', price: 'KES 45,000', total: 'KES 45,000' },
        enterprise: { name: 'Enterprise', price: 'KES 80,000', total: 'KES 80,000' }
    };
    
    packageCards.forEach(card => {
        card.addEventListener('click', function() {
            packageCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            const packageId = this.id.replace('package-', '');
            if (selectedPackageInput) selectedPackageInput.value = packageId;
            
            summaryPackage.textContent = packages[packageId].name;
            summaryPrice.textContent = packages[packageId].price;
            summaryTotal.textContent = packages[packageId].total;
        });
    });
    
    // Budget slider
    const budgetSlider = document.getElementById('budgetSlider');
    const budgetDisplay = document.getElementById('budgetDisplay');
    
    if (budgetSlider && budgetDisplay) {
        budgetSlider.addEventListener('input', function() {
            budgetDisplay.textContent = 'KES ' + parseInt(this.value).toLocaleString();
        });
    }
    
    // Payment method toggle (keeping your existing UI)
    document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const mpesaInput = document.querySelector('.mpesa-input');
            if (mpesaInput) {
                mpesaInput.style.display = this.value === 'mpesa' ? 'block' : 'none';
            }
        });
    });
    
    // Load Paystack script
    function loadPaystackScript() {
        return new Promise((resolve, reject) => {
            if (window.PaystackPop) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Initialize Paystack payment
    async function initializePaystackPayment(amount, email, orderRef, packageName) {
        try {
            await loadPaystackScript();
            
            const handler = PaystackPop.setup({
                key: PAYSTACK_CONFIG.publicKey,
                email: email,
                amount: amount * 100, // Paystack uses kobo/cents (multiply by 100)
                currency: PAYSTACK_CONFIG.currency,
                ref: orderRef,
                channels: ['mobile_money', 'card'], // Allow M-PESA and card
                metadata: {
                    package_name: packageName,
                    custom_fields: [
                        {
                            display_name: "Package",
                            variable_name: "package",
                            value: packageName
                        }
                    ]
                },
                callback: function(response) {
                    // Payment successful
                    console.log('Payment successful:', response);
                    
                    // Save order data with payment reference
                    const orderData = JSON.parse(localStorage.getItem('currentOrder') || '{}');
                    orderData.paystackReference = response.reference;
                    orderData.paymentStatus = 'completed';
                    localStorage.setItem('currentOrder', JSON.stringify(orderData));
                    
                    // Redirect to success page
                    window.location.href = 'payment-success.html?ref=' + response.reference;
                },
                onClose: function() {
                    // User closed the payment window
                    alert('Payment cancelled. You can try again when ready.');
                    
                    // Re-enable submit button
                    const submitBtn = document.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order & Pay';
                        submitBtn.disabled = false;
                    }
                }
            });
            
            handler.openIframe();
            
        } catch (error) {
            console.error('Paystack initialization error:', error);
            alert('Failed to initialize payment. Please try again.');
            
            // Re-enable submit button
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order & Pay';
                submitBtn.disabled = false;
            }
        }
    }
    
    // Form submission
    const orderForm = document.getElementById('orderForm');
    
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'mpesa';
            
            let amount = parseInt(document.getElementById('budgetSlider')?.value);
            if (!amount || isNaN(amount)) {
                const priceText = summaryPrice.textContent.replace(/[^0-9]/g, '');
                amount = parseInt(priceText) || 45000;
            }
            
            const orderRef = 'TT-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 1000);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Get customer details
            const name = document.querySelector('input[name="name"]')?.value;
            const email = document.querySelector('input[name="email"]')?.value;
            const phone = document.querySelector('input[name="phone"]')?.value;
            const company = document.querySelector('input[name="company"]')?.value;
            
            // Validate required fields
            if (!name || !email) {
                alert('Please fill in your name and email');
                return;
            }
            
            // Save order data
            const orderData = {
                reference: orderRef,
                amount: amount,
                package: summaryPackage.textContent,
                name: name,
                email: email,
                phone: phone,
                company: company,
                date: new Date().toISOString(),
                projectType: document.querySelector('select[name="project_type"]')?.value,
                description: document.querySelector('textarea[name="description"]')?.value
            };
            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            
            if (paymentMethod === 'mpesa') {
                const mpesaPhone = document.getElementById('mpesaPhone')?.value;
                
                if (!mpesaPhone || !mpesaPhone.match(/^(254|0)[0-9]{9}$/)) {
                    alert('Please enter a valid M-Pesa phone number (e.g., 254712345678)');
                    return;
                }
                
                // Add phone to order data
                orderData.phone = mpesaPhone;
                localStorage.setItem('currentOrder', JSON.stringify(orderData));
                
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening Paystack...';
                submitBtn.disabled = true;
                
                // Initialize Paystack payment
                await initializePaystackPayment(amount, email, orderRef, summaryPackage.textContent);
                
            } else {
                // For bank/PayPal, submit to Formspree
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                submitBtn.disabled = true;
                
                try {
                    const formData = new FormData(this);
                    formData.append('order_reference', orderRef);
                    
                    const response = await fetch(this.action, {
                        method: 'POST',
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    });
                    
                    if (response.ok) {
                        window.location.href = 'order-confirmation.html';
                    } else {
                        throw new Error('Submission failed');
                    }
                } catch (error) {
                    alert('Error submitting form. Please email me directly.');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
    
    console.log('✅ Paystack integration ready');
});