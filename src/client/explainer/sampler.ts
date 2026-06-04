// ============================================================================
// Explainer — Slide 3: Rejection Sampler
// ============================================================================

import { reducedMotion } from './tree'

const TARGET_VALUE_RANGES: Record<string, [number, number]> = {
  wide: [10, 99],
  mid: [20, 60],
  narrow: [25, 35],
}
const OPERATOR_SETS: Record<string, string[]> = {
  add: ["+"],
  addsub: ["+", "-"],
  all: ["+", "-", "*", "/"],
}

function randomIntInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

interface Expression {
  operandA: number
  operandB: number
  operandC: number
  firstOperator: string
  secondOperator: string
}

function generateRandomExpression(operators: string[]): Expression {
  const operandPool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  const chosenOperands: number[] = []
  for (let i = 0; i < 3; i++) {
    const poolIndex = randomIntInRange(0, operandPool.length - 1)
    chosenOperands.push(operandPool.splice(poolIndex, 1)[0])
  }
  const firstOperator = operators[randomIntInRange(0, operators.length - 1)]
  const secondOperator = operators[randomIntInRange(0, operators.length - 1)]
  return {
    operandA: chosenOperands[0],
    operandB: chosenOperands[1],
    operandC: chosenOperands[2],
    firstOperator,
    secondOperator,
  }
}

function evaluateExpression(expression: Expression): number {
  const isMultiplicative = (operator: string) => operator === "*" || operator === "/"
  const applyOperator = (left: number, operator: string, right: number) =>
    operator === "+" ? left + right
      : operator === "-" ? left - right
      : operator === "*" ? left * right
      : right === 0 ? NaN : left / right
  if (isMultiplicative(expression.firstOperator) && !isMultiplicative(expression.secondOperator)) {
    return applyOperator(applyOperator(expression.operandA, expression.firstOperator, expression.operandB), expression.secondOperator, expression.operandC)
  }
  if (!isMultiplicative(expression.firstOperator) && isMultiplicative(expression.secondOperator)) {
    return applyOperator(expression.operandA, expression.firstOperator, applyOperator(expression.operandB, expression.secondOperator, expression.operandC))
  }
  return applyOperator(applyOperator(expression.operandA, expression.firstOperator, expression.operandB), expression.secondOperator, expression.operandC)
}

const OPERATOR_SYMBOLS: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" }
function formatExpression(expression: Expression): string {
  return `${expression.operandA} ${OPERATOR_SYMBOLS[expression.firstOperator]} ${expression.operandB} ${OPERATOR_SYMBOLS[expression.secondOperator]} ${expression.operandC}`
}

interface ClassificationResult {
  accepted: boolean
  value: number
  reason: string
}

function classifyExpression(expression: Expression, valueRange: [number, number]): ClassificationResult {
  const value = evaluateExpression(expression)
  if (!Number.isFinite(value)) return { accepted: false, value, reason: "div by zero" }
  if (!Number.isInteger(value)) return { accepted: false, value, reason: "non-integer" }
  if (value < valueRange[0] || value > valueRange[1]) return { accepted: false, value, reason: `out of [${valueRange[0]},${valueRange[1]}]` }
  return { accepted: true, value, reason: "accepted ✓" }
}

function estimateAcceptanceProbability(operatorSetKey: string, rangeKey: string, sampleCount = 4000): number {
  const operators = OPERATOR_SETS[operatorSetKey]
  const valueRange = TARGET_VALUE_RANGES[rangeKey]
  let acceptedCount = 0
  for (let i = 0; i < sampleCount; i++) {
    if (classifyExpression(generateRandomExpression(operators), valueRange).accepted) acceptedCount++
  }
  return Math.max(1e-6, acceptedCount / sampleCount)
}

function formatPercent(probability: number): string {
  if (probability >= 0.001) return (probability * 100).toFixed(1) + "%"
  return probability.toExponential(2)
}
function formatExpectedAttempts(probability: number): string { return (1 / probability).toFixed(1) }
function formatFailureProbability(probability: number): string {
  if (probability >= 0.02) return "≈ 0"
  const failureProbability = Math.pow(1 - probability, 2000)
  if (failureProbability < 1e-6) return "< 1e−6"
  return failureProbability.toExponential(2)
}

function refreshSamplerStats(): number {
  const operatorSetKey = (document.getElementById("s-ops") as HTMLSelectElement).value
  const rangeKey = (document.getElementById("s-range") as HTMLSelectElement).value
  const probability = estimateAcceptanceProbability(operatorSetKey, rangeKey)
  document.getElementById("s-p")!.textContent = formatPercent(probability)
  document.getElementById("s-exp")!.textContent = formatExpectedAttempts(probability)
  document.getElementById("s-fail")!.textContent = formatFailureProbability(probability)
  return probability
}

let streamIntervalId: ReturnType<typeof setInterval> | null = null

export function stopSampleStream(): void {
  if (streamIntervalId) { clearInterval(streamIntervalId); streamIntervalId = null }
}

function runSampleStream(): void {
  stopSampleStream()
  const operatorSetKey = (document.getElementById("s-ops") as HTMLSelectElement).value
  const rangeKey = (document.getElementById("s-range") as HTMLSelectElement).value
  const operators = OPERATOR_SETS[operatorSetKey]
  const valueRange = TARGET_VALUE_RANGES[rangeKey]
  refreshSamplerStats()

  const streamElement = document.getElementById("s-stream")!
  streamElement.innerHTML = ""
  let attemptCount = 0
  const MAX_ATTEMPTS = 60
  streamIntervalId = setInterval(() => {
    attemptCount++
    const expression = generateRandomExpression(operators)
    const verdict = classifyExpression(expression, valueRange)
    const row = document.createElement("div")
    row.className = "ex-attempt " + (verdict.accepted ? "is-ok" : "is-bad")
    row.innerHTML = `
      <div class="ex-attempt-num">#${attemptCount}</div>
      <div class="ex-attempt-expr">${formatExpression(expression)}</div>
      <div class="ex-attempt-val">= ${Number.isFinite(verdict.value) ? (Number.isInteger(verdict.value) ? verdict.value : verdict.value.toFixed(2)) : "NaN"}</div>
      <div class="ex-attempt-reason">${verdict.reason}</div>
    `
    streamElement.appendChild(row)
    streamElement.scrollTop = streamElement.scrollHeight
    if (verdict.accepted) {
      stopSampleStream()
    } else if (attemptCount >= MAX_ATTEMPTS) {
      stopSampleStream()
      const note = document.createElement("div")
      note.className = "ex-attempt is-bad"
      note.style.gridTemplateColumns = "1fr"
      note.textContent = `…gave up after ${MAX_ATTEMPTS} attempts. Loosen the band or simplify operators.`
      streamElement.appendChild(note)
    }
  }, reducedMotion ? 30 : 90)
}

export function initRejectionSampler(): void {
  // Bind sampler controls
  ["s-ops", "s-range"].forEach((id) =>
    document.getElementById(id)!.addEventListener("change", () => refreshSamplerStats())
  )
  document.getElementById("s-run")!.addEventListener("click", runSampleStream)
  refreshSamplerStats()

  // Populate narrow-band deep dive
  const valueRange = TARGET_VALUE_RANGES.narrow
  const operators = OPERATOR_SETS.all
  let totalCount = 0, acceptedCount = 0
  for (let a = 1; a <= 15; a++) {
    for (let b = 1; b <= 15; b++) {
      if (b === a) continue
      for (let c = 1; c <= 15; c++) {
        if (c === a || c === b) continue
        for (const firstOperator of operators) {
          for (const secondOperator of operators) {
            totalCount++
            if (classifyExpression({ operandA: a, operandB: b, operandC: c, firstOperator, secondOperator }, valueRange).accepted) acceptedCount++
          }
        }
      }
    }
  }
  const probability = acceptedCount / totalCount
  document.getElementById("d3-narrow-p")!.textContent = formatPercent(probability)
  document.getElementById("d3-narrow-exp")!.textContent = formatExpectedAttempts(probability)
  document.getElementById("d3-narrow-fail")!.textContent = formatFailureProbability(probability)
}
