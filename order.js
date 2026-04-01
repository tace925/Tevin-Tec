// =============================================
// CLEAN ORDER.JS - Tevin's Tech
// No conflicts with main/script.js
// =============================================

const SUPABASE_URL = 'https://brbpwsungkpjvhlmtnyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9HsIna20Cq1gNjiVIYV6Hw_Pnq_KQsw';

let supabaseClient;

document.addEventListener('DOMContentLoaded', async function () {

    // Load Supabase safely (only once)
    if (!window.supabase) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        await new Promise(resolve => {
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    supabaseClient = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

        // Simple validation
        if (!formData.name || !formData.email || !formData.project_type || !formData.description) {
            alert('Please fill in all required fields.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }

        try {
            const { error } = await supabaseClient
                .from('orders')
                .insert([formData]);

            if (error) throw error;

            alert('✅ Order submitted successfully! We will contact you soon.');
            orderForm.reset();

        } catch (error) {
            console.error('Supabase Error:', error);
            alert('❌ Failed to submit order. Please try again or email tevinmulinge48@gmail.com');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    console.log('✅ Order form ready with Supabase');
});