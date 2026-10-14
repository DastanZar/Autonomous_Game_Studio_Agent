"""SRT from script.json text + timeline.json paragraph times: sentences split, timed by character share, max ~84 chars per cue."""
import json, os, re
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
S = {p['id']: p for p in json.load(open('script.json'))['paras']}
T = json.load(open('timeline.json'))['paras']
DISPLAY = {'Fuerstenfeldbruck': 'Fürstenfeldbruck', 'Connollystrasse': 'Connollystraße'}
def clean(s):
    s = re.sub(r'\[[^\]]*\]', '', s)
    for a, b in DISPLAY.items(): s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s).strip()
def chunks(text):
    out = []
    for sent in re.split(r'(?<=[.!?…])\s+', text):
        while len(sent) > 84:
            cut = sent.rfind(' ', 0, 84)
            cut = cut if cut > 30 else 84
            out.append(sent[:cut].strip()); sent = sent[cut:].strip()
        if sent: out.append(sent)
    return out
ts = lambda x: '%02d:%02d:%02d,%03d' % (x // 3600, x % 3600 // 60, x % 60, round((x - int(x)) * 1000))
cues = []
for p in T:
    parts = chunks(clean(S[p['id']]['say']))
    total = sum(len(c) for c in parts); t = p['start']
    for c in parts:
        d = (p['end'] - p['start']) * len(c) / total
        cues.append((t, t + d, c)); t += d
srt = ''.join(f'{i}\n{ts(a)} --> {ts(b)}\n{c}\n\n' for i, (a, b, c) in enumerate(cues, 1))
open('renders/munich-1972.srt', 'w').write(srt)
print(len(cues), 'cues')
