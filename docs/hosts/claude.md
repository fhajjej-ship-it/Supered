# Claude Install

Install Supered into the default Claude skills directory:

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | SUPERED_TARGET=claude sh
```

Equivalent explicit form:

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | sh -s -- --target claude
```

Use `--dest` if your Claude setup stores skills somewhere else.
