#!/usr/bin/env bash
# ./vse.sh all <proj>            -> timeline + página + render (2 processos) + composição final
# ./vse.sh preview <proj> a b    -> só o trecho [a,b] (para auditar antes do render completo)
# ./vse.sh audit <proj> [arquivo]-> folha de contato, curva de energia e áudio
# ./vse.sh seq <proj> [n]        -> modo sequência (vídeo narrado sem pessoa): <proj>/seq.html + seq.json
#                                   eventos -> render em n processos -> mixagem -> final.mp4 -> auditoria
# ./vse.sh seqaudio <proj>       -> só refaz a mixagem e o mux (trilha, efeitos, níveis), sem re-renderizar
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
seq_render() {
  local N=${1:-3}
  node "$H/web/seq/events.js" "$P/seq.html" "$P/events.json"
  local F; F=$(python3 -c "import json;d=json.load(open('$P/events.json'));print(int(round(d['end']*d['fps'])))")
  rm -f "$P"/_part*.mp4 "$P/_parts.txt"
  for i in $(seq 0 $((N-1))); do
    local A=$((F*i/N)) B=$((F*(i+1)/N))
    node "$H/web/seq/render.js" "$P/seq.html" "$P/_part$i.mp4" $A $B > "$P/_part$i.log" 2>&1 &
    echo "file '_part$i.mp4'" >> "$P/_parts.txt"
  done
  wait; cat "$P"/_part*.log | grep -v "^\[page\]" | tail -3
  ffmpeg -v error -y -f concat -safe 0 -i "$P/_parts.txt" -c copy "$P/_video.mp4"
}
seq_mux() {
  python3 "$H/engine/seq_audio.py" "$P"
  ffmpeg -v error -y -i "$P/_video.mp4" -i "$P/audio_master.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$P/final.mp4"
}
case "$CMD" in
  seq) seq_render "$3"; seq_mux; python3 "$H/engine/audit.py" "$P" "$P/final.mp4" ;;
  seqaudio) node "$H/web/seq/events.js" "$P/seq.html" "$P/events.json"; seq_mux ;;
  build) build ;;
  all) build; render_all; python3 "$H/engine/composite.py" "$P"; python3 "$H/engine/audit.py" "$P" "$P/final.mp4" ;;
  preview) build; node "$H/web/render.js" "$P" front "$3" "$4"; node "$H/web/render.js" "$P" behind "$3" "$4"; python3 "$H/engine/composite.py" "$P" "$3" "$4" preview ;;
  final) python3 "$H/engine/composite.py" "$P"; python3 "$H/engine/audit.py" "$P" "$P/final.mp4" ;;
  audit) python3 "$H/engine/audit.py" "$P" "${3:-$P/final.mp4}" ;;
esac
