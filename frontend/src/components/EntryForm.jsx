// Formulário de lançamento financeiro (receita/despesa), reutilizado no
// Financeiro geral e no Financeiro da empresa.
import { useState } from 'react'
import { financeApi } from '../lib/api'
import { formatBRL, reaisToCents } from '../lib/constants'
import Modal from './Modal'
import styles from '../pages/Financeiro.module.css'

export default function EntryForm({ entry, projetos, projectIdFixo, onClose, onSaved }) {
  const [tipo, setTipo] = useState(entry?.tipo || 'receita')
  const [descricao, setDescricao] = useState(entry?.descricao || '')
  const [valor, setValor] = useState(entry ? (entry.valorCentavos / 100).toString().replace('.', ',') : '')
  const [vencimento, setVencimento] = useState(entry?.vencimento || '')
  const [status, setStatus] = useState(entry?.status || 'pendente')
  const [projectId, setProjectId] = useState(entry?.projectId || projectIdFixo || '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const centavos = reaisToCents(valor)

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    if (centavos <= 0) return setErro('Informe um valor válido.')
    if (!vencimento) return setErro('Informe o vencimento.')
    setSalvando(true)
    try {
      const payload = {
        tipo,
        descricao,
        valorCentavos: centavos,
        vencimento,
        status,
        projectId: projectIdFixo || projectId || null,
      }
      if (entry) await financeApi.updateEntry(entry.id, payload)
      else await financeApi.createEntry(payload)
      onSaved()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal title={entry ? 'Editar lançamento' : 'Novo lançamento'} onClose={onClose} width={500}>
      <form onSubmit={salvar}>
        {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}

        <div className={styles.tipoToggle}>
          <button
            type="button"
            className={`${styles.tipoBtn} ${tipo === 'receita' ? styles.tipoReceita : ''}`}
            onClick={() => setTipo('receita')}
          >
            ↑ Receita
          </button>
          <button
            type="button"
            className={`${styles.tipoBtn} ${tipo === 'despesa' ? styles.tipoDespesa : ''}`}
            onClick={() => setTipo('despesa')}
          >
            ↓ Despesa
          </button>
        </div>

        <div className="field">
          <label>Descrição</label>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: Mensalidade julho, Tráfego pago…" />
        </div>

        <div className={styles.formRow}>
          <div className="field">
            <label>Valor (R$) *</label>
            <input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" inputMode="decimal" required />
            {centavos > 0 && <span className="muted" style={{ fontSize: '0.75rem' }}>{formatBRL(centavos)}</span>}
          </div>
          <div className="field">
            <label>Vencimento *</label>
            <input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} required />
          </div>
        </div>

        <div className={styles.formRow}>
          {!projectIdFixo && projetos && (
            <div className="field">
              <label>Empresa</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Geral (agência)</option>
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
