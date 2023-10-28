import {
  appendTemplatePid,
  getComponetMap,
  getStateMap,
  type IComponentConfig,
  type IComponentConfigWithTemplatePid,
  type IComponentMap,
  type IStateMap,
  type ITemplateConfigWithPid
} from '@/schema/component'
import { fetchDeps, resolveDepVar, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { v4 as uuidv4 } from 'uuid'
import {
  type AbstractDesignRenderer,
  type IDesignRendererData,
  getInternalDesignRenderer
} from './abstract-renderer'

class InternalDesignRendererContext<Component> {
  #schemaData: ISchemaData | undefined
  #deps: IDeps | undefined
  #rendererData: IDesignRendererData<Component> | undefined
  #renderer: AbstractDesignRenderer<Component> | undefined
  get internalDesignRenderer() {
    if (this.renderer) {
      return getInternalDesignRenderer(this.renderer)
    }
  }
  get renderer() {
    return this.#renderer
  }
  set renderer(data: AbstractDesignRenderer<Component> | undefined) {
    this.#renderer = data
    this.internalDesignRenderer?.designRendererDataListenerList.map((l) => {
      l(this.rendererData)
    })
  }
  get deps() {
    return this.#deps
  }
  set deps(data: IDeps | undefined) {
    this.#deps = data
    const rendererData = schemaDataToDesignRendererData<Component>({
      deps: this.deps,
      data: this.schemaData
    })
    this.rendererData = rendererData
  }
  get schemaData() {
    return this.#schemaData
  }
  set schemaData(data: ISchemaData | undefined) {
    this.#schemaData = data
    const rendererData = schemaDataToDesignRendererData<Component>({
      deps: this.deps,
      data: this.schemaData
    })
    this.rendererData = rendererData
  }
  get rendererData() {
    return this.#rendererData
  }
  set rendererData(data: IDesignRendererData<Component> | undefined) {
    this.#rendererData = data
    this.internalDesignRenderer?.designRendererDataListenerList.map((l) => {
      l(data)
    })
  }
}

export interface ISchemaData {
  mainPath: string
  componentList: {
    path: string
    value: IComponentConfigWithTemplatePid
  }[]
}

export interface IDesignRendererContextConfig {
  depsEntry: IDepsEntry
  iframeEl: HTMLIFrameElement
  schemaData?: ISchemaData
  renderConfig: {
    packageName: string
    renderVarName: string
  }
}

export const schemaDataToDesignRendererData = <Component>(params: {
  data?: ISchemaData
  deps?: IDeps
}): IDesignRendererData<Component> | undefined => {
  const { data, deps } = params
  if (!data) {
    return
  }
  const { componentList, mainPath } = data
  const mainComponent = componentList.find((e) => e.path === mainPath)
  if (!mainComponent) {
    return {
      schemaData: data
    }
  }
  const componentMap = getComponetMap<Component>({ data, deps })
  const stateMap = getStateMap({ data, deps })
  const mainComponentConfig = {
    ...mainComponent.value,
    template: appendTemplatePid(mainComponent.value.template || [])
  }
  return {
    mainComponentConfig,
    schemaData: data,
    componentMap,
    stateMap
  }
}

export interface IDesignComponentOverlay {
  templateConfig: ITemplateConfigWithPid
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

export type IDesignRendererContext = Awaited<ReturnType<typeof createDesignRendererContext>>
export const createDesignRendererContext = async <Component>(
  config: IDesignRendererContextConfig
) => {
  const { depsEntry, renderConfig, iframeEl, schemaData } = config
  const internalDesignRendererContext = new InternalDesignRendererContext()

  const contentWindow = iframeEl.contentWindow as Window
  internalDesignRendererContext.schemaData = schemaData

  const prefix = '__vue__cook__inject__method__'
  const uid = `${prefix}_${uuidv4()}`
  // @ts-ignore
  const oldValue = contentWindow[uid]
  // @ts-ignore
  contentWindow[uid] = async () => {
    // @ts-ignore
    contentWindow[uid] = oldValue
    const deps = await fetchDeps({ entry: depsEntry, targetWindow: contentWindow })
    internalDesignRendererContext.deps = deps
    const renderLib = deps?.get(renderConfig.packageName)

    const RendererClass = resolveDepVar<new () => AbstractDesignRenderer<Component>>({
      dep: renderLib,
      varName: renderConfig.renderVarName
    })
    if (!RendererClass) {
      return
    }
    const renderer = new RendererClass()
    internalDesignRendererContext.renderer = renderer
    await renderer.mount('#app')
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
  return {
    updateSchemaData: (data?: ISchemaData) => {
      internalDesignRendererContext.schemaData = data
    },
    getSchemaData: () => {
      return internalDesignRendererContext.schemaData
    },
    getDeps: () => {
      return internalDesignRendererContext.deps
    },
    getComponetnOverlay: (params: {
      size: IDesignComponentPageSize
      eventX: number
      eventY: number
    }): IDesignComponentOverlay | undefined => {
      const { size, eventX, eventY } = params
      const rect = iframeEl.getBoundingClientRect()
      const el = contentWindow.document.elementFromPoint(
        ((eventX - rect.x) / size.scale) * 100,
        ((eventY - rect.y) / size.scale) * 100
      )
      if (el) {
        return internalDesignRendererContext.renderer?.getComponetnOverlayFromElement(el)
      }
    }
  }
}
