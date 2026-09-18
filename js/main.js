// CollegeMerch Main Layout Controller (Header, Footer, Navigation, Auth State)

document.addEventListener('DOMContentLoaded', async () => {
  renderHeader();
  renderFooter();
  await checkAuthState();
  updateCartBadge();

  window.addEventListener('cart-updated', () => {
    updateCartBadge();
  });
});

let currentUser = null;

async function checkAuthState() {
  try {
    const data = await window.CM.api('/api/auth/me');
    currentUser = data.user;
    updateUserNav();
  } catch (err) {
    currentUser = null;
    updateUserNav();
  }
}

function renderHeader() {
  const headerEl = document.getElementById('siteHeader');
  if (!headerEl) return;

  headerEl.className = 'site-header';
  headerEl.innerHTML = `
    <div class="container nav-inner">
      <a href="index.html" class="brand-logo" id="headerBrandLogo">
        <span class="logo-icon">⚡</span>
        <span>NEXUS</span>
        <span class="badge-pill">Store</span>
      </a>

      <ul class="nav-links" id="siteNavLinks">
        <li><a href="index.html" id="navHome">Home</a></li>
        <li><a href="products.html" id="navProducts">Products</a></li>
        <li><a href="products.html#categories" id="navCategories">Categories</a></li>
        <li><a href="orders.html" id="navOrders">My Orders</a></li>
      </ul>

      <div class="nav-actions">
        <a href="cart.html" class="cart-btn" id="navCartBtn" aria-label="Shopping Cart">
          🛒
          <span class="cart-badge" id="cartBadge">0</span>
        </a>

        <div class="user-menu-wrap" id="userMenuWrap">
          <a href="login.html" class="btn btn-sm btn-primary" id="navLoginBtn">Login</a>
        </div>

        <button class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Toggle navigation menu">
          ☰
        </button>
      </div>
    </div>
  `;

  // Highlight active link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = headerEl.querySelectorAll('.nav-links a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Mobile menu toggle
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navLinks = document.getElementById('siteNavLinks');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show-mobile');
    });
  }
}

function updateUserNav() {
  const wrap = document.getElementById('userMenuWrap');
  const navLinks = document.getElementById('siteNavLinks');
  if (!wrap) return;

  if (currentUser) {
    const em = (currentUser.email || '').toLowerCase().trim();
    const isAdmin = currentUser.role === 'admin' || em === 'admin@college.edu' || em === 'loyolaanuj@gmail.com';
    const shortName = currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Account';

    // Update main nav links for logged in user
    if (navLinks) {
      // Remove any previously appended dynamic links
      const dynLinks = navLinks.querySelectorAll('.dyn-nav-item');
      dynLinks.forEach(el => el.remove());

      const profileLi = document.createElement('li');
      profileLi.className = 'dyn-nav-item';
      profileLi.innerHTML = `<a href="account.html" id="navProfileLink">My Profile</a>`;
      navLinks.appendChild(profileLi);

      if (isAdmin) {
        const adminLi = document.createElement('li');
        adminLi.className = 'dyn-nav-item';
        adminLi.innerHTML = `<a href="admin.html" id="navAdminLink" style="background:#fef3c7; color:#92400e; padding:4px 10px; border-radius:6px; font-weight:700; border:1px solid #fde68a;">👑 Admin Dashboard</a>`;
        navLinks.appendChild(adminLi);
      }
    }

    wrap.innerHTML = `
      ${isAdmin ? `
        <a href="admin.html" class="btn btn-sm" id="headerAdminQuickBtn" style="background:#1e3a8a; color:#ffffff; font-weight:700; display:inline-flex; align-items:center; gap:6px; margin-right:6px; border:none; box-shadow:0 2px 6px rgba(30,58,138,0.3);">
          <span>👑</span>
          <span>Admin</span>
        </a>
      ` : ''}
      <button class="user-btn" id="userDropdownTrigger">
        <span>👤</span>
        <span>${shortName}</span>
        <small style="opacity:0.6;">▼</small>
      </button>
      <div class="user-dropdown" id="userDropdownMenu">
        <div style="padding:12px 18px 8px; font-size:0.82rem; color:var(--muted); border-bottom:1px solid var(--border);">
          Signed in as<br>
          <strong style="color:var(--text); font-size:0.9rem;">${currentUser.email}</strong>
          ${isAdmin ? '<div style="margin-top:6px;"><span style="display:inline-block;background:#fef3c7;color:#92400e;padding:3px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;border:1px solid #fde68a;">👑 Store Administrator</span></div>' : ''}
        </div>
        ${isAdmin ? '<a href="admin.html" id="menuAdminLink" style="font-weight:700; color:#1e3a8a; background:#f0f7ff;">👑 Admin Dashboard</a>' : ''}
        <a href="account.html" id="menuAccountLink">👤 My Profile & Settings</a>
        <a href="orders.html" id="menuOrdersLink">📦 My Orders</a>
        <div class="user-dropdown-divider"></div>
        <button id="logoutBtn" style="color:var(--danger); width:100%; text-align:left; background:none; border:none; padding:10px 18px; cursor:pointer; font-size:0.9rem; font-weight:600; display:flex; align-items:center; gap:8px;">🚪 Logout</button>
      </div>
    `;

    const trigger = document.getElementById('userDropdownTrigger');
    const menu = document.getElementById('userDropdownMenu');
    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
      });
      document.addEventListener('click', () => {
        menu.classList.remove('show');
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await window.CM.api('/api/auth/logout', { method: 'POST' });
        } catch (err) {}
        window.CM.clearToken();
        currentUser = null;
        window.CM.toast('Logged out successfully');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 300);
      });
    }
  } else {
    // Remove dynamic items if logged out
    if (navLinks) {
      const dynLinks = navLinks.querySelectorAll('.dyn-nav-item');
      dynLinks.forEach(el => el.remove());
    }
    wrap.innerHTML = `<a href="login.html" class="btn btn-sm btn-primary" id="navLoginBtn">Login</a>`;
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    const count = window.CM.Cart.getCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function renderFooter() {
  const footerEl = document.getElementById('siteFooter');
  if (!footerEl) return;

  footerEl.className = 'site-footer';
  footerEl.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <div class="brand-logo" style="color:#ffffff; margin-bottom:14px;">
            <span>⚡</span>
            <span>NEXUS</span>
          </div>
          <p style="font-size:0.92rem; line-height:1.6; max-width:320px;">
            The official merchandise destination for campus students, faculty, and alumni. Represent your community with pride and premium collegiate apparel.
          </p>
        </div>

        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="products.html">All Merchandise</a></li>
            <li><a href="products.html#categories">Categories</a></li>
            <li><a href="cart.html">Shopping Cart</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li><a href="account.html">My Account</a></li>
            <li><a href="orders.html">Track Orders</a></li>
            <li><a href="terms.html">Terms &amp; Conditions</a></li>
            <li><a href="privacy.html">Privacy Policy</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Campus Store</h4>
          <p style="font-size:0.9rem; margin-bottom:8px;">Campus Student Center, Ground Floor</p>
          <p style="font-size:0.9rem; margin-bottom:8px;">Mon – Sat: 9:00 AM – 6:00 PM</p>
          <p style="font-size:0.9rem; color:var(--accent);">support@nexuscampus.store</p>
        </div>
      </div>

      <div class="footer-bottom">
        <div id="footerCopyText" style="cursor:default;" title="NEXUS">&copy; ${new Date().getFullYear()} NEXUS. Official Campus Merchandise Store. All rights reserved.</div>
        <div style="display:flex; gap:16px;">
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
        </div>
      </div>
    </div>
  `;

  // Secret Admin Triggers
  // 1. Triple click on the copyright text opens secret admin
  let clickCount = 0;
  let clickTimer = null;
  const copyEl = document.getElementById('footerCopyText');
  if (copyEl) {
    copyEl.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      if (clickCount >= 3) {
        clickCount = 0;
        window.location.href = 'secret-admin.html';
      } else {
        clickTimer = setTimeout(() => { clickCount = 0; }, 800);
      }
    });
  }
}

// 2. Secret keyboard combination: Ctrl+Shift+A or Cmd+Shift+A anywhere
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    window.location.href = 'secret-admin.html';
  }
});
