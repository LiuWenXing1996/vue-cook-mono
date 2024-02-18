import { shallowRef, type Ref, computed, watch, onUnmounted } from 'vue'
import { type IDataMapSchema, type IViewContext } from '@vue-cook/core'
import type { Renderer } from '../renderer'
import type { RendererApp } from '../renderer-app'

export const useViewDataMap = (params: {
  schema: Ref<IDataMapSchema | undefined>
  viewContext: Ref<IViewContext>
  rendererApp: Ref<RendererApp>
}) => {
  const { schema, viewContext, rendererApp } = params
  let cancelDataMapWatcher: undefined | (() => void) = undefined
  const computedViewDataMap = computed(() => {
    cancelDataMapWatcher?.()
    const viewDataMap = rendererApp.value.renderer.createViewDataMap(viewContext.value)
    cancelDataMapWatcher = viewDataMap.onValueChange(() => {
      dataMap.value = viewDataMap.getValue() || {}
    })
    return viewDataMap
  })
  const dataMap = shallowRef<Record<string, any>>(computedViewDataMap.value.getValue() || {})
  watch(
    [schema, computedViewDataMap],
    () => {
      computedViewDataMap.value.setSchema(schema.value)
    },
    {
      immediate: true
    }
  )
  onUnmounted(() => {
    cancelDataMapWatcher?.()
  })
  return computed(() => dataMap.value)
}
