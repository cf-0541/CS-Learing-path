#include <vector>
using namespace std;
class Solution {
public:
    int sumCounts(vector<int>& nums) {
        // 难点：加入一个新元素后，会同时影响多个以不同位置为左端点的子数组。
        // 需要快速更新这些子数组的不同元素数量，并计算不同元素数量的平方和。
        //
        // 思路：枚举子数组的右端点 j。
        // prev[j] 表示 nums[j - 1] 上一次出现的位置。
        // 当加入 nums[j - 1] 时，左端点在 [prev[j] + 1, j] 范围内的
        // 子数组，其不同元素数量都会增加 1。
        //
        // 如果原来的不同元素数量为 x，那么：
        // (x + 1)² - x² = 2x + 1。
        //
        // 使用两个树状数组实现区间增加和区间求和。
        const int MOD = 1e9 + 7;
        int n = nums.size();
        // prev[i] 表示第 i 个元素上一次出现的位置。
        // 使用从 1 开始的下标，0 表示之前没有出现过。
        vector<int> prev(n + 1, 0);
        // last[v] 表示数值 v 最近一次出现的位置。
        vector<int> last(100001, 0);
        // 计算每个元素上一次出现的位置。
        for (int i = 1; i <= n; i++) {
            int v = nums[i - 1];
            prev[i] = last[v];
            last[v] = i;
        }
        // 使用两个树状数组支持区间增加和区间求和。
        vector<long long> B1(n + 2, 0), B2(n + 2, 0);
        // 树状数组的单点增加操作。
        auto add = [&](vector<long long>& bit, int idx, long long val) {
            while (idx <= n) {
                bit[idx] += val;
                idx += idx & -idx;
            }
        };
        // 查询树状数组中下标 1 到 idx 的前缀和。
        auto sum = [&](vector<long long>& bit, int idx) {
            long long res = 0;
            while (idx > 0) {
                res += bit[idx];
                idx -= idx & -idx;
            }
            return res;
        };
        // 将区间 [l, r] 中的所有不同元素数量增加 v。
        auto bb = [&](int l, int r, long long v) {
            add(B1, l, v);
            add(B1, r + 1, -v);
            add(B2, l, v * (l - 1));
            add(B2, r + 1, -v * r);
        };
        // 查询原数组中下标 1 到 x 的元素总和。
        auto cc = [&](int x) {
            return sum(B1, x) * x - sum(B2, x);
        };
        // 查询区间 [l, r] 中不同元素数量的总和。
        auto dd = [&](int l, int r) {
            return cc(r) - cc(l - 1);
        };
        // SUM 表示以当前 j 为右端点的所有子数组中，
        // 不同元素数量平方的总和。
        long long SUM = 0;
        // ans 表示所有子数组的最终答案。
        long long ans = 0;
        // 枚举子数组的右端点 j。
        for (int j = 1; j <= n; j++) {
            // nums[j - 1] 上一次出现的位置为 prev[j]。
            // 左端点在 [prev[j] + 1, j] 中的子数组，
            // 不同元素数量需要增加 1。
            int L = prev[j] + 1;
            int R = j;
            if (L <= R) {
                // 查询更新之前，区间 [L, R] 中
                // 所有不同元素数量的总和。
                long long S = dd(L, R);
                // 需要更新的子数组数量。
                long long len = R - L + 1;
                // 对每个不同元素数量 x：
                // (x + 1)² - x² = 2x + 1。
                //
                // 因此整个区间平方和的增加量为：
                // 2 * S + len。
                SUM += 2 * S + len;
                // 将区间 [L, R] 中的不同元素数量全部增加 1。
                bb(L, R, 1);
            }
            // 累加以 j 为右端点的所有子数组的贡献。
            ans = (ans + SUM) % MOD;
        }
        return (int)ans;
    }
};
//难点：加入新元素后，需要同时更新多个子数组的不同元素数量，并计算更新后的平方和。
//思路：通过 prev[j] 找到当前元素上一次出现的位置，将区间 [prev[j] + 1, j] 中的不同元素数量加 1。使用公式 (x + 1)² - x² = 2x + 1 更新平方和，并通过两个树状数组实现区间增加和区间求和。
//时间复杂度：O(n log n)，每个元素都会进行常数次树状数组查询和更新，每次操作需要 O(log n)。
//空间复杂度：O(n + V)，其中 V = 100000，用于保存元素最近出现位置；在固定值域下可以记为 O(n)。