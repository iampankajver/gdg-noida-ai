# Aura - AI Career Intelligence & Advisor Platform

Aura is a personal career intelligence platform that fuses job postings, candidate profiles, and labor-market trends into personalized, actionable guidance. Rather than acting as a simple search engine that lists jobs based on keywords, Aura acts as a true career advisor, benchmarking applicant capabilities, identifying specific skill gaps, generating interactive learning roadmaps, and providing mock technical prep.

## Key Features

1. **Unified Dashboard:**
   - Calibrated **Market Alignment Index** radial gauge.
   - High-impact career recommendations (e.g. key technical integrations).
   - Dynamic matches to Noida/Remote job listings based on active skill profiles.

2. **Resume ATS Scorer & Optimizer:**
   - Paste-and-grade resume scanner scoring Content Impact, Structure Clarity, ATS Keyphrase Coverage, and Style.
   - Actionable feedback highlighting weaknesses (e.g. passive verbs) and showing precise improvement suggestions.

3. **Noida Labor-Market Trends:**
   - Growth indicators detailing Noida's high-demand tech stacks.
   - Interactive SVG salary range indicators grouped by career track.
   - Interactive SVG hiring velocity chart outlining onboarding speeds over time.

4. **Interactive Skill Gap solver:**
   - Target tracks: Senior Frontend, Cloud DevOps, Full Stack Developer, Data Scientist, Product Manager.
   - Skill Gaps audit mapping acquired skills (green), critical gaps (red), and electives (yellow).
   - Curated step-by-step learning modules with duration, difficulty, course links, and checkable milestones. Completing checklist items automatically acquires skills, recalculating match gauges instantly.

5. **AI Coach Nova (Chat):**
   - General career strategy chat and salary advice.
   - **Mock Technical Interview engine:** Nova conducts interactive role-specific technical rounds, scoring answers and outputting detailed diagnostic feedback reports.

---

## Technical Stack & Architecture

Aura is built as a self-contained, high-performance **Single Page Application (SPA)** utilizing vanilla web standard components for maximal speed and customization:
- **Core Structure:** HTML5 with semantic nodes.
- **Styling:** CSS3 variables, flexible Grid layouts, glassmorphic styles (`backdrop-filter: blur`), glowing widgets, and keyframe animations.
- **Data Engine:** `js/data.js` mocks data tables, course checklists, and AI dialogues.
- **Modules & App Coordination:** ES6 classes orchestrate state updates:
  - `js/profile.js` manages candidate profile edits and resume parsing.
  - `js/trends.js` calculates and renders custom interactive SVG charts and tooltips.
  - `js/advisor.js` runs skill gap audits and learning checkmarks.
  - `js/chat.js` runs AI chatbot evaluation state machine.
  - `js/app.js` coordinates navigation, state synchronization, and page events.

---

## Folder Structure

```
gdg-noida-ai/
├── index.html          # Main application structure & layouts
├── css/
│   └── styles.css      # Core styles, dark-theme variables, and layouts
├── js/
│   ├── data.js         # Mock database schema and coach scripts
│   ├── profile.js      # Resume grader and profile tags editor
│   ├── trends.js       # Dynamic SVG chart rendering and tooltips
│   ├── advisor.js      # Skill gaps matching and curriculum roadmap
│   ├── chat.js         # Nova chat simulator and interview engine
│   └── app.js          # App orchestrator, state sync, and tabs manager
└── README.md           # Documentation
```

---

## Getting Started

Since Aura is built using pure client-side technologies, it requires **no build setups or npm installations**.

### Running Locally
To launch the application, you can simply open the `index.html` file in any modern web browser:
1. Double-click `index.html` or drag it into your browser.
2. Alternatively, run a lightweight local server from the project directory:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Or using Node.js
   npx serve .
   ```
3. Open `http://localhost:8000` (or the server URL) in your browser.
