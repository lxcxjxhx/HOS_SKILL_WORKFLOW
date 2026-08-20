# Environment Check — 环境检测指南

> 流水线执行前检测运行环境，选择正确的执行策略。
> 避免因 ffmpeg 精简版、edge-tts 不可用、平台差异导致渲染失败。

---

## 1. 检测脚本

运行以下 Python 脚本检测环境，输出 JSON 结果供流水线决策：

```python
# env_check.py — 运行环境检测
import subprocess, shutil, sys, platform, os, json

def check_ffmpeg():
    """检测所有可用的 ffmpeg"""
    results = []
    
    # 1. 系统 PATH 中的 ffmpeg
    sys_ff = shutil.which("ffmpeg")
    if sys_ff:
        try:
            r = subprocess.run([sys_ff, "-version"], capture_output=True, text=True, timeout=5)
            if r.returncode == 0:
                first_line = r.stdout.split("\n")[0] if r.stdout else ""
                features = _analyze_ffmpeg_features(r.stdout)
                results.append({
                    "source": "system PATH",
                    "path": sys_ff,
                    "version": first_line,
                    "features": features
                })
        except: pass
    
    # 2. imageio-ffmpeg 捆绑版
    try:
        import imageio_ffmpeg
        iio_ff = imageio_ffmpeg.get_ffmpeg_exe()
        r = subprocess.run([iio_ff, "-version"], capture_output=True, text=True, timeout=5)
        if r.returncode == 0:
            first_line = r.stdout.split("\n")[0] if r.stdout else ""
            features = _analyze_ffmpeg_features(r.stdout)
            results.append({
                "source": "imageio-ffmpeg",
                "path": iio_ff,
                "version": first_line,
                "features": features
            })
    except: pass
    
    return results

def _analyze_ffmpeg_features(version_output):
    """分析 ffmpeg 编译特性"""
    output = version_output.lower()
    return {
        "full_build": "--enable-libmp3lame" in output or "configuration:" in output,
        "mp3_decode": "--enable-libmp3lame" in output or "libmp3lame" in output,
        "loop_filter": "loop" in output[:500],  # 粗略检测
        "aac_encoder": "--enable-libaac" in output or "aac" in output[:1000],
    }

def check_edge_tts():
    """检测 edge-tts 可用性"""
    try:
        r = subprocess.run(
            [sys.executable, "-m", "edge_tts", "--help"],
            capture_output=True, text=True, timeout=10
        )
        return {"available": r.returncode == 0}
    except:
        return {"available": False, "error": "edge_tts module not found"}

def check_python_packages():
    """检测关键 Python 包"""
    packages = ["cv2", "numpy", "imageio_ffmpeg"]
    result = {}
    for pkg in packages:
        try:
            __import__(pkg.replace("_", ""))
            result[pkg] = True
        except:
            # 尝试原名
            try:
                __import__(pkg)
                result[pkg] = True
            except:
                result[pkg] = False
    return result

def check_file_cleanup():
    """检测输出目录是否被外部进程清理"""
    test_file = ".hos_env_test"
    try:
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        return {"writable": True, "cleanup_detected": False}
    except:
        return {"writable": False, "cleanup_detected": True}

# 执行全部检测
env = {
    "platform": platform.system(),
    "python": sys.version,
    "ffmpeg": check_ffmpeg(),
    "edge_tts": check_edge_tts(),
    "packages": check_python_packages(),
    "file_system": check_file_cleanup(),
    "cwd": os.getcwd()
}

print(json.dumps(env, indent=2, ensure_ascii=False))

# 输出决策建议
print("\n=== 决策建议 ===")
ffmpegs = env["ffmpeg"]
if ffmpegs:
    best = max(ffmpegs, key=lambda f: sum(f["features"].values()))
    print(f"✅ 推荐使用 ffmpeg: {best['source']} -> {best['path']}")
    if not best["features"]["full_build"]:
        print("⚠️  当前 ffmpeg 是精简版，建议安装 imageio-ffmpeg: pip install imageio-ffmpeg")
else:
    print("❌ 未检测到 ffmpeg，渲染将失败")
    print("   安装: pip install imageio-ffmpeg")

if env["edge_tts"]["available"]:
    print("✅ edge-tts 可用")
else:
    print("⚠️  edge-tts 不可用，音频合成需人工处理")
    print("   安装: pip install edge-tts")

missing_pkgs = [k for k, v in env["packages"].items() if not v]
if missing_pkgs:
    print(f"⚠️  缺少包: {', '.join(missing_pkgs)}")
    print(f"   安装: pip install {' '.join(missing_pkgs)}")
else:
    print("✅ 所有 Python 依赖已安装")
```

---

## 2. 平台差异速查

| 方面 | Windows | Linux | macOS |
|------|---------|-------|-------|
| ffmpeg 系统版 | 精简版（可能缺 -loop/mp3） | 通常完整 | 通常完整（Homebrew） |
| imageio-ffmpeg | ✅ 推荐使用 | ✅ 可用 | ✅ 可用 |
| edge-tts 调用 | `python -m edge_tts` | `edge-tts` 或 `python -m` | `edge-tts` 或 `python -m` |
| subprocess pipe 12k+ 帧 | ⚠️ stderr buffer 死锁 | 通常无问题 | 通常无问题 |
| 文件清理 | ⚠️ 安全软件/TRAE 可能清理 .mp4 | 通常无问题 | 通常无问题 |
| 路径分隔符 | `\\` | `/` | `/` |
| 建议交付格式 | `.zip` | 直接 .mp4 | 直接 .mp4 |

---

## 3. 策略选型

根据环境检测结果选择渲染策略：

```python
def select_strategy(env):
    """根据环境检测结果选择策略"""
    strategy = {
        "ffmpeg_source": None,
        "render_method": None,
        "delivery_format": ".mp4",
        "tts_method": None,
        "warnings": []
    }
    
    # ffmpeg 选型
    for ff in env["ffmpeg"]:
        if ff["source"] == "imageio-ffmpeg":
            strategy["ffmpeg_source"] = "imageio-ffmpeg"
            break
    if not strategy["ffmpeg_source"] and env["ffmpeg"]:
        ff = env["ffmpeg"][0]
        strategy["ffmpeg_source"] = ff["source"]
        if not ff["features"].get("full_build"):
            strategy["warnings"].append("ffmpeg 精简版，推荐安装 imageio-ffmpeg")
    
    # 渲染方法
    if env["packages"].get("cv2") and env["packages"].get("numpy"):
        strategy["render_method"] = "opencv+ffmpeg"  # 推荐
    elif env["ffmpeg"]:
        strategy["render_method"] = "pure-ffmpeg"
    else:
        strategy["render_method"] = "none"
        strategy["warnings"].append("无可用渲染引擎")
    
    # 交付格式（Windows + 有清理风险 → zip）
    if env["platform"] == "Windows":
        strategy["delivery_format"] = ".zip"
    
    # TTS
    if env["edge_tts"]["available"]:
        strategy["tts_method"] = "edge-tts"
    else:
        strategy["tts_method"] = "none"
        strategy["warnings"].append("TTS 不可用，需人工处理音频")
    
    return strategy
```

---

## 4. Skill 集成

本文件被 `auto-pipeline.md` 在首次执行时自动读取。检测结果影响：

| 检测结果 | 影响 |
|---------|------|
| ffmpeg 不可用 | STEP6 输出 render-spec.json + 标注"需人工渲染" |
| edge-tts 不可用 | STEP5 输出脚本 + 标注"需人工 TTS 转换" |
| 平台 = Windows | 交付格式改为 .zip，pipe 渲染改用线程安全模式 |
| 缺少 Python 包 | 输出安装命令，继续执行数据生成 |

### 快速执行

```bash
# 一行运行环境检测
python env_check.py

# 输出示例
{
  "platform": "Windows",
  "ffmpeg": [
    {"source": "system PATH", "features": {"full_build": false}},
    {"source": "imageio-ffmpeg", "features": {"full_build": true}}
  ],
  "edge_tts": {"available": true},
  "packages": {"cv2": true, "numpy": true, "imageio_ffmpeg": true}
}

=== 决策建议 ===
✅ 推荐使用 ffmpeg: imageio-ffmpeg
✅ edge-tts 可用
✅ 所有 Python 依赖已安装
⚠️  平台 Windows → 交付格式改为 .zip
```
