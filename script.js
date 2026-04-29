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
// ÉCRAN MAGASIN — RECHERCHE PRODUITS
// ═══════════════════════════════════════════
const produits = {
  // Fruits & Légumes
  'pomme': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🍎' },
  'pommes': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🍎' },
  'banane': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🍌' },
  'bananes': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🍌' },
  'tomate': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🍅' },
  'tomates': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🍅' },
  'salade': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🥗' },
  'carotte': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🥕' },
  'carottes': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🥕' },
  'oignon': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🧅' },
  'oignons': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🧅' },
  'ail': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🧄' },
  'citron': { rayon: 'fruits', label: 'Fruits & Légumes', emoji: '🍋' },
  // Boulangerie
  'pain': { rayon: 'boulangerie', label: 'Boulangerie', emoji: '🥖' },
  'baguette': { rayon: 'boulangerie', label: 'Boulangerie', emoji: '🥖' },
  'croissant': { rayon: 'boulangerie', label: 'Boulangerie', emoji: '🥐' },
  'croissants': { rayon: 'boulangerie', label: 'Boulangerie', emoji: '🥐' },
  'brioche': { rayon: 'boulangerie', label: 'Boulangerie', emoji: '🍞' },
  'gateau': { rayon: 'boulangerie', label: 'Boulangerie', emoji: '🎂' },
  'gâteau': { rayon: 'boulangerie', label: 'Boulangerie', emoji: '🎂' },
  // Viande & Poisson
  'poulet': { rayon: 'viande', label: 'Viande & Poisson', emoji: '🍗' },
  'steak': { rayon: 'viande', label: 'Viande & Poisson', emoji: '🥩' },
  'boeuf': { rayon: 'viande', label: 'Viande & Poisson', emoji: '🥩' },
  'bœuf': { rayon: 'viande', label: 'Viande & Poisson', emoji: '🥩' },
  'saumon': { rayon: 'viande', label: 'Viande & Poisson', emoji: '🐟' },
  'thon': { rayon: 'viande', label: 'Viande & Poisson', emoji: '🐟' },
  'jambon': { rayon: 'viande', label: 'Viande & Poisson', emoji: '🥩' },
  // Produits Laitiers
  'lait': { rayon: 'laitier', label: 'Produits Laitiers', emoji: '🥛' },
  'fromage': { rayon: 'laitier', label: 'Produits Laitiers', emoji: '🧀' },
  'beurre': { rayon: 'laitier', label: 'Produits Laitiers', emoji: '🧈' },
  'yaourt': { rayon: 'laitier', label: 'Produits Laitiers', emoji: '🥛' },
  'yaourts': { rayon: 'laitier', label: 'Produits Laitiers', emoji: '🥛' },
  'crème': { rayon: 'laitier', label: 'Produits Laitiers', emoji: '🥛' },
  'oeuf': { rayon: 'laitier', label: 'Produits Laitiers', emoji: '🥚' },
  'oeufs': { rayon: 'laitier', label: 'Produits Laitiers', emoji: '🥚' },
  'œufs': { rayon: 'laitier', label: 'Produits Laitiers', emoji: '🥚' },
  // Épicerie
  'pates': { rayon: 'epicerie', label: 'Épicerie', emoji: '🍝' },
  'pâtes': { rayon: 'epicerie', label: 'Épicerie', emoji: '🍝' },
  'riz': { rayon: 'epicerie', label: 'Épicerie', emoji: '🍚' },
  'farine': { rayon: 'epicerie', label: 'Épicerie', emoji: '🌾' },
  'sucre': { rayon: 'epicerie', label: 'Épicerie', emoji: '🍬' },
  'sel': { rayon: 'epicerie', label: 'Épicerie', emoji: '🧂' },
  'huile': { rayon: 'epicerie', label: 'Épicerie', emoji: '🫙' },
  'conserve': { rayon: 'epicerie', label: 'Épicerie', emoji: '🥫' },
  'sauce': { rayon: 'epicerie', label: 'Épicerie', emoji: '🍅' },
  // Boissons
  'eau': { rayon: 'boissons', label: 'Boissons', emoji: '💧' },
  'jus': { rayon: 'boissons', label: 'Boissons', emoji: '🧃' },
  'coca': { rayon: 'boissons', label: 'Boissons', emoji: '🥤' },
  'soda': { rayon: 'boissons', label: 'Boissons', emoji: '🥤' },
  'vin': { rayon: 'boissons', label: 'Boissons', emoji: '🍷' },
  'bière': { rayon: 'boissons', label: 'Boissons', emoji: '🍺' },
  'biere': { rayon: 'boissons', label: 'Boissons', emoji: '🍺' },
  'café': { rayon: 'boissons', label: 'Boissons', emoji: '☕' },
  'cafe': { rayon: 'boissons', label: 'Boissons', emoji: '☕' },
  'thé': { rayon: 'boissons', label: 'Boissons', emoji: '🍵' },
  // Surgelés
  'glace': { rayon: 'surgelee', label: 'Surgelés', emoji: '🍦' },
  'pizza': { rayon: 'surgelee', label: 'Surgelés', emoji: '🍕' },
  'surgele': { rayon: 'surgelee', label: 'Surgelés', emoji: '🧊' },
  'surgelé': { rayon: 'surgelee', label: 'Surgelés', emoji: '🧊' },
  // Hygiène
  'shampoing': { rayon: 'hygiene', label: 'Hygiène & Beauté', emoji: '🧴' },
  'savon': { rayon: 'hygiene', label: 'Hygiène & Beauté', emoji: '🧼' },
  'dentifrice': { rayon: 'hygiene', label: 'Hygiène & Beauté', emoji: '🦷' },
  'brosse': { rayon: 'hygiene', label: 'Hygiène & Beauté', emoji: '🪥' },
  'deodorant': { rayon: 'hygiene', label: 'Hygiène & Beauté', emoji: '🧴' },
  'déodorant': { rayon: 'hygiene', label: 'Hygiène & Beauté', emoji: '🧴' },
  'papier toilette': { rayon: 'hygiene', label: 'Hygiène & Beauté', emoji: '🧻' },
};

function searchProduct(query) {
  const q = query.trim().toLowerCase();
  const resultDiv = document.getElementById('searchResult');
  const itineraireDiv = document.getElementById('itineraireActif');

  if (!q) {
    resultDiv.style.display = 'none';
    // Retirer le surlignage
    document.querySelectorAll('.rayon.highlighted').forEach(r => r.classList.remove('highlighted'));
    itineraireDiv.style.display = 'none';
    return;
  }

  // Chercher le produit
  let found = null;
  for (const [key, val] of Object.entries(produits)) {
    if (q.includes(key) || key.includes(q)) {
      found = val;
      break;
    }
  }

  // Retirer les anciens surlignages
  document.querySelectorAll('.rayon.highlighted').forEach(r => r.classList.remove('highlighted'));

  if (found) {
    resultDiv.style.display = 'block';
    resultDiv.textContent = `${found.emoji} "${query}" → ${found.label}`;

    const rayonEl = document.querySelector(`[data-rayon="${found.rayon}"]`);
    if (rayonEl) rayonEl.classList.add('highlighted');

    itineraireDiv.style.display = 'block';
    document.getElementById('itineraireText').textContent = `Dirigez-vous vers le rayon ${found.label}`;
  } else {
    resultDiv.style.display = 'block';
    resultDiv.style.background = '#FFF3E0';
    resultDiv.style.borderColor = '#FF9800';
    resultDiv.style.color = '#E65100';
    resultDiv.textContent = `Produit "${query}" non trouvé dans notre catalogue.`;
    itineraireDiv.style.display = 'none';
  }
}

function highlightRayon(rayon) {
  document.querySelectorAll('.rayon.highlighted').forEach(r => r.classList.remove('highlighted'));
  const el = document.querySelector(`[data-rayon="${rayon}"]`);
  if (el) el.classList.add('highlighted');
}

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
