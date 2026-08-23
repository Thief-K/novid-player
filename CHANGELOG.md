# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-24

### Added

- **Modern Minimalist UI**: Fluid glassmorphic OSD controls with auto-hiding logic on mouse inactivity.
- **Auto-Fit Window Resolution**: Dynamically resizes the window 1:1 against native video dimensions, bounded safely within 85% screen work area for 4K/8K media.
- **Direct3D 11 & Hardware Acceleration**: MPV subprocess embedded via DirectComposition (`--wid=<HWND>`) with D3D11VA and NVDEC decoding pipeline.
- **Hover Thumbnail Scrubber**: Real-time video frame preview extracted via async secondary MPV process with 300ms dwell and LRU in-memory caching.
- **Desktop Cascading Context Menu**: Native-feeling context menu with submenus for aspect ratio and playback speed rate.
- **Deep Windows 11 Integration**:
  - Registered full file associations for video (`mp4`, `mkv`, `avi`, `mov`, `flv`, `webm`, `ts`, etc.) and audio formats.
  - Windows Explorer "Open with" (打开方式) seamless launch.
  - Single-instance hot-start listener to wake up and play dropped or associated media files.
- **4-Tab Settings Hub**: General preferences, decoder status with fallback notification, categorized keyboard shortcuts, and one-click diagnostic information export.
- **Type-Safe i18n**: Support for English (`en-US`) and Simplified Chinese (`zh-CN`).
- **Comprehensive Open Source Infrastructure**: GPL-3.0 License, GitHub Actions CI/CD workflows, automated multi-artifact release pipeline (Installer + Portable Zip), issue templates, and contributor guides.

---

## [Unreleased]

### Planned

- [ ] Playlist repeat / shuffle playback modes
- [ ] Anime4K & GLSL custom shader presets
- [ ] Auto-updater integration via `@tauri-apps/plugin-updater`
- [ ] Subtitle style customization drawer (font size, color, background box, outline)
