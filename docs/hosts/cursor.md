# Cursor Install

Install Supered into the default Cursor skills directory:

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | SUPERED_TARGET=cursor sh
```

Equivalent explicit form:

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | sh -s -- --target cursor
```

Cursor skill locations can vary by setup. Use `SUPERED_DEST` or `--dest` when you need to point the installer at a specific directory.
