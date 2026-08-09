# Upgrade Search to Command Component (cmdk)

## Overview
Currently, the music search bar (`src/components/common/music/search-bar.tsx`) implements a custom popover for API suggestions. It handles mouse clicks fine but lacks keyboard navigation (Arrow Up/Down).

Similarly, the jump-to menu (`src/components/header/jump-to-dialog.tsx`) is a simple dialog and input for navigating directly to a snippet ID, rather than a full command palette.

## Proposed Future Work

1. **Install Dependencies**:
   ```bash
   pnpm dlx shadcn@latest add command
   ```
   This will install `cmdk`, which is an unstyled, keyboard-accessible React command menu.

2. **Refactor Music Search (`search-bar.tsx`)**:
   - Replace the custom absolute positioned `<div z-50 ...>` with `<Command>` and `<CommandList>`.
   - Wrap the main `<Input>` with `<CommandInput>`.
   - Render suggestions inside `<CommandItem>` so that users can seamlessly navigate search results using their keyboard arrow keys.
   - Set `shouldFilter={false}` on the `<Command>` component since filtering is handled on the backend via the debounced API fetch.

3. **Enhance Global Cmd+K Menu (`jump-to-dialog.tsx`)**:
   - Replace the standard Dialog with the fully-featured Command Palette Dialog.
   - Allow searching through local snippets, settings, or theme toggling instead of just navigating to a hardcoded snippet ID.

## Benefits
- Full ARIA compliance (screen reader support).
- First-class keyboard navigation (Up, Down, Enter, Esc).
- Focus management and automatic scroll-to-view of active items.
- Streamlines complex custom popover logic.
