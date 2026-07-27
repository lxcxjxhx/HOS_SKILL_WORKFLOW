#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片处理模块 - HOS-QuizMaster V2
提供图片锐化、降噪、自动增强、缩放等功能
使用 OpenCV (cv2) 作为主要处理引擎，Pillow 作为后备
"""

import os
import logging
from typing import Optional, Tuple

import numpy as np

from utils.image_cache import ImageCache

logger = logging.getLogger(__name__)

# 支持的图片格式
SUPPORTED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp', '.tiff', '.tif'}


class ImageProcessor:
    """图片处理器，支持锐化、降噪、自动增强、缩放等操作"""

    def __init__(self, cache: Optional[ImageCache] = None):
        """
        初始化图片处理器

        Args:
            cache: 图片缓存管理器，为 None 时自动创建
        """
        self.cache = cache or ImageCache()
        self._cv2 = None
        self._pil_available = False
        self._init_backends()

    def _init_backends(self):
        """初始化处理后端"""
        try:
            import cv2
            self._cv2 = cv2
        except ImportError:
            logger.warning("OpenCV (cv2) 不可用，将使用 Pillow 作为后备方案")

        try:
            from PIL import Image
            self._pil_available = True
        except ImportError:
            logger.warning("Pillow 不可用，图片处理功能将受限")

    def _load_image(self, image_path: str) -> np.ndarray:
        """
        加载图片为 numpy array (BGR 格式，OpenCV 标准)

        Args:
            image_path: 图片文件路径

        Returns:
            numpy array (BGR)

        Raises:
            FileNotFoundError: 文件不存在
            ValueError: 不支持的格式或无法读取
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"图片文件不存在: {image_path}")

        ext = os.path.splitext(image_path)[1].lower()
        if ext not in SUPPORTED_EXTENSIONS:
            raise ValueError(f"不支持的图片格式: {ext}，支持: {', '.join(SUPPORTED_EXTENSIONS)}")

        if self._cv2 is not None:
            img = self._cv2.imread(image_path, self._cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError(f"无法读取图片: {image_path}")
            return img
        elif self._pil_available:
            from PIL import Image
            pil_img = Image.open(image_path).convert('RGB')
            return np.array(pil_img)[:, :, ::-1]  # RGB -> BGR
        else:
            raise RuntimeError("没有可用的图片处理后端 (需要 OpenCV 或 Pillow)")

    def _save_image(self, image: np.ndarray, output_path: str) -> str:
        """
        保存图片到文件

        Args:
            image: numpy array (BGR)
            output_path: 输出路径

        Returns:
            保存的文件路径
        """
        if self._cv2 is not None:
            self._cv2.imwrite(output_path, image)
        elif self._pil_available:
            from PIL import Image
            if image.ndim == 3:
                pil_img = Image.fromarray(image[:, :, ::-1])  # BGR -> RGB
            else:
                pil_img = Image.fromarray(image)
            pil_img.save(output_path)
        else:
            raise RuntimeError("没有可用的图片处理后端")
        return output_path

    def sharpen(self, image_path: str, level: int = 1) -> np.ndarray:
        """
        锐化图片

        Args:
            image_path: 图片文件路径
            level: 锐化级别 (1=轻度, 2=中度, 3=强烈)

        Returns:
            锐化后的图片 (numpy array BGR)
        """
        params = {"operation": "sharpen", "level": level}
        cached = self.cache.get(image_path, params)
        if cached:
            return self._load_image(cached)

        img = self._load_image(image_path)

        if self._cv2 is not None:
            result = self._sharpen_cv2(img, level)
        else:
            result = self._sharpen_pil(img, level)

        self.cache.put(image_path, params, result)
        return result

    def _sharpen_cv2(self, img: np.ndarray, level: int) -> np.ndarray:
        """使用 OpenCV 进行锐化 (Unsharp Mask)"""
        cv2 = self._cv2

        # Unsharp mask: original + amount * (original - blurred)
        kernel_sizes = {1: (3, 3), 2: (5, 5), 3: (7, 7)}
        sigmas = {1: 1.0, 2: 2.0, 3: 3.0}
        amounts = {1: 0.5, 2: 1.0, 3: 1.5}

        ksize = kernel_sizes.get(level, (3, 3))
        sigma = sigmas.get(level, 1.0)
        amount = amounts.get(level, 0.5)

        blurred = cv2.GaussianBlur(img, ksize, sigma)
        sharpened = cv2.addWeighted(img, 1.0 + amount, blurred, -amount, 0)
        return sharpened

    def _sharpen_pil(self, img: np.ndarray, level: int) -> np.ndarray:
        """使用 Pillow 进行锐化 (后备方案)"""
        from PIL import ImageFilter
        from PIL import Image

        if img.ndim == 3:
            pil_img = Image.fromarray(img[:, :, ::-1])  # BGR -> RGB
        else:
            pil_img = Image.fromarray(img)

        filters = {
            1: ImageFilter.SHARPEN,
            2: ImageFilter.DETAIL,
            3: ImageFilter.SHARPEN,
        }
        pil_img = pil_img.filter(filters.get(level, ImageFilter.SHARPEN))
        result = np.array(pil_img)
        if result.ndim == 3:
            return result[:, :, ::-1]  # RGB -> BGR
        return result

    def denoise(self, image_path: str, level: int = 1) -> np.ndarray:
        """
        降噪图片

        Args:
            image_path: 图片文件路径
            level: 降噪级别 (1=轻度, 2=中度, 3=强烈)

        Returns:
            降噪后的图片 (numpy array BGR)
        """
        params = {"operation": "denoise", "level": level}
        cached = self.cache.get(image_path, params)
        if cached:
            return self._load_image(cached)

        img = self._load_image(image_path)

        if self._cv2 is not None:
            result = self._denoise_cv2(img, level)
        else:
            result = self._denoise_pil(img, level)

        self.cache.put(image_path, params, result)
        return result

    def _denoise_cv2(self, img: np.ndarray, level: int) -> np.ndarray:
        """使用 OpenCV 进行降噪 (Bilateral Filter + Non-local Means)"""
        cv2 = self._cv2

        if level == 1:
            # 轻度：双边滤波
            result = cv2.bilateralFilter(img, d=9, sigmaColor=75, sigmaSpace=75)
        elif level == 2:
            # 中度：Non-local means denoising
            result = cv2.fastNlMeansDenoisingColored(img, None, h=5, hForColorComponents=5,
                                                      templateWindowSize=7, searchWindowSize=21)
        else:
            # 强烈：先用双边滤波再 NLM
            temp = cv2.bilateralFilter(img, d=9, sigmaColor=100, sigmaSpace=100)
            result = cv2.fastNlMeansDenoisingColored(temp, None, h=8, hForColorComponents=8,
                                                      templateWindowSize=7, searchWindowSize=21)
        return result

    def _denoise_pil(self, img: np.ndarray, level: int) -> np.ndarray:
        """使用 Pillow 进行降噪 (后备方案)"""
        from PIL import ImageFilter, Image

        if img.ndim == 3:
            pil_img = Image.fromarray(img[:, :, ::-1])
        else:
            pil_img = Image.fromarray(img)

        filters = {
            1: ImageFilter.SMOOTH,
            2: ImageFilter.SMOOTH_MORE,
            3: ImageFilter.BLUR,
        }
        pil_img = pil_img.filter(filters.get(level, ImageFilter.SMOOTH))
        result = np.array(pil_img)
        if result.ndim == 3:
            return result[:, :, ::-1]
        return result

    def auto_enhance(self, image_path: str) -> np.ndarray:
        """
        自动增强图片 - 分析图片质量并应用最佳增强方案

        分析维度：
        - 模糊度检测 (Laplacian 方差)
        - 噪声估计
        - 亮度/对比度分析

        Args:
            image_path: 图片文件路径

        Returns:
            增强后的图片 (numpy array BGR)
        """
        params = {"operation": "auto_enhance"}
        cached = self.cache.get(image_path, params)
        if cached:
            return self._load_image(cached)

        img = self._load_image(image_path)
        result = self._auto_enhance_impl(img)
        self.cache.put(image_path, params, result)
        return result

    def _auto_enhance_impl(self, img: np.ndarray) -> np.ndarray:
        """自动增强实现"""
        if self._cv2 is not None:
            return self._auto_enhance_cv2(img)
        else:
            return self._auto_enhance_pil(img)

    def _auto_enhance_cv2(self, img: np.ndarray) -> np.ndarray:
        """使用 OpenCV 进行自动增强"""
        cv2 = self._cv2
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 1. 模糊度检测 (Laplacian 方差)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        is_blurry = laplacian_var < 100  # 阈值可调

        # 2. 噪声估计 (高频成分)
        blur_small = cv2.GaussianBlur(gray, (3, 3), 0)
        noise_est = np.std(gray.astype(float) - blur_small.astype(float))
        is_noisy = noise_est > 15

        # 3. 亮度和对比度
        mean_brightness = np.mean(gray)
        std_brightness = np.std(gray)
        is_low_contrast = std_brightness < 40
        is_too_dark = mean_brightness < 80
        is_too_bright = mean_brightness > 200

        result = img.copy()

        # 根据分析结果应用增强
        if is_noisy:
            result = cv2.bilateralFilter(result, d=9, sigmaColor=75, sigmaSpace=75)

        if is_blurry:
            blurred = cv2.GaussianBlur(result, (3, 3), 1.0)
            result = cv2.addWeighted(result, 1.5, blurred, -0.5, 0)

        if is_low_contrast:
            # CLAHE 自适应直方图均衡化
            lab = cv2.cvtColor(result, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            result = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)
        elif is_too_dark:
            # 简单亮度提升
            result = cv2.convertScaleAbs(result, alpha=1.2, beta=20)
        elif is_too_bright:
            result = cv2.convertScaleAbs(result, alpha=0.9, beta=-10)

        return result

    def _auto_enhance_pil(self, img: np.ndarray) -> np.ndarray:
        """使用 Pillow 进行自动增强 (后备方案)"""
        from PIL import Image, ImageEnhance

        if img.ndim == 3:
            pil_img = Image.fromarray(img[:, :, ::-1])
        else:
            pil_img = Image.fromarray(img)

        # 简单自动增强
        enhancer = ImageEnhance.Contrast(pil_img)
        pil_img = enhancer.enhance(1.2)
        enhancer = ImageEnhance.Sharpness(pil_img)
        pil_img = enhancer.enhance(1.3)

        result = np.array(pil_img)
        if result.ndim == 3:
            return result[:, :, ::-1]
        return result

    def resize(self, image_path: str, width: Optional[int] = None,
               height: Optional[int] = None, scale: Optional[float] = None) -> np.ndarray:
        """
        缩放图片

        Args:
            image_path: 图片文件路径
            width: 目标宽度 (与 height 至少指定一个，或指定 scale)
            height: 目标高度
            scale: 缩放比例 (如 0.5 缩小一半，2.0 放大两倍)

        Returns:
            缩放后的图片 (numpy array BGR)
        """
        params = {"operation": "resize", "width": width, "height": height, "scale": scale}
        cached = self.cache.get(image_path, params)
        if cached:
            return self._load_image(cached)

        img = self._load_image(image_path)
        h, w = img.shape[:2]

        if scale is not None:
            new_w = int(w * scale)
            new_h = int(h * scale)
        elif width is not None and height is not None:
            new_w, new_h = width, height
        elif width is not None:
            ratio = width / w
            new_w = width
            new_h = int(h * ratio)
        elif height is not None:
            ratio = height / h
            new_h = height
            new_w = int(w * ratio)
        else:
            return img  # 没有指定缩放参数，返回原图

        if self._cv2 is not None:
            interpolation = self._cv2.INTER_AREA if (new_w < w or new_h < h) else self._cv2.INTER_CUBIC
            result = self._cv2.resize(img, (new_w, new_h), interpolation=interpolation)
        else:
            from PIL import Image
            if img.ndim == 3:
                pil_img = Image.fromarray(img[:, :, ::-1])
            else:
                pil_img = Image.fromarray(img)
            resample = Image.LANCZOS if (new_w < w) else Image.BICUBIC
            pil_img = pil_img.resize((new_w, new_h), resample)
            result = np.array(pil_img)
            if result.ndim == 3:
                result = result[:, :, ::-1]

        self.cache.put(image_path, params, result)
        return result

    def compare_before_after(self, original: np.ndarray, enhanced: np.ndarray) -> np.ndarray:
        """
        生成原图与增强后图片的左右对比图

        Args:
            original: 原始图片 (numpy array BGR)
            enhanced: 增强后图片 (numpy array BGR)

        Returns:
            左右拼接的对比图 (numpy array BGR)
        """
        if self._cv2 is not None:
            cv2 = self._cv2
            # 确保两张图高度一致
            h1, w1 = original.shape[:2]
            h2, w2 = enhanced.shape[:2]
            target_h = max(h1, h2)

            # 调整高度
            if h1 != target_h:
                ratio = target_h / h1
                original = cv2.resize(original, (int(w1 * ratio), target_h))
                w1 = original.shape[1]
            if h2 != target_h:
                ratio = target_h / h2
                enhanced = cv2.resize(enhanced, (int(w2 * ratio), target_h))
                w2 = enhanced.shape[1]

            # 添加分隔线
            separator_width = 3
            separator = np.ones((target_h, separator_width, 3), dtype=np.uint8) * 128

            # 添加标签
            label_h = 30
            top_bar = np.ones((label_h, w1 + separator_width + w2, 3), dtype=np.uint8) * 200

            comparison = np.hstack([original, separator, enhanced])
            comparison = np.vstack([top_bar, comparison])

            # 添加文字标签
            cv2.putText(comparison, "Original", (10, 22),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
            cv2.putText(comparison, "Enhanced", (w1 + separator_width + 10, 22),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)

            return comparison
        else:
            # Pillow fallback
            from PIL import Image
            if original.ndim == 3:
                orig_pil = Image.fromarray(original[:, :, ::-1])
            else:
                orig_pil = Image.fromarray(original)
            if enhanced.ndim == 3:
                enh_pil = Image.fromarray(enhanced[:, :, ::-1])
            else:
                enh_pil = Image.fromarray(enhanced)

            # 统一高度
            target_h = max(orig_pil.height, enh_pil.height)
            if orig_pil.height != target_h:
                ratio = target_h / orig_pil.height
                orig_pil = orig_pil.resize((int(orig_pil.width * ratio), target_h))
            if enh_pil.height != target_h:
                ratio = target_h / enh_pil.height
                enh_pil = enh_pil.resize((int(enh_pil.width * ratio), target_h))

            separator = Image.new('RGB', (3, target_h), (128, 128, 128))
            combined = Image.new('RGB', (orig_pil.width + 3 + enh_pil.width, target_h))
            combined.paste(orig_pil, (0, 0))
            combined.paste(separator, (orig_pil.width, 0))
            combined.paste(enh_pil, (orig_pil.width + 3, 0))

            return np.array(combined)[:, :, ::-1]

    def analyze_quality(self, image_path: str) -> dict:
        """
        分析图片质量

        Args:
            image_path: 图片文件路径

        Returns:
            质量分析结果字典
        """
        img = self._load_image(image_path)

        if self._cv2 is not None:
            cv2 = self._cv2
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # 模糊度 (Laplacian 方差，越高越清晰)
            blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()

            # 噪声估计
            blur_small = cv2.GaussianBlur(gray, (3, 3), 0)
            noise_est = float(np.std(gray.astype(float) - blur_small.astype(float)))

            # 亮度和对比度
            mean_brightness = float(np.mean(gray))
            std_brightness = float(np.std(gray))

            # 分辨率
            h, w = img.shape[:2]
        else:
            if img.ndim == 3:
                gray = np.mean(img, axis=2)
            else:
                gray = img
            blur_score = float(np.var(np.gradient(gray)))
            noise_est = 0.0
            mean_brightness = float(np.mean(gray))
            std_brightness = float(np.std(gray))
            h, w = img.shape[:2]

        return {
            "blur_score": round(blur_score, 2),
            "noise_estimate": round(noise_est, 2),
            "mean_brightness": round(mean_brightness, 2),
            "contrast": round(std_brightness, 2),
            "resolution": (w, h),
            "is_blurry": blur_score < 100,
            "is_noisy": noise_est > 15,
            "is_low_contrast": std_brightness < 40,
        }

    def save_enhanced(self, image: np.ndarray, output_path: str) -> str:
        """
        保存增强后的图片到指定路径

        Args:
            image: 增强后的图片 (numpy array BGR)
            output_path: 输出文件路径

        Returns:
            保存的文件路径
        """
        return self._save_image(image, output_path)
