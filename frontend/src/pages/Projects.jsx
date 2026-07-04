// Página de Projetos: lista, cria, edita e exclui projetos da agência.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi, usersApi, membersApi } from '../lib/api'
import { PROJECT_STATUS, formatDate, isAdmin } from '../lib/constants'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import Modal from '../components/Modal'
import styles from './Projects.module.css'

const vazio = {
  nome: '',
  cliente: '',
  descricao: '',
  status: 'ativo',
  dataInicio: '',
  dataFim: '',
}

export default function Projects() {
  const [projetos, setProjetos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null) // projeto em edição ou null

  async function carregar() {
    setCarregando(true)
    try {
      setProjetos(await projectsApi.list())
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function abrirNovo() {
    setEditando(null)
    setModalAberto(true)
  }
  function abrirEdicao(p) {
    setEditando(p)
    setModalAberto(true)
  }

  async function excluir(p) {
    if (!confirm(`Excluir o projeto "${p.nome}" e todas as suas obrigações?`)) return
    await projectsApi.remove(p.id)
    carregar()
  }

  return (
    <div>
      <header className={styles.head}>
        <div>
          <h1>Projetos</h1>
          <p className="muted">Cadastre os projetos e monte o roadmap de obrigações de cada um.</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNovo}>
          + Novo projeto
        </button>
      </header>

      {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}

      {carregando ? (
        <p className="muted">Carregando…</p>
      ) : projetos.length === 0 ? (
        <div className={`${styles.empty} glass`}>
          <p>Nenhum projeto cadastrado ainda.</p>
          <button className="btn btn-primary" onClick={abrirNovo}>
            Cadastrar o primeiro projeto
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {projetos.map((p) => {
            const st = PROJECT_STATUS[p.status] || PROJECT_STATUS.ativo
            return (
              <div key={p.id} className={`${styles.card} glass`}>
                <div className={styles.cardTop}>
                  <span className="badge" style={{ color: st.color }}>
                    {st.label}
                  </span>
                  <div className={styles.actions}>
                    <button className={styles.iconBtn} onClick={() => abrirEdicao(p)} title="Editar">
                      ✎
                    </button>
                    <button className={styles.iconBtn} onClick={() => excluir(p)} title="Excluir">
                      🗑
                    </button>
                  </div>
                </div>

                <h3>{p.nome}</h3>
                {p.cliente && <p className={styles.cliente}>{p.cliente}</p>}
                {p.descricao && <p className={styles.desc}>{p.descricao}</p>}

                <div className={styles.meta}>
                  <span>{p._count?.obligations ?? 0} obrigações</span>
                  {p.dataFim && <span>Prazo: {formatDate(p.dataFim)}</span>}
                </div>

                <div className={styles.cardLinks}>
                  <Link to={`/projetos/${p.id}/roadmap`} className="btn btn-ghost btn-sm">
                    Roadmap
                  </Link>
                  <Link to={`/projetos/${p.id}/calendario`} className="btn btn-ghost btn-sm">
                    Calendário
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalAberto && (
        <ProjectForm
          projeto={editando}
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

// --- Formulário de projeto (criar/editar) ------------------------------
function ProjectForm({ projeto, onClose, onSaved }) {
  const { user } = useAuth()
  const admin = isAdmin(user)
  const [form, setForm] = useState(projeto ? { ...vazio, ...projeto } : vazio)
  const [colaboradores, setColaboradores] = useState([])
  const [selecionados, setSelecionados] = useState([]) // userIds ao criar
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  // Seleção de colaboradores só ao criar (admin atribui os membros da empresa).
  useEffect(() => {
    if (!projeto && admin) {
      usersApi.assignable().then(setColaboradores).catch(() => setColaboradores([]))
    }
  }, [projeto, admin])

  function toggle(userId) {
    setSelecionados((s) => (s.includes(userId) ? s.filter((x) => x !== userId) : [...s, userId]))
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const payload = {
        nome: form.nome,
        cliente: form.cliente,
        descricao: form.descricao,
        status: form.status,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
      }
      if (projeto) {
        await projectsApi.update(projeto.id, payload)
      } else {
        const novo = await projectsApi.create(payload)
        // Atribui os colaboradores selecionados como membros da empresa.
        await Promise.all(
          selecionados.map((userId) => membersApi.add(novo.id, { userId }).catch(() => null)),
        )
      }
      onSaved()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal title={projeto ? 'Editar projeto' : 'Novo projeto'} onClose={onClose} width={540}>
      <form onSubmit={salvar}>
        {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}

        <div className="field">
          <label>Nome do projeto *</label>
          <input value={form.nome} onChange={set('nome')} placeholder="Ex.: Campanha de lançamento" required />
        </div>

        <div className="field">
          <label>Cliente</label>
          <input value={form.cliente} onChange={set('cliente')} placeholder="Ex.: ACME Ltda." />
        </div>

        <div className="field">
          <label>Descrição</label>
          <textarea value={form.descricao} onChange={set('descricao')} placeholder="Resumo do escopo…" />
        </div>

        <div className={styles.row}>
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={set('status')}>
              {Object.entries(PROJECT_STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Início</label>
            <input type="date" value={form.dataInicio} onChange={set('dataInicio')} />
          </div>
          <div className="field">
            <label>Prazo final</label>
            <input type="date" value={form.dataFim} onChange={set('dataFim')} />
          </div>
        </div>

        {!projeto && admin && (
          <div className="field">
            <label>Colaboradores desta empresa</label>
            {colaboradores.length === 0 ? (
              <span className="muted" style={{ fontSize: '0.78rem' }}>
                Nenhum colaborador cadastrado. Você pode adicionar depois na aba Equipe.
              </span>
            ) : (
              <div className={styles.colabPick}>
                {colaboradores.map((c) => (
                  <label
                    key={c.id}
                    className={`${styles.colabItem} ${selecionados.includes(c.id) ? styles.colabOn : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selecionados.includes(c.id)}
                      onChange={() => toggle(c.id)}
                      hidden
                    />
                    <Avatar nome={c.nome} fotoUrl={c.fotoUrl} size={30} />
                    <span className={styles.colabNome}>
                      {c.nome}
                      {c.cargo ? <em className={styles.colabCargo}> · {c.cargo}</em> : ''}
                    </span>
                    {selecionados.includes(c.id) && <span className={styles.colabCheck}>✓</span>}
                  </label>
                ))}
              </div>
            )}
            <span className="muted" style={{ fontSize: '0.75rem' }}>
              A função de cada um você define na aba Equipe da empresa.
            </span>
          </div>
        )}

        <div className={styles.formActions}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar projeto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
