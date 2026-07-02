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
