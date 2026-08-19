# Menut — API & directives

## JavaScript

The whole JavaScript API boils down to:

```js
window._ = { /* state */ };
_.mount();
```

- Assigning `window._ = { … }` wraps it in a reactive `Proxy` and injects the
  helpers: from that moment `_` is reactive and `_.mount()` is available with no
  further steps. `_` is the **only** global (there is no `window.Menut` anymore).
- If you don't assign a state (component-only pages), `_` is created on first
  use: `_.mount()` and `_.define()` work all the same.
- `mount()` can be called repeatedly and is idempotent. It only processes new
  nodes, so you can insert dynamic HTML and re-mount:

```js
container.innerHTML = html;
_.mount(container);
```

## Helpers in `_`

`mount()` injects a handful of minimal helpers into `_` (only if you have not
defined them yourself, and as **non-enumerable** properties — they don't pollute
`Object.keys(_)`). Because `_` is the prototype of the expression context, they
are usable as bare identifiers in any directive:

```html
<button :on.click="dispatch('saved', { id })">Save</button>
<button :on.click="await sleep(300); mount('#zone')">…</button>
```

| Helper | What it does |
|--------|--------------|
| `qry(sel)` | `document.querySelector(sel)` |
| `qryAll(sel)` | `[...document.querySelectorAll(sel)]` (array) |
| `net.get(url)` | `fetch(url).then(r => r.text())` |
| `net.json(url)` | `fetch(url).then(r => r.json())` |
| `net.post(url, data)` | POST JSON → text |
| `dispatch(name, detail)` | `CustomEvent` (`bubbles`, `composed`) on `document` |
| `sleep(ms)` | `new Promise(r => setTimeout(r, ms))` (for `await`) |
| `raf(fn)` | `requestAnimationFrame(fn)` |
| `mount(el?)` | Mounts (re-mounts) `el`; accepts a selector or element |

`dispatch` is the complement of `:on.myevent`: it fires a custom event that any
`:on.*` listener (or `addEventListener`) can catch. In an `:on.*` handler, `this`
is the element, so `this.dispatchEvent(new CustomEvent(...))` targets the element
itself.

## HTML directives

Every directive starts with `:`. The value is always a JavaScript expression
evaluated with `_` as context.

### `::` (text)

Synonym of `:text`. Inserts the escaped value.

```html
<h1 ::="titulo"></h1>
```

### `:text`

```html
<span :text="usuario.nombre"></span>
```

### `:html`

Inserts unescaped HTML. Be careful with untrusted content.

```html
<div :html="descripcion"></div>
```

### `:html-unsafe`

Identical to `:html` (also assigns `innerHTML` unescaped). The name forces a
conscious decision when inserting raw HTML from an expression, so it stands out
in code and reviews. Use it when the source is untrusted and `:text` won't do.

```html
<div :html-unsafe="contenidoMarcado"></div>
```

### `:model`

Two-way binding with forms.

```html
<input :model="nombre">
<textarea :model="texto"></textarea>
<input type="checkbox" :model="activo">
<input type="radio" :model="opcion" value="a">
<select :model="pais">
```

Uses `input` for inputs/textarea and `change` for select, checkbox and radio.

### `:as`

Type coercion of the value written by `:model`, on the same element. Values:
`int` (`parseInt`), `number` (`parseFloat`), `bool` (`v === "true" || v === "1"`),
`array`/`object` (`JSON.parse`, falling back to `[]`/`{}`). Without `:as`, the
value is written as-is (string).

```html
<input :model="puntuacion" :as="int">
<input :model="datos" :as="object">
```

### `:transition`

View transition (View Transitions API) on re-render. The element opts into the
API with a stable `view-transition-name`; every binding update is wrapped in
`document.startViewTransition()`, so the browser interpolates between the old and
new states instead of jumping.

**How it works**

- It goes on the element that changes or on the **container** holding
  structural bindings (`:if` / `:each`).
- Menut assigns an automatic `view-transition-name` (`vt-1`, `vt-2`, …) to the
  element; with `:transition.shared="name"` you use the name you want.
- Every binding update (a `:text`, an `:if` inserting/removing content, the
  `:each` reconciliation) runs inside `document.startViewTransition()`.
- If the API is missing (e.g. Firefox), `prefers-reduced-motion` is set, or a
  transition is in progress, it degrades to an immediate update (no animation).
  The real update (the DOM) **always** applies: a failed transition never breaks
  reactivity.

**Modifiers** (mapped to `view-transition-class`): `.fade`, `.scale`,
`.slideup`. A bare `:transition` uses the native cross-fade.

```html
<!-- element with a value binding: the number scales on every change -->
<strong :transition.scale ::="n">0</strong>

<!-- :if container: the content slides when the view changes -->
<div :transition.slideup>
  <template :if="vista === 'a'"><p>View A</p></template>
  <template :if="vista === 'b'"><p>View B</p></template>
</div>

<!-- :each container: rows slide in/out -->
<div :transition.slideup>
  <template :each="tareas"><li ::="item"></li></template>
</div>

<!-- :shared → explicit name for an element that morphs its content -->
<div :transition.shared="logo" ::="modo === 'sol' ? '☀️' : '🌙'">☀️</div>
```

A bare `:transition` uses the native cross-fade. For `.fade`, `.scale` and
`.slideup` to animate, weblin's CSS (`weblin.org/css.css`) is assumed loaded.
Without weblin, copy this support CSS:

```css
@keyframes vt-fade { from { opacity: 0; } }
@keyframes vt-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes vt-scale-in  { from { transform: scale(0.85); opacity: 0; } }
@keyframes vt-scale-out { to   { transform: scale(0.85); opacity: 0; } }
@keyframes vt-slide-up-in  { from { transform: translateY(20%); opacity: 0; } }
@keyframes vt-slide-up-out { to   { transform: translateY(-20%); opacity: 0; } }
::view-transition-old(*.fade) { animation: 0.25s ease both vt-fade-out; }
::view-transition-new(*.fade) { animation: 0.25s ease both vt-fade; }
::view-transition-old(*.scale) { animation: 0.3s ease both vt-scale-out; }
::view-transition-new(*.scale) { animation: 0.3s ease both vt-scale-in; }
::view-transition-old(*.slideup) { animation: 0.3s ease both vt-slide-up-out; }
::view-transition-new(*.slideup) { animation: 0.3s ease both vt-slide-up-in; }
```

**Notes**

- `view-transition-name` and `view-transition-class` are real CSS properties
  (Chrome/Edge 127+, Safari 18+); in browsers without support, `:transition`
  falls back to the native cross-fade or degrades entirely.
- Menut injects a `<style>` that disables the **root** cross-fade
  (`::view-transition-old(root)` / `new(root)`): only the element with
  `:transition` animates, without flashing the whole page.
- The `view-transition-name` is **dynamic**: it is only applied to the element
  being updated and removed when the transition ends. That way an unrelated
  trigger does not run other `:transition` elements' animations.
- There is only **one transition at a time** (document-level): if another is in
  progress, the update applies directly (no animation) and resumes when the
  previous one finishes.
- In `:if` / `:each` the `:transition` container can sit **above** the
  `<template>` (which in turn can be inside a `<ul>`, etc.): Menut finds the
  nearest ancestor with `:transition` (`vtHost`), not just the parent.
- `:transition` **never breaks reactivity**: if the browser aborts the
  transition (for example two elements with the same `view-transition-name` in
  the DOM, `InvalidStateError`), the update still applies, without animation.
- A `:shared` morph works reliably when it is a **single element** whose content
  changes. A morph between two distinct elements sharing a name (view swap with
  two `:if`) can abort in the granular model — to animate a view change, wrap
  the `:if`s in a `:transition` container (slide/fade of the container) instead
  of sharing the name.

Full example: [examples/transition.html](../examples/transition.html).

### `:if` (on `<template>`)

```html
<template :if="logueado">
  <h1>Hello</h1>
</template>
```

It can contain several nodes. The `<template>` is replaced by the content.

### `:else` (on `<template>`)

Chains with `:if` to form an if/else. Only one branch is in the DOM at any time.
The `:else` is implicitly the negation of the previous `:if`.

```html
<template :if="logueado">
  <h1>Hello</h1>
</template>
<template :else>
  <p>You need to log in</p>
</template>
```

### `:each` (on `<template>`)

```html
<ul>
  <template :each="usuarios">
    <li>
      <span ::="item.nombre"></span>
      <button :on.click="eliminar(item._index)">X</button>
    </li>
  </template>
</ul>
```

Inside the iteration the following are available:

- `item` — the current element.
- `item._index` — the iteration index.
- `item._parent` — the original array.

`_index` and `_parent` are non-enumerable properties added to `item`. They
require the array elements to be **objects**; if the array holds primitives, you
can use `_index` and `_parent` directly as variables.

### `:ref`

```html
<input :ref="busqueda">
```

After `mount()`, `_.ref.busqueda` is the element. The `_.ref` object is created
automatically.

### `:on.*` (events)

```html
<button :on.click="guardar(item)">Save</button>
<input :on.input="buscar()">
```

In the handler:

- `this` is the element that fired the event.
- `event` is the `Event` object.
- `_` is the state, `item` is available inside `:each`.

The expression is evaluated as an **async** function and as a **statement
block**: it accepts plain JavaScript (multiple statements with `;`, `switch`,
`if`, etc.) plus `await` for fetching content from the server, e.g.:

```html
<a :on.click="
    event.preventDefault();
    _.qry('#c').innerHTML = marked.parse(await _.net.get('docs/spec.md'))">Spec</a>
```

The single-expression form (`count = count + 1`, `guardar(item)`) and the comma
operator `(a, b)` also work.

There are no modifiers (`.prevent`, `.stop`). You do it in the function:

```js
guardar() {
    event.preventDefault();
    ...
}
```

### `:attribute` (generic binding)

Any other HTML attribute. If the name is a property of the element, the property
is assigned (`value`, `checked`, `disabled`, `style`, `src`, `href`...);
otherwise `setAttribute` is used (`class`, `alt`, `title`...).

```html
<div :class="activo ? 'activo' : ''"></div>
<img :src="foto">
<input :value="nombre">
<input :disabled="!permitido">
<div :hidden="!activo"></div>
<div :style="visible ? '' : 'display:none'"></div>
```

## Expression context

Available in any expression: `_`.

Available only in events: `this`, `event`.

Available only inside `:each`: `item`, `item._index`, `item._parent`.

There are no `$refs`, `$el`, `$nextTick`, `$parent`, `$root`, `$event`.

## Components (SFC)

Menut lets you package reusable functionality into single-file components,
defined with `<define-component>` and used as custom elements.

### Definition

```html
<!-- inline: <define-component name="..."> with a child <template> -->
<define-component name="x-counter">
  <template count:number="0">
    <style>:host { display: block }</style>
    <button :on.click="inc()">Clicks: <span ::="count"></span></button>
    <script>this.inc = () => this.count++</script>
  </template>
</define-component>

<!-- external: the tag comes from the filename (components/x-counter.html → x-counter) -->
<define-component src="components/x-counter.html"></define-component>

<!-- usage (requires a prior definition) -->
<x-counter></x-counter>
```

The external SFC file is a single `<template>` (like the inline one):

```html
<!-- components/x-counter.html -->
<template count:number="0">
  <style>:host { display: block }</style>
  <button :on.click="inc()">Clicks: <span ::="count"></span></button>
  <script>this.inc = () => this.count++</script>
</template>
```

### States & instances

- **Light DOM by default** (no shadow); add `shadowrootmode="open"` to the
  `<template>` to encapsulate.
- **Styles**: in light DOM, the `<style>` is injected once with scope
  (`tag { … }` with CSS nesting; `:host`→tag and `@keyframes` hoisted to the top
  level). In shadow DOM, the `<style>` goes inside the shadow root without scope
  (the shadow isolates by itself).
- The template binds to the instance **local state**: `_` is local and the
  global is accessed as `window._`.
- Inside the component `<script>`, `this` is the local reactive state.
- Each instance is independent: a component inside `:each` creates one instance
  per row.

### Props

Props are declared on the `<template>` with `name:type="default"` attributes:

```html
<template count:number="0" etiqueta:string="hola" activo:boolean>
```

| Type | Coercion | Default |
|------|----------|---------|
| `:string` | `String(v)` | `""` |
| `:number` | `Number(v)` | `0` |
| `:boolean` | `true` unless `"false"` | `false` |
| `:date` | `new Date(v)` | `null` |
| `:array` | `JSON.parse(v)` | `[]` |
| `:object` | `JSON.parse(v)` | `{}` |
| (no suffix) | auto-detect | as-is |

- Primitives **reflect** to the attribute (state ↔ attribute); arrays/objects
  are property-only. Changing the **attribute** also updates the state (via the
  native `attributeChangedCallback`) and fires `onpropchange`.
- Prop names must be **lowercase** (HTML attributes are case-insensitive).
- In `:each`, the element's props bind with the parent context:
  `<x-num :num="item.v"></x-num>`.

### Lifecycle

In the `<script>` you can assign callbacks (all with `this` = state):

- `this.onpropchange = (name, val) => {}` — fires when a prop changes, whether
  from the attribute or the state.
- `this.onconnected = () => {}` — when the element connects (DOM ready).
- `this.ondisconnected = () => {}` — when it disconnects.

**Lifecycle with `this.signal` (AbortController)**: each instance has its own
`AbortController`; its `signal` is exposed as `this.signal` (a non-enumerable
property of the state). Any listener with
`addEventListener(evt, fn, { signal: this.signal })` is released
**automatically when the element disconnects** (the signal is aborted before
`ondisconnected`), along with other lifecycle traces.

```js
this.onconnected = () => {
    window.addEventListener('resize', () => this.redimensionar(), { signal: this.signal });
};
```

### Forms: `this.el._internals`

Components are `formAssociated`: in the constructor Menut does
`this._internals = this.attachInternals()` (if the browser supports it; otherwise
it stays `null`). From the `<script>` (or any callback) you have access to the
element's `ElementInternals` API:

- `this.el._internals.setFormValue(value)` — the value participates in the
  form's `FormData` when submitted.
- `this.el._internals.setValidity(flags, message, anchor)` /
  `reportValidity()` — native form validation.
- `this.el._internals.form` — the form it belongs to (or `null`).
- `this.el._internals.states` — the element's `CustomStateSet`.

```js
this.onconnected = () => {
    const int = this.el._internals;
    if (!int) return;                 // attachInternals() not available
    int.setFormValue(this.el.querySelector('input').value);
    int.setValidity(this.valor.length >= 3, 'Minimum 3 characters', this.el);
};
```

### Programmatic API

```js
_.define("x-counter", "<button :on.click=\"inc()\">…</button><script>this.inc = …</script>",
         { count: { type: "number", default: 0 } });
```

`html` is the `<template>` content (with optional `<style>`/`<script>` inside);
`props` declares typed props programmatically.

### Notes

- The `<script>` runs in `connectedCallback`, **after** the template has been
  rendered and the element is connected. That's why it **can touch the DOM** via
  `this.el` (and `this.el.shadowRoot` for shadow): query and move nodes, register
  listeners, etc.
- Real limits of the `<script>`:
  - It is **synchronous** (no top-level `await`).
  - **Geometry measurements** (`getBoundingClientRect`, `offsetWidth`,
    `offsetHeight`) may be unreliable before the first paint: for initial HTML
    elements, `connectedCallback` runs during parsing. Defer them with
    `requestAnimationFrame`/`setTimeout` or measure on interaction.
- `this.onconnected` is called right after the `<script>` (same tick): use it
  for code that depends on methods defined in the script, not for geometry (it
  has the same limitation).
- `mount()` registers the document's `<define-component>` blocks before
  scanning, so definitions work even when they come after their usages.

## Utility component: `date-time`

A live date/time formatter with **PHP-style format** (`date()` syntax) that
auto-updates.

```html
<date-time format="H:i:s"></date-time>                  <!-- 14:03:27 → updates every 1s -->
<date-time format="d/m/Y H:i"></date-time>              <!-- 11/08/2026 14:03 → updates every 1min -->
<date-time format="l, d \of F Y"></date-time>           <!-- Tuesday, 11 of August 2026 → hourly -->
<date-time format="i:s" date="2026-08-10T10:00:00" relative></date-time>   <!-- 5 minutes ago -->
```

- **`format`** — PHP `date()` characters: `d j m n Y y F M l D N w z t L W`,
  `H G h g i s A a`, `U T P O e c r`. Unrecognized characters are output as-is;
  `\X` escapes the next character.
- **Auto-refresh** — by the smallest time unit present in `format`: `s` →
  every 1s, `i` → every 1min, any hour token (`H G h g A a`) → every 1h,
  otherwise every 1 day.
- **`date`** — reference date (Unix timestamp or parseable string); default is
  now.
- **`relative`** — shows a localized relative time (via
  `Intl.RelativeTimeFormat`) instead of the formatted value, choosing the unit
  from the smallest time token in `format` («Hace 5 minutos» / «5 minutes ago»).
- **`lang`** — locale for month/day names and the relative text (`Intl`);
  default `en` (`lang="es"`, `lang="fr"`, … all work).
- The refresh timer is tied to the instance `this.signal` (AbortController), so
  it stops automatically when the element disconnects.
