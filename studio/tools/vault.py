"""Encrypted secrets for the studio, shared by every agent on any platform.

Secrets live encrypted in studio/vault.enc.json, which is committed and safe to publish. One key decrypts them.
The key is NEVER committed. Each agent platform stores it once, as the environment variable STUDIO_VAULT_KEY
(or in ~/.config/studio/vault.key on a personal machine).

    python3 studio/tools/vault.py keygen              # make a new key (once; prints it; store it outside git)
    python3 studio/tools/vault.py set NAME            # value read from stdin, never from the command line
    python3 studio/tools/vault.py get NAME            # print one value (for scripts; don't paste it anywhere)
    python3 studio/tools/vault.py list                # names only

In code: `from vault import secret; secret("YT_CLIENT_SECRET")` checks the environment first, then the vault.
Encryption: Fernet (AES-128-CBC + HMAC-SHA256) from the `cryptography` package (pip install cryptography).
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
VAULT = os.path.join(os.path.dirname(HERE), "vault.enc.json")
KEY_FILE = os.path.expanduser("~/.config/studio/vault.key")


def _key():
    k = os.environ.get("STUDIO_VAULT_KEY")
    if not k and os.path.exists(KEY_FILE):
        k = open(KEY_FILE).read().strip()
    if not k:
        sys.exit("no vault key: set STUDIO_VAULT_KEY (environment settings) or ~/.config/studio/vault.key")
    from cryptography.fernet import Fernet
    return Fernet(k.encode())


def _load():
    return json.load(open(VAULT)) if os.path.exists(VAULT) else {"_doc": "Encrypted with studio/tools/vault.py. Safe to commit; the key is never committed.", "secrets": {}}


def secret(name, required=True):
    """Environment variable first, then the vault."""
    if os.environ.get(name):
        return os.environ[name]
    v = _load()["secrets"].get(name)
    if v is None:
        if required:
            sys.exit(f"secret {name} is neither an environment variable nor in studio/vault.enc.json")
        return None
    return _key().decrypt(v.encode()).decode()


if __name__ == "__main__":
    cmd, args = (sys.argv[1] if len(sys.argv) > 1 else "help"), sys.argv[2:]
    if cmd == "keygen":
        from cryptography.fernet import Fernet
        print(Fernet.generate_key().decode())
    elif cmd == "set" and args:
        val = sys.stdin.read().strip()
        if not val:
            sys.exit("empty value on stdin")
        d = _load(); d["secrets"][args[0]] = _key().encrypt(val.encode()).decode()
        json.dump(d, open(VAULT, "w"), indent=1); open(VAULT, "a").write("\n")
        print(f"stored {args[0]} (encrypted) in {os.path.relpath(VAULT)}")
    elif cmd == "get" and args:
        print(secret(args[0]))
    elif cmd == "list":
        print("\n".join(sorted(_load()["secrets"])) or "(empty)")
    else:
        print(__doc__)
