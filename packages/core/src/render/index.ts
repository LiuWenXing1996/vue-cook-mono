import type { IComponentConfig } from '@/schema/component'
import { fetchDeps, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { v4 as uuidv4 } from 'uuid'

export interface IRenderContextConfig {
  depsEntry: IDepsEntry
  iframeEl: HTMLIFrameElement
  dev: boolean
  renderMode: IRenderMode
  schemaData?: IComponentConfig
  renderConfig: {
    packageName: string
    renderVarName: string
  }
}

export type IRenderMode = 'design' | 'runtime'

export interface IRenderData {
  dev: boolean
  renderMode: IRenderMode
  schemaData?: IComponentConfig
}

export type IRender = (params: {
  mountElementId: string
  deps: IDeps
  data: IRenderData
  watchData: (listener: IRenderDataChangeListener) => void
}) => Promise<void> | void

export const defineRender = (render: IRender) => render

export type IRenderDataChangeListener = (data: { value: IRenderData; timestamp: number }) => void

export type IRenderContext = Awaited<ReturnType<typeof createRenderContext>>

export const createRenderContext = async (config: IRenderContextConfig) => {
  const { depsEntry, renderConfig, iframeEl, dev, renderMode, schemaData } = config
  let currentRenderData: IRenderData = {
    dev,
    renderMode,
    schemaData
  }
  const contentWindow = iframeEl.contentWindow as Window
  let listenerList: IRenderDataChangeListener[] = []
  const updateData = (data?: Partial<IRenderData>) => {
    currentRenderData = {
      ...currentRenderData,
      ...data
    }
    listenerList.map((l) => {
      l({
        value: currentRenderData,
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
    if (!renderLib) {
      return
    }
    const render = renderLib.value[renderConfig.renderVarName] as IRender
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
    getRenderData: () => {
      return {
        ...currentRenderData
      } as IRenderData
    }
  }
}
