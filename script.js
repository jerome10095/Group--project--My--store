// ════════════════════════════════════════════════════
//  PRODUCT DATA  — add new products here
//  categories: "keychains" | "clothing" | "wall-art" | "decor"
//  tags:        "new"  → appears in New Arrivals
//               "best" → appears in Best Sellers
// ════════════════════════════════════════════════════
const PRODUCTS = [
  { id:1,  name:"Crochet Keychain Set",      price:8.99,  img:"Image/Adorable and Easy 26 Crochet Keychain Ideas You'll….jfif",      category:"keychains",  tags:["best"] },
  { id:2,  name:"Handmade Tote Bag",         price:12.99, img:"Image/Terzi mankenimiz olmayınca biz de birtakım ai….jfif",             category:"clothing",   tags:["new","best"] },
  { id:3,  name:"Boho Keyring",              price:15.99, img:"Image/Instagram.jfif",                                                  category:"keychains",  tags:["new"] },
  { id:4,  name:"Macrame Wall Piece",        price:18.99, img:"Image/download (5).jfif",                                               category:"wall-art",   tags:["best"] },
  { id:5,  name:"Mini Crochet Charm",        price:7.57,  img:"Image/My friends grandpa has one and I love it!! It's….jfif",           category:"keychains",  tags:[] },
  { id:6,  name:"Camera Keychain",           price:11.57, img:"Image/Save this crochet keychain camera if you want to….jfif",          category:"keychains",  tags:["new"] },
  { id:7,  name:"Wooden Wall Art",           price:21.70, img:"Image/Wood - Wood Art _ Facebook.jfif",                                 category:"wall-art",   tags:["best"] },
  { id:8,  name:"Bas-Relief Wall Sculpture", price:26.34, img:"Image/барельеф.jfif",                                                   category:"wall-art",   tags:["new","best"] },
  { id:9,  name:"Woven Basket Bag",          price:15.99, img:"Image/Instagram (1).jfif",                                              category:"clothing",   tags:["new"] },
  { id:10, name:"Minimalist Wall Clock",     price:19.99, img:"Image/Elevate your home with this stunning minimalist….jfif",           category:"decor",      tags:["best"] },
  { id:11, name:"Boho Wall Print",           price:9.99,  img:"Image/Claim a free version now_ Go to our website_.jfif",              category:"wall-art",   tags:[] },
  { id:12, name:"Wooden Decor Piece",        price:14.99, img:"Image/download (4).jfif",                                               category:"decor",      tags:["new"] },
  { id:13, name:"Round Wood Wall Art",       price:17.99, img:"Image/Crafted from the finest, rarest wood, this round….jfif",         category:"wall-art",   tags:[] },
  { id:14, name:"Carved Wood Frame",         price:22.99, img:"Image/download (3).jfif",                                               category:"wall-art",   tags:["new"] },
  { id:15, name:"Shelf Display Set",         price:29.99, img:"Image/download (2).jfif",                                               category:"decor",      tags:["best"] },
  { id:16, name:"Space-Saving Rack",         price:34.99, img:"Image/Living in a city often means dealing with limited….jfif",         category:"decor",      tags:["new"] },
  { id:17, name:"LED Wall Decor",            price:39.99, img:"Image/Upgrade your home with this modern LED wall decor….jfif",         category:"decor",      tags:["new","best"] },
];

// ════════════════════════════════════════════════════
//  BUILD A PRODUCT CARD
// ════════════════════════════════════════════════════
function createCard(product) {
  const badges = product.tags.map(t =>
    `<span class="badge badge-${t}">${t === 'new' ? '🆕 New' : '🏆 Best Seller'}</span>`
  ).join('');

  return `
    <section class="product" data-category="${product.category}" data-tags="${product.tags.join(',')}">
      <div class="product-img-wrap">
        <img src="${product.img}" alt="${product.name}" loading="lazy">
        <div class="badge-wrap">${badges}</div>
      </div>
      <h2>${product.name}</h2>
      <p>$${product.price.toFixed(2)}</p>
      <button onclick="addToCart('${product.name}')">Add to Cart</button>
    </section>`;
}

// ════════════════════════════════════════════════════
//  RENDER HELPERS
// ════════════════════════════════════════════════════
function renderGrid(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = items.length
    ? items.map(createCard).join('')
    : `<p class="empty-msg">No products found.</p>`;
}

function addToCart(name) {
  const btn = event.target;
  btn.textContent = '✓ Added!';
  btn.style.backgroundColor = '#0a9e0a';
  setTimeout(() => { btn.textContent = 'Add to Cart'; btn.style.backgroundColor = ''; }, 1500);
}

// ════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", function () {

  // ── Render sections ────────────────────────────
  renderGrid('all-products',    PRODUCTS);
  renderGrid('new-arrivals',    PRODUCTS.filter(p => p.tags.includes('new')));
  renderGrid('best-sellers',    PRODUCTS.filter(p => p.tags.includes('best')));

  // ── Category filter tabs ───────────────────────
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const cat = this.dataset.cat;
      const filtered = cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);

      // show All section, hide others
      showSection('all');
      document.getElementById('section-title').textContent =
        cat === 'all' ? 'All Products' : this.textContent.trim();
      renderGrid('all-products', filtered);
    });
  });

  // ── Top nav links (Home / New Arrival / Best Sellers / Contact) ──
  document.querySelectorAll('.top-nav-link').forEach(link => {
    link.addEventListener('click', function () {
      const target = this.dataset.section;
      showSection(target);
      // sync sidebar active state
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelector(`.nav-item[data-section="${target}"]`)?.classList.add('active');
      closeNav();
    });
  });

  // ── Sidebar nav items ──────────────────────────
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', function () {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      showSection(this.dataset.section);
      closeNav();
    });
  });

  // ── Search ─────────────────────────────────────
  document.getElementById("searchInput").addEventListener("keyup", function () {
    const val = this.value.toLowerCase().trim();
    if (val === '') { renderGrid('all-products', PRODUCTS); return; }
    showSection('all');
    document.getElementById('section-title').textContent = `Search: "${this.value}"`;
    renderGrid('all-products', PRODUCTS.filter(p => p.name.toLowerCase().includes(val)));
  });

  // ── Sidebar open/close ─────────────────────────
  document.getElementById("hamburgerBtn").addEventListener("click", openNav);
  document.getElementById("closeBtn").addEventListener("click", closeNav);
  document.getElementById("overlay").addEventListener("click", closeNav);
});

// ════════════════════════════════════════════════════
//  SECTION VISIBILITY
// ════════════════════════════════════════════════════
function showSection(name) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active-section'));
  const target = document.getElementById('section-' + name);
  if (target) target.classList.add('active-section');
  // reset cat tabs when navigating away from all
  if (name !== 'all') {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.cat-tab[data-cat="all"]')?.classList.add('active');
  }
}

function openNav()  { document.getElementById('slideNav').classList.add('open');    document.getElementById('overlay').classList.add('show'); }
function closeNav() { document.getElementById('slideNav').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }