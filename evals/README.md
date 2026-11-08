# Evaluation procedures and evidence

Use `npm run eval:prepare` for isolated immutable v0.2.0 and candidate skill snapshots. The four consolidation tasks are in [consolidation-cases.json](consolidation-cases.json); broader production cases remain in [cases.json](cases.json), and discovery prompts in [triggers.json](triggers.json).

Run paired tasks with the same model, raw prompt, input, tools, and output requirements. Give independent agents only their snapshot paths, source artifacts, and permitted output workspace—not expected answers, suspected defects, or prior conclusions. Do not alter live installations during evaluation.

Record generated artifacts, execution observations, check results, elapsed time, and actual token usage only when the host exposes it. Ask each evaluator to list the instruction/reference files it actually opened, with repeated reads and partial reads distinguished. Count those observed text loads separately from collection footprint. Frontmatter metadata and SKILL bodies have different loading phases; neither folder counts nor fewer files prove token savings.

Compare factual integrity, scope adherence, editability, visual defects, validation honesty, and observed instruction loading. Test values, protected language, sources, OOXML text/notes, and artifact properties directly. Inspect real renders for visual conclusions. A measured regression blocks release; unperformed checks remain limitations. Keep failed attempts visible.

Results should name baseline tag, candidate version/commit, model/agent, prompts, input hashes, loaded paths/words, status per dimension, and artifacts or reproducible evidence. Missing tokens/timing stay null. Single-run synthetic tasks cannot establish statistical superiority or general production quality. Installing for three agents is not a cross-agent behavioural benchmark.

The missing-renderer case in the broader suite requires a genuinely tool-restricted environment, not an instruction to pretend a renderer is absent. Public fixtures contain synthetic material, not private reports or copyrighted reference PDFs.

[Historical v0.2.0 evidence](v0.2.0-results.json) is retained unchanged. Read the [v0.2.1 evaluation summary](v0.2.1-results.md) or [machine-readable results](v0.2.1-results.json) for actual observations, the retained failed attempt, and limitations.
