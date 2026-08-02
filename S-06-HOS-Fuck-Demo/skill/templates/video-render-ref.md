# Video Render Reference — 跨平台视频渲染参考实现

> **本文件是 `video-spec.md` 的配套实现参考**，不是模板定义。
> 提供 Python + OpenCV + ffmpeg 的跨平台可靠渲染方案。
>
> 目的：把「规格文档」变成「可运行的参考实现」，消除环境兼容性问题。

---

## 1. 环境检测

渲染前必须检测运行环境，选择正确的方案：

```python
import subprocess, shutil, sys, platform

def check_ffmpeg():
    """检测可用的 ffmpeg，返回 (path, version, features)"""
    candidates = []

    # 1. 系统 PATH 中的 ffmpeg
    sys_ff = shutil.which("ffmpeg")
    if sys_ff:
        try:
            r = subprocess.run([sys_ff, "-version"], capture_output=True, text=True, timeout=5)
            if r.returncode == 0:
                features = {"loop": False, "mp3_decode": False, "full": False}
                if "--enable-libmp3lame" in r.stdout: features["mp3_decode"] = True
                if "-loop" in r.stdout or "ffmpeg" in r.stdout.split("\n")[0]:
                    features["loop"] = True  # 粗略检测
                candidates.append((sys_ff, r.stdout.split()[2] if r.stdout else "?", features))
        except: pass

    # 2. imageio-ffmpeg 捆绑的 ffmpeg（通常完整）
    try:
        import imageio_ffmpeg
        iio_ff = imageio_ffmpeg.get_ffmpeg_exe()
        r = subprocess.run([iio_ff, "-version"], capture_output=True, text=True, timeout=5)
        if r.returncode == 0:
            features = {"loop": True, "mp3_decode": True, "full": True}
            candidates.append((iio_ff, r.stdout.split()[2] if r.stdout else "?", features))
    except: pass

    # 3. 返回最佳候选
    if not candidates:
        return (None, None, None)
    # 优先用 full feature 的
    candidates.sort(key=lambda c: (c[2]["full"], c[2]["mp3_decode"]), reverse=True)
    return candidates[0]

FFMPEG_PATH, FFMPEG_VER, FFMPEG_FEATURES = check_ffmpeg()
IS_WINDOWS = platform.system() == "Windows"
```

---

## 2. 问题与解决方案对照

| 实际遇到问题 | 根因 | 解决方案 |
|------------|------|---------|
| ffmpeg `-loop` 不可用 | Windows 精简版 ffmpeg 不支持 | 使用 imageio-ffmpeg 或 Python 逐帧读取 |
| mp3 无法解码 | ffmpeg 未编译 libmp3lame | 使用 AAC 编码音频或 imageio-ffmpeg |
| pipe 写入 12k+ 帧卡死 | Windows subprocess stderr buffer 满 | 使用 `asyncio` 或文件中间件替代 pipe |
| 视频 0 字节 | 外部进程（安全软件/TRAE）清理 .mp4 | 渲染到临时目录 + `.zip` 打包交付 |
| `moov atom` 未写入 | 进程提前终止，MP4 未 finalize | `with` 上下文管理 + 显式 `cv2.destroyAllWindows()` + `cap.release()` |

---

## 3. 推荐方案：Python + OpenCV + imageio-ffmpeg

**为什么推荐**：
- OpenCV `cv2.VideoWriter` 不依赖系统 ffmpeg，使用内置编码器
- imageio-ffmpeg 提供完整的捆绑 ffmpeg，用于最终封装
- Python 跨平台一致，无需处理 Windows ffmpeg 差异

### 3.1 安装依赖

```bash
pip install opencv-python imageio-ffmpeg numpy
```

### 3.2 最小渲染脚本

```python
import cv2
import numpy as np
import os, json, subprocess
from pathlib import Path

def render_video(spec_path: str, slides_dir: str, audio_path: str, output_path: str):
    """
    spec_path: video-spec.json
    slides_dir: 幻灯片图片目录
    audio_path: 音频文件 (.wav 或 .mp3)
    output_path: 输出 .mp4 路径
    """
    with open(spec_path) as f:
        spec = json.load(f)

    slides = spec["slides"]
    total_frames = sum(s["duration_seconds"] for s in slides) * spec["fps"]
    width, height = 1920, 1080
    fps = spec.get("fps", 30)

    # 用 imageio-ffmpeg 获取完整 ffmpeg
    import imageio_ffmpeg
    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()

    # Step 1: 用 OpenCV 生成无音频视频（使用 MP4V 编码，可靠）
    temp_video = output_path + ".temp.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(temp_video, fourcc, fps, (width, height))

    try:
        for slide in slides:
            img_path = os.path.join(slides_dir, slide["image"])
            frame = cv2.imread(img_path)
            if frame is None:
                # 生成纯色占位图
                frame = np.zeros((height, width, 3), dtype=np.uint8)
                cv2.putText(frame, f"Missing: {slide['image']}", (50, height//2),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,255), 2)

            frame = cv2.resize(frame, (width, height))
            duration_frames = slide["duration_seconds"] * fps
            for _ in range(int(duration_frames)):
                writer.write(frame)
    finally:
        writer.release()
        cv2.destroyAllWindows()

    # Step 2: 用 ffmpeg 将音频合并到视频（可靠封装）
    cmd = [
        ffmpeg_path, "-y",
        "-i", temp_video,
        "-i", audio_path,
        "-c:v", "libx264",           # 转码为 H.264（兼容）
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",               # 音频编码为 AAC
        "-shortest",
        "-movflags", "+faststart",   # moov atom 前移，流媒体友好
        output_path
    ]
    # 注意：用 subprocess 而非 asyncio，避免 pipe buffer 问题
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg merge failed:\n{result.stderr}")

    # Step 3: 清理临时文件
    os.remove(temp_video)

    # Step 4: 验证输出文件
    assert os.path.getsize(output_path) > 0, f"Output file is 0 bytes: {output_path}"

    print(f"✅ Video rendered: {output_path}")
    return output_path
```

### 3.3 线程安全 pipe 模式（当需要使用 ffmpeg pipe 时）

如果必须用 ffmpeg pipe（比如实时生成帧），必须解决 Windows stderr buffer 死锁：

```python
import subprocess, threading

def _pipe_reader(stream, buffer):
    """后台线程读取 pipe，防止 buffer 死锁"""
    while True:
        chunk = stream.read(4096)
        if not chunk:
            break
        buffer.append(chunk)

def render_via_pipe(frame_generator, total_frames, output_path,
                    width=1920, height=1080, fps=30):
    """线程安全的 ffmpeg pipe 渲染"""
    ffmpeg_path = _get_full_ffmpeg()
    cmd = [
        ffmpeg_path, "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{width}x{height}",
        "-pix_fmt", "bgr24",
        "-r", str(fps),
        "-i", "-",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        output_path
    ]

    proc = subprocess.Popen(
        cmd, stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,   # 必须都要有
        stderr=subprocess.PIPE,   # 必须都要有
    )

    # 后台读取 stderr，防止 buffer 满导致死锁
    stderr_buf = []
    reader_thread = threading.Thread(
        target=_pipe_reader, args=(proc.stderr, stderr_buf), daemon=True
    )
    reader_thread.start()

    try:
        for frame in frame_generator:
            proc.stdin.write(frame.tobytes())
        proc.stdin.close()
    except BrokenPipeError:
        pass

    proc.wait()
    reader_thread.join()

    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg pipe failed: {b''.join(stderr_buf)[-500:]}")

    assert os.path.getsize(output_path) > 0, f"0 byte output: {output_path}"
    return output_path
```

---

## 4. 文件持久化防御

**问题**：某些环境（TRAE/安全软件）会扫描并清空 `.mp4` 文件。

**解决方案**：渲染到临时目录 → 验证成功 → `.zip` 打包交付

```python
import zipfile, tempfile, shutil

def render_safe(spec_path, slides_dir, audio_path, project_id):
    """安全渲染：先输出到临时目录 → 验证 → zip 打包"""
    tmpdir = tempfile.mkdtemp(prefix=f"hos_video_{project_id}_")
    try:
        # 渲染到临时目录
        temp_mp4 = os.path.join(tmpdir, f"{project_id}.mp4")
        render_video(spec_path, slides_dir, audio_path, temp_mp4)

        # 验证文件有效性
        cap = cv2.VideoCapture(temp_mp4)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        cap.release()
        assert frame_count > 0, f"Video has 0 frames: {temp_mp4}"

        # zip 打包（免疫外部清理）
        zip_path = os.path.join(
            os.path.dirname(output_path),
            f"{project_id}.zip"
        )
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.write(temp_mp4, f"{project_id}.mp4")
            # 一并打包渲染规格和日志
            zf.write(spec_path, "render-spec.json")

        print(f"✅ Safe deliverable: {zip_path} ({os.path.getsize(zip_path)} bytes)")
        return zip_path

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)
```

---

## 5. 方案选型决策树

```
需要渲染视频
│
├─ 环境有 Python + OpenCV？
│   └─ ✅ 推荐：方案3（OpenCV写帧 + ffmpeg封装）
│       └─ 最可靠，跨平台一致，避免系统ffmpeg差异
│
├─ 必须纯 ffmpeg？
│   ├─ Windows → 必须用 imageio-ffmpeg 或完整 ffmpeg
│   │   └─ 使用方案3.3（线程安全 pipe）
│   └─ Linux/macOS → 系统 ffmpeg 通常完整
│       └─ 可直接 ffmpeg concat / image sequence
│
└─ 文件被外部清理？
    └─ ✅ 方案4（zip 打包）免疫清理
```

---

## 6. 简化方案: Pillow → ffmpeg 直连（推荐）

**不再需要 OpenCV 中间步骤**。Pillow 生成 PNG 序列 → ffmpeg 直接合成图片序列 + 音频。

```python
import subprocess, os
from PIL import Image, ImageDraw, ImageFont

def render_video_direct(slides_dir: str, slide_mapping: list,
                        audio_path: str, output_path: str,
                        fps: int = 30):
    """
    简化方案: Pillow 生成 PNG → ffmpeg 图片序列合成

    slide_mapping: [{"image": "slide_01.png", "duration_seconds": 30}, ...]
    每张图片的时长通过 ffmpeg 的 -framerate 控制
    """
    # 生成所有图片（已在外部用 Pillow 完成）

    # 构建 ffmpeg 命令
    ffmpeg = _get_full_ffmpeg()
    cmd = [ffmpeg, "-y"]

    # 为每个 slide 添加输入（不同 framerate 控制时长）
    for slide in slide_mapping:
        img_path = os.path.join(slides_dir, slide["image"])
        dur = slide["duration_seconds"]
        # 用 -framerate 控制: rate = 1/duration, 显示 dur 秒
        cmd.extend(["-framerate", f"1/{dur}", "-i", img_path])

    # filter_complex 将所有视频拼接
    n = len(slide_mapping)
    filter_parts = []
    for i in range(n):
        filter_parts.append(f"[{i}:v]fade=t=in:st=0:d=0.5[v{i}]")

    concat_input = "".join(f"[v{i}]" for i in range(n))
    filter_parts.append(f"{concat_input}concat=n={n}:v=1:a=0[vid]")
    filter_complex = "; ".join(filter_parts)

    cmd.extend(["-filter_complex", filter_complex,
                "-map", "[vid]",
                "-i", audio_path,
                "-c:v", "libx264",
                "-pix_fmt", "yuv420p",
                "-c:a", "aac",
                "-movflags", "+faststart",
                output_path])

    # ⚠️ 必须检查 returncode！
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        raise RuntimeError(
            f"ffmpeg 合成失败 (code={result.returncode})\n"
            f"stderr: {result.stderr[-500:]}"
        )

    # 验证输出
    assert os.path.getsize(output_path) > 0, f"输出文件 0 字节: {output_path}"
    print(f"✅ 视频已合成: {output_path} ({os.path.getsize(output_path)} bytes)")
    return output_path
```

### 对比: 简化方案 vs 原方案

| 维度 | 原方案 (OpenCV + ffmpeg) | 简化方案 (ffmpeg 直连) |
|------|------------------------|---------------------|
| 依赖 | Pillow + OpenCV + numpy + ffmpeg | Pillow + ffmpeg |
| 步骤 | Pillow→PNG→OpenCV编码→临时.mp4→ffmpeg合并 | Pillow→PNG→ffmpeg直接合成 |
| 中间文件 | 1个临时无音频 .mp4 | 仅 PNG 序列 |
| 兼容性 | OpenCV mp4v 编码不兼容 H.264 | 直接 H.264 输出 |
| 速度 | 慢 (逐帧写入) | 快 (ffmpeg 硬件加速) |

---

## 7. 子进程 returncode 检查 — 强制规则

> **这是从实战中总结的最重要规则**：所有 `subprocess.run()` 调用**必须**检查 `returncode`。

### 错误的写法（会产生 0 字节文件却打印 "OK"）

```python
# ❌ 错误！returncode 被忽略
subprocess.run(["ffmpeg", "-i", "input.mp4", "output.mp4"], capture_output=True)
print("OK")  # 即使 ffmpeg 失败也打印 OK → 0 字节文件
```

### 正确的写法

```python
import subprocess

def safe_run(cmd, timeout=300, check=True):
    """带 returncode 检查的子进程执行"""
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    if check and result.returncode != 0:
        raise RuntimeError(
            f"命令失败 (code={result.returncode}): {' '.join(cmd[:3])}...\n"
            f"stderr: {result.stderr[-500:]}"
        )
    return result

# ✅ 正确！检查 returncode
result = safe_run(["ffmpeg", "-i", "input.mp4", "output.mp4"])

# 再验证文件
assert os.path.getsize("output.mp4") > 0, "输出文件 0 字节"
```

### 适用范围

```
所有涉及文件生成的 subprocess 调用:
  □ ffmpeg 合成视频
  □ ffprobe 检测时长
  □ edge-tts 生成音频
  □ git 操作
  □ pip install
  □ npm install
```

---

## 8. 使用 moviepy 的统一方案（替代方案）

如果环境允许，`moviepy` 封装了 ffmpeg，API 更简洁：

```python
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips

def render_with_moviepy(slide_mapping, slides_dir, audio_path, output_path, fps=30):
    """使用 moviepy 合成（依赖: pip install moviepy）"""
    clips = []
    for slide in slide_mapping:
        img_path = os.path.join(slides_dir, slide["image"])
        duration = slide["duration_seconds"]
        clip = ImageClip(img_path, duration=duration)
        clips.append(clip)

    video = concatenate_videoclips(clips, method="compose")
    audio = AudioFileClip(audio_path)
    video = video.set_audio(audio)
    video = video.set_fps(fps)

    # moviepy 内部使用 imageio-ffmpeg（完整版），避免系统 ffmpeg 问题
    video.write_videofile(
        output_path,
        codec="libx264",
        audio_codec="aac",
        fps=fps,
        preset="medium",
        ffmpeg_params=["-movflags", "+faststart"]
    )

    # 验证
    assert os.path.getsize(output_path) > 0, f"0 byte: {output_path}"
    video.close()
    audio.close()
    return output_path
```

---

## 9. TTS + 视频完整参考流水线

```python
# 1. 分段合成音频
import asyncio
async def synthesize_segments(script_path, output_dir):
    """分段合成长文本 TTS"""
    with open(script_path) as f:
        text = f.read()

    # 按幕分段
    acts = text.split("---")
    segments = []
    for i, act in enumerate(acts):
        if not act.strip():
            continue
        seg_path = os.path.join(output_dir, f"act_{i}.mp3")
        # edge-tts 调用（注意用 python -m 而非直接 edge-tts）
        cmd = [
            sys.executable, "-m", "edge_tts",
            "--voice", "zh-CN-XiaoxiaoNeural",
            "--rate", "+0%",
            "--text", act.strip(),
            "--write-media", seg_path
        ]
        subprocess.run(cmd, check=True, timeout=120)
        segments.append(seg_path)

    # 2. concat 合并
    concat_list = os.path.join(output_dir, "concat.txt")
    with open(concat_list, "w") as f:
        for seg in segments:
            f.write(f"file '{seg}'\n")

    merged_path = os.path.join(output_dir, "full_audio.mp3")
    subprocess.run([
        _get_full_ffmpeg(), "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-c", "copy",
        merged_path
    ], check=True, timeout=120)

    return merged_path, segments
```

---

## 10. 电影化渲染：单页拆多镜头 + 动态元素

### 10.1 问题

当前视频是"PPT 截图 + 音频"的静态组合，观众注意力在前 45 秒后急剧下降。

### 10.2 核心策略：每页拆分为 3 个镜头

不是增加幻灯片数量，而是在视频层面对单页内容做镜头切换。

```
原方案: [单页静态图 ----100秒----] → 观众流失

电影化: [标题镜头5s] → [数据镜头30s] → [正文镜头65s]
         每个镜头有独立的视觉焦点
```

### 10.3 镜头拆分方案

| 页面类型 | 镜头1 (0~20%) | 镜头2 (20~60%) | 镜头3 (60~100%) |
|---------|--------------|---------------|----------------|
| 标题页 | 标题滑入 | 副标题+装饰线生长 | 稳定展示 |
| 问题/数据 | 大数字冲击（放大） | 数字+简短数据标签 | 完整内容展开 |
| 误区/破除 | 对比标题 | 左误区卡片→右真相卡片 | 全部内容稳定 |
| 核心观点 | 第一个观点高亮 | 第二个观点高亮 | 两个观点同时显示 |
| 行动步骤 | 步骤标题 | 步骤1~3逐条出现 | 案例故事 |
| 总结 | 金句放大动画 | 三个takeaway逐个出现 | CTA按钮脉冲 |

### 10.4 进度条

每页底部显示统一进度条：

```python
def draw_progress_bar(draw, current_page, total_pages, width=1920, height=1080):
    """统一底部进度条"""
    bar_w, bar_h = 800, 6
    bar_x = (width - bar_w) // 2
    bar_y = height - 40
    
    # 背景条
    bg_color = (50, 50, 70)
    draw.rounded_rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + bar_h],
                          radius=3, fill=bg_color)
    
    # 已读进度
    progress = bar_w * current_page // total_pages
    accent_color = (225, 29, 72)  # E11D48
    draw.rounded_rectangle([bar_x, bar_y, bar_x + progress, bar_y + bar_h],
                          radius=3, fill=accent_color)
    
    # 当前页圆点
    dot_x = bar_x + progress
    draw.ellipse([dot_x - 8, bar_y - 5, dot_x + 8, bar_y + 11],
                fill=(251, 113, 133))  # accent_light
```

### 10.5 封面/总结微动画

```python
def render_cover_frame(frame_idx, total_frames, cover_spec):
    """封面：装饰线生长 + 标题上浮 parallax"""
    progress = frame_idx / total_frames
    img = Image.new("RGB", (1920, 1080), (15, 23, 42))  # dark bg
    draw = ImageDraw.Draw(img)
    
    # 装饰线从左到右生长
    line_width = int(300 * min(1.0, progress * 2))  # 前半段完成
    line_x = (1920 - 300) // 2
    draw.rectangle([line_x, 480, line_x + line_width, 484],
                  fill=(225, 29, 72))
    
    # 标题轻微上浮（parallax）
    title_y_offset = -int(10 * progress)
    draw.text((960, 340 + title_y_offset), cover_spec["title"],
             fill=(248, 250, 252), font=title_font, anchor="mm")
    
    return img

def render_summary_frame(frame_idx, total_frames, summary_spec):
    """总结：金句放大 + CTA 按钮脉冲"""
    progress = frame_idx / total_frames
    img = Image.new("RGB", (1920, 1080), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    
    # 金句放大（0~2秒内从80%到100%）
    if progress < 0.2:  # 前20%时间
        scale = 0.8 + 0.2 * (progress / 0.2)
        size = int(28 * scale)
        draw.text((960, 400), summary_spec["golden_sentence"],
                 fill=(248, 250, 252), font=adjust_font_size(size), anchor="mm")
    else:
        draw.text((960, 400), summary_spec["golden_sentence"],
                 fill=(248, 250, 252), font=base_font, anchor="mm")
    
    # CTA 按钮脉冲透明度
    pulse = 0.8 + 0.2 * abs((progress * 4) % 2 - 1)
    btn_alpha = int(255 * pulse)
    # ... 绘制按钮
    
    return img
```

## 11. 字幕生成（SRT）

### 11.1 字幕是视频课程的标配

当前视频完全缺失字幕。字幕提升可访问性、SEO、学习效果。

### 11.2 SRT 生成方案

```python
import textwrap

def generate_srt(script_lines, timeline, max_chars_per_line=16):
    """
    从脚本行和时间轴生成 SRT 字幕

    参数:
      script_lines: ["句子1", "句子2", ...]
      timeline: [(start_sec, end_sec), ...]

    返回:
      SRT 格式字符串
    """
    srt_parts = []
    for idx, (line, (start, end)) in enumerate(zip(script_lines, timeline), 1):
        # 对长行进行折行
        wrapped = textwrap.wrap(line, width=max_chars_per_line)
        display_text = "\n".join(wrapped) if wrapped else line

        srt_parts.append(f"{idx}")
        srt_parts.append(f"{_fmt_time(start)} --> {_fmt_time(end)}")
        srt_parts.append(display_text)
        srt_parts.append("")

    return "\n".join(srt_parts)


def _fmt_time(seconds):
    """将秒转换为 SRT 时间戳格式 HH:MM:SS,mmm"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def estimate_timeline(script_lines, words_per_sec=3.5):
    """
    从脚本行估算时间轴（不依赖 TTS 实际输出）
    用于在音频生成前预生成字幕
    """
    timeline = []
    current = 0.0
    for line in script_lines:
        # 中文：~3.5 字/秒
        duration = len(line) / words_per_sec
        # 加上标点额外停顿
        punctuation_pause = line.count("。") * 0.3 + line.count("，") * 0.15
        duration += punctuation_pause
        duration = max(duration, 1.0)  # 最短 1 秒
        timeline.append((current, current + duration))
        current += duration
    return timeline
```

### 11.3 字幕样式规范

```yaml
字体: "SourceHanSansSC-Regular" 或 "Microsoft YaHei"
字号: 22pt (1920x1080 分辨率)
颜色: 白色 (#FFFFFF)
背景: 半透明黑色条 (rgba(0,0,0,0.6))
位置: 底部居中，距底边 80px
每行: ≤ 16 个中文字
时长: 每行至少 2 秒
```

### 11.4 集成到视频

```bash
# 用 ffmpeg 将字幕嵌入视频
ffmpeg -i video.mp4 -vf "subtitles=subtitles.srt:fontsdir=/path/to/fonts:force_style='FontName=SourceHanSansSC-Regular,FontSize=22,PrimaryColour=&H00FFFFFF,BackColour=&H80000000,Alignment=2'" \
  -c:a copy output.mp4
```

## 12. 视频转场效果

### 12.1 推荐转场方案

| 位置 | 转场类型 | 时长 | 说明 |
|------|---------|------|------|
| 开场→目录 | 交叉淡入 | 0.5s | 最通用 |
| 目录→过渡页 | 交叉淡入 | 0.5s | 保持简洁 |
| 过渡页→内容 | 向左滑入 | 0.5s | 节奏转换 |
| 内容→内容 | 交叉淡入 | 0.3s | 不打断注意力 |
| 内容→总结 | 向左滑入 | 0.5s | 段落结束感 |
| 总结→黑屏 | 淡出 | 1.0s | 结束 |

### 12.2 ffmpeg 转场实现

```python
def build_transition_filter(transition_type, duration=0.5, width=1920, height=1080):
    """生成 ffmpeg filter_complex 片段"""
    filters = {
        "fade": f"fade=t=in:st=0:d={duration}",
        "slide_left": f"slide=from=-w:st=0:d={duration}:first=0",
        "fade_to_black": f"fade=t=out:st=0:d={duration}",
    }
    return filters.get(transition_type, filters["fade"])
```

## 13. 验证清单

渲染完成后执行：

```python
def validate_video(path):
    checks = []
    # 1. 文件存在且 > 0
    checks.append(("exists", os.path.exists(path)))
    checks.append(("non_zero", os.path.getsize(path) > 0))

    # 2. OpenCV 可打开
    cap = cv2.VideoCapture(path)
    checks.append(("opencv_readable", cap.isOpened()))
    if cap.isOpened():
        checks.append(("has_frames", int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) > 0))
        checks.append(("has_duration", cap.get(cv2.CAP_PROP_POS_MSEC) > 0))
    cap.release()

    # 3. 时长匹配
    # (对比 spec 中的 total_duration)

    return {k: v for k, v in checks}
```
