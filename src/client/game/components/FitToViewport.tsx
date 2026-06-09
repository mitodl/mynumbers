import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import styled from "@emotion/styled"

// Scales its content down (never up) so the whole document fits within the
// viewport height. This keeps Arithmix from overflowing when it's embedded in
// a host app that has its own header/footer eating into the available space.
//
// Note: any `position: fixed` descendants (modals, countdown) must be portaled
// to <body> — a transformed ancestor would otherwise scope their fixed
// positioning to this element instead of the viewport.

const Outer = styled.div`
  overflow: hidden;
`

const Scaler = styled.div`
  display: flow-root;
  transform-origin: top center;
  transition: transform 120ms ease-out;
`

const MIN_SCALE = 0.4

export function FitToViewport({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const scalerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const scaler = scalerRef.current
    if (!outer || !scaler) return

    let raf = 0
    const measure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const naturalHeight = scaler.offsetHeight
        if (naturalHeight === 0) return
        // Height taken up by everything else on the page (header, footer, body
        // padding, ...). Independent of our own scale, so this is a stable target.
        const otherHeight =
          document.documentElement.scrollHeight - outer.offsetHeight
        const available = window.innerHeight - otherHeight
        const next = Math.max(
          MIN_SCALE,
          Math.min(1, available / naturalHeight),
        )
        setScale(prev => (Math.abs(prev - next) > 0.005 ? next : prev))
      })
    }

    const ro = new ResizeObserver(measure)
    ro.observe(scaler)
    ro.observe(document.body)
    window.addEventListener("resize", measure)
    measure()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  const naturalHeight = scalerRef.current?.offsetHeight
  const reservedHeight =
    scale < 1 && naturalHeight ? naturalHeight * scale : undefined

  return (
    <Outer ref={outerRef} style={reservedHeight ? { height: reservedHeight } : undefined}>
      <Scaler ref={scalerRef} style={{ transform: `scale(${scale})` }}>
        {children}
      </Scaler>
    </Outer>
  )
}
