class Solution {
public:
    int tribonacci(int n) {
        // 难点：当前的泰波那契数由前面三个数共同决定，
        // 需要正确维护并更新前三个状态。
        //
        // 思路：使用动态规划。
        // 泰波那契数的递推关系为：
        // T(n) = T(n - 1) + T(n - 2) + T(n - 3)。
        // 使用 prev1、prev2 和 prev3 保存前三个状态，
        // 避免创建完整的动态规划数组。
        // 处理三个初始状态
        if (n == 0) return 0;           // T(0) = 0
        if (n == 1 || n == 2) return 1; // T(1) = T(2) = 1
        // prev3 表示 T(i - 3)
        // prev2 表示 T(i - 2)
        // prev1 表示 T(i - 1)
        int prev3 = 0;
        int prev2 = 1;
        int prev1 = 1;
        for (int i = 3; i <= n; i++) {
            // 根据前三个泰波那契数计算当前值
            int cur = prev3 + prev2 + prev1;
            // 滚动更新三个动态规划状态
            prev3 = prev2;
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
};
//难点：当前泰波那契数依赖前面三个数，需要正确保存和滚动更新这三个状态。
//思路：使用动态规划，根据递推公式 T(n) = T(n - 1) + T(n - 2) + T(n - 3) 计算结果，并使用三个变量进行空间优化。
//时间复杂度：O(n)，从 3 遍历到 n，每次计算一个泰波那契数。
//空间复杂度：O(1)，只使用 prev1、prev2、prev3 和 cur 等常数个额外变
// 题目链接：https://leetcode.cn/problems/n-th-tribonacci-number/
