/**
 * MIDI Drum Splitter - Main Application
 * 
 * Entry point that coordinates all modules and manages application state.
 */

import { parseMidi, analyzeMidi, getMidiInfo } from './midi-parser.js';
import { splitAllNotes, splitByGroups } from './midi-splitter.js';
import { downloadZip, downloadOrganizedZip } from './export.js';
import {
  initFileUpload,
  renderFileInfo,
  renderAnalysisTable,
  renderGroupsSummary,
  updateExportButtons,
  showLoading,
  showError,
  showSuccess,
  resetUI,
  showAnalysisSections
} from './ui.js';

// Application State
const state = {
  // Loaded MIDI data
  midi: null,
  analysis: null,
  fileName: '',
  
  // User selections
  selectedNotes: new Set(),
  noteGroups: new Map(),
  
  // DOM element references
  elements: {}
};

/**
 * Initialize the application
 */
function init() {
  // Get DOM elements
  state.elements = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileInfo: document.getElementById('file-info'),
    analysisSection: document.getElementById('analysis-section'),
    analysisTable: document.getElementById('analysis-table'),
    groupsSection: document.getElementById('groups-section'),
    groupsSummary: document.getElementById('groups-summary'),
    exportSection: document.getElementById('export-section'),
    downloadAll: document.getElementById('download-all'),
    downloadGroups: document.getElementById('download-groups'),
    downloadBoth: document.getElementById('download-both')
  };
  
  // Initialize file upload
  initFileUpload(
    state.elements.dropZone,
    state.elements.fileInput,
    handleFileSelected
  );
  
  // Attach export button handlers
  state.elements.downloadAll?.addEventListener('click', handleDownloadAll);
  state.elements.downloadGroups?.addEventListener('click', handleDownloadGroups);
  state.elements.downloadBoth?.addEventListener('click', handleDownloadBoth);
  
  console.log('MIDI Drum Splitter initialized');
}

/**
 * Handle file selection
 * @param {File} file - Selected file
 */
async function handleFileSelected(file) {
  try {
    // Reset state for new file
    resetState();
    state.fileName = file.name.replace(/\.midi?$/i, '');
    
    // Show loading
    showLoading(state.elements.analysisTable, 'Parsing MIDI file...');
    showAnalysisSections(state.elements);
    
    // Read file
    const arrayBuffer = await file.arrayBuffer();
    
    // Parse MIDI
    state.midi = parseMidi(arrayBuffer);
    state.analysis = analyzeMidi(state.midi);
    
    // Get file info
    const info = getMidiInfo(state.midi);
    info.name = file.name;
    
    // Render UI
    renderFileInfo(state.elements.fileInfo, info);
    
    // Select all notes by default
    state.analysis.notes.forEach(note => {
      state.selectedNotes.add(note.midiNumber);
    });
    
    // Apply default groups
    state.analysis.notes.forEach(note => {
      if (note.defaultGroup) {
        state.noteGroups.set(note.midiNumber, note.defaultGroup);
      }
    });
    
    // Render analysis table
    renderAnalysisTable(
      state.elements.analysisTable,
      state.analysis.notes,
      state,
      {
        onSelectionChange: handleSelectionChange,
        onGroupChange: handleGroupChange
      }
    );
    
    // Render groups summary
    renderGroupsSummary(
      state.elements.groupsSummary,
      state.noteGroups,
      state.analysis.notes
    );
    
    // Update export buttons
    updateExportButtons({
      downloadAll: state.elements.downloadAll,
      downloadGroups: state.elements.downloadGroups,
      downloadBoth: state.elements.downloadBoth
    }, state);
    
    showSuccess(`Loaded ${state.analysis.uniqueNotes} unique notes from ${state.analysis.totalNotes} total`);
    
  } catch (error) {
    console.error('Error parsing MIDI:', error);
    showError('Failed to parse MIDI file. Please ensure it is a valid MIDI file.');
    resetUI(state.elements);
  }
}

/**
 * Handle note selection changes
 * @param {Set} selectedNotes - Set of selected MIDI numbers
 */
function handleSelectionChange(selectedNotes) {
  state.selectedNotes = selectedNotes;
  updateExportButtons({
    downloadAll: state.elements.downloadAll,
    downloadGroups: state.elements.downloadGroups,
    downloadBoth: state.elements.downloadBoth
  }, state);
}

/**
 * Handle group assignment changes
 * @param {Map} noteGroups - Map of MIDI number to group name
 */
function handleGroupChange(noteGroups) {
  state.noteGroups = noteGroups;
  renderGroupsSummary(
    state.elements.groupsSummary,
    state.noteGroups,
    state.analysis.notes
  );
  updateExportButtons({
    downloadAll: state.elements.downloadAll,
    downloadGroups: state.elements.downloadGroups,
    downloadBoth: state.elements.downloadBoth
  }, state);
}

/**
 * Handle download all button click
 */
async function handleDownloadAll() {
  if (!state.midi || state.selectedNotes.size === 0) return;
  
  try {
    const button = state.elements.downloadAll;
    const originalText = button.textContent;
    button.textContent = 'Creating ZIP...';
    button.disabled = true;
    
    // Split selected notes
    const selectedArray = Array.from(state.selectedNotes);
    const splitFiles = splitAllNotes(state.midi, selectedArray);
    
    // Download ZIP
    await downloadZip(splitFiles, `${state.fileName}_split`);
    
    button.textContent = originalText;
    button.disabled = false;
    showSuccess(`Downloaded ${splitFiles.length} MIDI files`);
    
  } catch (error) {
    console.error('Error creating download:', error);
    showError('Failed to create download');
    state.elements.downloadAll.disabled = false;
  }
}

/**
 * Handle download groups button click
 */
async function handleDownloadGroups() {
  if (!state.midi || state.noteGroups.size === 0) return;
  
  try {
    const button = state.elements.downloadGroups;
    const originalText = button.textContent;
    button.textContent = 'Creating ZIP...';
    button.disabled = true;
    
    // Build groups object
    const groups = {};
    state.noteGroups.forEach((groupName, midiNumber) => {
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(midiNumber);
    });
    
    // Split by groups
    const groupFiles = splitByGroups(state.midi, groups);
    
    // Download ZIP
    await downloadZip(groupFiles, `${state.fileName}_groups`);
    
    button.textContent = originalText;
    button.disabled = false;
    showSuccess(`Downloaded ${groupFiles.length} group files`);
    
  } catch (error) {
    console.error('Error creating download:', error);
    showError('Failed to create download');
    state.elements.downloadGroups.disabled = false;
  }
}

/**
 * Handle download both button click
 */
async function handleDownloadBoth() {
  if (!state.midi || state.selectedNotes.size === 0) return;
  
  try {
    const button = state.elements.downloadBoth;
    const originalText = button.textContent;
    button.textContent = 'Creating ZIP...';
    button.disabled = true;
    
    // Split selected notes
    const selectedArray = Array.from(state.selectedNotes);
    const splitFiles = splitAllNotes(state.midi, selectedArray);
    
    // Build groups object
    const groups = {};
    state.noteGroups.forEach((groupName, midiNumber) => {
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(midiNumber);
    });
    
    // Split by groups
    const groupFiles = Object.keys(groups).length > 0 
      ? splitByGroups(state.midi, groups) 
      : [];
    
    // Download organized ZIP
    await downloadOrganizedZip(splitFiles, groups, groupFiles, `${state.fileName}_all`);
    
    button.textContent = originalText;
    button.disabled = false;
    
    const totalFiles = splitFiles.length + groupFiles.length;
    showSuccess(`Downloaded ${totalFiles} MIDI files (${splitFiles.length} individual + ${groupFiles.length} groups)`);
    
  } catch (error) {
    console.error('Error creating download:', error);
    showError('Failed to create download');
    state.elements.downloadBoth.disabled = false;
  }
}

/**
 * Reset application state
 */
function resetState() {
  state.midi = null;
  state.analysis = null;
  state.fileName = '';
  state.selectedNotes = new Set();
  state.noteGroups = new Map();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
