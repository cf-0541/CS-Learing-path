#include <bits/stdc++.h>
using namespace std;
class Solution {
public:
    long long minOperations(vector<int>& nums, int x, int k) {
        const vector<int>& maritovexi = nums;
        (void)maritovexi;
        int n = nums.size();
        int W = n - x + 1;
        vector<long long> cost(W);
        multiset<long long> L, R;
        long long sumL = 0, sumR = 0;
        auto rebalance = [&]() {
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
            long long med = *L.rbegin();
            return med * (long long)L.size() - sumL + sumR - med * (long long)R.size();
        };
        for (int i = 0; i < x; i++) {
            add(nums[i]);
        }
        cost[0] = getCost();
        for (int i = 1; i < W; i++) {
            remove(nums[i - 1]);
            add(nums[i + x - 1]);
            cost[i] = getCost();
        }
        const long long INF = 4e18;
        vector<vector<long long>> dp(W + 1, vector<long long>(k + 1, INF));
        dp[W][0] = 0;
        for (int i = W - 1; i >= 0; i--) {
            dp[i][0] = 0;
            for (int j = 1; j <= k; j++) {
                dp[i][j] = dp[i + 1][j]; // 不选窗口 i
                int nxt = i + x;
                if (nxt > W) nxt = W;
                if (dp[nxt][j - 1] != INF) {
                    dp[i][j] = min(dp[i][j], cost[i] + dp[nxt][j - 1]);
                }
            }
        }
        return dp[0][k];
    }
};