/**
 * MIDI Parser Module
 * 
 * Handles parsing MIDI files and analyzing their content.
 * Uses @tonejs/midi for parsing.
 */

import { getNoteName, getDrumName, getDefaultGroup, getDisplayName } from './gm-drums.js';

/**
 * Parse a MIDI file from an ArrayBuffer
 * @param {ArrayBuffer} arrayBuffer - The MIDI file data
 * @returns {Object} Parsed MIDI object from @tonejs/midi
 */
export function parseMidi(arrayBuffer) {
  // Midi is loaded globally from lib/Midi.js
  return new Midi(arrayBuffer);
}

/**
 * Analyze a parsed MIDI file and extract note statistics
 * @param {Object} midi - Parsed MIDI object
 * @returns {Object} Analysis results
 */
export function analyzeMidi(midi) {
  const noteMap = new Map();
  let totalNotes = 0;
  
  // Process all tracks
  midi.tracks.forEach((track, trackIndex) => {
    track.notes.forEach(note => {
      const midiNumber = note.midi;
      totalNotes++;
      
      if (!noteMap.has(midiNumber)) {
        noteMap.set(midiNumber, {
          midiNumber,
          noteName: getNoteName(midiNumber),
          drumName: getDrumName(midiNumber),
          displayName: getDisplayName(midiNumber),
          defaultGroup: getDefaultGroup(midiNumber),
          count: 0,
          tracks: new Set(),
          minVelocity: 1,
          maxVelocity: 0,
          totalDuration: 0
        });
      }
      
      const noteInfo = noteMap.get(midiNumber);
      noteInfo.count++;
      noteInfo.tracks.add(trackIndex);
      noteInfo.minVelocity = Math.min(noteInfo.minVelocity, note.velocity);
      noteInfo.maxVelocity = Math.max(noteInfo.maxVelocity, note.velocity);
      noteInfo.totalDuration += note.duration;
    });
  });
  
  // Convert to array and sort by MIDI number
  const notes = Array.from(noteMap.values())
    .map(note => ({
      ...note,
      tracks: Array.from(note.tracks),
      avgDuration: note.totalDuration / note.count
    }))
    .sort((a, b) => a.midiNumber - b.midiNumber);
  
  return {
    name: midi.name || 'Untitled',
    duration: midi.duration,
    tracks: midi.tracks.length,
    ppq: midi.header.ppq,
    tempos: midi.header.tempos,
    timeSignatures: midi.header.timeSignatures,
    totalNotes,
    uniqueNotes: notes.length,
    notes
  };
}

/**
 * Get basic info about a MIDI file (without full analysis)
 * @param {Object} midi - Parsed MIDI object
 * @returns {Object} Basic MIDI info
 */
export function getMidiInfo(midi) {
  return {
    name: midi.name || 'Untitled',
    duration: midi.duration,
    durationFormatted: formatDuration(midi.duration),
    tracks: midi.tracks.length,
    ppq: midi.header.ppq,
    tempos: midi.header.tempos.map(t => ({
      bpm: Math.round(t.bpm),
      time: t.time
    })),
    timeSignatures: midi.header.timeSignatures.map(ts => ({
      numerator: ts.timeSignature[0],
      denominator: ts.timeSignature[1],
      time: ts.ticks
    }))
  };
}

/**
 * Format duration in seconds to mm:ss format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get all notes from a MIDI file as a flat array
 * @param {Object} midi - Parsed MIDI object
 * @returns {Array} Array of note objects with track info
 */
export function getAllNotes(midi) {
  const notes = [];
  
  midi.tracks.forEach((track, trackIndex) => {
    track.notes.forEach(note => {
      notes.push({
        ...note,
        trackIndex,
        trackName: track.name || `Track ${trackIndex + 1}`
      });
    });
  });
  
  return notes.sort((a, b) => a.time - b.time);
}

/**
 * Filter notes by MIDI number(s)
 * @param {Object} midi - Parsed MIDI object
 * @param {number|number[]} midiNumbers - Single MIDI number or array of numbers
 * @returns {Array} Filtered notes
 */
export function filterNotesByPitch(midi, midiNumbers) {
  const pitches = Array.isArray(midiNumbers) ? midiNumbers : [midiNumbers];
  const pitchSet = new Set(pitches);
  
  const notes = [];
  
  midi.tracks.forEach((track, trackIndex) => {
    track.notes.forEach(note => {
      if (pitchSet.has(note.midi)) {
        notes.push({
          ...note,
          trackIndex,
          trackName: track.name || `Track ${trackIndex + 1}`
        });
      }
    });
  });
  
  return notes.sort((a, b) => a.time - b.time);
}
