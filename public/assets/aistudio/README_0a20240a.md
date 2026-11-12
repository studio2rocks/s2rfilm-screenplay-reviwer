# S2RFilm Screenplay Reviewer

<div align="center">

![S2RFilm Banner](public/pwa-512x512.png)

**Professional Screenplay Doctor & Coverage Studio for Film and Television**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gen%20AI-Gemini%20Flash-4285F4.svg?logo=google)](https://ai.google.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

</div>

---

## 🎬 Overview

**S2RFilm Screenplay Reviewer** is an elite screenplay analysis, script coverage, and dramaturgy studio built for screenwriters, script doctors, development executives, and independent filmmakers. 

Unlike generic generative AI tools that homogenize scripts into formulaic studio clichés, S2RFilm operates under a **Strict Voice-Preservation Mandate**:
> *"Never rewrite the author's story into generic Hollywood tropes. Fiercely protect and elevate the writer's authentic voice, idiosyncratic cadence, and thematic intent while surgically tightening structure, narrative velocity, and character arcs."*

---

## ✨ Key Features

### 1. 📑 Comprehensive Hollywood Script Coverage
- **Industry Executive Verdicts**: Instant categorization into `RECOMMEND`, `CONSIDER WITH RESERVATIONS`, `CONSIDER`, or `PASS`.
- **Craft & Viability Scoring**: Calibrated metric scoring on character development, commercial viability, narrative drive, and structural cohesion.
- **Voice Safeguard Fingerprint**: Analyzes tonal palette, idiosyncratic stylistic patterns, and issues a formal Creative Vision Safeguard certification.

### 2. ⚡ Dialogue Cadence & Pacing Engine
- **Cadence & Rhythm Audit**: Line-by-line inspection of dialogue speed, white-space balance, and monologue-to-action ratios.
- **Subtext Density Tracker**: Flags on-the-nose exposition and pinpoints dialogue that lacks underlying character motivation.
- **Character Voice Differentiation**: Ensures each character speaks with unique syntax, vocabulary, sentence length, and psychological perspective.
- **Voice-Preserving Polish**: Provides actionable suggestions that sharpen punchy ping-pong rhythm without diluting character personality.

### 3. 🎭 Character Arcs & Agency Matrix
- **Want vs. Need Mapping**: Identifies the protagonist's conscious external objective versus unconscious emotional need.
- **Agency Scoring**: Verifies whether characters drive plot outcomes proactively or react passively to events.
- **Beat Progression & Turning Points**: Visualizes emotional inflection points from the Inciting Incident through Midpoint, All Is Lost, Climax, and Resolution.

### 4. 🔍 Plot Holes & Continuity Detector
- **Severity Classification**: Identifies issues tagged by impact level (`Critical`, `Moderate`, `Minor`).
- **Logic Seam Analysis**: Spots temporal inconsistencies, unexplained character knowledge leaps, unresolved setups, and unearned payoffs.
- **Non-Destructive Solutions**: Delivers fixes engineered to resolve continuity seams without requiring major page re-architectures.

### 5. 📐 Structure & Tension Curve Visualization
- **Act Breakdown**: Detailed breakdown of Act I, Act IIA, Act IIB, and Act III status and missing key beats.
- **Narrative Velocity Graph**: Dynamic tension curve mapping dramatic intensity against page progression.
- **Pacing Recommendations**: Concrete advice on scene trimming, beat repositioning, and sequence acceleration.

### 6. 🛠️ Scene Workshop & Interactive Polishing
- **Side-by-Side Comparison**: Live diffing of original scenes versus polished versions.
- **Line-by-Line Rationale**: Detailed explanations detailing *why* each pacing or subtext refinement enhances the scene.
- **Custom Scene Refining**: Submit any individual scene with custom director notes for targeted surgical improvements.

### 7. 💬 Context-Aware Story Doctor Chat
- **Embedded Dramaturg**: Conversational assistant grounded in your exact screenplay text, characters, and author statement.
- **Collaborative Problem-Solving**: Brainstorm organic twists, character motivations, and dialogue punch-ups while maintaining your established creative tone.

### 8. 📖 Archival Screenplay Reader
- **Authentic Courier Prime Typesetting**: Screenplay layout styled after standard 12pt industry paper, sluglines, parentheticals, and dialogue indentation.
- **Scene Navigation**: One-click jump between detected scenes, sluglines, and act markers.
- **Print & PDF Mode**: Built-in clean printer styles for reading physical pages or exporting to PDF.

### 9. 📂 Multi-Format Import & Export
- **Import Support**:
  - Microsoft Word (`.docx`)
  - EPUB e-books (`.epub`)
  - Plain Text (`.txt`, `.fountain`, `.fdx` scripts)
- **Export Support**:
  - Full Hollywood Coverage Report in Word format (`.docx`)
  - Formatted Screenplay (`.docx`, `.epub`, `.txt`)
  - Machine-readable JSON structured data

### 10. 🔌 Offline-First Heuristics Fallback
- Operates autonomously with zero external network connectivity or when no API key is configured.
- Contains a deterministic built-in dramaturgy parser (`dramaturgyEngine.ts`) that calculates dialogue statistics, scene counts, pacing rhythms, and act breakdowns entirely on-device.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons |
| **Backend** | Node.js, Express, TSX, Vite 8 Middleware |
| **AI Engine** | Google Gen AI SDK (`@google/genai`) powered by Gemini Flash |
| **Document Processing** | Mammoth (`.docx` import), Docx (`.docx` export), JSZip (`.epub` extraction) |
| **Platform** | Standalone Progressive Web App (PWA), Workbox offline service worker, Desktop Distribution |

---

## 📂 Project Structure

```text
├── desktop-dist/             # Standalone desktop launchers (Windows & macOS)
│   ├── windows/              # Batch launchers, VBS silent runners & Windows installer
│   └── mac/                  # macOS .app bundle & application install scripts
├── electron/                 # Electron main entry point configuration
├── public/                   # Static assets, icons, manifest, and service worker assets
│   ├── icon.svg
│   ├── apple-touch-icon.png
│   └── pwa-512x512.png
├── src/
│   ├── components/
│   │   ├── CharacterArcsView.tsx      # Character Want vs Need & agency auditor
│   │   ├── CoverageReport.tsx         # Comprehensive Hollywood studio coverage report
│   │   ├── DesktopInstallModal.tsx    # Native PWA & desktop installation modal
│   │   ├── DialoguePacingView.tsx     # Cadence, rhythm, and subtext density view
│   │   ├── Header.tsx                 # Top navigation, active state, and quick actions
│   │   ├── PlotHolesView.tsx          # Plot holes & continuity risks auditor
│   │   ├── SceneWorkshopView.tsx      # Side-by-side scene refiner and rationale
│   │   ├── ScreenplayReader.tsx       # Standard Courier Prime screenplay viewer
│   │   ├── ScriptEditor.tsx           # Script input, metadata, samples & file uploader
│   │   ├── StoryDoctorChat.tsx        # Context-aware dramaturgical consultant chat
│   │   └── StructureView.tsx          # Sequence structure and tension curve graph
│   ├── data/
│   │   └── sampleScripts.ts           # Pre-loaded multi-genre sample scripts
│   ├── hooks/
│   │   └── usePWAInstall.ts           # PWA installation and platform detection hook
│   ├── server/
│   │   └── dramaturgyEngine.ts        # Built-in offline heuristics dramaturgy engine
│   ├── types/
│   │   └── script.ts                  # TypeScript types for screenplay schema & coverage
│   ├── utils/
│   │   ├── fileExporter.ts            # DOCX, EPUB, TXT and desktop bundle exporter
│   │   └── fileImporter.ts            # DOCX, EPUB, and text file parser
│   ├── App.tsx                        # Main application layout and state coordinator
│   ├── index.css                      # Tailwind v4 styles, custom scrollbars, and print CSS
│   └── main.tsx                       # React DOM root entry point
├── server.ts                          # Express server with Vite dev middleware & API routes
├── vite.config.ts                     # Vite configuration with Tailwind and PWA plugin
├── tsconfig.json                      # TypeScript strict configuration
└── package.json                       # Dependencies and runtime scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.0.0` or higher
- **Package Manager**: `npm`, `pnpm`, or `bun`

### 1. Clone Repository

```bash
git clone https://github.com/your-username/s2rfilm-screenplay-reviewer.git
cd s2rfilm-screenplay-reviewer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Gemini API key:

```env
# Optional: If omitted, the app will seamlessly run using its local heuristic engine!
GEMINI_API_KEY="your-gemini-api-key-here"
```

> **Note**: To obtain a Gemini API key, visit [Google AI Studio](https://aistudio.google.com/).

### 4. Run Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

### 5. Production Build

To build the optimized static bundle with PWA caching:

```bash
npm run build
```

To run the full-stack production server:

```bash
npm start
```

---

## 💻 Desktop & Standalone Usage

### Progressive Web App (PWA)
1. Open the application in Google Chrome, Microsoft Edge, Brave, or Safari.
2. Click the **Install Desktop App** button in the top navigation bar or the browser's install icon in the URL bar.
3. The app installs locally and launches in its own dedicated, chromeless window with offline support.

### Windows Portable Package
- Launch via `desktop-dist/windows/Launch-S2RFilm-Reviewer.bat`
- Or run `desktop-dist/windows/Install-To-Windows-Desktop.bat` to create a desktop shortcut.

### macOS Application
- Double click `desktop-dist/mac/Install-To-Applications.command` to link `S2RFilm Reviewer.app` directly into your macOS Applications directory.

---

## 🔒 Privacy & Writer Voice Safeguard

- **No Public Training**: Your screenplays and creative materials are strictly processed in-session.
- **Voice Protection**: Every prompt sent to the LLM enforces strict constraints preventing generic trope substitution or unauthorized alteration of core character motivations.
- **Local Fallback**: If you prefer 100% offline air-gapped usage, remove the API key to run exclusively via the deterministic local rules engine.

---

## 📄 License

This project is licensed under the **Apache-2.0 License**. See the [LICENSE](LICENSE) file for details.
