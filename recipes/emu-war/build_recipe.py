"""Assemble the recipe docs: src/*.md templates + {{FILE:path}} markers -> ./*.md with files pasted verbatim."""
import glob, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
for src in sorted(glob.glob(os.path.join(HERE, "src", "*.md"))):
    def fill(m):
        body = open(os.path.join(REPO, m.group(1))).read()
        assert "```" not in body, m.group(1) + " contains a code fence"
        return body.rstrip("\n")
    out = re.sub(r"\{\{FILE:([^}]+)\}\}", fill, open(src).read())
    open(os.path.join(HERE, os.path.basename(src)), "w").write(out)
    print(os.path.basename(src), len(out), "chars")
