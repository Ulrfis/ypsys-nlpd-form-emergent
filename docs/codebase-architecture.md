# Codebase architecture (diagrams)

Visual overview of **ypsys-nlpd-form-emergent**: nLPD compliance self-assessment form (React + FastAPI + Supabase + OpenAI Assistant), deployed on Railway.

For narrative detail, see `AGENTS.md` and `README.md`.

## Runtime architecture (data & services)

```mermaid
flowchart LR
  subgraph Browser["Browser"]
    UI["React 19 app\n(shadcn / Tailwind)"]
  end

  subgraph Railway["Railway (prod)"]
    BE["FastAPI\nbackend/server.py"]
    Static["Built SPA\n(static via FastAPI)"]
  end

  subgraph External["External services"]
    OAI["OpenAI\nAssistant API"]
    SB["Supabase\nPostgreSQL EU"]
    Grain["GrainQL / optional analytics"]
  end

  UI -->|"questionnaire + state\n(FormFlow)"| UI
  UI -->|"/api/analyze\n(keys server-side)"| BE
  BE -->|"assistant run"| OAI
  UI -->|"form_submissions,\nemail_outputs"| SB
  UI -.->|"analytics (optional)"| Grain
  Static --> UI
```

## Request flow (happy path)

```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant B as FastAPI
  participant O as OpenAI Assistant
  participant S as Supabase

  U->>F: Complete questionnaire
  F->>B: POST /api/analyze
  B->>O: Run assistant
  O-->>B: Teaser + structured analysis + emails
  B-->>F: JSON response
  F->>S: Insert submission / email_outputs
  F-->>U: Results + thank-you flow
```

## Repository layout (main pieces)

```mermaid
flowchart TB
  subgraph Root["Repo root"]
    FE["frontend/\nCreate React App + CRACO"]
    BE["backend/\nPython 3.11"]
    Docs["docs/\nschemas, prompts, audits"]
    Deploy["nixpacks.toml, railway.toml,\nProcfile, railway.json"]
  end

  subgraph FEsrc["frontend/src"]
    App["App.js"]
    FF["components/FormFlow.jsx\norchestrator"]
    Q["data/questionsData.js"]
    Lib["lib/\nopenai.js, supabase.js,\nanalytics, booking, debug"]
    Ctx["context/\nTheme, Debug, Consent"]
    Pages["components/\nLanding, QuestionCard,\nAnalysis/Results/ThankYou,\nLeadCapture, Privacy"]
    UI["components/ui/\nshadcn primitives"]
  end

  subgraph BEpy["backend"]
    Srv["server.py\nAPIRouter /api"]
  end

  FE --> FEsrc
  App --> FF
  FF --> Q
  FF --> Lib
  FF --> Pages
  Pages --> UI
  Lib -->|"HTTP"| Srv
```

## Backend API surface (orientation)

```mermaid
flowchart LR
  subgraph Public["Used by product flow"]
    A["POST /api/analyze"]
    H["GET /api/health"]
  end

  subgraph Admin["X-API-Key if configured"]
    L["GET /api/submissions"]
    T["GET /api/stats"]
  end

  subgraph LegacyCompat["In-memory / compat"]
    P["POST/GET /api/submissions\n(also legacy paths)"]
    ST["POST/GET /api/status"]
  end
```
