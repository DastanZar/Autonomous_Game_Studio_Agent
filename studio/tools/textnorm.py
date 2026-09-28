"""Normalize text before computing WER, so '1932' (Whisper) matches 'nineteen thirty-two' (script).
No dependencies beyond jiwer."""
import re

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def spell(n):
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    if n < 1000:
        return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + spell(n % 100))
    for size, name in ((10 ** 12, "trillion"), (10 ** 9, "billion"), (10 ** 6, "million"), (1000, "thousand")):
        if n >= size:
            return spell(n // size) + " " + name + ("" if n % size == 0 else " " + spell(n % size))


def spell_year(n):
    hi, lo = divmod(n, 100)
    if n % 1000 < 10 and 2000 <= n < 2010:
        return spell(n)                       # 2005 -> two thousand five
    return spell(hi) + (" hundred" if lo == 0 else (" oh " + ONES[lo] if lo < 10 else " " + spell(lo)))


def words(s):
    """Lowercase words, digits spelled out, hyphens split, punctuation and 'and' removed."""
    s = s.lower().replace("%", " percent")
    out, prev = [], ""
    for tok in re.findall(r"[a-z']+|\d[\d,]*", s):
        if tok[0].isdigit():
            tok = tok.rstrip(",")
            n = int(tok.replace(",", ""))
            yearish = "," not in tok and 1100 <= n <= 2099
            out += (spell_year(n) if yearish else spell(n)).split()
        elif tok in ("i", "ii", "iii") and prev == "war":   # World War I -> world war one
            out.append(ONES[len(tok)])
        else:
            out.append(tok)
        prev = tok
    return [w for w in out if w != "and"]


def wer(ref, hyp):
    import jiwer
    r, h = " ".join(words(ref)), " ".join(words(hyp))
    return round(jiwer.wer(r, h), 3) if h else 1.0


def per_para_wer(paras, heard):
    """Score each paragraph from ONE transcript of the whole narration.
    Short lines transcribed in isolation are unreliable (no context: 'The emus did not' -> 'Daines did not'),
    so transcribe everything once, align word lists, and compute each paragraph's WER on its aligned span.
    paras: [(id, text)]. Returns {id: (wer, heard_span)}."""
    import difflib
    hyp = words(heard)
    ref, owner = [], []
    for pid, text in paras:
        w = words(text)
        ref += w
        owner += [pid] * len(w)
    sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
    errs = {pid: 0 for pid, _ in paras}
    spans = {pid: [] for pid, _ in paras}
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == "equal":
            for k in range(a1 - a0):
                spans[owner[a0 + k]].append(hyp[b0 + k])
            continue
        # a replace/delete costs max(len) errors, charged to the paragraph(s) it touches; an insert goes to the paragraph before it
        span_owner = owner[a0:a1] or [owner[max(0, a0 - 1)]]
        cost = max(a1 - a0, b1 - b0)
        for k in range(cost):
            errs[span_owner[min(k, len(span_owner) - 1)]] += 1
        spans[span_owner[0]] += hyp[b0:b1]
    n = {pid: max(1, len(words(t))) for pid, t in paras}
    return {pid: (round(errs[pid] / n[pid], 3), " ".join(spans[pid])) for pid, _ in paras}
