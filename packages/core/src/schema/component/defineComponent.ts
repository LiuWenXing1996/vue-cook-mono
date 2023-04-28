import type { Component } from 'vue'
import { defineComponent as defineVueComponent, type SetupContext } from 'vue'
import type { IMethodConfig } from '../method/defineMethod'
import type { IStateConfig } from '../state/defineState'
import { get } from 'lodash-es'
import { createContext } from '../context/createContext'
import { getInnerContext } from '../context/contextManager'

export interface IComponentConfig {
  name: string
  components: Record<string, Component>
  states: Record<string, IStateConfig>
  methods: Record<string, IMethodConfig>
}

const __injectHelper__ = {
  stateSafeGet: (state: any, path: string) => {
    return get(state, path)
  }
}

export const defineComponent = (config: IComponentConfig) => {
  const { name, components, states, methods } = config
  const b = defineVueComponent({
    name,
    components,
    setup: () => {
      const context = createContext({ states, methods })
      const innerContext = getInnerContext(context.uid)
      if (!innerContext) {
        return
      }
      // TODO:不要直接暴露state，method,props，使用inject Helper 来获取
      // state，method,props???
      //   const stateObj = innerContext.getStateObject()
      //   const methodObj = innerContext.getMethodObject()
      return {
        __injectHelper__
        // state: stateObj,
        // methods: methodObj,
        // getState:innerContext.getState()
      }
    }
  })
  b.cookConfig = config
}

export type IDefineComponent = typeof defineComponent
