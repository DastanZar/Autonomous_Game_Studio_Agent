"""End-of-session close-out: make sure nothing from this chat stays stranded on this machine.

    python3 studio/tools/closeout.py ["commit message"]

Every agent runs this before it stops (AGENTS.md). It:
  1. fetches main and merges it into the current branch (stops on a conflict and says so);
  2. stages finished media that git would otherwise skip: */out/*.mp4 under 95 MB;
  3. warns if this branch never touched docs/log/ (your chat must be logged there);
  4. rebuilds the dashboard and every video's NOTES.md;
  5. commits everything and pushes to main (`git push origin HEAD:main`), retrying with a fresh merge once.
"""
import glob, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def git(*a, check=True):
    r = subprocess.run(["git", "-C", ROOT, *a], capture_output=True, text=True)
    if check and r.returncode:
        sys.exit(f"git {' '.join(a)} failed:\n{r.stderr.strip() or r.stdout.strip()}")
    return r


def merge_main():
    git("fetch", "-q", "origin", "main")
    r = git("merge", "--no-edit", "origin/main", check=False)
    if r.returncode:
        git("merge", "--abort", check=False)
        sys.exit("merging origin/main conflicts with your changes. Resolve it by hand (keep both sides' content), then re-run.")


def main():
    msg = sys.argv[1] if len(sys.argv) > 1 else "Session close-out: logs, media, dashboard"
    if git("status", "--porcelain").stdout.strip():
        git("add", "-A")
        git("commit", "-q", "-m", "WIP before close-out merge", check=False)
    merge_main()
    big = []
    for f in glob.glob(os.path.join(ROOT, "*", "**", "out", "*.mp4"), recursive=True):
        if "/.claude/" in f:
            continue
        if os.path.getsize(f) < 95 * 1024 * 1024:
            git("add", "-f", os.path.relpath(f, ROOT))
        else:
            big.append(os.path.relpath(f, ROOT))
    if not any(p.startswith("docs/log/") for p in git("diff", "--name-only", "origin/main", "HEAD").stdout.split()) \
            and not any(l[3:].startswith("docs/log/") for l in git("status", "--porcelain").stdout.splitlines()):
        print("WARNING: this session added nothing to docs/log/. Append this chat to docs/log/<date>-<topic>.md, then re-run.")
    subprocess.run([sys.executable, os.path.join(ROOT, "studio", "studio.py"), "dashboard"], check=True)
    git("add", "-A")
    git("commit", "-q", "-m", msg, check=False)
    for attempt in (1, 2):
        if git("push", "-q", "origin", "HEAD:main", check=False).returncode == 0:
            print("pushed to main:", git("rev-parse", "--short", "HEAD").stdout.strip())
            break
        if attempt == 1:
            merge_main()
    else:
        sys.exit("push to main failed twice; check `git status` and network/access")
    if big:
        print("NOT pushed (over 95 MB, split them with ffmpeg -f segment):", *big, sep="\n  ")


if __name__ == "__main__":
    main()
