# Menut — Design specification

This document is the project's source of truth. It captures the philosophy, the
API, the architecture and every agreed design decision. Any further development
must respect it.

Origin: a design conversation starting from the question "could you rewrite
petite-vue down to its essence, the way fixi does?".

## Philosophy

Menut is a reactive micro-framework with the same philosophy as
[Fixi](https://github.com/bigskysoftware/fixi): HTML-first, minimal API, almost
no abstractions.

- A single state: `window._`.
- A single entry point: `_.mount()`. `_` is the only global.
- No compilation, no bundler, no Virtual DOM.
- Optional components via SFC (see «Components (SFC)» below); the reactive core
  does not need them.
- No own syntax beyond the `:` prefix.
- Everything is a JavaScript expression.
- A single file, no dependencies, no TypeScript.
- Use native browser capabilities before inventing APIs.
- Granular dependency-based reactivity: the whole tree is never re-rendered.
- `mount()` injects a few tiny helpers into `_` (`qry`, `qryAll`, `net`,
  `dispatch`, `sleep`, `raf`, `mount`, `define`) as non-enumerable properties,
  only if the user didn't define them. See `docs/api.md`.

## Public API

```js
window._ = {
    nombre: "Ana",
    contador: 0,

    incrementar() {
        _.contador++;
    }
};

_.mount();
```

Assigning `window._ = { … }` wraps it in the reactive `Proxy` and injects the
helpers at that very moment: that's why `_.mount()` is available right after.
There is no `window.Menut`: the only global is `_`. If no state is assigned, `_`
is created on first use.

That's all you need to learn in JavaScript. The rest of the "API" lives in the
HTML.

## Directives

| Directive | Use |
|-----------|-----|
| `::` | Syntactic sugar for `:text`. |
| `:text` | Inserts escaped text. |
| `:html` | Inserts unescaped HTML. |
| `:model` | Two-way binding with forms. |
| `:if` | Conditional rendering (on `<template>`). |
| `:each` | Repeats content (on `<template>`). |
| `:ref` | References an element in `_.ref`. |
| `:on.*` | Listens to events. `this` is the element. |
| `:*` | Any other HTML attribute (`:class`, `:src`, `:value`...). |

There is nothing else. No new directives are accepted without real justification.

## Expression context

All expressions are evaluated with `with(ctx)`, where `ctx` is an object whose
prototype is `_` and which can add its own variables depending on scope:

```js
_          // the global state (always)
this       // the element that fired the event (only in :on.*)
event      // the Event object (only in :on.*)
item       // current item of the iteration (only inside :each)
item._index
item._parent
```

There are no `$el`, `$refs`, `$nextTick`, `$parent`, `$root` or `$event`.

## Binding types

Internally there are only 4 binding types:

```
Binding
├── ValueBinding      ::, :text, :html, :model (the read side), :attribute
├── EventBinding      :on.*
├── TemplateBinding   :if, :each
└── RefBinding        :ref
```

- **ValueBinding**: reads an expression and applies the value with a `setter(el, v)`.
  The setter only knows "how to paint". `:text` and `:html` have their own
  setter; any other attribute uses a generic setter: if the name is a property of
  the element (`value`, `checked`, `disabled`, `style`, `src`...) it assigns the
  property; otherwise it uses `setAttribute`.
- **EventBinding**: `addEventListener(event, e => fn.call(el, ctx))`. Nothing more.
- **TemplateBinding**: lives on `<template>` and is the only one that modifies
  the DOM structure. It concentrates almost all the complexity.
- **RefBinding**: `_.ref.nombre = element`.

## Reactivity

- State centralized in `window._`, **granular** reactivity.
- Each object wrapped in a single `Proxy` for the whole life of the app (cached
  in a `WeakMap`).
- `track` records dependencies while each effect runs.
- `trigger` re-runs only the effects that depend on the changed key.
- If `_.usuario.nombre` changes, only the nodes that read `usuario.nombre`
  update. The rest of the tree is untouched.
- `:each` is granular: changing `_.usuarios[3].nombre` only updates row 3; `push`
  adds a row; `splice` reorganizes the affected elements.
- Each effect re-registers its dependencies on every run (with a prior cleanup).

## Expression compilation

```js
compile(expr)  // returns a cached function: with(ctx) { return (expr) }
compileAssign(expr)  // returns: with(ctx) { expr = value }
```

Each expression is compiled **once** and cached by key. `Function` objects are
never created repeatedly, even with many identical directives.

## `<template>` for :if and :each

The original node is not cloned nor left as a "ghost". The element to render is
always `<template>`, replaced in the DOM by:

```text
<!-- menut:if -->  ...content...  <!-- /menut:if -->
<!-- menut:each --> ...instances...  <!-- /menut:each -->
```

The original `<template>` is removed from the DOM and kept as the source for
cloning its `.content` on each render.

## Scan & mount

```js
scan(node, ctx, effects)
```

- A single initial DOM walk.
- Already-processed nodes are marked with a `Symbol` so they are not re-processed.
- `mount()` is idempotent and re-scanable: after inserting dynamic HTML, just
  call `_.mount(container)`, and only the new nodes are processed.
- There is no `MutationObserver`: the user calls `_.mount(node)` when inserting
  new HTML.

## Code rules

- A single file: `menut.js`.
- No classes (`class`), only functions and objects.
- No dependencies.
- No build step.
- No TypeScript.
- A single global: `window._`.
- Every function roughly ≤ 30 lines.
- Zero cryptic abbreviations.
- A single initial DOM walk.
- Readable code over short code.
- Fair comments.
- No premature optimizations.
- No temporary hacks: if something forces the core to get complicated, it is
  redesigned before continuing.
- `_.mount()` can be called multiple times.

## Components (SFC)

A stage after the core. Menut lets you **package reusable functionality** into
single-file components, declared in HTML with `<define-component>` and used as
custom elements. The reactive core does not change: a component instance is a
`mount()` against a **local state**.

```html
<!-- inline definition -->
<define-component name="x-counter">
  <template count:number="0">
    <style>:host { display: block } button { font-weight: 600 }</style>
    <button :on.click="inc()">Clicks: <span ::="count"></span></button>
    <script>this.inc = () => this.count++</script>
  </template>
</define-component>

<!-- external definition (tag derived from the filename) -->
<define-component src="components/x-counter.html"></define-component>

<!-- usage (requires a prior definition) -->
<x-counter></x-counter>
<x-counter count="10"></x-counter>
```

Design decisions:

- **Explicit definition**: `<define-component>` (inline with `name`, or external
  with `src`) leaves the component defined; a usage without a definition stays
  empty.
- **Light DOM by default** (no shadow); `shadowrootmode="open"` opts into shadow.
- **Isolated local state**: the template binds to the instance state; `_` is
  local and the global is accessed as `window._` (no automatic fallback).
- **`this` in the `<script>`** is the instance reactive state. The script runs
  in `connectedCallback`, **after rendering the template**, so it can touch the
  DOM via `this.el`; limits: synchronous (no top-level `await`) and geometry
  unreliable before the first paint.
- **FormAssociated**: each instance does `this.el._internals = attachInternals()`
  (if available; otherwise `null`), exposing `ElementInternals` for
  `setFormValue()`, `setValidity()`/`reportValidity()`, `form` and `states`.
- **Props by attribute** `name:type="default"` with coercion, reflection of
  primitives to the attribute and `onpropchange`. Arrays/objects are
  property-only.
- **The `<script>` and `<style>` go INSIDE the `<template>`**: that way they are
  inert at parse time (the browser never runs them) and are extracted at
  definition.
- **External support**: `<define-component src="x-*.html">` does `fetch` +
  `DOMParser` (which never runs scripts) and registers; waiting instances are
  booted when it arrives.
- Props, the `<script>` and the `<style>` are not cloned per instance; the
  `<style>` is injected once with scope in light DOM (`tag { … }` with CSS
  nesting; `:host`→tag and `@keyframes` hoisted to the top level).
- `_.define(tag, html, props?)` is the equivalent programmatic API.

v1 limits: the `<script>` is synchronous (no top-level `await`); prop names are
lowercase (HTML attributes are case-insensitive). Geometry measurements
(`getBoundingClientRect`, `offset*`) are unreliable before the first paint.

## Discarded decisions (and why)

| Idea | Reason for discarding |
|------|-----------------------|
| `v-scope` / scopes | Replaced by the single global state `window._`. |
| `{{...}}` | Cost of keeping it reactive (splitting text nodes, parsing); explicit HTML with `:text` is preferable. |
| `:show` | Redundant: `:hidden="!activo"` already exists with the generic binding. |
| Event modifiers (`.prevent`, `.stop`...) | More parsing; do `event.preventDefault()` in the function. |
| Special `:class` syntax (objects/arrays) | Just JS expressions: `:class="ok ? 'a' : ''"`. |
| Objects for `:style` | Only CSS strings. |
| `$refs`, `$el`, `$parent`, `$nextTick` | Not needed with a single state. |
| `v-effect` | Adds nothing with granular reactivity. |
| `MutationObserver` | The user calls `_.mount(node)` when inserting HTML. |
| Keys for `:each` | Simplicity is kept; the list re-renders with the affected row. |

## Name

Menut (Valencian: "small"). Inspired by Fixi. The files use `menut.js`.

## Meta

Size target: about **600 lines** in `menut.js`, readable in one sitting. All
complexity must concentrate in `TemplateBinding` (`:if`/`:each`).
