# Behavioral evaluation

Use `npm run eval:prepare` to create isolated baseline and candidate snapshots in a temporary workspace. The baseline is the actual v0.1.1 commit. Each case in [cases.json](cases.json) has a realistic prompt, synthetic inputs where needed, and observable checks. [triggers.json](triggers.json) includes both relevant and unrelated prompts for skill selection.

Run each case in a fresh agent context, once with the baseline and once with the candidate, using the same model, tools, and prompt. Supply only the snapshot skill path, prompt, input paths, and isolated output destination. Do not supply expected answers or the developer's diagnosis. Include Hermes and Codex; Claude Code can run the same protocol.

Save the execution transcript, generated artifacts, elapsed time, and actual token usage if the host exposes it. Grade objective assertions from the artifacts and inspect design quality separately. Blind comparisons are preferable for visual judgment. Missing timing or token data stays null; never infer a benchmark score from unit tests, file existence, or source staging.

Record results in each case's `result.json`: configuration, agent/model, check outcomes with artifact evidence, reviewer observations, duration, and tokens. Repeat enough runs before drawing statistical conclusions. A missing renderer case must run in a tool environment without that capability; merely telling a fully equipped agent to pretend it lacks a renderer is not a valid test.

Release automation verifies schema, installation, and real artifact behavior. These checks complement behavioral evaluation; they do not substitute for actual image inspection or a measured improvement over the baseline.
