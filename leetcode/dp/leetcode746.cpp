class Solution {
public:
    int minCostClimbingStairs(vector<int>& cost) {
        // 难点：到达楼梯顶部时，可以从前一级走一步到达，
        // 也可以从前两级走两步到达，需要选择花费更小的方案。
        //
        // 思路：使用动态规划。
        // 定义 dp[i] 表示到达第 i 级位置所需要的最小花费。
        // 到达第 i 级有两种方式：
        // 1. 从第 i - 1 级走一步，需要支付 cost[i - 1]；
        // 2. 从第 i - 2 级走两步，需要支付 cost[i - 2]。
        //
        // 状态转移方程：
        // dp[i] = min(dp[i - 1] + cost[i - 1],
        //             dp[i - 2] + cost[i - 2])。
        //
        // 楼梯顶部的位置为 n，不需要支付额外费用。
        int n = cost.size();
        // prev1 表示到达第 i - 1 级的最小花费
        // prev2 表示到达第 i - 2 级的最小花费
        // 可以从第 0 级或第 1 级开始，因此初始花费都是 0
        int prev1 = 0;
        int prev2 = 0;
        for (int i = 2; i <= n; i++) {
            // 比较从前一级和前两级到达当前位置的花费
            int cur = min(prev1 + cost[i - 1],prev2 + cost[i - 2]);
            // 滚动更新动态规划状态
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
};
//难点：理解到达第 i 级时，可以从第 i - 1 级走一步，也可以从第 i - 2 级走两步，并且需要支付离开位置对应的 cost。
//思路：使用动态规划，状态转移方程为 dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])，并使用两个变量进行空间优化。
//时间复杂度：O(n)，从第 2 级遍历到楼梯顶部 n。
//空间复杂度：O(1)，只使用 prev1、prev2 和 cur 等常数个额外变量。
// 题目链接：https://leetcode.cn/problems/min-cost-climbing-stairs/
