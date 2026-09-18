import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '.data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialCategories = [
  { id: 'cat-tshirts', name: 'T-Shirts', slug: 't-shirts', description: 'Comfortable, durable 100% cotton college t-shirts', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80' },
  { id: 'cat-hoodies', name: 'Hoodies', slug: 'hoodies', description: 'Cozy campus fleece hoodies and pullovers', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' },
  { id: 'cat-jackets', name: 'Jackets', slug: 'jackets', description: 'Varsity jackets, bombers and windbreakers', image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80' },
  { id: 'cat-caps', name: 'Caps', slug: 'caps', description: 'Embroidered campus caps, beanies and visors', image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80' },
  { id: 'cat-bags', name: 'Bags', slug: 'bags', description: 'Campus backpacks, totes and duffle bags', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
  { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', description: 'Pins, keychains, lanyards and wristbands', image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80' },
  { id: 'cat-stationery', name: 'Stationery', slug: 'stationery', description: 'Hardcover notebooks, metal pens and planners', image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80' },
  { id: 'cat-lifestyle', name: 'Lifestyle', slug: 'lifestyle', description: 'Insulated tumblers, mugs, stickers and bottles', image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80' }
];

const initialProducts = [
  {
    id: 'prod-001',
    title: 'Classic Crest T-Shirt',
    category: 'T-Shirts',
    price: 499,
    original_price: 699,
    description: '100% bio-washed cotton t-shirt featuring the official university crest. Pre-shrunk fabric with reinforced collar for everyday campus wear.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    in_stock: true,
    stock_quantity: 45,
    is_featured: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'Heather Grey', 'Classic Black'],
    rating: 4.9,
    review_count: 54,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-002',
    title: 'Vintage Varsity Hoodie',
    category: 'Hoodies',
    price: 1299,
    original_price: 1599,
    description: 'Heavyweight fleece hoodie with ribbed cuffs, spacious kangaroo pocket, and high-density collegiate varsity embroidery across the chest.',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    in_stock: true,
    stock_quantity: 30,
    is_featured: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Collegiate Navy', 'Crimson Red', 'Forest Green'],
    rating: 4.8,
    review_count: 82,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-003',
    title: 'Campus Windbreaker Jacket',
    category: 'Jackets',
    price: 1499,
    original_price: 1899,
    description: 'Water-resistant nylon shell with breathable mesh lining, weather-sealed zippers, and collapsible hood. Perfect for rainy campus commutes.',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    in_stock: true,
    stock_quantity: 18,
    is_featured: true,
    sizes: ['M', 'L', 'XL'],
    colors: ['Navy/White Dual Tone', 'All Black'],
    rating: 4.7,
    review_count: 31,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-004',
    title: 'Heritage Embroidered Cap',
    category: 'Caps',
    price: 299,
    original_price: 399,
    description: '6-panel structured cotton twill baseball cap with brass buckle strap and 3D embroidered college monogram.',
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
    in_stock: true,
    stock_quantity: 60,
    is_featured: true,
    sizes: ['One Size Fits All'],
    colors: ['Navy Blue', 'Maroon', 'Charcoal'],
    rating: 4.6,
    review_count: 40,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-005',
    title: 'Canvas Campus Backpack',
    category: 'Bags',
    price: 899,
    original_price: 1199,
    description: 'Durable 25L water-repellent canvas backpack with padded 15.6" laptop sleeve, dual bottle holders, and ergonomic shoulder straps.',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    in_stock: true,
    stock_quantity: 25,
    is_featured: true,
    sizes: ['Standard 25L'],
    colors: ['Vintage Tan', 'Navy Blue', 'Olive'],
    rating: 4.9,
    review_count: 67,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-006',
    title: 'College Enamel Pin Set (3-Pack)',
    category: 'Accessories',
    price: 199,
    original_price: 299,
    description: 'Gold-plated hard enamel pins featuring the college mascot, motto banner, and graduation cap. Secure rubber clutch backings.',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    in_stock: true,
    stock_quantity: 80,
    is_featured: false,
    sizes: ['Set of 3'],
    colors: ['Multi / Gold'],
    rating: 4.9,
    review_count: 19,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-007',
    title: 'Hardcover Crest Notebook',
    category: 'Stationery',
    price: 249,
    original_price: 349,
    description: '192 ruled pages of 100gsm acid-free ivory paper, ribbon bookmark, expandable inner pocket, and gold foil embossed emblem cover.',
    image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80',
    in_stock: true,
    stock_quantity: 50,
    is_featured: false,
    sizes: ['A5'],
    colors: ['Midnight Blue', 'Burgundy'],
    rating: 4.8,
    review_count: 28,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-008',
    title: 'Insulated Stainless Steel Tumbler',
    category: 'Lifestyle',
    price: 599,
    original_price: 799,
    description: 'Double-walled vacuum insulated 500ml flask keeping coffee hot for 12 hrs or cold water ice-chilled for 24 hrs. BPA-free leakproof lid.',
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80',
    in_stock: true,
    stock_quantity: 35,
    is_featured: true,
    sizes: ['500 ml'],
    colors: ['Matte Black', 'Brushed Steel', 'College Blue'],
    rating: 4.9,
    review_count: 45,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-009',
    title: 'Oversized Campus Spirit Tee',
    category: 'T-Shirts',
    price: 549,
    original_price: 749,
    description: 'Trendy drop-shoulder streetwear fit crafted from 240 GSM heavy cotton loopback jersey. Bold back typography print.',
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
    in_stock: true,
    stock_quantity: 40,
    is_featured: false,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Chalk White', 'Sage Green', 'Vintage Black'],
    rating: 4.7,
    review_count: 22,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-010',
    title: 'Premium Fleece Zip Hoodie',
    category: 'Hoodies',
    price: 1399,
    original_price: 1799,
    description: 'Full-zip fleece jacket with YKK metal zipper, soft brushed interior, contrast drawstrings, and embroidered chest emblem.',
    image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
    in_stock: false,
    stock_quantity: 0,
    is_featured: false,
    sizes: ['M', 'L', 'XL'],
    colors: ['Oatmeal Heather', 'Deep Navy'],
    rating: 4.8,
    review_count: 36,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-011',
    title: 'Heavy Duty Crest Tote Bag',
    category: 'Bags',
    price: 349,
    original_price: 499,
    description: '100% organic 380 GSM canvas tote with long shoulder handles and reinforced box stitching. Fits 15" laptop and textbooks comfortably.',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    in_stock: true,
    stock_quantity: 55,
    is_featured: false,
    sizes: ['Standard'],
    colors: ['Natural Off-White', 'Black'],
    rating: 4.6,
    review_count: 15,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-012',
    title: 'Embroidered Knit Beanie',
    category: 'Caps',
    price: 299,
    original_price: 399,
    description: 'Soft ribbed acrylic knit winter beanie with fold-over cuff and centered woven college crest patch.',
    image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80',
    in_stock: true,
    stock_quantity: 40,
    is_featured: false,
    sizes: ['One Size'],
    colors: ['Charcoal Grey', 'Navy', 'Burgundy'],
    rating: 4.7,
    review_count: 18,
    created_at: new Date().toISOString()
  }
];

function initializeDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const studentPassHash = bcrypt.hashSync('student123', 10);
    const adminPassHash = bcrypt.hashSync('admin123', 10);

    const initialUsers = [
      {
        id: 'usr-student-01',
        name: 'Aarav Sharma',
        email: 'aarav@college.com',
        phone: '+91 98765 43210',
        password_hash: studentPassHash,
        role: 'user',
        created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'usr-admin-01',
        name: 'College Store Admin',
        email: 'admin@college.com',
        phone: '+91 98111 22334',
        password_hash: adminPassHash,
        role: 'admin',
        created_at: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const initialOrders = [
      {
        id: 'ORD-2026-1001',
        user_id: 'usr-student-01',
        customer_name: 'Aarav Sharma',
        customer_email: 'aarav@college.com',
        customer_phone: '+91 98765 43210',
        shipping_address: 'Room 304, Boys Hostel B, University Campus',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500010',
        payment_method: 'UPI',
        payment_status: 'Paid',
        subtotal: 1798.00,
        shipping_fee: 0.00,
        total_amount: 1798.00,
        status: 'Delivered',
        created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
        items: [
          {
            id: 'item-001',
            order_id: 'ORD-2026-1001',
            product_id: 'prod-001',
            product_title: 'Classic Crest T-Shirt',
            product_image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
            price: 499.00,
            quantity: 1,
            size: 'L',
            color: 'Navy',
            subtotal: 499.00
          },
          {
            id: 'item-002',
            order_id: 'ORD-2026-1001',
            product_id: 'prod-002',
            product_title: 'Vintage Varsity Hoodie',
            product_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
            price: 1299.00,
            quantity: 1,
            size: 'L',
            color: 'Collegiate Navy',
            subtotal: 1299.00
          }
        ]
      },
      {
        id: 'ORD-2026-1002',
        user_id: 'usr-student-01',
        customer_name: 'Aarav Sharma',
        customer_email: 'aarav@college.com',
        customer_phone: '+91 98765 43210',
        shipping_address: 'Room 304, Boys Hostel B, University Campus',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500010',
        payment_method: 'Card',
        payment_status: 'Paid',
        subtotal: 899.00,
        shipping_fee: 0.00,
        total_amount: 899.00,
        status: 'Processing',
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        items: [
          {
            id: 'item-003',
            order_id: 'ORD-2026-1002',
            product_id: 'prod-005',
            product_title: 'Canvas Campus Backpack',
            product_image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
            price: 899.00,
            quantity: 1,
            size: 'Standard 25L',
            color: 'Vintage Tan',
            subtotal: 899.00
          }
        ]
      }
    ];

    const data = {
      users: initialUsers,
      categories: initialCategories,
      products: initialProducts,
      orders: initialOrders
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

initializeDatabase();

function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    initializeDatabase();
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  // PRODUCTS
  getProducts(filters = {}) {
    const data = readDb();
    let list = [...data.products];

    if (filters.category && filters.category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (filters.price && filters.price !== 'All') {
      if (filters.price === '0-299') {
        list = list.filter(p => p.price < 300);
      } else if (filters.price === '300-699') {
        list = list.filter(p => p.price >= 300 && p.price <= 699);
      } else if (filters.price === '700+') {
        list = list.filter(p => p.price >= 700);
      }
    }

    if (filters.availability && filters.availability !== 'All') {
      if (filters.availability === 'instock') {
        list = list.filter(p => p.in_stock && p.stock_quantity > 0);
      } else if (filters.availability === 'out') {
        list = list.filter(p => !p.in_stock || p.stock_quantity <= 0);
      }
    }

    if (filters.featured === 'true' || filters.featured === true) {
      list = list.filter(p => p.is_featured);
    }

    if (filters.sort) {
      if (filters.sort === 'az') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      } else if (filters.sort === 'low') {
        list.sort((a, b) => a.price - b.price);
      } else if (filters.sort === 'high') {
        list.sort((a, b) => b.price - a.price);
      } else if (filters.sort === 'featured') {
        list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      }
    }

    return list;
  },

  getProductById(id) {
    const data = readDb();
    return data.products.find(p => p.id === id) || null;
  },

  createProduct(productData) {
    const data = readDb();
    const newProduct = {
      id: 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: productData.title,
      category: productData.category || 'T-Shirts',
      price: Number(productData.price) || 0,
      original_price: productData.original_price ? Number(productData.original_price) : null,
      description: productData.description || '',
      image_url: productData.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
      in_stock: productData.in_stock !== false,
      stock_quantity: Number(productData.stock_quantity) || 20,
      is_featured: Boolean(productData.is_featured),
      sizes: Array.isArray(productData.sizes) ? productData.sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(productData.colors) ? productData.colors : ['Navy', 'Black'],
      rating: 5.0,
      review_count: 1,
      created_at: new Date().toISOString()
    };
    data.products.unshift(newProduct);
    writeDb(data);
    return newProduct;
  },

  updateProduct(id, updates) {
    const data = readDb();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    data.products[index] = {
      ...data.products[index],
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : data.products[index].price,
      stock_quantity: updates.stock_quantity !== undefined ? Number(updates.stock_quantity) : data.products[index].stock_quantity,
      in_stock: updates.in_stock !== undefined ? Boolean(updates.in_stock) : data.products[index].in_stock,
      updated_at: new Date().toISOString()
    };
    writeDb(data);
    return data.products[index];
  },

  deleteProduct(id) {
    const data = readDb();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    data.products.splice(index, 1);
    writeDb(data);
    return true;
  },

  // CATEGORIES
  getCategories() {
    const data = readDb();
    return data.categories || [];
  },

  // USERS
  getUserByEmail(email) {
    const data = readDb();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  getUserById(id) {
    const data = readDb();
    return data.users.find(u => u.id === id) || null;
  },

  getAllUsers() {
    const data = readDb();
    return data.users.map(({ password_hash, ...rest }) => rest);
  },

  createUser({ name, email, phone, password, role = 'user' }) {
    const data = readDb();
    if (data.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const password_hash = bcrypt.hashSync(password, 10);
    const newUser = {
      id: 'usr-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password_hash,
      role: role === 'admin' ? 'admin' : 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.users.push(newUser);
    writeDb(data);
    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  },

  updateUserProfile(id, updates) {
    const data = readDb();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    if (updates.name) data.users[index].name = updates.name;
    if (updates.phone !== undefined) data.users[index].phone = updates.phone;
    if (updates.password) {
      data.users[index].password_hash = bcrypt.hashSync(updates.password, 10);
    }
    data.users[index].updated_at = new Date().toISOString();
    writeDb(data);
    const { password_hash, ...safeUser } = data.users[index];
    return safeUser;
  },

  updateUserRole(id, newRole) {
    const data = readDb();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    if (!['user', 'admin'].includes(newRole)) throw new Error('Invalid role');
    data.users[index].role = newRole;
    data.users[index].updated_at = new Date().toISOString();
    writeDb(data);
    const { password_hash, ...safeUser } = data.users[index];
    return safeUser;
  },

  // ORDERS
  createOrder(orderData, userId = null) {
    const data = readDb();
    const orderId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const items = (orderData.items || []).map(item => ({
      id: 'item-' + Math.random().toString(36).substring(2, 9),
      order_id: orderId,
      product_id: item.product_id || item.id,
      product_title: item.title || item.name || 'Merchandise Item',
      product_image: item.image || item.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      size: item.size || 'M',
      color: item.color || 'Navy',
      subtotal: (Number(item.price) || 0) * (Number(item.quantity) || 1)
    }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping_fee = subtotal > 1000 ? 0 : 50; // Free shipping above ₹1000
    const total_amount = subtotal + shipping_fee;

    const newOrder = {
      id: orderId,
      user_id: userId,
      customer_name: orderData.name,
      customer_email: orderData.email,
      customer_phone: orderData.phone,
      shipping_address: orderData.address,
      city: orderData.city,
      state: orderData.state,
      pincode: orderData.pincode || orderData.pin,
      payment_method: orderData.payment_method || 'UPI',
      payment_status: orderData.payment_method === 'Cash on Collection' ? 'Pending' : 'Paid',
      subtotal,
      shipping_fee,
      total_amount,
      status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items
    };

    data.orders.unshift(newOrder);

    // Decrement stock
    for (const item of items) {
      const prod = data.products.find(p => p.id === item.product_id);
      if (prod && prod.stock_quantity) {
        prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        if (prod.stock_quantity === 0) prod.in_stock = false;
      }
    }

    writeDb(data);
    return newOrder;
  },

  getOrders(userId = null, isAdmin = false) {
    const data = readDb();
    if (isAdmin) {
      return data.orders;
    }
    if (!userId) return [];
    return data.orders.filter(o => o.user_id === userId);
  },

  getOrderById(id, userId = null, isAdmin = false) {
    const data = readDb();
    const order = data.orders.find(o => o.id === id);
    if (!order) return null;
    if (isAdmin) return order;
    if (userId && order.user_id === userId) return order;
    return null;
  },

  updateOrderStatus(orderId, status) {
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) throw new Error('Invalid order status');

    const data = readDb();
    const order = data.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updated_at = new Date().toISOString();
    writeDb(data);
    return order;
  },

  // STATS FOR ADMIN DASHBOARD
  getAdminStats() {
    const data = readDb();
    const totalOrders = data.orders.length;
    const totalRevenue = data.orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
    const totalProducts = data.products.length;
    const totalUsers = data.users.length;
    const pendingOrders = data.orders.filter(o => o.status === 'Pending').length;
    const processingOrders = data.orders.filter(o => o.status === 'Processing').length;
    const deliveredOrders = data.orders.filter(o => o.status === 'Delivered').length;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      recentOrders: data.orders.slice(0, 5)
    };
  }
};
