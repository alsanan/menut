# Menut — Component Gallery

Auto-generated from `components/*.html`.

## Forms & inputs

- [`your-name`](#your-name) — One-line summary of what the component does.
- [`date-picker`](#date-picker) — Styled wrapper around <input type="date">. Shows the selected date formatted and
- [`date-range-picker`](#date-range-picker) — Dual-handle range slider for picking a date range. Leverages the dual-range patt
- [`drag-list`](#drag-list) — Dual-pane list with drag-and-drop and button transfer. Slotted .item elements wi
- [`drop-uploader`](#drop-uploader) — File drop zone with click-to-browse. Accepts images, shows thumbnail preview. Fo
- [`dual-range`](#dual-range) — Dual-handle range slider. Attributes: min, max, step, low, high. Form-associated
- [`field-when`](#field-when) — Shows its slotted form fields only when other form fields match the declared con
- [`form-enhance`](#form-enhance) — Enhanced form with crash recovery (localStorage) and validation UX.
- [`fullscreen-select`](#fullscreen-select) — Native <select> with fullscreen picker using appearance: base-select. Options op
- [`highlighted-input`](#highlighted-input) — Text input with real-time keyword highlighting. Keywords specified as comma-sepa
- [`input-enhanced`](#input-enhanced) — Drop-in enhanced <input> wrapper. Passes label, hint, error as Chrome autofill h
- [`mini-calendar`](#mini-calendar) — Small calendar with month or week view, previous/next navigation, today highligh
- [`order-list`](#order-list) — Drag-to-reorder list. Slotted children become sortable items. Pointer-based drag
- [`scroll-select`](#scroll-select) — Scroll-to-select list. Scroll-snap centered items. Keyboard arrows up/down, focu
- [`searchable-select`](#searchable-select) — Searchable dropdown select. Slotted [role="option"] elements. Type to filter, ar
- [`step-form`](#step-form) — Wizard/form stepper. Slotted .step divs shown one at a time with a vertical slid
- [`tag-input`](#tag-input) — Tag/pill input (Oat-style TagInput). Type and press Enter or comma to add a tag,
- [`x-color-picker`](#x-color-picker) — Color swatch picker. Slotted <span style="background:COLOR"> swatches. Click to 
- [`x-pagination`](#x-pagination) — Pagination component with scrollable page buttons. Attributes: total, page. Emit
- [`x-rating`](#x-rating) — Star rating as a masked range input. CSS-only star shapes via conic-gradient mas
- [`x-stepper`](#x-stepper) — Numeric stepper with –/+ buttons. Attributes: min, max, step, value. Form-associ

## Progress & data

- [`data-grid`](#data-grid) — Lightweight editable data table with CRUD actions: add, duplicate and delete row
- [`progress-circle`](#progress-circle) — Circular progress ring. Single value (one arc) or comma-separated values (multi-
- [`spark-line`](#spark-line) — Mini SVG line chart.
- [`stat-counter`](#stat-counter) — Animated number counter. Props: number (target), duration (seconds). Animates on
- [`x-countdown`](#x-countdown) — Countdown to a target date/time, updating every second.
- [`x-export`](#x-export) — Button to export a JSON array/object as CSV or JSON file.
- [`x-inspector`](#x-inspector) — Read-only tree inspector for any JSON value. Useful for debugging reactive state
- [`x-progress`](#x-progress) — Horizontal progress bar. Prop value (0-100). Variants: indeterminate (no value),
- [`x-viewport`](#x-viewport) — Viewport dimension reporter. Sets --vv-width CSS var and size attribute (xs/sm/m

## Text effects

- [`dot-display`](#dot-display) — Pixel dot-matrix display. API: pixel(x,y,color), clear(), fill(), text(), scroll
- [`gradient-text`](#gradient-text) — Animated gradient text. CSS vars: --gradient-from, --gradient-to. Background-cli
- [`hero-text`](#hero-text) — Large hero heading with colored text-shadow and glow. CSS var: --hero-hue for hu
- [`overlap-text`](#overlap-text) — Overlapping text effect. Splits text into characters with negative letter-spacin
- [`rolling-number`](#rolling-number) — Animated number that rolls each digit up or down like a mechanical counter when 
- [`text-morph`](#text-morph) — Word-by-word text morphing animation. Space-separated words cycle with blur/opac
- [`text-rotator`](#text-rotator) — Typewriter text rotator. Attribute words (comma-separated) cycled with typing/de

## Buttons & feedback

- [`hold-button`](#hold-button) — Hold-to-confirm button. Press and hold 2s to trigger. Emits confirm event, sets 
- [`rainbow-button`](#rainbow-button) — Button with animated rainbow gradient border and glow. CSS vars: --color-1..--co
- [`theme-switch`](#theme-switch) — Smart dual-state theme toggle: light and dark only. Clicking the option matching
- [`toast-console`](#toast-console) — Captures console.error/warn/info and shows them as <dialog toast>. Use during de

## Layout & nav

- [`foot-note`](#foot-note) — Inline footnote with superscript number. Click the number to show a fixed popove
- [`fullscreen-menu`](#fullscreen-menu) — Fixed-position hamburger menu that expands to fullscreen overlay. Slotted <a> li
- [`hover-scroll`](#hover-scroll) — Scrollable container that hides scrollbars until the user hovers over it. Pure C
- [`lazy-load`](#lazy-load) — Defers rendering of heavy content until it enters the viewport. The content live
- [`live-reload`](#live-reload) — Auto-reloads the page when the main page file changes. Checks via HEAD request w
- [`preload-links`](#preload-links) — Preloads linked pages when hovering or focusing links inside it. Cached response
- [`scroll-to-top`](#scroll-to-top) — Fixed-position FAB that appears after scrolling past an offset and smoothly scro
- [`shadow-container`](#shadow-container) — Scrollable container with edge fade overlays (top/bottom or left/right). Attribu
- [`show-when`](#show-when) — Conditionally shows/hides its content based on URL params, hash, media query, CS
- [`x-code-block`](#x-code-block) — Code block with syntax coloring via color font. Header shows language name and C
- [`x-splitter`](#x-splitter) — Resizable split panel. Slots: start (left/top), end (right/bottom). CSS-only res
- [`x-timeline`](#x-timeline) — Vertical timeline with expand/collapse. Slotted .item elements with <time>, <str
- [`x-tree-view`](#x-tree-view) — Tree/list view with nested <ul>/<li>/<details>. Removes list-style from nested <

## 3D & images

- [`image-compare`](#image-compare) — Before/after image comparison slider. Two slotted <img> elements. Drag slider or
- [`layered-tilt`](#layered-tilt) — Perspective tilt with per-child translateZ layers. Slotted elements with layer="
- [`sound-click`](#sound-click) — Plays audio sprite segment on click of wrapped elements. Takes [sound] attribute
- [`sound-hover`](#sound-hover) — Plays audio sprite segment on mouseover of wrapped elements. Takes [sound] attri
- [`x-cropper`](#x-cropper) — Image cropper using cropperjs from CDN. Emits the cropped image as base64.
- [`x-map`](#x-map) — Leaflet map component. Attributes: lat, lng, zoom, marker. Loads Leaflet from CD
- [`x-signature`](#x-signature) — Signature pad using signature_pad from CDN. Exports the signature as base64 PNG.
- [`x-tilt`](#x-tilt) — 3D perspective tilt card. Slotted content gets translateZ depth. Pointer move fo

## Content & actions

- [`date-time`](#date-time) — Live date/time formatter with PHP-style format (date() syntax) that auto-updates
- [`html-load`](#html-load) — Loading agent: fetches an HTML fragment (fetch) and places it at a target with a
- [`json-editor`](#json-editor) — Visual JSON editor with Tree and Raw views, powered by the @visual-json/core hea
- [`lorem-ipsum`](#lorem-ipsum) — Generator of placeholder text (Lorem ipsum). Attribute `size` controls words or 
- [`server-action`](#server-action) — Push-based action engine: executes a command element emitted by the backend. Dis
- [`sse-connect`](#sse-connect) — Opens a Server-Sent Events connection to `src`. Dispatches a `receive` CustomEve
- [`sticky-sidebar`](#sticky-sidebar) — Sticky sidebar with two modes. Default: position:sticky with align-self:start (i
- [`virtual-list`](#virtual-list) — Slot-based visibility virtualizer. Uses IntersectionObserver to add a visible cl
- [`x-markdown`](#x-markdown) — Render Markdown to HTML using marked.js loaded from CDN. Content can come from t

## Other

- [`vertical-page-progress`](#vertical-page-progress) — Fixed viewport progress bar that fills as user scrolls. CSS vars: --bar-height, 

---

# Forms & inputs

## your-name

One-line summary of what the component does.

**Usage**

```html
<your-name prop="value"></your-name>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `prop1` | `string` | `` |
| `prop2` | `number` | `0` |
| `prop3` | `boolean` | `false` |

**Implementation notes**

Explain the internal mechanism: events, observers, reactivity, cleanup.

---

## date-picker

Styled wrapper around <input type="date">. Shows the selected date formatted and emits change events.

**Usage**

```html
<date-picker value="2026-08-11" lang="en"></date-picker>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `value` | `string` | `` |
| `lang` | `string` | `en` |
| `placeholder` | `string` | `Pick a date` |

**Implementation notes**

Native date input styled with CSS. The calendar popup is browser-native; the visible field and icon are customized.

---

## date-range-picker

Dual-handle range slider for picking a date range. Leverages the dual-range pattern but maps thumbs to dates.

**Usage**

```html
<date-range-picker min="2026-08-01" max="2026-08-31" start="2026-08-10" end="2026-08-20"></date-range-picker>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `min` | `string` | `` |
| `max` | `string` | `` |
| `start` | `string` | `` |
| `end` | `string` | `` |
| `lang` | `string` | `en` |
| `format` | `string` | `d/m/Y` |

**Implementation notes**

Converts dates to timestamps and back. Two range inputs overlaid, with labels showing formatted dates.

---

## drag-list

Dual-pane list with drag-and-drop and button transfer. Slotted .item elements with slot="source" or slot="target". Arrows move selected or all items. Form-associated.

**Usage**

```html
<drag-list name="selected"><div class="item" slot="source">Item</div><div class="item" slot="target">Selected</div></drag-list>
```

**Implementation notes**

HTML5 drag-and-drop between lists. Click to select, double-click to move, arrow buttons. Updates _internals.setFormValue().

---

## drop-uploader

File drop zone with click-to-browse. Accepts images, shows thumbnail preview. Form-associated (file value).

**Usage**

```html
<drop-uploader></drop-uploader>
```

**Implementation notes**

Drag events + file input. FileReader reads as data URL for preview thumbnail. setFormValue for form submission.

---

## dual-range

Dual-handle range slider. Attributes: min, max, step, low, high. Form-associated, emits low/high JSON.

**Usage**

```html
<dual-range min="0" max="100" low="25" high="75"></dual-range>
```

**Implementation notes**

Two overlay range inputs, fill bar between thumbs. Script prevents crossover, updates labels and setFormValue.

---

## field-when

Shows its slotted form fields only when other form fields match the declared conditions. conditions="name=value||name=value"; value "*" matches any non-empty value. Hide-only: hidden fields still submit and validate.

**Usage**

```html
<field-when conditions="source=other"><label>Specify<input name="source-other"></label></field-when>
```

**Implementation notes**

Parses ||-separated pairs, reads live control values (radio/checkbox via checked, else .value), toggles the hidden attribute on the host. One delegated input/change listener on the nearest form (fallback: document); missing referenced fields are skipped. Re-evaluates on prop change and slotchange.

---

## form-enhance

Enhanced form with crash recovery (localStorage) and validation UX.
           Saves form state on input/change, restores on page load, clears on submit.
           Fields listed in retain attribute persist after submit (unless no-retain is set).
           Shows validation errors on focusout and submit, clears on input.
           Based on:
             - Aaron Gustafson's form-saver (https://github.com/aarongustafson/form-saver)
             - Alistair Davidson's validation-enhancer (https://gitlab.com/alistairldavidson/validation-enhancer)

**Usage**

```html
<form-enhance><form action="/submit">...</form></form-enhance>
```

**Implementation notes**

Shadow DOM slot for light DOM form. Validation messages auto-generated
       next to each input (no markup required). Uses native Constraint Validation API.

---

## fullscreen-select

Native <select> with fullscreen picker using appearance: base-select. Options open in fullscreen overlay. Falls back to regular select.

**Usage**

```html
<fullscreen-select name="x"><option value="">Choose</option><option value="1">Option 1</option></fullscreen-select>
```

**Implementation notes**

Uses appearance: base-select with ::picker(select) styled fullscreen. Options moved from light DOM to shadow DOM as direct children of <select> (fixes Chrome bug: slotted options in ::picker(select) don't receive click-to-select mapping in shadow DOM). JS fallback for label.

---

## highlighted-input

Text input with real-time keyword highlighting. Keywords specified as comma-separated list in the words attribute get highlighted as the user types.

**Usage**

```html
<highlighted-input words="lang:,repo:,user:,AND,OR,NOT" placeholder="Search..."></highlighted-input>
```

**Implementation notes**

Uses a contenteditable element and the CSS Custom Highlight API (::highlight()) applied DIRECTLY on it — no underlay layer, so the highlight rectangles are inherently aligned with the text (no positioning that can drift). Each instance gets a unique highlight name. Falls back gracefully when the API is unavailable.

---

## input-enhanced

Drop-in enhanced <input> wrapper. Passes label, hint, error as Chrome autofill hints; all other attributes go directly to the inner <input>. Forwards all events.

**Usage**

```html
<input-enhanced label="Email" hint="We'll never share your email" type="email" required placeholder="email@example.com"></input-enhanced>
```

**Implementation notes**

Light DOM. Reads label/hint/error from host, copies remaining attributes to inner input, re-dispatches all inner events on the host. External CSS (weblin.css.css) applies directly to the inner <input>. Works with :model via bubbling input/change events.

---

## mini-calendar

Small calendar with month or week view, previous/next navigation, today highlight and single-date selection.

**Usage**

```html
<mini-calendar value="2026-08-14" month="2026-08" week lang="en"></mini-calendar>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `value` | `string` | `` |
| `month` | `string` | `` |
| `week` | `boolean` | `false` |
| `lang` | `string` | `en` |

**Implementation notes**

Pure JS calendar grid. `week` attribute shows a single week view (default is month). Emits a `change` CustomEvent with the selected ISO date when a day is clicked.

---

## order-list

Drag-to-reorder list. Slotted children become sortable items. Pointer-based drag with FLIP animation. Form-associated. Attribute: horizontal.

**Usage**

```html
<order-list><div>Item 1</div><div>Item 2</div></order-list>
```

**Implementation notes**

Pointer events for drag. Fixed-position dragging element with placeholder. FLIP animation for siblings. setFormValue with JSON order.

---

## scroll-select

Scroll-to-select list. Scroll-snap centered items. Keyboard arrows up/down, focusable, form-associated.

**Usage**

```html
<scroll-select name="city"><div class="item" value="VLC">Valencia</div><div class="item" value="MAN">Manchester</div></scroll-select>
```

**Implementation notes**

IntersectionObserver detects centered item, sets [selected] attribute. Keyboard arrows scroll to adjacent items. setFormValue on selection change. Top/bottom spacers ensure all items reachable.

---

## searchable-select

Searchable dropdown select. Slotted [role="option"] elements. Type to filter, arrow keys, Enter to select. Form-associated.

**Usage**

```html
<searchable-select><span role="option" value="1">Option</span></searchable-select>
```

**Implementation notes**

Click to open panel with search input. Filter options by text match. Keyboard nav (arrows, Enter, Escape). setFormValue on select.

---

## step-form

Wizard/form stepper. Slotted .step divs shown one at a time with a vertical slide. Dot navigation, Continue/Done fill button, Enter advances. The host auto-sizes to the active step (no clipping). Attribute: only-mobile (desktop shows inline).

**Usage**

```html
<step-form><div class="step">Step 1</div><div class="step">Step 2</div></step-form>
```

**Implementation notes**

Light DOM .step children moved into the shadow form. Active step centered via translate; host height measured to the active step (+ padding), animating on change. Native form submit is prevented; Enter advances except when focused in a textarea/select/button. The fill button reads "Continue" and becomes "Done!" on the last step, dispatching a bubbling submit event. Dots built programmatically; listeners use the loader signal and are cleaned on disconnect. CSS media query switches only-mobile to inline on desktop.

---

## tag-input

Tag/pill input (Oat-style TagInput). Type and press Enter or comma to add a tag, or pick a datalist suggestion — the value becomes a removable pill. Form-associated; submits a comma-separated list.

**Usage**

```html
<tag-input name="tags" value="apple, mango"><option value="apple">Apple</option></tag-input>
```

**Implementation notes**

Shadow component with internal <input list="dl"> + <datalist id="dl"> built from <option> children. Enter/, adds current text, datalist selection adds on exact match, Backspace on empty removes last pill. setFormValue(comma-joined). Dispatches bubbling input/change with detail = current tag array.

---

## x-color-picker

Color swatch picker. Slotted <span style="background:COLOR"> swatches. Click to select, shows preview & hex.

**Usage**

```html
<x-color-picker><span style="background:#f00"></span><span style="background:#00f"></span></x-color-picker>
```

**Implementation notes**

Script reads background from slotted swatches (querySelectorAll from host), updates preview, setFormValue, dispatches change. Supports value attribute for initial selection.

---

## x-pagination

Pagination component with scrollable page buttons. Attributes: total, page. Emits pagechange event.

**Usage**

```html
<x-pagination total="10" page="1"></x-pagination>
```

**Implementation notes**

Script generates page buttons, scrolls active into view via scrollLeft. Prev/Next buttons. MutationObserver re-renders on attribute change.

---

## x-rating

Star rating as a masked range input. CSS-only star shapes via conic-gradient masks. Half-star support, keyboard-native, form-associated.

**Usage**

```html
<x-rating value="2.5" step="0.5"></x-rating>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `value` | `number` | `0` |
| `max` | `number` | `5` |
| `step` | `number` | `1` |

**Implementation notes**

Native <input type="range"> with CSS conic-gradient mask creating 5 star shapes. Background linear-gradient fills stars based on --val. Range handles value, keyboard, and form participation natively. No JS for visuals. Typed props value/max/step + onpropchange react to attribute changes.

---

## x-stepper

Numeric stepper with –/+ buttons. Attributes: min, max, step, value. Form-associated.

**Usage**

```html
<x-stepper min="0" max="99" value="5"></x-stepper>
```

**Implementation notes**

Script handles button clicks, clamps value, updates display and _internals.setFormValue().

---

# Progress & data

## data-grid

Lightweight editable data table with CRUD actions: add, duplicate and delete rows.

**Usage**

```html
<data-grid value='[{"name":"Ada","role":"dev"}]' key-field="id"></data-grid>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `value` | `array` | `[]` |
| `key-field` | `string` | `` |
| `editable` | `boolean` | `true` |

**Implementation notes**

Builds a <table> from the array. Cells are inputs when editable. Emits change events.

---

## progress-circle

Circular progress ring. Single value (one arc) or comma-separated values (multi-arc ring). Colors via --chart-1..--chart-N. Each arc gets a matching drop-shadow. CSS var: --value, --stroke, --gap.

**Usage**

```html
<progress-circle style="--value:60,25,15;--chart-1:#5394fd;--chart-2:#f59e0b;--chart-3:#10b981">slot text</progress-circle>
```

**Implementation notes**

SVG circle with stroke-dasharray/-offset. Script reads --value from computed style, generates arcs with gaps. SVG feDropShadow on each arc. MutationObserver re-renders on style change.

---

## spark-line

Mini SVG line chart.

**Usage**

```html
<spark-line values="12,19,3,5,2,3" stroke="#6366f1"></spark-line>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `values` | `string` | `0` |
| `stroke` | `string` | `var(--accent, oklch(0.55 0.15 145))` |
| `fill` | `string` | `` |
| `width` | `number` | `160` |
| `height` | `number` | `40` |

**Implementation notes**

Scales the input values to an SVG path. Optional fill area.

---

## stat-counter

Animated number counter. Props: number (target), duration (seconds). Animates on scroll into view.

**Usage**

```html
<stat-counter number="1000" duration="2"></stat-counter>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `number` | `number` | `0` |
| `duration` | `number` | `1` |

**Implementation notes**

IntersectionObserver starts animation. requestAnimationFrame loop interpolates from 0 to target. Typed props + onpropchange re-animate on change (replaces manual MutationObserver).

---

## x-countdown

Countdown to a target date/time, updating every second.

**Usage**

```html
<x-countdown until="2026-12-31T23:59:59"></x-countdown>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `until` | `string` | `` |
| `format` | `string` | `d:h:m:s` |
| `lang` | `string` | `en` |

**Implementation notes**

Uses setInterval tied to this.signal for cleanup.

---

## x-export

Button to export a JSON array/object as CSV or JSON file.

**Usage**

```html
<x-export data='[{"a":1}]' format="csv" filename="data.csv"></x-export>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `data` | `object` | `[]` |
| `format` | `string` | `json` |
| `filename` | `string` | `export.json` |

**Implementation notes**

Client-side only: builds a Blob and triggers a download via an <a> element.

---

## x-inspector

Read-only tree inspector for any JSON value. Useful for debugging reactive state or API responses.

**Usage**

```html
<x-inspector value='{"a":1,"b":[true,false]}'></x-inspector>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `value` | `object` | `{}` |

**Implementation notes**

Recursive tree renderer with expand/collapse. Click arrows to toggle branches.

---

## x-progress

Horizontal progress bar. Prop value (0-100). Variants: indeterminate (no value), danger, warning, info.

**Usage**

```html
<x-progress value="75"></x-progress>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `value` | `number` | `0` |

**Implementation notes**

Light DOM (template `light`) — inherits page styles, no <slot>. Typed prop `value:number:0`. onpropchange updates the fill reactively. Indeterminate via CSS keyframes (auto-namespaced by the loader).

---

## x-viewport

Viewport dimension reporter. Sets --vv-width CSS var and size attribute (xs/sm/md/lg/xl) on host based on visual viewport.

**Usage**

```html
<x-viewport></x-viewport> (use via CSS var --vv-width elsewhere)
```

**Implementation notes**

Script listens to visualViewport resize, computes size breakpoint, updates host attributes.

---

# Text effects

## dot-display

Pixel dot-matrix display. API: pixel(x,y,color), clear(), fill(), text(), scrollText(), etc. CSS vars: --width, --height, --dot-gap, --dot-size, --dot-shape. 4-color palette (--color0..--color3).

**Usage**

```html
<dot-display style="--width:64;--height:16"></dot-display>
```

**Implementation notes**

SVG matrix with circle/rect/polygon dots. Renders only render when dirty (no perpetual RAF loop). scrollText() uses a duplicated bitmap layer animated with a pure CSS transform (GPU-composited, zero per-frame JS). Includes 5x7 CP437 bitmap font (glcdfont) with a Unicode->CP437 mapping so Valencian/Catalan diacritics (à è ò ç ï ü ñ ·) render correctly.

---

## gradient-text

Animated gradient text. CSS vars: --gradient-from, --gradient-to. Background-clip text with shifting gradient.

**Usage**

```html
<gradient-text style="--gradient-from:#6366f1;--gradient-to:#ec4899">Text</gradient-text>
```

**Implementation notes**

CSS background-clip: text with animated background-position. Keyframes shift gradient left-right.

---

## hero-text

Large hero heading with colored text-shadow and glow. CSS var: --hero-hue for hue control. Slotted <small> for subtitle.

**Usage**

```html
<hero-text style="--hero-hue:320">Heading<small>Subtitle</small></hero-text>
```

**Implementation notes**

CSS-only. Clamp font-size, oklch text-shadow with hue control, ::slotted for subtitle styling.

---

## overlap-text

Overlapping text effect. Splits text into characters with negative letter-spacing and z-index layering. Default front mode (first behind, last front). [back] reverses, [alter] alternates.

**Usage**

```html
<overlap-text>Front</overlap-text> — default. <overlap-text back>Back</overlap-text> — back mode. <overlap-text alter>Alter</overlap-text> — alternating.
```

**Implementation notes**

Splits text content into <span> per character. CSS: display:flex;letter-spacing:-0.3ch;z-index offset to avoid negative values in shadow DOM.

---

## rolling-number

Animated number that rolls each digit up or down like a mechanical counter when the value changes.

**Usage**

```html
<rolling-number value="1234" duration="600"></rolling-number>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `value` | `number` | `0` |
| `duration` | `number` | `600` |
| `lang` | `string` | `en` |

**Implementation notes**

Each digit is rendered as a vertical strip 0-9 inside a clipped column. CSS transition moves the strip to the target digit. Uses Intl.NumberFormat for separators/decimals.

---

## text-morph

Word-by-word text morphing animation. Space-separated words cycle with blur/opacity crossfade via SVG feColorMatrix threshold filter.

**Usage**

```html
<text-morph>word1 word2 word3</text-morph>
```

**Implementation notes**

Two overlapping <span> elements. SVG threshold filter for sharp edge morphing. requestAnimationFrame loop with morph/cooldown timing.

---

## text-rotator

Typewriter text rotator. Attribute words (comma-separated) cycled with typing/deleting animation. Attributes: speed, hold, hide-cursor.

**Usage**

```html
<text-rotator words="hello,world,foo"></text-rotator>
```

**Implementation notes**

setTimeout-based character-by-character typing and deleting. Pop-in animation on new word. MutationObserver re-parses attributes.

---

# Buttons & feedback

## hold-button

Hold-to-confirm button. Press and hold 2s to trigger. Emits confirm event, sets confirmed attribute.

**Usage**

```html
<hold-button>Hold to confirm</hold-button>
```

**Implementation notes**

Pointer events with 2s timeout on pointerdown. Fill bar grows via CSS transition. Confirmed state locks button.

---

## rainbow-button

Button with animated rainbow gradient border and glow. CSS vars: --color-1..--color-5 for custom colors. Attribute: outline for inverted.

**Usage**

```html
<rainbow-button>Click</rainbow-button>
```

**Implementation notes**

CSS-only. Gradient border via background-clip + padding-box hack. Button::before for glow blur. 4s linear animation.

---

## theme-switch

Smart dual-state theme toggle: light and dark only. Clicking the option matching the system re-enables auto-following; clicking the opposite locks the override. Saves to localStorage.

**Usage**

```html
<theme-switch> (round fab) · <theme-switch full> (two inline buttons)
```

**Implementation notes**

Smart toggle per Lea Verou's approach: only two visible states (light/dark). If the chosen theme matches the system, auto-following resumes. If it differs, the override persists. Without `full`: round FAB. With `full`: two inline buttons.

---

## toast-console

Captures console.error/warn/info and shows them as <dialog toast>. Use during development — never miss a console message again.

**Usage**

```html
<toast-console active level="error,warn"></toast-console>
```

---

# Layout & nav

## foot-note

Inline footnote with superscript number. Click the number to show a fixed popover panel at the bottom of the viewport. Uses the Popover API.

**Usage**

```html
<foot-note num="1">Footnote content here</foot-note>
```

**Implementation notes**

Inline button (vertical-align: super) toggles a popover panel (position: fixed, bottom: 0). Popover API provides auto close on outside click. No JS needed beyond toggle.

---

## fullscreen-menu

Fixed-position hamburger menu that expands to fullscreen overlay. Slotted <a> links. Animated circle expansion.

**Usage**

```html
<fullscreen-menu><a href="#">Link</a></fullscreen-menu>
```

**Implementation notes**

Native <details>/<summary> with CSS transitions. SVG circle scales up as backdrop. Menu items stagger fade/slide.

---

## hover-scroll

Scrollable container that hides scrollbars until the user hovers over it. Pure CSS, WebKit-only.

**Usage**

```html
<hover-scroll style="height:12rem"><p>Long content…</p></hover-scroll>
```

**Implementation notes**

Light-DOM component. The global `scrollbar-color` is overridden to transparent by default so the WebKit `visibility` trick keeps the scrollbar gutter reserved.

---

## lazy-load

Defers rendering of heavy content until it enters the viewport. The content lives inside a <template> and is materialized into the DOM when the component becomes visible.

**Usage**

```html
<lazy-load><template><heavy-component>...</heavy-component></template></lazy-load>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `threshold` | `string` | `0` |
| `root-margin` | `string` | `0px` |
| `once` | `boolean` | `true` |

**Implementation notes**

Uses IntersectionObserver. When the host enters the viewport, the <template> content is cloned and inserted. Emits `lazy-load:visible` for infinite scroll scenarios.

---

## live-reload

Auto-reloads the page when the main page file changes. Checks via HEAD request with adaptive interval and visibility-aware pausing. When watch-css/watch-scripts attributes present, also monitors those resources on a separate longer interval. Uses PerformanceObserver to catch dynamically loaded resources.

**Usage**

```html
<live-reload watch-css></live-reload>
```

**Implementation notes**

Main URL checked via HEAD with exponential backoff 1s→10s, pauses when tab hidden, immediate check+reset on return. Watched CSS/JS resources checked on a separate 30s interval.

---

## preload-links

Preloads linked pages when hovering or focusing links inside it. Cached responses can be served instantly on click.

**Usage**

```html
<preload-links on="hover" intercept><a href="/page">Page</a></preload-links>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `on` | `string` | `hover` |
| `intercept` | `boolean` | `false` |

**Implementation notes**

Uses a global cache (window.__preloadCache). Triggers preload on the configured event. If `intercept` is set, clicks use the cached response.

---

## scroll-to-top

Fixed-position FAB that appears after scrolling past an offset and smoothly scrolls back to top.

**Usage**

```html
<scroll-to-top offset="200"></scroll-to-top>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `offset` | `number` | `200` |

**Implementation notes**

The host is `position: fixed` so it floats globally. A tiny scroll listener toggles the `[visible]` attribute; the click uses smooth `window.scrollTo`.

---

## shadow-container

Scrollable container with edge fade overlays (top/bottom or left/right). Attributes: horizontal for x-scroll.

**Usage**

```html
<shadow-container>Content</shadow-container>
```

**Implementation notes**

Wrapper + scroll container + absolute overlay divs with gradient masks. Scroll event + ResizeObserver opacity fade (30px distance).

---

## show-when

Conditionally shows/hides its content based on URL params, hash, media query, CSS support, language, or network status. Uses AND logic by default; add match-any for OR.

**Usage**

```html
<show-when has-param="debug">…</show-when>
```

**Implementation notes**

MutationObserver watches attribute changes. Listens to hashchange, popstate, media change, and online/offline events. Unspecified conditions are ignored (treated as passed).

---

## x-code-block

Code block with syntax coloring via color font. Header shows language name and Copy button. Attribute: lang.

**Usage**

```html
<x-code-block lang="js">code here</x-code-block>
```

**Implementation notes**

Uses FontWithASyntaxHighlighter color font via @font-palette-values. Copy button uses clipboard API. Pre with scroll.

---

## x-splitter

Resizable split panel. Slots: start (left/top), end (right/bottom). CSS-only resize via native resize property. Attribute: vertical.

**Usage**

```html
<x-splitter><div slot="start">Left</div><div slot="end">Right</div></x-splitter>
```

**Implementation notes**

CSS-only. .panel.start uses resize:horizontal (or vertical). Grid tracks auto/gutter/1fr. Content overflow hidden with absolute inner div. Handle decoration.

---

## x-timeline

Vertical timeline with expand/collapse. Slotted .item elements with <time>, <strong>, and body content. Expand/Collapse All buttons.

**Usage**

```html
<x-timeline><div class="item"><time>2024</time><strong>Title</strong>Body</div></x-timeline>
```

**Implementation notes**

Script reads slotted items, builds <details>/<summary> with animated height transitions. Slotchange for reactivity.

---

## x-tree-view

Tree/list view with nested <ul>/<li>/<details>. Removes list-style from nested <ul>.

**Usage**

```html
<x-tree-view><ul><li><details><summary>Node</summary><ul>...</ul></details></li></ul></x-tree-view>
```

**Implementation notes**

Script reads slotted elements, removes list-style from nested <ul> for cleaner display.

---

# 3D & images

## image-compare

Before/after image comparison slider. Two slotted <img> elements. Drag slider or scrub to reveal.

**Usage**

```html
<image-compare><img src="before.jpg"><img src="after.jpg"></image-compare>
```

**Implementation notes**

Cloned images into left/right wraps with clip-path. Hidden range input, CSS --value var, divider/handle overlay.

---

## layered-tilt

Perspective tilt with per-child translateZ layers. Slotted elements with layer="Z" attribute. Attributes: max, scale, perspective.

**Usage**

```html
<layered-tilt max="15" scale="1.05"><div layer="40">Front</div><div layer="-20">Back</div></layered-tilt>
```

**Implementation notes**

Script reads per-element layer attribute, applies translateZ during pointermove. Wrapper rotates via perspective().

---

## sound-click

Plays audio sprite segment on click of wrapped elements. Takes [sound] attribute with segment index (default 0). Segments hardcoded from the shared audio sprite.

**Usage**

```html
<sound-click sound="4"><button>click</button></sound-click>
```

---

## sound-hover

Plays audio sprite segment on mouseover of wrapped elements. Takes [sound] attribute with segment index (default 0). Segments hardcoded from the shared audio sprite.

**Usage**

```html
<sound-hover sound="3"><button>hover</button></sound-hover>
```

---

## x-cropper

Image cropper using cropperjs from CDN. Emits the cropped image as base64.

**Usage**

```html
<x-cropper src="photo.jpg" aspect-ratio="1"></x-cropper>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `src` | `string` | `` |
| `aspect-ratio` | `string` | `NaN` |
| `value` | `string` | `` |

**Implementation notes**

Loads cropperjs CSS+JS. Provides Crop and Reset buttons. Emits change with base64 PNG.

---

## x-map

Leaflet map component. Attributes: lat, lng, zoom, marker. Loads Leaflet from CDN dynamically.

**Usage**

```html
<x-map lat="39.57" lng="-0.27" zoom="13" marker></x-map>
```

**Implementation notes**

Async script loads Leaflet CSS/JS, creates map with Carto tiles, optionally adds marker. ResizeObserver for responsiveness.

---

## x-signature

Signature pad using signature_pad from CDN. Exports the signature as base64 PNG.

**Usage**

```html
<x-signature pen-color="#0f172a" background="#ffffff"></x-signature>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `pen-color` | `string` | `#0f172a` |
| `background` | `string` | `#ffffff` |
| `value` | `string` | `` |

**Implementation notes**

Loads signature_pad.umd.min.js. Canvas resizes to host. Clear button included.

---

## x-tilt

3D perspective tilt card. Slotted content gets translateZ depth. Pointer move for rotation, glare effect, drop shadow.

**Usage**

```html
<x-tilt depth="100" scale="1"><div>Content</div></x-tilt>
```

**Implementation notes**

Script calculates rotation from pointer position relative to card center. Layers get incremental translateZ. Glare via radial gradient.

---

# Content & actions

## date-time

Live date/time formatter with PHP-style format (date() syntax) that auto-updates. Adds [relative] to show a localized relative time instead.

**Usage**

```html
<date-time format="H:i:s"></date-time> · <date-time format="d/m/Y H:i" date="2026-08-11T10:30:00" relative></date-time> · <date-time format="i:s" relative lang="es"></date-time>
```

**Implementation notes**

- [format] accepts PHP date() characters (see docs). Unrecognized chars are output as-is; "\X" escapes.
  - Auto-refresh: every 1s if the format has seconds (s), every 1min if it has minutes (i), every 1h otherwise.
  - [date] sets the reference date (timestamp or parseable string); default = now.
  - [relative] shows a localized relative time (via Intl.RelativeTimeFormat) instead of the formatted value, choosing the unit from the smallest time token in [format].
  - [lang] locale for month/day names and relative text (Intl); default "en".
  - Uses the instance AbortController (this.signal) to stop the timer on disconnect.

---

## html-load

Loading agent: fetches an HTML fragment (fetch) and places it at a target with a swap strategy. Reactive src reloads. Optional entrance animation via animate attribute. State attrs [loading] / [error].

**Usage**

```html
<html-load src="/frag.html" target="#zone" swap="beforeend" form="#myForm" animate></html-load>
```

**Implementation notes**

Fetch agent. Props: src (reactive), method (get/post/...), target ("self" or selector), swap (replace/inner/none/before/beforeend/after/afterbegin), form (selector). load({...}) merges over props and returns a Promise. Form data + optional values merged into request. Scripts from the response are re-executed in main document scope. Events: html-load:request (cancelable) / response (cancelable, edit detail.text) / swap / error / done.

---

## json-editor

Visual JSON editor with Tree and Raw views, powered by the @visual-json/core headless engine (vendored inline — no network). Edit values, add/remove/duplicate nodes, change types, undo/redo.

**Usage**

```html
<json-editor value='{"title":"Weblin","version":1}'></json-editor>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `value` | `object` | `{}` |
| `readonly` | `boolean` | `false` |

**Implementation notes**

Bundles the @visual-json/core engine inline (self-contained, offline). Tree edits go through immutable core ops, each committed to a History for undo/redo. Raw view parses JSON back into the same TreeState. Emits a `change` event and stays form-associated.

---

## lorem-ipsum

Generator of placeholder text (Lorem ipsum). Attribute `size` controls words or paragraphs.

**Usage**

```html
<lorem-ipsum size="words:50"></lorem-ipsum> · <lorem-ipsum size="paragraphs:3"></lorem-ipsum>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `size` | `string` | `words:50` |

**Implementation notes**

Pure JS generator. Default unit is words. Renders inside a <p> or multiple <p>.

---

## server-action

Push-based action engine: executes a command element emitted by the backend. Dispatches by `action` to a handler registry, then removes itself. Transport-agnostic (SSE, WebSocket, or injected fragment). Place `<server-action init>` once in the initial HTML to define the component eagerly at boot so server-pushed instances run with no loading delay. HTML payload (children) is injected for content actions; payload scripts re-execute in main document scope.

**Usage**

```html
<server-action init>  |  <server-action action="append" target="#list"><li>New</li></server-action>  |  <server-action action="confirm" url="/api/confirm" id="cf-1" title="Delete?" confirm-label="Delete"></server-action>  |  <server-action action="ask" url="/api/ask" id="q-1" title="Pick one"><option value="a">Option A</option></server-action>
```

**Implementation notes**

Registers built-in handlers plus a window.serverActions registry for custom actions. Per element: dispatches cancelable `server-action:before`, runs the handler with ctx { host, action, target, nodes, attrs, params }, then self-removes (unless handler returns { keep:true }). Emits `server-action:done`/`server-action:error` on document (element is gone). Round-trip actions (confirm/ask) open a native <dialog> with a <form> and POST the answer back to `url` with correlation `id` (fetch-enhanced, native form fallback); ESC/backdrop/cancel report cancelled/confirmed=false so the backend never waits on a reply. Custom: serverActions.register(name, ctx => {}) / unregister(name).

---

## sse-connect

Opens a Server-Sent Events connection to `src`. Dispatches a `receive` CustomEvent for every message; if the `append` attribute is present, inserts the message data as HTML after the component. Useful for pushing <server-action> fragments from the backend.

**Usage**

```html
<sse-connect src="/events" :on.receive="log($event.detail.data)"></sse-connect> · <sse-connect src="stream.php" append></sse-connect>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `src` | `string` | `` |
| `append` | `boolean` | `false` |

**Implementation notes**

Creates an EventSource. Emits `receive` (detail.data), `sse-open` and `sse-error`. Closes on disconnect via this.signal.

---

## sticky-sidebar

Sticky sidebar with two modes. Default: position:sticky with align-self:start (ixis.app/780 pattern). Track mode ([track]): visible vertical shaft container (like a lift shaft) — the sidebar (cabin) moves inside it as you scroll. Set width via CSS. CSS vars: --offset (sticky top gap, default 1rem).

**Usage**

```html
<sticky-sidebar style="width:280px">Content</sticky-sidebar>
```

**Implementation notes**

CSS-only. Default: position:sticky on host, align-self:start prevents full-height stretch in flex/grid parent. Track: host full-height via align-self:stretch, visible shaft with border/background, sticky cabin moves inside shaft.

---

## virtual-list

Slot-based visibility virtualizer. Uses IntersectionObserver to add a visible class to items on screen while keeping off-screen items rendered but content-hidden.

**Usage**

```html
<virtual-list style="height:20rem;overflow:auto"><div>item 1</div>...</virtual-list>
```

**Implementation notes**

Observes slotted children and toggles the `visible` class. Also applies content-visibility:auto for performance.

---

## x-markdown

Render Markdown to HTML using marked.js loaded from CDN. Content can come from the slot/textContent or from a `src` URL.

**Usage**

```html
<x-markdown># Hello\n\n- one\n- two</x-markdown> · <x-markdown src="article.md"></x-markdown>
```

**Props**

| Prop | Type | Default |
|------|------|---------|
| `src` | `string` | `` |

**Implementation notes**

Loads marked.js asynchronously. No sanitization is applied: only use with trusted input.

---

# Other

## vertical-page-progress

Fixed viewport progress bar that fills as user scrolls. CSS vars: --bar-height, --accent. Attribute: bottom for bottom placement.

**Usage**

```html
<vertical-page-progress></vertical-page-progress>
```

**Implementation notes**

CSS-only. Uses animation-timeline: scroll(root block) with @keyframes progress for width fill. No JS needed.

---

