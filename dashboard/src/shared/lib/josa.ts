/**
 * 앞말의 받침에 맞는 조사를 고른다.
 *
 * 문장에 시간을 값으로 끼워 넣으면 조사가 어긋난다 — `4분 30초`는 받침이 있어
 * `이 지났습니다`, `5분`은 없어서 `가 지났습니다`다. 상수가 바뀔 때마다 사람이
 * 문장을 손보게 두면 언젠가 "5분이 지났습니다"가 남는다.
 *
 * 한글 음절은 유니코드에서 `가`(0xAC00)부터 28개 종성이 한 묶음으로 배열된다.
 * 그 나머지가 0이면 받침이 없다. 숫자로 끝나면 읽는 소리의 받침을 따른다
 * (`1`=일, `2`=이 … `0`=영 — 1·3·6·7·8·0이 받침 있음).
 */
const NUMBER_HAS_FINAL: Record<string, boolean> = {
  '0': true, // 영
  '1': true, // 일
  '2': false, // 이
  '3': true, // 삼
  '4': false, // 사
  '5': false, // 오
  '6': true, // 육
  '7': true, // 칠
  '8': true, // 팔
  '9': false, // 구
}

/** 마지막 글자에 받침이 있나. 판단할 수 없는 글자는 없는 쪽으로 둔다. */
export function hasFinalConsonant(word: string): boolean {
  const last = word.trim().at(-1)
  if (!last) return false

  if (last >= '0' && last <= '9') return NUMBER_HAS_FINAL[last]

  const code = last.charCodeAt(0)
  if (code < 0xac00 || code > 0xd7a3) return false

  return (code - 0xac00) % 28 !== 0
}

/**
 * 받침에 맞는 조사를 붙인다. `josa('5분', '이', '가')` → `'5분가'`가 아니라
 * 조사만 돌려주므로 호출부가 원하는 자리에 넣는다.
 */
export const josa = (word: string, withFinal: string, withoutFinal: string) =>
  hasFinalConsonant(word) ? withFinal : withoutFinal
