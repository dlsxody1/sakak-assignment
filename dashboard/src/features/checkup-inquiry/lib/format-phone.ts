/**
 * 휴대폰 번호 표시·정규화.
 *
 * 상태에는 숫자만 담고 화면에서만 하이픈을 씌운다. 그래야 `buildInquiryBody`와
 * `validateInquiry`가 하이픈을 몰라도 되고, 붙여넣기한 `010-1234-5678`도
 * `stripPhone`을 지나면서 그냥 정규화된다.
 */

/** 입력에서 숫자만 남긴다. 11자리를 넘으면 자른다 — 휴대폰 번호는 그보다 길지 않다. */
export const stripPhone = (value: string) => value.replace(/\D/g, '').slice(0, 11)

/**
 * 표시용 하이픈. `01012345678` → `010-1234-5678`.
 *
 * 덜 입력한 상태에도 걸리는 만큼만 붙인다 — 타이핑 도중에 형태가 무너지면 안 된다.
 */
export function formatPhone(digits: string) {
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}
