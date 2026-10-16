class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // 难点：可以进行多次交易，需要判断怎样选择买入和卖出时机，
        // 才能获得最大总利润，并且同一时间只能持有一只股票。
        //
        // 思路：使用贪心算法。只要今天的价格高于昨天，
        // 就把这段上涨带来的利润加入答案。
        // 所有相邻上涨差值之和，等价于在每段上涨区间的最低点买入、
        // 最高点卖出，因此能够获得最大利润。
        int ans = 0;
        for (int i = 1; i < prices.size(); i++) {
            // 捕获 prices[i - 1] 到 prices[i] 之间的上涨利润。
            if (prices[i] > prices[i - 1]) {
                ans += prices[i] - prices[i - 1];
            }
        }
        return ans;
    }
};
题目难点：理解多次交易时，不必寻找完整的最低点和最高点，只需累加每一段上涨利润。
思路：贪心遍历价格数组，将所有正的相邻价格差加入答案。
时间复杂度：O(n)，只遍历一次数组。
空间复杂度：O(1)，只使用常数个额外变量。
// 题目链接：https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iii/
