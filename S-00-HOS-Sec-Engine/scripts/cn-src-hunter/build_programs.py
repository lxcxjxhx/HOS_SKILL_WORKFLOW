#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_programs.py — 从 templates/raw/ 公开情报构建 programs-schema.csv 并评分（阶段 1.4）

数据源（由 fetch_intel.py 生成）：
  butian_corps.json   补天企业SRC（含 min/max_reward、change_time、recommend）
  vulbox_projects.json 漏洞盒子项目大厅（含 task_bonus_level、task_stime/etime）

评分规则与 cn-src-hunter skill 阶段 1.4 权重一致（100 分制），
维度值从公开字段自动推断（奖励/活跃度/规模等）。

生成的 CSV 供 target_score.py 进一步排序与筛选。
"""
import csv
import json
import os
import sys
from datetime import datetime

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
CSV_PATH = os.path.join(BASE, "templates", "programs-schema.csv")

HEADERS = ["name", "platform", "cash_bounty", "bounty_level", "scope",
           "activity", "attack_surface", "tech_stack", "competition", "automation",
           "company_id", "min_reward", "max_reward", "source", "update_time", "scope_desc"]

NOW = datetime.now()

# 大型平台/行业类别（scope/攻击面给高分，竞争也给高分=低竞争）
# 这些是通用行业分类，用于自动推断项目规模与竞争度
BIG_PLATFORM = ["大型互联网公司", "金融科技企业", "智能制造企业", "电商平台", "出行服务"]


def days_ago(s):
    """计算给定日期字符串距今的天数。

    Args:
        s: 日期字符串（支持 YYYY-MM-DD 格式）

    Returns:
        int: 距今天数，解析失败返回 9999
    """
    if not s:
        return 9999
    try:
        return (NOW - datetime.strptime(str(s)[:10], "%Y-%m-%d")).days
    except Exception:
        return 9999


def bounty_level(max_r):
    """根据最高奖励金额推算 bounty_level 档位（1-5 分）。

    奖励档位映射：
        >= 20000 → 5.0（超高奖励）
        >= 10000 → 4.2（高奖励）
        >= 5000  → 3.6（中高奖励）
        >= 2500  → 3.0（中等奖励）
        >= 1000  → 2.4（中低奖励）
        >= 500   → 1.8（基础奖励）
        < 500    → 1.0（低奖励/无奖励）

    Args:
        max_r: 最高奖励金额（元）

    Returns:
        float: 奖励档位分值（1.0 - 5.0）
    """
    r = float(max_r or 0)
    if r >= 20000: return 5.0
    if r >= 10000: return 4.2
    if r >= 5000:  return 3.6
    if r >= 2500:  return 3.0
    if r >= 1000:  return 2.4
    if r >= 500:   return 1.8
    return 1.0


def activity_score(d):
    """根据最近更新时间计算项目活跃度（1-5 分）。

    活跃度映射（距今天数）：
        <= 30 天  → 5（非常活跃）
        <= 90 天  → 4（活跃）
        <= 180 天 → 3（一般活跃）
        <= 365 天 → 2（不太活跃）
        > 365 天  → 1（长期未更新）

    Args:
        d: 更新时间字符串

    Returns:
        int: 活跃度分值（1-5）
    """
    d = days_ago(d)
    if d <= 30:  return 5
    if d <= 90:  return 4
    if d <= 180: return 3
    if d <= 365: return 2
    return 1


def is_big(name):
    """判断项目是否属于大型平台/企业类别。

    Args:
        name: 项目/企业名称

    Returns:
        bool: 是否为大型平台
    """
    return any(k in name for k in BIG_PLATFORM)


def score_bt(it):
    """将补天企业SRC原始条目转换为评分行。

    评分逻辑：
        - scope: 大型平台=4，普通企业=3
        - attack_surface: 大型平台=4，普通企业=3
        - tech_stack: 金融/银行/支付/科技类=4，其他=3
        - competition: 大型平台=2（竞争激烈），普通企业=4（竞争较低）
        - automation: 企业SRC 默认不允许自动化=0

    Args:
        it: 补天 JSON 中的单个项目 dict

    Returns:
        dict: 评分后的行数据
    """
    name = it["company_name"]
    max_r = float(it.get("max_reward") or 0)

    # 技术栈推断：根据名称关键词判断是否为金融/科技类
    is_fintech = any(k in name for k in ["金融", "银行", "支付", "科技"])

    row = {
        "name": name,
        "platform": "补天(企业SRC)",
        "cash_bounty": 1,
        "bounty_level": bounty_level(max_r),
        "scope": 4 if is_big(name) else 3,
        "activity": activity_score(it.get("change_time")),
        "attack_surface": 4 if is_big(name) else 3,
        "tech_stack": 4 if is_fintech else 3,
        "competition": 2 if is_big(name) else 4,
        "automation": 0,
        "company_id": it.get("company_id"),
        "min_reward": it.get("min_reward"),
        "max_reward": it.get("max_reward"),
        "source": "butian_corps",
        "update_time": str(it.get("change_time", ""))[:10],
        "scope_desc": "补天平台企业SRC，注册实名后可申请测试（以平台协议为准）",
    }
    return row


def score_vb(it):
    """将漏洞盒子项目条目转换为评分行。

    评分逻辑：
        - 仅保留进行中项目（status=0）
        - bounty_level: 根据 serious_max 金额档位映射
        - activity: 根据剩余时间计算（>=60天=5, >0天=4, 已过期=2）
        - attack_surface: 名称含大型平台关键词=4，其他=3
        - competition: 大型平台=2（竞争激烈），普通=3
        - automation: 托管SRC 默认不允许自动化=0

    Args:
        it: 漏洞盒子 JSON 中的单个项目 dict

    Returns:
        dict or None: 评分后的行数据，非进行中项目返回 None
    """
    name = it.get("task_title", "").strip()
    if not name:
        return None

    st = int(it.get("status", 0))
    if st != 0:
        return None  # 只保留进行中项目

    br = it.get("bonus_range") or {}
    serious_max = float(br.get("serious_max") or 0)

    # 计算剩余时间，推算活跃度
    et = it.get("task_etime")
    d = 9999
    if et:
        try:
            d = (datetime.fromtimestamp(int(et)) - NOW).days
        except Exception:
            pass
    act = 5 if d >= 60 else (4 if d > 0 else 2)

    # 根据名称判断是否为大型平台/知名企业
    is_large = any(k in name for k in BIG_PLATFORM)

    row = {
        "name": name,
        "platform": "漏洞盒子(托管SRC)",
        "cash_bounty": 1,
        # 漏洞盒子 bounty_level：根据 serious_max 档位映射
        "bounty_level": 5.0 if serious_max >= 30000 else (
                        4.5 if serious_max >= 15000 else (
                        4.0 if serious_max >= 10000 else (
                        3.2 if serious_max >= 5000 else (
                        2.5 if serious_max >= 2000 else 1.5)))),
        "scope": 3,
        "activity": act,
        "attack_surface": 4 if is_large else 3,
        "tech_stack": 3,
        "competition": 2 if is_large else 3,
        "automation": 0,
        "company_id": it.get("project_id"),
        "min_reward": br.get("serious_min") or "",
        "max_reward": serious_max or "",
        "source": "vulbox",
        "update_time": datetime.fromtimestamp(int(it.get("task_stime") or 0)).strftime("%Y-%m-%d") if it.get("task_stime") else "",
        "scope_desc": f"托管SRC {it.get('task_website','')} | serious {br.get('serious_min','?')}-{serious_max or '?'}",
    }
    return row


def main():
    """主流程：读取原始 JSON → 逐条评分 → 去重 → 写入 CSV。"""
    rows = []

    # 遍历所有数据源，使用对应的评分函数
    for fn, scorer in [("butian_corps.json", score_bt), ("vulbox_projects.json", score_vb)]:
        p = os.path.join(RAW, fn)
        if not os.path.exists(p):
            print(f"缺数据源: {fn}（先跑 fetch_intel.py）")
            continue
        data = json.load(open(p, encoding="utf-8"))
        if isinstance(data, dict):
            data = data.get("data") or []
        seen = {}
        for it in data:
            if not isinstance(it, dict):
                continue
            r = scorer(it)
            if not r:
                continue
            # 以 (平台, 项目名) 为 key 去重，保留更新时间最新的记录
            key = (r["platform"], r["name"])
            if key not in seen or days_ago(seen[key].get("update_time")) > days_ago(r.get("update_time")):
                seen[key] = r
        rows.extend(seen.values())
        print(f"{fn}: 有效 {len(seen)} 条")

    if not rows:
        print("无数据可写。")
        return

    # 写入 CSV，供 target_score.py 评分排序
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=HEADERS)
        w.writeheader()
        for r in rows:
            w.writerow({h: r.get(h, "") for h in HEADERS})
    print(f"已写入 {CSV_PATH}，共 {len(rows)} 个项目。")


if __name__ == "__main__":
    main()