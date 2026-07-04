// Financeiro geral (consolidado): resumo do mês, faturamento por empresa e
// lançamentos (receitas/despesas) com status de pagamento.
import { useEffect, useState } from 'react'
import { financeApi, projectsApi } from '../lib/api'
import { formatBRL, MONTH_NAMES, mesAtual, shiftMes } from '../lib/constants'
import EntryForm from '../components/EntryForm'
import EntriesList from '../components/EntriesList'
import styles from './Financeiro.module.css'

const pad = (n) => String(n).padStart(2, '0')
const hojeStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function Financeiro() {
  const [mes, setMes] = useState(mesAtual())
  const [dados, setDados] = useState(null)
  const [projetos, setProjetos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const hoje = hojeStr()

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const [resumo, projs] = await Promise.all([financeApi.summary(mes), projectsApi.list()])
      setDados(resumo)
      setProjetos(projs)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes])

  async function toggleStatus(e) {
    const novo = e.status === 'pago' ? 'pendente' : 'pago'
    try {
      await financeApi.updateEntry(e.id, { status: novo })
      carregar()
    } catch (err) {
      alert(err.message)
    }
  }
  async function excluir(e) {
    if (!confirm('Excluir este lançamento?')) return
    await financeApi.removeEntry(e.id)
    carregar()
  }

  const [ano, m] = mes.split('-').map(Number)
  const t = dados?.totais

  return (
    <div>
      <header className={styles.head}>
        <div>
          <h1>Financeiro</h1>
          <p className="muted">Visão geral da agência — receitas, despesas e faturamento por empresa.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditando(null); setModalAberto(true) }}>
          + Novo lançamento
        </button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.monthNav}>
          <button className={styles.navBtn} onClick={() => setMes(shiftMes(mes, -1))}>‹</button>
          <strong>{MONTH_NAMES[m - 1]} {ano}</strong>
          <button className={styles.navBtn} onClick={() => setMes(shiftMes(mes, 1))}>›</button>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setMes(mesAtual())}>Mês atual</button>
      </div>

      {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}
      {carregando || !t ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          <div className={styles.cards}>
            <SummaryCard label="Recebido" valor={t.recebido} cor="#22c55e" />
            <SummaryCard label="A receber" valor={t.aReceber} cor="#eab308" />
            <SummaryCard label="Despesas" valor={t.despesas} cor="#e10600" />
            <SummaryCard label="Saldo previsto" valor={t.saldoPrevisto} cor={t.saldoPrevisto >= 0 ? '#3b82f6' : '#e10600'} />
          </div>

          <h2 className={styles.secTitle}>Faturamento por empresa</h2>
          {dados.empresas.length === 0 ? (
            <p className="muted">Sem lançamentos neste mês.</p>
          ) : (
            <div className={`${styles.list} glass`}>
              {dados.empresas.map((e) => (
                <div key={e.projectId || 'geral'} className={styles.empresaRow}>
                  <strong className={styles.empresaNome}>{e.nome}</strong>
                  <span className={styles.empresaMeta}>
                    <span style={{ color: '#22c55e' }}>{formatBRL(e.receitas)}</span>
                    {e.despesas > 0 && <span style={{ color: '#e10600' }}> · -{formatBRL(e.despesas)}</span>}
                  </span>
                  <span className={styles.empresaSaldo} style={{ color: e.saldo >= 0 ? '#3b82f6' : '#e10600' }}>
                    {formatBRL(e.saldo)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <h2 className={styles.secTitle}>Lançamentos do mês</h2>
          <EntriesList
            entries={dados.entries}
            hoje={hoje}
            showEmpresa
            onEdit={(e) => { setEditando(e); setModalAberto(true) }}
            onDelete={excluir}
            onToggle={toggleStatus}
          />
        </>
      )}

      {modalAberto && (
        <EntryForm
          entry={editando}
          projetos={projetos}
          onClose={() => setModalAberto(false)}
          onSaved={() => { setModalAberto(false); carregar() }}
        />
      )}
    </div>
  )
}

function SummaryCard({ label, valor, cor }) {
  return (
    <div className={`${styles.card} glass`}>
      <span className={styles.cardLabel}>{label}</span>
      <span className={styles.cardValor} style={{ color: cor }}>{formatBRL(valor)}</span>
    </div>
  )
}
