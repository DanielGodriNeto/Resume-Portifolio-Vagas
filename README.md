# Daniel Godri Neto — Portfolio


Portfolio for internship applications (AI, data, software). Trilingual (PT/EN/JP)
static site — plain HTML/CSS/JS, no build step.

## What's here

- `index.html`, `assets/` — the site itself
- `tools/ml-sandbox/` — the in-page gradient-boosting demo (Plate 01)
- `tests/` — a small self-check for the Jokenpo game logic

Jokenpô runs inline (`assets/js/jokenpo.js`). Batalha Naval 2 is a desktop
Pygame game, linked to its repo rather than embedded
([Mancato/Jogo-battleship](https://gitlab.com/Mancato/Jogo-battleship)).

## Running locally

No build step. Serve the folder with any static server:

```
python -m http.server 8000
```

Or `python .claude/serve.py` for a no-cache server on port 8080 (what
`.claude/launch.json` uses for local preview).
