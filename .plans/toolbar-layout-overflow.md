# Toolbar Overflow Layout — Problem & Solutions

## The Problem
The action toolbar has two kinds of content:
- **Always-visible (Priority Controls):** Tab type switcher (Plain Text, Docs, Code…), Expiry Selector, Paste Button.
- **Contextual/Variable (Type-Specific Controls):** Font Size, Voice Typing, Multilingual Keyboard, AI Suggestion toggle, etc.

As type-specific controls grow, they push the priority controls off screen or get hidden under the scroll area.

---

## Option 1: Hard Priority Split (Recommended)
**Concept:** Divide the toolbar into two locked zones using `justify-between`. The left side holds tab types. The right side is a fixed-width zone **always** containing: Expiry + Paste. The center zone is the scrollable contextual area.

```
[ Tab Types (fixed-left) ] [ ←→ Contextual Scroll Zone ←→ ] [ Expiry | Paste (fixed-right) ]
```

- Left: `flex-none` — never shrinks
- Center: `flex-1 overflow-x-auto` with hidden scrollbar — scrolls internally
- Right: `flex-none` — never shrinks

**Pros:** Simple, works perfectly as-is. Guarantees Paste and Expiry are always visible.  
**Cons:** None. This is how Gmail, VS Code, and Figma handle it.

---

## Option 2: Overflow Menu / "More" Button
**Concept:** Measure the available center-zone width. Render as many contextual controls as fit, and spill the rest into a `...` (More) dropdown at the right end of the contextual zone.

```
[ Tab Types ] [ FontSize | Voice | 🌐 Keyboard | ··· ▾ ] [ Expiry | Paste ]
```

The `···` dropdown reveals hidden controls that didn't fit.

**Pros:** Cleanest UX, nothing is ever truly hidden from the user.  
**Cons:** Requires a ResizeObserver to measure available width and decide which items overflow — moderate implementation complexity.

---

## Option 3: Collapsible / Sheet Overflow
**Concept:** The contextual zone shows only an icon row. Tapping a "Settings" or wrench icon opens a Sheet/Drawer from the bottom (mobile) or a Popover (desktop) containing all the type-specific controls with full labels.

```
[ Tab Types ] [ ⚙ Type Options (opens sheet) ] [ Expiry | Paste ]
```

**Pros:** Keeps the toolbar minimal and clean.  
**Cons:** Extra click/tap to access common controls like font size and voice typing. Worse discoverability.

---

## Option 4: Two-Row Toolbar (Context Row Beneath Main Row)
**Concept:** The primary row holds Tab Types + Expiry + Paste. A secondary, collapsible sub-toolbar row appears just below it when a contextual tool is available.

```
[ Tab Types ————————————————————— Expiry | Paste ]
[ FontSize | Voice Typing | 🌐 Keyboard | Suggestions  ] ← only appears when needed
```

**Pros:** Full width for contextual items, nothing ever overflows.  
**Cons:** Takes up more vertical space; slightly more complex layout state.

---

## Recommendation
**Go with Option 1 first** — it requires the least code change and solves the core issue instantly. The toolbar structure becomes:

```tsx
<div className="flex items-center gap-2 w-full overflow-hidden">
  {/* LEFT: Tab types — never shrinks */}
  <div className="flex-none flex items-center gap-1">
    <TabTypeSwitcher />
  </div>

  {/* CENTER: Contextual tools — scrolls internally */}
  <div className="flex-1 overflow-x-auto scrollbar-hide flex items-center gap-2 px-2">
    <ContextualTools />
  </div>

  {/* RIGHT: Priority controls — never shrinks */}
  <div className="flex-none flex items-center gap-2">
    <ExpirySelector />
    <PasteButton />
  </div>
</div>
```

If the app grows significantly (many more contextual controls), upgrade to **Option 2** using a ResizeObserver overflow menu.
