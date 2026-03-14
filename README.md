# MIDI Drum Splitter

A web application that splits MIDI drum tracks by note pitch. Perfect for separating multi-instrument drum MIDI files into individual tracks for each drum sound.

## Features

- **Upload any MIDI file** - Drag & drop or click to browse (.mid and .midi supported)
- **Automatic analysis** - Detects all unique note pitches with counts
- **GM Drum names** - Shows General MIDI percussion names for notes 35-81
- **Default grouping** - All GM drums pre-assigned to logical groups (kick, snare, hihat, etc.)
- **Flexible grouping** - Customize groups or combine multiple notes
- **DAW-ready export** - All split files have the same duration as the original for perfect alignment
- **Batch export** - Download individual files, groups only, or both as a ZIP archive
- **100% offline** - Runs entirely in your browser, no server required

## Usage

### Basic Workflow

1. **Open the app** - Visit the GitHub Pages URL or open `index.html` locally
2. **Upload a MIDI file** - Drag & drop or click the upload area
3. **Review the analysis** - See all detected notes with their counts and default groups
4. **Select notes to export** - Use checkboxes to include/exclude notes
5. **Customize groups (optional)** - Edit group names to combine related notes
6. **Download** - Choose from three export options:
   - **Individual Notes** - One MIDI file per selected note
   - **Groups Only** - One MIDI file per unique group
   - **All (Organized)** - Both individual and grouped files in folders

### DAW Integration

All exported MIDI files preserve:
- **Original duration** - Every file has the same length as the source MIDI, so tracks align perfectly when imported into your DAW
- **Tempo changes** - All tempo events are preserved at their correct positions
- **Time signatures** - Time signature changes are maintained
- **Note timing** - Notes remain at their exact original positions

Simply drag all split files into your DAW and they'll line up perfectly, even if an instrument only plays once in the middle of the song.

### File Naming

Split files are named using a combined format for clarity:
- `{MIDI#}_{NoteName}_{DrumName}.mid`
- Example: `36_c2_bass_drum_1.mid`
- Example: `42_fsharp2_closed_hi_hat.mid`

### Default Groups

All GM percussion notes come pre-assigned to logical groups:

| Group | Notes |
|-------|-------|
| kick | 35, 36 |
| snare | 38, 40 |
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
| ... | (and more) |

### Grouping Notes

To combine multiple notes into a single MIDI file:

1. In the analysis table, set the same group name for related notes
2. For example, set notes 42, 44, and 46 to group "hihat"
3. Click "Download Groups Only" or "Download All" to get combined files

## General MIDI Drum Map

The app recognizes GM percussion notes (35-81):

| Note | Sound | Note | Sound |
|------|-------|------|-------|
| 35 | Acoustic Bass Drum | 51 | Ride Cymbal 1 |
| 36 | Bass Drum 1 | 52 | Chinese Cymbal |
| 37 | Side Stick | 53 | Ride Bell |
| 38 | Acoustic Snare | 54 | Tambourine |
| 39 | Hand Clap | 55 | Splash Cymbal |
| 40 | Electric Snare | 56 | Cowbell |
| 41 | Low Floor Tom | 57 | Crash Cymbal 2 |
| 42 | Closed Hi-Hat | 58 | Vibraslap |
| 43 | High Floor Tom | 59 | Ride Cymbal 2 |
| 44 | Pedal Hi-Hat | 60 | Hi Bongo |
| 45 | Low Tom | 61 | Low Bongo |
| 46 | Open Hi-Hat | 62 | Mute Hi Conga |
| 47 | Low-Mid Tom | 63 | Open Hi Conga |
| 48 | Hi-Mid Tom | 64 | Low Conga |
| 49 | Crash Cymbal 1 | 65-81 | Latin percussion |
| 50 | High Tom | | |

## Running Locally

No build step required! Simply:

```bash
# Clone the repository
git clone https://github.com/dansailer/midi-drum-splitter.git

# Open in browser (macOS)
open index.html

# Or use a local server
python -m http.server 8000
# then visit http://localhost:8000
```

## Technical Details

- **Pure client-side** - All processing happens in your browser
- **No dependencies on CDNs** - Libraries are vendored for offline use
- **ES6 modules** - Modern JavaScript, no transpilation needed
- **Works on GitHub Pages** - Deploy directly from your repository

### Libraries Used

- [@tonejs/midi](https://github.com/Tonejs/Midi) - MIDI parsing and writing
- [JSZip](https://stuk.github.io/jszip/) - ZIP file creation

## Browser Compatibility

Works in all modern browsers:
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

## License

MIT License - feel free to use, modify, and distribute.

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
