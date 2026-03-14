/**
 * General MIDI Drum Map and Note Naming Utilities
 * 
 * This module provides mappings from MIDI note numbers to:
 * - General MIDI percussion names (notes 35-81)
 * - Standard note names (C0, C#0, D0, etc.)
 */

// General MIDI Level 1 Percussion Map (Channel 10)
// MIDI notes 35-81 are defined in the GM spec
export const GM_DRUM_MAP = {
  35: 'Acoustic Bass Drum',
  36: 'Bass Drum 1',
  37: 'Side Stick',
  38: 'Acoustic Snare',
  39: 'Hand Clap',
  40: 'Electric Snare',
  41: 'Low Floor Tom',
  42: 'Closed Hi-Hat',
  43: 'High Floor Tom',
  44: 'Pedal Hi-Hat',
  45: 'Low Tom',
  46: 'Open Hi-Hat',
  47: 'Low-Mid Tom',
  48: 'Hi-Mid Tom',
  49: 'Crash Cymbal 1',
  50: 'High Tom',
  51: 'Ride Cymbal 1',
  52: 'Chinese Cymbal',
  53: 'Ride Bell',
  54: 'Tambourine',
  55: 'Splash Cymbal',
  56: 'Cowbell',
  57: 'Crash Cymbal 2',
  58: 'Vibraslap',
  59: 'Ride Cymbal 2',
  60: 'Hi Bongo',
  61: 'Low Bongo',
  62: 'Mute Hi Conga',
  63: 'Open Hi Conga',
  64: 'Low Conga',
  65: 'High Timbale',
  66: 'Low Timbale',
  67: 'High Agogo',
  68: 'Low Agogo',
  69: 'Cabasa',
  70: 'Maracas',
  71: 'Short Whistle',
  72: 'Long Whistle',
  73: 'Short Guiro',
  74: 'Long Guiro',
  75: 'Claves',
  76: 'Hi Wood Block',
  77: 'Low Wood Block',
  78: 'Mute Cuica',
  79: 'Open Cuica',
  80: 'Mute Triangle',
  81: 'Open Triangle'
};

// Roland GS extensions (notes 27-34 and 82-87)
export const GS_DRUM_MAP = {
  27: 'High Q',
  28: 'Slap',
  29: 'Scratch Push',
  30: 'Scratch Pull',
  31: 'Sticks',
  32: 'Square Click',
  33: 'Metronome Click',
  34: 'Metronome Bell',
  82: 'Shaker',
  83: 'Jingle Bell',
  84: 'Bell Tree',
  85: 'Castanets',
  86: 'Mute Surdo',
  87: 'Open Surdo'
};

// Combined drum map (GM + GS)
export const FULL_DRUM_MAP = { ...GS_DRUM_MAP, ...GM_DRUM_MAP };

// Note names for all 12 semitones
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Convert a MIDI note number to a standard note name (e.g., C4, D#5)
 * @param {number} midiNumber - MIDI note number (0-127)
 * @returns {string} Note name with octave
 */
export function getNoteName(midiNumber) {
  if (midiNumber < 0 || midiNumber > 127) {
    return `Note ${midiNumber}`;
  }
  const octave = Math.floor(midiNumber / 12) - 1;
  const noteIndex = midiNumber % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Get the GM percussion name for a MIDI note number
 * Returns null if not a GM percussion note
 * @param {number} midiNumber - MIDI note number
 * @returns {string|null} GM drum name or null
 */
export function getGMDrumName(midiNumber) {
  return GM_DRUM_MAP[midiNumber] || null;
}

/**
 * Get the full drum name (including GS extensions)
 * @param {number} midiNumber - MIDI note number
 * @returns {string|null} Drum name or null
 */
export function getDrumName(midiNumber) {
  return FULL_DRUM_MAP[midiNumber] || null;
}

/**
 * Get a display name for any MIDI note
 * Prefers GM drum name, falls back to note name
 * @param {number} midiNumber - MIDI note number
 * @returns {string} Human-readable name
 */
export function getDisplayName(midiNumber) {
  const drumName = getDrumName(midiNumber);
  const noteName = getNoteName(midiNumber);
  
  if (drumName) {
    return `${noteName} (${drumName})`;
  }
  return noteName;
}

/**
 * Convert a drum name to a safe filename
 * @param {string} name - Drum or note name
 * @returns {string} Filename-safe string
 */
export function toSafeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[#]/g, 'sharp')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '');
}

/**
 * Generate a full filename for a split MIDI file
 * Format: {MIDI#}_{NoteName}_{DrumName}.mid
 * @param {number} midiNumber - MIDI note number
 * @returns {string} Filename
 */
export function generateNoteFilename(midiNumber) {
  const noteName = getNoteName(midiNumber);
  const drumName = getDrumName(midiNumber);
  
  const safeNoteName = toSafeFilename(noteName);
  
  if (drumName) {
    const safeDrumName = toSafeFilename(drumName);
    return `${midiNumber}_${safeNoteName}_${safeDrumName}.mid`;
  }
  
  return `${midiNumber}_${safeNoteName}.mid`;
}

/**
 * Check if a MIDI note number is in the GM percussion range
 * @param {number} midiNumber - MIDI note number
 * @returns {boolean} True if in GM percussion range
 */
export function isGMPercussion(midiNumber) {
  return midiNumber >= 35 && midiNumber <= 81;
}

/**
 * Default groups for all GM drum sounds
 * Maps MIDI note numbers to logical group names
 * Every GM percussion note (35-81) has a group assignment
 */
export const DEFAULT_DRUM_GROUPS = {
  // Kick drums
  35: 'kick',       // Acoustic Bass Drum
  36: 'kick',       // Bass Drum 1
  
  // Snares & related
  37: 'sidestick',  // Side Stick
  38: 'snare',      // Acoustic Snare
  39: 'clap',       // Hand Clap
  40: 'snare',      // Electric Snare
  
  // Floor Toms
  41: 'floortom',   // Low Floor Tom
  43: 'floortom',   // High Floor Tom
  
  // Hi-hats
  42: 'hihat',      // Closed Hi-Hat
  44: 'hihat',      // Pedal Hi-Hat
  46: 'hihat',      // Open Hi-Hat
  
  // Low Tom
  45: 'lowtom',     // Low Tom
  
  // Mid Toms
  47: 'midtom',     // Low-Mid Tom
  48: 'midtom',     // Hi-Mid Tom
  
  // Crash Cymbals
  49: 'cymbal1',    // Crash Cymbal 1
  57: 'cymbal2',    // Crash Cymbal 2
  
  // High Tom
  50: 'hightom',    // High Tom
  
  // Ride Cymbals
  51: 'ride1',      // Ride Cymbal 1
  53: 'ridebell',   // Ride Bell
  59: 'ride2',      // Ride Cymbal 2
  
  // Other Cymbals
  52: 'china',      // Chinese Cymbal
  55: 'splash',     // Splash Cymbal
  
  // Percussion
  54: 'tambourine', // Tambourine
  56: 'cowbell',    // Cowbell
  58: 'vibraslap',  // Vibraslap
  
  // Bongos
  60: 'bongo',      // Hi Bongo
  61: 'bongo',      // Low Bongo
  
  // Congas
  62: 'conga',      // Mute Hi Conga
  63: 'conga',      // Open Hi Conga
  64: 'conga',      // Low Conga
  
  // Timbales
  65: 'timbale',    // High Timbale
  66: 'timbale',    // Low Timbale
  
  // Agogo
  67: 'agogo',      // High Agogo
  68: 'agogo',      // Low Agogo
  
  // Shakers & similar
  69: 'cabasa',     // Cabasa
  70: 'maracas',    // Maracas
  
  // Whistles
  71: 'whistle',    // Short Whistle
  72: 'whistle',    // Long Whistle
  
  // Guiro
  73: 'guiro',      // Short Guiro
  74: 'guiro',      // Long Guiro
  
  // Wood & Misc
  75: 'claves',     // Claves
  76: 'woodblock',  // Hi Wood Block
  77: 'woodblock',  // Low Wood Block
  78: 'cuica',      // Mute Cuica
  79: 'cuica',      // Open Cuica
  80: 'triangle',   // Mute Triangle
  81: 'triangle'    // Open Triangle
};

/**
 * Get the default group for a MIDI note
 * @param {number} midiNumber - MIDI note number
 * @returns {string|null} Default group name or null
 */
export function getDefaultGroup(midiNumber) {
  return DEFAULT_DRUM_GROUPS[midiNumber] || null;
}
