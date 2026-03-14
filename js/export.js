/**
 * Export Module
 * 
 * Handles creating ZIP files and downloading MIDI files.
 * Uses JSZip for ZIP creation.
 */

import { midiToArray } from './midi-splitter.js';

/**
 * Create a ZIP file containing multiple MIDI files
 * @param {Object[]} files - Array of { filename, midi } objects
 * @param {string} [zipName] - Optional name for the ZIP file (without extension)
 * @returns {Promise<Blob>} ZIP file as a Blob
 */
export async function createZip(files, zipName = 'midi-split') {
  const zip = new JSZip();
  
  // Add each MIDI file to the ZIP
  files.forEach(({ filename, midi }) => {
    const midiData = midiToArray(midi);
    zip.file(filename, midiData);
  });
  
  // Generate the ZIP file
  return await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

/**
 * Download a Blob as a file
 * @param {Blob} blob - The file data
 * @param {string} filename - The filename for download
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Create and download a ZIP file containing MIDI files
 * @param {Object[]} files - Array of { filename, midi } objects
 * @param {string} [zipName] - Optional name for the ZIP file
 */
export async function downloadZip(files, zipName = 'midi-split') {
  const blob = await createZip(files, zipName);
  downloadBlob(blob, `${zipName}.zip`);
}

/**
 * Download a single MIDI file
 * @param {Object} midi - MIDI object
 * @param {string} filename - Filename for download
 */
export function downloadMidi(midi, filename) {
  const midiData = midiToArray(midi);
  const blob = new Blob([midiData], { type: 'audio/midi' });
  downloadBlob(blob, filename);
}

/**
 * Create a ZIP with split files organized into folders by group
 * @param {Object[]} splitFiles - Array of { filename, midi, midiNumber } objects
 * @param {Object} groups - Object mapping group names to arrays of MIDI numbers
 * @param {Object[]} groupFiles - Array of { filename, midi, groupName } objects for combined groups
 * @returns {Promise<Blob>} ZIP file as a Blob
 */
export async function createOrganizedZip(splitFiles, groups, groupFiles) {
  const zip = new JSZip();
  
  // Create folders
  const individualFolder = zip.folder('individual');
  const groupedFolder = zip.folder('grouped');
  
  // Add individual split files
  splitFiles.forEach(({ filename, midi }) => {
    const midiData = midiToArray(midi);
    individualFolder.file(filename, midiData);
  });
  
  // Add combined group files
  groupFiles.forEach(({ filename, midi }) => {
    const midiData = midiToArray(midi);
    groupedFolder.file(filename, midiData);
  });
  
  // Generate the ZIP file
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

/**
 * Download an organized ZIP with both individual and grouped files
 * @param {Object[]} splitFiles - Individual split files
 * @param {Object} groups - Group definitions
 * @param {Object[]} groupFiles - Combined group files
 * @param {string} [zipName] - Name for the ZIP file
 */
export async function downloadOrganizedZip(splitFiles, groups, groupFiles, zipName = 'midi-split') {
  const blob = await createOrganizedZip(splitFiles, groups, groupFiles);
  downloadBlob(blob, `${zipName}.zip`);
}

/**
 * Estimate the size of a ZIP file (rough estimate)
 * @param {Object[]} files - Array of { midi } objects
 * @returns {number} Estimated size in bytes
 */
export function estimateZipSize(files) {
  let totalSize = 0;
  
  files.forEach(({ midi }) => {
    // Estimate: MIDI files compress to about 60-70% of original
    const midiSize = midiToArray(midi).length;
    totalSize += Math.ceil(midiSize * 0.65);
  });
  
  // Add ZIP overhead (headers, etc.)
  totalSize += files.length * 100;
  
  return totalSize;
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
