# S2RFilm Screenplay Reviewer & Hollywood Coverage Studio

A professional-grade screenplay analysis, script doctoring, and dramaturgy platform for film and television with strict **Voice-Preservation Mandates**.

Designed with an architectural high-contrast monochrome aesthetic for development executives, showrunners, dramaturgs, and screenwriters.

---

## Key Features

1. **Strict Voice-Preservation Mandate**:
   - Protects and elevates the screenwriter's authentic voice, idiosyncratic syntax, and thematic intent without homogenizing into generic Hollywood formulas.
   - Provides an automated Voice Safeguard Certificate detailing signature tone, tonal palette, and avoided cliché traps.

2. **Studio Coverage & Craft Evaluation**:
   - Comprehensive Hollywood development executive coverage with industry verdicts (`RECOMMEND`, `CONSIDER`, `PASS`).
   - Craft scores (0–100) across Premise Originality, Structural Cohesion, Character Depth & Agency, Dialogue Cadence & Subtext, Narrative Velocity, and Commercial Viability.
   - High-concept logline generation, 3-act executive synopsis, and market comparables.

3. **Multi-Model AI & 100% Offline Air-Gapped Engine**:
   - **Google Gemini 3.8 Flash** integration via `@google/genai`.
   - **Local AI Models** (Ollama, LM Studio, LocalAI, vLLM) with OpenAI-compatible endpoints (`http://localhost:11434/v1`).
   - **Custom Web Endpoints** (OpenAI, OpenRouter, self-hosted LLMs).
   - **S2R Deterministic Heuristic Engine**: 100% offline, private, and air-gapped rule-based dramaturgical analysis that works without any network connection or API keys.

4. **Interactive Dramaturgy Modules**:
   - **Dialogue Cadence & Pacing**: Scene-by-scene balance, dialogue-to-action ratio, subtext depth, and character voice fingerprinting.
   - **Character Arcs & Agency**: Protagonist/antagonist want-vs-need dynamics, agency meters, and transformative arcs.
   - **Plot Continuity & Logic Holes**: Surgical detection of plot holes with non-destructive patch suggestions.
   - **3-Act Narrative Tension Curve**: Interactive SVG tension graph mapping Inciting Incidents, Midpoints, All Hope Lost moments, and Climax resolution.
   - **Surgical Scene Workshop**: Real-time line-by-line dialogue tightening and subtext enhancement with before/after diffs.
   - **Story Doctor Interactive Advisory**: Dedicated conversational dramaturg for beat-level problem solving.
   - **Screenplay Reader Mode**: Authentic 12pt Courier Prime typography, scene navigation, and instant 1-click **Word (.docx)**, **Fountain**, and **Print/PDF** exports.

---

## Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+
- npm or bun

### 1. Installation
Extract the zip archive and install dependencies:
```bash
npm install
```

### 2. Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key if you want to use the cloud AI model:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(Note: If no API key is provided, the platform automatically activates the built-in S2R Deterministic Heuristic Dramaturgy Engine, allowing 100% offline usage.)*

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm start
```

---

## Project Structure

```
├── server.ts              # Full-stack Express server + Gemini & Local AI proxy
├── src/
│   ├── components/        # React UI modules
│   │   ├── Header.tsx             # Studio navigation & action controls
│   │   ├── ScriptEditor.tsx       # Screenplay script input & sample scripts
│   │   ├── CoverageReport.tsx     # Studio coverage report & metrics
│   │   ├── DialoguePacingView.tsx # Pacing & subtext analytics
│   │   ├── CharacterArcsView.tsx  # Character want/need & agency tracker
│   │   ├── PlotHolesView.tsx      # Continuity & logic hole doctor
│   │   ├── StructureView.tsx      # Interactive SVG tension curve
│   │   ├── SceneWorkshopView.tsx  # Surgical scene dialogue polisher
│   │   ├── StoryDoctorChat.tsx    # Conversational dramaturg
│   │   ├── ScreenplayReader.tsx   # 12pt Courier reader & PDF/Docx exporter
│   │   └── SettingsModal.tsx      # Model connection (Gemini / Ollama / Local)
│   ├── server/            # Deterministic dramaturgy & heuristic engine
│   ├── types/             # TypeScript data schemas & contracts
│   ├── utils/             # Exporters (DOCX, Fountain, Text)
│   ├── App.tsx            # Main application coordinator
│   ├── main.tsx           # React DOM root
│   └── index.css          # Tailwind CSS v4 design tokens
├── package.json           # Scripts and dependencies
├── tsconfig.json          # TypeScript compiler configuration
└── vite.config.ts         # Vite configuration
```

---

## License
MIT / Apache-2.0
