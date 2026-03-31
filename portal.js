// =============================================
// CLEAN PORTAL.JS - Client Portal
// Simplified & Stable Supabase Auth
// =============================================

const SUPABASE_URL = 'https://brbpwsungkpjvhlmtnyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9HsIna20Cq1gNjiVIYV6Hw_Pnq_KQsw';

let supabase;

document.addEventListener('DOMContentLoaded', async function () {

    // Load Supabase once
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('✅ Client Portal initialized');

    // ===================== LOGIN =====================
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            try {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                alert('✅ Login successful!');
                window.location.href = 'dashboard.html';
            } catch (err) {
                alert('❌ Login failed: ' + err.message);
            }
        });
    }

    // ===================== SIGNUP =====================
    const signupForm = document.getElementById('signupFormElement');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value.trim();

            try {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name } }
                });
                if (error) throw error;

                alert('✅ Account created! Please check your email to confirm.');
            } catch (err) {
                alert('❌ Signup failed: ' + err.message);
            }
        });
    }

    // ===================== DASHBOARD =====================
    if (window.location.pathname.includes('dashboard.html')) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Show user name if element exists
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = user.user_metadata?.full_name || user.email;
    }

    // Logout function (you can call this from a button onclick="logout()")
    window.logout = async function() {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    };
});