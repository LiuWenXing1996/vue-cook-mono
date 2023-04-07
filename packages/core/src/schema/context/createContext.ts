import type {
  IState,
  IStateConfig,
  IStateMap,
  IStateType
} from '../state/defineState'
import { initState } from '../state/initState'
import type { IMethod, IMethodConfig, IMethodMap } from '../method/defineMethod'
import { initMethod } from '../method/initMethod'
import { uniqueId } from 'lodash-es'
import { setInnerContext } from './contextMap'
import { link } from './componentInstanceContextMap'
import { warn } from '../../utils/customConsole'
import {
  IContextDataManager,
  createContextDataManager
} from './contextDataManager'
import { ComponentInternalInstance, getCurrentInstance, readonly } from 'vue'

export interface IContextConfig {
  states: Record<string, IStateConfig>
  methods: Record<string, IMethodConfig>
}

export type IInnerContext = ReturnType<typeof createInnerContext>
export type IContext = ReturnType<typeof exposeContext>

const exposeContext = (innerContext: IInnerContext) => {
  const { uid, getStateObj, getMethodObj } = innerContext
  return {
    uid,
    getStateObj,
    getMethodObj
  }
}

const createInnerContext = (
  componentInstance: ComponentInternalInstance,
  config: IContextConfig
) => {
  const uid = uniqueId('context')
  const stateMap = createContextDataManager<IState, IStateConfig>({
    init: (config: IStateConfig) => {
      return initState(config, componentInstance)
    },
    configRecord: config.states,
    dataType: 'state'
  }) as IContextDataManager<IState, IStateConfig>

  const methodMap = createContextDataManager<IMethod, IMethodConfig>({
    init: config => {
      return initMethod(config, context)
    },
    configRecord: config.methods,
    dataType: 'method'
  }) as IContextDataManager<IMethod, IMethodConfig>

  const innerContext = {
    get uid () {
      return uid
    },
    // state
    initState: (config: IStateConfig) => stateMap.initData(config),
    isStateInited: (name: string) => stateMap.isDataInited(name),
    hasState: (name: string) => stateMap.hasData(name),
    getState: (name: string) => stateMap.getData(name),
    getStateConfig: (name: string) => stateMap.getDataConfig(name),
    getStateMap: () => stateMap.getDataMap(),
    getStateObj: () => stateMap.getDataObj(),
    // method
    initMethod: (config: IMethodConfig) => methodMap.initData(config),
    isMethodInited: (name: string) => methodMap.isDataInited(name),
    hasMethod: (name: string) => methodMap.hasData(name),
    getMethod: (name: string) => methodMap.getData(name),
    getMethodConfig: (name: string) => methodMap.getDataConfig(name),
    getMethodMap: () => methodMap.getDataMap(),
    getMethodObj: () => methodMap.getDataObj()
  }
  setInnerContext(uid, innerContext)
  link(componentInstance, innerContext)
  const context = exposeContext(innerContext)

  return innerContext
}

export const createContext = (config: IContextConfig) => {
  const currentInstance = getCurrentInstance()
  if (!currentInstance) {
    return
  }

  const innerContext = createInnerContext(currentInstance, config)
  const conetxt = exposeContext(innerContext)
  return conetxt
}
