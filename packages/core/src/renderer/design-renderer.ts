import { resolveDepVar, type IDepsEntry, genAbsoulteUrl } from "@/utils/fetchDeps"
import { LowcodeContext, type ILowcodeContext, type ILowcodeBundleData, type ILowcodeBundleDataEntry, fetchBundleData } from "./lowcode-context"
import type { MaybePromise } from "@/utils"
import type { ITemplateSchema } from "@/schema/template"
import { BaseRenderer } from "./base-renderer"

export abstract class AbstractDesignRenderer extends BaseRenderer {
  #mainViewFilePath: string
  constructor(params: {
    lowcodeContext: ILowcodeContext,
    mainViewFilePath: string
  }) {
    super(params)
    const { mainViewFilePath } = params
    this.#mainViewFilePath = mainViewFilePath
  }
  get getMainViewFilePath() {
    return () => {
      return this.#mainViewFilePath
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

export type IDesignRendererClass = new (...params: ConstructorParameters<typeof AbstractDesignRenderer>) => AbstractDesignRenderer
export type IDesignRenderer = InstanceType<IDesignRendererClass>

export const getDesignRenderer = (mountWindowId: string) => {
  //@ts-ignore
  const renderer = window[mountWindowId]()
  return renderer as IDesignRenderer | undefined
}

export const createDesignRenderer = async (params: {
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
  const DesignRendererClass = resolveDepVar<IDesignRendererClass>({
    dep: renderLib,
    varName: cookConfig.renderer.design.varName
  })
  if (!DesignRendererClass) {
    throw new Error("undefind DesignRendererClass")
  }
  const renderer = new DesignRendererClass({ lowcodeContext, mainViewFilePath })
  return renderer
}

export interface IAutoCreateDesignRendererConfig {
  mountWindowId?: string
  mountElementId: string
  onContextCreated?: (conext: IDesignRenderer) => MaybePromise<void>
  bundleDataEntry: ILowcodeBundleDataEntry,
  depsEntry: IDepsEntry,
  mainViewFilePath: string
}

export const autoCreateDesignRenderer = async (config: IAutoCreateDesignRendererConfig) => {
  let finallConfig: IAutoCreateDesignRendererConfig = {
    ...config
  }
  const script = document.currentScript
  const configVarName = script?.dataset?.configVarName || ''
  if (configVarName) {
    // @ts-ignore
    const _config = window[configVarName] as IAutoCreateDesignRendererConfig
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

  const { bundleDataEntry, depsEntry, mainViewFilePath, onContextCreated, mountElementId, mountWindowId } = finallConfig
  const bundleData = await fetchBundleData(bundleDataEntry)

  const conext = await createDesignRenderer({
    bundleData,
    depsEntry,
    mainViewFilePath
  })
  onContextCreated?.(conext)
  if (mountWindowId) {
    // @ts-ignore
    const oldValue = window[mountWindowId]
    // @ts-ignore
    window[mountWindowId] = () => {
      // @ts-ignore
      window[mountWindowId] = oldValue
      return conext
    }
  }
  await conext.mount(mountElementId)
  return conext
}