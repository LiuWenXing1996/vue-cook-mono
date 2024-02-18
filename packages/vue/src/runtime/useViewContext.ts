import { defineViewContext } from '@vue-cook/core'
import { shallowRef } from 'vue'
import type { ShallowRef } from 'vue'

// TODO:这个丑陋的实现要改一改
export const useViewContext = <C extends ReturnType<typeof defineViewContext>>(
  setup: C
): {
  states: ShallowRef<ReturnType<ReturnType<C>['states']['getAll']>>
  actions: ShallowRef<ReturnType<ReturnType<C>['actions']['getAll']>>
} => {
  const ctx = setup()

  const statesRef = shallowRef(ctx.states.getAll())
  const actionsRef = shallowRef(ctx.actions.getAll())

  return {
    // @ts-ignore
    states: statesRef,
    // @ts-ignore
    actions: actionsRef
  }
}
