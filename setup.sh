#!/usr/bin/env bash
# Prepara a máquina (uma vez por sessão). Idempotente.
set -e
H="$(cd "$(dirname "$0")" && pwd)"
cd "$H/web" && npm install --silent >/dev/null 2>&1 && cd "$H"
pip install --break-system-packages -q sherpa-onnx soundfile onnxruntime opencv-python-headless numpy 2>/dev/null || true
CACHE="${VSE_MODELS:-$HOME/.cache/vse}"; mkdir -p "$CACHE"
[ -f "$CACHE/icons/index.json" ] || python3 "$H/engine/icons.py" index
[ -f "$CACHE/rvm_mobilenetv3_fp32.onnx" ] || curl -sSL -m 300 -o "$CACHE/rvm_mobilenetv3_fp32.onnx" https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx
# Chromium do Playwright: usa o headless_shell pré-instalado; se não houver, defina VSE_CHROME
ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell >/dev/null 2>&1 || echo "AVISO: defina VSE_CHROME com o caminho de um chromium headless"
echo "ok — Whisper baixa sozinho na primeira transcrição (~560 MB)"
