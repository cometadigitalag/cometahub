// Dashboard: visão geral dos projetos da agência.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { PROJECT_STATUS, formatDate, canModule } from '../lib/constants'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  const temProjetos = canModule(user, 'projetos')
  const [projetos, setProjetos] = useState([])
  const [carregando, setCarregando] = useState(temProjetos)

  useEffect(() => {
    // Só busca projetos se o usuário tiver acesso ao módulo.
    if (!temProjetos) return
    projectsApi
      .list()
      .then(setProjetos)
      .finally(() => setCarregando(false))
  }, [temProjetos])

  const totalObrigacoes = projetos.reduce((s, p) => s + (p._count?.obligations ?? 0), 0)
  const ativos = projetos.filter((p) => p.status === 'ativo').length
  const concluidos = projetos.filter((p) => p.status === 'concluido').length

  const cards = [
    { label: 'Projetos', valor: projetos.length, cor: 'var(--color-primary-glow)' },
    { label: 'Ativos', valor: ativos, cor: '#22c55e' },
    { label: 'Concluídos', valor: concluidos, cor: '#3b82f6' },
    { label: 'Obrigações', valor: totalObrigacoes, cor: '#eab308' },
  ]

  return (
    <div>
      <header className={styles.head}>
        <h1>Olá, {user?.nome?.split(' ')[0]} 👋</h1>
        <p className="muted">Visão geral da sua agência.</p>
      </header>

      {!temProjetos ? (
        <div className={`${styles.empty} glass`}>
          <p>Seu acesso está configurado para os módulos liberados no menu ao lado.</p>
          <p className="muted">Fale com um administrador se precisar de mais permissões.</p>
        </div>
      ) : (
        <>
          <div className={styles.stats}>
            {cards.map((c) => (
              <div key={c.label} className={`${styles.stat} glass`}>
                <span className={styles.statValue} style={{ color: c.cor }}>
                  {carregando ? '—' : c.valor}
                </span>
                <span className={styles.statLabel}>{c.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.sectionHead}>
        <h2>Projetos recentes</h2>
        <Link to="/projetos" className="btn btn-ghost btn-sm">
          Ver todos
        </Link>
      </div>

      {carregando ? (
        <p className="muted">Carregando…</p>
      ) : projetos.length === 0 ? (
        <div className={`${styles.empty} glass`}>
          <p>Nenhum projeto ainda.</p>
          <Link to="/projetos" className="btn btn-primary">
            Cadastrar projeto
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {projetos.slice(0, 6).map((p) => {
            const st = PROJECT_STATUS[p.status] || PROJECT_STATUS.ativo
            return (
              <Link key={p.id} to={`/projetos/${p.id}/roadmap`} className={`${styles.row} glass`}>
                <div>
                  <strong>{p.nome}</strong>
                  {p.cliente && <span className={styles.cliente}> · {p.cliente}</span>}
                </div>
                <div className={styles.rowMeta}>
                  <span className="muted">{p._count?.obligations ?? 0} obrigações</span>
                  {p.dataFim && <span className="muted">Prazo {formatDate(p.dataFim)}</span>}
                  <span className="badge" style={{ color: st.color }}>
                    {st.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
        </>
      )}
    </div>
  )
}
