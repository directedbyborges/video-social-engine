# Recorte da pessoa (primeiro plano) com RobustVideoMatting (ONNX, CPU) — para texto "atrás" da pessoa.
import os, subprocess, numpy as np, cv2
CACHE = os.environ.get("VSE_MODELS", os.path.expanduser("~/.cache/vse"))
URL = "https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx"

class Matter:
    def __init__(self, work_w=540):
        p = CACHE + "/rvm_mobilenetv3_fp32.onnx"
        if not os.path.exists(p):
            os.makedirs(CACHE, exist_ok=True)
            subprocess.run(["curl", "-sSL", "-m", "300", "-o", p, URL], check=True)
        import onnxruntime as ort
        o = ort.SessionOptions(); o.intra_op_num_threads = 2
        self.s = ort.InferenceSession(p, o, providers=["CPUExecutionProvider"])
        self.w = work_w; self.reset()

    def reset(self):
        self.rec = [np.zeros((1, 1, 1, 1), np.float32)] * 4

    def __call__(self, bgr):
        H, W = bgr.shape[:2]; h = int(round(H * self.w / W / 2)) * 2
        x = cv2.cvtColor(cv2.resize(bgr, (self.w, h), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB).astype(np.float32) / 255
        x = x.transpose(2, 0, 1)[None]
        out = self.s.run(None, {"src": x, "r1i": self.rec[0], "r2i": self.rec[1], "r3i": self.rec[2], "r4i": self.rec[3],
                                "downsample_ratio": np.array([.5], np.float32)})
        pha = out[1][0, 0]; self.rec = out[2:6]
        a = cv2.resize(pha, (W, H), interpolation=cv2.INTER_LINEAR)
        return np.clip((a - .05) / .9, 0, 1)
