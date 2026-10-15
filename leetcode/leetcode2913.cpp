#include <vector>
#include <unordered_set>
using namespace std;
class Solution {
public:
    int sumCounts(vector<int>& nums) {
        // 难点：需要枚举所有子数组，并计算每个子数组中不同元素的数量。
        // 如果每次都重新统计，会产生额外的遍历开销。
        //
        // 思路：固定子数组的左端点 i，然后不断向右扩展右端点 j。
        // 使用 unordered_set 维护当前子数组 nums[i...j] 中的不同元素，
        // 集合的大小就是不同元素的数量，将其平方累加到答案中。
        int n = nums.size();
        int ans = 0;

        // 枚举子数组的左端点
        for (int i = 0; i < n; i++) {
            unordered_set<int> distinctElements;

            // 枚举子数组的右端点
            for (int j = i; j < n; j++) {
                // 将新元素加入当前子数组的不同元素集合
                distinctElements.insert(nums[j]);

                // 集合大小就是当前子数组中不同元素的数量
                int distinctCount = distinctElements.size();

                // 累加不同元素数量的平方
                ans += distinctCount * distinctCount;
            }
        }
        return ans;
    }
};
难点：枚举所有子数组的同时，需要快速统计每个子数组中不同元素的数量。
思路：固定左端点并向右扩展子数组，使用哈希集合维护当前子数组中的不同元素，将集合大小的平方累加到答案中。
时间复杂度：O(n²)，使用两层循环枚举所有子数组，unordered_set 的插入操作平均为 O(1)。
空间复杂度：O(n)，哈希集合最多保存 n 个不同元素。