// CollegeMerch Authentication Controller (Login, Signup, Password Reset)

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotForm = document.getElementById('forgotForm');

  if (loginForm) initLogin(loginForm);
  if (signupForm) initSignup(signupForm);
  if (forgotForm) initForgotPassword(forgotForm);
});

// Login Page
function initLogin(form) {
  const getEmailInput = () => document.getElementById('liEmail') || document.getElementById('loginEmail') || form.querySelector('input[type="email"]');
  const getPassInput = () => document.getElementById('liPass') || document.getElementById('loginPassword') || form.querySelector('input[type="password"]');
  const errorEl = document.getElementById('liEmailErr') || document.getElementById('loginError');
  const submitBtn = document.getElementById('loginBtn') || form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    const emailInput = getEmailInput();
    const passInput = getPassInput();
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';

    if (!email || !password) {
      if (!email && document.getElementById('liEmailErr')) {
        document.getElementById('liEmailErr').textContent = 'Please enter your email.';
      }
      if (!password && document.getElementById('liPassErr')) {
        document.getElementById('liPassErr').textContent = 'Please enter your password.';
      }
      if (errorEl && !document.getElementById('liEmailErr')) {
        showError(errorEl, 'Please enter both your email address and password.');
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';
    }

    try {
      const data = await window.CM.api('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      window.CM.toast(`Welcome back, ${data.user.full_name || data.user.email}!`);

      // Check if redirect query param exists
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');

      setTimeout(() => {
        if (redirect) {
          window.location.href = redirect;
        } else if (data.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'account.html';
        }
      }, 400);
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      if (document.getElementById('liEmailErr')) {
        document.getElementById('liEmailErr').textContent = msg;
      } else {
        showError(errorEl, msg);
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    }
  });
}

// Signup Page
function initSignup(form) {
  const nameInput = document.getElementById('suName') || form.querySelector('input[type="text"]');
  const emailInput = document.getElementById('suEmail') || form.querySelector('input[type="email"]');
  const phoneInput = document.getElementById('suPhone') || form.querySelector('input[type="tel"]');
  const passInput = document.getElementById('suPass') || document.getElementById('suPassword') || form.querySelector('input[type="password"]');
  const confirmInput = document.getElementById('suConfirm') || document.getElementById('suConfirmPassword');
  const errorEl = document.getElementById('suEmailErr') || document.getElementById('signupError');
  const submitBtn = document.getElementById('signupBtn') || form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const confirmPassword = confirmInput ? confirmInput.value : password;

    let hasError = false;

    if (!name) {
      if (document.getElementById('suNameErr')) document.getElementById('suNameErr').textContent = 'Please enter your full name.';
      hasError = true;
    }

    if (!email || !email.includes('@')) {
      if (document.getElementById('suEmailErr')) document.getElementById('suEmailErr').textContent = 'Please enter a valid email address.';
      hasError = true;
    }

    if (!password || password.length < 6) {
      if (document.getElementById('suPassErr')) document.getElementById('suPassErr').textContent = 'Password must be at least 6 characters.';
      hasError = true;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      if (document.getElementById('suConfirmErr')) document.getElementById('suConfirmErr').textContent = 'Passwords do not match.';
      hasError = true;
    }

    if (hasError) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';
    }

    try {
      await window.CM.api('/api/auth/signup', {
        method: 'POST',
        body: { name, email, phone, password, confirmPassword }
      });

      window.CM.toast('Account created successfully! Welcome to NEXUS.');
      setTimeout(() => {
        window.location.href = 'account.html';
      }, 500);
    } catch (err) {
      const msg = err.message || 'Failed to create account.';
      if (document.getElementById('suEmailErr')) {
        document.getElementById('suEmailErr').textContent = msg;
      } else {
        showError(errorEl, msg);
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
      }
    }
  });
}

// Forgot Password Page
function initForgotPassword(form) {
  const emailInput = document.getElementById('fpEmail') || form.querySelector('input[type="email"]');
  const errorEl = document.getElementById('fpEmailErr') || document.getElementById('forgotError');
  const successEl = document.getElementById('fpSuccess') || document.getElementById('forgotSuccess');
  const submitBtn = document.getElementById('forgotBtn') || form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);
    if (successEl) successEl.style.display = 'none';

    const email = emailInput ? emailInput.value.trim() : '';
    if (!email || !email.includes('@')) {
      if (document.getElementById('fpEmailErr')) {
        document.getElementById('fpEmailErr').textContent = 'Please enter a valid email address.';
      } else {
        showError(errorEl, 'Please enter a valid email address.');
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending Reset Link...';
    }

    try {
      const data = await window.CM.api('/api/auth/forgot-password', {
        method: 'POST',
        body: { email }
      });

      if (successEl) {
        successEl.innerHTML = `
          <strong>Reset Link Dispatched:</strong><br>
          ${data.message}<br>
          ${data.token ? `
            <div style="margin-top:10px; padding:8px; background:#fff; border-radius:4px; font-size:0.85rem; border:1px solid #86efac;">
              <strong>Password Reset Link:</strong><br>
              <a href="${data.resetUrl}" style="color:var(--primary); font-weight:700; word-break:break-all;">Click to Reset Password</a>
            </div>
          ` : ''}
        `;
        successEl.style.display = 'block';
      } else {
        window.CM.toast(data.message);
      }
    } catch (err) {
      const msg = err.message || 'Could not process password reset request.';
      if (document.getElementById('fpEmailErr')) {
        document.getElementById('fpEmailErr').textContent = msg;
      } else {
        showError(errorEl, msg);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
      }
    }
  });
}

function clearErrors(form) {
  if (!form) return;
  form.querySelectorAll('.error-msg').forEach(el => {
    el.textContent = '';
  });
}

function showError(el, msg) {
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    window.CM.toast(msg, 'error');
  }
}
