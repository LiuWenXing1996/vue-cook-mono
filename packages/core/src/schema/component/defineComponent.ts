import type { Component } from 'vue'
import { defineComponent as defineVueComponent, type SetupContext } from 'vue'
import type { MethodConfig } from '../method/defineMethod'
import type { StateConfig } from '../state/defineState'
import { get } from 'lodash-es'
import { createContext } from '../context/createContext'
import { getInternalContext } from '../context/contextManager'

export interface ComponentConfig {
  name: string
  components: Record<string, Component>
  states: Record<string, StateConfig>
  methods: Record<string, MethodConfig>
}

const __injectHelper__ = {
  stateSafeGet: (state: any, path: string) => {
    return get(state, path)
  }
}

export const defineComponent = (config: ComponentConfig) => {
  const { name, components, states, methods } = config
  const b = defineVueComponent({
    name,
    components,
    setup: () => {
      const context = createContext({ states, methods })
      const internalContext = getInternalContext(context.uid)
      if (!internalContext) {
        return
      }
      // TODO:不要直接暴露state，method,props，使用inject Helper 来获取
      // state，method,props???
      //   const stateObj = internalContext.getStateObject()
      //   const methodObj = internalContext.getMethodObject()
      return {
        __injectHelper__
        // state: stateObj,
        // methods: methodObj,
        // getState:internalContext.getState()
      }
    }
  })
  b.cookConfig = config
}

export type DefineComponent = typeof defineComponent
