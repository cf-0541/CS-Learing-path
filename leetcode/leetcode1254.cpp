#include <vector>
#include <queue>
#include <utility>
using namespace std;
class Solution {
public:
    int closedIsland(vector<vector<int>>& grid) {
        int m = grid.size();
        int n = grid[0].size();
        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        // 难点：与网格边界相连的陆地不属于封闭岛屿。
        //
        // 思路：先淹没所有与边界相连的陆地；
        // 再遍历内部，每遇到一块未被淹没的陆地，
        // 就找到一个封闭岛屿，并淹没整座岛屿。
        auto flood = [&](int sx, int sy) {
            queue<pair<int, int>> q;
            q.push({sx, sy});
            grid[sx][sy] = 1; // 入队时标记，避免重复入队

            while (!q.empty()) {
                auto [x, y] = q.front();
                q.pop();
                for (auto& d : dirs) {
                    int nx = x + d[0];
                    int ny = y + d[1];
                    if (nx >= 0 && nx < m && ny >= 0 && ny < n &&
                        grid[nx][ny] == 0) {
                        grid[nx][ny] = 1;
                        q.push({nx, ny});
                    }
                }
            }
        };
        // 先淹没所有与边界连通的陆地
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if ((i == 0 || i == m - 1 || j == 0 || j == n - 1) &&
                    grid[i][j] == 0) {
                    flood(i, j);
                }
            }
        }
        int ans = 0;
        // 剩余的陆地都不与边界相连，逐座统计封闭岛屿
        for (int i = 1; i < m - 1; i++) {
            for (int j = 1; j < n - 1; j++) {
                if (grid[i][j] == 0) {
                    ans++;
                    flood(i, j);
                }
            }
        }
        return ans;
    }
};
//难点：区分封闭岛屿和与网格边界相连的陆地。
//思路：使用广度优先搜索，先淹没边界连通的陆地，再统计内部剩余的陆地连通块。
//时间复杂度：O(mn)，每个格子最多被访问常数次。
//空间复杂度：O(mn)，最坏情况下广度优先搜索的队列可能存放大量格子；代码会直接修改原网格。