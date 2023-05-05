import {
  ResourceConfig,
  ResourceType,
  createResourceManager
} from '../../utils/resourceManager'
import { Action } from '../action/defineAction'
import { initAction } from '../action/initAction'
import { State } from '../state/defineState'
import { initState } from '../state/initState'
import { getInternalDefineHelperByContextUid } from './defineHelperManager'

export const internalContextManager =
  createResourceManager<InternalContext>('context')

export interface ContextConfig {
  name: string
  defineHelperUid: string
}

export interface InternalContextConfig extends ContextConfig {
  uid: string
}

export type InternalContext = ReturnType<typeof createInternalContext>
export type Context = ReturnType<typeof exposeContext>
export type ContextDataResourceType = Extract<
  ResourceType,
  'state' | 'action'
>

export const exposeContext = (internalContext: InternalContext) => {
  const { uid, name, stateManager } = internalContext
  const useState = () => {
    stateManager.get()
  }
  return {
    uid,
    name
  }
}

export interface ContextDataParams<C> {
  init: (config: C) => void
  conetxtUid: string
}

export type ContextDataManager<T> = ReturnType<
  typeof createContextDataManager<T>
>

const createContextDataManager = <D>(config: {
  type: ContextDataResourceType
  parent: ResourceConfig<'context'>
  initData: (configUid: string, contextUid: string) => void
}) => {
  const { type, parent, initData } = config
  const dataManager = createResourceManager<D>(type, parent)

  const isInited = (uid: string) => {
    return dataManager.has(uid)
  }

  const isNeedInit = (uid: string, isConsole: boolean = false) => {
    const internalContext = internalContextManager.get(parent.uid, isConsole)
    if (!internalContext) {
      return false
    }
    const defineHelper = getInternalDefineHelperByContextUid(
      parent.uid,
      isConsole
    )
    if (!defineHelper) {
      return false
    }
    const configManager = defineHelper.configManagerObject[type]
    if (!configManager.has(uid, isConsole)) {
      return false
    }
    if (isInited(uid)) {
      return false
    }
    return true
  }

  const init = (uid: string) => {
    if (isNeedInit(uid)) {
      initData(uid, parent.uid)
    }
  }

  return {
    init,
    isInited,
    isNeedInit,
    ...dataManager
  }
}

const createInternalContext = (config: InternalContextConfig) => {
  const { defineHelperUid, name, uid } = config

  const parent: ResourceConfig<'context'> = {
    type: 'context',
    uid
  }

  const dataManagerObject: Record<
    ContextDataResourceType,
    ContextDataManager<any>
  > = {
    state: createContextDataManager<IState>({
      type: 'state',
      parent,
      initData: (configId, conetxtUid) => initState(configId, conetxtUid)
    }),
    action: createContextDataManager<IAction | undefined>({
      type: 'action',
      parent,
      initData: (configId, conetxtUid) => {
        return initAction(configId, conetxtUid)
      }
    })
  }
  const internalContext = {
    name,
    uid,
    defineHelperUid,
    stateManager: dataManagerObject.state as ContextDataManager<IState>,
    actionManager: dataManagerObject.state as ContextDataManager<IAction>,
    dataManagerObject
  }

  return internalContext
}

export const createContext = (config: ContextConfig) => {
  const { name } = config
  const uid = internalContextManager.makeUid(name)
  const internalContext = createInternalContext({
    ...config,
    uid
  })
  const conetxt = exposeContext(internalContext)
  return conetxt
}
