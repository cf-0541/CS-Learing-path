class Solution {
public:
    string maxSumOfSquares(int n, int s) {
        // 难点：在 n 位数字的限制下分配数位，既要满足数位和为 s，
        // 又要尽量让高位更大。贪心地优先放 9，至多再放一个余数，其余补 0。
        // 若 s 超过 n 位所能达到的最大数位和 9*n，则无解。
        if (n * 9 < s) return "";
        // 先放 s / 9 个 9，让高位尽可能大。
        string ans(s / 9, '9');
        // 若有余数，紧接着放一个非 0 数位。
        if (s % 9) {
            ans += s % 9 + '0';
        }
        // 补足 n 位；补 0 不会改变数位和。
        return ans + string(n - ans.size(), '0');
    }
};
我的思路是贪心地从高位开始尽量放 9，再放一个余数，剩下的位置补 0。这样得到满足数位和条件的最大数字。
复杂度：时间复杂度 O(n)，因为需要构造长度为 n 的字符串；空间复杂度 O(n)，用于存放结果。
// 题目链接：https://leetcode.cn/problems/maximize-sum-of-squares-of-digits/
