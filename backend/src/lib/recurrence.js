// =========================================================================
// RECORRÊNCIA — expande rotinas (regras) em ocorrências por data.
// Datas sempre no formato "YYYY-MM-DD" e comparadas como string (ISO ordena).
// Cálculo de dia da semana em UTC para evitar problemas de fuso.
// =========================================================================

const DAY_MS = 86400000

function toUTCDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function fmt(dt) {
  const y = dt.getUTCFullYear()
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const d = String(dt.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 0 = Domingo ... 6 = Sábado
export function weekday(dateStr) {
  return toUTCDate(dateStr).getUTCDay()
}

function inBounds(routine, dateStr) {
  if (routine.dataInicio && dateStr < routine.dataInicio) return false
  if (routine.dataFim && dateStr > routine.dataFim) return false
  return true
}

// A rotina ocorre nessa data?
export function occursOn(routine, dateStr) {
  if (!routine.ativo) return false
  switch (routine.tipo) {
    case 'unica':
      return routine.data === dateStr
    case 'diaria':
      return inBounds(routine, dateStr)
    case 'semanal': {
      if (!inBounds(routine, dateStr)) return false
      const dias = String(routine.diasSemana || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
      return dias.includes(weekday(dateStr))
    }
    case 'mensal': {
      if (!inBounds(routine, dateStr)) return false
      return routine.diaMes === toUTCDate(dateStr).getUTCDate()
    }
    default:
      return false
  }
}

// Lista de datas "YYYY-MM-DD" entre início e fim (inclusive).
export function eachDate(startStr, endStr) {
  const out = []
  let cur = toUTCDate(startStr)
  const end = toUTCDate(endStr)
  while (cur.getTime() <= end.getTime()) {
    out.push(fmt(cur))
    cur = new Date(cur.getTime() + DAY_MS)
  }
  return out
}

// Expande várias rotinas num intervalo -> [{ date, routineId }].
export function expandRange(routines, startStr, endStr) {
  const dates = eachDate(startStr, endStr)
  const occ = []
  for (const r of routines) {
    for (const d of dates) {
      if (occursOn(r, d)) occ.push({ date: d, routineId: r.id })
    }
  }
  return occ
}
