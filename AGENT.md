# MIDI Drum Splitter - Agent Instructions

This document provides instructions for AI agents working on this codebase.

## Project Overview

A client-side web application that splits MIDI drum tracks by note pitch. The app is designed to run offline as a GitHub Pages site with no build step required.

## Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6 modules)
- **MIDI Library**: @tonejs/midi (vendored in `/lib/Midi.js`)
- **ZIP Library**: JSZip (vendored in `/lib/jszip.min.js`)
- **No build tools**: Direct browser execution

## Project Structure

```
midi-drum-splitter/
├── index.html           # Main entry point - loads all modules
├── css/
│   └── styles.css       # All styling
├── js/
│   ├── app.js           # Main app initialization and state management
│   ├── midi-parser.js   # MIDI file parsing using @tonejs/midi
│   ├── midi-splitter.js # Logic to split/combine MIDI by note
│   ├── gm-drums.js      # General MIDI drum name mappings
│   ├── ui.js            # DOM manipulation and event handling
│   └── export.js        # ZIP creation and file download
├── lib/
│   ├── Midi.js          # @tonejs/midi UMD bundle
│   └── jszip.min.js     # JSZip library
├── test/                # Test MIDI files (gitignored)
├── AGENT.md             # This file
├── README.md            # User documentation
└── PLAN.md              # Implementation plan
```

## Key Files Explained

### js/app.js
- Main application state (loaded MIDI, analysis results, groups)
- Coordinates between UI, parser, and exporter
- Entry point for the application

### js/midi-parser.js
- `parseMidi(arrayBuffer)` - Parse MIDI file into structured data
- `analyzeNotes(midi)` - Extract unique notes with counts

### js/midi-splitter.js
- `splitByNote(midi, noteNumber)` - Create MIDI with only one note
- `combineNotes(midi, noteNumbers)` - Create MIDI with multiple notes
- Preserves tempo, time signature, and original timing

### js/gm-drums.js
- `GM_DRUM_MAP` - Object mapping MIDI note numbers to drum names
- `getNoteName(midiNumber)` - Convert MIDI number to note name (C4, D#5, etc.)
- `getDrumName(midiNumber)` - Get GM percussion name or generic note name

### js/ui.js
- `initUI()` - Set up drag & drop, file input handlers
- `renderAnalysis(analysis)` - Build the analysis table
- `updateGroups(groups)` - Refresh group management UI

### js/export.js
- `createZip(files)` - Bundle multiple MIDI files into ZIP
- `downloadZip(zip, filename)` - Trigger browser download
- `generateFilename(noteInfo)` - Create descriptive filenames

## Common Tasks

### Adding a new GM drum sound
Edit `js/gm-drums.js` and add to the `GM_DRUM_MAP` object:
```javascript
export const GM_DRUM_MAP = {
  // ... existing entries
  82: 'Shaker',  // Add new entry
};
```

### Modifying the file naming format
Edit `js/export.js` in the `generateFilename` function:
```javascript
export function generateFilename(noteInfo) {
  // Current format: 36_C2_bass_drum_1.mid
  // Modify the template string as needed
}
```

### Adding UI elements
1. Add HTML to `index.html`
2. Add styling to `css/styles.css`
3. Add event handlers in `js/ui.js`

### Changing MIDI processing
- Parsing: `js/midi-parser.js`
- Splitting/combining: `js/midi-splitter.js`

## Testing

1. Open `index.html` in a browser (or use local server)
2. Upload a MIDI file from `test/` directory
3. Verify analysis table shows correct notes
4. Test export functionality

For local development:
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

## Important Notes

1. **No build step** - All JavaScript uses ES6 modules loaded directly by browser
2. **Vendored libraries** - Do not use CDN links; keep libraries in `/lib/`
3. **Offline-first** - App must work without internet connection
4. **GitHub Pages compatible** - No server-side processing

## MIDI Technical Details

- MIDI note numbers: 0-127
- Drum channel: Usually channel 10 (9 in 0-indexed)
- GM percussion range: Notes 35-81
- PPQ (Pulses Per Quarter): Timing resolution (typically 480)

## @tonejs/midi API Quick Reference

```javascript
// Parse MIDI
const midi = new Midi(arrayBuffer);

// Access tracks
midi.tracks.forEach(track => {
  track.notes.forEach(note => {
    // note.midi - MIDI note number (0-127)
    // note.time - Start time in seconds
    // note.duration - Duration in seconds
    // note.velocity - 0-1
    // note.ticks - Start time in ticks
    // note.durationTicks - Duration in ticks
  });
});

// Create new MIDI
const newMidi = new Midi();
const track = newMidi.addTrack();
track.addNote({ midi: 36, time: 0, duration: 0.5, velocity: 0.8 });

// Export to binary
const arrayBuffer = newMidi.toArray();
```

## Troubleshooting

### "Midi is not defined"
- Ensure `lib/Midi.js` is loaded before app scripts
- Check browser console for 404 errors

### Notes not appearing in analysis
- Check if MIDI file has multiple tracks
- Verify channel numbers (drum channel is 9/10)

### ZIP download not working
- Check JSZip is loaded correctly
- Verify browser supports Blob downloads
