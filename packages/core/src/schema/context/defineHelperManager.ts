import { IDeepReadonlyWithUid, deepFreeze } from '../../utils/deepFreeze'
import { IStateConfig } from '../state/defineState'
import { IActionConfig } from '../action/defineAction'
import { warn } from '../../utils/customConsole'
import {
  IResourceConfig,
  IResourceType,
  createUidResourceManager,
  makeResourceRichName
} from '../../utils/uidResourceManager'
import { innerContextManager } from './contextManager'

export const innerDefineHelperManager =
  createUidResourceManager<IInnerDefineHelper>('defineHelper')

export interface IBaseDefineConfig {
  logName: string
}

export type IDefineConfigResourceType = Extract<
  IResourceType,
  'state' | 'action'
>

const createDefineConfigManager = <C extends IBaseDefineConfig>(
  type: IDefineConfigResourceType,
  parent: IResourceConfig<'defineHelper'>
) => {
  const manager = createUidResourceManager<IDeepReadonlyWithUid<C>>(
    type,
    parent
  )
  const define = <T extends C>(config: T) => {
    const uid = manager.makeUid(config.logName)
    const configWithUid = deepFreeze({
      ...config,  
      uid: uid
    })
    manager.set(uid, configWithUid)
    // TODO return use state? 
    return configWithUid
  }

  return {
    ...manager,
    define
  }
}

export type IDefineConfigManager<
  T extends IBaseDefineConfig = IBaseDefineConfig
> = ReturnType<typeof createDefineConfigManager<T>>

export interface IDefineHelperConfig {
  name: string
}

export interface IInnerDefineHelperConfig extends IDefineHelperConfig {
  uid: string
}

const createInnerDefineHelper = (config: IInnerDefineHelperConfig) => {
  const { uid, name } = config
  const parent: IResourceConfig<'defineHelper'> = {
    type: 'defineHelper',
    uid: uid
  }
  const configManagerObject: Record<
    IDefineConfigResourceType,
    IDefineConfigManager<any>
  > = {
    state: createDefineConfigManager<IStateConfig>('state', parent),
    action: createDefineConfigManager<IActionConfig>('action', parent)
  }

  return {
    uid,
    name,
    stateConfigManager:
      configManagerObject.state as IDefineConfigManager<IStateConfig>,
    actionConfigManager:
      configManagerObject.action as IDefineConfigManager<IActionConfig>,
    configManagerObject
  }
}

export type IInnerDefineHelper = ReturnType<typeof createInnerDefineHelper>
export type IDefineHelper = ReturnType<typeof exposeDefineHelper>

const exposeDefineHelper = (innerDefineHelper: IInnerDefineHelper) => {
  const { uid, name, configManagerObject } = innerDefineHelper
  const stateManager =
    configManagerObject.state as IDefineConfigManager<IStateConfig>
  const actionManager =
    configManagerObject.action as IDefineConfigManager<IActionConfig>
  return deepFreeze({
    uid,
    name,
    defineState: stateManager.define,
    defineAction: actionManager.define
  })
}

export const createDefineHelper = (name: string) => {
  const uid = innerDefineHelperManager.makeUid(name)
  const innerDefineHelper = createInnerDefineHelper({
    name,
    uid
  })
  innerDefineHelperManager.set(uid, innerDefineHelper)
  const defineHelper = exposeDefineHelper(innerDefineHelper)
  return defineHelper
}

export const getInnerDefineHelperByContextUid = (
  uid?: string,
  isConsole: boolean = false
) => {
  if (!uid) {
    return
  }
  const innerContext = innerContextManager.get(uid, isConsole)
  if (!innerContext) {
    return
  }
  const { defineHelperUid } = innerContext
  const innerDefineHelper = innerDefineHelperManager.get(
    defineHelperUid,
    isConsole
  )
  if (!innerDefineHelper && isConsole) {
    warn(
      `未找到${makeResourceRichName({
        type: 'context',
        uid
      })}对应的${makeResourceRichName({
        type: 'defineHelper',
        uid: defineHelperUid
      })}`
    )
  }
  return innerDefineHelper
}
