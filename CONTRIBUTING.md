# Contributing to Menut

Thanks for your interest in contributing! Menut grows primarily through **new components** contributed by the community.

## Quick start

1. **Fork** the repo and create a branch: `git checkout -b my-component`
2. **Copy** `components/_template.html` → `components/your-name.html`
3. **Implement** following the conventions below
4. **Add a demo** to `examples/components.html` in the right category section
5. **Open a PR** — the automated checks will run

## What is a Menut component?

A single `.html` file containing:

- A **doc comment** with `@component`, `@category`, `@description`, `@usage`, `@impl`
- A `<template>` (light DOM by default, or `<template shadowrootmode="open">` for shadow)
- Optional `<style>` and `<script>` inside the template

That's it. No build step, no imports, no dependencies. The loader (`menut.js`) registers it as a custom element when `<define-component src="...">` is processed.

## Doc comment format

Every component **must** start with this comment (see `components/_template.html`):

```html
<!--
  @component your-name
  @category forms
  @description One-line summary of what it does.
  @usage <your-name prop="value"></your-name>
  @impl How it works internally: events, observers, reactivity, cleanup.
-->
```

### `@category` (required)

One of the canonical categories:

| Value      | Section                |
|------------|------------------------|
| `forms`    | Forms & inputs         |
| `data`     | Progress & data        |
| `text`     | Text effects           |
| `buttons`  | Buttons & feedback     |
| `layout`   | Layout & nav           |
| `3d`       | 3D & images            |
| `content`  | Content & actions      |

## Naming conventions

- **kebab-case**, single word prefix for families: `x-stepper`, `x-rating`, `x-tilt`
- Bare names (no prefix) for domain-specific components: `theme-switch`, `drag-list`, `date-picker`
- The filename matches the tag name: `theme-switch.html` → `<theme-switch>`

## Light DOM vs Shadow DOM

| Use **light DOM** (default) when…          | Use **shadow DOM** when…                 |
|--------------------------------------------|-------------------------------------------|
| The component is a wrapper around native elements (e.g. `input-enhanced`) | The component needs visual encapsulation |
| You want external CSS (framework styles) to apply to inner elements       | You ship self-contained styles            |
| You want `:user-valid`, `:focus`, etc. to work natively                   | You want to hide internal DOM structure   |

**Rule of thumb:** if the component is a "better version" of a native element, use light DOM. If it's a self-contained widget, use shadow DOM.

## Props

Typed props are declared on the `<template>` tag:

```html
<template value:number="0" step:number="1" label:string="">
```

Types: `string`, `number`, `boolean`, `array`, `object`.

Inside the `<script>`, `this` is the reactive state and `this.el` is the host element:

```html
<script>
const host = this
const el = host.el
// host.value, host.step, host.label are reactive props
// host.signal is an AbortController signal for cleanup
host.onpropchange = (name, value) => { /* react to prop changes */ }
host.ondisconnected = () => { /* cleanup */ }
</script>
```

## Event listeners & cleanup

**Always** use `{ signal: host.signal }` when adding listeners — the framework aborts the signal on disconnect, so you don't leak:

```js
input.addEventListener('input', handler, { signal: host.signal })
window.addEventListener('scroll', onScroll, { signal: host.signal })
```

For `MutationObserver`, `IntersectionObserver`, etc., disconnect in `host.ondisconnected`:

```js
host.ondisconnected = () => { observer.disconnect() }
```

## Security checklist

The automated checker enforces these, but review them yourself:

- [ ] No `eval()`, `new Function()`, `document.write()`
- [ ] No `<script src="...">` — scripts are inline only
- [ ] No `innerHTML` with user-controlled data (use `textContent` or sanitization)
- [ ] No `fetch()` to non-CDN origins
- [ ] No secrets, API keys, or credentials in the code
- [ ] Event listeners use `{ signal: host.signal }` or are cleaned up in `ondisconnected`

## Adding a demo to `examples/components.html`

Find the `<section>` matching your `@category` and add a `<div class="demo">`:

```html
<div class="demo">
  <h3>your-name</h3>
  <p class="usage">&lt;your-name prop="value"&gt;</p>
  <div class="stage">
    <your-name prop="value"></your-name>
  </div>
  <p class="note">Optional explanation.</p>
</div>
```

Also add a `<define-component>` line near the top of the file:

```html
<define-component src="../components/your-name.html"></define-component>
```

## Verification

When you open a PR, the `verify-component` workflow runs:

1. **Static checks** (always): banned patterns, required fields, valid JS syntax
2. **AI review** (if configured): semantic review for security, idiomatic Menut, memory leaks

The check must pass before merge. Fix any reported issues and push again.

## Questions?

- Open an issue with the `component-request` template to propose a component without implementing it
- Look at existing components in `components/` for examples
- The full API reference is in `docs/api.md`
