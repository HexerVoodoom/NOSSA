# NOSSA — Performance Evaluation Tool

React + Vite + Tailwind app for role/competency-based performance evaluations.

## ProdSquad

- **11 subagents** (`.claude/agents/`) — 9 disciplines + 2 independent reviewers (`investor-skeptic` + `design-critic`).
- **An orchestrator skill** `/prod-squad` (`.claude/skills/prod-squad/`).
- **Schema source of truth:** `CONTRACT.md` — enforced by `scripts/validate_squad.py`.
- **Brand/design tokens:** `brand/design-system.md` — consumed by `product-designer`.
- Run `/prod-squad` to dispatch the squad (discovery → prototyper → builder → sweeper → grower → maintainer).

## Data

- `src/data/defaultLibrary.json` — default seed data (members, roles, competencies, evaluations) loaded on first run via `src/lib/defaultLibrary.ts`. Consumed by `src/lib/storage.ts`.

## Conventions

- **Never `mkdir`** — create files with the editor (parent dirs auto-create).
- **Language:** code, comments, identifiers in **English**.
