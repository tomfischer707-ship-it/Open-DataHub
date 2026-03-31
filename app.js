// ===== Global Data =====
let allDatasets = [];
let currentDataset = null;

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

// ===== Helper Functions for Dataset Detail =====
function createTagBadge(tagText) {
  const badge = document.createElement('span');
  badge.className = 'tag-badge';
  badge.textContent = tagText;
  return badge;
}

function createPreviewTable(previewRows) {
  if (!previewRows || previewRows.length === 0) {
    return '<p style="color: var(--gray-400);">Keine Vorschaudaten verfügbar</p>';
  }

  const firstRow = previewRows[0];
  const headers = Object.keys(firstRow);

  let html = '<table class="preview-table"><thead><tr>';
  headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead><tbody>';

  previewRows.slice(0, 5).forEach(row => {
    html += '<tr>';
    headers.forEach(header => {
      const value = row[header];
      html += `<td>${typeof value === 'number' ? value.toLocaleString('de-DE') : value}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

function createExternalLink(url, label, icon) {
  if (!url) return '';
  return `<a href="${url}" target="_blank" rel="noopener noreferrer"><i class="fas ${icon}"></i> ${label}</a>`;
}

function handleDownload(format, datasetTitle) {
  const filename = datasetTitle.toLowerCase().replace(/\s+/g, '_') + '_.' + format.toLowerCase();
  const message = `Download startet: ${filename}`;

  // Create a simple notification
  const notification = document.createElement('div');
  notification.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #10b981; color: white; padding: 1rem; border-radius: 8px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
  notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);

  // In a real app, this would trigger an actual download
  console.log(`Download initiated: ${filename}`);
}

function handleFeedback(datasetId, contactEmail) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000;';

  const modalContent = document.createElement('div');
  modalContent.style.cssText = 'background: var(--blue-900); color: white; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%; border: 1px solid rgba(59, 130, 246, 0.3);';

  modalContent.innerHTML = `
    <h2 style="margin-top: 0; margin-bottom: 1rem;">Feedback geben</h2>
    <p style="color: var(--gray-300); margin-bottom: 1rem;">Teilen Sie uns Ihre Gedanken oder Verbesserungsvorschläge mit:</p>
    <textarea id="feedback-text" style="width: 100%; height: 120px; padding: 10px; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 6px; background: rgba(37, 99, 235, 0.1); color: white; font-family: Arial, sans-serif; resize: vertical;" placeholder="Ihr Feedback hier..."></textarea>
    <div style="margin-top: 1rem; display: flex; gap: 1rem;">
      <button class="btn-primary" style="flex: 1;" onclick="submitFeedback('${datasetId}', '${contactEmail}')">Senden</button>
      <button class="btn-secondary" style="flex: 1;" onclick="closeFeedbackModal()">Abbrechen</button>
    </div>
  `;

  modal.appendChild(modalContent);
  modal.onclick = (e) => {
    if (e.target === modal) closeFeedbackModal();
  };
  document.body.appendChild(modal);
  document.getElementById('feedback-text').focus();
  window.currentFeedbackModal = modal;
}

function closeFeedbackModal() {
  if (window.currentFeedbackModal) {
    window.currentFeedbackModal.remove();
    window.currentFeedbackModal = null;
  }
}

function submitFeedback(datasetId, contactEmail) {
  const text = document.getElementById('feedback-text').value;
  if (!text.trim()) {
    alert('Bitte geben Sie Ihr Feedback ein.');
    return;
  }

  // In a real app, this would send the feedback to a server
  console.log(`Feedback for dataset ${datasetId}:`, text);

  const message = `Vielen Dank für Ihr Feedback! Sie können es auch an ${contactEmail} senden.`;
  alert(message);
  closeFeedbackModal();
}

// ===== Dataset Detail Page =====
function populateDatasetDetail(dataset) {
  currentDataset = dataset;

  // Basic Information
  document.getElementById('detail-title').textContent = dataset.title;
  document.getElementById('detail-source').textContent = dataset.source;
  document.getElementById('detail-type').textContent = dataset.type;
  document.getElementById('detail-description').textContent = dataset.description;

  // Metadata
  document.getElementById('detail-metadata-source').textContent = dataset.source;
  document.getElementById('detail-metadata-period').textContent = dataset.period || 'N/A';
  document.getElementById('detail-metadata-updated').textContent = dataset.updated;
  document.getElementById('detail-metadata-frequency').textContent = dataset.frequency;
  document.getElementById('detail-metadata-license').textContent = dataset.license;
  document.getElementById('detail-metadata-contact').textContent = dataset.contact;

  // Tags/Keywords
  const tagsSection = document.getElementById('detail-tags-section');
  const tagsContainer = document.getElementById('detail-tags');
  if (dataset.tags && dataset.tags.length > 0) {
    tagsContainer.innerHTML = '';
    dataset.tags.forEach(tag => {
      tagsContainer.appendChild(createTagBadge(tag));
    });
    tagsSection.style.display = 'block';
  } else {
    tagsSection.style.display = 'none';
  }

  // Preview Data Table
  const previewSection = document.getElementById('detail-preview-section');
  const previewContainer = document.getElementById('detail-preview');
  if (dataset.previewRows && dataset.previewRows.length > 0) {
    previewContainer.innerHTML = createPreviewTable(dataset.previewRows);
    previewSection.style.display = 'block';
  } else {
    previewSection.style.display = 'none';
  }

  // External Links (API and Grafana)
  const linksSection = document.getElementById('detail-links-section');
  const linksContainer = document.getElementById('detail-links');
  let linksHtml = '';
  if (dataset.apiEndpoint) {
    linksHtml += createExternalLink(dataset.apiEndpoint, 'API Endpoint', 'fa-code');
  }
  if (dataset.grafanaLink) {
    linksHtml += createExternalLink(dataset.grafanaLink, 'Grafana Dashboard', 'fa-chart-line');
  }
  if (linksHtml) {
    linksContainer.innerHTML = linksHtml;
    linksSection.style.display = 'block';
  } else {
    linksSection.style.display = 'none';
  }

  // Info box
  document.getElementById('detail-info-type').textContent = dataset.type;
  document.getElementById('detail-info-level').textContent = dataset.level.join(', ');
  document.getElementById('detail-info-format').textContent = dataset.download.join(', ');

  // Downloads
  const downloadContainer = document.getElementById('detail-downloads');
  downloadContainer.innerHTML = dataset.download.map(format =>
    `<button class="btn-secondary" onclick="handleDownload('${format}', '${dataset.title.replace(/'/g, "\\'")}')"><i class="fas fa-download"></i> ${format}</button>`
  ).join('');

  // Feedback button
  const feedbackButton = document.querySelector('.feedback-box button');
  if (feedbackButton) {
    feedbackButton.onclick = () => handleFeedback(dataset.id, dataset.contact);
  }

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
