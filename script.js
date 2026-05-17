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
// ÉCRAN SOS
// ═══════════════════════════════════════════
const SOS_DURATION = 3000; // ms pour activer
let sosTimer = null;
let sosStart = null;
let sosAnimFrame = null;

const sosBigBtn    = document.getElementById('sosBigBtn');
const sosProgressFill = document.getElementById('sosProgressFill');
const sosActivated = document.getElementById('sos-activated');
const circumference = 2 * Math.PI * 54; // 339

function startSOS() {
  sosStart = Date.now();
  animateSOS();
}

function animateSOS() {
  const elapsed = Date.now() - sosStart;
  const progress = Math.min(elapsed / SOS_DURATION, 1);
  const offset = circumference * (1 - progress);
  sosProgressFill.style.strokeDashoffset = offset;

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
sosBigBtn.addEventListener('mouseup',   stopSOS);
sosBigBtn.addEventListener('mouseleave',stopSOS);
sosBigBtn.addEventListener('touchend',  stopSOS);

// ═══════════════════════════════════════════
// ÉCRAN PARKING
// ═══════════════════════════════════════════
let selectedSpot = null;

// Cliquer sur une place
document.querySelectorAll('.pspot').forEach(spot => {
  spot.addEventListener('click', () => {
    // Retirer la sélection précédente (sauf voiture enregistrée)
    document.querySelectorAll('.pspot.selected').forEach(s => s.classList.remove('selected'));
    spot.classList.add('selected');
    selectedSpot = spot.dataset.spot;

    // Alerte si zone sombre
    const alert = document.getElementById('parkingAlert');
    if (spot.classList.contains('dark')) {
      alert.style.display = 'block';
    } else {
      alert.style.display = 'none';
    }
  });
});

function saveSpot() {
  if (!selectedSpot) {
    // Utiliser la place B2 par défaut (simulée comme "ma place actuelle")
    selectedSpot = 'B2';
  }
  localStorage.setItem('topshop_parking_spot', selectedSpot);

  // Affichage
  document.getElementById('savedSpotLabel').textContent = selectedSpot;
  document.getElementById('savedSpotInfo').style.display = 'flex';

  // Marquer visuellement
  document.querySelectorAll('.pspot').forEach(s => s.classList.remove('my-car'));
  const spotEl = document.querySelector(`[data-spot="${selectedSpot}"]`);
  if (spotEl) {
    spotEl.classList.add('my-car');
    spotEl.textContent = selectedSpot + ' 🚗';
  }

  navigator.vibrate && navigator.vibrate(100);
}

function clearSpot() {
  localStorage.removeItem('topshop_parking_spot');
  document.getElementById('savedSpotInfo').style.display = 'none';

  document.querySelectorAll('.pspot').forEach(s => {
    s.classList.remove('my-car', 'selected');
    s.textContent = s.dataset.spot;
  });
  selectedSpot = null;
}

// Charger la place sauvegardée au démarrage
function loadSavedSpot() {
  const saved = localStorage.getItem('topshop_parking_spot');
  if (saved) {
    selectedSpot = saved;
    document.getElementById('savedSpotLabel').textContent = saved;
    document.getElementById('savedSpotInfo').style.display = 'flex';

    const spotEl = document.querySelector(`[data-spot="${saved}"]`);
    if (spotEl) {
      spotEl.classList.add('my-car');
      spotEl.textContent = saved + ' 🚗';
    }
  }
}
loadSavedSpot();

// ═══════════════════════════════════════════
// ÉCRAN MAGASIN — CARTE SVG + RECHERCHE
// ═══════════════════════════════════════════

// ── Dictionnaire produits → rayon SVG ──
// rayon = data-rayon du <g> dans le SVG
// cx/cy = centre approximatif du rayon dans le viewBox 620×780
const produits = {
  // Fruits
  'pomme':   { rayon: 'fruits', label: 'Fruits', emoji: '🍎', cx: 495, cy: 331 },
  'pommes':  { rayon: 'fruits', label: 'Fruits', emoji: '🍎', cx: 495, cy: 331 },
  'banane':  { rayon: 'fruits', label: 'Fruits', emoji: '🍌', cx: 495, cy: 331 },
  'bananes': { rayon: 'fruits', label: 'Fruits', emoji: '🍌', cx: 495, cy: 331 },
  'citron':  { rayon: 'fruits', label: 'Fruits', emoji: '🍋', cx: 495, cy: 331 },
  'raisin':  { rayon: 'fruits', label: 'Fruits', emoji: '🍇', cx: 495, cy: 331 },
  // Légumes
  'tomate':   { rayon: 'legumes', label: 'Légumes', emoji: '🍅', cx: 495, cy: 255 },
  'tomates':  { rayon: 'legumes', label: 'Légumes', emoji: '🍅', cx: 495, cy: 255 },
  'carotte':  { rayon: 'legumes', label: 'Légumes', emoji: '🥕', cx: 495, cy: 255 },
  'carottes': { rayon: 'legumes', label: 'Légumes', emoji: '🥕', cx: 495, cy: 255 },
  'salade':   { rayon: 'legumes', label: 'Légumes', emoji: '🥗', cx: 495, cy: 255 },
  'oignon':   { rayon: 'legumes', label: 'Légumes', emoji: '🧅', cx: 495, cy: 255 },
  'oignons':  { rayon: 'legumes', label: 'Légumes', emoji: '🧅', cx: 495, cy: 255 },
  'ail':      { rayon: 'legumes', label: 'Légumes', emoji: '🧄', cx: 495, cy: 255 },
  'poireau':  { rayon: 'legumes', label: 'Légumes', emoji: '🥬', cx: 495, cy: 255 },
  // Boulangerie
  'pain':      { rayon: 'boulangerie', label: 'Boulangerie', emoji: '🥖', cx: 569, cy: 621 },
  'baguette':  { rayon: 'boulangerie', label: 'Boulangerie', emoji: '🥖', cx: 569, cy: 621 },
  'brioche':   { rayon: 'viennoiserie', label: 'Brioche · Gâteaux', emoji: '🍞', cx: 569, cy: 565 },
  'gateau':    { rayon: 'gateaux', label: 'Gâteaux', emoji: '🎂', cx: 53, cy: 173 },
  'gâteau':    { rayon: 'gateaux', label: 'Gâteaux', emoji: '🎂', cx: 53, cy: 173 },
  'croissant': { rayon: 'viennoiserie', label: 'Brioche · Gâteaux', emoji: '🥐', cx: 569, cy: 565 },
  'pain de mie':{ rayon: 'pain-mie', label: 'Pain de mie', emoji: '🍞', cx: 569, cy: 591 },
  // Boucherie / Viande
  'poulet':  { rayon: 'boucherie', label: 'Boucherie', emoji: '🍗', cx: 375, cy: 23 },
  'steak':   { rayon: 'boucherie', label: 'Boucherie', emoji: '🥩', cx: 375, cy: 23 },
  'boeuf':   { rayon: 'boucherie', label: 'Boucherie', emoji: '🥩', cx: 375, cy: 23 },
  'bœuf':    { rayon: 'boucherie', label: 'Boucherie', emoji: '🥩', cx: 375, cy: 23 },
  'agneau':  { rayon: 'boucherie', label: 'Boucherie', emoji: '🥩', cx: 375, cy: 23 },
  // Volailles / Charcuterie
  'jambon':    { rayon: 'charcuterie', label: 'Charcuterie', emoji: '🥩', cx: 196, cy: 242 },
  'saucisson': { rayon: 'charcuterie', label: 'Charcuterie', emoji: '🥩', cx: 196, cy: 242 },
  'lardons':   { rayon: 'charcuterie', label: 'Charcuterie', emoji: '🥩', cx: 196, cy: 242 },
  'dinde':     { rayon: 'volailles', label: 'Volailles', emoji: '🍗', cx: 162, cy: 242 },
  // Fromage / Traiteur
  'fromage':  { rayon: 'fromage', label: 'Fromage libre service', emoji: '🧀', cx: 230, cy: 242 },
  'camembert':{ rayon: 'fromage', label: 'Fromage libre service', emoji: '🧀', cx: 230, cy: 242 },
  'traiteur': { rayon: 'traiteur', label: 'Fromagerie · Traiteur', emoji: '🍽', cx: 301, cy: 245 },
  // Crémerie / Lait / Oeufs
  'lait':   { rayon: 'lait-oeufs', label: 'Lait', emoji: '🥛', cx: 53, cy: 94 },
  'beurre': { rayon: 'cremerie', label: 'Crémerie', emoji: '🧈', cx: 264, cy: 242 },
  'crème':  { rayon: 'cremerie', label: 'Crémerie', emoji: '🥛', cx: 264, cy: 242 },
  'oeuf':   { rayon: 'oeufs-haut', label: 'Œufs', emoji: '🥚', cx: 276, cy: 94 },
  'oeufs':  { rayon: 'oeufs-haut', label: 'Œufs', emoji: '🥚', cx: 276, cy: 94 },
  'œufs':   { rayon: 'oeufs-haut', label: 'Œufs', emoji: '🥚', cx: 276, cy: 94 },
  // Yaourts
  'yaourt':  { rayon: 'yaourts', label: 'Yaourts · Laitiers', emoji: '🥛', cx: 196, cy: 540 },
  'yaourts': { rayon: 'yaourts', label: 'Yaourts · Laitiers', emoji: '🥛', cx: 196, cy: 540 },
  // Pâtes / Riz / Farine
  'pates':   { rayon: 'pates', label: 'Pâtes', emoji: '🍝', cx: 53, cy: 447 },
  'pâtes':   { rayon: 'pates', label: 'Pâtes', emoji: '🍝', cx: 53, cy: 447 },
  'riz':     { rayon: 'riz-farine', label: 'Riz · Farine', emoji: '🍚', cx: 53, cy: 329 },
  'farine':  { rayon: 'riz-farine', label: 'Riz · Farine', emoji: '🌾', cx: 53, cy: 329 },
  'sucre':   { rayon: 'epicerie-seche', label: 'Sucre · Farine', emoji: '🍬', cx: 53, cy: 144 },
  'sel':     { rayon: 'conserves', label: 'Conserves · Épices', emoji: '🧂', cx: 53, cy: 362 },
  'huile':   { rayon: 'monde', label: 'Produits du Monde', emoji: '🫙', cx: 53, cy: 395 },
  'conserve':{ rayon: 'conserves', label: 'Conserves', emoji: '🥫', cx: 53, cy: 362 },
  'sauce':   { rayon: 'conserves', label: 'Conserves', emoji: '🍅', cx: 53, cy: 362 },
  'confiture':{ rayon: 'compotes', label: 'Compotes · Confitures', emoji: '🍓', cx: 53, cy: 225 },
  'cereales':{ rayon: 'cereales', label: 'Céréales', emoji: '🌾', cx: 53, cy: 251 },
  'céréales':{ rayon: 'cereales', label: 'Céréales', emoji: '🌾', cx: 53, cy: 251 },
  // Café / Thé
  'café':    { rayon: 'cafe', label: 'Café · Thé', emoji: '☕', cx: 53, cy: 277 },
  'cafe':    { rayon: 'cafe', label: 'Café · Thé', emoji: '☕', cx: 53, cy: 277 },
  'thé':     { rayon: 'cafe', label: 'Café · Thé', emoji: '🍵', cx: 53, cy: 277 },
  // Boissons
  'eau':     { rayon: 'eaux', label: 'Eaux minérales', emoji: '💧', cx: 3, cy: 470 },
  'eau minérale': { rayon: 'eaux', label: 'Eaux minérales', emoji: '💧', cx: 3, cy: 470 },
  'jus':     { rayon: 'boissons', label: 'Sodas · Jus', emoji: '🧃', cx: 53, cy: 499 },
  'coca':    { rayon: 'boissons', label: 'Sodas · Jus', emoji: '🥤', cx: 53, cy: 499 },
  'soda':    { rayon: 'boissons', label: 'Sodas · Jus', emoji: '🥤', cx: 53, cy: 499 },
  'vin':     { rayon: 'vins', label: 'Vins · Champagne', emoji: '🍷', cx: 569, cy: 91 },
  'bière':   { rayon: 'alcools', label: 'Alcools · Bières', emoji: '🍺', cx: 53, cy: 473 },
  'biere':   { rayon: 'alcools', label: 'Alcools · Bières', emoji: '🍺', cx: 53, cy: 473 },
  'champagne':{ rayon: 'vins', label: 'Vins · Champagne', emoji: '🍾', cx: 569, cy: 91 },
  // Surgelés
  'glace':   { rayon: 'surgeles', label: 'Surgelés', emoji: '🍦', cx: 262, cy: 540 },
  'pizza':   { rayon: 'surgeles', label: 'Surgelés', emoji: '🍕', cx: 262, cy: 540 },
  'surgele': { rayon: 'surgeles', label: 'Surgelés', emoji: '🧊', cx: 262, cy: 540 },
  'surgelé': { rayon: 'surgeles', label: 'Surgelés', emoji: '🧊', cx: 262, cy: 540 },
  // Hygiène / Beauté
  'shampoing':  { rayon: 'hygiene', label: 'Hygiène Beauté', emoji: '🧴', cx: 569, cy: 263 },
  'savon':      { rayon: 'hygiene', label: 'Hygiène Beauté', emoji: '🧼', cx: 569, cy: 263 },
  'dentifrice': { rayon: 'hygiene', label: 'Hygiène Beauté', emoji: '🦷', cx: 569, cy: 263 },
  'deodorant':  { rayon: 'hygiene', label: 'Hygiène Beauté', emoji: '🧴', cx: 569, cy: 263 },
  'déodorant':  { rayon: 'hygiene', label: 'Hygiène Beauté', emoji: '🧴', cx: 569, cy: 263 },
  'maquillage': { rayon: 'maquillage', label: 'Maquillage', emoji: '💄', cx: 617, cy: 356 },
  'papier toilette': { rayon: 'papier-toilette', label: 'Papier Toilette', emoji: '🧻', cx: 617, cy: 210 },
  'lessive':    { rayon: 'lessive', label: 'Lessive', emoji: '🧺', cx: 53, cy: 551 },
  'menage':     { rayon: 'menage', label: 'Produits Ménagers', emoji: '🧹', cx: 53, cy: 525 },
  'ménage':     { rayon: 'menage', label: 'Produits Ménagers', emoji: '🧹', cx: 53, cy: 525 },
  // Animaux
  'croquettes': { rayon: 'animaux', label: 'Chiens · Chats', emoji: '🐾', cx: 53, cy: 577 },
  'chat':       { rayon: 'animaux', label: 'Chiens · Chats', emoji: '🐱', cx: 53, cy: 577 },
  'chien':      { rayon: 'animaux', label: 'Chiens · Chats', emoji: '🐶', cx: 53, cy: 577 },
  // Apéro / Chips
  'chips':      { rayon: 'apero', label: 'Chips · Apéro', emoji: '🥔', cx: 53, cy: 421 },
  'apero':      { rayon: 'apero', label: 'Chips · Apéro', emoji: '🍿', cx: 53, cy: 421 },
  'apéro':      { rayon: 'apero', label: 'Chips · Apéro', emoji: '🍿', cx: 53, cy: 421 },
  // Bio
  'bio':        { rayon: 'bio', label: 'Bio Vrac', emoji: '🌿', cx: 460, cy: 188 },
  'local':      { rayon: 'local', label: 'Produits Locaux · Bio', emoji: '🏡', cx: 495, cy: 575 },
  // Confiserie
  'bonbon':     { rayon: 'confiserie', label: 'Confiserie · Chocolat', emoji: '🍬', cx: 53, cy: 199 },
  'chocolat':   { rayon: 'confiserie', label: 'Confiserie · Chocolat', emoji: '🍫', cx: 53, cy: 199 },
};

// ── Recherche produit → point rouge sur la carte ──
function searchProduct(query) {
  const q = query.trim().toLowerCase();
  const notFoundDiv = document.getElementById('searchResult');
  const foundDiv    = document.getElementById('searchResultDetail');
  const dot         = document.getElementById('productDot');

  // Reset
  notFoundDiv.style.display = 'none';
  foundDiv.style.display    = 'none';
  dot.setAttribute('opacity', '0');
  document.querySelectorAll('.map-rayon.highlighted').forEach(r => r.classList.remove('highlighted'));

  if (!q) return;

  // Chercher
  let found = null;
  for (const [key, val] of Object.entries(produits)) {
    if (q === key || q.includes(key) || key.includes(q)) { found = val; break; }
  }

  if (found) {
    // Surligner le groupe SVG
    document.querySelectorAll(`[data-rayon="${found.rayon}"]`).forEach(el => el.classList.add('highlighted'));

    // Placer le point rouge
    dot.setAttribute('cx', found.cx);
    dot.setAttribute('cy', found.cy);
    dot.setAttribute('opacity', '1');

    // Afficher le résultat
    foundDiv.style.display = 'flex';
    document.getElementById('searchResultIcon').textContent = found.emoji;
    document.getElementById('searchResultLabel').textContent = `${found.label}`;
    document.getElementById('searchResultSub').textContent  = `"${query}" se trouve dans ce rayon`;
  } else {
    notFoundDiv.style.display = 'block';
    notFoundDiv.textContent = `"${query}" non trouvé — essayez un autre terme`;
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
  let lastDist = 0, lastMidX = 0, lastMidY = 0;
  let dragging = false, dragStartX = 0, dragStartY = 0, dragTx = 0, dragTy = 0;

  const MIN_SCALE = 1, MAX_SCALE = 5;

  function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

  function applyTransform() {
    // Clamper la translation pour ne pas sortir des bords
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    tx = clamp(tx, vw * (1 - scale), 0);
    ty = clamp(ty, vh * (1 - scale), 0);
    inner.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  function dist(t1, t2) {
    const dx = t1.clientX - t2.clientX, dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }
  function mid(t1, t2) {
    return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
  }

  viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      lastDist = dist(e.touches[0], e.touches[1]);
      const m = mid(e.touches[0], e.touches[1]);
      const rect = viewport.getBoundingClientRect();
      lastMidX = m.x - rect.left;
      lastMidY = m.y - rect.top;
    } else if (e.touches.length === 1) {
      dragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
      dragTx = tx; dragTy = ty;
    }
  }, { passive: false });

  viewport.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const newDist = dist(e.touches[0], e.touches[1]);
      const ratio   = newDist / lastDist;
      const m = mid(e.touches[0], e.touches[1]);
      const rect = viewport.getBoundingClientRect();
      const mx = m.x - rect.left, my = m.y - rect.top;

      // Zoom autour du centre du pinch
      const newScale = clamp(scale * ratio, MIN_SCALE, MAX_SCALE);
      tx = mx - (mx - tx) * (newScale / scale);
      ty = my - (my - ty) * (newScale / scale);
      scale = newScale;

      lastDist = newDist;
      lastMidX = mx; lastMidY = my;
      applyTransform();
    } else if (e.touches.length === 1 && dragging) {
      e.preventDefault();
      tx = dragTx + (e.touches[0].clientX - dragStartX);
      ty = dragTy + (e.touches[0].clientY - dragStartY);
      applyTransform();
    }
  }, { passive: false });

  viewport.addEventListener('touchend', () => { dragging = false; });

  // Drag souris (desktop)
  viewport.addEventListener('mousedown', e => {
    dragging = true;
    dragStartX = e.clientX; dragStartY = e.clientY;
    dragTx = tx; dragTy = ty;
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    tx = dragTx + (e.clientX - dragStartX);
    ty = dragTy + (e.clientY - dragStartY);
    applyTransform();
  });
  window.addEventListener('mouseup', () => { dragging = false; });

  // Scroll molette (desktop)
  viewport.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    const newScale = clamp(scale * delta, MIN_SCALE, MAX_SCALE);
    tx = mx - (mx - tx) * (newScale / scale);
    ty = my - (my - ty) * (newScale / scale);
    scale = newScale;
    applyTransform();
  }, { passive: false });
})();

// ═══════════════════════════════════════════
// ÉCRAN LISTE DE COURSES
// ═══════════════════════════════════════════
let items = JSON.parse(localStorage.getItem('topshop_liste') || '[]');

const recettes = {
  carbonara: ['Pâtes', 'Lardons', 'Œufs', 'Parmesan', 'Crème fraîche', 'Poivre'],
  salade:    ['Laitue romaine', 'Poulet', 'Parmesan', 'Croûtons', 'Sauce César'],
  omelette:  ['Œufs', 'Beurre', 'Sel', 'Poivre', 'Fromage', 'Champignons'],
  smoothie:  ['Bananes', 'Fraises', 'Lait', 'Yaourt', 'Miel'],
};

function addItem() {
  const input = document.getElementById('newItem');
  const val = input.value.trim();
  if (!val) return;

  items.push({ id: Date.now(), name: val, checked: false });
  saveAndRender();
  input.value = '';
  input.focus();
}

function toggleItem(id) {
  const item = items.find(i => i.id === id);
  if (item) item.checked = !item.checked;
  saveAndRender();
}

function deleteItem(id) {
  items = items.filter(i => i.id !== id);
  saveAndRender();
}

function clearChecked() {
  items = items.filter(i => !i.checked);
  saveAndRender();
}

function clearAll() {
  if (items.length === 0) return;
  items = [];
  saveAndRender();
}

function addRecipe(name) {
  const ingredients = recettes[name] || [];
  ingredients.forEach(ing => {
    if (!items.find(i => i.name.toLowerCase() === ing.toLowerCase())) {
      items.push({ id: Date.now() + Math.random(), name: ing, checked: false });
    }
  });
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem('topshop_liste', JSON.stringify(items));
  renderListe();
}

function renderListe() {
  const list  = document.getElementById('shoppingList');
  const empty = document.getElementById('listeEmpty');
  const actions = document.getElementById('listeActions');
  const stats = document.getElementById('listeStats');

  list.innerHTML = '';

  if (items.length === 0) {
    empty.style.display = 'block';
    actions.style.display = 'none';
    stats.textContent = '';
    return;
  }

  empty.style.display = 'none';
  actions.style.display = 'flex';

  const total   = items.length;
  const checked = items.filter(i => i.checked).length;
  stats.textContent = `${checked} / ${total} produits cochés`;

  items.forEach(item => {
    const li = document.createElement('li');
    if (item.checked) li.classList.add('checked');

    const checkbox = document.createElement('div');
    checkbox.className = 'item-checkbox' + (item.checked ? ' checked' : '');
    checkbox.textContent = item.checked ? '✓' : '';
    checkbox.onclick = () => toggleItem(item.id);

    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = item.name;

    const del = document.createElement('button');
    del.className = 'item-delete';
    del.textContent = '×';
    del.onclick = () => deleteItem(item.id);

    li.appendChild(checkbox);
    li.appendChild(name);
    li.appendChild(del);
    list.appendChild(li);
  });
}

// ─── Init ─────────────────────────────────
renderListe();
