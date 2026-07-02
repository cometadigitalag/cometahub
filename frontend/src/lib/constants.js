// Rótulos e cores de status/prioridade, reutilizados na UI.

export const PROJECT_STATUS = {
  ativo: { label: 'Ativo', color: '#22c55e' },
  pausado: { label: 'Pausado', color: '#eab308' },
  concluido: { label: 'Concluído', color: '#3b82f6' },
}

export const OBLIGATION_STATUS = {
  pendente: { label: 'Pendente', color: '#6c6c78' },
  em_andamento: { label: 'Em andamento', color: '#eab308' },
  concluido: { label: 'Concluído', color: '#22c55e' },
}

// Ordem das colunas do roadmap (kanban).
export const ROADMAP_COLUMNS = ['pendente', 'em_andamento', 'concluido']

export const OBLIGATION_PRIORITY = {
  baixa: { label: 'Baixa', color: '#6c6c78' },
  media: { label: 'Média', color: '#eab308' },
  alta: { label: 'Alta', color: '#e10600' },
}

// --- Agenda / rotinas -----------------------------------------------------
// Dias da semana (índice 0=Dom .. 6=Sáb, igual ao getUTCDay do backend).
export const WEEKDAYS = [
  { n: 0, curto: 'Dom', label: 'Domingo' },
  { n: 1, curto: 'Seg', label: 'Segunda' },
  { n: 2, curto: 'Ter', label: 'Terça' },
  { n: 3, curto: 'Qua', label: 'Quarta' },
  { n: 4, curto: 'Qui', label: 'Quinta' },
  { n: 5, curto: 'Sex', label: 'Sexta' },
  { n: 6, curto: 'Sáb', label: 'Sábado' },
]

export const ROUTINE_TYPES = {
  diaria: 'Todos os dias',
  semanal: 'Dias da semana',
  mensal: 'Mensal (dia do mês)',
  unica: 'Data única',
}

// Paleta para colorir as rotinas na agenda.
export const ROUTINE_COLORS = [
  '#e10600',
  '#22c55e',
  '#3b82f6',
  '#eab308',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// Descrição legível da recorrência de uma rotina.
export function recurrenceLabel(r) {
  if (r.tipo === 'diaria') return 'Todos os dias'
  if (r.tipo === 'unica') return formatDate(r.data)
  if (r.tipo === 'mensal') return `Todo dia ${r.diaMes} do mês`
  if (r.tipo === 'semanal') {
    const dias = String(r.diasSemana || '')
      .split(',')
      .filter(Boolean)
      .map((n) => WEEKDAYS[Number(n)]?.curto)
      .filter(Boolean)
    return dias.length ? dias.join(', ') : 'Semanal'
  }
  return ''
}

// --- Permissões / módulos -------------------------------------------------
// Catálogo de módulos que um colaborador pode receber (espelha o backend).
export const MODULES = [
  { key: 'projetos', label: 'Projetos', path: '/projetos', icon: '▣' },
  { key: 'financeiro', label: 'Financeiro', path: '/financeiro', icon: '＄' },
]

export const ROLE_LABELS = { admin: 'Administrador', colaborador: 'Colaborador' }

export const isAdmin = (user) => user?.role === 'admin'

// Admin vê tudo; colaborador só os módulos marcados nas permissões.
export const canModule = (user, key) =>
  isAdmin(user) || (user?.permissions || []).includes(key)

// Formata "YYYY-MM-DD" para "DD/MM/AAAA" (evita bug de fuso do new Date).
export function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}
