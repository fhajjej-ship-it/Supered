# Codex Install

Install Supered into the default Codex skills directory:

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | sh
```

Equivalent explicit form:

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | sh -s -- --target codex
```

Override the destination with `SUPERED_DEST` or `--dest` when your Codex setup uses a custom skills directory.
