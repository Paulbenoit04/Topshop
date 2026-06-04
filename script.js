/* ═══════════════════════════════════════════
   TOPSHOP — script.js
   Navigation, SOS, Parking, Liste de courses
═══════════════════════════════════════════ */

// ─── NAVIGATION ENTRE ÉCRANS ───────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add('active');
    screen.scrollTop = 0;
  }
}

// ═══════════════════════════════════════════
// DATABASE — localStorage wrapper
// ═══════════════════════════════════════════
const DB = {
  get: (key, fallback = null) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

// ═══════════════════════════════════════════
// RAYONS — liste complète du magasin
// ═══════════════════════════════════════════
const RAYONS = [
  { id: 'fruits',         label: '🍎 Fruits' },
  { id: 'legumes',        label: '🥦 Légumes' },
  { id: 'boucherie',      label: '🥩 Boucherie' },
  { id: 'volailles',      label: '🍗 Volailles' },
  { id: 'charcuterie',    label: '🥓 Charcuterie' },
  { id: 'fromage',        label: '🧀 Fromage' },
  { id: 'traiteur',       label: '🍱 Fromagerie · Traiteur' },
  { id: 'cremerie',       label: '🧈 Crémerie · Beurre' },
  { id: 'lait-oeufs',     label: '🥛 Lait · Œufs · Crème' },
  { id: 'yaourts',        label: '🫙 Yaourts · Prod. laitiers' },
  { id: 'bio-frais',      label: '🌿 Compote · Jus frais · Bio' },
  { id: 'surgeles',       label: '🧊 Surgelés' },
  { id: 'epicerie-seche', label: '🌾 Épicerie sèche' },
  { id: 'pates',          label: '🍝 Pâtes' },
  { id: 'riz-farine',     label: '🍚 Riz · Farine' },
  { id: 'cereales',       label: '🥣 Céréales' },
  { id: 'conserves',      label: '🥫 Conserves · Condiments' },
  { id: 'confiserie',     label: '🍫 Confiserie · Chocolat' },
  { id: 'gateaux',        label: '🍰 Gâteaux · Biscuits' },
  { id: 'compotes',       label: '🍑 Compotes · Confitures' },
  { id: 'cafe',           label: '☕ Café · Thé' },
  { id: 'boissons',       label: '🥤 Sodas · Jus' },
  { id: 'alcools',        label: '🍺 Alcools · Bières' },
  { id: 'vins',           label: '🍷 Vins · Champagne' },
  { id: 'apero',          label: '🍿 Chips · Apéro' },
  { id: 'bio',            label: '🌱 Bio Vrac' },
  { id: 'local',          label: '🏡 Produits locaux · Bio' },
  { id: 'monde',          label: '🌍 Produits du monde' },
  { id: 'nutrition',      label: '💊 Nutrition · Bien-être' },
  { id: 'fruits-secs',    label: '🥜 Fruits secs' },
  { id: 'boulangerie',    label: '🥖 Boulangerie' },
  { id: 'viennoiserie',   label: '🥐 Brioche · Gâteaux moelleux' },
  { id: 'pain-mie',       label: '🍞 Pain de mie' },
  { id: 'menage',         label: '🧹 Produits ménagers' },
  { id: 'lessive',        label: '🫧 Lessive' },
  { id: 'hygiene',        label: '🧴 Hygiène Beauté' },
  { id: 'animaux',        label: '🐾 Chiens · Chats' },
  { id: 'bebe',           label: '🍼 Alimentation bébé' },
  { id: 'maison',         label: '🏠 Maison · Vaisselle' },
  { id: 'bricolage',      label: '🔧 Piles · Bricolage' },
  { id: 'jouets',         label: '🧸 Jouets' },
  { id: 'textile',        label: '👕 Textile · Linge' },
  { id: 'librairie',      label: '📚 Librairie · Informatique' },
  { id: 'papeterie',      label: '✏️ Papeterie' },
];

function getRayonLabel(id) {
  return RAYONS.find(r => r.id === id)?.label ?? id;
}

// ═══════════════════════════════════════════
// ÉCRAN SOS
// ═══════════════════════════════════════════
const SOS_DURATION = 2000;
let sosStart = null;
let sosAnimFrame = null;

const sosBigBtn       = document.getElementById('sosBigBtn');
const sosProgressFill = document.getElementById('sosProgressFill');
const sosActivated    = document.getElementById('sos-activated');
const circumference   = 2 * Math.PI * 54;

function startSOS() {
  sosStart = Date.now();
  animateSOS();
}

function animateSOS() {
  const elapsed  = Date.now() - sosStart;
  const progress = Math.min(elapsed / SOS_DURATION, 1);
  sosProgressFill.style.strokeDashoffset = circumference * (1 - progress);
  if (progress < 1) {
    sosAnimFrame = requestAnimationFrame(animateSOS);
  } else {
    triggerSOS();
  }
}

function stopSOS() {
  if (sosAnimFrame) cancelAnimationFrame(sosAnimFrame);
  sosProgressFill.style.strokeDashoffset = circumference;
  sosStart = null;
}

function triggerSOS() {
  sosProgressFill.style.strokeDashoffset = 0;
  sosActivated.classList.remove('hidden');
  sosBigBtn.style.pointerEvents = 'none';
  navigator.vibrate && navigator.vibrate([200, 100, 200]);
}

function cancelSOS() {
  sosActivated.classList.add('hidden');
  sosProgressFill.style.strokeDashoffset = circumference;
  sosBigBtn.style.pointerEvents = '';
}

sosBigBtn.addEventListener('mousedown', startSOS);
sosBigBtn.addEventListener('touchstart', e => { e.preventDefault(); startSOS(); });
sosBigBtn.addEventListener('mouseup',    stopSOS);
sosBigBtn.addEventListener('mouseleave', stopSOS);
sosBigBtn.addEventListener('touchend',   stopSOS);

// ═══════════════════════════════════════════
// ÉCRAN PARKING
// ═══════════════════════════════════════════
let selectedSpot = null;

document.querySelectorAll('.pspot').forEach(spot => {
  spot.addEventListener('click', () => {
    document.querySelectorAll('.pspot.selected').forEach(s => s.classList.remove('selected'));
    spot.classList.add('selected');
    selectedSpot = spot.dataset.spot;
    const alert = document.getElementById('parkingAlert');
    alert.style.display = spot.classList.contains('dark') ? 'block' : 'none';
  });
});

function saveSpot() {
  if (!selectedSpot) selectedSpot = 'B2';
  DB.set('topshop_parking_spot', selectedSpot);
  document.getElementById('savedSpotLabel').textContent = selectedSpot;
  document.getElementById('savedSpotInfo').style.display = 'flex';
  document.querySelectorAll('.pspot').forEach(s => s.classList.remove('my-car'));
  const spotEl = document.querySelector(`[data-spot="${selectedSpot}"]`);
  if (spotEl) { spotEl.classList.add('my-car'); spotEl.textContent = selectedSpot + ' 🚗'; }
  navigator.vibrate && navigator.vibrate(100);
}

function clearSpot() {
  DB.set('topshop_parking_spot', null);
  document.getElementById('savedSpotInfo').style.display = 'none';
  document.querySelectorAll('.pspot').forEach(s => {
    s.classList.remove('my-car', 'selected');
    s.textContent = s.dataset.spot;
  });
  selectedSpot = null;
}

function loadSavedSpot() {
  const saved = DB.get('topshop_parking_spot');
  if (saved) {
    selectedSpot = saved;
    document.getElementById('savedSpotLabel').textContent = saved;
    document.getElementById('savedSpotInfo').style.display = 'flex';
    const spotEl = document.querySelector(`[data-spot="${saved}"]`);
    if (spotEl) { spotEl.classList.add('my-car'); spotEl.textContent = saved + ' 🚗'; }
  }
}
loadSavedSpot();

// ═══════════════════════════════════════════
// ÉCRAN MAGASIN — CARTE SVG + RECHERCHE
// ═══════════════════════════════════════════
const produits = {
  'pomme':     { rayon: 'fruits',         label: 'Fruits',                emoji: '🍎', cx: 395, cy: 331 },
  'pommes':    { rayon: 'fruits',         label: 'Fruits',                emoji: '🍎', cx: 395, cy: 331 },
  'banane':    { rayon: 'fruits',         label: 'Fruits',                emoji: '🍌', cx: 395, cy: 331 },
  'bananes':   { rayon: 'fruits',         label: 'Fruits',                emoji: '🍌', cx: 395, cy: 331 },
  'citron':    { rayon: 'fruits',         label: 'Fruits',                emoji: '🍋', cx: 395, cy: 331 },
  'raisin':    { rayon: 'fruits',         label: 'Fruits',                emoji: '🍇', cx: 395, cy: 331 },
  'tomate':    { rayon: 'legumes',        label: 'Légumes',               emoji: '🍅', cx: 395, cy: 255 },
  'tomates':   { rayon: 'legumes',        label: 'Légumes',               emoji: '🍅', cx: 395, cy: 255 },
  'carotte':   { rayon: 'legumes',        label: 'Légumes',               emoji: '🥕', cx: 395, cy: 255 },
  'carottes':  { rayon: 'legumes',        label: 'Légumes',               emoji: '🥕', cx: 395, cy: 255 },
  'salade':    { rayon: 'legumes',        label: 'Légumes',               emoji: '🥗', cx: 395, cy: 255 },
  'oignon':    { rayon: 'legumes',        label: 'Légumes',               emoji: '🧅', cx: 395, cy: 255 },
  'oignons':   { rayon: 'legumes',        label: 'Légumes',               emoji: '🧅', cx: 395, cy: 255 },
  'ail':       { rayon: 'legumes',        label: 'Légumes',               emoji: '🧄', cx: 395, cy: 255 },
  'poireau':   { rayon: 'legumes',        label: 'Légumes',               emoji: '🥬', cx: 395, cy: 255 },
  'pain':      { rayon: 'boulangerie',    label: 'Boulangerie',           emoji: '🥖', cx: 569, cy: 621 },
  'baguette':  { rayon: 'boulangerie',    label: 'Boulangerie',           emoji: '🥖', cx: 569, cy: 621 },
  'brioche':   { rayon: 'viennoiserie',   label: 'Brioche · Gâteaux',     emoji: '🍞', cx: 569, cy: 565 },
  'gateau':    { rayon: 'gateaux',        label: 'Gâteaux',               emoji: '🎂', cx: 53,  cy: 173 },
  'gâteau':    { rayon: 'gateaux',        label: 'Gâteaux',               emoji: '🎂', cx: 53,  cy: 173 },
  'croissant': { rayon: 'viennoiserie',   label: 'Brioche · Gâteaux',     emoji: '🥐', cx: 569, cy: 565 },
  'poulet':    { rayon: 'boucherie',      label: 'Boucherie',             emoji: '🍗', cx: 375, cy: 23  },
  'steak':     { rayon: 'boucherie',      label: 'Boucherie',             emoji: '🥩', cx: 375, cy: 23  },
  'boeuf':     { rayon: 'boucherie',      label: 'Boucherie',             emoji: '🥩', cx: 375, cy: 23  },
  'bœuf':      { rayon: 'boucherie',      label: 'Boucherie',             emoji: '🥩', cx: 375, cy: 23  },
  'agneau':    { rayon: 'boucherie',      label: 'Boucherie',             emoji: '🥩', cx: 375, cy: 23  },
  'jambon':    { rayon: 'charcuterie',    label: 'Charcuterie',           emoji: '🥩', cx: 196, cy: 242 },
  'saucisson': { rayon: 'charcuterie',    label: 'Charcuterie',           emoji: '🥩', cx: 196, cy: 242 },
  'lardons':   { rayon: 'charcuterie',    label: 'Charcuterie',           emoji: '🥩', cx: 196, cy: 242 },
  'dinde':     { rayon: 'volailles',      label: 'Volailles',             emoji: '🍗', cx: 162, cy: 242 },
  'fromage':   { rayon: 'fromage',        label: 'Fromage libre service', emoji: '🧀', cx: 230, cy: 242 },
  'camembert': { rayon: 'fromage',        label: 'Fromage libre service', emoji: '🧀', cx: 230, cy: 242 },
  'traiteur':  { rayon: 'traiteur',       label: 'Fromagerie · Traiteur', emoji: '🍽', cx: 301, cy: 245 },
  'lait':      { rayon: 'lait-oeufs',     label: 'Lait',                  emoji: '🥛', cx: 53,  cy: 94  },
  'beurre':    { rayon: 'cremerie',       label: 'Crémerie',              emoji: '🧈', cx: 264, cy: 242 },
  'crème':     { rayon: 'cremerie',       label: 'Crémerie',              emoji: '🥛', cx: 264, cy: 242 },
  'oeuf':      { rayon: 'oeufs-haut',     label: 'Œufs',                  emoji: '🥚', cx: 276, cy: 94  },
  'oeufs':     { rayon: 'oeufs-haut',     label: 'Œufs',                  emoji: '🥚', cx: 276, cy: 94  },
  'œufs':      { rayon: 'oeufs-haut',     label: 'Œufs',                  emoji: '🥚', cx: 276, cy: 94  },
  'yaourt':    { rayon: 'yaourts',        label: 'Yaourts · Laitiers',    emoji: '🥛', cx: 196, cy: 540 },
  'yaourts':   { rayon: 'yaourts',        label: 'Yaourts · Laitiers',    emoji: '🥛', cx: 196, cy: 540 },
  'pates':     { rayon: 'pates',          label: 'Pâtes',                 emoji: '🍝', cx: 53,  cy: 447 },
  'pâtes':     { rayon: 'pates',          label: 'Pâtes',                 emoji: '🍝', cx: 53,  cy: 447 },
  'riz':       { rayon: 'riz-farine',     label: 'Riz · Farine',          emoji: '🍚', cx: 53,  cy: 329 },
  'farine':    { rayon: 'riz-farine',     label: 'Riz · Farine',          emoji: '🌾', cx: 53,  cy: 329 },
  'sucre':     { rayon: 'epicerie-seche', label: 'Sucre · Farine',        emoji: '🍬', cx: 53,  cy: 144 },
  'sel':       { rayon: 'conserves',      label: 'Conserves · Épices',    emoji: '🧂', cx: 53,  cy: 362 },
  'huile':     { rayon: 'monde',          label: 'Produits du Monde',     emoji: '🫙', cx: 53,  cy: 395 },
  'conserve':  { rayon: 'conserves',      label: 'Conserves',             emoji: '🥫', cx: 53,  cy: 362 },
  'sauce':     { rayon: 'conserves',      label: 'Conserves',             emoji: '🍅', cx: 53,  cy: 362 },
  'confiture': { rayon: 'compotes',       label: 'Compotes · Confitures', emoji: '🍓', cx: 53,  cy: 225 },
  'cereales':  { rayon: 'cereales',       label: 'Céréales',              emoji: '🌾', cx: 53,  cy: 251 },
  'céréales':  { rayon: 'cereales',       label: 'Céréales',              emoji: '🌾', cx: 53,  cy: 251 },
  'café':      { rayon: 'cafe',           label: 'Café · Thé',            emoji: '☕', cx: 53,  cy: 277 },
  'cafe':      { rayon: 'cafe',           label: 'Café · Thé',            emoji: '☕', cx: 53,  cy: 277 },
  'thé':       { rayon: 'cafe',           label: 'Café · Thé',            emoji: '🍵', cx: 53,  cy: 277 },
  'eau':       { rayon: 'boissons',       label: 'Eaux minérales',        emoji: '💧', cx: 53,  cy: 499 },
  'jus':       { rayon: 'boissons',       label: 'Sodas · Jus',           emoji: '🧃', cx: 53,  cy: 499 },
  'coca':      { rayon: 'boissons',       label: 'Sodas · Jus',           emoji: '🥤', cx: 53,  cy: 499 },
  'soda':      { rayon: 'boissons',       label: 'Sodas · Jus',           emoji: '🥤', cx: 53,  cy: 499 },
  'vin':       { rayon: 'vins',           label: 'Vins · Champagne',      emoji: '🍷', cx: 569, cy: 91  },
  'bière':     { rayon: 'alcools',        label: 'Alcools · Bières',      emoji: '🍺', cx: 53,  cy: 473 },
  'biere':     { rayon: 'alcools',        label: 'Alcools · Bières',      emoji: '🍺', cx: 53,  cy: 473 },
  'champagne': { rayon: 'vins',           label: 'Vins · Champagne',      emoji: '🍾', cx: 569, cy: 91  },
  'glace':     { rayon: 'surgeles',       label: 'Surgelés',              emoji: '🍦', cx: 262, cy: 540 },
  'pizza':     { rayon: 'surgeles',       label: 'Surgelés',              emoji: '🍕', cx: 262, cy: 540 },
  'surgelé':   { rayon: 'surgeles',       label: 'Surgelés',              emoji: '🧊', cx: 262, cy: 540 },
  'shampoing': { rayon: 'hygiene',        label: 'Hygiène Beauté',        emoji: '🧴', cx: 569, cy: 263 },
  'savon':     { rayon: 'hygiene',        label: 'Hygiène Beauté',        emoji: '🧼', cx: 569, cy: 263 },
  'dentifrice':{ rayon: 'hygiene',        label: 'Hygiène Beauté',        emoji: '🦷', cx: 569, cy: 263 },
  'déodorant': { rayon: 'hygiene',        label: 'Hygiène Beauté',        emoji: '🧴', cx: 569, cy: 263 },
  'lessive':   { rayon: 'lessive',        label: 'Lessive',               emoji: '🧺', cx: 53,  cy: 551 },
  'ménage':    { rayon: 'menage',         label: 'Produits Ménagers',     emoji: '🧹', cx: 53,  cy: 525 },
  'croquettes':{ rayon: 'animaux',        label: 'Chiens · Chats',        emoji: '🐾', cx: 53,  cy: 577 },
  'chips':     { rayon: 'apero',          label: 'Chips · Apéro',         emoji: '🥔', cx: 53,  cy: 421 },
  'apéro':     { rayon: 'apero',          label: 'Chips · Apéro',         emoji: '🍿', cx: 53,  cy: 421 },
  'bio':       { rayon: 'bio',            label: 'Bio Vrac',              emoji: '🌿', cx: 360, cy: 188 },
  'bonbon':    { rayon: 'confiserie',     label: 'Confiserie · Chocolat', emoji: '🍬', cx: 53,  cy: 199 },
  'chocolat':  { rayon: 'confiserie',     label: 'Confiserie · Chocolat', emoji: '🍫', cx: 53,  cy: 199 },
};

function searchProduct(query) {
  const q           = query.trim().toLowerCase();
  const notFoundDiv = document.getElementById('searchResult');
  const foundDiv    = document.getElementById('searchResultDetail');
  const dot         = document.getElementById('productDot');

  notFoundDiv.style.display = 'none';
  foundDiv.style.display    = 'none';
  dot.setAttribute('opacity', '0');
  document.querySelectorAll('.map-rayon.highlighted').forEach(r => r.classList.remove('highlighted'));
  if (!q) return;

  let found = null;
  for (const [key, val] of Object.entries(produits)) {
    if (q === key || q.replace(/s$/, '') === key) { found = val; break; }
  }

  if (found) {
    document.querySelectorAll(`[data-rayon="${found.rayon}"]`).forEach(el => el.classList.add('highlighted'));
    dot.setAttribute('cx', found.cx);
    dot.setAttribute('cy', found.cy);
    dot.setAttribute('opacity', '1');
    foundDiv.style.display = 'flex';
    document.getElementById('searchResultIcon').textContent  = found.emoji;
    document.getElementById('searchResultLabel').textContent = found.label;
    document.getElementById('searchResultSub').textContent   = `"${query}" se trouve dans ce rayon`;
  } else {
    notFoundDiv.style.display = 'block';
    notFoundDiv.textContent   = `"${query}" non trouvé — essayez un autre terme`;
  }
}

function highlightRayonSVG(rayon) {
  document.querySelectorAll('.map-rayon.highlighted').forEach(r => r.classList.remove('highlighted'));
  document.getElementById('productDot').setAttribute('opacity', '0');
  document.querySelectorAll(`[data-rayon="${rayon}"]`).forEach(el => el.classList.add('highlighted'));
}

// ── Pinch-to-zoom + drag sur la carte ──
(function initMapZoom() {
  const viewport = document.getElementById('mapViewport');
  const inner    = document.getElementById('mapInner');
  if (!viewport || !inner) return;

  let scale = 1, tx = 0, ty = 0;
  let lastDist = 0;
  let dragging = false, dragStartX = 0, dragStartY = 0, dragTx = 0, dragTy = 0;
  const MIN_SCALE = 1, MAX_SCALE = 5;

  function clamp(v, mn, mx) { return Math.min(Math.max(v, mn), mx); }
  function applyTransform() {
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    tx = clamp(tx, vw * (1 - scale), 0);
    ty = clamp(ty, vh * (1 - scale), 0);
    inner.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
  }
  function dist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  function mid(a, b)  { return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }; }

  viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 2) { e.preventDefault(); lastDist = dist(e.touches[0], e.touches[1]); }
    else if (e.touches.length === 1) { dragging = true; dragStartX = e.touches[0].clientX; dragStartY = e.touches[0].clientY; dragTx = tx; dragTy = ty; }
  }, { passive: false });

  viewport.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const nd = dist(e.touches[0], e.touches[1]);
      const m  = mid(e.touches[0], e.touches[1]);
      const rect = viewport.getBoundingClientRect();
      const mx = m.x - rect.left, my = m.y - rect.top;
      const ns = clamp(scale * nd / lastDist, MIN_SCALE, MAX_SCALE);
      tx = mx - (mx - tx) * ns / scale;
      ty = my - (my - ty) * ns / scale;
      scale = ns; lastDist = nd;
      applyTransform();
    } else if (e.touches.length === 1 && dragging) {
      e.preventDefault();
      tx = dragTx + e.touches[0].clientX - dragStartX;
      ty = dragTy + e.touches[0].clientY - dragStartY;
      applyTransform();
    }
  }, { passive: false });

  viewport.addEventListener('touchend', () => { dragging = false; });
  viewport.addEventListener('mousedown', e => { dragging = true; dragStartX = e.clientX; dragStartY = e.clientY; dragTx = tx; dragTy = ty; });
  window.addEventListener('mousemove',  e => { if (!dragging) return; tx = dragTx + e.clientX - dragStartX; ty = dragTy + e.clientY - dragStartY; applyTransform(); });
  window.addEventListener('mouseup',    () => { dragging = false; });
  viewport.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const ns = clamp(scale * (e.deltaY > 0 ? 0.85 : 1.18), MIN_SCALE, MAX_SCALE);
    tx = mx - (mx - tx) * ns / scale;
    ty = my - (my - ty) * ns / scale;
    scale = ns; applyTransform();
  }, { passive: false });
})();

// ═══════════════════════════════════════════
// LISTE DE COURSES — helpers DB
// ═══════════════════════════════════════════
function loadItems()     { return DB.get('topshop_liste', []); }
function saveItems(arr)  { DB.set('topshop_liste', arr); }
function loadRecipes()   { return DB.get('topshop_custom_recipes', []); }
function saveRecipes(arr){ DB.set('topshop_custom_recipes', arr); }

// ═══════════════════════════════════════════
// LISTE — Rendu
// ═══════════════════════════════════════════
function renderListe() {
  const items   = loadItems();
  const list    = document.getElementById('shoppingList');
  const empty   = document.getElementById('listeEmpty');
  const actions = document.getElementById('listeActions');
  const stats   = document.getElementById('listeStats');

  list.innerHTML = '';

  if (items.length === 0) {
    empty.style.display   = 'block';
    actions.style.display = 'none';
    stats.innerHTML       = '';
    return;
  }

  empty.style.display   = 'none';
  actions.style.display = 'flex';

  const total   = items.length;
  const checked = items.filter(i => i.checked).length;
  stats.innerHTML = `
    <span>${checked} / ${total} produit${total > 1 ? 's' : ''} coché${checked > 1 ? 's' : ''}</span>
    <div class="stats-bar"><div class="stats-fill" style="width:${Math.round(checked / total * 100)}%"></div></div>`;

  const grouped = {};
  items.forEach(item => {
    const g = item.rayon || '__aucun';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(item);
  });

  Object.entries(grouped).forEach(([rayon, group]) => {
    if (rayon !== '__aucun') {
      const header = document.createElement('li');
      header.className   = 'rayon-header';
      header.textContent = getRayonLabel(rayon);
      list.appendChild(header);
    }
    group.forEach(item => {
      const li = document.createElement('li');
      if (item.checked) li.classList.add('checked');

      const checkbox = document.createElement('div');
      checkbox.className   = 'item-checkbox' + (item.checked ? ' checked' : '');
      checkbox.textContent = item.checked ? '✓' : '';
      checkbox.onclick = () => toggleItem(item.id);

      const info = document.createElement('div');
      info.className = 'item-info';
      info.innerHTML = `<span class="item-name">${item.name}</span>
        ${item.rayon ? `<span class="item-rayon">${getRayonLabel(item.rayon)}</span>` : ''}`;

      const del = document.createElement('button');
      del.className   = 'item-delete';
      del.textContent = '×';
      del.onclick = () => deleteItem(item.id);

      li.appendChild(checkbox);
      li.appendChild(info);
      li.appendChild(del);
      list.appendChild(li);
    });
  });
}

// ═══════════════════════════════════════════
// LISTE — Actions
// ═══════════════════════════════════════════
function addItem() {
  const input = document.getElementById('newItem');
  const sel   = document.getElementById('newItemRayon');
  const name  = input.value.trim();
  if (!name) return;
  const items = loadItems();
  items.push({ id: Date.now(), name, rayon: sel ? sel.value : '', checked: false });
  saveItems(items);
  input.value = '';
  if (sel) sel.value = '';
  input.focus();
  renderListe();
}

function toggleItem(id) {
  const items = loadItems().map(i => i.id === id ? { ...i, checked: !i.checked } : i);
  saveItems(items);
  renderListe();
}

function deleteItem(id) {
  saveItems(loadItems().filter(i => i.id !== id));
  renderListe();
}

function clearChecked() {
  saveItems(loadItems().filter(i => !i.checked));
  renderListe();
}

function clearAll() {
  if (loadItems().length === 0) return;
  saveItems([]);
  renderListe();
}

// ═══════════════════════════════════════════
// RECETTES PRÉDÉFINIES
// ═══════════════════════════════════════════
const PRESET_RECIPES = {
  carbonara: { items: [
    { name: 'Pâtes',          rayon: 'pates' },
    { name: 'Lardons',        rayon: 'charcuterie' },
    { name: 'Œufs',           rayon: 'lait-oeufs' },
    { name: 'Parmesan',       rayon: 'fromage' },
    { name: 'Crème fraîche',  rayon: 'cremerie' },
    { name: 'Poivre',         rayon: 'conserves' },
  ]},
  salade: { items: [
    { name: 'Laitue romaine', rayon: 'legumes' },
    { name: 'Poulet',         rayon: 'boucherie' },
    { name: 'Parmesan',       rayon: 'fromage' },
    { name: 'Croûtons',       rayon: 'boulangerie' },
    { name: 'Sauce César',    rayon: 'conserves' },
  ]},
  omelette: { items: [
    { name: 'Œufs',        rayon: 'lait-oeufs' },
    { name: 'Beurre',      rayon: 'cremerie' },
    { name: 'Fromage',     rayon: 'fromage' },
    { name: 'Champignons', rayon: 'legumes' },
    { name: 'Sel',         rayon: 'conserves' },
    { name: 'Poivre',      rayon: 'conserves' },
  ]},
  smoothie: { items: [
    { name: 'Bananes', rayon: 'fruits' },
    { name: 'Fraises', rayon: 'fruits' },
    { name: 'Lait',    rayon: 'lait-oeufs' },
    { name: 'Yaourt',  rayon: 'yaourts' },
    { name: 'Miel',    rayon: 'compotes' },
  ]},
};

function addRecipe(key) {
  const recipe = PRESET_RECIPES[key];
  if (!recipe) return;
  const items = loadItems();
  recipe.items.forEach(ri => {
    if (!items.find(i => i.name.toLowerCase() === ri.name.toLowerCase()))
      items.push({ id: Date.now() + Math.random(), name: ri.name, rayon: ri.rayon, checked: false });
  });
  saveItems(items);
  renderListe();
}

// ═══════════════════════════════════════════
// RECETTES PERSONNALISÉES
// ═══════════════════════════════════════════
function renderCustomRecipes() {
  const container = document.getElementById('customRecipesList');
  if (!container) return;
  const recipes = loadRecipes();
  container.innerHTML = '';
  if (recipes.length === 0) {
    container.innerHTML = '<p class="no-recipes">Aucune recette personnalisée.</p>';
    return;
  }
  recipes.forEach((r, idx) => {
    const div = document.createElement('div');
    div.className = 'recette-card custom-recipe-card';
    div.innerHTML = `
      <span>${r.emoji || '📋'}</span>
      <span>${r.name}</span>
      <button class="btn-use-recipe" onclick="useCustomRecipe(${idx})">Ajouter</button>
      <button class="btn-del-recipe" onclick="deleteCustomRecipe(${idx})">✕</button>`;
    container.appendChild(div);
  });
}

function openCreateRecipe() {
  document.getElementById('createRecipeModal').classList.add('open');
  document.getElementById('recipeIngredientsList').innerHTML = '';
  document.getElementById('recipeName').value  = '';
  document.getElementById('recipeEmoji').value = '📋';
  addRecipeIngredientRow();
}

function closeCreateRecipe() {
  document.getElementById('createRecipeModal').classList.remove('open');
}

function buildRayonOptions(selected = '') {
  return RAYONS.map(r =>
    `<option value="${r.id}" ${r.id === selected ? 'selected' : ''}>${r.label}</option>`
  ).join('');
}

function addRecipeIngredientRow() {
  const list = document.getElementById('recipeIngredientsList');
  const row  = document.createElement('div');
  row.className = 'recipe-ingredient-row';
  row.innerHTML = `
    <input type="text" placeholder="Produit..." class="ri-name"/>
    <select class="ri-rayon">
      <option value="">— Rayon —</option>
      ${buildRayonOptions()}
    </select>
    <button onclick="this.parentElement.remove()">✕</button>`;
  list.appendChild(row);
}

function saveCustomRecipe() {
  const name  = document.getElementById('recipeName').value.trim();
  const emoji = document.getElementById('recipeEmoji').value.trim() || '📋';
  if (!name) { alert('Donnez un nom à la recette.'); return; }
  const rows  = document.querySelectorAll('.recipe-ingredient-row');
  const ingrs = [];
  rows.forEach(row => {
    const n = row.querySelector('.ri-name').value.trim();
    const r = row.querySelector('.ri-rayon').value;
    if (n) ingrs.push({ name: n, rayon: r });
  });
  if (ingrs.length === 0) { alert('Ajoutez au moins un produit.'); return; }
  const recipes = loadRecipes();
  recipes.push({ name, emoji, items: ingrs });
  saveRecipes(recipes);
  closeCreateRecipe();
  renderCustomRecipes();
}

function useCustomRecipe(idx) {
  const recipe = loadRecipes()[idx];
  if (!recipe) return;
  const items = loadItems();
  recipe.items.forEach(ri => {
    if (!items.find(i => i.name.toLowerCase() === ri.name.toLowerCase()))
      items.push({ id: Date.now() + Math.random(), name: ri.name, rayon: ri.rayon || '', checked: false });
  });
  saveItems(items);
  renderListe();
}

function deleteCustomRecipe(idx) {
  const recipes = loadRecipes();
  recipes.splice(idx, 1);
  saveRecipes(recipes);
  renderCustomRecipes();
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('newItemRayon');
  if (sel) {
    sel.innerHTML = `<option value="">— Rayon (optionnel) —</option>` +
      RAYONS.map(r => `<option value="${r.id}">${r.label}</option>`).join('');
  }
  renderListe();
  renderCustomRecipes();
});