# 🎬 NovidPlayer

<p align="center">
  <strong>A modern, minimalist, high-performance local video player built for Windows 11.</strong>
</p>

<p align="center">
  <a href="https://github.com/Thief-K/novid-player/releases"><img src="https://img.shields.io/github/v/release/Thief-K/novid-player?style=flat-square&color=0284c7" alt="Latest Release"></a>
  <a href="https://github.com/Thief-K/novid-player/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Thief-K/novid-player/ci.yml?branch=main&style=flat-square&label=CI" alt="CI Build Status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue.svg?style=flat-square" alt="License: GPL-3.0"></a>
  <a href="https://tauri.app"><img src="https://img.shields.io/badge/Tauri-v2-24C8D8.svg?style=flat-square&logo=tauri&logoColor=white" alt="Tauri v2"></a>
  <img src="https://img.shields.io/badge/Platform-Windows%2011-0078D6.svg?style=flat-square&logo=windows&logoColor=white" alt="Windows 11">
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome"></a>
</p>

<p align="center">
  <strong>English</strong> | <a href="README_zh.md">简体中文</a>
</p>

---

## ✨ Key Features

- **Fluid Glassmorphic OSD**: Borderless frameless design with translucent acrylic blur and auto-hiding OSD playback controls.
- **Native 1:1 Auto-Fit Resolution**: Dynamically scales the player window to match native video display resolution with intelligent 85% screen work-area bounds for 4K / 8K content.
- **MPV Hardware Pipeline**: Direct3D 11 & NVDEC hardware-accelerated decoding for ultra-low CPU usage across 4K 60fps 10-bit HEVC / AV1 videos.
- **Hover Thumbnail Scrubber**: Real-time video frame previews triggered at 300ms dwell with LRU in-memory caching and smooth scrubbing.
- **Desktop-Grade Context Menu**: Clean cascading context menu with submenus for speed rate and aspect ratio switching.
- **Native Bilingual i18n**: Type-safe zero-dependency internationalization supporting English and Simplified Chinese (auto-detected or manually switched).
- **Deep Windows Integration**: Comprehensive file associations for instant playback via Windows Explorer "Open with", paired with single-instance multi-file queueing.
- **Comprehensive Settings Hub**: General preferences, decoder pipeline status check with fallback warning, categorized shortcut guides, and one-click diagnostic info export.
- **Pro Playback Controls**:
  - **Audio Boost**: 0% ~ 150% gain amplification;
  - **Stepless Speed**: 0.25x ~ 4.0x fine-tuning with quick presets;
  - **Tracks & External Subtitles**: `.srt / .ass / .vtt` drag-and-drop loading with millisecond audio/subtitle delay sync;
  - **Color & Aspect Adjustments**: 16:9 / 4:3 / 21:9 aspect toggles, brightness, and contrast fine-tuning;
  - **Playback Memory & History**: Automatic breakpoint resume with drawer playlist management.

---

## ⌨️ Keyboard Shortcuts

| Key          | Action                     | Key                  | Action                  |
| :----------- | :------------------------- | :------------------- | :---------------------- |
| **Space**    | Play / Pause               | **F / Double Click** | Enter / Exit Fullscreen |
| **← / →**    | Seek Backward / Forward 5s | **Shift + ← / →**    | Precise Step 1s         |
| **↑ / ↓**    | Volume ±5%                 | **M**                | Toggle Mute             |
| **[ / ]**    | Playback Speed ±0.1x       | **Backspace**        | Reset Speed to 1.0x     |
| **C / V**    | Cycle Subtitles / Audio    | **S**                | Snapshot Frame to Disk  |
| **. / ,**    | Frame Step Forward / Back  | **L**                | Toggle Playlist Drawer  |
| **Ctrl + O** | Open Local File            | **Escape**           | Exit Fullscreen / Close |

---

## 🚀 Getting Started

### 📦 Download

Grab the latest build from the [GitHub Releases](https://github.com/Thief-K/novid-player/releases) page:

- **Installer Edition**: `NovidPlayer-vX.Y.Z-setup.exe` (NSIS Installer)
- **Portable Edition**: `NovidPlayer-vX.Y.Z-windows-x64-portable.zip` (Green, self-contained)

---

### 🛠️ Building from Source

#### Prerequisites

- **Node.js**: >= 18.0.0, **pnpm**: >= 9.0.0
- **Rust Toolchain**: `stable-x86_64-pc-windows-msvc`

```powershell
# 1. Clone repository & install dependencies
git clone https://github.com/Thief-K/novid-player.git
cd novid-player
pnpm install

# 2. Automatically download and configure MPV engine
pnpm setup-mpv

# 3. Start development server
pnpm tauri dev

# 4. Build release bundle (NSIS Installer)
pnpm tauri build
```

---

## 📖 Architecture & Contribution

- **AI Agents & Architecture Manual**: Detailed IPC protocols, Direct3D 11 swapchain mechanics, window resizing bounds, and thumbnail cache specs can be found in [AGENTS.md](AGENTS.md).
- **Contributing**: Please review our [Contributing Guide](CONTRIBUTING.md) before opening issues or pull requests.

---

## 📜 License

NovidPlayer is licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
Third-party component licenses and attributions are listed in [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
