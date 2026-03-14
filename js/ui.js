/**
 * UI Module
 * 
 * Handles all DOM manipulation and user interactions.
 */

/**
 * Initialize the file upload area with drag & drop support
 * @param {HTMLElement} dropZone - The drop zone element
 * @param {HTMLInputElement} fileInput - The file input element
 * @param {Function} onFileSelected - Callback when file is selected
 */
export function initFileUpload(dropZone, fileInput, onFileSelected) {
  // Click to browse
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });
  
  // File input change
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelected(file);
    }
  });
  
  // Drag and drop events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  
  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && /\.midi?$/i.test(file.name)) {
      onFileSelected(file);
    } else {
      showError('Please drop a MIDI file (.mid)');
    }
  });
}

/**
 * Display file info in the UI
 * @param {HTMLElement} container - Container element for file info
 * @param {Object} info - File info object
 */
export function renderFileInfo(container, info) {
  container.innerHTML = `
    <div class="file-info">
      <div class="file-info-item">
        <span class="label">File:</span>
        <span class="value">${escapeHtml(info.name)}</span>
      </div>
      <div class="file-info-item">
        <span class="label">Duration:</span>
        <span class="value">${info.durationFormatted}</span>
      </div>
      <div class="file-info-item">
        <span class="label">Tracks:</span>
        <span class="value">${info.tracks}</span>
      </div>
      <div class="file-info-item">
        <span class="label">PPQ:</span>
        <span class="value">${info.ppq}</span>
      </div>
      <div class="file-info-item">
        <span class="label">Tempo:</span>
        <span class="value">${info.tempos[0]?.bpm || 120} BPM</span>
      </div>
    </div>
  `;
  container.classList.remove('hidden');
}

/**
 * Render the note analysis table
 * @param {HTMLElement} container - Container element for the table
 * @param {Object[]} notes - Array of note analysis objects
 * @param {Object} state - Application state for groups and selections
 * @param {Object} callbacks - Event callbacks { onSelectionChange, onGroupChange }
 */
export function renderAnalysisTable(container, notes, state, callbacks) {
  const tableHtml = `
    <table class="analysis-table">
      <thead>
        <tr>
          <th class="col-select">
            <input type="checkbox" id="select-all" ${areAllSelected(notes, state) ? 'checked' : ''}>
          </th>
          <th class="col-midi">MIDI #</th>
          <th class="col-note">Note</th>
          <th class="col-name">Name</th>
          <th class="col-count">Count</th>
          <th class="col-group">Group</th>
        </tr>
      </thead>
      <tbody>
        ${notes.map(note => renderNoteRow(note, state)).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = tableHtml;
  container.classList.remove('hidden');
  
  // Attach event listeners
  attachTableEventListeners(container, notes, state, callbacks);
}

/**
 * Render a single note row
 * @param {Object} note - Note analysis object
 * @param {Object} state - Application state
 * @returns {string} HTML for the row
 */
function renderNoteRow(note, state) {
  const isSelected = state.selectedNotes.has(note.midiNumber);
  const group = state.noteGroups.get(note.midiNumber) || note.defaultGroup || '';
  
  return `
    <tr data-midi="${note.midiNumber}" class="${isSelected ? 'selected' : ''}">
      <td class="col-select">
        <input type="checkbox" class="note-select" data-midi="${note.midiNumber}" ${isSelected ? 'checked' : ''}>
      </td>
      <td class="col-midi">${note.midiNumber}</td>
      <td class="col-note">${escapeHtml(note.noteName)}</td>
      <td class="col-name">${escapeHtml(note.drumName || '-')}</td>
      <td class="col-count">${note.count}</td>
      <td class="col-group">
        <input type="text" class="group-input" data-midi="${note.midiNumber}" 
               value="${escapeHtml(group)}" placeholder="Group name">
      </td>
    </tr>
  `;
}

/**
 * Attach event listeners to the analysis table
 */
function attachTableEventListeners(container, notes, state, callbacks) {
  // Select all checkbox
  const selectAll = container.querySelector('#select-all');
  selectAll?.addEventListener('change', (e) => {
    const checked = e.target.checked;
    notes.forEach(note => {
      if (checked) {
        state.selectedNotes.add(note.midiNumber);
      } else {
        state.selectedNotes.delete(note.midiNumber);
      }
    });
    callbacks.onSelectionChange?.(state.selectedNotes);
    updateTableSelections(container, state);
  });
  
  // Individual note checkboxes
  container.querySelectorAll('.note-select').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const midiNumber = parseInt(e.target.dataset.midi);
      if (e.target.checked) {
        state.selectedNotes.add(midiNumber);
      } else {
        state.selectedNotes.delete(midiNumber);
      }
      callbacks.onSelectionChange?.(state.selectedNotes);
      updateTableSelections(container, state);
    });
  });
  
  // Group inputs
  container.querySelectorAll('.group-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const midiNumber = parseInt(e.target.dataset.midi);
      const groupName = e.target.value.trim();
      
      if (groupName) {
        state.noteGroups.set(midiNumber, groupName);
      } else {
        state.noteGroups.delete(midiNumber);
      }
      
      callbacks.onGroupChange?.(state.noteGroups);
    });
  });
}

/**
 * Update table row selections visually
 */
function updateTableSelections(container, state) {
  container.querySelectorAll('tbody tr').forEach(row => {
    const midiNumber = parseInt(row.dataset.midi);
    const checkbox = row.querySelector('.note-select');
    const isSelected = state.selectedNotes.has(midiNumber);
    
    row.classList.toggle('selected', isSelected);
    if (checkbox) checkbox.checked = isSelected;
  });
  
  // Update select all checkbox
  const selectAll = container.querySelector('#select-all');
  const allCheckboxes = container.querySelectorAll('.note-select');
  const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
  if (selectAll) selectAll.checked = allChecked;
}

/**
 * Check if all notes are selected
 */
function areAllSelected(notes, state) {
  return notes.every(note => state.selectedNotes.has(note.midiNumber));
}

/**
 * Render the groups summary panel
 * @param {HTMLElement} container - Container element
 * @param {Map} noteGroups - Map of midiNumber -> groupName
 * @param {Object[]} notes - Note analysis array
 */
export function renderGroupsSummary(container, noteGroups, notes) {
  // Group notes by group name
  const groups = new Map();
  
  noteGroups.forEach((groupName, midiNumber) => {
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName).push(midiNumber);
  });
  
  if (groups.size === 0) {
    container.innerHTML = `
      <div class="groups-empty">
        <p>No groups defined. Enter group names in the table above to combine notes.</p>
        <p class="hint">Tip: Use the same group name for multiple notes to combine them into one MIDI file.</p>
      </div>
    `;
    return;
  }
  
  const groupsHtml = Array.from(groups.entries()).map(([groupName, midiNumbers]) => {
    const noteNames = midiNumbers.map(midi => {
      const note = notes.find(n => n.midiNumber === midi);
      return note ? note.noteName : midi;
    }).join(', ');
    
    return `
      <div class="group-item">
        <span class="group-name">${escapeHtml(groupName)}</span>
        <span class="group-notes">${noteNames}</span>
        <span class="group-count">${midiNumbers.length} notes</span>
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <div class="groups-list">
      ${groupsHtml}
    </div>
  `;
}

/**
 * Update the export buttons state
 * @param {Object} buttons - Object containing button elements
 * @param {Object} state - Application state
 */
export function updateExportButtons(buttons, state) {
  const hasSelection = state.selectedNotes.size > 0;
  const hasGroups = state.noteGroups.size > 0;
  
  if (buttons.downloadAll) {
    buttons.downloadAll.disabled = !hasSelection;
  }
  if (buttons.downloadGroups) {
    buttons.downloadGroups.disabled = !hasGroups;
  }
  if (buttons.downloadBoth) {
    buttons.downloadBoth.disabled = !hasSelection;
  }
}

/**
 * Show a loading state
 * @param {HTMLElement} container - Container to show loading in
 * @param {string} message - Loading message
 */
export function showLoading(container, message = 'Processing...') {
  container.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

/**
 * Show an error message
 * @param {string} message - Error message
 */
export function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-toast';
  errorDiv.textContent = message;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.classList.add('fade-out');
    setTimeout(() => errorDiv.remove(), 300);
  }, 3000);
}

/**
 * Show a success message
 * @param {string} message - Success message
 */
export function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-toast';
  successDiv.textContent = message;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.classList.add('fade-out');
    setTimeout(() => successDiv.remove(), 300);
  }, 3000);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Reset the UI to initial state
 * @param {Object} elements - Object containing UI elements
 */
export function resetUI(elements) {
  if (elements.fileInfo) {
    elements.fileInfo.innerHTML = '';
    elements.fileInfo.classList.add('hidden');
  }
  if (elements.analysisSection) {
    elements.analysisSection.classList.add('hidden');
  }
  if (elements.groupsSection) {
    elements.groupsSection.classList.add('hidden');
  }
  if (elements.exportSection) {
    elements.exportSection.classList.add('hidden');
  }
}

/**
 * Show the analysis and export sections
 * @param {Object} elements - Object containing UI elements
 */
export function showAnalysisSections(elements) {
  if (elements.analysisSection) {
    elements.analysisSection.classList.remove('hidden');
  }
  if (elements.groupsSection) {
    elements.groupsSection.classList.remove('hidden');
  }
  if (elements.exportSection) {
    elements.exportSection.classList.remove('hidden');
  }
}
