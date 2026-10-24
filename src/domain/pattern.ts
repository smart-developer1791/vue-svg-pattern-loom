export const motifs = ['petal', 'orbit', 'weave', 'sprig'] as const
export type Motif = (typeof motifs)[number]
export interface Pattern {
  format: 'PL/1'
  title: string
  motif: Motif
  tile: number
  size: number
  rotation: number
  stroke: number
  stagger: boolean
  background: string
  ink: string
  detail: string
}
export const sample: Pattern = {
  format: 'PL/1',
  title: 'A little wildflower',
  motif: 'petal',
  tile: 100,
  size: 62,
  rotation: 0,
  stroke: 2,
  stagger: true,
  background: '#f8eddb',
  ink: '#bf664b',
  detail: '#dfa84e',
}
export const palettes = [
  { title: 'Warm terracotta', colors: ['#f8eddb', '#bf664b', '#dfa84e'] },
  { title: 'Quiet coast', colors: ['#e9f0ec', '#3f7280', '#9cb8a0'] },
  { title: 'After hours', colors: ['#242634', '#b1a5d0', '#e0b2a5'] },
]
export function parsePattern(input: unknown): Pattern {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Use a PL/1 pattern recipe.')
  const p = input as Record<string, unknown>
  if (p.format !== 'PL/1' || !motifs.includes(p.motif as Motif) || typeof p.stagger !== 'boolean')
    throw new Error('Use a supported PL/1 motif and repeat layout.')
  if (typeof p.title !== 'string' || !p.title.trim() || p.title.length > 80)
    throw new Error('Name your pattern in 1–80 characters.')
  const n = (key: string, min: number, max: number) => {
    const v = p[key]
    if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max)
      throw new Error(`${key} must be an integer from ${min} to ${max}.`)
    return v
  }
  const color = (key: string) => {
    const value = p[key]
    if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value))
      throw new Error('Colors must be six-digit hex values.')
    return value
  }
  return {
    format: 'PL/1',
    title: p.title,
    motif: p.motif as Motif,
    tile: n('tile', 48, 200),
    size: n('size', 15, 100),
    rotation: n('rotation', 0, 360),
    stroke: n('stroke', 1, 12),
    stagger: p.stagger,
    background: color('background'),
    ink: color('ink'),
    detail: color('detail'),
  }
}
export interface Shape {
  tag: 'circle' | 'path' | 'rect' | 'line' | 'ellipse'
  attrs: Record<string, number | string>
}
export function motifShapes(p: Pattern): Shape[] {
  const r = (p.tile * p.size) / 200,
    ink = p.ink,
    detail = p.detail
  switch (p.motif) {
    case 'petal':
      return [0, 90, 180, 270]
        .map((angle) => ({
          tag: 'ellipse' as const,
          attrs: {
            cx: 0,
            cy: -r * 0.5,
            rx: r * 0.28,
            ry: r * 0.52,
            fill: ink,
            transform: `rotate(${angle})`,
          },
        }))
        .concat([
          {
            tag: 'ellipse',
            attrs: {
              cx: 0,
              cy: 0,
              rx: r * 0.18,
              ry: r * 0.18,
              fill: detail,
              transform: 'rotate(0)',
            },
          },
        ])
    case 'orbit':
      return [
        {
          tag: 'circle',
          attrs: { cx: 0, cy: 0, r: r * 0.8, fill: 'none', stroke: ink, 'stroke-width': p.stroke },
        },
        { tag: 'circle', attrs: { cx: 0, cy: 0, r: r * 0.43, fill: detail } },
        { tag: 'circle', attrs: { cx: r * 0.8, cy: 0, r: Math.max(2, r * 0.15), fill: ink } },
      ]
    case 'weave':
      return [
        {
          tag: 'rect',
          attrs: {
            x: -r * 0.83,
            y: -r * 0.17,
            width: r * 1.66,
            height: r * 0.34,
            rx: r * 0.15,
            fill: ink,
            transform: 'rotate(45)',
          },
        },
        {
          tag: 'rect',
          attrs: {
            x: -r * 0.83,
            y: -r * 0.17,
            width: r * 1.66,
            height: r * 0.34,
            rx: r * 0.15,
            fill: detail,
            transform: 'rotate(-45)',
          },
        },
      ]
    case 'sprig':
      return [
        {
          tag: 'path',
          attrs: {
            d: `M 0 ${r} Q ${-r * 0.4} 0 0 ${-r}`,
            fill: 'none',
            stroke: ink,
            'stroke-width': p.stroke,
            'stroke-linecap': 'round',
          },
        },
        ...[-1, 1].flatMap((side) =>
          [-0.45, 0.25].map((y) => ({
            tag: 'ellipse' as const,
            attrs: {
              cx: side * r * 0.22,
              cy: y * r,
              rx: r * 0.16,
              ry: r * 0.36,
              fill: side === 1 ? ink : detail,
              transform: `rotate(${side * 42} ${side * r * 0.22} ${y * r})`,
            },
          })),
        ),
      ]
  }
}
export function repeatHeight(p: Pattern) {
  return p.tile * (p.stagger ? 2 : 1)
}
export function placements(p: Pattern) {
  const rows = p.stagger ? [-1, 0, 1, 2] : [-1, 0, 1]
  return rows.flatMap((row) =>
    [-1, 0, 1].map((column) => ({
      x: p.tile * (column + 0.5 + (p.stagger && Math.abs(row % 2) === 1 ? 0.5 : 0)),
      y: p.tile * (row + 0.5),
    })),
  )
}
