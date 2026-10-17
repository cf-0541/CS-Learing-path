#include <vector>
#include <numeric>
#include <algorithm>
using namespace std;
class Solution {
public:
    int minSwaps(vector<int>& nums) {
        // 难点：需要先确定每个元素排序后的目标位置，
        // 然后计算将当前排列变为目标排列所需的最少交换次数。
        //
        // 思路：
        // 1. 计算每个元素的数位和；
        // 2. 按照“数位和优先，元素值次之”的规则排序下标；
        // 3. 使用 pos 记录每个原下标对应的目标位置；
        // 4. 将位置变化看成一个置换，统计其中的置换环；
        // 5. 长度为 len 的置换环需要 len - 1 次交换。
        int n = nums.size();
        // 计算每个数的数位和
        // digitSum[i] 表示 nums[i] 的数位和。
        vector<int> digitSum(n);
        for (int i = 0; i < n; i++) {
            int x = nums[i], s = 0;
            // 逐位取出数字，并累加每一位。
            while (x > 0) {
                s += x % 10;
                x /= 10;
            }
            digitSum[i] = s;
        }
        // 按 (数位和, 数值) 升序排序，idx 保存原下标。
        vector<int> idx(n);
        // idx = [0, 1, ..., n - 1]
        iota(idx.begin(), idx.end(), 0);
        // 不直接修改 nums，而是根据排序规则对原下标进行排序。
        sort(idx.begin(), idx.end(), [&](int i, int j) {
            // 数位和不同时，数位和较小的元素排在前面。
            if (digitSum[i] != digitSum[j]) {
                return digitSum[i] < digitSum[j];
            }
            // 数位和相同时，数值较小的元素排在前面。
            return nums[i] < nums[j];
        });
        // pos[i] 表示原下标 i 的元素在排序后数组中的位置。
        vector<int> pos(n);
        for (int p = 0; p < n; p++) {
            pos[idx[p]] = p;
        }
        // 统计置换环。
        // visited[i] 表示位置 i 是否已经被某个置换环访问过。
        vector<bool> visited(n, false);
        // 记录最少交换次数。
        int swaps = 0;
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                int cur = i;
                // 记录当前置换环的长度。
                int len = 0;
                // 沿着“当前位置应该移动到的目标位置”不断遍历。
                while (!visited[cur]) {
                    visited[cur] = true;
                    // 沿着置换关系移动到下一个位置。
                    cur = pos[cur];

                    len++;
                }
                // 长度为 len 的置换环，
                // 最少需要 len - 1 次交换才能恢复正确顺序。
                if (len > 1) {
                    swaps += len - 1;
                }
            }
        }
        return swaps;
    }
};
//难点：将元素按照“数位和、元素值”排序后，需要确定每个元素应该移动到的位置，并计算恢复目标顺序所需的最少交换次数。
//思路：对原下标 idx 排序，通过 pos[i] 建立“原位置到目标位置”的置换关系。将置换分解成多个环，长度为 len 的环需要 len - 1 次交换。
//时间复杂度：O(n log n + nD)，其中 D 是数字的最大位数。计算数位和需要 O(nD)，排序需要 O(n log n)，统计置换环需要 O(n)；通常可以简写为 O(n log n)。
//空间复杂度：O(n)，需要使用 digitSum、idx、pos 和 visited 数组。