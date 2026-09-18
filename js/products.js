// CollegeMerch Products & Catalog Controller

document.addEventListener('DOMContentLoaded', async () => {
  const isHomePage = document.getElementById('featuredGrid') && document.getElementById('categoryGrid');
  const isProductsPage = document.getElementById('productsGrid');

  if (isHomePage) {
    initHomePage();
  }

  if (isProductsPage) {
    initProductsPage();
  }
});

// Home page logic
async function initHomePage() {
  const catGrid = document.getElementById('categoryGrid');
  const featGrid = document.getElementById('featuredGrid');

  // Load Categories
  try {
    const data = await window.CM.api('/api/categories');
    if (catGrid && data.categories) {
      catGrid.innerHTML = data.categories.map(cat => `
        <a href="products.html?category=${encodeURIComponent(cat.name)}" class="category-card" id="catCard-${cat.id}">
          <img src="${cat.image_url}" alt="${cat.name}" class="cat-img" loading="lazy">
          <div class="cat-body">
            <h3>${cat.name}</h3>
            <p>${cat.description || 'Explore collection'}</p>
          </div>
        </a>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }

  // Load Featured Merchandise
  try {
    const data = await window.CM.api('/api/products?sort=featured');
    if (featGrid && data.products) {
      const featured = data.products.filter(p => p.is_featured).slice(0, 4);
      featGrid.innerHTML = (featured.length ? featured : data.products.slice(0, 4))
        .map(p => renderProductCard(p))
        .join('');
      attachProductCardEvents(featGrid);
    }
  } catch (err) {
    console.error('Failed to load featured products:', err);
  }
}

// Products Catalog page logic
async function initProductsPage() {
  const searchInput = document.getElementById('filterSearch');
  const catSelect = document.getElementById('filterCategory');
  const priceSelect = document.getElementById('filterPrice');
  const availSelect = document.getElementById('filterAvail');
  const sortSelect = document.getElementById('filterSort');
  const countEl = document.getElementById('resultCount');
  const gridEl = document.getElementById('productsGrid');
  const noProductsEl = document.getElementById('noProducts');
  const clearBtn = document.getElementById('clearFilters');

  // Check URL query parameters for pre-selected category or search
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  const initialSearch = urlParams.get('search');

  if (initialCategory && catSelect) {
    catSelect.value = initialCategory;
  }
  if (initialSearch && searchInput) {
    searchInput.value = initialSearch;
  }

  async function fetchAndRender() {
    gridEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted);">Loading merchandise...</div>';
    if (noProductsEl) noProductsEl.style.display = 'none';

    const params = new URLSearchParams();
    if (catSelect && catSelect.value !== 'All') params.append('category', catSelect.value);
    if (searchInput && searchInput.value.trim()) params.append('search', searchInput.value.trim());

    if (priceSelect && priceSelect.value !== 'All') {
      const val = priceSelect.value;
      if (val === '0-299') {
        params.append('minPrice', 0);
        params.append('maxPrice', 299);
      } else if (val === '300-699') {
        params.append('minPrice', 300);
        params.append('maxPrice', 699);
      } else if (val === '700+') {
        params.append('minPrice', 700);
      }
    }

    if (availSelect && availSelect.value !== 'All') {
      params.append('inStock', availSelect.value);
    }

    if (sortSelect && sortSelect.value) {
      params.append('sort', sortSelect.value);
    }

    try {
      const data = await window.CM.api(`/api/products?${params.toString()}`);
      const products = data.products || [];

      if (countEl) {
        countEl.textContent = `Showing ${products.length} product${products.length === 1 ? '' : 's'}`;
      }

      if (products.length === 0) {
        gridEl.innerHTML = '';
        if (noProductsEl) noProductsEl.style.display = 'block';
      } else {
        if (noProductsEl) noProductsEl.style.display = 'none';
        gridEl.innerHTML = products.map(p => renderProductCard(p)).join('');
        attachProductCardEvents(gridEl);
      }
    } catch (err) {
      gridEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);">Failed to load products. Please refresh.</div>';
    }
  }

  // Filter change handlers
  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(fetchAndRender, 300);
    });
  }

  [catSelect, priceSelect, availSelect, sortSelect].forEach(el => {
    if (el) el.addEventListener('change', fetchAndRender);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (catSelect) catSelect.value = 'All';
      if (priceSelect) priceSelect.value = 'All';
      if (availSelect) availSelect.value = 'All';
      if (sortSelect) sortSelect.value = 'featured';
      fetchAndRender();
    });
  }

  fetchAndRender();
}

function renderProductCard(p) {
  const isOutOfStock = !p.in_stock || p.stock_quantity <= 0;
  const badgeHtml = isOutOfStock
    ? `<span class="badge-tag out-stock">Out of Stock</span>`
    : (p.original_price && p.original_price > p.price)
      ? `<span class="badge-tag sale">Save ${Math.round(((p.original_price - p.price) / p.original_price) * 100)}%</span>`
      : (p.is_featured ? `<span class="badge-tag">Popular</span>` : '');

  return `
    <article class="product-card" id="card-${p.id}">
      <a href="product-details.html?id=${p.id}" class="card-thumb" aria-label="${p.name}">
        ${badgeHtml}
        <img src="${p.image_url}" alt="${p.name}" loading="lazy">
      </a>
      <div class="card-content">
        <span class="card-category">${p.category}</span>
        <h3 class="card-title">
          <a href="product-details.html?id=${p.id}">${p.name}</a>
        </h3>
        <div class="price-row">
          <span class="price-current">${window.CM.formatPrice(p.price)}</span>
          ${p.original_price ? `<span class="price-orig">${window.CM.formatPrice(p.original_price)}</span>` : ''}
        </div>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <a href="product-details.html?id=${p.id}" class="btn btn-outline btn-sm" style="flex:1;">Details</a>
          <button class="btn btn-primary btn-sm add-cart-btn" data-id="${p.id}" ${isOutOfStock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} style="flex:1.2;">
            ${isOutOfStock ? 'Sold Out' : '🛒 Add'}
          </button>
        </div>
      </div>
    </article>
  `;
}

function attachProductCardEvents(container) {
  const buttons = container.querySelectorAll('.add-cart-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-id');
      try {
        const data = await window.CM.api(`/api/products/${id}`);
        if (data.product) {
          const p = data.product;
          const defaultSize = (p.sizes && p.sizes.length) ? p.sizes[0] : '';
          const defaultColor = (p.colors && p.colors.length) ? p.colors[0] : '';
          window.CM.Cart.addItem(p, 1, defaultSize, defaultColor);
          window.CM.toast(`Added "${p.name}" to cart!`);
        }
      } catch (err) {
        window.CM.toast('Could not add item to cart', 'error');
      }
    });
  });
}
