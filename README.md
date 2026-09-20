# Snipit - Cpaste⚡

<p align="center">
  <strong>The Modern Workspace for Code, Documents, and Real-Time Collaboration</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20%26%20Active-emerald?style=for-the-badge&logo=vercel" alt="Status" />
  <img src="https://img.shields.io/badge/Languages-50%2B%20Supported-blue?style=for-the-badge&logo=codefactor" alt="Languages" />
  <img src="https://img.shields.io/badge/Security-Zero--Knowledge%20E2EE-purple?style=for-the-badge&logo=shield" alt="Security" />
  <img src="https://img.shields.io/badge/Collaboration-Multiplayer%20Real--Time-rose?style=for-the-badge&logo=socketdotio" alt="Collaboration" />
  <img src="https://img.shields.io/badge/Locales-13%2B%20Languages-amber?style=for-the-badge&logo=translate" alt="Localization" />
  <img src="https://img.shields.io/badge/Theme-Dark%20%26%20Light-slate?style=for-the-badge&logo=tailwindcss" alt="Theme" />
</p>

---

## 🌟 Introduction

**Snipit** is an all-in-one productivity and sharing workspace designed to replace fragmented tools, clunky pastebins, and unsecured utility sites. Whether you are drafting code, sketching architecture diagrams, writing rich technical documentation, shortening links, hosting synchronized movie nights with friends, or securing your private credentials in a zero-knowledge vault — Snipit brings it all under a unified, blisteringly fast, and privacy-respecting roof.

> [!NOTE]
> **Built for Speed & Privacy**: Every feature in Snipit is engineered with immediate usability in mind. Sensitive utilities run client-side cryptography directly in your browser, ensuring your private data remains yours alone.

---

## 👥 Who is Snipit For?

| Persona | Core Problems Solved | Favorite Features |
| :--- | :--- | :--- |
| **💻 Software Engineers & Coders** | Eliminates cumbersome runtime setup just to test or share a quick snippet; simplifies live pair debugging. | Monaco Editor, In-Browser Terminal Runner, AI Autocomplete & Explainer. |
| **👥 Remote Teams & Friends** | Bridges asynchronous work and social hangouts without needing 5 different web apps. | Cinema Watch Party, Live Multiplayer Cursors, Shared Ambient Music. |
| **🔐 Privacy-Conscious Users** | Removes risk when handling sensitive passwords, recovery keys, or proprietary client files. | CryptoSafe (AES-GCM), Zero-Knowledge Password Vault, Burn-After-Read. |
| **📚 Students, Educators & Writers** | Consolidates lecture notes, formula formatting, brainstorming whiteboards, and audio reading. | WYSIWYG Docs (KaTeX math), Excalidraw Whiteboard, Text-to-Speech. |
| **🚆 Commuters & Travelers** | Instant access to live railway status and confirmation estimates without cluttered ad-heavy portals. | PNR Confirmation Prediction, Live Train Tracker, Coach Layout Visualizer. |

---

## 🎨 The 6 Creation Modes

Snipit reimagines how you create and share content by providing six dedicated modes accessible directly from the main studio:

```
                  ┌─────────[ Snipit Studio ]─────────┐
                  │                                   │
      ┌───────────┼───────────┬───────────┬───────────┼───────────┐
      ▼           ▼           ▼           ▼           ▼           ▼
   💻 Code     📝 Docs     🎨 Draw     🔗 Link     📁 File     ✍️ Text
```

### 1. 💻 Code & Interactive Terminal
- **Monaco Code Editor**: Powered by the same engine that drives VS Code, complete with syntax highlighting for 50+ languages, auto-closing brackets, code folding, and configurable font sizing (8px to 48px).
- **In-Browser Terminal Runner**: Execute code directly in the cloud across 10+ popular languages (**Python, JavaScript, TypeScript, C, C++, Java, Rust, Go, C#, Shell/Bash**). Includes interactive `stdin` / `stdout` support, live process spinners, and execution termination.
- **AI Autocomplete & Writer**: Get smart inline completions as you type, or prompt the built-in AI assistant to refactor logic, diagnose bugs, or generate code explanations.

### 2. 📝 Rich Docs
- **WYSIWYG Publishing**: A distraction-free, fluid writing interface powered by Tiptap and Novel.
- **Advanced Formatting**: Structure documents with headings (H1–H6), callout blockquotes, interactive task checklists, code blocks, and multi-row tables.
- **Mathematical Formula Rendering**: Native support for **KaTeX** equations and scientific notations directly inline or as display blocks.

### 3. 🎨 Collaborative Whiteboard (Excalidraw)
- **Infinite Sketching Canvas**: Freehand sketching, wireframing, architecture diagrams, shapes, arrows, and sticky notes.
- **AI-Powered Prompt-to-Diagram**: Type a natural language description (e.g., *"Event-driven microservices architecture with Kafka and Redis"*) and let the AI automatically construct a fully laid-out flowchart on your board.

### 4. 🔗 Smart Link Shortener
- **Custom Memorable URLs**: Transform unwieldy URLs into clean, recognizable links with custom word slugs or auto-generated identifiers.
- **3 Flexible Redirection Modes**:
  - **Direct**: Instant browser forwarding to the target address.
  - **Timer**: A countdown preview splash screen giving users destination transparency.
  - **Click Gate**: An interactive confirmation check before exiting to the destination.
- **Link Analytics**: Monitor total clicks, visit history, and recent link activity.

### 5. 📁 Multi-File Sharing
- **Effortless Drag-and-Drop**: Upload multiple files at once (up to 50MB per file) backed by fast cloud storage.
- **Live Progress & Previews**: Real-time upload percentage indicators and instant in-browser previews for images, PDF documents, and media streams.
- **One-Click Batch Downloads**: Convenient single-click downloads for recipients.

### 6. ✍️ Plain Text & Indic Transliteration
- **Distraction-Free Scratchpad**: Instant raw text drafting for notes, clipboard buffers, and meeting logs.
- **Phonetic Indic Transliteration**: Type phonetically in English to instantly generate natural script in Indian languages (Devanagari, Hindi, Marathi, Sanskrit, and more).
- **Read-Aloud Support**: Trigger the Text-to-Speech engine to listen to your text notes effortlessly.

---

## ⚡ Real-Time Collaboration & Ephemeral Privacy

### 🤝 Multiplayer Presence
- **Live Multi-Cursor Tracking**: See where collaborators are pointing, selecting, and typing in real time.
- **Fun Anonymous Avatars**: Automatically assigned vibrant, anonymous personas (e.g., *Mysterious Panda*, *Stealthy Dragon*) with individual color tags.
- **Live Action Status**: Real-time visual indicators displaying who is currently editing, drawing, or recording voice input.
- **Seamless Autosave**: Automatic, non-intrusive background saving with live state indicators (`idle`, `saving`, `saved`).

### 🛡️ Ephemeral Sharing & Access Control
- **🔥 Burn-After-Read (One-Time Pastes)**: The snippet automatically self-destructs and is permanently purged from existence the moment it is viewed once.
- **🔒 Password Protection**: Gated pastes requiring an encryption passphrase before any contents can be decrypted or read.
- **⏳ Flexible Expiration Timers**: Set your paste to expire in 1 hour, 1 day, 1 week, 1 month, 1 year, on a specific custom calendar date and time, or keep it forever.
- **🔑 Granular Role Management**: Define exact permissions when sharing — assign **Viewer**, **Editor**, or **Commenter** roles.
- **💬 Threaded Comment Section**: Engage in contextual, nested discussions and feedback directly on the shared snippet.

---

## 🧰 The Specialized Tools Suite

Beyond the core paste studio, Snipit houses an integrated suite of purpose-built productivity applications:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Snipit Tools Hub (/tools)                       │
├─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│ 🤖 AI Companion │ 🍿 Cinema Party  │ 🛡️ CryptoSafe   │ 🔑 Passwords    │
├─────────────────┴──────────────────┴─────────────────┴─────────────────┤
│ 🚆 Indian Railways & PNR Tracker                                       │
└────────────────────────────────────────────────────────────────────────┘
```

### 🤖 1. AI Companion (`/tools/companion`)
An empathetic conversational partner designed with emotional depth and long-term continuity:
- **Evolving Relationship Stages**: Progresses naturally from *Discovery* $\rightarrow$ *Confidant* $\rightarrow$ *Intimate* based on conversation depth and mutual familiarity.
- **Persistent Long-Term Memory**: Automatically remembers personal anecdotes, work preferences, recurring goals, and inside jokes across different chat sessions.
- **Active Thread Follow-up**: Proactively recalls unresolved topics mentioned previously to follow up naturally.
- **Voice & Spoken Audio**: Full conversational voice support allowing you to speak and listen hands-free.

### 🍿 2. Cinema Watch Party (`/tools/cinema`)
Host real-time synchronized virtual screening rooms with friends:
- **Frame-Perfect Sync**: Automatic synchronization of playback, pausing, and scrubbing across all participants.
- **Universal Media Sources**: Watch direct video streams (MP4, HLS, DASH), movie server links, or YouTube videos.
- **Social Interaction**: Floating real-time emoji reactions that float across the screen, paired with an integrated room chat.
- **Flexible Modes**: Connect via server-synchronized rooms or direct WebRTC Peer-to-Peer (P2P) mode.

### 🛡️ 3. CryptoSafe Vault (`/tools/cryptoSafe`)
Military-grade file and directory encryption executed entirely on your machine:
- **Zero-Knowledge Architecture**: Powered by **AES-GCM 256-bit** encryption with PBKDF2 key derivation (100,000 rounds, SHA-256).
- **Directory Structure Preservation**: Select an entire folder from your computer using the native File System Access API; CryptoSafe encrypts or decrypts the entire directory hierarchy seamlessly.
- **In-Browser Processing**: Your unencrypted files and passwords are never transmitted over the network. Save back directly to disk or download as an encrypted ZIP file.

### 🔑 4. Zero-Knowledge Password Manager (`/tools/passwords`)
A secure, complete credential manager built right into the browser:
- **Master Password & 12-Word Recovery Phrase**: Protect your vault with a master password, backed by a deterministic BIP39 mnemonic recovery key.
- **High-Entropy Password Generator**: Create ultra-strong passwords or memorable Diceware word-passphrases with customizable length, separators, and character rules.
- **End-to-End Encrypted Sharing**: Share individual passwords, API keys, or entire folders with other registered users via asymmetric public-key cryptography.
- **Smart Auditing Wizards**:
  - **Duplicate Finder**: Identify and automatically merge identical login credentials.
  - **Field Cleaner**: Detect and fix misplaced entries (e.g., email addresses saved inside username fields).
- **One-Click Imports**: Seamlessly import existing vaults from Google Chrome, Bitwarden, Enpass, or CSV files.

### 🚆 5. Indian Railways & PNR Tracker (`/tools/trains`)
A comprehensive, distraction-free travel companion for Indian Railways commuters:
- **PNR Status & Waitlist Prediction**: Query 10-digit PNR numbers to view real-time booking confirmation, coach, and berth details, complete with a statistical probability gauge for waitlist clearance.
- **Live Train Running Status**: Real-time delay tracking, upcoming station halts, estimated arrival times, and platform numbers.
- **Trains Between Stations**: Search all available train routes between any two stations with class breakdowns and fare calculations.
- **Interactive Coach Rake Visualizer**: A visual sliding train rake showing locomotive position, luggage vans, and the exact sequence of sleeper, 3AC, 2AC, 1AC, and general coaches.

---

## 🎵 Ambient & Smart Utilities

### 🎧 Ambient Lo-Fi & YouTube Music Player
- **Floating Music Bubble**: A compact, draggable audio bubble featuring an animated sound equalizer that stays accessible anywhere in the app.
- **Curated Regional Playlists**: Discover trending regional music (Hindi, Punjabi, Tamil, Telugu, English/Global, etc.) and search across millions of tracks with instant autocomplete.
- **Collaborative Sync**: Synchronize background audio playback with everyone inside your shared snippet room.
- **Offline Downloads**: Download tracks in high quality (up to 320kbps MP3) directly to your device.

### 🎙️ Multimodal Voice AI Copilot & Voice Orb
- **Voice Orb Interface**: An interactive floating orb that listens to spoken natural language commands.
- **Screen Awareness**: Perceives your current view to answer contextual questions about what you have open.
- **Hands-Free Action Dispatcher**: Say *"open code editor"*, *"switch to dark mode"*, *"check PNR status"*, or *"encrypt this text"* to control the app effortlessly.

### 🔊 Text-To-Speech (TTS) Reader
- **Smart Speech Preprocessing**: Automatically formats complex syntax, code blocks, and symbols into natural, spoken phrasing.
- **Local & Neural Voices**: Enjoy fluid audio playback powered by on-device neural voice models or your browser's native speech engine.

### 🌐 Global Accessibility & 13+ Languages
Snipit speaks your language natively. Switch effortlessly between:
- **English**, **Hindi (हिंदी)**, **Marathi (मराठी)**, **Gujarati (ગુજરાતી)**, **Bengali (বাংলা)**, **Punjabi (ਪੰਜਾਬੀ)**, **Tamil (தமிழ்)**, **Telugu (తెలుగు)**, **Kannada (ಕನ್ನಡ)**, **Malayalam (മലയാളം)**, **Urdu (اردو)**, **German (Deutsch)**, and **Japanese (日本語)**.

---

## 🔒 Privacy & Data Safety Guarantees

> [!IMPORTANT]
> **Your Data Belongs to You**
> Snipit is built upon the principle that privacy should not be an afterthought:
> 1. **Zero-Knowledge Design**: For sensitive tools (CryptoSafe and Password Vault), data encryption and decryption occur solely in your browser's local memory.
> 2. **No Key Storage**: We never store, transmit, or log your master passwords, encryption keys, or recovery phrases. If you lose them, nobody (including us) can access your vault.
> 3. **True Ephemeral Pasting**: Burn-after-read snippets are immediately deleted from storage upon initial retrieval. Expired pastes are routinely purged.

---

## 💬 Feedback, Community & Connect

Snipit is a passion project built for developers, creators, and everyday internet users.

- **Found a bug or have a feature idea?** Submit feedback using the in-app **Feedback Modal** or open an issue on GitHub.
- **Creator**: **Tejas Chaudhari**
  - GitHub: [@tejaschaudhari192](https://github.com/tejaschaudhari192)
  - LinkedIn: [Tejas Chaudhari](https://www.linkedin.com/in/tejaschaudhari192/)
  - Project Repository: [tejaschaudhari192/snipit](https://github.com/tejaschaudhari192/snipit)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for a simpler, more beautiful web.
</p>
