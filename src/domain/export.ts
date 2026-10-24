import { motifShapes, parsePattern, placements, repeatHeight, type Pattern } from './pattern.ts'
import { stamp } from '../services/files.ts'
const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!,
  )
export function patternSVG(input: Pattern, width = 1000, height = 1000) {
  const p = parsePattern(input)
  if (![width, height].every((n) => Number.isInteger(n) && n >= 48 && n <= 2048))
    throw new Error('Export dimensions must be 48–2048 px.')
  const shapes = motifShapes(p)
    .map(
      (shape) =>
        `<${shape.tag} ${Object.entries(shape.attrs)
          .map(([key, value]) => `${key}="${escape(String(value))}"`)
          .join(' ')}/>`,
    )
    .join('')
  const copies = placements(p)
    .map(
      (point) =>
        `<g transform="translate(${point.x} ${point.y}) rotate(${p.rotation})">${shapes}</g>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title"><title id="title">${escape(p.title)}</title><metadata>${escape(JSON.stringify({ project: 'vue-svg-pattern-loom', author: 'CodeSculptor', marker: stamp('PL', p), recipe: p }))}</metadata><defs><pattern id="loom-repeat" patternUnits="userSpaceOnUse" width="${p.tile}" height="${repeatHeight(p)}"><rect width="${p.tile}" height="${repeatHeight(p)}" fill="${p.background}"/>${copies}</pattern></defs><rect width="${width}" height="${height}" fill="url(#loom-repeat)"/></svg>`
}
