/* ttmini – frontend logic */

/* --- AI food search --- */
const foodSearch = document.getElementById('foodSearch');
const searchSuggestion = document.getElementById('searchSuggestion');
let searchTimer = null;
let currentNutrition = null;

if (foodSearch) {
  foodSearch.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = foodSearch.value.trim();
    if (!q) {
      hideSuggestion();
      currentNutrition = null;
      return;
    }
    searchTimer = setTimeout(() => aiSearch(q), 300);
  });

  foodSearch.addEventListener('blur', () => {
    setTimeout(hideSuggestion, 200);
  });
}

async function aiSearch(q) {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) { hideSuggestion(); currentNutrition = null; return; }
    const data = await res.json();
    currentNutrition = data;
    searchSuggestion.innerHTML = `
      <span class="match-name">${data.name}</span>
      <span class="match-details">
        ${data.calories} kcal · ${data.protein}g protein · ${data.carbs}g carbs · ${data.fat}g fat
        <em style="margin-left:4px">per 100 g</em>
      </span>`;
    searchSuggestion.classList.remove('hidden');
  } catch {
    hideSuggestion();
    currentNutrition = null;
  }
}

function hideSuggestion() {
  if (searchSuggestion) searchSuggestion.classList.add('hidden');
}

/* --- Add entry --- */
const addBtn = document.getElementById('addBtn');
const formMsg = document.getElementById('formMsg');

if (addBtn) {
  addBtn.addEventListener('click', addEntry);
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement !== addBtn) addEntry();
  });
}

async function addEntry() {
  const foodName = (foodSearch.value || '').trim();
  const quantity = parseFloat(document.getElementById('quantity').value) || 100;
  const mealType = document.getElementById('mealType').value;

  if (!foodName) { showMsg('Please enter a food name.', 'error'); return; }

  try {
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food_name: foodName, quantity_grams: quantity, meal_type: mealType }),
    });
    const data = await res.json();
    if (!res.ok) { showMsg(data.error || 'Error adding entry.', 'error'); return; }

    appendRow(data);
    updateSummary(data, 1);
    foodSearch.value = '';
    document.getElementById('quantity').value = '100';
    hideSuggestion();
    currentNutrition = null;
    removeEmptyRow();
    showMsg(`Added: ${data.food_name} (${data.calories} kcal)`, 'success');
  } catch {
    showMsg('Network error. Please try again.', 'error');
  }
}

/* --- Delete entry --- */
async function deleteEntry(id) {
  try {
    const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;

    // Subtract from totals
    const cells = row.querySelectorAll('td');
    const entry = {
      calories: parseFloat(cells[3].textContent) || 0,
      protein_g: parseFloat(cells[4].textContent) || 0,
      carbs_g: parseFloat(cells[5].textContent) || 0,
      fat_g: parseFloat(cells[6].textContent) || 0,
    };
    updateSummary(entry, -1);
    row.remove();

    const tbody = document.getElementById('foodTableBody');
    if (tbody && tbody.querySelectorAll('tr').length === 0) {
      tbody.innerHTML = '<tr id="emptyRow"><td colspan="8" class="empty-msg">No entries yet. Add your first meal!</td></tr>';
    }
  } catch { /* ignore */ }
}

/* --- Helpers --- */
function appendRow(e) {
  const tbody = document.getElementById('foodTableBody');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.dataset.id = e.id;
  tr.innerHTML = `
    <td>${esc(e.food_name)}</td>
    <td>${esc(e.meal_type)}</td>
    <td>${e.quantity_grams}</td>
    <td>${e.calories}</td>
    <td>${e.protein_g}g</td>
    <td>${e.carbs_g}g</td>
    <td>${e.fat_g}g</td>
    <td><button class="btn-delete" onclick="deleteEntry(${e.id})">✕</button></td>`;
  tbody.appendChild(tr);
}

function updateSummary(e, sign) {
  const ids = ['sumCalories', 'sumProtein', 'sumCarbs', 'sumFat'];
  const fields = ['calories', 'protein_g', 'carbs_g', 'fat_g'];
  const suffix = ['', 'g', 'g', 'g'];
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.querySelector('.macro-value');
    const cur = parseFloat(val.textContent) || 0;
    val.textContent = round1(cur + sign * (e[fields[i]] || 0)) + suffix[i];
  });
}

function removeEmptyRow() {
  const r = document.getElementById('emptyRow');
  if (r) r.remove();
}

function showMsg(text, type) {
  if (!formMsg) return;
  formMsg.textContent = text;
  formMsg.className = `form-msg ${type}`;
  clearTimeout(formMsg._timer);
  formMsg._timer = setTimeout(() => { formMsg.className = 'form-msg hidden'; }, 3500);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function round1(n) { return Math.round(n * 10) / 10; }
