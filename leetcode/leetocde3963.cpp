#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    vector<string> createGrid(int m, int n) {
        // 难点：分别处理只有一行或只有一列的情况，
        // 避免按一般情况构造时出现重复的路径部分。
        //
        // 思路：先将所有格子初始化为 '#'。
        // 对于一般情况，把第一列和最后一行改为 '.'，
        // 构造一条从左上角到右下角的 L 形路径。
        vector<string> grid(m, string(n, '#'));
        if (m == 1) {
            return {string(n, '.')}; // 只有一行，整行都是路径
        }
        if (n == 1) {
            return vector<string>(m, "."); // 只有一列，整列都是路径
        }
        // 打通第一列
        for (int i = 0; i < m; i++) {
            grid[i][0] = '.';
        }
        // 打通最后一行
        for (int j = 0; j < n; j++) {
            grid[m - 1][j] = '.';
        }
        return grid;
    }
};
// 难点:兼顾一般网格与单行、单列的特殊情况。
// 思路:一般情况下，将第一列和最后一行设为 '.'，形成 L 形路径；单行或单列时直接将所有格子设为 '.'。
// 时间复杂度:O(mn)，初始化整个网格需要写入 m × n 个字符。
// 空间复杂度:O(mn)，返回的网格占用 m × n 个字符。