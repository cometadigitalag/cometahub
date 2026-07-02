// Gestão de colaboradores (admin): listar, criar, editar e excluir usuários,
// definindo o perfil e quais módulos cada colaborador enxerga.
import { useEffect, useState } from 'react'
import { usersApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { MODULES, ROLE_LABELS } from '../lib/constants'
import Modal from '../components/Modal'
import styles from './Colaboradores.module.css'

const vazio = { nome: '', email: '', senha: '', role: 'colaborador', permissions: [] }

export default function Colaboradores() {
  const { user: atual } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

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
          <p className="muted">Crie acessos e escolha quais módulos cada pessoa pode ver.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditando(null)
            setModalAberto(true)
          }}
        >
          + Novo colaborador
        </button>
      </header>

      {erro && <div className="error-msg" style={{ marginBottom: '1rem' }}>{erro}</div>}

      {carregando ? (
        <p className="muted">Carregando…</p>
      ) : (
        <div className={`${styles.table} glass`}>
          <div className={`${styles.row} ${styles.header}`}>
            <span>Nome</span>
            <span>E-mail</span>
            <span>Perfil</span>
            <span>Módulos</span>
            <span></span>
          </div>
          {usuarios.map((u) => (
            <div key={u.id} className={styles.row}>
              <span className={styles.nome}>
                {u.nome}
                {u.id === atual?.id && <em className={styles.voce}> (você)</em>}
              </span>
              <span className={styles.email}>{u.email}</span>
              <span>
                <span className={`${styles.badge} ${u.role === 'admin' ? styles.admin : ''}`}>
                  {ROLE_LABELS[u.role] || u.role}
                </span>
              </span>
              <span className={styles.mods}>
                {u.role === 'admin'
                  ? 'Todos'
                  : u.permissions.length
                    ? u.permissions
                        .map((k) => MODULES.find((m) => m.key === k)?.label || k)
                        .join(', ')
                    : '—'}
              </span>
              <span className={styles.actions}>
                <button
                  className={styles.iconBtn}
                  title="Editar"
                  onClick={() => {
                    setEditando(u)
                    setModalAberto(true)
                  }}
                >
                  ✎
                </button>
                {u.id !== atual?.id && (
                  <button className={styles.iconBtn} title="Excluir" onClick={() => excluir(u)}>
                    🗑
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <ColaboradorForm
          colaborador={editando}
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

// --- Formulário de colaborador (criar/editar) --------------------------
function ColaboradorForm({ colaborador, onClose, onSaved }) {
  const [form, setForm] = useState(
    colaborador
      ? { ...vazio, ...colaborador, senha: '', permissions: colaborador.permissions || [] }
      : vazio,
  )
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  function toggleModulo(key) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((k) => k !== key)
        : [...f.permissions, key],
    }))
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const payload = {
        nome: form.nome,
        email: form.email,
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

        <div className="field">
          <label>Nome *</label>
          <input value={form.nome} onChange={set('nome')} placeholder="Nome do colaborador" required />
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
            <span className="muted" style={{ fontSize: '0.76rem' }}>
              O Dashboard e a própria conta ficam sempre visíveis.
            </span>
          </div>
        )}

        <div className={styles.formActions}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
