import java.util.HashMap;
import java.util.Map;
class Solution {
    public int[] twoSum(int[] nums, int target) {
        // 难点：需要快速找到与当前数字相加等于 target 的另一个数字，
        // 同时保证不能重复使用同一个数组元素。
        //
        // 思路：使用哈希表保存已经遍历过的数字及其下标。
        // 遍历到 nums[i] 时，计算需要的另一个数字 need；
        // 如果 need 已经在哈希表中，就找到了符合条件的两个下标。
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            // 先查找再插入，可以避免当前元素与自身配对。
            if (map.containsKey(need)) {
                return new int[] {map.get(need), i};
            }
            // 保存当前数字及其下标，供后面的元素查询。
            map.put(nums[i], i);
        }
        // 题目通常保证存在答案；这里返回空数组处理未找到的情况。
        return new int[0];
    }
}
难点：在避免重复使用同一元素的同时，高效地找到目标数字的补数。
思路：使用哈希表记录已经遍历过的数字及其下标。对于当前数字 nums[i]，查询 target - nums[i] 是否已经出现。
时间复杂度：平均为 O(n)，只需要遍历一次数组，哈希表查询和插入平均为 O(1)。
空间复杂度：O(n)，最坏情况下需要将数组中的元素存入哈希表。