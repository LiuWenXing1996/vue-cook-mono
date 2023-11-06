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
  type AbstractEditorRenderer,
  type IEditorRendererData,
  getInternalEditorRenderer
} from './abstract-editor-renderer'

class InternalEditorRendererContext<Component> {
  #schemaData: ISchemaData | undefined
  #deps: IDeps | undefined
  #rendererData: IEditorRendererData<Component> | undefined
  #renderer: AbstractEditorRenderer<Component> | undefined
  get internalEditorRenderer() {
    if (this.renderer) {
      return getInternalEditorRenderer(this.renderer)
    }
  }
  get renderer() {
    return this.#renderer
  }
  set renderer(data: AbstractEditorRenderer<Component> | undefined) {
    this.#renderer = data
    this.internalEditorRenderer?.editorRendererDataListenerList.map((l) => {
      l(this.rendererData)
    })
  }
  get deps() {
    return this.#deps
  }
  set deps(data: IDeps | undefined) {
    this.#deps = data
    const rendererData = schemaDataToEditorRendererData<Component>({
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
    const rendererData = schemaDataToEditorRendererData<Component>({
      deps: this.deps,
      data: this.schemaData
    })
    this.rendererData = rendererData
  }
  get rendererData() {
    return this.#rendererData
  }
  set rendererData(data: IEditorRendererData<Component> | undefined) {
    this.#rendererData = data
    this.internalEditorRenderer?.editorRendererDataListenerList.map((l) => {
      l(data)
    })
  }
}

export interface ISchemaData {
  mainPath: string
  componentList: {
    path: string
    value: IComponentConfigWithTemplatePid
  }[],
  
}

export interface IEditorRendererContextConfig {
  depsEntry: IDepsEntry
  iframeEl: HTMLIFrameElement
  schemaData?: ISchemaData
  renderConfig: {
    packageName: string
    renderVarName: string
  }
}

export const schemaDataToEditorRendererData = <Component>(params: {
  data?: ISchemaData
  deps?: IDeps
}): IEditorRendererData<Component> | undefined => {
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


export type IEditorRendererContext = Awaited<ReturnType<typeof createEditorRendererContext>>
export const createEditorRendererContext = async <Component>(
  config: IEditorRendererContextConfig
) => {
  const { depsEntry, renderConfig, iframeEl, schemaData } = config
  const internalEditorRendererContext = new InternalEditorRendererContext()

  const contentWindow = iframeEl.contentWindow as Window
  internalEditorRendererContext.schemaData = schemaData

  const prefix = '__vue__cook__inject__method__'
  const uid = `${prefix}_${uuidv4()}`
  // @ts-ignore
  const oldValue = contentWindow[uid]
  // @ts-ignore
  contentWindow[uid] = async () => {
    // @ts-ignore
    contentWindow[uid] = oldValue
    const deps = await fetchDeps({ entry: depsEntry, targetWindow: contentWindow })
    internalEditorRendererContext.deps = deps
    const renderLib = deps?.get(renderConfig.packageName)

    const RendererClass = resolveDepVar<new () => AbstractEditorRenderer<Component>>({
      dep: renderLib,
      varName: renderConfig.renderVarName
    })
    if (!RendererClass) {
      return
    }
    const renderer = new RendererClass()
    internalEditorRendererContext.renderer = renderer
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
      internalEditorRendererContext.schemaData = data
    },
    getSchemaData: () => {
      return internalEditorRendererContext.schemaData
    },
    getDeps: () => {
      return internalEditorRendererContext.deps
    }
  }
}
