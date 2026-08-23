# AGENTS.md

Welcome to the **NovidPlayer** repository. This document serves as the single source of truth and comprehensive operational manual for AI agents and human contributors working on this codebase.

---

## 1. Project Overview & Architecture

**NovidPlayer** is a modern, minimalist, high-performance local video player built for **Windows 11**.

### Core Architecture

```
┌────────────────────────────────────────────────────────┐
│               Tauri v2 Application (HWND)              │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │   WebView2 DirectComposition Layer (Transparent) │  │
│  │   - React 19 + TypeScript UI                     │  │
│  │   - Modern Minimalist Glassmorphic OSD Controls   │  │
│  │   - Zustand State & Event Handler                │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           │ (Tauri IPC Invoke/Events)  │
│  ┌────────────────────────▼─────────────────────────┐  │
│  │   Tauri Rust Backend (`src-tauri/`)              │  │
│  │   - Window Lifecycle & Native Commands           │  │
│  │   - Tokio Async Named Pipe IPC Controller        │  │
│  │   - MPV Process Lifetime & Binary Resolution     │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           │ (Named Pipe \\.\pipe\mpv_*)│
│  ┌────────────────────────▼─────────────────────────┐  │
│  │   MPV Engine Subprocess (`mpv.exe`)              │  │
│  │   - Direct3D 11 Render Target (--wid=<HWND>)     │  │
│  │   - Hardware Acceleration (D3D11VA / NVDEC)      │  │
│  │   - Low-latency Video Pipeline                   │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Zustand 5, Lucide React.
- **Backend**: Tauri v2, Rust 2021 edition, Tokio, `parking_lot`.
- **Engine**: MPV (standalone `mpv.exe`) rendering directly into the Tauri parent `HWND` via `--wid` with a transparent WebView2 overlay on top.
- **IPC Communication**: Tokio asynchronous JSON-IPC client connecting over Windows Named Pipes (`\\.\pipe\mpvsocket_novidplayer_<pid>`).

---

## 2. Directory Structure

```
novid-player/
├── AGENTS.md                       # Guidelines and architecture manual for AI agents
├── README.md                       # User-facing documentation
├── package.json                    # Frontend dependencies and npm scripts
├── vite.config.ts                  # Vite build and plugin configurations
├── tsconfig.json                   # TypeScript compiler configuration
├── scripts/
│   └── setup-mpv.ps1               # Automated MPV binary download & setup script
├── src-tauri/                      # Tauri v2 Backend (Rust)
│   ├── Cargo.toml                  # Rust dependencies & compilation profile
│   ├── tauri.conf.json             # Tauri window, security, and bundle config
│   ├── installer_hooks.nsh         # NSIS installer hooks for Windows registry associations
│   ├── capabilities/
│   │   └── default.json            # Tauri v2 security capabilities and permissions
│   └── src/
│       ├── main.rs                 # Tauri executable entry point
│       ├── lib.rs                  # App setup, window init, command registration
│       ├── commands.rs             # Tauri command invocations dispatch center
│       ├── mpv_ipc.rs              # Tokio named pipe client & event parser
│       ├── mpv_manager.rs          # MPV process lifecycle & binary lookup
│       └── thumbnail.rs            # Async frame extractor & session cache manager
└── src/                            # Frontend UI (React 19 + TypeScript)
    ├── App.tsx                     # Main application layout & drag-and-drop listener
    ├── index.css                   # Global styles & Tailwind utilities
    ├── main.tsx                    # React DOM entry point
    ├── i18n/                       # Type-safe zero-dependency internationalization
    │   ├── index.ts                # i18n provider hook, context & locale detection
    │   ├── types.ts                # Locale & translation schema definitions
    │   └── locales/
    │       ├── zh-CN.ts            # Simplified Chinese language dictionary
    │       └── en-US.ts            # American English language dictionary
    ├── types/
    │   └── player.ts               # Core TypeScript interfaces & state schemas
    ├── utils/
    │   └── format.ts               # Shared time formatting utilities (formatTime)
    ├── stores/
    │   └── playerStore.ts          # Zustand player state, history & preferences
    ├── services/
    │   └── mpvService.ts           # Tauri IPC commands & MPV event wrapper
    ├── hooks/
    │   └── useKeyboardShortcuts.ts # Global keyboard shortcut handlers
    └── components/
        ├── TitleBar.tsx            # Minimalist custom window title bar
        ├── WelcomeDropZone.tsx     # Idle state drag-and-drop welcome screen
        ├── FloatingControls.tsx    # Floating auto-hiding OSD playback controls
        ├── ProgressBar.tsx         # Responsive seek bar with hover thumbnail preview
        ├── VolumeControl.tsx       # Volume slider with 150% boost capability
        ├── TrackPanel.tsx          # Audio track & subtitle drawer with delay sync
        ├── SpeedPanel.tsx          # Playback rate adjustment modal
        ├── VideoAdjustPanel.tsx    # Aspect ratio & color balance (contrast/gamma)
        ├── SettingsModal.tsx       # 4-tab settings modal (General, Decoder, Shortcuts, About)
        ├── HistoryModal.tsx        # Recent playback history modal
        ├── PlaylistModal.tsx       # Playlist management modal
        ├── ContextMenu.tsx         # Desktop-grade right-click menu with cascading submenus
        ├── NovidLogo.tsx           # Brand SVG vector icon
        └── Toast.tsx               # Glassmorphic notification alerts
```

---

## 3. Essential Commands & Toolchain

### Prerequisites

- Node.js >= 18, `pnpm` >= 9
- Rust toolchain (stable-msvc for Windows)
- MPV executable (`mpv.exe` in `src-tauri/binaries/` or in `PATH`)

### Development & Build Scripts

| Command             | Purpose                                                  |
| :------------------ | :------------------------------------------------------- |
| `pnpm setup-mpv`    | Download and place `mpv.exe` into `src-tauri/binaries/`  |
| `pnpm dev`          | Run Vite frontend development server                     |
| `pnpm tauri dev`    | Launch full desktop application in development mode      |
| `pnpm build`        | Type-check (`tsc`) and bundle frontend with Vite         |
| `pnpm lint`         | Run linter via `oxlint`                                  |
| `pnpm lint:fix`     | Automatically fix linting issues with `oxlint --fix`     |
| `pnpm format`       | Auto-format codebase using `oxfmt`                       |
| `pnpm format:check` | Check code formatting compliance with `oxfmt --check`    |
| `pnpm tauri build`  | Build production Windows installer/bundle (`nsis`/`msi`) |

### Rust Backend Verification

Always verify backend changes inside `src-tauri/`:

```powershell
cd src-tauri
cargo check
cargo clippy
```

---

## 4. Coding Standards & Conventions

### Frontend (React & TypeScript)

1. **Linter & Formatter**: We use **Oxlint** and **Oxfmt**. Do NOT introduce Prettier or ESLint configurations unless explicitly instructed.
2. **Component Conventions**:
   - Write clean, functional components with explicit TypeScript interfaces.
   - Keep styles encapsulated using Tailwind CSS utility classes.
   - Use Lucide icons (`lucide-react`) for consistent iconography.
3. **State Management**:
   - Global player state resides in `src/stores/playerStore.ts` via Zustand with `persist` middleware for localStorage.
   - Keep UI-local state (e.g., popup open/close, hover coordinates) within local component hooks (`useState`, `useRef`).
4. **File Paths & Links**:
   - When generating file links in responses or logs, always use GitHub-style Markdown links (`[basename](file:///path/to/file)`).

### Backend (Rust & Tauri)

1. **Safety & Concurrency**:
   - Use `tokio` for async operations and `parking_lot` for synchronization (`Mutex`, `RwLock`).
   - Drop lock guards before calling `.await` points to prevent deadlocks and `await_holding_lock` warnings.
   - Propagate errors as `Result<T, String>` across Tauri command boundaries.
2. **Process Management**:
   - MPV is managed as an asynchronous child process (`tokio::process::Child`).
   - When the main application terminates, ensure MPV is cleanly killed and named pipes are closed.
3. **No Hardcoded Absolute Paths**:
   - Never hardcode absolute paths like `C:\mpv` or `D:\mpv\mpv.exe`.
   - Always query Tauri's `app_handle.path().resource_dir()` -> `current_exe().parent()` -> `src-tauri/binaries/` -> system `PATH`.

---

## 5. Critical Architecture Invariants

### A. Window Dragging & Double-Click Maximize

- **Avoid `data-tauri-drag-region` on interactive containers**: In Tauri v2 with WebView2 on Windows, placing `data-tauri-drag-region` on parent elements causes mouse event collisions with manual dragging and double-click listeners.
- **Standard Implementation**: Use `onMouseDown` with:
  - `e.detail === 1`: `getCurrentWindow().startDragging()`
  - `e.detail === 2`: `mpvService.toggleMaximize()` or `toggleFullscreen()`

### B. Fullscreen & Maximize Synchronization

- **Native Fullscreen**: Fullscreen transitions use Tauri's native `window.set_fullscreen(true / false)` to eliminate DWM invisible resize border offsets (~7-8px padding gaps).
- **TitleBar Button State**: The TitleBar maximize/restore button must reflect both `isMaximized` and `isFullscreen`. When in either state, it displays the "Restore" (`<Copy />`) icon. Clicking restore or double-clicking the titlebar exits fullscreen/unmaximizes cleanly.

### C. Direct3D 11 Video Swapchain & Paused State

- **MPV Embed Flags**: MPV must be launched with:
  ```rust
  --wid=<HWND>
  --gpu-api=d3d11
  --d3d11-exclusive-fs=no
  --force-window=yes
  --border=no
  --title=
  --window-dragging=no
  --snap-window=no
  --cursor-autohide=no
  ```
- **No High-Frequency Seek on Resize**: Never dispatch `seek` commands to MPV inside continuous window `resize` event handlers. Window resizing must remain lightweight to allow the Direct3D 11 swapchain to resize smoothly without decoder pipeline flushing.

### D. Hardware Decoding UI State Separation

- **Target vs Runtime State**: Separate the user's configured preference (`hwdec`) from the MPV runtime engine status (`hwdecCurrent`).
- **Truthful UI**: If a user selects an unsupported hardware decoder (e.g. `NVDEC` on non-NVIDIA GPUs), MPV falls back to `hwdec-current: "no"`. The UI must detect this fallback, show a warning toast, and accurately update the selection rather than pretending it is active.

### E. Video Thumbnail Preview & Cache Lifecycle

- **Asynchronous Headless Extraction**: Thumbnails are extracted by a secondary headless MPV process (`--no-audio --frames=1 --hr-seek=no --vf=scale=320:-1 --vo=image`) protected by a `tokio::sync::Semaphore(2)` concurrency limiter.
- **Dwell Delay & Continuous Scrubbing**: To prevent background process thrashing, the thumbnail card triggers only after dwelling on a scrubber timestamp for >= 300ms. Once activated, it stays open and smoothly updates across continuous scrubbing with a 60ms image debounce.
- **Multi-Level Cache Management**:
  - **Frontend LRU**: Retains up to 150 frames in memory Map for 0ms re-hover lookups.
  - **Auto-Cleanup**: In-memory and disk temp folders (`%TEMP%/novidplayer_thumbs`) are wiped whenever a new video is loaded (`loadAndPlay`) or when the main window is destroyed (`WindowEvent::Destroyed`).

### F. Auto-Fit Video Resolution & Safe Work Area Boundary

- **1:1 Native Pixel Rendering**: When opening a video in standard window mode, the window dynamically auto-resizes to match the video's actual display dimensions (`dw` / `dh`).
- **Screen Safety Bounds**:
  - Calculated against `monitor.size() / monitor.scale_factor() * 0.85` (excluding Windows taskbar).
  - Ultra-high resolution videos (4K/8K) are proportionally downscaled to fit comfortably within the 85% work area.
  - Small or vertical videos are protected with minimum constraints (`minWidth: 640, minHeight: 400`) while preserving aspect ratio.
  - The window automatically re-centers on the active display monitor upon resizing.
- **State Invariant**: Never force-resize or exit fullscreen/maximized state if the user is already watching in fullscreen or maximized mode.

### G. Playback Lifecycle & EOF (End-of-File) Invariants

- **Deterministic Pause State**: Always use `set_pause(bool)` IPC commands instead of blind `cycle pause` to guarantee exact target state alignment between Zustand UI and MPV.
- **End-of-Video Handling (`eof-reached`)**:
  - Reaching the end of a video cleanly pauses at the last frame, locking the control bar into the Play (`<Play />`) icon state.
  - No infinite automatic reloads or loops when playing single files.
  - Clicking Play at the end of the video immediately triggers `seek(0)` and起播 from `00:00`.
  - Finished video timestamps in history are reset to 0 so future re-opens start from the beginning.

### H. Panel State Machine & Volume/Mute Lifecycle Synchronization

- **Exclusive Active Panel (`activePanel`)**: UI modals and drawers use a single mutex state `activePanel: 'playlist' | 'track' | 'speed' | 'videoAdjust' | 'settings' | null` with `togglePanel()` / `closeAllPanels()` to prevent multi-panel race conditions.
- **MPV Ready Handshake & Factory Default Protection**:
  - MPV process emits `mpv-ready` after named pipe connect and property observers are configured.
  - Before `isMpvReady` is true, MPV observer factory default events (`mute: false`, `volume: 100`) MUST NOT overwrite persisted localStorage user preferences.
  - Upon receiving `mpv-ready` or on initial mount, Zustand actively pushes stored `volume`, `muted`, `hwdec`, and `speed` states to MPV.
- **Enforced Video Load Synchronization**:
  - In `loadAndPlay`, `setVolume` and `setMute` are explicitly re-asserted immediately after `loadFile` to prevent audio bursts when opening videos in muted state.
  - Volume slider adjustments to `0%` automatically engage `mute: true`, and adjusting above `0%` while muted automatically disengages `mute: false`.

### I. Windows File Association, CLI Arguments & Single-Instance Lifecycle

- **Installer File Associations**:
  - `tauri.conf.json` declares `bundle.fileAssociations` for all supported video and audio formats.
  - `installer_hooks.nsh` hooks into NSIS installation (`NSIS_HOOK_POSTINSTALL`) to register `HKCU\Software\Classes\Applications\NovidPlayer.exe` (`SupportedTypes`, `shell\open\command`), `SystemFileAssociations\video\OpenWithList`, and `RegisteredApplications` for immediate "Open with" (打开方式) visibility in Windows Explorer.
- **Cold Start Protection (Single-Use CLI Args)**:
  - When the app is launched via "Open with" or command-line args, Rust parses `std::env::args()` via `get_startup_paths`.
  - `get_startup_paths` uses `std::sync::atomic::AtomicBool` to ensure args are consumed strictly once upon launch, preventing accidental infinite reload loops during frontend lifecycle re-evaluations.
- **Hot Start Interception**:
  - `tauri-plugin-single-instance` intercepts secondary process launches while the app is already running, brings the main window to front (`unminimize`, `set_focus`), and emits the `open-files` event to the frontend for seamless instant playback.
- **Store Subscription Discipline**:
  - Top-level components (e.g. `App.tsx`) must never subscribe to the entire Zustand store object via bare `usePlayerStore()`. High-frequency updates (`time-pos` / `currentTime`) will cause high-frequency re-renders. Always use selector hooks (e.g. `usePlayerStore((s) => s.currentPath)`) and access action functions via `usePlayerStore.getState()`.

---

## 6. Git & Commit Guidelines

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>
```

- **Types**: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `chore`, `test`.
- **Scope**: `ui`, `player`, `mpv`, `window`, `settings`, `deps`, `build`.
- **Rules**:
  - Write concise, imperative commit headers (e.g., `fix(window): align native fullscreen bounds`).
  - Do NOT execute `git push` unless explicitly asked by the user.
