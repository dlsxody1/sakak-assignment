import { useCallback, useEffect, useRef, useState } from 'react'

export interface PlotArea {
  left: number
  top: number
  width: number
  height: number
}

/**
 * ApexCharts가 실제로 그린 플롯 영역(축 안쪽)의 좌표를 잰다.
 *
 * 기준 띠를 차트 뒤에 깔려면 이 값이 필요한데, 축 폭은 라벨 자릿수에 따라 달라져서
 * 상수로 박으면 어긋난다 — 축 라벨을 덮거나 띠가 플롯 밖으로 넘친다.
 * 그려진 결과를 읽는 게 유일하게 맞는 방법이다.
 */
export function usePlotArea(redrawKey: unknown) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [plot, setPlot] = useState<PlotArea>()

  const measure = useCallback(() => {
    const container = containerRef.current
    const grid = container?.querySelector('.apexcharts-grid')
    const canvas = container?.querySelector('.apexcharts-canvas')
    if (!container || !grid || !canvas) return

    const gridRect = grid.getBoundingClientRect()
    const canvasRect = canvas.getBoundingClientRect()
    if (gridRect.height === 0) return

    const next = {
      left: gridRect.left - canvasRect.left,
      top: gridRect.top - canvasRect.top,
      width: gridRect.width,
      height: gridRect.height,
    }

    // 값이 같아도 새 객체면 리렌더가 돌고, 그 리렌더가 ApexCharts를 다시 그리게 해서
    // 다시 여기로 돌아온다 — 무한 루프. 실제로 바뀌었을 때만 상태를 올린다.
    setPlot((prev) =>
      prev &&
      prev.left === next.left &&
      prev.top === next.top &&
      prev.width === next.width &&
      prev.height === next.height
        ? prev
        : next,
    )
  }, [])

  // 차트가 그려진 뒤에 재야 한다. 렌더 직후에는 grid 엘리먼트가 아직 없다.
  useEffect(() => {
    const frame = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(frame)
  }, [measure, redrawKey])

  // 컨테이너가 아니라 그려진 grid를 관측한다. 컨테이너를 보면 ApexCharts가
  // SVG를 다시 그리기 전에 콜백이 와서 옛 좌표를 읽는다 — 창을 줄여도 띠만
  // 옛 폭으로 남는다. grid는 Apex가 다시 그린 뒤에야 크기가 바뀌므로 순서가 맞다.
  // Apex가 SVG를 통째로 갈아끼우면 관측 대상이 사라지니 MutationObserver로 다시 건다.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resize = new ResizeObserver(measure)
    let observed: Element | null = null

    const attach = () => {
      const grid = container.querySelector('.apexcharts-grid')
      if (grid === observed) return
      if (observed) resize.unobserve(observed)
      if (grid) resize.observe(grid)
      observed = grid
    }

    attach()
    const mutation = new MutationObserver(attach)
    mutation.observe(container, { childList: true, subtree: true })

    return () => {
      resize.disconnect()
      mutation.disconnect()
    }
  }, [measure, redrawKey])

  return { containerRef, plot }
}
