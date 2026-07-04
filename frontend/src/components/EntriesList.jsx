// Lista de lançamentos financeiros com status, marcar pago/pendente, editar e excluir.
import { formatBRL, formatDate, ENTRY_STATUS, statusEfetivo } from '../lib/constants'
import styles from '../pages/Financeiro.module.css'

export default function EntriesList({ entries, hoje, showEmpresa, onEdit, onDelete, onToggle }) {
  if (!entries.length) {
    return <p className="muted" style={{ padding: '1rem 0' }}>Nenhum lançamento neste mês.</p>
  }
  return (
    <div className={`${styles.list} glass`}>
      {entries.map((e) => {
        const st = ENTRY_STATUS[statusEfetivo(e, hoje)]
        const receita = e.tipo === 'receita'
        return (
          <div key={e.id} className={styles.entry}>
            <span className={`${styles.arrow} ${receita ? styles.up : styles.down}`}>
              {receita ? '↑' : '↓'}
            </span>
            <div className={styles.entryInfo}>
              <strong>{e.descricao || (receita ? 'Receita' : 'Despesa')}</strong>
              <span className="muted">
                venc. {formatDate(e.vencimento)}
                {showEmpresa && e.project?.nome ? ` • ${e.project.nome}` : ''}
                {e.recurringId ? ' • mensalidade' : ''}
              </span>
            </div>
            <span className={`${styles.valor} ${receita ? styles.vReceita : styles.vDespesa}`}>
              {receita ? '' : '- '}{formatBRL(e.valorCentavos)}
            </span>
            <button
              className={styles.statusBtn}
              style={{ color: st.color, borderColor: st.color }}
              onClick={() => onToggle(e)}
              title="Alternar pago/pendente"
            >
              {st.label}
            </button>
            <div className={styles.entryActions}>
              <button className={styles.iconBtn} title="Editar" onClick={() => onEdit(e)}>✎</button>
              <button className={styles.iconBtn} title="Excluir" onClick={() => onDelete(e)}>🗑</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
