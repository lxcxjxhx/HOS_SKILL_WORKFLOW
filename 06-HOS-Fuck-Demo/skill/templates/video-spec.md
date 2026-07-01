# Video Spec Template — 10分钟视频合成规格

> 定义 **12 页 PPT + 10 分钟音频** → 视频渲染的完整映射。
> 输出 JSON + ffmpeg 命令，供 CI / 人工执行。

---

## 核心参数

| 参数 | 值 |
|------|-----|
| 总时长 | 600 秒（10 分钟） |
| 页面数 | 12 页 |
| 分辨率 | 1920×1080 |
| FPS | 30 |
| 引擎 | ffmpeg |

---

## 模板结构

```json
{
  "project": "{{project-id}}",
  "spec_version": "2.0",
  "engine": "ffmpeg",
  "resolution": "1920x1080",
  "fps": 30,
  "total_duration_seconds": 600,
  "slides": [
    {
      "page": 1,
      "image": "slide_01.png",
      "start_time": 0.0,
      "duration_seconds": 30,
      "audio_segment": "幕1_开场_0s_30s",
      "transition": "fade_in",
      "notes": "标题展示+开场引言"
    },
    {
      "page": 2,
      "image": "slide_02.png",
      "start_time": 30.0,
      "duration_seconds": 50,
      "audio_segment": "幕1_问题冲击_30s_80s",
      "transition": "fade",
      "notes": "问题冲击"
    },
    {
      "page": 3,
      "image": "slide_03.png",
      "start_time": 80.0,
      "duration_seconds": 55,
      "audio_segment": "幕1_证据_80s_135s",
      "transition": "fade",
      "notes": "数据证据"
    },
    {
      "page": 4,
      "image": "slide_04.png",
      "start_time": 135.0,
      "duration_seconds": 50,
      "audio_segment": "幕2_误区_135s_185s",
      "transition": "fade",
      "notes": "常见误区"
    },
    {
      "page": 5,
      "image": "slide_05.png",
      "start_time": 185.0,
      "duration_seconds": 55,
      "audio_segment": "幕2_真相_185s_240s",
      "transition": "slide_right",
      "notes": "认知翻转"
    },
    {
      "page": 6,
      "image": "slide_06.png",
      "start_time": 240.0,
      "duration_seconds": 55,
      "audio_segment": "幕2_观点1-2_240s_295s",
      "transition": "fade",
      "notes": "核心观点1~2"
    },
    {
      "page": 7,
      "image": "slide_07.png",
      "start_time": 295.0,
      "duration_seconds": 55,
      "audio_segment": "幕2_观点3-4_295s_350s",
      "transition": "fade",
      "notes": "核心观点3~4"
    },
    {
      "page": 8,
      "image": "slide_08.png",
      "start_time": 350.0,
      "duration_seconds": 55,
      "audio_segment": "幕2_观点5-6_350s_405s",
      "transition": "fade",
      "notes": "核心观点5~6"
    },
    {
      "page": 9,
      "image": "slide_09.png",
      "start_time": 405.0,
      "duration_seconds": 50,
      "audio_segment": "幕3_步骤1-3_405s_455s",
      "transition": "slide_right",
      "notes": "方法步骤1~3"
    },
    {
      "page": 10,
      "image": "slide_10.png",
      "start_time": 455.0,
      "duration_seconds": 45,
      "audio_segment": "幕3_步骤4-5_455s_500s",
      "transition": "fade",
      "notes": "方法步骤4~5"
    },
    {
      "page": 11,
      "image": "slide_11.png",
      "start_time": 500.0,
      "duration_seconds": 50,
      "audio_segment": "幕3_案例_500s_550s",
      "transition": "fade",
      "notes": "案例/故事"
    },
    {
      "page": 12,
      "image": "slide_12.png",
      "start_time": 550.0,
      "duration_seconds": 50,
      "audio_segment": "幕4_总结CTA_550s_600s",
      "transition": "fade_in",
      "notes": "总结+金句+CTA"
    }
  ],
  "audio": {
    "source": "03_audio/{{project-id}}.mp3",
    "duration_seconds": 600
  },
  "output": "04_video/{{project-id}}.mp4"
}
```

---

## 页面时长映射（合计 600s = 10分钟）

| Page | 内容 | 时长（秒） | 累计 | 对应音频幕 |
|------|------|-----------|------|-----------|
| 1 | 标题页 | 30 | 0→30 | 幕1 开场 |
| 2 | 问题冲击 | 50 | 30→80 | 幕1 问题 |
| 3 | 问题证据 | 55 | 80→135 | 幕1 证据 |
| 4 | 常见误区 | 50 | 135→185 | 幕2 误区 |
| 5 | 真相揭示 | 55 | 185→240 | 幕2 翻转 |
| 6 | 核心观点 1~2 | 55 | 240→295 | 幕2 观点 |
| 7 | 核心观点 3~4 | 55 | 295→350 | 幕2 观点 |
| 8 | 核心观点 5~6 | 55 | 350→405 | 幕2 观点 |
| 9 | 方法步骤 1~3 | 50 | 405→455 | 幕3 方法 |
| 10 | 方法步骤 4~5 | 45 | 455→500 | 幕3 进阶 |
| 11 | 案例/故事 | 50 | 500→550 | 幕3 案例 |
| 12 | 总结/CTA | 50 | 550→600 | 幕4 收尾 |

---

## 过渡效果

| 位置 | 过渡 | 时长 |
|------|------|------|
| Page 1→2 | fade | 0.5s |
| Page 2→3 | fade | 0.5s |
| Page 3→4 | fade | 0.5s |
| Page 4→5 | slide_right | 0.5s |
| Page 5→6 | fade | 0.5s |
| Page 6→7 | fade | 0.5s |
| Page 7→8 | fade | 0.5s |
| Page 8→9 | slide_right | 0.5s |
| Page 9→10 | fade | 0.5s |
| Page 10→11 | fade | 0.5s |
| Page 11→12 | fade_in | 0.5s |

---

## ffmpeg 渲染命令（12页 + 10分钟音频）

```bash
ffmpeg -y \
  -framerate 1/30  -i slide_01.png \
  -framerate 1/50  -i slide_02.png \
  -framerate 1/55  -i slide_03.png \
  -framerate 1/50  -i slide_04.png \
  -framerate 1/55  -i slide_05.png \
  -framerate 1/55  -i slide_06.png \
  -framerate 1/55  -i slide_07.png \
  -framerate 1/55  -i slide_08.png \
  -framerate 1/50  -i slide_09.png \
  -framerate 1/45  -i slide_10.png \
  -framerate 1/50  -i slide_11.png \
  -framerate 1/50  -i slide_12.png \
  -i 03_audio/{{project-id}}.mp3 \
  -filter_complex \
    "[0:v]fade=t=in:st=0:d=0.5[v0]; \
     [1:v]fade=t=in:st=0:d=0.5[v1]; \
     [2:v]fade=t=in:st=0:d=0.5[v2]; \
     [3:v]fade=t=in:st=0:d=0.5[v3]; \
     [4:v]fade=t=in:st=0:d=0.5[v4]; \
     [5:v]fade=t=in:st=0:d=0.5[v5]; \
     [6:v]fade=t=in:st=0:d=0.5[v6]; \
     [7:v]fade=t=in:st=0:d=0.5[v7]; \
     [8:v]fade=t=in:st=0:d=0.5[v8]; \
     [9:v]fade=t=in:st=0:d=0.5[v9]; \
     [10:v]fade=t=in:st=0:d=0.5[v10]; \
     [11:v]fade=t=in:st=0:d=0.5[v11]; \
     [v0][v1][v2][v3][v4][v5][v6][v7][v8][v9][v10][v11]concat=n=12:v=1:a=0[vid]" \
  -map "[vid]" -map 12:a \
  -c:v libx264 -pix_fmt yuv420p \
  04_video/{{project-id}}.mp4
```

---

## 约束

- **总时长严格 600 秒**（10 分钟），允许 ±5% 偏差
- 每页时长根据内容自动分配（最少 30 秒，最多 60 秒）
- 12 页完整覆盖 4 幕叙事结构
- 输出为 JSON + ffmpeg 命令
- 音频文件必须与视频总时长一致（600 秒）

---

## 文件持久化防御

**⚠️ 已知问题**：某些环境（TRAE/安全软件）会扫描并自动清空 `.mp4` 文件。

### 防御策略

| 交付格式 | 免疫清理 | 推荐场景 |
|---------|---------|---------|
| `.mp4` 直接输出 | ❌ 可能被清理 | Linux/macOS |
| `.zip` 打包交付 | ✅ 完全免疫 | **Windows 推荐** |
| 渲染到临时目录 → 迁移 | ⚠️ 部分免疫 | 需要 mp4 直读时 |

### 执行规则

```yaml
根据 env-check.md 的环境检测结果:
  平台 = Windows:
    → 渲染到临时目录 → 验证文件有效 → .zip 打包 → 交付 .zip
    → 不要直接输出 .mp4 到项目目录
  平台 = Linux/macOS:
    → 可直接输出 .mp4
    → 建议额外保留 .zip 备份
```

### 参考实现

详见 `skill/templates/video-render-ref.md` 中的 `render_safe()` 函数。

---

## 视觉多样性（Long 模式）

**问题**：12 页每页 50 秒静态图，观众容易疲劳。

### 增强策略

| 策略 | 实现方式 | 复杂度 |
|------|---------|--------|
| **一页多图轮播** | 一个 slide 拆成多个子帧，定时切换 | 低 |
| **动态文字高亮** | 逐行显示文字，模拟打字效果 | 中 |
| **过渡差异化** | 不只用 fade，混合 slide/zoom/wipe | 低 |
| **视觉变焦** | 图片缓慢 zoom in/out（Ken Burns 效果） | 中 |

### spec 扩展字段

在 video-spec.json 中增加多样性标记：

```json
{
  "visual_diversity": {
    "enabled": true,
    "strategies": ["multi_image_carousel", "dynamic_text", "ken_burns"],
    "carousel_interval_seconds": 10,
    "ken_burns_zoom": 0.05
  },
  "slides": [
    {
      "page": 6,
      "image": "slide_06.png",
      "duration_seconds": 55,
      "subframes": [
        {"image": "slide_06a.png", "start": 0, "duration": 27},
        {"image": "slide_06b.png", "start": 27, "duration": 28}
      ]
    }
  ]
}
```

### 实现参考

```python
# 一页多图轮播（在 video-render-ref.md 的 render_video 基础上扩展）
def render_slide_with_subframes(slide, slides_dir, fps, width, height):
    """支持子帧轮播的 slide 渲染"""
    if "subframes" in slide:
        frames = []
        for sf in slide["subframes"]:
            img_path = os.path.join(slides_dir, sf["image"])
            img = cv2.imread(img_path)
            if img is None:
                img = np.zeros((height, width, 3), dtype=np.uint8)
            img = cv2.resize(img, (width, height))
            sf_frames = int(sf["duration"] * fps)
            frames.extend([img] * sf_frames)
        return frames
    else:
        # 单图
        img_path = os.path.join(slides_dir, slide["image"])
        img = cv2.imread(img_path) or np.zeros((height, width, 3), dtype=np.uint8)
        img = cv2.resize(img, (width, height))
        duration_frames = int(slide["duration_seconds"] * fps)
        return [img] * duration_frames
```

### 预览建议

生成长视频前，建议先渲染 **30 秒预览片段**（取开头 1~2 页），验证视觉风格后再渲染全片。
