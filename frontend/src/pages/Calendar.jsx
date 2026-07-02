// Calendário da empresa/projeto: grade mensal (estilo Google Agenda) com as
// rotinas recorrentes. Dá para marcar cada ocorrência como feita/pendente e
// gerenciar as rotinas (criar/editar/excluir).
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi, routinesApi } from '../lib/api'
import {
  WEEKDAYS,
  ROUTINE_TYPES,
  ROUTINE_COLORS,
  MONTH_NAMES,
  recurrenceLabel,
} from '../lib/constants'
import Modal from '../components/Modal'
import ProjectTabs from '../components/ProjectTabs'
import styles from './Calendar.module.css'

const pad = (n) => String(n).padStart(2, '0')
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const vazio = {
  titulo: '',
  descricao: '',
  tipo: 'semanal',
  diasSemana: [],
  diaMes: 1,
  data: '',
  horario: '',
  cor: ROUTINE_COLORS[0],
  dataInicio: '',
  dataFim: '',
}

export default function Calendar() {
  const { id } = useParams()
  const hoje = fmt(new Date())
  const [ref, setRef] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [projeto, setProjeto] = useState(null)
  const [dias, setDias] = useState({})
  const [rotinas, setRotinas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [gerenciar, setGerenciar] = useState(false)

  // Dias renderizados na grade (6 semanas a partir do domingo anterior ao dia 1).
  const gridDays = useMemo(() => {
    const first = new Date(ref.year, ref.month, 1)
    const offset = first.getDay() // 0=Dom
    return Array.from({ length: 42 }, (_, i) => new Date(ref.year, ref.month, 1 - offset + i))
  }, [ref])

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const start = fmt(gridDays[0])
      const end = fmt(gridDays[41])
      const [proj, cal] = await Promise.all([
        projectsApi.get(id),
        routinesApi.calendar(id, start, end),
      ])
      setProjeto(proj)
      setDias(cal.dias || {})
      setRotinas(cal.routines || [])
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ref])

  function mudarMes(delta) {
    setRef((r) => {
      const m = r.month + delta
      return { year: r.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })
  }
  function irHoje() {
    const d = new Date()
    setRef({ year: d.getFullYear(), month: d.getMonth() })
  }

  // Alterna feito/pendente de uma ocorrência (otimista).
  async function toggle(occ) {
    const novo = occ.status === 'concluido' ? 'pendente' : 'concluido'
    setDias((prev) => {
      const lista = (prev[occ.date] || []).map((o) =>
        o.routineId === occ.routineId ? { ...o, status: novo } : o,
      )
      return { ...prev, [occ.date]: lista }
    })
    try {
      await routinesApi.setCompletion(occ.routineId, occ.date, novo)
    } catch {
      carregar()
    }
  }

  async function excluirRotina(r) {
    if (!confirm(`Excluir a rotina "${r.titulo}"?`)) return
    await routinesApi.remove(r.id)
    carregar()
  }

  const weeks = []
  for (let i = 0; i < 6; i++) weeks.push(gridDays.slice(i * 7, i * 7 + 7))

  return (
    <div>
      <Link to="/projetos" className={styles.back}>
        ← Projetos
      </Link>

      <header className={styles.head}>
        <div>
          <h1>{projeto?.nome}</h1>
          <p className="muted">Calendário de rotinas {projeto?.cliente ? `• ${projeto.cliente}` : ''}</p>
        </div>
        <div className={styles.headActions}>
          <button className="btn btn-ghost btn-sm" onClick={() => setGerenciar((v) => !v)}>
            {gerenciar ? 'Ver calendário' : 'Gerenciar rotinas'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditando(null)
              setModalAberto(true)
            }}
          >
            + Nova rotina
          </button>
        </div>
      </header>

      <ProjectTabs id={id} active="calendario" />

      {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}

      {gerenciar ? (
        <RotinasList rotinas={rotinas} onEdit={(r) => { setEditando(r); setModalAberto(true) }} onDelete={excluirRotina} />
      ) : (
        <>
          <div className={styles.toolbar}>
            <div className={styles.monthNav}>
              <button className={styles.navBtn} onClick={() => mudarMes(-1)} aria-label="Mês anterior">‹</button>
              <strong>{MONTH_NAMES[ref.month]} {ref.year}</strong>
              <button className={styles.navBtn} onClick={() => mudarMes(1)} aria-label="Próximo mês">›</button>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={irHoje}>Hoje</button>
          </div>

          <div className={`${styles.calendar} glass`}>
            <div className={styles.weekHeader}>
              {WEEKDAYS.map((w) => (
                <div key={w.n} className={styles.weekday}>{w.curto}</div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className={styles.week}>
                {week.map((d) => {
                  const ds = fmt(d)
                  const outro = d.getMonth() !== ref.month
                  const occs = dias[ds] || []
                  return (
                    <div key={ds} className={`${styles.day} ${outro ? styles.outside : ''} ${ds === hoje ? styles.today : ''}`}>
                      <span className={styles.dayNum}>{d.getDate()}</span>
                      <div className={styles.occs}>
                        {occs.map((o) => (
                          <button
                            key={o.routineId}
                            className={`${styles.occ} ${o.status === 'concluido' ? styles.done : ''}`}
                            style={{ '--c': o.cor }}
                            onClick={() => toggle(o)}
                            title={`${o.titulo}${o.horario ? ' • ' + o.horario : ''} — clique para marcar ${o.status === 'concluido' ? 'pendente' : 'feito'}`}
                          >
                            <span className={styles.occDot} />
                            {o.horario && <span className={styles.occTime}>{o.horario}</span>}
                            <span className={styles.occTitle}>{o.titulo}</span>
                            {o.status === 'concluido' && <span className={styles.check}>✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {carregando && <p className="muted" style={{ marginTop: '0.8rem' }}>Atualizando…</p>}
          <p className="muted" style={{ marginTop: '0.8rem', fontSize: '0.8rem' }}>
            Clique numa rotina do dia para marcar como <strong>feita</strong> ou <strong>pendente</strong>.
          </p>
        </>
      )}

      {modalAberto && (
        <RoutineForm
          projectId={id}
          rotina={editando}
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

// --- Lista de rotinas (modo gerenciar) ---------------------------------
function RotinasList({ rotinas, onEdit, onDelete }) {
  if (!rotinas.length) {
    return (
      <div className={`${styles.emptyList} glass`}>
        <p>Nenhuma rotina cadastrada nesta empresa ainda.</p>
        <p className="muted">Clique em “+ Nova rotina” para criar (ex.: enviar mensagem todo dia).</p>
      </div>
    )
  }
  return (
    <div className={`${styles.list} glass`}>
      {rotinas.map((r) => (
        <div key={r.id} className={styles.listItem}>
          <span className={styles.listDot} style={{ background: r.cor }} />
          <div className={styles.listInfo}>
            <strong>{r.titulo}</strong>
            <span className="muted">
              {recurrenceLabel(r)}
              {r.horario ? ` • ${r.horario}` : ''}
              {!r.ativo ? ' • (inativa)' : ''}
            </span>
          </div>
          <div className={styles.listActions}>
            <button className={styles.iconBtn} title="Editar" onClick={() => onEdit(r)}>✎</button>
            <button className={styles.iconBtn} title="Excluir" onClick={() => onDelete(r)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Formulário de rotina ----------------------------------------------
function RoutineForm({ projectId, rotina, onClose, onSaved }) {
  const [form, setForm] = useState(
    rotina
      ? {
          ...vazio,
          ...rotina,
          diaMes: rotina.diaMes || 1,
          diasSemana: String(rotina.diasSemana || '')
            .split(',')
            .filter(Boolean)
            .map(Number),
        }
      : vazio,
  )
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  function toggleDia(n) {
    setForm((f) => ({
      ...f,
      diasSemana: f.diasSemana.includes(n)
        ? f.diasSemana.filter((d) => d !== n)
        : [...f.diasSemana, n],
    }))
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao,
        tipo: form.tipo,
        horario: form.horario,
        cor: form.cor,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        diasSemana: form.tipo === 'semanal' ? form.diasSemana : [],
        diaMes: form.tipo === 'mensal' ? Number(form.diaMes) : null,
        data: form.tipo === 'unica' ? form.data : '',
      }
      if (rotina) await routinesApi.update(rotina.id, payload)
      else await routinesApi.create(projectId, payload)
      onSaved()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal title={rotina ? 'Editar rotina' : 'Nova rotina'} onClose={onClose} width={540}>
      <form onSubmit={salvar}>
        {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}

        <div className="field">
          <label>Título *</label>
          <input value={form.titulo} onChange={set('titulo')} placeholder="Ex.: Enviar mensagem no grupo do WhatsApp" required />
        </div>
        <div className="field">
          <label>Descrição</label>
          <textarea value={form.descricao} onChange={set('descricao')} placeholder="Detalhes da rotina…" />
        </div>

        <div className={styles.formRow}>
          <div className="field">
            <label>Repetição</label>
            <select value={form.tipo} onChange={set('tipo')}>
              {Object.entries(ROUTINE_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Horário (opcional)</label>
            <input type="time" value={form.horario} onChange={set('horario')} />
          </div>
        </div>

        {form.tipo === 'semanal' && (
          <div className="field">
            <label>Dias da semana *</label>
            <div className={styles.weekPick}>
              {WEEKDAYS.map((w) => (
                <button
                  type="button"
                  key={w.n}
                  className={`${styles.weekChip} ${form.diasSemana.includes(w.n) ? styles.weekOn : ''}`}
                  onClick={() => toggleDia(w.n)}
                >
                  {w.curto}
                </button>
              ))}
            </div>
          </div>
        )}

        {form.tipo === 'mensal' && (
          <div className="field">
            <label>Dia do mês *</label>
            <input type="number" min="1" max="31" value={form.diaMes} onChange={set('diaMes')} />
          </div>
        )}

        {form.tipo === 'unica' && (
          <div className="field">
            <label>Data *</label>
            <input type="date" value={form.data} onChange={set('data')} required />
          </div>
        )}

        <div className="field">
          <label>Cor</label>
          <div className={styles.colors}>
            {ROUTINE_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                className={`${styles.colorDot} ${form.cor === c ? styles.colorOn : ''}`}
                style={{ background: c }}
                onClick={() => setForm((f) => ({ ...f, cor: c }))}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>

        {form.tipo !== 'unica' && (
          <div className={styles.formRow}>
            <div className="field">
              <label>Início (opcional)</label>
              <input type="date" value={form.dataInicio} onChange={set('dataInicio')} />
            </div>
            <div className="field">
              <label>Fim (opcional)</label>
              <input type="date" value={form.dataFim} onChange={set('dataFim')} />
            </div>
          </div>
        )}

        <div className={styles.formActions}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar rotina'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
