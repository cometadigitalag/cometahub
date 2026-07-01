// Tela de login do painel.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await login(email, senha)
      navigate('/', { replace: true })
    } catch (err) {
      setErro(err.message || 'Não foi possível entrar.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={`${styles.card} glass`} onSubmit={onSubmit}>
        <div className={styles.brand}>
          <span className={styles.logo}>✦</span>
          <h1>CometaHub</h1>
          <p className="muted">Painel interno da agência</p>
        </div>

        {erro && <div className="error-msg">{erro}</div>}

        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@cometahub.com"
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={enviando} style={{ width: '100%' }}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
