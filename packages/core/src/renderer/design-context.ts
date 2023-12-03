import { resolveDepVar, type IDeps, type IDepsEntry, genAbsoulteUrl } from "@/utils/fetchDeps"
import { LowcodeContext, type ILowcodeContext, type ILowcodeBundleData, type ILowcodeBundleDataEntry, fetchBundleData } from "./lowcode-context"
import type { MaybePromise } from "@/utils"
import type { ITemplateSchema } from "@/schema/template"

export abstract class AbstractDesignContext {
  #lowcodeContext: ILowcodeContext
  #mainViewFilePath: string
  constructor(params: {
    lowcodeContext: ILowcodeContext,
    mainViewFilePath: string
  }) {
    const { lowcodeContext, mainViewFilePath } = params
    this.#lowcodeContext = lowcodeContext
    this.#mainViewFilePath = mainViewFilePath
  }
  get getMainViewFilePath() {
    return () => {
      return this.#mainViewFilePath
    }
  }
  get getLowcodeContext() {
    return () => {
      return this.#lowcodeContext
    }
  }
  abstract getComponetnOverlayFromElement(element: Element): IDesignComponentOverlay | undefined
  abstract mount(mountElementId: string): MaybePromise<void>
}
export interface IDesignComponentOverlay {
  templateSchema: ITemplateSchema
  rect: IDesignComponentRect
}

export interface IDesignComponentRect {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
}

export interface IDesignComponentPageSize {
  width: number
  height: number
  scale: number
}

export type IDesignContextClass = new (...params: ConstructorParameters<typeof AbstractDesignContext>) => AbstractDesignContext
export type IDesignContext = InstanceType<IDesignContextClass>

export const createDesignContext = async (params: {
  depsEntry: IDepsEntry
  mainViewFilePath: string,
  bundleData: ILowcodeBundleData
}) => {
  const { depsEntry, mainViewFilePath, bundleData } = params
  const lowcodeContext = new LowcodeContext()
  await lowcodeContext.setDepsByEntry({ entry: depsEntry })
  await lowcodeContext.setRunResultByBundleData({ bundleData })
  const runResult = lowcodeContext.getRunResult()
  const { cookConfig } = runResult || {}
  if (!cookConfig) {
    throw new Error("undefind cookConfig")
  }
  const deps = lowcodeContext.getDeps()
  const renderLib = deps?.[cookConfig.renderer.design.packageName]
  const DesignContextClass = resolveDepVar<IDesignContextClass>({
    dep: renderLib,
    varName: cookConfig.renderer.design.varName
  })
  if (!DesignContextClass) {
    throw new Error("undefind DesignContextClass")
  }
  const context = new DesignContextClass({ lowcodeContext, mainViewFilePath })
  return context
}

export interface IAutoCreateDesignContextConfig {
  mountElementId: string
  onContextCreated?: (conext: IDesignContext) => MaybePromise<void>
  bundleDataEntry: ILowcodeBundleDataEntry,
  depsEntry: IDepsEntry,
  mainViewFilePath: string
}

export const autoCreateDesignContext = async (config: IAutoCreateDesignContextConfig) => {
  let finallConfig: IAutoCreateDesignContextConfig = {
    ...config
  }
  const script = document.currentScript
  const configVarName = script?.dataset?.configVarName || ''
  if (configVarName) {
    // @ts-ignore
    const _config = window[configVarName] as IAutoCreateDesignContextConfig
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

  const { bundleDataEntry, depsEntry, mainViewFilePath, onContextCreated, mountElementId } = finallConfig
  const bundleData = await fetchBundleData(bundleDataEntry)

  const conext = await createDesignContext({
    bundleData,
    depsEntry,
    mainViewFilePath
  })
  onContextCreated?.(conext)
  await conext.mount(mountElementId)
  return conext
}