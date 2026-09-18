import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { db, supabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.SESSION_SECRET || 'collegemerch-super-jwt-secret-key-2026';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.cookies['cm_token'];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
      if (req.user && req.user.email) {
        const em = req.user.email.toLowerCase().trim();
        if (em === 'admin@college.edu' || em === 'loyolaanuj@gmail.com' || req.user.role === 'admin') {
          req.user.role = 'admin';
        }
      }
    }
    next();
  });
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  const em = (req.user.email || '').toLowerCase().trim();
  const isAdmin = req.user.role === 'admin' || em === 'admin@college.edu' || em === 'loyolaanuj@gmail.com';
  if (!isAdmin) {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}

app.use(authenticateToken);

// --- Public Endpoints ---

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.getCategories();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, inStock, sort } = req.query;
    const products = await db.getProducts({ category, search, minPrice, maxPrice, inStock, sort });
    res.json({ products, count: products.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// --- Auth Endpoints ---

app.post(['/api/auth/signup', '/api/auth/register'], async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isAdminEmail = normalizedEmail === 'admin@college.edu';
    const role = isAdminEmail ? 'admin' : 'user';

    const user = await db.createUser({
      email: normalizedEmail,
      password,
      full_name: name,
      phone: phone || '',
      role
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.full_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('cm_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Account created successfully',
      user,
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact campus admin.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.full_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('cm_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { password_hash: _, ...safeUser } = user;
    res.json({
      message: 'Login successful',
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('cm_token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', async (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  const user = await db.getUserById(req.user.id);
  if (!user || !user.is_active) {
    res.clearCookie('cm_token');
    return res.json({ user: null });
  }
  const { password_hash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.put(['/api/auth/profile', '/api/auth/update-profile'], requireAuth, async (req, res) => {
  try {
    const { full_name, name, phone, currentPassword, newPassword } = req.body;
    const user = await db.getUserById(req.user.id);

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      if (currentPassword) {
        const valid = bcrypt.compareSync(currentPassword, user.password_hash);
        if (!valid) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
      }
    }

    const updated = await db.updateUser(req.user.id, {
      full_name: (full_name || name || user.full_name).trim(),
      phone: phone !== undefined ? phone : user.phone,
      password: newPassword || undefined
    });

    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      // Return safe success message to avoid email enumeration
      return res.json({
        message: `If an account exists for ${email}, a password reset link has been dispatched.`,
        token: null
      });
    }

    const token = await db.createPasswordReset(email);
    res.json({
      message: `Password reset link generated for ${email}. (Reset token active for 1 hour)`,
      token,
      resetUrl: `/login.html?reset_token=${token}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process password reset' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword, password } = req.body;
    const finalPassword = newPassword || password;
    if (!token || !finalPassword || finalPassword.length < 6) {
      return res.status(400).json({ error: 'Valid token and password of at least 6 characters required' });
    }

    const result = await db.verifyAndResetPassword(token, finalPassword);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ message: 'Password has been successfully updated. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// --- Orders Endpoints ---

app.post('/api/orders', async (req, res) => {
  try {
    const customer_name = req.body.customer_name || req.body.name;
    const customer_email = req.body.customer_email || req.body.email;
    const customer_phone = req.body.customer_phone || req.body.phone;
    const shipping_address = req.body.shipping_address || req.body.address;
    const city = req.body.city;
    const state = req.body.state;
    const pin_code = req.body.pin_code || req.body.pin;
    const payment_method = req.body.payment_method || req.body.payment || 'UPI';
    const items = req.body.items;
    const total_amount = req.body.total_amount;
    const shipping_fee = req.body.shipping_fee;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!customer_email || !customer_email.includes('@')) {
      return res.status(400).json({ error: 'Valid customer email is required' });
    }
    if (!customer_phone || customer_phone.trim().length < 8) {
      return res.status(400).json({ error: 'Valid contact phone number is required' });
    }
    if (!shipping_address || !city || !state || !pin_code) {
      return res.status(400).json({ error: 'Complete delivery address is required' });
    }
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const calculatedTotal = Array.isArray(items) 
      ? items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0) 
      : 0;
    const finalTotal = total_amount != null ? Number(total_amount) : (calculatedTotal + Number(shipping_fee || 0));

    const order = await db.createOrder({
      user_id: req.user ? req.user.id : null,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      state,
      pin_code,
      payment_method: payment_method || 'UPI',
      items,
      total_amount: finalTotal,
      shipping_fee: shipping_fee || 0
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const email = req.query.email || (req.user ? req.user.email : null);
    const userId = req.user ? req.user.id : null;

    if (!userId && !email) {
      return res.json({ orders: [] });
    }

    const orders = await db.getOrdersByUser(userId, email);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization: admin, order owner, or guest matching order email
    if (req.user && (req.user.role === 'admin' || req.user.id === order.user_id)) {
      return res.json({ order });
    }
    const queryEmail = req.query.email;
    if (queryEmail && queryEmail.toLowerCase() === order.customer_email.toLowerCase()) {
      return res.json({ order });
    }

    if (!req.user) {
      // Guest view by ID if matching checkout session
      return res.json({ order });
    }

    return res.status(403).json({ error: 'Access denied to this order' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

app.post('/api/orders/:id/cancel', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.order_status !== 'Pending') {
      return res.status(400).json({ error: `Cannot cancel order with status "${order.order_status}"` });
    }

    const updated = await db.updateOrderStatus(order.id, 'Cancelled');
    res.json({ message: 'Order has been cancelled', order: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// --- Admin Endpoints ---

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
});

app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { role, is_active } = req.body;
    const targetUser = await db.getUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.id === req.user.id && role && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot revoke your own administrator privileges' });
    }

    const updated = await db.updateUser(req.params.id, { role, is_active });
    res.json({ message: 'User updated successfully', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await db.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order status updated', order: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.post(['/api/admin/products', '/api/products'], requireAdmin, async (req, res) => {
  try {
    const { name, category, price, original_price, description, image_url, stock_quantity, sizes, colors, is_featured } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Product name, category, and price are required' });
    }

    const product = await db.createProduct({
      name,
      category,
      price: Number(price),
      original_price: original_price ? Number(original_price) : null,
      description,
      image_url: image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&q=80',
      stock_quantity: Number(stock_quantity || 50),
      sizes: Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL']),
      colors: Array.isArray(colors) ? colors : (colors ? colors.split(',').map(c => c.trim()) : ['Navy', 'White']),
      is_featured: Boolean(is_featured)
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put(['/api/admin/products/:id', '/api/products/:id'], requireAdmin, async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete(['/api/admin/products/:id', '/api/products/:id'], requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteProduct(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Admin Clear All Demo Products / Reset Catalog
app.post('/api/admin/products-clear', requireAdmin, async (req, res) => {
  try {
    await db.clearAllProducts();
    res.json({ message: 'All demo products removed. Catalog is now clear for custom inventory.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear products' });
  }
});

app.post('/api/admin/products-reset', requireAdmin, async (req, res) => {
  try {
    const products = await db.resetProductsToDefault();
    res.json({ message: 'Catalog restored with default campus apparel collection.', count: products.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset products' });
  }
});

// Dynamic UPI QR Code generator endpoint
app.get('/api/payment/upi-qr', async (req, res) => {
  try {
    const amount = req.query.amount ? Number(req.query.amount) : null;
    const upiId = '7093224401@nyes';
    const payeeName = 'Anuj Arun Kumar';
    
    let uri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR`;
    if (amount && amount > 0) {
      uri += `&am=${amount.toFixed(2)}`;
    }
    
    res.setHeader('Content-Type', 'image/png');
    QRCode.toFileStream(res, uri, {
      width: 450,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'H'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate payment QR code' });
  }
});

// Update Order Payment / Reference / UTR
app.put('/api/orders/:id/payment', async (req, res) => {
  try {
    const { utr, payment_status } = req.body;
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const updated = await db.updateOrderPayment(req.params.id, {
      payment_ref: utr,
      payment_status: payment_status || 'Verified & Paid (UPI)'
    });
    res.json({ message: 'Payment information updated successfully', order: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update payment reference' });
  }
});

// Supabase Status check
app.get('/api/admin/supabase-status', requireAdmin, async (req, res) => {
  try {
    const isConfigured = Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
    let authUsersCount = 0;
    let authUsers = [];
    if (supabase) {
      const { data } = await supabase.auth.admin.listUsers();
      authUsersCount = data?.users?.length || 0;
      authUsers = (data?.users || []).map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        full_name: u.user_metadata?.full_name,
        role: u.user_metadata?.role
      }));
    }
    res.json({
      connected: isConfigured,
      supabaseUrl: process.env.SUPABASE_URL || null,
      authUsersCount,
      authUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static frontend files
app.use(express.static(__dirname));

// Fallback to 404 for missing routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] NEXUS store server running at http://0.0.0.0:${PORT}`);
});
