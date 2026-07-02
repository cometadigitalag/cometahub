// Roadmap de obrigações de um projeto — quadro kanban (3 colunas de status).
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi, obligationsApi } from '../lib/api'
import {
  OBLIGATION_STATUS,
  OBLIGATION_PRIORITY,
  ROADMAP_COLUMNS,
  formatDate,
} from '../lib/constants'
import Modal from '../components/Modal'
import ProjectTabs from '../components/ProjectTabs'
import styles from './Roadmap.module.css'

const vazio = {
  titulo: '',
  descricao: '',
  responsavel: '',
  prazo: '',
  prioridade: 'media',
  status: 'pendente',
}

export default function Roadmap() {
  const { id } = useParams()
  const [projeto, setProjeto] = useState(null)
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

  async function carregar() {
    setCarregando(true)
    try {
      const [proj, obrigacoes] = await Promise.all([
        projectsApi.get(id),
        obligationsApi.listByProject(id),
      ])
      setProjeto(proj)
      setItens(obrigacoes)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [id])

  // Move a obrigação para outro status (avançar/retroceder no fluxo).
  async function mover(item, direcao) {
    const atual = ROADMAP_COLUMNS.indexOf(item.status)
    const novo = ROADMAP_COLUMNS[atual + direcao]
    if (!novo) return
    // Atualização otimista.
    setItens((lista) => lista.map((o) => (o.id === item.id ? { ...o, status: novo } : o)))
    try {
      await obligationsApi.update(item.id, { status: novo })
    } catch {
      carregar() // reverte em caso de erro
    }
  }

  async function excluir(item) {
    if (!confirm(`Excluir a obrigação "${item.titulo}"?`)) return
    await obligationsApi.remove(item.id)
    carregar()
  }

  function abrirNovo() {
    setEditando(null)
    setModalAberto(true)
  }
  function abrirEdicao(item) {
    setEditando(item)
    setModalAberto(true)
  }

  if (carregando) return <p className="muted">Carregando roadmap…</p>
  if (erro) return <div className="error-msg">{erro}</div>

  const total = itens.length
  const concluidas = itens.filter((o) => o.status === 'concluido').length
  const progresso = total ? Math.round((concluidas / total) * 100) : 0

  return (
    <div>
      <Link to="/projetos" className={styles.back}>
        ← Projetos
      </Link>

      <header className={styles.head}>
        <div>
          <h1>{projeto?.nome}</h1>
          <p className="muted">
            Roadmap de obrigações {projeto?.cliente ? `• ${projeto.cliente}` : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirNovo}>
          + Nova obrigação
        </button>
      </header>

      <ProjectTabs id={id} active="roadmap" />

      <div className={`${styles.progress} glass`}>
        <div className={styles.progressInfo}>
          <span>Progresso</span>
          <strong>
            {concluidas}/{total} concluídas ({progresso}%)
          </strong>
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: `${progresso}%` }} />
        </div>
      </div>

      <div className={styles.board}>
        {ROADMAP_COLUMNS.map((coluna) => {
          const st = OBLIGATION_STATUS[coluna]
          const daColuna = itens.filter((o) => o.status === coluna)
          return (
            <div key={coluna} className={styles.column}>
              <div className={styles.colHeader}>
                <span className="badge" style={{ color: st.color }}>
                  {st.label}
                </span>
                <span className={styles.count}>{daColuna.length}</span>
              </div>

              <div className={styles.cards}>
                {daColuna.length === 0 && <p className={styles.emptyCol}>Nada aqui.</p>}
                {daColuna.map((item) => {
                  const pr = OBLIGATION_PRIORITY[item.prioridade] || OBLIGATION_PRIORITY.media
                  const idx = ROADMAP_COLUMNS.indexOf(item.status)
                  return (
                    <div key={item.id} className={`${styles.card} glass`}>
                      <div className={styles.cardHead}>
                        <span className={styles.priority} style={{ color: pr.color }}>
                          ● {pr.label}
                        </span>
                        <div className={styles.cardActions}>
                          <button className={styles.iconBtn} onClick={() => abrirEdicao(item)} title="Editar">
                            ✎
                          </button>
                          <button className={styles.iconBtn} onClick={() => excluir(item)} title="Excluir">
                            🗑
                          </button>
                        </div>
                      </div>

                      <strong className={styles.cardTitle}>{item.titulo}</strong>
                      {item.descricao && <p className={styles.cardDesc}>{item.descricao}</p>}

                      <div className={styles.cardMeta}>
                        {item.responsavel && <span>👤 {item.responsavel}</span>}
                        {item.prazo && <span>📅 {formatDate(item.prazo)}</span>}
                      </div>

                      <div className={styles.moveRow}>
                        <button
                          className={styles.moveBtn}
                          onClick={() => mover(item, -1)}
                          disabled={idx === 0}
                          title="Voltar etapa"
                        >
                          ←
                        </button>
                        <button
                          className={styles.moveBtn}
                          onClick={() => mover(item, 1)}
                          disabled={idx === ROADMAP_COLUMNS.length - 1}
                          title="Avançar etapa"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {modalAberto && (
        <ObligationForm
          projectId={id}
          obrigacao={editando}
          onClose={() => setModalAberto(false)}
          onSaved={() => {
            setModalAberto(false)
            carregar()
          }}
        />
      )}
    </div>
  )
}

// --- Formulário de obrigação (criar/editar) ----------------------------
function ObligationForm({ projectId, obrigacao, onClose, onSaved }) {
  const [form, setForm] = useState(obrigacao ? { ...vazio, ...obrigacao } : vazio)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao,
        responsavel: form.responsavel,
        prazo: form.prazo,
        prioridade: form.prioridade,
        status: form.status,
      }
      if (obrigacao) await obligationsApi.update(obrigacao.id, payload)
      else await obligationsApi.create(projectId, payload)
      onSaved()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal title={obrigacao ? 'Editar obrigação' : 'Nova obrigação'} onClose={onClose} width={540}>
      <form onSubmit={salvar}>
        {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}

        <div className="field">
          <label>Título *</label>
          <input value={form.titulo} onChange={set('titulo')} placeholder="Ex.: Entregar relatório mensal" required />
        </div>

        <div className="field">
          <label>Descrição</label>
          <textarea value={form.descricao} onChange={set('descricao')} placeholder="Detalhes da obrigação…" />
        </div>

        <div className={styles.formRow}>
          <div className="field">
            <label>Responsável</label>
            <input value={form.responsavel} onChange={set('responsavel')} placeholder="Nome" />
          </div>
          <div className="field">
            <label>Prazo</label>
            <input type="date" value={form.prazo} onChange={set('prazo')} />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className="field">
            <label>Prioridade</label>
            <select value={form.prioridade} onChange={set('prioridade')}>
              {Object.entries(OBLIGATION_PRIORITY).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={set('status')}>
              {Object.entries(OBLIGATION_STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar obrigação'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
