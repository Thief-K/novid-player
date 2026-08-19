# 🎬 NovaPlayer - 现代化 Windows 11 MPV 极简视频播放器

NovaPlayer 是一款专为 Windows 11 打造的高颜值、极简、现代化本地视频播放器。
前端采用 **React 19 + Vite + Tailwind CSS + Lucide Icons + Framer Motion** 构建沉浸式流媒体风格 UI，后端基于 **Tauri v2 (Rust)** 管理 **MPV 硬件加速解码内核**，通过 **Windows 命名管道 (`\\.\pipe\mpvsocket`)** 实现毫秒级双向 JSON-IPC 通信，将视频画面直接输出渲染到应用原生窗口中。

---

## 🌟 核心特性

- **现代流媒体视觉交互 (UI/UX)**：
  - 摆脱传统播放器陈旧菜单，采用类似 YouTube / Bilibili 现代化悬浮控制栏（OSD）。
  - 支持 Windows 11 暗色磨砂玻璃（Acrylic / Mica）半透明质感与优雅微交互动画。
  - 沉浸式无边框窗口设计，自定义极简标题栏（支持窗口拖拽、置顶切换、硬件解码状态徽标）。
  - 鼠标静止 2 秒平滑淡出隐藏控制栏；移动鼠标平滑唤醒。
- **高响应式进度条 (Scrubber)**：
  - 细长优雅，悬停时平滑加粗，实时计算并跟随鼠标显示悬停时间预览气泡。
  - 实时显示已缓冲进度条（Buffer track）与平滑拖拽 Seek。
- **底层 MPV 高性能硬件加速**：
  - 默认开启 `hwdec=auto-safe`（支持 Direct3D11 / NVDEC），流畅硬解 4K 60fps 10-bit HEVC / AV1 视频，CPU 占用极低。
  - 进程级解耦，通过 Tokio 异步 Windows 命名管道高频监听与下发指令。
- **全功能播放控制与增强面板**：
  - **音量增强**：悬浮滑块无级调节，支持突破 100% 增益至 150%。
  - **倍速微调**：0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x, 3.0x 预设与 0.25x~4.0x 滑块微调。
  - **音轨与字幕管理**：内置音轨与字幕切换、拖拽/选择加载外挂字幕（`.srt, .ass, .vtt`）、字幕与音频延迟毫秒级校准（±0.1s）。
  - **画面色彩与比例**：亮度、对比度、饱和度、伽马值调节；强制 16:9 / 4:3 / 21:9 / 1:1 / 原始比例。
  - **右侧抽屉式播放列表**：支持批量拖入、拖拽重排、自动连播下一集、历史播放进度记忆。
  - **快捷截图**：支持一键捕获当前高清画面（可选是否包含字幕）。

---

## ⌨️ 快捷键映射

| 快捷键            | 功能描述                   |
| :---------------- | :------------------------- |
| **Space**         | 播放 / 暂停                |
| **← / →**         | 快退 5 秒 / 快进 5 秒      |
| **Shift + ← / →** | 精确微调步进 1 秒          |
| **↑ / ↓**         | 增加 / 减少音量 5%         |
| **M**             | 静音 / 恢复音量            |
| **F / 双击画面**  | 进入 / 退出全屏            |
| **Escape**        | 退出全屏 / 关闭弹出面板    |
| **[ / ]**         | 播放速度 -0.1x / +0.1x     |
| **Backspace**     | 恢复 1.0x 正常倍速         |
| **C**             | 快速循环切换字幕           |
| **V**             | 快速循环切换音轨           |
| **S**             | 高清截取当前画面           |
| **. / ,**         | 逐帧前进 / 逐帧后退        |
| **L**             | 打开 / 收起右侧播放列表    |
| **Ctrl + O**      | 弹出选择本地媒体文件对话框 |

---

## 📁 目录结构

```
novaplayer/
├── scripts/
│   └── setup-mpv.ps1               # MPV 便携版引擎依赖检测与自动配置脚本
├── src-tauri/                      # Tauri v2 (Rust) 后端
│   ├── Cargo.toml                  # Rust 依赖与发布配置
│   ├── tauri.conf.json             # 窗口、无边框与资源打包配置
│   ├── capabilities/               # 桌面端安全权限策略
│   └── src/
│       ├── lib.rs                  # 应用生命周期与插件初始化
│       ├── main.rs                 # 桌面程序主入口
│       ├── mpv_ipc.rs              # Tokio 异步 Windows 命名管道通信模块
│       ├── mpv_manager.rs          # MPV 进程管理与 HWND 窗口挂载
│       └── commands.rs             # 前端 Tauri Command 指令调度中心
└── src/                            # 前端 Web UI (React 19 + Vite)
    ├── types/player.ts             # 播放器核心 TypeScript 类型定义
    ├── stores/playerStore.ts       # Zustand 播放器状态管理与历史持久化
    ├── services/mpvService.ts      # Tauri IPC 与事件分发包装层
    ├── hooks/
    │   └── useKeyboardShortcuts.ts # 全局键盘与手势快捷键绑定
    └── components/
        ├── TitleBar.tsx            # Windows 11 现代自定义沉浸式标题栏
        ├── WelcomeDropZone.tsx     # 空闲拖拽导入与最近播放记录面板
        ├── FloatingControls.tsx    # 悬浮主播放控制栏 (OSD)
        ├── ProgressBar.tsx         # 悬浮响应式进度条 (带悬停时间气泡)
        ├── VolumeControl.tsx       # 悬浮音量与 150% 增益调节
        ├── TrackPanel.tsx          # 音轨与字幕管理抽屉 (含延迟微调)
        ├── SpeedPanel.tsx          # 倍速切换面板
        ├── VideoAdjustPanel.tsx    # 画面比例与色彩滤镜面板
        ├── PlaylistDrawer.tsx      # 右侧抽屉式播放列表
        ├── SettingsModal.tsx       # 设置中心与快捷键指南
        └── Toast.tsx               # 磨砂玻璃全局通知提示
```

---

## 🚀 开发与构建

### 1. 配置 MPV 引擎依赖

在项目根目录运行初始化脚本，自动配置 `mpv.exe`：

```powershell
pnpm setup-mpv
```

_(或将您现有的 64 位 `mpv.exe` 直接放入 `src-tauri/binaries/mpv.exe`)_

### 2. 启动开发模式

```powershell
pnpm tauri dev
```

### 3. 构建独立的 Windows 安装包 / 单文件 exe

```powershell
pnpm tauri build
```

编译生成的安装包位于 `src-tauri/target/release/bundle/msi/` 与 `src-tauri/target/release/bundle/nsis/`。
