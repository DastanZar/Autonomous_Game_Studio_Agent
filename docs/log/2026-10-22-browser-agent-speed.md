# 2026-10-22: browser agent speed (browser-agent repo)

**User:** "We need to continue the work of the browser agent task which we were doing, it still takes quite a long time per task and isnt quick enough, if we can add a layer of decision models, use some other technique or architexture to speed it up it owuld be great"

**Done** (in `DastanZar/browser-agent`, branch `claude/zealous-clarke-gloeem`, one commit):
- A decision layer: `quickread.route()` (no model call) sends read-only tasks that name a URL to a new quick read. Python reads the pages, including every row of virtualised lists, and opens detail pages 4 at a time. The model answers in 1–3 JSON calls (done / open these pages / hand to the agent). Anything needing clicks goes to the full agent, with notes and the saved items carried over. LinkedIn is read one page at a time.
- Hedged model requests (`core.HedgedChatOpenAI`): if a call hasn't answered after 12 s, a duplicate goes out and the first answer wins. This targets b.ai's measured 1-in-7 hangs.
- Wired into the dashboard ("Quick read" box, on by default), `agent.py --no-quick` and `bench --quick`. `LLM_PROVIDER=openrouter` added.

**Found:**
- There is no b.ai key in the container. The OpenRouter key has never had credit added, so paid models return 402. All live runs used one free model, MiniMax M3.1 Flash (Gemma free was rate-limited).
- Results, one run each: companies took 120 s with the agent and 12–36 s with quick read; catalog went from 7/21 to 21/21 rows; people from 584 s to 214 s; all 40/40 on the quick path.
- Hedging is only simulated: mean call 14.5 s → 5.9 s.

**Failures on the way:**
- The background tab didn't fire scroll events, which the reader fixed by dispatching them itself.
- MiniMax ignores JSON-schema mode, so its schema goes in the prompt.
- The model put off saving results until it had seen every page, which the last-round rule fixed.

**Not done:** a b.ai before/after benchmark (needs the key as an environment secret); a flow cache for repeated sites.
