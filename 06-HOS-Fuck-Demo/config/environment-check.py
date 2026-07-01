#!/usr/bin/env python3
"""HOS-Fuck-Demo 环境依赖检测脚本

运行: python environment-check.py
输出: 各依赖的通过/失败状态 + 修复建议

检测项:
  - Python 版本
  - ffmpeg (系统版 vs imageio-ffmpeg 捆绑版)
  - edge-tts
  - Pillow / moviepy / numpy / opencv-python
  - node / npm / pptxgenjs (PPTX 生成)
  - 平台差异标记 (Windows/Linux/macOS)
  - 文件系统清理风险检测
"""

import subprocess, sys, os, json, shutil, platform, tempfile, importlib

PASS = "✅"
WARN = "⚠️"
FAIL = "❌"
SKIP = "⏭️"

results = []

def check(name, status, detail="", fix=""):
    results.append({"name": name, "status": status, "detail": detail, "fix": fix})
    icon = {"pass": PASS, "warn": WARN, "fail": FAIL, "skip": SKIP}[status]
    print(f"  {icon} {name}")
    if detail:
        print(f"     {detail}")
    if fix:
        print(f"     -> 修复: {fix}")

def run(cmd, timeout=15):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return r
    except FileNotFoundError:
        return None
    except subprocess.TimeoutExpired:
        return None

def get_ver(cmd, flag="--version"):
    r = run(cmd + [flag])
    if r and r.returncode == 0:
        return r.stdout.strip().split("\n")[0]
    return None

def main():
    print(f"\n{'='*60}")
    print(f"  HOS-Fuck-Demo 环境依赖检测")
    print(f"  平台: {platform.system()} | Python: {sys.version.split()[0]}")
    print(f"{'='*60}\n")

    # ── Python ──
    print("📦 Python 环境")
    py_ver = sys.version_info
    if py_ver >= (3, 8):
        check("python", "pass", f"{sys.version.split()[0]} (≥3.8)")
    else:
        check("python", "fail", f"{sys.version.split()[0]} (<3.8)", "升级到 Python 3.8+")

    # ── ffmpeg ──
    print("\n🎬 ffmpeg")
    ffmpeg_found = False

    # 系统 PATH ffmpeg
    sys_ff = shutil.which("ffmpeg")
    if sys_ff:
        r = run([sys_ff, "-version"])
        if r and r.returncode == 0:
            ver = r.stdout.split("\n")[1] if len(r.stdout.split("\n")) > 1 else "?"
            is_full = "--enable-libmp3lame" in r.stdout or "libmp3lame" in r.stdout
            status = "pass" if is_full else "warn"
            detail = f"系统 PATH: {sys_ff} | {ver.strip()}"
            if not is_full:
                detail += " ⚠️ 精简版(缺libmp3lame)"
            check(f"ffmpeg (系统)", status, detail,
                  "" if is_full else "安装完整版或使用 imageio-ffmpeg")
            ffmpeg_found = True

    # imageio-ffmpeg 捆绑版
    try:
        import imageio_ffmpeg
        iio_ff = imageio_ffmpeg.get_ffmpeg_exe()
        r = run([iio_ff, "-version"])
        if r and r.returncode == 0:
            ver = r.stdout.split("\n")[1] if len(r.stdout.split("\n")) > 1 else "?"
            check("ffmpeg (imageio)", "pass", f"{iio_ff} | {ver.strip()} ✅ 完整版推荐")
            ffmpeg_found = True
    except (ImportError, RuntimeError):
        check("ffmpeg (imageio)", "warn", "未安装 imageio-ffmpeg",
              "pip install imageio-ffmpeg")

    if not ffmpeg_found:
        check("ffmpeg", "fail", "未检测到任何 ffmpeg",
              "pip install imageio-ffmpeg")

    # ── ffprobe ──
    print("\n🔍 ffprobe")
    sys_fp = shutil.which("ffprobe")
    if sys_fp:
        check("ffprobe (系统)", "pass", sys_fp)
    else:
        try:
            import imageio_ffmpeg
            iio_dir = os.path.dirname(imageio_ffmpeg.get_ffmpeg_exe())
            iio_fp = os.path.join(iio_dir, "ffprobe")
            if os.path.exists(iio_fp):
                check("ffprobe (imageio)", "pass", iio_fp)
            else:
                check("ffprobe", "warn", "未找到 ffprobe", "ffprobe 非必需，但时长检测有用")
        except:
            check("ffprobe", "warn", "未找到 ffprobe")

    # ── Python 包 ──
    print("\n📚 Python 包")
    packages = [
        ("Pillow", "PIL", "幻灯片图片生成"),
        ("numpy", "numpy", "图像处理"),
        ("opencv-python", "cv2", "视频帧渲染 (可选)"),
        ("moviepy", "moviepy", "视频合成 (推荐替代纯 ffmpeg)"),
        ("imageio-ffmpeg", "imageio_ffmpeg", "捆绑完整 ffmpeg"),
        ("edge-tts", "edge_tts", "AI 语音合成 (TTS)"),
        ("markitdown", "markitdown", "PPTX→内容转换"),
    ]
    for pkg_name, import_name, desc in packages:
        try:
            importlib.import_module(import_name)
            # 获取版本
            mod = importlib.import_module(import_name)
            ver = getattr(mod, "__version__", None) or getattr(mod, "VERSION", None) or ""
            check(pkg_name, "pass", f"{desc} [{ver}]")
        except ImportError:
            check(pkg_name, "fail" if pkg_name != "opencv-python" else "warn",
                  f"{desc} 未安装",
                  f"pip install {pkg_name}")

    # ── Node / npm / pptxgenjs ──
    print("\n🖥️  PPTX 生成 (Node)")
    node_ver = get_ver(["node"])
    if node_ver:
        check("node", "pass", node_ver)
    else:
        check("node", "warn", "未安装", "安装 Node.js https://nodejs.org")

    npm_ver = get_ver(["npm"])
    if npm_ver:
        check("npm", "pass", npm_ver)
    else:
        check("npm", "warn", "未安装", "npm 随 Node 安装")

    # 检测 pptxgenjs
    if shutil.which("npx"):
        r = run(["npx", "pptxgenjs", "--version"])
        if r and r.returncode == 0:
            check("pptxgenjs", "pass", r.stdout.strip())
        else:
            check("pptxgenjs", "warn", "未本地安装",
                  "npm install pptxgenjs")
    else:
        check("pptxgenjs", "skip", "npx 不可用")

    # ── 文件系统 ──
    print("\n💾 文件系统")
    tmpdir = tempfile.mkdtemp(prefix="hos_env_")
    test_file = os.path.join(tmpdir, ".hos_write_test")
    try:
        with open(test_file, "w") as f:
            f.write("ok")
        os.remove(test_file)
        os.rmdir(tmpdir)
        check("文件写入", "pass", f"临时目录可读写: {tmpdir}")
    except PermissionError:
        check("文件写入", "fail",
              f"无权限写入临时目录",
              "检查目录权限")

    # 清理风险检测 (Windows 安全软件)
    if platform.system() == "Windows":
        check("文件清理风险", "warn",
              "Windows 安全软件可能清理 .mp4 文件",
              "交付物使用 .zip 打包 (已在 video-spec.md 中防御)")
    else:
        check("文件清理风险", "pass", "非 Windows 系统，无此风险")

    # ── 平台总结 ──
    print(f"\n{'='*60}")
    print(f"  检测完成: {sum(1 for r in results if r['status']=='pass')} PASS")
    print(f"            {sum(1 for r in results if r['status']=='warn')} WARN")
    print(f"            {sum(1 for r in results if r['status']=='fail')} FAIL")
    print(f"{'='*60}")

    fail_items = [r for r in results if r['status'] == 'fail']
    warn_items = [r for r in results if r['status'] == 'warn']

    if fail_items:
        print(f"\n❌ 必须修复 ({len(fail_items)}):")
        for r in fail_items:
            print(f"   - {r['name']}: {r['fix']}")

    if warn_items:
        print(f"\n⚠️  建议处理 ({len(warn_items)}):")
        for r in warn_items:
            print(f"   - {r['name']}: {r['fix']}")

    print(f"\n💡 一键安装所有推荐包:")
    print(f"   pip install imageio-ffmpeg moviepy Pillow numpy edge-tts")
    print(f"   npm install pptxgenjs")

    # 返回 JSON 供流水线消费
    return {
        "platform": platform.system(),
        "python": sys.version.split()[0],
        "results": results,
        "summary": {
            "pass": sum(1 for r in results if r['status'] == 'pass'),
            "warn": sum(1 for r in results if r['status'] == 'warn'),
            "fail": sum(1 for r in results if r['status'] == 'fail'),
        },
        "can_render_video": ffmpeg_found
    }

if __name__ == "__main__":
    env = main()
    # 输出 JSON 给流水线工具消费
    env_json = os.path.join(os.path.dirname(__file__), ".env-result.json")
    with open(env_json, "w") as f:
        json.dump(env, f, indent=2, ensure_ascii=False)
    print(f"\n📄 完整结果已写入: {env_json}")
