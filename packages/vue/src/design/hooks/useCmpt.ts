import type { ITemplateSchema, IViewContext } from '@vue-cook/core'
import { watch, type Ref, ref, computed, type Component } from 'vue'

export const useCmpt = (params: {
  schema: Ref<ITemplateSchema>
  viewContext: Ref<IViewContext>
}) => {
  const { schema, viewContext } = params
  const getCmpt = () => {
    const { tag } = schema.value
    const view = viewContext.value.components.get(tag)
    return view || tag || ''
  }
  watch([schema, viewContext], () => {
    cmpt.value = getCmpt()
  })

  const cmpt = ref(getCmpt())
  return computed(() => cmpt.value)
}
