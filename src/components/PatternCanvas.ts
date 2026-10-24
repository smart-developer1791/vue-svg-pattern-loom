import { defineComponent, h, useId, type FunctionalComponent, type PropType } from 'vue'
import { motifShapes, placements, repeatHeight, type Motif, type Pattern } from '../domain/pattern'
const renderers: Record<Motif, FunctionalComponent<{ pattern: Pattern }>> = {
  petal: ({ pattern }) =>
    h(
      'g',
      { 'data-motif': 'petal' },
      motifShapes({ ...pattern, motif: 'petal' }).map((shape) => h(shape.tag, shape.attrs)),
    ),
  orbit: ({ pattern }) =>
    h(
      'g',
      { 'data-motif': 'orbit' },
      motifShapes({ ...pattern, motif: 'orbit' }).map((shape) => h(shape.tag, shape.attrs)),
    ),
  weave: ({ pattern }) =>
    h(
      'g',
      { 'data-motif': 'weave' },
      motifShapes({ ...pattern, motif: 'weave' }).map((shape) => h(shape.tag, shape.attrs)),
    ),
  sprig: ({ pattern }) =>
    h(
      'g',
      { 'data-motif': 'sprig' },
      motifShapes({ ...pattern, motif: 'sprig' }).map((shape) => h(shape.tag, shape.attrs)),
    ),
}
export default defineComponent({
  props: {
    pattern: { type: Object as PropType<Pattern>, required: true },
    tileView: Boolean,
    boundaries: Boolean,
  },
  setup(props) {
    const id = `loom-${useId().replace(/[^a-zA-Z0-9-]/g, '-')}`
    return () => {
      const p = props.pattern,
        height = repeatHeight(p),
        width = props.tileView ? p.tile : 760,
        viewHeight = props.tileView ? height : 560
      const motif = renderers[p.motif]
      const children = [
        h('defs', [
          h('pattern', { id, patternUnits: 'userSpaceOnUse', width: p.tile, height }, [
            h('rect', { width: p.tile, height, fill: p.background }),
            ...placements(p).map(({ x, y }) =>
              h('g', { transform: `translate(${x} ${y}) rotate(${p.rotation})` }, [
                h(motif, { pattern: p }),
              ]),
            ),
          ]),
        ]),
        h('rect', { width, height: viewHeight, fill: `url(#${id})` }),
      ]
      if (props.boundaries)
        children.push(
          ...Array.from({ length: Math.ceil(width / p.tile) + 1 }, (_, index) =>
            h('line', {
              x1: index * p.tile,
              x2: index * p.tile,
              y1: 0,
              y2: viewHeight,
              stroke: p.ink,
              'stroke-opacity': 0.35,
              'stroke-dasharray': '4 5',
              'vector-effect': 'non-scaling-stroke',
            }),
          ),
          ...Array.from({ length: Math.ceil(viewHeight / height) + 1 }, (_, index) =>
            h('line', {
              x1: 0,
              x2: width,
              y1: index * height,
              y2: index * height,
              stroke: p.ink,
              'stroke-opacity': 0.35,
              'stroke-dasharray': '4 5',
              'vector-effect': 'non-scaling-stroke',
            }),
          ),
        )
      return h(
        'svg',
        {
          viewBox: `0 0 ${width} ${viewHeight}`,
          role: 'img',
          'aria-label': p.title,
          class: 'pattern-canvas',
          preserveAspectRatio: props.tileView ? 'xMidYMid meet' : 'xMidYMid slice',
        },
        children,
      )
    }
  },
})
