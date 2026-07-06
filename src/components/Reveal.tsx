import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Scroll-reveal wrapper: fades/slides children in when they enter the viewport. */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  /** Stagger index 1-6, maps to the original reveal-d* transition delays */
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li'
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const delayClass = delay > 0 ? ` reveal-d${delay}` : ''
  return (
    <Tag
      ref={ref as never}
      className={`reveal${delayClass}${visible ? ' visible' : ''} ${className}`.trim()}
    >
      {children}
    </Tag>
  )
}

/** Animated counter that counts up from 0 when scrolled into view. */
export function StatCounter({
  target,
  suffix = '',
  className = '',
}: {
  target: number
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('0')

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          observer.unobserve(entry.target)
          const duration = 1600
          const startTime = performance.now()
          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1)
            const eased = 1 - (1 - progress) ** 3
            setText(Math.floor(eased * target) + (progress >= 1 ? suffix : ''))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        })
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, suffix])

  return (
    <div ref={ref} className={`stat-figure ${className}`.trim()}>
      {text}
    </div>
  )
}
