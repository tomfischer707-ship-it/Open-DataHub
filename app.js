// ===== Global State =====
let allDatasets = [];
let allMunicipalities = [];
let dataLoaded = false;
let populationChart = null;
let breitbandMap = null;

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
      // Close sidebar on mobile after clicking
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });

  // Sidebar toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', toggleSidebar);

  // Menu toggle (mobile)
  document.getElementById('menu-toggle')?.addEventListener('click', openSidebar);

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

// ===== Sidebar Toggle =====
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
  document.body.classList.toggle('sidebar-closed');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.add('collapsed');
  document.body.classList.add('sidebar-closed');
}

function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('collapsed');
  document.body.classList.remove('sidebar-closed');
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

  // Calculate and display KPIs
  calculateKPIs();
}

// ===== Calculate KPIs =====
function calculateKPIs() {
  // Total population
  const totalPop = allMunicipalities.reduce((sum, m) => sum + m.population, 0);
  const popElement = document.getElementById('total-population');
  if (popElement) {
    popElement.textContent = (totalPop / 1000).toFixed(0) + 'k';
  }

  // Average fiber coverage
  const avgFiber = allMunicipalities.reduce((sum, m) => sum + m.fiberCoverage, 0) / allMunicipalities.length;
  const fiberElement = document.getElementById('avg-fiber');
  if (fiberElement) {
    fiberElement.textContent = avgFiber.toFixed(0) + '%';
  }

  // Largest municipality
  const largest = allMunicipalities.reduce((max, m) => m.population > max.population ? m : max);
  const largestElement = document.getElementById('largest-municipality');
  if (largestElement) {
    largestElement.textContent = largest.name.split(' ')[0];
  }
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
  setTimeout(() => renderBreitbandMap(), 100);
}

function renderDemographyPage() {
  const datasets = allDatasets.filter(d => d.theme === 'Demografie');
  renderThemePage('demografie', datasets);
  setTimeout(() => renderPopulationChart(), 100);
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

// ===== BREITBAND MAP =====
function renderBreitbandMap() {
  const mapEl = document.getElementById('breitband-map');
  if (!mapEl || !window.L) return;

  // Destroy existing map
  if (breitbandMap) {
    breitbandMap.remove();
  }

  // Center: Landkreis Gießen (approximately)
  const center = [50.65, 8.65];

  // Create map
  breitbandMap = L.map('breitband-map').setView(center, 10);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(breitbandMap);

  // Add markers for each municipality
  allMunicipalities.forEach(m => {
    if (!m.coordinates) {
      // Generate approximate coordinates for demo
      const lat = 50.5 + Math.random() * 0.4;
      const lon = 8.5 + Math.random() * 0.6;
      m.coordinates = [lat, lon];
    }

    const coverage = m.fiberCoverage;
    const color = getCoverageColor(coverage);

    // Add circle marker
    const marker = L.circleMarker([m.coordinates[0], m.coordinates[1]], {
      radius: Math.max(10, coverage / 4),
      fillColor: color,
      color: color,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.7
    }).addTo(breitbandMap);

    // Add popup
    marker.bindPopup(`
      <div style="font-weight: 600; margin-bottom: 0.5rem;">${m.name}</div>
      <div>FTTH-Abdeckung: <strong>${coverage}%</strong></div>
      <div style="color: var(--gray-600); font-size: 0.9rem;">Einwohner: ${m.population.toLocaleString('de-DE')}</div>
    `);
  });

  // Add legend
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'map-legend');
    div.style.background = 'white';
    div.style.padding = '12px';
    div.style.borderRadius = '6px';
    div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    div.style.fontSize = '0.85rem';
    div.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 0.5rem;">FTTH-Abdeckung</div>
      <div style="margin-bottom: 0.25rem;"><span style="display:inline-block;width:12px;height:12px;background:#10b981;border-radius:50%;margin-right:5px;"></span>75-100%</div>
      <div style="margin-bottom: 0.25rem;"><span style="display:inline-block;width:12px;height:12px;background:#eab308;border-radius:50%;margin-right:5px;"></span>50-75%</div>
      <div style="margin-bottom: 0.25rem;"><span style="display:inline-block;width:12px;height:12px;background:#f97316;border-radius:50%;margin-right:5px;"></span>25-50%</div>
      <div><span style="display:inline-block;width:12px;height:12px;background:#ef4444;border-radius:50%;margin-right:5px;"></span>&lt;25%</div>
    `;
    return div;
  };
  legend.addTo(breitbandMap);
}

function getCoverageColor(coverage) {
  if (coverage >= 75) return '#10b981';
  if (coverage >= 50) return '#eab308';
  if (coverage >= 25) return '#f97316';
  return '#ef4444';
}

// ===== Dataset Detail Page =====
function populateDatasetDetail(dataset) {
  document.getElementById('detail-title').textContent = dataset.title;
  document.getElementById('detail-source').textContent = dataset.source;
  document.getElementById('detail-type').textContent = dataset.type;
  document.getElementById('detail-description').textContent = dataset.description;

  document.getElementById('detail-source-text').textContent = dataset.source;
  document.getElementById('detail-type-text').textContent = dataset.type;
  document.getElementById('detail-level-text').textContent = dataset.level.join(', ');
  document.getElementById('detail-updated-text').textContent = dataset.updated;
  document.getElementById('detail-frequency-text').textContent = dataset.frequency;
  document.getElementById('detail-license-text').textContent = dataset.license;

  // Downloads
  const downloadContainer = document.getElementById('detail-downloads');
  downloadContainer.innerHTML = dataset.download.map(format =>
    `<a href="#" class="download-btn"><i class="fas fa-download"></i> ${format} herunterladen</a>`
  ).join('');
}

function navigateToDataset(datasetId) {
  // Find dataset
  const dataset = allDatasets.find(d => d.id === datasetId);
  if (!dataset) return;

  currentDataset = dataset;
  populateDatasetDetail(dataset);
  navigateToPage('dataset');
}

// ===== POPULATION CHART =====
function renderPopulationChart() {
  const ctx = document.getElementById('population-chart');
  if (!ctx || !window.Chart) return;

  // Destroy existing chart
  if (populationChart) {
    populationChart.destroy();
  }

  // Sort municipalities by population
  const sorted = [...allMunicipalities].sort((a, b) => b.population - a.population);

  // Create chart
  populationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(m => m.name),
      datasets: [{
        label: 'Bevölkerung',
        data: sorted.map(m => m.population),
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { size: 12, weight: '600' },
            color: '#374151',
            padding: 15
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#6b7280',
            font: { size: 11 },
            callback: function(value) {
              return value.toLocaleString('de-DE');
            }
          },
          grid: {
            color: 'rgba(219, 234, 254, 0.5)',
            drawBorder: false
          },
          title: {
            display: true,
            text: 'Einwohner'
          }
        },
        x: {
          ticks: {
            color: '#6b7280',
            font: { size: 10 }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        }
      }
    }
  });
}
