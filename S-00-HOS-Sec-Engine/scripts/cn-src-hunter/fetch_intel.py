#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_intel.py — CN-SRC-Hunter 公开情报采集（阶段 1 数据源）

抓取国内主要漏洞披露平台的公开项目列表，
保存到 templates/raw/ 供评分与人工挑选使用。

支持平台：
    - 补天 (butian.net)：公益SRC、专属SRC、企业SRC
    - 漏洞盒子 (vulbox.com)：项目大厅 bounty 排序

仅访问公开页面/接口，不做任何主动扫描。零依赖（urllib 标准库）。
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request
import http.cookiejar

# Windows 终端默认 GBK，强制 UTF-8 输出避免中文乱码
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(BASE, "templates", "raw")
os.makedirs(RAW, exist_ok=True)

# 通用浏览器 UA，避免被平台拦截
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")

# Cookie 管理器，模拟真实浏览器会话
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))


def fetch(url, data=None, referer=None, method=None):
    """通用 HTTP 请求工具（GET/POST 自动切换）。

    Args:
        url:        目标 URL
        data:       POST 参数字典（None 则为 GET）
        referer:    来源页面（部分平台需要）
        method:     强制指定 HTTP 方法

    Returns:
        bytes: 响应体原始字节
    """
    h = {"User-Agent": UA, "Accept": "application/json, text/plain, */*"}
    if referer:
        h["Referer"] = referer
    if data is not None:
        h["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8"
        h["X-Requested-With"] = "XMLHttpRequest"
    body = urllib.parse.urlencode(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    with opener.open(req, timeout=30) as r:
        return r.read()


def decode(raw):
    """尝试 UTF-8 / GBK 解码并解析 JSON。

    Args:
        raw: 原始响应字节

    Returns:
        dict/list 或 None（解码/解析失败时）
    """
    for enc in ("utf-8", "gbk"):
        try:
            return json.loads(raw.decode(enc))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
    return None


def save(fn, obj):
    """将采集结果保存为 JSON 文件到 templates/raw/ 目录。

    Args:
        fn: 文件名（如 butian_pub.json）
        obj: 要保存的 JSON 对象
    """
    path = os.path.join(RAW, fn)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    cnt = len(obj) if isinstance(obj, list) else obj.get("code", 0)
    print(f"  -> {fn}: {cnt} 条")


# ========== 补天 (butian.net) 采集 ==========
# 补天 Reward 页面作为 Referer，部分接口需要
BT_REF = "https://www.butian.net/Reward/plan/2"

# 先访问首页获取必要的 Cookie
try:
    fetch("https://www.butian.net/")
    print("[补天] cookie 就绪")
except Exception as e:
    print("[补天] 首页 cookie:", e)


def bt_collect(endpoint, params, filename, pages=4):
    """补天通用分页采集。

    Args:
        endpoint:  API 端点后缀（如 pub / com / corps）
        params:    查询参数字典
        filename:  输出文件名
        pages:     最大分页页数

    Returns:
        list: 采集到的全部条目列表
    """
    out = []
    for p in range(1, pages + 1):
        d = dict(params)
        d["p"] = p
        try:
            raw = fetch(f"https://www.butian.net/Reward/{endpoint}", data=d, referer=BT_REF)
            j = decode(raw)
        except Exception as e:
            print(f"  {endpoint} p{p} 失败: {e}")
            continue
        lst = ((j or {}).get("data") or {}).get("list") or []
        if not lst:
            print(f"  {endpoint} p{p}: 空，停止分页")
            break
        out.extend(lst)
        time.sleep(1.2)  # 礼貌性延迟
    save(filename, out)


# 补天公益 SRC（面向个人白帽的公开项目）
print("[补天] 公益SRC...")
bt_collect("pub", {"name": ""}, "butian_pub.json")

# 补天专属 SRC（企业定向邀请制项目）
print("[补天] 专属SRC...")
bt_collect("com", {}, "butian_com.json")

# 补天企业 SRC（企业自主运营的公开 SRC 项目）
print("[补天] 企业SRC(corps)...")
bt_collect("corps", {"name": ""}, "butian_corps.json")


# ========== 漏洞盒子 (vulbox.com) 采集 ==========
print("[漏洞盒子] 项目大厅(bounty 排序)...")
vb_out = []
for p in range(1, 8):
    q = urllib.parse.urlencode({
        "type": -1, "flag": 0, "page": p, "page_size": 10,
        "order_by": "bounty", "direction": "desc",
    })
    try:
        raw = fetch(f"https://vapi.vulbox.com/web/project/projects?{q}")
        j = decode(raw)
    except Exception as e:
        print(f"  vb p{p} 失败: {e}")
        continue
    # 漏洞盒子 API 返回结构：data.data 为项目列表
    lst = ((j or {}).get("data") or {}).get("data") or []
    if not lst:
        print(f"  vb p{p}: 空，停止分页")
        break
    vb_out.extend(lst)
    time.sleep(1)  # 礼貌性延迟
save("vulbox_projects.json", vb_out)

print("\n采集完成。输出目录:", RAW)