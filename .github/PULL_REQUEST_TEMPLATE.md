## What does this PR add?

<!-- e.g. "New component: x-foo — a foo widget for doing bar" -->

## Component details

- **Component name:** ``
- **Category:** <!-- forms | data | text | buttons | layout | 3d | content -->
- **Light DOM or Shadow DOM:**

## Checklist

- [ ] File is in `components/your-name.html`
- [ ] Doc comment has `@component`, `@category`, `@description`, `@usage`, `@impl`
- [ ] `@category` is one of: `forms`, `data`, `text`, `buttons`, `layout`, `3d`, `content`
- [ ] No `eval()`, `new Function()`, `document.write()`
- [ ] No `<script src="...">` (inline scripts only)
- [ ] No `innerHTML` with user-controlled data
- [ ] Event listeners use `{ signal: host.signal }` or cleaned up in `ondisconnected`
- [ ] No secrets, API keys, or credentials
- [ ] Demo added to `examples/components.html` in the right category section
- [ ] `<define-component src="../components/your-name.html">` added to `examples/components.html`
