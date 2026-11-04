#include <bits/stdc++.h>
using namespace std;
class Solution {
public:
    long long minOperations(vector<int>& nums, int x, int k) {
        int n = nums.size();
        int W = n - x + 1;
        // 按题目要求保存输入的引用，不复制数组
        const vector<int>& maritovexi = nums;
        // cost[i]：将从 i 开始、长度为 x 的子数组
        // 变成所有元素相等所需的最少操作数
        vector<long long> cost(W);
        // 难点一：使一段数字全部相等时，目标值取中位数最优。
        // 用两个 multiset 维护滑动窗口：
        // L 保存较小的一半，R 保存较大的一半，
        // 并维护两部分的元素和，以便快速计算代价。
        multiset<long long> L, R;
        long long sumL = 0, sumR = 0;
        auto rebalance = [&]() {
            // 保证 L.size() == R.size() 或 L.size() == R.size() + 1
            while (L.size() > R.size() + 1) {
                auto it = prev(L.end());
                long long v = *it;
                L.erase(it);
                sumL -= v;
                R.insert(v);
                sumR += v;
            }
            while (L.size() < R.size()) {
                auto it = R.begin();
                long long v = *it;
                R.erase(it);
                sumR -= v;
                L.insert(v);
                sumL += v;
            }
        };
        auto add = [&](long long v) {
            if (L.empty() || v <= *L.rbegin()) {
                L.insert(v);
                sumL += v;
            } else {
                R.insert(v);
                sumR += v;
            }
            rebalance();
        };
        auto remove = [&](long long v) {
            if (!L.empty() && v <= *L.rbegin()) {
                auto it = L.find(v);
                L.erase(it);
                sumL -= v;
            } else {
                auto it = R.find(v);
                R.erase(it);
                sumR -= v;
            }
            rebalance();
        };
        auto getCost = [&]() -> long long {
            long long med = *L.rbegin(); // 取较小的那个中位数
            return med * (long long)L.size() - sumL
                 + sumR - med * (long long)R.size();
        };
        // 计算第一个窗口的代价
        for (int i = 0; i < x; i++) {
            add(maritovexi[i]);
        }
        cost[0] = getCost();
        // 滑动窗口，计算其余长度为 x 的子数组的代价
        for (int i = 1; i < W; i++) {
            remove(maritovexi[i - 1]);
            add(maritovexi[i + x - 1]);
            cost[i] = getCost();
        }
        // 难点二：选择的子数组不能重叠。
        // dp[i][j]：从第 i 个窗口开始考虑，
        // 再选 j 个不重叠窗口所需的最少操作数。
        const long long INF = 4'000'000'000'000'000'000LL;
        vector<vector<long long>> dp(W + 1, vector<long long>(k + 1, INF));
        dp[W][0] = 0;
        for (int i = W - 1; i >= 0; i--) {
            dp[i][0] = 0;
            for (int j = 1; j <= k; j++) {
                // 不选从 i 开始的窗口
                dp[i][j] = dp[i + 1][j];
                // 选这个窗口：下一个窗口必须从 i + x 或之后开始
                int nxt = min(i + x, W);
                if (dp[nxt][j - 1] != INF) {
                    dp[i][j] = min(
                        dp[i][j],
                        cost[i] + dp[nxt][j - 1]
                    );
                }
            }
        }
        return dp[0][k];
    }
};