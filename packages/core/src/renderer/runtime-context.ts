import { resolveDepVar, type IDeps, type IDepsEntry, genAbsoulteUrl } from '@/utils/fetchDeps'
import {
  LowcodeContext,
  type ILowcodeContext,
  type ILowcodeBundleData,
  type ILowcodeBundleDataEntry,
  fetchBundleData
} from './lowcode-context'
import type { MaybePromise } from '@/utils'
import type { ITemplateSchema } from '@/schema/template'
import { createReactiveStore, type IReactiveStore } from '@/utils/reactive'

export class ViewContext {
  #lowcodeContext: ILowcodeContext
  constructor(params: { lowcodeContext: ILowcodeContext }) {
    const { lowcodeContext } = params
    this.#lowcodeContext = lowcodeContext
  }
  get getDeps() {
    return () => {
      return this.#lowcodeContext.getDeps
    }
  }
  #states = createReactiveStore<{
    [stateName: string]: any
  }>({})
  get getState() {
    return this.#states.get
  }
  get setState() {
    return this.#states.set
  }
  get onStateChange() {
    return this.#states.on
  }
  get watchState() {
    return this.#states.watch
  }
}

export type IViewContext = ViewContext

export abstract class AbstractRuntimeContext {
  #lowcodeContext: ILowcodeContext
  constructor(params: { lowcodeContext: ILowcodeContext }) {
    const { lowcodeContext } = params
    this.#lowcodeContext = lowcodeContext
  }
  get getLowcodeContext() {
    return () => {
      return this.#lowcodeContext
    }
  }
  get createViewContext() {
    return () => {
      return new ViewContext({ lowcodeContext: this.getLowcodeContext() })
    }
  }
  abstract mount(mountElementId: string): MaybePromise<void>
}

export type IRuntimeContextClass = new (
  ...params: ConstructorParameters<typeof AbstractRuntimeContext>
) => AbstractRuntimeContext
export type IRuntimeContext = InstanceType<IRuntimeContextClass>

export const createRuntimeContext = async (params: {
  depsEntry: IDepsEntry
  mainViewFilePath: string
  bundleData: ILowcodeBundleData
}) => {
  const { depsEntry, mainViewFilePath, bundleData } = params
  const lowcodeContext = new LowcodeContext()
  await lowcodeContext.setDepsByEntry({ entry: depsEntry })
  await lowcodeContext.setRunResultByBundleData({ bundleData })
  const runResult = lowcodeContext.getRunResult()
  const { cookConfig } = runResult || {}
  if (!cookConfig) {
    throw new Error('undefind cookConfig')
  }
  const deps = lowcodeContext.getDeps()
  const renderLib = deps?.[cookConfig.renderer.runtime.packageName]
  const RuntimeContextClass = resolveDepVar<IRuntimeContextClass>({
    dep: renderLib,
    varName: cookConfig.renderer.runtime.varName
  })
  if (!RuntimeContextClass) {
    throw new Error('undefind RuntimeContextClass')
  }
  const context = new RuntimeContextClass({ lowcodeContext })
  return context
}

export interface IAutoCreateRuntimeContextConfig {
  mountElementId: string
  onContextCreated?: (conext: IRuntimeContext) => MaybePromise<void>
  bundleDataEntry: ILowcodeBundleDataEntry
  depsEntry: IDepsEntry
  mainViewFilePath: string
}

export const autoCreateRuntimeContext = async (config: IAutoCreateRuntimeContextConfig) => {
  let finallConfig: IAutoCreateRuntimeContextConfig = {
    ...config
  }
  const script = document.currentScript
  const configVarName = script?.dataset?.configVarName || ''
  if (configVarName) {
    // @ts-ignore
    const _config = window[configVarName] as IAutoCreateRuntimeContextConfig
    finallConfig = {
      ...finallConfig,
      ..._config
    }
  }
  finallConfig = {
    ...finallConfig,
    depsEntry: {
      ...finallConfig.depsEntry,
      js: genAbsoulteUrl(finallConfig.depsEntry.js),
      css: genAbsoulteUrl(finallConfig.depsEntry.css)
    },
    bundleDataEntry: {
      ...finallConfig.bundleDataEntry,
      jsUrl: genAbsoulteUrl(finallConfig.bundleDataEntry.jsUrl),
      cssUrl: genAbsoulteUrl(finallConfig.bundleDataEntry.cssUrl)
    }
  }

  const { bundleDataEntry, depsEntry, mainViewFilePath, onContextCreated, mountElementId } =
    finallConfig
  const bundleData = await fetchBundleData(bundleDataEntry)

  const conext = await createRuntimeContext({
    bundleData,
    depsEntry,
    mainViewFilePath
  })
  onContextCreated?.(conext)
  await conext.mount(mountElementId)
  return conext
}
