#!/bin/sh
set -eu

SUPERED_REPO="${SUPERED_REPO:-https://github.com/fhajjej-ship-it/Supered}"
SUPERED_REF="${SUPERED_REF:-main}"
SUPERED_TARGET="${SUPERED_TARGET:-codex}"
SUPERED_SOURCE_DIR="${SUPERED_SOURCE_DIR:-}"
SUPERED_DEST="${SUPERED_DEST:-}"
SUPERED_SKILLS='using-supered
shape-the-task
make-a-map
build-in-slices
trace-the-fault
prove-the-change
ship-the-work'

usage() {
  cat <<'EOF'
Install Supered skills.

One-line install:
  curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | sh

Options:
  --target codex|claude|cursor|gemini|opencode
  --dest PATH
  --ref REF
  --help

Environment:
  SUPERED_TARGET      Install target. Defaults to codex.
  SUPERED_DEST        Override destination directory.
  SUPERED_REF         Git ref to install. Defaults to main.
  SUPERED_SOURCE_DIR  Local checkout to install from, used by tests and local development.
EOF
}

die() {
  printf '%s\n' "$*" >&2
  exit 1
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target)
      [ "$#" -ge 2 ] || die "--target requires a value"
      SUPERED_TARGET="$2"
      shift 2
      ;;
    --dest)
      [ "$#" -ge 2 ] || die "--dest requires a value"
      SUPERED_DEST="$2"
      shift 2
      ;;
    --ref)
      [ "$#" -ge 2 ] || die "--ref requires a value"
      SUPERED_REF="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      die "Unknown option: $1"
      ;;
  esac
done

default_dest() {
  case "$SUPERED_TARGET" in
    codex) printf '%s/.codex/skills\n' "$HOME" ;;
    claude) printf '%s/.claude/skills\n' "$HOME" ;;
    cursor) printf '%s/.cursor/skills\n' "$HOME" ;;
    gemini) printf '%s/.gemini/skills\n' "$HOME" ;;
    opencode) printf '%s/.opencode/skills\n' "$HOME" ;;
    *) die "Unsupported target: $SUPERED_TARGET" ;;
  esac
}

reject_symlink() {
  [ ! -L "$1" ] || die "Refusing to install symlink: $1"
}

reject_source_symlinks() {
  reject_symlink "$1"
  linked="$(find "$1" -type l -print -quit)"
  [ -z "$linked" ] || die "Refusing to install symlink: $linked"
}

reject_destination_symlinks() {
  [ ! -L "$dest" ] || die "Refusing to install into symlinked destination: $dest"
  for skill in $SUPERED_SKILLS; do
    [ ! -L "$dest/$skill" ] || die "Refusing to install into symlinked destination: $dest/$skill"
  done
}

download_source() {
  tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/supered.XXXXXX")"
  archive="$tmp_dir/supered.tar.gz"
  url="https://codeload.github.com/fhajjej-ship-it/Supered/tar.gz/$SUPERED_REF"

  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$archive"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$archive" "$url"
  else
    die "Install requires curl or wget"
  fi

  tar -xzf "$archive" -C "$tmp_dir"
  find "$tmp_dir" -mindepth 1 -maxdepth 1 -type d | head -n 1
}

source_dir="$SUPERED_SOURCE_DIR"
if [ -z "$source_dir" ]; then
  source_dir="$(download_source)"
fi

[ -d "$source_dir/skills" ] || die "Could not find skills in $source_dir"

dest="$SUPERED_DEST"
if [ -z "$dest" ]; then
  dest="$(default_dest)"
fi

for skill in $SUPERED_SKILLS; do
  skill_dir="$source_dir/skills/$skill"
  [ -d "$skill_dir" ] || die "Missing skill directory: $skill_dir"
  reject_source_symlinks "$skill_dir"
  [ -f "$skill_dir/SKILL.md" ] || die "Missing skill file: $skill_dir/SKILL.md"
done

reject_destination_symlinks
mkdir -p "$dest"
reject_destination_symlinks

for skill in $SUPERED_SKILLS; do
  cp -R "$source_dir/skills/$skill" "$dest/"
done

printf 'Installed Supered for %s at %s\n' "$SUPERED_TARGET" "$dest"
