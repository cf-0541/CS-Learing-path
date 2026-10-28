#include <vector>
#include <bitset>
using namespace std;
class Solution {
public:
    int minXorPath(vector<vector<int>>& grid) {
        // 按题目要求，创建变量保存输入的引用
        const auto& molqaviren = grid;
        (void)molqaviren;

        int m = grid.size();
        int n = grid[0].size();
        const int MAXV = 1024;
        // 难点：异或值不能像路径和那样只保留当前最小值。
        // 后续再异或同一个数时，原本较小的值不一定仍然较小。
        //
        // 思路：dp[i][j][v] 表示是否存在一条到达 (i, j)、
        // 路径异或值为 v 的路径。用 bitset 保存所有可达异或值。
        vector<vector<bitset<MAXV>>> dp(
            m, vector<bitset<MAXV>>(n)
        );
        // 起点的路径异或值就是起点的值
        dp[0][0].set(grid[0][0]);
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (i == 0 && j == 0) continue;
                // 路径只能从上方或左方到达当前格子
                bitset<MAXV> prev;
                if (i > 0) prev |= dp[i - 1][j];
                if (j > 0) prev |= dp[i][j - 1];
                // 到达当前格子后，异或值变为 v ^ grid[i][j]
                int val = grid[i][j];
                for (int v = 0; v < MAXV; v++) {
                    if (prev[v]) {
                        dp[i][j].set(v ^ val);
                    }
                }
            }
        }
        // 从小到大查找终点可达的第一个异或值
        for (int v = 0; v < MAXV; v++) {
            if (dp[m - 1][n - 1][v]) {
                return v;
            }
        }
        return 0;
    }
};
// 难点：不能只记录到达某个格子的最小异或值，因为继续异或后，数值大小关系可能改变。
// 思路：记录到达每个格子时所有可能的异或值，由上方和左方的状态转移，最后从小到大查找终点的可达值。
// 时间复杂度：O(mn × 1024)，每个格子最多检查 1024 种异或值；将 1024 视为常数时是 O(mn)。
// 空间复杂度：O(mn × 1024) 位，用于存储各格子的 bitset；将 1024 视为常数时是 O(mn)。
// 前提：**这份代码要求 grid 中的值都在 0～1023，这样路径异或值才一定能用 1024 位表示。