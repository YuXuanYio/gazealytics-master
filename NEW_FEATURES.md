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

---

## 11. AOI Groups (Lens Groups)

Each AOI on the spatial canvas belongs to a numbered **group**. The group number is set via a small numeric input (`1`–`30`) in the AOI list entry.

### What groups do
- All AOIs in the same group share a color drawn from the `LENS_COLOURS` palette (group 1 → index 0, group 2 → index 1, …)
- Selecting an AOI automatically highlights every AOI in the same group on the spatial canvas
- **Group Labels** can be toggled on/off independently of individual AOI name labels (see Section 13)

### Group-level metrics
`metrics.js` computes a parallel set of statistics for lens groups alongside the per-AOI metrics:

| Metric | Description |
|--------|-------------|
| `lensegroup_lenscount` | Fixation count per group |
| `lensegroup_lenstime` | Total dwell time per group |
| `lensegroup_direct_transitions` | Direct transition counts between groups |
| `lensegroup_indirect_transitions` | Indirect transition counts between groups |
| `lensegroup_triples` | Transition triple counts |
| `lensegroup_visit_durations` | Visit duration distributions per group |

### Matrix view states for groups
The matrix can be switched into any view that has `lensegroup` as a row or column axis:

| State | Rows | Columns |
|-------|------|---------|
| `lensegroup_lensegroup` | AOI Groups | AOI Groups |
| `dat_lensegroup` | Datasets | AOI Groups |
| `toi_lensegroup` | TWIs | AOI Groups |
| `twigroup_lensegroup` | TWI Groups | AOI Groups |
| `grp_lensegroup` | Participant Groups | AOI Groups |

Hovering on a group row/column in the matrix highlights the corresponding AOIs on the spatial canvas.

---

## 12. Temporal AOIs

Any AOI can be made **temporal** — active only within one or more time ranges relative to the session.

### Making an AOI temporal
Click the **clock** button (<i class="fas fa-clock"></i>) on the AOI list entry. A green clock icon indicates the AOI is currently temporal.

### Time rows
When temporal mode is on, time-range rows appear below the AOI entry:
- Each row has a **start time** and **end time** input (format `H:MM:SS.ms`)
- Additional time ranges can be added with **Add Time Row**; individual rows can be removed
- Multiple non-overlapping ranges are supported on a single AOI

### Runtime behavior
- As the animation slider is scrubbed (or the video plays), `handleAOITimeChange()` is called every frame
- Each temporal AOI checks whether the current time falls inside any of its ranges and shows or hides itself accordingly
- The spatial canvas redraws automatically

### Filtering
A **Filter AOIs** dropdown in the AOI controls area lets you restrict the AOI list (and spatial canvas) to:

| Option | Effect |
|--------|--------|
| Show all AOIs | Default — all AOIs visible |
| Show only temporal AOIs | Hides non-temporal AOIs |
| Show only non-temporal AOIs | Hides temporal AOIs |

---

## 13. AOI Label Visibility Toggles

Two toggle buttons appear above the AOI list on the spatial canvas toolbar:

| Button | Effect |
|--------|--------|
| **All Labels** | Show or hide every individual AOI name label drawn inside the lens |
| **Group Labels** | Show or hide the "Group N" label drawn at the AOI centroid |

Both buttons are active (`toggle-on`) by default and update the canvas immediately on click.

---

## 14. AOI Hierarchy (Screen / App / Interface)

Each AOI carries three optional hierarchy fields:

| Field | Input ID | Description |
|-------|----------|-------------|
| **Screen ID** | `lens_#_screen_id` | Which screen/display the AOI belongs to |
| **App ID** | `lens_#_app_id` | Which application within that screen |
| **Interface ID** | `lens_#_interface_id` | Which interface or view within that app |

Values are entered as integers in the AOI properties panel and saved by clicking the checkmark button.

### Hierarchy popup (`hierarchy.html`)
A **Show Hierarchy** button (in the spatial canvas toolbar) opens `hierarchy.html` in a small popup window (`600 × 400 px`). The popup:
- Displays all AOIs as a collapsible tree: **Screen → App → Interface → AOI**
- Provides a **Filter by Screen** dropdown to narrow the tree
- Provides a **Colour by** radio group (Screen / App / Interface) that recolors nodes in the tree
- Highlighted AOIs (from `setHighlightedLenses()`) are marked with a yellow stripe in the tree

---

## 15. AOI Duplication

A **Duplicate** button (<i class="far fa-copy"></i>) appears on each AOI list entry. Clicking it:
- Instantiates a new AOI of the same type (`PolyLens`, `EllipseLens`, or `RectLens`) with the same vertices/bounds
- Copies the group, hierarchy IDs, and temporal ranges from the original
- Appends the new entry to the AOI list and assigns it the next available ID

---

## 16. AOI Colouring Modes

The **Colouring** tab now has two AOI colouring sub-modes selected via radio buttons:

| Mode | Dragger color | Spatial canvas color |
|------|---------------|----------------------|
| **By AOI** | `LENS_COLOURS[aoi_index]` | Each AOI gets a unique color based on its list position |
| **By Group** | `LENS_COLOURS[group − 1]` | All AOIs in the same group share one color |

Switching modes hides/shows the corresponding color-picker controls (`aoi_color_controls` vs `aoi_color_group_controls`).

The `LENS_COLOURS` array is a 60-slot palette (two repetitions of a 30-color ColorBrewer qualitative sequence) whose individual entries can be edited via color pickers in the Colouring tab.

---

## 17. TWI Groups and Extended Matrix View States

TWIs can be assigned to named **groups** (`base_twis[i].group`). This unlocks additional matrix axes:

| TWI group axis value | Description |
|----------------------|-------------|
| `twigroup_aoi` | TWI Groups × AOIs |
| `twigroup_dat` | TWI Groups × Datasets |
| `twigroup_toi` | TWI Groups × TWIs |
| `twigroup_lensegroup` | TWI Groups × AOI Groups |
| `twigroup_grp` | TWI Groups × Participant Groups |

The full set of `MATRIX_VIEW_STATE` values now also includes `grp_twigroup` and `toi_twigroup` orientations. When `TWI_MODE == 1` and a `selected_twigroup` is active, metric aggregation is scoped to TWIs belonging to that group only.

---

## 18. Video–Animation Synchronization

The animation loop in `page.js` was extended so that video playback and the time slider stay in sync:

- **Slider → video**: when the user drags the slider while `VIDEO_LINKING` is on, the video is seeked to `selectedTwiMinTime + TIME_ANIMATE × (selectedTwiMaxTime − selectedTwiMinTime)` (in seconds)
- **Video → slider**: during `TIME_PLAY`, `TIME_ANIMATE` is derived from `currentVideoObj.time()` so the slider tracks the video head rather than incrementing blindly
- The video is automatically paused when it reaches `selectedTwiMaxTime`
- `handleAOITimeChange()` is called on every frame so temporal AOI visibility stays in sync with the current playback position

---

## New Files

| File | Purpose |
|------|---------|
| `helpers.js` | Shared date/time utility functions |
| `ffmpeg.min.js` | FFmpeg WebAssembly build for in-browser video trimming |
| `html2canvas.min.js` | html2canvas library for timeline screenshot export |
| `hierarchy.html` | AOI hierarchy popup — tree view of Screen → App → Interface → AOI |

---

## Dependencies Added

| Library | Source | Use |
|---------|--------|-----|
| Font Awesome 6 | CDN | Icons throughout the notes panel UI and AOI controls |
| FFmpeg.wasm | Bundled (`ffmpeg.min.js`) | In-browser video trimming |
| html2canvas | Bundled (`html2canvas.min.js`) | Timeline screenshot export |
