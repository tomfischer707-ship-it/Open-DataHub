// ===== Global Data =====
let allDatasets = [];
let currentDataset = null;

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  initializeMunicipalitySelects();
  initTimeSlider();
});

// ===== Load Data =====
function loadData() {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      allDatasets = data.datasets;
      populateMunicipalityStats(data.municipalities);
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

  // Sidebar: Escape-Taste schließt Sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const sidebar = document.getElementById('dashboardSidebar');
      if (sidebar && !sidebar.classList.contains('collapsed')) {
        toggleDashboardSidebar();
      }
    }
  });
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

// ===== Dashboard Sidebar =====

function toggleDashboardSidebar() {
  const sidebar  = document.getElementById('dashboardSidebar');
  const layout   = document.getElementById('dashboardLayout');
  const chevron  = document.getElementById('sidebarChevron');
  const openBtn  = document.getElementById('sidebarOpenBtn');

  if (!sidebar) return;
  const isCollapsed = sidebar.classList.toggle('collapsed');
  layout.classList.toggle('sidebar-collapsed', isCollapsed);

  if (chevron) chevron.style.transform = isCollapsed ? 'rotate(180deg)' : '';
  if (openBtn) openBtn.style.display = isCollapsed ? 'block' : 'none';
}

function openSidebar() {
  const sidebar = document.getElementById('dashboardSidebar');
  const layout  = document.getElementById('dashboardLayout');
  const chevron = document.getElementById('sidebarChevron');
  const openBtn = document.getElementById('sidebarOpenBtn');

  if (!sidebar || !sidebar.classList.contains('collapsed')) return;
  sidebar.classList.remove('collapsed');
  if (layout) layout.classList.remove('sidebar-collapsed');
  if (chevron) chevron.style.transform = '';
  if (openBtn) openBtn.style.display = 'none';
}

function toggleCollapsible(headerEl) {
  const group = headerEl.closest('.collapsible-group');
  if (group) group.classList.toggle('is-collapsed');
}

function updateYearLabel(value) {
  const label = document.getElementById('yearLabel');
  if (label) label.textContent = value;

  const slider = document.getElementById('yearSlider');
  if (slider) {
    const min = parseInt(slider.min, 10);
    const max = parseInt(slider.max, 10);
    const pct = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-pct', pct + '%');
  }
}

function initTimeSlider() {
  const slider = document.getElementById('yearSlider');
  if (!slider) return;
  updateYearLabel(slider.value);
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  const icon  = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');

  if (icon) {
    if (isLight) {
      icon.classList.replace('fa-moon', 'fa-sun');
    } else {
      icon.classList.replace('fa-sun', 'fa-moon');
    }
  }
  if (label) label.textContent = isLight ? 'Dark Mode' : 'Light Mode';
}

function switchSidebarTab(tabEl, targetId) {
  const tabsContainer = tabEl.closest('.sidebar-tabs');
  if (!tabsContainer) return;

  tabsContainer.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');

  const contentParent = tabsContainer.parentElement;
  contentParent.querySelectorAll('.sidebar-tab-content').forEach(p => p.style.display = 'none');

  const target = document.getElementById(targetId);
  if (target) target.style.display = 'block';
}
