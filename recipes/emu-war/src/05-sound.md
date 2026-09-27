# Step 5: Music, sound effects and the mix

## 5.1 Create `shorts/emu-war/tools/audio.py`

All of this audio is synthesized with numpy and scipy; there are no sample files:
- a comic military march at 116 BPM (tuba oom-pah, snare, piccolo);
- a sad trombone after "And lost.";
- gunfire, a clunk when the gun jams, a truck engine, typewriter clicks, stamps, pops and dings.

The music drops out for comic beats and ducks under the voice. The random generator is seeded
(`1932`), so the mix is identical on every run.

```python
{{FILE:shorts/emu-war/tools/audio.py}}
```

## 5.2 Run it

```bash
cd shorts/emu-war && python3 tools/audio.py && cd ../..
md5sum shorts/emu-war/build/cues.json shorts/emu-war/build/mix.wav
```
**Checkpoint:** it prints `mix 46.039 s cues 135`, then:
```
cc5c5fdf2b31891eece8a6addbe9522a  shorts/emu-war/build/cues.json
96147ff963c79ce4bac636ca7f814ee1  shorts/emu-war/build/mix.wav
```
