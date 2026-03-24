// ===== CLIENT PORTAL - AUTHENTICATION & DASHBOARD =====
const SUPABASE_URL = 'https://brbpwsungkpjvhlmtnyl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9HsIna20Cq1gNjiVIYV6Hw_Pnq_KQsw';
let supabaseClient;
let currentUser = null;

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

function showError(message) { 
    const el = document.getElementById('errorMessage'); 
    if(el){ 
        el.textContent = message; 
        el.style.display = 'block'; 
        setTimeout(() => el.style.display = 'none', 5000); 
    } 
}

function showSuccess(message) { 
    const el = document.getElementById('successMessage'); 
    if(el){ 
        el.textContent = message; 
        el.style.display = 'block'; 
        setTimeout(() => el.style.display = 'none', 5000); 
    } 
}

async function checkAuth() {
    await loadSupabaseSDK();
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) { 
        if (window.location.pathname.includes('dashboard.html')) window.location.href = 'login.html'; 
        return null; 
    }
    currentUser = user;
    return user;
}

async function login(email, password) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) { 
        showError(error.message); 
        return false; 
    }
    showSuccess('Login successful! Redirecting...');
    setTimeout(() => window.location.href = 'dashboard.html', 1500);
    return true;
}

async function signup(name, email, password) {
    const { error } = await supabaseClient.auth.signUp({ 
        email, 
        password, 
        options: { data: { full_name: name } } 
    });
    if (error) { 
        showError(error.message); 
        return false; 
    }
    showSuccess('Account created! Please check your email to confirm.');
    return true;
}

async function logout() { 
    await supabaseClient.auth.signOut(); 
    window.location.href = 'login.html'; 
}

async function loadUserOrders() {
    const user = await checkAuth();
    if (!user) return;
    
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) userNameSpan.textContent = user.user_metadata?.full_name || user.email.split('@')[0];
    
    const { data: orders, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });
    
    if (error) return;
    
    const total = orders.length;
    const active = orders.filter(o => o.order_status === 'new' || o.order_status === 'processing').length;
    const completed = orders.filter(o => o.order_status === 'completed').length;
    
    document.getElementById('totalOrders').textContent = total;
    document.getElementById('activeOrders').textContent = active;
    document.getElementById('completedOrders').textContent = completed;
    
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    if (orders.length === 0) { 
        tbody.innerHTML = '<tr><td colspan="6">No orders yet. <a href="../order/order.html">Place your first order</a></td></tr>'; 
        return; 
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td><strong>${order.order_ref}</strong></td>
            <td>${order.package_name}</td>
            <td>KES ${order.amount?.toLocaleString()}</td>
            <td><span class="status-badge status-${order.order_status}">${order.order_status}</span></td>
            <td><button class="view-order-btn" onclick="viewOrderDetails(${order.id})">View Details</button></td>
        </tr>
    `).join('');
}

async function viewOrderDetails(orderId) {
    const { data: order, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
    
    if (error) return;
    
    const features = order.features ? (Array.isArray(order.features) ? order.features : JSON.parse(order.features)) : [];
    
    document.getElementById('modalBody').innerHTML = `
        <h2>Order ${order.order_ref}</h2>
        <div><strong>Status:</strong> <span class="status-badge status-${order.order_status}">${order.order_status}</span></div>
        <div><strong>Package:</strong> ${order.package_name}</div>
        <div><strong>Amount:</strong> KES ${order.amount?.toLocaleString()}</div>
        <div><strong>Description:</strong> ${order.project_description || 'No description'}</div>
        <div><strong>Features:</strong> ${features.length ? features.map(f => `✅ ${f}`).join('<br>') : 'None'}</div>
        <div><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</div>
    `;
    document.getElementById('orderModal').style.display = 'flex';
}

function closeModal() { 
    document.getElementById('orderModal').style.display = 'none'; 
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadSupabaseSDK();
    
    // Login/Signup page
    const loginForm = document.getElementById('loginFormElement');
    const signupForm = document.getElementById('signupFormElement');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => { 
            e.preventDefault(); 
            await login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value); 
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => { 
            e.preventDefault(); 
            await signup(document.getElementById('signupName').value, document.getElementById('signupEmail').value, document.getElementById('signupPassword').value); 
        });
    }
    
    // Tab switching
    const loginTab = document.querySelector('[data-tab="login"]');
    const signupTab = document.querySelector('[data-tab="signup"]');
    const loginFormDiv = document.getElementById('loginForm');
    const signupFormDiv = document.getElementById('signupForm');
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    
    if (loginTab && signupTab) {
        loginTab.addEventListener('click', () => { 
            loginTab.classList.add('active'); 
            signupTab.classList.remove('active'); 
            loginFormDiv.classList.add('active'); 
            signupFormDiv.classList.remove('active'); 
        });
        signupTab.addEventListener('click', () => { 
            signupTab.classList.add('active'); 
            loginTab.classList.remove('active'); 
            signupFormDiv.classList.add('active'); 
            loginFormDiv.classList.remove('active'); 
        });
        if (switchToSignup) switchToSignup.addEventListener('click', (e) => { e.preventDefault(); signupTab.click(); });
        if (switchToLogin) switchToLogin.addEventListener('click', (e) => { e.preventDefault(); loginTab.click(); });
    }
    
    // Dashboard page
    if (window.location.pathname.includes('dashboard.html')) { 
        const user = await checkAuth(); 
        if (user) await loadUserOrders(); 
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => { 
            document.body.classList.toggle('dark-mode'); 
            document.body.classList.toggle('light-mode'); 
        });
    }
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => mobileNav.classList.toggle('active'));
    }
});

window.onclick = function(event) { 
    const modal = document.getElementById('orderModal'); 
    if (event.target === modal) closeModal(); 
}