import React from 'react'

/**
 * FinalCrest – brasão para a FINAL (coroa + escudo, sem asas)
 * - Sem dependência de fontes externas
 * - Letras com fill em gradiente e stroke para destaque
 * - Tamanho controlado por width; a altura respeita o aspecto do viewBox
 */
export default function FinalCrest({
  width = 220,
  title = 'FINAL',
  subtitle = 'LIGA AMIGOS DO FTV',
  variant = 'gold', // 'gold' | 'pink'
  className = '',
}) {
  const ratio = 1.2 // altura ~= width * 1.2 (viewBox 300x360)
  const height = Math.round(width * ratio)

  // Cores dos temas
  const goldStops = [
    { o: '0%', c: '#f8e28a' },
    { o: '40%', c: '#f0c65b' },
    { o: '100%', c: '#b8871e' },
  ]
  const pinkStops = [
    { o: '0%', c: '#ff6aa3' },
    { o: '100%', c: '#ff2b77' },
  ]
  const stops = variant === 'pink' ? pinkStops : goldStops
  const gradId = `crest-grad-${variant}`
  const glowId = `crest-glow-${variant}`

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 360"
      className={className}
      role="img"
      aria-label={`${title} – ${subtitle || 'Final'}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          {stops.map(s => (
            <stop key={s.o} offset={s.o} stopColor={s.c} />
          ))}
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f0c65b" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Coroa simples */}
      <g filter={`url(#${glowId})`}>
        <path
          d="M60 60 L100 20 L120 50 L150 15 L180 50 L200 20 L240 60 L220 80 L80 80 Z"
          fill={`url(#${gradId})`}
          stroke="#111"
          strokeWidth="2"
        />
      </g>

      {/* Escudo (dupla borda) */}
      <g transform="translate(30,80)">
        <path
          d="M120 0 L180 0 C200 0 210 10 215 30 C220 50 220 75 220 90 C220 150 190 195 120 230 C50 195 20 150 20 90 C20 75 20 50 25 30 C30 10 40 0 60 0 Z"
          fill="#0b0b0b"
          stroke={`url(#${gradId})`}
          strokeWidth="6"
          filter={`url(#${glowId})`}
        />
        <path
          d="M120 10 L175 10 C192 10 198 15 202 30 C206 45 206 67 206 86 C206 138 178 178 120 207 C62 178 34 138 34 86 C34 67 34 45 38 30 C42 15 48 10 65 10 Z"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="2"
        />

        {/* Título */}
        <g transform="translate(120,86)" textAnchor="middle" dominantBaseline="middle">
          <text
            x="0"
            y="0"
            style={{
              fontFamily: 'Impact, Arial Black, system-ui, sans-serif',
              fontSize: 44,
              letterSpacing: 2,
              fontWeight: 900,
            }}
            fill={`url(#${gradId})`}
            stroke="#0a0a0a"
            strokeWidth="2.5"
          >
            {title}
          </text>
        </g>

        {/* Subtítulo opcional */}
        {subtitle && (
          <g transform="translate(120,128)" textAnchor="middle" dominantBaseline="middle">
            <text
              x="0"
              y="0"
              style={{
                fontFamily: 'Impact, Arial Black, system-ui, sans-serif',
                fontSize: 12,
                letterSpacing: 1.2,
                fontWeight: 800,
              }}
              fill="#e5e5e5"
              opacity="0.9"
            >
              {subtitle}
            </text>
          </g>
        )}
      </g>
    </svg>
  )
}
