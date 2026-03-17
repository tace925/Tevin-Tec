// ===== SAFARICOM DARAJA M-PESA INTEGRATION =====
// FIXED WITH CORS PROXY

const MPESA_CONFIG = {
    consumerKey: '2Y1V7xDvU8WC3fZsQd1DVbyqYkJkqjYEtGLv9n9J55PCFIKS',
    consumerSecret: 'ObhVj0tMD1gGjrGTcfTpAiXfNF0ZQnsLYzauGAGcrAtveqU9ddNFr47phVdmAfG9',
    passkey: 'MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjYwMzE4MDE0MDQ0',
    shortCode: '174379',
    environment: 'sandbox'
};

const SITE_URL = 'https://tevin-tech.netlify.app';

// CORS Proxy to bypass Safaricom's CORS restrictions
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

document.addEventListener('DOMContentLoaded', function() {
    // Package selection
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
    
    // Payment method toggle
    document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const mpesaInput = document.querySelector('.mpesa-input');
            if (mpesaInput) {
                mpesaInput.style.display = this.value === 'mpesa' ? 'block' : 'none';
            }
        });
    });
    
    // Get M-Pesa access token (with CORS proxy)
    async function getMpesaToken() {
        try {
            const credentials = btoa(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`);
            
            // Use CORS proxy to bypass Safaricom's CORS restrictions
            const tokenUrl = CORS_PROXY + 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
            
            console.log('Fetching token from:', tokenUrl);
            
            const response = await fetch(tokenUrl, {
                method: 'GET',
                headers: { 
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json',
                    'Origin': SITE_URL
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            
            if (!data.access_token) {
                throw new Error('No access token in response');
            }
            
            console.log('✅ Token obtained successfully');
            return data.access_token;
            
        } catch (error) {
            console.error('❌ Token error:', error);
            throw error;
        }
    }
    
    // Initiate STK Push
    async function initiateSTKPush(amount, phone, orderRef) {
        try {
            const token = await getMpesaToken();
            
            // Format phone number
            const formattedPhone = phone.replace(/^0+/, '254').replace(/^\+254/, '254');
            
            // Generate timestamp
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            
            const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
            
            // Generate password
            const passwordString = MPESA_CONFIG.shortCode + MPESA_CONFIG.passkey + timestamp;
            const password = btoa(passwordString);
            
            const stkPushRequest = {
                BusinessShortCode: MPESA_CONFIG.shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.floor(amount),
                PartyA: formattedPhone,
                PartyB: MPESA_CONFIG.shortCode,
                PhoneNumber: formattedPhone,
                CallBackURL: `${SITE_URL}/api/mpesa-callback`,
                AccountReference: orderRef,
                TransactionDesc: `Payment for ${orderRef}`
            };
            
            // Use CORS proxy for STK push as well
            const stkUrl = CORS_PROXY + 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
            
            const response = await fetch(stkUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Origin': SITE_URL
                },
                body: JSON.stringify(stkPushRequest)
            });
            
            const data = await response.json();
            
            if (data.ResponseCode === '0') {
                return {
                    success: true,
                    checkoutRequestID: data.CheckoutRequestID,
                    message: 'STK Push sent'
                };
            } else {
                return {
                    success: false,
                    error: data.errorMessage || 'STK Push failed',
                    data: data
                };
            }
        } catch (error) {
            console.error('STK Push error:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to authenticate with M-Pesa' 
            };
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
            
            const orderRef = 'TT-' + Date.now().toString().slice(-8);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Save order data
            const orderData = {
                reference: orderRef,
                amount: amount,
                package: summaryPackage.textContent,
                name: document.querySelector('input[name="name"]')?.value,
                email: document.querySelector('input[name="email"]')?.value,
                date: new Date().toISOString()
            };
            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            
            if (paymentMethod === 'mpesa') {
                const phone = document.getElementById('mpesaPhone')?.value;
                
                if (!phone || !phone.match(/^(254|0)[0-9]{9}$/)) {
                    alert('Please enter a valid M-Pesa phone number (e.g., 254712345678)');
                    return;
                }
                
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending STK Push...';
                submitBtn.disabled = true;
                
                try {
                    const result = await initiateSTKPush(amount, phone, orderRef);
                    
                    if (result.success) {
                        orderData.checkoutRequestID = result.checkoutRequestID;
                        localStorage.setItem('currentOrder', JSON.stringify(orderData));
                        window.location.href = 'payment-processing.html';
                    } else {
                        alert('Payment failed: ' + result.error);
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                } catch (error) {
                    alert('Payment error: ' + error.message);
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            } else {
                // Submit to Formspree for bank/PayPal
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
});