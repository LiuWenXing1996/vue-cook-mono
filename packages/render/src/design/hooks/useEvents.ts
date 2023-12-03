import { shallowRef, type Ref, computed, watch, onUnmounted } from 'vue'
import { type IActionDataSchema, type ITemplateSchema, type IViewContext } from '@vue-cook/core'
import type { Renderer } from '../renderer'

export const useEvents = (params: {
  schema: Ref<ITemplateSchema>
  viewContext: Ref<IViewContext>
  renderer: Ref<Renderer>
}) => {
  const { schema, viewContext, renderer } = params
  let cancelDataMapWatcher: undefined | (() => void) = undefined
  const eventViewDataMap = computed(() => {
    cancelDataMapWatcher?.()
    const viewDataMap = renderer.value.createViewDataMap(viewContext.value)
    viewDataMap.onValueChange(() => {
      events.value = eventViewDataMap.value.getValue() || {}
    })
    return viewDataMap
  })
  const events = shallowRef<Record<string, any>>(eventViewDataMap.value.getValue() || {})
  watch(
    [schema, eventViewDataMap],
    () => {
      let eventsList: IActionDataSchema[] = []
      if (schema.value.type === 'Tag') {
        eventsList = schema.value.events || []
      }
      eventViewDataMap.value.setSchema(eventsList)
    },
    {
      immediate: true
    }
  )
  onUnmounted(() => {
    cancelDataMapWatcher?.()
  })
  return computed(() => events.value)
}
