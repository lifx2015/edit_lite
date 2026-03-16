# EditLite

A lightweight text editor built with Tauri, focused on simplicity and efficiency.

English | **[中文](./README.md)**

![EditLite Screenshot](./screenshot.png)

## Features

### Editing
- **Multi-tab Editing** - Edit multiple files simultaneously with tab management
- **Syntax Support** - Markdown, JavaScript/TypeScript, JSON, CSS, HTML, Python, SQL, Java
- **Rectangular Selection** - Block selection editing mode
- **Word Wrap** - Toggle word wrap on/off
- **JSON Formatting** - One-click JSON formatting

### File Operations
- **Multi-file Open** - Open multiple files at once
- **Auto Encoding Detection** - Supports UTF-8, GBK, Shift_JIS, EUC-KR, Windows-1252
- **Encoding Conversion** - Save files with selected target encoding
- **File Association** - Open files via system file association
- **File Change Notification** - Notify users when files have been modified outside the editor
- **Window Auto Activation** - Automatically restore and focus window when opening files while minimized
### Markdown Preview
- **Edit Mode** - Pure editing view
- **Split Mode** - Editor on the left, live preview on the right
- **Preview Mode** - Pure preview view
- **GitHub Flavored Markdown** - Supports GFM extended syntax (tables, task lists, etc.)

### Interface Customization
- **Theme Switching** - Supports system theme, light theme, and dark theme modes
- **Font Selection** - Multiple monospace and CJK fonts available
- **Font Size** - Supports 12-24pt, mouse wheel zoom (Ctrl+Wheel)
- **Status Bar** - Displays file path, encoding, line/column position, zoom level

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| Ctrl+N | New file |
| Ctrl+S | Save file |
| Ctrl+W | Close current tab |
| Ctrl++ | Increase font size |
| Ctrl+- | Decrease font size |
| Ctrl+Wheel | Zoom font |

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 7
- **Backend**: Tauri 2 + Rust
- **Editor**: CodeMirror 6
- **Markdown**: react-markdown + remark-gfm

## Development

### Requirements

- Node.js 18+
- Rust 1.70+
- pnpm / npm / yarn

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run tauri dev
```

### Build for Release

```bash
npm run tauri build
```

The installer will be generated in `src-tauri/target/release/bundle/`.

## Project Structure

```
edit_lite/
├── src/                    # Frontend source
│   ├── App.tsx             # Main app component
│   ├── App.css             # Styles
│   └── main.tsx            # Entry point
├── src-tauri/              # Tauri backend
│   ├── src/
│   │   ├── main.rs         # Entry
│   │   └── lib.rs          # Core logic
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri config
├── package.json
└── README.md
```

## Supported File Types

| Extension | Description |
|-----------|-------------|
| .txt | Plain text |
| .md | Markdown |
| .js | JavaScript |
| .ts | TypeScript |
| .json | JSON |
| .html | HTML |
| .css | CSS |
| .rs | Rust |
| .py | Python |

## Roadmaprcmd

- [x] Markdown syntax support
- [x] JavaScript syntax support
- [x] JSON syntax support
- [x] Rectangular selection
- [x] Custom font settings
- [x] Find and replace
- [x] Dark theme
- [x] More syntax highlighting
- [ ] Auto save

## License

MIT License