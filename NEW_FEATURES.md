# Gazealytics — New Features (Development Branch)

This document describes the features and enhancements added on top of the upstream [gazealytics/gazealytics-master](https://github.com/gazealytics/gazealytics-master) release.

---

## 1. Enhanced Notes System

The notes panel has been substantially redesigned. Notes are no longer just free-text annotations — they are now structured observations with richer metadata and visibility controls.

### New note fields
| Field | Description |
|-------|-------------|
| **Type** | Category of the note — `general`, `technical`, `alarms`, or `others`. Imported from TSV; manually selectable for hand-entered notes. |
| **Note Taker / Observer** | Name of the person who recorded the note. Imported from TSV; manually entered for hand-created notes. |
| **Timestamp** | When the event occurred, in `hh:mm:ss:ms` format. Relative to the session start time. |
| **Participant** | Which participant/dataset the note belongs to. |

### Per-note controls
Each note in the list now has:
- **Lock / Unlock** — freeze the note so it cannot be accidentally edited
- **Spatial visibility toggle** — show or hide the note marker on the spatial canvas
- **Timeline visibility toggle** — show or hide the note's bookmark on the timeline canvas
- **Delete** button

### Manual note creation
Notes can still be created manually from the spatial canvas. When created manually, the type, observer, and timestamp fields are presented as editable inputs rather than read-only labels.

---

## 2. Notes Import from TSV

A **Load .tsv** button appears in the Notes tab (enabled once samples have been loaded). Clicking it opens a file picker and imports notes from a tab-separated values file.

The expected TSV column layout is:

| Col | Field |
|-----|-------|
| 0 | Session start date |
| 1 | Session start time |
| 4 | Observer (note taker) |
| 6 | Event occurred date |
| 7 | Event occurred time |
| 9 | Event details / content |
| 10 | Event type |
| 11 | Participant ID |

The importer:
- Calculates each note's timestamp as the elapsed time from session start to the event occurrence
- Groups notes by participant and matches them to loaded datasets
- Collects all distinct note types for use in the filter dropdown

Sample data is available at the link in the original README under "Time-based notes".

---

## 3. Timeline Bookmark Buttons

Notes that have a valid timestamp and are set to be visible on the timeline are rendered as **bookmark buttons** directly overlaid on the timeline canvas.

- Each bookmark is positioned at the correct time offset within the selected TWI
- Notes occurring within 5% of the TWI duration of each other are **grouped** into a single button; a count badge appears on the group
- The button color reflects the observer who recorded the note (see Section 5)
- A vertical black line is drawn on the canvas at the same x position
- Toggling a TWI's visibility (eye icon on the TWI row) removes its bookmarks from the timeline

---

## 4. Note Filtering and Color Coding

The Notes panel in the control sidebar now has three filter/color dropdowns:

### Filter by Type
A dropdown is populated dynamically from the types found in the imported TSV (or the four built-in types). Selecting a type hides notes of other types on the timeline.

### Filter by Sample
A dropdown lets you restrict visible bookmarks to a single participant/dataset.

### Colour mode
Three coloring options are available via a radio group:

| Option | Effect |
|--------|--------|
| **Default** | All note draggers shown in neutral gray |
| **Note Taker** | Each observer gets a distinct color from the `OBSERVERS` palette |
| **Note Type** | Each type gets a distinct color from the event color map |

The color indicator appears as a colored stripe (dragger) on the left side of each note list item.

---

## 5. Observer Color Palette

Eight observer color slots (`obsv_0` through `obsv_7`) are now shown in the **Colouring** tab. Their default values are a ColorBrewer qualitative palette:

```
#8dd3c7  #ffffb3  #bebada  #fb8072
#80b1d3  #fdb462  #b3de69  #fccde5
```

Each slot has a color picker so you can reassign colors. Changes are applied immediately to timeline bookmarks and note list draggers.

---

## 6. Video Coordinate Tracking (`VidRectLens`)

A new lens type — `VidRectLens` — is a rectangle that can be programmatically repositioned each frame. It is used to visualize a region of interest that moves through the stimulus in sync with a video.

### Loading video coordinates
A **Load Video Coords** button is added to the video panel. It accepts a `.tsv` file with the following columns:

```
timestamp	x1	y1	x2	y2
```

Each row defines the bounding box for one video frame (or time step). `x1/y1` is the top-left corner and `x2/y2` is the bottom-right corner, in stimulus-space coordinates.

### Behavior
- As the time animation slider advances (or plays), `currVidLens` moves to the coordinates corresponding to the current `TIME_ANIMATE` position
- The lens rectangle is rendered on the spatial canvas with a semi-transparent white fill
- When selected and unlocked, resize handles (crosshair lines) are drawn at the edges
- The lens can be toggled visible/invisible

---

## 7. Video Trimming and Export

A `download_video()` function (powered by [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)) lets you trim the loaded video to the currently selected TWI and download it as an MP4.

- The output is clipped to the TWI's `real_range` start and end times
- Forced to 30 fps (required for stream-copy to work correctly in FFmpeg.wasm)
- The output filename is taken from the dataset name
- Processing runs entirely in the browser — no server round-trip is needed

---

## 8. Timeline Screenshot Export (html2canvas)

An `exportCombinedCanvas()` function captures the timeline panel — including the HTML bookmark button overlays that sit on top of the p5.js canvas — and downloads the result as a JPEG.

This uses the [html2canvas](https://html2canvas.hertzen.com/) library, which is bundled as `html2canvas.min.js`.

> Note: this feature is currently wired up but not yet exposed to a UI button. It can be called from the browser console as `exportCombinedCanvas()`.

---

## 9. Helper Utilities (`helpers.js`)

A new `helpers.js` module provides shared date/time utilities used by the notes importer and the timestamp display:

| Function | Description |
|----------|-------------|
| `calculateTimeDifference(dateStr1, dateStr2)` | Returns elapsed time between two date strings as `hh:mm:ss:ms` |
| `calculateTimeDifferenceInMs(dateStr1, dateStr2)` | Returns elapsed time in milliseconds |
| `convertToMilliseconds(timestamp)` | Converts `hh:mm:ss:ms` string to milliseconds |

Input date strings are expected in `dd/mm/yyyy hh:mm:ss` format (as produced by common eye tracking export tools).

---

## 10. TWI Visibility Toggle

Each TWI row in the data panel now includes an **eye icon** button. Clicking it:
- Toggles the show/hide state of all bookmark buttons associated with that TWI
- Resets the matrix sort order to "No sort"
- Refreshes matrix and timeline views

---

## New Files

| File | Purpose |
|------|---------|
| `helpers.js` | Shared date/time utility functions |
| `ffmpeg.min.js` | FFmpeg WebAssembly build for in-browser video trimming |
| `html2canvas.min.js` | html2canvas library for timeline screenshot export |
| `hierarchy.html` | AOI hierarchy editor view (in development) |

---

## Dependencies Added

| Library | Source | Use |
|---------|--------|-----|
| Font Awesome 6 | CDN | Icons throughout the notes panel UI |
| FFmpeg.wasm | Bundled (`ffmpeg.min.js`) | In-browser video trimming |
| html2canvas | Bundled (`html2canvas.min.js`) | Timeline screenshot export |
