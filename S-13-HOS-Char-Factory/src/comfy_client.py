"""HOS-CHAR-FACTORY · ComfyUI API 客户端。

封装 /prompt /history /view 接口：提交节点图、轮询完成、下载产物。
用法（被各 gen_*.py 调用，也可独立调试）:
    python comfy_client.py --host http://127.0.0.1:8188 ping
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.request

try:
    import yaml  # type: ignore
except ImportError:  # pragma: no cover
    yaml = None


class ComfyError(RuntimeError):
    pass


def load_config(path: str = "config.yaml") -> dict:
    """加载 HOS-CHAR-FACTORY 配置。"""
    if not os.path.exists(path):
        raise ComfyError(f"config not found: {path}")
    if yaml is None:
        raise ComfyError("pyyaml is required: pip install pyyaml")
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


class ComfyClient:
    """极简 ComfyUI 客户端（仅标准库 urllib，无额外依赖）。"""

    def __init__(self, host: str = "http://127.0.0.1:8188", timeout: int = 300):
        self.host = host.rstrip("/")
        self.timeout = timeout

    def _post(self, path: str, payload: dict) -> dict:
        req = urllib.request.Request(
            self.host + path,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def _get(self, path: str) -> dict:
        with urllib.request.urlopen(self.host + path, timeout=self.timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def ping(self) -> dict:
        return self._get("/system_stats")

    def queue_info(self) -> dict:
        return self._get("/queue")

    def submit(self, graph: dict) -> str:
        """提交节点图，返回 prompt_id。"""
        resp = self._post("/prompt", {"prompt": graph})
        if "prompt_id" not in resp:
            raise ComfyError(f"submit failed: {resp}")
        return resp["prompt_id"]

    def wait(self, prompt_id: str, poll: float = 2.0) -> dict:
        """轮询 /history 直到完成，返回该 prompt 的 history 记录。"""
        deadline = time.time() + self.timeout
        while time.time() < deadline:
            history = self._get(f"/history/{prompt_id}")
            if prompt_id in history:
                entry = history[prompt_id]
                if entry.get("status", {}).get("completed"):
                    return entry
                if entry.get("status", {}).get("status_str") == "error":
                    raise ComfyError(f"prompt {prompt_id} failed: {entry.get('status')}")
            time.sleep(poll)
        raise ComfyError(f"prompt {prompt_id} timeout after {self.timeout}s")

    def images_of(self, history_entry: dict) -> list[tuple[str, str]]:
        """收集 (subfolder, filename) 列表，兼容 filename/subfolder 分离字段。"""
        outs: list[tuple[str, str]] = []
        for node in history_entry.get("outputs", {}).values():
            for im in node.get("images", []):
                sub = im.get("subfolder", "") or ""
                outs.append((sub, im["filename"]))
        return outs

    def fetch(self, filename: str, subfolder: str = "", dest: str = ".") -> str:
        """下载产物到 dest，返回本地路径。"""
        import urllib.parse

        params = urllib.parse.urlencode(
            {"filename": filename, "subfolder": subfolder, "type": "output"}
        )
        url = f"{self.host}/view?{params}"
        os.makedirs(dest, exist_ok=True)
        local = os.path.join(dest, os.path.basename(filename))
        with urllib.request.urlopen(url, timeout=self.timeout) as resp, open(
            local, "wb"
        ) as f:
            f.write(resp.read())
        return local


def _build_txt2img(cfg: dict, positive: str, negative: str, denoise: float = 1.0,
                   filename_prefix: str = "hcf") -> dict:
    """按 config 构建 txt2img 节点图。"""
    ckpt = cfg["model"]["checkpoint"]
    sp = cfg["sampler"]
    w, h = sp["size"]
    return {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": ckpt}},
        "2": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["1", 1], "text": positive}},
        "3": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["1", 1], "text": negative}},
        "4": {"class_type": "EmptyLatentImage",
              "inputs": {"width": w, "height": h, "batch_size": 1}},
        "5": {"class_type": "KSampler",
              "inputs": {
                  "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0],
                  "latent_image": ["4", 0], "seed": sp["seed"], "steps": sp["steps"],
                  "cfg": sp["cfg"], "sampler_name": sp["sampler_name"],
                  "scheduler": sp["scheduler"], "denoise": denoise}},
        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage",
              "inputs": {"images": ["6", 0], "filename_prefix": filename_prefix}},
    }


def run_txt2img(client: ComfyClient, cfg: dict, positive: str, negative: str,
                denoise: float = 1.0, prefix: str = "hcf") -> list[tuple[str, str]]:
    """提交 txt2img 并等待完成，返回 (subfolder, filename) 列表。"""
    graph = _build_txt2img(cfg, positive, negative, denoise, prefix)
    pid = client.submit(graph)
    entry = client.wait(pid)
    return client.images_of(entry)


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="http://127.0.0.1:8188")
    ap.add_argument("action", nargs="?", default="ping")
    args = ap.parse_args()
    c = ComfyClient(args.host)
    if args.action == "ping":
        stats = c.ping()
        dev = stats.get("devices", [{}])[0]
        print(f"ComfyUI OK: {dev.get('name', '?')} "
              f"{dev.get('vram_total', 0) / 1024 ** 3:.1f}GB")
        q = c.queue_info()
        print(f"queue: running={len(q['queue_running'])} pending={len(q['queue_pending'])}")
    else:
        print("unknown action", file=sys.stderr)
        sys.exit(1)
