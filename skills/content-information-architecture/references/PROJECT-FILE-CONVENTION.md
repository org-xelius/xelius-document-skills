# Project File Convention

```text
project-name/
├── source/
│   ├── documents/
│   ├── data/
│   ├── images/
│   └── brand/
├── working/
│   ├── source-inventory.json
│   ├── evidence-register.json
│   ├── project-manifest.json
│   ├── publication-plan.json
│   ├── deck-storyline.json
│   ├── design-direction.md
│   └── design-tokens.json
├── assets/
│   ├── charts/
│   ├── diagrams/
│   ├── svg/
│   ├── images/
│   └── fonts/
├── report/{src,output,renders}/
├── presentation/{src,output,renders}/
└── qa/
```

Keep originals immutable. Store transformations in `working/` or `assets/`. Keep generated source separate from exports and renders. Do not package fonts unless their license explicitly permits redistribution.
