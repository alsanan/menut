# Menut

[![Live showcase](https://img.shields.io/badge/showcase-live-blue)](https://alsanan.github.io/menut/)
[![Contributing](https://img.shields.io/badge/contributions-welcome-green)](CONTRIBUTING.md)

Menut is an HTML-first reactive micro-framework, in a single file with no
dependencies, sharing the philosophy of [Fixi](https://github.com/bigskysoftware/fixi).
Its size target is around 600 lines.

- A single state: `window._`.
- A single entry point: `_.mount()`. `_` is the only global.
- One file, no build, no compilation, no Virtual DOM.

## Installation

```html
<script src="menut.js"></script>
```

For production you can use the minified version (`menut.min.js`), generated with
esbuild. It is exactly the same library, without comments or whitespace:

```html
<script src="menut.min.js"></script>
```

> The `menut.js` source is heavily commented: every function and every
> non-obvious line explains what it does and why. The «How to read this file»
> section in the header shows the recommended reading order.

## Example

```html
<input :model="name">

<h1 ::="name"></h1>

<ul>
  <template :each="users">
    <li>
      <span ::="item.name"></span>
      <button :on.click="remove(item._index)">Remove</button>
    </li>
  </template>
</ul>

<button :on.click="add()">Add</button>

<script src="menut.js"></script>
<script>
window._ = {
    name: "Ana",
    users: [{ name: "Ana" }, { name: "Luis" }],

    add() {
        _.users.push({ name: "New" });
    },

    remove(i) {
        _.users.splice(i, 1);
    }
};

_.mount();
</script>
```

`window._` is wrapped in a reactive `Proxy` at assignment time, so `_.mount()`
is available right after. There is no `window.Menut`.

## Documentation

- [Live showcase](https://alsanan.github.io/menut/) — interactive component gallery
- [API & directives](docs/api.md)
- [Component gallery](docs/components.md) — auto-generated reference
- [Design specification](docs/spec.md)
- [Contributing](CONTRIBUTING.md) — how to propose new components

## Component library

Menut ships with a growing library of single-file components in `components/`.
Browse them in the [live showcase](https://alsanan.github.io/menut/examples/components.html)
or read the [auto-generated reference](docs/components.md).

Categories: `forms` · `data` · `text` · `buttons` · `layout` · `3d` · `content`

To propose a new component, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Examples

- [Counter](examples/counter.html)
- [Todo](examples/todo.html)
- [Table](examples/table.html)
- [Forms](examples/forms.html)
- [Components (SFC)](examples/components.html)
- [Transitions (:transition)](examples/transition.html)
- [Nested :each](examples/nested.html)
- [Granular reactivity](examples/granular.html)
- [Focus is kept](examples/focus.html)

## Tests

Open `test/index.html` in a browser.
