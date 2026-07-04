// Avatar do colaborador: mostra a foto (se houver) ou as iniciais do nome.
function iniciais(nome) {
  return (nome || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

export default function Avatar({ nome, fotoUrl, size = 44 }) {
  const base = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    objectFit: 'cover',
  }
  if (fotoUrl) {
    return <img src={fotoUrl} alt={nome} style={{ ...base, border: '1px solid var(--glass-border)' }} />
  }
  return (
    <div
      style={{
        ...base,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--gradient-primary)',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.38,
      }}
    >
      {iniciais(nome)}
    </div>
  )
}
