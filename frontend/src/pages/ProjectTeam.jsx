// Equipe do projeto/empresa: colaboradores atribuídos e a função de cada um.
// Admin pode adicionar, editar a função e remover; os demais só visualizam.
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi, membersApi, usersApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { isAdmin } from '../lib/constants'
import Avatar from '../components/Avatar'
import Modal from '../components/Modal'
import ProjectTabs from '../components/ProjectTabs'
import styles from './ProjectTeam.module.css'

export default function ProjectTeam() {
  const { id } = useParams()
  const { user } = useAuth()
  const admin = isAdmin(user)
  const [projeto, setProjeto] = useState(null)
  const [membros, setMembros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

  async function carregar() {
    setCarregando(true)
    try {
      const [proj, mem] = await Promise.all([projectsApi.get(id), membersApi.listByProject(id)])
      setProjeto(proj)
      setMembros(mem)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function remover(m) {
    if (!confirm(`Remover ${m.nome} da equipe desta empresa?`)) return
    await membersApi.remove(m.id)
    carregar()
  }

  return (
    <div>
      <Link to="/projetos" className={styles.back}>← Projetos</Link>

      <header className={styles.head}>
        <div>
          <h1>{projeto?.nome}</h1>
          <p className="muted">Equipe {projeto?.cliente ? `• ${projeto.cliente}` : ''}</p>
        </div>
        {admin && (
          <button
            className="btn btn-primary"
            onClick={() => { setEditando(null); setModalAberto(true) }}
          >
            + Adicionar membro
          </button>
        )}
      </header>

      <ProjectTabs id={id} active="equipe" />

      {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}

      {carregando ? (
        <p className="muted">Carregando…</p>
      ) : membros.length === 0 ? (
        <div className={`${styles.empty} glass`}>
          <p>Nenhum colaborador atribuído a esta empresa ainda.</p>
          {admin && (
            <button className="btn btn-primary" onClick={() => { setEditando(null); setModalAberto(true) }}>
              Adicionar o primeiro
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {membros.map((m) => (
            <div key={m.id} className={`${styles.card} glass`}>
              <Avatar nome={m.nome} fotoUrl={m.fotoUrl} size={56} />
              <div className={styles.info}>
                <strong>{m.nome}</strong>
                {m.cargo && <span className={styles.cargo}>{m.cargo}</span>}
                <span className={styles.funcao}>
                  {m.funcao ? m.funcao : <em className="muted">sem função definida</em>}
                </span>
              </div>
              {admin && (
                <div className={styles.actions}>
                  <button className={styles.iconBtn} title="Editar função" onClick={() => { setEditando(m); setModalAberto(true) }}>✎</button>
                  <button className={styles.iconBtn} title="Remover" onClick={() => remover(m)}>🗑</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <MemberForm
          projectId={id}
          membro={editando}
          existentes={membros}
          onClose={() => setModalAberto(false)}
          onSaved={() => { setModalAberto(false); carregar() }}
        />
      )}
    </div>
  )
}

// --- Formulário: adicionar membro ou editar função --------------------
function MemberForm({ projectId, membro, existentes, onClose, onSaved }) {
  const [colaboradores, setColaboradores] = useState([])
  const [userId, setUserId] = useState(membro?.userId || '')
  const [funcao, setFuncao] = useState(membro?.funcao || '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!membro) usersApi.assignable().then(setColaboradores).catch(() => setColaboradores([]))
  }, [membro])

  const jaNaEquipe = new Set(existentes.map((m) => m.userId))
  const disponiveis = colaboradores.filter((c) => !jaNaEquipe.has(c.id))

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      if (membro) await membersApi.update(membro.id, { funcao })
      else await membersApi.add(projectId, { userId, funcao })
      onSaved()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal title={membro ? `Função de ${membro.nome}` : 'Adicionar membro'} onClose={onClose} width={460}>
      <form onSubmit={salvar}>
        {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}

        {!membro && (
          <div className="field">
            <label>Colaborador *</label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
              <option value="">— Selecione —</option>
              {disponiveis.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}{c.cargo ? ` — ${c.cargo}` : ''}
                </option>
              ))}
            </select>
            {disponiveis.length === 0 && (
              <span className="muted" style={{ fontSize: '0.76rem' }}>
                Todos os colaboradores já estão nesta empresa.
              </span>
            )}
          </div>
        )}

        <div className="field">
          <label>Função nesta empresa</label>
          <input
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            placeholder="Ex.: Social Media, Designer, Gestor de tráfego…"
          />
        </div>

        <div className={styles.formActions}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={salvando || (!membro && !userId)}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
