class Solution {
public:
    int fib(int n) {
        int prve0 = 0;
        int prve1 = 1;
        for(int i = 1 ; i <= n ; i++){
            int cur = prve0 + prve1;
            prve1 = prve0;
            prve0 = cur;
        }
        return prve0;
    }
};
//作为dp的入门题目，斐波那契函数与台阶问题是一样的做法甚至不需要修改代码就可以提交
//这一类的题目目的就是引入dp这一概念为后续做题提供基础