"""校验示例生产计划符合 plan.schema.json（含 NSFW 成年声明强制逻辑）。

运行:
    python tests/test_plan_schema.py
依赖: jsonschema（可选，缺失时 SKIP）
"""

from __future__ import annotations

import json
import os
import re
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)


def extract_json_from_md(md_path: str) -> list[dict]:
    """提取 md 中所有 ```json ... ``` 块。"""
    text = open(md_path, encoding="utf-8").read()
    blocks = re.findall(r"```json\n(.*?)```", text, re.S)
    return [json.loads(b) for b in blocks]


class TestPlanSchema(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        try:
            import jsonschema  # noqa: F401
            cls.jsonschema = jsonschema
        except ImportError:
            cls.jsonschema = None

    def _load_schema(self):
        return json.load(open(
            os.path.join(ROOT, "schemas", "plan.schema.json"), encoding="utf-8"))

    def test_example_plan_valid(self):
        plans = extract_json_from_md(
            os.path.join(ROOT, "examples", "example-plan.md"))
        self.assertTrue(plans, "示例计划未提取到")
        plan = plans[0]
        self.assertEqual(plan["content_mode"], "nsfw")
        self.assertTrue(plan["adult_decl"]["adult"])
        self.assertGreaterEqual(plan["adult_decl"]["age"], 18)

        if self.jsonschema:
            self.jsonschema.validate(plan, self._load_schema())

    def test_nsfw_requires_adult_decl(self):
        """NSFW 计划缺 adult_decl 必须校验失败。"""
        plans = extract_json_from_md(
            os.path.join(ROOT, "examples", "example-plan.md"))
        bad = dict(plans[0])
        del bad["adult_decl"]
        del bad["lewdness"]
        if self.jsonschema:
            with self.assertRaises(self.jsonschema.ValidationError):
                self.jsonschema.validate(bad, self._load_schema())

    def test_sfw_plan_no_adult_needed(self):
        """SFW 计划不需要 adult_decl，直接通过。"""
        plans = extract_json_from_md(
            os.path.join(ROOT, "examples", "example-plan.md"))
        sfw = dict(plans[0])
        sfw["content_mode"] = "sfw"
        sfw.pop("adult_decl", None)
        sfw.pop("lewdness", None)
        if self.jsonschema:
            self.jsonschema.validate(sfw, self._load_schema())


if __name__ == "__main__":
    unittest.main(verbosity=2)
