/**
 * 성별. 판정 기준이 성별로 갈리는 항목(허리둘레·혈색소·감마지티피)에 필요하다.
 *
 * `health-reference`의 `Sex`와 같은 리터럴이지만 여기서 따로 정의한다 —
 * 같은 레이어의 다른 슬라이스는 참조하지 않는다. 구조적으로 호환되므로
 * 둘이 만나는 위젯에서 그대로 넘어간다.
 */
export type Sex = 'male' | 'female'

export const SEX_LABELS: Record<Sex, string> = {
  male: '남성',
  female: '여성',
}
