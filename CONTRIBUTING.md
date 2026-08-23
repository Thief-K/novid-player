# Contributing to NovidPlayer

Thank you for your interest in contributing to **NovidPlayer**! 🎉

Whether you're reporting a bug, improving documentation, submitting feature ideas, or writing code, your support is warmly welcome.

---

## 🛠️ Development Setup

### 1. Prerequisites

Make sure you have installed:

- **Node.js**: >= 18.0.0
- **pnpm**: >= 9.0.0 (`npm install -g pnpm`)
- **Rust Toolchain**: Stable MSVC for Windows (`rustup default stable-x86_64-pc-windows-msvc`)
- **Git**: Latest version

### 2. Clone & Setup

```powershell
# Clone the repository
git clone https://github.com/Thief-K/novid-player.git
cd novid-player

# Install frontend dependencies
pnpm install

# Download and place MPV engine binaries into src-tauri/binaries/
pnpm setup-mpv
```

### 3. Launch Development Mode

```powershell
# Starts the Vite frontend server and opens the native Tauri window
pnpm tauri dev
```

---

## 🧪 Testing & Verification

Before submitting any code changes, ensure all linters, formatters, and test suites pass cleanly:

```powershell
# 1. Frontend Linters & Formatters (Powered by Oxc)
pnpm lint           # Check linter rules with oxlint
pnpm lint:fix       # Automatically fix lint issues
pnpm format:check   # Verify formatting with oxfmt
pnpm format         # Auto-format all code with oxfmt

# 2. Run Test Suites
pnpm test           # Run frontend Vitest unit & component tests
pnpm test:coverage  # Generate coverage reports
pnpm test:backend   # Run backend Rust tests (cargo test)
pnpm test:all       # Run entire test suite (Frontend + Backend)

# 3. Rust Backend Checks
cd src-tauri
cargo check
cargo clippy
cd ..
```

---

## 📐 Architecture & Coding Standards

- **Architecture Deep-Dive**: For detailed IPC specifications, Direct3D 11 swapchain mechanics, window resizing bounds, and thumbnail caches, please read [AGENTS.md](AGENTS.md).
- **Frontend Guidelines**:
  - React 19 + TypeScript + Tailwind CSS.
  - State management via Zustand (`src/stores/playerStore.ts`).
  - Icons from `lucide-react`.
  - Do NOT introduce ESLint or Prettier; we use `oxlint` and `oxfmt`.
- **Backend Guidelines**:
  - Async with `tokio` and synchronous thread-safety with `parking_lot`.
  - Drop lock guards before `.await` to prevent deadlocks.
  - Return errors as `Result<T, String>` over Tauri command boundaries.

---

## 🌿 Git & Pull Request Workflow

1. Fork the repository and create a new feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Follow the **Conventional Commits** format for commit messages:
   ```
   <type>(<scope>): <subject>

   <body>
   ```
   - **Types**: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `chore`, `test`.
   - **Scopes**: `ui`, `player`, `mpv`, `window`, `settings`, `deps`, `build`.
   - **Examples**:
     - `feat(player): add support for custom shader presets`
     - `fix(window): prevent taskbar overlap on dual-monitor setups`
3. Push your branch to GitHub and open a **Pull Request** against `main`.
4. Check that GitHub Actions CI passes all automated checks.
