# MIDI Drum Splitter - Implementation Plan

## Project Overview

A client-side web application that splits a multi-note MIDI drum track into separate MIDI files, one per note pitch. The app runs completely offline as a GitHub Pages site.

## Status: Complete

All core features have been implemented.

## Technical Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| MIDI Parsing/Writing | `@tonejs/midi` (vendored) | Well-maintained, handles both read/write, browser-compatible |
| UI Framework | Vanilla HTML/CSS/JavaScript | Simplest for offline GitHub Pages, no build step required |
| ZIP Creation | JSZip (vendored) | For downloading multiple MIDI files as a ZIP |
| Styling | Custom CSS with variables | Slate/emerald professional theme |

## Implemented Features

### Core Functionality
- [x] Upload MIDI file (drag & drop or file picker, .mid and .midi)
- [x] Analyze MIDI - detect all unique note pitches with counts
- [x] Display analysis table with selection, counts, and group editing
- [x] Split by note - create separate MIDI files per pitch
- [x] Combine by group - merge notes with same group name
- [x] Download as ZIP (individual, groups only, or organized with folders)

### Drum Mapping
- [x] GM percussion names (notes 35-81)
- [x] GS extension names (notes 27-34, 82-87)
- [x] Default group assignments for all GM drums
- [x] Separate groups for toms (floor, low, mid, high)
- [x] Separate groups for cymbals (cymbal1, cymbal2, ride1, ride2, ridebell)

### UI/UX
- [x] Dark theme with slate/emerald color scheme
- [x] Responsive design (mobile-friendly)
- [x] Row highlighting on hover
- [x] Toast notifications for success/error
- [x] Loading states during processing
- [x] Select all/none functionality

## Architecture

```
midi-drum-splitter/
├── index.html           # Main app entry point
├── css/
│   └── styles.css       # App styling (CSS variables)
├── js/
│   ├── app.js           # Main application logic & state
│   ├── midi-parser.js   # MIDI parsing logic
│   ├── midi-splitter.js # Split & combine logic
│   ├── gm-drums.js      # GM percussion mapping & default groups
│   ├── ui.js            # UI interactions
│   └── export.js        # ZIP creation & download
├── lib/                 # Vendored libraries (for offline use)
│   ├── Midi.js          # @tonejs/midi UMD bundle
│   └── jszip.min.js     # JSZip for ZIP creation
├── test/                # Test MIDI files (gitignored)
├── AGENT.md             # Agent instructions
├── README.md            # User documentation
└── PLAN.md              # This plan document
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. User uploads MIDI file                                       │
│     └── File API -> ArrayBuffer                                  │
├─────────────────────────────────────────────────────────────────┤
│  2. Parse MIDI                                                   │
│     └── @tonejs/midi parses into structured data                 │
├─────────────────────────────────────────────────────────────────┤
│  3. Analyze unique notes                                         │
│     └── Group notes by pitch, count occurrences                  │
│     └── Apply default GM drum groups                             │
├─────────────────────────────────────────────────────────────────┤
│  4. Display analysis to user                                     │
│     └── Table: Select | MIDI # | Note | Name | Count | Group    │
├─────────────────────────────────────────────────────────────────┤
│  5. User customizes selections and groups                        │
│     └── Toggle note selection, edit group names                  │
├─────────────────────────────────────────────────────────────────┤
│  6. Split/combine based on user choices                          │
│     └── Create new MIDI objects with filtered notes              │
│     └── Use time-based placement (PPQ is read-only)              │
├─────────────────────────────────────────────────────────────────┤
│  7. Package & Download                                           │
│     └── Create ZIP with JSZip (flat or organized folders)        │
│     └── Trigger browser download                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Naming Convention

Split files use a combined format:
- `{MIDI#}_{NoteName}_{DrumName}.mid`
- Example: `36_c2_bass_drum_1.mid`
- Example: `42_fsharp2_closed_hi_hat.mid`

Group files use the group name:
- `{groupname}.mid`
- Example: `kick.mid`, `hihat.mid`

## Key Design Decisions

1. **All tracks processed** - Not just channel 10, to handle non-standard drum mappings
2. **Combined naming format** - Includes MIDI number, note name, and GM drum name
3. **Preserve original timing/velocity** - No normalization, exact reproduction
4. **Offline-first** - All libraries vendored, no CDN dependencies
5. **No build step** - Plain ES6 modules, works directly in browser
6. **Time-based note placement** - Works around @tonejs/midi read-only PPQ
7. **Default groups for all GM drums** - No empty groups, sensible defaults
8. **DAW-ready output** - All split files preserve original duration for perfect alignment
9. **PPQ scaling** - Tempo/time signature tick values scaled proportionally when copying header info

## Technical Solutions

### PPQ Scaling
The `@tonejs/midi` library always creates new MIDI objects with PPQ=480, but source files may have different PPQ values. When copying tempo events and time signatures, tick positions are scaled:

```javascript
newTicks = Math.round(sourceTicks * (targetPPQ / sourcePPQ))
```

### Duration Preservation
All split files have the same duration as the original by adding a CC 121 (Reset All Controllers) event at the end time. This is necessary because @tonejs/midi ignores `endOfTrackTicks` during encoding. The CC event acts as an invisible marker that extends the track without affecting playback.

## Known Limitations

- `@tonejs/midi` has read-only `header.ppq` - cannot set arbitrary PPQ values
- New MIDI objects always have PPQ=480 (handled via tick scaling)
- `@tonejs/midi` ignores `endOfTrackTicks` during encoding (handled via CC marker)

## Future Enhancements

- [ ] Audio preview using Web Audio API
- [ ] Custom drum mapping presets (save/load to localStorage)
- [ ] Batch processing multiple files
- [ ] MIDI channel filtering
- [ ] Velocity filtering (exclude ghost notes)
- [ ] Export to other formats (JSON, CSV)
