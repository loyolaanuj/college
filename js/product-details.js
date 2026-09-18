// CollegeMerch Product Details Controller

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('pdContent');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    container.innerHTML = `
      <div class="empty-state" style="margin: 60px 0;">
        <div class="emoji">❓</div>
        <h2>Product not specified</h2>
        <p>Please select a merchandise item from our catalog.</p>
        <a href="products.html" class="btn btn-primary">Browse All Products</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `<div style="text-align:center; padding: 60px; color: var(--muted);">Loading merchandise details...</div>`;

  try {
    const data = await window.CM.api(`/api/products/${productId}`);
    const p = data.product;

    if (!p) {
      container.innerHTML = `
        <div class="empty-state" style="margin: 60px 0;">
          <div class="emoji">🔍</div>
          <h2>Product Not Found</h2>
          <p>The product you are looking for may have been retired or moved.</p>
          <a href="products.html" class="btn btn-primary">Browse All Products</a>
        </div>
      `;
      return;
    }

    renderProductDetails(container, p);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state" style="margin: 60px 0;">
        <div class="emoji">⚠️</div>
        <h2>Error Loading Product</h2>
        <p>${err.message || 'Please check your connection and try again.'}</p>
        <a href="products.html" class="btn btn-primary">Back to Catalog</a>
      </div>
    `;
  }
});

function renderProductDetails(container, p) {
  const isOutOfStock = !p.in_stock || p.stock_quantity <= 0;
  const sizes = Array.isArray(p.sizes) ? p.sizes : (p.sizes ? [p.sizes] : ['Standard']);
  const colors = Array.isArray(p.colors) ? p.colors : (p.colors ? [p.colors] : ['Standard']);

  let selectedSize = sizes[0] || '';
  let selectedColor = colors[0] || '';
  let quantity = 1;

  container.innerHTML = `
    <!-- BREADCRUMB -->
    <nav style="padding: 20px 0; font-size: 0.88rem; color: var(--muted);" aria-label="Breadcrumb">
      <a href="index.html" style="color:var(--muted);">Home</a> &nbsp;/&nbsp;
      <a href="products.html" style="color:var(--muted);">Products</a> &nbsp;/&nbsp;
      <a href="products.html?category=${encodeURIComponent(p.category)}" style="color:var(--muted);">${p.category}</a> &nbsp;/&nbsp;
      <span style="color:var(--text); font-weight:600;">${p.name}</span>
    </nav>

    <div class="pd-wrapper">
      <!-- IMAGE GALLERY -->
      <div class="pd-gallery">
        <img id="pdMainImg" src="${p.image_url}" alt="${p.name}">
      </div>

      <!-- DETAILS & ACTIONS -->
      <div class="pd-info">
        <div class="pd-category">${p.category}</div>
        <h1 id="pdTitle">${p.name}</h1>

        <div class="pd-price-row">
          <span class="pd-price">${window.CM.formatPrice(p.price)}</span>
          ${p.original_price ? `<span class="pd-orig">${window.CM.formatPrice(p.original_price)}</span>` : ''}
          ${p.original_price ? `<span style="font-size:0.85rem; color:var(--accent); font-weight:700;">Save ${Math.round(((p.original_price - p.price) / p.original_price) * 100)}%</span>` : ''}
        </div>

        <div class="pd-stock-badge ${isOutOfStock ? 'out' : 'in'}">
          ${isOutOfStock ? '● Out of Stock' : `● In Stock (${p.stock_quantity} units available)`}
        </div>

        <p class="pd-desc">${p.description || 'Authentic campus merchandise with official collegiate branding and high-durability craftsmanship.'}</p>

        <!-- SIZES -->
        ${sizes.length > 0 ? `
          <div class="pd-section-label">Select Size</div>
          <div class="pd-options-wrap" id="pdSizesWrap">
            ${sizes.map((s, idx) => `
              <button type="button" class="pd-chip ${idx === 0 ? 'selected' : ''}" data-size="${s}">${s}</button>
            `).join('')}
          </div>
        ` : ''}

        <!-- COLORS -->
        ${colors.length > 0 ? `
          <div class="pd-section-label">Select Color</div>
          <div class="pd-options-wrap" id="pdColorsWrap">
            ${colors.map((c, idx) => `
              <button type="button" class="pd-chip ${idx === 0 ? 'selected' : ''}" data-color="${c}">${c}</button>
            `).join('')}
          </div>
        ` : ''}

        <!-- QUANTITY & ADD TO CART -->
        <div class="pd-section-label">Quantity</div>
        <div class="pd-qty-actions">
          <div class="qty-control">
            <button type="button" class="qty-btn" id="qtyMinus" ${isOutOfStock ? 'disabled' : ''}>-</button>
            <input type="number" class="qty-input" id="qtyVal" value="1" min="1" max="${p.stock_quantity || 10}" readonly>
            <button type="button" class="qty-btn" id="qtyPlus" ${isOutOfStock ? 'disabled' : ''}>+</button>
          </div>

          <button type="button" class="btn btn-primary" id="pdAddCartBtn" ${isOutOfStock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} style="flex:1;">
            🛒 Add to Cart
          </button>
          <button type="button" class="btn btn-accent" id="pdBuyNowBtn" ${isOutOfStock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            ⚡ Buy Now
          </button>
        </div>

        <!-- SPECIFICATIONS -->
        <div style="border-top:1px solid var(--border); padding-top:24px; margin-top:20px;">
          <div style="font-size:0.9rem; font-weight:700; margin-bottom:12px;">Merchandise Guarantee:</div>
          <ul style="font-size:0.88rem; color:#475569; list-style:none; line-height:1.8;">
            <li>✓ 100% officially licensed college campus merchandise</li>
            <li>✓ Premium quality, preshrunk and tested for long-lasting wear</li>
            <li>✓ Easy 7-day exchange or campus bookstore pickup</li>
            <li>✓ Secure payment and campus order tracking</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  // Size click handlers
  const sizeChips = container.querySelectorAll('#pdSizesWrap .pd-chip');
  sizeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      sizeChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedSize = chip.getAttribute('data-size');
    });
  });

  // Color click handlers
  const colorChips = container.querySelectorAll('#pdColorsWrap .pd-chip');
  colorChips.forEach(chip => {
    chip.addEventListener('click', () => {
      colorChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedColor = chip.getAttribute('data-color');
    });
  });

  // Quantity controls
  const minusBtn = container.querySelector('#qtyMinus');
  const plusBtn = container.querySelector('#qtyPlus');
  const qtyInput = container.querySelector('#qtyVal');

  if (minusBtn && plusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        qtyInput.value = quantity;
      }
    });

    plusBtn.addEventListener('click', () => {
      const max = p.stock_quantity || 10;
      if (quantity < max) {
        quantity++;
        qtyInput.value = quantity;
      } else {
        window.CM.toast(`Maximum available stock is ${max}`, 'error');
      }
    });
  }

  // Add to cart
  const addCartBtn = container.querySelector('#pdAddCartBtn');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      window.CM.Cart.addItem(p, quantity, selectedSize, selectedColor);
      window.CM.toast(`Added ${quantity}x "${p.name}" to cart!`);
    });
  }

  // Buy now
  const buyNowBtn = container.querySelector('#pdBuyNowBtn');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      window.CM.Cart.addItem(p, quantity, selectedSize, selectedColor);
      window.location.href = 'checkout.html';
    });
  }
}
