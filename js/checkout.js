// CollegeMerch Checkout Controller

window.selectPayment = function(element) {
  document.querySelectorAll('.pay-option').forEach(opt => opt.classList.remove('selected'));
  element.classList.add('selected');
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
};

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('checkoutForm');
  const summaryEl = document.getElementById('coSummary');
  if (!form || !summaryEl) return;

  const items = window.CM.Cart.getItems();
  if (!items || items.length === 0) {
    const main = document.getElementById('checkoutMain');
    if (main) {
      main.innerHTML = `
        <div class="empty-state">
          <div class="emoji">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Please add items to your cart before proceeding to checkout.</p>
          <a href="products.html" class="btn btn-primary" style="margin-top:12px;">Browse Merchandise</a>
        </div>
      `;
    }
    return;
  }

  // Pre-populate if logged in
  try {
    const auth = await window.CM.api('/api/auth/me');
    if (auth && auth.user) {
      const u = auth.user;
      if (document.getElementById('coName')) document.getElementById('coName').value = u.full_name || '';
      if (document.getElementById('coEmail')) document.getElementById('coEmail').value = u.email || '';
      if (document.getElementById('coPhone') && u.phone) document.getElementById('coPhone').value = u.phone;
    }
  } catch (err) {
    // Guest checkout continues
  }

  renderCheckoutSummary(summaryEl, items);

  form.addEventListener('submit', handleCheckoutSubmit);
});

function renderCheckoutSummary(summaryEl, items) {
  const subtotal = window.CM.Cart.getSubtotal();
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingFee;

  summaryEl.innerHTML = `
    <div style="max-height: 220px; overflow-y: auto; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
      ${items.map(it => `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.88rem;">
          <div>
            <strong>${it.quantity}x</strong> ${it.name}
            ${it.selected_size ? `<span style="color:var(--muted); font-size:0.8rem;">(${it.selected_size})</span>` : ''}
          </div>
          <span style="font-weight:600;">${window.CM.formatPrice(it.price * it.quantity)}</span>
        </div>
      `).join('')}
    </div>

    <div class="summary-row">
      <span>Subtotal</span>
      <span>${window.CM.formatPrice(subtotal)}</span>
    </div>

    <div class="summary-row">
      <span>Campus Delivery</span>
      <span style="color:${shippingFee === 0 ? 'var(--success)' : 'inherit'};">
        ${shippingFee === 0 ? 'FREE' : window.CM.formatPrice(shippingFee)}
      </span>
    </div>

    <div class="summary-row total">
      <span>Total to Pay</span>
      <span style="color:var(--primary);">${window.CM.formatPrice(total)}</span>
    </div>
  `;
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('coName');
  const emailInput = document.getElementById('coEmail');
  const phoneInput = document.getElementById('coPhone');
  const addressInput = document.getElementById('coAddress');
  const cityInput = document.getElementById('coCity');
  const stateInput = document.getElementById('coState');
  const pinInput = document.getElementById('coPin');
  const placeBtn = document.getElementById('placeOrderBtn');

  // Clear previous errors
  const errFields = ['coNameErr', 'coEmailErr', 'coPhoneErr', 'coAddressErr', 'coCityErr', 'coStateErr', 'coPinErr'];
  errFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });

  let hasError = false;

  if (!nameInput.value.trim()) {
    document.getElementById('coNameErr').textContent = 'Please enter your full name.';
    hasError = true;
  }

  if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
    document.getElementById('coEmailErr').textContent = 'Please enter a valid email address.';
    hasError = true;
  }

  if (!phoneInput.value.trim() || phoneInput.value.trim().length < 8) {
    document.getElementById('coPhoneErr').textContent = 'Please enter a valid phone number.';
    hasError = true;
  }

  if (!addressInput.value.trim()) {
    document.getElementById('coAddressErr').textContent = 'Please enter delivery address or campus hostel/dept.';
    hasError = true;
  }

  if (!cityInput.value.trim()) {
    document.getElementById('coCityErr').textContent = 'Please enter city.';
    hasError = true;
  }

  if (!stateInput.value.trim()) {
    document.getElementById('coStateErr').textContent = 'Please enter state.';
    hasError = true;
  }

  if (!pinInput.value.trim() || pinInput.value.trim().length < 4) {
    document.getElementById('coPinErr').textContent = 'Please enter a valid PIN code.';
    hasError = true;
  }

  if (hasError) {
    window.CM.toast('Please correct the errors in the form.', 'error');
    return;
  }

  const items = window.CM.Cart.getItems();
  if (!items || items.length === 0) {
    window.CM.toast('Your cart is empty', 'error');
    return;
  }

  const subtotal = window.CM.Cart.getSubtotal();
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingFee;

  const paymentRadio = document.querySelector('input[name="payment"]:checked');
  const paymentMethod = paymentRadio ? paymentRadio.value : 'UPI';

  const orderPayload = {
    customer_name: nameInput.value.trim(),
    customer_email: emailInput.value.trim(),
    customer_phone: phoneInput.value.trim(),
    shipping_address: addressInput.value.trim(),
    city: cityInput.value.trim(),
    state: stateInput.value.trim(),
    pin_code: pinInput.value.trim(),
    payment_method: paymentMethod,
    items: items.map(it => ({
      product_id: it.id,
      product_name: it.name,
      product_image: it.image,
      price: it.price,
      quantity: it.quantity,
      selected_size: it.selected_size,
      selected_color: it.selected_color
    })),
    total_amount: total,
    shipping_fee: shippingFee
  };

  placeBtn.disabled = true;
  placeBtn.textContent = 'Processing Order...';

  try {
    const res = await window.CM.api('/api/orders', {
      method: 'POST',
      body: orderPayload
    });

    if (res.order && res.order.id) {
      window.CM.Cart.clear();
      window.location.href = `order-success.html?id=${res.order.id}`;
    } else {
      throw new Error('Could not process order. Please try again.');
    }
  } catch (err) {
    window.CM.toast(err.message || 'Failed to place order.', 'error');
    placeBtn.disabled = false;
    placeBtn.textContent = 'Place Order';
  }
}
