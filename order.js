// =============================================
// CLEAN ORDER.JS - Tevin's Tech
// Simplified Supabase integration
// =============================================

const SUPABASE_URL = 'https://brbpwsungkpjvhlmtnyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9HsIna20Cq1gNjiVIYV6Hw_Pnq_KQsw';

let supabase;

document.addEventListener('DOMContentLoaded', async function () {

    // Initialize Supabase once
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const orderForm = document.getElementById('orderForm');
    if (!orderForm) return;

    const submitBtn = orderForm.querySelector('button[type="submit"]');

    orderForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Disable button and show loading
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Order...';

        // Collect form data
        const formData = {
            name: document.getElementById('name')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            project_type: document.getElementById('projectType')?.value || '',
            description: document.getElementById('description')?.value.trim() || ''
        };

        // Basic validation
        if (!formData.name || !formData.email || !formData.project_type || !formData.description) {
            alert('Please fill in all required fields.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }

        try {
            const { error } = await supabase
                .from('orders')
                .insert([formData]);

            if (error) throw error;

            // Success
            alert('✅ Order submitted successfully! We will contact you soon.');
            orderForm.reset();

        } catch (error) {
            console.error('Error:', error);
            alert('❌ Failed to submit order. Please try again or contact us directly.');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    console.log('✅ Order form initialized with Supabase');
});