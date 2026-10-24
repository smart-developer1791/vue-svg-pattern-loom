import test from 'node:test'
import assert from 'node:assert/strict'
import { motifs, parsePattern, placements, repeatHeight, sample } from '../src/domain/pattern.ts'
import { patternSVG } from '../src/domain/export.ts'
test('straight and half-drop layouts have full repeating periods and boundary copies', () => {
  assert.equal(repeatHeight(sample), 200)
  assert.equal(repeatHeight({ ...sample, stagger: false }), 100)
  const points = placements(sample)
  assert.ok(points.some((p) => p.x < 0) && points.some((p) => p.x >= 100))
  assert.ok(points.some((p) => p.y < 0) && points.some((p) => p.y >= 200))
  assert.ok(points.some((p) => p.x === 50 && p.y === 50))
  assert.ok(points.some((p) => p.x === 100 && p.y === 150))
})
test('each motif exports bounded standalone vector artwork with its recipe', () => {
  for (const motif of motifs) {
    const svg = patternSVG({ ...sample, motif, size: 100, rotation: 345, stroke: 12 }, 600, 400)
    assert.match(svg, /width="600" height="400" viewBox="0 0 600 400"/)
    assert.match(svg, /patternUnits="userSpaceOnUse" width="100" height="200"/)
    assert.match(svg, /rotate\(345\)/)
    assert.match(svg, /PL-[0-9A-F]{8}/)
    assert.doesNotMatch(svg, /<script|href=|NaN|Infinity|stroke-dasharray/)
  }
})
test('export escapes user titles and rejects dimensions and colors outside the contract', () => {
  assert.match(
    patternSVG({ ...sample, title: '<img onerror="bad"> & hello' }),
    /&lt;img onerror=&quot;bad&quot;&gt; &amp; hello/,
  )
  assert.throws(() => patternSVG(sample, 10, 2049))
  assert.throws(() => patternSVG(sample, NaN, 100))
  assert.throws(() => parsePattern({ ...sample, background: 'url(https://example.com)' }))
  assert.throws(() => parsePattern({ ...sample, rotation: 3.5 }))
})
test('imports reconstruct known fields and reject unsupported recipes', () => {
  assert.deepEqual(parsePattern({ ...sample, provenance: {} }), sample)
  assert.throws(() => parsePattern({ ...sample, format: 'PL/2' }))
  assert.throws(() => parsePattern({ ...sample, motif: 'unknown' }))
})
