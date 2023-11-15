import { type IAliasComponent } from '@/schema/component'
import { fetchDeps, resolveDepVar, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { type IDeepRequiredCookConfig } from '../utils/cookConfig'
import { v4 as uuidv4 } from 'uuid'
import {
  createLowcodeContext,
  type ILowcodeBundleData,
  type ILowcodeContext,
  type ILowcodeRunResult
} from './lowcode-context'
import type { IViewSchema } from '..'
import { type IState } from '@/schema/state'
import { type IAction } from '@/schema/action'
import { Emitter } from '@/utils/emitter'
import { dirname, resolve } from '@/utils/path'
import type { IAttributeSchema } from '@/schema/attribute'
import { AbstractViewRenderer } from './view-renderer'
import type { ITemplateSchema } from '@/schema/template'

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

const contextMap = new Map<
  string,
  {
    internalContext: InternalDesignRenderContext
    context: DesignRenderContext
  }
>()

type DesignRendererClass<View = any> = new () => AbstractDesignRenderer<View>

class InternalDesignRenderContext<View = any> {
  #config: IDesignRendererContextConfig
  constructor(config: IDesignRendererContextConfig, context: IDesignRendererContext) {
    this.#id = uuidv4()
    this.#config = config
    contextMap.set(this.#id, {
      internalContext: this,
      context
    })
    this.onRendererClassChange(() => {
      this.refreshRenderers()
    })
  }
  #id: string
  get id() {
    return this.#id
  }
  #lowcodeContext?: ILowcodeContext
  get lowcodeContext() {
    return this.#lowcodeContext
  }
  #renderers: Record<string, AbstractDesignRenderer<View> | undefined> = {}
  #emitter = new Emitter()
  #RendererClass?: DesignRendererClass<View>

  get renderers() {
    return { ...this.#renderers }
  }
  set renderers(value: Record<string, AbstractDesignRenderer<View> | undefined>) {
    this.#renderers = { ...value }
    this.#emitter.emit('onRenderersChange', this.renderers)
  }

  onRenderersChange(listener: (value: InternalDesignRenderContext['renderers']) => void) {
    return this.#emitter.listen('onRenderersChange', listener)
  }
  get RendererClass() {
    return this.#RendererClass
  }
  set RendererClass(value: DesignRendererClass | undefined) {
    this.#RendererClass = value
    this.#emitter.emit('onRendererClassChange', this.RendererClass)
  }
  onRendererClassChange(listener: (value: InternalDesignRenderContext['RendererClass']) => void) {
    return this.#emitter.listen('onRendererClassChange', listener)
  }
  refreshRenderers() {
    const lowcodeContext = this.#lowcodeContext
    if (!lowcodeContext) {
      return
    }
    const RendererClass = this.RendererClass
    if (!RendererClass) {
      return
    }
    const renderers = { ...this.renderers }
    const runResult = lowcodeContext.getRunResult()
    const { schemaList = [], jsFunctions = [] } = runResult || {}
    schemaList.map((schema) => {
      let renderer = renderers[schema.path]
      if (renderer) {
        renderer.schema = schema
        renderer.jsFunctions = jsFunctions
      } else {
        renderer = renderers[schema.path] = new RendererClass()
        renderer.deps = lowcodeContext.getDeps()
        renderer.schema = schema
        renderer.jsFunctions = jsFunctions
      }
    })
    const allSchemaFiles = schemaList.map((e) => e.path)
    Object.keys(renderers).map((key) => {
      if (!allSchemaFiles.includes(key)) {
        renderers[key] = undefined
      }
    })

    Object.keys(renderers).map((key) => {
      const renderer = renderers[key]
      if (renderer) {
        renderer.allRenderers = renderers
      }
    })
    this.renderers = renderers
  }
  async init() {
    const { depsEntry, cookConfig, iframeEl, mainViewFilePath } = this.#config
    const contentWindow = iframeEl.contentWindow as Window
    this.#lowcodeContext = await createLowcodeContext({
      depsEntry: depsEntry,
      targetWindow: contentWindow
    })
    this.#lowcodeContext.onChangeRunResult(() => {
      this.refreshRenderers()
    })

    const prefix = '__vue__cook__inject__method__'
    const uid = `${prefix}_${uuidv4()}`
    // @ts-ignore
    const oldValue = contentWindow[uid]
    // @ts-ignore
    contentWindow[uid] = async () => {
      // @ts-ignore
      contentWindow[uid] = oldValue
      const deps = this.#lowcodeContext?.getDeps() || {}
      const renderLib = deps[cookConfig.renderer.design.packageName]
      const RendererClass = resolveDepVar<new () => AbstractDesignRenderer<View>>({
        dep: renderLib,
        varName: cookConfig.renderer.design.varName
      })
      if (!RendererClass) {
        return
      }
      this.RendererClass = RendererClass

      let isMounted = false
      let cancelListen = () => {}
      const tryMountApp = async () => {
        if (!isMounted) {
          const mainRenderer = this.renderers[mainViewFilePath]
          if (!mainRenderer) {
            cancelListen()
            cancelListen = this.onRenderersChange(async () => {
              await tryMountApp()
            })
          } else {
            isMounted = true
            await mainRenderer.mount('#app')
          }
        }
      }
      await tryMountApp()
    }
    contentWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    <div id="app"></div>
    <script>
    (function () {
      window["${uid}"]()
    })();
    </script>
</body>
</html>
      `)
  }
}

class DesignRenderContext<View = any> {
  #internalContext: InternalDesignRenderContext<View>
  constructor(config: IDesignRendererContextConfig) {
    this.#internalContext = new InternalDesignRenderContext<View>(config, this)
  }
  get id() {
    return this.#internalContext.id
  }

  setLowcodeBundleData(value?: ILowcodeBundleData) {
    this.#internalContext.lowcodeContext?.setBundleData(value)
  }
  onLowcodeRunResultChange(listener?: (data: ILowcodeRunResult | undefined) => void) {
    return this.#internalContext.lowcodeContext?.onChangeRunResult(listener)
  }
}

export type IDesignRendererContext<View = any> = DesignRenderContext<View>

export const createDesignRendererContext = async <View = any>(config: {
  cookConfig: IDeepRequiredCookConfig
  depsEntry: IDepsEntry
  iframeEl: HTMLIFrameElement
  externalLibs?: Record<string, any>
  mainViewFilePath: string
}) => {

  const conext = new DesignRenderContext<View>(config)
  const internalContext = contextMap.get(conext.id)
    ?.internalContext as InternalDesignRenderContext<View>
  await internalContext.init()
  return conext
}
