#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
target_score.py — CN-SRC-Hunter 项目评分工具（零依赖，Python 3.x）

读取 templates/programs-schema.csv 并按 100 分制加权计算 Target Score，输出 TOP10。
权重与 cn-src-hunter skill 的阶段 1.4 一致：

    Reward           20  (cash_bounty 布尔 10 分 + bounty_level 1-5 折算 10 分)
    Scope            20  (scope 1-5)
    Activity         20  (activity 1-5)
    Attack Surface   15  (attack_surface 1-5)
    Tech Stack       10  (tech_stack 1-5)
    Competition      10  (competition 1-5，新项目/低竞争给高分)
    Automation        5  (automation 0/1)

CSV 列（表头固定，维度列取值 1-5，布尔列取值 0/1）：
    name,platform,cash_bounty,bounty_level,scope,activity,attack_surface,tech_stack,competition,automation

用法：
    python target_score.py            # 读取 programs-schema.csv 输出 TOP10
    python target_score.py -i         # 交互模式：逐项录入一个新项目
    python target_score.py -n 5       # 只看前 5 名

若 CSV 不存在，自动进入交互模式。
"""
import csv
import os
import sys

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

CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates", "programs-schema.csv")

HEADERS = ["name", "platform", "cash_bounty", "bounty_level", "scope",
           "activity", "attack_surface", "tech_stack", "competition", "automation"]

RATIO_1_5 = 5.0  # 1-5 分维度的满分


def clamp(v, lo=1, hi=5):
    """将数值限制在 [lo, hi] 区间内，非法值回退为 lo。"""
    try:
        v = float(v)
    except (TypeError, ValueError):
        return lo
    return max(lo, min(hi, v))


def compute(row):
    """row: dict（CSV 行）→ (score, detail)

    评分维度说明：
    - reward（奖励，满分 20）：是否有现金 bounty（10 分）+ 奖励档位 bounty_level 折算（10 分）
    - scope（范围，满分 20）：项目覆盖范围，越大分越高
    - activity（活跃度，满分 20）：近期更新/修复频率，越活跃分越高
    - attack_surface（攻击面，满分 15）：可测试的入口/资产越多，分越高
    - tech_stack（技术栈，满分 10）：技术栈越常见/流行，分越高（工具链成熟）
    - competition（竞争度，满分 10）：竞争越低（新项目/少人打），分越高
    - automation（自动化，满分 5）：是否允许自动化扫描/挖掘
    """
    # Reward 维度：cash_bounty 布尔值 + bounty_level 比例分
    reward = 10.0 if str(row.get("cash_bounty", "0")).strip() in ("1", "true", "True", "yes") else 0.0
    reward += clamp(row.get("bounty_level", 1)) / RATIO_1_5 * 10.0

    # Scope 维度：项目规模
    scope = clamp(row.get("scope", 1)) / RATIO_1_5 * 20.0

    # Activity 维度：项目活跃度
    activity = clamp(row.get("activity", 1)) / RATIO_1_5 * 20.0

    # Attack Surface 维度：攻击面大小
    attack = clamp(row.get("attack_surface", 1)) / RATIO_1_5 * 15.0

    # Tech Stack 维度：技术栈常见度
    tech = clamp(row.get("tech_stack", 1)) / RATIO_1_5 * 10.0

    # Competition 维度：竞争程度（分越高=竞争越低）
    comp = clamp(row.get("competition", 1)) / RATIO_1_5 * 10.0

    # Automation 维度：是否允许自动化
    auto = 5.0 if str(row.get("automation", "0")).strip() in ("1", "true", "True", "yes") else 0.0

    total = reward + scope + activity + attack + tech + comp + auto
    detail = {"reward": round(reward, 1), "scope": round(scope, 1), "activity": round(activity, 1),
              "attack_surface": round(attack, 1), "tech_stack": round(tech, 1),
              "competition": round(comp, 1), "automation": round(auto, 1)}
    return round(total, 1), detail


def interactive():
    """交互模式：逐项录入新项目的各维度分值。"""
    print("== 交互录入新项目 ==")
    row = {}
    row["name"] = input("项目名: ").strip()
    row["platform"] = input("平台(补天/漏洞盒子/火线/企业SRC...): ").strip() or "未知"
    row["cash_bounty"] = input("是否现金 bounty(1/0): ").strip() or "0"
    row["bounty_level"] = input("奖励档位(1-5): ").strip() or "1"
    row["scope"] = input("Scope 规模(1-5): ").strip() or "1"
    row["activity"] = input("活跃度(1-5): ").strip() or "1"
    row["attack_surface"] = input("攻击面(1-5): ").strip() or "1"
    row["tech_stack"] = input("技术栈常见度(1-5): ").strip() or "1"
    row["competition"] = input("低竞争度(1-5): ").strip() or "1"
    row["automation"] = input("允许自动化(1/0): ").strip() or "0"
    return row


def main():
    args = sys.argv[1:]
    # 交互模式：用户指定 -i 或 CSV 文件不存在
    interactive_mode = "-i" in args or not os.path.exists(CSV_PATH)
    top_n = None
    for i, a in enumerate(args):
        if a == "-n" and i + 1 < len(args):
            try:
                top_n = int(args[i + 1])
            except ValueError:
                top_n = None

    if interactive_mode:
        row = interactive()
        score, detail = compute(row)
        print("\n得分明细(满分100):")
        for k, v in detail.items():
            print(f"  {k:>12}: {v}")
        print(f"  {'TOTAL':>12}: {score}")
        # 询问是否写入 CSV
        if input("\n写入 programs-schema.csv? (y/N): ").strip().lower() == "y":
            os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
            exists = os.path.exists(CSV_PATH)
            with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
                w = csv.DictWriter(f, fieldnames=HEADERS)
                if not exists:
                    w.writeheader()
                w.writerow({h: row.get(h, "") for h in HEADERS})
            print(f"已追加到 {CSV_PATH}")
        return

    rows = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            if r.get("name"):
                rows.append(r)

    if not rows:
        print("programs-schema.csv 为空，请先用 -i 录入项目。")
        return

    scored = []
    for r in rows:
        s, d = compute(r)
        scored.append((s, d, r))
    scored.sort(key=lambda x: -x[0])

    print(f"{'排名':<4}{'总分':<7}{'项目名':<24}{'平台':<14}{'Reward':<8}{'Scope':<7}{'活跃':<7}{'攻击面':<8}{'技术栈':<8}{'竞争':<7}{'自动化'}")
    print("-" * 100)
    for i, (s, d, r) in enumerate(scored[:top_n] if top_n else scored, 1):
        print(f"{i:<4}{s:<7}{r['name'][:22]:<24}{r.get('platform','')[:12]:<14}"
              f"{d['reward']:<8}{d['scope']:<7}{d['activity']:<7}{d['attack_surface']:<8}"
              f"{d['tech_stack']:<8}{d['competition']:<7}{d['automation']}")
    print(f"\n共 {len(scored)} 个项目，建议优先打 TOP10 高分项目。")


if __name__ == "__main__":
    main()