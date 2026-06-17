/**
 * AR-009: Command Injection Check Rule
 * 
 * 功能: 检查操作系统命令构造和执行,识别命令注入风险
 * 焦点: 不是告诉AI"什么是命令注入"
 *      而是定义AI"如何检查命令执行"的6步流程
 * 
 * 检查流程:
 *  1. 命令执行入口识别
 *  2. 命令构造方式分析
 *  3. 参数来源追踪
 *  4. 参数净化检查
 *  5. Shell元字符处理
 *  6. 执行环境分析
 */

import {
  AuditRule,
  SeverityLevel,
  EvidenceType,
  LanguageType
} from '../schemas/types';

export const CommandInjectionRule: AuditRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'AR-009',
  name: 'Command Injection Check',
  description: '检查操作系统命令构造和执行逻辑,识别命令注入风险',
  detail: `
本规则的目的是系统化地检查代码中操作系统命令的构造和执行是否存在注入风险。

核心理念:
- 不是问"这是命令注入吗"
- 而是问"命令是否由用户可控数据构造、是否经过Shell解析"

关键问题序列:
1. 代码中有哪些命令执行调用?
2. 命令是如何构造的(字符串拼接、数组、模板)?
3. 命令中的动态参数来自何处?
4. 参数是否经过净化?
5. 命令是否通过Shell执行(导致元字符解析)?
6. 执行环境的权限和限制是什么?
  `,

  // ============================================================================
  // 触发条件
  // ============================================================================

  triggers: {
    patterns: [
      'Java命令执行: Runtime.getRuntime().exec() / ProcessBuilder',
      'Node.js命令执行: child_process.exec() / execSync() / spawn()',
      'Python命令执行: os.system() / subprocess.call() / subprocess.Popen()',
      'PHP命令执行: exec() / system() / passthru() / shell_exec() / backtick运算符',
      'Go命令执行: exec.Command() / exec.CommandContext()',
      'C#命令执行: Process.Start() / ProcessStartInfo',
      '反引号命令: \`command $variable\`'
    ],
    languages: [
      LanguageType.Java,
      LanguageType.JavaScript,
      LanguageType.TypeScript,
      LanguageType.Python,
      LanguageType.CSharp,
      LanguageType.PHP,
      LanguageType.Go
    ],
    frameworks: [
      'Spring',
      'Express',
      'Django',
      'Flask',
      'Laravel',
      'ASP.NET'
    ]
  },

  // ============================================================================
  // 检查流程 (核心!) - 这才是AI需要学习的
  // ============================================================================

  checks: [
    {
      order: 1,
      name: '命令执行入口识别',
      condition: '识别代码中所有调用操作系统命令的入口点',
      questions: [
        '代码中有哪些地方会执行系统命令?',
        '使用了什么命令执行API?',
        '命令执行是同步还是异步?',
        '是否有管道或命令链执行?',
        '是否有脚本文件执行(shell脚本、bat文件)?'
      ],
      failureIndicators: [
        'exec() / system() / shell_exec() 直接调用',
        'Runtime.getRuntime().exec(cmd)',
        'ProcessBuilder 动态参数',
        'subprocess.call(cmd, shell=True)',
        '反引号: \`command ${input}\`',
        'eval() 执行包含命令的字符串',
        '动态脚本生成: writeFile + exec'
      ],
      successIndicators: [
        '使用安全的API: spawn/execFile(参数数组)',
        '命令和参数分离传递',
        '命令执行有明确的白名单限制'
      ],
      criticality: 'must-have'
    },

    {
      order: 2,
      name: '命令构造方式分析',
      condition: '分析命令是如何构造的,是否包含动态拼接',
      questions: [
        '命令是通过什么方式构造的?',
        '是否使用字符串拼接构造命令?',
        '是否使用模板字符串/格式化字符串?',
        '命令是否从配置文件或数据库中读取?',
        '是否使用了命令链(管道、&&、||)?'
      ],
      failureIndicators: [
        '字符串拼接: "ping " + userHost',
        '模板字符串: \`nslookup ${domain}\`',
        '格式化: sprintf("grep %s file", userInput)',
        '动态命令构建: cmd = baseCmd + userInput',
        '命令链: \`cmd1 && cmd2 ${input}\`',
        '管道: \`cat file | grep ${input}\`'
      ],
      successIndicators: [
        '命令和参数作为数组传递: execFile("ping", ["-c", "4", host])',
        '完整命令为硬编码',
        '参数通过安全API绑定'
      ],
      criticality: 'must-have'
    },

    {
      order: 3,
      name: '参数来源追踪',
      condition: '追踪命令中动态参数的来源是否可控',
      questions: [
        '命令中的动态参数来自哪里?',
        '是否来自HTTP请求参数?',
        '是否来自文件上传或文件名?',
        '是否来自环境变量?',
        '参数是否经过多层函数传递?'
      ],
      failureIndicators: [
        '参数来自req.query / req.body / $_GET / $_POST',
        '参数来自文件名: exec("convert " + filename)',
        '参数来自URL路径: /api/ping/:host',
        '参数来自HTTP Header',
        '参数来自用户配置文件'
      ],
      successIndicators: [
        '参数来自硬编码配置',
        '参数来自内部系统生成',
        '参数来自只读数据源'
      ],
      criticality: 'must-have'
    },

    {
      order: 4,
      name: '参数净化检查',
      condition: '检查命令参数是否有安全净化处理',
      questions: [
        '命令参数在执行前是否经过净化?',
        '净化方法是什么(转义、白名单、类型转换)?',
        '净化是否能防御所有注入向量?',
        '净化是在Shell解析之前还是之后?',
        '是否使用了escapeshellarg()或等效函数?'
      ],
      failureIndicators: [
        '无净化直接拼入命令',
        '简单字符串替换: input.replace(";", "")',
        '黑名单过滤(不完整)',
        'HTML编码(对命令注入无效)',
        '客户端验证(可被绕过)',
        '净化在Shell解析之后'
      ],
      successIndicators: [
        'escapeshellarg() / shlex.quote() 正确转义',
        '严格的白名单验证',
        '强类型转换(如整数)',
        '参数与命令分离(数组方式)',
        '多层防护'
      ],
      criticality: 'must-have'
    },

    {
      order: 5,
      name: 'Shell元字符处理',
      condition: '检查是否正确处理了Shell元字符和注入向量',
      questions: [
        '是否处理了所有Shell元字符?',
        '是否考虑了不同Shell的元字符差异?',
        '是否处理了编码注入(%0a、\\x0a等)?',
        '是否处理了命令替换($(cmd)、\`cmd\`)?',
        '是否处理了变量注入($VAR、${VAR})?'
      ],
      failureIndicators: [
        '未处理以下元字符: ; | & $ \` () {} <> \\n \\t',
        '命令替换: $(whoami) / \`whoami\`',
        '换行注入: input%0awhoami',
        '变量注入: ${IFS}whoami',
        'glob注入: * ? []',
        '反斜杠转义绕过',
        'Unicode编码绕过'
      ],
      successIndicators: [
        '所有Shell元字符被正确转义或拒绝',
        '使用参数数组避免Shell解析',
        '输入经过严格白名单验证',
        '不同编码形式的注入向量都被处理'
      ],
      criticality: 'must-have'
    },

    {
      order: 6,
      name: '执行环境分析',
      condition: '分析命令执行环境的权限和限制',
      questions: [
        '命令以什么用户权限执行?',
        '是否有chroot或容器隔离?',
        '是否有Seccomp/AppArmor等系统级限制?',
        '命令执行是否有超时限制?',
        '是否有执行结果过滤(防止信息泄露)?'
      ],
      failureIndicators: [
        '以root/admin权限执行',
        '无容器或沙箱隔离',
        '无超时限制(可用于OOB攻击)',
        '命令输出完整返回给用户',
        'stderr未被处理(可能泄露信息)',
        '工作目录为敏感路径'
      ],
      successIndicators: [
        '以最小权限用户执行',
        '容器或沙箱隔离',
        '有合理的超时设置',
        '输出经过过滤后返回',
        'stderr重定向到/dev/null',
        '工作目录为专用临时目录'
      ],
      criticality: 'nice-to-have'
    }
  ],

  // ============================================================================
  // 证据要求 - 每个发现都必须提供
  // ============================================================================

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: '命令执行代码位置和参数构造逻辑',
      example: `
命令注入:
  文件: src/services/pingService.js
  行号: 10
  代码:
    const { exec } = require('child_process');
    
    function pingHost(host) {
      exec(\`ping -c 4 \${host}\`, (error, stdout) => {  // <- 命令注入
        console.log(stdout);
      });
    }

  文件: app.py
  行号: 25
  代码:
    def lookup_domain(domain):
        os.system(f"nslookup {domain}")  // <- 命令注入,shell=True默认
      `,
      collection_guidance: `标注命令执行调用的文件路径和行号，展示命令构造和参数传递的完整代码，高亮不安全的拼接方式，包括错误处理和输出处理代码。`
    },

    {
      type: EvidenceType.DataFlow,
      required: true,
      description: '从用户输入到命令执行的完整数据流',
      example: `
数据流:
  1. 输入: GET /api/ping?host=8.8.8.8;whoami
  2. 传递: const host = req.query.host;
  3. 构造: \`ping -c 4 \${host}\`
  4. 执行: exec(cmd, callback)
  
  实际执行: ping -c 4 8.8.8.8;whoami
  结果: 先执行ping,再执行whoami
      `,
      collection_guidance: `追踪参数从入口到命令执行的完整路径，标记路径中的每个处理步骤，记录是否有验证或净化。`
    },

    {
      type: EvidenceType.Configuration,
      required: false,
      description: '执行环境配置,如用户权限、容器设置、安全策略',
      example: `
执行环境:
  - 进程运行用户: www-data (低权限)
  - 容器: Docker (有隔离)
  - Seccomp: 默认配置
  - 超时: 无配置
      `,
      collection_guidance: `检查进程运行权限，检查容器或沙箱配置，检查系统级安全策略。`
    }
  ],

  // ============================================================================
  // 修复建议
  // ============================================================================

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: '避免Shell执行,使用参数数组方式',
      code: `
// Node.js - 使用execFile替代exec
const { execFile } = require('child_process');

// 不安全:
exec(\`ping -c 4 \${host}\`, callback);

// 安全:
execFile('ping', ['-c', '4', host], callback);
// host作为独立参数传递,不会被Shell解析

// Python - 使用subprocess替代os.system
import subprocess

# 不安全:
os.system(f"nslookup {domain}")

# 安全:
result = subprocess.run(
    ['nslookup', domain],
    capture_output=True,
    text=True,
    check=True
)

// Java - 使用ProcessBuilder参数数组
// 不安全:
Runtime.getRuntime().exec("ping -c 4 " + host);

// 安全:
ProcessBuilder pb = new ProcessBuilder("ping", "-c", "4", host);
Process p = pb.start();
      `,
      description: '使用参数数组方式传递命令和参数,避免通过Shell解析,从根本上防止命令注入。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.High,
      action: '使用白名单验证和转义函数',
      code: `
// Node.js - 白名单验证
const VALID_HOSTS = ['8.8.8.8', '8.8.4.4', '1.1.1.1'];

function pingHost(host) {
  if (!VALID_HOSTS.includes(host)) {
    throw new Error('Host not allowed');
  }
  execFile('ping', ['-c', '4', host], callback);
}

// Python - shlex.quote转义
import shlex
import subprocess

safe_arg = shlex.quote(user_input)
# 或更好的方式 - 不使用shell=True
subprocess.run(['cmd', user_input])

// PHP - escapeshellarg
$safe_arg = escapeshellarg($user_input);
system("ping -c 4 $safe_arg");
      `,
      description: '对于必须使用动态参数的场景,使用白名单验证或安全转义函数。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.Medium,
      action: '使用高级API替代系统命令',
      code: `
// Node.js - 使用网络库替代ping命令
const dns = require('dns');
const net = require('net');

// 替代ping命令
function checkHost(host) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port: 80, timeout: 5000 });
    socket.on('connect', () => { resolve(true); socket.end(); });
    socket.on('error', () => { resolve(false); });
  });
}

// Python - 使用socket替代系统命令
import socket

def check_host(host, port=80):
    try:
        sock = socket.create_connection((host, port), timeout=5)
        sock.close()
        return True
    except:
        return False

// Java - 使用InetAddress替代ping
InetAddress addr = InetAddress.getByName(host);
boolean reachable = addr.isReachable(5000);
      `,
      description: '优先使用语言内置的高级API替代系统命令调用,消除命令注入风险。',
      difficulty: 'Medium'
    }
  ],

  // ============================================================================
  // 元数据
  // ============================================================================

  default_severity: SeverityLevel.Critical,
  cwe_ids: ['CWE-78'],  // Improper Neutralization of Special Elements used in an OS Command
  owasp_categories: [
    'A03:2021 - Injection',
    'A01:2017 - Injection'
  ],
  created_date: '2026-06-16',
  last_updated: '2026-06-16'
};

export default CommandInjectionRule;
