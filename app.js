// ===== Global State =====
let allDatasets = [];
let allMunicipalities = [];
let dataLoaded = false;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
});

// ===== Load Data =====
function loadData() {
  fetch('data.json?' + Date.now())
    .then(response => response.json())
    .then(data => {
      allDatasets = data.datasets;
      allMunicipalities = data.municipalities;
      dataLoaded = true;
      renderHomePage();
    })
    .catch(err => console.error('Error loading data:', err));
}

// ===== Setup Events =====
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToPage(link.dataset.page);
    });
  });

  // Event delegation for filters
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('theme-filter')) {
      applyFilters();
    }
  });

  // Search
  document.getElementById('globalSearch')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      navigateToPage('explore');
      setTimeout(() => {
        document.getElementById('exploreSearch').value = e.target.value;
        applyFilters();
      }, 100);
    }
  });

  document.getElementById('exploreSearch')?.addEventListener('keyup', applyFilters);
}

// ===== Navigation =====
function navigateToPage(pageName) {
  // Deactivate all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // Activate selected page
  const pageEl = document.getElementById(pageName + '-page');
  const linkEl = document.querySelector(`[data-page="${pageName}"]`);

  if (pageEl) {
    pageEl.classList.add('active');
    window.scrollTo(0, 0);

    // Render appropriate content
    if (pageName === 'home') renderHomePage();
    else if (pageName === 'explore') renderExplorePage();
    else if (pageName === 'breitband') renderBroadbandPage();
    else if (pageName === 'demografie') renderDemographyPage();
    else if (pageName === 'mobilität') renderMobilityPage();
  }

  if (linkEl) linkEl.classList.add('active');
}

// ===== HOME PAGE =====
function renderHomePage() {
  if (!dataLoaded) return;

  const featured = allDatasets.slice(0, 6);
  const container = document.getElementById('featured-datasets');

  container.innerHTML = featured.map(ds => createDatasetCard(ds)).join('');
}

// ===== EXPLORE PAGE =====
function renderExplorePage() {
  const container = document.getElementById('datasets-results');
  const infoEl = document.getElementById('results-info');

  infoEl.textContent = `${allDatasets.length} Datensätze gefunden`;
  container.innerHTML = allDatasets.map(ds => createDatasetCard(ds)).join('');
}

// ===== THEME PAGES =====
function renderBroadbandPage() {
  const datasets = allDatasets.filter(d => d.theme === 'Breitbandausbau');
  renderThemePage('breitband', datasets);
}

function renderDemographyPage() {
  const datasets = allDatasets.filter(d => d.theme === 'Demografie');
  renderThemePage('demografie', datasets);
}

function renderMobilityPage() {
  const datasets = allDatasets.filter(d => d.theme === 'Mobilität & Verkehr');
  renderThemePage('mobilität', datasets);
}

function renderThemePage(theme, datasets) {
  const container = document.getElementById(theme + '-datasets');
  const tbody = document.getElementById(theme + '-table');

  // Render datasets
  container.innerHTML = datasets.map(ds => createDatasetCard(ds)).join('');

  // Render municipality table
  tbody.innerHTML = allMunicipalities.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.population.toLocaleString('de-DE')}</td>
      <td>${theme === 'breitband' ? m.fiberCoverage + '%' : theme === 'mobilität' ? m.oepnvConnections : '—'}</td>
      <td>
        <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
          <div style="width: ${theme === 'breitband' ? m.fiberCoverage : theme === 'mobilität' ? (m.oepnvConnections / 35 * 100) : 50}%; height: 100%; background: var(--primary);"></div>
        </div>
      </td>
    </tr>
  `).join('');
}

// ===== DATASET CARD =====
function createDatasetCard(dataset) {
  return `
    <div class="dataset-card">
      <h3>${dataset.icon} ${dataset.title}</h3>
      <p>${dataset.description}</p>
      <div class="dataset-meta">
        <span class="dataset-badge">${dataset.type}</span>
        <span class="source-badge">${dataset.source}</span>
        <span class="update-date">${dataset.updated}</span>
      </div>
    </div>
  `;
}

// ===== FILTERS =====
function applyFilters() {
  const searchTerm = document.getElementById('exploreSearch')?.value.toLowerCase() || '';
  const checkedFilters = Array.from(document.querySelectorAll('.theme-filter:checked')).map(c => c.value);

  let filtered = allDatasets.filter(ds => {
    const matchesSearch = !searchTerm || ds.title.toLowerCase().includes(searchTerm) || ds.description.toLowerCase().includes(searchTerm);
    const matchesTheme = checkedFilters.length === 0 || checkedFilters.includes(ds.theme);
    return matchesSearch && matchesTheme;
  });

  const container = document.getElementById('datasets-results');
  const infoEl = document.getElementById('results-info');

  infoEl.textContent = `${filtered.length} Datensatz(e) gefunden`;
  container.innerHTML = filtered.map(ds => createDatasetCard(ds)).join('');
}
