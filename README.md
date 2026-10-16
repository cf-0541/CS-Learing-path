# Algorithm Motion Lab

一个由**真实代码执行轨迹**驱动的算法动态可视化原型。编辑 JavaScript 与 JSON 输入后，系统会自动插桩、在 Web Worker 中执行程序，并把数组读写、DP 状态转移、递归调用和线段树区间过程编译为可逐步播放的动画。

## 功能

- JavaScript 算法代码与 JSON 输入在线编辑
- Babel AST 自动插桩，无需手写动画步骤
- Web Worker 独立执行，带 2.5 秒超时与 20,000 事件上限
- 自动识别或手动选择可视化模型
  - 数组 / 排序
  - 一维与二维动态规划
  - 线段树构建与区间查询
- 代码逐行高亮
- 读取、写入、条件分支、函数调用、递归层级与返回值展示
- 播放 / 暂停、单步前进后退、时间轴拖动、倍速切换
- 内置打家劫舍、二维网格路径、冒泡排序和线段树示例

## 运行

需要 Node.js 与 pnpm。

```powershell
cd C:\Users\lmy\Documents\GitHub\CS-Learing-path
pnpm install
pnpm dev
```

打开终端中 Vite 输出的本地地址，通常为 `http://localhost:5173`。

生产构建与测试：

```powershell
pnpm build
pnpm test
```

## 自定义算法约定

程序必须提供同步入口：

```js
function solve(input) {
  // 算法逻辑
  return result
}
```

输入框内容必须是合法 JSON，并会作为 `input` 原样传给 `solve`。例如：

```json
[7, 3, 5, 1]
```

为了获得更清晰的自动模型识别效果：

- 数组算法直接操作输入数组，或使用普通数组变量；
- DP 状态表建议命名为 `dp`、`memo` 或 `f`；
- 线段树数组建议命名为 `tree`，递归函数建议携带 `p`、`l`、`r` 区间参数；
- 如自动识别不符合预期，可在顶部手动切换模型。

当前原型只支持**同步 JavaScript**，不支持 `async`、Promise 或模块导入。

## 工作原理

```text
用户代码 + JSON 输入
        ↓
Babel AST 插桩
        ↓
Web Worker 执行
        ↓
RuntimeEvent[] 执行轨迹
        ↓
模型识别 + 状态快照编译
        ↓
React / SVG 动画播放器
```

插桩产生的核心事件包括：

- `line`：执行到某一行
- `track`：发现可观察对象或数组
- `read` / `write`：读取或写入数据结构
- `branch`：条件判断结果
- `call` / `return`：函数进入、递归深度与返回
- `done` / `error`：执行结束或失败

## 颜色语义

- 青色：当前读取或依赖
- 紫色：当前写入
- 绿色：完成或完全覆盖
- 橙色：递归路径或部分覆盖

## 目录

```text
src/
├─ components/        # 编辑器、播放器及三类可视化场景
├─ instrumentation/   # Babel AST 插桩
├─ runtime/           # Worker 执行器与 Proxy 轨迹采集
├─ trace/             # 模型识别、轨迹编译与状态回放
├─ tests/             # 插桩与轨迹测试
├─ App.tsx
├─ examples.ts
└─ styles.css
```

## 安全说明

Web Worker、超时和事件上限用于隔离界面并终止失控计算，但它们**不是面向恶意代码的安全沙箱**。请只运行自己信任的代码，不要把该原型直接用于执行第三方不可信脚本。
