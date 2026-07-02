// =========================================================================
// CATÁLOGO DE MÓDULOS / PERMISSÕES
// Módulos que um colaborador pode (ou não) enxergar. O admin vê todos.
// Para adicionar um módulo novo no futuro, basta incluí-lo aqui e proteger
// as rotas com requireModule('<chave>').
// =========================================================================

export const MODULES = [
  { key: 'projetos', label: 'Projetos' },
  { key: 'financeiro', label: 'Financeiro' },
]

export const MODULE_KEYS = MODULES.map((m) => m.key)

// Converte a string CSV do banco em array de chaves válidas.
export function parsePermissions(value) {
  if (Array.isArray(value)) return value.filter((k) => MODULE_KEYS.includes(k))
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter((k) => MODULE_KEYS.includes(k))
}

// Serializa array -> CSV para gravar no banco.
export function serializePermissions(value) {
  return parsePermissions(value).join(',')
}

// O usuário (admin ou colaborador) tem acesso ao módulo?
export function hasModule(user, key) {
  if (!user) return false
  if (user.role === 'admin') return true
  return parsePermissions(user.permissions).includes(key)
}
