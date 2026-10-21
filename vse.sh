#!/usr/bin/env bash
# ./vse.sh all <proj>            -> timeline + página + render (2 processos) + composição final
# ./vse.sh preview <proj> a b    -> só o trecho [a,b] (para auditar antes do render completo)
# ./vse.sh audit <proj> [arquivo]-> folha de contato, curva de energia e áudio
set -e
H="$(cd "$(dirname "$0")" && pwd)"; CMD=$1; P="$(cd "$2" && pwd)"
build() { python3 "$H/engine/build.py" "$P"; node "$H/web/build.js" "$P"; }
render_all() {
  local D; D=$(python3 -c "import json;print(json.load(open('$P/timeline.json'))['gfxEnd'])")
  local M; M=$(python3 -c "print(round($D/2,2))")
  rm -rf "$P/g" "$P/gb"
  node "$H/web/render.js" "$P" front 0 "$M" > "$P/_r1.log" 2>&1 &
  node "$H/web/render.js" "$P" front "$M" 9999 > "$P/_r2.log" 2>&1
  wait; cat "$P/_r1.log" "$P/_r2.log"
  node "$H/web/render.js" "$P" behind
}
case "$CMD" in
  build) build ;;
  all) build; render_all; python3 "$H/engine/composite.py" "$P"; python3 "$H/engine/audit.py" "$P" "$P/final.mp4" ;;
  preview) build; node "$H/web/render.js" "$P" front "$3" "$4"; node "$H/web/render.js" "$P" behind "$3" "$4"; python3 "$H/engine/composite.py" "$P" "$3" "$4" preview ;;
  final) python3 "$H/engine/composite.py" "$P"; python3 "$H/engine/audit.py" "$P" "$P/final.mp4" ;;
  audit) python3 "$H/engine/audit.py" "$P" "${3:-$P/final.mp4}" ;;
esac
