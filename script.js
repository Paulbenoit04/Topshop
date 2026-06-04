/* ═══════════════════════════════════════════
   TOPSHOP — script.js  (version mergée)
   Fonctionnalités :
   - Navigation, SOS, Parking, Zoom carte
   - Recherche produit + highlight SVG
   - Liste de courses groupée par rayon
   - Recettes prédéfinies + recettes custom
   - Chemin optimal en magasin avec overlay SVG
   - Popup assignation rayon pour items inconnus
═══════════════════════════════════════════ */

// ─── NAVIGATION ──────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) { screen.classList.add('active'); screen.scrollTop = 0; }
  if (id === 'screen-magasin') setTimeout(renderListOverlay, 80);
}

// ─── DB WRAPPER ──────────────────────────
const DB = {
  get: (key, fallback = null) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

// ─── RAYONS (liste complète) ──────────────
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
  { id: 'oeufs-haut',     label: '🥚 Œufs' },
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
  { id: 'traiteur-ls',    label: '🍱 Traiteur Libre Service' },
  { id: 'fraiche-decoupe',label: '🔪 Fraîche Découpe' },
];

function getRayonLabel(id) {
  return RAYONS.find(r => r.id === id)?.label ?? id;
}

// ═══════════════════════════════════════════
// SOS
// ═══════════════════════════════════════════
const SOS_DURATION = 2000;
let sosStart = null, sosAnimFrame = null;
const sosBigBtn       = document.getElementById('sosBigBtn');
const sosProgressFill = document.getElementById('sosProgressFill');
const sosActivated    = document.getElementById('sos-activated');
const circumference   = 2 * Math.PI * 54;

function startSOS() { sosStart = Date.now(); animateSOS(); }
function animateSOS() {
  const progress = Math.min((Date.now() - sosStart) / SOS_DURATION, 1);
  sosProgressFill.style.strokeDashoffset = circumference * (1 - progress);
  if (progress < 1) { sosAnimFrame = requestAnimationFrame(animateSOS); }
  else { triggerSOS(); }
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
sosBigBtn.addEventListener('mousedown',  startSOS);
sosBigBtn.addEventListener('touchstart', e => { e.preventDefault(); startSOS(); }, { passive: false });
sosBigBtn.addEventListener('mouseup',    stopSOS);
sosBigBtn.addEventListener('mouseleave', stopSOS);
sosBigBtn.addEventListener('touchend',   stopSOS);

// ═══════════════════════════════════════════
// PARKING
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// PARKING — SVG interactif
// ═══════════════════════════════════════════
let selectedSpot = null;

// Métadonnées des places (type pour les infos et alertes)
const SPOT_TYPES = {};
document.querySelectorAll('.pspot').forEach(el => {
  const id = el.dataset.spot;
  if (el.classList.contains('pspot-pmr'))   SPOT_TYPES[id] = 'pmr';
  else if (el.classList.contains('pspot-dark'))  SPOT_TYPES[id] = 'dark';
  else if (el.classList.contains('pspot-cart'))  SPOT_TYPES[id] = 'cart';
  else SPOT_TYPES[id] = 'lit';
});

// Appelé par onclick sur chaque place SVG
function selectSpot(id) {
  const kind = SPOT_TYPES[id] || 'lit';

  // Places chariots : non sélectionnables
  if (kind === 'cart') {
    showCartAlert();
    return;
  }

  selectedSpot = id;

  // Retirer la sélection visuelle précédente
  document.querySelectorAll('.pspot.selected').forEach(s => s.classList.remove('selected'));
  const el = document.querySelector(`[data-spot="${id}"]`);
  if (el) el.classList.add('selected');

  // Déplacer le cercle de surbrillance
  const highlight = document.getElementById('parkingHighlight');
  if (highlight && el) {
    const rect = el.querySelector('rect');
    if (rect) {
      const x = parseFloat(rect.getAttribute('x')) + parseFloat(rect.getAttribute('width'))/2;
      const y = parseFloat(rect.getAttribute('y')) + parseFloat(rect.getAttribute('height'))/2;
      highlight.setAttribute('cx', x);
      highlight.setAttribute('cy', y);
      highlight.setAttribute('opacity', '1');
    }
  }

  // Infos place
  const infoEl = document.getElementById('parkingSelectedInfo');
  const labelEl = document.getElementById('parkingSelectedLabel');
  const typeEl  = document.getElementById('parkingSelectedType');
  if (infoEl) {
    infoEl.style.display = 'flex';
    labelEl.textContent = `Place ${id}`;
    const typeLabels = { lit: '☀️ Bien éclairée', dark: '🌑 Zone sombre', pmr: '♿ Accès PMR' };
    typeEl.textContent = typeLabels[kind] || '';
    infoEl.className = `parking-selected-info kind-${kind}`;
  }

  // Alerte zone sombre
  document.getElementById('parkingAlert').style.display = kind === 'dark' ? 'block' : 'none';
}

// Notification place chariots non disponible
function showCartAlert() {
  const existing = document.getElementById('cartBlockModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'cartBlockModal';
  modal.className = 'parking-modal-overlay';
  modal.innerHTML = `
    <div class="parking-modal-box">
      <div class="parking-modal-icon">🛒</div>
      <p class="parking-modal-title">Emplacement chariots</p>
      <p class="parking-modal-text">Cet emplacement est réservé au retour des chariots. Veuillez choisir une autre place.</p>
      <button class="parking-modal-btn" onclick="document.getElementById('cartBlockModal').remove()">Compris</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// Déplacer le marqueur 🚗 sur une place SVG
function placeCarMarker(spotId) {
  const marker = document.getElementById('myCarMarker');
  if (!marker) return;
  const el = document.querySelector(`[data-spot="${spotId}"]`);
  if (!el) return;
  const rect = el.querySelector('rect');
  if (!rect) return;
  const x = parseFloat(rect.getAttribute('x')) + parseFloat(rect.getAttribute('width'))/2;
  const y = parseFloat(rect.getAttribute('y')) + parseFloat(rect.getAttribute('height'))/2 + 5;
  marker.setAttribute('x', x);
  marker.setAttribute('y', y);
}

// Réinitialiser le style d'une place (retire my-car)
function resetSpotStyle(spotId) {
  if (!spotId) return;
  const el = document.querySelector(`[data-spot="${spotId}"]`);
  if (!el) return;
  el.classList.remove('my-car');
}

function saveSpot() {
  if (!selectedSpot) {
    const infoEl = document.getElementById('parkingSelectedInfo');
    if (infoEl) infoEl.style.display = 'none';
    showNoSpotAlert();
    return;
  }
  const kind = SPOT_TYPES[selectedSpot] || 'lit';
  // Place PMR : demander confirmation
  if (kind === 'pmr') {
    showPMRConfirm(selectedSpot);
    return;
  }
  doSaveSpot(selectedSpot);
}

function showNoSpotAlert() {
  const existing = document.getElementById('noSpotModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'noSpotModal';
  modal.className = 'parking-modal-overlay';
  modal.innerHTML = `
    <div class="parking-modal-box">
      <div class="parking-modal-icon">🗺️</div>
      <p class="parking-modal-title">Aucune place sélectionnée</p>
      <p class="parking-modal-text">Appuyez sur une place de parking sur la carte pour la sélectionner.</p>
      <button class="parking-modal-btn" onclick="document.getElementById('noSpotModal').remove()">OK</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function showPMRConfirm(spotId) {
  const existing = document.getElementById('pmrConfirmModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'pmrConfirmModal';
  modal.className = 'parking-modal-overlay';
  modal.innerHTML = `
    <div class="parking-modal-box">
      <div class="parking-modal-icon">♿</div>
      <p class="parking-modal-title">Place réservée PMR</p>
      <p class="parking-modal-text">Cette place est réservée aux personnes à mobilité réduite.<br><br>Êtes-vous titulaire d'une carte de stationnement pour personnes handicapées ?</p>
      <div class="parking-modal-actions">
        <button class="parking-modal-btn-secondary" onclick="document.getElementById('pmrConfirmModal').remove()">Non, choisir une autre place</button>
        <button class="parking-modal-btn" onclick="document.getElementById('pmrConfirmModal').remove(); doSaveSpot('${spotId}')">Oui, enregistrer</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function doSaveSpot(spotId) {
  // Retirer la voiture de l'ancienne place
  const previousSpot = DB.get('topshop_parking_spot');
  if (previousSpot && previousSpot !== spotId) {
    resetSpotStyle(previousSpot);
  }
  DB.set('topshop_parking_spot', spotId);
  document.getElementById('savedSpotLabel').textContent = spotId;
  document.getElementById('savedSpotInfo').style.display = 'flex';
  const el = document.querySelector(`[data-spot="${spotId}"]`);
  if (el) el.classList.add('my-car');
  placeCarMarker(spotId);
  navigator.vibrate && navigator.vibrate(100);
}

function clearSpot() {
  const saved = DB.get('topshop_parking_spot');
  resetSpotStyle(saved);
  // Cacher le marqueur voiture
  const marker = document.getElementById('myCarMarker');
  if (marker) { marker.setAttribute('x', '-100'); marker.setAttribute('y', '-100'); }
  DB.set('topshop_parking_spot', null);
  document.getElementById('savedSpotInfo').style.display = 'none';
  document.getElementById('parkingAlert').style.display = 'none';
  document.getElementById('parkingSelectedInfo').style.display = 'none';
  document.querySelectorAll('.pspot.selected').forEach(s => s.classList.remove('selected'));
  const highlight = document.getElementById('parkingHighlight');
  if (highlight) { highlight.setAttribute('cx', '-100'); highlight.setAttribute('opacity', '0'); }
  selectedSpot = null;
}

(function loadSavedSpot() {
  const saved = DB.get('topshop_parking_spot');
  if (!saved) return;
  selectedSpot = saved;
  document.getElementById('savedSpotLabel').textContent = saved;
  document.getElementById('savedSpotInfo').style.display = 'flex';
  const el = document.querySelector(`[data-spot="${saved}"]`);
  if (el) el.classList.add('my-car');
  // Placer le marqueur (après un court délai pour que le SVG soit rendu)
  setTimeout(() => placeCarMarker(saved), 100);
})();

// ═══════════════════════════════════════════
// CARTE — ZOOM / PAN
// ═══════════════════════════════════════════
(function initMapZoom() {
  const viewport = document.getElementById('mapViewport');
  const inner    = document.getElementById('mapInner');
  if (!viewport || !inner) return;
  let scale = 1, tx = 0, ty = 0, lastDist = 0;
  let dragging = false, dragStartX = 0, dragStartY = 0, dragTx = 0, dragTy = 0;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  function applyTransform() {
    tx = clamp(tx, viewport.clientWidth  * (1 - scale), 0);
    ty = clamp(ty, viewport.clientHeight * (1 - scale), 0);
    inner.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
  }
  function dist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  function mid(a, b)  { return { x: (a.clientX+b.clientX)/2, y: (a.clientY+b.clientY)/2 }; }
  viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 2) { e.preventDefault(); lastDist = dist(e.touches[0], e.touches[1]); }
    else { dragging = true; dragStartX = e.touches[0].clientX; dragStartY = e.touches[0].clientY; dragTx = tx; dragTy = ty; }
  }, { passive: false });
  viewport.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const nd = dist(e.touches[0], e.touches[1]);
      const m  = mid(e.touches[0], e.touches[1]);
      const rect = viewport.getBoundingClientRect();
      const mx = m.x - rect.left, my = m.y - rect.top;
      const ns = clamp(scale * nd / lastDist, 1, 5);
      tx = mx - (mx - tx) * ns / scale; ty = my - (my - ty) * ns / scale;
      scale = ns; lastDist = nd; applyTransform();
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
    const ns = clamp(scale * (e.deltaY > 0 ? 0.85 : 1.18), 1, 5);
    tx = mx - (mx - tx) * ns / scale; ty = my - (my - ty) * ns / scale;
    scale = ns; applyTransform();
  }, { passive: false });
})();

// ═══════════════════════════════════════════
// DICTIONNAIRE PRODUITS → RAYON + COORDS SVG
// ═══════════════════════════════════════════
const produits = {
  'pomme':     { rayon: 'fruits',         label: 'Fruits',                emoji: '🍎', cx: 395, cy: 331 },
  'pommes':    { rayon: 'fruits',         label: 'Fruits',                emoji: '🍎', cx: 395, cy: 331 },
  'banane':    { rayon: 'fruits',         label: 'Fruits',                emoji: '🍌', cx: 395, cy: 331 },
  'bananes':   { rayon: 'fruits',         label: 'Fruits',                emoji: '🍌', cx: 395, cy: 331 },
  'citron':    { rayon: 'fruits',         label: 'Fruits',                emoji: '🍋', cx: 395, cy: 331 },
  'raisin':    { rayon: 'fruits',         label: 'Fruits',                emoji: '🍇', cx: 395, cy: 331 },
  'fraise':    { rayon: 'fruits',         label: 'Fruits',                emoji: '🍓', cx: 395, cy: 331 },
  'fraises':   { rayon: 'fruits',         label: 'Fruits',                emoji: '🍓', cx: 395, cy: 331 },
  'orange':    { rayon: 'fruits',         label: 'Fruits',                emoji: '🍊', cx: 395, cy: 331 },
  'tomate':    { rayon: 'legumes',        label: 'Légumes',               emoji: '🍅', cx: 395, cy: 255 },
  'tomates':   { rayon: 'legumes',        label: 'Légumes',               emoji: '🍅', cx: 395, cy: 255 },
  'carotte':   { rayon: 'legumes',        label: 'Légumes',               emoji: '🥕', cx: 395, cy: 255 },
  'carottes':  { rayon: 'legumes',        label: 'Légumes',               emoji: '🥕', cx: 395, cy: 255 },
  'salade':    { rayon: 'legumes',        label: 'Légumes',               emoji: '🥗', cx: 395, cy: 255 },
  'oignon':    { rayon: 'legumes',        label: 'Légumes',               emoji: '🧅', cx: 395, cy: 255 },
  'oignons':   { rayon: 'legumes',        label: 'Légumes',               emoji: '🧅', cx: 395, cy: 255 },
  'ail':       { rayon: 'legumes',        label: 'Légumes',               emoji: '🧄', cx: 395, cy: 255 },
  'poireau':   { rayon: 'legumes',        label: 'Légumes',               emoji: '🥬', cx: 395, cy: 255 },
  'courgette': { rayon: 'legumes',        label: 'Légumes',               emoji: '🥒', cx: 395, cy: 255 },
  'pain':      { rayon: 'boulangerie',    label: 'Boulangerie',           emoji: '🥖', cx: 569, cy: 621 },
  'baguette':  { rayon: 'boulangerie',    label: 'Boulangerie',           emoji: '🥖', cx: 569, cy: 621 },
  'brioche':   { rayon: 'viennoiserie',   label: 'Brioche · Gâteaux',     emoji: '🍞', cx: 569, cy: 565 },
  'croissant': { rayon: 'viennoiserie',   label: 'Brioche · Gâteaux',     emoji: '🥐', cx: 569, cy: 565 },
  'pain de mie':{ rayon: 'pain-mie',     label: 'Pain de Mie',           emoji: '🍞', cx: 569, cy: 591 },
  'gateau':    { rayon: 'gateaux',        label: 'Gâteaux',               emoji: '🎂', cx: 53,  cy: 173 },
  'gâteau':    { rayon: 'gateaux',        label: 'Gâteaux',               emoji: '🎂', cx: 53,  cy: 173 },
  'biscuit':   { rayon: 'gateaux',        label: 'Gâteaux',               emoji: '🍪', cx: 53,  cy: 173 },
  'cookie':    { rayon: 'gateaux',        label: 'Gâteaux',               emoji: '🍪', cx: 53,  cy: 173 },
  'bonbon':    { rayon: 'confiserie',     label: 'Confiserie · Chocolat', emoji: '🍬', cx: 53,  cy: 199 },
  'chocolat':  { rayon: 'confiserie',     label: 'Confiserie · Chocolat', emoji: '🍫', cx: 53,  cy: 199 },
  'nutella':   { rayon: 'confiserie',     label: 'Confiserie · Chocolat', emoji: '🍫', cx: 53,  cy: 199 },
  'sucre':     { rayon: 'epicerie-seche', label: 'Sucre · Farine',        emoji: '🍬', cx: 53,  cy: 144 },
  'confiture': { rayon: 'compotes',       label: 'Compotes · Confitures', emoji: '🍓', cx: 53,  cy: 225 },
  'miel':      { rayon: 'compotes',       label: 'Compotes · Confitures', emoji: '🍯', cx: 53,  cy: 225 },
  'compote':   { rayon: 'compotes',       label: 'Compotes · Confitures', emoji: '🍎', cx: 53,  cy: 225 },
  'cereales':  { rayon: 'cereales',       label: 'Céréales',              emoji: '🌾', cx: 53,  cy: 251 },
  'céréales':  { rayon: 'cereales',       label: 'Céréales',              emoji: '🌾', cx: 53,  cy: 251 },
  'muesli':    { rayon: 'cereales',       label: 'Céréales',              emoji: '🥣', cx: 53,  cy: 251 },
  'café':      { rayon: 'cafe',           label: 'Café · Thé',            emoji: '☕', cx: 53,  cy: 277 },
  'cafe':      { rayon: 'cafe',           label: 'Café · Thé',            emoji: '☕', cx: 53,  cy: 277 },
  'thé':       { rayon: 'cafe',           label: 'Café · Thé',            emoji: '🍵', cx: 53,  cy: 277 },
  'pates':     { rayon: 'pates',          label: 'Pâtes',                 emoji: '🍝', cx: 53,  cy: 447 },
  'pâtes':     { rayon: 'pates',          label: 'Pâtes',                 emoji: '🍝', cx: 53,  cy: 447 },
  'spaghetti': { rayon: 'pates',          label: 'Pâtes',                 emoji: '🍝', cx: 53,  cy: 447 },
  'riz':       { rayon: 'riz-farine',     label: 'Riz · Farine',          emoji: '🍚', cx: 53,  cy: 329 },
  'farine':    { rayon: 'riz-farine',     label: 'Riz · Farine',          emoji: '🌾', cx: 53,  cy: 329 },
  'sel':       { rayon: 'conserves',      label: 'Conserves · Épices',    emoji: '🧂', cx: 53,  cy: 362 },
  'poivre':    { rayon: 'conserves',      label: 'Conserves · Épices',    emoji: '🧂', cx: 53,  cy: 362 },
  'conserve':  { rayon: 'conserves',      label: 'Conserves',             emoji: '🥫', cx: 53,  cy: 362 },
  'sauce':     { rayon: 'conserves',      label: 'Conserves',             emoji: '🍅', cx: 53,  cy: 362 },
  'huile':     { rayon: 'monde',          label: 'Produits du Monde',     emoji: '🫙', cx: 53,  cy: 395 },
  'chips':     { rayon: 'apero',          label: 'Chips · Apéro',         emoji: '🥔', cx: 53,  cy: 421 },
  'apéro':     { rayon: 'apero',          label: 'Chips · Apéro',         emoji: '🍿', cx: 53,  cy: 421 },
  'eau':       { rayon: 'boissons',       label: 'Eaux · Sodas · Jus',    emoji: '💧', cx: 53,  cy: 499 },
  'jus':       { rayon: 'boissons',       label: 'Eaux · Sodas · Jus',    emoji: '🧃', cx: 53,  cy: 499 },
  'coca':      { rayon: 'boissons',       label: 'Eaux · Sodas · Jus',    emoji: '🥤', cx: 53,  cy: 499 },
  'soda':      { rayon: 'boissons',       label: 'Eaux · Sodas · Jus',    emoji: '🥤', cx: 53,  cy: 499 },
  'vin':       { rayon: 'vins',           label: 'Vins · Champagne',      emoji: '🍷', cx: 569, cy: 91  },
  'bière':     { rayon: 'alcools',        label: 'Alcools · Bières',      emoji: '🍺', cx: 53,  cy: 473 },
  'biere':     { rayon: 'alcools',        label: 'Alcools · Bières',      emoji: '🍺', cx: 53,  cy: 473 },
  'champagne': { rayon: 'vins',           label: 'Vins · Champagne',      emoji: '🍾', cx: 569, cy: 91  },
  'poulet':    { rayon: 'boucherie',      label: 'Boucherie',             emoji: '🍗', cx: 375, cy: 23  },
  'steak':     { rayon: 'boucherie',      label: 'Boucherie',             emoji: '🥩', cx: 375, cy: 23  },
  'boeuf':     { rayon: 'boucherie',      label: 'Boucherie',             emoji: '🥩', cx: 375, cy: 23  },
  'bœuf':      { rayon: 'boucherie',      label: 'Boucherie',             emoji: '🥩', cx: 375, cy: 23  },
  'agneau':    { rayon: 'boucherie',      label: 'Boucherie',             emoji: '🥩', cx: 375, cy: 23  },
  'viande':    { rayon: 'boucherie',      label: 'Boucherie',             emoji: '🥩', cx: 375, cy: 23  },
  'jambon':    { rayon: 'charcuterie',    label: 'Charcuterie',           emoji: '🥩', cx: 196, cy: 242 },
  'saucisson': { rayon: 'charcuterie',    label: 'Charcuterie',           emoji: '🥩', cx: 196, cy: 242 },
  'lardons':   { rayon: 'charcuterie',    label: 'Charcuterie',           emoji: '🥩', cx: 196, cy: 242 },
  'bacon':     { rayon: 'charcuterie',    label: 'Charcuterie',           emoji: '🥓', cx: 196, cy: 242 },
  'dinde':     { rayon: 'volailles',      label: 'Volailles',             emoji: '🍗', cx: 162, cy: 242 },
  'fromage':   { rayon: 'fromage',        label: 'Fromage libre service', emoji: '🧀', cx: 230, cy: 242 },
  'camembert': { rayon: 'fromage',        label: 'Fromage libre service', emoji: '🧀', cx: 230, cy: 242 },
  'parmesan':  { rayon: 'fromage',        label: 'Fromage libre service', emoji: '🧀', cx: 230, cy: 242 },
  'traiteur':  { rayon: 'traiteur',       label: 'Fromagerie · Traiteur', emoji: '🍽', cx: 301, cy: 245 },
  'lait':      { rayon: 'lait-oeufs',     label: 'Lait',                  emoji: '🥛', cx: 53,  cy: 94  },
  'beurre':    { rayon: 'cremerie',       label: 'Crémerie',              emoji: '🧈', cx: 264, cy: 242 },
  'crème':     { rayon: 'cremerie',       label: 'Crémerie',              emoji: '🥛', cx: 264, cy: 242 },
  'creme':     { rayon: 'cremerie',       label: 'Crémerie',              emoji: '🥛', cx: 264, cy: 242 },
  'oeuf':      { rayon: 'oeufs-haut',     label: 'Œufs',                  emoji: '🥚', cx: 276, cy: 94  },
  'oeufs':     { rayon: 'oeufs-haut',     label: 'Œufs',                  emoji: '🥚', cx: 276, cy: 94  },
  'œufs':      { rayon: 'oeufs-haut',     label: 'Œufs',                  emoji: '🥚', cx: 276, cy: 94  },
  'yaourt':    { rayon: 'yaourts',        label: 'Yaourts',               emoji: '🥛', cx: 196, cy: 540 },
  'yaourts':   { rayon: 'yaourts',        label: 'Yaourts',               emoji: '🥛', cx: 196, cy: 540 },
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
  'bio':       { rayon: 'bio',            label: 'Bio Vrac',              emoji: '🌿', cx: 360, cy: 188 },
};

function searchProduct(query) {
  const q = query.trim().toLowerCase();
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
    dot.setAttribute('cx', found.cx); dot.setAttribute('cy', found.cy);
    dot.setAttribute('opacity', '1');
    foundDiv.style.display = 'flex';
    document.getElementById('searchResultIcon').textContent  = found.emoji;
    document.getElementById('searchResultLabel').textContent = found.label;
    document.getElementById('searchResultSub').textContent   = `"${query}" se trouve dans ce rayon`;
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

// ═══════════════════════════════════════════
// LISTE DE COURSES
// ═══════════════════════════════════════════
function loadItems()      { return DB.get('topshop_liste', []); }
function saveItems(arr)   { DB.set('topshop_liste', arr); }
function loadRecipes()    { return DB.get('topshop_custom_recipes', []); }
function saveRecipes(arr) { DB.set('topshop_custom_recipes', arr); }

function addItem() {
  const input = document.getElementById('newItem');
  const sel   = document.getElementById('newItemRayon');
  const name  = input.value.trim();
  if (!name) return;
  // Si le rayon n'est pas choisi manuellement, on tente la résolution auto
  const rayonAuto = sel && sel.value ? sel.value : (resolveRayon(name)?.rayon || '');
  const items = loadItems();
  items.push({ id: Date.now(), name, rayon: rayonAuto, checked: false });
  saveItems(items);
  input.value = '';
  if (sel) sel.value = '';
  input.focus();
  renderListe();
  // Mettre à jour l'overlay si on est sur la carte
  if (document.getElementById('screen-magasin').classList.contains('active')) renderListOverlay();
}

function toggleItem(id) {
  saveItems(loadItems().map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  renderListe();
  if (document.getElementById('screen-magasin').classList.contains('active')) renderListOverlay();
}

function deleteItem(id) {
  saveItems(loadItems().filter(i => i.id !== id));
  renderListe();
  if (document.getElementById('screen-magasin').classList.contains('active')) renderListOverlay();
}

function clearChecked() {
  saveItems(loadItems().filter(i => !i.checked));
  renderListe();
  renderListOverlay();
}

function clearAll() {
  if (loadItems().length === 0) return;
  saveItems([]);
  renderListe();
  renderListOverlay();
}

// ─── Recettes prédéfinies ──────────────────
const PRESET_RECIPES = {
  carbonara: { items: [
    { name: 'Pâtes',          rayon: 'pates' },
    { name: 'Lardons',        rayon: 'charcuterie' },
    { name: 'Œufs',           rayon: 'oeufs-haut' },
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
    { name: 'Œufs',        rayon: 'oeufs-haut' },
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

// ─── Recettes personnalisées ───────────────
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

// ─── Rendu de la liste (groupée par rayon) ─
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
    updateMapButton(false);
    return;
  }

  empty.style.display   = 'none';
  actions.style.display = 'flex';
  const total   = items.length;
  const checked = items.filter(i => i.checked).length;
  stats.innerHTML = `
    <span>${checked} / ${total} produit${total > 1 ? 's' : ''} coché${checked > 1 ? 's' : ''}</span>
    <div class="stats-bar"><div class="stats-fill" style="width:${Math.round(checked / total * 100)}%"></div></div>`;

  // Grouper par rayon (items avec rayon connu d'abord, puis inconnus)
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
        ${item.rayon ? `<span class="item-rayon">${getRayonLabel(item.rayon)}</span>` : '<span class="item-rayon inconnu">❓ Rayon inconnu</span>'}`;
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

  // Bouton carte
  const hasLocated = items.filter(i => !i.checked).some(i => i.rayon || resolveRayon(i.name));
  updateMapButton(items.filter(i => !i.checked).length > 0);
}

// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// CHEMIN OPTIMAL — GRAPHE + DIJKSTRA + TSP
// ═══════════════════════════════════════════

// Nœuds du réseau de couloirs (x, y sur le SVG viewBox 620×780)
const GRAPH_NODES = {
  // Couloir Haut (Y=50)
  'H_gauche':[100,50],'H_145':[145,50],'H_196':[196,50],'H_230':[230,50],
  'H_264':[264,50],'H_276':[276,50],'H_301':[301,50],'H_320':[320,50],
  'H_375':[375,50],'H_entree':[485,50],'H_droit':[520,50],
  // Couloir Gauche (X=100)
  'G_94':[100,94],'G_144':[100,144],'G_173':[100,173],'G_199':[100,199],
  'G_225':[100,225],'G_251':[100,251],'G_277':[100,277],'G_303':[100,303],
  'G_329':[100,329],'G_362':[100,362],'G_395':[100,395],'G_421':[100,421],
  'G_447':[100,447],'G_473':[100,473],'G_499':[100,499],'G_525':[100,525],
  'G_551':[100,551],'G_577':[100,577],'G_bas':[100,640],
  // Couloir Frais haut (Y=155)
  'F_145':[145,155],'F_196':[196,155],'F_230':[230,155],
  'F_264':[264,155],'F_301':[301,155],'F_320':[320,155],
  // Couloir Central (X=320)
  'C_188':[320,188],'C_255':[320,255],'C_331':[320,331],'C_455':[320,455],
  // Couloir Frais bas (Y=455)
  'FB_145':[145,455],'FB_196':[196,455],'FB_230':[230,455],
  'FB_262':[262,455],'FB_320':[320,455],
  // Couloir Bas (Y=640)
  'B_145':[145,640],'B_196':[196,640],'B_228':[228,640],
  'B_262':[262,640],'B_320':[320,640],'B_395':[395,640],'B_520':[520,640],
  // Couloir Droit (X=520)
  'D_91':[520,91],'D_176':[520,176],'D_221':[520,221],'D_263':[520,263],
  'D_331':[520,331],'D_357':[520,357],'D_383':[520,383],'D_435':[520,435],
  'D_487':[520,487],'D_513':[520,513],'D_565':[520,565],'D_591':[520,591],
  'D_621':[520,621],'D_bas':[520,640],
  // Points spéciaux
  'ENTREE':[485,730],'ENTREE_haut':[485,640],'CAISSES':[228,670],
};

// Arêtes du graphe (paires de nœuds connectés par un couloir)
const GRAPH_EDGES = [
  // Haut
  ['H_gauche','H_145'],['H_145','H_196'],['H_196','H_230'],['H_230','H_264'],
  ['H_264','H_276'],['H_276','H_301'],['H_301','H_320'],['H_320','H_375'],
  ['H_375','H_entree'],['H_entree','H_droit'],
  // Gauche
  ['H_gauche','G_94'],['G_94','G_144'],['G_144','G_173'],['G_173','G_199'],
  ['G_199','G_225'],['G_225','G_251'],['G_251','G_277'],['G_277','G_303'],
  ['G_303','G_329'],['G_329','G_362'],['G_362','G_395'],['G_395','G_421'],
  ['G_421','G_447'],['G_447','G_473'],['G_473','G_499'],['G_499','G_525'],
  ['G_525','G_551'],['G_551','G_577'],['G_577','G_bas'],
  // Descentes vers frais haut
  ['H_145','F_145'],['H_196','F_196'],['H_230','F_230'],
  ['H_264','F_264'],['H_301','F_301'],['H_320','F_320'],
  // Frais haut horizontal
  ['F_145','F_196'],['F_196','F_230'],['F_230','F_264'],['F_264','F_301'],['F_301','F_320'],
  // Central vertical
  ['H_320','C_188'],['F_320','C_188'],['C_188','C_255'],['C_255','C_331'],['C_331','C_455'],
  // Descentes vers frais bas
  ['F_145','FB_145'],['F_196','FB_196'],['F_230','FB_230'],['F_264','FB_262'],['F_320','FB_320'],
  // Frais bas horizontal
  ['FB_145','FB_196'],['FB_196','FB_230'],['FB_230','FB_262'],['FB_262','FB_320'],
  // Frais bas → bas
  ['FB_145','B_145'],['FB_196','B_196'],['FB_230','B_228'],['FB_262','B_262'],['FB_320','B_320'],
  // C_455 ↔ bas
  ['C_455','FB_320'],['C_455','B_320'],
  // Bas horizontal
  ['G_bas','B_145'],['B_145','B_196'],['B_196','B_228'],['B_228','B_262'],
  ['B_262','B_320'],['B_320','B_395'],['B_395','B_520'],
  // Droit vertical
  ['H_droit','D_91'],['D_91','D_176'],['D_176','D_221'],['D_221','D_263'],
  ['D_263','D_331'],['D_331','D_357'],['D_357','D_383'],['D_383','D_435'],
  ['D_435','D_487'],['D_487','D_513'],['D_513','D_565'],['D_565','D_591'],
  ['D_591','D_621'],['D_621','D_bas'],['D_bas','B_520'],
  // Entrée
  ['ENTREE','ENTREE_haut'],['ENTREE_haut','B_228'],['ENTREE_haut','B_520'],
  ['CAISSES','B_228'],
];

// Nœud d'accès de chaque rayon dans le graphe
const RAYON_ACCESS = {
  'lait-oeufs':'G_94','oeufs-haut':'H_276',
  'epicerie-seche':'G_144','gateaux':'G_173','confiserie':'G_199','compotes':'G_225',
  'cereales':'G_251','cafe':'G_277','nutrition':'G_303','riz-farine':'G_329',
  'conserves':'G_362','monde':'G_395','apero':'G_421','pates':'G_447',
  'alcools':'G_473','boissons':'G_499','menage':'G_525','lessive':'G_551','animaux':'G_577',
  'boucherie':'H_375','bio':'C_188','fraiche-decoupe':'C_188',
  'volailles':'F_145','charcuterie':'F_196','fromage':'F_230','cremerie':'F_264','traiteur':'F_301',
  'legumes':'C_255','fruits':'C_331',
  'traiteur-ls':'FB_145','yaourts':'FB_196','bio-frais':'FB_230','surgeles':'FB_262',
  'fruits-secs':'C_455','local':'C_455',
  'vins':'D_91','maison':'D_176','bricolage':'D_221','hygiene':'D_263',
  'jouets':'D_331','linge':'D_357','textile':'D_383','bebe':'D_435',
  'librairie':'D_487','papeterie':'D_513','viennoiserie':'D_565','pain-mie':'D_591','boulangerie':'D_621',
  'caisses':'CAISSES',
};

// Construction du graphe adjacent (une seule fois au chargement)
const _adj = {};
for (const [a, b] of GRAPH_EDGES) {
  const [ax,ay] = GRAPH_NODES[a], [bx,by] = GRAPH_NODES[b];
  const d = Math.round(Math.hypot(bx-ax, by-ay));
  (_adj[a] = _adj[a]||[]).push([b,d]);
  (_adj[b] = _adj[b]||[]).push([a,d]);
}

// Dijkstra depuis un nœud source — retourne {dist, prev}
function dijkstra(start) {
  const dist = {}, prev = {};
  for (const n of Object.keys(GRAPH_NODES)) { dist[n] = Infinity; prev[n] = null; }
  dist[start] = 0;
  // Min-heap simple (tableau trié)
  const pq = [[0, start]];
  while (pq.length) {
    pq.sort((a,b) => a[0]-b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    for (const [v, w] of (_adj[u]||[])) {
      const nd = d + w;
      if (nd < dist[v]) { dist[v] = nd; prev[v] = u; pq.push([nd, v]); }
    }
  }
  return { dist, prev };
}

// Récupère les coordonnées SVG du chemin entre deux nœuds
function pathCoords(prev, endNode) {
  const pts = [];
  let n = endNode;
  while (n) { pts.push(GRAPH_NODES[n]); n = prev[n]; }
  return pts.reverse();
}

// Cache des Dijkstra précalculés (clé = nœud source)
const _dijkstraCache = {};
function cachedDijkstra(node) {
  if (!_dijkstraCache[node]) _dijkstraCache[node] = dijkstra(node);
  return _dijkstraCache[node];
}

// Distance entre deux rayons (ou ENTREE / CAISSES)
function distBetween(r1, r2) {
  const n1 = r1 === '__start' ? 'ENTREE'  : (RAYON_ACCESS[r1] || r1);
  const n2 = r2 === '__end'   ? 'CAISSES' : (RAYON_ACCESS[r2] || r2);
  return cachedDijkstra(n1).dist[n2] ?? Infinity;
}

// TSP exact Held-Karp (n ≤ 12)
function tspExact(rayons) {
  const n = rayons.length;
  if (n === 0) return [];
  if (n === 1) return rayons;
  const INF = Infinity;
  const dStart = rayons.map(r => distBetween('__start', r));
  const dEnd   = rayons.map(r => distBetween(r, '__end'));
  const d = rayons.map((a,i) => rayons.map((b,j) => i===j ? 0 : distBetween(a,b)));
  const dp  = Array.from({length:1<<n}, ()=>new Array(n).fill(INF));
  const par = Array.from({length:1<<n}, ()=>new Array(n).fill(-1));
  for (let i=0; i<n; i++) dp[1<<i][i] = dStart[i];
  for (let mask=1; mask<(1<<n); mask++) {
    for (let last=0; last<n; last++) {
      if (!(mask>>last&1) || dp[mask][last]===INF) continue;
      for (let nxt=0; nxt<n; nxt++) {
        if (mask>>nxt&1) continue;
        const nm=mask|(1<<nxt), nd=dp[mask][last]+d[last][nxt];
        if (nd<dp[nm][nxt]) { dp[nm][nxt]=nd; par[nm][nxt]=last; }
      }
    }
  }
  const full=(1<<n)-1;
  let bestCost=INF, bestLast=-1;
  for (let i=0; i<n; i++) { const c=dp[full][i]+dEnd[i]; if(c<bestCost){bestCost=c;bestLast=i;} }
  const order=[]; let mask=full, cur=bestLast;
  while (cur!==-1) { order.push(rayons[cur]); const p=par[mask][cur]; mask^=(1<<cur); cur=p; }
  return order.reverse();
}

// 2-opt pour améliorer une route (n > 12)
function twoOpt(order) {
  let improved = true;
  while (improved) {
    improved = false;
    for (let i=0; i<order.length-1; i++) {
      for (let j=i+2; j<order.length; j++) {
        const a1 = i>0 ? order[i-1] : '__start', a2 = order[i];
        const b1 = order[j], b2 = j<order.length-1 ? order[j+1] : '__end';
        if (distBetween(a1,b1)+distBetween(a2,b2) < distBetween(a1,a2)+distBetween(b1,b2)-0.1) {
          order.splice(i, j-i+1, ...order.slice(i,j+1).reverse());
          improved = true;
        }
      }
    }
  }
  return order;
}

// Greedy nearest neighbor
function greedyRoute(rayons) {
  const rem = [...rayons]; const order = []; let cur = '__start';
  while (rem.length) {
    const best = rem.reduce((a,b) => distBetween(cur,a) < distBetween(cur,b) ? a : b);
    order.push(best); rem.splice(rem.indexOf(best),1); cur = best;
  }
  return order;
}

// Point d'entrée principal : calcule l'ordre optimal + les coordonnées SVG du chemin
function optimizeRoute(rayons) {
  if (rayons.length === 0) return { order: [], pathPoints: [] };

  // Dédupliquer les rayons (plusieurs items même rayon)
  const unique = [...new Set(rayons)];

  // Optimisation TSP
  const order = unique.length <= 12 ? tspExact(unique) : twoOpt(greedyRoute(unique));

  // Construire le chemin SVG point par point via Dijkstra
  const allPts = [];
  const addSeg = (fromNode, toNode) => {
    const { prev } = cachedDijkstra(fromNode);
    const pts = pathCoords(prev, toNode);
    if (allPts.length === 0) allPts.push(...pts);
    else allPts.push(...pts.slice(1)); // éviter doublon
  };

  const n0 = RAYON_ACCESS[order[0]];
  addSeg('ENTREE', n0);
  for (let i=0; i<order.length-1; i++) {
    addSeg(RAYON_ACCESS[order[i]], RAYON_ACCESS[order[i+1]]);
  }
  addSeg(RAYON_ACCESS[order[order.length-1]], 'CAISSES');

  // Dédupliquer les points consécutifs identiques
  const pathPoints = allPts.filter((p,i) =>
    i===0 || p[0]!==allPts[i-1][0] || p[1]!==allPts[i-1][1]
  );

  return { order, pathPoints };
}
// RÉSOLUTION RAYON
// Priorité : 1) rayon stocké sur l'item  2) dict produits  3) customRayons
// ═══════════════════════════════════════════
let customRayons = DB.get('topshop_custom_rayons', {});

function saveCustomRayons() { DB.set('topshop_custom_rayons', customRayons); }

// Résout le rayon d'un item (nom + rayon déjà stocké éventuel)
function resolveRayon(itemNameOrItem) {
  // Si on passe un objet item avec un rayon déjà défini → priorité absolue
  if (typeof itemNameOrItem === 'object' && itemNameOrItem.rayon) {
    const r = RAYONS.find(r => r.id === itemNameOrItem.rayon);
    const node = RAYON_ACCESS[itemNameOrItem.rayon];
    const coords = node ? GRAPH_NODES[node] : null;
    if (r && coords) return {
      rayon: itemNameOrItem.rayon,
      label: r.label.replace(/^\S+\s/, ''),
      emoji: r.label.match(/^\S+/)?.[0] || '📍',
      cx: coords[0], cy: coords[1]
    };
  }
  const name = typeof itemNameOrItem === 'object' ? itemNameOrItem.name : itemNameOrItem;
  const q = name.trim().toLowerCase();
  // Dict produits
  if (produits[q]) return produits[q];
  const deplu = q.replace(/s$/, '');
  if (produits[deplu]) return produits[deplu];
  for (const [key, val] of Object.entries(produits)) {
    if (q.includes(key) || key.includes(q)) return val;
  }
  // BDD utilisateur
  if (customRayons[q]) return customRayons[q];
  for (const [key, val] of Object.entries(customRayons)) {
    if (q.includes(key) || key.includes(q)) return val;
  }
  return null;
}

// ─── Popup assignation rayon (articles inconnus) ───
const RAYONS_LISTE = RAYONS.filter(r => RAYON_ACCESS[r.id]).map(r => ({
  id: r.id,
  label: r.label.replace(/^\S+\s/, ''),
  emoji: r.label.match(/^\S+/)?.[0] || '📍',
  cx: GRAPH_NODES[RAYON_ACCESS[r.id]][0],
  cy: GRAPH_NODES[RAYON_ACCESS[r.id]][1],
}));

function ouvrirPopupRayon(itemName) {
  const existant = document.getElementById('popupRayon');
  if (existant) existant.remove();
  const overlay = document.createElement('div');
  overlay.id = 'popupRayon';
  overlay.className = 'popup-overlay';
  overlay.innerHTML = `
    <div class="popup-box">
      <div class="popup-header">
        <span>📍 Dans quel rayon ?</span>
        <button class="popup-close" id="popupCloseBtn">×</button>
      </div>
      <p class="popup-subtitle">Où trouver <strong>${itemName}</strong> ?</p>
      <div class="popup-rayons">
        ${RAYONS_LISTE.map(r => `<button class="popup-rayon-btn" data-id="${r.id}">${r.emoji} ${r.label}</button>`).join('')}
      </div>
      <button class="popup-skip" id="popupSkipBtn">Passer — je le trouverai seul</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#popupCloseBtn').onclick = fermerPopupRayon;
  overlay.querySelector('#popupSkipBtn').onclick  = fermerPopupRayon;
  overlay.addEventListener('click', e => { if (e.target === overlay) fermerPopupRayon(); });
  overlay.querySelectorAll('.popup-rayon-btn').forEach(btn => {
    btn.onclick = () => assignerRayon(itemName, btn.dataset.id);
  });
}

function fermerPopupRayon() {
  const p = document.getElementById('popupRayon');
  if (p) p.remove();
}

function assignerRayon(itemName, rayonId) {
  const info = RAYONS_LISTE.find(r => r.id === rayonId);
  if (!info) return;
  // Mettre à jour customRayons
  customRayons[itemName.toLowerCase()] = {
    rayon: info.id, label: info.label, emoji: info.emoji, cx: info.cx, cy: info.cy
  };
  saveCustomRayons();
  // Mettre à jour l'item dans la liste s'il existe
  const items = loadItems().map(i =>
    i.name.toLowerCase() === itemName.toLowerCase() && !i.rayon
      ? { ...i, rayon: rayonId }
      : i
  );
  saveItems(items);
  fermerPopupRayon();
  renderListe();
  if (document.getElementById('screen-magasin').classList.contains('active')) renderListOverlay();
}

// ═══════════════════════════════════════════
// OVERLAY LISTE SUR LA CARTE
// ═══════════════════════════════════════════
function renderListOverlay() {
  const svg = document.getElementById('storeSVG');
  if (!svg) return;
  const old = document.getElementById('listOverlayGroup');
  if (old) old.remove();

  const inconnus = [];
  const rayonMap = {};

  loadItems().filter(i => !i.checked).forEach(item => {
    // resolveRayon avec l'objet complet → priorité au rayon stocké
    const info = resolveRayon(item);
    if (!info) { inconnus.push(item); return; }
    if (!rayonMap[info.rayon]) rayonMap[info.rayon] = { label: info.label, emoji: info.emoji, items: [] };
    rayonMap[info.rayon].items.push(item.name);
  });

  const rayonIds = Object.keys(rayonMap);
  updateMapButton(loadItems().filter(i => !i.checked).length > 0);
  if (rayonIds.length === 0 && inconnus.length === 0) { hideParcours(); return; }

  // Calcul de la route optimale via Dijkstra + TSP
  const { order: orderedByPath, pathPoints } = optimizeRoute(rayonIds);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.id = 'listOverlayGroup';

  // Chemin en pointillés (coordonnées calculées sur le vrai graphe)
  if (pathPoints.length > 1) {
    const pstr = pathPoints.map(p => `${p[0]},${p[1]}`).join(' ');
    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    shadow.setAttribute('points', pstr); shadow.setAttribute('fill', 'none');
    shadow.setAttribute('stroke', 'rgba(0,0,0,0.15)'); shadow.setAttribute('stroke-width', '5');
    shadow.setAttribute('stroke-linecap', 'round'); shadow.setAttribute('stroke-linejoin', 'round');
    g.appendChild(shadow);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.setAttribute('points', pstr); line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#5533FF'); line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-dasharray', '8,5'); line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round'); line.setAttribute('opacity', '0.85');
    g.appendChild(line);
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const dx = pathPoints[i+1][0] - pathPoints[i][0], dy = pathPoints[i+1][1] - pathPoints[i][1];
      if (Math.hypot(dx, dy) < 20) continue;
      const mx = (pathPoints[i][0] + pathPoints[i+1][0]) / 2, my = (pathPoints[i][1] + pathPoints[i+1][1]) / 2;
      const arr = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      arr.setAttribute('points', '-5,-3.5 5,0 -5,3.5'); arr.setAttribute('fill', '#5533FF');
      arr.setAttribute('opacity', '0.9');
      arr.setAttribute('transform', `translate(${mx},${my}) rotate(${Math.atan2(dy,dx)*180/Math.PI})`);
      g.appendChild(arr);
    }
  }

  // Marqueur ENTRÉE
  const ent = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ent.setAttribute('cx', '485'); ent.setAttribute('cy', '730'); ent.setAttribute('r', '8');
  ent.setAttribute('fill', '#00C853'); ent.setAttribute('stroke', 'white'); ent.setAttribute('stroke-width', '2');
  g.appendChild(ent);

  // Cercles numérotés dans l'ordre du chemin réel
  orderedByPath.forEach((rayonId, idx) => {
    const node = RAYON_ACCESS[rayonId];
    if (!node) return;
    const coords = GRAPH_NODES[node];
    if (!coords) return;
    const [cx, cy] = coords;
    const info = rayonMap[rayonId];
    const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    halo.setAttribute('cx', cx); halo.setAttribute('cy', cy);
    halo.setAttribute('r', '15'); halo.setAttribute('fill', 'white'); halo.setAttribute('opacity', '0.85');
    g.appendChild(halo);
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx); circle.setAttribute('cy', cy);
    circle.setAttribute('r', '11'); circle.setAttribute('fill', '#5533FF');
    circle.setAttribute('stroke', 'white'); circle.setAttribute('stroke-width', '2');
    g.appendChild(circle);
    const num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    num.setAttribute('x', cx); num.setAttribute('y', cy + 4);
    num.setAttribute('text-anchor', 'middle'); num.setAttribute('font-size', '9');
    num.setAttribute('font-weight', '700'); num.setAttribute('fill', 'white');
    num.setAttribute('pointer-events', 'none');
    num.textContent = idx + 1;
    g.appendChild(num);
    const bx = cx + 8, by = cy - 13;
    const bc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bc.setAttribute('cx', bx); bc.setAttribute('cy', by); bc.setAttribute('r', '7');
    bc.setAttribute('fill', '#E53935'); bc.setAttribute('stroke', 'white'); bc.setAttribute('stroke-width', '1.5');
    g.appendChild(bc);
    const bt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    bt.setAttribute('x', bx); bt.setAttribute('y', by + 3); bt.setAttribute('text-anchor', 'middle');
    bt.setAttribute('font-size', '7'); bt.setAttribute('font-weight', '700'); bt.setAttribute('fill', 'white');
    bt.setAttribute('pointer-events', 'none'); bt.textContent = info.items.length;
    g.appendChild(bt);
  });

  svg.appendChild(g);
  showParcours(orderedByPath, rayonMap, inconnus);
}

function updateMapButton(show) {
  let btn = document.getElementById('btnVoirCarte');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'btnVoirCarte'; btn.className = 'btn-voir-carte';
    btn.textContent = '🗺 Voir ma liste sur la carte';
    btn.onclick = () => showScreen('screen-magasin');
    const listeScreen     = document.querySelector('.liste-screen');
    const recettesSection = document.querySelector('.recettes-section');
    if (listeScreen && recettesSection) listeScreen.insertBefore(btn, recettesSection);
  }
  btn.style.display = show ? 'block' : 'none';
}

function showParcours(ordered, rayonMap, inconnus) {
  let panel = document.getElementById('parcoursPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'parcoursPanel'; panel.className = 'parcours-panel';
    document.querySelector('.magasin-screen').appendChild(panel);
  }
  const total = Object.values(rayonMap).reduce((s, r) => s + r.items.length, 0);
  const stepsHtml = ordered.length > 0 ? `
    <div class="parcours-header">
      <span>🛒 ${ordered.length} rayon${ordered.length > 1 ? 's' : ''} · ${total} article${total > 1 ? 's' : ''}</span>
      <button class="parcours-close" onclick="hideParcours()">×</button>
    </div>
    <div class="parcours-steps">
      ${ordered.map((r, i) => {
        const info = rayonMap[r];
        return `<div class="parcours-step" onclick="highlightRayonSVG('${r}')">
          <div class="parcours-num">${i + 1}</div>
          <div class="parcours-info">
            <strong>${info.emoji} ${info.label}</strong>
            <span>${info.items.join(', ')}</span>
          </div>
        </div>`;
      }).join('')}
    </div>` : `
    <div class="parcours-header">
      <span>🛒 Liste de courses</span>
      <button class="parcours-close" onclick="hideParcours()">×</button>
    </div>`;

  const inconnusHtml = inconnus.length > 0 ? `
    <div class="inconnus-bloc">
      <div class="inconnus-titre">❓ Rayon non localisé (${inconnus.length})</div>
      ${inconnus.map(item => `
        <div class="inconnu-item">
          <span class="inconnu-nom">${item.name}</span>
          <button class="inconnu-btn" onclick="ouvrirPopupRayon('${item.name.replace(/'/g, "\\'")}')">Indiquer le rayon</button>
        </div>`).join('')}
    </div>` : '';

  panel.innerHTML = stepsHtml + inconnusHtml;
  panel.style.display = 'block';
}

function hideParcours() {
  const p = document.getElementById('parcoursPanel');
  if (p) p.style.display = 'none';
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
