"use strict";

/* ============================================================================
   Menut — HTML-first reactive micro-framework

   A single file, no dependencies, no build, no Virtual DOM. Inspired by Fixi
   and the essence of petite-vue. The full specification lives in docs/spec.md;
   the directive reference in docs/api.md.

   ----------------------------------------------------------------------------
   THE IDEA IN 30 SECONDS
   ----------------------------------------------------------------------------
   The whole JavaScript "API" is:

       window._ = { ... };   // the global state
       _.mount();            // the only entry point

   Assigning `window._` wraps it in a reactive Proxy and injects the helpers
   (`mount`, `define`, `qry`, `net`, ...). `_.mount()` walks the DOM looking for
   attributes starting with `:`. Each attribute creates a "binding" (an effect)
   that knows how to read the state and paint it into the DOM. When a state
   property changes, only the effects that read it re-run. No re-rendering of
   the whole tree.

   The pipeline is always the same:

       read expression → with `with(context)` → the Proxy records the dependency
       → the binding paints the node → and when something changes, trigger()
       re-runs only the affected effects.

   ----------------------------------------------------------------------------
   HOW TO READ THIS FILE
   ----------------------------------------------------------------------------
   Sections are ordered bottom-up by level of abstraction:

   1.  REACTIVITY    — the core: Proxy, track/trigger, effect.
   2.  EXPRESSIONS   — how `:text="..."` is evaluated (compiler with cache).
   3.  SETTERS       — how each directive "paints" a value into a node.
   4.  BINDINGS      — the pieces that connect state ↔ DOM.
   5.  TEMPLATE      — :if / :each, the only directives that restructure the DOM.
   6.  SCANNER       — the DOM walk that creates every binding.
   7.  MOUNT         — the only public entry point.

   Expression context (see spec):
       _                     the global state
       item, _index, _parent inside :each
       event, this           only in :on.* (this = the element that fired the event)
   ----------------------------------------------------------------------------
   */

// IIFE: everything stays in a private scope. The ONLY global is `window._`
// (installed via accessor at the bottom), which carries mount/define/helpers.
(() => {

    // ------------------------------------------------------------------------
    // FRAMEWORK INTERNAL STATE
    // ------------------------------------------------------------------------

    // cache:  Map(expression → compiled function). Each expression is compiled
    // only once. It avoids creating thousands of `Function` objects if the same
    // expression appears in many directives (e.g. `:text="name"` in 50 nodes).
    const cache = new Map();

    // deps:  WeakMap(root object → Map(key → Set(effects))).
    // It is the dependency graph: which effects depend on what (object, key).
    // - WeakMap: the keys are objects; if an object is no longer used, the
    //   collector can free it along with its dependencies (no leaks).
    // - The second-level "key" is the property name (e.g. "name").
    // - The Set holds the effects that read that property.
    // Visual example:
    //   _.user.name = "X"  →
    //   deps:  {user} → {name: Set(h1Effect, inputEffect, ...)}
    const deps = new WeakMap();

    // proxies:  WeakMap(original object → its Proxy).
    // Guarantees each object has EXACTLY ONE Proxy during the app's lifetime.
    // Without this, `reactive()` would create repeated proxies and identity
    // would break (a === b would fail or reactivity would double up).
    const proxies = new WeakMap();
    // proxiesSet:  WeakSet with every Proxy created by Menut. Lets the
    // `window._` setter detect "already wrapped" objects without marking the
    // raw objects (marking them would disturb operations like array splice).
    const proxiesSet = new WeakSet();

    // mounted:  Symbol used to mark already-processed DOM nodes.
    // `mount()` is idempotent: on a second call, marked nodes are skipped.
    // This lets you insert dynamic HTML and call `_.mount(node)` to
    // process only the new nodes.
    const mounted = Symbol("mounted");

    // currentEffect:  "pointer" to the effect currently running.
    // It is the heart of dependency tracking: when an effect reads a state
    // property, `track()` points here. There is only one "current" effect at a
    // time; `effect()` is in charge of saving/restoring the previous one.
    let currentEffect = null;

    // state:  the framework's internal state. `state._` is the reactive version
    // of `window._`. It is stored here (and not re-read from `window._` on each
    // mount) so that wrapping the state only happens the first time.
    const state = { _: null };

    // ------------------------------------------------------------------------
    // COMPONENTS — internal state (SFC with <define-component>)
    // ------------------------------------------------------------------------

    // components:  Map(tag → definition). A definition is
    //   { template, script, style, propDefs, propNames, propMap, shadow }.
    const components = new Map();
    // loading:  Set of tags currently being loaded via <define-component src>.
    const loading = new Set();
    // pending:  Map(tag → Set(elements)) waiting for their src to load.
    const pending = new Map();
    // injectedStyles:  Set of tags whose <style> has already been injected (once).
    const injectedStyles = new Set();
    // componentState:  Symbol that holds the reactive state of each instance.
    const componentState = Symbol("menut.state");
    // componentAbort:  Symbol on the element holding its AbortController, so
    // that disconnecting the element aborts its `signal` (releasing every
    // listener added with `{ signal: this.signal }`).
    const componentAbort = Symbol("menut.abort");

    // ==========================================================================
    // 1. REACTIVITY — the core
    // ==========================================================================

    /**
     * Returns the reactive version (Proxy) of an object or array.
     *
     * - Non-objects (null, number, string, function...) are returned as-is.
     * - DOM nodes are returned as-is: they are NOT wrapped in a Proxy, otherwise
     *   `_.ref.name` would return a Proxy of the element instead of the element,
     *   breaking comparisons and identity.
     * - If the object already has a Proxy (it is in `proxies`), that one is
     *   returned.
     * - Otherwise a Proxy is created and cached in `proxies`.
     *
     * Design note: nested objects are wrapped lazily. The `get` trap returns
     * `reactive(target[key])`, so a sub-object only becomes a Proxy when someone
     * reads it. This is what lets reactivity reach any depth without pre-walking
     * the state.
     */
    function reactive(obj) {
        if (!obj || typeof obj !== "object") return obj;
        if (obj.nodeType != null) return obj;      // DOM nodes: do not wrap
        if (proxies.has(obj)) return proxies.get(obj);
        // Platform objects with internal slots (AbortSignal, Map, Set, Promise…)
        // must not be proxied — their methods rely on private internals.
        if (typeof obj[Symbol.toStringTag] === "string") return obj;

        const proxy = new Proxy(obj, {
            // GET: any property read...
            get(target, key) {
                // ...is recorded as a dependency of the current effect.
                track(target, key);
                // The value is also returned reactive (lazy wrapping).
                return reactive(target[key]);
            },
            // SET: any write...
            set(target, key, value) {
                // ...is stored in the original object (Proxies store nothing
                // themselves; they are just an observation layer)...
                target[key] = value;
                // ...and the effects that depended on that property are notified.
                trigger(target, key);
                return true;   // signal the write succeeded
            }
        });

        proxies.set(obj, proxy);
        proxiesSet.add(proxy);
        return proxy;
    }

    /**
     * Records that `currentEffect` depends on `(target, key)`.
     *
     * Only works when there is an effect running (`currentEffect`). Reads that
     * happen outside an effect (e.g. inside a `_` method invoked by an event)
     * do not register dependencies.
     *
     * Data structure (3 levels):
     *     deps:  WeakMap(object → Map(key → Set(effects)))
     *
     * Additionally, the effect keeps a reverse index in `effect.dependencies`
     * (a list of {effects, effect}). That index is what later enables
     * `dispose()`: removing the effect from ALL the Sets it was registered in.
     */
    function track(target, key) {
        const effect = currentEffect;
        if (!effect) return;

        // Level 1: get this object's key Map.
        let targetMap = deps.get(target);
        if (!targetMap) deps.set(target, (targetMap = new Map()));

        // Level 2: get the Set of effects for this particular key.
        let effects = targetMap.get(key);
        if (!effects) targetMap.set(key, (effects = new Set()));

        // Level 3: add the effect (if not already present).
        if (!effects.has(effect)) {
            effects.add(effect);
            // Reverse index to be able to un-register the effect later.
            effect.dependencies.push({ effects, effect });
        }
    }

    /**
     * Re-runs all the effects that depend on `(target, key)`.
     *
     * It iterates a COPY of the Set (`[...effects]`) because re-running an
     * effect can register/remove dependencies and mutate the Set during
     * iteration (same technique Vue uses).
     */
    function trigger(target, key) {
        const targetMap = deps.get(target);
        if (!targetMap) return;

        const effects = targetMap.get(key);
        if (!effects) return;

        for (const effect of [...effects]) effect.run();
    }

    /**
     * Creates a reactive effect: runs `fn` now and re-runs it every time any of
     * the properties `fn` read change.
     *
     * Returns the "runner" (the function that re-runs the effect), which also
     * serves as a handler: `trigger()` calls `effect.run()`.
     *
     * The runner does three things on each execution:
     *   1. `dispose(runner)`  — clears the dependencies from the previous run,
     *      because dependencies can change between runs (e.g. a
     *      `:if="a ? x : y"` reads `x` or `y` depending on the value of `a`).
     *   2. `previous = currentEffect; currentEffect = runner` — declares itself
     *      the current effect so `track()` assigns the reads it makes.
     *   3. Runs `fn()` and restores the previous effect. Saving/restoring
     *      supports nested effects (a :each inside an :if, etc.): when a child
     *      effect finishes, the parent becomes "current" again.
     *
     * It runs immediately once (so the DOM reflects the initial state).
     */
    function effect(fn) {
        const runner = () => {
            dispose(runner);                 // remove old dependencies
            const previous = currentEffect;  // remember the parent effect
            currentEffect = runner;          // declare as the current effect
            try { fn(); }                    // run (reads get tracked)
            finally { currentEffect = previous; }   // restore even if fn throws
        };
        runner.run = runner;                 // trigger() calls effect.run()
        runner.dependencies = [];            // reverse index (see track)
        runner.children = [];                // subtree effects (see :if/:each)
        runner();                            // immediate first run
        return runner;
    }

    /**
     * Un-registers an effect from every dependency Set it was recorded in
     * (thanks to the reverse index `effect.dependencies`).
     */
    function dispose(effect) {
        for (const dep of effect.dependencies) {
            dep.effects.delete(effect);
        }
        effect.dependencies.length = 0;
    }

    /**
     * Like `dispose()`, but recursive: it cleans up an effect and also the
     * effects of its subtree (`effect.children`). Used by the template bindings
     * (:if/:each) so no orphan effects remain when their content is destroyed —
     * e.g. the rows of an :each inside an :if that gets hidden.
     */
    function disposeTree(effect) {
        dispose(effect);
        for (const child of effect.children) disposeTree(child);
        effect.children.length = 0;
    }

    // ==========================================================================
    // 2. EXPRESSIONS — compiling `:text="..."` with cache
    // ==========================================================================

    /** Compiled-function cache lookup: compiles once per key, reuses after. */
    function cached(key, make) {
        let fn = cache.get(key);
        if (!fn) {
            fn = make();
            cache.set(key, fn);
        }
        return fn;
    }

    /**
     * Compiles an expression into a reusable function:
     *
     *     fn(context)  →  with `with (context) { return (expression) }`
     *
     * Thanks to `with`, inside the expression you can write `name` instead of
     * `_.name`: the identifier resolves against `context`, and since the
     * prototype of `context` is the reactive Proxy, every read goes through the
     * `get` trap and is recorded as a dependency. That is the trick that ties
     * the convenient syntax to granular reactivity.
     *
     * Each expression is compiled ONCE (cache keyed by expression text).
     *
     * CSP note: functions are created with `new Function`, so if you use a
     * Content-Security-Policy, `script-src` must include 'unsafe-eval'.
     */
    function compile(expression) {
        return cached(expression, () =>
            new Function("context", `with (context) { return (${expression}); }`));
    }

    /**
     * Like `compile`, but for EVENTS (`:on.*`): the value is evaluated inside an
     * ASYNC function, so it can use `await` and PLAIN MULTI-STATEMENT JavaScript
     * (sentences separated by `;`, `switch`, etc.):
     *
     *     fn(context)  →  (async () => { with (context) { code } })()
     *
     * Unlike `compile`, the code is NOT wrapped in `return (...)`: it runs as a
     * statement block, because an event handler's return value is discarded
     * anyway. Single expressions keep working (`count = count + 1`, `save(item)`),
     * as does the comma form `(a, b)`.
     *
     * The `with` is INSIDE the async body (allowed: async bodies are not strict
     * by default), so bare identifiers still resolve against the context and
     * `this` (the element) is preserved because the arrow captures the `this`
     * of the outer function.
     *
     * Real-world example:
     *   :on.click="event.preventDefault(); _.qry('#c').innerHTML = marked.parse(await _.net.get('doc.md'))"
     *
     * `fn` returns the Promise; the listener ignores it (fire-and-forget). If
     * the code throws asynchronously it becomes an unhandled rejected Promise
     * (add a `.catch(...)` inside if you care).
     */
    function compileEvent(expression) {
        return cached("await " + expression, () =>
            new Function(
                "context",
                `return (async () => { with (context) { ${expression} } })();`
            ));
    }

    /**
     * Like `compile`, but for ASSIGNING (used by :model):
     *
     *     fn(context, value)  →  with `with (context) { expression = value }`
     *
     * Writes to a state property. The assignment resolves through the prototype
     * chain of `context` up to the reactive Proxy, so it fires the `set` trap
     * and, with it, `trigger()`.
     */
    function compileAssign(expression) {
        return cached("=" + expression, () =>
            new Function("context", "value", `with (context) { ${expression} = value; }`));
    }

    /**
     * Builds the context object used to evaluate expressions.
     *
     * - Its PROTOTYPE is `base` (usually the state Proxy). Thus an identifier
     *   like `name` resolves by walking up the prototype chain to the Proxy →
     *   guaranteed reactivity.
     * - Its OWN PROPERTIES are the extra variables: `_` (the state, always),
     *   and where applicable `item`, `event`, `_index`, `_parent`...
     *
     * `underscore` lets `_` point to a DIFFERENT state than the global one: in
     * an SFC component, `_` is the instance local state (the global stays
     * reachable as `window._`).
     *
     * Why `Object.defineProperty` and NOT `Object.assign`:
     *   if the prototype is a Proxy with a `set` trap, assigning `ctx.item = ...`
     *   with `Object.assign` would end up invoking the Proxy's trap (the Proxy
     *   looks like a "setter" on the prototype chain) instead of creating the
     *   property on `ctx`. With `defineProperty` the property is always created
     *   on `ctx`.
     *   (Real bug found during development: every :each row read the last
     *   `item` because of this.)
     */
    function contextFor(base, extra, underscore = state._) {
        const context = Object.create(base);
        const props = { _: underscore, ...extra };
        for (const key in props) {
            Object.defineProperty(context, key, {
                value: props[key],
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
        return context;
    }

    // ==========================================================================
    // 3. SETTERS — how each directive "paints" a value
    // ==========================================================================

    // A setter is a function `(el, value)` that only knows "how to apply a
    // value to a node". The reactivity lives outside: a binding just does
    // `setter(node, get(context))` inside an effect(). That is why adding a new
    // directive can be as simple as adding a setter to this registry.
    const setters = {
        // :text and ::  →  escaped text.
        // `String(...)` forces coercion to text (in some DOMs a number assigned
        // directly to textContent would be lost).
        text(el, value) {
            el.textContent = String(value ?? "");
        },
        // :html  →  unescaped HTML. Careful with untrusted content.
        html(el, value) {
            el.innerHTML = String(value ?? "");
        }
    };

    /**
     * Generic setter for any attribute (`:class`, `:src`, `:value`, ...).
     *
     * If the name is a REAL property of the element (declared on its
     * prototype: `value` on inputs, `checked`, `disabled`, `style`, `src`,
     * `href`...) the property is assigned; otherwise (`class`, `aria-*`, or
     * props of custom elements) `setAttribute` is used. So `:value="name"`
     * updates `el.value` on native inputs and writes the `value` ATTRIBUTE on
     * custom elements (their props are read from attributes by Menut).
     *
     * The prototype check (instead of `name in el`) matters: an expando
     * property created on a custom element (e.g. `el.value = n`) must NOT make
     * `:value` switch to property assignment, or the component would stop
     * receiving attribute updates.
     */
    function attributeSetter(name) {
        return (el, value) => {
            const v = value ?? "";
            const proto = el && Object.getPrototypeOf(el);
            if (proto != null && name in proto) { el[name] = v; return; }
            // Boolean values toggle the attribute by presence (e.g. `:solid` →
            // `[solid]` only when truthy; never `solid="false"`).
            if (typeof v === "boolean") { el.toggleAttribute(name, v); return; }
            el.setAttribute(name, v);
        };
    }

    // ==========================================================================
    // 4. BINDINGS — the pieces that connect state ↔ DOM
    // ==========================================================================

    // --- :transition (View Transitions) --------------------------------------
    // Minimal support: `:transition`, `:transition.mod`, `:transition.shared`.
    // `setupVT` only REMEMBERS the opt-in (name + modifier); the actual
    // `view-transition-name` is applied dynamically during the transition and
    // removed when it ends, so only elements that CHANGED animate.
    // `vt` COALESCES every update of the same synchronous burst into ONE
    // document transition (batched at the next microtask): e.g. two `:if` in a
    // `:transition` container swap inside a single capture, and added rows are
    // painted inside the callback (so the new state is captured). The paints
    // happen in the transition's update callback; if the browser never invokes
    // it, a timeout fallback applies them anyway. `vt` never throws, so
    // reactivity is never corrupted.
    let vtSeq = 0;
    let vtStyleInjected = false;
    let vtBatch = [];
    let vtScheduled = false;
    // Disables the default whole-page cross-fade so only the `view-transition-name`d
    // elements animate (otherwise every :transition flashes the entire document).
    function injectVTStyle() {
        if (vtStyleInjected) return;
        vtStyleInjected = true;
        const style = document.createElement("style");
        style.textContent = "::view-transition-old(root),::view-transition-new(root){animation:none}";
        document.head.appendChild(style);
    }
    function setupVT(node, mod, shared) {
        if (!document.startViewTransition) return;
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        injectVTStyle();
        node.dataset.vt = shared || (node.dataset.vt || "vt-" + (++vtSeq));
        node.dataset.vtMod = mod || "";
        node.__vt = true;
    }
    /** Nearest ancestor opted into `:transition` (the template may sit inside a
     *  wrapper like a <ul>, while the `:transition` is on the outer container). */
    function vtHost(node) {
        let n = node.parentElement;
        while (n) {
            if (n.__vt) return n;
            n = n.parentElement;
        }
        return null;
    }
    function vt(node, fn) {
        if (node && node.__vt && document.startViewTransition) {
            vtBatch.push({ node, fn });
            if (!vtScheduled) {
                vtScheduled = true;
                queueMicrotask(flushVT);
            }
        } else fn();
    }
    function flushVT() {
        vtScheduled = false;
        const items = vtBatch;
        vtBatch = [];
        // Aplica o libera (en el mismo lote) el nombre/clase de la transición.
        const opt = (on) => {
            for (const it of items) {
                it.node.style.viewTransitionName = on ? it.node.dataset.vt : "none";
                if (it.node.dataset.vtMod) {
                    if (on) it.node.style.viewTransitionClass = it.node.dataset.vtMod;
                    else it.node.style.removeProperty("view-transition-class");
                }
            }
        };
        let applied = false;
        const applyAll = () => {
            if (applied) return;      // the update runs exactly once
            applied = true;
            for (const it of items) {
                try { it.fn(); }
                catch (err) { console.warn("Menut: transition update threw", err); }
            }
        };
        // settle: ruta única de release — aplica el update (si el navegador
        // nunca invoca el callback) y libera los nombres al terminar. Se llama
        // al acabar la transición, como red ante un `finished` colgado, o al
        // fallar; siempre es idempotente.
        const settle = () => { applyAll(); opt(false); };
        opt(true);   // opta en los elementos ANTES de capturar el estado viejo
        try {
            const t = document.startViewTransition(applyAll);
            setTimeout(settle, 400);
            if (t && t.finished) t.finished.then(settle, settle);
            else settle();
        } catch (err) {
            console.warn("Menut: transition skipped", err);
            settle();
        }
    }

    /** Like `effect()`, but the FIRST run paints directly (initial mount, no
     *  animation) and only later runs are wrapped in `vt`.
     *
     *  `read()` must be a SYNCHRONOUS state read: it runs in the effect body
     *  (registering the dependencies) and its result is passed to `paint(v)`,
     *  which is the DOM-only mutation (safe to defer inside startViewTransition).
     *  Reading state inside the VT callback would lose the dependencies when the
     *  callback is deferred — the binding would never re-render again. */
    function vtEffect(node, read, paint) {
        let first = true;
        return effect(() => {
            const v = read();
            if (first) { first = false; paint(v); }
            else vt(node, () => paint(v));
        });
    }

    /**
     * ONE-way binding (state → DOM): `:text`, `:html`, `:attribute`.
     *
     * Creates an effect() that, each time one of the properties it read
     * changes, re-evaluates the expression and applies the value with the
     * setter. Returns the effect runner so the scanner can register it and, if
     * it lives inside an :if/:each, dispose it when destroyed.
     */
    function bindValue(node, expression, setter, context) {
        const get = compile(expression);
        return vtEffect(node, () => get(context), v => setter(node, v));
    }

    /**
     * Event binding: `:on.click="save(item)"`.
     *
     * The listener evaluates the expression with:
     *   - `this` = the element that fired the event (hence `get.call(node, ...)`).
     *   - a context that includes `event`.
     * The expression is compiled as ASYNC (see `compileEvent`): it can use
     * `await`, e.g. to fetch content from the server.
     * There are no modifiers (`.prevent`, `.stop`...): call `event.preventDefault()`
     * inside the function, which is what the Fixi style prefers.
     */
    function bindEvent(node, eventName, expression, context) {
        const get = compileEvent(expression);
        node.addEventListener(eventName, (event) => {
            get.call(node, contextFor(context, { event }));
        });
    }

    /**
     * TWO-way binding: `:model="name"` (inputs, textarea, select, checkbox,
     * radio). Optional `:as="type"` on the same element coerces the written
     * value (int/number/bool/array/object; see `coercers`).
     *
     * Two halves:
     *   1. An effect() that paints the control from the state (state → DOM).
     *   2. A listener that writes to the state from the control (DOM → state),
     *      using compileAssign so the write is reactive.
     *
     * The event listened to depends on the control type:
     *   - inputs/textarea → `input` (immediate update while typing).
     *   - select, checkbox, radio → `change`.
     */
    // Coerción para `:as` de `:model` (valores de input): `number` es
    // `parseFloat` (tolerante: "123a" → 123, sin error). `array`/`object` se
    // comparten con los props de componentes.
    const coercers = {
        int: v => parseInt(v, 10),
        number: v => parseFloat(v),
        bool: v => v === "true" || v === "1",
        array: v => { try { return JSON.parse(v); } catch { return []; } },
        object: v => { try { return JSON.parse(v); } catch { return {}; } }
    };

    function bindModel(node, expression, context, asType) {
        const get = compile(expression);
        const set = compileAssign(expression);
        const type = node.type || "";
        const coerce = asType ? coercers[asType] || (v => v) : null;

        // Half 1: state → DOM. `get(context)` runs synchronously (deps); only
        // the paint is wrapped in `vt` (deferred safely inside startViewTransition).
        const update = vtEffect(node, () => get(context), (value) => {
            if (type === "checkbox") {
                node.checked = !!value;
            } else if (type === "radio") {
                node.checked = value === node.value;
            } else {
                // Avoid touching node.value if it has not changed (so the cursor
                // and focus are not lost while the user types).
                const str = value ?? "";
                if (node.value !== str) node.value = str;
            }
        });

        const eventName =
            node.tagName === "SELECT" ||
            type === "checkbox" ||
            type === "radio"
                ? "change"
                : "input";

        // Half 2: DOM → state.
        node.addEventListener(eventName, () => {
            if (type === "checkbox") {
                set(context, node.checked);
            } else if (type === "radio") {
                if (node.checked) set(context, node.value);
            } else {
                set(context, coerce ? coerce(node.value) : node.value);
            }
        });

        return update;   // so it can be disposed if it lives in an :if/:each
    }

    /**
     * Reference binding: `:ref="search"` → `_.ref.search` is the element.
     *
     * `_.ref` is created automatically if it does not exist, so the user never
     * has to initialize it in `window._`. The value of `:ref` is a simple
     * identifier used directly as a key (it is not evaluated as an expression).
     */
    function bindRef(node, name) {
        if (!state._.ref) state._.ref = {};
        state._.ref[name] = node;
    }

    // ==========================================================================
    // 5. TEMPLATE BINDINGS — :if and :each, the only directives that
    //    restructure the DOM
    // ==========================================================================

    // Both :if and :each live on <template>. The <template> is replaced in the
    // DOM by two comments that act as anchors:
    //
    //     <!-- menut:if -->   ...content...   <!-- /menut:if -->
    //     <!-- menut:each --> ...instances...  <!-- /menut:each -->
    //
    // The original <template> is removed from the DOM but kept as an object,
    // because its `.content` (a DocumentFragment) is the source used to clone
    // the content on each render.

    /** Creates an anchor comment. Comments are not rendered and are a stable
     *  reference point for inserting/removing content. */
    function comment(text) {
        return document.createComment("menut:" + text);
    }

    /**
     * Clones the template content and inserts it just before the `end` anchor.
     *
     * - `template.content.cloneNode(true)` clones the DocumentFragment (one
     *   copy per render, so the source is never exhausted).
     * - Each inserted node is scanned (`scan`) so its directives create their
     *   own bindings; the created effects are collected into `effects` so they
     *   can be disposed when this content is destroyed.
     * - Returns the inserted nodes (the top-level ones), so the caller can
     *   remove them later.
     */
    function insertContent(template, end, context, effects) {
        const nodes = [];
        const fragment = template.content.cloneNode(true);
        for (const node of [...fragment.childNodes]) {
            end.before(node);
            nodes.push(node);
            scan(node, context, effects);
        }
        return nodes;
    }

    /** Removes every node between the `start` and `end` anchors. */
    function removeContent(start, end) {
        let node = start.nextSibling;
        while (node && node !== end) {
            const next = node.nextSibling;
            node.remove();
            node = next;
        }
    }

    /**
     * `:if="condition"` on <template>.
     *
     * The effect re-evaluates the condition; if true it inserts the content
     * (and scans it), and if false it removes it and disposes its effects.
     *
     * The content effects are stored in `children` and also linked to
     * `runner.children`, so that if this :if is destroyed from outside (e.g.
     * because it lives inside an :each that re-renders), `disposeTree` can
     * clean them up recursively.
     */
    function bindIf(template, expression, context, effects) {
        const get = compile(expression);
        const start = comment("if");
        const end = comment("/if");
        // Place the anchors where the template was and remove the template.
        // The host (template's former parent) carries `:transition` if present.
        template.before(start);
        template.before(end);
        const host = vtHost(template);
        template.remove();

        let shown = false;     // whether the content is currently in the DOM
        let children = [];     // effects created by the current content
        let first = true;      // first run paints directly (no animation)

        // `run(value)` is DOM-only; the state read happens synchronously below
        // (registering the dependency) so a deferred VT callback never loses it.
        const run = (value) => {
            if (value && !shown) {
                // Show: insert (this also scans and fills `children`).
                children.length = 0;
                insertContent(template, end, context, children);
                shown = true;
            } else if (!value && shown) {
                // Hide: dispose the content effects and remove their nodes.
                for (const effect of children) disposeTree(effect);
                removeContent(start, end);
                children.length = 0;
                shown = false;
            }
        };

        const runner = effect(() => {
            const value = get(context);       // synchronous read (registers deps)
            if (first) { first = false; run(value); }
            else vt(host, () => run(value));
        });

        runner.children = children;   // link for recursive cleanup
        effects.push(runner);         // register in the parent effect (if any)
    }

    /**
     * `:if` / `:else` chain on <template>.
     */
    function bindIfChain(t, ctx, fx) {
        const b = t.map((p, i) => {
            const g = compile(p.hasAttribute(":else") ? "true" : p.getAttribute(":if"));
            const s = comment(i ? "if-" + i : "if"), e = comment("/if" + (i ? "-" + i : ""));
            p.before(s); p.before(e); p.remove();
            return { g, s, e, p };
        });
        let p = -1;
        const h = vtHost(t[0]);
        const r = effect(() => {
            const a = b.findIndex(x => !!x.g(ctx));
            if (p === a) return;
            vt(h, () => {
                if (p >= 0) { for (const f of b[p]._fx) disposeTree(f); removeContent(b[p].s, b[p].e); }
                if (a >= 0) { b[a]._fx = []; insertContent(b[a].p, b[a].e, ctx, b[a]._fx); }
                p = a;
            });
        });
        r.children = [];
        fx.push(r);
    }

    /**
     * `:each="collection"` on <template>.
     *
     * The effect re-runs when the collection changes, but it does NOT re-render
     * everything from scratch: it does an object-identity RECONCILIATION. Rows
     * that already existed (same `item` by reference) are REUSED, so their DOM
     * nodes are not destroyed and DOM state is kept: an input's focus, a scroll
     * position, the value while you type, etc. Only new rows are created, and
     * only rows that disappear are removed.
     *
     *   1. Reads the list (that read is tracked: if `length` changes or the
     *      array is replaced, the effect re-runs).
     *   2. Indexes the current rows in a Map by `item` (object identity).
     *   3. Walks the list in order:
     *      - if the item already has a row, it reuses it (and updates
     *        _index/_parent);
     *      - if it is new, it creates the row: context, insert and scan.
     *      In both cases the row nodes are placed right after the previous row
     *      with `ref.after(...)`. Moving a node in the DOM does not lose focus
     *      (unlike removing it and recreating it).
     *   4. Rows whose item is no longer in the list are removed and their
     *      effects are disposed (`disposeTree`), so no orphan effects remain.
     *
     * Granularity: the ROW bindings read `item.name` and are recorded in their
     * own effects, not in the list's. So changing `_.rows[3].name` only updates
     * row 3, while `push()`/`splice()` (which change `length`/indices) re-run
     * the list runner, which then adds/removes/reorders only the affected rows.
     *
     * `item._index` and `item._parent`:
     *   they are defined as non-enumerable properties on the item itself with
     *   `Object.defineProperty`, and updated on every run (so after a `splice`,
     *   a reused `item` has the correct `_index`). They require the items to be
     *   objects (a primitive cannot have properties defined on it; in that case
     *   use the bare `_index`/`_parent`).
     */
    function bindEach(template, expression, context, effects) {
        const get = compile(expression);
        const start = comment("each");
        const end = comment("/each");
        // The host (template's former parent) carries `:transition` if present.
        template.before(start);
        template.before(end);
        const host = vtHost(template);
        template.remove();

        let instances = [];   // { item, nodes, effects } per row
        let children = [];    // current rows' effects (final cleanup)
        let first = true;     // first run paints directly (no animation)

        // `run(list)` is DOM-only; the list read happens synchronously in the
        // effect body (registering the dependency) so a deferred VT callback
        // never loses it.
        const run = (list) => {
        // --- 1. Index the current rows by item (object identity) --------
        const pool = new Map();
        for (const instance of instances) pool.set(instance.item, instance);
    
        const nextInstances = [];
        // `ref` marks the insertion position: each row is placed right
        // after the previous one (starts at the opening anchor).
        let ref = start;
    
        // --- 2. Walk the list reconciling --------------------------------
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
    
            // Update _index/_parent on the item (non-enumerable: they do
            // not pollute Object.keys or JSON.stringify).
            if (item && typeof item === "object") {
                Object.defineProperty(item, "_index", {
                    value: i, writable: true, enumerable: false, configurable: true
                });
                Object.defineProperty(item, "_parent", {
                    value: list, writable: true, enumerable: false, configurable: true
                });
            }
    
            // Does the item already have a row? Reuse it: the same DOM
            // nodes are kept (and with them the focus of any editing input).
            let instance = pool.get(item);
            if (instance) {
                pool.delete(item);
            } else {
                // New row: row context, insert and scan.
                const rowContext = contextFor(context, {
                    item,
                    _index: i,
                    _parent: list
                });
                const rowEffects = [];
    
                // --- KEY point for granularity ---
                // While the row is scanned we set currentEffect = null.
                // This way the `item.name` reads made by the row bindings
                // are NOT recorded in the LIST effect: they go to each row
                // binding's own effects. Without this, any item change would
                // re-render the whole list.
                const previous = currentEffect;
                currentEffect = null;
                const nodes = insertContent(template, end, rowContext, rowEffects);
                currentEffect = previous;
    
                instance = { item, nodes, effects: rowEffects };
            }
    
            // Place the row in position. It only moves if it is not already
            // right after the previous one (`previousSibling !== ref`): so,
            // in the most common case (appending at the end), existing rows
            // are not touched and an editing input keeps its focus.
            // Moving a node with `after()` does not blur it in real browsers.
            if (instance.nodes.length) {
                if (instance.nodes[0].previousSibling !== ref) {
                    ref.after(...instance.nodes);
                }
                ref = instance.nodes[instance.nodes.length - 1];
            }
    
            nextInstances.push(instance);
        }
    
        // --- 3. Rows no longer in the list -------------------------------
        // Iterate ALL previous instances (not just `pool` leftovers): during
        // a splice's intermediate states two equal primitives can collide in
        // the pool Map and silently evict one, orphaning its nodes.
        const keep = new Set(nextInstances);
        for (const instance of instances) {
            if (keep.has(instance)) continue;
            for (const node of instance.nodes) node.remove();
            for (const effect of instance.effects) disposeTree(effect);
        }

        instances = nextInstances;
    
        // Keep `children` up to date (recursive cleanup if this :each lives
        // inside an :if/:each that gets destroyed). Cleared in place to keep
        // the same reference as runner.children.
        children.length = 0;
        for (const instance of instances) {
            children.push(...instance.effects);
        }
        };

        const runner = effect(() => {
            const list = get(context) || [];   // synchronous read (registers deps)
            // `run` may execute inside a deferred transition callback, where
            // currentEffect is null — so the array `length` dependency must be
            // registered HERE, or the :each stops re-rendering after the first
            // transitioned update (push/splice change length → trigger).
            list.length;
            if (first) { first = false; run(list); }
            else vt(host, () => run(list));
        });

        runner.children = children;   // link for recursive cleanup
        effects.push(runner);         // register in the parent effect (if any)
    }

    // ==========================================================================
    // 6. COMPONENTS — SFC with <define-component> and custom elements
    // ==========================================================================
    //
    // Syntax:
    //
    //   <!-- inline -->
    //   <define-component name="x-counter">
    //     <template count:number="0">
    //       <style>:host{...} button{...}</style>          <!-- optional -->
    //       <button :on.click="inc()">…</button>
    //       <script>this.inc = () => this.count++</script> <!-- optional -->
    //     </template>
    //   </define-component>
    //
    //   <!-- external (the tag comes from the filename) -->
    //   <define-component src="components/x-counter.html"></define-component>
    //
    //   <!-- usage (requires a prior definition) -->
    //   <x-counter></x-counter>
    //
    // Model (decisions taken):
    //   - LIGHT DOM by default (no shadow); `shadowrootmode="open"` opts into shadow.
    //   - The template binds to the instance LOCAL STATE: `_` is local and the
    //     global is `window._` (no automatic fallback to the global).
    //   - `this` inside the <script> is the instance reactive state.
    //   - Props by attribute `name:type` with reflection (primitives) and onpropchange.
    //   - The <script> and <style> go INSIDE the <template> (inert at parse time;
    //     extracted at definition and not cloned per instance).

    // Prop coercion by type suffix (name:type="default"). `number` es `Number`
    // estricto (null → default 0); `array`/`object` comparten la coerción JSON
    // de `coercers`. Sin sufijo se usa `autoType`.
    const propTypes = {
        string: v => v == null ? "" : String(v),
        number: v => v == null ? 0 : Number(v),
        boolean: v => v != null && v !== "false",
        date: v => v == null ? null : new Date(v),
        array: coercers.array,
        object: coercers.object
    };
    function autoType(v) {
        if (v == null) return v;
        if (v !== "" && !isNaN(v)) return Number(v);
        if (v === "true") return true;
        if (v === "false") return false;
        return v;
    }
    // Serializes a primitive to reflect it to the attribute (null = remove attr).
    function serializeProp(v, type) {
        if (v == null) return null;
        if (type === "boolean") return v ? "" : null;
        if (type === "date") return v instanceof Date ? v.toISOString() : String(v);
        return String(v);
    }
    // Parses prop declarations from the template's `name:type` attributes.
    function parseProps(el) {
        const defs = [];
        for (const attr of el.attributes) {
            const i = attr.name.indexOf(":");
            if (i === -1) continue;
            const name = attr.name.slice(0, i);
            const type = attr.name.slice(i + 1);
            const coerce = propTypes[type] || autoType;
            defs.push({ name, type, coerce, default: coerce(attr.value) });
        }
        return defs;
    }

    // Scopes the <style> for light DOM: `:host` → tag and the rest nested in
    // `tag { … }` (CSS nesting). @keyframes and `:host` rules are hoisted to
    // the top level because CSS nesting does not allow them inside a style
    // rule — a `:host { … }` nested in `tag { … }` would become `tag tag { … }`
    // (a nested component) and never match. In shadow DOM the shadow root
    // isolates by itself, so no scoping is needed.
    function scopeCSS(css, tag) {
        // Split the author's style into top-level rules with balanced braces
        // (so `@keyframes` with several frames or `@media` blocks stay intact).
        const rules = [];
        let start = 0, depth = 0;
        for (let i = 0; i < css.length; i++) {
            const c = css[i];
            if (c === "{") depth++;
            else if (c === "}") {
                depth--;
                if (depth === 0) {
                    rules.push(css.slice(start, i + 1));
                    start = i + 1;
                }
            }
        }
        if (start < css.length) rules.push(css.slice(start));

        const hostResolve = (_, sel) => sel ? `${tag}${sel}` : tag;
        const hoisted = [];
        const nested = [];
        for (const rule of rules) {
            const r = rule.trim();
            if (!r) continue;
            if (/^@keyframes/.test(r)) hoisted.push(r);
            else if (/^:host/.test(r)) hoisted.push(r.replace(/:host\b(?:\(([^)]*)\))?/g, hostResolve));
            else nested.push(r);
        }
        // Any leftover `:host` (e.g. inside @media) still resolves to the tag.
        const rest = nested.join("\n").replace(/:host\b(?:\(([^)]*)\))?/g, hostResolve);
        const wrapped = rest.trim() ? `${tag} { ${rest} }` : "";
        return [hoisted.join("\n"), wrapped].filter(Boolean).join("\n");
    }

    /**
     * Registers a component: stores the definition, defines the custom element
     * and injects the style (once) in light DOM. Idempotent.
     */
    function defineComponent(tag, def) {
        if (components.has(tag)) return;   // already defined (re-mount does not redefine)

        components.set(tag, def);

        const C = class extends HTMLElement {
            static formAssociated = true;
            static get observedAttributes() { return def.propNames; }
            constructor() {
                super();
                // Form participation (setFormValue) for components that use it.
                try { this._internals = this.attachInternals(); }
                catch { this._internals = null; }
            }
            connectedCallback() {
                boot(this);
                const state = this[componentState];
                if (state && state.onconnected) state.onconnected();
            }
            disconnectedCallback() {
                // Libera los listeners con `{ signal }` y otras huellas del ciclo
                // de vida antes de avisar al estado.
                const abort = this[componentAbort];
                if (abort) abort.abort();
                const state = this[componentState];
                if (state && state.ondisconnected) state.ondisconnected();
            }
            // Attribute → state (no MutationObserver; the native lifecycle does it).
            attributeChangedCallback(name, oldVal, newVal) {
                const state = this[componentState];
                const pd = def.propMap[name];
                if (!state || !pd) return;
                if (this._menutReflecting) return;
                state[name] = pd.coerce(newVal);
            }
        };

        if (!customElements.get(tag)) {
            try { customElements.define(tag, C); }
            catch (err) { console.warn("Menut: could not define <" + tag + ">:", err.message); }
        }

        // Light DOM: inject the <style> with scope only once.
        if (def.style && !def.shadow && !injectedStyles.has(tag)) {
            injectedStyles.add(tag);
            const style = document.createElement("style");
            style.textContent = scopeCSS(def.style, tag);
            document.head.appendChild(style);
        }

        // Boot the instances that were waiting for this component to load.
        const waiting = pending.get(tag);
        if (waiting) {
            pending.delete(tag);
            for (const el of waiting) boot(el);
        }
    }

    /**
     * Creates a definition from a <template> (the SFC source, both for inline
     * definitions and external files).
     */
    function registerDefinition(tag, tpl) {
        const shadow = tpl.getAttribute("shadowrootmode");
        if (shadow) tpl.removeAttribute("shadowrootmode");

        // Extract <style> and <script> from the content: they are managed
        // separately and NOT cloned per instance (if cloned, every instance
        // would inject a <style> into light DOM → duplicates and style leaks).
        //
        // childNodes are walked instead of using querySelector: in jsdom,
        // querying the content of a <template> with querySelector triggers the
        // execution of its <script> (in real browsers the template content is
        // inert). Enumerating childNodes does not have that effect.
        let styleEl = null;
        let scriptEl = null;
        for (const node of [...tpl.content.childNodes]) {
            if (node.nodeType !== 1) continue;
            if (node.tagName === "STYLE" && !styleEl) styleEl = node;
            else if (node.tagName === "SCRIPT" && !scriptEl) scriptEl = node;
        }
        const style = styleEl ? styleEl.textContent : null;
        const script = scriptEl ? scriptEl.textContent : null;
        if (styleEl) styleEl.remove();
        if (scriptEl) scriptEl.remove();

        const propDefs = parseProps(tpl);
        const propNames = propDefs.map(p => p.name);
        const propMap = {};
        for (const p of propDefs) propMap[p.name] = p;

        defineComponent(tag, { template: tpl, script, style, propDefs, propNames, propMap, shadow });
    }

    /** Tag of an external SFC file: components/x-counter.html → x-counter. */
    function tagFromFilename(src) {
        const base = src.split(/[\/\\]/).pop().split("?")[0];
        return base.replace(/\.html$/i, "");
    }

    /** Processes a <define-component> block (inline with name, or external with src). */
    function processDefineComponent(block) {
        const src = block.getAttribute("src");
        if (src) {
            block.remove();
            loadExternal(src);
            return;
        }
        const name = block.getAttribute("name");
        const tpl = block.querySelector("template");
        if (!name || !tpl) {
            console.warn("Menut: <define-component> needs a `name` and a child <template>.");
            block.remove();
            return;
        }
        // Note: `registerDefinition` is called BEFORE removing the block. In a
        // browser the <template> content is inert (spec); in jsdom a plain
        // <script> inside the template runs if the block is manipulated before
        // being read — that is why the tests use <script type="text/plain">.
        registerDefinition(name, tpl);
        block.remove();
    }

    /** Loads an external SFC (async) and registers the component when it arrives. */
    function loadExternal(src) {
        const tag = tagFromFilename(src);
        loading.add(tag);
        fetch(src)
            .then(r => {
                if (!r.ok) throw new Error("HTTP " + r.status);
                return r.text();
            })
            .then(text => {
                // DOMParser NEVER runs scripts → we control when the <script> runs.
                const doc = new DOMParser().parseFromString(text, "text/html");
                const tpl = doc.querySelector("template");
                if (!tpl) throw new Error("the file does not contain a <template>");
                loading.delete(tag);
                registerDefinition(tag, tpl);
            })
            .catch(err => {
                loading.delete(tag);
                console.warn("Menut: could not load the component <" + tag + ">:", err.message);
            });
    }

    /** mount() pre-pass: registers every <define-component> in the root. */
    function registerDefinitions(root) {
        for (const block of [...root.querySelectorAll("define-component")]) {
            processDefineComponent(block);
        }
    }

    /**
     * Boots a component instance (idempotent): builds the local reactive state
     * (props + <script> methods), clones the template and mounts it.
     */
    function boot(el) {
        const tag = el.tagName.toLowerCase();
        const def = components.get(tag);
        if (!def || el[componentState]) return;
        if (loading.has(tag)) {
            // The src has not loaded yet: register to boot when it arrives.
            if (!pending.has(tag)) pending.set(tag, new Set());
            pending.get(tag).add(el);
            return;
        }

        // --- Local reactive state (props + the element as `el`) ---------------
        const raw = { el };
        const controller = new AbortController();
        el[componentAbort] = controller;
        Object.defineProperty(raw, "signal", {
            value: controller.signal, enumerable: false, configurable: true
        });
        for (const pd of def.propDefs) {
            const attrVal = el.getAttribute(pd.name);
            raw[pd.name] = attrVal != null ? pd.coerce(attrVal) : pd.default;
        }
        // Capture original innerHTML before template replaces it.
        // Exposed as this.default for components that accept slot-like content
        // without shadow DOM (e.g. x-code-highlight).
        Object.defineProperty(raw, "default", {
            value: el.innerHTML, enumerable: false, configurable: true
        });
        // Bidirectional prop reflection helper.
        // state → attribute: serializes and sets/removes the attribute.
        // attribute → state: coerces and assigns to state.
        // Both directions fire `onpropchange`. `_menutReflecting` prevents loops.
        el._reflect = function(name, v, pd) {
            if (!el._menutReflecting) {
                const s = serializeProp(v, pd.type);
                if (s == null) { if (el.hasAttribute(name)) el.removeAttribute(name); }
                else if (el.getAttribute(name) !== s) {
                    el._menutReflecting = true;
                    el.setAttribute(name, s);
                    el._menutReflecting = false;
                }
            }
            if (raw.onpropchange) raw.onpropchange(name, v);
        };
        // Props as accessors with state → attribute reflection.
        // Primitives reflect; array/object do not (property-only).
        for (const pd of def.propDefs) {
            if (pd.type === "array" || pd.type === "object") continue;
            const name = pd.name;
            let value = raw[name];
            Object.defineProperty(raw, name, {
                enumerable: true, configurable: true,
                get() { return value; },
                set(v) { value = v; el._reflect(name, v, pd); }
            });
        }
        const state = reactive(raw);
        el[componentState] = state;

        // --- Render: light DOM (default) or shadow (shadowrootmode) -----------
        // The template is rendered BEFORE running the <script>, so scripts (e.g.
        // converted components from other libraries) can query the DOM right
        // away with `this.el.querySelector(...)`. The scan receives the FRAGMENT
        // (not the component element): this way the `:` attributes of the
        // <x-comp> itself (e.g. :num="item.v") are bound by the parent's scan
        // with its context, not by this scan with the component local state.
        let root = el;
        const isTag = el.getAttribute(":is");
        if (isTag) {
            el.removeAttribute(":is");
            root = document.createElement(isTag);
            el.appendChild(root);
        }
        if (def.shadow) {
            root = el.shadowRoot || el.attachShadow({ mode: "open" });
            if (def.style) {
                const s = document.createElement("style");
                s.textContent = def.style;   // the shadow root already isolates
                root.appendChild(s);
            }
        }
        if (def.template) {
            const frag = def.template.content.cloneNode(true);
            scan(frag, contextFor(state, undefined, state), []);
            root.appendChild(frag);
        }

        // --- Component <script> (this = reactive state; this.el = element) ----
        if (def.script) {
            new Function(def.script).call(state);
        }
    }

    // ==========================================================================
    // 7. SCANNER — the DOM walk that creates every binding
    // ==========================================================================

    /**
     * Walks the DOM (depth-first) from `node` creating the bindings.
     *
     * - Already-processed nodes are marked with the Symbol `mounted` and
     *   skipped: so `mount()` is idempotent and nodes inserted later can be
     *   processed with `_.mount(node)`.
     * - On a <template>: if it has :if/:each it delegates to `bindIf`/`bindEach`
     *   and returns (that template is removed from the DOM and its content is
     *   managed dynamically). If it is a "plain" template, its `.content` is
     *   walked.
     * - On any other element: the `:...` attributes are processed. Each
     *   directive is dispatched to its binding and, when the binding creates an
     *   effect, that runner is stored in `effects` (so it can be disposed if
     *   the node lives inside an :if/:each).
     * - Finally the children are walked (with `[...childNodes]` as a copy, so
     *   nodes inserted during the walk do not affect the iteration).
     */
    function scan(node, context, effects) {
        if (!node || node[mounted]) return;   // already processed → do not touch
        node[mounted] = true;                 // mark before processing

        const processedChain = new Set();

        if (node.nodeType === 1) {            // 1 = element node
            if (node.tagName === "TEMPLATE") {
                for (const attr of node.attributes) {
                    if (attr.name === ":if") {
                        const chain = [node];
                        let next = node.nextElementSibling;
                        while (next && next.tagName === "TEMPLATE"
                               && next.hasAttribute(":else")) {
                            chain.push(next);
                            next = next.nextElementSibling;
                        }
                        for (const t of chain) processedChain.add(t);
                        bindIfChain(chain, context, effects);
                        return;
                    }
                    if (attr.name === ":each") {
                        bindEach(node, attr.value, context, effects);
                        return;
                    }
                }
                // Template without :if/:each → process its content.
                scan(node.content, context, effects);
                return;
            }

            // Registered component (SFC custom element) → boot the instance.
            // Idempotent: if `connectedCallback` already booted it, it does nothing.
            // Covers :each clones, disconnected subtrees and normal usage.
            const def = components.get(node.tagName.toLowerCase());
            if (def) boot(node);
            else if (node.hasAttribute(":is")) {
                console.warn("Menut: :is only works on components", node);
                node.removeAttribute(":is");
            }

            // `:as` is consumed by `:model` on the same element (type coercion),
            // so it is captured before the loop (order-independent) and removed.
            const asAttr = node.getAttribute(":as");
            if (asAttr !== null) node.removeAttribute(":as");

            // Process the element's directive attributes.
            for (const attr of [...node.attributes]) {
                if (!attr.name.startsWith(":")) continue;

                if (attr.name === ":if" || attr.name === ":each") {
                    console.warn("Menut:", attr.name, "only works on <template>", node);
                    node.removeAttribute(attr.name);
                    continue;
                }

                // `:is` is consumed by boot() — skip to avoid generic processing.
                if (attr.name === ":is") continue;

                // Shorthand props: `:name` without `=` expands to `:name="name"`.
                if (!attr.value) attr.value = attr.name.slice(1);

                // The directive attribute is removed from the DOM: the HTML stays
                // clean after mounting (like frameworks of this style do).
                node.removeAttribute(attr.name);

                // `::` is syntactic sugar for `:text`.
                const name = attr.name === "::" ? "text" : attr.name.slice(1);

                // `:transition` / `:transition.mod` / `:transition.shared="name"`:
                // opts the element into the View Transitions API (consumed, not a
                // binding). `.shared` provides the explicit morph name; any other
                // modifier (`.fade`, `.scale`, `.slideup`) → view-transition-class.
                if (name === "transition" || name.startsWith("transition.")) {
                    const mod = name.slice("transition".length);
                    setupVT(node, mod === ".shared" ? null : mod.slice(1) || null,
                            mod === ".shared" ? attr.value : null);
                    continue;
                }

                if (name === "text") {
                    effects.push(bindValue(node, attr.value, setters.text, context));
                } else if (name === "html" || name === "html-unsafe") {
                    effects.push(bindValue(node, attr.value, setters.html, context));
                } else if (name === "model") {
                    effects.push(bindModel(node, attr.value, context, asAttr));
                } else if (name === "ref") {
                    bindRef(node, attr.value);
                } else if (name.startsWith("on.")) {
                    bindEvent(node, name.slice(3), attr.value, context);
                } else {
                    // Any other attribute → generic setter (:class, :src...).
                    effects.push(bindValue(node, attr.value, attributeSetter(name), context));
                }
            }
        }

        // Walk the children. A copy is used so the nodes the template bindings
        // insert during the walk do not interfere. Templates that were already
        // consumed as part of an :if/:else chain are skipped.
        for (const child of [...node.childNodes]) {
            if (processedChain.has(child)) continue;
            scan(child, context, effects);
        }
    }

    // ==========================================================================
    // 8. MOUNT — the only public entry point
    // ==========================================================================

    // Tiny one-liner helpers auto-injected into `_` at mount (like `_.ref`).
    // Only added if the user has not already defined the key, and as
    // NON-enumerable properties so the state stays clean (Object.keys /
    // :each iterations are unaffected). Because `_` is the prototype of the
    // expression context, they are usable as bare identifiers in directives:
    //   :on.click="dispatch('x'); await sleep(300)"
    //   :on.click="mount('#zone')"
    const helpers = {
        qry: sel => document.querySelector(sel),
        qryAll: sel => [...document.querySelectorAll(sel)],
        net: {
            get: url => fetch(url).then(r => r.text()),
            json: url => fetch(url).then(r => r.json()),
            post: (url, data) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.text())
        },
        dispatch: (name, detail) => document.dispatchEvent(new (document.defaultView.CustomEvent || CustomEvent)(name, { detail, bubbles: true, composed: true })),
        sleep: ms => new Promise(r => setTimeout(r, ms)),
        raf: fn => requestAnimationFrame(fn),
        mount: (el = document) => mount(typeof el === "string" ? document.querySelector(el) : el),
        define
    };

    function injectHelpers(raw) {
        for (const key in helpers) {
            if (!(key in raw)) {
                Object.defineProperty(raw, key, {
                    value: helpers[key],
                    enumerable: false,
                    writable: true,
                    configurable: true
                });
            }
        }
    }

    /** Makes `raw` the reactive state: injects helpers and wraps it in a Proxy
     *  (idempotent: an already-wrapped Proxy is adopted as-is). */
    function ensure(raw) {
        const obj = raw ?? {};
        if (proxiesSet.has(obj)) state._ = obj;
        else { injectHelpers(obj); state._ = reactive(obj); }
    }

    /**
     * `mount(root = document)` — exposed as `_.mount()`.
     *
     * `_` is already reactive and has its helpers because assigning `window._`
     * (or reading it, on state-less pages) wraps it at accessor level. This
     * just registers the present `<define-component>` blocks and scans `root`.
     *
     * Idempotent: calling it again only processes the new nodes, and already
     * registered `<define-component>` blocks are not re-defined.
     */
    function mount(root = document) {
        registerDefinitions(root);
        scan(root, contextFor(state._), []);
        return state._;
    }

    /**
     * `define(tag, html, props?)` — registers a component via the API
     * (same format as an SFC file); exposed as `_.define()`. `html` is the
     * <template> content, with optional `<style>` and `<script>` inside.
     * `props` declares typed props:
     * `{ count: { type: "number", default: 0 } }`.
     */
    function define(tag, html, propDecls) {
        const tpl = document.createElement("template");
        tpl.innerHTML = html;
        if (propDecls) {
            for (const [name, spec] of Object.entries(propDecls)) {
                const type = spec.type || "auto";
                tpl.setAttribute(name + ":" + type, spec.default == null ? "" : spec.default);
            }
        }
        registerDefinition(tag, tpl);
    }

    // Wrap `window._` at ASSIGNMENT time (not inside mount): so `_` becomes
    // reactive and gets the helpers (qry, net, dispatch, sleep, raf, mount,
    // define) immediately when you write `window._ = { ... }`. That means
    //   window._ = { ... };
    //   _.mount();          // works without Menut.mount()
    // `_` is the only global: there is no `window.Menut` anymore.
    if (typeof window !== "undefined") {
        // Capturar un `window._` definido ANTES de cargar la librería, para no
        // perderlo al instalar el accessor (get/set) a continuación.
        const existing = window._;
        Object.defineProperty(window, "_", {
            configurable: true,
            get() {
                // `_` auto-existe: páginas sin estado (solo componentes) pueden
                // llamar a `_.mount()` / `_.define()` directamente.
                if (!state._) ensure({});
                return state._;
            },
            set(raw) {
                ensure(raw);
            }
        });
        if (existing !== undefined && !state._) ensure(existing);
    }

})();
