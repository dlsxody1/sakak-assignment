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

    setPlot({
      left: gridRect.left - canvasRect.left,
      top: gridRect.top - canvasRect.top,
      width: gridRect.width,
      height: gridRect.height,
    })
  }, [])

  // 차트가 그려진 뒤에 재야 한다. 렌더 직후에는 grid 엘리먼트가 아직 없다.
  useEffect(() => {
    const frame = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(frame)
  }, [measure, redrawKey])

  // 컨테이너 크기가 바뀌면 축 폭도 바뀐다.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [measure])

  return { containerRef, plot }
}
