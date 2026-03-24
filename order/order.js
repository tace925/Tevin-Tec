// ===== ORDER PAGE WITH SUPABASE DATABASE & EMAIL AUTOMATION =====

const SUPABASE_URL = 'https://brbpwsungkpjvhlmtnyl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9HsIna20Cq1gNjiVIYV6Hw_Pnq_KQsw';

const PAYSTACK_CONFIG = {
    publicKey: 'pk_test_742dfa8f8b8b05c532cb6af8a5787eaf74e3ab8d',
    currency: 'KES'
};

const SITE_URL = 'https://tevin-tech.vercel.app';
const ADMIN_EMAIL = 'tevinmulinge48@gmail.com';

let supabaseClient;

document.addEventListener('DOMContentLoaded', function() {
    async function loadSupabaseSDK() {
        return new Promise((resolve, reject) => {
            if (window.supabase) {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
            script.onload = () => {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    async function sendOrderEmails(orderData) {
        const customerEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #6B46C1;">Thank you for your order, ${orderData.customer_name}! 🎉</h2>
                <p>Your order has been received. Here are the details:</p>
                <ul>
                    <li><strong>Order Reference:</strong> ${orderData.order_ref}</li>
                    <li><strong>Package:</strong> ${orderData.package_name}</li>
                    <li><strong>Amount:</strong> KES ${orderData.amount.toLocaleString()}</li>
                </ul>
                <p>I'll contact you within 24 hours to discuss your project.</p>
                <p>Best regards,<br>Tevin's Tech Team</p>
            </div>
        `;
        
        const adminEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>🆕 New Order Received!</h2>
                <p><strong>Order Reference:</strong> ${orderData.order_ref}</p>
                <p><strong>Customer:</strong> ${orderData.customer_name}</p>
                <p><strong>Email:</strong> ${orderData.customer_email}</p>
                <p><strong>Package:</strong> ${orderData.package_name}</p>
                <p><strong>Amount:</strong> KES ${orderData.amount.toLocaleString()}</p>
                <p><a href="${SITE_URL}/order/admin-orders.html">View in Admin Dashboard</a></p>
            </div>
        `;
        
        try {
            await fetch('https://formspree.io/f/xvzwqqbq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: orderData.customer_email,
                    _subject: `Order Confirmation: ${orderData.order_ref}`,
                    _html: customerEmailHtml
                })
            });
            
            await fetch('https://formspree.io/f/xvzwqqbq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: ADMIN_EMAIL,
                    _subject: `📦 New Order: ${orderData.order_ref}`,
                    _html: adminEmailHtml
                })
            });
        } catch (error) {
            console.error('Email error:', error);
        }
    }
    
    async function saveOrderToSupabase(orderData) {
        try {
            const dbOrder = {
                order_ref: orderData.order_ref,
                customer_name: orderData.customer_name,
                customer_email: orderData.customer_email,
                customer_phone: orderData.customer_phone || null,
                company_name: orderData.company_name || null,
                package_name: orderData.package_name,
                amount: orderData.amount,
                project_type: orderData.project_type || null,
                project_name: orderData.project_name || null,
                project_description: orderData.project_description || null,
                timeline: orderData.timeline || null,
                content_readiness: orderData.content_readiness || null,
                features: orderData.features || [],
                payment_method: orderData.payment_method || 'mpesa',
                order_status: 'new'
            };
            
            const { data, error } = await supabaseClient
                .from('orders')
                .insert([dbOrder])
                .select();
            
            if (error) return { success: false, error: error.message };
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
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
            if (mpesaInput) mpesaInput.style.display = this.value === 'mpesa' ? 'block' : 'none';
        });
    });
    
    // Load Paystack script
    function loadPaystackScript() {
        return new Promise((resolve, reject) => {
            if (window.PaystackPop) { resolve(); return; }
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
                amount: amount * 100,
                currency: PAYSTACK_CONFIG.currency,
                ref: orderRef,
                channels: ['mobile_money', 'card'],
                callback: async function(response) {
                    await supabaseClient.from('orders').update({ 
                        payment_status: 'completed', 
                        payment_reference: response.reference 
                    }).eq('order_ref', orderRef);
                    window.location.href = 'payment-success.html?ref=' + response.reference;
                },
                onClose: function() {
                    const submitBtn = document.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order & Pay';
                        submitBtn.disabled = false;
                    }
                }
            });
            handler.openIframe();
        } catch (error) {
            alert('Failed to initialize payment. Please try again.');
        }
    }
    
    // Form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await loadSupabaseSDK();
            
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'mpesa';
            let amount = parseInt(document.getElementById('budgetSlider')?.value) || 45000;
            const orderRef = 'TT-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 1000);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            const features = [];
            document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(cb => features.push(cb.id));
            
            const orderData = {
                order_ref: orderRef,
                customer_name: document.querySelector('input[name="name"]')?.value,
                customer_email: document.querySelector('input[name="email"]')?.value,
                customer_phone: document.querySelector('input[name="phone"]')?.value,
                company_name: document.querySelector('input[name="company"]')?.value,
                package_name: summaryPackage.textContent,
                amount: amount,
                project_type: document.querySelector('select[name="project_type"]')?.value,
                project_name: document.querySelector('input[name="project_name"]')?.value,
                project_description: document.querySelector('textarea[name="description"]')?.value,
                timeline: document.querySelector('select[name="timeline"]')?.value,
                content_readiness: document.querySelector('select[name="content_readiness"]')?.value,
                features: features,
                payment_method: paymentMethod
            };
            
            if (!orderData.customer_name || !orderData.customer_email) {
                alert('Please fill in your name and email');
                return;
            }
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving order...';
            submitBtn.disabled = true;
            
            const saveResult = await saveOrderToSupabase(orderData);
            if (!saveResult.success) {
                alert('Error saving order: ' + saveResult.error);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            await sendOrderEmails(orderData);
            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            
            if (paymentMethod === 'mpesa') {
                const mpesaPhone = document.getElementById('mpesaPhone')?.value;
                if (!mpesaPhone || !mpesaPhone.match(/^(254|0)[0-9]{9}$/)) {
                    alert('Please enter a valid M-Pesa phone number');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening Paystack...';
                await initializePaystackPayment(amount, orderData.customer_email, orderRef, summaryPackage.textContent);
            } else {
                alert('✅ Order saved! Check your email for confirmation.');
                window.location.href = 'order-confirmation.html';
            }
        });
    }
});