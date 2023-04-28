import {
  IResourceConfig,
  IResourceType,
  createUidResourceManager
} from '../../utils/uidResourceManager'
import { IAction } from '../action/defineAction'
import { initAction } from '../action/initAction'
import { IState } from '../state/defineState'
import { initState } from '../state/initState'
import { getInnerDefineHelperByContextUid } from './defineHelperManager'

export const innerContextManager =
  createUidResourceManager<IInnerContext>('context')

export interface IContextConfig {
  name: string
  defineHelperUid: string
}

export interface IInnerContextConfig extends IContextConfig {
  uid: string
}

export type IInnerContext = ReturnType<typeof createInnerContext>
export type IContext = ReturnType<typeof exposeContext>
export type IContextDataResourceType = Extract<
  IResourceType,
  'state' | 'action'
>

export const exposeContext = (innerContext: IInnerContext) => {
  const { uid, name,stateManager } = innerContext
  const useState = ()=>{
    stateManager.get()
  }
  return {
    uid,
    name
  }
}

export interface IContextDataParams<C> {
  init: (config: C) => void
  conetxtUid: string
}

export type IContextDataManager<T> = ReturnType<
  typeof createContextDataManager<T>
>

const createContextDataManager = <D>(config: {
  type: IContextDataResourceType
  parent: IResourceConfig<'context'>
  initData: (configUid: string, contextUid: string) => void
}) => {
  const { type, parent, initData } = config
  const dataManager = createUidResourceManager<D>(type, parent)

  const isInited = (uid: string) => {
    return dataManager.has(uid)
  }

  const isNeedInit = (uid: string, isConsole: boolean = false) => {
    const innerContext = innerContextManager.get(parent.uid, isConsole)
    if (!innerContext) {
      return false
    }
    const defineHelper = getInnerDefineHelperByContextUid(parent.uid, isConsole)
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

const createInnerContext = (config: IInnerContextConfig) => {
  const { defineHelperUid, name, uid } = config

  const parent: IResourceConfig<'context'> = {
    type: 'context',
    uid: uid
  }

  const dataManagerObject: Record<
    IContextDataResourceType,
    IContextDataManager<any>
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
  const innerContext = {
    name,
    uid,
    defineHelperUid,
    stateManager: dataManagerObject.state as IContextDataManager<IState>,
    actionManager: dataManagerObject.state as IContextDataManager<IAction>,
    dataManagerObject
  }

  return innerContext
}

export const createContext = (config: IContextConfig) => {
  const { name } = config
  const uid = innerContextManager.makeUid(name)
  const innerContext = createInnerContext({
    ...config,
    uid
  })
  const conetxt = exposeContext(innerContext)
  return conetxt
}
