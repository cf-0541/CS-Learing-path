#include <string>
#include <algorithm>
using namespace std;
class Solution {
public:
    int countDaysTogether(string arriveAlice, string leaveAlice,
                          string arriveBob, string leaveBob) {
        // 难点：日期是字符串，不方便直接计算两个日期相差的天数。
        //
        // 思路：先把每个日期转换为一年中的第几天，
        // 再求 Alice 和 Bob 停留时间区间的交集。
        int days[] = {0, 31, 28, 31, 30, 31, 30,
                      31, 31, 30, 31, 30, 31};

        auto toDay = [&](const string& s) {
            int month = stoi(s.substr(0, 2));
            int day = stoi(s.substr(3, 2));
            int res = 0;
            for (int m = 1; m < month; m++) {
                res += days[m]; // 累加当前月份之前的天数
            }
            return res + day;
        };
        int a1 = toDay(arriveAlice);
        int a2 = toDay(leaveAlice);
        int b1 = toDay(arriveBob);
        int b2 = toDay(leaveBob);
        // 共同停留区间的起点取较晚的到达日，终点取较早的离开日
        int start = max(a1, b1);
        int end = min(a2, b2);
        // 两人当天到达或离开也算共同停留，因此需要 +1；
        // 若区间没有交集，则返回 0
        return max(0, end - start + 1);
    }
};
//难点：将日期转换为可比较的天数，并正确计算包含到达日和离开日的区间交集。
//思路：把四个日期转换为一年中的第几天，取较晚的到达日和较早的离开日，计算两者之间的天数。
//时间复杂度：O(1)，每次日期转换最多遍历 12 个月。
//空间复杂度：O(1)，只使用固定大小的月份数组和常数个变量。