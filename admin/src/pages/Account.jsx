// Página de conta: atualizar nome, e-mail e senha do usuário logado.
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Account() {
  const { user, updateAccount } = useAuth()
  const [nome, setNome] = useState(user?.nome || '')
  const [email, setEmail] = useState(user?.email || '')
  const [senha, setSenha] = useState('')
  const [msg, setMsg] = useState(null) // { tipo, texto }
  const [salvando, setSalvando] = useState(false)

  async function salvar(e) {
    e.preventDefault()
    setMsg(null)
    setSalvando(true)
    try {
      const payload = { nome, email }
      if (senha) payload.senha = senha
      await updateAccount(payload)
      setSenha('')
      setMsg({ tipo: 'ok', texto: 'Conta atualizada com sucesso.' })
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div style={{ maxWidth: 460 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.3rem' }}>
        Minha conta
      </h1>
      <p className="muted" style={{ marginBottom: '1.6rem' }}>
        Atualize seus dados de acesso ao painel.
      </p>

      <form className="glass" style={{ padding: '1.6rem' }} onSubmit={salvar}>
        {msg && (
          <div
            className={msg.tipo === 'ok' ? '' : 'error-msg'}
            style={
              msg.tipo === 'ok'
                ? {
                    color: '#22c55e',
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.7rem 0.85rem',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                  }
                : { marginBottom: '1rem' }
            }
          >
            {msg.texto}
          </div>
        )}

        <div className="field">
          <label>Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="field">
          <label>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Nova senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Deixe em branco para manter a atual"
            autoComplete="new-password"
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={salvando} style={{ marginTop: '0.4rem' }}>
          {salvando ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
