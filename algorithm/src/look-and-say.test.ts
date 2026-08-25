import { describe, expect, it } from "vitest";
import { next, solve } from "./look-and-say";

describe("next — 한 항에서 다음 항 만들기", () => {
  it("1 → 11 (1이 한 개)", () => {
    expect(next("1")).toBe("11");
  });

  it("11 → 21 (1이 두 개)", () => {
    expect(next("11")).toBe("21");
  });

  it("21 → 1211 (2가 한 개, 1이 한 개)", () => {
    expect(next("21")).toBe("1211");
  });

  it("1211 → 111221", () => {
    expect(next("1211")).toBe("111221");
  });

  it("312211 → 13112221", () => {
    expect(next("312211")).toBe("13112221");
  });

  it("같은 숫자가 3개 이상 이어져도 한 묶음으로 센다", () => {
    expect(next("111")).toBe("31");
  });
});

describe("solve — n번째 항의 가운데 두 자리", () => {
  // 문제에 주어진 예시
  it("n=5 (L5=111221) → 12", () => {
    expect(solve(5)).toBe(12);
  });

  it("n=8 (L8=1113213211) → 21", () => {
    expect(solve(8)).toBe(21);
  });

  // 유효 범위의 하한
  it("n=4 (L4=1211) → 21", () => {
    expect(solve(4)).toBe(21);
  });

  it("n=10 → 23", () => {
    expect(solve(10)).toBe(23);
  });

  it("n=30 → 21", () => {
    expect(solve(30)).toBe(21);
  });

  it('number를 반환한다 (문자열 "12"가 아니라 숫자 12)', () => {
    expect(typeof solve(5)).toBe("number");
  });
});

describe("solve — 범위 밖은 던진다", () => {
  it.each([3, 100, 0, -1, 1.5, NaN])(`n=%s → throws`, (n) => {
    expect(() => solve(n)).toThrow();
  });
});
