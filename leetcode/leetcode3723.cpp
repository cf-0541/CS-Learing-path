class Solution {
public:
	string maxSumOfSquares(int n, int s) {
		if (n * 9 < s) return "";
		string ans(s / 9, '9');
		if (s % 9) {
			ans += s % 9 + '0';
		}
		return ans + string(n - ans.size(), '0');
	}
};
