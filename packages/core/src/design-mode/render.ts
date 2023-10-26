import type { IComponentConfig } from '@/schema/component'
import { fetchDeps, resolveDepVar, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { v4 as uuidv4 } from 'uuid'

export interface IDesignRenderContextConfig {
  depsEntry: IDepsEntry
  iframeEl: HTMLIFrameElement
  dev: boolean
  renderMode: IDesignRenderMode
  schemaData?: IComponentConfig
  renderConfig: {
    packageName: string
    renderVarName: string
  }
}

export type IDesignRenderMode = 'design' | 'runtime'

export interface IDesignRenderData {
  dev: boolean
  renderMode: IDesignRenderMode
  schemaData?: IComponentConfig
}

export type IDesignRender = (params: {
  mountElementId: string
  deps: IDeps
  data: IDesignRenderData
  watchData: (listener: IDesignRenderDataChangeListener) => void
}) => Promise<void> | void

export const defineDesignRender = (render: IDesignRender) => render

export type IDesignRenderDataChangeListener = (data: {
  value: IDesignRenderData
  timestamp: number
}) => void

export type IDesignRenderContext = Awaited<ReturnType<typeof createDesignRenderContext>>

export const createDesignRenderContext = async (config: IDesignRenderContextConfig) => {
  const { depsEntry, renderConfig, iframeEl, dev, renderMode, schemaData } = config
  let currentDesignRenderData: IDesignRenderData = {
    dev,
    renderMode,
    schemaData
  }
  const contentWindow = iframeEl.contentWindow as Window
  let listenerList: IDesignRenderDataChangeListener[] = []
  const updateData = (data?: Partial<IDesignRenderData>) => {
    currentDesignRenderData = {
      ...currentDesignRenderData,
      ...data
    }
    listenerList.map((l) => {
      l({
        value: currentDesignRenderData,
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
    const renderLib = deps?.get(renderConfig.packageName)

    const render = resolveDepVar<IDesignRender>({
      dep: renderLib,
      varName: renderConfig.renderVarName
    })
    if (!render) {
      return
    }
    await render({
      mountElementId: '#app',
      deps: deps || new Map(),
      data: {
        schemaData,
        dev: false,
        renderMode: 'design'
      },
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
    updateData,
    getDesignRenderData: () => {
      return {
        ...currentDesignRenderData
      } as IDesignRenderData
    }
  }
}
