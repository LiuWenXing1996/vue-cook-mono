import { resolveDepVar, type IDepsEntry, genAbsoulteUrl } from '@/utils/fetchDeps'
import {
  LowcodeContext,
  type ILowcodeContext,
  type ILowcodeBundleData,
  type ILowcodeBundleDataEntry,
  fetchBundleData
} from './lowcode-context'
import type { MaybePromise } from '@/utils'
import { createReactiveStore } from '@/utils/reactive'

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
  get transferAttribute() {
    return () => {}
  }
}

export type IViewContext = ViewContext

export abstract class AbstractRuntimeRenderer {
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

export type IRuntimeRendererClass = new (
  ...params: ConstructorParameters<typeof AbstractRuntimeRenderer>
) => AbstractRuntimeRenderer
export type IRuntimeRenderer = InstanceType<IRuntimeRendererClass>

export const createRuntimeRenderer = async (params: {
  depsEntry: IDepsEntry
  bundleData: ILowcodeBundleData
}) => {
  const { depsEntry, bundleData } = params
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
  const RuntimeRendererClass = resolveDepVar<IRuntimeRendererClass>({
    dep: renderLib,
    varName: cookConfig.renderer.runtime.varName
  })
  if (!RuntimeRendererClass) {
    throw new Error('undefind RuntimeRendererClass')
  }
  const context = new RuntimeRendererClass({ lowcodeContext })
  return context
}

export interface IAutoCreateRuntimeRendererConfig {
  mountElementId: string
  onContextCreated?: (conext: IRuntimeRenderer) => MaybePromise<void>
  bundleDataEntry: ILowcodeBundleDataEntry
  depsEntry: IDepsEntry
  mainViewFilePath: string
}

export const autoCreateRuntimeRenderer = async (config: IAutoCreateRuntimeRendererConfig) => {
  let finallConfig: IAutoCreateRuntimeRendererConfig = {
    ...config
  }
  const script = document.currentScript
  const configVarName = script?.dataset?.configVarName || ''
  if (configVarName) {
    // @ts-ignore
    const _config = window[configVarName] as IAutoCreateRuntimeRendererConfig
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

  const conext = await createRuntimeRenderer({
    bundleData,
    depsEntry
  })
  onContextCreated?.(conext)
  await conext.mount(mountElementId)
  return conext
}
