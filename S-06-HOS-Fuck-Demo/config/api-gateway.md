# API Gateway — 外部服务接口层

> 音频 / PPT / 视频合成的外部工具接口定义。
> 本文件供 AI 在调用外部工具时读取接口契约，不实现具体业务逻辑。
>
> **IDE 委派**：所有外部工具的安装和执行均通过 IDE 原生 Bash 完成。
> Skill 只提供：接口契约、命令示例、参数映射。

---

## TTS（文字转语音）

### 接口契约

```json
{
  "provider": "edge-tts | bark | coqui | browser",
  "text": "音频稿文本（已短句化）",
  "voice": "zh-CN-XiaoxiaoNeural | zh-CN-YunxiNeural | zh-CN-YunjianNeural",
  "speed": 1.0,
  "pitch": 0,
  "output": "03_audio/{project-id}.mp3"
}
```

### 推荐配置（edge-tts，免费）

```bash
edge-tts --voice zh-CN-XiaoxiaoNeural --rate=+0% --text "$(cat script.txt)" --write-media output.mp3
```

### 选择规则

| 场景 | 推荐 Voice | 原因 |
|------|-----------|------|
| 课程/知识 | zh-CN-XiaoxiaoNeural | 自然清晰 |
| 价值观/情绪 | zh-CN-YunxiNeural | 沉稳有力 |
| 故事/有声书 | zh-CN-YunjianNeural | 有叙事感 |
| 批量快速 | edge-tts (任意) | 免费+本地 |

---

## PPT（幻灯片）

### 接口契约

```json
{
  "engine": "python-pptx | markdown-slides | html2pdf",
  "template": "12page-10min",
  "pages": [
    {"title": "", "content": "", "notes": ""}
  ],
  "output": "02_ppt/{project-id}.pptx"
}
```

### 推荐方式

`python-pptx` 本地脚本（无幻觉、可控、免费）。  
AI 只需输出每页的 `title` + `content` + `notes`，由脚本组装为 .pptx。

---

## Video（视频合成）

### 接口契约

```json
{
  "engine": "ffmpeg",
  "inputs": {
    "images": ["02_ppt/slides/*.png"],
    "audio": "03_audio/{project-id}.mp3"
  },
  "output": "04_video/{project-id}.mp4",
  "params": {
    "fps": 1,
    "transition": "fade",
    "resolution": "1920x1080"
  }
}
```

### 推荐方式

```bash
ffmpeg -framerate 1 -i slide_%02d.png -i audio.mp3 \
  -c:v libx264 -pix_fmt yuv420p output.mp4
```

---

## Git / GitHub

### 接口契约

```json
{
  "action": "init | commit | push",
  "repo": "HOS-Fuck-Demo",
  "message": "feat({project-id}): {英文描述}",
  "structure": [
    "{project-id}/01_content/",
    "{project-id}/02_ppt/",
    "{project-id}/03_audio/",
    "{project-id}/04_video/",
    "README.md"
  ]
}
```

### IDE 委派

Skill 只输出 `structure` 和 `message`，git 操作由 IDE 原生执行：

```bash
# Skill 不执行这些，IDE 原生 Bash 执行：
mkdir -p output/{project-id}/{01_content,02_ppt,03_audio,04_video}
git add output/{project-id}/
git commit -m "feat({project-id}): {message}"
git push
```
```

---

## IDE 原生回退

当外部工具不可用时：

| 工具 | 回退策略 |
|------|---------|
| edge-tts | 输出 `03_audio/script.txt`，标注"需 TTS 转换" |
| python-pptx | 输出 `02_ppt/slide.json`，标注"需 python-pptx 渲染" |
| ffmpeg | 输出 `04_video/render-spec.json`，标注"需 ffmpeg 合成" |
| git | 输出仓库结构 + message，IDE 原生 Bash(git) 执行 |

---

## MVP / Demo 快捷参数

| 模式 | 时长 | PPT页数 | 音频幕数 | ffmpeg 关键参数 |
|------|------|---------|---------|----------------|
| 标准 10min | 600s | 12页 | 4幕 | `-framerate 1/30 ... -framerate 1/50` |
| MVP 5min | 300s | 6页 | 3幕 | `-framerate 1/30 ... -framerate 1/45` |

## 可用性降级

| 服务 | 免费替代 | 降级行为 |
|------|---------|---------|
| edge-tts | 内置 | 无降级，始终可用 |
| python-pptx | 内置 | 输出 PPT 数据 JSON，人工转换 |
| ffmpeg | 内置 | 输出 render-spec.json，人工渲染 |
| git | 内置 | 输出仓库结构 + commit message |
