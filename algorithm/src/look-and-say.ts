/**
 * 개미수열 (Look and Say Sequence)
 *
 * 이전 항을 "읽는 대로" 다음 항을 만드는 수열이다.
 * 이웃한 같은 숫자를 묶고, 「개수 + 숫자」를 이어붙인다.
 *
 *   L1 = 1
 *   L2 = 11          앞의 1은 '1개의 1'
 *   L3 = 21          앞의 11은 '2개의 1'
 *   L4 = 1211        앞의 21은 '1개의 2, 1개의 1'
 *   L5 = 111221      앞의 1211은 '1개의 1, 1개의 2, 2개의 1'
 *   L6 = 312211      앞의 111221은 '3개의 1, 2개의 2, 1개의 1'
 *   L7 = 13112221    앞의 312211은 '1개의 3, 1개의 1, 2개의 2, 2개의 1'
 *   L8 = 1113213211  앞의 13112221은 '1개의 1, 1개의 3, 2개의 1, 3개의 2, 1개의 1'
 *
 * ── 문제 ──────────────────────────────────────────
 * 양의 정수 n (3 < n < 100)이 주어질 때,
 * n번째 항 Ln의 자릿수 중 **가운데 두 자리 수**를 반환한다.
 *
 *   n=5  →  L5 = 111221      →  12
 *   n=8  →  L8 = 1113213211  →  21
 *
 * 가운데 두 자리 = 길이가 len일 때 [len/2 - 1, len/2 + 1) 구간.
 * (L2부터는 항상 짝수 길이다 — 「개수+숫자」 쌍의 나열이므로)
 *
 * @param n 3 < n < 100
 * @returns 가운데 두 자리 (예: n=5 → 12)
 */

export function next(s: string) {
  let result = "";
  let i = 0;

  while (i < s.length) {
    const current = s[i]; // 지금 세고 있는 숫자
    let count = 0;

    // 같은 숫자가 계속되는 동안 센다
    while (i < s.length && s[i] === current) {
      count++;
      i++;
    }

    result += count + current; // 개수 먼저, 숫자 나중
  }

  return result;
}

export function solve(n: number) {
  if (!Number.isInteger(n) || n <= 3 || n >= 100) {
    throw new RangeError(`n은 3 < n < 100 인 정수여야 한다 (받은 값: ${n})`);
  }

  let s = "1";

  for (let i = 1; i < n; i++) {
    // L1에서 시작해 n-1번 변환
    s = next(s);
  }

  const mid = s.length / 2;
  return Number(s[mid - 1] + s[mid]);
}
