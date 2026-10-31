#include <vector>
#include <functional>
using namespace std;
class Solution {
public:
    int uniquePaths(vector<vector<int>>& grid) {
        const int MOD = 1e9 + 7;
        int m = grid.size(), n = grid[0].size();
        // 按题目要求保存输入的引用，不复制网格
        const auto& vornadexil = grid;
        (void)vornadexil;
        // 难点：遇到障碍物后，移动方向会改变；
        // 连续遇到障碍物时，需要继续追踪，直到到达空格或越界。
        //
        // 思路：用 g 计算从障碍物出发最终到达的位置，
        // 并记忆化相同的“障碍物位置 + 移动方向”状态。
        // -2：尚未计算；-1：最终越界；其他值：目标格子的编号。
        vector<vector<vector<int>>> memoG(
            m, vector<vector<int>>(n, vector<int>(2, -2))
        );
        // dir = 0 表示从当前障碍物向下走，dir = 1 表示向右走
        function<int(int, int, int)> g = [&](int x, int y, int dir) -> int {
            int& res = memoG[x][y][dir];
            if (res != -2) return res;
            int nx, ny;
            if (dir == 0) {
                nx = x + 1;
                ny = y;
            } else {
                nx = x;
                ny = y + 1;
            }
            if (nx >= m || ny >= n) {
                return res = -1;
            }
            if (grid[nx][ny] == 0) {
                return res = nx * n + ny;
            }
            // 再次遇到障碍物，改变方向并继续寻找
            return res = g(nx, ny, 1 - dir);
        };
        // 从空格 (i, j) 选择一个初始方向，寻找最终到达的空格
        // 此处 dir = 0 表示先向右，dir = 1 表示先向下
        auto f = [&](int i, int j, int dir) -> int {
            int tx, ty;
            if (dir == 0) {
                tx = i;
                ty = j + 1;
            } else {
                tx = i + 1;
                ty = j;
            }
            if (tx >= m || ty >= n) return -1;
            if (grid[tx][ty] == 0) return tx * n + ty;
            // 向右遇障碍则改向下；向下遇障碍则改向右
            return g(tx, ty, dir);
        };
        // dp[i][j]：到达空格 (i, j) 的路径数
        vector<vector<int>> dp(m, vector<int>(n, 0));
        dp[0][0] = 1;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (dp[i][j] == 0) continue;

                // 分别尝试先向右和先向下
                for (int dir = 0; dir < 2; dir++) {
                    int pos = f(i, j, dir);
                    if (pos == -1) continue;

                    int ni = pos / n;
                    int nj = pos % n;
                    dp[ni][nj] = (dp[ni][nj] + dp[i][j]) % MOD;
                }
            }
        }
        return dp[m - 1][n - 1];
    }
};
//难点：遇到连续障碍物时，方向可能多次改变；不能只检查相邻的一个格子。
//思路：用记忆化搜索确定每种“障碍物位置＋移动方向”的最终去向，再用动态规划累计到达各空格的路径数。
//时间复杂度：O(mn)。网格有 mn 个格子，每个障碍物最多有两种方向状态，且每种状态只计算一次。
// 空间复杂度：O(mn)，用于记忆化数组和动态规划数组；递归调用栈最多为 O(m+n)。