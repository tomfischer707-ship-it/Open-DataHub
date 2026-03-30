// ===== Global Data =====
let allDatasets = [];
let currentDataset = null;

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadData();
});

// ===== Load Data =====
function loadData() {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      allDatasets = data.datasets;
      displayDatasets(allDatasets);
      populateMunicipalityStats(data.municipalities);
      populateMunicipalitySelects(data.municipalities);
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
  document.getElementById('municipality-compare-1')?.addEventListener('change', compareMunicipalities);
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

  if (!resultsContainer || !infoContainer) return;

  // Info text
  infoContainer.textContent = `${datasets.length} Datensatz(e) gefunden`;

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
  const exploreSearch = document.getElementById('exploreSearch');
  if (exploreSearch) exploreSearch.value = '';
  displayDatasets(allDatasets);
}

// ===== Type & Level Label Maps =====
const TYPE_LABELS = {
  'geospatial': 'Geodaten',
  'timeseries': 'Zeitreihe',
  'statistics': 'Statistik',
  'heatmap': 'Heatmap',
  'structure': 'Struktur'
};

const LEVEL_LABELS = {
  'kreis': 'Kreisebene',
  'gemeinde': 'Gemeindeebene'
};

// ===== Dataset Detail Page =====
function populateDatasetDetail(dataset) {
  // Header
  document.getElementById('detail-title').textContent = dataset.title;

  const sourceEl = document.getElementById('detail-source');
  sourceEl.textContent = dataset.source;
  const srcColor = getSourceColor(dataset.source);
  sourceEl.style.background = `${srcColor}20`;
  sourceEl.style.color = srcColor;

  const typeEl = document.getElementById('detail-type');
  typeEl.textContent = TYPE_LABELS[dataset.type] || dataset.type;

  document.getElementById('detail-description').textContent = dataset.description;

  // Tags
  const tagsEl = document.getElementById('detail-tags');
  if (dataset.tags && dataset.tags.length > 0) {
    tagsEl.innerHTML = dataset.tags.map(tag => `<span class="detail-tag">${tag}</span>`).join('');
  } else {
    tagsEl.innerHTML = '';
  }

  // Metadata
  document.getElementById('detail-metadata-source').textContent = dataset.source;
  document.getElementById('detail-metadata-period').textContent = dataset.period || '–';
  document.getElementById('detail-metadata-updated').textContent = dataset.updated;
  document.getElementById('detail-metadata-frequency').textContent = dataset.frequency;
  document.getElementById('detail-metadata-license').textContent = dataset.license;
  document.getElementById('detail-metadata-contact').textContent = dataset.contact;

  // Info box
  document.getElementById('detail-info-type').textContent = TYPE_LABELS[dataset.type] || dataset.type;
  document.getElementById('detail-info-level').textContent = dataset.level.map(l => LEVEL_LABELS[l] || l).join(', ');
  document.getElementById('detail-info-format').textContent = dataset.download.join(', ');
  document.getElementById('detail-info-period').textContent = dataset.period || '–';

  // Data preview table
  const previewSection = document.getElementById('detail-preview-section');
  if (dataset.previewRows && dataset.previewRows.length > 0) {
    previewSection.style.display = '';
    const keys = Object.keys(dataset.previewRows[0]);
    document.getElementById('detail-preview-thead').innerHTML =
      `<tr>${keys.map(k => `<th>${k}</th>`).join('')}</tr>`;
    document.getElementById('detail-preview-tbody').innerHTML =
      dataset.previewRows.map(row =>
        `<tr>${keys.map(k => `<td>${row[k] ?? '–'}</td>`).join('')}</tr>`
      ).join('');
  } else {
    previewSection.style.display = 'none';
  }

  // Downloads
  const downloadContainer = document.getElementById('detail-downloads');
  downloadContainer.innerHTML = dataset.download.map(format =>
    `<button class="btn-secondary" onclick="alert('Download als ${format}')"><i class="fas fa-download"></i> ${format}</button>`
  ).join('');

  // API & Grafana links
  const apiSection = document.getElementById('detail-api-section');
  const apiLinksEl = document.getElementById('detail-api-links');
  const apiBox = document.getElementById('detail-api-box');
  const apiCode = document.getElementById('detail-api-code');

  const links = [];
  if (dataset.apiEndpoint) {
    links.push(`<a href="${dataset.apiEndpoint}" target="_blank" rel="noopener" class="api-link">
      <i class="fas fa-code"></i> REST-API
      <span class="api-link-url">${dataset.apiEndpoint}</span>
    </a>`);
    apiCode.textContent = dataset.apiEndpoint;
    apiBox.style.display = '';
  } else {
    apiBox.style.display = 'none';
  }
  if (dataset.grafanaLink) {
    links.push(`<a href="${dataset.grafanaLink}" target="_blank" rel="noopener" class="api-link api-link--grafana">
      <i class="fas fa-chart-line"></i> Grafana-Dashboard
      <span class="api-link-url">${dataset.grafanaLink}</span>
    </a>`);
  }

  if (links.length > 0) {
    apiSection.style.display = '';
    apiLinksEl.innerHTML = links.join('');
  } else {
    apiSection.style.display = 'none';
  }

  // Related datasets
  const relatedContainer = document.getElementById('related-datasets');
  const related = allDatasets
    .filter(d => d.id !== dataset.id && d.theme === dataset.theme)
    .slice(0, 3);

  if (related.length > 0) {
    relatedContainer.innerHTML = related.map(d => `
      <div class="dataset-card" onclick="navigateToDataset('${d.id}')">
        <div class="dataset-badge">${TYPE_LABELS[d.type] || d.type}</div>
        <h4>${d.title}</h4>
        <p>${d.description}</p>
        <div class="dataset-meta">
          <span class="source-badge" style="background:${getSourceColor(d.source)}20;color:${getSourceColor(d.source)}">${d.source}</span>
        </div>
      </div>
    `).join('');
  } else {
    relatedContainer.innerHTML = '<p style="color:var(--gray-500)">Keine verwandten Datensätze vorhanden.</p>';
  }
}

function copyApiEndpoint() {
  const code = document.getElementById('detail-api-code').textContent;
  if (code) {
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.querySelector('#detail-api-box .btn-secondary');
      btn.innerHTML = '<i class="fas fa-check"></i> Kopiert!';
      setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Kopieren'; }, 2000);
    });
  }
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

function populateMunicipalitySelects(municipalities) {
  const selects = [
    document.getElementById('municipality-select'),
    document.getElementById('municipality-compare-1'),
    document.getElementById('municipality-compare-2')
  ];

  selects.forEach(select => {
    if (!select) return;
    municipalities.forEach(m => {
      const option = document.createElement('option');
      option.value = m.name;
      option.textContent = m.name;
      select.appendChild(option);
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
