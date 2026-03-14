/**
 * MIDI Splitter Module
 * 
 * Handles splitting and combining MIDI files by note pitch.
 * Creates new MIDI files containing only specified notes.
 */

import { generateNoteFilename, toSafeFilename } from './gm-drums.js';

/**
 * Create a new MIDI file containing only notes of a specific pitch
 * @param {Object} sourceMidi - Original parsed MIDI object
 * @param {number} midiNumber - MIDI note number to extract
 * @returns {Object} New MIDI object with only the specified note
 */
export function splitByNote(sourceMidi, midiNumber) {
  // Create new MIDI - the header PPQ is read-only and set during construction
  // We'll work with the default PPQ and use time-based values
  const newMidi = new Midi();
  
  // Set tempo (this uses the setTempo method which is allowed)
  const firstTempo = sourceMidi.header.tempos[0]?.bpm || 120;
  newMidi.header.setTempo(firstTempo);
  
  // Note: PPQ is read-only in @tonejs/midi, but time-based note placement
  // works correctly regardless of PPQ differences
  
  // Add time signature if present
  if (sourceMidi.header.timeSignatures.length > 0) {
    const ts = sourceMidi.header.timeSignatures[0];
    newMidi.header.timeSignatures.push({
      ticks: 0,
      timeSignature: ts.timeSignature || [4, 4]
    });
  }
  
  // Create a single track for the extracted notes
  const track = newMidi.addTrack();
  track.name = `Note ${midiNumber}`;
  track.channel = 9; // Drum channel (0-indexed, so 9 = channel 10)
  
  // Collect all notes matching the pitch from all source tracks
  sourceMidi.tracks.forEach(sourceTrack => {
    sourceTrack.notes.forEach(note => {
      if (note.midi === midiNumber) {
        track.addNote({
          midi: note.midi,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity
        });
      }
    });
  });
  
  return newMidi;
}

/**
 * Create a new MIDI file containing multiple note pitches
 * @param {Object} sourceMidi - Original parsed MIDI object
 * @param {number[]} midiNumbers - Array of MIDI note numbers to extract
 * @param {string} [name] - Optional name for the combined track
 * @returns {Object} New MIDI object with the specified notes
 */
export function combineNotes(sourceMidi, midiNumbers, name = 'Combined') {
  const pitchSet = new Set(midiNumbers);
  
  // Create new MIDI
  const newMidi = new Midi();
  
  // Set tempo
  const firstTempo = sourceMidi.header.tempos[0]?.bpm || 120;
  newMidi.header.setTempo(firstTempo);
  
  // Add time signature if present
  if (sourceMidi.header.timeSignatures.length > 0) {
    const ts = sourceMidi.header.timeSignatures[0];
    newMidi.header.timeSignatures.push({
      ticks: 0,
      timeSignature: ts.timeSignature || [4, 4]
    });
  }
  
  // Create a single track for the combined notes
  const track = newMidi.addTrack();
  track.name = name;
  track.channel = 9;
  
  // Collect all matching notes from all source tracks
  sourceMidi.tracks.forEach(sourceTrack => {
    sourceTrack.notes.forEach(note => {
      if (pitchSet.has(note.midi)) {
        track.addNote({
          midi: note.midi,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity
        });
      }
    });
  });
  
  return newMidi;
}

/**
 * Split a MIDI file into separate files for each unique note pitch
 * @param {Object} sourceMidi - Original parsed MIDI object
 * @param {number[]} [selectedNotes] - Optional array of note numbers to include (all if not specified)
 * @returns {Object[]} Array of { filename, midi, midiNumber } objects
 */
export function splitAllNotes(sourceMidi, selectedNotes = null) {
  // Get all unique note numbers
  const noteNumbers = new Set();
  
  sourceMidi.tracks.forEach(track => {
    track.notes.forEach(note => {
      noteNumbers.add(note.midi);
    });
  });
  
  // Filter to selected notes if specified
  const notesToSplit = selectedNotes 
    ? Array.from(noteNumbers).filter(n => selectedNotes.includes(n))
    : Array.from(noteNumbers);
  
  // Create a split file for each note
  return notesToSplit.map(midiNumber => ({
    filename: generateNoteFilename(midiNumber),
    midi: splitByNote(sourceMidi, midiNumber),
    midiNumber
  }));
}

/**
 * Split a MIDI file based on group assignments
 * @param {Object} sourceMidi - Original parsed MIDI object
 * @param {Object} groups - Object mapping group names to arrays of MIDI numbers
 * @returns {Object[]} Array of { filename, midi, groupName, midiNumbers } objects
 */
export function splitByGroups(sourceMidi, groups) {
  return Object.entries(groups).map(([groupName, midiNumbers]) => ({
    filename: `${toSafeFilename(groupName)}.mid`,
    midi: combineNotes(sourceMidi, midiNumbers, groupName),
    groupName,
    midiNumbers
  }));
}

/**
 * Convert a MIDI object to a Uint8Array for download
 * @param {Object} midi - MIDI object
 * @returns {Uint8Array} Binary MIDI data
 */
export function midiToArray(midi) {
  return midi.toArray();
}

/**
 * Get statistics about notes in a split result
 * @param {Object} midi - Split MIDI object
 * @returns {Object} Note statistics
 */
export function getSplitStats(midi) {
  let noteCount = 0;
  let minTime = Infinity;
  let maxTime = 0;
  
  midi.tracks.forEach(track => {
    track.notes.forEach(note => {
      noteCount++;
      minTime = Math.min(minTime, note.time);
      maxTime = Math.max(maxTime, note.time + note.duration);
    });
  });
  
  return {
    noteCount,
    startTime: noteCount > 0 ? minTime : 0,
    endTime: noteCount > 0 ? maxTime : 0,
    duration: noteCount > 0 ? maxTime - minTime : 0
  };
}
