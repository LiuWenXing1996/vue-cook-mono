import {
  DeepReadonly,
  DeepReadonlyWithUid,
  deepFreeze
} from '../../utils/deepFreeze'
import { ActionConfig } from '../action/defineAction'
import { warn } from '../../utils/customConsole'
import {
  ResourceConfig,
  ResourceType,
  createResourceManager,
  makeResourceRichName
} from '../../utils/resourceManager'
import {
  ContextDataResourceType,
  internalContextManager
} from './contextManager'
import { StateConfig } from '../state/base'

export const internalDefineHelperManager =
  createResourceManager<InternalDefineHelper>('defineHelper')

export interface DefineConfigBase {
  resourceName: string
}

export type DefineConfigResourceType = Extract<
  ResourceType,
  'stateConfig' | 'actionConfig'
>

interface TypeUid<T> {
  value: string
  __only_for_type__: T
}

const createTypeUid = <T>(uid: string) => {
  const tuid = {
    value: uid
  } as TypeUid<T>
  return tuid
}

const createDefineConfigManager = <C extends DefineConfigBase>(
  type: DefineConfigResourceType,
  parent: ResourceConfig<'defineHelper'>
) => {
  const manager = createResourceManager<DeepReadonlyWithUid<C>>(type, parent)
  const define = <T extends C>(config: T) => {
    const uid = manager.makeUid(config.resourceName)
    const configWithUid = deepFreeze({
      ...config,
      uid
    })
    manager.set(uid, configWithUid)
    const tuid = createTypeUid<DeepReadonlyWithUid<C>>(uid)
    return tuid
  }

  return {
    ...manager,
    define
  }
}

export type DefineConfigManager<T extends DefineConfigBase = DefineConfigBase> =
  ReturnType<typeof createDefineConfigManager<T>>

export interface DefineHelperConfig {
  name: string
}

export interface InternalDefineHelperConfig extends DefineHelperConfig {
  uid: string
}

const createInternalDefineHelper = (config: InternalDefineHelperConfig) => {
  const { uid, name } = config
  const parent: ResourceConfig<'defineHelper'> = {
    type: 'defineHelper',
    uid
  }
  return {
    uid,
    name,
    stateConfigManager: createDefineConfigManager<StateConfig>(
      'stateConfig',
      parent
    ),
    actionConfigManager: createDefineConfigManager<ActionConfig>(
      'actionConfig',
      parent
    )
  }
}

export type InternalDefineHelper = ReturnType<typeof createInternalDefineHelper>
export type DefineHelper = ReturnType<typeof exposeDefineHelper>

const exposeDefineHelper = (internalDefineHelper: InternalDefineHelper) => {
  const { uid, name, stateConfigManager, actionConfigManager } =
    internalDefineHelper

  return deepFreeze({
    uid,
    name,
    defineStateConfig: stateConfigManager.define,
    defineActionConfig: actionConfigManager.define
  })
}

export const createDefineHelper = (name: string) => {
  const uid = internalDefineHelperManager.makeUid(name)
  const internalDefineHelper = createInternalDefineHelper({
    name,
    uid
  })
  internalDefineHelperManager.set(uid, internalDefineHelper)
  const defineHelper = exposeDefineHelper(internalDefineHelper)
  return defineHelper
}

export const getInternalDefineHelperByContextUid = (
  contextUid?: string,
  isConsole: boolean = false
) => {
  if (!contextUid) {
    return
  }
  const internalContext = internalContextManager.get(contextUid, isConsole)
  if (!internalContext) {
    return
  }
  const { defineHelperUid } = internalContext
  const internalDefineHelper = internalDefineHelperManager.get(
    defineHelperUid,
    isConsole
  )
  if (!internalDefineHelper && isConsole) {
    warn(
      `未找到${makeResourceRichName({
        type: 'context',
        uid: contextUid
      })}对应的${makeResourceRichName({
        type: 'defineHelper',
        uid: defineHelperUid
      })}`
    )
  }
  return internalDefineHelper
}
