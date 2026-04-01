// =============================================
// FINAL CLEAN ORDER.JS - No duplicate supabase
// =============================================

const SUPABASE_URL = 'https://brbpwsungkpjvhlmtnyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9HsIna20Cq1gNjiVIYV6Hw_Pnq_KQsw';

let supabaseClient = null;

document.addEventListener('DOMContentLoaded', function () {
    try {
        // Use the global Supabase object loaded from CDN
        if (typeof Supabase !== 'undefined') {
            supabaseClient = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client initialized for order form');
        } else {
            console.error('❌ Supabase library not loaded');
            alert('Failed to load required libraries. Please refresh the page.');
            return;
        }
    } catch (err) {
        console.error('Failed to initialize Supabase:', err);
        return;
    }

    const orderForm = document.getElementById('orderForm');
    if (!orderForm) return;

    const submitBtn = orderForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    orderForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        const formData = {
            name: document.getElementById('name')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            project_type: document.getElementById('projectType')?.value || '',
            description: document.getElementById('description')?.value.trim() || ''
        };

        if (!formData.name || !formData.email || !formData.project_type || !formData.description) {
            alert('Please fill in all required fields.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }

        try {
            const { error } = await supabaseClient.from('orders').insert([formData]);
            if (error) throw error;

            alert('✅ Order submitted successfully! We will contact you soon.');
            orderForm.reset();
        } catch (error) {
            console.error('Supabase Error:', error);
            alert('❌ Failed to submit order. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
});