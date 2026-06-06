# OpenCode Install

Install Supered into the default OpenCode skills directory:

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | SUPERED_TARGET=opencode sh
```

Equivalent explicit form:

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | sh -s -- --target opencode
```

OpenCode setups can differ. Use `SUPERED_DEST` or `--dest` if your local installation expects another skills directory.
