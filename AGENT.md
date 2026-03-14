# MIDI Drum Splitter - Agent Instructions

This document provides instructions for AI agents working on this codebase.

## Project Overview

A client-side web application that splits MIDI drum tracks by note pitch. The app runs offline as a GitHub Pages site with no build step required.

## Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6 modules)
- **MIDI Library**: @tonejs/midi (vendored in `/lib/Midi.js`)
- **ZIP Library**: JSZip (vendored in `/lib/jszip.min.js`)
- **Styling**: Custom CSS with CSS variables (slate/emerald theme)
- **No build tools**: Direct browser execution

## Project Structure

```
midi-drum-splitter/
├── index.html           # Main entry point - loads libraries and app module
├── css/
│   └── styles.css       # All styling (CSS variables, responsive design)
├── js/
│   ├── app.js           # Main app initialization and state management
│   ├── midi-parser.js   # MIDI file parsing using @tonejs/midi
│   ├── midi-splitter.js # Logic to split/combine MIDI by note
│   ├── gm-drums.js      # GM drum mappings and default groups
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
- Main application state (loaded MIDI, analysis results, selections, groups)
- Coordinates between UI, parser, splitter, and exporter
- Handles file selection, download button clicks
- Entry point initialized on DOMContentLoaded

### js/midi-parser.js
- `parseMidi(arrayBuffer)` - Parse MIDI file into @tonejs/midi object
- `analyzeMidi(midi)` - Extract unique notes with counts, velocity stats
- `getMidiInfo(midi)` - Get basic file info (duration, tracks, tempo)
- `filterNotesByPitch(midi, midiNumbers)` - Filter notes by pitch

### js/midi-splitter.js
- `splitByNote(midi, midiNumber)` - Create MIDI with only one note pitch
- `combineNotes(midi, midiNumbers, name)` - Create MIDI with multiple notes
- `splitAllNotes(midi, selectedNotes)` - Split into separate files per note
- `splitByGroups(midi, groups)` - Split based on group assignments
- `midiToArray(midi)` - Convert to Uint8Array for download
- `copyHeaderInfo(source, target)` - Copy tempo/time signatures with PPQ scaling
- `ensureTrackDuration(track, seconds)` - Add CC event to extend track length
- Note: Uses time-based note placement (PPQ is read-only in @tonejs/midi)
- Note: Preserves original MIDI duration via CC 121 marker event

### js/gm-drums.js
- `GM_DRUM_MAP` - MIDI notes 35-81 to GM percussion names
- `GS_DRUM_MAP` - Roland GS extensions (27-34, 82-87)
- `DEFAULT_DRUM_GROUPS` - Default group assignments for all GM drums
- `getNoteName(midiNumber)` - Convert to note name (C4, D#5, etc.)
- `getDrumName(midiNumber)` - Get percussion name
- `getDefaultGroup(midiNumber)` - Get default group assignment
- `generateNoteFilename(midiNumber)` - Create filename like `36_c2_bass_drum_1.mid`
- `toSafeFilename(name)` - Sanitize strings for filenames

### js/ui.js
- `initFileUpload(dropZone, fileInput, callback)` - Drag & drop and file input
- `renderFileInfo(container, info)` - Display file metadata
- `renderAnalysisTable(container, notes, state, callbacks)` - Build note table
- `renderGroupsSummary(container, noteGroups, notes)` - Show group assignments
- `updateExportButtons(buttons, state)` - Enable/disable based on selections
- `showLoading/showError/showSuccess` - Toast notifications
- Includes XSS protection via `escapeHtml()`

### js/export.js
- `createZip(files)` - Bundle MIDI files into ZIP blob
- `downloadZip(files, zipName)` - Create and trigger ZIP download
- `downloadMidi(midi, filename)` - Download single MIDI file
- `createOrganizedZip(splitFiles, groups, groupFiles)` - ZIP with folders
- `downloadOrganizedZip(...)` - Download organized ZIP

## Default Group Assignments

All GM percussion notes have default groups:

| Group | MIDI Notes |
|-------|------------|
| kick | 35, 36 |
| snare | 38, 40 |
| sidestick | 37 |
| clap | 39 |
| hihat | 42, 44, 46 |
| floortom | 41, 43 |
| lowtom | 45 |
| midtom | 47, 48 |
| hightom | 50 |
| cymbal1 | 49 |
| cymbal2 | 57 |
| ride1 | 51 |
| ride2 | 59 |
| ridebell | 53 |
| china | 52 |
| splash | 55 |
| (etc.) | ... |

## Common Tasks

### Adding a new GM drum sound
Edit `js/gm-drums.js`:
```javascript
// Add to GM_DRUM_MAP or GS_DRUM_MAP
export const GM_DRUM_MAP = {
  // ... existing entries
  82: 'Shaker',
};

// Add default group
export const DEFAULT_DRUM_GROUPS = {
  // ... existing entries
  82: 'shaker',
};
```

### Modifying the file naming format
Edit `js/gm-drums.js` in the `generateNoteFilename` function.

### Changing the color theme
Edit CSS variables in `css/styles.css`:
```css
:root {
  --color-bg: #0f172a;
  --color-primary: #10b981;
  /* etc. */
}
```

### Adding UI elements
1. Add HTML to `index.html`
2. Add styling to `css/styles.css`
3. Add event handlers in `js/ui.js`
4. Wire up in `js/app.js`

## Testing

1. Open `index.html` in a browser (or use local server)
2. Upload a MIDI file from `test/` directory
3. Verify analysis table shows correct notes with default groups
4. Test all three export options

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
5. **@tonejs/midi quirks**:
   - `header.ppq` is read-only (always 480 for new MIDI objects)
   - Use time-based note placement (seconds), not ticks
   - When copying tempo/time signatures, scale tick values proportionally
6. **DAW alignment** - All split files preserve original duration via `endOfTrackTicks`

## MIDI Technical Details

- MIDI note numbers: 0-127
- Drum channel: Usually channel 10 (9 in 0-indexed)
- GM percussion range: Notes 35-81
- PPQ (Pulses Per Quarter): Timing resolution (typically 480)

### PPQ Scaling

When copying header info (tempo events, time signatures) from a source MIDI to a new MIDI, tick values must be scaled proportionally because the source and target may have different PPQ values:

```javascript
// Source MIDI might have PPQ of 960, new MIDI always has 480
const scaleFactor = targetPPQ / sourcePPQ;
const newTicks = Math.round(sourceTicks * scaleFactor);
```

This ensures tempo changes and time signatures occur at the correct positions in the output files.

### Duration Preservation

The @tonejs/midi library does **not** use `endOfTrackTicks` when encoding to binary. The end-of-track event is simply placed immediately after the last note/event.

To ensure all split files have the same duration as the original (for DAW alignment), we add a control change event at the end time:

```javascript
// CC 121 (Reset All Controllers) with value 0 is a no-op marker
track.addCC({
  number: 121,
  time: sourceDurationSeconds,
  value: 0
});
```

This extends the track to match the source duration without affecting playback.

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
  });
});

// Create new MIDI
const newMidi = new Midi();
newMidi.header.setTempo(120);  // Use setTempo, not direct assignment
const track = newMidi.addTrack();
track.channel = 9;  // Drum channel
track.addNote({ midi: 36, time: 0, duration: 0.5, velocity: 0.8 });

// Export to binary
const uint8Array = newMidi.toArray();
```

## Troubleshooting

### "Midi is not defined"
- Ensure `lib/Midi.js` is loaded before app scripts in index.html
- Check browser console for 404 errors

### Notes not appearing in analysis
- Check if MIDI file has multiple tracks (all tracks are processed)
- Non-GM notes will show note name only (no drum name)

### ZIP download not working
- Check JSZip is loaded correctly
- Verify browser supports Blob downloads

### Read-only property error
- Don't assign to `midi.header.ppq` - it's read-only
- Use `midi.header.setTempo()` for tempo changes
