import {
  getComponetMap,
  getStateMap,
  type IComponentConfig,
  type IComponentMap,
  type IStateMap
} from '@/schema/component'
import { fetchDeps, resolveDepVar, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { v4 as uuidv4 } from 'uuid'
import { clone } from 'lodash'
export interface ISchemaData {
  mainPath: string
  componentList: {
    path: string
    value: IComponentConfig
  }[]
}

export interface IDesignRenderContextConfig {
  depsEntry: IDepsEntry
  iframeEl: HTMLIFrameElement
  schemaData?: ISchemaData
  renderConfig: {
    packageName: string
    renderVarName: string
  }
}

export const schemaDataToDesignRenderData = <Component>(params: {
  data?: ISchemaData
  deps?: IDeps
}): IDesignRenderData<Component> | undefined => {
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
  return {
    mainComponentConfig: mainComponent.value,
    schemaData: data,
    componentMap,
    stateMap
  }
}

export interface IDesignRenderData<Component> {
  schemaData?: ISchemaData
  componentMap?: IComponentMap<Component>
  stateMap?: IStateMap
  mainComponentConfig?: IComponentConfig
}

export type IDesignRender<Component> = (params: {
  mountElementId: string
  deps: IDeps
  data: IDesignRenderData<Component>
  watchData: IDesignRenderDataWatch<Component>
}) => Promise<void> | void

export type IDesignRenderDataWatch<Component> = (
  listener: IDesignRenderDataChangeListener<Component>
) => void

export const defineDesignRender = <Component>(render: IDesignRender<Component>) => render

export type IDesignRenderDataChangeListener<Component> = (data: {
  value: IDesignRenderData<Component>
  timestamp: number
}) => void

export type IDesignRenderContext = Awaited<ReturnType<typeof createDesignRenderContext>>

export const createDesignRenderContext = async <Component>(config: IDesignRenderContextConfig) => {
  const { depsEntry, renderConfig, iframeEl, schemaData } = config
  let currentSchemaData = clone(schemaData)
  let currentDeps: IDeps | undefined = undefined
  const contentWindow = iframeEl.contentWindow as Window
  let listenerList: IDesignRenderDataChangeListener<Component>[] = []
  const updateSchemaData = (data?: ISchemaData) => {
    currentSchemaData = data
    const renderData = schemaDataToDesignRenderData<Component>({ data, deps: currentDeps })
    listenerList.map((l) => {
      l({
        value: { ...renderData },
        timestamp: Date.now()
      })
    })
  }
  const prefix = '__vue__cook__inject__method__'
  const uid = `${prefix}_${uuidv4()}`
  // @ts-ignore
  const oldValue = contentWindow[uid]
  // @ts-ignore
  contentWindow[uid] = async () => {
    // @ts-ignore
    contentWindow[uid] = oldValue
    const deps = await fetchDeps({ entry: depsEntry, targetWindow: contentWindow })
    currentDeps = deps
    const renderLib = deps?.get(renderConfig.packageName)

    const render = resolveDepVar<IDesignRender<Component>>({
      dep: renderLib,
      varName: renderConfig.renderVarName
    })
    if (!render) {
      return
    }
    const renderData = schemaDataToDesignRenderData<Component>({
      data: schemaData,
      deps: currentDeps
    })
    await render({
      mountElementId: '#app',
      deps: deps || new Map(),
      data: { ...renderData },
      watchData: (listener) => {
        listenerList.push(listener)
        const removeListener = () => {
          listenerList = listenerList.filter((e) => e !== listener)
        }
        return removeListener
      }
    })
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
    updateSchemaData,
    getSchemaData: () => {
      return {
        ...currentSchemaData
      } as ISchemaData
    },
    getDeps: () => {
      return currentDeps
    }
  }
}
