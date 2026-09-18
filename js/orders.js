// CollegeMerch Orders & Order Success Controller

document.addEventListener('DOMContentLoaded', async () => {
  const ordersContainer = document.getElementById('ordersContent');
  const detailContainer = document.getElementById('orderDetailContent');
  const successContainer = document.getElementById('successContent');

  if (ordersContainer) {
    initOrdersList(ordersContainer);
  } else if (detailContainer) {
    initOrderDetail(detailContainer);
  } else if (successContainer) {
    initOrderSuccess(successContainer);
  }
});

// 1. Orders List Page
async function initOrdersList(container) {
  container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--muted);">Loading your orders...</div>`;

  try {
    const data = await window.CM.api('/api/orders');
    const orders = data.orders || [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="emoji">📦</div>
          <h2>No Orders Found</h2>
          <p>You haven't placed any merchandise orders yet.</p>
          <a href="products.html" class="btn btn-primary" style="margin-top:12px;">Shop Merchandise</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
        <span style="color:var(--muted); font-size:0.9rem;">Found ${orders.length} order${orders.length === 1 ? '' : 's'}</span>
        <a href="products.html" class="btn btn-sm btn-outline">+ Continue Shopping</a>
      </div>

      ${orders.map(order => {
        const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        return `
          <div class="order-card" id="order-${order.id}">
            <div class="order-card-header">
              <div>
                <strong style="font-size:1.05rem; color:var(--primary);">${order.id}</strong>
                <span style="font-size:0.85rem; color:var(--muted); margin-left:8px;">Placed on ${orderDate}</span>
              </div>
              <span class="order-status-badge ${order.order_status}">${order.order_status}</span>
            </div>

            <!-- ITEMS PREVIEW -->
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
              ${(order.items || []).map(item => `
                <div style="display:flex; align-items:center; gap:12px;">
                  <img src="${item.product_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100'}" alt="${item.product_name}" style="width:48px; height:48px; border-radius:6px; object-fit:cover; border:1px solid var(--border);">
                  <div style="flex:1;">
                    <div style="font-weight:600; font-size:0.9rem;">${item.product_name}</div>
                    <div style="font-size:0.8rem; color:var(--muted);">
                      Qty: ${item.quantity} ${item.selected_size ? `· Size: ${item.selected_size}` : ''}
                    </div>
                  </div>
                  <div style="font-weight:600; font-size:0.95rem;">
                    ${window.CM.formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="border-top:1px solid var(--border); padding-top:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <div>
                <span style="font-size:0.85rem; color:var(--muted);">Total: </span>
                <strong style="font-size:1.15rem; color:var(--text);">${window.CM.formatPrice(order.total_amount)}</strong>
                <span style="font-size:0.8rem; color:var(--muted); margin-left:8px;">(${order.payment_method})</span>
              </div>

              <a href="order-details.html?id=${order.id}" class="btn btn-outline btn-sm">
                View Order Details →
              </a>
            </div>
          </div>
        `;
      }).join('')}
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="emoji">⚠️</div>
        <h2>Could Not Load Orders</h2>
        <p>${err.message || 'Please log in to view your orders.'}</p>
        <a href="login.html" class="btn btn-primary">Login</a>
      </div>
    `;
  }
}

// 2. Order Details Page
async function initOrderDetail(container) {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  if (!orderId) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="emoji">❓</div>
        <h2>Order Not Specified</h2>
        <p>Please select an order from your order history.</p>
        <a href="orders.html" class="btn btn-primary">View All Orders</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--muted);">Loading order details...</div>`;

  try {
    const data = await window.CM.api(`/api/orders/${orderId}`);
    const order = data.order;

    if (!order) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="emoji">🔍</div>
          <h2>Order Not Found</h2>
          <p>The specified order could not be located in our records.</p>
          <a href="orders.html" class="btn btn-primary">View Orders</a>
        </div>
      `;
      return;
    }

    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const isPending = order.order_status === 'Pending';

    container.innerHTML = `
      <div style="margin-bottom:20px;">
        <a href="orders.html" style="font-size:0.9rem; color:var(--muted); font-weight:600;">← Back to My Orders</a>
      </div>

      <div class="summary-card" style="margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <div>
            <h2 style="font-size:1.4rem; color:var(--primary); margin-bottom:4px;">Order #${order.id}</h2>
            <div style="color:var(--muted); font-size:0.88rem;">Placed on ${orderDate}</div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="order-status-badge ${order.order_status}" style="font-size:0.9rem; padding:6px 14px;">
              ${order.order_status}
            </span>
            ${isPending ? `
              <button type="button" class="btn btn-danger btn-sm" id="cancelOrderBtn">
                Cancel Order
              </button>
            ` : ''}
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; padding:16px; background:var(--surface-alt); border-radius:var(--radius); margin-bottom:20px; font-size:0.9rem;">
          <div>
            <strong style="display:block; margin-bottom:4px; color:var(--text);">Delivery Address</strong>
            <div>${order.customer_name}</div>
            <div style="color:var(--muted);">${order.shipping_address}</div>
            <div style="color:var(--muted);">${order.city}, ${order.state} - ${order.pin_code}</div>
            <div style="color:var(--muted); margin-top:4px;">Phone: ${order.customer_phone}</div>
          </div>
          <div>
            <strong style="display:block; margin-bottom:4px; color:var(--text);">Payment &amp; Status</strong>
            <div>Method: <strong>${order.payment_method}</strong></div>
            <div style="color:var(--muted);">Payment Status: <span style="color:var(--success); font-weight:600;">${order.payment_status}</span></div>
            <div style="color:var(--muted); margin-top:4px;">Confirmation Email: ${order.customer_email}</div>
          </div>
        </div>

        <!-- ITEMS BREAKDOWN -->
        <h3 style="font-size:1.15rem; margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid var(--border);">
          Items in this Order (${(order.items || []).length})
        </h3>

        <div style="margin-bottom:24px;">
          ${(order.items || []).map(it => `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 0; border-bottom:1px solid var(--border);">
              <div style="display:flex; align-items:center; gap:14px;">
                <img src="${it.product_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100'}" alt="${it.product_name}" style="width:60px; height:60px; border-radius:6px; object-fit:cover;">
                <div>
                  <div style="font-weight:700;"><a href="product-details.html?id=${it.product_id}">${it.product_name}</a></div>
                  <div style="font-size:0.85rem; color:var(--muted);">
                    Qty: ${it.quantity} ${it.selected_size ? `| Size: ${it.selected_size}` : ''} ${it.selected_color ? `| Color: ${it.selected_color}` : ''}
                  </div>
                  <div style="font-size:0.85rem; color:var(--primary);">
                    ${window.CM.formatPrice(it.price)} each
                  </div>
                </div>
              </div>
              <div style="font-weight:700; font-size:1.05rem;">
                ${window.CM.formatPrice(it.price * it.quantity)}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- TOTALS -->
        <div style="max-width:320px; margin-left:auto; font-size:0.95rem;">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${window.CM.formatPrice(order.total_amount - (order.shipping_fee || 0))}</span>
          </div>
          <div class="summary-row">
            <span>Campus Delivery</span>
            <span>${order.shipping_fee === 0 ? 'FREE' : window.CM.formatPrice(order.shipping_fee)}</span>
          </div>
          <div class="summary-row total">
            <span>Total Paid</span>
            <span style="color:var(--primary);">${window.CM.formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>
    `;

    // Cancel order handler
    const cancelBtn = container.querySelector('#cancelOrderBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', async () => {
        const confirmed = await window.CM.confirmModal({
          title: 'Cancel Order',
          message: 'Are you sure you want to cancel this pending order?',
          confirmText: 'Yes, Cancel Order',
          confirmClass: 'btn-danger'
        });
        if (!confirmed) return;
        try {
          cancelBtn.disabled = true;
          cancelBtn.textContent = 'Cancelling...';
          await window.CM.api(`/api/orders/${order.id}/cancel`, { method: 'POST' });
          window.CM.toast('Order cancelled successfully');
          initOrderDetail(container);
        } catch (err) {
          window.CM.toast(err.message || 'Could not cancel order', 'error');
          cancelBtn.disabled = false;
          cancelBtn.textContent = 'Cancel Order';
        }
      });
    }
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="emoji">⚠️</div>
        <h2>Error Loading Details</h2>
        <p>${err.message}</p>
        <a href="orders.html" class="btn btn-primary">Back to Orders</a>
      </div>
    `;
  }
}

// 3. Order Success Page
async function initOrderSuccess(container) {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  let order = null;
  if (orderId) {
    try {
      const res = await window.CM.api(`/api/orders/${orderId}`);
      if (res && res.order) {
        order = res.order;
      }
    } catch (e) {
      console.warn('Could not fetch full order details:', e);
    }
  }

  const isUPI = !order || order.payment_method === 'UPI';
  const totalAmount = order ? order.total_amount : null;
  const upiId = '7093224401@nyes';
  const payeeName = 'Anuj Arun Kumar';
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}${totalAmount ? `&am=${totalAmount.toFixed(2)}` : ''}&cu=INR`;
  const qrUrl = totalAmount ? `/api/payment/upi-qr?amount=${totalAmount}` : `/images/upi-qr.png`;

  container.innerHTML = `
    <div class="empty-state" style="max-width:720px; margin:40px auto; padding:40px 24px; text-align:center;">
      <div style="font-size:3.2rem; margin-bottom:8px;">🎉</div>
      <h1 style="font-size:2rem; color:var(--primary); margin-bottom:8px;">Order Placed Successfully!</h1>
      <p style="font-size:1rem; color:var(--muted); margin-bottom:24px;">
        Thank you for ordering with NEXUS Official Campus Store. Your order has been placed.
      </p>

      ${orderId ? `
        <div style="background:var(--surface-alt); border:1px solid var(--border); padding:16px 20px; border-radius:var(--radius); margin-bottom:24px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div>
              <div style="font-size:0.82rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.05em; font-weight:700;">Order Reference ID</div>
              <div style="font-size:1.35rem; font-weight:800; color:var(--primary); letter-spacing:0.02em;">
                ${orderId}
              </div>
            </div>
            ${totalAmount ? `
              <div style="text-align:right;">
                <div style="font-size:0.82rem; color:var(--muted);">Total Payable</div>
                <div style="font-size:1.4rem; font-weight:800; color:var(--primary);">${window.CM.formatPrice(totalAmount)}</div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      ${isUPI ? `
        <!-- UPI PAYMENT CARD -->
        <div style="background:#ffffff; border:2px solid var(--border); border-radius:12px; padding:28px 20px; margin-bottom:28px; box-shadow:0 4px 20px rgba(0,0,0,0.06); text-align:center;">
          <div style="display:inline-flex; align-items:center; gap:8px; background:#ecfdf5; color:#065f46; font-size:0.85rem; font-weight:700; padding:4px 14px; border-radius:9999px; margin-bottom:14px;">
            <span>⚡ Scan &amp; Pay via Any UPI App</span>
          </div>

          <h3 style="font-size:1.25rem; color:var(--text); margin-bottom:6px;">Scan to Complete Payment</h3>
          <p style="font-size:0.88rem; color:var(--muted); margin-bottom:18px;">
            Google Pay · PhonePe · Paytm · navi · BHIM UPI
          </p>

          <div style="display:inline-block; background:#ffffff; padding:12px; border-radius:12px; border:2px solid var(--border); margin-bottom:16px;">
            <img src="${qrUrl}" alt="UPI Payment QR Code" style="width:230px; height:230px; object-fit:contain; display:block; margin:0 auto; border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--muted); margin-top:6px; font-weight:600;">navi UPI Verified Merchant</div>
          </div>

          <div style="background:var(--surface-alt); padding:12px 16px; border-radius:8px; max-width:400px; margin:0 auto 16px; border:1px solid var(--border); text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:0.8rem; color:var(--muted);">Payee Name:</span>
              <strong style="font-size:0.9rem; color:var(--text);">${payeeName}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.8rem; color:var(--muted);">UPI ID:</span>
              <div style="display:flex; align-items:center; gap:8px;">
                <code style="background:#fff; padding:2px 8px; border-radius:4px; font-weight:700; color:var(--primary); font-size:0.88rem; border:1px solid var(--border);">${upiId}</code>
                <button type="button" id="copyUpiBtn" class="btn btn-sm btn-outline" style="padding:2px 8px; font-size:0.75rem;">Copy</button>
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-bottom:16px;">
            <a href="${upiDeepLink}" class="btn btn-primary" style="font-size:0.9rem;">
              📱 Open in UPI App
            </a>
          </div>

          <!-- UTR REFERENCE SUBMIT FORM -->
          <div style="max-width:450px; margin:18px auto 0; padding-top:16px; border-top:1px dashed var(--border);">
            <label for="utrInput" style="display:block; font-size:0.85rem; font-weight:600; color:var(--text); margin-bottom:6px; text-align:left;">
              Have you made the payment? Enter UPI Reference / UTR No. (Optional):
            </label>
            <div style="display:flex; gap:8px;">
              <input type="text" id="utrInput" placeholder="e.g. 423981293812" style="flex:1; padding:8px 12px; border:1px solid var(--border); border-radius:6px; font-size:0.88rem;">
              <button type="button" id="submitUtrBtn" class="btn btn-sm btn-accent" style="white-space:nowrap;">Submit UTR</button>
            </div>
            <div id="utrSuccessMsg" style="display:none; color:var(--success); font-size:0.82rem; margin-top:6px; text-align:left; font-weight:600;">
              ✓ Payment reference recorded. Thank you!
            </div>
          </div>
        </div>
      ` : ''}

      <div style="display:flex; gap:14px; justify-content:center; flex-wrap:wrap;">
        ${orderId ? `<a href="order-details.html?id=${orderId}" class="btn btn-primary">View Full Order</a>` : ''}
        <a href="orders.html" class="btn btn-outline">My Orders</a>
        <a href="products.html" class="btn btn-accent">Continue Shopping</a>
      </div>
    </div>
  `;

  // Attach interactive copy UPI ID
  const copyBtn = container.querySelector('#copyUpiBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(upiId).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        window.CM.toast('UPI ID copied to clipboard: ' + upiId);
      }).catch(() => {
        window.CM.toast('UPI ID: ' + upiId);
      });
    });
  }

  // Attach UTR submit handler
  const submitUtrBtn = container.querySelector('#submitUtrBtn');
  const utrInput = container.querySelector('#utrInput');
  const utrSuccessMsg = container.querySelector('#utrSuccessMsg');
  if (submitUtrBtn && utrInput && orderId) {
    submitUtrBtn.addEventListener('click', async () => {
      const utrVal = utrInput.value.trim();
      if (!utrVal || utrVal.length < 6) {
        window.CM.toast('Please enter a valid UPI reference or UTR number.', 'error');
        return;
      }
      try {
        submitUtrBtn.disabled = true;
        submitUtrBtn.textContent = 'Saving...';
        await window.CM.api(`/api/orders/${orderId}/payment`, {
          method: 'PUT',
          body: { utr: utrVal, payment_status: 'Completed (UPI Verified: ' + utrVal + ')' }
        });
        if (utrSuccessMsg) utrSuccessMsg.style.display = 'block';
        submitUtrBtn.textContent = 'Saved ✓';
        window.CM.toast('Payment reference linked to order ' + orderId);
      } catch (err) {
        window.CM.toast(err.message || 'Could not update payment reference', 'error');
        submitUtrBtn.disabled = false;
        submitUtrBtn.textContent = 'Submit UTR';
      }
    });
  }
}
