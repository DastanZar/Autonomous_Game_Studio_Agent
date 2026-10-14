"""Speech vs music level of the master mix: mix RMS while the VO speaks vs in VO gaps (music only), 100 ms windows."""
import subprocess, numpy as np, soundfile as sf, os, sys, tempfile
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
td = tempfile.mkdtemp()
for src, dst in (('renders/munich-1972-master.mp4', 'm.wav'), ('assets/vo.wav', 'v.wav')):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-ac', '1', '-ar', '16000', f'{td}/{dst}'], check=True)
m, _ = sf.read(f'{td}/m.wav'); v, _ = sf.read(f'{td}/v.wav')
n = min(len(m), len(v)); w = 1600; k = n // w
r = lambda x: np.sqrt((x[:k * w].reshape(k, w) ** 2).mean(1) + 1e-12)
rm, rv = r(m), r(v); vdb = 20 * np.log10(rv)
sp = vdb > vdb.max() - 30; sil = ~sp; mo = sil & np.roll(sil, 1) & np.roll(sil, -1)
L = lambda a: 20 * np.log10(np.sqrt((rm[a] ** 2).mean()))
print('speech %.1f dBFS · music in gaps %.1f dBFS · music under voice by %.1f dB' % (L(sp), L(mo), L(sp) - L(mo)))
