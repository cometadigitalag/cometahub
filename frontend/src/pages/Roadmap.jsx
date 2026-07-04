// Roadmap da empresa: primeiro os colaboradores atribuídos; ao clicar num
// colaborador, abre o quadro kanban só com as obrigações vinculadas a ele
// (responsável). Também há a visão "Sem responsável".
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi, obligationsApi, membersApi } from '../lib/api'
import {
  OBLIGATION_STATUS,
  OBLIGATION_PRIORITY,
  ROADMAP_COLUMNS,
  formatDate,
} from '../lib/constants'
import Avatar from '../components/Avatar'
import Modal from '../components/Modal'
import ProjectTabs from '../components/ProjectTabs'
import styles from './Roadmap.module.css'

const SEM = '__sem__' // filtro: obrigações sem responsável

const vazio = {
  titulo: '',
  descricao: '',
  responsavel: '',
  responsavelEmail: '',
  prazo: '',
  prioridade: 'media',
  status: 'pendente',
}

export default function Roadmap() {
  const { id } = useParams()
  const [projeto, setProjeto] = useState(null)
  const [itens, setItens] = useState([])
  const [membros, setMembros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [filtro, setFiltro] = useState(null) // null = lista de colaboradores; email | SEM = quadro
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

  async function carregar() {
    setCarregando(true)
    try {
      const [proj, obrigacoes, mem] = await Promise.all([
        projectsApi.get(id),
        obligationsApi.listByProject(id),
        membersApi.listByProject(id),
      ])
      setProjeto(proj)
      setItens(obrigacoes)
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

  async function mover(item, direcao) {
    const atual = ROADMAP_COLUMNS.indexOf(item.status)
    const novo = ROADMAP_COLUMNS[atual + direcao]
    if (!novo) return
    setItens((lista) => lista.map((o) => (o.id === item.id ? { ...o, status: novo } : o)))
    try {
      await obligationsApi.update(item.id, { status: novo })
    } catch {
      carregar()
    }
  }

  async function excluir(item) {
    if (!confirm(`Excluir a obrigação "${item.titulo}"?`)) return
    await obligationsApi.remove(item.id)
    carregar()
  }

  if (carregando) return <p className="muted">Carregando roadmap…</p>
  if (erro) return <div className="error-msg">{erro}</div>

  const countDe = (email) => itens.filter((o) => (o.responsavelEmail || '') === email).length
  const concluidasDe = (email) =>
    itens.filter((o) => (o.responsavelEmail || '') === email && o.status === 'concluido').length
  const semResp = itens.filter((o) => !o.responsavelEmail).length

  // Itens do quadro conforme o colaborador selecionado.
  const filtrados =
    filtro === SEM
      ? itens.filter((o) => !o.responsavelEmail)
      : itens.filter((o) => o.responsavelEmail === filtro)

  const membroAtual = membros.find((m) => m.email === filtro)
  const total = filtrados.length
  const concluidas = filtrados.filter((o) => o.status === 'concluido').length
  const progresso = total ? Math.round((concluidas / total) * 100) : 0

  // Opções de responsável para o formulário (equipe da empresa).
  const colaboradores = membros.map((m) => ({ id: m.userId, nome: m.nome, email: m.email }))

  return (
    <div>
      <Link to="/projetos" className={styles.back}>← Projetos</Link>

      <header className={styles.head}>
        <div>
          <h1>{projeto?.nome}</h1>
          <p className="muted">
            Roadmap de obrigações {projeto?.cliente ? `• ${projeto.cliente}` : ''}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditando(null); setModalAberto(true) }}
        >
          + Nova obrigação
        </button>
      </header>

      <ProjectTabs id={id} active="roadmap" />

      {filtro === null ? (
        /* ---- Visão 1: colaboradores da empresa ---- */
        <MembrosView
          membros={membros}
          countDe={countDe}
          concluidasDe={concluidasDe}
          semResp={semResp}
          onSelecionar={setFiltro}
        />
      ) : (
        /* ---- Visão 2: quadro do colaborador selecionado ---- */
        <>
          <button className={styles.voltar} onClick={() => setFiltro(null)}>← Colaboradores</button>

          <div className={styles.boardHeader}>
            <div className={styles.boardWho}>
              {filtro === SEM ? (
                <>
                  <div className={styles.semAvatar}>?</div>
                  <div>
                    <strong>Sem responsável</strong>
                    <span className="muted">Obrigações ainda não atribuídas</span>
                  </div>
                </>
              ) : (
                <>
                  <Avatar nome={membroAtual?.nome} fotoUrl={membroAtual?.fotoUrl} size={48} />
                  <div>
                    <strong>{membroAtual?.nome || filtro}</strong>
                    <span className="muted">
                      {membroAtual?.funcao || membroAtual?.cargo || 'Colaborador'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={`${styles.progress} glass`}>
            <div className={styles.progressInfo}>
              <span>Progresso</span>
              <strong>{concluidas}/{total} concluídas ({progresso}%)</strong>
            </div>
            <div className={styles.bar}>
              <div className={styles.barFill} style={{ width: `${progresso}%` }} />
            </div>
          </div>

          <div className={styles.board}>
            {ROADMAP_COLUMNS.map((coluna) => {
              const st = OBLIGATION_STATUS[coluna]
              const daColuna = filtrados.filter((o) => o.status === coluna)
              return (
                <div key={coluna} className={styles.column}>
                  <div className={styles.colHeader}>
                    <span className="badge" style={{ color: st.color }}>{st.label}</span>
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
                            <span className={styles.priority} style={{ color: pr.color }}>● {pr.label}</span>
                            <div className={styles.cardActions}>
                              <button className={styles.iconBtn} onClick={() => { setEditando(item); setModalAberto(true) }} title="Editar">✎</button>
                              <button className={styles.iconBtn} onClick={() => excluir(item)} title="Excluir">🗑</button>
                            </div>
                          </div>
                          <strong className={styles.cardTitle}>{item.titulo}</strong>
                          {item.descricao && <p className={styles.cardDesc}>{item.descricao}</p>}
                          <div className={styles.cardMeta}>
                            {item.prazo && <span>📅 {formatDate(item.prazo)}</span>}
                          </div>
                          <div className={styles.moveRow}>
                            <button className={styles.moveBtn} onClick={() => mover(item, -1)} disabled={idx === 0} title="Voltar etapa">←</button>
                            <button className={styles.moveBtn} onClick={() => mover(item, 1)} disabled={idx === ROADMAP_COLUMNS.length - 1} title="Avançar etapa">→</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {modalAberto && (
        <ObligationForm
          projectId={id}
          obrigacao={editando}
          colaboradores={colaboradores}
          presetEmail={!editando && filtro && filtro !== SEM ? filtro : ''}
          onClose={() => setModalAberto(false)}
          onSaved={() => { setModalAberto(false); carregar() }}
        />
      )}
    </div>
  )
}

// --- Visão dos colaboradores da empresa --------------------------------
function MembrosView({ membros, countDe, concluidasDe, semResp, onSelecionar }) {
  if (membros.length === 0 && semResp === 0) {
    return (
      <div className={`${styles.emptyMembros} glass`}>
        <p>Nenhum colaborador atribuído a esta empresa ainda.</p>
        <p className="muted">
          Adicione colaboradores na aba <strong>Equipe</strong> (ou ao criar a empresa) para
          organizar as obrigações por responsável.
        </p>
      </div>
    )
  }
  return (
    <div className={styles.membros}>
      {membros.map((m) => {
        const total = countDe(m.email)
        const feitas = concluidasDe(m.email)
        return (
          <button key={m.id} className={`${styles.membroCard} glass`} onClick={() => onSelecionar(m.email)}>
            <Avatar nome={m.nome} fotoUrl={m.fotoUrl} size={56} />
            <div className={styles.membroInfo}>
              <strong>{m.nome}</strong>
              <span className={styles.membroFuncao}>{m.funcao || m.cargo || 'Colaborador'}</span>
              <span className={styles.membroCount}>
                {total} obrigaç{total === 1 ? 'ão' : 'ões'}
                {total > 0 ? ` • ${feitas} concluída${feitas === 1 ? '' : 's'}` : ''}
              </span>
            </div>
            <span className={styles.membroSeta}>→</span>
          </button>
        )
      })}

      {semResp > 0 && (
        <button className={`${styles.membroCard} glass`} onClick={() => onSelecionar(SEM)}>
          <div className={styles.semAvatar}>?</div>
          <div className={styles.membroInfo}>
            <strong>Sem responsável</strong>
            <span className={styles.membroFuncao}>Não atribuídas</span>
            <span className={styles.membroCount}>{semResp} obrigaç{semResp === 1 ? 'ão' : 'ões'}</span>
          </div>
          <span className={styles.membroSeta}>→</span>
        </button>
      )}
    </div>
  )
}

// --- Formulário de obrigação (criar/editar) ----------------------------
function ObligationForm({ projectId, obrigacao, colaboradores, presetEmail, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    if (obrigacao) return { ...vazio, ...obrigacao }
    if (presetEmail) {
      const c = colaboradores.find((x) => x.email === presetEmail)
      return { ...vazio, responsavelEmail: presetEmail, responsavel: c ? c.nome : '' }
    }
    return vazio
  })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  function selecionarResponsavel(e) {
    const email = e.target.value
    const u = colaboradores.find((c) => c.email === email)
    setForm((f) => ({ ...f, responsavelEmail: email, responsavel: u ? u.nome : '' }))
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao,
        responsavel: form.responsavel,
        responsavelEmail: form.responsavelEmail,
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

  const semEquipe = colaboradores.length === 0

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
            <select value={form.responsavelEmail} onChange={selecionarResponsavel}>
              <option value="">— Sem responsável —</option>
              {form.responsavelEmail && !colaboradores.some((c) => c.email === form.responsavelEmail) && (
                <option value={form.responsavelEmail}>{form.responsavel || form.responsavelEmail}</option>
              )}
              {colaboradores.map((c) => (
                <option key={c.id} value={c.email}>{c.nome}</option>
              ))}
            </select>
            {semEquipe && (
              <span className="muted" style={{ fontSize: '0.75rem' }}>
                Adicione colaboradores na aba Equipe para atribuir.
              </span>
            )}
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
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={set('status')}>
              {Object.entries(OBLIGATION_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar obrigação'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
