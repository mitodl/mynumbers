// ============================================================================
// Explainer — Slide 2: Expression Tree
// ============================================================================

export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

interface TreeNode {
  id: string
  op?: string
  val?: number
  left?: string
  right?: string
  x: number
  y: number
}

const TREE: Record<string, TreeNode> = {
  n1: { id: "n1", op: "-", left: "n2", right: "n5", x: 280, y: 40 },
  n2: { id: "n2", op: "*", left: "n3", right: "n4", x: 160, y: 110 },
  n3: { id: "n3", op: "+", left: "n6", right: "n7", x: 90, y: 180 },
  n4: { id: "n4", val: 3, x: 230, y: 180 },
  n5: { id: "n5", op: "/", left: "n8", right: "n9", x: 400, y: 110 },
  n6: { id: "n6", val: 4, x: 50, y: 250 },
  n7: { id: "n7", val: 7, x: 130, y: 250 },
  n8: { id: "n8", val: 8, x: 360, y: 180 },
  n9: { id: "n9", val: 2, x: 440, y: 180 },
}

const BUILD_ORDER = ["n1", "n2", "n3", "n6", "n7", "n4", "n5", "n8", "n9"]

function evalNode(id: string): number {
  const node = TREE[id]
  if (node.val !== undefined) return node.val
  const leftValue = evalNode(node.left!), rightValue = evalNode(node.right!)
  return node.op === "+" ? leftValue + rightValue
    : node.op === "-" ? leftValue - rightValue
    : node.op === "*" ? leftValue * rightValue
    : leftValue / rightValue
}

function subExpr(id: string, parentPrecedence: number): string {
  const node = TREE[id]
  if (node.val !== undefined) return String(node.val)
  const symbol = { "+": " + ", "-": " − ", "*": " × ", "/": " ÷ " }[node.op!]!
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 }[node.op!]!
  const inner = subExpr(node.left!, precedence) + symbol + subExpr(node.right!, precedence)
  return precedence < parentPrecedence ? `(${inner})` : inner
}

function descendants(id: string, collected: string[]): string[] {
  collected.push(id)
  const node = TREE[id]
  if (node.left) descendants(node.left, collected)
  if (node.right) descendants(node.right, collected)
  return collected
}

const SVG_NS = "http://www.w3.org/2000/svg"

function renderTree(): void {
  const svg = document.getElementById("tree-svg")!
  svg.innerHTML = ""

  Object.values(TREE).forEach((node) => {
    (["left", "right"] as const).forEach((side) => {
      const childId = node[side]
      if (!childId) return
      const child = TREE[childId]
      const line = document.createElementNS(SVG_NS, "line")
      line.setAttribute("x1", String(node.x)); line.setAttribute("y1", String(node.y))
      line.setAttribute("x2", String(child.x)); line.setAttribute("y2", String(child.y))
      line.setAttribute("class", "tree-edge")
      line.dataset.from = node.id; line.dataset.to = child.id
      svg.appendChild(line)
    })
  })

  Object.values(TREE).forEach((node) => {
    const group = document.createElementNS(SVG_NS, "g")
    group.setAttribute("class", "tree-node " + (node.val !== undefined ? "is-leaf" : "is-op"))
    group.setAttribute("transform", `translate(${node.x}, ${node.y})`)
    group.dataset.id = node.id

    const circle = document.createElementNS(SVG_NS, "circle")
    circle.setAttribute("r", "22")
    const label = document.createElementNS(SVG_NS, "text")
    label.textContent = node.val !== undefined
      ? String(node.val)
      : ({ "*": "×", "/": "÷", "-": "−" }[node.op!] || node.op!)

    const badgeBg = document.createElementNS(SVG_NS, "rect")
    badgeBg.setAttribute("x", "-18"); badgeBg.setAttribute("y", "18")
    badgeBg.setAttribute("width", "36"); badgeBg.setAttribute("height", "18")
    badgeBg.setAttribute("rx", "4")
    badgeBg.setAttribute("class", "tree-badge-bg")
    const badgeText = document.createElementNS(SVG_NS, "text")
    badgeText.setAttribute("y", "27")
    badgeText.setAttribute("class", "tree-badge-text")
    badgeText.dataset.role = "badge"

    group.appendChild(circle)
    group.appendChild(label)
    group.appendChild(badgeBg)
    group.appendChild(badgeText)

    group.addEventListener("click", () => {
      group.classList.remove("tap-pulse")
      void (group as unknown as HTMLElement).offsetWidth
      group.classList.add("tap-pulse")
      animateEvaluateSubtree(node.id)
    })
    svg.appendChild(group)
  })
}

function highlightSubtree(id: string): void {
  const svg = document.getElementById("tree-svg")!
  svg.querySelectorAll(".tree-node.is-hi").forEach(el => el.classList.remove("is-hi"))
  svg.querySelectorAll(".tree-edge.is-hi").forEach(el => el.classList.remove("is-hi"))
  const subtreeIds = descendants(id, [])
  subtreeIds.forEach((nodeId) => {
    const node = svg.querySelector(`.tree-node[data-id="${nodeId}"]`)
    if (node) node.classList.add("is-hi")
  })
  svg.querySelectorAll(".tree-edge").forEach((edgeEl) => {
    const edge = edgeEl as SVGElement
    if (subtreeIds.includes(edge.dataset.from!) && subtreeIds.includes(edge.dataset.to!)) edge.classList.add("is-hi")
  })
  document.getElementById("tree-readout-label")!.textContent = "Selected subtree"
  document.getElementById("tree-sub-expr")!.textContent = subExpr(id, 0)
  document.getElementById("tree-sub-val")!.textContent = "= " + evalNode(id)
}

function clearAllBadges(): void {
  document.querySelectorAll("#tree-svg .tree-node").forEach((el) => {
    el.classList.remove("has-val", "eval-pulse", "is-hi")
    const badgeText = el.querySelector('text[data-role="badge"]')
    if (badgeText) badgeText.textContent = ""
  })
  document.querySelectorAll("#tree-svg .tree-edge.is-hi").forEach((edge) => edge.classList.remove("is-hi"))
}

let buildTimers: ReturnType<typeof setTimeout>[] = []
let evalTimers: ReturnType<typeof setTimeout>[] = []

export function cancelTreeAnims(): void {
  buildTimers.forEach(clearTimeout)
  buildTimers = []
  evalTimers.forEach(clearTimeout)
  evalTimers = []
}

export function resetTreeAndAnimate(): void {
  cancelTreeAnims()
  renderTree()
  clearAllBadges()
  document.getElementById("tree-readout-label")!.textContent = "select a node to begin"
  document.getElementById("tree-sub-expr")!.textContent = ""
  document.getElementById("tree-sub-val")!.textContent = ""
  const svg = document.getElementById("tree-svg")!
  svg.querySelectorAll<SVGElement>(".tree-node").forEach((el) => (el.style.opacity = "0"))
  svg.querySelectorAll<SVGElement>(".tree-edge").forEach((el) => (el.style.opacity = "0"))
  if (reducedMotion) { animateBuild(); return }
  buildTimers.push(setTimeout(animateBuild, 340))
}

function animateBuild(): void {
  const svg = document.getElementById("tree-svg")!
  const nodeEls = [...svg.querySelectorAll<SVGElement>(".tree-node")]
  const edgeEls = [...svg.querySelectorAll<SVGElement>(".tree-edge")]
  nodeEls.forEach((el) => (el.style.opacity = "0"))
  edgeEls.forEach((el) => (el.style.opacity = "0"))
  if (reducedMotion) {
    nodeEls.forEach((el) => (el.style.opacity = "1"))
    edgeEls.forEach((el) => (el.style.opacity = "1"))
    return
  }
  BUILD_ORDER.forEach((id, index) => {
    buildTimers.push(setTimeout(() => {
      const el = svg.querySelector<SVGElement>(`.tree-node[data-id="${id}"]`)
      if (el) el.style.opacity = "1"
      svg.querySelectorAll<SVGElement>(`.tree-edge[data-to="${id}"]`).forEach((edge) => (edge.style.opacity = "1"))
    }, index * 180))
  })
}

function postOrder(rootId: string): string[] {
  const ordered: string[] = []
  ;(function visit(id: string) {
    const node = TREE[id]
    if (node.left) visit(node.left)
    if (node.right) visit(node.right)
    ordered.push(id)
  })(rootId)
  return ordered
}

function animateEvaluateSubtree(rootId: string): void {
  cancelTreeAnims()
  const svg = document.getElementById("tree-svg")!
  svg.querySelectorAll<SVGElement>(".tree-node").forEach((el) => (el.style.opacity = "1"))
  svg.querySelectorAll<SVGElement>(".tree-edge").forEach((el) => (el.style.opacity = "1"))
  clearAllBadges()
  highlightSubtree(rootId)
  const order = postOrder(rootId)
  if (reducedMotion) {
    order.forEach((id) => {
      const el = svg.querySelector(`.tree-node[data-id="${id}"]`)
      if (!el) return
      const badgeText = el.querySelector('text[data-role="badge"]')
      if (badgeText) badgeText.textContent = String(evalNode(id))
      el.classList.add("has-val")
    })
    document.getElementById("tree-sub-expr")!.textContent = subExpr(rootId, 0)
    document.getElementById("tree-sub-val")!.textContent = "= " + evalNode(rootId)
    return
  }
  order.forEach((id, index) => {
    evalTimers.push(setTimeout(() => {
      const el = svg.querySelector(`.tree-node[data-id="${id}"]`)
      if (!el) return
      const value = evalNode(id)
      el.classList.remove("eval-pulse")
      void (el as unknown as HTMLElement).offsetWidth
      el.classList.add("eval-pulse")
      const badgeText = el.querySelector('text[data-role="badge"]')
      if (badgeText) badgeText.textContent = String(value)
      el.classList.add("has-val")
      document.getElementById("tree-sub-expr")!.textContent = subExpr(id, 0)
      document.getElementById("tree-sub-val")!.textContent = "= " + value
    }, index * 480))
  })
}
