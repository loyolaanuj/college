// CollegeMerch Data & Client Helpers

window.CM = window.CM || {};

// Format Indian Rupee (INR)
window.CM.formatPrice = function(amount) {
  const num = Number(amount) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

// Cart State Manager
window.CM.Cart = {
  KEY: 'collegemerch_cart',

  getItems() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { items } }));
  },

  addItem(product, qty = 1, size = '', color = '') {
    const items = this.getItems();
    const existingIndex = items.findIndex(
      it => it.id === product.id && it.selected_size === size && it.selected_color === color
    );

    if (existingIndex > -1) {
      items[existingIndex].quantity += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url,
        category: product.category,
        quantity: qty,
        selected_size: size,
        selected_color: color
      });
    }

    this.save(items);
    return items;
  },

  updateQty(index, newQty) {
    const items = this.getItems();
    if (items[index]) {
      if (newQty <= 0) {
        items.splice(index, 1);
      } else {
        items[index].quantity = newQty;
      }
      this.save(items);
    }
    return items;
  },

  removeItem(index) {
    const items = this.getItems();
    items.splice(index, 1);
    this.save(items);
    return items;
  },

  clear() {
    localStorage.removeItem(this.KEY);
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { items: [] } }));
  },

  getCount() {
    return this.getItems().reduce((acc, it) => acc + (it.quantity || 1), 0);
  },

  getSubtotal() {
    return this.getItems().reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);
  }
};

// Auth Token Helpers
window.CM.TOKEN_KEY = 'cm_token';

window.CM.getToken = function() {
  try {
    return localStorage.getItem(window.CM.TOKEN_KEY) || '';
  } catch (e) {
    return '';
  }
};

window.CM.setToken = function(token) {
  try {
    if (token) {
      localStorage.setItem(window.CM.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(window.CM.TOKEN_KEY);
    }
  } catch (e) {}
};

window.CM.clearToken = function() {
  try {
    localStorage.removeItem(window.CM.TOKEN_KEY);
  } catch (e) {}
};

// API Client Helper
window.CM.api = async function(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  const token = window.CM.getToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    // Auto-store token on auth endpoints
    if (data && data.token) {
      window.CM.setToken(data.token);
    }

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
};

// Toast notification helper
window.CM.toast = function(message, type = 'success') {
  const existing = document.getElementById('cmToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cmToast';
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.zIndex = '99999';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '8px';
  toast.style.color = '#fff';
  toast.style.fontSize = '0.9rem';
  toast.style.fontWeight = '600';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '8px';
  toast.style.transition = 'all 0.3s ease';

  if (type === 'error') {
    toast.style.background = '#dc2626';
    toast.innerHTML = `<span>⚠️</span> ${message}`;
  } else {
    toast.style.background = '#1e3a8a';
    toast.innerHTML = `<span>✓</span> ${message}`;
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

// Safe In-App Confirmation Modal (iframe & browser safe)
window.CM.confirmModal = function({
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  confirmClass = 'btn-danger',
  cancelText = 'Cancel'
} = {}) {
  return new Promise((resolve) => {
    const existing = document.getElementById('cmConfirmModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'cmConfirmModal';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '100000';
    overlay.style.padding = '16px';

    overlay.innerHTML = `
      <div style="background:#ffffff; border-radius:12px; width:100%; max-width:440px; box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2); overflow:hidden; border:1px solid #e2e8f0; animation: fadeIn 0.15s ease-out;">
        <div style="padding:18px 24px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between;">
          <h3 style="margin:0; font-size:1.1rem; font-weight:700; color:#0f172a;">${title}</h3>
          <button type="button" id="cmConfirmClose" style="background:none; border:none; font-size:1.2rem; color:#64748b; cursor:pointer; padding:4px;">✕</button>
        </div>
        <div style="padding:20px 24px; color:#334155; font-size:0.95rem; line-height:1.5;">
          ${message}
        </div>
        <div style="padding:16px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px;">
          <button type="button" class="btn btn-outline" id="cmConfirmCancel" style="padding:8px 16px; font-weight:600;">${cancelText}</button>
          <button type="button" class="btn ${confirmClass}" id="cmConfirmOk" style="padding:8px 18px; font-weight:700;">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const cleanup = (result) => {
      overlay.remove();
      resolve(result);
    };

    overlay.querySelector('#cmConfirmOk').addEventListener('click', () => cleanup(true));
    overlay.querySelector('#cmConfirmCancel').addEventListener('click', () => cleanup(false));
    overlay.querySelector('#cmConfirmClose').addEventListener('click', () => cleanup(false));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
  });
};
