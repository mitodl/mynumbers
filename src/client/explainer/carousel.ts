// ============================================================================
// Explainer — Carousel navigation & initialization
// ============================================================================

import { cancelTreeAnims, resetTreeAndAnimate } from './tree'
import { stopStream } from './sampler'
import { stopAuto } from './perms'

const TOTAL_SLIDES = 5

const SUBTITLES: Record<number, string> = {
  1: "From random expression to playable challenge",
  2: "Recursion, evaluation, and pretty-printing",
  3: "Bernoulli trials and the geometric distribution",
  4: "Searching arrangements of the bank",
  5: "MIT Learn courses go deeper on these ideas and more",
}

export function initCarousel(): () => void {
  const track = document.getElementById("ex-track")!
  const viewport = document.getElementById("ex-viewport")!
  const dotsContainer = document.getElementById("ex-dots")!
  const prevBtn = document.getElementById("ex-prev") as HTMLButtonElement
  const nextBtn = document.getElementById("ex-next") as HTMLButtonElement
  const progressFill = document.getElementById("ex-progress-fill")!
  const counter = document.getElementById("ex-current")!
  const subtitle = document.getElementById("ex-slide-subtitle")!
  document.getElementById("ex-total")!.textContent = String(TOTAL_SLIDES)

  // All listeners are bound with this signal so a single abort() tears the
  // whole carousel down cleanly (prevents leaks / double-binding on remount).
  const controller = new AbortController()
  const { signal } = controller

  let current = 1

  dotsContainer.replaceChildren()
  for (let i = 1; i <= TOTAL_SLIDES; i++) {
    const dot = document.createElement("button")
    dot.className = "ex-dot"
    dot.setAttribute("role", "tab")
    dot.setAttribute("aria-label", `Slide ${i}`)
    dot.dataset.target = String(i)
    dot.addEventListener("click", () => goToSlide(i), { signal })
    dotsContainer.appendChild(dot)
  }

  function goToSlide(slideNumber: number, options?: { highlight?: boolean }): void {
    slideNumber = Math.max(1, Math.min(TOTAL_SLIDES, slideNumber))
    const previous = current
    current = slideNumber
    track.style.transform = `translateX(-${(slideNumber - 1) * 100}%)`
    counter.textContent = String(slideNumber)
    progressFill.style.width = (slideNumber / TOTAL_SLIDES * 100).toFixed(3) + "%"
    subtitle.textContent = SUBTITLES[slideNumber] || ""
    ;[...dotsContainer.children].forEach((dot, index) => (dot as HTMLElement).classList.toggle("is-active", index === slideNumber - 1))
    prevBtn.disabled = slideNumber === 1
    nextBtn.disabled = slideNumber === TOTAL_SLIDES
    if (options && options.highlight) {
      const slide = track.children[slideNumber - 1] as HTMLElement
      slide.classList.remove("is-jumped")
      void slide.offsetWidth
      slide.classList.add("is-jumped")
    }
    if (slideNumber !== 4) stopAuto()
    if (slideNumber !== 3) stopStream()
    if (slideNumber !== 2) cancelTreeAnims()
    if (slideNumber === 2 && previous !== 2) resetTreeAndAnimate()
  }

  prevBtn.addEventListener("click", () => goToSlide(current - 1), { signal })
  nextBtn.addEventListener("click", () => goToSlide(current + 1), { signal })

  function returnToGame(): void {
    window.history.back()
  }

  document.addEventListener("keydown", (event) => {
    const tag = (document.activeElement && document.activeElement.tagName) || ""
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return
    if (event.key === "ArrowRight") { goToSlide(current + 1); event.preventDefault() }
    else if (event.key === "ArrowLeft") { goToSlide(current - 1); event.preventDefault() }
    else if (event.key === "Escape") { returnToGame() }
  }, { signal })

  // Swipe
  ;(function bindSwipe() {
    let swipeStartX: number | null = null, swipeDeltaX = 0, isDragging = false
    const SWIPE_THRESHOLD = 0.20
    viewport.addEventListener("pointerdown", (event) => {
      if ((event.target as HTMLElement).closest("button, select, input, a, svg .tree-node, .ex-pslot")) return
      swipeStartX = event.clientX; swipeDeltaX = 0; isDragging = true
      try { viewport.setPointerCapture(event.pointerId) } catch (_) {}
    }, { signal })
    viewport.addEventListener("pointermove", (event) => { if (isDragging && swipeStartX !== null) swipeDeltaX = event.clientX - swipeStartX }, { signal })
    viewport.addEventListener("pointerup", () => {
      if (!isDragging) return
      isDragging = false
      const swipeRatio = swipeDeltaX / viewport.clientWidth
      if (swipeRatio < -SWIPE_THRESHOLD) goToSlide(current + 1)
      else if (swipeRatio > SWIPE_THRESHOLD) goToSlide(current - 1)
    }, { signal })
    viewport.addEventListener("pointercancel", () => { isDragging = false }, { signal })
  })()

  // Click-to-jump
  document.addEventListener("click", (event) => {
    const jumpEl = (event.target as HTMLElement).closest("[data-jump]") as HTMLElement | null
    if (jumpEl) {
      const jumpTarget = parseInt(jumpEl.dataset.jump!, 10)
      goToSlide(jumpTarget, { highlight: !!jumpEl.dataset.highlight })
    }
  }, { signal })

  // Intercept home navigations
  document.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const homeLink = (event.target as HTMLElement).closest('a[href="/"], [data-go-home]')
    if (!homeLink) return
    event.preventDefault()
    returnToGame()
  }, { signal })

  // "Go deeper" drawers
  document.querySelectorAll<HTMLElement>(".ex-deeper").forEach((btn) => {
    btn.addEventListener("click", () => {
      const drawer = document.getElementById(btn.dataset.drawer!)
      if (!drawer) return
      const open = !drawer.hidden
      drawer.hidden = open
      btn.textContent = open ? "Go deeper ▾" : "Go deeper ▴"
    }, { signal })
  })

  // Start on slide 1
  goToSlide(1)

  // Teardown: drop every listener and clear generated dots so a remount
  // (e.g. React StrictMode's double-invoke) can't duplicate them.
  return () => {
    controller.abort()
    dotsContainer.replaceChildren()
  }
}
