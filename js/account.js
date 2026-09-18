// CollegeMerch User Account & Profile Controller

document.addEventListener('DOMContentLoaded', () => {
  initAccount();
});

async function initAccount() {
  const container = document.getElementById('accountContent');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center;padding:50px 0;color:var(--muted);font-size:1.05rem;">Loading your account profile...</div>';

  try {
    const res = await window.CM.api('/api/auth/me');
    if (!res || !res.user) {
      window.location.href = 'login.html?redirect=account.html';
      return;
    }

    const profile = res.user;

    // Fetch recent orders
    let recentOrders = [];
    try {
      const ordersRes = await window.CM.api('/api/orders');
      recentOrders = (ordersRes.orders || []).slice(0, 3);
    } catch (e) {
      console.warn('Could not load orders preview', e);
    }

    renderAccountView(container, profile, recentOrders);
  } catch (err) {
    window.CM.clearToken();
    window.location.href = 'login.html?redirect=account.html';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderAccountView(container, user, recentOrders) {
  const em = (user.email || '').toLowerCase().trim();
  const isAdmin = user.role === 'admin' || em === 'admin@college.edu' || em === 'loyolaanuj@gmail.com';
  const displayName = user.full_name || user.name || user.email.split('@')[0];
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1.6fr; gap:32px; align-items:start;" id="accountLayoutGrid">
      
      <!-- LEFT COLUMN: PROFILE SUMMARY & ADMIN SHORTCUTS -->
      <div>
        <div style="background:#ffffff; border:1px solid var(--border); border-radius:var(--radius); padding:28px; box-shadow:var(--shadow-sm); margin-bottom:24px;">
          <div style="text-align:center; margin-bottom:20px;">
            <div style="width:76px; height:76px; border-radius:50%; background:var(--primary); color:#ffffff; font-size:32px; font-weight:700; display:flex; align-items:center; justify-content:center; margin:0 auto 14px auto; box-shadow:0 4px 10px rgba(30,58,138,0.25);">
              ${initial}
            </div>
            <h2 style="font-size:1.3rem; margin-bottom:4px; font-weight:700;">${escapeHtml(displayName)}</h2>
            <p style="color:var(--muted); font-size:0.9rem; margin-bottom:10px;">${escapeHtml(user.email)}</p>
            
            ${isAdmin ? `
              <span style="display:inline-block; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:700; background:#fef3c7; color:#92400e; border:1px solid #fde68a;">
                👑 Store Administrator
              </span>
            ` : `
              <span style="display:inline-block; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:700; background:#e0f2fe; color:#0369a1;">
                🎓 Verified Campus Member
              </span>
            `}
          </div>

          <div style="border-top:1px solid var(--border); padding-top:16px; margin-bottom:20px; font-size:0.9rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
              <span style="color:var(--muted);">Phone:</span>
              <span style="font-weight:600;">${escapeHtml(user.phone || 'Not provided')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
              <span style="color:var(--muted);">Account Type:</span>
              <span style="font-weight:600; text-transform:capitalize;">${escapeHtml(user.role || 'Member')}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--muted);">Member Since:</span>
              <span style="font-weight:600;">${new Date(user.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px;">
            <a href="orders.html" class="btn btn-outline btn-block" style="text-align:center; justify-content:center;">
              📦 View All Orders
            </a>
            <button type="button" class="btn btn-danger btn-block" id="accountSignOutBtn" style="text-align:center; justify-content:center;">
              🚪 Sign Out
            </button>
          </div>
        </div>

        ${isAdmin ? `
          <!-- ADMIN CONTROLS HUB -->
          <div style="background:#eff6ff; border:2px solid #bfdbfe; border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm);">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
              <span style="font-size:1.5rem;">👑</span>
              <div>
                <h3 style="font-size:1.05rem; margin:0; color:#1e3a8a; font-weight:700;">Administrator Controls</h3>
                <span style="font-size:0.75rem; color:#3b82f6; font-weight:600;">Official Store Manager</span>
              </div>
            </div>
            <p style="font-size:0.85rem; color:#1e40af; margin-bottom:16px;">
              You have authorized access to manage the campus catalog, update inventory, process orders, and manage users.
            </p>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <a href="admin.html" class="btn btn-primary btn-block" style="background:#1e3a8a; font-weight:700; text-align:center; justify-content:center;">
                🚀 Open Admin Dashboard
              </a>
              <a href="admin.html#products" class="btn btn-sm btn-outline btn-block" style="text-align:center; justify-content:center; background:#ffffff;">
                🛍️ Manage Products & Pricing
              </a>
              <a href="admin.html#orders" class="btn btn-sm btn-outline btn-block" style="text-align:center; justify-content:center; background:#ffffff;">
                📋 Process Customer Orders
              </a>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- RIGHT COLUMN: EDIT PROFILE & RECENT ORDERS -->
      <div>
        <div style="background:#ffffff; border:1px solid var(--border); border-radius:var(--radius); padding:28px; box-shadow:var(--shadow-sm); margin-bottom:28px;">
          <h3 style="font-size:1.15rem; margin-bottom:18px; padding-bottom:10px; border-bottom:1px solid var(--border); font-weight:700;">
            👤 Edit Profile Details
          </h3>

          <form id="profileForm" novalidate>
            <div class="form-group" style="margin-bottom:14px;">
              <label for="profName" style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px;">Full Name</label>
              <input type="text" id="profName" value="${escapeHtml(displayName)}" required style="width:100%; height:42px; padding:0 12px; border:1px solid var(--border); border-radius:var(--radius); font-size:0.95rem; font-family:inherit;">
            </div>
            <div class="form-group" style="margin-bottom:14px;">
              <label for="profEmail" style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px;">Email Address (Primary Login)</label>
              <input type="email" id="profEmail" value="${escapeHtml(user.email)}" disabled style="width:100%; height:42px; padding:0 12px; border:1px solid var(--border); border-radius:var(--radius); font-size:0.95rem; font-family:inherit; background:#f1f5f9; cursor:not-allowed; opacity:0.8;">
              <small style="color:var(--muted); font-size:0.75rem;">Account email cannot be modified.</small>
            </div>
            <div class="form-group" style="margin-bottom:14px;">
              <label for="profPhone" style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px;">Phone Number (for Delivery Updates)</label>
              <input type="tel" id="profPhone" value="${escapeHtml(user.phone || '')}" placeholder="10-digit mobile number" style="width:100%; height:42px; padding:0 12px; border:1px solid var(--border); border-radius:var(--radius); font-size:0.95rem; font-family:inherit;">
            </div>
            <div class="form-group" style="margin-bottom:18px;">
              <label for="profPass" style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px;">New Password (leave blank to keep current)</label>
              <input type="password" id="profPass" placeholder="••••••••" style="width:100%; height:42px; padding:0 12px; border:1px solid var(--border); border-radius:var(--radius); font-size:0.95rem; font-family:inherit;">
            </div>

            <button type="submit" class="btn btn-primary" id="saveProfileBtn" style="font-weight:700; height:42px; padding:0 24px;">
              💾 Save Changes
            </button>
          </form>
        </div>

        <!-- RECENT ORDERS SNAPSHOT -->
        <div style="background:#ffffff; border:1px solid var(--border); border-radius:var(--radius); padding:28px; box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="font-size:1.15rem; font-weight:700; margin:0;">📦 Recent Orders</h3>
            <a href="orders.html" style="font-size:0.85rem; color:var(--primary); font-weight:600;">View All Orders →</a>
          </div>

          ${recentOrders.length === 0 ? `
            <div style="padding:20px 0; text-align:center; color:var(--muted); font-size:0.9rem;">
              You haven't placed any orders yet. <a href="products.html" style="color:var(--primary); font-weight:600;">Start shopping →</a>
            </div>
          ` : recentOrders.map(o => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 0; border-bottom:1px solid #f1f5f9; font-size:0.9rem;">
              <div>
                <a href="orders.html" style="font-weight:700; color:var(--primary); text-decoration:none;">${escapeHtml(o.id)}</a>
                <div style="font-size:0.8rem; color:var(--muted); margin-top:2px;">
                  ${new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · ${(o.items || []).length} item${(o.items || []).length === 1 ? '' : 's'}
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:700;">${window.CM.formatPrice(o.total_amount)}</div>
                <span class="order-status-badge ${o.order_status || 'Pending'}" style="font-size:0.75rem; padding:2px 8px; border-radius:12px; font-weight:700;">
                  ${escapeHtml(o.order_status || 'Pending')}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Attach Sign Out button
  const signOutBtn = document.getElementById('accountSignOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try {
        await window.CM.api('/api/auth/logout', { method: 'POST' });
      } catch (e) {}
      window.CM.clearToken();
      window.CM.toast('Logged out successfully');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 300);
    });
  }

  // Attach profile submit handler
  const form = document.getElementById('profileForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('profName').value.trim();
      const phone = document.getElementById('profPhone').value.trim();
      const password = document.getElementById('profPass').value;
      const btn = document.getElementById('saveProfileBtn');

      if (!name) {
        window.CM.toast('Name cannot be empty', 'error');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Saving...';

      try {
        const payload = { full_name: name, phone };
        if (password) {
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }
          payload.newPassword = password;
        }

        const res = await window.CM.api('/api/auth/profile', {
          method: 'PUT',
          body: payload
        });

        window.CM.toast('Profile details updated successfully!');
        btn.disabled = false;
        btn.textContent = '💾 Save Changes';
        document.getElementById('profPass').value = '';
      } catch (err) {
        window.CM.toast(err.message || 'Failed to update profile', 'error');
        btn.disabled = false;
        btn.textContent = '💾 Save Changes';
      }
    });
  }
}
