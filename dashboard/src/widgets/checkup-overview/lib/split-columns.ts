import type { MeasurementGroup } from './group-measurements'

/** 묶음 머리글 1줄 + 항목 수. 열 높이를 비교할 때만 쓰는 근삿값이다. */
function rowCount(group: MeasurementGroup): number {
  return group.items.length + 1
}

/**
 * 묶음을 두 열에 나눈다. 원래 순서를 지키면서 앞에서부터 채우되,
 * 남은 높이가 더 적은 쪽에 넣어 두 열 높이를 맞춘다.
 *
 * CSS `columns`를 쓰지 않는 이유: 높이가 제한된 스크롤 컨테이너 안에서
 * `columns`는 내용이 넘치면 열을 가로로 계속 만들어 가로 스크롤을 만든다.
 * 열 개수를 우리가 정하면 그 일이 일어나지 않는다.
 *
 * 순서를 섞지 않는다 — 묶음 순서는 검진표 순서라 의미가 있다.
 */
export function splitColumns(groups: MeasurementGroup[]): [MeasurementGroup[], MeasurementGroup[]] {
  const total = groups.reduce((sum, group) => sum + rowCount(group), 0)
  const left: MeasurementGroup[] = []
  const right: MeasurementGroup[] = []
  let filled = 0

  for (const group of groups) {
    const rows = rowCount(group)
    // 이 묶음을 넣었을 때 절반을 넘기는 정도가, 넣지 않았을 때 모자란 정도보다
    // 크면 오른쪽으로 넘긴다. 경계에 걸친 묶음을 한쪽에 온전히 둔다.
    const overshoot = filled + rows - total / 2
    if (left.length > 0 && overshoot > total / 2 - filled) {
      right.push(group)
    } else {
      left.push(group)
      filled += rows
    }
  }

  return [left, right]
}
