import { type IAliasComponent } from '@/schema/component'
import {
  fetchDeps,
  resolveDepVar,
  type IDeps,
  type IDepsEntry,
  genAbsoulteUrl
} from '@/utils/fetchDeps'
import { type IDeepRequiredCookConfig } from '../utils/cookConfig'
import { v4 as uuidv4 } from 'uuid'
import {
  createLowcodeContext,
  fetchBundleData,
  type ILowcodeBundleData,
  type ILowcodeBundleDataEntry,
  type ILowcodeContext,
  type ILowcodeRunResult
} from './lowcode-context'
import type { IViewSchema } from '..'
import { type IState } from '@/schema/state'
import { type IAction } from '@/schema/action'
import { Emitter } from '@/utils/emitter'
import { dirname, resolve } from '@/utils/path'
import type { IAttributeSchema } from '@/schema/attribute'
import {
  AbstractViewRenderer,
  createViewRendererContext,
  type IViewRendererContext
} from './view-renderer'
import type { ITemplateSchema } from '@/schema/template'
import type { MaybePromise } from '@/utils'
import { createReactiveStore } from '@/utils/reactive'

export abstract class AbstractDesignRenderer<View = any> extends AbstractViewRenderer<View> {
  abstract getComponetnOverlayFromElement(element: Element): IDesignComponentOverlay | undefined
  abstract mount(mountElementId: string): Promise<void> | void
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
export type IDesignRendererContext<View> = Awaited<
  ReturnType<typeof createDesignRendererContext<View>>
>
export const getDesignRendererContext = <View>(mountWindowId: string) => {
  //@ts-ignore
  const context = window[mountWindowId]
  return context as IDesignRendererContext<View> | undefined
}

export interface IDesignRendererContextConfig<View = any> {
  depsEntry: IDepsEntry
  externalLibs?: Record<string, any>
  mainViewFilePath: string
}

export const createDesignRendererContext = async <View = any>(
  config: IDesignRendererContextConfig<View>
) => {
  type IRendererClass = new () => AbstractDesignRenderer<View>
  const { depsEntry, externalLibs, mainViewFilePath } = config
  const store = createReactiveStore<{
    isMounted?: boolean
    mainRenderer?: AbstractDesignRenderer<View>
  }>({})
  let viewRendererContext = await createViewRendererContext<View, AbstractDesignRenderer<View>>({
    depsEntry,
    externalLibs
  })

  const refreshMainRenderer = () => {
    const mainRenderer = viewRendererContext.getRenderers()[mainViewFilePath]
    store.set('mainRenderer', mainRenderer)
  }
  viewRendererContext.onRenderersChange(() => {
    refreshMainRenderer()
  })
  const refreshRendererClass = () => {
    const runResult = viewRendererContext.getLowcodeRunResult()
    let RendererClass: IRendererClass | undefined = undefined
    const { cookConfig } = runResult || {}
    if (cookConfig) {
      try {
        const deps = viewRendererContext.getDeps()
        const renderLib = deps[cookConfig.renderer.design.packageName]
        RendererClass = resolveDepVar<IRendererClass>({
          dep: renderLib,
          varName: cookConfig.renderer.design.varName
        })
      } catch (error) {}
    }
    viewRendererContext.setRendererClass(RendererClass)
  }
  viewRendererContext.onLowcodeRunResultChange(() => {
    refreshRendererClass()
  })

  refreshRendererClass()
  refreshMainRenderer()

  let cancelListen: Function | undefined = undefined
  const tryMountApp = async (mountElementId: string) => {
    if (!store.get('isMounted')) {
      const mainRenderer = store.get('mainRenderer')
      if (!mainRenderer) {
        cancelListen?.()
        cancelListen = store.on('mainRenderer', async () => {
          await tryMountApp(mountElementId)
        })
      } else {
        store.set('isMounted', true)
        await mainRenderer.mount(mountElementId)
      }
    }
  }

  const context = {
    setLowcodeBundleData: viewRendererContext.setLowcodeBundleData,
    onLowcodeRunResultChange: viewRendererContext.onLowcodeRunResultChange,
    getMainRenderer: () => store.get('mainRenderer'),
    onMainRendererChange: (listener: (data: AbstractDesignRenderer<View> | undefined) => void) => {
      return store.on('mainRenderer', listener)
    },
    tryMountApp
  }

  return context
}

export interface IAutoCreateDesignRendererContextConfig<View>
  extends IDesignRendererContextConfig<View> {
  mountElementId?: string
  onContextCreated: (conext: IDesignRendererContext<View>) => MaybePromise<void>
  bundleDataEntry: ILowcodeBundleDataEntry
}

export const autoCreateDesignRendererContext = async <View = any>(
  config: IAutoCreateDesignRendererContextConfig<View>
) => {
  let finallConfig: IAutoCreateDesignRendererContextConfig<View> = {
    ...config
  }
  const script = document.currentScript
  const configVarName = script?.dataset?.configVarName || ''
  if (configVarName) {
    // @ts-ignore
    const _config = window[configVarName] as IAutoCreateDesignRendererContextConfig<View>
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

  const bundleData = await fetchBundleData(finallConfig.bundleDataEntry)
  const context = await createDesignRendererContext(finallConfig)
  context.setLowcodeBundleData(bundleData)
  await finallConfig.onContextCreated?.(context)
  if (finallConfig.mountElementId) {
    await context.tryMountApp(finallConfig.mountElementId)
  }
  return context
}
