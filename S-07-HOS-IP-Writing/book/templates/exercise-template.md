# 练习题模板（Exercise Template）

> 用于生成书籍中练习题的标准模板

---

## 练习信息

- **所属章节**：第 X 章 [章节标题]
- **练习总数**：[总题数]
- **总分**：[总分]
- **预计时间**：[完成所需时间]
- **难度分布**：基础 X% / 进阶 X% / 挑战 X%

---

## 一、选择题（每题 2 分，共 20 分）

### 题目 1
**题目**：[题目内容]

**选项**：
- A. [选项 A]
- B. [选项 B]
- C. [选项 C]
- D. [选项 D]

**答案**：[正确答案]  
**解析**：[详细解析，说明为什么选这个答案，其他选项为什么错]  
**知识点**：[对应的知识点]  
**难度**：⭐

---

### 题目 2
**题目**：[题目内容]

**选项**：
- A. [选项 A]
- B. [选项 B]
- C. [选项 C]
- D. [选项 D]

**答案**：[正确答案]  
**解析**：[详细解析]  
**知识点**：[对应的知识点]  
**难度**：⭐

---

### 题目 3
**题目**：[题目内容]

**选项**：
- A. [选项 A]
- B. [选项 B]
- C. [选项 C]
- D. [选项 D]

**答案**：[正确答案]  
**解析**：[详细解析]  
**知识点**：[对应的知识点]  
**难度**：⭐

---

### 题目 4（多选题）
**题目**：[题目内容]（多选）

**选项**：
- A. [选项 A]
- B. [选项 B]
- C. [选项 C]
- D. [选项 D]

**答案**：[正确答案，如：ABC]  
**解析**：[详细解析]  
**知识点**：[对应的知识点]  
**难度**：⭐⭐

---

### 题目 5
**题目**：[题目内容]

**选项**：
- A. [选项 A]
- B. [选项 B]
- C. [选项 C]
- D. [选项 D]

**答案**：[正确答案]  
**解析**：[详细解析]  
**知识点**：[对应的知识点]  
**难度**：⭐

---

## 二、填空题（每空 2 分，共 20 分）

### 题目 1
**题目**：在 Python 中，使用 `______` 关键字可以定义一个类，使用 `______` 方法可以初始化对象。

**答案**：`class`；`__init__`  
**解析**：[详细解析]  
**知识点**：[对应的知识点]  
**难度**：⭐

---

### 题目 2
**题目**：列表推导式的语法格式为 `[______ for item in ______ if ______]`。

**答案**：`表达式`；`可迭代对象`；`条件表达式`  
**解析**：[详细解析]  
**知识点**：[对应的知识点]  
**难度**：⭐

---

### 题目 3
**题目**：在异步编程中，使用 `______` 关键字可以暂停协程的执行，使用 `______` 关键字可以等待异步任务完成。

**答案**：`await`；`async`  
**解析**：[详细解析]  
**知识点**：[对应的知识点]  
**难度**：⭐⭐

---

### 题目 4
**题目**：装饰器本质上是一个 `______`，它接受一个 `______` 作为参数，并返回一个新的 `______`。

**答案**：`函数`；`函数`；`函数`  
**解析**：[详细解析]  
**知识点**：[对应的知识点]  
**难度**：⭐⭐

---

### 题目 5
**题目**：Python 中的 GIL（全局解释器锁）确保了同一时刻只有 `______` 个线程执行 Python 字节码。

**答案**：`一` 或 `1`  
**解析**：[详细解析]  
**知识点**：[对应的知识点]  
**难度**：⭐⭐⭐

---

## 三、判断题（每题 2 分，共 10 分）

### 题目 1
**题目**：Python 中的列表（list）是不可变类型。（ ）

**答案**：×（错误）  
**解析**：列表是可变类型，可以修改、添加、删除元素。不可变类型包括元组（tuple）、字符串（str）、数字（int/float）等。  
**知识点**：[对应的知识点]  
**难度**：⭐

---

### 题目 2
**题目**：使用 `async def` 定义的函数会返回一个协程对象。（ ）

**答案**：√（正确）  
**解析**：`async def` 定义的异步函数会返回协程对象，需要使用 `await` 或事件循环来执行。  
**知识点**：[对应的知识点]  
**难度**：⭐

---

### 题目 3
**题目**：Python 支持多重继承，但建议使用组合而非继承来实现代码复用。（ ）

**答案**：√（正确）  
**解析**：虽然 Python 支持多重继承，但容易引发菱形继承等问题，因此推荐使用组合或混入（Mixin）模式。  
**知识点**：[对应的知识点]  
**难度**：⭐⭐

---

### 题目 4
**题目**：在 Python 中，所有参数都是按值传递的。（ ）

**答案**：×（错误）  
**解析**：Python 参数传递既不是纯粹的按值传递，也不是按引用传递，而是"按对象引用传递"（pass by object reference）。  
**知识点**：[对应的知识点]  
**难度**：⭐⭐⭐

---

### 题目 5
**题目**：使用 `with` 语句可以自动管理资源，确保文件正确关闭。（ ）

**答案**：√（正确）  
**解析**：`with` 语句实现了上下文管理协议，可以自动管理资源，确保即使发生异常也能正确释放资源。  
**知识点**：[对应的知识点]  
**难度**：⭐

---

## 四、简答题（每题 5 分，共 20 分）

### 题目 1
**题目**：简述 Python 中的垃圾回收机制。

**答案要点**：
1. **引用计数**：Python 主要使用引用计数机制，当对象的引用计数为 0 时，对象被销毁
2. **标记 - 清除**：用于解决循环引用问题，定期扫描对象图，标记不可达对象并清除
3. **分代回收**：将对象分为三代，新创建的对象为第一代，存活时间越长代数越高，回收频率越低

**评分标准**：
- 提到引用计数（2 分）
- 提到标记 - 清除（2 分）
- 提到分代回收（1 分）

**知识点**：[对应的知识点]  
**难度**：⭐⭐

---

### 题目 2
**题目**：解释什么是装饰器，并给出一个实际应用场景。

**答案要点**：
1. **定义**：装饰器是一个函数，它接受另一个函数作为参数，并返回一个新的函数
2. **作用**：在不修改原函数代码的情况下，动态地增加功能
3. **应用场景**：
   - 日志记录
   - 权限验证
   - 性能测试
   - 缓存机制
4. **示例代码**：
```python
def timer_decorator(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 执行耗时：{end - start:.4f}秒")
        return result
    return wrapper

@timer_decorator
def slow_function():
    import time
    time.sleep(1)
```

**评分标准**：
- 正确解释装饰器概念（2 分）
- 给出应用场景（2 分）
- 代码示例正确（1 分）

**知识点**：[对应的知识点]  
**难度**：⭐⭐

---

### 题目 3
**题目**：比较同步编程和异步编程的优缺点。

**答案要点**：

| 特性 | 同步编程 | 异步编程 |
|------|----------|----------|
| 执行方式 | 顺序执行，阻塞等待 | 非阻塞，并发执行 |
| 适用场景 | I/O 密集度低、逻辑简单 | I/O 密集度高、高并发 |
| 性能 | 单线程性能受限 | 高并发性能好 |
| 复杂度 | 简单直观 | 相对复杂 |
| 调试难度 | 容易 | 较难 |

**评分标准**：
- 正确比较执行方式（2 分）
- 说明适用场景（2 分）
- 其他对比（1 分）

**知识点**：[对应的知识点]  
**难度**：⭐⭐

---

### 题目 4
**题目**：什么是上下文管理器？如何使用 `with` 语句？

**答案要点**：
1. **定义**：上下文管理器是实现 `__enter__` 和 `__exit__` 方法的对象
2. **作用**：用于资源管理，确保资源正确释放
3. **使用方式**：
```python
# 方式 1：类实现
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
    
    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.file.close()

with FileManager('test.txt', 'w') as f:
    f.write('Hello')

# 方式 2：contextlib 模块
from contextlib import contextmanager

@contextmanager
def file_manager(filename, mode):
    f = open(filename, mode)
    try:
        yield f
    finally:
        f.close()

with file_manager('test.txt', 'w') as f:
    f.write('Hello')
```

**评分标准**：
- 正确解释上下文管理器（2 分）
- 给出使用示例（2 分）
- 代码正确（1 分）

**知识点**：[对应的知识点]  
**难度**：⭐⭐

---

## 五、编程题（共 30 分）

### 题目 1（基础，10 分）
**题目**：实现一个函数，判断一个字符串是否是回文（正读和反读相同）。

**要求**：
1. 忽略大小写
2. 忽略空格和标点符号
3. 返回 True 或 False

**示例**：
```python
is_palindrome("A man a plan a canal Panama")  # 返回 True
is_palindrome("Hello World")  # 返回 False
```

**参考答案**：
```python
import re

def is_palindrome(s: str) -> bool:
    """
    判断字符串是否是回文
    
    Args:
        s: 输入字符串
        
    Returns:
        bool: 是否是回文
    """
    # 移除空格和标点符号，转换为小写
    cleaned = re.sub(r'[^a-zA-Z0-9]', '', s).lower()
    
    # 判断是否等于其反转
    return cleaned == cleaned[::-1]


# 测试
if __name__ == "__main__":
    print(is_palindrome("A man a plan a canal Panama"))  # True
    print(is_palindrome("Hello World"))  # False
```

**评分标准**：
- 函数定义正确（2 分）
- 正确处理大小写（2 分）
- 正确处理空格和标点（3 分）
- 逻辑正确（3 分）

**知识点**：字符串处理、正则表达式  
**难度**：⭐

---

### 题目 2（进阶，10 分）
**题目**：实现一个简单的 LRU（最近最少使用）缓存。

**要求**：
1. 实现 `get(key)` 和 `put(key, value)` 方法
2. 缓存容量固定，超出容量时淘汰最久未使用的数据
3. 时间复杂度要求：`get` 和 `put` 均为 O(1)

**示例**：
```python
cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))  # 返回 1
cache.put(3, 3)      # 淘汰 key=2
print(cache.get(2))  # 返回 -1（不存在）
```

**参考答案**：
```python
from collections import OrderedDict

class LRUCache:
    """LRU 缓存实现"""
    
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()
    
    def get(self, key: int) -> int:
        """获取缓存值"""
        if key not in self.cache:
            return -1
        # 移动到末尾（最近使用）
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key: int, value: int) -> None:
        """添加或更新缓存"""
        if key in self.cache:
            # 已存在，移动到末尾
            self.cache.move_to_end(key)
        self.cache[key] = value
        
        # 超出容量，淘汰最久未使用
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)


# 测试
if __name__ == "__main__":
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    print(cache.get(1))  # 1
    cache.put(3, 3)
    print(cache.get(2))  # -1
```

**评分标准**：
- 类定义正确（2 分）
- `get` 方法实现正确（3 分）
- `put` 方法实现正确（3 分）
- 时间复杂度满足 O(1)（2 分）

**知识点**：数据结构、缓存算法  
**难度**：⭐⭐

---

### 题目 3（挑战，10 分）
**题目**：实现一个异步的网页爬虫，能够并发抓取多个 URL。

**要求**：
1. 使用 `aiohttp` 和 `asyncio`
2. 支持并发抓取（可配置并发数）
3. 处理异常情况（超时、网络错误等）
4. 返回抓取结果（URL、状态码、内容长度）

**示例**：
```python
urls = [
    "https://example.com",
    "https://httpbin.org/get",
    "https://github.com"
]

results = await async_crawl(urls, max_concurrent=3)
# 返回：[{"url": "...", "status": 200, "length": 1234}, ...]
```

**参考答案**：
```python
import asyncio
import aiohttp
from typing import List, Dict
import time


async def fetch_url(session: aiohttp.ClientSession, url: str, semaphore: asyncio.Semaphore) -> Dict:
    """抓取单个 URL"""
    async with semaphore:
        try:
            start_time = time.time()
            async with session.get(url, timeout=10) as response:
                content = await response.text()
                return {
                    "url": url,
                    "status": response.status,
                    "length": len(content),
                    "time": time.time() - start_time,
                    "error": None
                }
        except Exception as e:
            return {
                "url": url,
                "status": None,
                "length": 0,
                "time": time.time() - start_time,
                "error": str(e)
            }


async def async_crawl(urls: List[str], max_concurrent: int = 5) -> List[Dict]:
    """
    异步并发抓取多个 URL
    
    Args:
        urls: URL 列表
        max_concurrent: 最大并发数
        
    Returns:
        抓取结果列表
    """
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url, semaphore) for url in urls]
        results = await asyncio.gather(*tasks)
        
        return results


# 测试
async def main():
    urls = [
        "https://example.com",
        "https://httpbin.org/get",
        "https://github.com"
    ]
    
    results = await async_crawl(urls, max_concurrent=3)
    
    for result in results:
        if result["error"]:
            print(f"❌ {result['url']}: {result['error']}")
        else:
            print(f"✅ {result['url']}: {result['status']}, {result['length']} bytes, {result['time']:.2f}s")


if __name__ == "__main__":
    asyncio.run(main())
```

**评分标准**：
- 异步函数定义正确（2 分）
- 使用 Semaphore 控制并发（3 分）
- 异常处理完善（3 分）
- 返回结果格式正确（2 分）

**知识点**：异步编程、网络爬虫、并发控制  
**难度**：⭐⭐⭐

---

## 六、综合实践题（附加题，20 分）

### 题目：实现一个完整的命令行工具

**背景**：
你需要开发一个命令行工具，用于管理待办事项（Todo List）。

**功能要求**：
1. 添加待办事项：`todo add "买牛奶"`
2. 列出所有待办：`todo list`
3. 标记完成：`todo done 1`
4. 删除待办：`todo remove 1`
5. 数据持久化（保存到文件）

**技术要求**：
1. 使用 `argparse` 或 `click` 库
2. 使用 JSON 文件存储数据
3. 良好的错误处理
4. 友好的用户界面

**参考答案**：
```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
待办事项管理工具
"""

import argparse
import json
import os
from datetime import datetime
from typing import List, Dict


class TodoManager:
    """待办事项管理器"""
    
    def __init__(self, filename: str = "todos.json"):
        self.filename = filename
        self.todos: List[Dict] = []
        self.load()
    
    def load(self):
        """从文件加载数据"""
        if os.path.exists(self.filename):
            with open(self.filename, 'r', encoding='utf-8') as f:
                self.todos = json.load(f)
    
    def save(self):
        """保存数据到文件"""
        with open(self.filename, 'w', encoding='utf-8') as f:
            json.dump(self.todos, f, ensure_ascii=False, indent=2)
    
    def add(self, title: str) -> int:
        """添加待办事项"""
        todo = {
            "id": len(self.todos) + 1,
            "title": title,
            "done": False,
            "created_at": datetime.now().isoformat()
        }
        self.todos.append(todo)
        self.save()
        return todo["id"]
    
    def list(self) -> List[Dict]:
        """列出所有待办"""
        return self.todos
    
    def done(self, todo_id: int) -> bool:
        """标记完成"""
        for todo in self.todos:
            if todo["id"] == todo_id:
                todo["done"] = True
                self.save()
                return True
        return False
    
    def remove(self, todo_id: int) -> bool:
        """删除待办"""
        for i, todo in enumerate(self.todos):
            if todo["id"] == todo_id:
                self.todos.pop(i)
                self.save()
                return True
        return False


def main():
    parser = argparse.ArgumentParser(description="待办事项管理工具")
    subparsers = parser.add_subparsers(dest="command", help="命令")
    
    # add 命令
    add_parser = subparsers.add_parser("add", help="添加待办事项")
    add_parser.add_argument("title", help="待办标题")
    
    # list 命令
    subparsers.add_parser("list", help="列出所有待办")
    
    # done 命令
    done_parser = subparsers.add_parser("done", help="标记完成")
    done_parser.add_argument("id", type=int, help="待办 ID")
    
    # remove 命令
    remove_parser = subparsers.add_parser("remove", help="删除待办")
    remove_parser.add_argument("id", type=int, help="待办 ID")
    
    args = parser.parse_args()
    manager = TodoManager()
    
    if args.command == "add":
        todo_id = manager.add(args.title)
        print(f"✅ 已添加待办 #{todo_id}: {args.title}")
    
    elif args.command == "list":
        todos = manager.list()
        if not todos:
            print("📭 暂无待办事项")
        else:
            print("📋 待办事项列表：")
            for todo in todos:
                status = "✅" if todo["done"] else "⏳"
                print(f"  {status} #{todo['id']}: {todo['title']}")
    
    elif args.command == "done":
        if manager.done(args.id):
            print(f"✅ 已标记 #{args.id} 为完成")
        else:
            print(f"❌ 未找到 #{args.id}")
    
    elif args.command == "remove":
        if manager.remove(args.id):
            print(f"🗑️ 已删除 #{args.id}")
        else:
            print(f"❌ 未找到 #{args.id}")
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
```

**使用示例**：
```bash
$ python todo.py add "买牛奶"
✅ 已添加待办 #1: 买牛奶

$ python todo.py add "写报告"
✅ 已添加待办 #2: 写报告

$ python todo.py list
📋 待办事项列表：
  ⏳ #1: 买牛奶
  ⏳ #2: 写报告

$ python todo.py done 1
✅ 已标记 #1 为完成

$ python todo.py list
📋 待办事项列表：
  ✅ #1: 买牛奶
  ⏳ #2: 写报告

$ python todo.py remove 2
🗑️ 已删除 #2
```

**评分标准**：
- 命令行参数解析正确（4 分）
- 数据持久化实现（4 分）
- 功能完整（4 分）
- 错误处理（4 分）
- 用户体验（4 分）

**知识点**：命令行工具、文件 I/O、JSON 处理  
**难度**：⭐⭐⭐

---

## 参考答案汇总

### 选择题答案
1. [答案] - [知识点]
2. [答案] - [知识点]
3. [答案] - [知识点]
4. [答案] - [知识点]
5. [答案] - [知识点]

### 填空题答案
1. [答案] - [知识点]
2. [答案] - [知识点]
3. [答案] - [知识点]
4. [答案] - [知识点]
5. [答案] - [知识点]

### 判断题答案
1. [答案] - [知识点]
2. [答案] - [知识点]
3. [答案] - [知识点]
4. [答案] - [知识点]
5. [答案] - [知识点]

---

## 检查清单

- [ ] 题目表述清晰准确
- [ ] 答案正确无误
- [ ] 解析详细完整
- [ ] 难度分布合理
- [ ] 知识点覆盖全面
- [ ] 分值分配合理
- [ ] 编程题可运行
- [ ] 代码示例规范
- [ ] 评分标准明确
- [ ] 无歧义和错误

---

**文档版本**：1.0  
**创建日期**：[日期]  
**最后更新**：[日期]  
**总题数**：[X] 题  
**总分**：[X] 分
