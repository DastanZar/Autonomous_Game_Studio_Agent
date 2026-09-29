# Project instructions

This repository is an explainer-video studio. Before doing any video work, read and follow
`AGENT_PROMPT.md`: it describes the pipeline, the method, the hard rules and the definition of done.

@AGENT_PROMPT.md

For the multi-channel Shorts production line (channel bibles, stage playbooks, gates), start at
`studio/README.md`; workers follow `studio/sop/00-rules.md` and run `python3 studio/studio.py next|check`.

Keep `docs/DECISIONS.md` current: after every step that makes or changes a decision, add a row to its
log (newest first), update its open and blocked lists, and commit it with the work.
