<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppDialog from './components/AppDialog.vue'
import AppIcon from './components/AppIcon.vue'
import PatternCanvas from './components/PatternCanvas'
import {
  motifs,
  palettes,
  parsePattern,
  repeatHeight,
  sample,
  type Pattern,
} from './domain/pattern'
import { patternSVG } from './domain/export'
import { useDraft } from './services/draft'
import { clone, download, stamp } from './services/files'
const { draft, storageStatus } = useDraft('svg-pattern-loom:PL1', clone(sample), parsePattern)
const valid = ref<Pattern>(parsePattern(draft.value)),
  problem = ref('')
watch(
  draft,
  (value) => {
    try {
      valid.value = parsePattern(value)
      problem.value = ''
    } catch (error) {
      problem.value = (error as Error).message
    }
  },
  { deep: true, flush: 'sync' },
)
const tileView = ref(false),
  boundaries = ref(false),
  exchange = ref(false),
  importOpen = ref(false),
  restore = ref(false)
const importText = ref(''),
  importError = ref(''),
  status = ref('A small motif. A world of possibilities.'),
  width = ref(1000),
  height = ref(1000)
const marker = computed(() => stamp('PL', valid.value)),
  exportError = computed(() => {
    try {
      patternSVG(valid.value, width.value, height.value)
      return ''
    } catch (error) {
      return (error as Error).message
    }
  })
const names = {
  petal: 'Little petals',
  orbit: 'Quiet orbits',
  weave: 'Woven together',
  sprig: 'Garden sprigs',
}
const descriptions = {
  petal: 'Four soft petals meet a sunny little center.',
  orbit: 'A small moon keeps company with a gentle ring.',
  weave: 'Two rounded threads cross, then begin again.',
  sprig: 'A bending stem carries four leaves into the repeat.',
}
function palette(colors: string[]) {
  draft.value.background = colors[0]!
  draft.value.ink = colors[1]!
  draft.value.detail = colors[2]!
  status.value = 'A new palette, the same little pattern.'
}
function restoreSample() {
  draft.value = clone(sample)
  restore.value = false
}
function exportJSON() {
  download(
    'pattern-recipe.json',
    JSON.stringify(
      {
        ...valid.value,
        provenance: {
          project: 'vue-svg-pattern-loom',
          author: 'CodeSculptor',
          marker: marker.value,
        },
      },
      null,
      2,
    ),
  )
}
function exportSVG(tile = false) {
  download(
    tile ? 'pattern-tile.svg' : 'pattern-fabric.svg',
    patternSVG(
      valid.value,
      tile ? valid.value.tile : width.value,
      tile ? repeatHeight(valid.value) : height.value,
    ),
    'image/svg+xml',
  )
  status.value = tile ? 'Repeat tile downloaded.' : 'Pattern artwork downloaded.'
}
function importRecipe() {
  try {
    draft.value = parsePattern(JSON.parse(importText.value))
    importOpen.value = false
    importError.value = ''
    status.value = 'Pattern recipe imported.'
  } catch (error) {
    importError.value = (error as Error).message
  }
}
async function readFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 20000) {
    importError.value = 'Use a recipe below 20 KB.'
    return
  }
  importText.value = await file.text()
  importError.value = ''
}
</script>
<template>
  <div
    class="[&_main]:max-w-380 [&_main]:py-0 [&_main]:px-9.5 [&_main]:my-0 [&_main]:mx-auto [@media(width<=700px)]:[&_main]:px-4 [@media(700px<width<=1000px)]:[&_main]:px-[25px] [@media(1000px<width<=1100px)]:[&_main]:px-6"
  >
    <header
      class="min-h-21.5 flex items-center justify-between gap-6 border-b [border-bottom-style:solid] border-b-line bg-surface py-5 px-9.5 [@media(width<=700px)]:gap-4 [@media(width<=700px)]:flex-wrap [@media(width<=700px)]:py-4.5 [@media(width<=700px)]:px-4 [@media(700px<width<=1100px)]:py-4.5 [@media(700px<width<=1100px)]:px-6 [@media(1600px<=width)]:px-[max(38px,_calc((100vw_-_1444px)_/_2))]"
    >
      <a
        class="font-display flex gap-[13px] items-center text-[length:24px] font-[650] tracking-[-0.8px] [@media(width<=700px)]:text-[length:21px]"
        href="/"
        aria-label="SVG Pattern Loom home"
        ><span
          class="w-10.5 h-10.5 rounded-[13px] bg-accent text-on-accent grid place-items-center text-[length:30px] relative [&_span]:text-[length:16px] [&_span]:absolute [&_span]:right-[5px] [&_span]:bottom-1"
          >✳</span
        ><span
          >Pattern Loom<span
            class="block font-sans text-[length:8px] tracking-[1.5px] font-semibold text-muted mt-[3px]"
            >A LITTLE REPETITION STUDIO</span
          ></span
        ></a
      >
      <div
        class="flex items-center gap-3 [@media(width<=700px)]:gap-2 [@media(width<=700px)]:w-full [@media(width<=700px)]:justify-end [@media(width<=700px)]:[&_>_button]:flex-1"
      >
        <span
          class="flex items-center gap-[7px] text-[length:11px] text-muted mr-3 [@media(width<=700px)]:hidden [@media(700px<width<=1100px)]:hidden"
          ><span class="inline-block w-1.5 h-1.5 rounded-[50%] bg-accent shrink-0" />{{
            storageStatus
          }}</span
        ><button
          class="inline-flex items-center justify-center gap-[9px] min-h-10 font-semibold leading-[1.3] rounded-[9px] border border-solid border-line [transition:background_0.15s] bg-surface text-ink py-2.5 px-[15px] [&:hover]:bg-hover"
          @click="importOpen = true"
        >
          <AppIcon name="upload" />Import</button
        ><button
          class="inline-flex items-center justify-center gap-[9px] min-h-10 font-semibold leading-[1.3] rounded-[9px] border border-solid border-[transparent] [transition:background_0.15s] bg-accent text-on-accent py-2.5 px-[15px] [&:hover]:[filter:brightness(0.96)]"
          :disabled="!!problem"
          @click="exchange = true"
        >
          <AppIcon name="download" />Export
        </button>
      </div>
    </header>
    <main>
      <section
        class="flex justify-between items-center min-h-60 gap-8 py-8.5 px-0 [@media(width<=700px)]:min-h-57.5 [@media(width<=700px)]:gap-3 [@media(width<=700px)]:py-7 [@media(700px<width<=1100px)]:min-h-55 [&_[data-ui~=eyebrow]]:mb-[15px] [&_>_div_>_p:last-child]:mt-4 [&_>_div_>_p:last-child]:text-[length:14px] [&_>_div_>_p:last-child]:text-muted [@media(width<=700px)]:[&_>_div_>_p:last-child]:text-[length:13px] [@media(width<=700px)]:[&_h1]:text-[length:35px]"
      >
        <div>
          <p data-ui="eyebrow" class="text-[length:10px] font-[750] tracking-[1.8px] text-muted">
            GOOD THINGS BEAR REPEATING
          </p>
          <h1>One little motif.<br /><span class="text-accent">Endless possibility.</span></h1>
          <p>Weave colors and shapes into a pattern that feels like you.</p>
        </div>
        <div
          class="relative w-75 h-45 shrink-0 [@media(width<=700px)]:w-[235px] [@media(width<=700px)]:hidden [@media(700px<width<=1000px)]:w-[235px] [&_>_span]:absolute [&_>_span]:left-8 [&_>_span]:bottom-[-10px] [&_>_span]:text-[length:8px] [&_>_span]:tracking-[2px] [&_>_span]:text-muted"
          aria-hidden="true"
        >
          <div
            data-ui="one"
            class="absolute w-[145px] h-[145px] border-[length:8px] border-solid border-[#fffdf9] border-b-[length:30px] shadow-[0_5px_12px_#473f231c] [&[data-ui~=one]]:left-[15px] [&[data-ui~=one]]:top-0.5 [&[data-ui~=one]]:[transform:rotate(-9deg)]"
          >
            <PatternCanvas :pattern="sample" />
          </div>
          <div
            data-ui="two"
            class="absolute w-[145px] h-[145px] border-[length:8px] border-solid border-[#fffdf9] border-b-[length:30px] shadow-[0_5px_12px_#473f231c] [&[data-ui~=two]]:right-[5px] [&[data-ui~=two]]:top-[25px] [&[data-ui~=two]]:[transform:rotate(12deg)]"
          >
            <PatternCanvas
              :pattern="{
                ...sample,
                motif: 'weave',
                background: '#e9f0ec',
                ink: '#3f7280',
                detail: '#9cb8a0',
              }"
            />
          </div>
          <span>A LITTLE SAMPLE BOOK</span>
        </div>
      </section>
      <div
        class="grid gap-[25px] [align-items:start] grid-cols-[320px_minmax(0,_1fr)] [@media(width<=700px)]:gap-5.5 [@media(width<=700px)]:grid-cols-[1fr] [@media(700px<width<=1000px)]:grid-cols-[270px_minmax(0,_1fr)]"
      >
        <section
          class="bg-surface border border-solid border-line rounded-[var(--radius)] min-w-0 h-[855px] flex flex-col p-[23px] [@media(width<=700px)]:h-[795px] [@media(width<=700px)]:p-5 [@media(700px<width<=1000px)]:h-250"
        >
          <div
            data-ui="panel-heading"
            class="flex items-center justify-between gap-3 mb-2 [&_+_p]:mb-5"
          >
            <h2>The pattern recipe</h2>
            <span
              class="text-[length:10px] font-semibold bg-hover border border-solid border-line rounded-[6px] whitespace-nowrap py-1 px-[7px]"
              >PL/1</span
            >
          </div>
          <p data-ui="muted" class="text-muted text-[length:12px]">
            A few small choices. A lovely big difference.
          </p>
          <div class="overflow-auto min-h-0 [scrollbar-width:thin] flex-1 pr-[5px]">
            <label>Pattern name<input v-model="draft.title" maxlength="80" /></label>
            <p data-ui="eyebrow" class="text-[length:10px] font-[750] tracking-[1.8px] text-muted">
              PICK YOUR LITTLE MOTIF
            </p>
            <div
              class="grid grid-cols-2 gap-2.5 mt-[15px] [&_button]:min-h-[85px] [&_button]:border [&_button]:border-solid [&_button]:border-line [&_button]:bg-surface [&_button]:text-ink [&_button]:rounded-[9px] [&_button]:text-[length:11px] [&_button]:py-[9px] [&_button]:px-[5px] [&_button_span]:block [&_button_span]:text-[length:31px] [&_button_span]:leading-[1.3] [&_button_span]:text-accent [&_button_span]:mb-[7px] [&_button.active]:bg-hover [&_button.active]:border-accent"
            >
              <button
                v-for="motif in motifs"
                :key="motif"
                :class="{ active: draft.motif === motif }"
                :aria-pressed="draft.motif === motif"
                @click="draft.motif = motif"
              >
                <span>{{ { petal: '✿', orbit: '◎', weave: '╳', sprig: '❧' }[motif] }}</span
                >{{ names[motif] }}
              </button>
            </div>
            <p data-ui="muted" class="text-muted text-[length:12px] min-h-[55px] mt-[13px]">
              {{ descriptions[draft.motif] }}
            </p>
            <hr />
            <label
              >Tile spacing
              <span class="[float:right] text-accent font-medium">{{ draft.tile }} px</span
              ><input v-model.number="draft.tile" type="range" min="48" max="200" /></label
            ><label
              >Motif size
              <span class="[float:right] text-accent font-medium">{{ draft.size }}%</span
              ><input v-model.number="draft.size" type="range" min="15" max="100" /></label
            ><label
              >Rotation
              <span class="[float:right] text-accent font-medium">{{ draft.rotation }}°</span
              ><input
                v-model.number="draft.rotation"
                type="range"
                min="0"
                max="360"
                step="15" /></label
            ><label
              >Line weight
              <span class="[float:right] text-accent font-medium">{{ draft.stroke }} px</span
              ><input
                v-model.number="draft.stroke"
                type="range"
                min="1"
                max="12"
                :disabled="!['orbit', 'sprig'].includes(draft.motif)"
            /></label>
            <p data-ui="muted" class="text-muted text-[length:12px]">
              Line weight applies to orbits and sprigs.
            </p>
            <label class="flex items-center gap-[9px] text-[length:11px] m-0"
              ><input v-model="draft.stagger" type="checkbox" /> Stagger every other row</label
            >
            <hr />
            <p data-ui="eyebrow" class="text-[length:10px] font-[750] tracking-[1.8px] text-muted">
              A PALETTE OF YOUR OWN
            </p>
            <div
              class="grid grid-cols-[1fr_1fr_1fr] gap-3 mt-[17px] [&_input[type='color']]:h-[45px] [&_input[type='color']]:p-[3px]"
            >
              <label>Paper<input v-model="draft.background" type="color" /></label
              ><label>Motif<input v-model="draft.ink" type="color" /></label
              ><label>Detail<input v-model="draft.detail" type="color" /></label>
            </div>
          </div>
        </section>
        <section>
          <div
            class="h-12 flex justify-between [align-items:start] gap-3 [&_[data-ui~=mono]]:text-[length:10px] [&_[data-ui~=mono]]:text-muted"
          >
            <h2>Your woven canvas</h2>
            <span
              data-ui="mono"
              class="font-[family-name:ui-monospace,_SFMono-Regular,_Consolas,_monospace]"
              >LIVE SVG</span
            >
          </div>
          <div class="border border-solid border-line rounded-[15px] overflow-hidden bg-surface">
            <div
              class="h-[49px] flex items-center justify-between gap-3 border-b [border-bottom-style:solid] border-b-line text-[length:10px] text-muted tracking-[1px] py-[15px] px-5 [@media(width<=700px)]:h-[55px] [@media(width<=700px)]:gap-2 [@media(width<=700px)]:text-[length:9px] [@media(width<=700px)]:tracking-[0] [@media(width<=700px)]:flex-wrap [@media(width<=700px)]:py-3.5 [@media(width<=700px)]:px-[13px] [@media(700px<width<=1000px)]:tracking-[0] [@media(700px<width<=1000px)]:py-3.5 [@media(700px<width<=1000px)]:px-[13px] [&_>_span]:flex [&_>_span]:items-center [&_>_span]:gap-[7px]"
            >
              <span
                ><span class="inline-block w-1.5 h-1.5 rounded-[50%] bg-accent shrink-0" />{{
                  tileView ? 'ONE COMPLETE REPEAT' : 'A LITTLE FABRIC PREVIEW'
                }}</span
              ><span>{{ valid.tile }} × {{ repeatHeight(valid) }} px repeat</span>
            </div>
            <div
              data-ui="fabric-stage"
              class="h-[555px] grid place-items-center overflow-hidden bg-canvas [@media(width<=700px)]:h-105 [&.tile-view]:p-[55px] [@media(width<=700px)]:[&.tile-view]:p-[25px] [&.tile-view_.pattern-canvas]:[filter:drop-shadow(0_8px_10px_#30281318)] [&.tile-view_.pattern-canvas]:max-h-[445px] [&.tile-view_.pattern-canvas]:max-w-95"
              :class="{ 'tile-view': tileView }"
            >
              <PatternCanvas :pattern="valid" :tile-view="tileView" :boundaries="boundaries" />
            </div>
            <div
              class="flex justify-between gap-3 border-t [border-top-style:solid] border-t-line text-[length:10px] text-muted py-[13px] px-5 [@media(width<=700px)]:flex-wrap"
            >
              <span>{{ names[valid.motif] }}</span
              ><span>{{ valid.stagger ? 'Half-drop repeat' : 'Straight repeat' }}</span>
            </div>
          </div>
          <div
            class="flex items-center justify-between gap-[15px] h-20 [@media(width<=700px)]:items-start [@media(width<=700px)]:gap-2 [@media(width<=700px)]:h-25 [@media(width<=700px)]:flex-col [@media(width<=700px)]:py-[13px] [@media(width<=700px)]:px-0"
          >
            <div
              class="flex gap-5.5 [&_button]:bg-[transparent] [&_button]:border-0 [&_button]:border-b-[length:2px] [&_button]:[border-bottom-style:solid] [&_button]:border-b-[transparent] [&_button]:text-muted [&_button]:font-semibold [&_button]:py-3 [&_button]:px-[1px] [@media(width<=700px)]:[&_button]:py-2 [&_button.active]:border-accent [&_button.active]:text-accent"
            >
              <button :class="{ active: !tileView }" @click="tileView = false">Fabric</button
              ><button :class="{ active: tileView }" @click="tileView = true">Repeat tile</button>
            </div>
            <label class="flex items-center gap-[9px] text-[length:11px] m-0"
              ><input v-model="boundaries" type="checkbox" /> Show tile edges</label
            >
          </div>
          <section
            class="mt-2 [@media(width<=1000px)]:[&_[data-ui~=panel-heading]]:flex-wrap [@media(width<=700px)]:[&_[data-ui~=panel-heading]_h2]:text-[length:17px]"
          >
            <div
              data-ui="panel-heading"
              class="flex items-center justify-between gap-3 mb-2 [&_+_p]:mb-5"
            >
              <h2>A few favorite palettes</h2>
              <span data-ui="muted" class="text-muted text-[length:12px]"
                >A starting point, always yours.</span
              >
            </div>
            <div
              class="grid grid-cols-[repeat(3,_1fr)] gap-[13px] mt-4 [@media(width<=700px)]:grid-cols-[1fr] [@media(width<=700px)]:mt-[15px] [@media(700px<width<=1000px)]:grid-cols-[1fr]"
            >
              <button
                v-for="p in palettes"
                :key="p.title"
                class="flex items-center flex-wrap gap-[13px] relative bg-surface border border-solid border-line rounded-[12px] text-left min-h-23 text-ink p-4 [@media(width<=700px)]:min-h-17.5 [@media(700px<width<=1000px)]:min-h-15 [&_strong]:text-[length:11px]"
                @click="palette(p.colors)"
              >
                <span
                  class="flex [&_i]:block [&_i]:w-6 [&_i]:h-6 [&_i]:rounded-[50%] [&_i]:border [&_i]:border-solid [&_i]:border-[#0000000b] [&_i]:ml-[-6px] [&_i:first-child]:m-0"
                  ><i v-for="color in p.colors" :key="color" :style="{ background: color }" /></span
                ><strong>{{ p.title }}</strong
                ><span class="text-[length:15px] text-muted ml-auto">↗</span>
              </button>
            </div>
          </section>
        </section>
      </div>
      <div
        class="min-h-15 mt-5 border-b [border-bottom-style:solid] border-b-line flex items-center justify-between gap-4 text-[length:12px] text-muted py-3.5 px-0 [@media(width<=700px)]:min-h-20.5 [@media(width<=700px)]:items-start [@media(width<=700px)]:gap-2 [@media(width<=700px)]:flex-col [&_[data-ui~=mono]]:text-[length:10px] [&_[data-ui~=mono]]:whitespace-nowrap"
        aria-live="polite"
      >
        <span :class="{ 'text-danger': !!problem }">{{ problem || status }}</span
        ><span
          data-ui="mono"
          class="font-[family-name:ui-monospace,_SFMono-Regular,_Consolas,_monospace]"
          >{{ marker }}</span
        >
      </div>
      <footer
        class="flex justify-between gap-[15px] text-[length:9px] tracking-[1.3px] text-muted py-7.5 px-0 [@media(width<=700px)]:gap-3 [@media(width<=700px)]:flex-col [@media(width<=700px)]:items-start [@media(width<=700px)]:py-6 [&_>_span:first-child]:font-bold [&_>_span:first-child]:text-ink [&_[data-ui~=muted]]:font-normal [&_[data-ui~=muted]]:tracking-[0]"
      >
        <span>Made to repeat. Made to keep. <span class="text-accent">CodeSculptor</span></span
        ><button
          class="inline-flex items-center justify-center gap-[9px] min-h-8 font-semibold leading-[1.3] rounded-[9px] border border-solid border-[transparent] [transition:background_0.15s] bg-[transparent] text-muted py-[7px] px-0.5"
          @click="restore = true"
        >
          Restore the sample
        </button>
      </footer>
    </main>
    <AppDialog v-model="exchange" title="Take your pattern with you"
      ><p data-ui="muted" class="text-muted">
        Standalone SVG artwork, a tile you can repeat, or the recipe for another day.
      </p>
      <div class="grid grid-cols-2 gap-3.5">
        <label
          >Artwork width · px<input
            v-model.number="width"
            type="number"
            min="48"
            max="2048" /></label
        ><label
          >Artwork height · px<input v-model.number="height" type="number" min="48" max="2048"
        /></label>
      </div>
      <p class="text-danger" role="alert">{{ exportError }}</p>
      <div
        class="flex flex-wrap gap-3 my-5.5 mx-0 [@media(width<=700px)]:[&_>_button]:flex-1 [@media(width<=700px)]:[&_>_button]:min-w-32.5"
      >
        <button
          class="inline-flex items-center justify-center gap-[9px] min-h-10 font-semibold leading-[1.3] rounded-[9px] border border-solid border-[transparent] [transition:background_0.15s] bg-accent text-on-accent py-2.5 px-[15px] [&:hover]:[filter:brightness(0.96)]"
          :disabled="!!exportError"
          @click="exportSVG()"
        >
          Download fabric SVG</button
        ><button
          class="inline-flex items-center justify-center gap-[9px] min-h-10 font-semibold leading-[1.3] rounded-[9px] border border-solid border-line [transition:background_0.15s] bg-surface text-ink py-2.5 px-[15px] [&:hover]:bg-hover"
          @click="exportSVG(true)"
        >
          Download repeat tile</button
        ><button
          class="inline-flex items-center justify-center gap-[9px] min-h-10 font-semibold leading-[1.3] rounded-[9px] border border-solid border-line [transition:background_0.15s] bg-surface text-ink py-2.5 px-[15px] [&:hover]:bg-hover"
          @click="exportJSON"
        >
          Download recipe JSON
        </button>
      </div>
      <p data-ui="muted" class="text-muted text-[length:12px]">
        Tile-edge guides belong to the preview. The artwork carries your colors, shapes, and project
        stamp.
      </p>
      <details>
        <summary>Inspect the SVG</summary>
        <pre v-if="!exportError">{{ patternSVG(valid, width, height) }}</pre>
      </details></AppDialog
    >
    <AppDialog v-model="importOpen" title="Import pattern recipe"
      ><label
        >Choose a JSON file<input
          type="file"
          accept=".json,application/json"
          @change="readFile" /></label
      ><label>Or paste PL/1 JSON<textarea v-model="importText" rows="7" /></label>
      <p class="text-danger" role="alert">{{ importError }}</p>
      <div
        class="flex flex-wrap gap-3 my-5.5 mx-0 [@media(width<=700px)]:[&_>_button]:flex-1 [@media(width<=700px)]:[&_>_button]:min-w-32.5"
      >
        <button
          class="inline-flex items-center justify-center gap-[9px] min-h-10 font-semibold leading-[1.3] rounded-[9px] border border-solid border-[transparent] [transition:background_0.15s] bg-accent text-on-accent py-2.5 px-[15px] [&:hover]:[filter:brightness(0.96)]"
          @click="importRecipe"
        >
          Import recipe</button
        ><a
          class="inline-flex items-center justify-center gap-[9px] min-h-8 font-semibold leading-[1.3] rounded-[9px] border border-solid border-[transparent] [transition:background_0.15s] bg-[transparent] text-muted py-[7px] px-0.5"
          href="/sample-workspace.json"
          download
          >Download sample JSON</a
        >
      </div></AppDialog
    >
    <AppDialog v-model="restore" title="Restore the starting pattern?"
      ><p>This replaces your saved recipe and palette on this device.</p>
      <div
        class="flex flex-wrap gap-3 my-5.5 mx-0 [@media(width<=700px)]:[&_>_button]:flex-1 [@media(width<=700px)]:[&_>_button]:min-w-32.5"
      >
        <button
          class="inline-flex items-center justify-center gap-[9px] min-h-10 font-semibold leading-[1.3] rounded-[9px] border border-solid border-[transparent] [transition:background_0.15s] bg-accent text-on-accent py-2.5 px-[15px] [&:hover]:[filter:brightness(0.96)]"
          @click="restoreSample"
        >
          Restore sample</button
        ><button
          class="inline-flex items-center justify-center gap-[9px] min-h-10 font-semibold leading-[1.3] rounded-[9px] border border-solid border-line [transition:background_0.15s] bg-surface text-ink py-2.5 px-[15px] [&:hover]:bg-hover"
          @click="restore = false"
        >
          Keep my pattern
        </button>
      </div></AppDialog
    >
  </div>
</template>
