// ===== Global State =====
let allDatasets = [];
let allMunicipalities = [];
let dataLoaded = false;
let populationChart = null;
let breitbandMap = null;
let currentDetailDataset = null;
let previousPage = null;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
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
      setupEventListeners();
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

  // Back button handler
  document.getElementById('back-to-previous')?.addEventListener('click', () => {
    navigateToPage(previousPage || 'home');
  });
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
  console.log('📖 navigateToPage aufgerufen mit:', pageName);

  // Deactivate all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // Activate selected page
  const pageId = pageName + '-page';
  const pageEl = document.getElementById(pageId);
  const linkEl = document.querySelector(`[data-page="${pageName}"]`);

  console.log(`  Suche nach Seite: #${pageId}`);
  console.log(`  Seite existiert: ${!!pageEl}`);

  if (pageEl) {
    pageEl.classList.add('active');
    console.log(`  ✅ Seite ${pageName} aktiviert`);
    window.scrollTo(0, 0);

    // Render appropriate content
    if (pageName === 'home') renderHomePage();
    else if (pageName === 'explore') renderExplorePage();
    else if (pageName === 'breitband') renderBroadbandPage();
    else if (pageName === 'demografie') renderDemographyPage();
    else if (pageName === 'mobilität') renderMobilityPage();
    else if (pageName === 'dataset-detail') {
      console.log('  ℹ️  Dataset-Detail-Seite aktiviert (Content bereits populiert)');
    }
  } else {
    console.error(`  ❌ Seite mit ID '${pageId}' nicht gefunden!`);
  }

  if (linkEl) {
    linkEl.classList.add('active');
    console.log(`  ✅ Nav-Link aktiviert`);
  }

  console.log('  ✅ navigateToPage abgeschlossen\n');
}

// ===== DATASET DETAIL VIEW HELPERS =====
function renderTags(tags) {
  if (!tags || tags.length === 0) return;
  const container = document.getElementById('detail-tags');
  const section = document.getElementById('detail-tags-section');
  container.innerHTML = tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('');
  section.style.display = 'block';
}

function renderPreviewTable(previewRows) {
  if (!previewRows || previewRows.length === 0) return;
  const container = document.getElementById('detail-preview');
  const section = document.getElementById('detail-preview-section');

  const headers = Object.keys(previewRows[0]);
  let html = '<table class="detail-preview-table"><thead><tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';

  previewRows.slice(0, 5).forEach(row => {
    html += '<tr>';
    headers.forEach(h => {
      const val = row[h];
      html += `<td>${typeof val === 'number' ? val.toLocaleString('de-DE') : val}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';

  container.innerHTML = html;
  section.style.display = 'block';
}

function renderExternalLinks(apiEndpoint, grafanaLink) {
  const container = document.getElementById('detail-links');
  const section = document.getElementById('detail-links-section');
  let html = '';

  if (apiEndpoint) {
    html += `<a href="${apiEndpoint}" target="_blank" rel="noopener noreferrer">🔗 API Endpoint</a>`;
  }
  if (grafanaLink) {
    html += `<a href="${grafanaLink}" target="_blank" rel="noopener noreferrer">📊 Grafana Dashboard</a>`;
  }

  if (html) {
    container.innerHTML = html;
    section.style.display = 'block';
  }
}

function renderDownloadButtons(formats, dataset) {
  if (!formats || formats.length === 0) return;
  const container = document.getElementById('detail-downloads');
  const section = document.getElementById('detail-downloads-section');

  container.innerHTML = formats.map(fmt =>
    `<button class="btn-secondary" onclick="handleDownload('${fmt}', '${dataset.title.replace(/'/g, "\\'")}')">⬇️ ${fmt}</button>`
  ).join('');
  section.style.display = 'block';
}

function handleDownload(format, title) {
  const filename = title.toLowerCase().replace(/\s+/g, '_') + '.' + format.toLowerCase();
  const message = `Download startet: ${filename}`;

  const notification = document.createElement('div');
  notification.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #10b981; color: white; padding: 1rem; border-radius: 8px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
  notification.innerHTML = `✅ ${message}`;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
  console.log(`Download: ${filename}`);
}

function handleFeedback(dataset) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;';

  const content = document.createElement('div');
  content.style.cssText = 'background: white; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%; box-shadow: var(--shadow-lg);';

  content.innerHTML = `
    <h2 style="margin-top: 0; margin-bottom: 1rem; color: var(--gray-900);">Feedback zu "${dataset.title}"</h2>
    <p style="color: var(--gray-600); margin-bottom: 1rem;">Teilen Sie Ihre Gedanken oder Verbesserungsvorschläge:</p>
    <textarea id="feedback-text" style="width: 100%; height: 120px; padding: 10px; border: 1px solid var(--gray-300); border-radius: 6px; font-family: Arial, sans-serif; font-size: 0.9rem; resize: vertical;" placeholder="Ihr Feedback hier..."></textarea>
    <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
      <button class="btn-primary" style="flex: 1; padding: 10px; cursor: pointer; border: none; border-radius: 6px; background: var(--primary); color: white; font-weight: 500;" onclick="submitFeedback('${dataset.id}', '${dataset.contact}')">Senden</button>
      <button style="flex: 1; padding: 10px; cursor: pointer; border: 1px solid var(--gray-300); border-radius: 6px; background: white; color: var(--gray-800); font-weight: 500;" onclick="closeFeedbackModal()">Abbrechen</button>
    </div>
  `;

  modal.appendChild(content);
  modal.onclick = (e) => { if (e.target === modal) closeFeedbackModal(); };
  document.body.appendChild(modal);
  window.currentFeedbackModal = modal;
  document.getElementById('feedback-text').focus();
}

function closeFeedbackModal() {
  if (window.currentFeedbackModal) {
    window.currentFeedbackModal.remove();
    window.currentFeedbackModal = null;
  }
}

function submitFeedback(datasetId, contact) {
  const text = document.getElementById('feedback-text').value;
  if (!text.trim()) {
    alert('Bitte geben Sie Ihr Feedback ein.');
    return;
  }

  console.log(`Feedback für ${datasetId}:`, text);
  alert(`Vielen Dank für Ihr Feedback!\n\nSie können es auch direkt senden an: ${contact}`);
  closeFeedbackModal();
}

// ===== DATASET DETAIL VIEW =====
function getCurrentActivePage() {
  const active = document.querySelector('.page.active');
  return active ? active.id.replace('-page', '') : 'home';
}

function formatType(type) {
  const types = {
    'tabular': 'Tabellare Daten',
    'geospatial': 'Geografische Daten',
    'timeseries': 'Zeitreihen'
  };
  return types[type] || type;
}

function showDatasetDetail(dataset) {
  console.log('🎯 showDatasetDetail aufgerufen mit:', dataset);

  currentDetailDataset = dataset;
  previousPage = getCurrentActivePage();
  console.log('  Zurück zu:', previousPage);

  // Update basic content mit Fehlerbehandlung
  const elements = {
    'detail-title': `${dataset.icon} ${dataset.title}`,
    'detail-description': dataset.description,
    'detail-type': formatType(dataset.type),
    'detail-source': dataset.source,
    'detail-period': dataset.period || '—',
    'detail-updated': dataset.updated,
    'detail-theme': dataset.theme,
    'detail-contact': dataset.contact || '—'
  };

  for (const [id, content] of Object.entries(elements)) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = content;
      console.log(`  ✅ ${id} aktualisiert`);
    } else {
      console.warn(`  ❌ Element mit ID '${id}' nicht gefunden!`);
    }
  }

  // Render tags
  if (dataset.tags && dataset.tags.length > 0) {
    renderTags(dataset.tags);
  } else {
    document.getElementById('detail-tags-section').style.display = 'none';
  }

  // Render preview table
  if (dataset.previewRows && dataset.previewRows.length > 0) {
    renderPreviewTable(dataset.previewRows);
  } else {
    document.getElementById('detail-preview-section').style.display = 'none';
  }

  // Render external links
  if (dataset.apiEndpoint || dataset.grafanaLink) {
    renderExternalLinks(dataset.apiEndpoint, dataset.grafanaLink);
  } else {
    document.getElementById('detail-links-section').style.display = 'none';
  }

  // Render download buttons
  if (dataset.download && dataset.download.length > 0) {
    renderDownloadButtons(dataset.download, dataset);
  } else {
    document.getElementById('detail-downloads-section').style.display = 'none';
  }

  // Attach feedback handler
  const feedbackBtn = document.getElementById('detail-feedback-btn');
  if (feedbackBtn) {
    feedbackBtn.onclick = () => handleFeedback(dataset);
  }

  // Render related datasets
  console.log('  Rendere verwandte Datensätze für Theme:', dataset.theme);
  renderRelatedDatasets(dataset.theme);

  // Navigate to detail page
  console.log('  Navigiere zu dataset-detail Seite');
  navigateToPage('dataset-detail');
  console.log('  ✅ showDatasetDetail abgeschlossen');
}

function renderRelatedDatasets(theme) {
  const related = allDatasets.filter(ds => ds.theme === theme && ds.id !== currentDetailDataset.id);
  const container = document.getElementById('related-datasets');

  if (related.length === 0) {
    container.innerHTML = '<p style="color: var(--gray-500); font-size: 0.9rem;">Keine verwandten Datensätze</p>';
    return;
  }

  container.innerHTML = related.map(ds => createRelatedDatasetCard(ds)).join('');

  // Add click handlers for related datasets
  container.querySelectorAll('.related-dataset-card').forEach(card => {
    card.addEventListener('click', () => {
      const relatedId = card.dataset.datasetId;
      const relatedDataset = allDatasets.find(ds => ds.id === relatedId);
      if (relatedDataset) {
        showDatasetDetail(relatedDataset);
      }
    });
  });
}

function createRelatedDatasetCard(dataset) {
  return `
    <div class="related-dataset-card" data-dataset-id="${dataset.id}">
      <h4>${dataset.icon} ${dataset.title}</h4>
      <p>${dataset.description.substring(0, 80)}...</p>
    </div>
  `;
}

// ===== HOME PAGE =====
function renderHomePage() {
  if (!dataLoaded) return;

  const featured = allDatasets.slice(0, 6);
  const container = document.getElementById('featured-datasets');

  container.innerHTML = featured.map(ds => createDatasetCard(ds)).join('');

  // Add click listeners to dataset cards
  attachDatasetCardListeners();

  // Calculate and display KPIs
  calculateKPIs();
}

// ===== Attach Dataset Card Listeners =====
function attachDatasetCardListeners() {
  console.log('📌 attachDatasetCardListeners wurde aufgerufen');
  console.log('📊 Anzahl Dataset-Karten:', document.querySelectorAll('.dataset-card').length);

  document.querySelectorAll('.dataset-card').forEach((card, idx) => {
    const datasetId = card.dataset.datasetId;
    console.log(`  Karte ${idx}: ID=${datasetId}`);

    card.style.cursor = 'pointer';
    card.addEventListener('click', function cardClickHandler(e) {
      console.log('🔗 KLICK auf Datensatz-Karte!');
      console.log('  Dataset ID:', datasetId);
      console.log('  Alle Datensätze:', allDatasets.length);

      const dataset = allDatasets.find(ds => ds.id === datasetId);
      console.log('  Gefundener Datensatz:', dataset);

      if (dataset) {
        console.log('  ✅ showDatasetDetail wird aufgerufen');
        showDatasetDetail(dataset);
      } else {
        console.log('  ❌ Datensatz nicht gefunden!');
      }
    });
  });

  console.log('✅ Event-Listener registriert für alle Karten');
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

  // Add click listeners to dataset cards
  attachDatasetCardListeners();
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

  // Add click listeners to dataset cards
  attachDatasetCardListeners();

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
    <div class="dataset-card" data-dataset-id="${dataset.id}">
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

  // Add click listeners to dataset cards
  attachDatasetCardListeners();
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
