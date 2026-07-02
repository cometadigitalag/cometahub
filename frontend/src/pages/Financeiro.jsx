// Módulo Financeiro (em construção) — já existe para controle de permissão.
export default function Financeiro() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', marginBottom: '0.3rem' }}>
        Financeiro
      </h1>
      <p className="muted" style={{ marginBottom: '2rem' }}>
        Controle financeiro dos projetos e da agência.
      </p>

      <div
        className="glass"
        style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}
      >
        <div style={{ fontSize: '2.4rem', marginBottom: '0.8rem' }}>＄</div>
        <strong style={{ display: 'block', marginBottom: '0.4rem', color: '#fff' }}>
          Módulo em construção
        </strong>
        <p className="muted">
          Em breve: receitas, despesas e faturamento por projeto. O acesso a este módulo já pode ser
          liberado/bloqueado por colaborador.
        </p>
      </div>
    </div>
  )
}
