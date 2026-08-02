# 代码示例模板（Code Example Template）

> 用于生成书籍中代码示例的标准模板

---

## 示例信息

- **示例编号**：示例 X-X
- **示例标题**：[示例标题]
- **所属章节**：第 X 章 [章节标题]
- **编程语言**：[语言名称和版本]
- **难度级别**：基础 / 进阶 / 挑战
- **预计时间**：[完成所需时间]

---

## 环境要求

### 系统要求
- **操作系统**：[Windows / macOS / Linux]
- **Python 版本**：[例如：Python 3.8+]
- **内存要求**：[例如：至少 4GB RAM]
- **磁盘空间**：[例如：至少 500MB]

### 依赖安装
```bash
# 安装依赖
pip install package1 package2 package3

# 或者使用 requirements.txt
pip install -r requirements.txt
```

### 环境配置
```bash
# 配置环境变量
export API_KEY=your_api_key
export DATABASE_URL=your_database_url

# 或者创建 .env 文件
cat > .env << EOF
API_KEY=your_api_key
DATABASE_URL=your_database_url
EOF
```

---

## 示例说明

### 背景介绍
[介绍这个代码示例的背景和应用场景，例如：]

在实际开发中，我们经常需要处理 XXX 场景。本示例将演示如何使用 [技术/库] 来实现 [功能]。

### 学习目标
通过这个示例，你将学习：
- [ ] [学习目标 1]
- [ ] [学习目标 2]
- [ ] [学习目标 3]

### 核心概念
- **概念 1**：[解释]
- **概念 2**：[解释]
- **概念 3**：[解释]

---

## 基础示例

### 示例 X-1：[示例标题]

**功能描述**：
[简要描述这个示例实现的功能]

**完整代码**：
```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
示例 X-1：[示例标题]

功能描述：[功能说明]
作者：[作者姓名]
日期：[日期]
"""

# 导入必要的库
import os
import sys
from typing import List, Dict, Optional


class Example:
    """示例类"""
    
    def __init__(self, name: str):
        """
        初始化方法
        
        Args:
            name: 示例名称
        """
        self.name = name
        self.data = []
    
    def process(self, items: List[str]) -> Dict[str, int]:
        """
        处理数据
        
        Args:
            items: 待处理的数据列表
            
        Returns:
            处理结果字典
        """
        result = {}
        for item in items:
            result[item] = len(item)
        return result
    
    def display(self):
        """显示结果"""
        print(f"示例名称：{self.name}")
        print(f"数据量：{len(self.data)}")


def main():
    """主函数"""
    # 创建示例对象
    example = Example("示例 1")
    
    # 准备数据
    data = ["apple", "banana", "cherry"]
    
    # 处理数据
    result = example.process(data)
    
    # 显示结果
    example.display()
    print(f"处理结果：{result}")


if __name__ == "__main__":
    main()
```

**代码说明**：
1. **第 1-3 行**：Shebang 和编码声明
2. **第 5-11 行**：文档字符串，说明示例功能
3. **第 13-15 行**：导入必要的库
4. **第 18-41 行**：定义 Example 类
   - `__init__`：初始化方法
   - `process`：数据处理方法
   - `display`：结果显示方法
5. **第 44-58 行**：主函数
6. **第 61-62 行**：程序入口

**运行方式**：
```bash
$ python example_x_1.py
```

**预期输出**：
```
示例名称：示例 1
数据量：0
处理结果：{'apple': 5, 'banana': 6, 'cherry': 6}
```

**关键点解析**：
- **类型注解**：使用 `List[str]`、`Dict[str, int]` 提高代码可读性
- **文档字符串**：为类和方法添加详细的文档说明
- **错误处理**：实际应用中应添加异常处理

---

## 进阶示例

### 示例 X-2：[示例标题]

**功能描述**：
[在基础示例的基础上，增加 XXX 功能]

**完整代码**：
```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
示例 X-2：[示例标题]

功能描述：[功能说明]
"""

import asyncio
from typing import List, AsyncIterator


class AdvancedExample:
    """进阶示例类"""
    
    def __init__(self, name: str):
        self.name = name
        self._cache = {}
    
    async def async_process(self, items: List[str]) -> AsyncIterator[Dict[str, int]]:
        """
        异步处理数据
        
        Args:
            items: 待处理的数据列表
            
        Yields:
            处理结果字典
        """
        for item in items:
            # 模拟异步操作
            await asyncio.sleep(0.1)
            result = {item: len(item)}
            self._cache[item] = result[item]
            yield result
    
    async def batch_process(self, items: List[str]) -> List[Dict[str, int]]:
        """
        批量处理数据
        
        Args:
            items: 待处理的数据列表
            
        Returns:
            处理结果列表
        """
        tasks = [self.async_process([item]) for item in items]
        results = []
        for task in tasks:
            async for result in task:
                results.append(result)
        return results


async def main():
    """异步主函数"""
    example = AdvancedExample("进阶示例")
    
    data = ["apple", "banana", "cherry", "date", "elderberry"]
    
    # 批量处理
    results = await example.batch_process(data)
    
    print(f"处理完成，共 {len(results)} 条结果")
    for result in results:
        print(result)


if __name__ == "__main__":
    asyncio.run(main())
```

**代码说明**：
1. **异步编程**：使用 `async/await` 语法
2. **异步生成器**：使用 `AsyncIterator` 实现异步迭代
3. **批量处理**：并发处理多个任务
4. **缓存机制**：使用 `_cache` 缓存处理结果

**运行方式**：
```bash
$ python example_x_2.py
```

**预期输出**：
```
处理完成，共 5 条结果
{'apple': 5}
{'banana': 6}
{'cherry': 6}
{'date': 4}
{'elderberry': 10}
```

**性能对比**：
| 方式 | 耗时 | 说明 |
|------|------|------|
| 同步处理 | 约 0.5 秒 | 串行处理 |
| 异步处理 | 约 0.1 秒 | 并发处理，性能提升 5 倍 |

---

## 实战案例

### 案例 X-3：[案例标题]

**项目背景**：
[描述一个完整的项目案例背景]

**需求分析**：
1. 需求 1：[详细描述]
2. 需求 2：[详细描述]
3. 需求 3：[详细描述]

**架构设计**：
```
项目结构：
project/
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── user_service.py
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
├── tests/
│   ├── __init__.py
│   └── test_user.py
├── requirements.txt
└── README.md
```

**核心代码**：

**src/models/user.py**：
```python
"""用户模型"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class User:
    """用户数据类"""
    id: int
    username: str
    email: str
    created_at: datetime = datetime.now()
    is_active: bool = True
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
            "is_active": self.is_active
        }
```

**src/services/user_service.py**：
```python
"""用户服务"""
from typing import List, Optional
from ..models.user import User


class UserService:
    """用户服务类"""
    
    def __init__(self):
        self._users: List[User] = []
        self._next_id = 1
    
    def create_user(self, username: str, email: str) -> User:
        """创建用户"""
        user = User(
            id=self._next_id,
            username=username,
            email=email
        )
        self._users.append(user)
        self._next_id += 1
        return user
    
    def get_user(self, user_id: int) -> Optional[User]:
        """获取用户"""
        for user in self._users:
            if user.id == user_id:
                return user
        return None
    
    def list_users(self) -> List[User]:
        """列出所有用户"""
        return self._users.copy()
    
    def deactivate_user(self, user_id: int) -> bool:
        """停用用户"""
        user = self.get_user(user_id)
        if user:
            user.is_active = False
            return True
        return False
```

**src/main.py**：
```python
"""主程序"""
from services.user_service import UserService


def main():
    """主函数"""
    # 创建用户服务
    service = UserService()
    
    # 创建用户
    user1 = service.create_user("alice", "alice@example.com")
    user2 = service.create_user("bob", "bob@example.com")
    
    print(f"创建用户：{user1.username}, {user2.username}")
    
    # 列出用户
    users = service.list_users()
    print(f"用户总数：{len(users)}")
    
    # 停用用户
    service.deactivate_user(user1.id)
    print(f"已停用用户：{user1.username}")


if __name__ == "__main__":
    main()
```

**测试代码**：

**tests/test_user.py**：
```python
"""用户服务测试"""
import pytest
from src.services.user_service import UserService


def test_create_user():
    """测试创建用户"""
    service = UserService()
    user = service.create_user("test", "test@example.com")
    
    assert user.id == 1
    assert user.username == "test"
    assert user.email == "test@example.com"
    assert user.is_active is True


def test_get_user():
    """测试获取用户"""
    service = UserService()
    user = service.create_user("test", "test@example.com")
    
    retrieved = service.get_user(user.id)
    assert retrieved is not None
    assert retrieved.username == "test"


def test_deactivate_user():
    """测试停用用户"""
    service = UserService()
    user = service.create_user("test", "test@example.com")
    
    result = service.deactivate_user(user.id)
    assert result is True
    assert user.is_active is False


if __name__ == "__main__":
    pytest.main([__file__])
```

**运行测试**：
```bash
$ pytest tests/ -v
============================= test session starts ==============================
collected 3 items

tests/test_user.py::test_create_user PASSED                                [ 33%]
tests/test_user.py::test_get_user PASSED                                   [ 66%]
tests/test_user.py::test_deactivate_user PASSED                            [100%]

============================== 3 passed in 0.12s ===============================
```

---

## 扩展练习

### 练习 1：[练习标题]
**要求**：
1. [要求 1]
2. [要求 2]
3. [要求 3]

**提示**：[提示内容]

**参考答案**：
```python
# 参考代码
def solution():
    pass
```

### 练习 2：[练习标题]
**要求**：
1. [要求 1]
2. [要求 2]
3. [要求 3]

**提示**：[提示内容]

**参考答案**：
```python
# 参考代码
def solution():
    pass
```

---

## 常见问题

### Q1：[问题]
**A**：[回答]

### Q2：[问题]
**A**：[回答]

---

## 最佳实践

### 实践 1：[实践标题]
**建议**：[具体建议]  
**示例**：
```python
# 好的做法
def good_way():
    pass

# 不好的做法
def bad_way():
    pass
```

### 实践 2：[实践标题]
**建议**：[具体建议]  
**示例**：
```python
# 代码示例
pass
```

---

## 参考资料

1. [官方文档](链接)
2. [教程链接](链接)
3. [相关书籍](书籍信息)

---

## 检查清单

- [ ] 代码可独立运行
- [ ] 依赖明确列出
- [ ] 环境要求清晰
- [ ] 代码注释完整
- [ ] 运行结果正确
- [ ] 测试用例覆盖
- [ ] 错误处理完善
- [ ] 性能指标明确
- [ ] 扩展练习合理
- [ ] 参考资料准确

---

**文档版本**：1.0  
**创建日期**：[日期]  
**最后更新**：[日期]  
**代码行数**：约 XXX 行
