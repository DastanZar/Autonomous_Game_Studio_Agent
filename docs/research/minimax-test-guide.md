# Testing MiniMax Audio for Gut Gang's voice (step by step)

**Goal:** find a funny, witty, excited female voice for Gut Gang.
- Match the delivery we measured on your reference clip: about 173 words a minute, bright (around 270 Hz), and big pitch swings (about 15 semitones).
- Compare it with Fish "friendly" (our least-worst so far).

**MiniMax runs in your browser.** I can't sign in to it from here. The API has no permanent free tier
([agentdeals](https://agentdeals.dev/vendor/minimax), [Puter](https://developer.puter.com/tutorials/minimax-api-pricing/)).

## 1. Sign up (free)

- Go to [minimax.io/audio](https://www.minimax.io/audio/subscribe) and create an account.
- The free plan gives **10,000 credits a month**: about 12 minutes of the HD model, and 3 voice slots.
- **Licence:** that page lists commercial use on the free plan only for songs. So treat free-plan speech as a **test only**. Using it on monetised channels needs a paid plan (or their written OK).

## 2. Settings to use

| Setting | Use | Why |
|---|---|---|
| Model | **Speech 2.8 HD** | The best quality, and the only models (2.8 HD or Turbo) that support the laugh/sigh tags ([MiniMax API docs](https://platform.minimax.io/docs/api-reference/speech-t2a-http)) |
| Voice | Filter the library by **female · young · energetic / lively**, then try 2–3 | Skip anything named after a real person or a cartoon character |
| Emotion | Try **Happy**, then **Surprised**, then **Auto** | Auto guesses the emotion from the text; the fixed ones push harder ([Scenario](https://help.scenario.com/articles/9232650555-minimax-speech-the-essentials)) |
| Speed | **1.1–1.15** | Our target is about 173 words a minute |
| Pitch | 0, or +1 if the voice is low | Brightness |
| Voice Design (if you see it) | Describe the voice in words | Gives an original voice, not a copy of anyone |

**Voice Design description to paste:**
> A funny, quick-witted young American woman who hosts a hit science YouTube channel. Bright, bubbly and excited, with big
> pitch swings, playful teasing, dry deadpan on the punchlines, and the occasional laugh. Fast, about 175 words a minute.

## 3. The test text (paste exactly)

It uses real lines from our yawning episode, written in MiniMax's syntax:
- `<#0.4#>` is a pause in seconds. It must sit between words, and two can't be placed back to back.
- `(laughs)` and `(chuckle)` are sounds, and only work on Speech 2.8 ([MiniMax API docs](https://platform.minimax.io/docs/api-reference/speech-t2a-http)).

```
Reading about yawning makes people yawn. <#0.3#> A scientist measured it! The classic theory? You need oxygen. <#0.4#> Nope. (chuckle) In nineteen eighty-seven, Robert Provine had people breathe pure oxygen <#0.2#> and they kept yawning! (laughs) Five minutes of yawning faces? Fifty-five percent of people yawned! Reading about hiccups? <#0.4#> Eleven. <#0.5#> And there's no such thing <#0.3#> as half a yawn.
```

Use the tags sparingly: too many sound unnatural ([minimax-ai.chat](https://minimax-ai.chat/guide/minimax-audio-guide/)).

## 4. What to make

| Variant | Settings | Credits |
|---|---|---|
| A | Your favourite library voice, Happy, speed 1.1 | ~400 |
| B | The same voice, Surprised | ~400 |
| C | A second library voice, Happy | ~400 |
| D | The Voice Design voice, if available, Auto | ~400 |

That's about 1,600 credits, a sixth of the month.

## 5. Send them back

1. Download the MP3s.
2. Upload them to the repo at **`studio/voices/catalog/minimax/`**, named `A.mp3`, `B.mp3`… (the same way you added the hand images).
3. Tell me which settings each one used.

I'll then:
- measure each one against your clip (speed, pitch, swing);
- check by transcription that every word is right;
- put them on the dashboard next to Fish "friendly".

## Don't

- **Don't use Voice Clone on the shark clip,** or on any real creator. It's impersonation, YouTube can strike the channel, and it breaks our no-likeness rule.
- **Don't paste any API key in chat.** If we later go paid and use the API, add the key as an environment secret named `MINIMAX_API_KEY`.
