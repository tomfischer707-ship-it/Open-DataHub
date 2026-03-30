// ===== Global Data =====
let allDatasets = [];
let currentDataset = null;

// ===== Embedded Data (kein Server / fetch nötig) =====
const APP_DATA = {
  "datasets": [
    {
      "id": "breitband-001",
      "title": "Breitbandverfügbarkeit Landkreis Gießen 2024",
      "description": "Aktuelle Verfügbarkeitskarten für Breitbandanschlüsse nach Technologie und Bandbreitenklasse auf Gemeindeebene. Enthält FTTH, Kabel, DSL und Mobilfunkdaten.",
      "theme": "Breitbandausbau",
      "source": "BürgerGIS",
      "type": "geospatial",
      "level": ["kreis", "gemeinde"],
      "updated": "2024-03-15",
      "period": "2020–2024",
      "frequency": "monatlich",
      "license": "CC-BY-4.0",
      "download": ["GeoJSON", "Shapefile", "CSV"],
      "tags": ["Breitband", "Infrastruktur", "Verfügbarkeit", "Karte"],
      "contact": "geodaten@landkreis-giessen.de",
      "previewRows": [
        {"Gemeinde": "Gießen", "FTTH_%": 95, "Kabel_%": 88, "DSL_%": 99, "LTE_%": 97, "Stand": "2024-01"},
        {"Gemeinde": "Buseck", "FTTH_%": 70, "Kabel_%": 52, "DSL_%": 95, "LTE_%": 91, "Stand": "2024-01"},
        {"Gemeinde": "Linden", "FTTH_%": 65, "Kabel_%": 48, "DSL_%": 92, "LTE_%": 89, "Stand": "2024-01"},
        {"Gemeinde": "Wettenberg", "FTTH_%": 72, "Kabel_%": 55, "DSL_%": 96, "LTE_%": 93, "Stand": "2024-01"},
        {"Gemeinde": "Hungen", "FTTH_%": 28, "Kabel_%": 10, "DSL_%": 78, "LTE_%": 72, "Stand": "2024-01"}
      ],
      "apiEndpoint": "https://api.open-datahub-giessen.de/v1/datasets/breitband-001",
      "grafanaLink": "https://grafana.landkreis-giessen.de/d/breitband"
    },
    {
      "id": "ftth-001",
      "title": "FTTH-Ausbaufortschritt 2020–2024",
      "description": "Zeitserie des Glasfaserausbaus (Fiber-to-the-Home) nach Gemeinde. Zeigt den Fortschritt der Erschließung geförderter und eigenwirtschaftlicher Ausbaugebiete.",
      "theme": "Breitbandausbau",
      "source": "INGRADA",
      "type": "timeseries",
      "level": ["kreis", "gemeinde"],
      "updated": "2024-02-28",
      "period": "2020–2024",
      "frequency": "quartalsweise",
      "license": "CC-BY-4.0",
      "download": ["CSV", "JSON"],
      "tags": ["FTTH", "Glasfaser", "Ausbau", "Trend"],
      "contact": "netzausbau@landkreis-giessen.de",
      "previewRows": [
        {"Jahr": 2020, "Quartal": "Q1", "Gemeinde": "Gießen", "FTTH_%": 62, "neu_erschlossen": 1240},
        {"Jahr": 2020, "Quartal": "Q3", "Gemeinde": "Gießen", "FTTH_%": 71, "neu_erschlossen": 1820},
        {"Jahr": 2022, "Quartal": "Q1", "Gemeinde": "Gießen", "FTTH_%": 82, "neu_erschlossen": 2200},
        {"Jahr": 2023, "Quartal": "Q2", "Gemeinde": "Gießen", "FTTH_%": 89, "neu_erschlossen": 1450},
        {"Jahr": 2024, "Quartal": "Q1", "Gemeinde": "Gießen", "FTTH_%": 95, "neu_erschlossen": 1230}
      ],
      "apiEndpoint": "https://api.open-datahub-giessen.de/v1/datasets/ftth-001",
      "grafanaLink": "https://grafana.landkreis-giessen.de/d/ftth-ausbau"
    },
    {
      "id": "mobilfunk-001",
      "title": "Mobilfunkabdeckung LTE/5G",
      "description": "Heatmap der aktuellen Mobilfunkabdeckung im Landkreis nach Betreiber und Technologie (LTE, 5G NR). Daten aus Messfahrten und Behördenmeldungen.",
      "theme": "Breitbandausbau",
      "source": "The Things Network",
      "type": "heatmap",
      "level": ["kreis"],
      "updated": "2024-03-20",
      "period": "2023–2024",
      "frequency": "täglich",
      "license": "ODbL",
      "download": ["GeoJSON", "CSV"],
      "tags": ["Mobilfunk", "LTE", "5G", "Abdeckung"],
      "contact": "ttn@landkreis-giessen.de",
      "previewRows": [
        {"Betreiber": "Telekom", "Technologie": "5G", "Abdeckung_%": 68, "Haushalte": 174080},
        {"Betreiber": "Vodafone", "Technologie": "LTE", "Abdeckung_%": 91, "Haushalte": 232960},
        {"Betreiber": "O2", "Technologie": "LTE", "Abdeckung_%": 85, "Haushalte": 217600},
        {"Betreiber": "1&1", "Technologie": "5G", "Abdeckung_%": 12, "Haushalte": 30720}
      ],
      "apiEndpoint": "https://api.open-datahub-giessen.de/v1/datasets/mobilfunk-001"
    },
    {
      "id": "bevoelkerung-001",
      "title": "Bevölkerungsentwicklung 1990–2024",
      "description": "Historische Bevölkerungsdaten und Prognosen für alle Gemeinden im Landkreis. Enthält Geburten, Sterbefälle, Zu- und Abwanderung sowie Saldowerte.",
      "theme": "Demografie",
      "source": "Hessisches Statistisches Landesamt",
      "type": "timeseries",
      "level": ["kreis", "gemeinde"],
      "updated": "2024-02-01",
      "period": "1990–2024",
      "frequency": "jährlich",
      "license": "CC-BY-4.0",
      "download": ["CSV", "JSON"],
      "tags": ["Bevölkerung", "Demografie", "Trend", "Statistik"],
      "contact": "statistik@landkreis-giessen.de",
      "previewRows": [
        {"Jahr": 2015, "Gemeinde": "Gießen", "Einwohner": 83240, "Geburten": 812, "Sterbefälle": 745, "Zuzug": 6820, "Fortzug": 6140},
        {"Jahr": 2018, "Gemeinde": "Gießen", "Einwohner": 85910, "Geburten": 848, "Sterbefälle": 762, "Zuzug": 7120, "Fortzug": 6480},
        {"Jahr": 2020, "Gemeinde": "Gießen", "Einwohner": 86430, "Geburten": 835, "Sterbefälle": 789, "Zuzug": 6940, "Fortzug": 6310},
        {"Jahr": 2022, "Gemeinde": "Gießen", "Einwohner": 87100, "Geburten": 821, "Sterbefälle": 801, "Zuzug": 7380, "Fortzug": 6650},
        {"Jahr": 2024, "Gemeinde": "Gießen", "Einwohner": 87400, "Geburten": 815, "Sterbefälle": 812, "Zuzug": 7500, "Fortzug": 6650}
      ],
      "apiEndpoint": "https://api.open-datahub-giessen.de/v1/datasets/bevoelkerung-001",
      "grafanaLink": "https://grafana.landkreis-giessen.de/d/bevoelkerung"
    },
    {
      "id": "altersstruktur-001",
      "title": "Altersstruktur nach Gemeinde",
      "description": "Altersgruppen-Verteilung und Durchschnittsalter für alle Gemeinden. Basis für Alterspyramiden und demografische Analysen.",
      "theme": "Demografie",
      "source": "Census-Daten",
      "type": "structure",
      "level": ["kreis", "gemeinde"],
      "updated": "2023-12-15",
      "period": "2015–2023",
      "frequency": "jährlich",
      "license": "CC0",
      "download": ["JSON", "CSV"],
      "tags": ["Altersstruktur", "Pyramide", "Demografie"],
      "contact": "demografie@landkreis-giessen.de",
      "previewRows": [
        {"Gemeinde": "Gießen", "0–17": 15.2, "18–29": 22.8, "30–49": 24.1, "50–64": 18.9, "65+": 19.0, "Ø_Alter": 42.1},
        {"Gemeinde": "Buseck", "0–17": 17.8, "18–29": 14.2, "30–49": 26.4, "50–64": 21.1, "65+": 20.5, "Ø_Alter": 45.2},
        {"Gemeinde": "Reiskirchen", "0–17": 16.1, "18–29": 13.5, "30–49": 25.2, "50–64": 22.4, "65+": 22.8, "Ø_Alter": 46.8},
        {"Gemeinde": "Allendorf", "0–17": 14.9, "18–29": 12.1, "30–49": 23.8, "50–64": 23.5, "65+": 25.7, "Ø_Alter": 48.3}
      ],
      "apiEndpoint": "https://api.open-datahub-giessen.de/v1/datasets/altersstruktur-001"
    },
    {
      "id": "zuwanderung-001",
      "title": "Zuwanderungs- und Migrationsdaten",
      "description": "Quoten und Trends der Zu- und Abwanderung nach Gemeinde. Enthält Herkunftsländer, Altersgruppen der Zugewanderten und Aufenthaltsstatus.",
      "theme": "Demografie",
      "source": "Ausländerbehörde",
      "type": "statistics",
      "level": ["kreis", "gemeinde"],
      "updated": "2024-01-31",
      "period": "2018–2024",
      "frequency": "monatlich",
      "license": "CC-BY-4.0",
      "download": ["CSV", "JSON"],
      "tags": ["Migration", "Zuwanderung", "Demografie", "Statistik"],
      "contact": "auslaender@landkreis-giessen.de",
      "previewRows": [
        {"Jahr": 2022, "Gemeinde": "Gießen", "Zuzug_gesamt": 7380, "davon_Ausland": 3920, "Fortzug_gesamt": 6650, "Saldo": 730},
        {"Jahr": 2022, "Gemeinde": "Buseck", "Zuzug_gesamt": 420, "davon_Ausland": 145, "Fortzug_gesamt": 380, "Saldo": 40},
        {"Jahr": 2023, "Gemeinde": "Gießen", "Zuzug_gesamt": 7500, "davon_Ausland": 4100, "Fortzug_gesamt": 6780, "Saldo": 720}
      ],
      "apiEndpoint": "https://api.open-datahub-giessen.de/v1/datasets/zuwanderung-001"
    }
  ],
  "municipalities": [
    {"id": "allendorf", "name": "Allendorf (Lumda)", "population": 2800, "fiberCoverage": 35},
    {"id": "amoeneburg", "name": "Amöneburg", "population": 3200, "fiberCoverage": 42},
    {"id": "anzhausen", "name": "Anzhausen", "population": 1900, "fiberCoverage": 25},
    {"id": "asslar", "name": "Aßlar", "population": 15400, "fiberCoverage": 60},
    {"id": "bad-endbach", "name": "Bad Endbach", "population": 7100, "fiberCoverage": 50},
    {"id": "breidenbach", "name": "Breidenbach", "population": 5200, "fiberCoverage": 45},
    {"id": "bischoffen", "name": "Bischoffen", "population": 8900, "fiberCoverage": 55},
    {"id": "buseck", "name": "Buseck", "population": 9800, "fiberCoverage": 70},
    {"id": "dannenroth", "name": "Dannenroth", "population": 2100, "fiberCoverage": 20},
    {"id": "dillenburg", "name": "Dillenburg", "population": 23500, "fiberCoverage": 85},
    {"id": "giessen", "name": "Gießen", "population": 87400, "fiberCoverage": 95},
    {"id": "gladenbach", "name": "Gladenbach", "population": 5600, "fiberCoverage": 40},
    {"id": "haigerseelbach", "name": "Haigerseelbach", "population": 2800, "fiberCoverage": 15},
    {"id": "haina", "name": "Haina (Kloster)", "population": 3900, "fiberCoverage": 30},
    {"id": "herborn", "name": "Herborn", "population": 20900, "fiberCoverage": 80},
    {"id": "hessisch-lichtenau", "name": "Hessisch Lichtenau", "population": 2200, "fiberCoverage": 10},
    {"id": "homberg", "name": "Homberg (Ohm)", "population": 4300, "fiberCoverage": 35},
    {"id": "hohenahr", "name": "Hohenahr", "population": 7800, "fiberCoverage": 50},
    {"id": "mittenaar", "name": "Mittenaar", "population": 5900, "fiberCoverage": 48}
  ]
};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
  allDatasets = APP_DATA.datasets;
  setupEventListeners();
  displayDatasets(allDatasets);
  populateMunicipalityStats(APP_DATA.municipalities);
  populateMunicipalitySelects(APP_DATA.municipalities);
});

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
  const dataset = allDatasets.find(d => d.id === datasetId);
  if (!dataset) return;
  currentDataset = dataset;
  try {
    populateDatasetDetail(dataset);
  } catch (e) {
    console.error('Fehler beim Befüllen der Detailseite:', e);
  }
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
    card.setAttribute('onclick', "navigateToDataset('" + dataset.id + "')");
    card.innerHTML = `
      <div class="dataset-badge">${TYPE_LABELS[dataset.type] || 'Datensatz'}</div>
      <h3>${dataset.title}</h3>
      <p>${dataset.description}</p>
      <div class="dataset-meta">
        <span class="source-badge" style="background:${getSourceColor(dataset.source)}20;color:${getSourceColor(dataset.source)}">${dataset.source}</span>
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
