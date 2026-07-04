// Financeiro da empresa/projeto: resumo do mês, lançamentos e mensalidades
// recorrentes (contratos que repetem todo mês).
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi, financeApi } from '../lib/api'
import { formatBRL, MONTH_NAMES, mesAtual, shiftMes, reaisToCents } from '../lib/constants'
import EntryForm from '../components/EntryForm'
import EntriesList from '../components/EntriesList'
import Modal from '../components/Modal'
import ProjectTabs from '../components/ProjectTabs'
import styles from './Financeiro.module.css'

const pad = (n) => String(n).padStart(2, '0')
const hojeStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function ProjectFinance() {
  const { id } = useParams()
  const [mes, setMes] = useState(mesAtual())
  const [projeto, setProjeto] = useState(null)
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [recModal, setRecModal] = useState(false)
  const [recEditando, setRecEditando] = useState(null)
  const hoje = hojeStr()

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const [proj, fin] = await Promise.all([projectsApi.get(id), financeApi.projectFinance(id, mes)])
      setProjeto(proj)
      setDados(fin)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mes])

  async function toggleStatus(e) {
    try {
      await financeApi.updateEntry(e.id, { status: e.status === 'pago' ? 'pendente' : 'pago' })
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
  async function excluirRecorrente(r) {
    if (!confirm(`Excluir a mensalidade "${r.descricao}"? (lançamentos já gerados permanecem)`)) return
    await financeApi.removeRecurring(r.id)
    carregar()
  }

  const [ano, m] = mes.split('-').map(Number)
  const t = dados?.totais

  return (
    <div>
      <Link to="/projetos" className={styles.back} style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>
        ← Projetos
      </Link>

      <header className={styles.head}>
        <div>
          <h1>{projeto?.nome}</h1>
          <p className="muted">Financeiro {projeto?.cliente ? `• ${projeto.cliente}` : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditando(null); setModalAberto(true) }}>
          + Novo lançamento
        </button>
      </header>

      <ProjectTabs id={id} active="financeiro" />

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
            <Card label="Recebido" valor={t.recebido} cor="#22c55e" />
            <Card label="A receber" valor={t.aReceber} cor="#eab308" />
            <Card label="Despesas" valor={t.despesas} cor="#e10600" />
            <Card label="Saldo" valor={t.saldoPrevisto} cor={t.saldoPrevisto >= 0 ? '#3b82f6' : '#e10600'} />
          </div>

          <div className={styles.secTitleRow}>
            <h2 className={styles.secTitle}>Mensalidades recorrentes</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => { setRecEditando(null); setRecModal(true) }}>
              + Mensalidade
            </button>
          </div>
          {dados.recorrentes.length === 0 ? (
            <p className="muted">Nenhuma mensalidade cadastrada. Adicione um contrato que repete todo mês.</p>
          ) : (
            <div className={`${styles.list} glass`}>
              {dados.recorrentes.map((r) => (
                <div key={r.id} className={styles.recRow}>
                  <div className={styles.recInfo}>
                    <strong>{r.descricao}</strong>
                    <span>Todo dia {r.diaVencimento}{r.ativo ? '' : ' • (inativa)'}</span>
                  </div>
                  <span className={styles.recValor}>{formatBRL(r.valorCentavos)}/mês</span>
                  <div className={styles.entryActions}>
                    <button className={styles.iconBtn} title="Editar" onClick={() => { setRecEditando(r); setRecModal(true) }}>✎</button>
                    <button className={styles.iconBtn} title="Excluir" onClick={() => excluirRecorrente(r)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className={styles.secTitle}>Lançamentos do mês</h2>
          <EntriesList
            entries={dados.entries}
            hoje={hoje}
            onEdit={(e) => { setEditando(e); setModalAberto(true) }}
            onDelete={excluir}
            onToggle={toggleStatus}
          />
        </>
      )}

      {modalAberto && (
        <EntryForm
          entry={editando}
          projectIdFixo={id}
          onClose={() => setModalAberto(false)}
          onSaved={() => { setModalAberto(false); carregar() }}
        />
      )}
      {recModal && (
        <RecurringForm
          projectId={id}
          recorrente={recEditando}
          onClose={() => setRecModal(false)}
          onSaved={() => { setRecModal(false); carregar() }}
        />
      )}
    </div>
  )
}

function Card({ label, valor, cor }) {
  return (
    <div className={`${styles.card} glass`}>
      <span className={styles.cardLabel}>{label}</span>
      <span className={styles.cardValor} style={{ color: cor }}>{formatBRL(valor)}</span>
    </div>
  )
}

// --- Formulário de mensalidade recorrente ------------------------------
function RecurringForm({ projectId, recorrente, onClose, onSaved }) {
  const [descricao, setDescricao] = useState(recorrente?.descricao || '')
  const [valor, setValor] = useState(recorrente ? (recorrente.valorCentavos / 100).toString().replace('.', ',') : '')
  const [dia, setDia] = useState(recorrente?.diaVencimento || 5)
  const [ativo, setAtivo] = useState(recorrente ? recorrente.ativo : true)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    const centavos = reaisToCents(valor)
    if (centavos <= 0) return setErro('Informe um valor válido.')
    setSalvando(true)
    try {
      const payload = { descricao, valorCentavos: centavos, diaVencimento: Number(dia), ativo }
      if (recorrente) await financeApi.updateRecurring(recorrente.id, payload)
      else await financeApi.createRecurring(projectId, payload)
      onSaved()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal title={recorrente ? 'Editar mensalidade' : 'Nova mensalidade'} onClose={onClose} width={460}>
      <form onSubmit={salvar}>
        {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}
        <div className="field">
          <label>Descrição</label>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: Gestão de tráfego" />
        </div>
        <div className={styles.formRow}>
          <div className="field">
            <label>Valor mensal (R$) *</label>
            <input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" inputMode="decimal" required />
          </div>
          <div className="field">
            <label>Vence todo dia</label>
            <input type="number" min="1" max="31" value={dia} onChange={(e) => setDia(e.target.value)} />
          </div>
        </div>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} style={{ width: 16, height: 16 }} />
          <span>Ativa (gera cobrança todo mês)</span>
        </label>
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
