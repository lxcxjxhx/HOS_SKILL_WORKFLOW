"""程序化白底抠图单元测试。

运行:
    python tests/test_cutout.py
依赖: Pillow
"""

from __future__ import annotations

import os
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "src"))

from cutout import make_transparent  # noqa: E402


class TestCutout(unittest.TestCase):
    def _make_white_bg_image(self, path: str) -> None:
        """白底 + 中央不透明彩色块。"""
        from PIL import Image
        im = Image.new("RGBA", (64, 64), (255, 255, 255, 255))
        for y in range(20, 44):
            for x in range(20, 44):
                im.putpixel((x, y), (200, 60, 60, 255))  # 纯色块（低于 soft 阈值）
        im.save(path, "PNG")

    def test_edge_transparent_center_kept(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = os.path.join(tmp, "in.png")
            dst = os.path.join(tmp, "out_t.png")
            self._make_white_bg_image(src)
            make_transparent(src, dst, hard=248, soft=235)

            from PIL import Image
            out = Image.open(dst).convert("RGBA")
            self.assertEqual(out.getpixel((2, 2))[3], 0, "白底边缘应全透明")
            self.assertGreater(out.getpixel((32, 32))[3], 200, "彩色块应保留")

    def test_antialias_gradient_edge(self):
        """soft~hard 之间的浅灰像素应得到中间 alpha（防白圈）。"""
        from PIL import Image
        with tempfile.TemporaryDirectory() as tmp:
            src = os.path.join(tmp, "in.png")
            dst = os.path.join(tmp, "out_t.png")
            im = Image.new("RGBA", (16, 16), (255, 255, 255, 255))
            im.putpixel((8, 8), (240, 240, 240, 255))  # soft(235) < 240 < hard(248)
            im.save(src, "PNG")
            make_transparent(src, dst, hard=248, soft=235)
            out = Image.open(dst).convert("RGBA")
            a = out.getpixel((8, 8))[3]
            self.assertGreater(a, 0)
            self.assertLess(a, 255)


if __name__ == "__main__":
    unittest.main(verbosity=2)
