// CollegeMerch Admin Dashboard Controller

document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('adminLoading');
  const contentEl = document.getElementById('adminContent');

  try {
    const auth = await window.CM.api('/api/auth/me');
    if (!auth || !auth.user) {
      showSecretAdminGate('Enter administrator credentials to unlock.');
      return;
    }

    const email = (auth.user.email || '').toLowerCase().trim();
    const isAdmin = auth.user.role === 'admin' || email === 'admin@college.edu' || email === 'loyolaanuj@gmail.com';
    if (!isAdmin) {
      showSecretAdminGate(`Signed in as ${auth.user.email}. Access denied: Administrator privileges required to open the admin console.`);
      return;
    }

    // Authenticated as Official Admin!
    unlockAdminConsole();
  } catch (err) {
    showSecretAdminGate('Authentication verification failed. Please log in as admin@college.edu.');
  }
});

function unlockAdminConsole() {
  const loadingEl = document.getElementById('adminLoading');
  const contentEl = document.getElementById('adminContent');
  if (loadingEl) loadingEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';

  initTabs();
  loadOverview();
  loadProducts();
  loadOrders();
  loadUsers();
  initProductModal();
}

function showSecretAdminGate(message) {
  const loadingEl = document.getElementById('adminLoading');
  if (!loadingEl) return;

  loadingEl.innerHTML = `
    <div style="max-width:480px; margin:40px auto; background:#ffffff; border:1px solid var(--border); border-radius:var(--radius); padding:32px 28px; box-shadow:var(--shadow); text-align:left;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
        <span style="font-size:2rem;">🛡️</span>
        <div>
          <h2 style="font-size:1.3rem; margin:0; line-height:1.2;">Secret Admin Console</h2>
          <span style="font-size:0.75rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.05em; font-weight:700;">NEXUS Management Portal</span>
        </div>
      </div>
      <p style="color:var(--muted); font-size:0.88rem; margin-bottom:18px;">${message || 'Enter administrator credentials (admin@college.edu) to access store controls.'}</p>
      
      <!-- Quick 1-Click Login for dedicated store administrator -->
      <div style="background:var(--surface-alt); border:1px solid var(--border); border-radius:8px; padding:12px; margin-bottom:16px;">
        <div style="font-size:0.75rem; font-weight:700; color:var(--muted); text-transform:uppercase; margin-bottom:8px;">Campus Administrator Login:</div>
        <div>
          <button type="button" class="btn btn-sm btn-primary quick-admin-btn" data-email="admin@college.edu" data-pass="admin123" style="text-align:left; justify-content:flex-start; width:100%;">
            🎓 Login as Official Admin (admin@college.edu)
          </button>
        </div>
      </div>

      <form id="secretLoginForm">
        <div class="form-group" style="margin-bottom:14px;">
          <label for="secEmail" style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px;">Admin Email</label>
          <input type="email" id="secEmail" required autocomplete="email" value="admin@college.edu" placeholder="admin@college.edu" style="width:100%; height:42px; padding:0 12px; border:1px solid var(--border); border-radius:var(--radius); font-size:0.95rem; font-family:inherit;">
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label for="secPass" style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px;">Admin Password</label>
          <input type="password" id="secPass" required autocomplete="current-password" placeholder="••••••••" style="width:100%; height:42px; padding:0 12px; border:1px solid var(--border); border-radius:var(--radius); font-size:0.95rem; font-family:inherit;">
        </div>
        <div id="secErr" style="color:var(--danger); font-size:0.85rem; margin-bottom:12px; display:none; background:#fee2e2; border:1px solid #fca5a5; padding:8px 12px; border-radius:6px;"></div>
        <button type="submit" class="btn btn-primary btn-block" id="secBtn" style="height:44px; font-weight:700; width:100%;">Unlock Management Console</button>
      </form>
    </div>
  `;

  const form = document.getElementById('secretLoginForm');
  const errEl = document.getElementById('secErr');
  const btn = document.getElementById('secBtn');

  // Quick 1-click login handler for admin@college.edu
  document.querySelectorAll('.quick-admin-btn').forEach(qb => {
    qb.addEventListener('click', async () => {
      const email = qb.getAttribute('data-email');
      const pass = qb.getAttribute('data-pass');
      qb.disabled = true;
      qb.textContent = 'Authenticating...';
      try {
        const res = await window.CM.api('/api/auth/login', {
          method: 'POST',
          body: { email, password: pass }
        });
        if (res.user && res.user.email?.toLowerCase().trim() === 'admin@college.edu') {
          window.CM.toast('Admin console unlocked successfully');
          unlockAdminConsole();
        } else {
          throw new Error('Access denied: Only admin@college.edu is authorized.');
        }
      } catch (e) {
        window.CM.toast(e.message || 'Login failed', 'error');
        qb.disabled = false;
        qb.textContent = '🎓 Login as Official Admin (admin@college.edu)';
      }
    });
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errEl) errEl.style.display = 'none';
    const email = document.getElementById('secEmail').value.trim();
    const password = document.getElementById('secPass').value;

    if (email.toLowerCase() !== 'admin@college.edu') {
      if (errEl) {
        errEl.textContent = 'Access denied: Only admin@college.edu is authorized to access this console.';
        errEl.style.display = 'block';
      }
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Authenticating...';

    try {
      const res = await window.CM.api('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      if (!res.user || res.user.email?.toLowerCase().trim() !== 'admin@college.edu' || res.user.role !== 'admin') {
        throw new Error('Access denied: Account does not have administrator privileges.');
      }

      window.CM.toast('Admin console unlocked successfully');
      unlockAdminConsole();
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message || 'Login failed. Please verify credentials.';
        errEl.style.display = 'block';
      }
      btn.disabled = false;
      btn.textContent = 'Unlock Management Console';
    }
  });
}

// Tabs
function initTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabContents = {
    overview: document.getElementById('tabOverview'),
    products: document.getElementById('tabProducts'),
    orders: document.getElementById('tabOrders'),
    users: document.getElementById('tabUsers')
  };

  function switchTab(target) {
    if (!tabContents[target]) target = 'overview';
    tabBtns.forEach(b => {
      if (b.getAttribute('data-tab') === target) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    Object.keys(tabContents).forEach(key => {
      if (tabContents[key]) {
        tabContents[key].style.display = (key === target) ? 'block' : 'none';
      }
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      switchTab(target);
      window.location.hash = target;
    });
  });

  // Handle URL hash on initial load
  const hash = window.location.hash.replace('#', '');
  if (hash && tabContents[hash]) {
    switchTab(hash);
  }
}

// 1. Overview Tab
async function loadOverview() {
  try {
    const data = await window.CM.api('/api/admin/stats');
    const stats = data.stats;

    document.getElementById('statRevenue').textContent = window.CM.formatPrice(stats.totalRevenue ?? stats.total_revenue ?? 0);
    document.getElementById('statOrders').textContent = stats.totalOrders ?? stats.total_orders ?? 0;
    document.getElementById('statProducts').textContent = stats.totalProducts ?? stats.total_products ?? 0;
    document.getElementById('statUsers').textContent = stats.totalUsers ?? stats.total_users ?? 0;

    const recentOrders = stats.recentOrders || stats.recent_orders || [];
    const recentList = document.getElementById('recentOrdersList');
    if (recentList) {
      if (recentOrders.length === 0) {
        recentList.innerHTML = `<div style="color:var(--muted);">No orders placed yet.</div>`;
      } else {
        recentList.innerHTML = recentOrders.map(o => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border);">
            <div>
              <strong>${o.id}</strong> · ${o.customer_name}
              <div style="font-size:0.8rem; color:var(--muted);">${new Date(o.created_at).toLocaleDateString()}</div>
            </div>
            <div style="text-align:right;">
              <span class="order-status-badge ${o.order_status}">${o.order_status}</span>
              <div style="font-weight:700; margin-top:2px;">${window.CM.formatPrice(o.total_amount)}</div>
            </div>
          </div>
        `).join('');
      }
    }

    const lowStock = stats.lowStockProducts || stats.low_stock_products || [];
    const lowStockList = document.getElementById('lowStockList');
    if (lowStockList) {
      if (lowStock.length === 0) {
        lowStockList.innerHTML = `<div style="color:var(--success);">✓ All product inventory is well-stocked.</div>`;
      } else {
        lowStockList.innerHTML = lowStock.map(p => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
            <div>
              <strong>${p.name}</strong>
              <div style="font-size:0.8rem; color:var(--muted);">${p.category}</div>
            </div>
            <span style="font-weight:700; color:var(--danger);">${p.stock_quantity} left</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load admin stats:', err);
  }
}

// 2. Products Tab
let allProducts = [];

async function loadProducts() {
  const tbody = document.getElementById('adminProductsTbody');
  const countEl = document.getElementById('adminProductCount');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--muted);">Loading products...</td></tr>`;

  try {
    const data = await window.CM.api('/api/products');
    allProducts = data.products || [];

    renderProductsTable(allProducts);

    const searchInput = document.getElementById('adminProductSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase().trim();
        const filtered = allProducts.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
        renderProductsTable(filtered);
      });
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:var(--danger); text-align:center;">Failed to load products.</td></tr>`;
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById('adminProductsTbody');
  const countEl = document.getElementById('adminProductCount');
  if (countEl) countEl.textContent = `${products.length} products total`;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:30px;">No matching products found.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr id="prodRow-${p.id}">
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${p.image_url}" alt="${p.name}" style="width:44px; height:44px; border-radius:6px; object-fit:cover; border:1px solid var(--border);">
          <div>
            <strong>${p.name}</strong>
            <div style="font-size:0.78rem; color:var(--muted);">ID: ${p.id}</div>
          </div>
        </div>
      </td>
      <td><span style="background:var(--surface-alt); padding:3px 8px; border-radius:4px; font-size:0.82rem; font-weight:600;">${p.category}</span></td>
      <td>
        <strong>${window.CM.formatPrice(p.price)}</strong>
        ${p.original_price ? `<div style="font-size:0.8rem; color:var(--muted); text-decoration:line-through;">${window.CM.formatPrice(p.original_price)}</div>` : ''}
      </td>
      <td>
        <span style="font-weight:700; color:${p.stock_quantity <= 10 ? 'var(--danger)' : 'inherit'};">
          ${p.stock_quantity} units
        </span>
      </td>
      <td>${p.is_featured ? '⭐ Yes' : '—'}</td>
      <td>
        <div style="display:flex; gap:6px;">
          <button type="button" class="btn btn-sm btn-outline edit-prod-btn" data-id="${p.id}" style="padding:4px 8px;">✏️ Edit</button>
          <button type="button" class="btn btn-sm btn-danger del-prod-btn" data-id="${p.id}" style="padding:4px 8px;">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Attach Edit and Delete listeners
  tbody.querySelectorAll('.edit-prod-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const prod = allProducts.find(p => p.id === id);
      if (prod) openEditProduct(prod);
    });
  });

  tbody.querySelectorAll('.del-prod-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const prod = allProducts.find(p => p.id === id);
      const prodName = prod?.name || 'this product';

      const confirmed = await window.CM.confirmModal({
        title: 'Delete Product',
        message: `Are you sure you want to permanently delete <strong>"${prodName}"</strong> from the merchandise catalog?`,
        confirmText: '🗑️ Yes, Delete Product',
        confirmClass: 'btn-danger'
      });

      if (!confirmed) return;

      try {
        btn.disabled = true;
        await window.CM.api(`/api/admin/products/${id}`, { method: 'DELETE' });
        window.CM.toast(`"${prodName}" deleted successfully`);
        loadProducts();
        loadOverview();
      } catch (err) {
        window.CM.toast(err.message || 'Failed to delete product', 'error');
        btn.disabled = false;
      }
    });
  });
}

// Product Modal & Form
function initProductModal() {
  const modal = document.getElementById('productModal');
  const openBtn = document.getElementById('openAddProductModal');
  const openBtn2 = document.getElementById('openAddProductModal2');
  const closeBtn = document.getElementById('closeProductModal');
  const cancelBtn = document.getElementById('cancelProductBtn');
  const deleteModalBtn = document.getElementById('deleteModalProductBtn');
  const form = document.getElementById('productForm');

  const clearBtn = document.getElementById('clearDemoProductsBtn');
  const resetBtn = document.getElementById('resetDemoProductsBtn');

  // Clear demo products
  clearBtn?.addEventListener('click', async () => {
    const confirmed = await window.CM.confirmModal({
      title: 'Clear All Products',
      message: 'Are you sure you want to remove <strong>ALL</strong> products from the catalog? This will leave your inventory empty ready for your custom merchandise.',
      confirmText: '🗑️ Clear All Products',
      confirmClass: 'btn-danger'
    });
    if (!confirmed) return;

    try {
      clearBtn.disabled = true;
      clearBtn.textContent = 'Clearing...';
      await window.CM.api('/api/admin/products-clear', { method: 'POST' });
      window.CM.toast('All products cleared successfully');
      loadProducts();
      loadOverview();
    } catch (err) {
      window.CM.toast(err.message || 'Failed to clear products', 'error');
    } finally {
      clearBtn.disabled = false;
      clearBtn.textContent = '🗑️ Clear All Demo Products';
    }
  });

  // Restore default demo products
  resetBtn?.addEventListener('click', async () => {
    const confirmed = await window.CM.confirmModal({
      title: 'Restore Default Products',
      message: 'Restore the default campus apparel collection to the catalog?',
      confirmText: '🔄 Restore Catalog',
      confirmClass: 'btn-primary'
    });
    if (!confirmed) return;

    try {
      resetBtn.disabled = true;
      resetBtn.textContent = 'Restoring...';
      await window.CM.api('/api/admin/products-reset', { method: 'POST' });
      window.CM.toast('Default campus collection restored');
      loadProducts();
      loadOverview();
    } catch (err) {
      window.CM.toast(err.message || 'Failed to restore default products', 'error');
    } finally {
      resetBtn.disabled = false;
      resetBtn.textContent = '🔄 Restore Default Demo Catalog';
    }
  });

  // Delete product from inside the edit modal
  deleteModalBtn?.addEventListener('click', async () => {
    const id = document.getElementById('prodId').value;
    const name = document.getElementById('prodName').value || 'this product';
    if (!id) return;

    const confirmed = await window.CM.confirmModal({
      title: 'Delete Product',
      message: `Are you sure you want to permanently delete <strong>"${name}"</strong>?`,
      confirmText: '🗑️ Delete Product',
      confirmClass: 'btn-danger'
    });

    if (!confirmed) return;

    try {
      deleteModalBtn.disabled = true;
      deleteModalBtn.textContent = 'Deleting...';
      await window.CM.api(`/api/admin/products/${id}`, { method: 'DELETE' });
      window.CM.toast(`"${name}" deleted successfully`);
      hideModal();
      loadProducts();
      loadOverview();
    } catch (err) {
      window.CM.toast(err.message || 'Failed to delete product', 'error');
    } finally {
      deleteModalBtn.disabled = false;
      deleteModalBtn.textContent = '🗑️ Delete Product';
    }
  });

  const showAddModal = () => {
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('prodId').value = '';
    form.reset();
    document.getElementById('prodFeatured').checked = false;
    if (deleteModalBtn) deleteModalBtn.style.display = 'none';
    modal.style.display = 'flex';
  };

  openBtn?.addEventListener('click', showAddModal);
  openBtn2?.addEventListener('click', showAddModal);

  const hideModal = () => { modal.style.display = 'none'; };
  closeBtn?.addEventListener('click', hideModal);
  cancelBtn?.addEventListener('click', hideModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const isEdit = Boolean(id);

    const rawImg = document.getElementById('prodImg').value.trim();
    const payload = {
      name: document.getElementById('prodName').value.trim(),
      category: document.getElementById('prodCategory').value,
      price: Number(document.getElementById('prodPrice').value),
      original_price: document.getElementById('prodOrigPrice').value ? Number(document.getElementById('prodOrigPrice').value) : null,
      stock_quantity: Number(document.getElementById('prodStock').value),
      image_url: rawImg || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&q=80',
      description: document.getElementById('prodDesc').value.trim(),
      sizes: (document.getElementById('prodSizes').value || 'S, M, L, XL').split(',').map(s => s.trim()).filter(Boolean),
      colors: (document.getElementById('prodColors').value || 'Navy, White').split(',').map(c => c.trim()).filter(Boolean),
      is_featured: document.getElementById('prodFeatured').checked
    };

    const saveBtn = document.getElementById('saveProductBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      if (isEdit) {
        await window.CM.api(`/api/admin/products/${id}`, {
          method: 'PUT',
          body: payload
        });
        window.CM.toast('Product updated successfully');
      } else {
        await window.CM.api('/api/admin/products', {
          method: 'POST',
          body: payload
        });
        window.CM.toast('Product created successfully');
      }

      hideModal();
      loadProducts();
      loadOverview();
    } catch (err) {
      window.CM.toast(err.message || 'Failed to save product', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Product';
    }
  });
}

function openEditProduct(p) {
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('prodId').value = p.id;
  document.getElementById('prodName').value = p.name || '';
  document.getElementById('prodCategory').value = p.category || 'T-Shirts';
  document.getElementById('prodPrice').value = p.price || '';
  document.getElementById('prodOrigPrice').value = p.original_price || '';
  document.getElementById('prodStock').value = p.stock_quantity ?? 50;
  document.getElementById('prodImg').value = p.image_url || '';
  document.getElementById('prodDesc').value = p.description || '';
  document.getElementById('prodSizes').value = Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || '');
  document.getElementById('prodColors').value = Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || '');
  document.getElementById('prodFeatured').checked = Boolean(p.is_featured);

  const deleteModalBtn = document.getElementById('deleteModalProductBtn');
  if (deleteModalBtn) deleteModalBtn.style.display = 'inline-block';

  document.getElementById('productModal').style.display = 'flex';
}

// 3. Orders Tab
let allOrders = [];

async function loadOrders() {
  const tbody = document.getElementById('adminOrdersTbody');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--muted);">Loading campus orders...</td></tr>`;

  try {
    const data = await window.CM.api('/api/admin/orders');
    allOrders = data.orders || [];

    renderOrdersTable(allOrders);

    const filterSelect = document.getElementById('adminOrderStatusFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', () => {
        const status = filterSelect.value;
        const filtered = status === 'All' ? allOrders : allOrders.filter(o => o.order_status === status);
        renderOrdersTable(filtered);
      });
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:var(--danger); text-align:center;">Failed to load orders.</td></tr>`;
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('adminOrdersTbody');
  const countEl = document.getElementById('adminOrderCount');
  if (countEl) countEl.textContent = `${orders.length} orders total`;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:30px;">No orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const date = new Date(o.created_at).toLocaleDateString();
    const itemsSummary = (o.items || []).map(it => `${it.quantity}x ${it.product_name}`).join(', ');

    return `
      <tr id="adminOrderRow-${o.id}">
        <td>
          <a href="order-details.html?id=${o.id}" style="color:var(--primary); font-weight:700;">${o.id}</a>
        </td>
        <td>
          <strong>${o.customer_name}</strong>
          <div style="font-size:0.78rem; color:var(--muted);">${o.customer_email} · ${o.customer_phone}</div>
        </td>
        <td>${date}</td>
        <td>
          <div style="max-width:240px; font-size:0.85rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${itemsSummary}">
            ${itemsSummary}
          </div>
          <strong>${window.CM.formatPrice(o.total_amount)}</strong>
        </td>
        <td>
          <select class="order-status-select" data-id="${o.id}" style="height:32px; font-size:0.85rem; padding:0 8px;">
            ${['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => `
              <option value="${s}" ${o.order_status === s ? 'selected' : ''}>${s}</option>
            `).join('')}
          </select>
        </td>
        <td>
          <a href="order-details.html?id=${o.id}" class="btn btn-sm btn-outline" style="padding:4px 8px;">
            Details
          </a>
        </td>
      </tr>
    `;
  }).join('');

  // Attach status change listeners
  tbody.querySelectorAll('.order-status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      const orderId = sel.getAttribute('data-id');
      const newStatus = sel.value;
      try {
        await window.CM.api(`/api/admin/orders/${orderId}/status`, {
          method: 'PUT',
          body: { status: newStatus }
        });
        window.CM.toast(`Order #${orderId} updated to ${newStatus}`);
        loadOverview();
      } catch (err) {
        window.CM.toast(err.message || 'Failed to update order status', 'error');
        loadOrders();
      }
    });
  });
}

// 4. Users Tab
async function loadUsers() {
  const tbody = document.getElementById('adminUsersTbody');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--muted);">Loading users...</td></tr>`;

  try {
    const data = await window.CM.api('/api/admin/users');
    const users = data.users || [];

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:30px;">No registered users found.</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr id="userRow-${u.id}">
        <td><strong>${u.full_name}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone || '—'}</td>
        <td>
          <select class="user-role-select" data-id="${u.id}" style="height:30px; font-size:0.85rem; padding:0 6px;">
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>Student / Customer</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrator</option>
          </select>
        </td>
        <td>
          <span style="background:${u.is_active ? 'var(--success-light)' : 'var(--danger-light)'}; color:${u.is_active ? 'var(--success)' : 'var(--danger)'}; padding:3px 8px; border-radius:9999px; font-size:0.8rem; font-weight:700;">
            ${u.is_active ? 'Active' : 'Disabled'}
          </span>
        </td>
        <td>${new Date(u.created_at).toLocaleDateString()}</td>
        <td>
          <button type="button" class="btn btn-sm btn-outline toggle-user-btn" data-id="${u.id}" data-active="${u.is_active}" style="padding:4px 8px;">
            ${u.is_active ? 'Disable' : 'Enable'}
          </button>
        </td>
      </tr>
    `).join('');

    // Role toggle
    tbody.querySelectorAll('.user-role-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const uid = sel.getAttribute('data-id');
        const newRole = sel.value;
        try {
          await window.CM.api(`/api/admin/users/${uid}`, {
            method: 'PUT',
            body: { role: newRole }
          });
          window.CM.toast(`User role updated to ${newRole}`);
        } catch (err) {
          window.CM.toast(err.message || 'Failed to change role', 'error');
          loadUsers();
        }
      });
    });

    // Active status toggle
    tbody.querySelectorAll('.toggle-user-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const uid = btn.getAttribute('data-id');
        const curActive = btn.getAttribute('data-active') === 'true';
        try {
          await window.CM.api(`/api/admin/users/${uid}`, {
            method: 'PUT',
            body: { is_active: !curActive }
          });
          window.CM.toast(`User account ${!curActive ? 'activated' : 'disabled'}`);
          loadUsers();
        } catch (err) {
          window.CM.toast(err.message || 'Failed to update user status', 'error');
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:var(--danger); text-align:center;">Failed to load users.</td></tr>`;
  }
}
