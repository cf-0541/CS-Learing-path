import type { ExampleDefinition } from './types'

export const examples: ExampleDefinition[] = [
  {
    id: 'house-robber',
    title: '动态规划 · 打家劫舍',
    shortTitle: 'DP 打家劫舍',
    description: '观察 dp[i] 如何读取前两个状态，并选择“跳过”或“拿下”当前房屋。',
    model: 'dp',
    input: '[2, 7, 9, 3, 1]',
    code: `function solve(nums) {
  const dp = Array(nums.length).fill(0);
  dp[0] = nums[0];

  if (nums.length > 1) {
    dp[1] = Math.max(nums[0], nums[1]);
  }

  for (let i = 2; i < nums.length; i++) {
    const skip = dp[i - 1];
    const take = dp[i - 2] + nums[i];
    dp[i] = Math.max(skip, take);
  }

  return dp[nums.length - 1];
}`,
  },
  {
    id: 'segment-tree',
    title: '线段树 · 区间求和',
    shortTitle: '线段树查询',
    description: '先递归建树，再观察查询区间如何完全覆盖、部分相交并向上合并。',
    model: 'segment-tree',
    input: `{
  "values": [2, 1, 5, 3, 4, 7, 6, 8],
  "query": [2, 6]
}`,
    code: `function solve({ values, query }) {
  const tree = Array(values.length * 4).fill(0);

  function build(p, l, r) {
    if (l === r) {
      tree[p] = values[l];
      return tree[p];
    }

    const mid = (l + r) >> 1;
    const left = build(p * 2, l, mid);
    const right = build(p * 2 + 1, mid + 1, r);
    tree[p] = left + right;
    return tree[p];
  }

  function rangeQuery(p, l, r, ql, qr) {
    if (ql <= l && r <= qr) return tree[p];
    if (r < ql || qr < l) return 0;

    const mid = (l + r) >> 1;
    const left = rangeQuery(p * 2, l, mid, ql, qr);
    const right = rangeQuery(p * 2 + 1, mid + 1, r, ql, qr);
    return left + right;
  }

  build(1, 0, values.length - 1);
  return rangeQuery(1, 0, values.length - 1, query[0], query[1]);
}`,
  },
  {
    id: 'bubble-sort',
    title: '数组 · 冒泡排序',
    shortTitle: '冒泡排序',
    description: '相邻元素被读取、比较和交换，已归位的最大值逐轮移动到右侧。',
    model: 'array',
    input: '[7, 3, 5, 1, 6, 2]',
    code: `function solve(arr) {
  for (let end = arr.length - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      if (arr[i] > arr[i + 1]) {
        const temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
      }
    }
  }

  return arr;
}`,
  },
  {
    id: 'grid-paths',
    title: '动态规划 · 网格路径',
    shortTitle: '二维 DP',
    description: '二维表格中的每个状态由上方和左侧状态共同转移而来。',
    model: 'dp',
    input: '{ "rows": 4, "cols": 5 }',
    code: `function solve({ rows, cols }) {
  const dp = Array.from(
    { length: rows },
    () => Array(cols).fill(0)
  );

  for (let r = 0; r < rows; r++) dp[r][0] = 1;
  for (let c = 0; c < cols; c++) dp[0][c] = 1;

  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
    }
  }

  return dp[rows - 1][cols - 1];
}`,
  },
]
