#include <vector>
using namespace std;
class Solution {
public:
    vector<int> targetIndices(vector<int>& nums, int target) {
        // 难点：不必真的排序，也能确定 target 排序后的下标。
        //
        // 思路：排序后，小于 target 的元素一定排在它前面，
        // 等于 target 的元素则会连续出现。
        // 因此，只需统计小于 target 的元素个数 less，
        // 以及等于 target 的元素个数 cnt。
        int less = 0;
        int cnt = 0;
        for (int x : nums) {
            if (x < target) {
                less++;
            } else if (x == target) {
                cnt++;
            }
        }
        vector<int> ans;
        // target 排序后的下标依次为 less 到 less + cnt - 1
        for (int i = 0; i < cnt; i++) {
            ans.push_back(less + i);
        }
        return ans;
    }
};
//难点：确定 target 在排序后的所有下标，同时避免实际排序。
//思路：统计小于 target 的元素个数 less 和等于 target 的元素个数 cnt，答案就是从 less 开始的连续 cnt 个下标。
//时间复杂度：O(n)，遍历数组并生成答案。
//空间复杂度：O(k)，其中 k 是答案中的下标个数；如果不计算返回的答案，额外空间为 O(1)。