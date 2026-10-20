#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int sortableIntegers(vector<int>& nums) {
        int n = nums.size();
        // 保留题目要求的变量；它引用原数组，不会复制数据
        const vector<int>& qelvarodin = nums;
        (void)qelvarodin;
        // 排序后的数组用于确定每个块最终应包含哪些元素
        vector<int> sorted_nums = nums;
        sort(sorted_nums.begin(), sorted_nums.end());
        // 难点：一个长度为 k 的块能否通过循环旋转变成
        // 最终有序数组中对应的那一段？
        //
        // 思路：k 必须是 n 的因子。对每个长度为 k 的块检查：
        // 1. 环形相邻元素中的下降次数是否不超过 1，
        //    即这个块能否通过旋转变为非递减序列；
        // 2. 块内元素与最终有序数组对应位置的元素是否相同。
        vector<int> factors;
        for (int i = 1; i * i <= n; i++) {
            if (n % i == 0) {
                factors.push_back(i);
                if (i * i != n) factors.push_back(n / i);
            }
        }
        int maxVal = 0;
        for (int x : nums) maxVal = max(maxVal, x);

        // 复用计数数组，比较两个块的元素组成
        vector<int> cnt(maxVal + 1, 0);
        long long ans = 0;
        for (int k : factors) {
            bool ok = true;
            int blocks = n / k;

            for (int b = 0; b < blocks; b++) {
                int start = b * k;
                // 把块首尾也视为相邻，统计环形下降次数
                int down = 0;
                for (int i = 0; i < k; i++) {
                    int cur = nums[start + i];
                    int nxt = nums[start + (i + 1) % k];
                    if (cur > nxt) down++;
                }
                if (down > 1) {
                    ok = false;
                    break;
                }
                // 统计当前块中的元素
                vector<int> used;
                for (int i = 0; i < k; i++) {
                    int v = nums[start + i];
                    if (cnt[v] == 0) used.push_back(v);
                    cnt[v]++;
                }
                // 用有序数组对应块中的元素抵消计数
                bool block_ok = true;
                for (int i = 0; i < k; i++) {
                    int v = sorted_nums[start + i];
                    if (cnt[v] == 0) {
                        block_ok = false;
                        break;
                    }
                    cnt[v]--;
                }
                // 若仍有剩余元素，说明两个块的元素组成不同
                if (block_ok) {
                    for (int v : used) {
                        if (cnt[v] != 0) {
                            block_ok = false;
                            break;
                        }
                    }
                }
                // 清理当前块使用过的计数，供下一个块复用
                for (int v : used) cnt[v] = 0;

                if (!block_ok) {
                    ok = false;
                    break;
                }
            }
            // 长度 k 可行，将 k 计入答案
            if (ok) ans += k;
        }

        return (int)ans;
    }
};
//难点：既要判断每个块能否通过旋转变为有序状态，也要确保块中的元素属于最终有序数组的对应位置。
//思路：枚举 n 的所有因子 k，逐块检查环形下降次数和元素组成；所有块都符合条件时，将 k 加入答案。
//时间复杂度：O(n log n + M + n·d(n))，其中 M = max(nums) + 1，d(n) 为 n 的因子个数。排序、初始化计数数组，以及逐个因子检查分别产生这三部分开销。
//空间复杂度：O(n + M)，用于有序数组、计数数组等；这里按 nums 中的值可作为非负下标分析。