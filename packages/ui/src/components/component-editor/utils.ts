import { onUnmounted, ref, type Ref } from 'vue'

export function getRulerUnit(scale: number) {
  const s1 = Number(((1 / scale) * 50).toFixed())
  const s2 = Number((s1 / 5).toFixed()) * 5
  return s2
}

export function createRenderLoop(render: () => void) {
  let frameId: number

  const f = () => {
    render()
    frameId = requestAnimationFrame(f)
  }
  const stop = () => {
    cancelAnimationFrame(frameId)
  }
  frameId = requestAnimationFrame(f)
  return stop
}

export function useRulerDivHeight(rulerDiv: Ref<HTMLDivElement | undefined>) {
  const height = ref(0)
  const stopFunc = createRenderLoop(() => {
    if (rulerDiv.value) {
      height.value = rulerDiv.value.clientHeight
    }
  })
  onUnmounted(() => {
    stopFunc()
  })
  return height
}

export function useRulerDivWidth(rulerDiv: Ref<HTMLDivElement | undefined>) {
  const width = ref(0)
  const stopFunc = createRenderLoop(() => {
    if (rulerDiv.value) {
      width.value = rulerDiv.value.clientWidth
    }
  })
  onUnmounted(() => {
    stopFunc()
  })
  return width
}
