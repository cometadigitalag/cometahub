// Gestão de colaboradores (admin): cards com foto, nome e cargo. Ao clicar,
// mostra as empresas atribuídas e a função em cada uma. Criar/editar define
// perfil, módulos, cargo e foto (upload S3).
import { useEffect, useState } from 'react'
import { usersApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { MODULES, ROLE_LABELS } from '../lib/constants'
import Avatar from '../components/Avatar'
import Modal from '../components/Modal'
import styles from './Colaboradores.module.css'

const vazio = { nome: '', email: '', senha: '', role: 'colaborador', permissions: [], cargo: '' }

export default function Colaboradores() {
  const { user: atual } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [detalhe, setDetalhe] = useState(null) // colaborador cujo detalhe (empresas) está aberto

  async function carregar() {
    setCarregando(true)
    try {
      setUsuarios(await usersApi.list())
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function excluir(u) {
    if (!confirm(`Excluir o colaborador "${u.nome}"?`)) return
    try {
      await usersApi.remove(u.id)
      carregar()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <header className={styles.head}>
        <div>
          <h1>Colaboradores</h1>
          <p className="muted">Clique num colaborador para ver as empresas e a função dele em cada uma.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditando(null); setModalAberto(true) }}>
          + Novo colaborador
        </button>
      </header>

      {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}

      {carregando ? (
        <p className="muted">Carregando…</p>
      ) : (
        <div className={styles.grid}>
          {usuarios.map((u) => (
            <div key={u.id} className={`${styles.card} glass`} onClick={() => setDetalhe(u)} role="button" tabIndex={0}>
              <Avatar nome={u.nome} fotoUrl={u.fotoUrl} size={64} />
              <div className={styles.info}>
                <strong>
                  {u.nome}
                  {u.id === atual?.id && <em className={styles.voce}> (você)</em>}
                </strong>
                <span className={styles.cargo}>{u.cargo || '—'}</span>
                <span className={`${styles.badge} ${u.role === 'admin' ? styles.admin : ''}`}>
                  {ROLE_LABELS[u.role] || u.role}
                </span>
              </div>
              <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                <button className={styles.iconBtn} title="Editar" onClick={() => { setEditando(u); setModalAberto(true) }}>✎</button>
                {u.id !== atual?.id && (
                  <button className={styles.iconBtn} title="Excluir" onClick={() => excluir(u)}>🗑</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <ColaboradorForm
          colaborador={editando}
          onClose={() => setModalAberto(false)}
          onSaved={() => { setModalAberto(false); carregar() }}
        />
      )}

      {detalhe && <DetalheColaborador colaborador={detalhe} onClose={() => setDetalhe(null)} />}
    </div>
  )
}

// --- Detalhe: empresas atribuídas + função -----------------------------
function DetalheColaborador({ colaborador, onClose }) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    usersApi.assignments(colaborador.id).then(setDados).catch((e) => setErro(e.message))
  }, [colaborador.id])

  return (
    <Modal title="Colaborador" onClose={onClose} width={480}>
      <div className={styles.detalheHead}>
        <Avatar nome={colaborador.nome} fotoUrl={colaborador.fotoUrl} size={64} />
        <div>
          <strong className={styles.detalheNome}>{colaborador.nome}</strong>
          <div className={styles.detalheCargo}>{colaborador.cargo || 'Sem cargo definido'}</div>
          <div className="muted" style={{ fontSize: '0.8rem' }}>{colaborador.email}</div>
        </div>
      </div>

      <h4 className={styles.detalheTitulo}>Empresas atribuídas</h4>
      {erro && <div className="error-msg">{erro}</div>}
      {!dados ? (
        <p className="muted">Carregando…</p>
      ) : dados.empresas.length === 0 ? (
        <p className="muted">Este colaborador ainda não está atribuído a nenhuma empresa.</p>
      ) : (
        <div className={styles.empresas}>
          {dados.empresas.map((e) => (
            <div key={e.projectId} className={styles.empresaRow}>
              <div>
                <strong>{e.nome}</strong>
                {e.cliente && <span className="muted"> · {e.cliente}</span>}
              </div>
              <span className={styles.funcaoTag}>{e.funcao || 'sem função'}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

// --- Formulário de colaborador (criar/editar) --------------------------
function ColaboradorForm({ colaborador, onClose, onSaved }) {
  const [form, setForm] = useState(
    colaborador
      ? { ...vazio, ...colaborador, senha: '', permissions: colaborador.permissions || [] }
      : vazio,
  )
  const [fotoUrl, setFotoUrl] = useState(colaborador?.fotoUrl || '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [enviandoFoto, setEnviandoFoto] = useState(false)

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  function toggleModulo(key) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((k) => k !== key)
        : [...f.permissions, key],
    }))
  }

  async function enviarFoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setEnviandoFoto(true)
    setErro('')
    try {
      const atualizado = await usersApi.uploadPhoto(colaborador.id, file)
      setFotoUrl(atualizado.fotoUrl)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviandoFoto(false)
    }
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        cargo: form.cargo,
        role: form.role,
        permissions: form.role === 'admin' ? [] : form.permissions,
      }
      if (form.senha) payload.senha = form.senha
      if (colaborador) await usersApi.update(colaborador.id, payload)
      else await usersApi.create(payload)
      onSaved()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal title={colaborador ? 'Editar colaborador' : 'Novo colaborador'} onClose={onClose} width={520}>
      <form onSubmit={salvar}>
        {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}

        {colaborador && (
          <div className={styles.fotoRow}>
            <Avatar nome={form.nome} fotoUrl={fotoUrl} size={64} />
            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
              {enviandoFoto ? 'Enviando…' : 'Trocar foto'}
              <input type="file" accept="image/*" hidden onChange={enviarFoto} disabled={enviandoFoto} />
            </label>
          </div>
        )}

        <div className={styles.formRow}>
          <div className="field">
            <label>Nome *</label>
            <input value={form.nome} onChange={set('nome')} placeholder="Nome do colaborador" required />
          </div>
          <div className="field">
            <label>Cargo</label>
            <input value={form.cargo} onChange={set('cargo')} placeholder="Ex.: Designer, Social Media" />
          </div>
        </div>

        <div className="field">
          <label>E-mail *</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="email@cometahub.com" required />
        </div>
        <div className="field">
          <label>{colaborador ? 'Nova senha (opcional)' : 'Senha *'}</label>
          <input
            type="password"
            value={form.senha}
            onChange={set('senha')}
            placeholder={colaborador ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
            autoComplete="new-password"
            required={!colaborador}
          />
        </div>

        <div className="field">
          <label>Perfil</label>
          <select value={form.role} onChange={set('role')}>
            <option value="colaborador">Colaborador (acesso limitado)</option>
            <option value="admin">Administrador (acesso total + gerencia colaboradores)</option>
          </select>
        </div>

        {form.role === 'colaborador' && (
          <div className="field">
            <label>Módulos que este colaborador pode ver</label>
            <div className={styles.modList}>
              {MODULES.map((m) => (
                <label key={m.key} className={styles.modItem}>
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(m.key)}
                    onChange={() => toggleModulo(m.key)}
                  />
                  <span className={styles.modIcon}>{m.icon}</span>
                  {m.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {!colaborador && (
          <p className="muted" style={{ fontSize: '0.76rem' }}>
            A foto pode ser enviada depois de criar, clicando em editar o colaborador.
          </p>
        )}

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
