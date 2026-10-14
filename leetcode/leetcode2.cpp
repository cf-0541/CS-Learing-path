class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        // 难点：两个链表的长度可能不同，并且每一位相加时可能产生进位；
        // 最高位相加结束后，也可能还剩一个进位需要创建新节点。
        //
        // 思路：模拟竖式加法，从低位到高位依次相加。
        // 使用 carry 保存进位，使用虚拟头节点简化结果链表的构建。
        ListNode dummy(0);
        ListNode* cur = &dummy;
        int carry = 0;
        // 只要还有未处理的节点或进位，就继续计算。
        while (l1 || l2 || carry) {
            // 某个链表已经遍历结束时，将这一位看作 0。
            int sum = carry
                    + (l1 ? l1->val : 0)
                    + (l2 ? l2->val : 0);
            // 保存新的进位，并将当前位加入结果链表。
            carry = sum / 10;
            cur->next = new ListNode(sum % 10);
            cur = cur->next;
            //如果l1或l2还有节点指针后移。
            if (l1) l1 = l1->next;
            if (l2) l2 = l2->next;
        }
        return dummy.next;
    }
};
题目难点：处理两个链表长度不同、逐位进位以及最后可能剩余的进位。
思路：模拟竖式加法，逐位计算 当前位之和 + carry，用虚拟头节点构建结果链表。
时间复杂度：O(max(m, n))，其中 m、n 是两个链表的长度。
空间复杂度：结果链表占用 O(max(m, n))；如果不计算返回结果所占空间，额外空间为 O(1)。