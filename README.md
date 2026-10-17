# CS Learning Path

这是一个用于记录计算机科学与算法学习过程的个人仓库。目前内容以 **LeetCode 题解** 为主，使用 C++ 和 Java 编写，并在代码中记录题目难点、解题思路以及时间、空间复杂度。

## 当前内容

- **14 个源代码文件**，覆盖 **13 个 LeetCode 题号**
- 主要语言：C++、Java
- 已涉及的知识点：
  - 数组与哈希表
  - 链表模拟
  - 贪心算法
  - 排序与置换环
  - 基础动态规划
  - 滚动数组空间优化
  - 树状数组与区间更新

## 目录结构

```text
CS-Learing-path/
├─ .vscode/                    # VS Code 配置
├─ leetcode/
│  ├─ dp/                      # 动态规划及相关优化题目
│  │  ├─ leetcode70.cpp
│  │  ├─ leetcode70.java
│  │  ├─ leetcode198.cpp
│  │  ├─ leetcode509.cpp
│  │  ├─ leetocde740.cpp
│  │  ├─ leetcode746.cpp
│  │  ├─ leetcode1137.cpp
│  │  └─ leetcode2916.cpp
│  ├─ leetcode1.java
│  ├─ leetcode2.cpp
│  ├─ leetcode123.cpp
│  ├─ leetcode2913.cpp
│  ├─ leetcode3551.cpp
│  └─ leetcode3723.cpp
└─ README.md
```

## 题目索引

### 基础题目

| 题号 | 文件 | 语言 | 主要思路 |
| ---: | --- | :---: | --- |
| 1 | [`leetcode/leetcode1.java`](leetcode/leetcode1.java) | Java | 哈希表查找补数 |
| 2 | [`leetcode/leetcode2.cpp`](leetcode/leetcode2.cpp) | C++ | 链表与竖式加法模拟 |
| 123 | [`leetcode/leetcode123.cpp`](leetcode/leetcode123.cpp) | C++ | 股票价格相邻上涨差值的贪心累加 |
| 2913 | [`leetcode/leetcode2913.cpp`](leetcode/leetcode2913.cpp) | C++ | 枚举子数组，使用哈希集合统计不同元素 |
| 3551 | [`leetcode/leetcode3551.cpp`](leetcode/leetcode3551.cpp) | C++ | 按数位和排序，使用置换环计算最少交换次数 |
| 3723 | [`leetcode/leetcode3723.cpp`](leetcode/leetcode3723.cpp) | C++ | 从高位开始构造数字的贪心算法 |

### 动态规划与数据结构

| 题号 | 文件 | 语言 | 主要思路 |
| ---: | --- | :---: | --- |
| 70 | [`leetcode/dp/leetcode70.cpp`](leetcode/dp/leetcode70.cpp) | C++ | 爬楼梯，滚动变量优化空间 |
| 70 | [`leetcode/dp/leetcode70.java`](leetcode/dp/leetcode70.java) | Java | 爬楼梯，滚动变量优化空间 |
| 198 | [`leetcode/dp/leetcode198.cpp`](leetcode/dp/leetcode198.cpp) | C++ | 打家劫舍，选择或跳过当前房屋 |
| 509 | [`leetcode/dp/leetcode509.cpp`](leetcode/dp/leetcode509.cpp) | C++ | 斐波那契数列与滚动状态 |
| 740 | [`leetcode/dp/leetocde740.cpp`](leetcode/dp/leetocde740.cpp) | C++ | 删除并获得点数，当前文件待补充完整题解 |
| 746 | [`leetcode/dp/leetcode746.cpp`](leetcode/dp/leetcode746.cpp) | C++ | 使用前两个状态计算最小爬楼花费 |
| 1137 | [`leetcode/dp/leetcode1137.cpp`](leetcode/dp/leetcode1137.cpp) | C++ | 泰波那契数列，维护前三个状态 |
| 2916 | [`leetcode/dp/leetcode2916.cpp`](leetcode/dp/leetcode2916.cpp) | C++ | 上次出现位置、树状数组、区间增加与区间求和 |

## 重点算法笔记

### 滚动数组优化

部分动态规划题目的当前状态只依赖前一个或前几个状态，因此不需要保存完整的 `dp` 数组。例如：

```text
dp[i] = dp[i - 1] + dp[i - 2]
```

只需使用两个变量保存 `dp[i - 1]` 和 `dp[i - 2]`，即可将空间复杂度从 `O(n)` 优化为 `O(1)`。

相关题目：

- 70. 爬楼梯
- 198. 打家劫舍
- 509. 斐波那契数
- 746. 使用最小花费爬楼梯
- 1137. 第 N 个泰波那契数

### 置换环与最少交换次数

将每个元素的原位置映射到排序后的目标位置，就会形成一个置换。对于长度为 `len` 的置换环，至少需要：

```text
len - 1
```

次交换才能将环内元素移动到正确位置。

相关题目：[`leetcode3551.cpp`](leetcode/leetcode3551.cpp)。

### 树状数组维护区间信息

在 [`leetcode2916.cpp`](leetcode/dp/leetcode2916.cpp) 中，两棵树状数组共同支持：

- 区间增加
- 区间求和

枚举右端点时，树状数组维护每个左端点对应子数组的不同元素数量，再利用：

```text
(x + 1)² - x² = 2x + 1
```

快速更新所有相关子数组的平方和，将时间复杂度优化到 `O(n log n)`。

## 代码说明

仓库中的代码主要按照 LeetCode 提交格式保存：

```cpp
class Solution {
public:
    // 题目要求的方法
};
```

因此部分 C++ 文件没有单独提供 `main` 函数、标准库头文件或 LeetCode 已定义的数据结构，例如 `ListNode`。这些文件可以直接复制到对应题目的 LeetCode 编辑器中运行。

如需在本地独立编译，需要根据题目补充：

- 必要的标准库头文件
- `main` 测试函数
- 链表、二叉树等数据结构定义
- 测试输入与输出

## 学习记录规范

题解文件尽量包含以下内容：

1. **难点**：题目最需要理解的部分；
2. **思路**：算法选择和状态定义；
3. **实现**：关键变量与状态转移的注释；
4. **时间复杂度**：算法运行时间随输入规模的变化；
5. **空间复杂度**：额外使用的数据结构和内存；
6. **题目链接**：方便重新阅读题目和复习。

## 仓库地址

[GitHub：cf-0541/CS-Learing-path](https://github.com/cf-0541/CS-Learing-path)
