// ════════════════════════════════════════════
//  GSAP SETUP
// ════════════════════════════════════════════
gsap.registerPlugin(ScrollTrigger, TextPlugin, CustomEase);
CustomEase.create("bounce", "M0,0 C0.14,0 0.242,0.438 0.272,0.561 0.313,0.728 0.354,0.963 0.362,1 0.37,1.037 0.414,1.1 0.454,1.1 0.494,1.1 0.502,1.042 0.502,1.042 0.502,1.042 0.575,0.85 0.617,0.85 0.659,0.85 0.726,1 0.726,1 0.726,1 0.788,1.075 0.83,1.075 0.872,1.075 0.918,1.018 0.918,1.018 0.918,1.018 0.934,0.969 0.96,0.969 0.986,0.969 1,1 1,1");

// ════════════════════════════════════════════
//  CART STATE
// ════════════════════════════════════════════
let cart = [];
let currentUser = null;
const SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5.00;
const SELLER_WHATSAPP = '250791720024'; // seller's WhatsApp number

function getShipping(sub) { return sub >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST; }

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cartCount');
  el.textContent = total;
  if (total > 0) {
    el.style.display = 'inline-flex';
    gsap.fromTo(el, { scale: 1.8, backgroundColor: '#ff6b00' },
      { scale: 1, backgroundColor: '#e07b2a', duration: 0.4, ease: 'bounce' });
  } else {
    el.style.display = 'none';
  }
}

function renderCart() {
  const c = document.getElementById('cartItems');
  if (cart.length === 0) {
    c.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    ['cartSubtotal','cartShipping','cartTotal'].forEach(id => {
      document.getElementById(id).textContent = '$0.00';
    });
    return;
  }

  c.innerHTML = cart.map((item, idx) => `
    <div class="cart-item" id="cart-item-${idx}">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img" onerror="this.style.background='#f0ede8';this.removeAttribute('src')">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
        <div class="qty-row">
          <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${idx},+1)">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <p class="cart-item-total">$${(item.price * item.qty).toFixed(2)}</p>
        <button class="remove-btn" onclick="removeItem(${idx})">🗑</button>
      </div>
    </div>`).join('');

  gsap.fromTo('.cart-item', { x: 30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.35, stagger: 0.07, ease: 'power2.out' });

  const sub  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = getShipping(sub);
  document.getElementById('cartSubtotal').textContent = '$' + sub.toFixed(2);
  document.getElementById('cartShipping').textContent = ship === 0 ? '🎉 Free!' : '$' + ship.toFixed(2);
  document.getElementById('cartTotal').textContent    = '$' + (sub + ship).toFixed(2);

  gsap.fromTo('#cartTotal', { color: '#d4a843' }, { color: '#222', duration: 0.8 });
}

function addToCart(name, price, img, btn) {
  const existing = cart.find(i => i.name === name);
  if (existing) existing.qty++;
  else cart.push({ name, price, img, qty: 1 });
  updateCartCount();
  renderCart();

  btn.textContent = '✓ Added!';
  btn.classList.add('added');
  gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'bounce' });
  setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('added'); }, 1400);
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartCount(); renderCart();
}

function removeItem(idx) {
  const el = document.getElementById('cart-item-' + idx);
  if (el) {
    gsap.to(el, {
      x: 60, opacity: 0, height: 0, padding: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => { cart.splice(idx, 1); updateCartCount(); renderCart(); }
    });
  } else {
    cart.splice(idx, 1); updateCartCount(); renderCart();
  }
}

// ════════════════════════════════════════════
//  WHATSAPP ORDER — sends order to seller
// ════════════════════════════════════════════
function sendOrderToWhatsApp(custName, custPhone, custAddress) {
  const sub   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship  = getShipping(sub);
  const total = (sub + ship).toFixed(2);

  const orderDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  let msg = `🛍️ *NEW ORDER — Ireme Creations*\n`;
  msg += `📅 ${orderDate}\n\n`;
  msg += `👤 *Customer:* ${custName || 'Not provided'}\n`;
  msg += `📱 *Phone:* ${custPhone || 'Not provided'}\n`;
  msg += `📍 *Address:* ${custAddress || 'Not provided'}\n\n`;
  msg += `🛒 *Items Ordered:*\n`;
  cart.forEach(item => {
    msg += `  • ${item.name} × ${item.qty}  →  $${(item.price * item.qty).toFixed(2)}\n`;
  });
  msg += `\n💵 Subtotal: $${sub.toFixed(2)}\n`;
  msg += `🚚 Shipping: ${ship === 0 ? 'FREE 🎉' : '$' + ship.toFixed(2)}\n`;
  msg += `✅ *TOTAL: $${total}*\n\n`;
  msg += `_Sent from Ireme Creations website_`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/${SELLER_WHATSAPP}?text=${encoded}`, '_blank');
  return { sub, ship, total };
}

// ════════════════════════════════════════════
//  FLY-TO-CART PARTICLE
// ════════════════════════════════════════════
function flyToCart(btn) {
  const btnRect  = btn.getBoundingClientRect();
  const cartRect = document.getElementById('cartBtn').getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    const p = document.createElement('div');
    p.className = 'fly-particle';
    document.body.appendChild(p);
    gsap.set(p, {
      x: btnRect.left + btnRect.width / 2,
      y: btnRect.top  + btnRect.height / 2,
      opacity: 1, scale: gsap.utils.random(0.5, 1.2)
    });
    gsap.to(p, {
      x: cartRect.left + cartRect.width / 2 + gsap.utils.random(-15, 15),
      y: cartRect.top  + cartRect.height / 2,
      opacity: 0, scale: 0,
      duration: gsap.utils.random(0.5, 0.8),
      delay:    gsap.utils.random(0, 0.15),
      ease: 'power2.in',
      onComplete: () => p.remove()
    });
  }
}

// ════════════════════════════════════════════
//  CUSTOM CURSOR
// ════════════════════════════════════════════
function initCursor() {
  const glow = document.getElementById('cursorGlow');
  const dot  = document.getElementById('cursorDot');
  document.addEventListener('mousemove', e => {
    gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.18, ease: 'power2.out' });
    gsap.to(dot,  { x: e.clientX, y: e.clientY, duration: 0.05 });
  });
  document.querySelectorAll('.magnetic, button, a, input').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(glow, { scale: 1.6, duration: 0.25 }));
    el.addEventListener('mouseleave', () => gsap.to(glow, { scale: 1,   duration: 0.25 }));
  });
}

// ════════════════════════════════════════════
//  MAGNETIC BUTTONS
// ════════════════════════════════════════════
function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top  + rect.height / 2);
      gsap.to(this, { x: dx * 0.3, y: dy * 0.3, duration: 0.3, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', function() {
      gsap.to(this, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

// ════════════════════════════════════════════
//  RIPPLE ON BUTTONS
// ════════════════════════════════════════════
function addRipple(e) {
  const btn  = e.currentTarget;
  const r    = document.createElement('span');
  r.className = 'ripple';
  const size = Math.max(btn.offsetWidth, btn.offsetHeight);
  const rect = btn.getBoundingClientRect();
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
  btn.style.position = 'relative'; btn.style.overflow = 'hidden';
  btn.appendChild(r);
  setTimeout(() => r.remove(), 620);
}

// ════════════════════════════════════════════
//  INTERACTIVE CRAFT CANVAS ANIMATION
// ════════════════════════════════════════════
function initCraftCanvas() {
  const canvas = document.getElementById('craftCanvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const W      = canvas.width;
  const H      = canvas.height;

  // Product-themed items that orbit & interact
  const items = [
    { emoji: '🧶', x: W*0.2,  y: H*0.3,  vx: 0.5,  vy: 0.3,  size: 22, angle: 0, spin: 0.02  },
    { emoji: '🪵', x: W*0.7,  y: H*0.5,  vx: -0.4, vy: 0.5,  size: 20, angle: 0, spin: -0.015 },
    { emoji: '🖼️', x: W*0.5,  y: H*0.2,  vx: 0.3,  vy: -0.4, size: 22, angle: 0, spin: 0.018  },
    { emoji: '🔑', x: W*0.8,  y: H*0.25, vx: -0.5, vy: 0.35, size: 19, angle: 0, spin: -0.02  },
    { emoji: '💎', x: W*0.3,  y: H*0.7,  vx: 0.4,  vy: -0.3, size: 18, angle: 0, spin: 0.025  },
    { emoji: '🌿', x: W*0.6,  y: H*0.75, vx: -0.3, vy: -0.4, size: 21, angle: 0, spin: -0.016 },
  ];

  // Sparkle particles
  const sparks = Array.from({ length: 20 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 2 + 0.5,
    alpha: Math.random(),
    speed: Math.random() * 0.01 + 0.005,
    phase: Math.random() * Math.PI * 2,
  }));

  let mouseX = W / 2, mouseY = H / 2;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (W / rect.width);
    mouseY = (e.clientY - rect.top)  * (H / rect.height);
  });

  let frame = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const grad = ctx.createRadialGradient(W/2, H/2, 10, W/2, H/2, H*0.8);
    grad.addColorStop(0, 'rgba(30,30,20,0.0)');
    grad.addColorStop(1, 'rgba(10,10,5,0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Sparkles
    sparks.forEach(s => {
      s.alpha = 0.4 + 0.5 * Math.sin(frame * s.speed + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,168,67,${s.alpha})`;
      ctx.fill();
    });

    // Connective lines between nearby items
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const dx = items[i].x - items[j].x;
        const dy = items[i].y - items[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(items[i].x, items[i].y);
          ctx.lineTo(items[j].x, items[j].y);
          ctx.strokeStyle = `rgba(212,168,67,${0.25 * (1 - dist/90)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Items
    items.forEach(item => {
      // Mouse repulsion — gentle push away
      const mdx  = item.x - mouseX;
      const mdy  = item.y - mouseY;
      const mdist = Math.sqrt(mdx*mdx + mdy*mdy);
      if (mdist < 60) {
        item.vx += (mdx / mdist) * 0.3;
        item.vy += (mdy / mdist) * 0.3;
      }

      // Move
      item.x += item.vx;
      item.y += item.vy;
      item.angle += item.spin;

      // Dampen velocity
      item.vx *= 0.995;
      item.vy *= 0.995;
      // Keep min speed
      const spd = Math.sqrt(item.vx*item.vx + item.vy*item.vy);
      if (spd < 0.2) { item.vx *= 1.5; item.vy *= 1.5; }

      // Bounce off walls
      if (item.x < item.size) { item.x = item.size; item.vx = Math.abs(item.vx); }
      if (item.x > W - item.size) { item.x = W - item.size; item.vx = -Math.abs(item.vx); }
      if (item.y < item.size) { item.y = item.size; item.vy = Math.abs(item.vy); }
      if (item.y > H - item.size) { item.y = H - item.size; item.vy = -Math.abs(item.vy); }

      // Draw emoji
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.angle);
      ctx.font = `${item.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.92;
      ctx.fillText(item.emoji, 0, 0);
      ctx.restore();
    });

    frame++;
    requestAnimationFrame(draw);
  }
  draw();

  // Dot indicators (one per item, cycling)
  const dotsEl = document.getElementById('animDots');
  if (dotsEl) {
    items.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'anim-dot' + (i === 0 ? ' active' : '');
      dotsEl.appendChild(d);
    });
    let activeDot = 0;
    setInterval(() => {
      dotsEl.querySelectorAll('.anim-dot').forEach((d, i) => {
        d.classList.toggle('active', i === activeDot);
      });
      activeDot = (activeDot + 1) % items.length;
    }, 1200);
  }
}

// ════════════════════════════════════════════
//  HERO ANIMATIONS
// ════════════════════════════════════════════
function initHero() {
  const floaters = document.getElementById('heroFloaters');
  const emojis = ['🛍','✨','🎀','💎','🌟','🔑','🖼','🏡'];
  emojis.forEach((em, i) => {
    const d = document.createElement('div');
    d.className = 'floater';
    d.textContent = em;
    d.style.cssText = `left:${55 + (i * 4)}%; top:${10 + (i % 3) * 28}%; animation-delay:${i * 0.5}s`;
    floaters.appendChild(d);
  });

  // hero particle bg
  const bg = document.getElementById('heroBg');
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute; border-radius:50%;
      background:rgba(212,168,67,${Math.random() * 0.10 + 0.03});
      width:${Math.random() * 60 + 10}px; height:${Math.random() * 60 + 10}px;
      left:${Math.random() * 100}%; top:${Math.random() * 100}%;
    `;
    bg.appendChild(p);
    gsap.to(p, {
      y: gsap.utils.random(-30, 30),
      x: gsap.utils.random(-20, 20),
      duration: gsap.utils.random(3, 7),
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: gsap.utils.random(0, 3)
    });
  }

  // entrance timeline
  gsap.set(['#heroTag','#heroTitle','#heroSub','#heroBtn'], { y: 30 });
  const tl = gsap.timeline({ delay: 0.2 });
  tl.from('#mainHeader',    { y: -80, opacity: 0, duration: 0.7, ease: 'power3.out' })
    .to('#heroTag',   { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to('#heroTitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.2')
    .to('#heroSub',   { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.4')
    .to('#heroBtn',   { opacity: 1, y: 0, duration: 0.5, ease: 'bounce'     }, '-=0.2')
    .to('#heroAnimBox', { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    .to('#sectionBar',  { opacity: 1, duration: 0.5 }, '-=0.1')
    .to('.section-bar-line', { scaleX: 1, duration: 0.8, ease: 'power2.out' }, '-=0.3');
}

// ════════════════════════════════════════════
//  SCROLL-TRIGGERED PRODUCT CARDS
// ════════════════════════════════════════════
function initScrollAnimations() {
  gsap.utils.toArray('.product').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0, duration: 0.6,
      ease: 'power3.out',
      delay: (i % 4) * 0.08,
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none',
      }
    });

    // 3D tilt on hover
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width  - 0.5;
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;
      gsap.to(this, {
        rotateY: cx * 10, rotateX: -cy * 10,
        scale: 1.03,
        boxShadow: '0 16px 36px rgba(212,168,67,0.18)',
        duration: 0.25, ease: 'power2.out',
        transformPerspective: 600,
      });
    });
    card.addEventListener('mouseleave', function() {
      gsap.to(this, {
        rotateY: 0, rotateX: 0, scale: 1,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        duration: 0.5, ease: 'elastic.out(1, 0.5)',
      });
    });
  });

  // footer reveal
  ScrollTrigger.create({
    trigger: '.footer',
    start: 'top 90%',
    onEnter: () => gsap.to('.footer-inner', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' })
  });
  gsap.set('.footer-inner', { y: 30 });
}

// ════════════════════════════════════════════
//  HEADER SCROLL BEHAVIOUR
// ════════════════════════════════════════════
function initHeaderScroll() {
  let lastY = 0;
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: self => {
      const y = self.scroll();
      if (y > lastY + 5 && y > 100) {
        gsap.to('#mainHeader', { y: -70, duration: 0.3, ease: 'power2.in' });
      } else if (y < lastY - 5) {
        gsap.to('#mainHeader', { y: 0,   duration: 0.4, ease: 'power2.out' });
      }
      lastY = y;
      const p = Math.min(y / 200, 1);
      gsap.set('#mainHeader', { backgroundColor: `rgba(30,30,${Math.round(31 + p*10)}, ${0.95 + p*0.05})` });
    }
  });
}

// ════════════════════════════════════════════
//  SIDEBAR (fixed: GSAP starts from right:0)
// ════════════════════════════════════════════
function openSidebar() {
  document.getElementById('overlay').classList.add('show');
  gsap.to('#slideNav', { x: -260, duration: 0.45, ease: 'power3.out' });
  gsap.fromTo('.nav-item', { x: 30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: 'power2.out', delay: 0.2 });
}
function closeSidebar() {
  document.getElementById('overlay').classList.remove('show');
  gsap.to('#slideNav', { x: 0, duration: 0.4, ease: 'power2.in' });
}

// ════════════════════════════════════════════
//  CART DRAWER (fixed: x tracks actual off-screen)
// ════════════════════════════════════════════
function openCartDrawer() {
  document.getElementById('cartOverlay').classList.add('show');
  gsap.to('#cartDrawer', { x: -400, duration: 0.45, ease: 'power3.out' });
  renderCart();
}
function closeCartDrawer() {
  document.getElementById('cartOverlay').classList.remove('show');
  gsap.to('#cartDrawer', { x: 0, duration: 0.4, ease: 'power2.in' });
}

// ════════════════════════════════════════════
//  MODAL ANIMATIONS
// ════════════════════════════════════════════
function openModal(overlayId, boxId) {
  const overlay = document.getElementById(overlayId);
  const box     = document.getElementById(boxId);
  overlay.classList.add('show');
  gsap.fromTo(box,
    { scale: 0.7, opacity: 0, y: 40 },
    { scale: 1,   opacity: 1, y: 0, duration: 0.5, ease: 'bounce' });
}
function closeModal(overlayId, boxId) {
  const overlay = document.getElementById(overlayId);
  const box     = document.getElementById(boxId);
  gsap.to(box, {
    scale: 0.85, opacity: 0, y: 20, duration: 0.3, ease: 'power2.in',
    onComplete: () => overlay.classList.remove('show')
  });
}

// ════════════════════════════════════════════
//  SEARCH FILTER ANIMATION
// ════════════════════════════════════════════
function animateSearchFilter(visible, hidden) {
  gsap.to(hidden, {
    opacity: 0, scale: 0.9, duration: 0.2, ease: 'power1.in',
    onComplete: () => hidden.forEach(el => el.style.display = 'none')
  });
  visible.forEach(el => { el.style.display = ''; });
  gsap.fromTo(visible, { opacity: 0, scale: 0.92 },
    { opacity: 1, scale: 1, duration: 0.3, stagger: 0.04, ease: 'power2.out' });
}

// ════════════════════════════════════════════
//  DOM READY
// ════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {

  // GSAP initial positions — sidebar starts off-screen to the right
  gsap.set('#slideNav',   { x: 0 });   // CSS puts it at right:-280px, GSAP will move x:-260
  gsap.set('#cartDrawer', { x: 0 });   // CSS puts it at right:-420px, GSAP will move x:-400

  // init all systems
  initHero();
  initCraftCanvas();
  initCursor();
  initMagnetic();
  initScrollAnimations();
  initHeaderScroll();

  // ripple on all buttons
  document.querySelectorAll('button').forEach(btn => btn.addEventListener('click', addRipple));

  // ── Add to cart ──────────────────────────
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = this.closest('.product');
      flyToCart(this);
      addToCart(card.dataset.name, parseFloat(card.dataset.price), card.dataset.img, this);
    });
  });

  // ── Cart open/close ───────────────────────
  document.getElementById('cartBtn').addEventListener('click', openCartDrawer);
  document.getElementById('closeCart').addEventListener('click', closeCartDrawer);
  document.getElementById('cartOverlay').addEventListener('click', closeCartDrawer);

  // ── Clear cart ────────────────────────────
  document.getElementById('clearCart').addEventListener('click', () => {
    const items = document.querySelectorAll('.cart-item');
    if (items.length > 0) {
      gsap.to('.cart-item', {
        x: 60, opacity: 0, stagger: 0.05, duration: 0.25, ease: 'power2.in',
        onComplete: () => { cart = []; updateCartCount(); renderCart(); }
      });
    } else {
      cart = []; updateCartCount(); renderCart();
    }
  });

  // ── Place Order → WhatsApp ────────────────
  document.getElementById('orderBtn').addEventListener('click', () => {
    if (cart.length === 0) {
      gsap.fromTo('#orderBtn', { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)' });
      return;
    }

    const custName    = document.getElementById('custName').value.trim();
    const custPhone   = document.getElementById('custPhone').value.trim();
    const custAddress = document.getElementById('custAddress').value.trim();

    // Build summary for the confirmation modal
    const sub   = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const ship  = getShipping(sub);
    const lines = cart.map(i => `• ${i.name} ×${i.qty} — $${(i.price * i.qty).toFixed(2)}`).join('<br>');
    document.getElementById('orderSummaryText').innerHTML =
      lines + `<br><br><strong>Total: $${(sub + ship).toFixed(2)}</strong>`;

    // Send to WhatsApp
    sendOrderToWhatsApp(custName, custPhone, custAddress);

    closeCartDrawer();
    setTimeout(() => {
      openModal('orderModal', 'orderModalBox');
      launchConfetti();
    }, 450);

    // Reset cart & form
    cart = [];
    updateCartCount();
    renderCart();
    ['custName','custPhone','custAddress'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  });

  document.getElementById('closeOrder').addEventListener('click', () => closeModal('orderModal','orderModalBox'));
  document.getElementById('orderModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal('orderModal','orderModalBox');
  });

  // ── Auth ─────────────────────────────────
  document.getElementById('authLink').addEventListener('click', () => openModal('authModal','authModalBox'));
  document.getElementById('closeAuth').addEventListener('click', () => closeModal('authModal','authModalBox'));
  document.getElementById('authModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal('authModal','authModalBox');
  });
  document.getElementById('tabLogin').addEventListener('click',    () => switchTab('login'));
  document.getElementById('tabRegister').addEventListener('click', () => switchTab('register'));

  document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim();
    const pass  = document.getElementById('loginPassword').value.trim();
    if (!email || !pass) { shakeForm('loginForm'); return; }
    currentUser = { name: email.split('@')[0], email };
    onLoggedIn();
  });
  document.getElementById('registerBtn').addEventListener('click', () => {
    const name  = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass  = document.getElementById('regPassword').value.trim();
    if (!name || !email || !pass) { shakeForm('registerForm'); return; }
    currentUser = { name, email };
    onLoggedIn();
  });

  // ── Search ───────────────────────────────
  document.getElementById('searchInput').addEventListener('keyup', function () {
    const val  = this.value.toLowerCase();
    const all  = Array.from(document.querySelectorAll('.product'));
    const show = all.filter(p => p.querySelector('h2').textContent.toLowerCase().includes(val));
    const hide = all.filter(p => !p.querySelector('h2').textContent.toLowerCase().includes(val));
    animateSearchFilter(show, hide);
  });

  // ── Sidebar ──────────────────────────────
  document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
  document.getElementById('closeBtn').addEventListener('click', closeSidebar);
  document.getElementById('overlay').addEventListener('click', closeSidebar);

  // ── Hero button ──────────────────────────
  document.getElementById('heroBtn').addEventListener('click', () => {
    document.getElementById('productsGrid').scrollIntoView({ behavior: 'smooth' });
  });

  updateCartCount();
});

// ════════════════════════════════════════════
//  CONFETTI BURST
// ════════════════════════════════════════════
function launchConfetti() {
  const colors = ['#d4a843','#e07b2a','#fff','#13b113','#ff6b6b'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      width:${gsap.utils.random(6, 12)}px;
      height:${gsap.utils.random(6, 12)}px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      background:${colors[Math.floor(Math.random() * colors.length)]};
      left:50%; top:50%;
    `;
    document.body.appendChild(p);
    gsap.to(p, {
      x: gsap.utils.random(-window.innerWidth / 2, window.innerWidth / 2),
      y: gsap.utils.random(-300, 300),
      rotation: gsap.utils.random(-360, 360),
      opacity: 0, duration: gsap.utils.random(0.8, 1.6),
      ease: 'power2.out', onComplete: () => p.remove()
    });
  }
}

// ════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════
function shakeForm(id) {
  gsap.fromTo('#' + id, { x: -10 },
    { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)',
      keyframes: { x: [-10, 10, -8, 8, -5, 5, 0] } });
}

function switchTab(tab) {
  const isLogin  = tab === 'login';
  const showForm = document.getElementById(isLogin ? 'loginForm'    : 'registerForm');
  const hideForm = document.getElementById(isLogin ? 'registerForm' : 'loginForm');
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabRegister').classList.toggle('active', !isLogin);
  gsap.to(hideForm, {
    opacity: 0, x: -20, duration: 0.2,
    onComplete: () => {
      hideForm.classList.add('hidden');
      showForm.classList.remove('hidden');
      gsap.fromTo(showForm, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
    }
  });
  document.querySelectorAll('.form-error').forEach(e => e.remove());
}

function onLoggedIn() {
  closeModal('authModal', 'authModalBox');
  const link = document.getElementById('authLink');
  gsap.to(link, {
    opacity: 0, y: -10, duration: 0.2,
    onComplete: () => {
      link.textContent = '👋 ' + currentUser.name;
      gsap.to(link, { opacity: 1, y: 0, duration: 0.3, ease: 'bounce' });
    }
  });
}