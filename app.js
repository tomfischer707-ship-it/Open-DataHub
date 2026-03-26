// ===== Global Data =====
let allDatasets = [];
let currentDataset = null;
let allMunicipalities = [];
let populationChart = null;
let ageChart = null;

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  initializeMunicipalitySelects();
});

// ===== Load Data =====
function loadData() {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      allDatasets = data.datasets;
      allMunicipalities = data.municipalities;
      populateMunicipalityStats(data.municipalities);
      initializeBreitbandMap(data.municipalities);
      initializeDemographyCharts(data.municipalities);
    })
    .catch(err => console.error('Error loading data:', err));
}

// ===== Navigation =====
function navigateToPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Show selected page
  const pageElement = document.getElementById(pageName + '-page');
  if (pageElement) {
    pageElement.classList.add('active');
    window.scrollTo(0, 0);
  }
}

function navigateToDataset(datasetId) {
  // Find dataset
  const dataset = allDatasets.find(d => d.id === datasetId);
  if (!dataset) return;

  currentDataset = dataset;
  populateDatasetDetail(dataset);
  navigateToPage('dataset');
}

// ===== Setup Event Listeners =====
function setupEventListeners() {
  // Navigation links
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToPage(link.dataset.page);
    });
  });

  // Explore page filters
  document.querySelectorAll('.theme-filter').forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });

  document.querySelectorAll('.source-filter').forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });

  document.querySelectorAll('.level-filter').forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });

  document.querySelectorAll('.type-filter').forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });

  // Explore search
  document.getElementById('exploreSearch')?.addEventListener('keyup', applyFilters);
  document.getElementById('globalSearch')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      navigateToPage('explore');
      setTimeout(() => {
        document.getElementById('exploreSearch').value = e.target.value;
        applyFilters();
      }, 100);
    }
  });

  // Municipality comparisons
  document.getElementById('municipality-compare-1')?.addEventListener('change', compareeMunicipalities);
  document.getElementById('municipality-compare-2')?.addEventListener('change', compareMunicipalities);
}

// ===== Filter & Search =====
function applyFilters() {
  const searchTerm = document.getElementById('exploreSearch')?.value.toLowerCase() || '';

  const themeFilters = Array.from(document.querySelectorAll('.theme-filter:checked')).map(c => c.value);
  const sourceFilters = Array.from(document.querySelectorAll('.source-filter:checked')).map(c => c.value);
  const levelFilters = Array.from(document.querySelectorAll('.level-filter:checked')).map(c => c.value);
  const typeFilters = Array.from(document.querySelectorAll('.type-filter:checked')).map(c => c.value);

  let filtered = allDatasets.filter(dataset => {
    // Search term
    if (searchTerm && !dataset.title.toLowerCase().includes(searchTerm) && !dataset.description.toLowerCase().includes(searchTerm)) {
      return false;
    }

    // Theme filter
    if (themeFilters.length > 0 && !themeFilters.includes(dataset.theme)) {
      return false;
    }

    // Source filter
    if (sourceFilters.length > 0 && !sourceFilters.includes(dataset.source)) {
      return false;
    }

    // Level filter
    if (levelFilters.length > 0 && !dataset.level.some(l => levelFilters.includes(l))) {
      return false;
    }

    // Type filter
    if (typeFilters.length > 0 && !typeFilters.includes(dataset.type)) {
      return false;
    }

    return true;
  });

  // Display results
  displayDatasets(filtered);
}

function displayDatasets(datasets) {
  const resultsContainer = document.getElementById('datasets-results');
  const infoContainer = document.getElementById('results-info');

  if (!resultsContainer) return;

  // Info text
  infoContainer.textContent = `${datasets.length} Datensatz(e) gefunden`;
  infoContainer.setAttribute('role', 'status');
  infoContainer.setAttribute('aria-live', 'polite');

  // Clear results
  resultsContainer.innerHTML = '';

  // Display each dataset
  if (datasets.length === 0) {
    resultsContainer.innerHTML = '<div style="color: var(--gray-500); text-align: center; padding: 2rem;">Keine Datensätze gefunden. Versuchen Sie andere Filter.</div>';
    return;
  }

  datasets.forEach(dataset => {
    const card = document.createElement('div');
    card.className = 'dataset-card';
    card.onclick = () => navigateToDataset(dataset.id);

    card.innerHTML = `
      <div class="dataset-badge">${dataset.type === 'geospatial' ? 'Karte' : dataset.type === 'timeseries' ? 'Zeitreihe' : 'Datensatz'}</div>
      <h3>${dataset.title}</h3>
      <p>${dataset.description}</p>
      <div class="dataset-meta">
        <span class="source-badge breitband" style="background: ${getSourceColor(dataset.source)}20; color: ${getSourceColor(dataset.source)};">${dataset.source}</span>
        <span class="update-date">aktualisiert ${dataset.updated}</span>
      </div>
    `;

    resultsContainer.appendChild(card);
  });
}

function getSourceColor(source) {
  const colors = {
    'BürgerGIS': '#2563eb',
    'INGRADA': '#2563eb',
    'The Things Network': '#10b981',
    'Hessisches Statistisches Landesamt': '#10b981',
    'Census-Daten': '#10b981',
    'Ausländerbehörde': '#f97316'
  };
  return colors[source] || '#2563eb';
}

function resetFilters() {
  document.querySelectorAll('.theme-filter, .source-filter, .level-filter, .type-filter').forEach(cb => {
    cb.checked = false;
  });
  document.getElementById('exploreSearch').value = '';
  displayDatasets(allDatasets);
  // Announce to screen readers
  const resultsInfo = document.getElementById('results-info');
  if (resultsInfo) {
    resultsInfo.setAttribute('role', 'status');
    resultsInfo.setAttribute('aria-live', 'polite');
  }
}

// ===== Dataset Detail Page =====
function populateDatasetDetail(dataset) {
  document.getElementById('detail-title').textContent = dataset.title;
  document.getElementById('detail-source').textContent = dataset.source;
  document.getElementById('detail-type').textContent = dataset.type;
  document.getElementById('detail-description').textContent = dataset.description;
  document.getElementById('detail-metadata-source').textContent = dataset.source;
  document.getElementById('detail-metadata-updated').textContent = dataset.updated;
  document.getElementById('detail-metadata-frequency').textContent = dataset.frequency;
  document.getElementById('detail-metadata-license').textContent = dataset.license;
  document.getElementById('detail-metadata-contact').textContent = dataset.contact;

  // Info box
  document.getElementById('detail-info-type').textContent = dataset.type;
  document.getElementById('detail-info-level').textContent = dataset.level.join(', ');
  document.getElementById('detail-info-format').textContent = dataset.download.join(', ');

  // Downloads
  const downloadContainer = document.getElementById('detail-downloads');
  downloadContainer.innerHTML = dataset.download.map(format =>
    `<button class="btn-secondary" onclick="alert('Download als ${format}')"><i class="fas fa-download"></i> ${format}</button>`
  ).join('');

  // Related datasets
  const relatedContainer = document.getElementById('related-datasets');
  const related = allDatasets
    .filter(d => d.id !== dataset.id && d.theme === dataset.theme)
    .slice(0, 3);

  relatedContainer.innerHTML = related.map(d => `
    <div class="dataset-card" onclick="navigateToDataset('${d.id}')">
      <h4>${d.title}</h4>
      <p>${d.description}</p>
    </div>
  `).join('');
}

// ===== Municipality Stats =====
function populateMunicipalityStats(municipalities) {
  const tbody = document.getElementById('municipality-tbody');
  if (!tbody) return;

  tbody.innerHTML = municipalities.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.population.toLocaleString('de-DE')}</td>
      <td>${m.fiberCoverage}%</td>
      <td>
        <div style="background: linear-gradient(90deg, #2563eb ${m.fiberCoverage}%, rgba(37,99,235,0.2) ${m.fiberCoverage}%); width: 100%; height: 20px; border-radius: 4px;"></div>
      </td>
    </tr>
  `).join('');
}

function initializeMunicipalitySelects() {
  fetch('data.json')
    .then(r => r.json())
    .then(data => {
      const municipalities = data.municipalities;

      // Breitband page
      const breitbandSelect = document.getElementById('municipality-select');
      if (breitbandSelect) {
        municipalities.forEach(m => {
          const option = document.createElement('option');
          option.value = m.name;
          option.textContent = m.name;
          breitbandSelect.appendChild(option);
        });
      }

      // Demografie comparison
      [document.getElementById('municipality-compare-1'), document.getElementById('municipality-compare-2')].forEach(select => {
        if (select) {
          municipalities.forEach(m => {
            const option = document.createElement('option');
            option.value = m.name;
            option.textContent = m.name;
            select.appendChild(option);
          });
        }
      });
    });
}

function compareMunicipalities() {
  const select1 = document.getElementById('municipality-compare-1');
  const select2 = document.getElementById('municipality-compare-2');
  const resultDiv = document.getElementById('comparison-text');

  if (!select1 || !select2 || !resultDiv) return;

  const m1 = select1.value;
  const m2 = select2.value;

  if (m1 && m2) {
    resultDiv.innerHTML = `
      <strong>${m1}</strong> vs. <strong>${m2}</strong><br/>
      Detaillierter Vergleich der demografischen Daten folgt hier...
    `;
  } else {
    resultDiv.innerHTML = '';
  }
}

// ===== Leaflet.js Map (Breitband) =====
function initializeBreitbandMap(municipalities) {
  const mapElement = document.getElementById('breitband-map');
  if (!mapElement || !window.L) return;

  const center = [50.65, 8.65];
  const map = L.map('breitband-map').setView(center, 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  municipalities.forEach(m => {
    if (!m.coordinates) return;

    const coverage = m.fiberCoverage;
    const color = getCoverageColor(coverage);

    const circle = L.circleMarker([m.coordinates[0], m.coordinates[1]], {
      radius: Math.max(8, coverage / 5),
      fillColor: color,
      color: color,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.7
    }).addTo(map);

    circle.bindPopup(`
      <div style="font-size: 0.9rem;">
        <strong>${m.name}</strong><br/>
        FTTH-Abdeckung: <strong>${coverage}%</strong><br/>
        Bevölkerung: ${m.population.toLocaleString('de-DE')}<br/>
        <small>FTTH: ${m.broadbandByTech.ftth}% | Kabel: ${m.broadbandByTech.cable}% | DSL: ${m.broadbandByTech.dsl}%</small>
      </div>
    `);
  });

  // Legend
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-control-legend');
    div.style.background = 'rgba(13, 27, 46, 0.9)';
    div.style.padding = '10px';
    div.style.borderRadius = '4px';
    div.style.color = '#94a3b8';
    div.style.fontSize = '0.85rem';
    div.style.border = '1px solid rgba(59, 130, 246, 0.2)';
    div.innerHTML = `
      <div style="margin-bottom: 5px;"><strong>FTTH-Abdeckung</strong></div>
      <div style="margin-bottom: 3px;"><span style="display:inline-block;width:12px;height:12px;background:#10b981;border-radius:50%;margin-right:5px;"></span>75-100%</div>
      <div style="margin-bottom: 3px;"><span style="display:inline-block;width:12px;height:12px;background:#eab308;border-radius:50%;margin-right:5px;"></span>50-75%</div>
      <div style="margin-bottom: 3px;"><span style="display:inline-block;width:12px;height:12px;background:#f97316;border-radius:50%;margin-right:5px;"></span>25-50%</div>
      <div><span style="display:inline-block;width:12px;height:12px;background:#ef4444;border-radius:50%;margin-right:5px;"></span>&lt;25%</div>
    `;
    return div;
  };
  legend.addTo(map);
}

function getCoverageColor(coverage) {
  if (coverage >= 75) return '#10b981';
  if (coverage >= 50) return '#eab308';
  if (coverage >= 25) return '#f97316';
  return '#ef4444';
}

// ===== Chart.js Charts (Demografie) =====
function initializeDemographyCharts(municipalities) {
  if (!window.Chart) return;

  initializePopulationChart(municipalities);
  initializeAgeChart(municipalities);
}

function initializePopulationChart(municipalities) {
  const ctx = document.getElementById('population-chart');
  if (!ctx) return;

  const giessenData = municipalities.find(m => m.name === 'Gießen');
  if (!giessenData) return;

  const years = giessenData.populationHistory.map(h => h.year);
  const population = giessenData.populationHistory.map(h => h.pop);

  populationChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Gießen - Bevölkerung',
        data: population,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#2563eb',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: '#e2e8f0', font: { size: 12 } }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(59, 130, 246, 0.1)' },
          title: { display: true, text: 'Bevölkerung', color: '#e2e8f0' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(59, 130, 246, 0.1)' },
          title: { display: true, text: 'Jahr', color: '#e2e8f0' }
        }
      }
    }
  });
}

function initializeAgeChart(municipalities) {
  const ctx = document.getElementById('age-chart');
  if (!ctx) return;

  const giessenData = municipalities.find(m => m.name === 'Gießen');
  if (!giessenData) return;

  const ageGroups = giessenData.ageGroups;

  ageChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['0-18 Jahre', '18-29 Jahre', '30-49 Jahre', '50-64 Jahre', '65+ Jahre'],
      datasets: [{
        label: 'Altersverteilung (%) - Gießen',
        data: [
          ageGroups.under18,
          ageGroups.age18to29,
          ageGroups.age30to49,
          ageGroups.age50to64,
          ageGroups.over65
        ],
        backgroundColor: [
          'rgba(37, 99, 235, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(96, 165, 250, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(249, 115, 22, 0.6)'
        ],
        borderColor: [
          '#2563eb',
          '#3b82f6',
          '#60a5fa',
          '#10b981',
          '#f97316'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'x',
      plugins: {
        legend: {
          labels: { color: '#e2e8f0', font: { size: 12 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 30,
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(59, 130, 246, 0.1)' },
          title: { display: true, text: 'Prozentanteil (%)', color: '#e2e8f0' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(59, 130, 246, 0.1)' }
        }
      }
    }
  });
}
