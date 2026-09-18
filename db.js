import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[DB] Connected to remote Supabase database:', supabaseUrl);
  } catch (err) {
    console.warn('[DB] Could not initialize Supabase client:', err.message);
  }
} else {
  console.log('[DB] Supabase credentials not provided in environment. Utilizing local persistent relational storage.');
}

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'collegemerch.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialCategories = [
  { id: 'cat-tshirts', name: 'T-Shirts', description: 'Official campus tees in classic and oversized fits.', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80' },
  { id: 'cat-hoodies', name: 'Hoodies', description: 'Cozy fleece pullovers and zip hoodies for winter semesters.', image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80' },
  { id: 'cat-jackets', name: 'Jackets', description: 'Varsity jackets, windbreakers, and college bombers.', image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&q=80' },
  { id: 'cat-caps', name: 'Caps', description: 'Embroidered snapbacks, dad hats, and campus beanies.', image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80' },
  { id: 'cat-bags', name: 'Bags', description: 'Ergonomic backpacks, laptop sleeves, and canvas totes.', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80' },
  { id: 'cat-accessories', name: 'Accessories', description: 'Lanyards, keychains, stainless water bottles & lapel pins.', image_url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop&q=80' },
  { id: 'cat-stationery', name: 'Stationery', description: 'Embossed hardbound journals, ballpoint pens, and desk pads.', image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80' },
  { id: 'cat-lifestyle', name: 'Lifestyle', description: 'Ceramic coffee mugs, insulated tumblers & campus blankets.', image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80' }
];

const initialProducts = [
  {
    id: 'prod-1',
    name: 'Varsity Heritage Navy Hoodie',
    slug: 'varsity-heritage-navy-hoodie',
    description: 'Heavyweight 380 GSM brushed organic fleece hoodie with Chenille embroidered collegiate crest. Features a kangaroo pocket and double-lined hood for warmth.',
    category: 'Hoodies',
    price: 899,
    original_price: 1199,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&q=80',
    in_stock: true,
    stock_quantity: 45,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy Blue', 'Heather Grey', 'Forest Green'],
    is_featured: true,
    rating: 4.9,
    review_count: 58
  },
  {
    id: 'prod-2',
    name: 'Classic Campus Crewneck T-Shirt',
    slug: 'classic-campus-crewneck-tshirt',
    description: '100% combed ringspun cotton t-shirt with screen-printed collegiate typography across the chest. Pre-shrunk and bio-washed for ultra-soft comfort.',
    category: 'T-Shirts',
    price: 449,
    original_price: 599,
    image_url: 'https://assets.myntassets.com/w_412,q_50,,dpr_3,fl_progressive,f_webp/assets/images/2026/AUGUST/11/7GPoVvOm_410142260fbb4684aa0eff7cbb4f3f1d.jpg',
    in_stock: true,
    stock_quantity: 120,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'White', 'Maroon', 'Black'],
    is_featured: true,
    rating: 4.8,
    review_count: 92
  },
  {
    id: 'prod-3',
    name: 'All-Weather College Varsity Bomber',
    slug: 'all-weather-college-varsity-bomber',
    description: 'Premium wool-blend body with vegan leather contrast sleeves, striped rib-knit cuffs, and snap button closure. Features authentic college year embroidery.',
    category: 'Jackets',
    price: 1499,
    original_price: 1999,
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=700&q=80',
    in_stock: true,
    stock_quantity: 20,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy & White', 'Black & Gold'],
    is_featured: true,
    rating: 5.0,
    review_count: 34
  },
  {
    id: 'prod-4',
    name: 'Embroidered College Crest Snapback',
    slug: 'embroidered-college-crest-snapback',
    description: 'Structured 6-panel twill cap with high-density 3D embroidered college seal, adjustable snap closure, and breathable brass eyelets.',
    category: 'Caps',
    price: 349,
    original_price: 499,
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=700&q=80',
    in_stock: true,
    stock_quantity: 65,
    sizes: ['One Size Fits All'],
    colors: ['Navy Blue', 'Charcoal Grey', 'Gold'],
    is_featured: false,
    rating: 4.7,
    review_count: 41
  },
  {
    id: 'prod-5',
    name: 'Campus Commuter Water-Resistant Backpack',
    slug: 'campus-commuter-backpack',
    description: '28-liter ballistic polyester backpack featuring a padded 15.6" laptop compartment, dual side bottle pockets, ergonomic airflow shoulder straps, and hidden passport pocket.',
    category: 'Bags',
    price: 999,
    original_price: 1399,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=80',
    in_stock: true,
    stock_quantity: 35,
    sizes: ['28 Liters'],
    colors: ['Midnight Black', 'Navy', 'Olive Drab'],
    is_featured: true,
    rating: 4.9,
    review_count: 73
  },
  {
    id: 'prod-6',
    name: 'Heritage Ceramic Campus Coffee Mug',
    slug: 'heritage-ceramic-campus-coffee-mug',
    description: '350ml microwave-safe ceramic coffee mug coated with matte reactive glaze and embossed college seal. Dishwasher safe with an ergonomic comfort grip handle.',
    category: 'Lifestyle',
    price: 249,
    original_price: 349,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&q=80',
    in_stock: true,
    stock_quantity: 80,
    sizes: ['350 ml'],
    colors: ['Navy Blue', 'Stone White', 'Matte Black'],
    is_featured: false,
    rating: 4.8,
    review_count: 67
  },
  {
    id: 'prod-7',
    name: 'Hardbound Gold-Foil College Journal',
    slug: 'hardbound-gold-foil-college-journal',
    description: '192 numbered pages of 100 GSM acid-free ruled paper. Hardbound vegan leather cover finished with gold foil stamped college emblem, bookmark ribbon, and expandable back pocket.',
    category: 'Stationery',
    price: 299,
    original_price: 399,
    image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&q=80',
    in_stock: true,
    stock_quantity: 90,
    sizes: ['A5 (148 x 210 mm)'],
    colors: ['Deep Navy', 'Burgundy', 'Emerald Green'],
    is_featured: false,
    rating: 4.9,
    review_count: 28
  },
  {
    id: 'prod-8',
    name: 'Stainless Steel Insulated Campus Flask (750ml)',
    slug: 'stainless-steel-insulated-campus-flask',
    description: 'Double-walled vacuum insulated food-grade 18/8 stainless steel bottle. Keeps drinks icy cold for 24 hours or piping hot for 12 hours. Laser engraved college logo.',
    category: 'Lifestyle',
    price: 599,
    original_price: 799,
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&q=80',
    in_stock: true,
    stock_quantity: 50,
    sizes: ['750 ml'],
    colors: ['Matte Navy', 'Brushed Steel', 'Stealth Black'],
    is_featured: false,
    rating: 4.8,
    review_count: 45
  },
  {
    id: 'prod-9',
    name: 'Alumni Signature Heavy Cotton Polo',
    slug: 'alumni-signature-heavy-cotton-polo',
    description: 'Classic piqué knit cotton polo with tipped collar, mother-of-pearl buttons, and precision embroidered college emblem over the chest.',
    category: 'T-Shirts',
    price: 649,
    original_price: 849,
    image_url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=700&q=80',
    in_stock: true,
    stock_quantity: 40,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'White', 'Heather Grey'],
    is_featured: false,
    rating: 4.7,
    review_count: 19
  },
  {
    id: 'prod-10',
    name: 'Official College Lanyard & Enamel Pin Set',
    slug: 'official-college-lanyard-enamel-pin-set',
    description: 'Durable jacquard woven lanyard with quick-release buckle, swivel lobster clasp, ID pouch, and two collectible hard enamel college lapel pins.',
    category: 'Accessories',
    price: 199,
    original_price: 299,
    image_url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=700&auto=format&fit=crop&q=80',
    in_stock: true,
    stock_quantity: 150,
    sizes: ['Standard'],
    colors: ['Navy & Gold'],
    is_featured: false,
    rating: 4.9,
    review_count: 84
  },
  {
    id: 'prod-11',
    name: 'Heavyweight Canvas Campus Tote Bag',
    slug: 'heavyweight-canvas-campus-tote-bag',
    description: '14 oz unbleached natural cotton canvas tote with reinforced shoulder handles, zippered inner pocket for keys and wallet, and vintage college typography print.',
    category: 'Bags',
    price: 279,
    original_price: 399,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=700&q=80',
    in_stock: false,
    stock_quantity: 0,
    sizes: ['15" x 16"'],
    colors: ['Natural Canvas', 'Navy Blue'],
    is_featured: false,
    rating: 4.6,
    review_count: 32
  },
  {
    id: 'prod-12',
    name: 'Semester Zip-Up Athletics Track Jacket',
    slug: 'semester-zip-up-track-jacket',
    description: 'Performance poly-tricot track jacket with contrast sleeve stripes, funnel neck collar, zippered hand pockets, and high-shine college athletic crest.',
    category: 'Jackets',
    price: 1199,
    original_price: 1599,
    image_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=700&q=80',
    in_stock: true,
    stock_quantity: 25,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy & White', 'Black & Red'],
    is_featured: false,
    rating: 4.8,
    review_count: 27
  }
];

// Helper to initialize local DB
function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const adminUserHash = bcrypt.hashSync('admin123', salt);

  const initialUsers = [
    {
      id: 'usr-admin-1',
      email: 'admin@college.edu',
      password_hash: adminUserHash,
      full_name: 'Campus Administrator',
      phone: '+91 91234 56789',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-customer-1',
      email: 'loyolaanuj@gmail.com',
      password_hash: adminUserHash,
      full_name: 'Loyola Student',
      phone: '+91 98765 00000',
      role: 'user',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const initialOrders = [];

  return {
    categories: initialCategories,
    products: initialProducts,
    users: initialUsers,
    orders: initialOrders,
    cart_items: [],
    password_resets: []
  };
}

class LocalDB {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure all top-level tables exist
        if (!this.data.categories) this.data.categories = initialCategories;
        if (!this.data.products) this.data.products = initialProducts;
        if (!this.data.users) this.data.users = [];
        if (!this.data.orders) this.data.orders = [];
        if (!this.data.cart_items) this.data.cart_items = [];
        if (!this.data.password_resets) this.data.password_resets = [];

        // Enforce that administrators maintain their admin status
        this.data.users.forEach(u => {
          const em = (u.email || '').toLowerCase().trim();
          if (em === 'admin@college.edu' || em === 'loyolaanuj@gmail.com' || u.role === 'admin') {
            u.role = 'admin';
          }
        });
        return;
      } catch (err) {
        console.error('[DB] Error parsing existing db file. Re-initializing seed data:', err.message);
      }
    }
    this.data = getInitialData();
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB] Failed to persist data to disk:', err.message);
    }
  }

  // --- Products ---
  async getProducts({ category, search, minPrice, maxPrice, inStock, sort } = {}) {
    let list = [...this.data.products];

    if (category && category !== 'All' && category !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      list = list.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      list = list.filter(p => p.price <= Number(maxPrice));
    }

    if (inStock === 'instock' || inStock === true) {
      list = list.filter(p => p.in_stock && p.stock_quantity > 0);
    } else if (inStock === 'out' || inStock === false) {
      list = list.filter(p => !p.in_stock || p.stock_quantity <= 0);
    }

    if (sort) {
      if (sort === 'low') {
        list.sort((a, b) => a.price - b.price);
      } else if (sort === 'high') {
        list.sort((a, b) => b.price - a.price);
      } else if (sort === 'az') {
        list.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'featured') {
        list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      }
    }

    return list;
  }

  async getProductById(id) {
    return this.data.products.find(p => p.id === id || p.slug === id) || null;
  }

  async createProduct(productData) {
    const id = 'prod-' + Date.now();
    const slug = (productData.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);
    const newProduct = {
      id,
      slug,
      name: productData.name,
      description: productData.description || '',
      category: productData.category || 'T-Shirts',
      price: Number(productData.price) || 0,
      original_price: productData.original_price ? Number(productData.original_price) : null,
      image_url: productData.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&q=80',
      in_stock: productData.in_stock !== false && (productData.stock_quantity ?? 50) > 0,
      stock_quantity: Number(productData.stock_quantity ?? 50),
      sizes: Array.isArray(productData.sizes) ? productData.sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(productData.colors) ? productData.colors : ['Navy', 'White'],
      is_featured: Boolean(productData.is_featured),
      rating: 5.0,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  async updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const existing = this.data.products[idx];
    const updated = {
      ...existing,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : existing.price,
      stock_quantity: updates.stock_quantity !== undefined ? Number(updates.stock_quantity) : existing.stock_quantity,
      in_stock: updates.in_stock !== undefined ? Boolean(updates.in_stock) : ((updates.stock_quantity ?? existing.stock_quantity) > 0),
      updated_at: new Date().toISOString()
    };
    this.data.products[idx] = updated;
    this.save();
    return updated;
  }

  async deleteProduct(id) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    return true;
  }

  async clearAllProducts() {
    this.data.products = [];
    this.save();
    return true;
  }

  async resetProductsToDefault() {
    this.data.products = [...initialProducts];
    this.save();
    return this.data.products;
  }

  // --- Categories ---
  async getCategories() {
    return [...this.data.categories];
  }

  // --- Users & Auth ---
  async getUserByEmail(email) {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();
    return this.data.users.find(u => u.email.toLowerCase() === normalized) || null;
  }

  async getUserById(id) {
    return this.data.users.find(u => u.id === id) || null;
  }

  async createUser({ email, password, full_name, phone, role = 'user' }) {
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const id = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const normalizedEmail = email.toLowerCase().trim();
    
    const finalRole = (normalizedEmail === 'admin@college.edu' || normalizedEmail === 'loyolaanuj@gmail.com' || role === 'admin') ? 'admin' : 'user';

    const newUser = {
      id,
      email: normalizedEmail,
      password_hash,
      full_name: full_name.trim(),
      phone: phone ? phone.trim() : '',
      role: finalRole,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();

    // Sync to Supabase Auth if connected
    if (supabase) {
      try {
        await supabase.auth.admin.createUser({
          email: normalizedEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: full_name.trim(),
            phone: phone ? phone.trim() : '',
            role: finalRole
          }
        });
        console.log('[DB] User successfully synced to remote Supabase Auth:', normalizedEmail);
      } catch (sbErr) {
        console.warn('[DB] Supabase Auth sync notice:', sbErr.message);
      }
    }

    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  }

  async updateUser(id, updates) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    if (updates.full_name !== undefined) user.full_name = updates.full_name;
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.is_active !== undefined) user.is_active = Boolean(updates.is_active);
    if (updates.role !== undefined) {
      // ONLY admin@college.edu can have admin role
      const userEmail = (user.email || '').toLowerCase().trim();
      user.role = (userEmail === 'admin@college.edu') ? updates.role : 'user';
    }
    if (updates.password) {
      const salt = bcrypt.genSaltSync(10);
      user.password_hash = bcrypt.hashSync(updates.password, salt);
    }
    user.updated_at = new Date().toISOString();
    this.save();

    // Sync metadata to Supabase if connected
    if (supabase && user.email) {
      try {
        const { data: listRes } = await supabase.auth.admin.listUsers();
        const target = listRes?.users?.find(u => u.email?.toLowerCase() === user.email.toLowerCase());
        if (target) {
          await supabase.auth.admin.updateUserById(target.id, {
            user_metadata: {
              full_name: user.full_name,
              phone: user.phone,
              role: user.role
            },
            ban_duration: user.is_active ? 'none' : '876000h'
          });
        }
      } catch (sbErr) {
        console.warn('[DB] Supabase metadata sync notice:', sbErr.message);
      }
    }

    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  }

  async getAllUsers() {
    // If Supabase is connected, ensure Supabase Auth users exist in our list
    if (supabase) {
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        if (authUsers && authUsers.users) {
          for (const sUser of authUsers.users) {
            const email = sUser.email?.toLowerCase().trim();
            if (!email) continue;
            const existing = this.data.users.find(u => u.email.toLowerCase() === email);
            const isSoleAdmin = email === 'admin@college.edu';
            if (!existing) {
              const meta = sUser.user_metadata || {};
              this.data.users.push({
                id: sUser.id || 'usr-' + Date.now(),
                email: email,
                password_hash: bcrypt.hashSync('TempPass123!', 10),
                full_name: meta.full_name || email.split('@')[0],
                phone: meta.phone || '',
                role: isSoleAdmin ? 'admin' : 'user',
                is_active: !sUser.banned_until,
                created_at: sUser.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            } else {
              // Ensure existing user has correct strict role
              existing.role = isSoleAdmin ? 'admin' : 'user';
            }
          }
          this.save();
        }
      } catch (err) {
        console.warn('[DB] Supabase listUsers sync notice:', err.message);
      }
    }

    return this.data.users.map(({ password_hash, ...u }) => ({
      ...u,
      role: (u.email?.toLowerCase().trim() === 'admin@college.edu') ? 'admin' : 'user'
    }));
  }

  // --- Orders ---
  async createOrder(orderData) {
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const order = {
      id: orderId,
      user_id: orderData.user_id || null,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      shipping_address: orderData.shipping_address,
      city: orderData.city,
      state: orderData.state,
      pin_code: orderData.pin_code,
      payment_method: orderData.payment_method || 'UPI',
      payment_status: orderData.payment_method === 'Cash on Collection' ? 'Pending (Pay on Delivery)' : 'Completed (UPI Paid)',
      payment_ref: orderData.payment_ref || null,
      order_status: 'Pending',
      total_amount: Number(orderData.total_amount),
      shipping_fee: Number(orderData.shipping_fee || 0),
      items: (orderData.items || []).map((it, idx) => {
        const itemPrice = Number(it.price !== undefined ? it.price : (it.unit_price !== undefined ? it.unit_price : 0));
        const qty = Number(it.quantity || 1);
        return {
          id: 'item-' + orderId + '-' + (idx + 1),
          order_id: orderId,
          product_id: it.product_id,
          product_name: it.product_name || it.name || 'Product',
          product_image: it.product_image || it.image || '',
          price: itemPrice,
          quantity: qty,
          selected_size: it.selected_size || it.size || '',
          selected_color: it.selected_color || it.color || '',
          subtotal: itemPrice * qty
        };
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Decrement stock for ordered products
    for (const item of order.items) {
      const prod = this.data.products.find(p => p.id === item.product_id);
      if (prod) {
        prod.stock_quantity = Math.max(0, (prod.stock_quantity || 1) - item.quantity);
        if (prod.stock_quantity === 0) {
          prod.in_stock = false;
        }
      }
    }

    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  async updateOrderPayment(orderId, { payment_ref, payment_status }) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    if (payment_ref) order.payment_ref = payment_ref;
    if (payment_status) order.payment_status = payment_status;
    order.updated_at = new Date().toISOString();
    this.save();
    return order;
  }

  async getOrdersByUser(userId, email) {
    return this.data.orders.filter(o => 
      (userId && o.user_id === userId) || 
      (email && o.customer_email.toLowerCase() === email.toLowerCase())
    );
  }

  async getOrderById(orderId) {
    return this.data.orders.find(o => o.id === orderId) || null;
  }

  async getAllOrders() {
    return [...this.data.orders];
  }

  async updateOrderStatus(orderId, status) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.order_status = status;
    order.updated_at = new Date().toISOString();
    this.save();
    return order;
  }

  // --- Admin Stats ---
  async getAdminStats() {
    const totalUsers = this.data.users.length;
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 86400000;
    const newUsers = this.data.users.filter(u => new Date(u.created_at).getTime() >= thirtyDaysAgo).length;

    const totalOrders = this.data.orders.length;
    const pendingOrders = this.data.orders.filter(o => o.order_status === 'Pending').length;
    const processingOrders = this.data.orders.filter(o => o.order_status === 'Processing').length;
    const completedOrders = this.data.orders.filter(o => o.order_status === 'Delivered').length;
    const totalRevenue = this.data.orders
      .filter(o => o.order_status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const totalProducts = this.data.products.length;
    const lowStockProducts = this.data.products.filter(p => p.stock_quantity <= 10).length;

    const recentOrders = this.data.orders.slice(0, 5);

    return {
      totalUsers,
      newUsers,
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      totalRevenue,
      totalProducts,
      lowStockProducts,
      recentOrders
    };
  }

  // --- Password Reset ---
  async createPasswordReset(email) {
    const token = 'rst-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const record = {
      id: 'pr-' + Date.now(),
      email: email.toLowerCase().trim(),
      token,
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      used: false,
      created_at: new Date().toISOString()
    };
    this.data.password_resets.push(record);
    this.save();
    return token;
  }

  async verifyAndResetPassword(token, newPassword) {
    const record = this.data.password_resets.find(r => r.token === token && !r.used);
    if (!record) return { success: false, message: 'Invalid or expired reset token' };
    if (new Date(record.expires_at).getTime() < Date.now()) {
      return { success: false, message: 'Reset token has expired' };
    }

    const user = this.data.users.find(u => u.email.toLowerCase() === record.email.toLowerCase());
    if (!user) return { success: false, message: 'User account not found' };

    const salt = bcrypt.genSaltSync(10);
    user.password_hash = bcrypt.hashSync(newPassword, salt);
    user.updated_at = new Date().toISOString();
    record.used = true;
    this.save();
    return { success: true, message: 'Password updated successfully' };
  }
}

export const db = new LocalDB();
export { supabase };
