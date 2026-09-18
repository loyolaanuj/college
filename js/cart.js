// CollegeMerch Shopping Cart Controller

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cartContent');
  if (!container) return;

  renderCart(container);

  window.addEventListener('cart-updated', () => {
    renderCart(container);
  });
});

function renderCart(container) {
  const items = window.CM.Cart.getItems();

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🛒</div>
        <h2>Your Shopping Cart is Empty</h2>
        <p>Looks like you haven't added any campus merchandise yet.</p>
        <a href="products.html" class="btn btn-primary" style="margin-top:10px;">Browse Merchandise</a>
      </div>
    `;
    return;
  }

  const subtotal = window.CM.Cart.getSubtotal();
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingFee;

  container.innerHTML = `
    <div class="cart-layout">
      <!-- ITEMS LIST -->
      <div class="cart-items-table">
        <div style="padding: 16px 20px; font-weight:700; border-bottom:1px solid var(--border); background:var(--surface-alt); font-size:0.9rem; text-transform:uppercase; letter-spacing:0.04em;">
          Cart Items (${items.length})
        </div>

        ${items.map((item, index) => `
          <div class="cart-item-row" id="cartRow-${index}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
              <h4><a href="product-details.html?id=${item.id}">${item.name}</a></h4>
              <p>
                ${item.selected_size ? `Size: <strong>${item.selected_size}</strong> &nbsp;` : ''}
                ${item.selected_color ? `Color: <strong>${item.selected_color}</strong>` : ''}
              </p>
              <div style="font-size:0.85rem; color:var(--muted); margin-top:4px;">
                Unit Price: ${window.CM.formatPrice(item.price)}
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px;">
              <div class="qty-control" style="width:fit-content;">
                <button type="button" class="qty-btn btn-cart-minus" data-index="${index}">-</button>
                <input type="text" class="qty-input" value="${item.quantity}" readonly>
                <button type="button" class="qty-btn btn-cart-plus" data-index="${index}">+</button>
              </div>
              <div class="cart-item-price">
                ${window.CM.formatPrice(item.price * item.quantity)}
              </div>
            </div>

            <button type="button" class="remove-btn btn-cart-remove" data-index="${index}" title="Remove item" aria-label="Remove item">
              🗑️
            </button>
          </div>
        `).join('')}
      </div>

      <!-- SUMMARY -->
      <aside class="summary-card">
        <h3 style="margin-bottom:20px; font-size:1.3rem;">Order Summary</h3>

        <div class="summary-row">
          <span>Subtotal</span>
          <span style="font-weight:600;">${window.CM.formatPrice(subtotal)}</span>
        </div>

        <div class="summary-row">
          <span>Campus Delivery</span>
          <span style="font-weight:600; color:${shippingFee === 0 ? 'var(--success)' : 'inherit'};">
            ${shippingFee === 0 ? 'FREE' : window.CM.formatPrice(shippingFee)}
          </span>
        </div>

        ${shippingFee > 0 ? `
          <div style="font-size:0.8rem; color:var(--accent); background:var(--accent-light); padding:6px 10px; border-radius:4px; margin-bottom:12px;">
            Add items worth ${window.CM.formatPrice(500 - subtotal)} more for FREE campus delivery!
          </div>
        ` : `
          <div style="font-size:0.8rem; color:var(--success); background:var(--success-light); padding:6px 10px; border-radius:4px; margin-bottom:12px;">
            ✓ You unlocked FREE campus delivery!
          </div>
        `}

        <div class="summary-row total">
          <span>Total</span>
          <span style="color:var(--primary);">${window.CM.formatPrice(total)}</span>
        </div>

        <a href="checkout.html" class="btn btn-primary btn-block" style="margin-top:20px; font-size:1.05rem;">
          Proceed to Checkout →
        </a>

        <div style="text-align:center; margin-top:16px;">
          <a href="products.html" style="font-size:0.9rem; color:var(--muted); font-weight:600;">
            ← Continue Shopping
          </a>
        </div>
      </aside>
    </div>
  `;

  // Attach event handlers
  container.querySelectorAll('.btn-cart-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const cur = items[idx].quantity;
      window.CM.Cart.updateQty(idx, cur - 1);
    });
  });

  container.querySelectorAll('.btn-cart-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const cur = items[idx].quantity;
      window.CM.Cart.updateQty(idx, cur + 1);
    });
  });

  container.querySelectorAll('.btn-cart-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      window.CM.Cart.removeItem(idx);
      window.CM.toast('Item removed from cart');
    });
  });
}
